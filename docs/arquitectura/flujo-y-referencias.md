# Arquitectura hexagonal y flujo de datos

Este documento contiene los diagramas editables en Mermaid y la explicación que acompaña a ambas presentaciones. Las flechas continuas representan llamadas o transferencia de datos; las discontinuas representan implementación de contratos o dependencias de código, según la leyenda de cada diagrama.

## 1. El core y su frontera

El **core** contiene las reglas de negocio y los casos de uso que las coordinan. El dominio define qué significa enviar una solicitud y cuándo está permitido. Un puerto expresa una operación disponible o necesaria. Un adaptador traduce esa operación a una tecnología concreta.

La importancia de esta separación aparece al cambiar una tecnología: modificar HTTP o PostgreSQL no debería obligarnos a reescribir las reglas de transición. También permite probar las reglas sin iniciar un servidor o una base. No elimina la necesidad de pruebas de integración ni hace gratuitos los cambios de contrato.

```mermaid
flowchart LR
    Cliente[Cliente HTTP] --> Entrada[Adaptador de entrada]
    Entrada --> PE[Puerto de entrada]
    subgraph Core[Core de la aplicación]
        PE --> Caso[Caso de uso]
        Caso --> Dominio[Modelo y reglas del dominio]
        Caso --> PS[Puerto de salida]
    end
    PS --> Salida[Adaptador de salida]
    Salida --> Infra[Base de datos o API externa]
```

Este es el **patrón conceptual**. Un puerto de entrada puede expresarse con una interfaz como `EnviarSolicitud`, y el caso de uso puede implementarla. En ARKA-Lite esa interfaz separada no existe: el controlador llama a `ServicioDeSolicitudes.enviar` directamente. Las interfaces de salida sí están definidas en el código.

## 2. Interfaces y dirección de las dependencias

```mermaid
flowchart BT
    Controller[Adaptador HTTP] --> Entrada[Interfaz de entrada conceptual]
    Caso[Caso de uso] -. implementa .-> Entrada
    Caso --> Salida[Interfaz de salida del core]
    Jpa[Adaptador JPA] -. implementa .-> Salida
    Memoria[Adaptador en memoria] -. implementa .-> Salida
```

Este diagrama muestra **dependencias de código**, no un recorrido temporal. El caso de uso conoce el contrato de salida; el adaptador también conoce ese contrato y lo implementa. El core no necesita importar la clase JPA. En ejecución, Spring conecta el contrato con una instancia concreta y la llamada sí llega al adaptador.

Una interfaz Java es un contrato de métodos, tipos y comportamiento esperado. No es una pantalla, una API HTTP ni un puerto de red. Cambiar un adaptador exige mantener el contrato, incluida la interpretación de ausencia, errores y resultados.

## 3. Recorrido real dentro de solicitudes

```mermaid
flowchart LR
    HTTP[GET /solicitudes/INC-002] --> C[SolicitudController]
    C --> S[ServicioDeSolicitudes.buscar]
    S --> P[RepositorioDeSolicitudes]
    P --> J[RepositorioJpa]
    J --> SD[SolicitudJpaRepository]
    SD --> DB[(PostgreSQL)]
```

| Paso | Qué recibe | Qué hace | Qué entrega |
| --- | --- | --- | --- |
| Adaptador de entrada | Ruta HTTP con `INC-002` | Extrae el parámetro | `String id` al caso de uso |
| Caso de uso | Identificador | Solicita la búsqueda y trata la ausencia | Una `Solicitud` o excepción |
| Interfaz de salida | Identificador | Define el contrato `buscar` | `Optional<Solicitud>` |
| Adaptador JPA | Llamada al contrato | Consulta mediante Spring Data y convierte la entidad | Objeto de dominio |
| Adaptador de entrada, al volver | Objeto de dominio | Spring lo serializa | Respuesta JSON |

RepositorioQueRegistra es un adaptador alternativo en memoria con LinkedHashMap y mensajes en consola. El seleccionado para PostgreSQL es RepositorioJpa, marcado con @Primary. Cambiar almacenamiento exige además revisar configuración, esquema, migraciones y pruebas.

La interfaz no convierte ni almacena datos: la implementación realiza el trabajo. El retorno recorre las llamadas en sentido inverso. `RepositorioJpa.aDominio` convierte `SolicitudEntity` en `Solicitud`; no se entrega directamente una fila SQL al cliente.

```mermaid
sequenceDiagram
    actor Cliente
    participant C as SolicitudController
    participant S as ServicioDeSolicitudes
    participant J as RepositorioJpa vía puerto
    participant DB as PostgreSQL
    Cliente->>C: GET /solicitudes/INC-002
    C->>S: buscar("INC-002")
    S->>J: RepositorioDeSolicitudes.buscar(id)
    J->>DB: Consulta mediante Spring Data JPA
    DB-->>J: Entidad persistida
    Note over J: SolicitudEntity → Solicitud
    J-->>S: Optional con Solicitud
    S-->>C: Solicitud
    C-->>Cliente: JSON
```

## 4. El envío y la transacción local

```mermaid
flowchart TB
    C[SolicitudController.enviar] --> S[ServicioDeSolicitudes.enviar]
    subgraph TX[Transacción local de envío]
        S --> B[Buscar solicitud por puerto de repositorio]
        B --> D[Solicitud.enviar valida BORRADOR]
        D --> G[RepositorioDeSolicitudes.guardar]
        G --> J[RepositorioJpa]
        S --> E[RegistradorDeEventosSalientes.registrar]
        E --> R[RegistradorDeEventosJpa]
        J --> DB[(PostgreSQL: solicitud)]
        R --> OUT[(PostgreSQL: evento pendiente)]
    end
    TX --> OK[Confirmar transacción y responder]
```

Primero se busca la solicitud, se valida y se guarda como enviada; después se registra el evento. El dibujo muestra dos caminos de persistencia dentro de la misma transacción, no dos trabajos concurrentes. `@Transactional` en `ServicioDeSolicitudes.enviar` agrupa el cambio de estado y el outbox. Si falla uno, no debe confirmarse ninguno de esos cambios de esa transacción. La entrega HTTP se realiza posteriormente y no forma parte de ella.

El registro del evento contiene un UUID, `solicitudId`, `tipo` y `procesado=false`. El ID de la fila de base de datos y el UUID del evento son conceptos distintos.

## 5. Flujo completo entre servicios

```mermaid
sequenceDiagram
    actor Cliente
    participant C as Entrada: SolicitudController
    participant S as Core: ServicioDeSolicitudes
    participant DB as PostgreSQL solicitudes
    participant R as Relevador de pendientes
    participant P as Salida: PublicadorConReintento
    participant E as Entrada: EventoController
    participant I as ConsumoIdempotente
    participant N as Core: ServicioDeNotificaciones
    participant M as RepositorioEnMemoria
    participant DN as PostgreSQL notificaciones
    Cliente->>C: POST /solicitudes/INC-002/enviar
    C->>S: enviar(id)
    Note over S,DB: Puertos de repositorio y registrador → adaptadores JPA
    S->>DB: Guardar ENVIADA + evento pendiente
    DB-->>S: Commit de transacción local
    S-->>C: Solicitud enviada
    C-->>Cliente: Respuesta de envío
    Note over R: Trabajo programado, posterior e independiente
    R->>DB: Consultar eventos no procesados
    DB-->>R: Pendientes
    R->>P: PublicadorDeEventos.publicar(evento)
    P->>E: POST /eventos/solicitud-enviada con JSON
    E->>I: alRecibir(evento)
    I->>DN: Consultar eventoId
    alt Evento nuevo
        I->>N: alRecibirSolicitudEnviada(evento)
        N->>M: RepositorioDeNotificaciones.guardar(aviso)
        I->>DN: Guardar identificador procesado
    else Evento ya procesado
        Note over I: Omitir creación de otro aviso
    end
    E-->>P: HTTP exitoso
    P-->>R: Publicación completada
    R->>DB: Marcar procesado=true
```

El relevador espera cinco segundos **entre ciclos**. El publicador realiza hasta tres intentos por publicación. Si la entrega falla, el relevador deja el evento pendiente. Si el receptor procesó el evento pero se pierde la respuesta, puede producirse otra entrega con el mismo UUID. No hay un broker ni una transacción distribuida que confirme ambos servicios al mismo tiempo.

## 6. El core de notificaciones y sus salidas

```mermaid
flowchart LR
    HTTP[Evento JSON] --> EC[EventoController]
    EC --> CI[ConsumoIdempotente]
    CI --> ERP[EventoProcesadoRepository]
    ERP --> DB[(PostgreSQL: identificadores)]
    CI --> SN[ServicioDeNotificaciones]
    SN --> PU[RepositorioDeNotificaciones]
    PU --> MEM[RepositorioEnMemoria]
    MEM --> AV[Avisos durante la vida de la JVM]
```

`ConsumoIdempotente` coordina la comprobación del identificador. `ServicioDeNotificaciones` construye el texto y usa su puerto de almacenamiento. El adaptador activo de ese puerto guarda los avisos en una lista en memoria. El registro de identificadores usa JPA directamente desde el coordinador: este acceso no está aislado por un puerto propio del dominio.

`GET /notificaciones` recorre `NotificacionController → ServicioDeNotificaciones.listar → RepositorioDeNotificaciones.todas → RepositorioEnMemoria`; luego devuelve los avisos como JSON. `GET /eventos/procesados` consulta los identificadores persistidos. Son consultas distintas y pueden mostrar resultados diferentes después de reiniciar notificaciones.

## 7. Contrato real y transformaciones

```json
{
  "eventoId": "29bc873c-b86d-44b5-9302-707bb7a27106",
  "id": "INC-002",
  "tipo": "SolicitudEnviada"
}
```

El UUID es ilustrativo. En el flujo del outbox actual, `tipo` toma el valor `SolicitudEnviada`; no conserva el tipo de solicitud `Incidencia`. Ambos servicios tienen su propio record `SolicitudEnviada` y comparten la estructura del JSON, no una instancia Java.

| Frontera | Transformación |
| --- | --- |
| HTTP de entrada | Parámetro de ruta → `String id` |
| Dominio | `Solicitud` en borrador → nueva `Solicitud` enviada |
| Persistencia | `Solicitud` ↔ `SolicitudEntity` |
| Outbox | Identificador y hecho ocurrido → `EventoEntity` |
| Red | Evento pendiente → record → JSON → record del receptor |
| Aviso | Evento → `Notificacion` con texto → lista en memoria |

## 8. Qué mejora hexagonal y qué no resuelve sola

- Permite cambiar el adaptador de persistencia preservando las reglas y el contrato.
- Facilita pruebas rápidas del dominio con implementaciones en memoria.
- Ayuda a localizar cambios: formato HTTP en entrada, SQL en persistencia y reglas en el core.
- No garantiza entrega, idempotencia, seguridad ni rendimiento por la organización de carpetas.
- No garantiza independencia total si el core importa infraestructura o si los adaptadores se usan directamente.

Límites actuales: `ServicioDeSolicitudes` usa una anotación transaccional; el relevador accede directamente a JPA; el consumidor no guarda el aviso en la misma base que el identificador. La deduplicación actual no garantiza exactamente una vez bajo concurrencia. Al reiniciar notificaciones se pierden sus textos y repetir un ID ya procesado no los reconstruye.

## 9. Referencias al código

Las rutas siguientes son la base para verificar los guiones; no son una propuesta de nuevas clases.

- [Solicitud y reglas](../../servicio-solicitudes/src/main/java/pa/gob/dntic/serviciosolicitudes/dominio/Solicitud.java).
- [Caso de uso y transacción](../../servicio-solicitudes/src/main/java/pa/gob/dntic/serviciosolicitudes/dominio/ServicioDeSolicitudes.java).
- [Controlador de entrada](../../servicio-solicitudes/src/main/java/pa/gob/dntic/serviciosolicitudes/adaptadores/entrada/SolicitudController.java).
- [Interfaz del repositorio](../../servicio-solicitudes/src/main/java/pa/gob/dntic/serviciosolicitudes/dominio/RepositorioDeSolicitudes.java).
- [Adaptador JPA](../../servicio-solicitudes/src/main/java/pa/gob/dntic/serviciosolicitudes/adaptadores/persistencia/RepositorioJpa.java).
- [Registro del outbox](../../servicio-solicitudes/src/main/java/pa/gob/dntic/serviciosolicitudes/adaptadores/persistencia/RegistradorDeEventosJpa.java).
- [Relevador](../../servicio-solicitudes/src/main/java/pa/gob/dntic/serviciosolicitudes/adaptadores/salida/RelevadorDeEventosPendientes.java).
- [Publicador HTTP activo](../../servicio-solicitudes/src/main/java/pa/gob/dntic/serviciosolicitudes/adaptadores/salida/PublicadorConReintento.java).
- [Entrada de eventos](../../servicio-notificaciones/src/main/java/pa/gob/dntic/servicionotificaciones/adaptadores/entrada/EventoController.java).
- [Control de duplicados](../../servicio-notificaciones/src/main/java/pa/gob/dntic/servicionotificaciones/adaptadores/entrada/ConsumoIdempotente.java).
- [Core de notificaciones](../../servicio-notificaciones/src/main/java/pa/gob/dntic/servicionotificaciones/dominio/ServicioDeNotificaciones.java).

Volver a los [guiones](README.md).

Para explicarlo paso a paso, usar la pestaña Ayuda de [arka-lite-ui](../../arka-lite-ui/README.md) o los guiones de [presentation-data](../presentation-data/README.md).

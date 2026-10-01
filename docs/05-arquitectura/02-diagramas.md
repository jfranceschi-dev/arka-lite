# Diagramas y flujos de arquitectura

ARKA-Lite consta de **dos aplicaciones Spring Boot independientes**. El cliente usa la API de solicitudes; al enviar una solicitud, esta llama por HTTP a notificaciones. Cada aplicación tiene su propio `pom.xml`, proceso y almacenamiento en memoria. Para recorrer clases y anotaciones concretas, consulte [componentes Java](01-componentes-java.md).

## Componentes y dependencias

[Fuente Mermaid: 03-componentes.mmd](03-componentes.mmd)

```mermaid
flowchart LR
    Cliente[Cliente HTTP] --> SC[SolicitudController]
    SC --> SD[ServicioDeSolicitudes]
    SD --> RP[Puerto RepositorioDeSolicitudes]
    SD --> PP[Puerto PublicadorDeEventos]
    RP --> RR[RepositorioQueRegistra @Primary]
    PP --> PR[PublicadorRest]
    PR -->|POST JSON por HTTP| EC[EventoController]
    EC --> ND[ServicioDeNotificaciones]
    ND --> NR[RepositorioDeNotificaciones en memoria]
    NC[NotificacionController] --> ND
    Cliente --> NC
```

`RepositorioEnMemoria` también implementa el puerto de solicitudes, pero `@Primary` hace que Spring inyecte `RepositorioQueRegistra`. Ambos mantienen sus propios mapas; el adaptador elegido registra cada escritura. Los controladores son adaptadores de entrada, mientras que los repositorios y `PublicadorRest` son adaptadores de salida. El dominio no importa clases HTTP ni de Spring.

## Qué ocurre al enviar una solicitud

[Fuente Mermaid: 04-secuencia-envio.mmd](04-secuencia-envio.mmd)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant C as SolicitudController
    participant S as ServicioDeSolicitudes
    participant R as RepositorioQueRegistra
    participant P as PublicadorRest
    participant E as EventoController
    participant N as ServicioDeNotificaciones
    participant M as Repositorio de notificaciones
    U->>C: POST /solicitudes/{id}/enviar
    C->>S: enviar(id)
    S->>R: buscar(id)
    R-->>S: Solicitud BORRADOR
    S->>S: enviar() produce ENVIADA
    S->>R: guardar(ENVIADA)
    S->>P: publicar(SolicitudEnviada)
    P->>E: POST /eventos/solicitud-enviada
    E->>N: alRecibirSolicitudEnviada(evento)
    N->>M: guardar(Notificacion)
    E-->>P: respuesta HTTP
    P-->>S: termina
    S-->>C: Solicitud ENVIADA
    C-->>U: JSON
    Note over P,E: Si falla HTTP, P registra el error y S devuelve ENVIADA.
```

El evento es un `record` JSON con `id` y `tipo` definido en ambos servicios. Se transporta mediante un **POST HTTP síncrono**, no por una cola de mensajes. `PublicadorRest` captura excepciones de comunicación y no reintenta. Como el estado se guarda antes de llamar a notificaciones, una solicitud puede quedar `ENVIADA` sin que exista una notificación correspondiente.

## Estados de una solicitud

[Fuente Mermaid: 05-estados-solicitud.mmd](05-estados-solicitud.mmd)

```mermaid
stateDiagram-v2
    [*] --> BORRADOR: registrar
    BORRADOR --> ENVIADA: enviar
    ENVIADA --> APROBADA: aprobar
    ENVIADA --> RECHAZADA: rechazar
```

Enviar otra vez una solicitud ya enviada, o aprobar/rechazar una que no esté `ENVIADA`, genera `IllegalStateException`. El código solo traduce explícitamente `SolicitudNoEncontrada` a HTTP 404; no debe asumirse que todas las operaciones inválidas devuelven una respuesta de negocio personalizada.

## Arranque y almacenamiento

`ConfiguracionDominio` registra `INC-001` y `CAM-002` durante el arranque de solicitudes, y envía `CAM-002`. Por eso la notificación de ejemplo puede existir antes de una petición del usuario. Los repositorios están en memoria: reiniciar un proceso o recrear un contenedor elimina sus datos. La API `POST /solicitudes/crear` crea siempre `INC-002`; el repositorio lo guarda por ID y una llamada repetida sobrescribe ese registro.

## Despliegue y puertos

[Fuente Mermaid: 06-despliegue.mmd](06-despliegue.mmd)

```mermaid
flowchart TB
    subgraph Equipo[Windows]
        Browser[Cliente]
        subgraph Compose[Docker Compose]
            CS[Solicitudes :8080]
            CN[Notificaciones :8080]
            CS -->|servicio-notificaciones:8080| CN
        end
        subgraph K8s[Kubernetes de Docker Desktop con kind]
            KS[Service solicitudes :8080] --> PS[Pod solicitudes :8080]
            KN[Service notificaciones :8080] --> PN[Pod notificaciones :8080]
            PS -->|DNS interno servicio-notificaciones:8080| KN
        end
    end
    Browser -->|Compose localhost:8080| CS
    Browser -->|Compose localhost:8081| CN
    Browser -.->|port-forward localhost:18080| KS
    Browser -.->|port-forward localhost:18081| KN
```

Compose publica `8080:8080` para solicitudes y `8081:8080` para notificaciones. Los manifiestos Kubernetes usan los dos contenedores en 8080; el acceso de las guías utiliza dos `port-forward`. No hay Ingress ni certificados en el proyecto actual. La [guía opcional de HTTPS](../06-uso/07-https-y-certificados.md) describe cómo añadir un punto de entrada TLS.

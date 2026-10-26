# ARKA-Lite: guion para el equipo de desarrollo

Duración sugerida: 180–225 minutos, con pausas y demostraciones. 65 unidades de contenido en nueve secciones, que pueden dividirse en dos sesiones.

## Sección 1 · Fundamentos de programación con Java

### 01 · El caso que vamos a construir

**En pantalla**

- Crear una solicitud en `BORRADOR`.
- Enviarla y registrar lo sucedido.
- Generar un aviso en otro servicio.

**Guion del expositor**

“Vamos a seguir una misma solicitud durante toda la presentación. Primero veremos cómo representarla en Java. Después ubicaremos sus reglas y sus dependencias. Finalmente seguiremos los datos hasta el servicio de notificaciones. Al terminar deberíamos poder explicar qué clase cambia el estado, qué componente guarda datos y quién realiza la llamada HTTP.”

**Transición:** “Antes de separar componentes, necesitamos un lenguaje común para leer el código.”

### 02 · Cómo se construye y ejecuta Java

**En pantalla**

`Archivo .java → compilación con JDK → bytecode .class → ejecución en JVM`

`Maven → dependencias + compilación + pruebas + empaquetado JAR`

**Guion del expositor**

“Una clase agrupa datos y comportamiento. Un método expresa una operación. El compilador revisa, entre otras cosas, que los tipos sean compatibles. La JVM ejecuta el bytecode. Maven organiza la construcción y las dependencias; Spring Boot configura y conecta componentes y levanta el servidor HTTP. Son responsabilidades diferentes. En ARKA-Lite cada microservicio tiene su propio `pom.xml`, código y Maven Wrapper. No hay un proyecto Maven ejecutable en la raíz.”

**Ejemplo para mostrar:** dentro de un servicio, `.\mvnw.cmd clean verify` compila, prueba y verifica el paquete. Java configurado en este repositorio: 26.

**Transición:** “El compilador necesita saber qué clase de dato representa cada variable.”

### 03 · Variables y tipos

**En pantalla — ejemplo didáctico**

```java
int intentos = 3;
long esperaMilisegundos = 500L;
boolean procesado = false;
String solicitudId = "INC-002";
Estado estado = Estado.BORRADOR;
```

**Guion del expositor**

“La declaración combina un tipo, un nombre y, cuando corresponde, un valor inicial. Java tiene ocho tipos primitivos: `byte`, `short`, `int`, `long`, `float`, `double`, `char` y `boolean`. `String`, las entidades y las colecciones son tipos de referencia. Una referencia puede ser nula; un primitivo no. `Integer` es un objeto envoltorio y puede ser nulo, a diferencia de `int`. Elegimos el tipo por lo que el dato significa y por sus límites, no solo porque el ejemplo compile.”

**Ampliación oral:** `char` representa una unidad UTF-16; no siempre equivale a un carácter completo visible. Para dinero se suele usar `BigDecimal` con reglas explícitas de redondeo; ese caso es didáctico, no una función de ARKA-Lite.

**Transición:** “Además del tipo, importa cuánto vive una variable y quién puede cambiarla.”

### 04 · Alcance, referencias e inmutabilidad

**En pantalla**

- Variable local: vive dentro de un bloque o método.
- Parámetro: dato recibido por una operación.
- Campo: estado o dependencia de un objeto.
- `final`: impide reasignar una variable.
- `var`: infiere un tipo local; no elimina el tipado estático.

**Guion del expositor**

“Una variable local debe estar asignada antes de usarse. Los campos tienen valores iniciales predeterminados, aunque conviene construir objetos con un estado válido. `final` no vuelve inmutable todo el objeto: una lista final todavía puede cambiar su contenido. Reducir estado mutable facilita entender qué sucede cuando varias peticiones llegan al mismo tiempo. Un `record` tiene componentes finales, pero su inmutabilidad es superficial: una colección contenida podría ser mutable.”

**Transición:** “Podemos expresar una solicitud con pocos datos y mantener sus reglas junto a ellos.”

### 05 · Objetos, records y reglas de negocio

**En pantalla — fragmento de `Solicitud`**

```java
public record Solicitud(String id, String tipo, Estado estado) {
    public Solicitud enviar() {
        if (estado != Estado.BORRADOR) {
            throw new IllegalStateException(
                "solo se puede enviar una solicitud en BORRADOR");
        }
        return new Solicitud(id, tipo, Estado.ENVIADA);
    }
}
```

**Guion del expositor**

“El `enum Estado` limita los estados posibles. La regla de envío exige un borrador. El método devuelve una nueva solicitud enviada; no modifica la original. Esto mantiene la transición en un lugar reconocible. La excepción señala una operación inválida. Traducir esa excepción a una respuesta HTTP es otra responsabilidad. En el código actual esa transición inválida todavía no tiene un manejador HTTP específico.”

**Transición:** “Para que la regla sea legible también necesitamos buenos nombres.”

### 06 · Nombres que describen el negocio

**En pantalla**

| Evitar | Preferir | Razón |
| --- | --- | --- |
| `x`, `dato` | `solicitudId` | Identifica el contenido |
| `tiempo` | `esperaMilisegundos` | Expresa la unidad |
| `flag` | `procesado` | Expresa la condición |
| `hacer()` | `enviar()` | Expresa la operación |
| `list` | `solicitudesPendientes` | Expresa el conjunto |

**Guion del expositor**

“Clases e interfaces usan `PascalCase`; variables y métodos, `camelCase`; constantes, `MAYUSCULAS_CON_GUIONES_BAJOS`; paquetes, minúsculas. El repositorio usa nombres de negocio en español. Mantengamos ese vocabulario y evitemos abreviaturas que obligan a traducir mentalmente. Los métodos suelen nombrar acciones; los booleanos deben poder leerse como condiciones. Una constante como `MAXIMO_INTENTOS` explica mejor la intención que un número repetido.”

**Transición:** “Los nombres ayudan a leer. Las prácticas siguientes ayudan a cambiar el código con confianza.”

### 07 · Buenas prácticas aplicadas

**En pantalla**

- Métodos con una intención clara y dependencias explícitas.
- Reglas del negocio fuera de controladores HTTP.
- Validación de entradas y de transiciones de estado.
- Excepciones tratadas donde se puede responder o recuperar.
- Pruebas de comportamiento y logs con contexto.

**Guion del expositor**

“Un controlador traduce la petición; no debería decidir las reglas de aprobación. La validación de formato en la entrada no reemplaza la regla del dominio. Inyectar dependencias por constructor permite sustituirlas en una prueba. No basta con atrapar una excepción y continuar: debemos definir qué estado queda guardado y cómo se recupera la operación. En una revisión buscamos duplicación real, responsabilidades mezcladas y nombres ambiguos; no creamos una abstracción para cada línea.”

**Ejercicio oral:** “¿Qué probaríamos al enviar una solicitud ya enviada?” Respuesta esperada: se rechaza la transición y no se registra un evento adicional desde ese intento.

**Transición:** “SOLID nos ofrece cinco criterios para evaluar estas decisiones.”

### 08 · SOLID: responsabilidad y extensión

**En pantalla**

| Principio | Idea | Ejemplo |
| --- | --- | --- |
| S · Responsabilidad única | Una razón coherente para cambiar | HTTP en el controlador; reglas en `Solicitud` |
| O · Abierto/cerrado | Extender mediante contratos estables | Otro adaptador de almacenamiento |
| L · Sustitución de Liskov | Mantener el comportamiento prometido | Buscar un ID ausente conserva el mismo contrato |

**Guion del expositor**

“Responsabilidad única no significa un método por clase. Significa separar motivos de cambio: una modificación del JSON no debería obligarnos a cambiar la regla de aprobación. Abierto/cerrado invita a extender puntos de variación conocidos; no promete que nunca modificaremos código existente. Sustitución exige más que implementar los mismos métodos: si memoria devuelve ausencia para un ID desconocido, el reemplazo no debe devolver silenciosamente una solicitud inventada. Las pruebas de contrato ayudan a comprobar estas expectativas.”

**Transición:** “Los otros dos principios explican cómo diseñar dependencias pequeñas y reemplazables.”

### 09 · SOLID: interfaces y dependencias

**En pantalla**

| Principio | Idea | Ejemplo |
| --- | --- | --- |
| I · Segregación de interfaces | Contratos enfocados en sus consumidores | Almacenar solicitudes y registrar eventos son puertos distintos |
| D · Inversión de dependencias | La política depende de abstracciones | El caso de uso recibe `RepositorioDeSolicitudes` |

**Guion del expositor**

“Una interfaz grande obliga a consumidores a conocer operaciones que no usan. En ARKA-Lite el repositorio y el registrador de eventos tienen responsabilidades distintas. La inversión de dependencias permite que el caso de uso exprese lo que necesita y que un adaptador lo implemente. Inyección por constructor es una técnica para conectarlos; por sí sola no garantiza un buen diseño. SOLID orienta decisiones, no certifica automáticamente todas las clases del proyecto.”

**Puente a la sección 2:** “Ya sabemos representar datos y escribir reglas. Ahora vamos a ubicar esas reglas y sus dependencias dentro de una arquitectura.”

## Sección 2 · Arquitectura hexagonal

### 10 · Dominio, puertos y adaptadores

**En pantalla**

| Elemento | Pregunta que responde |
| --- | --- |
| Dominio | ¿Qué significa la operación y qué reglas debe cumplir? |
| Puerto | ¿Qué operación ofrece o necesita la aplicación? |
| Adaptador | ¿Cómo se conecta esa operación con una tecnologías |

**Guion del expositor**

“El hexágono representa una frontera, no seis componentes obligatorios. En el centro están el modelo y los casos de uso. Los puertos definen conversaciones a través de esa frontera. Los adaptadores resuelven HTTP, base de datos u otros mecanismos. La forma del dibujo importa menos que mantener explícitas las responsabilidades. Un puerto de esta arquitectura no es un puerto TCP como 8080.”

**Transición:** “Veamos qué pertenece al centro en nuestra aplicación.”

### 11 · Dominio y casos de uso

**En pantalla**

- `Solicitud`: datos y transiciones permitidas.
- `Estado`: vocabulario de estados.
- `ServicioDeSolicitudes`: coordina operaciones.
- `RepositorioDeSolicitudes`: necesidad de almacenamiento.

**Guion del expositor**

“La entidad decide si una transición es válida. El servicio de aplicación o caso de uso coordina búsqueda, cambio y guardado. En este repositorio `ServicioDeSolicitudes` está dentro de `dominio`, aunque realiza esa coordinación. Enviar guarda la solicitud y registra el evento en una transacción. La clase usa `jakarta.transaction.Transactional`; por eso no debemos presentar todo el dominio como completamente independiente de frameworks. La entidad `Solicitud` sí es Java sin anotaciones de Spring.”

“Crear y consultar son operaciones diferentes. registrar construye una solicitud BORRADOR. buscar recupera el resultado del repositorio, que el adaptador JPA transforma desde una entidad persistida. No inicializamos de nuevo el caso de uso en cada consulta: Spring conecta sus dependencias.”

**Transición:** “Para guardar sin conocer PostgreSQL, el caso de uso necesita un contrato.”

### 12 · Qué es una interfaz

**En pantalla — contrato real**

```java
public interface RepositorioDeSolicitudes {
    void guardar(Solicitud s);
    Optional<Solicitud> buscar(String id);
    List<Solicitud> todas();
}
```

**Guion del expositor**

“Una interfaz define operaciones que una implementación debe ofrecer. Aquí `buscar` expresa que la solicitud puede no existir mediante `Optional`; `todas` devuelve una lista de solicitudes. El contrato no dice qué tabla consultar ni qué servidor usar. `RepositorioJpa implements RepositorioDeSolicitudes` proporciona una implementación. No toda interfaz es un puerto arquitectónico: el propósito y la frontera que representa determinan ese papel. Y una interfaz Java tampoco es una API HTTP.”

“El puerto expresa las operaciones que el caso de uso necesita: guardar, buscar y todas. No contiene un catálogo de todas las operaciones SQL. RepositorioQueRegistra también implementa el puerto, pero usa LinkedHashMap y escribe un mensaje; sirve como ejemplo en memoria. Para PostgreSQL el adaptador activo es RepositorioJpa.”

**Transición:** “Con ese contrato podemos distinguir quién inicia la operación y quién presta una capacidad.”

### 13 · Entrada y salida

**En pantalla**

| Dirección | Responsabilidad | Ejemplo |
| --- | --- | --- |
| Adaptador de entrada | Recibe un estímulo y llama al caso de uso | `SolicitudController` |
| Puerto de entrada | Operación ofrecida por la aplicación | `ServicioDeSolicitudes.enviar(id)` |
| Puerto de salida | Capacidad requerida | `RepositorioDeSolicitudes` |
| Adaptador de salida | Implementa esa capacidad | `RepositorioJpa` |

**Guion del expositor**

“Entrada y salida se definen respecto de la aplicación. El controlador recibe HTTP y llama a Java. El repositorio recibe una solicitud Java y la traduce a persistencia. En este código no existe una interfaz separada llamada `EnviarSolicitudUseCase`: el controlador llama directamente al servicio. Podemos reconocer la operación de entrada sin inventar una interfaz que no está implementada. En notificaciones, recibir el evento por HTTP también es una entrada.”

**Transición:** “Estas responsabilidades tienen una ubicación concreta en el árbol de código.”

### 14 · Estructura del código

**En pantalla**

```text
servicio-solicitudes/
  pom.xml
  src/main/java/pa/gob/dntic/serviciosolicitudes/
    dominio/                  Reglas, casos de uso y puertos
    adaptadores/entrada/      HTTP y errores
    adaptadores/persistencia/ JPA y traducción de entidades
    adaptadores/salida/       Publicación y relevador
    config/                   Conexión de componentes
    eventos/                  Contratos de mensajes
  src/main/resources/         Propiedades y SQL
  src/test/java/              Pruebas
```

**Guion del expositor**

“Persistencia es un adaptador de salida aunque el paquete se llame `persistencia`. La clasificación depende de su función. Notificaciones conserva la misma idea, pero no replica exactamente todas las carpetas: su configuración está en `adaptadores/salida`. No necesitamos una simetría artificial. Al agregar una clase, preguntamos primero qué responsabilidad cumple y después elegimos el paquete.”

**Transición:** “La organización se vuelve más clara al seguir una consulta completa.”

### 15 · Cómo entra y sale una consulta

**En pantalla**

`GET /solicitudes/INC-002 → SolicitudController → ServicioDeSolicitudes.buscar → RepositorioDeSolicitudes → RepositorioJpa → PostgreSQL`

`Fila → SolicitudEntity → Solicitud → JSON de respuesta`

**Guion del expositor**

“El controlador extrae el identificador de la ruta. El caso de uso invoca el puerto. Spring ha conectado ese puerto con `RepositorioJpa`, seleccionado mediante `@Primary`. Spring Data JPA resuelve la consulta. El adaptador transforma la entidad de persistencia en un objeto del dominio. El resultado regresa por el controlador y se serializa como JSON. Cada representación sirve a una frontera distinta. Si el ID no existe, el caso de uso lanza `SolicitudNoEncontrada` y el manejador la convierte en HTTP 404.”

“HTTP tiene método, ruta, headers y un cuerpo opcional. Este GET recibe el ID en la ruta, sin necesitar un cuerpo JSON. JSON es la representación de la respuesta encontrada. El POST de enviar usa también el ID de la ruta y el POST remoto de eventos sí transporta JSON. No toda petición recibe 200: aquí una ausencia se mapea a 404 y las transiciones inválidas no tienen un manejador HTTP específico.”

**Transición:** “Una llamada recorre varias capas; las dependencias del código no tienen que seguir la misma dirección.”

### 16 · Dependencias y flujo de ejecución

**En pantalla**

- Ejecución: el caso de uso llama al repositorio conectado.
- Código: el caso de uso conoce la interfaz del dominio.
- Implementación: `RepositorioJpa` implementa esa interfaz.
- Configuración: Spring selecciona y entrega las instancias.

**Guion del expositor**

“En ejecución salimos hacia PostgreSQL. En el código, el caso de uso no necesita importar `RepositorioJpa`. Esa distinción es el centro de la inversión de dependencias. Las implementaciones en memoria facilitan pruebas, pero no verifican por sí mismas SQL, transacciones o disponibilidad de PostgreSQL. Además, el relevador actual accede directamente a `EventoJpaRepository`: es una simplificación del laboratorio, no un ejemplo de aislamiento perfecto.”

“Cambiar la base concentra trabajo en persistencia, pero también obliga a revisar driver, configuración, esquema, migraciones, transacciones y pruebas. La separación protege reglas del negocio; no elimina el trabajo de integración.”

**Puente a la sección 3:** “Hasta aquí seguimos llamadas dentro de un proceso Java. Ahora cruzaremos la red: el otro servicio tiene su propio proceso, sus propios datos y puede estar caído.”

## Sección 3 · Arquitectura y comunicación del sistema

### 17 · Monolito, microservicios y clases de servicio

**En pantalla**

| Nivel | Ejemplo | Qué significa |
| --- | --- | --- |
| Monolito modular | Alternativa conceptual | Una aplicación desplegable con módulos |
| Clase de servicio | `ServicioDeSolicitudes` | Coordina operaciones dentro de una JVM |
| Microservicio | `servicio-solicitudes` | Aplicación desplegable con API y proceso propios |
| Infraestructura | PostgreSQL, Loki | Almacenamiento o soporte operativo |

**Guion del expositor**

“Una anotación `@Service` no crea un microservicio. ARKA-Lite tiene dos aplicaciones de negocio: solicitudes gestiona el ciclo de vida y notificaciones consume eventos para generar avisos. PostgreSQL almacena información; Loki, Promtail y Grafana apoyan la observación. En otros sistemas podemos tener servicios de consulta, orquestación o integración. Esos son roles posibles, no aplicaciones adicionales presentes aquí. Tampoco tenemos un gateway ni un broker implementados.”

“Para decidir entre monolito modular y servicios separados primero miramos límites del negocio, equipos, necesidad de despliegue o escala independiente y capacidad operativa. Un monolito puede tener módulos claros. Varios procesos agregan red y fallos parciales. ARKA-Lite usa dos servicios como ejercicio de aprendizaje, sin demostrar que toda solución de solicitudes deba empezar así.”

**Transición:** “La frontera de proceso cambia el significado de una llamada.”

### 18 · Comunicación síncrona y trabajo asíncrono

**En pantalla**

- REST/HTTP: petición y respuesta por red.
- Mensajes mediante broker: alternativa arquitectónica.
- ARKA-Lite: registro local y entrega posterior por HTTP.

**Guion del expositor**

“Una llamada síncrona espera la respuesta del destinatario. En una solución con broker, el productor normalmente entrega el mensaje a una infraestructura intermediaria. Aquí no hay Kafka ni RabbitMQ: la API registra un evento en una tabla y responde; luego un proceso programado realiza un POST HTTP. Por tanto, el flujo es asíncrono respecto de quien envió la solicitud, aunque cada intento HTTP del publicador espere una respuesta.”

**Transición:** “Vamos a separar el envío en dos momentos para entender qué se confirma en cada uno.”

### 19 · Envío: estado y evento en una transacción

**En pantalla**

`POST /solicitudes/INC-002/enviar`

1. Cargar la solicitud y validar `BORRADOR`.
2. Crear su representación `ENVIADA`.
3. Guardar la solicitud y el evento pendiente en una transacción.
4. Responder al cliente.

**Guion del expositor**

“El controlador llama a `ServicioDeSolicitudes.enviar`. `RepositorioJpa` guarda el estado y `RegistradorDeEventosJpa` registra un UUID, el ID de solicitud y el tipo de evento, con `procesado=false`. Ambos cambios participan en la misma transacción local. Si falla el registro del evento, esa transacción no debe confirmar el cambio de estado. El outbox es precisamente esa tabla de trabajo pendiente. La respuesta exitosa confirma esta operación local; todavía no demuestra que exista el aviso.”

**Transición:** “El trabajo pendiente ya es durable en la base. Veamos quién lo entrega.”

### 20 · Segundo momento: publicar el pendiente

**En pantalla**

`RelevadorDeEventosPendientes → PublicadorDeEventos → PublicadorConReintento → POST HTTP`

- Espera de 5 segundos entre ciclos del relevador.
- Hasta 3 intentos por publicación.
- Esperas de 500 y 1.000 ms entre intentos fallidos.
- Marca `procesado=true` después de una publicación exitosa.

**Guion del expositor**

“El relevador busca eventos no procesados y usa el publicador activo. Es una espera entre ciclos, no un compromiso de entrega en cinco segundos: el tiempo de HTTP y de los demás eventos también influye. Si se agotan los intentos, el publicador lanza una excepción y el evento permanece pendiente para otro ciclo. Un reinicio de la aplicación no borra el pendiente si conservamos la base. `PublicadorRest` es una implementación alternativa, pero `PublicadorConReintento` es la seleccionada mediante `@Primary`.”

**Transición:** “Lo que cruza la red es un documento JSON, no una instancia Java compartida.”

### 21 · Contrato del evento y recepción

**En pantalla — ejemplo representativo del flujo actual**

```json
{
  "eventoId": "29bc873c-b86d-44b5-9302-707bb7a27106",
  "id": "INC-002",
  "tipo": "SolicitudEnviada"
}
```

`EventoController → ConsumoIdempotente → ServicioDeNotificaciones`

**Guion del expositor**

“`eventoId` identifica el hecho y se conserva durante sus reintentos; `id` identifica la solicitud. En el flujo actual, `tipo` contiene `SolicitudEnviada`, porque proviene del tipo almacenado en el outbox. No contiene necesariamente `Incidencia`: hay una diferencia semántica con ejemplos antiguos y algunas pruebas. El receptor deserializa el JSON a su propio `SolicitudEnviada`. Consulta si el identificador ya fue procesado; si no, crea el texto del aviso y registra el identificador en PostgreSQL.”

**Transición:** “Para comprender la recuperación debemos distinguir qué se guarda y dónde.”

### 22 · Dónde queda cada dato

**En pantalla**

| Dato | Ubicación | Efecto de reiniciar la aplicación |
| --- | --- | --- |
| Solicitud | PostgreSQL de solicitudes | Permanece si se conserva la base |
| Evento pendiente y estado de entrega | Misma base | Puede retomarse |
| Identificador consumido | PostgreSQL de notificaciones | Se recuerda el procesamiento |
| Texto del aviso | Memoria de notificaciones | Se pierde |

**Guion del expositor**

“No hay una transacción única que abarque ambos servicios. Tampoco la transacción del consumidor convierte una lista en memoria en almacenamiento transaccional. Si reiniciamos notificaciones, el texto desaparece y el identificador sigue registrado; repetir ese evento no lo reconstruye. La consulta previa de duplicados tampoco garantiza exactamente una vez frente a concurrencia. Son límites concretos del laboratorio y motivos para diseñar persistencia y consumo más robustos.”

**Transición:** “Con estas ubicaciones claras podemos razonar sobre los fallos.”

### 23 · Fallos, reintentos y observación

**En pantalla**

| Situación | Resultado esperado |
| --- | --- |
| Falla la transacción de envío | No se confirma ese envío local |
| Notificaciones no responde | El evento queda pendiente |
| Se pierde la respuesta HTTP después del consumo | Puede reenviarse el mismo evento |
| Reinicia notificaciones | Se pierden los textos en memoria |

**Guion del expositor**

“Para investigar seguimos `solicitudId`, `eventoId` y los logs de ambos procesos. Actuator informa salud y métricas; Promtail envía logs a Loki y Grafana permite consultarlos una vez configurada su fuente. Un endpoint saludable no demuestra que un evento particular se haya entregado. Como la entrega se ejecuta en segundo plano, no prometemos una única traza continua desde la petición original: el contexto de esa petición no se persiste en el outbox actual.”

**Transición:** “Terminemos reconstruyendo el recorrido sin depender de los nombres de las láminas.”

### 24 · Recapitulación y conversación técnica

**En pantalla**

`Cliente → entrada HTTP → caso de uso → reglas → puertos → persistencia → outbox → publicador HTTP → consumidor → aviso`

**Guion del expositor**

“Java nos permite expresar los datos y las reglas. La arquitectura hexagonal separa la política de los mecanismos de entrada y salida. La arquitectura distribuida añade una frontera de red y tiempos de finalización diferentes. Enviar una solicitud, entregar un evento y conservar un aviso son tres hechos que debemos comprobar por separado.”

**Preguntas para el equipo**

1. ¿Qué cambiaríamos para persistir el texto sin romper el contrato de notificaciones?
2. ¿Qué pruebas faltan para demostrar rollback y recuperación con PostgreSQL real?
3. ¿Cómo separaríamos `tipoEvento` de `tipoSolicitud` en una evolución del contrato?
4. ¿Qué significa éxito para el usuario cuando el aviso todavía está pendiente?

**Transición a Docker:** “Ahora veremos cómo empaquetar y ejecutar estos componentes conservando sus contratos y datos.”

Referencias y recorrido completo: [material compartido](flujo-y-referencias.md).

## Sección 4 · Docker y ejecución en contenedores

### 25 · Docker: del código al proceso

**En pantalla**

- Dockerfile: receta de construcción.
- Imagen: aplicación empaquetada con su runtime.
- Contenedor: proceso creado desde una imagen.

**Guion del expositor**

Recorrer las dos etapas de los Dockerfile reales: Maven 3.9 con JDK 26 genera el JAR y JRE 26 lo ejecuta. COPY --from evita llevar Maven y el código fuente al runtime. El usuario final no es root. package usa -DskipTests: el build de Docker no demuestra que las pruebas pasaron. Fuentes: Dockerfile de cada servicio y documentación oficial de builds multietapa.

“La imagen reduce diferencias al incluir aplicación y runtime. Su ejecución todavía depende de arquitectura compatible, variables, red, credenciales, almacenamiento y recursos. Docker no garantiza el mismo resultado en cualquier entorno solo por estar instalado.”

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 26 · Imagen, configuración y datos

**En pantalla**

- Imagen: JAR y JRE versionados.
- Variables: DB_URL, DB_USER y NOTIFICACIONES_URL.
- Datos: fuera del ciclo de vida del contenedor.
- Puerto publicado: host 8081 conecta al 8080 de notificaciones.

**Guion del expositor**

Una imagen puede crear varios contenedores con distinta configuración. localhost dentro del contenedor apunta a ese contenedor. EXPOSE no publica puertos. Compose configura el mapeo. No incluir contraseñas en imágenes. El Compose actual no declara volúmenes de datos estables para las bases: no prometer recuperación tras recreación o limpieza.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 27 · Compose: red y dependencias de ARKA-Lite

**En pantalla**

- Dos aplicaciones y dos bases PostgreSQL.
- DNS interno por nombre de servicio.
- Healthchecks ordenan el arranque local.
- Loki, Promtail y Grafana acompañan el laboratorio.

**Guion del expositor**

Seguir la petición en localhost:8080, la URL interna servicio-notificaciones:8080 y ambas conexiones JDBC. depends_on con service_healthy espera salud inicial, no garantiza disponibilidad permanente. Los logs son un flujo separado del negocio. En Compose hay cuatro componentes de negocio y datos, más tres de observabilidad. No dibujar un broker inexistente.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 28 · Laboratorio Docker: evidencia de funcionamiento

**En pantalla**

- docker compose config
- docker compose up -d --build
- docker compose ps
- docker compose logs --tail=80 servicio-solicitudes

**Guion del expositor**

Demostración guiada, no comandos ejecutados al preparar la presentación. Validar configuración, iniciar, comprobar estado y revisar logs. Crear y enviar una solicitud siguiendo el contrato documentado. Si no aparece el aviso, distinguir estado enviado, outbox pendiente y receptor. Reiniciar notificaciones sirve para observar la pérdida de avisos en memoria. No usar down -v como paso rutinario.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

## Sección 5 · Kubernetes y operación declarativa

### 29 · Kubernetes: estado deseado y reconciliación

**En pantalla**

- YAML describe la versión y las réplicas.
- Deployment administra actualizaciones.
- ReplicaSet mantiene el número de Pods.
- El controlador compara estado deseado y observado.

**Guion del expositor**

Explicación conceptual basada en la documentación oficial de Deployments. Un Pod aloja uno o más contenedores. Kubernetes programa los Pods en nodos y los controladores reponen los que faltan. El Deployment de cada aplicación pide una réplica. Este mecanismo no resuelve por sí solo la idempotencia o persistencia del negocio.

“Usar Docker no exige usar Kubernetes. Kubernetes aporta control declarativo cuando necesitamos coordinar despliegues y recursos. Un Pod es una unidad de ejecución con uno o más contenedores. Deployment y ReplicaSet mantienen réplicas de Pods; el Service dirige tráfico hacia destinos disponibles. El Pod no es un repartidor de subredes.”

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 30 · Recursos reales del laboratorio

**En pantalla**

- Deployment: ejecuta aplicaciones y bases.
- Service: nombre estable y selección por etiquetas.
- Secret: credencial referenciada por los contenedores.
- PVC: almacenamiento solicitado para PostgreSQL.

**Guion del expositor**

Leer k8s/solicitudes.yaml, notificaciones.yaml y ambos db-*.yaml. solicitudes expone NodePort y notificaciones usa Service interno. Los initContainers esperan la base y, en solicitudes, el receptor. Los PVC piden 1Gi. Las bases usan estrategia Recreate. La credencial incluida es de laboratorio. No hay Ingress, HPA ni ConfigMap declarados en estos archivos.

“Compose y Kubernetes son rutas distintas. El laboratorio Compose se levanta con compose.yaml; los recursos de Kubernetes se definen en k8s. El workflow de CI publica imágenes, pero no conecta automáticamente ambos pasos mediante un despliegue.”

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 31 · Arranque, salud y persistencia

**En pantalla**

- initContainer: espera una dependencia al iniciar.
- Readiness: decide si el Pod recibe tráfico.
- Liveness: puede reiniciar un contenedor bloqueado.
- PVC: separa los datos de la vida del Pod.

**Guion del expositor**

Las aplicaciones tienen readiness HTTP sobre /solicitudes y /notificaciones. Las bases tienen readiness y liveness mediante pg_isready. No atribuir liveness a las aplicaciones: sus manifiestos no la incluyen. Los PVC conservan datos mientras permanezcan el volumen y su política de retención. Readiness exitosa no prueba la entrega de un evento.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 32 · Diagnóstico en Kubernetes

**En pantalla**

- kubectl get pods,svc,pvc
- kubectl describe pod <nombre>
- kubectl logs deployment/servicio-solicitudes
- kubectl rollout status deployment/servicio-solicitudes

**Guion del expositor**

Guía de lectura: Pending lleva a eventos, capacidad y PVC. ImagePullBackOff lleva a imagen, tag y registro. CrashLoopBackOff lleva a logs y configuración. Running sin Ready lleva al endpoint de readiness y dependencias. Confirmar contexto y namespace antes de actuar. Escalar notificaciones sin persistir avisos distribuye memoria entre Pods y cambia el resultado de consultas.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

## Sección 6 · CI/CD y trazabilidad de entregas

### 33 · CI, entrega continua y despliegue continuo

**En pantalla**

- CI: integrar cambios con compilación y pruebas.
- Entrega continua: versión validada lista para desplegar.
- Despliegue continuo: promoción automática al destino.
- ARKA-Lite: CI y publicación de imágenes, sin despliegue.

**Guion del expositor**

Separar artefacto publicado de versión ejecutándose. Un pipeline puede terminar en verde sin cambiar el clúster. La entrega continua permite un paso de aprobación para liberar, mientras el despliegue continuo automatiza la promoción cuando se cumplen los controles. El workflow actual llega a GHCR. Fuentes: ci.yml y documentación de GitHub Actions.

“El YAML automatiza acciones específicas: preparar entorno, compilar, probar y publicar en este proyecto. No verifica todo ambiente posible ni garantiza el sistema completo por el hecho de terminar sin errores.”

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 34 · GitHub Actions: pipeline actual

**En pantalla**

- Evento: push a main o Pull Request.
- Matriz: solicitudes y notificaciones.
- Runner: Ubuntu, Java 26 y PostgreSQL 17.
- Salida: imagen en GHCR etiquetada con SHA.

**Guion del expositor**

Cada entrada de matriz crea un job con su base. verify valida el servicio y solicitudes añade una prueba de arranque con búsqueda de CAM-002. El login usa GITHUB_TOKEN. No hay workflow_dispatch ni paso kubectl. La publicación también se intenta en PR y puede fallar por permisos, especialmente desde forks. Señalar este límite como configuración actual, no como cambio aplicado.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 35 · Controles y fallos del pipeline

**En pantalla**

- Compilación o pruebas fallan: no continuar ese job.
- Build de imagen falla: revisar Dockerfile y contexto.
- Push rechazado: revisar permisos y evento.
- Imagen publicada: todavía falta comprobar el despliegue.

**Guion del expositor**

Propuesta: separar validación de PR de publicación en main y condicionar permisos de escritura. Conservar reportes de pruebas y digest de imagen. Un job exitoso de la matriz no prueba que el otro lo está. La versión a promover debe enlazar commit, ejecución del workflow e imagen. La etiqueta con SHA facilita rastreo, pero puede sobrescribirse si el registro lo permite.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 36 · Promoción entre ambientes y recuperación

**En pantalla**

- PROPUESTA: validar la misma imagen en cada ambiente.
- Configurar secretos y conexiones por destino.
- Aprobar producción con evidencia de pruebas.
- Verificar negocio y disponer de rollback.

**Guion del expositor**

Esta ruta no existe en el workflow actual. Promover por digest evita reconstruir una versión diferente. Registrar quién aprobó y qué imagen quedó desplegada. Rollback de aplicación no revierte datos ni contratos automáticamente. Comprobar compatibilidad de esquema antes de retroceder. Kubernetes rollout y healthchecks deben acompañarse de un caso funcional de envío y recepción.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.


### 37 · Creación de ci.yml en GitHub

**En pantalla**

- Repositorio: Code, Add file, Create new file.
- Ruta: .github/workflows/ci.yml.
- Editar el YAML en una rama y abrir un Pull Request.
- En ARKA-Lite el archivo ya existe: se edita.

**Guion del expositor**

GitHub reconoce workflows en .github/workflows con extensión .yml o .yaml. ci.yml y ci.yaml son nombres válidos, pero crear ambos con los mismos eventos duplicaría ejecuciones. Aquí usamos ci.yml porque es el archivo existente. Alternativa: Actions, New workflow y set up a workflow yourself. Explicar que guardar el archivo implica un commit y que no se requiere un servidor Jenkins. No crear otro workflow de demostración en el repositorio real. Fuente: https://docs.github.com/en/actions/get-started/quickstart .

**Transición:** Revisar el siguiente componente del workflow con el mismo commit de ejemplo.

### 38 · YAML: nombre, eventos y runner

**En pantalla**

```yaml
name: CI-Arkalitos
on:
  push:
    branches: [main]
  pull_request:
jobs:
  construir-probar-publicar:
    runs-on: ubuntu-latest
    permissions: {contents: read, packages: write}
```

**Guion del expositor**

Fragmento real, abreviado: los pasos y demás propiedades continúan dentro del job. name identifica el workflow en Actions. on selecciona eventos. push filtrado ejecuta ante commits que llegan a main y pull_request cubre actividad de PR. jobs contiene trabajos y runs-on elige su runner. permissions permite leer código y escribir paquetes con el token del job. Usar espacios para la indentación. El workflow actual no tiene workflow_dispatch, por lo que no ofrece ejecución manual mediante Run workflow. Un push a una rama de trabajo sin PR no satisface por sí solo estos disparadores.

**Transición:** Revisar el siguiente componente del workflow con el mismo commit de ejemplo.

### 39 · YAML: matriz, base y variables

**En pantalla**

| Elemento | Valor de una ejecución | Efecto |
| --- | --- | --- |
| matrix.servicio | servicio-solicitudes | Directorio Maven y Docker |
| matrix.base_datos | db-solicitudes | Base del job |
| services.postgres | postgres:17 | PostgreSQL en el runner |
| env.DB_URL | localhost:5432/db-solicitudes | Conexión de las pruebas |

**Guion del expositor**

strategy.matrix.include declara dos pares servicio/base_datos. GitHub expande el mismo job para solicitudes y notificaciones. En cada runner se prepara su PostgreSQL y se espera al healthcheck. En este workflow el job corre directamente en Ubuntu y el puerto publicado permite usar localhost:5432. No confundir este PostgreSQL efímero de CI con las bases del clúster o de Compose. working-directory: ${{ matrix.servicio }} evita ejecutar Maven en la raíz, donde no hay pom.xml. Ver el YAML completo en ci-yaml-paso-a-paso.md.

**Transición:** Revisar el siguiente componente del workflow con el mismo commit de ejemplo.

### 40 · YAML: acciones reutilizables y comandos

**En pantalla**

```yaml
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: {distribution: temurin, java-version: '26'}
      - name: Compilar y probar
        working-directory: ${{ matrix.servicio }}
        run: mvn -B verify
```

**Guion del expositor**

Fragmento del job actual, abreviado para lectura. uses ejecuta una acción reutilizable y with le pasa parámetros. checkout descarga el código al runner y setup-java prepara Java. run ejecuta un comando de shell. Los steps de un job se ejecutan en orden. Si verify falla, los pasos posteriores sin una condición especial no continúan. El workflow real también configura caché Maven, verifica arranque en solicitudes y autentica contra GHCR antes de construir y publicar. secrets.GITHUB_TOKEN es el token provisto al job, no una contraseña que se deba pegar en el YAML. github.sha identifica el commit y se usa como etiqueta de imagen. Las versiones mostradas corresponden al archivo del proyecto, sin afirmar que sean las últimas versiones publicadas.

**Transición:** Revisar el siguiente componente del workflow con el mismo commit de ejemplo.

### 41 · GitHub Actions: ejecución, checks y logs

**En pantalla**

- Abrir Actions y elegir CI-Arkalitos.
- Elegir la ejecución del commit o Pull Request.
- Abrir el job del servicio y expandir el paso.
- Corregir la causa, publicar otro commit y comprobar.

**Guion del expositor**

Demostración en GitHub: seleccionar Actions, workflow, ejecución, job de la matriz y step. Comprobar rama, SHA, evento y resultado para no inspeccionar una ejecución antigua. En el PR, la sección de checks enlaza los mismos resultados. Error de YAML: revisar ruta e indentación. Error Maven: buscar la primera causa y el resumen de pruebas. Error de push a GHCR: revisar evento y permisos, especialmente en PR de forks. Verde confirma los trabajos ejecutados, no un despliegue. No afirmar que hay runs, checks requeridos o paquetes publicados sin observar el repositorio remoto. Mostrar la interfaz como recorrido didáctico. Fuente: https://docs.github.com/en/actions/how-tos/monitor-workflows/use-workflow-run-logs .

**Transición:** Revisar el siguiente componente del workflow con el mismo commit de ejemplo.

## Sección 7 · Git y GitHub para trabajo colaborativo

### 42 · Git y GitHub: responsabilidades

**En pantalla**

- Git guarda historial y ramas de forma distribuida.
- GitHub aloja repositorios y coordina Pull Requests.
- Actions ejecuta automatizaciones.
- GHCR almacena las imágenes del proyecto.

**Guion del expositor**

Git funciona localmente sin GitHub. Una rama referencia una línea de commits y un commit conserva un snapshot con sus metadatos. GitHub agrega revisión, issues y checks. El SHA del commit conecta el cambio con la imagen generada por nuestro workflow. Evitar confundir GitHub con el registro de imágenes o con Kubernetes.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 43 · Del archivo modificado al cambio integrado

**En pantalla**

- Directorio de trabajo: edición local.
- Staging: selección del próximo commit.
- Commit: registro local del cambio.
- Push y Pull Request: publicación y revisión.

**Guion del expositor**

Mostrar git status, git diff y git diff --staged. Agregar rutas intencionales evita incluir archivos ajenos. Un commit local no aparece en GitHub hasta publicarlo. El Pull Request compara ramas y reúne revisión y checks. Merge integra el cambio según la política elegida. Fuente conceptual: libro oficial de Git.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 44 · Ramas, conflictos y revisión

**En pantalla**

- git switch -c feat/persistir-avisos
- git status --short
- git diff
- git add <rutas>
- git diff --staged

**Guion del expositor**

Continuación oral: ejecutar verify en cada servicio, crear un commit y publicar la rama con git push -u origin feat/persistir-avisos. fetch actualiza referencias remotas sin integrar cambios. Un conflicto requiere entender ambas modificaciones, resolver el archivo y repetir validación. revert crea un commit inverso y permite deshacer un cambio compartido conservando historia. Evitar reescribir historia compartida como rutina.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 45 · GitHub: revisión y trazabilidad completa

**En pantalla**

- Issue: problema y criterio de aceptación.
- Pull Request: cambio, impacto y evidencia.
- Actions: compilación y resultados de pruebas.
- Release e imagen: versión rastreable.

**Guion del expositor**

Ejercicio integrador: persistir avisos. La propuesta debe explicar migración, idempotencia y recuperación tras reinicio. La revisión cubre contrato, pruebas y operación. Proponer protección de main y checks requeridos sin afirmar que ya están activos. Seguir la cadena issue, PR, commit, workflow, digest e imagen desplegada. Cierre: demostrar que el aviso persiste y que reintentar un evento no crea duplicados.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

## Sección 8 · Datos y consistencia

Objetivo: distinguir persistencia, integridad local y propagación entre servicios, y definir evidencia de recuperación. Material compartido: [datos y consistencia](datos-y-consistencia.md).

### 46 · Datos, estado y fuente de verdad

**En pantalla**

- Solicitudes es dueño del estado del trámite.
- El outbox conserva el trabajo de entrega pendiente.
- Notificaciones conserva IDs consumidos en PostgreSQL.
- El texto del aviso permanece en memoria.

**Guion del expositor**

Volvemos a INC-002: estar ENVIADA, tener un evento entregado y disponer de un aviso consultable son hechos diferentes. Para cada dato preguntamos quién puede escribirlo, dónde se consulta y cuánto vive. Cada servicio mantiene su propia base. Evitar que un servicio escriba directamente las tablas del otro preserva esa responsabilidad. Persistencia significa sobrevivir al proceso, con el almacenamiento conservado. Consistencia describe reglas y relaciones que deben mantenerse. No son sinónimos.

**Transición:** La fuente de verdad nos permite interpretar el modelo de tablas.

### 47 · Modelo relacional y claves del proyecto

**En pantalla**

| Dato | Clave | Relación |
| --- | --- | --- |
| solicitud | id de negocio | Un trámite y su estado |
| evento | id BIGSERIAL | solicitud_id referencia solicitud |
| evento.evento_id | UUID de entrega | Se conserva en los reintentos |
| evento_procesado | evento_id como PK | Registro local del receptor |

**Guion del expositor**

Mostrar el modelo en datos-y-consistencia.md. solicitud tiene id, tipo y estado. evento agrega solicitud_id, tipo, evento_id y procesado. El id numérico del evento identifica su fila y el UUID identifica la entrega entre servicios. La FK es local a la base de solicitudes. No hay FK entre ambas bases. El esquema mostrado no declara UNIQUE para evento.evento_id ni impide varios eventos de envío de la misma solicitud. La PK del receptor identifica eventos consumidos, no solicitudes. Un mismo trámite podría producir diferentes hechos con distintos IDs.

**Transición:** Las claves identifican datos, pero necesitamos definir qué valores y cambios son válidos.

### 48 · Restricciones y reglas de negocio

**En pantalla**

- PRIMARY KEY: identidad única y no nula.
- FOREIGN KEY: referencia local existente.
- NOT NULL y CHECK: valores permitidos.
- El dominio valida las transiciones de estado.

**Guion del expositor**

schema.sql limita estado a BORRADOR, ENVIADA, APROBADA o RECHAZADA. Ese CHECK no comprueba el estado anterior: por sí solo no impide un salto inválido entre dos valores permitidos. Solicitud.enviar exige BORRADOR. La aplicación valida intención y la base protege restricciones aunque otro cliente escriba. Un índice puede acelerar consultas, pero un índice no único no prohíbe duplicados. No atribuir al índice parcial de pendientes una garantía de entrega única.

**Transición:** Guardar dos cambios relacionados requiere una frontera transaccional.

### 49 · ACID aplicado al envío

**En pantalla**

| Propiedad | Significado en el envío |
| --- | --- |
| Atomicidad | Estado y evento se confirman juntos |
| Consistencia | Reglas y restricciones deben cumplirse |
| Aislamiento | Define interacción entre transacciones |
| Durabilidad | Commit persiste en almacenamiento durable |

**Guion del expositor**

La atomicidad agrupa los cambios locales. La consistencia de ACID se refiere a invariantes válidas, no a que dos microservicios respondan lo mismo al mismo instante. El aislamiento depende del nivel y del acceso utilizado: una transacción no serializa automáticamente todos los envíos. La durabilidad presupone almacenamiento conservado y configuración adecuada. Una lista Java no participa del commit de PostgreSQL. Ni una réplica de aplicación ni un PVC reemplazan una estrategia de backup y restauración.

**Transición:** Ahora ubicamos qué operaciones participan realmente en el commit.

### 50 · Transacción local: solicitud y outbox

**En pantalla**

- ServicioDeSolicitudes.enviar tiene @Transactional.
- RepositorioJpa guarda el estado ENVIADA.
- RegistradorDeEventosJpa guarda el evento pendiente.
- Un fallo local debe provocar rollback de ambos cambios.

**Guion del expositor**

El camino activo pasa por los puertos de repositorio y registro de eventos dentro de la transacción del caso de uso. OperacionEnviar existe como ejemplo, pero no participa del flujo conectado. La entrega HTTP del relevador ocurre después. Una respuesta al cliente puede perderse aunque el commit ya haya ocurrido. Por eso un timeout del cliente no permite inferir que no se guardó el cambio. Comprobar el estado antes de repetir una operación de negocio y diseñar una política de idempotencia de comandos si el contrato lo requiere.

**Transición:** La transacción termina antes de que otro servicio complete su trabajo.

### 51 · Consistencia entre servicios y confirmaciones

**En pantalla**

- Commit local: solicitud enviada y evento registrado.
- Entrega: el receptor acepta el evento por HTTP.
- Confirmación del emisor: marca procesado=true.
- Disponibilidad del aviso: depende de su almacenamiento.

**Guion del expositor**

El envío y la recepción tienen fronteras distintas. Durante un intervalo válido la solicitud puede estar enviada y el aviso aún no existir. Llamamos eventual al modelo que busca propagar el hecho mediante trabajo posterior, bajo recuperación de dependencias y procesamiento exitoso. No implica convergencia garantizada ante fallos permanentes, datos borrados o inconsistencias del consumidor. El sistema no establece un plazo máximo. La inconsistencia temporal de propagación debe distinguirse de perder definitivamente un aviso.

**Transición:** El outbox conserva la intención de entrega mientras el receptor no está disponible.

### 52 · Outbox Pattern: recuperación y ventanas de fallo

**En pantalla**

| Punto de fallo | Resultado a investigar |
| --- | --- |
| Antes del commit local | Ese envío no queda confirmado |
| Después del commit, antes del HTTP | Evento pendiente recuperable |
| Receptor consume, respuesta se pierde | Puede repetirse la entrega |
| HTTP exitoso, emisor no marca | Puede publicarse otra vez |

**Guion del expositor**

Recorrer el diagrama de secuencia compartido. El relevador consulta procesado=false y publica con el UUID guardado. Si publicar o marcar falla, un ciclo posterior puede volver a enviar. El diseño admite redelivery y exige un receptor que tolere repeticiones. No prometer exactamente una vez ni un SLA de cinco segundos: fixedDelay es la espera entre ciclos. La convergencia requiere conservar las bases y que el receptor pueda completar el procesamiento. El código actual no implementa un mecanismo de reclamación exclusiva para varios relevadores concurrentes.

**Transición:** La repetición es esperable, por lo que debemos definir qué significa procesar el mismo evento.

### 53 · Idempotencia y persistencia del efecto

**En pantalla**

- Reintento de transporte: conservar eventoId.
- Evento nuevo: identidad nueva para un hecho nuevo.
- Receptor: omitir un ID ya consumido.
- Mejora: aviso e ID en una misma transacción durable.

**Guion del expositor**

El consumidor consulta existsById, crea el aviso y guarda el ID. En el flujo secuencial evita repetir IDs conocidos. Sin embargo, el aviso vive en ArrayList y no participa en rollback de JPA. Si falla la escritura del ID, el texto puede quedar en memoria y el reintento puede agregarlo otra vez. Tras reinicio se pierde el texto pero permanece el ID y volver a entregar el mismo evento no lo reconstruye. Propuesta: persistir aviso e inbox de consumo en la base del receptor, con identidad y unicidad apropiadas, dentro de una misma transacción. No cambiaremos código en esta etapa documental.

**Transición:** Incluso con almacenamiento durable, dos operaciones simultáneas requieren coordinación.

### 54 · Concurrencia: dos lecturas del mismo estado

**En pantalla**

- Dos peticiones podrían leer BORRADOR.
- Ambas podrían intentar guardar ENVIADA y un evento.
- Dos consumidores podrían ver el mismo ID como ausente.
- Transacción y comprobación previa no bastan por sí solas.

**Guion del expositor**

Escenario de análisis derivado del código, no resultado de una prueba ejecutada. SolicitudEntity no declara @Version y no observamos bloqueo de fila explícito en la búsqueda. Una carrera puede permitir dos envíos basados en la misma lectura y dos UUID distintos. En el receptor, la PK impide dos filas finales con la misma clave, pero no deshace los dos efectos en memoria previos al conflicto. Propuestas a evaluar: actualización condicional y comprobar filas afectadas, bloqueo optimista con versión correctamente propagada, o bloqueo pesimista dentro de una transacción. Para el receptor, coordinar deduplicación y efecto durable. No presentar un SELECT previo como exclusión mutua.

**Transición:** Elegiremos el mecanismo según la regla y comprobaremos el resultado con pruebas concurrentes.

### 55 · Evolución del esquema y de los contratos

**En pantalla**

- Versionar cambios de estructura y transformación de datos.
- Mantener compatibilidad durante la transición.
- Separar tipoEvento de tipoSolicitud como propuesta.
- Restaurar datos y volver una versión son tareas distintas.

**Guion del expositor**

El proyecto usa scripts SQL e inicialización de Hibernate, con configuraciones distintas por servicio. Solicitudes valida el esquema y ejecuta inicialización SQL; notificaciones usa ddl-auto=update. No hay que afirmar que exista Flyway o Liquibase. schema.sql incluye ALTER para instalaciones previas al outbox y evita republicar automáticamente los eventos históricos sin una identidad de entrega recuperable. Propuesta: migraciones versionadas y verificadas. Un cambio de contrato debe tolerar coexistencia de productor y consumidor antiguos y nuevos. Expandir estructura, migrar datos y retirar lo anterior solo tras verificar compatibilidad.

**Transición:** Los cambios necesitan evidencia de integridad, recuperación y comportamiento.

### 56 · Laboratorio: comprobar datos y recuperación

**En pantalla**

- Consultar solicitud, outbox y consumo por sus IDs.
- Simular receptor indisponible en un entorno aislado.
- Recuperar el receptor y seguir el mismo eventoId.
- Reiniciar notificaciones y comparar IDs frente a textos.

**Guion del expositor**

Usar las consultas de solo lectura del material compartido. El ejercicio de parada y reinicio es un guion para laboratorio, no una ejecución realizada al escribirlo. No borrar volúmenes ni datos para demostrar reinicio. Registrar antes y después: estado, pendiente, ID consumido y texto. La pérdida de respuesta HTTP requiere un mecanismo controlado de inyección de fallo; no se demuestra simplemente apagando un servicio. No fijar un sleep de cinco segundos como criterio de éxito. Registrar tiempos y observar hasta el resultado o hasta un límite de observación acordado.

**Transición:** Terminamos definiendo qué evidencia permitiría afirmar una mejora de consistencia.

### 57 · Criterios de aceptación de consistencia

**En pantalla**

- Fallo de registro local: rollback comprobado con PostgreSQL.
- Reentrega del mismo evento: un solo efecto durable.
- Envíos concurrentes: regla de negocio preservada.
- Reinicio y restauración: datos y recuperación verificables.

**Guion del expositor**

Estas son metas para la evolución, no pruebas ya aprobadas. Probar rollback con base real y leer el resultado desde otra transacción. Probar secuencial y concurrentemente la reentrega, incluyendo fallo al confirmar el consumo. Validar reinicio de proceso por separado de pérdida o restauración del almacenamiento. Definir quién opera pendientes atascados, cómo reconoce el usuario un envío registrado y qué demora resulta aceptable. Si se incorpora compensación para un proceso más largo, tratarla como una nueva operación de negocio, no como rollback automático de un HTTP remoto.

**Transición:** Cierre: identificar qué se confirmó, qué efecto falta y cómo demostrar su recuperación.

Fuentes de la sección: [código, diagramas y respaldo conceptual](datos-y-consistencia.md#fuentes).

## Sección 9 · Observabilidad

Objetivo: investigar el recorrido de una solicitud con logs, métricas, trazas y datos de negocio. Material compartido: [observabilidad](observabilidad.md).

### 58 · Observabilidad: preguntas sobre el sistema

**En pantalla**

- Logs: qué ocurrió y con qué contexto.
- Métricas: cuánto, con qué frecuencia y con qué demora.
- Trazas: qué operaciones participaron en una ejecución.
- Salud técnica y éxito de negocio requieren evidencia distinta.

**Guion del expositor**

“Imaginemos que una persona nos dice: envié mi solicitud y nunca apareció el aviso. Para responder necesitamos más información que saber si el servidor está encendido. Queremos saber si la solicitud quedó guardada, si se creó el evento, si alguien intentó entregarlo y si el receptor produjo el aviso.”

“Un log registra un hecho con contexto: por ejemplo, un intento de publicación que falló. Una métrica resume mediciones: cuántas peticiones llegaron o cuánto tardaron. Una traza relaciona operaciones dentro de una ejecución instrumentada. Cada señal nos ayuda a responder una pregunta diferente.”

“La observabilidad consiste en usar esas señales para comprender el comportamiento del sistema. Los datos de negocio siguen siendo necesarios: un mensaje que dice intentando publicar no demuestra que la publicación terminó. Tampoco una aplicación que informa buena salud demuestra que una solicitud particular completó todo el recorrido.”

“Durante esta sección vamos a investigar el mismo caso usando esas diferencias. Primero ubicaremos las herramientas, después seguiremos la información y finalmente practicaremos un diagnóstico.”

**Demostración:** Mostrar el caso ENVIADA con aviso ausente como escenario didáctico. No inventar un resultado observado.

**Pregunta al público:** ¿Qué sabemos realmente si solo vemos que la aplicación responde?

**Respuesta esperada:** Sabemos que respondió esa comprobación; falta verificar el recorrido de negocio.

**Transición:** Ubicaremos quién produce, transporta, guarda y presenta cada señal.

### 59 · Componentes y responsabilidades de observabilidad

**En pantalla**

| Componente | Responsabilidad | Situación actual |
| --- | --- | --- |
| Grafana | Consultar y visualizar | Incluido en Compose |
| Loki | Almacenar y consultar logs | Incluido en Compose |
| Promtail | Recoger logs de Docker | Configurado hacia Loki |
| Actuator | URLs de salud y métricas dentro de la aplicación | Configurado en ambos servicios |
| Micrometer | Registra mediciones e instrumenta trazas | Dependencias del proyecto |
| Prometheus | Recoger y almacenar métricas | Formato expuesto, servidor ausente |

**Guion del expositor**

“Vamos a separar las herramientas por responsabilidad. Grafana es donde consultamos y presentamos información. Loki es donde se reciben y consultan los logs. Promtail es el agente que recoge las fuentes de logs que le hayamos configurado y las envía a Loki.”

“Ahora miremos dentro de la aplicación Java. Actuator es un módulo de Spring Boot que ofrece información operativa mediante URLs. Micrometer permite instrumentar mediciones y contexto. Estas dos piezas forman parte de nuestras aplicaciones, no son contenedores adicionales de Grafana.”

“Prometheus cumple otra función: un servidor Prometheus consulta periódicamente métricas y conserva las series para analizarlas en el tiempo. Nuestra aplicación tiene una forma de exponer métricas compatible con Prometheus, pero el Compose actual no incluye ese servidor.”

“Por eso debemos distinguir herramienta disponible e integración terminada. En el proyecto tenemos Grafana, Loki y Promtail en Compose, y Actuator y Micrometer declarados en los servicios. La recolección histórica con Prometheus y un backend para explorar spans siguen pendientes. Grafana necesita que conectemos sus fuentes antes de mostrar esos datos.”

**Demostración:** Mostrar el mapa de observabilidad.md. Señalar qué vive dentro de la aplicación y qué es un proceso separado. Mencionar Promtail como agente heredado del laboratorio; su migración a Alloy es una propuesta, no una configuración aplicada.

**Pregunta al público:** ¿Instalar Grafana hace que aparezcan todos los servicios y sus métricas?

**Respuesta esperada:** No. Hay que producir, recoger y conectar las fuentes que alimentarán las consultas.

**Transición:** Primero recorreremos la ruta de logs que ya tiene configuración.

### 60 · Logs: aplicación, Promtail, Loki y Grafana

**En pantalla**

- Spring Boot escribe logs estructurados ECS en consola.
- Promtail recoge la salida de los contenedores Docker.
- system.log o syslog son logs del sistema, no configurados aquí.
- Loki recibe los logs con etiquetas de servicio.
- Grafana consulta Loki después de configurar la fuente.

**Guion del expositor**

“Cuando decimos logs estamos hablando de registros de hechos. Pueden venir de una aplicación, de un contenedor o del sistema operativo. Un archivo llamado system.log es un archivo de logs del sistema. No es una cosa adicional y separada de los logs.”

“Promtail puede recoger distintas fuentes si se configuran y tiene acceso. Leer un archivo, recibir mensajes mediante syslog y recoger salida de Docker son mecanismos diferentes. En ARKA-Lite está configurado el descubrimiento de contenedores Docker. No se montan archivos del sistema ni se configura un receptor syslog.”

“También hay una posible confusión con System.err. Esa instrucción Java escribe en la salida de error del proceso. Docker puede recoger esa salida, igual que recoge la salida estándar. System.err no significa escribir en un archivo system.log del equipo.”

“Sigamos el recorrido: Java escribe una línea, Docker recoge la salida del contenedor, Promtail la envía a Loki y Grafana consulta Loki cuando su fuente está configurada. La configuración agrega etiquetas como servicio, proyecto y contenedor. Estas etiquetas ayudan a seleccionar qué logs queremos revisar.”

**Demostración:** Abrir observabilidad/promtail.yaml y señalar docker_sd_configs y relabel_configs. Abrir los volúmenes de Promtail en compose.yaml: hay Docker socket y configuración, sin un directorio de logs del host.

**Pregunta al público:** ¿Dar acceso al Docker socket equivale a montar todos los archivos del sistema?

**Respuesta esperada:** No. Son accesos diferentes; leer archivos exige que sean accesibles y que su lectura esté configurada.

“Para que Loki reciba logs necesitamos un agente o cliente que los envíe y una configuración válida de recepción. En este proyecto lo hace Promtail. Actuator y health no son requisitos de Loki; pertenecen a la operación de la aplicación.”

**Transición:** Con la fuente conectada podemos investigar un evento concreto.

### 61 · Grafana Explore y consultas LogQL

**En pantalla**

```logql
{service="servicio-solicitudes"} |= "INC-002"
{service="servicio-notificaciones"} |= "INC-002"
```

**Guion del expositor**

“Grafana necesita saber dónde consultar. Para este camino agregamos una fuente de tipo Loki y la conectamos con el contenedor Loki. Como Grafana también está en Compose, usa la dirección interna http://loki:3100. Esa dirección se resuelve dentro de la red de contenedores.”

“Después entramos en Explore y seleccionamos la fuente. Antes de buscar el caso debemos revisar el intervalo de tiempo: un evento de hace una hora no aparecerá si estamos consultando solo los últimos cinco minutos.”

“La consulta empieza seleccionando el servicio. Luego filtramos por el texto del ID de solicitud o del evento. Si conocemos el eventoId podemos seguir los intentos del publicador y el consumo en notificaciones con el mismo identificador.”

“Si no aparecen resultados todavía no sabemos que el evento nunca ocurrió. Puede faltar la ingestión, estar mal el intervalo o no coincidir la etiqueta. Primero comprobamos la fuente y los logs de origen. Grafana presenta lo que su fuente puede devolver; no crea la evidencia que la aplicación nunca registró.”

**Demostración:** Usar {service="servicio-solicitudes"} |= "INC-002" y luego el UUID real. Repetir con servicio-notificaciones. Si el entorno no está disponible, mostrar las consultas como ejemplo, sin simular resultados.

**Pregunta al público:** ¿Buscar un traceId en Loki es lo mismo que abrir una traza con todos sus spans?

**Respuesta esperada:** No. Aquí buscamos líneas de logs; explorar spans requiere la instrumentación y el backend de trazas correspondientes.

**Transición:** Los logs dan detalle, mientras las métricas muestran comportamiento agregado.

### 62 · Métricas: Actuator, Micrometer y Prometheus

**En pantalla**

- Actuator vive dentro de cada aplicación Spring Boot.
- health es una URL de Actuator que informa su salud.
- Micrometer registra mediciones; Actuator las expone.
- Prometheus recoge métricas y Grafana las consulta: integración pendiente.

**Guion del expositor**

“Actuator es parte de nuestra aplicación Spring Boot. Nos ofrece rutas para consultar información operativa. Una de ellas es /actuator/health. Podemos abrirla directamente en el navegador, sin pasar por Grafana.”

“Una respuesta ilustrativa es status UP. Ese estado resume los indicadores que participan en esa consulta. No significa que todos los procesos de negocio hayan terminado ni que Grafana esté viendo todos los servicios. Una aplicación puede informar UP mientras tiene eventos pendientes de entregar.”

“Para las mediciones interviene Micrometer. Pensemos en un contador de peticiones o en la duración de una operación. Micrometer registra mediciones y Actuator permite exponer información. /actuator/metrics sirve para descubrir y consultar métricas de diagnóstico. /actuator/prometheus ofrece el formato que un servidor Prometheus puede recoger.”

“El recorrido habitual de métricas sería aplicación instrumentada, endpoint de exposición, servidor Prometheus que recoge y conserva series, y Grafana que consulta ese servidor. En nuestro Compose falta el servidor Prometheus. Exponer la URL no crea automáticamente un histórico.”

“También distinguimos health de los chequeos de Docker y Kubernetes. En este repositorio el healthcheck de notificaciones en Compose prueba su puerto TCP. Las readiness de aplicaciones en Kubernetes consultan sus rutas de negocio. No están llamando a Actuator health, aunque todas sean comprobaciones técnicas.”

**Demostración:** Mostrar, sin ejecutarlos durante la redacción, Invoke-RestMethod http://localhost:8080/actuator/health y /actuator/metrics. Dibujar por separado consulta inmediata de salud y recolección histórica de métricas. No prometer campos concretos ni componentes que no se hayan observado.

**Pregunta al público:** ¿Puede un servicio estar UP y no tener un aviso que existía antes de reiniciar?

**Respuesta esperada:** Sí. El estado de salud no conserva el texto; la persistencia de ese aviso se comprueba por separado.

**Transición:** Las métricas agregadas se complementan con contexto de una ejecución.

### 63 · Trazas y correlación del trabajo asíncrono

**En pantalla**

- traceId y spanId describen contexto de ejecución.
- solicitudId y eventoId identifican hechos del negocio.
- El cliente HTTP usa un RestClient.Builder administrado.
- El outbox actual no conserva el contexto de la petición original.

**Guion del expositor**

“Una traza ayuda a relacionar operaciones de una ejecución. Podemos imaginar un tramo para recibir HTTP y otros para llamadas instrumentadas. Cada tramo es un span y los identificadores permiten relacionarlos cuando el contexto se propaga correctamente.”

“En nuestro proyecto Micrometer Tracing usa el puente Brave y el cliente HTTP del publicador se crea con un builder administrado por Spring. Es una base para instrumentación; no demuestra por sí sola que tengamos todas las trazas almacenadas y listas para explorar.”

“Hay además una separación temporal importante. La petición del usuario guarda un evento y termina. El relevador trabaja después. Nuestro outbox conserva eventoId, pero no guarda el contexto de traza original. Por eso no vamos a prometer una única traza que una automáticamente al usuario con cada reintento posterior.”

“Para investigar este flujo, solicitudId identifica el trámite y eventoId identifica el hecho que se intenta entregar. Los logs pueden llevar también traceId y spanId cuando exista contexto. Son identidades que se complementan: no debemos sustituir el ID del evento por un traceId diferente en cada ejecución.”

**Demostración:** Señalar en el diagrama de secuencia el final de la petición y el inicio posterior del relevador. Marcar el backend de trazas como ausente, sin dibujar una exportación implementada.

**Pregunta al público:** ¿Por qué seguimos el mismo eventoId aunque cambie la ejecución que lo publica?

**Respuesta esperada:** Porque identifica el mismo hecho de negocio y debe mantenerse durante la reentrega.

“La instrumentación puede propagar contexto mediante headers HTTP, tanto en GET como en POST. El log no se transfiere como una línea en el header. Un ejemplo de estándar es traceparent de W3C, pero el formato realmente emitido depende de la configuración y debe verificarse. Nuestro evento viaja por POST; el outbox no conserva la traza de la petición original.”

**Transición:** Juntaremos estas señales con las consultas de estado de la sección de datos.

### 64 · Diagnóstico del aviso: una secuencia de evidencia

**En pantalla**

- Confirmar estado de la solicitud y pendiente del outbox.
- Buscar solicitudId y eventoId en publicador y receptor.
- Separar error HTTP, consumo duplicado y pérdida de texto.
- Comparar datos persistidos con logs y salud.

**Guion del expositor**

“Ahora volvamos al reclamo inicial. La solicitud aparece ENVIADA, pero no vemos el aviso. Primero consultamos la solicitud y su evento. Queremos saber qué UUID seguir y si el emisor todavía lo considera pendiente.”

“Si está pendiente, buscamos ese UUID en los logs de solicitudes. Podemos encontrar intentos y errores. Después lo buscamos en notificaciones para comprobar si hubo consumo u omisión por un ID conocido. Cuando una respuesta se pierde, es posible que el receptor haya procesado y que el emisor vuelva a entregar el mismo evento.”

“Si el receptor ya tiene el ID, consultamos el texto del aviso. En el diseño actual el ID está en PostgreSQL y el texto en memoria. Después de reiniciar podemos conservar el primero y perder el segundo. Repetir el ID no reconstruye ese texto porque el receptor lo reconoce como consumido.”

“La conclusión debe apoyarse en varias evidencias del mismo caso. Salud para comprobar disponibilidad técnica, logs para investigar intentos, y datos para confirmar el estado. No declaramos que el proceso terminó solo porque un tablero aparece verde.”

**Demostración:** Consultar las tablas y endpoints del laboratorio de datos-y-consistencia.md. Preparar de antemano el UUID y un registro antes y después del reinicio. Presentar las hipótesis como hipótesis hasta verificarlas.

**Pregunta al público:** ¿Qué dato permite distinguir un receptor que nunca consumió de uno que perdió el texto tras reiniciar?

**Respuesta esperada:** El registro persistente del eventoId, contrastado con el texto consultable y el momento del reinicio.

**Transición:** La observación de un caso orienta qué indicadores necesitamos instrumentar.

### 65 · Indicadores, alertas y límites de la implementación

**En pantalla**

- Propuesta: cantidad y antigüedad de eventos pendientes.
- Propuesta: fallos de publicación y consumo.
- Cada alerta necesita condición, responsable y acción.
- Verificar ingestión y consultas con fallos controlados.

**Guion del expositor**

“Un dashboard es útil cuando podemos explicar qué decisión tomaremos con cada panel. Ver volumen de peticiones ayuda a entender carga. Ver errores y duración ayuda a detectar degradación. Para nuestro caso también interesa saber si el trabajo pendiente se está acumulando.”

“Podemos proponer una medición de pendientes y otra de fallos de publicación. Pero debemos decir qué existe y qué falta. Hoy no hay un gauge de negocio implementado para el backlog. Tampoco tenemos fecha de creación del evento para medir su antigüedad: primero habría que guardar ese dato.”

“Una alerta necesita una condición y un responsable. No basta con recibir un correo que diga error. La persona debe saber cómo investigar el evento, qué dependencias revisar y cuándo escalar. También importa detectar que dejaron de llegar logs o métricas: la falta de señal puede ser un fallo de la observación.”

“Finalmente, no vamos a convertir cada UUID en una etiqueta de métricas o de streams de logs. Crecería el número de combinaciones con cada evento. Conservamos esos identificadores en el contexto o contenido de los registros para buscar casos concretos. El objetivo de esta sección es poder explicar qué pasó y qué acción corresponde, con evidencia.”

**Demostración:** Mostrar una propuesta textual de paneles y acciones, sin valores simulados presentados como mediciones. Cerrar con las preguntas de comprobación del material compartido.

**Pregunta al público:** ¿Qué deberíamos hacer antes de alertar por eventos pendientes durante demasiado tiempo?

**Respuesta esperada:** Registrar cuándo se crean, instrumentar la medición y acordar el umbral y procedimiento de respuesta.

“Un log útil explica qué pasó, qué servicio y caso están involucrados, cuándo, cuál era el destino y qué resultado tuvo. Cuando hay contexto se agregan identificadores de ejecución. Es un objetivo de registro uniforme: los mensajes actuales incluyen algunos IDs, pero no todos esos datos como campos estructurados en todos los caminos.”

**Transición:** Cierre: cada señal debe responder una pregunta y conducir a una acción comprobable.

Aclaraciones didácticas de la sección 9: [Promtail, logs del sistema, Actuator, health y Grafana](observabilidad.md#explicación-inicial-qué-es-cada-cosa).

Guion de ensayo completo de la sección: [texto para decir y demostraciones](guion-observabilidad.md).

Integración del feedback y explicación en dos niveles: [cobertura, correcciones y diagramas](feedback-integrado.md).

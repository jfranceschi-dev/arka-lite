# Componentes Java y ejecución

Esta guía explica cómo está organizado el código Java vigente de ARKA-Lite, qué responsabilidad tiene cada componente y cómo se ejecuta. Está dirigida a una persona que conoce programación básica, pero no necesariamente Spring Boot ni arquitectura hexagonal.

## Dos aplicaciones Java independientes

El repositorio contiene dos aplicaciones Spring Boot:

```text
servicio-solicitudes/
servicio-notificaciones/
```

Cada carpeta es un proyecto Maven completo con su propio `pom.xml`, código, pruebas, Maven Wrapper y Dockerfile. No forman un proyecto Maven multi módulo; se compilan desde la carpeta de cada microservicio.

Las clases principales son:

| Aplicación | Clase de arranque | Puerto local |
| --- | --- | --- |
| Solicitudes | `ServicioSolicitudesApplication` | `8080` |
| Notificaciones | `ServicioNotificacionesApplication` | `8081` al usar Compose; internamente escucha en `8080`. |

El monolito anterior y su clase `ArkaliteApplication` se retiraron del proyecto.

## Estructura estándar de cada servicio

```text
servicio-ejemplo/
├── pom.xml
├── mvnw y mvnw.cmd
└── src/
    ├── main/
    │   ├── java/        Código de la aplicación
    │   └── resources/   Configuración
    └── test/
        └── java/        Pruebas automatizadas
```

Maven compila `src/main/java`, copia `src/main/resources`, ejecuta las pruebas de `src/test/java` y genera el JAR en `target/`.

## Conceptos Java utilizados

| Elemento | Significado en este proyecto |
| --- | --- |
| `class` | Define comportamiento y estado, por ejemplo `ServicioDeSolicitudes`. |
| `record` | Representa datos inmutables con constructor y accesores generados, por ejemplo `Solicitud`. |
| `interface` | Declara una capacidad sin decidir su implementación, por ejemplo `RepositorioDeSolicitudes`. |
| `enum` | Limita un valor a opciones conocidas, como `BORRADOR` o `ENVIADA`. |
| Excepción | Interrumpe el flujo cuando una operación no es válida o no existe un recurso. |
| Paquete | Agrupa clases por responsabilidad y evita conflictos de nombres. |
| Anotación | Entrega metadata a Spring, por ejemplo `@RestController` o `@Bean`. |

Un `record` no significa que su contenido se guarde en una base de datos. Solo es una forma de declarar un objeto de datos en Java.

## Capas utilizadas

```text
Petición HTTP
     |
     v
adaptador de entrada (controller)
     |
     v
dominio (servicio, entidades y puertos)
     |
     v
adaptador de salida (JPA, memoria o cliente HTTP)
```

- El **dominio** contiene las reglas de negocio.
- Un **puerto** es una interfaz que expresa lo que el dominio necesita.
- Un **adaptador de entrada** permite que algo externo llame al dominio.
- Un **adaptador de salida** conecta el dominio con almacenamiento u otro servicio.
- La **configuración** crea y conecta los objetos.

Esta separación permite sustituir un repositorio en memoria por una base de datos sin cambiar las reglas de `Solicitud`.

Los paquetes siguen esa separación:

```text
pa.gob.dntic.servicio...
├── *Application.java       Arranque
├── dominio/                Entidades, reglas, servicios y puertos
├── adaptadores/
│   ├── entrada/            Controladores HTTP y manejo de errores
│   ├── salida/             Memoria, publicación y relevador de eventos
│   └── persistencia/       Entidades y repositorios JPA
├── config/                 Conexión de componentes, cuando aplica
└── eventos/                Contratos intercambiados entre servicios
```

## Anotaciones de Spring más importantes

| Anotación | Función |
| --- | --- |
| `@SpringBootApplication` | Marca el punto de arranque, activa autoconfiguración y busca componentes en sus subpaquetes. |
| `@RestController` | Registra una clase que recibe HTTP y devuelve datos serializados como JSON. |
| `@RequestMapping` | Define una ruta base para un controlador. |
| `@GetMapping` / `@PostMapping` | Asocian un método Java con una operación HTTP. |
| `@PathVariable` | Lee un valor incluido en la ruta, como `{id}`. |
| `@RequestBody` | Convierte el JSON recibido en un objeto Java. |
| `@Component` / `@Repository` | Registran una instancia administrada por Spring. |
| `@Configuration` | Declara una clase que crea y conecta componentes. |
| `@Bean` | Registra como componente el objeto devuelto por un método. |
| `@Primary` | Elige una implementación cuando existen varias para la misma interfaz. |
| `@Value` | Inyecta una propiedad de configuración. |
| `@RestControllerAdvice` | Centraliza la conversión de excepciones en respuestas HTTP. |
| `@ExceptionHandler` | Indica qué excepción maneja un método. |
| `@SpringBootTest` | Inicia el contexto de Spring durante una prueba. |

## Inyección por constructor

Los controladores y servicios reciben sus dependencias en el constructor:

```java
public SolicitudController(ServicioDeSolicitudes servicio) {
    this.servicio = servicio;
}
```

Spring encuentra una instancia compatible y la entrega al crear el controlador. Esto hace explícitas las dependencias y permite reemplazarlas en pruebas.

## Componentes de `servicio-solicitudes`

### Arranque y configuración

| Componente | Responsabilidad |
| --- | --- |
| `ServicioSolicitudesApplication` | Ejecuta `SpringApplication.run` y arranca Spring Boot. |
| `ConfiguracionDominio` | Crea `ServicioDeSolicitudes` mediante `@Bean`. |
| `ConfiguracionDominio.seed` | Ejecuta un `CommandLineRunner` después del arranque y carga datos de demostración. |
| `application.properties` | Configura PostgreSQL, inicialización SQL, URL de notificaciones y observabilidad. |

Al arrancar se crean estas solicitudes:

```text
INC-001 -> BORRADOR
CAM-002 -> ENVIADA
```

`CAM-002` se registra primero como borrador y luego se envía. Ese envío intenta crear una notificación en el otro microservicio.

### Dominio

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| `Solicitud` | `record` | Contiene `id`, `tipo` y `estado`; aplica las transiciones de estado. |
| `Estado` | `enum` | Define `BORRADOR`, `ENVIADA`, `APROBADA` y `RECHAZADA`. |
| `ServicioDeSolicitudes` | `class` | Coordina registro, búsqueda, envío, aprobación y rechazo. |
| `RepositorioDeSolicitudes` | `interface` | Puerto para guardar, buscar y listar solicitudes. |
| `PublicadorDeEventos` | `interface` | Puerto para avisar que una solicitud fue enviada. |
| `SolicitudNoEncontrada` | excepción | Representa la búsqueda de un identificador inexistente. |

Las transiciones permitidas por `Solicitud` son:

```text
BORRADOR -> ENVIADA -> APROBADA
                    -> RECHAZADA
```

Intentar enviar algo que no esté en `BORRADOR`, o aprobar/rechazar algo que no esté en `ENVIADA`, produce `IllegalStateException`.

### Adaptadores de entrada

| Componente | Responsabilidad |
| --- | --- |
| `SolicitudController` | Expone la API `/solicitudes` y delega en el servicio de dominio. |
| `ManejadorGlobalDeErrores` | Convierte `SolicitudNoEncontrada` en HTTP `404`. |
| `ErrorRespuesta` | Define el JSON `{estado, mensaje}` usado en ese error. |

`SolicitudController` no almacena datos. Por ejemplo, el método `enviar` toma el `id` de la ruta y llama a `servicio.enviar(id)`.

El endpoint `/solicitudes/crear` es demostrativo: siempre registra `INC-002` con tipo `Incidencia`. Todavía no recibe datos del usuario mediante `@RequestBody`.

`IllegalStateException` no tiene un manejador específico. Actualmente Spring la convierte en una respuesta de error del servidor.

### Adaptadores de salida

| Componente | Responsabilidad |
| --- | --- |
| `RepositorioJpa` | Adaptador activo, seleccionado con `@Primary`; persiste solicitudes en PostgreSQL. |
| `RepositorioQueRegistra` | Alternativa en memoria que registra cada guardado; no es el adaptador principal. |
| `RepositorioEnMemoria` | Segunda implementación del mismo puerto; existe como bean nombrado, pero no es la elegida para `ServicioDeSolicitudes`. |
| `PublicadorRest` | Implementa `PublicadorDeEventos` enviando un `POST` HTTP a notificaciones. |
| `SolicitudEnviada` | Contrato JSON con `eventoId`, `id` y `tipo`. |
| `RegistradorDeEventosJpa` | Guarda el evento pendiente en PostgreSQL. |
| `RelevadorDeEventosPendientes` | Consulta y publica eventos pendientes en segundo plano. |
| `PublicadorConReintento` | Publicador activo con `@Primary`; realiza hasta tres intentos HTTP. |

`RepositorioJpa` tiene `@Primary` entre las implementaciones de `RepositorioDeSolicitudes`. `PublicadorConReintento` es el publicador principal; `PublicadorRest` queda como alternativa. `OperacionEnviar` no participa en el flujo activo.

`PublicadorRest` lee esta propiedad:

```properties
notificaciones.url=${NOTIFICACIONES_URL:http://localhost:8081/eventos/solicitud-enviada}
```

Primero busca la variable `NOTIFICACIONES_URL`. Si no existe, usa la dirección local después de los dos puntos. Compose establece la variable con el nombre interno del servicio.

`ServicioDeSolicitudes.enviar` guarda el estado y el outbox en una misma transacción. El relevador publica en segundo plano con cinco segundos de espera entre ciclos. Si se agotan los tres intentos HTTP, el evento conserva `procesado=false` para otro ciclo; la solicitud ya está enviada.

## Componentes de `servicio-notificaciones`

### Arranque y configuración

| Componente | Responsabilidad |
| --- | --- |
| `ServicioNotificacionesApplication` | Arranca la segunda aplicación Spring Boot. |
| `ConfiguracionNotificaciones` | Crea `ServicioDeNotificaciones` y le inyecta el repositorio. |
| `application.properties` | Configura nombre, PostgreSQL, Hibernate y observabilidad. |

### Dominio

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| `Notificacion` | `record` | Contiene el texto de una notificación. |
| `ServicioDeNotificaciones` | `class` | Convierte `SolicitudEnviada` en una `Notificacion` y permite listarlas. |
| `RepositorioDeNotificaciones` | `interface` | Puerto para guardar y listar notificaciones. |
| `RepositorioEnMemoria` | adaptador | Guarda notificaciones en una lista mientras la JVM está activa. |
| `SolicitudEnviada` | `record` | Representa el JSON recibido desde solicitudes. |

El contrato `SolicitudEnviada` aparece una vez en cada microservicio. No comparten una clase Java: comparten la forma del JSON.

`EventoController` delega en `ConsumoIdempotente`, que consulta `EventoProcesadoRepository` antes de llamar al dominio y registra el `eventoId` procesado. `Estado`, `NotificacionNoEncontrada` y `ErrorRespuesta` no participan en este flujo.

### Adaptadores de entrada

| Componente | Ruta | Responsabilidad |
| --- | --- | --- |
| `EventoController` | `POST /eventos/solicitud-enviada` | Convierte el JSON y lo entrega a `ConsumoIdempotente`. |
| `EventoController` | `GET /eventos/procesados` | Lista los identificadores persistidos. |
| `NotificacionController` | `GET /notificaciones` | Devuelve todas las notificaciones guardadas. |

## Cómo inicia Spring

Cuando se ejecuta una clase `*Application`, ocurre este proceso simplificado:

1. Java entra en el método `main`.
2. `SpringApplication.run` crea el contexto de la aplicación.
3. `@SpringBootApplication` busca componentes dentro del paquete base y sus subpaquetes.
4. Spring registra controladores, repositorios, componentes y configuraciones.
5. Los métodos `@Bean` crean los servicios de dominio.
6. Spring resuelve dependencias por constructor.
7. Se inicia el servidor HTTP incorporado.
8. En solicitudes, `CommandLineRunner` carga los datos de ejemplo y envía `CAM-002`.

Por eso conviene iniciar notificaciones antes que solicitudes cuando se ejecutan manualmente. En Compose, `depends_on` espera el estado saludable de notificaciones.

## Flujo de creación de una solicitud

```text
POST /solicitudes/crear
        |
        v
SolicitudController.crearNueva
        |
        v
ServicioDeSolicitudes.registrar
        |
        v
RepositorioJpa.guardar
```

La respuesta es un JSON similar a:

```json
{
  "id": "INC-002",
  "tipo": "Incidencia",
  "estado": "BORRADOR"
}
```

## Flujo entre los dos microservicios

1. `SolicitudController.enviar` llama a `ServicioDeSolicitudes.enviar`.
2. Una transacción guarda la solicitud enviada con `RepositorioJpa` y el evento con `RegistradorDeEventosJpa`.
3. La API responde sin esperar la entrega HTTP.
4. `RelevadorDeEventosPendientes` consulta el outbox y llama a `PublicadorConReintento`.
5. El POST contiene `eventoId`, `id` y `tipo`. Actualmente el outbox usa `SolicitudEnviada` como tipo del evento.
6. `EventoController` llama a `ConsumoIdempotente`, que comprueba el identificador, crea el aviso en memoria y registra el identificador en PostgreSQL.
7. Cuando el POST termina correctamente, el relevador marca el evento como procesado. Si falla, vuelve a intentarlo en ciclos posteriores.

## Persistencia y ciclo de vida

- Solicitudes y eventos pendientes viven en PostgreSQL mediante JPA.
- Notificaciones guarda los identificadores procesados en su propia base, pero los textos de los avisos siguen en memoria.
- Reiniciar notificaciones borra los textos; reenviar un identificador ya procesado no los reconstruye.
- La comprobación de duplicados no constituye una garantía de procesamiento exactamente una vez ante concurrencia o fallos entre la memoria y la base.
- El arranque de solicitudes vuelve a registrar `INC-001` y `CAM-002` y envía esta última: puede sobrescribir el estado de esos datos de demostración y generar otro evento.
- Solicitudes inicializa `schema.sql` y valida con Hibernate; notificaciones usa `ddl-auto=update`. No hay migraciones versionadas.
- Compose no declara volúmenes persistentes propios para las bases. Los manifiestos Kubernetes sí incluyen PVC.

## Dependencias y compilación Maven

Cada `pom.xml` declara Java 26, Spring Boot 4.1.1 y el plugin `spring-boot-maven-plugin`.

| Dependencia | Servicio | Función |
| --- | --- | --- |
| `spring-boot-starter-webmvc` | Ambos | Servidor HTTP, controladores, conversión JSON y cliente `RestClient`. |
| `springdoc-openapi-starter-webmvc-ui` | Ambos | Genera OpenAPI y Swagger UI. |
| `spring-boot-starter-test` | Ambos, alcance de prueba | JUnit, Mockito y soporte de pruebas Spring. |
| `spring-boot-starter-data-jpa` y `postgresql` | Ambos | Persistencia y conexión a PostgreSQL. |
| `spring-boot-starter-actuator` | Ambos | Salud y métricas. |
| `micrometer-tracing-bridge-brave` y `micrometer-registry-prometheus` | Ambos | Trazas y exportación de métricas. |
| `spring-boot-starter-restclient` | Solicitudes | Cliente HTTP. |

El Maven Wrapper (`mvnw` o `mvnw.cmd`) descarga y ejecuta la versión Maven configurada por el proyecto. `spring-boot-maven-plugin` vuelve ejecutable el JAR producido por `package`.

## Ejecutar con Docker Compose

Es la opción recomendada para alguien que quiere probar el sistema completo sin configurar Java localmente.

Desde la raíz:

```powershell
docker compose up --build -d
docker compose ps
docker compose logs -f
```

Compose construye los dos JAR dentro de imágenes separadas, crea una red e inicia notificaciones antes de solicitudes.

Después de completar el arranque existen `INC-001` y `CAM-002`. La notificación inicial aparece cuando el relevador entrega el evento. Si una consulta no muestra el aviso, repítela tras unos segundos; lo mismo aplica al enviar `INC-002`.

```powershell
Invoke-RestMethod http://localhost:8080/solicitudes
Invoke-RestMethod http://localhost:8081/notificaciones
```

Probar una solicitud adicional:

```powershell
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/crear
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/INC-002/enviar
Invoke-RestMethod http://localhost:8081/notificaciones
```

Detener:

```powershell
docker compose down
```

Consultar [Docker y Docker Compose](../operaciones/docker-y-compose.md) para comprender las imágenes, puertos, red y diagnóstico.

## Ejecutar desde Maven

Se necesita JDK 26, las [bases de datos locales](../inicio/bases-de-datos-locales.md) y dos terminales. Las mismas bases se requieren al ejecutar un JAR o desde el IDE. Ambas aplicaciones usan el puerto 8080 de forma predeterminada fuera de Compose, por lo que notificaciones se inicia explícitamente en 8081.

Primero notificaciones:

```powershell
cd servicio-notificaciones
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

La terminal de solicitudes puede usar su configuración predeterminada:

```powershell
cd servicio-solicitudes
.\mvnw.cmd spring-boot:run
```

`NOTIFICACIONES_URL` ya usa `localhost:8081` como valor predeterminado.

## Construir y ejecutar los JAR

Construir cada servicio:

```powershell
Push-Location servicio-notificaciones
.\mvnw.cmd clean package
Pop-Location

Push-Location servicio-solicitudes
.\mvnw.cmd clean package
Pop-Location
```

Ejecutar notificaciones desde su carpeta:

```powershell
$jar = Get-ChildItem .\target\*.jar | Where-Object Name -NotLike '*.original' | Select-Object -First 1
java -jar $jar.FullName --server.port=8081
```

En otra terminal, ejecutar solicitudes desde su carpeta:

```powershell
$jar = Get-ChildItem .\target\*.jar | Where-Object Name -NotLike '*.original' | Select-Object -First 1
java -jar $jar.FullName
```

El plugin de Spring Boot genera un JAR ejecutable que contiene la aplicación y referencia sus dependencias empaquetadas.

## Ejecutar desde el IDE

Importar estos dos archivos como proyectos Maven:

```text
servicio-solicitudes/pom.xml
servicio-notificaciones/pom.xml
```

Crear una configuración para cada clase:

```text
pa.gob.dntic.serviciosolicitudes.ServicioSolicitudesApplication
pa.gob.dntic.servicionotificaciones.ServicioNotificacionesApplication
```

En la configuración de notificaciones agregar el argumento:

```text
--server.port=8081
```

Después iniciar notificaciones y solicitudes. En modo **Debug** se puede colocar un breakpoint en `ServicioDeSolicitudes.enviar`, `PublicadorConReintento.publicar` y `EventoController.recibir` para observar el salto entre procesos.

## Ejecutar pruebas

Desde la raíz:

```powershell
Push-Location servicio-solicitudes
.\mvnw.cmd clean verify
Pop-Location

Push-Location servicio-notificaciones
.\mvnw.cmd clean verify
Pop-Location
```

Hay pruebas de dominio, controladores y repositorios en memoria. Las clases `*ApplicationTests` construyen componentes con repositorios en memoria y dobles de prueba; no son pruebas `contextLoads` ni acreditan el arranque con PostgreSQL. El workflow comprueba por separado el arranque real de solicitudes con una base PostgreSQL.

Para ejecutar una prueba concreta:

```powershell
cd servicio-solicitudes
.\mvnw.cmd test "-Dtest=ServicioSolicitudesApplicationTests"
```

## Orden recomendado para estudiar el código

1. `ServicioSolicitudesApplication` para ver el arranque.
2. `SolicitudController` para conocer la API.
3. `Solicitud` y `ServicioDeSolicitudes` para entender las reglas.
4. `RepositorioDeSolicitudes` y sus implementaciones para entender puertos y adaptadores.
5. `PublicadorRest` y los dos `SolicitudEnviada` para seguir la comunicación.
6. `EventoController` y `ServicioDeNotificaciones` para ver cómo se consume el evento.
7. Las clases `Configuracion*` para comprender cómo Spring conecta todo.
8. `application.properties` y `compose.yaml` para relacionar Java con la configuración de ejecución.

## Problemas frecuentes

| Síntoma | Causa probable |
| --- | --- |
| Un servicio indica que el puerto 8080 está ocupado | Los dos se iniciaron localmente sin cambiar notificaciones a 8081. |
| Solicitudes arranca, pero no crea la notificación inicial | Notificaciones no estaba disponible o `NOTIFICACIONES_URL` apunta a otra dirección. |
| Spring encuentra dos repositorios de solicitudes | `RepositorioJpa` debe conservar `@Primary` o se debe seleccionar un bean explícitamente. |
| Un identificador inexistente devuelve 404 | Es el comportamiento de `SolicitudNoEncontrada` y `ManejadorGlobalDeErrores`. |
| Una transición inválida devuelve error del servidor | `Solicitud` lanza `IllegalStateException` y todavía no existe un manejador HTTP específico. |
| Los datos desaparecen | Los avisos están en memoria; para solicitudes y eventos, revisar la base conectada y la conservación de sus datos. |

Para instalación detallada, variables y depuración remota, consultar [Instalación del entorno y depuración](../inicio/instalacion-y-debug.md).

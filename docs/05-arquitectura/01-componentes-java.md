# Componentes Java y ejecución

Esta guía explica cómo está organizado el código Java vigente de ARKA-Lite, qué responsabilidad tiene cada componente y cómo se ejecuta. Está dirigida a una persona que conoce programación básica, pero no necesariamente Spring Boot ni arquitectura hexagonal.

## Dos aplicaciones Java independientes

El repositorio contiene dos aplicaciones Spring Boot:

```text
servicio-solicitudes/
servicio-notificaciones/
```

Cada carpeta es un proyecto Maven completo con su propio `pom.xml`, código, pruebas, Maven Wrapper y Dockerfile. No forman un proyecto Maven multi módulo y no se compilan desde el `pom.xml` de la raíz.

Las clases principales son:

| Aplicación | Clase de arranque | Puerto local |
| --- | --- | --- |
| Solicitudes | `ServicioSolicitudesApplication` | `8080` |
| Notificaciones | `ServicioNotificacionesApplication` | `8081` al usar Compose; internamente escucha en `8080`. |

La clase `ArkaliteApplication` ubicada en el `src/` de la raíz pertenece al monolito anterior y no participa en la ejecución vigente.

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
adaptador de salida (memoria o cliente HTTP)
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
│   └── salida/             Memoria y comunicación con otros servicios
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
| `ConfiguracionDominio.datosDeEjemplo` | Ejecuta un `CommandLineRunner` después del arranque y carga datos de demostración. |
| `application.properties` | Define el nombre del servicio y la URL de notificaciones. |

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
| `RepositorioQueRegistra` | Implementación en memoria seleccionada mediante `@Primary`; además escribe cada guardado en la salida estándar. |
| `RepositorioEnMemoria` | Segunda implementación del mismo puerto; existe como bean nombrado, pero no es la elegida para `ServicioDeSolicitudes`. |
| `PublicadorRest` | Implementa `PublicadorDeEventos` enviando un `POST` HTTP a notificaciones. |
| `SolicitudEnviada` | `record` que se serializa como JSON con `id` y `tipo`. |

Como hay dos implementaciones de `RepositorioDeSolicitudes`, `@Primary` indica a Spring que debe inyectar `RepositorioQueRegistra`.

`PublicadorRest` lee esta propiedad:

```properties
notificaciones.url=${NOTIFICACIONES_URL:http://localhost:8081/eventos/solicitud-enviada}
```

Primero busca la variable `NOTIFICACIONES_URL`. Si no existe, usa la dirección local después de los dos puntos. Compose establece la variable con el nombre interno del servicio.

El publicador captura errores de red. La solicitud permanece enviada aunque notificaciones no responda.

## Componentes de `servicio-notificaciones`

### Arranque y configuración

| Componente | Responsabilidad |
| --- | --- |
| `ServicioNotificacionesApplication` | Arranca la segunda aplicación Spring Boot. |
| `ConfiguracionNotificaciones` | Crea `ServicioDeNotificaciones` y le inyecta el repositorio. |
| `application.properties` | Define `spring.application.name=servicio-notificaciones`. |

### Dominio

| Componente | Tipo | Responsabilidad |
| --- | --- | --- |
| `Notificacion` | `record` | Contiene el texto de una notificación. |
| `ServicioDeNotificaciones` | `class` | Convierte `SolicitudEnviada` en una `Notificacion` y permite listarlas. |
| `RepositorioDeNotificaciones` | `interface` | Puerto para guardar y listar notificaciones. |
| `RepositorioEnMemoria` | adaptador | Guarda notificaciones en una lista mientras la JVM está activa. |
| `SolicitudEnviada` | `record` | Representa el JSON recibido desde solicitudes. |

El contrato `SolicitudEnviada` aparece una vez en cada microservicio. No comparten una clase Java: comparten la forma del JSON.

El servicio de notificaciones también contiene `Estado`, `NotificacionNoEncontrada`, `ErrorRespuesta` y `ManejadorDeEventos`. Actualmente no participan en el flujo HTTP: `EventoController` llama directamente a `ServicioDeNotificaciones`, y `ManejadorDeEventos` no está registrado como componente Spring.

### Adaptadores de entrada

| Componente | Ruta | Responsabilidad |
| --- | --- | --- |
| `EventoController` | `POST /eventos/solicitud-enviada` | Convierte el JSON en `SolicitudEnviada` y lo entrega al dominio. |
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
RepositorioQueRegistra.guardar
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

```text
POST /solicitudes/INC-002/enviar
        |
        v
SolicitudController.enviar
        |
        v
ServicioDeSolicitudes.enviar
        | actualiza el repositorio
        v
PublicadorRest.publicar
        | POST con {"id":"INC-002","tipo":"Incidencia"}
        v
EventoController.recibir
        |
        v
ServicioDeNotificaciones.alRecibirSolicitudEnviada
        |
        v
RepositorioEnMemoria.guardar
```

La respuesta de solicitudes y la recepción en notificaciones ocurren en procesos Java diferentes conectados por HTTP.

## Persistencia y ciclo de vida

Los repositorios actuales usan `Map` y `List` en memoria:

- Los datos existen solo dentro de la JVM que los creó.
- Cada microservicio tiene su propia memoria.
- Reiniciar la aplicación elimina sus datos.
- Ejecutar varias réplicas crearía almacenes independientes.
- No existen archivos de datos, base de datos ni migraciones.

## Dependencias y compilación Maven

Cada `pom.xml` declara Java 26, Spring Boot 4.1.1 y el plugin `spring-boot-maven-plugin`.

| Dependencia | Servicio | Función |
| --- | --- | --- |
| `spring-boot-starter-webmvc` | Ambos | Servidor HTTP, controladores, conversión JSON y cliente `RestClient`. |
| `springdoc-openapi-starter-webmvc-ui` | Ambos | Genera OpenAPI y Swagger UI. |
| `spring-boot-starter-webmvc-test` | Ambos, alcance de prueba | Proporciona JUnit y soporte de pruebas para Spring MVC. |

El Maven Wrapper (`mvnw` o `mvnw.cmd`) descarga y ejecuta la versión Maven configurada por el proyecto. `spring-boot-maven-plugin` vuelve ejecutable el JAR producido por `package`.

## Relación con la ejecución

Las mismas clases se ejecutan en procesos distintos al usar Maven, Compose o Kubernetes. Los comandos y puertos de cada entorno están en [uso y operación](../06-uso/README.md); el diseño de dependencias y flujo se resume en [los diagramas](02-diagramas.md).

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
| Spring encuentra dos repositorios de solicitudes | `RepositorioQueRegistra` debe conservar `@Primary` o se debe seleccionar un bean explícitamente. |
| Un identificador inexistente devuelve 404 | Es el comportamiento de `SolicitudNoEncontrada` y `ManejadorGlobalDeErrores`. |
| Una transición inválida devuelve error del servidor | `Solicitud` lanza `IllegalStateException` y todavía no existe un manejador HTTP específico. |
| Los datos desaparecen | Los repositorios actuales solo viven en memoria. |

Para instalación y ejecución local, consulte [configuración inicial](../01-configuracion/README.md) y [ejecución y depuración](../06-uso/01-ejecucion-y-depuracion.md).

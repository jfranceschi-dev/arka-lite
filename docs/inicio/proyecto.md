# ARKA-Lite

## Qué es el proyecto

ARKA-Lite es una aplicación de ejemplo para gestionar solicitudes y generar una notificación cuando una solicitud se envía. La versión vigente está dividida en dos microservicios independientes que se comunican por HTTP.

| Microservicio | Responsabilidad | Puerto local con Compose |
| --- | --- | --- |
| `servicio-solicitudes` | Crear, consultar, enviar, aprobar y rechazar solicitudes. | `8080` |
| `servicio-notificaciones` | Recibir el evento de una solicitud enviada y guardar la notificación. | `8081` |

Cada microservicio tiene su propio código, `pom.xml`, Maven Wrapper, pruebas y `Dockerfile`. Se puede compilar, probar y ejecutar uno sin compilar el otro.

## Qué archivos están vigentes

La ejecución vigente parte de estas rutas:

```text
.
├── compose.yaml
├── servicio-solicitudes/
│   ├── src/main/ y src/test/
│   ├── pom.xml
│   ├── mvnw y mvnw.cmd
│   └── Dockerfile
├── servicio-notificaciones/
│   ├── src/main/ y src/test/
│   ├── pom.xml
│   ├── mvnw y mvnw.cmd
│   └── Dockerfile
└── docs/
```

Los archivos del monolito anterior se retiraron de la raíz. Cada microservicio conserva su propio `pom.xml` y Maven Wrapper; los comandos de esta documentación indican la carpeta del microservicio o utilizan Docker Compose desde la raíz.

## Tecnología actual

- Java 26.
- Spring Boot 4.1.1.
- Maven 3.9.16 mediante Maven Wrapper.
- Spring Web MVC para las API HTTP.
- Springdoc OpenAPI (Swagger UI) en ambos servicios.
- JUnit mediante el starter de pruebas de Spring Boot.
- Docker con compilación de varias etapas.
- Docker Compose para ejecutar ambos servicios y su red.

Las versiones efectivas están en el `pom.xml` de cada microservicio y en sus `Dockerfile`.

Para recorrer las clases y entender cómo Spring conecta controladores, dominio y adaptadores, consultar [Componentes Java y ejecución](../arquitectura/componentes-java.md).

## Arquitectura y comunicación

Los dos servicios conservan una separación inspirada en arquitectura hexagonal:

- `dominio`: reglas, entidades y puertos; no conoce detalles HTTP ni almacenamiento.
- `adaptadores/entrada`: controladores que traducen peticiones HTTP hacia el dominio.
- `adaptadores/salida`: repositorios de demostración, cliente HTTP y relevador de eventos.
- `adaptadores/persistencia`: solicitudes, eventos salientes y registro de eventos procesados mediante JPA y PostgreSQL.
- `config`: conecta las interfaces del dominio con sus implementaciones.

El flujo de una solicitud enviada es:

```text
Cliente
   |
   | POST /solicitudes/{id}/enviar
   v
servicio-solicitudes
   |
   | POST /eventos/solicitud-enviada
   v
servicio-notificaciones
```

Dentro de Compose, solicitudes usa la dirección `http://servicio-notificaciones:8080`. El nombre `servicio-notificaciones` funciona como nombre DNS dentro de la red privada de Compose. Desde la computadora se accede al mismo servicio mediante `http://localhost:8081`.

La URL se configura con `NOTIFICACIONES_URL`. Fuera de Docker su valor predeterminado es:

```text
http://localhost:8081/eventos/solicitud-enviada
```

El envío guarda la solicitud y un evento pendiente en una misma transacción. Un relevador consulta los eventos pendientes con una pausa de cinco segundos entre ciclos y los publica por HTTP. El publicador realiza hasta tres intentos; si falla, el evento queda pendiente para otro ciclo. La notificación puede aparecer después de responder la API. El consumidor comprueba `eventoId` en PostgreSQL para ignorar eventos ya procesados.

## API actual

### Servicio de solicitudes: `http://localhost:8080`

| Método | Ruta | Resultado |
| --- | --- | --- |
| `GET` | `/solicitudes` | Lista todas las solicitudes. |
| `GET` | `/solicitudes/{id}` | Busca una solicitud por identificador. |
| `POST` | `/solicitudes/crear` | Crea la solicitud fija `INC-002` en estado `BORRADOR`. |
| `POST` | `/solicitudes/{id}/enviar` | Cambia la solicitud a `ENVIADA` y registra un evento para entrega posterior. |
| `POST` | `/solicitudes/{id}/aprobar` | Aprueba la solicitud cuando su estado lo permite. |
| `POST` | `/solicitudes/{id}/rechazar` | Rechaza la solicitud cuando su estado lo permite. |

Swagger UI está disponible en `http://localhost:8080/swagger-ui/index.html` y OpenAPI JSON en `http://localhost:8080/v3/api-docs`.

### Servicio de notificaciones: `http://localhost:8081`

| Método | Ruta | Resultado |
| --- | --- | --- |
| `POST` | `/eventos/solicitud-enviada` | Recibe el evento enviado por solicitudes. |
| `GET` | `/notificaciones` | Lista las notificaciones en memoria. |
| `GET` | `/eventos/procesados` | Lista los identificadores de eventos procesados persistidos. |

Swagger UI está disponible en `http://localhost:8081/swagger-ui/index.html` y OpenAPI JSON en `http://localhost:8081/v3/api-docs`.

El endpoint de eventos es parte de la comunicación interna. Normalmente un usuario no lo llama directamente.

## Ejecutar el flujo completo

Espera a que las aplicaciones estén saludables antes de probar la API. La notificación llega de forma asíncrona: si la consulta inicial no la muestra, repítela tras unos segundos. Un HTTP exitoso de envío confirma el registro del evento, no su entrega.

Desde la raíz del repositorio:

```powershell
docker compose up --build -d
docker compose ps

# El arranque carga INC-001 y CAM-002; CAM-002 se envía automáticamente
Invoke-RestMethod http://localhost:8080/solicitudes
Invoke-RestMethod http://localhost:8081/notificaciones

# Crear y enviar una solicitud
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/crear
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/INC-002/enviar

# Comprobar la notificación producida por el segundo servicio
Invoke-RestMethod http://localhost:8081/notificaciones

# Ver registros y detener la solución
docker compose logs
docker compose down
```

Consultar la [guía de Docker y Compose](../operaciones/docker-y-compose.md) para entender cada archivo y el ciclo de trabajo completo.

## Compilar y probar sin Docker

En PowerShell, desde la raíz:

```powershell
Push-Location servicio-solicitudes
.\mvnw.cmd clean verify
Pop-Location

Push-Location servicio-notificaciones
.\mvnw.cmd clean verify
Pop-Location
```

`verify` compila el código, ejecuta las pruebas y comprueba el paquete. Para ejecutar solamente las pruebas se reemplaza `clean verify` por `test`.

En Linux o macOS se usa `./mvnw` en lugar de `.\mvnw.cmd`.

## Ejecutar sin Docker

Primero prepara las [bases de datos locales](bases-de-datos-locales.md). Se necesitan dos terminales para Java.

Terminal 1:

```powershell
cd servicio-notificaciones
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

Terminal 2:

```powershell
cd servicio-solicitudes
.\mvnw.cmd spring-boot:run
```

Ambas aplicaciones escuchan en 8080 de forma predeterminada. Por eso notificaciones se inicia en 8081 y el valor predeterminado de `NOTIFICACIONES_URL` ya apunta a ese puerto. Si se cambia a 9091, también se debe cambiar la variable antes de iniciar solicitudes:

```powershell
$env:NOTIFICACIONES_URL = "http://localhost:9091/eventos/solicitud-enviada"
.\mvnw.cmd spring-boot:run
```

## Estado y limitaciones actuales

- Solicitudes y eventos salientes se guardan en PostgreSQL. Los textos de notificaciones siguen en memoria y se pierden al reiniciar ese servicio; los identificadores procesados permanecen en su base, por lo que repetir un evento no recupera el texto perdido.
- La creación usa valores fijos y no recibe un cuerpo enviado por el cliente.
- No hay autenticación ni autorización.
- Hay dos bases PostgreSQL; no hay migraciones versionadas. Compose no declara volúmenes de datos administrados por el proyecto, por lo que no debe usarse la recreación de contenedores como estrategia de conservación.
- La entrega HTTP es asíncrona mediante una tabla de eventos pendientes (outbox), con reintentos. No hay un broker de mensajes ni garantía de procesamiento exactamente una vez.
- El servicio de solicitudes continúa si falla la llamada de notificación.
- Hay Actuator, métricas Prometheus, trazas y logs ECS. Compose incluye Loki, Promtail y Grafana; no incluye un servidor Prometheus ni aprovisiona una fuente Loki en Grafana.

Estas restricciones son adecuadas para el laboratorio actual y deben resolverse antes de una puesta en producción.

# 04 · Qué es ARKA-Lite

ARKA-Lite es un laboratorio para gestionar solicitudes y producir una notificación al enviarlas. La solución vigente está formada por **dos microservicios Spring Boot** que se comunican mediante HTTP. No hay base de datos, cola de eventos ni despliegue productivo incluido.

| Servicio | Responsabilidad | Acceso con Compose |
| --- | --- | --- |
| `servicio-solicitudes` | Crear, consultar, enviar, aprobar y rechazar solicitudes. | `http://localhost:8080` |
| `servicio-notificaciones` | Recibir el aviso de envío y listar las notificaciones generadas. | `http://localhost:8081` |

## Qué código se utiliza

```text
arka-lite/
├── servicio-solicitudes/       Aplicación, pom.xml, pruebas y Dockerfile
├── servicio-notificaciones/    Aplicación, pom.xml, pruebas y Dockerfile
├── compose.yaml                Ejecución conjunta en Docker
├── k8s/                        Deployments y Services locales
├── .github/workflows/ci.yml    Pipeline activo
└── docs/                       Estas guías
```

El `pom.xml`, `src/` y Maven Wrapper de la **raíz** pertenecen al monolito anterior. Los servicios vigentes no son módulos de ese proyecto raíz: cada uno tiene su propio `pom.xml` y Wrapper. Los comandos nuevos deben usar la carpeta del servicio correspondiente o Compose.

Los `pom.xml` vigentes declaran Java 26 y Spring Boot 4.1.1. Sus Dockerfile compilan con Maven y Temurin 26 y ejecutan el JAR sobre Temurin 26 JRE. El [pipeline activo](../08-automatizacion/01-pipeline-actual.md) prueba los dos servicios y publica imágenes en GHCR.

## Cómo funciona una solicitud

Al arrancar, solicitudes registra `INC-001` como `BORRADOR`, `CAM-002` como `BORRADOR` y envía `CAM-002`, que queda `ENVIADA`. Ese envío intenta crear una notificación en el otro servicio. La ruta `POST /solicitudes/crear` crea siempre `INC-002` como `BORRADOR`; no recibe un cuerpo del cliente.

Una solicitud en `BORRADOR` puede pasar a `ENVIADA`. Una `ENVIADA` puede pasar a `APROBADA` o `RECHAZADA`. El envío guarda el nuevo estado **antes** de avisar a notificaciones. Si la comunicación falla, el estado no se revierte y no hay reintento. Consulte los [diagramas de arquitectura](../05-arquitectura/02-diagramas.md) para seguir cada paso.

## API vigente

### Solicitudes

| Método | Ruta | Resultado |
| --- | --- | --- |
| `GET` | `/solicitudes` | Lista las solicitudes. |
| `GET` | `/solicitudes/{id}` | Busca una por ID; si no existe, devuelve 404. |
| `POST` | `/solicitudes/crear` | Crea o reemplaza `INC-002` en `BORRADOR`. |
| `POST` | `/solicitudes/{id}/enviar` | Cambia `BORRADOR` a `ENVIADA` e intenta notificar. |
| `POST` | `/solicitudes/{id}/aprobar` | Cambia `ENVIADA` a `APROBADA`. |
| `POST` | `/solicitudes/{id}/rechazar` | Cambia `ENVIADA` a `RECHAZADA`. |

### Notificaciones

| Método | Ruta | Resultado |
| --- | --- | --- |
| `POST` | `/eventos/solicitud-enviada` | Recibe el JSON interno `{ "id": "...", "tipo": "..." }`. |
| `GET` | `/notificaciones` | Lista las notificaciones almacenadas. |

Con Compose, Swagger UI está en `http://localhost:8080/swagger-ui/index.html` y `http://localhost:8081/swagger-ui/index.html`; el JSON OpenAPI usa `/v3/api-docs` en cada puerto. El endpoint de eventos está destinado a la comunicación entre servicios.

## Primera prueba

Después de la [configuración inicial](../01-configuracion/README.md), ejecute [Compose](../06-uso/02-docker-y-compose.md) o [Maven](../06-uso/01-ejecucion-y-depuracion.md). Con Compose activo:

```powershell
Invoke-RestMethod http://localhost:8080/solicitudes
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/crear
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/INC-002/enviar
Invoke-RestMethod http://localhost:8081/notificaciones
```

## Límites actuales

- Los repositorios son de memoria: sus datos desaparecen al reiniciar cada proceso y no se comparten entre réplicas.
- No hay autenticación, autorización, base de datos ni migraciones.
- La creación de solicitudes usa valores fijos; repetirla sobrescribe `INC-002`.
- La notificación usa un POST HTTP síncrono sin reintentos ni garantía de entrega.
- El proyecto no incluye certificados HTTPS ni Ingress; [HTTPS es una ampliación opcional](../06-uso/07-https-y-certificados.md).
- Los cambios de estado inválidos lanzan `IllegalStateException` sin un manejador HTTP específico.

Para entender clases, puertos y adaptadores, continúe con [Arquitectura](../05-arquitectura/02-diagramas.md). Para ejecutar o desplegar, vaya a [Uso](../06-uso/README.md).

# Imágenes, etiquetas y puertos

## Construir una imagen de cada servicio

Desde la raíz, use como contexto la carpeta del servicio que contiene su Dockerfile y su `pom.xml`:

```powershell
docker build -t servicio-solicitudes:local .\servicio-solicitudes
docker build -t servicio-notificaciones:local .\servicio-notificaciones
docker image ls servicio-solicitudes
docker image ls servicio-notificaciones
```

`local` es la etiqueta elegida para los manifiestos actuales de Kubernetes. Una etiqueta identifica una imagen; no cambia el nombre de la aplicación ni sus puertos. Para otra versión, construya con otra etiqueta, por ejemplo `servicio-solicitudes:prueba-1`, y use **esa misma referencia** al ejecutar el contenedor o en el `image:` del Deployment. Evite `latest` para distinguir versiones. Si el pod ya existe, cargue la nueva imagen en el clúster y actualice el Deployment; [Kubernetes local](04-kubernetes-local.md) detalla el procedimiento.

Compose construye automáticamente sus imágenes con nombres derivados del nombre del proyecto y del servicio. No suponga un nombre fijo: inspeccione `docker compose images`. Las imágenes que publica el [pipeline](../08-automatizacion/01-pipeline-actual.md) usan `ghcr.io/...:<SHA>` y no se consumen automáticamente en Compose o Kubernetes local.

## Tres puertos diferentes

| Entorno | Solicitudes | Notificaciones |
| --- | --- | --- |
| Java sin Docker | `localhost:8080` | `localhost:8081` si se configura `--server.port=8081` |
| Docker Compose | Host `8080` → contenedor `8080` | Host `8081` → contenedor `8080` |
| Kubernetes | Service y pod `8080` | Service y pod `8080` |
| `port-forward` de esta guía | Host `18080` → Service `8080` | Host `18081` → Service `8080` |

Para cambiar un puerto **del host en Compose**, cambie solo el lado izquierdo de `ports` en `compose.yaml`, por ejemplo `"9090:8080"`, valide con `docker compose config` y reinicie con `docker compose up -d`. La llamada interna de solicitudes a notificaciones seguirá usando `http://servicio-notificaciones:8080/...`; el puerto publicado en Windows no altera ese DNS interno.

Para cambiar el puerto **del proceso Java**, configure `server.port` y ajuste además `ports`, `healthcheck`, `NOTIFICACIONES_URL`, los manifiestos `containerPort`/`targetPort` y las sondas que correspondan. Es un cambio coordinado; para una prueba local normalmente es más sencillo cambiar solo el puerto del host o los puertos del `port-forward`.

En Kubernetes, cambie `18080` o `18081` en el lado izquierdo del comando `kubectl port-forward` si están ocupados; el lado derecho debe seguir coincidiendo con el puerto del Service. Cada `port-forward` dura mientras permanezca abierta su terminal.

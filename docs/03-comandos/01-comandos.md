# 03 · Comandos por tarea

Use PowerShell en Windows. **Raíz** significa la carpeta que contiene `compose.yaml`; los comandos de Maven se ejecutan dentro de la carpeta indicada. Los comandos que detienen o eliminan recursos se explican en sus guías antes de usarlos.

## Comprobar herramientas y repositorio

| Desde | Comando | Resultado esperado |
| --- | --- | --- |
| Cualquier carpeta | `java --version` y `javac --version` | Ambos indican 26. |
| Cualquier carpeta | `git --version` | Versión instalada. |
| Cualquier carpeta | `wsl --status` | WSL disponible. |
| Cualquier carpeta | `docker version` | Cliente y servidor responden. |
| Cualquier carpeta | `docker compose version` | Compose v2 disponible. |
| Raíz | `git status` | Rama y cambios locales. |
| Raíz | `git remote -v` | `origin` apunta al repositorio correcto. |

## Compilar, probar y ejecutar Java

En **cada** carpeta `servicio-solicitudes` y `servicio-notificaciones`:

```powershell
.\mvnw.cmd --version
.\mvnw.cmd clean verify
```

`verify` termina sin errores y deja informes en `target/surefire-reports/`. Para ejecutar ambos procesos en Windows, abra dos terminales desde la raíz:

```powershell
cd servicio-notificaciones
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

```powershell
cd servicio-solicitudes
.\mvnw.cmd spring-boot:run
```

Ver [ejecución y depuración](../06-uso/01-ejecucion-y-depuracion.md) para cambiar puertos y usar IntelliJ.

## Docker y Compose

| Desde la raíz | Para qué sirve |
| --- | --- |
| `docker build -t servicio-solicitudes:local .\servicio-solicitudes` | Construir una imagen con etiqueta explícita. |
| `docker build -t servicio-notificaciones:local .\servicio-notificaciones` | Construir la segunda imagen. |
| `docker image ls` | Ver etiquetas e imágenes locales. |
| `docker compose config` | Validar y expandir Compose. |
| `docker compose up --build -d` | Construir e iniciar ambos servicios. |
| `docker compose ps` | Revisar estado y puertos. |
| `docker compose logs -f servicio-solicitudes` | Seguir registros; detener seguimiento con Ctrl+C. |
| `docker compose down` | Detener y quitar contenedores y red del proyecto. |

Ver [Docker y Compose](../06-uso/02-docker-y-compose.md) y [etiquetas y puertos](../06-uso/03-imagenes-etiquetas-y-puertos.md).

## Probar la API

Con Compose activo:

```powershell
Invoke-RestMethod http://localhost:8080/solicitudes
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/crear
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/INC-002/enviar
Invoke-RestMethod http://localhost:8081/notificaciones
```

La primera consulta incluye los datos cargados al arrancar. En Kubernetes use `18080` y `18081` tras abrir los dos `port-forward`.

## Kubernetes local

| Desde la raíz | Para qué sirve |
| --- | --- |
| `kubectl config use-context docker-desktop` | Elegir el clúster integrado de Docker Desktop. |
| `kubectl get nodes` | Confirmar que hay nodos `Ready`. |
| `kubectl apply -f k8s/` | Crear o actualizar recursos del proyecto. |
| `kubectl get deployments,pods,services` | Ver el estado. |
| `kubectl describe pod NOMBRE` | Investigar un pod; sustituya `NOMBRE`. |
| `kubectl logs deploy/servicio-solicitudes` | Leer registros del despliegue. |
| `kubectl rollout status deploy/servicio-solicitudes` | Esperar a que finalice el despliegue. |
| `kubectl port-forward svc/servicio-solicitudes 18080:8080` | Abrir acceso temporal en una terminal. |
| `kubectl port-forward svc/servicio-notificaciones 18081:8080` | Abrir otro acceso temporal. |
| `kubectl delete -f k8s/ --ignore-not-found` | Quitar los recursos definidos por el proyecto. |

Siga [el procedimiento completo](../06-uso/04-kubernetes-local.md) para cargar imágenes en los nodos antes de aplicar los manifiestos. No ejecute `kubectl delete` sin confirmar el contexto.

## K9s opcional

Después de verificar el contexto con `kubectl config current-context`, ejecute `k9s`. Dentro de K9s, `:pods`, `:deploy` y `:svc` cambian la vista; `l` abre registros del recurso seleccionado y `?` muestra atajos disponibles. Ver [guía de K9s](../06-uso/06-k9s.md).

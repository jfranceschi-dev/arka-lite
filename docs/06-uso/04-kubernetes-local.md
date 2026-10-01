# Kubernetes local de ARKA-Lite con Docker Desktop

Esta guía usa el clúster **`kind` integrado de Docker Desktop**, no un clúster independiente creado con `kind create cluster`. Complete antes [WSL, Docker Desktop y Kubernetes](../01-configuracion/03-wsl-y-docker.md). Elija **un nodo** para el primer ejercicio y ejecute los comandos desde la raíz del repositorio.

## 1. Confirmar el destino

```powershell
docker version
kubectl config get-contexts
kubectl config use-context docker-desktop
kubectl config current-context
kubectl get nodes
```

Compruebe que el contexto sea `docker-desktop` y que el nodo esté `Ready` antes de aplicar o eliminar recursos. Docker Desktop incluye `kubectl`, pero la CLI `kind` para cargar imágenes se instala aparte desde la [guía oficial de kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation), por ejemplo con `winget install Kubernetes.kind` si usa WinGet. Abra otra terminal y compruebe `kind version` y `kind get clusters`. Use el nombre del clúster **que muestre ese último comando**; no cree otro clúster.

## 2. Construir y cargar imágenes

Los manifiestos de `k8s/` piden `servicio-solicitudes:local` y `servicio-notificaciones:local`. Construya exactamente esas referencias:

```powershell
docker build -t servicio-solicitudes:local .\servicio-solicitudes
docker build -t servicio-notificaciones:local .\servicio-notificaciones
docker image ls servicio-solicitudes
docker image ls servicio-notificaciones
```

Las imágenes del almacén de Docker no siempre están presentes dentro de los nodos `kind`. Cárguelas usando el nombre observado en `kind get clusters`:

```powershell
kind load docker-image servicio-solicitudes:local --name NOMBRE_DEL_CLUSTER
kind load docker-image servicio-notificaciones:local --name NOMBRE_DEL_CLUSTER
```

Sustituya `NOMBRE_DEL_CLUSTER` antes de ejecutar. Si `kind get clusters` no lista el clúster integrado, revise el contexto de Docker, el modo `kind` elegido en Docker Desktop y el estado de los nodos antes de continuar. En equipos con el almacén de imágenes `containerd`, si la carga devuelve un error de contenido, siga la [alternativa de exportar una sola plataforma](https://kind.sigs.k8s.io/docs/user/known-issues/#unable-to-kind-load-docker-images); no cambie globalmente el almacén de imágenes solo para este proyecto.

## 3. Aplicar y verificar

```powershell
kubectl apply -f k8s/
kubectl rollout status deploy/servicio-notificaciones
kubectl rollout status deploy/servicio-solicitudes
kubectl get deployments,pods,services
```

`k8s/notificaciones.yaml` crea un Deployment y un Service para notificaciones, con una sonda de disponibilidad. `k8s/solicitudes.yaml` crea los equivalentes de solicitudes y un init container que espera a notificaciones. Ambos procesos Java escuchan en 8080. Solicitudes utiliza `http://servicio-notificaciones:8080/eventos/solicitud-enviada` dentro del clúster.

## 4. Acceder y probar

Abra **dos terminales** y deje cada comando activo:

```powershell
kubectl port-forward svc/servicio-solicitudes 18080:8080
```

```powershell
kubectl port-forward svc/servicio-notificaciones 18081:8080
```

En una tercera terminal:

```powershell
Invoke-RestMethod http://localhost:18080/solicitudes
Invoke-RestMethod -Method Post http://localhost:18080/solicitudes/crear
Invoke-RestMethod -Method Post http://localhost:18080/solicitudes/INC-002/enviar
Invoke-RestMethod http://localhost:18081/notificaciones
```

Swagger UI: `http://localhost:18080/swagger-ui/index.html` y `http://localhost:18081/swagger-ui/index.html`. `port-forward` es temporal; ciérrelo con Ctrl+C. Puede cambiar solo `18080` y `18081` si esos puertos del equipo están ocupados. Consulte [imágenes y puertos](03-imagenes-etiquetas-y-puertos.md).

## 5. Actualizar código o etiquetas

Después de cambiar Java, reconstruya la imagen afectada y vuelva a cargarla en el clúster. Como `:local` se reutiliza y el manifiesto indica `IfNotPresent`, reinicie el Deployment para crear un pod nuevo:

```powershell
docker build -t servicio-solicitudes:local .\servicio-solicitudes
kind load docker-image servicio-solicitudes:local --name NOMBRE_DEL_CLUSTER
kubectl rollout restart deploy/servicio-solicitudes
kubectl rollout status deploy/servicio-solicitudes
```

Para usar una **etiqueta nueva**, construya y cargue esa referencia, cambie `image:` en el manifiesto correspondiente, aplique el archivo y espere el rollout. Repita para notificaciones cuando cambie ese servicio. El pipeline publica etiquetas SHA en GHCR, pero estos manifiestos siguen usando `:local` hasta que alguien los cambie.

## 6. Diagnóstico

```powershell
kubectl get pods -o wide
kubectl describe pod NOMBRE_DEL_POD
kubectl logs deploy/servicio-solicitudes
kubectl logs deploy/servicio-notificaciones
kubectl get events --sort-by=.lastTimestamp
```

Sustituya `NOMBRE_DEL_POD` por uno de `kubectl get pods`. Si aparece `ImagePullBackOff`, revise la etiqueta y la carga en el clúster. Si el init container espera indefinidamente, revise los logs y el estado de notificaciones. Si la solicitud queda `ENVIADA` sin notificación, revise los registros de ambos servicios: el publicador registra el fallo, pero no revierte el estado ni reintenta. Para retirar el despliegue consulte [limpieza](05-kubernetes-limpieza.md). Para inspeccionarlo visualmente en terminal consulte [K9s opcional](06-k9s.md).

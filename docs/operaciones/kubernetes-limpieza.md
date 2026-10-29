# Limpieza de Kubernetes local

Desde la raíz del repositorio.

## Eliminar los recursos del laboratorio

El comando siguiente también elimina los PVC y el Secret definidos en `k8s/`. Según la política del almacenamiento, borrar los PVC puede eliminar los datos de ambas bases. Úsalo para desmontar el laboratorio completo.

```powershell
kubectl delete -R -f k8s/ --ignore-not-found
```

Cerrar los `port-forward` con `Ctrl+C`.

## Eliminar imágenes huérfanas

```powershell
docker image prune -f
docker builder prune -f
```

## Eliminar las imágenes del proyecto

```powershell
docker rmi servicio-solicitudes:local servicio-notificaciones:local arka-lite-servicio-solicitudes:latest arka-lite-servicio-notificaciones:latest
docker exec desktop-control-plane crictl rmi docker.io/library/servicio-solicitudes:local docker.io/library/servicio-notificaciones:local
```

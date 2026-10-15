# Limpieza de Kubernetes local

Ejecutar desde la raíz del repositorio y confirmar el contexto antes de borrar recursos:

```powershell
kubectl config current-context
kubectl get deployments,services,pvc
```

## Detener las aplicaciones y PostgreSQL conservando los datos

Estos comandos eliminan los cuatro `Deployment` y sus `Service`, pero **conservan los dos PVC** y el `Secret`. Al volver a aplicar los manifiestos se reutilizarán los volúmenes, si siguen disponibles:

```powershell
kubectl delete deployment servicio-solicitudes servicio-notificaciones db-solicitudes db-notificaciones --ignore-not-found
kubectl delete service servicio-solicitudes servicio-notificaciones db-solicitudes db-notificaciones --ignore-not-found
kubectl get pvc
```

Cerrar los `port-forward` con `Ctrl+C` en sus terminales.

## Borrar también los datos del laboratorio

Usar esta opción **solo si se quiere reiniciar las dos bases desde cero**. Los manifiestos incluyen PVC; al eliminarlos, se solicita la eliminación de sus volúmenes y datos según la política de almacenamiento del clúster:

```powershell
kubectl delete -f k8s/solicitudes.yaml --ignore-not-found
kubectl delete -f k8s/notificaciones.yaml --ignore-not-found
kubectl delete -f k8s/db-notificaciones.yaml --ignore-not-found
kubectl delete -f k8s/db-solicitudes.yaml --ignore-not-found
kubectl get pvc
```

El último archivo también elimina el `Secret arka-postgres` local. Para volver a empezar, seguir el [orden de despliegue](kubernetes-local.md#desplegar-y-comprobar).

## Imágenes de Docker

Los recursos de Kubernetes y las imágenes de Docker son cosas distintas. No hace falta borrar imágenes para detener el clúster. Si una imagen local del proyecto ya no se necesita, comprobar primero sus etiquetas:

```powershell
docker image ls servicio-solicitudes:local
docker image ls servicio-notificaciones:local
```

Después de detener los recursos, si se quieren reconstruir desde cero las imágenes `:local` de estas aplicaciones:

```powershell
docker image rm servicio-solicitudes:local servicio-notificaciones:local
docker build -t servicio-solicitudes:local .\servicio-solicitudes
docker build -t servicio-notificaciones:local .\servicio-notificaciones
```

Si Docker informa que una imagen sigue en uso, detener primero el contenedor que la utiliza. Las imágenes creadas por `docker compose build` pueden tener etiquetas distintas según el nombre del proyecto; identificarlas con `docker compose images` antes de borrarlas. Evitar `docker image prune` o `docker builder prune` como parte automática de esta guía: afectan también a imágenes y cachés ajenas a ARKA-Lite.

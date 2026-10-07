# Lista de puntos abiertos — ARKA-Lite (Equipo: Arka-litos)

En la primera verificación se obtuvo **7/8**. Falló la prueba 6 porque notificaciones no recibió `CAM-002`.

Luego se agregó PostgreSQL y se ejecutó Docker Compose. Falló la generación de las imágenes y, al repetir la verificación, se obtuvo **3/8**: los despliegues estaban en `not=0 sol=0` y los servicios no tenían `endpoints`.

Después de corregir las imágenes y la configuración de PostgreSQL en Kubernetes, la verificación dio **8/8** en minikube.

| # | Síntoma observado | Capa (Docker/CI-CD/K8s) | Cómo se diagnosticó (herramienta) | Causa raíz | Arreglo aplicado | Estado |
|---|---|---|---|---|---|---|
| 1 | La prueba 6 no encontró `CAM-002` (7/8). | Docker / K8s | Se revisaron los registros y las imágenes de los pods. | Seguían ejecutándose imágenes anteriores. | Se reconstruyeron las imágenes y se reinició notificaciones antes que solicitudes para volver a enviar el evento. | Cerrado |
| 2 | Docker Compose falló al generar las imágenes después de agregar PostgreSQL. | Docker | Se revisó la salida de la construcción y las imágenes disponibles. | Las imágenes nuevas no quedaron listas para usarse en minikube. | Se reconstruyeron ambas imágenes y se agregó la carga automática en minikube a `construir.sh`. | Cerrado |
| 3 | La prueba 4 mostró `not=0 sol=0` (3/8). | K8s | Se revisaron los pods y sus registros con `kubectl`. | Faltaban imágenes actualizadas; solicitudes también necesitaba conectarse a PostgreSQL. | Se cargaron las imágenes y se configuró la base para que solicitudes pudiera arrancar. | Cerrado |
| 4 | La prueba 5 mostró servicios sin `endpoints` (3/8). | K8s | Se revisaron los pods, los servicios y los `endpoints` con `kubectl`. | Los pods no estaban listos. | Se corrigió el arranque de los pods y se confirmó que los servicios tenían `endpoints`. | Cerrado |
| 5 | Solicitudes no podía usar PostgreSQL en Kubernetes. | K8s | Se revisaron la conexión y los registros de solicitudes. | PostgreSQL estaba en Docker Compose, pero faltaba en el clúster. | Se agregaron la base y su servicio; solicitudes se conecta por el nombre del servicio. | Cerrado |
| 6 | CI no probaba el arranque de solicitudes con PostgreSQL. | CI/CD | Se revisaron los pasos previos a la publicación de las imágenes. | La prueba de arranque no tenía una base disponible. | Se agregó PostgreSQL 17 y una comprobación de arranque antes de publicar. | Ajustado; pendiente de comprobar en GitHub Actions |

**Estado final del sistema:** `verificar_sistema.sh` → **8/8**

**Runbook (cómo levantar ARKA de cero):**

Para realizar la prueba, fue necesario instalar minikube. Se abrió **PowerShell como administrador** y se ejecutó:

```powershell
winget install Kubernetes.minikube
```

Después, abrir una terminal nueva y comprobar con `minikube version`. Con Docker Desktop abierto, ejecutar en Git Bash desde la raíz del proyecto:

1. `minikube start`
2. `kubectl config use-context minikube`
3. `bash construir.sh`
4. `kubectl apply -f k8s/`
5. `bash verificar_sistema.sh` → debe dar **8/8**.

`construir.sh` carga las imágenes en minikube. Si ya había pods, reiniciarlos para que tomen las imágenes nuevas.

Al terminar, se volvió al contexto de Docker Desktop y se detuvo minikube con:

```bash
kubectl config use-context docker-desktop
minikube stop
```

De forma opcional, si ya no se va a usar minikube, se puede desinstalar desde **PowerShell como administrador**:

```powershell
minikube delete
winget uninstall --id Kubernetes.minikube --exact
```

`minikube delete` borra el clúster y sus datos. `winget uninstall` quita el programa.

**Firma del responsable:** ____________________

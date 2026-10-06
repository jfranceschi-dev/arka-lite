# Laboratorio 22 — Estabilización de ARKA-Lite

**Sesión 44 · estudio independiente · mínimo 2 horas**  
**Validación:** 6 de octubre de 2026, clúster `minikube`.

## Objetivo y entregables

Cerrar los puntos abiertos hasta obtener **8/8** en `verificar_sistema.sh`. Entregar la lista de incidencias con síntoma, capa, diagnóstico, causa y arreglo, más una captura de la ejecución en 8/8.

## Adaptación a PostgreSQL

`servicio-solicitudes` usa PostgreSQL. Los manifiestos ahora incluyen un Deployment y Service `base-datos`, un volumen persistente y un Secret de **desarrollo local**. Solicitudes recibe `DB_URL`, `DB_USER` y `DB_PASSWORD`, espera a que la base acepte conexiones autenticadas y solo queda listo cuando responde `/solicitudes`. Notificaciones sigue usando almacenamiento en memoria.

El valor del Secret coincide con el de `compose.yaml` para este laboratorio. Para otro entorno, sustituirlo por una credencial gestionada fuera del repositorio. CI levanta PostgreSQL 17 con una contraseña efímera y comprueba el arranque de solicitudes antes de publicar la imagen.

## Cómo levantarlo en minikube

Abrir Docker Desktop para disponer de su motor Docker. Abrir Git Bash en la raíz del repositorio con `docker`, `kubectl` y `minikube` accesibles. Seleccionar explícitamente minikube: el repositorio también puede estar desplegado en `docker-desktop` y son clústeres distintos.

```bash
minikube start
kubectl config use-context minikube
kubectl get nodes
bash construir.sh
minikube image load servicio-solicitudes:local
minikube image load servicio-notificaciones:local
kubectl apply -f k8s/
kubectl rollout status deployment/base-datos --timeout=120s
kubectl rollout restart deployment/servicio-notificaciones
kubectl rollout status deployment/servicio-notificaciones --timeout=120s
kubectl rollout restart deployment/servicio-solicitudes
kubectl rollout status deployment/servicio-solicitudes --timeout=120s
bash verificar_sistema.sh 2>&1 | tee resultado_lab22_postgres.txt
```

La renovación de solicitudes después de notificaciones vuelve a emitir `CAM-002`. Si se modifica el código, repetir construcción y carga antes del despliegue; el verificador construye imágenes en Docker Desktop pero no las carga en minikube. `construir_y_cargar.sh` no existe en este repositorio.

El verificador aplica manifiestos y elimina un pod de solicitudes para comprobar su reposición. Ejecutarlo solo sobre el clúster local del laboratorio.

## Las ocho comprobaciones

| # | Capa | Criterio | Resultado en minikube |
|---|---|---|---|
| 1 | Docker | Ambos Dockerfiles multi-stage y no-root | OK |
| 2 | CI/CD | Prueba antes de publicar; credencial de registro en secrets | OK |
| 3 | Docker/K8s | Ambas imágenes construidas y cargadas | OK |
| 4 | K8s | Ambos Deployments listos | OK |
| 5 | K8s | Ambos Services con endpoints | OK |
| 6 | K8s | Notificaciones recibe CAM-002 | OK |
| 7 | K8s | Comunicación por nombre de Service | OK |
| 8 | K8s | El pod eliminado se repone | OK |

El check 2 revisa el archivo de CI; la ejecución remota de GitHub Actions no forma parte de la evidencia local.

## Guía de diagnóstico

| Síntoma | Herramienta o revisión |
|---|---|
| `ErrImagePull` / `ImagePullBackOff` | `kubectl describe pod <nombre>` y `minikube image load` |
| Pod de solicitudes no arranca | `kubectl logs deployment/servicio-solicitudes`, `kubectl get pods` y `kubectl get pvc` |
| PostgreSQL no está listo | `kubectl logs deployment/base-datos`, `kubectl get pvc` y `kubectl get endpoints base-datos` |
| Service sin endpoints | Revisar estado Ready de los pods, selectors y labels; la falta de endpoints también puede ser consecuencia de que un pod no está listo |
| Evento no aparece | Logs de ambos servicios, `NOTIFICACIONES_URL` y orden de arranque |
| No aparecen recursos esperados | `kubectl config get-contexts` |

## Retos de estiramiento

- Completar `livenessProbe` en ambos servicios; PostgreSQL ya tiene sondas y ambos servicios cuentan con `readinessProbe`.
- Agregar `requests` y `limits` de memoria a los contenedores.
- Unificar construcción, carga, aplicación y verificación en un comando.

Estos retos siguen siendo opcionales y no se presentan como completados.

## Evidencia

**Resultado real en minikube con PostgreSQL: 8/8**, en [resultado_lab22_postgres.txt](resultado_lab22_postgres.txt). La lista cerrada está en [puntos_abiertos_ajustado.md](puntos_abiertos_ajustado.md). Aún hay que completar datos de equipo y adjuntar la captura solicitada por el docente.

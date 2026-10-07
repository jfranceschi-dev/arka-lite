# Laboratorio 22 — Estabilización de ARKA-Lite

**Sesión 44 · estudio independiente · mínimo 2 horas**  
**Validación:** 6 de octubre de 2026, clúster `minikube`.

## Objetivo y entregables

Cerrar los puntos abiertos hasta obtener **8/8** en `verificar_sistema.sh`. Entregar la lista de incidencias con síntoma, capa, diagnóstico, causa y arreglo, más una captura de la ejecución en 8/8.

## Adaptación a PostgreSQL

`servicio-solicitudes` usa PostgreSQL. Los manifiestos ahora incluyen un Deployment y Service `base-datos`, un volumen persistente y un Secret de **desarrollo local**. Solicitudes recibe `DB_URL`, `DB_USER` y `DB_PASSWORD`, espera a que la base acepte conexiones autenticadas y solo queda listo cuando responde `/solicitudes`. Notificaciones sigue usando almacenamiento en memoria.

La credencial local coincide con la usada por Docker Compose en este laboratorio. Para otro entorno, sustituirla por una credencial gestionada fuera del repositorio. CI levanta PostgreSQL 17 con una contraseña temporal y comprueba el arranque de solicitudes antes de publicar la imagen.

## Instalar minikube en Windows

Si minikube no está instalado, abrir **PowerShell como administrador** (clic derecho → «Ejecutar como administrador») y ejecutar:

```powershell
winget install Kubernetes.minikube
```

Al terminar, cerrar PowerShell y abrir una terminal nueva para que se actualice el `PATH`. Comprobar la instalación con `minikube version`. Para este laboratorio también debe estar abierto Docker Desktop.

## Cómo levantarlo en minikube

Abrir Docker Desktop para disponer de su motor Docker. Abrir Git Bash en la raíz del repositorio con `docker`, `kubectl` y `minikube` accesibles. Para levantar el sistema desde cero:

1. `minikube start`
2. `kubectl config use-context minikube`
3. `bash construir.sh`
4. `kubectl apply -f k8s/`
5. `bash verificar_sistema.sh` → debe dar **8/8**.

El segundo paso asegura que los comandos apunten a minikube. Con ese contexto activo, la construcción carga las dos imágenes automáticamente; no hace falta ejecutar `minikube image load` a mano. El verificador permanece sin cambios.

Estos cuatro pasos describen un arranque desde cero. Si ya existen pods con imágenes anteriores, hay que renovarlos para que usen las nuevas; ese fue el motivo del 7/8 previo.

El verificador aplica manifiestos y elimina un pod de solicitudes para comprobar su reposición. Ejecutarlo solo sobre el clúster local del laboratorio.

## Volver a Docker Desktop y apagar minikube

Al terminar, volver al clúster que se usaba antes y detener minikube sin borrar sus datos:

```bash
kubectl config use-context docker-desktop
minikube stop
```

Para trabajar de nuevo con ARKA en Docker Desktop, ejecutar `bash construir.sh`, `kubectl apply -f k8s/` y `bash verificar_sistema.sh`. Si ya existen pods con imágenes anteriores, renovarlos para que usen las imágenes nuevas. Cambiar de contexto y detener minikube no elimina sus recursos; se pueden recuperar con `minikube start`. Solo si se quiere eliminar ese clúster y sus datos locales, ejecutar `minikube delete`.

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

**Resultado real en minikube con PostgreSQL: 8/8.** Aún hay que completar los datos del equipo y adjuntar la captura solicitada por el docente.

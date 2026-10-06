# Lista de puntos abiertos — ARKA-Lite

**Equipo:** ____________________  
**Responsable:** ____________________  
**Fecha:** 6 de octubre de 2026.  
**Entorno validado:** minikube con PostgreSQL 17.

## Resultado

**8/8: lista de incidencias cerrada.** La ejecución íntegra del verificador sin cambios está en [resultado_lab22_postgres.txt](resultado_lab22_postgres.txt). Después de la prueba de auto-sanación, los Deployments `base-datos`, `servicio-notificaciones` y `servicio-solicitudes` quedaron en 1/1; se comprobó que la tabla `solicitud` contiene datos en PostgreSQL.

## Incidencias y cierre

| # | Síntoma observado | Capa | Cómo lo diagnostiqué | Causa raíz | Arreglo aplicado | Estado |
|---|---|---|---|---|---|---|
| 1 | El usuario observó `not=0 sol=0` y Services sin endpoints. | K8s / imágenes | `kubectl config get-contexts`, `kubectl get pods`, `kubectl describe pod`. | Se estaba usando minikube, distinto del clúster `docker-desktop`; allí notificaciones mostró `ErrImagePull` y faltaban las imágenes locales. El Service sin endpoints era consecuencia de pods no listos, sin prueba de un error de selectores. | Se construyeron y cargaron ambas imágenes en minikube; se aplicaron manifiestos y se renovaron los Deployments. | Cerrado |
| 2 | Solicitudes no tenía una base de datos configurada en Kubernetes. | K8s / PostgreSQL | Revisión de `application.properties`, `compose.yaml`, `k8s/solicitudes.yaml` y estado de los pods. | El servicio ya requiere PostgreSQL, pero los manifiestos anteriores no desplegaban la base ni inyectaban `DB_URL`, `DB_USER` y `DB_PASSWORD`. | Se añadió `k8s/postgres.yaml` con base, Service, volumen y Secret local; solicitudes ahora recibe las variables, espera conexión autenticada y tiene sonda de disponibilidad. El log confirmó conexión a `jdbc:postgresql://base-datos:5432/arka`. | Cerrado |
| 3 | CI no verificaba que solicitudes arrancase con PostgreSQL. | CI/CD | Revisión de `.github/workflows/ci.yml` y las pruebas Maven existentes. | El pipeline ejecutaba `mvn verify` sin levantar la base; las pruebas Java actuales no cubrían ese arranque. | Se añadió PostgreSQL 17 como servicio de CI y una prueba de arranque que consulta `/solicitudes` y exige `CAM-002` antes de publicar. La contraseña de CI es efímera. La ejecución remota de GitHub Actions queda por observar tras enviar los cambios. | Cerrado localmente |
| 4 | En una ejecución anterior el evento `CAM-002` no aparecía; resultado 7/8. | Docker/K8s | Comparación de imágenes ejecutadas y logs de los servicios. | Había pods con imágenes anteriores; reconstruir la etiqueta `:local` no renueva pods existentes. | Renovar primero notificaciones y luego solicitudes, para volver a emitir el evento. El verificador confirmó recepción en minikube. | Cerrado |

Los scripts de prueba Bash no se modificaron.

## Runbook: cómo levantar ARKA de cero

Abrir Docker Desktop y Git Bash en la raíz del repositorio. Iniciar minikube y seleccionar su contexto. Construir y cargar las imágenes antes de aplicar los manifiestos; PostgreSQL debe estar listo antes de solicitudes. Si ya hay pods, renovarlos para usar las imágenes actuales y emitir el evento de arranque.

```bash
minikube start
kubectl config use-context minikube
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

El verificador elimina un pod de solicitudes para probar su reposición. Si hay un `XX`, revisar el pod y sus logs, corregir la causa y repetir. El Secret incluido en `k8s/postgres.yaml` contiene la credencial de **desarrollo local**, igual a `compose.yaml`; reemplazarla para otros entornos.

**Estado final del sistema:** `verificar_sistema.sh` → **8/8**.  
**Evidencia textual:** [resultado_lab22_postgres.txt](resultado_lab22_postgres.txt).  
**Captura solicitada por el docente:** pendiente de adjuntar.  
**Firma del responsable:** ____________________

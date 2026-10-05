#!/usr/bin/env bash
# Verificador del Lab S40 (ARKA en el cluster). minikube arriba + imagenes cargadas.
#  ->  bash verificar.sh   (desde 'ejemplo/')
set -u
PASS=0; TOTAL=6
echo "== S40: ARKA en Kubernetes (6 compuertas) =="
command -v kubectl >/dev/null 2>&1 || { echo "[X] kubectl no esta instalado"; exit 1; }
[ -d k8s ] || { echo "[X] falta la carpeta k8s/"; exit 1; }

echo "-- (1) manifiestos validos..."
if kubectl apply --dry-run=client -f k8s/ >/dev/null 2>&1; then echo "[OK] (1) los manifiestos son validos"; PASS=$((PASS+1)); else echo "[X] (1) algun manifiesto es invalido"; fi

echo "-- aplicando al cluster..."
kubectl apply -f k8s/ >/dev/null 2>&1
kubectl rollout status deployment/servicio-notificaciones --timeout=120s >/dev/null 2>&1
kubectl rollout status deployment/servicio-solicitudes --timeout=120s >/dev/null 2>&1
sleep 4

echo "-- (2) los dos Deployments estan listos..."
RN=$(kubectl get deploy servicio-notificaciones -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
RS=$(kubectl get deploy servicio-solicitudes -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
if [ "${RN:-0}" -ge 1 ] && [ "${RS:-0}" -ge 1 ] 2>/dev/null; then echo "[OK] (2) notificaciones=${RN}, solicitudes=${RS} listos"; PASS=$((PASS+1)); else echo "[X] (2) no todos listos (not=${RN:-0}, sol=${RS:-0}) — revisa 'kubectl get pods' e imagenes cargadas"; fi

echo "-- (3) el Service de solicitudes responde..."
kubectl port-forward service/servicio-solicitudes 18080:8080 >/dev/null 2>&1 & PF1=$!; sleep 4
if curl -sf http://localhost:18080/solicitudes 2>/dev/null | grep -qi "INC-001"; then echo "[OK] (3) /solicitudes responde"; PASS=$((PASS+1)); else echo "[X] (3) /solicitudes no respondio"; fi
kill $PF1 >/dev/null 2>&1

echo "-- (4) el evento CRUZO por DNS a notificaciones (dentro del cluster)..."
kubectl port-forward service/servicio-notificaciones 18081:8080 >/dev/null 2>&1 & PF2=$!; sleep 4
if curl -sf http://localhost:18081/notificaciones 2>/dev/null | grep -qi "CAM-002"; then echo "[OK] (4) notificaciones recibio el evento (solicitudes lo alcanzo por el nombre del Service)"; PASS=$((PASS+1)); else echo "[X] (4) notificaciones vacio: revisa NOTIFICACIONES_URL (nombre del Service) y que ambos esten arriba"; fi
kill $PF2 >/dev/null 2>&1

echo "-- (5) auto-sanacion: borro un pod de solicitudes..."
POD=$(kubectl get pods -l app=servicio-solicitudes --no-headers 2>/dev/null | head -1 | awk '{print $1}')
if [ -n "$POD" ]; then
  kubectl delete pod "$POD" >/dev/null 2>&1
  kubectl rollout status deployment/servicio-solicitudes --timeout=120s >/dev/null 2>&1; sleep 3
  R=$(kubectl get deploy servicio-solicitudes -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
  [ "${R:-0}" -ge 1 ] 2>/dev/null && { echo "[OK] (5) K8s repuso el pod"; PASS=$((PASS+1)); } || echo "[X] (5) no se recupero"
else echo "[X] (5) no encontre pod de solicitudes"; fi

echo "-- (6) comunicacion por NOMBRE de Service (config, no IP)..."
URLV=$(grep -iE 'value:.*NOTIFICACIONES|http://servicio-notificaciones' k8s/*.yaml | head -1)
if grep -rqiE 'servicio-notificaciones:8080' k8s/ && ! grep -riE 'NOTIFICACIONES_URL' -A1 k8s/ | grep -qiE 'localhost|127\.0\.0\.1|([0-9]+\.){3}[0-9]+'; then echo "[OK] (6) solicitudes llama a notificaciones por su nombre de Service"; PASS=$((PASS+1)); else echo "[X] (6) usa el nombre del Service 'servicio-notificaciones', no localhost/IP"; fi

echo ""; echo "PUNTAJE: ${PASS}/${TOTAL}"
[ "$PASS" -eq "$TOTAL" ] && echo "ARKA corre en el cluster: dos servicios, hablando por DNS, auto-sanandose." || echo "Aun no. Revisa arriba."

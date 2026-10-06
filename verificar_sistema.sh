#!/usr/bin/env bash
# ===========================================================================
#  verificar_sistema.sh  —  Puesta a punto de ARKA-Lite (S44)
#  Corre el sistema COMPLETO de extremo a extremo y reporta cada capa.
#  Uso: desde la raiz del repo de ARKA (con servicio-solicitudes/,
#       servicio-notificaciones/, .github/workflows/ci.yml y k8s/),
#       con el Kubernetes de Docker Desktop arriba:  bash verificar_sistema.sh
# ===========================================================================
set -u
PASS=0; TOTAL=8
echo "===================================================="
echo " Puesta a punto de ARKA-Lite  —  8 comprobaciones"
echo "===================================================="

# --- CAPA 1: DOCKER (calidad de imagen) ---------------------------------
echo ""
echo "[ CAPA DOCKER ]"
echo "-- (1) ambos Dockerfiles: multi-stage y no-root..."
ok=1
for S in servicio-solicitudes servicio-notificaciones; do
  D="$S/Dockerfile"
  if [ ! -f "$D" ]; then ok=0; continue; fi
  # multi-stage = 2+ FROM y un COPY --from ; no-root = un USER
  [ "$(grep -ciE '^\s*FROM ' "$D")" -ge 2 ] && grep -qiE 'COPY\s+--from' "$D" && grep -qiE '^\s*USER ' "$D" || ok=0
done
[ "$ok" = 1 ] && { echo "   OK  imagenes chicas y sin root"; PASS=$((PASS+1)); } \
             || echo "   XX  algun Dockerfile no es multi-stage o corre como root"

# --- CAPA 2: CI/CD (el pipeline) ----------------------------------------
echo ""
echo "[ CAPA CI/CD ]"
echo "-- (2) pipeline: prueba antes de publicar, y sin credenciales pegadas..."
WF=".github/workflows/ci.yml"
if [ -f "$WF" ]; then
  LT=$(grep -niE 'mvn .*(verify|test)' "$WF" | head -1 | cut -d: -f1)
  LP=$(grep -niE 'docker push|docker build' "$WF" | head -1 | cut -d: -f1)
  HARD=$(grep -iE '(password|token):[[:space:]]*[^$[:space:]]' "$WF" || true)
  if [ -n "$LT" ] && [ -n "$LP" ] && [ "$LT" -lt "$LP" ] && grep -qE 'secrets\.' "$WF" && [ -z "$HARD" ]; then
    echo "   OK  prueba->publica en orden, credencial en secrets"; PASS=$((PASS+1))
  else
    [ -n "$HARD" ] && echo "   XX  credencial hardcodeada (usa secrets)" \
                   || echo "   XX  el orden esta mal (publica antes de probar) o falta secrets"
  fi
else echo "   XX  no hay $WF"; fi

# --- construir las imagenes locales -----------------------------
echo ""
echo "[ CONSTRUIR ]"
echo "-- (3) construyendo las dos imagenes locales..."
bok=1
for S in servicio-solicitudes servicio-notificaciones; do
  docker build -t "$S:local" "./$S" >/tmp/build_$S.log 2>&1 || { bok=0; echo "   .. fallo build $S:"; tail -3 /tmp/build_$S.log; }
done
[ "$bok" = 1 ] && { echo "   OK  imagenes construidas (Docker Desktop las ve directo)"; PASS=$((PASS+1)); } \
             || echo "   XX  fallo construir/cargar (revisa los Dockerfiles)"

# --- CAPA 3: KUBERNETES (despliegue) ------------------------------------
echo ""
echo "[ CAPA KUBERNETES ]"
echo "-- (4) manifiestos validos, aplicados y listos..."
if kubectl apply --dry-run=client -f k8s/ >/dev/null 2>&1; then
  kubectl apply -f k8s/ >/dev/null 2>&1
  kubectl rollout status deployment/servicio-notificaciones --timeout=120s >/dev/null 2>&1
  kubectl rollout status deployment/servicio-solicitudes    --timeout=120s >/dev/null 2>&1
  sleep 3
  RN=$(kubectl get deploy servicio-notificaciones -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
  RS=$(kubectl get deploy servicio-solicitudes    -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
  if [ "${RN:-0}" -ge 1 ] && [ "${RS:-0}" -ge 1 ] 2>/dev/null; then
    echo "   OK  ambos Deployments listos"; PASS=$((PASS+1))
  else echo "   XX  no todos listos (not=${RN:-0} sol=${RS:-0}) — mira 'kubectl get pods' (¿ImagePullBackOff? ¿tag/imagePullPolicy?)"; fi
else echo "   XX  algun manifiesto invalido"; fi

echo "-- (5) los Services tienen endpoints (selector = labels)..."
EN=$(kubectl get endpoints servicio-notificaciones -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
ES=$(kubectl get endpoints servicio-solicitudes    -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
[ -n "$EN" ] && [ -n "$ES" ] && { echo "   OK  ambos Services enrutan a pods"; PASS=$((PASS+1)); } \
                             || echo "   XX  algun Service sin endpoints: el selector no calza con las labels"

echo "-- (6) el evento cruza por DNS (solicitudes -> notificaciones)..."
# El seed de arranque publica CAM-002. Se reintenta por si notificaciones tardo
# en levantar (arrancado != listo, S39) o el port-forward no estaba listo aun.
kubectl port-forward service/servicio-notificaciones 18081:8080 >/dev/null 2>&1 & PFN=$!
sleep 4
cruzo=0
for i in 1 2 3 4 5; do
  if curl -sf http://localhost:18081/notificaciones 2>/dev/null | grep -qi "CAM-002"; then cruzo=1; break; fi
  sleep 2
done
[ "$cruzo" = 1 ] && { echo "   OK  notificaciones recibio el evento por DNS"; PASS=$((PASS+1)); } \
                 || echo "   XX  el evento no cruzo (revisa NOTIFICACIONES_URL: nombre de Service, no localhost)"
kill $PFN 2>/dev/null; wait $PFN 2>/dev/null

echo "-- (7) comunicacion por NOMBRE de Service (no localhost/IP)..."
URLV=$(grep -riE 'NOTIFICACIONES_URL' -A1 k8s/ 2>/dev/null | grep -iE 'value|http' | sed 's/#.*//')
{ echo "$URLV" | grep -qiE 'servicio-notificaciones' && ! echo "$URLV" | grep -qiE 'localhost|127\.0\.0\.1'; } \
  && { echo "   OK  llama por el nombre del Service"; PASS=$((PASS+1)); } \
  || echo "   XX  usa 'servicio-notificaciones', no localhost"

echo "-- (8) auto-sanacion: borro un pod y K8s lo repone..."
POD=$(kubectl get pods -l app=servicio-solicitudes --no-headers 2>/dev/null | head -1 | awk '{print $1}')
if [ -n "$POD" ]; then
  kubectl delete pod "$POD" >/dev/null 2>&1
  kubectl rollout status deployment/servicio-solicitudes --timeout=120s >/dev/null 2>&1; sleep 2
  R=$(kubectl get deploy servicio-solicitudes -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
  [ "${R:-0}" -ge 1 ] 2>/dev/null && { echo "   OK  el pod se repuso"; PASS=$((PASS+1)); } || echo "   XX  no se recupero"
else echo "   XX  no encontre pod de solicitudes"; fi

echo ""
echo "===================================================="
echo " RESULTADO:  ${PASS}/${TOTAL}"
[ "$PASS" -eq "$TOTAL" ] && echo " ARKA-Lite levanta LIMPIO de extremo a extremo." \
                         || echo " Sistema aun inestable. Cada XX es un punto abierto por cerrar."
echo "===================================================="

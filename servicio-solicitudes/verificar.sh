#!/usr/bin/env bash
# Verificador del Lab S54 — instrumentacion basica. Córrelo en la carpeta de TU servicio
# (donde estan pom.xml y src/main/resources/application.properties).
#  ->  bash verificar.sh
set -u
PASS=0; TOTAL=4
echo "== S54: instrumentacion (4 comprobaciones estaticas) =="
POM="pom.xml"; PROP="src/main/resources/application.properties"
[ -f "$POM" ] || { echo "[X] no hay pom.xml aqui"; exit 1; }
[ -f "$PROP" ] || { echo "[X] no hay $PROP"; exit 1; }

echo "-- (1) Actuator (salud + metricas)..."
grep -qiE 'spring-boot-starter-actuator' "$POM" && { echo "[OK] (1) actuator en el pom"; PASS=$((PASS+1)); } || echo "[X] (1) agrega spring-boot-starter-actuator"

echo "-- (2) endpoints de salud y metricas expuestos..."
grep -qiE 'management.endpoints.web.exposure.include' "$PROP" && grep -iE 'exposure.include' "$PROP" | grep -qiE 'health' && grep -iE 'exposure.include' "$PROP" | grep -qiE 'metrics' \
  && { echo "[OK] (2) health y metrics expuestos"; PASS=$((PASS+1)); } || echo "[X] (2) expon health,metrics en management.endpoints.web.exposure.include"

echo "-- (3) trazabilidad (Micrometer Tracing)..."
grep -qiE 'micrometer-tracing' "$POM" && { echo "[OK] (3) tracing en el pom (traceId en los logs)"; PASS=$((PASS+1)); } || echo "[X] (3) agrega micrometer-tracing-bridge-brave"

echo "-- (4) logs estructurados..."
grep -qiE 'logging.structured.format' "$PROP" && { echo "[OK] (4) logging estructurado configurado"; PASS=$((PASS+1)); } || echo "[X] (4) configura logging.structured.format.console"

echo ""; echo "PUNTAJE (estatico): ${PASS}/${TOTAL}"
echo ""
echo ">> ENSAYO EN VIVO (no lo puntua el script; es el criterio del programa):"
echo "   1) arranca el servicio; curl http://localhost:8080/actuator/health  -> UP"
echo "   2) curl http://localhost:8080/actuator/metrics  -> lista de metricas"
echo "   3) haz una peticion y mira el log: cada linea debe traer un traceId"
echo "   4) el tablero (Grafana/Prometheus) muestra al menos UNA metrica"
[ "$PASS" -eq "$TOTAL" ] && echo "" && echo "Config lista; falta ver la metrica y el traceId en vivo." || echo ""

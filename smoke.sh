#!/usr/bin/env bash
# PRUEBA DE HUMO del sistema ARKA ensamblado. Córrela desde la raíz del compose integrado.
# Verifica RAPIDO que el camino critico funciona de extremo a extremo, capa por capa.
#  ->  bash smoke.sh
set -u
PASS=0; TOTAL=6
# --- AJUSTA a TU sistema integrado: no solo los puertos, tambien las RUTAS de abajo ---
#     (/actuator/health, el endpoint de enviar, el de consultar estado, el de notificaciones).
#     Si no coinciden con la API real, el humo marca rojo aunque el sistema este bien.
SOL_URL="http://localhost:8080"; NOT_URL="http://localhost:8081"; GRAFANA="http://localhost:3000"
SOL="servicio-solicitudes"; NOT="servicio-notificaciones"
echo "== PRUEBA DE HUMO — ARKA ensamblado (6 capas) =="

echo "-- levantando el sistema completo..."
docker compose up -d --build >/tmp/smoke.log 2>&1 || { echo "[X] no levantó:"; tail -5 /tmp/smoke.log; echo "HUMO: 0/${TOTAL}"; exit 0; }
for i in $(seq 1 40); do curl -sf "$SOL_URL/actuator/health" >/dev/null 2>&1 && break; sleep 3; done

echo "-- (1) salud: ambos servicios responden UP..."
if curl -sf "$SOL_URL/actuator/health" | grep -qi '"status":"UP"' && curl -sf "$NOT_URL/actuator/health" | grep -qi '"status":"UP"'; then echo "[OK] (1) servicios arriba"; PASS=$((PASS+1)); else echo "[X] (1) algun servicio no responde"; fi

echo "-- (2) camino critico: enviar una solicitud..."
curl -sf -X POST "$SOL_URL/solicitudes/HUMO-1/enviar" >/dev/null 2>&1 && { echo "[OK] (2) enviar respondió"; PASS=$((PASS+1)); } || echo "[X] (2) enviar falló"
sleep 2

echo "-- (3) persistencia: la solicitud quedó ENVIADA..."
if curl -sf "$SOL_URL/solicitudes/HUMO-1" 2>/dev/null | grep -qi 'ENVIADA'; then echo "[OK] (3) estado persistido"; PASS=$((PASS+1)); else echo "[X] (3) el estado no persistió"; fi

echo "-- (4) evento cruzó: notificaciones tiene el aviso..."
if curl -sf "$NOT_URL/notificaciones" 2>/dev/null | grep -qi 'HUMO-1'; then echo "[OK] (4) el evento cruzó entre servicios"; PASS=$((PASS+1)); else echo "[X] (4) el aviso no llegó a notificaciones"; fi

# (5) OJO: esto prueba idempotencia SOLO si un segundo 'enviar' reusa el mismo eventoId
#     (o es no-op sobre una solicitud ya ENVIADA). Si cada 'enviar' genera un eventoId NUEVO,
#     el segundo aviso es legitimo y esta comprobacion da falso positivo. En ese caso, reenvia
#     el MISMO evento al consumidor de notificaciones (mismo eventoId), como en la Clase 26 E5.
echo "-- (5) idempotencia: reenviar el mismo evento no duplica..."
BEFORE=$(curl -sf "$NOT_URL/notificaciones" 2>/dev/null | grep -o 'HUMO-1' | wc -l | tr -d ' ')
curl -sf -X POST "$SOL_URL/solicitudes/HUMO-1/enviar" >/dev/null 2>&1; sleep 2
AFTER=$(curl -sf "$NOT_URL/notificaciones" 2>/dev/null | grep -o 'HUMO-1' | wc -l | tr -d ' ')
[ "$BEFORE" = "$AFTER" ] && [ "$AFTER" = "1" ] && { echo "[OK] (5) sin duplicado"; PASS=$((PASS+1)); } || echo "[X] (5) posible duplicado (antes=$BEFORE despues=$AFTER)"

echo "-- (6) observabilidad: el tablero responde..."
curl -sf "$GRAFANA/api/health" >/dev/null 2>&1 && { echo "[OK] (6) Grafana arriba"; PASS=$((PASS+1)); } || echo "[X] (6) el tablero no responde"

echo "-- limpieza..."; docker compose down >/dev/null 2>&1
echo ""; echo "HUMO: ${PASS}/${TOTAL}"
[ "$PASS" -eq "$TOTAL" ] && echo "El sistema ensamblado prende y respira." || echo "Ensamblaje incompleto — revisa la capa que falló."
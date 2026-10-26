#!/usr/bin/env bash
# PRUEBA DE HUMO del sistema ARKA ensamblado. Córrela desde la raíz del compose integrado.
# Verifica RAPIDO que el camino critico funciona de extremo a extremo, capa por capa.
#  ->  bash smoke.sh
set -u
PASS=0; TOTAL=6
# --- AJUSTA a TU sistema integrado: no solo los puertos, tambien las RUTAS de abajo ---
#     (/actuator/health, el endpoint de enviar, el de consultar estado, el de notificaciones).
#     Si no coinciden con la API real, el humo marca rojo aunque el sistema este bien.
SOL_URL="http://localhost:8080"; NOT_URL="http://localhost:8081"; GRAFANA="http://localhost:3000"; LOKI_URL="http://localhost:3100"
SOL="servicio-solicitudes"; NOT="servicio-notificaciones"
echo "== PRUEBA DE HUMO — ARKA ensamblado (6 capas) =="

echo "-- levantando el sistema completo..."
docker compose up -d --build >/tmp/smoke.log 2>&1 || { echo "[X] no levantó:"; tail -5 /tmp/smoke.log; echo "HUMO: 0/${TOTAL}"; exit 0; }
for i in $(seq 1 40); do curl -sf "$SOL_URL/actuator/health" >/dev/null 2>&1 && break; sleep 3; done

echo "-- (1) salud: ambos servicios responden UP..."
if curl -sf "$SOL_URL/actuator/health" | grep -qi '"status":"UP"' && curl -sf "$NOT_URL/actuator/health" | grep -qi '"status":"UP"'; then echo "[OK] (1) servicios arriba"; PASS=$((PASS+1)); else echo "[X] (1) algun servicio no responde"; fi

echo "-- preparar: crear una solicitud nueva para la prueba (ID real de la API, no uno inventado)..."
CREAR_RESP=$(curl -sf -X POST "$SOL_URL/solicitudes/crear" 2>/dev/null)
ID=$(echo "$CREAR_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$ID" ] && echo "[X] no se pudo crear la solicitud de prueba (ver /solicitudes/crear)"

echo "-- (2) camino critico: enviar una solicitud..."
curl -sf -X POST "$SOL_URL/solicitudes/$ID/enviar" >/dev/null 2>&1 && { echo "[OK] (2) enviar respondió"; PASS=$((PASS+1)); } || echo "[X] (2) enviar falló"
sleep 2

echo "-- (3) persistencia: la solicitud quedó ENVIADA..."
if curl -sf "$SOL_URL/solicitudes/$ID" 2>/dev/null | grep -qi 'ENVIADA'; then echo "[OK] (3) estado persistido"; PASS=$((PASS+1)); else echo "[X] (3) el estado no persistió"; fi

echo "-- (4) evento cruzó: notificaciones tiene el aviso..."
# el relevador del outbox (RelevadorDeEventosPendientes) corre cada 5s
# (fixedDelay=5000) en vez de publicar en el acto, asi que se espera en
# vez de chequear una sola vez tras un sleep fijo.
OK4=0
for i in $(seq 1 12); do
  curl -sf "$NOT_URL/notificaciones" 2>/dev/null | grep -qi "$ID" && { OK4=1; break; }
  sleep 1
done
if [ "$OK4" = "1" ]; then echo "[OK] (4) el evento cruzó entre servicios"; PASS=$((PASS+1)); else echo "[X] (4) el aviso no llegó a notificaciones"; fi

# (5) la idempotencia real vive en ConsumoIdempotente (dedup por eventoId).
# No se puede probar reenviando 'enviar': la solicitud ya quedó ENVIADA y un
# segundo enviar() lanza IllegalStateException (exige BORRADOR), asi que no
# genera ningun evento nuevo que probar. Se prueba en su lugar reenviando el
# MISMO evento (mismo eventoId) directo al consumidor, como expone
# EventoController en /eventos/solicitud-enviada.
echo "-- (5) idempotencia: reenviar el mismo evento (mismo eventoId) no duplica..."
EVT_ID="smoke-idemp-$ID"
EVT_BODY="{\"id\":\"$ID\",\"tipo\":\"Incidencia\",\"eventoId\":\"$EVT_ID\"}"
curl -sf -X POST "$NOT_URL/eventos/solicitud-enviada" -H 'Content-Type: application/json' -d "$EVT_BODY" >/dev/null 2>&1
BEFORE=$(curl -sf "$NOT_URL/notificaciones" 2>/dev/null | grep -o "$ID" | wc -l | tr -d ' ')
curl -sf -X POST "$NOT_URL/eventos/solicitud-enviada" -H 'Content-Type: application/json' -d "$EVT_BODY" >/dev/null 2>&1
AFTER=$(curl -sf "$NOT_URL/notificaciones" 2>/dev/null | grep -o "$ID" | wc -l | tr -d ' ')
[ "$BEFORE" = "$AFTER" ] && { echo "[OK] (5) sin duplicado"; PASS=$((PASS+1)); } || echo "[X] (5) posible duplicado (antes=$BEFORE despues=$AFTER)"

echo "-- (6) observabilidad: el tablero responde y Loki recibió logs de $SOL..."
LOKI_END=$(date +%s); LOKI_START=$((LOKI_END - 3600))
if curl -sf "$GRAFANA/api/health" >/dev/null 2>&1 && curl -sf -G "$LOKI_URL/loki/api/v1/query_range" --data-urlencode "query={service=\"$SOL\"}" --data-urlencode "start=${LOKI_START}000000000" --data-urlencode "end=${LOKI_END}000000000" --data-urlencode "limit=1" 2>/dev/null | grep -q '"values"'; then echo "[OK] (6) Grafana arriba y Loki tiene logs de $SOL"; PASS=$((PASS+1)); else echo "[X] (6) el tablero no responde o Loki no recibió logs de $SOL"; fi

echo "-- limpieza..."; docker compose down >/dev/null 2>&1
echo ""; echo "HUMO: ${PASS}/${TOTAL}"
[ "$PASS" -eq "$TOTAL" ] && echo "El sistema ensamblado prende y respira." || echo "Ensamblaje incompleto — revisa la capa que falló."
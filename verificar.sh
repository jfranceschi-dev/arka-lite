#!/usr/bin/env bash
# Verificador del Lab S48 — atomicidad desde el adaptador. Córrelo desde 'ejemplo/'.
# Requiere Docker. Prueba que una operación de DOS escrituras es TODO-o-NADA.
#  ->  bash verificar.sh
set -u
PASS=0; TOTAL=5
echo "== S48: transacción atómica desde el adaptador (5 compuertas) =="
command -v docker >/dev/null 2>&1 || { echo "[X] Docker no instalado"; exit 1; }

DB(){ docker compose exec -T base-datos psql -U arka -d arka -tAc "$1" 2>/dev/null | tr -d '[:space:]'; }

echo "-- (5) conexión a la base por NOMBRE, vía config (estático)..."
if grep -rqiE 'DB_URL' compose.yaml && grep -riE 'DB_URL' compose.yaml | grep -qiE 'base-datos' && ! grep -riE 'DB_URL' compose.yaml | grep -qiE 'localhost'; then
  echo "[OK] (5) DB_URL apunta a 'base-datos' por config"; PASS=$((PASS+1))
else echo "[X] (5) la URL de la base debe usar el nombre 'base-datos', no localhost"; fi

echo "-- levantando ARKA + Postgres (docker compose up)..."
if docker compose up -d --build >/tmp/c24.log 2>&1; then
  # esperar a que el servicio responda
  for i in $(seq 1 30); do curl -sf http://localhost:8080/solicitudes >/dev/null 2>&1 && break; sleep 3; done
else echo "[X] no levantó:"; tail -5 /tmp/c24.log; echo "PUNTAJE: ${PASS}/${TOTAL}"; exit 0; fi

echo "-- (1) la base responde y tiene la tabla solicitud..."
if [ "$(DB "SELECT 1")" = "1" ] && [ -n "$(DB "SELECT to_regclass('solicitud')")" ]; then echo "[OK] (1) base y esquema arriba"; PASS=$((PASS+1)); else echo "[X] (1) la base o la tabla no están"; fi

# sembrar dos solicitudes en BORRADOR para las pruebas
DB "INSERT INTO solicitud(id,tipo,estado) VALUES ('LAB-OK','Incidente','BORRADOR') ON CONFLICT DO NOTHING" >/dev/null
DB "INSERT INTO solicitud(id,tipo,estado) VALUES ('LAB-FALLO','Cambio','BORRADOR') ON CONFLICT DO NOTHING" >/dev/null

echo "-- (2) camino BUENO: enviar escribe en las DOS tablas..."
curl -s -X POST http://localhost:8080/solicitudes/LAB-OK/enviar >/dev/null 2>&1; sleep 1
EST=$(DB "SELECT estado FROM solicitud WHERE id='LAB-OK'")
EV=$(DB "SELECT count(*) FROM evento WHERE solicitud_id='LAB-OK'")
if [ "$EST" = "ENVIADA" ] && [ "$EV" = "1" ]; then echo "[OK] (2) estado=ENVIADA y 1 evento (ambas escrituras)"; PASS=$((PASS+1)); else echo "[X] (2) faltó una escritura (estado=$EST eventos=$EV)"; fi

echo "-- (3) camino con FALLO: la operación revienta a mitad..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/solicitudes/LAB-FALLO/enviar-con-fallo 2>/dev/null)
echo "   (respondió $CODE — se espera un error, la operación debía fallar)"
sleep 1

echo "-- (4) ATOMICIDAD: tras el fallo, NO quedan datos parciales..."
EST2=$(DB "SELECT estado FROM solicitud WHERE id='LAB-FALLO'")
EV2=$(DB "SELECT count(*) FROM evento WHERE solicitud_id='LAB-FALLO'")
if [ "$EST2" = "BORRADOR" ] && [ "$EV2" = "0" ]; then
  echo "[OK] (3-4) rollback: LAB-FALLO sigue en BORRADOR y sin eventos (nada a medias)"; PASS=$((PASS+2))
else
  echo "[X] (3-4) quedó dato parcial (estado=$EST2 eventos=$EV2): la operación NO fue atómica (¿falta @Transactional?)"
fi

echo "-- limpieza..."; docker compose down >/dev/null 2>&1
echo ""; echo "PUNTAJE: ${PASS}/${TOTAL}"
[ "$PASS" -eq "$TOTAL" ] && echo "Operación atómica: dos tablas, todo o nada, verificado contra la base." || echo "Aun no."

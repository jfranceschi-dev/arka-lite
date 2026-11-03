#!/usr/bin/env bash
# Levanta ARKA-Lite completo dentro del Codespace para la demostración en vivo.
# El Codespace lo ejecuta solo al arrancar; también se puede repetir a mano:
#   bash .devcontainer/levantar.sh                  construye si hace falta y levanta
#   bash .devcontainer/levantar.sh --solo-construir solo construye las imágenes
set -euo pipefail
cd "$(dirname "$0")/.."

# 1. Docker dentro del contenedor tarda unos segundos en arrancar.
for _ in $(seq 1 60); do docker info >/dev/null 2>&1 && break; sleep 2; done
docker info >/dev/null 2>&1 || { echo "Docker no arrancó dentro del contenedor."; exit 1; }

# 2. En Codespaces el navegador no llega a localhost: cada puerto reenviado
#    tiene su propia dirección https. Con ellas se arman los enlaces a Swagger
#    y Grafana de la pestaña Salud, y quedan en .env, que Compose lee solo.
#    Un .env escrito a mano no se toca.
MARCA="# Generado por .devcontainer/levantar.sh"
if [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
  if [ -f .env ] && ! grep -qF "$MARCA" .env; then
    echo "Hay un .env propio: no se reemplaza. Los enlaces a Swagger y Grafana pueden apuntar a localhost."
  else
    publica() { echo "https://${CODESPACE_NAME}-$1.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"; }
    {
      echo "$MARCA: direcciones públicas del Codespace."
      echo "ARKA_URL_PUBLICA_SOLICITUDES=$(publica "${SOLICITUDES_PORT:-18080}")"
      echo "ARKA_URL_PUBLICA_NOTIFICACIONES=$(publica "${NOTIFICACIONES_PORT:-18081}")"
      echo "ARKA_URL_PUBLICA_GRAFANA=$(publica 3000)"
      # El proxy de Codespaces atiende por https y avisa con X-Forwarded-*;
      # así Swagger arma bien la dirección de "Try it out".
      echo "ARKA_FORWARD_HEADERS=framework"
    } > .env
    echo "Enlaces del Codespace escritos en .env."
  fi
fi

# 3. Construir (solo lo que cambió) y levantar.
if [ "${1:-}" = "--solo-construir" ]; then
  docker compose build
  exit 0
fi
docker compose up --build -d

# 4. Esperar a que la UI vea los dos servicios.
echo "Esperando a que los servicios respondan..."
for _ in $(seq 1 60); do
  if curl -sf http://localhost:8088/api/salud/solicitudes >/dev/null 2>&1 && curl -sf http://localhost:8088/api/salud/notificaciones >/dev/null 2>&1; then
    echo "ARKA-Lite está arriba. Abre la pestaña PORTS y el puerto 8088 (UI de ARKA-Lite)."
    exit 0
  fi
  sleep 3
done
echo "Los servicios todavía no responden; revisa con: docker compose ps"
exit 1

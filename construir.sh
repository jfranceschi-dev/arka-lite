#!/usr/bin/env bash
# Construye las dos imagenes de ARKA. Con el Kubernetes de Docker Desktop NO hay que
# cargarlas: el cluster comparte el daemon de Docker y ya ve las :local.
set -e
for S in servicio-solicitudes servicio-notificaciones; do
  echo "== construyendo $S:local =="
  docker build -t "$S:local" "./$S"
done
echo "Listo. Ahora: kubectl apply -f k8s/"

#!/usr/bin/env bash
# Construye las imagenes de ARKA (dos servicios y arka-lite-ui). Si el contexto activo es minikube,
# tambien las carga en ese cluster. Docker Desktop las ve directamente.
set -e
CONTEXTO=$(kubectl config current-context 2>/dev/null || true)
for S in servicio-solicitudes servicio-notificaciones arka-lite-ui; do
  echo "== construyendo $S:local =="
  docker build -t "$S:local" "./$S"
  if [ "$CONTEXTO" = minikube ]; then
    echo "== cargando $S:local en minikube =="
    minikube image load "$S:local"
  fi
done
echo "Listo. Ahora: kubectl apply -f k8s/"

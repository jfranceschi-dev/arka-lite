# Operaciones

Material para construir, ejecutar y diagnosticar la solución.

- [Docker y Docker Compose](docker-y-compose.md)
- [Kubernetes local con Docker Desktop](kubernetes-local.md)
- [Limpieza de Kubernetes local](kubernetes-limpieza.md)
- [Diagnóstico del esquema y arranque](correccion-arranque.md)

## Scripts de apoyo

Se ejecutan desde la raíz con Bash (por ejemplo, Git Bash o WSL con acceso a Docker):

| Script | Uso |
| --- | --- |
| `bash construir.sh` | Construye ambas imágenes `:local` y las carga en minikube si ese es el contexto activo. |
| `bash smoke.sh` | Levanta Compose y comprueba seis capas del sistema. |
| `bash verificar_sistema.sh` | Ejecuta ocho comprobaciones del laboratorio; requiere Kubernetes de Docker Desktop. |

Los scripts pueden construir imágenes y modificar el entorno local. Revisa el resultado de cada comprobación: `smoke.sh` puede terminar con código cero incluso si falla el arranque, por lo que no sustituye una validación de CI.

Volver al [índice general](../README.md).

# ci.yml: creación y ejecución en GitHub

El archivo vigente es `.github/workflows/ci.yml`. `.yaml` también es válido. El nombre es libre, pero el directorio `.github/workflows` es obligatorio. Esta guía no cambia el workflow ni crea ejecuciones remotas.

## Cómo se hace desde GitHub

1. Abrir el repositorio y entrar en **Code**.
2. Para un repositorio nuevo, usar **Add file > Create new file** y escribir `.github/workflows/ci.yml`. En ARKA-Lite, abrir el archivo existente y editarlo.
3. Escribir el YAML con espacios, conservando la jerarquía. También se puede empezar desde **Actions > New workflow > set up a workflow yourself**.
4. Guardar el cambio en una rama y abrir un Pull Request hacia `main`.
5. Abrir **Actions**, seleccionar **CI-Arkalitos** y elegir la ejecución correspondiente al SHA del cambio.
6. Abrir cada job de la matriz y expandir sus pasos. El PR también enlaza los checks.
7. Corregir fallos mediante otro commit en la rama y revisar la nueva ejecución.

No crear un segundo archivo con los mismos eventos para renombrar el primero: ambos podrían ejecutarse. Con la configuración actual, un push a una rama sin PR no dispara por sí solo este workflow. No hay botón de ejecución manual porque no se declara `workflow_dispatch`.

## Lectura del YAML real

| Clave | Qué significa en ARKA-Lite |
| --- | --- |
| `name` | Nombre visible del workflow: CI-Arkalitos. |
| `on.push.branches` | Disparar cuando llegan commits a main. |
| `on.pull_request` | Disparar ante los eventos predeterminados de PR. |
| `jobs` | Trabajos que ejecutará GitHub. |
| `runs-on` | Runner Ubuntu alojado por GitHub. |
| `strategy.matrix.include` | Un job por cada par servicio/base de datos. |
| `services.postgres` | PostgreSQL temporal disponible para ese job. |
| `env` | Variables que usa la aplicación durante CI. |
| `steps` | Secuencia de acciones o comandos dentro del job. |
| `uses` y `with` | Acción reutilizable y sus parámetros. |
| `run` | Comando de shell ejecutado en el runner. |
| `working-directory` | Carpeta del servicio, que contiene su pom.xml. |
| `if` | Condición, por ejemplo para probar arranque solo en solicitudes. |
| `permissions` | Alcance del token del job. |
| `secrets.GITHUB_TOKEN` | Token provisto por GitHub para autenticación del job. |
| `github.sha` | Commit usado como etiqueta de la imagen. |

## Workflow completo del repositorio

Copia para explicación de la configuración revisada. Mantener sincronizada con el archivo fuente si cambia la implementación. Las versiones de acciones son las del proyecto.

```yaml
name: CI-Arkalitos

# define las acciones que ejecutan el pipeline
on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  construir-probar-publicar:
    runs-on: ubuntu-latest
    permissions: {contents: read, packages: write}

    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_DB: ${{ matrix.base_datos }}
          POSTGRES_USER: arka
          POSTGRES_PASSWORD: ${{ github.run_id }}
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U arka -d ${{ matrix.base_datos }}"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 10

    env:
      DB_URL: jdbc:postgresql://localhost:5432/${{ matrix.base_datos }}
      DB_USER: arka
      DB_PASSWORD: ${{ github.run_id }}

    strategy:
      matrix:
        include:
          - servicio: servicio-solicitudes
            base_datos: db-solicitudes
          - servicio: servicio-notificaciones
            base_datos: db-notificaciones

    steps:
      - name: Traer el codigo
        uses: actions/checkout@v4

      - name: Preparar java 26
        uses: actions/setup-java@v4
        with: {distribution: temurin, java-version: '26', cache: maven}

      - name: Compilar y Probar cada servicio
        run: mvn -B verify
        working-directory: ${{ matrix.servicio }}

      - name: Verificar arranque de solicitudes con PostgreSQL
        if: matrix.servicio == 'servicio-solicitudes'
        working-directory: ${{ matrix.servicio }}
        run: |
          java -jar target/servicio-solicitudes-*.jar > /tmp/solicitudes.log 2>&1 &
          APP_PID=$!
          trap 'kill "$APP_PID" 2>/dev/null || true' EXIT
          for intento in $(seq 1 60); do
            if curl --fail --silent http://localhost:8080/solicitudes | grep -q 'CAM-002'; then
              exit 0
            fi
            if ! kill -0 "$APP_PID" 2>/dev/null; then
              cat /tmp/solicitudes.log
              exit 1
            fi
            sleep 2
          done
          cat /tmp/solicitudes.log
          exit 1

      - name: login al registro
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Construir y publicar
        working-directory: ${{ matrix.servicio }}
        run: |
          REPO_NAME=$(echo "${{ github.repository }}" | tr '[:upper:]' '[:lower:]')
          IMG=ghcr.io/$REPO_NAME/${{ matrix.servicio }}:${{ github.sha }}
          docker build -t "$IMG" .
          docker push "$IMG"
```

## Qué observar en Actions

- Confirmar rama, evento y SHA antes de leer resultados.
- La matriz produce ejecuciones para ambos microservicios. Revisar ambos resultados.
- Expandir el paso fallido y buscar la primera causa, no solo el último mensaje de error.
- Un fallo de compilación o pruebas detiene normalmente los pasos posteriores de ese job.
- El job de solicitudes comprueba además que el JAR arranque con PostgreSQL y responda con CAM-002.
- El login y push se intentan también en PR. Los permisos pueden impedir publicar, en especial desde forks.
- Un resultado verde y una imagen en GHCR no prueban que Kubernetes haya desplegado esa versión: el workflow no incluye despliegue.

## Evolución propuesta

Separar la validación de PR de la publicación en main. Agregar `workflow_dispatch` solo si se necesita ejecución manual. Definir checks requeridos en las reglas de la rama si se desea impedir integrar cambios con CI fallida. Estas configuraciones se deben implementar y verificar por separado, no se presumen existentes.

## Referencias oficiales

- [Crear el primer workflow](https://docs.github.com/en/actions/get-started/quickstart)
- [Componentes de GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions)
- [Revisar logs de una ejecución](https://docs.github.com/en/actions/how-tos/monitor-workflows/use-workflow-run-logs)

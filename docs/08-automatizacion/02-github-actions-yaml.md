# GitHub Actions y archivos YAML

El archivo activo del proyecto se explica en [Pipeline actual](01-pipeline-actual.md). Los otros workflows de ejemplo de esta guía son material didáctico y no se ejecutan desde `docs/`.

Esta guía explica qué archivos YAML reconoce GitHub, cómo descubre varios workflows y cómo organizarlos sin asumir experiencia previa con GitHub Actions.

Los ejemplos de esta carpeta son documentación. GitHub no los ejecutará mientras permanezcan dentro de `docs/`.

## Qué es YAML

YAML es un formato de texto para expresar configuración mediante claves, valores y listas:

```yaml
name: CI

on:
  push:
    branches:
      - main
```

Reglas básicas:

- La indentación define la estructura.
- Se usan espacios, nunca tabuladores.
- Una clave termina con `:`.
- Los elementos de una lista empiezan con `-`.
- Las cadenas pueden escribirse con o sin comillas; conviene usar comillas si contienen caracteres especiales.
- `.yml` y `.yaml` son extensiones válidas para workflows.

## GitHub no ejecuta cualquier archivo `.yml`

La herramienta que reconoce un YAML depende de su ruta y nombre:

| Ruta | Quién la reconoce | Uso |
| --- | --- | --- |
| `.github/workflows/*.yml` o `*.yaml` | GitHub Actions | Workflows de CI, seguridad, publicación y despliegue. |
| `.github/dependabot.yml` o `.yaml` | Dependabot | Actualizaciones de dependencias. |
| `ruta/action.yml` o `action.yaml` | GitHub Actions cuando esa ruta se usa como acción | Metadata de una acción personalizada. |
| `compose.yaml` | Docker Compose | Servicios, imágenes, puertos y redes. |
| `application.yml` | Spring Boot | Configuración de una aplicación Java. |
| `docs/**/*.yml` | Ninguna automatización por sí sola | Ejemplos y documentación. |

La extensión no define por sí misma el comportamiento. La ubicación y la herramienta que lee el archivo son las que importan.

GitHub busca workflows en `.github/workflows/` dentro del commit o referencia que produjo el evento. Cada workflow debe estar directamente en esa carpeta; GitHub no admite subcarpetas dentro de `workflows`.

La documentación oficial confirma la ubicación y extensiones en [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) y explica que cada workflow es un archivo separado en [Creating an example workflow](https://docs.github.com/en/actions/tutorials/create-an-example-workflow).

## Estructura recomendada para GitHub

Cuando se implemente la automatización, puede usarse esta estructura:

```text
.github/
├── workflows/
│   ├── ci.yml
│   ├── seguridad.yml
│   ├── publicar-imagenes.yml
│   ├── desplegar.yml
│   └── reutilizable-java.yml
├── dependabot.yml
├── CODEOWNERS
├── pull_request_template.md
└── ISSUE_TEMPLATE/
```

Los workflows no se colocan dentro de carpetas como `.github/workflows/ci/` o `.github/workflows/deploy/`. Para ordenarlos se usan:

- Nombres de archivo descriptivos.
- El campo `name` dentro de cada YAML.
- Prefijos consistentes si la lista crece, por ejemplo `ci-`, `security-`, `release-` y `deploy-`.
- Workflows reutilizables para evitar copiar pasos.

## Cómo reconoce GitHub varios workflows

GitHub carga todos los archivos `.yml` y `.yaml` válidos que estén directamente en `.github/workflows/`. Cada archivo representa un workflow independiente.

Ejemplo:

```text
.github/workflows/ci.yml
.github/workflows/seguridad.yml
.github/workflows/desplegar.yml
```

Un mismo `push` puede iniciar los tres si los tres declaran ese evento. El nombre del archivo no decide cuándo se ejecuta; lo decide la sección `on`.

```yaml
name: Seguridad semanal

on:
  schedule:
    - cron: '0 10 * * 1'
  workflow_dispatch:
```

Este workflow se ejecuta por horario o manualmente aunque el archivo se llame `seguridad.yml`. Renombrarlo no cambia sus eventos, pero sí puede romper otro workflow que lo invoque por ruta.

## Componentes de un workflow

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  probar:
    runs-on: ubuntu-latest
    steps:
      - name: Traer el código
        uses: actions/checkout@v7

      - name: Mostrar Java
        run: java --version
```

| Componente | Función |
| --- | --- |
| `name` | Nombre visible en la pestaña Actions. |
| `on` | Eventos que inician el workflow. |
| `permissions` | Acceso concedido al `GITHUB_TOKEN`. |
| `jobs` | Trabajos que ejecutará GitHub. |
| `runs-on` | Tipo de runner que ejecuta un trabajo. |
| `steps` | Pasos secuenciales dentro del trabajo. |
| `uses` | Ejecuta una acción existente. |
| `run` | Ejecuta un comando de terminal. |
| `with` | Entrega parámetros a una acción. |
| `env` | Define variables de entorno. |
| `needs` | Hace que un trabajo espere y dependa de otro. |
| `if` | Condición que decide si se ejecuta. |
| `strategy.matrix` | Repite un trabajo para varios valores, como los dos microservicios. |
| `environment` | Asocia el trabajo con desarrollo, preproducción o producción. |

Los trabajos se ejecutan en paralelo de forma predeterminada. Para establecer orden:

```yaml
jobs:
  probar:
    runs-on: ubuntu-latest
    steps:
      - run: echo "pruebas"

  desplegar:
    needs: probar
    runs-on: ubuntu-latest
    steps:
      - run: echo "despliegue"
```

Aquí `desplegar` solo comienza después de que `probar` termine correctamente.

## Eventos más utilizados

| Evento | Momento de ejecución | Uso habitual |
| --- | --- | --- |
| `push` | Al publicar commits o etiquetas. | Validar `main`, publicar imágenes o desplegar. |
| `pull_request` | Al abrir o actualizar un PR. | Compilar y probar antes del merge. |
| `workflow_dispatch` | Cuando una persona lo inicia. | Despliegues controlados o diagnósticos. |
| `schedule` | En un horario cron. | Escaneos o mantenimiento periódico. |
| `workflow_call` | Cuando lo invoca otro workflow. | Reutilizar automatización. |
| `workflow_run` | Después de otro workflow. | Encadenar workflows independientes cuando sea necesario. |

En `pull_request`, `branches: [main]` se refiere a la rama destino. Un PR desde `feat/nueva-api` hacia `main` coincide con el filtro.

## Organización recomendada para ARKA-Lite

No hace falta crear todos los archivos desde el primer día. Se recomienda incorporarlos en este orden:

| Archivo | Evento | Responsabilidad |
| --- | --- | --- |
| `ci.yml` (actual) | PR y push a `main` | Verificar ambos Maven y publicar imágenes SHA en GHCR; ver [pipeline actual](01-pipeline-actual.md). |
| `seguridad.yml` | PR y horario semanal | Revisar dependencias, secretos e imágenes. |
| `publicar-imagenes.yml` | Etiquetas `v*` o workflow reutilizable | Publicar imágenes identificadas por versión y SHA. |
| `desplegar.yml` | Manual o ramas acordadas | Promover una imagen existente entre ambientes. |
| `reutilizable-java.yml` | `workflow_call` | Centralizar pasos comunes si aparece duplicación real. |

El `ci.yml` ya existe. Los demás archivos son posibles ampliaciones, documentadas en [CI/CD, ramas y ambientes](03-ci-cd-y-ambientes.md). Separar seguridad, publicación y despliegue puede ayudar cuando tienen permisos, responsables y eventos diferentes.

No conviene crear un workflow distinto por cada comando. Pasos relacionados pueden vivir dentro del mismo trabajo y trabajos relacionados dentro del mismo workflow.

## Un workflow para los dos microservicios

ARKA-Lite puede usar una matriz:

```yaml
jobs:
  verificar:
    strategy:
      matrix:
        servicio:
          - servicio-solicitudes
          - servicio-notificaciones
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-java@v6
        with:
          distribution: temurin
          java-version: '26'
          cache: maven
          cache-dependency-path: ${{ matrix.servicio }}/pom.xml

      - name: Probar
        working-directory: ${{ matrix.servicio }}
        run: mvn --batch-mode verify
```

GitHub crea una ejecución de `verificar` para cada valor de `matrix.servicio`. Así se mantiene un solo bloque de configuración sin olvidar uno de los proyectos.

## Reutilizar sin duplicar YAML

Un workflow reutilizable también vive directamente en `.github/workflows/` y declara `workflow_call`:

```yaml
# .github/workflows/reutilizable-java.yml
name: Verificar servicio Java

on:
  workflow_call:
    inputs:
      servicio:
        required: true
        type: string

jobs:
  verificar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: mvn --batch-mode verify
        working-directory: ${{ inputs.servicio }}
```

Otro workflow puede llamarlo:

```yaml
jobs:
  solicitudes:
    uses: ./.github/workflows/reutilizable-java.yml
    with:
      servicio: servicio-solicitudes
```

Los workflows reutilizables se invocan en el nivel del trabajo mediante `uses`, no como un paso. GitHub describe esta diferencia y confirma que las subcarpetas no están admitidas en [Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows).

Para pocos pasos, una matriz suele ser más sencilla que un workflow reutilizable. Se extrae uno cuando varios workflows repiten una secuencia completa.

## Variables, secretos y ambientes

```yaml
jobs:
  desplegar:
    environment: preproduccion
    env:
      APP_URL: ${{ vars.APP_URL }}
      DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

- `vars` contiene valores no sensibles.
- `secrets` contiene credenciales o tokens.
- `environment` selecciona variables, secretos y reglas del destino.
- Los secretos nunca se escriben directamente en el YAML.

Los ambientes y la promoción por ramas están explicados en [CI/CD, ramas y ambientes](03-ci-cd-y-ambientes.md).

## `dependabot.yml` no es un workflow

Dependabot usa una ubicación propia:

```text
.github/dependabot.yml
```

No debe colocarse dentro de `.github/workflows/`. Su estructura tampoco contiene `on`, `jobs` ni `steps`:

```yaml
version: 2
updates:
  - package-ecosystem: maven
    directory: /servicio-solicitudes
    schedule:
      interval: weekly
```

GitHub documenta ambas extensiones permitidas y la ubicación exacta en [About the dependabot.yml file](https://docs.github.com/en/code-security/concepts/supply-chain-security/about-the-dependabot-yml-file).

## `action.yml` tampoco es un workflow

`action.yml` describe una acción personalizada que un workflow puede usar. Puede vivir en una carpeta como:

```text
.github/actions/preparar-java/action.yml
```

Un workflow la invoca como un paso:

```yaml
- name: Preparar proyecto
  uses: ./.github/actions/preparar-java
```

Una acción agrupa pasos reutilizables dentro de un trabajo. Un workflow reutilizable puede agrupar trabajos completos. La [documentación de acciones personalizadas](https://docs.github.com/en/actions/concepts/workflows-and-actions/custom-actions) explica el archivo `action.yml`.

No se necesita una acción personalizada mientras los pasos del proyecto sean breves y claros.

## Cómo activar un workflow

1. Crear el archivo directamente en `.github/workflows/`.
2. Escribir un YAML válido con al menos un evento y un trabajo.
3. Confirmarlo en Git y publicarlo en GitHub.
4. Comprobar que GitHub Actions esté habilitado en el repositorio.
5. Producir uno de los eventos declarados o usar `workflow_dispatch`.
6. Abrir la pestaña **Actions** y seleccionar el nombre definido en `name`.
7. Revisar cada trabajo y paso si falla.

Ejemplo:

```powershell
New-Item -ItemType Directory -Force .github\workflows
New-Item -ItemType File .github\workflows\ci.yml
git add .github/workflows/ci.yml
git commit -m "ci: verificar los microservicios"
git push
```

Un YAML dentro de `docs/08-automatizacion/` nunca se activa con estos pasos. Debe copiarse y adaptarse a `.github/workflows/` cuando el equipo decida implementarlo.

## Cómo validar y diagnosticar

- Revisar la indentación y evitar tabuladores.
- Confirmar que el archivo termine en `.yml` o `.yaml`.
- Confirmar que esté directamente en `.github/workflows/`.
- Revisar la pestaña Actions para errores de sintaxis.
- Verificar que el evento y los filtros de rama coincidan.
- Comprobar los nombres exactos de secretos y variables.
- Usar `workflow_dispatch` mientras se prueba una automatización nueva.
- Mantener `permissions` con el mínimo acceso necesario.
- Añadir `timeout-minutes` para evitar ejecuciones sin límite.

Si el workflow no aparece, las causas más frecuentes son ruta incorrecta, YAML inválido, Actions deshabilitado o ausencia del evento configurado.

## Seguridad básica

- No imprimir secretos ni respuestas que los contengan.
- Usar acciones de editores confiables y revisar sus versiones.
- Fijar acciones a un SHA cuando el control de cadena de suministro lo requiera.
- Evitar ejecutar código no confiable con secretos.
- Revisar cuidadosamente `pull_request_target`; se ejecuta con el contexto de la rama base y puede exponer permisos si se usa incorrectamente.
- Separar CI de despliegue cuando necesiten permisos distintos.
- Exigir aprobación en el ambiente de producción.

## Regla práctica

Use carpetas para organizar la documentación y las acciones personalizadas. Mantenga los workflows planos dentro de `.github/workflows/`, con nombres como:

```text
ci.yml
security-weekly.yml
release-images.yml
deploy-environments.yml
reusable-java-service.yml
```

El nombre explica el propósito; `name`, `on`, `jobs` y `environment` explican cómo funciona.

# Integración continua, ramas y ambientes

> **Estado:** este documento reúne propuestas de evolución. El workflow que se ejecuta hoy está explicado en [Pipeline actual](01-pipeline-actual.md). Los ejemplos de despliegue, ambientes y archivos adicionales de esta página no están implementados en el repositorio.

Esta guía propone cómo evolucionar el CI y añadir ambientes y despliegue. El repositorio **sí contiene** `.github/workflows/ci.yml`; consulte [su comportamiento actual](01-pipeline-actual.md) antes de usar los ejemplos de esta página.

Si es la primera vez que trabaja con YAML o tiene dudas sobre cómo GitHub reconoce varios archivos, comenzar por [GitHub Actions y archivos YAML](02-github-actions-yaml.md).

## Conceptos básicos

- **Integración continua (CI)** compila y prueba cada cambio antes de integrarlo.
- **Entrega o despliegue continuo (CD)** publica imágenes y despliega una versión.
- Un **workflow** es un archivo YAML con uno o más trabajos automatizados.
- Un **runner** es la máquina temporal que ejecuta esos trabajos.
- Un **ambiente de GitHub** representa un destino como desarrollo o producción y puede tener variables, secretos y aprobaciones.

El CI y la publicación de imágenes ya existen. Un despliegue automático requeriría definir la plataforma de destino, los permisos y los secretos.

## Dónde vive `ci.yml`

GitHub detecta el workflow existente en `.github/workflows/ci.yml`. No cree otro archivo con ese nombre para seguir esta guía. Los ejemplos posteriores ilustran una posible revisión del workflow; YAML usa espacios y no tabuladores.

## Variante propuesta del CI

ARKA-Lite tiene dos `pom.xml` y dos Dockerfile vigentes. Esta matriz ejecuta el mismo trabajo una vez por microservicio:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  construir-y-probar:
    name: Verificar ${{ matrix.servicio }}
    runs-on: ubuntu-latest
    timeout-minutes: 15
    strategy:
      fail-fast: false
      matrix:
        servicio:
          - servicio-solicitudes
          - servicio-notificaciones

    steps:
      - name: Traer el código
        uses: actions/checkout@v7

      - name: Preparar Java 26
        uses: actions/setup-java@v6
        with:
          distribution: temurin
          java-version: '26'
          cache: maven
          cache-dependency-path: ${{ matrix.servicio }}/pom.xml

      - name: Compilar y probar
        working-directory: ${{ matrix.servicio }}
        run: mvn --batch-mode --no-transfer-progress verify

      - name: Construir la imagen
        run: >-
          docker build
          -t arka-lite/${{ matrix.servicio }}:${{ github.sha }}
          ./${{ matrix.servicio }}
```

Las versiones mayores corresponden a la documentación oficial vigente al escribir esta guía. Antes de implementarlo se revisan [`actions/checkout`](https://github.com/actions/checkout) y [`actions/setup-java`](https://github.com/actions/setup-java). Para controles estrictos de cadena de suministro se fijan las acciones a un SHA completo y Dependabot propone actualizaciones.

## Explicación del workflow

`on` configura tres disparadores: publicación en `main`, Pull Requests dirigidos a `main` y ejecución manual.

`permissions: contents: read` da al token temporal solo lectura. Un trabajo futuro agrega únicamente los permisos que necesite para publicar o desplegar.

`concurrency` cancela la ejecución anterior de la misma rama cuando llega un commit nuevo.

`strategy.matrix` crea dos ejecuciones. `fail-fast: false` permite ver el resultado de ambas aunque una falle.

`actions/checkout` trae el repositorio y `actions/setup-java` instala Temurin 26. La caché se invalida de acuerdo con el `pom.xml` de cada servicio.

`mvn verify` compila, ejecuta las pruebas y verifica el paquete desde la carpeta correcta. `ubuntu-latest` ya incluye Maven. Para exigir la versión del Wrapper habría que conservar primero el bit ejecutable de ambos archivos `mvnw` en Git.

`docker build` también usa la carpeta correcta. La etiqueta contiene `github.sha`, el identificador inmutable del commit.

## Por qué el ejemplo de una aplicación debe adaptarse

Estos pasos ejecutados desde la raíz apuntan al proyecto legado o a un contexto sin Dockerfile vigente:

```yaml
- run: mvn -B verify
- run: docker build -t saludo:${{ github.sha }} .
```

La matriz corrige ambos contextos. El disparador sin filtros:

```yaml
on:
  push:
  pull_request:
```

se ejecuta en cualquier rama y PR. Es válido, pero puede verificar dos veces un commit cuando una rama publicada también tiene un PR.

## Configurar la ejecución por ramas

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
```

- En `push`, `branches` es la rama que recibió el commit.
- En `pull_request`, `branches` es la rama destino. Un PR de `feat/nueva-api` hacia `main` sí ejecuta el workflow.

Una política común es:

| Rama o evento | Uso | Automatización recomendada |
| --- | --- | --- |
| `feat/*`, `fix/*` con PR | Trabajo en revisión | Compilar, probar y construir imágenes sin publicarlas. |
| `develop` | Integración temprana, si el equipo la usa | CI y despliegue a desarrollo. |
| `main` | Versión estable | CI, publicación inmutable y despliegue a preproducción. |
| Etiqueta `v*` o ejecución manual | Entrega aprobada | Despliegue a producción. |

El flujo actual del equipo usa `main` y ramas cortas. No es obligatorio agregar `develop`: se puede crear un ambiente temporal para PRs, desplegar preproducción desde `main` y producción desde etiquetas.

Para limitar por rutas:

```yaml
on:
  pull_request:
    branches: [main]
    paths:
      - 'servicio-solicitudes/**'
      - 'servicio-notificaciones/**'
      - 'compose.yaml'
      - '.github/workflows/**'
```

Hay que coordinar `paths` con los estados obligatorios de merge. Si se omite todo el workflow, un estado requerido puede quedar pendiente. Para este proyecto pequeño es más claro ejecutar el CI completo y optimizar después.

## Probar la integración con Compose

Las pruebas Maven verifican cada servicio por separado. Se puede agregar este trabajo después del trabajo de matriz:

```yaml
  probar-integracion:
    name: Probar integración con Compose
    runs-on: ubuntu-latest
    needs: construir-y-probar
    timeout-minutes: 15

    steps:
      - name: Traer el código
        uses: actions/checkout@v7

      - name: Levantar los servicios
        run: docker compose up --build -d --wait

      - name: Probar el flujo
        shell: bash
        run: |
          curl --fail --request POST http://localhost:8080/solicitudes/crear
          curl --fail --request POST http://localhost:8080/solicitudes/INC-002/enviar
          curl --fail http://localhost:8081/notificaciones

      - name: Mostrar logs si algo falla
        if: failure()
        run: docker compose logs

      - name: Limpiar
        if: always()
        run: docker compose down --volumes
```

Más adelante esta prueba debe validar el contenido JSON y solicitudes debe tener su propio `healthcheck`. La limpieza usa `if: always()` para ejecutarse incluso después de un fallo.

## Exigir CI antes del merge

Después de que el workflow se ejecute al menos una vez:

1. Abrir **Settings > Rules > Rulesets**.
2. Crear una regla para `main`.
3. Exigir un Pull Request antes del merge.
4. Exigir las aprobaciones acordadas.
5. Exigir los estados de CI de ambos valores de la matriz.
6. Bloquear force push y eliminación de `main`.
7. Exigir que las conversaciones estén resueltas.

Los rulesets pueden exigir PRs, revisiones y estados aprobados, como explica la [documentación oficial de reglas](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

## Configurar varios ambientes en GitHub

Los ambientes de GitHub no son ramas ni perfiles de Spring. Son destinos con controles y valores propios. Se pueden crear `desarrollo`, `preproduccion` y `produccion`:

1. Abrir **Settings > Environments**.
2. Seleccionar **New environment**.
3. Agregar variables no sensibles, como `APP_URL`, `REGISTRY` o `IMAGE_NAMESPACE`.
4. Agregar secretos, como `DEPLOY_TOKEN`, solo cuando no sea posible usar identidad federada.
5. En producción, configurar revisores requeridos y restringir ramas o etiquetas.

Un trabajo accede al ambiente así:

```yaml
jobs:
  desplegar:
    environment:
      name: preproduccion
      url: ${{ vars.APP_URL }}
    runs-on: ubuntu-latest
    steps:
      - name: Desplegar
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: ./scripts/deploy.sh
```

El script es una referencia y todavía no existe en ARKA-Lite. El comando real depende de si se desplegará con Compose, Kubernetes o un servicio administrado.

Las variables se consultan con `vars.NOMBRE` y los secretos con `secrets.NOMBRE`. Nunca se escribe un secreto directamente en el YAML, en `compose.yaml` ni en un `.env` confirmado.

GitHub aplica las reglas antes de entregar secretos al trabajo. La [documentación de ambientes](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments) explica revisores, restricciones, secretos y registro de despliegues. Algunas opciones dependen del plan y de la visibilidad del repositorio.

## Promoción por rama y aprobación

Una estrategia inicial puede ser:

```text
Pull Request -> CI
develop      -> desarrollo
main         -> preproduccion
ejecución manual + aprobación -> produccion
```

Cada destino puede ser un trabajo separado:

```yaml
jobs:
  desarrollo:
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    environment: desarrollo
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: ./scripts/deploy.sh desarrollo

  preproduccion:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment: preproduccion
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: ./scripts/deploy.sh preproduccion

  produccion:
    if: github.event_name == 'workflow_dispatch'
    environment: produccion
    concurrency: produccion
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: ./scripts/deploy.sh produccion
```

El workflow que contenga estos trabajos debe declarar `push` para `develop` y `main`, además de `workflow_dispatch`. El ambiente `produccion` debe exigir aprobación y aceptar solo las ramas o etiquetas acordadas. `concurrency` evita dos despliegues productivos simultáneos. GitHub explica estos controles en su [guía de despliegues](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments).

No se recompila una imagen distinta por ambiente. CI publica una imagen identificada por versión o SHA y se promueve el mismo digest hasta producción. Así se despliega exactamente el artefacto probado.

## Configuración de aplicación por ambiente

GitHub Environment controla el proceso de despliegue. La aplicación también necesita configuración de ejecución.

Spring Boot admite variables como:

```text
SPRING_PROFILES_ACTIVE=desarrollo
NOTIFICACIONES_URL=http://servicio-notificaciones:8080/eventos/solicitud-enviada
```

Se pueden agregar archivos versionados sin secretos:

```text
application.properties
application-desarrollo.properties
application-preproduccion.properties
application-produccion.properties
```

Cada ambiente activa un perfil y entrega valores sensibles desde su sistema de secretos. Las contraseñas y tokens no se guardan en `application-*.properties`.

Para Compose se pueden superponer archivos:

```powershell
docker compose -f compose.yaml -f compose.desarrollo.yaml up -d
docker compose -f compose.yaml -f compose.produccion.yaml config
```

El archivo base contiene lo común. El segundo cambia puertos, límites, imágenes o variables. Siempre se revisa el resultado con `docker compose ... config`.

## Publicar imágenes

Cuando se elija un registro, el workflow debe:

1. Autenticarse mediante OIDC o un token de alcance mínimo.
2. Etiquetar cada imagen con el SHA y, para entregas, la versión.
3. Publicar las dos imágenes.
4. Registrar el digest producido.
5. Desplegar por digest o etiqueta inmutable.

```text
ghcr.io/organizacion/servicio-solicitudes:a1b2c3d...
ghcr.io/organizacion/servicio-solicitudes:1.2.0
```

`latest` puede existir como alias, pero no debe ser la única referencia de un despliegue.

## Qué agregar además de workflows

| Archivo o configuración | Para qué sirve |
| --- | --- |
| `.github/CODEOWNERS` | Solicitar automáticamente revisión de responsables por servicio. |
| `.github/pull_request_template.md` | Pedir descripción, pruebas, riesgos y verificación en cada PR. |
| `.github/ISSUE_TEMPLATE/` | Estandarizar errores y solicitudes de mejora. |
| `.github/dependabot.yml` | Proponer actualizaciones de Maven y GitHub Actions. |
| `CONTRIBUTING.md` | Explicar cómo preparar el entorno y aportar cambios. |
| `SECURITY.md` | Indicar cómo reportar vulnerabilidades en privado. |
| `CHANGELOG.md` o Releases | Registrar cambios por versión. |
| `docs/adr/` | Guardar decisiones de arquitectura y sus motivos. |
| Rulesets | Exigir PR, revisión y CI antes del merge. |
| Environments | Separar valores, permisos y aprobaciones de despliegue. |

Ejemplo futuro de `CODEOWNERS`, reemplazando equipos y usuarios:

```text
/servicio-solicitudes/      @equipo-solicitudes
/servicio-notificaciones/   @equipo-notificaciones
/compose.yaml               @equipo-plataforma
/.github/                   @equipo-plataforma
```

Ejemplo futuro de Dependabot:

```yaml
version: 2
updates:
  - package-ecosystem: maven
    directory: /servicio-solicitudes
    schedule:
      interval: weekly

  - package-ecosystem: maven
    directory: /servicio-notificaciones
    schedule:
      interval: weekly

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

Dependabot usa `.github/dependabot.yml` y crea Pull Requests, según su [documentación oficial](https://docs.github.com/en/code-security/concepts/supply-chain-security/about-the-dependabot-yml-file). Cada actualización pasa el mismo CI y revisión.

## Automatizaciones para agregar después

- Análisis estático y formato.
- Cobertura con un umbral acordado.
- Escaneo de dependencias, secretos e imágenes.
- Generación y publicación de SBOM.
- Pruebas de contrato e integración con Compose.
- Publicación de imágenes en un registro.
- Versiones y notas de entrega.
- Despliegue con aprobación y reversión comprobada.
- Pruebas de humo después del despliegue.

Cada verificación debe producir una señal útil y una acción clara.

## Lista antes de activar CI

- El YAML está en `.github/workflows/` y usa espacios.
- Se prueban ambos microservicios, no el `pom.xml` legado.
- Cada `docker build` usa la carpeta correcta.
- Los permisos del token son mínimos.
- No hay secretos escritos en archivos.
- El workflow se ejecutó antes de convertir sus estados en requisitos.
- Los nombres exactos de los estados se seleccionaron en el ruleset.
- Las versiones de las acciones fueron revisadas.
- Los despliegues usan ambientes, artefactos inmutables y los controles acordados.

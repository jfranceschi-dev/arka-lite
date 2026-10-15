# Docker y Docker Compose

Esta guía explica los archivos Docker del proyecto y el flujo normal para ejecutar los dos microservicios. Los comandos se ejecutan desde la raíz del repositorio salvo que se indique otra carpeta.

## Conceptos mínimos

- Una **imagen** es un paquete inmutable con la aplicación y lo necesario para ejecutarla.
- Un **contenedor** es una instancia en ejecución de una imagen.
- Un **Dockerfile** contiene los pasos para construir una imagen.
- El **contexto de construcción** es la carpeta que Docker puede leer durante `docker build`.
- `.dockerignore` excluye archivos del contexto enviado a Docker.
- `.gitignore` excluye archivos del seguimiento de Git.
- `compose.yaml` describe varios servicios, sus imágenes, puertos, variables, red y orden de inicio.

`.dockerignore` y `.gitignore` resuelven problemas diferentes. Un archivo ignorado por Git todavía puede entrar en una imagen y un archivo ignorado por Docker todavía puede confirmarse en Git.

## Los Dockerfile de los microservicios

Hay un `Dockerfile` en `servicio-solicitudes/` y otro en `servicio-notificaciones/`. Ambos usan una construcción de dos etapas.

### Etapa 1: compilar

El patrón actual es:

```dockerfile
FROM maven:3.9-eclipse-temurin-26 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q clean package -DskipTests
```

Explicación:

1. `FROM ... AS build` crea una etapa temporal con Maven y JDK 26.
2. `WORKDIR /build` establece la carpeta de trabajo dentro de esa etapa.
3. `COPY pom.xml .` copia primero la lista de dependencias.
4. `RUN mvn ... dependency:go-offline` descarga dependencias y permite reutilizar esa capa mientras el `pom.xml` no cambie.
5. `COPY src ./src` copia el código después, porque suele cambiar con más frecuencia.
6. `RUN mvn ... package` compila y genera el JAR.

El `Dockerfile` de notificaciones usa `-DskipTests`. El de solicitudes contiene actualmente `-DskipTest` en singular, que no es la propiedad Maven estándar para omitir pruebas. No se debe depender del `docker build` como sustituto del pipeline de pruebas: antes de construir imágenes se ejecuta `mvn verify` para cada servicio.

### Etapa 2: ejecutar

El patrón actual es:

```dockerfile
FROM eclipse-temurin:26-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
RUN useradd -r -u 1001 appuser && chown -R appuser /app
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Explicación:

1. `FROM eclipse-temurin:26-jre` inicia una imagen limpia que solo necesita ejecutar Java. Maven, el compilador y el código fuente no pasan a la imagen final.
2. `COPY --from=build ...` copia el JAR producido en la primera etapa y lo renombra a `app.jar`.
3. `RUN useradd ...` crea un usuario interno sin privilegios. El nombre es `appuser` en notificaciones y `appuser1` en solicitudes, pero ambos utilizan el UID `1001`.
4. `USER` evita ejecutar la aplicación como `root`.
5. `EXPOSE 8080` documenta el puerto interno; no lo publica en la computadora.
6. `ENTRYPOINT` ejecuta Spring Boot al iniciar el contenedor.

La imagen final usa un JRE y no el JDK completo, por lo que es menor y contiene menos herramientas innecesarias.

## Construir una imagen individual

Cada contexto debe ser la carpeta del servicio:

```powershell
docker build -t arka/servicio-solicitudes:local .\servicio-solicitudes
docker build -t arka/servicio-notificaciones:local .\servicio-notificaciones
```

El punto o la ruta final es el contexto. Docker busca allí el `Dockerfile`, `pom.xml` y `src/`.

Para ejecutar los servicios manualmente se necesita una red y la URL interna correcta. Compose hace esa configuración automáticamente, por lo que es el flujo recomendado.

## `.dockerignore` actual

La raíz contiene:

```dockerignore
.git
.idea
*.iml
target/classes
docs
```

Estas reglas excluyen metadata de Git, archivos de IntelliJ, clases compiladas y documentación cuando **la raíz es el contexto de construcción**.

Actualmente Compose usa estos contextos:

```yaml
build: ./servicio-notificaciones
build: ./servicio-solicitudes
```

Docker busca `.dockerignore` dentro de cada contexto. Por eso el `.dockerignore` de la raíz no se aplica a las construcciones actuales y, como las carpetas de los servicios no tienen uno, su contenido completo se envía al daemon. El archivo raíz es metadata del flujo anterior y no participa en `docker compose build`.

Cuando se decida corregir la infraestructura, cada microservicio puede incorporar este archivo `.dockerignore`:

```dockerignore
.git
.gitignore
.idea
.vscode
*.iml
target
README.md
```

No se debe ignorar `pom.xml` ni `src/`, porque el Dockerfile los copia. Excluir `target/` evita enviar resultados locales: la imagen genera su propio JAR en la etapa de compilación.

Para comprobar cuánto contexto se envía:

```powershell
docker compose build --progress=plain
```

## `.gitignore` actual

Hay un `.gitignore` en la raíz y uno dentro de cada microservicio. Git combina las reglas aplicables desde la raíz hasta la carpeta del archivo.

Las reglas principales excluyen:

| Patrón | Motivo |
| --- | --- |
| `target/` | Clases, reportes y JAR generados por Maven. |
| `.idea`, `*.iml`, `.vscode/` | Preferencias locales de los IDE. |
| `.classpath`, `.project`, `.settings` | Metadata de Eclipse y STS. |
| `build/`, `dist/` | Resultados generados por otras herramientas. |
| `.DS_Store` | Metadata local de macOS; aparece en el archivo de la raíz. |

Se deben confirmar el código, `pom.xml`, Maven Wrapper, Dockerfile, Compose y documentación. No se confirman `target/`, secretos, archivos `.env` con credenciales ni preferencias personales. El `.gitignore` actual no contiene una regla para `.env`; si se empieza a usar, se debe agregar la regla antes de guardar valores sensibles y comprobar `git status`.

Comandos útiles:

```powershell
git status --ignored
git check-ignore -v servicio-solicitudes\target\archivo.jar
```

`git check-ignore -v` indica qué archivo y qué regla causaron la exclusión. Si Git ya seguía un archivo antes de agregarlo a `.gitignore`, la regla no lo elimina del historial; primero debe dejar de seguirse conscientemente con `git rm --cached`.

## `compose.yaml` explicado

El archivo vigente define **cuatro servicios**. Este extracto muestra las relaciones principales; el archivo completo está en la raíz:

```yaml
services:
  db-solicitudes:
    image: postgres:17
    environment:
      POSTGRES_DB: db-solicitudes
      POSTGRES_USER: arka
      POSTGRES_PASSWORD: arka

  db-notificaciones:
    image: postgres:17
    ports: ["5433:5432"]
    environment:
      POSTGRES_DB: db-notificaciones
      POSTGRES_USER: arka
      POSTGRES_PASSWORD: arka

  servicio-notificaciones:
    build: ./servicio-notificaciones
    ports: ["8081:8080"]
    environment:
      DB_URL: jdbc:postgresql://db-notificaciones:5432/db-notificaciones
    depends_on:
      db-notificaciones:
        condition: service_healthy

  servicio-solicitudes:
    build: ./servicio-solicitudes
    ports: ["8080:8080"]
    environment:
      NOTIFICACIONES_URL: "http://servicio-notificaciones:8080/eventos/solicitud-enviada"
      DB_URL: jdbc:postgresql://db-solicitudes:5432/db-solicitudes
    depends_on:
      servicio-notificaciones:
        condition: service_healthy
      db-solicitudes:
        condition: service_healthy
```

### `services`

Define `db-solicitudes`, `db-notificaciones` y las dos aplicaciones. Cada base es un contenedor PostgreSQL separado; los dos servicios Java tienen sus propias imágenes construidas desde su código.

### `build`

Indica el contexto de construcción. Cada servicio usa su propia carpeta y su propio Dockerfile.

### `ports`

El formato corto es `PUERTO_COMPUTADORA:PUERTO_CONTENEDOR`:

- `8081:8080`: notificaciones escucha en 8080 dentro del contenedor y se visita en 8081 desde la computadora.
- `8080:8080`: solicitudes usa 8080 en ambos lados.
- `5433:5432`: PostgreSQL de Notificaciones se puede consultar desde la computadora en `localhost:5433`; dentro de Compose sigue en `db-notificaciones:5432`.

PostgreSQL de Solicitudes no publica un puerto al anfitrión en este Compose. Los contenedores se comunican usando los nombres de servicio y sus puertos internos, no los puertos publicados al anfitrión.

### `environment`

`NOTIFICACIONES_URL` define el destino HTTP. `DB_URL`, `DB_USER` y `DB_PASSWORD` conectan cada aplicación a **su** PostgreSQL. `POSTGRES_DB`, `POSTGRES_USER` y `POSTGRES_PASSWORD` inicializan las bases al crear contenedores nuevos. Las credenciales `arka` son solo de desarrollo local.

`localhost` dentro de un contenedor se refiere a ese mismo contenedor. Por eso solicitudes no puede llamar a notificaciones con `http://localhost:8081` desde Compose.

### `healthcheck`

Ambos PostgreSQL usan `pg_isready`; Notificaciones comprueba si su puerto HTTP interno acepta conexiones. Los intervalos y límites exactos están en `compose.yaml`.

Este chequeo confirma que el puerto abrió; no comprueba una operación de negocio. Cuando se agregue Spring Boot Actuator conviene sustituirlo por un endpoint de salud HTTP.

### `depends_on`

Notificaciones espera a su PostgreSQL; Solicitudes espera a su PostgreSQL y a Notificaciones. Esto ordena el arranque inicial, pero no garantiza disponibilidad continua. El outbox de Solicitudes conserva los eventos pendientes ante fallos posteriores de HTTP.

### Red predeterminada

Aunque no aparece una sección `networks`, Compose crea una red privada para el proyecto. En esa red cada servicio puede resolver al otro por su nombre.

## Flujo de trabajo con Compose

### 1. Validar la configuración

```powershell
docker compose config
```

Este comando interpreta el YAML, muestra la configuración resultante y detecta errores de sintaxis antes de construir.

### 2. Construir e iniciar

```powershell
docker compose up --build -d
```

- `up` crea e inicia los recursos.
- `--build` reconstruye las imágenes si cambió el código o el Dockerfile.
- `-d` deja los contenedores en segundo plano.

La primera construcción tarda más porque descarga imágenes y dependencias Maven.

### 3. Revisar estado y registros

```powershell
docker compose ps
docker compose logs
docker compose logs -f servicio-solicitudes
docker compose logs --tail 100 servicio-notificaciones
```

Salir de `logs -f` con `Ctrl+C` no detiene los contenedores.

### 4. Probar la comunicación completa

```powershell
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/crear
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/INC-002/enviar
Start-Sleep -Seconds 6
Invoke-RestMethod http://localhost:8081/notificaciones
Invoke-RestMethod http://localhost:8081/eventos/procesados
```

El relevador publica después de responder al cliente. La espera permite observar un ciclo; no es una garantía exacta. También se pueden consultar las tablas:

```powershell
docker compose exec db-solicitudes psql -U arka -d db-solicitudes -c 'SELECT id, solicitud_id, evento_id, procesado FROM evento ORDER BY id;'
docker compose exec db-notificaciones psql -U arka -d db-notificaciones -c 'SELECT evento_id FROM evento_procesado;'
```

### 5. Aplicar cambios

Después de modificar Java:

```powershell
docker compose up --build -d
```

Para reconstruir un solo servicio:

```powershell
docker compose build servicio-solicitudes
docker compose up -d servicio-solicitudes
```

Para descartar la caché de capas durante un diagnóstico:

```powershell
docker compose build --no-cache servicio-solicitudes
```

### 6. Detener y limpiar

```powershell
docker compose stop       # Detiene y conserva los contenedores
docker compose start      # Reinicia los contenedores conservados
docker compose down       # Detiene y elimina contenedores y red
docker compose down --rmi local  # También elimina imágenes construidas localmente
```

El Compose actual no declara volúmenes persistentes para PostgreSQL. Un simple reinicio de la aplicación no borra por sí mismo la BD, pero **recrear o eliminar los contenedores PostgreSQL puede perder sus datos**. En Kubernetes los manifiestos sí usan PVC. Las notificaciones como objetos siguen en memoria y se pierden al reiniciar ese servicio; los ID procesados se guardan en su PostgreSQL.

## Variables y archivos `.env`

Compose puede sustituir valores desde variables del sistema o un archivo `.env`. Un patrón futuro puede ser:

```yaml
ports:
  - "${SOLICITUDES_PORT:-8080}:8080"
```

Y un archivo local:

```dotenv
SOLICITUDES_PORT=9080
NOTIFICACIONES_PORT=9081
```

Un `.env` con credenciales no se confirma en Git. Se puede versionar `.env.example` con nombres y valores de demostración sin secretos. Para ambientes reales se usan secretos y variables del sistema de despliegue, como se explica en [Integración continua, ramas y ambientes](../automatizacion/ci-cd-y-ambientes.md).

## Diagnóstico frecuente

| Problema | Comprobación |
| --- | --- |
| `port is already allocated` | Cambiar el puerto del lado izquierdo o detener el proceso que lo usa. |
| Un servicio termina | Ejecutar `docker compose ps -a` y `docker compose logs <servicio>`. |
| Solicitudes no genera notificación | Revisar `NOTIFICACIONES_URL`, la salud de Notificaciones, `evento.procesado` y los logs de ambos servicios. |
| PostgreSQL no inicia o la aplicación falla al conectar | Revisar `docker compose ps`, logs de `db-solicitudes` o `db-notificaciones` y las variables `DB_URL` de la aplicación afectada. |
| Los cambios no aparecen | Ejecutar `docker compose up --build -d`; usar `--no-cache` solo si la caché es sospechosa. |
| Error al descargar dependencias | Comprobar conexión, proxy, DNS y acceso a Maven Central. |
| Error de YAML | Ejecutar `docker compose config` y revisar espacios; YAML no usa tabuladores. |

También son útiles:

```powershell
docker compose exec servicio-solicitudes sh
docker compose images
docker compose top
docker system df
```

Antes de usar comandos `prune`, revisar qué recursos eliminarán, especialmente en una computadora que ejecuta otros proyectos.

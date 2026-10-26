# Bases de datos para ejecutar Java localmente

Ambas aplicaciones necesitan PostgreSQL al arrancar, también desde el IDE o un JAR. Las pruebas unitarias actuales usan memoria y dobles de prueba; no requieren levantar estas bases.

| Aplicación | `DB_URL` predeterminada | `DB_USER` | `DB_PASSWORD` |
| --- | --- | --- | --- |
| Solicitudes | `jdbc:postgresql://localhost:5432/db-solicitudes` | `arka` | `arka` |
| Notificaciones | `jdbc:postgresql://localhost:5433/db-notificaciones` | `arka` | `arka` |

Las credenciales son las del laboratorio local. Si ya tienes PostgreSQL, crea ambas bases y configura las variables en cada terminal o configuración del IDE.

Para iniciar bases aisladas con Docker, usando los puertos predeterminados:

```powershell
docker run -d --name arka-db-solicitudes-local -p 5432:5432 -e POSTGRES_DB=db-solicitudes -e POSTGRES_USER=arka -e POSTGRES_PASSWORD=arka -v arka-solicitudes-local:/var/lib/postgresql/data postgres:17
docker run -d --name arka-db-notificaciones-local -p 5433:5432 -e POSTGRES_DB=db-notificaciones -e POSTGRES_USER=arka -e POSTGRES_PASSWORD=arka -v arka-notificaciones-local:/var/lib/postgresql/data postgres:17

docker exec arka-db-solicitudes-local pg_isready -U arka -d db-solicitudes
docker exec arka-db-notificaciones-local pg_isready -U arka -d db-notificaciones
```

Espera a que ambas comprobaciones indiquen que aceptan conexiones antes de iniciar Java. Estos comandos crean los contenedores una sola vez; en sesiones posteriores usa `docker start arka-db-solicitudes-local arka-db-notificaciones-local`.

No ejecutes esta alternativa junto a bases que ya ocupen esos puertos. El Compose del repositorio publica únicamente la base de notificaciones en `5433`: `docker compose up -d db-solicitudes db-notificaciones` por sí solo no permite conectar una aplicación local a solicitudes en `localhost:5432`.

Para otra dirección, establece las variables antes de iniciar el servicio correspondiente:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/db-solicitudes"
$env:DB_USER = "arka"
$env:DB_PASSWORD = "arka"
```

Solicitudes ejecuta `schema.sql` y Hibernate valida el esquema. Notificaciones configura Hibernate con `ddl-auto=update`. No hay migraciones versionadas con Flyway o Liquibase.

Para detener las bases locales conservando sus volúmenes:

```powershell
docker stop arka-db-solicitudes-local arka-db-notificaciones-local
```

Volver a [Instalación y depuración](instalacion-y-debug.md).

# Instalación del entorno y depuración

Esta guía prepara una computadora para compilar, probar, ejecutar y depurar los dos microservicios de ARKA-Lite. Los ejemplos principales usan Windows y PowerShell.

## Requisitos

| Herramienta | Cuándo se necesita | Uso |
| --- | --- | --- |
| Git | Siempre | Descargar el repositorio y trabajar con ramas. |
| Docker Desktop | Ruta recomendada para ejecutar todo | Construir servicios y levantar ambos PostgreSQL con Compose o Kubernetes. |
| JDK 26 | Desarrollo Java sin Docker | Compilar, probar y depurar desde el IDE o Maven. |
| IntelliJ IDEA o Visual Studio Code | Recomendado para desarrollo | Editar, ejecutar pruebas y usar breakpoints. |
| Maven instalado | No | Cada servicio incluye Maven Wrapper. |

Si solamente se ejecuta `docker compose up`, no hace falta instalar Java ni Maven en la computadora. Para desarrollar y depurar Java sí se necesita un JDK 26. Si se arranca Java fuera de Compose, también deben estar disponibles los dos PostgreSQL.

## 1. Instalar y verificar Git

Descargar Git desde [git-scm.com](https://git-scm.com/download/win), abrir una terminal nueva y ejecutar:

```powershell
git --version
git config --global user.name "Nombre Apellido"
git config --global user.email "correo@ejemplo.com"
```

## 2. Instalar y verificar Docker

Instalar Docker Desktop o un motor compatible con Docker Compose v2. Después:

```powershell
docker version
docker compose version
docker run --rm hello-world
```

Si `docker version` no puede conectarse al daemon, iniciar Docker Desktop y esperar hasta que el motor esté listo.

## 3. Instalar JDK 26 para desarrollo local

Se puede descargar Eclipse Temurin desde [Adoptium](https://adoptium.net/temurin/releases/?version=26) o desde el administrador de SDK del IDE. Debe instalarse el **JDK**, no solamente el JRE.

```powershell
java --version
javac --version
where.exe java
where.exe javac
$env:JAVA_HOME
```

`java` y `javac` deben mostrar la versión 26. `JAVA_HOME` apunta a la carpeta del JDK, no a su subcarpeta `bin`.

Para probar temporalmente una instalación en la terminal actual:

```powershell
$env:JAVA_HOME = "C:\ruta\real\al\jdk-26"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java --version
```

## 4. Descargar el repositorio

```powershell
git clone https://github.com/JFranceschi-Dev/arka-lite.git
cd arka-lite
```

Si ya existe localmente:

```powershell
git switch main
git pull origin main
```

## 5. Reconocer la estructura vigente

Cada microservicio es un proyecto Maven independiente:

```text
servicio-solicitudes/pom.xml
servicio-solicitudes/mvnw.cmd
servicio-notificaciones/pom.xml
servicio-notificaciones/mvnw.cmd
```

Los archivos `pom.xml`, `src/` y Maven Wrapper de la raíz corresponden al monolito anterior. No se usan para probar ni iniciar la solución vigente.

Comprobar el Wrapper de cada servicio:

```powershell
Push-Location servicio-solicitudes
.\mvnw.cmd --version
Pop-Location

Push-Location servicio-notificaciones
.\mvnw.cmd --version
Pop-Location
```

La primera ejecución puede descargar Maven 3.9.16 y dependencias desde internet. Ambos comandos deben informar Java 26.

## 6. Ejecutar todas las pruebas

Desde la raíz:

```powershell
Push-Location servicio-solicitudes
.\mvnw.cmd clean verify
Pop-Location

Push-Location servicio-notificaciones
.\mvnw.cmd clean verify
Pop-Location
```

`verify` compila, ejecuta pruebas y comprueba el paquete. Es el comando recomendado antes de un Pull Request. Para ejecutar solamente pruebas se reemplaza `clean verify` por `test`.

Para una clase concreta:

```powershell
cd servicio-solicitudes
.\mvnw.cmd test "-Dtest=ServicioSolicitudesApplicationTests"
```

Los reportes quedan en la carpeta `target/surefire-reports/` del servicio.

## 7. Ejecutar con Docker Compose

Esta es la forma más sencilla de iniciar el sistema completo:

```powershell
docker compose config
docker compose up --build -d
docker compose ps
```

Probar el flujo:

```powershell
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/crear
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/INC-002/enviar
Invoke-RestMethod http://localhost:8081/notificaciones
```

Detenerlo:

```powershell
docker compose down
```

La [guía de Docker](../operaciones/docker-y-compose.md) explica el Dockerfile, `.dockerignore`, `.gitignore` y cada sección de Compose.

## 8. Ejecutar Java desde Maven con PostgreSQL local

Los valores predeterminados de Spring esperan `db-solicitudes` en `localhost:5432` y `db-notificaciones` en `localhost:5433`. Se pueden instalar dos PostgreSQL locales o, para esta prueba, iniciar **solo las bases** con Docker. No iniciar simultáneamente otro PostgreSQL en esos puertos:

```powershell
docker run -d --name arka-db-solicitudes -e POSTGRES_DB=db-solicitudes -e POSTGRES_USER=arka -e POSTGRES_PASSWORD=arka -p 5432:5432 postgres:17
docker run -d --name arka-db-notificaciones -e POSTGRES_DB=db-notificaciones -e POSTGRES_USER=arka -e POSTGRES_PASSWORD=arka -p 5433:5432 postgres:17
docker logs arka-db-solicitudes
docker logs arka-db-notificaciones
```

Las credenciales son de laboratorio. Abrir dos terminales desde la raíz. Iniciar primero Notificaciones en 8081:

```powershell
cd servicio-notificaciones
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

En otra terminal iniciar Solicitudes en 8080:

```powershell
cd servicio-solicitudes
.\mvnw.cmd spring-boot:run
```

`NOTIFICACIONES_URL` ya apunta a `http://localhost:8081/eventos/solicitud-enviada`. Si se usan PostgreSQL o puertos distintos, establecer `DB_URL`, `DB_USER`, `DB_PASSWORD` en **cada terminal** antes de arrancar la aplicación correspondiente. Para terminar esta prueba, cerrar las JVM y ejecutar `docker stop arka-db-solicitudes arka-db-notificaciones`. `docker rm -v arka-db-solicitudes arka-db-notificaciones` elimina después los contenedores y sus volúmenes anónimos de laboratorio.

## 9. Abrir en IntelliJ IDEA

1. Abrir la raíz `arka-lite`.
2. Importar `servicio-solicitudes/pom.xml` y `servicio-notificaciones/pom.xml` como proyectos Maven.
3. Confirmar JDK 26 en **File > Project Structure**.
4. Esperar a que terminen la indexación y descarga de dependencias.
5. Crear configuraciones Spring Boot para:

```text
pa.gob.dntic.serviciosolicitudes.ServicioSolicitudesApplication
pa.gob.dntic.servicionotificaciones.ServicioNotificacionesApplication
```

6. Usar como directorio de trabajo la carpeta del microservicio correspondiente.
7. Iniciar primero notificaciones y luego solicitudes.

No se debe ejecutar `pa.gob.dntic.arkalite.ArkaliteApplication`; pertenece al monolito legado de la raíz.

## 10. Abrir en Visual Studio Code

1. Instalar **Extension Pack for Java**, publicado por Microsoft.
2. Abrir la raíz del repositorio.
3. Esperar a que la extensión importe ambos `pom.xml`.
4. Confirmar que el runtime sea JDK 26.
5. Abrir una clase `*Application` vigente y usar **Run** o **Debug**.
6. Iniciar cada microservicio en una terminal o sesión distinta.

`.vscode/` está excluida por `.gitignore`, por lo que las preferencias personales no se publican accidentalmente.

## 11. Depurar con breakpoints

Para seguir el flujo entre servicios:

1. Colocar un breakpoint en `SolicitudController.enviar` o `ServicioDeSolicitudes.enviar`.
2. Colocar otro en `RelevadorDeEventosPendientes.publicarPendientes` y otro en `EventoController.recibir`.
3. Iniciar ambos servicios en modo **Debug**.
4. Crear `INC-002` y ejecutar la petición de envío.
5. Continuar la ejecución: `enviar()` guarda el outbox y responde; el relevador hará el POST en un ciclo posterior.
6. El depurador debe detenerse después en el relevador y luego en Notificaciones.

```powershell
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/crear
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/INC-002/enviar
```

Cada microservicio corre en una JVM distinta. El IDE mantiene una sesión de depuración para cada proceso.

## 12. Depuración remota por puerto

Se pueden iniciar las JVM con puertos JDWP distintos. No se deben exponer estos puertos fuera del equipo de desarrollo.

Ejemplo para solicitudes desde su carpeta:

```powershell
.\mvnw.cmd package
$jar = Get-ChildItem .\target\*.jar | Where-Object Name -NotLike '*.original' | Select-Object -First 1
java "-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=localhost:5005" -jar $jar.FullName
```

Para notificaciones se repite desde su carpeta con `address=localhost:5006`. Después se crean dos configuraciones **Remote JVM Debug**. `suspend=y` deja la aplicación esperando al IDE; `suspend=n` permite iniciar sin esperar.

## 13. Problemas frecuentes

### Maven usa otra versión de Java

```powershell
java --version
javac --version
$env:JAVA_HOME
cd servicio-solicitudes
.\mvnw.cmd --version
```

Corregir `JAVA_HOME`, cerrar la terminal y abrir otra. El IDE también puede tener un JDK de proyecto distinto.

### El IDE solo reconoce el proyecto raíz legado

Importar explícitamente los dos `pom.xml` dentro de `servicio-solicitudes` y `servicio-notificaciones`. El `pom.xml` raíz no es un padre multi módulo.

### Un puerto está ocupado

```powershell
Get-NetTCPConnection -LocalPort 8080,8081 -ErrorAction SilentlyContinue
docker compose ps
```

Detener el proceso anterior o usar otros puertos y actualizar `NOTIFICACIONES_URL`.

### La solicitud se envía, pero no aparece una notificación

El envío guarda el evento pendiente y el relevador vuelve a intentar. Revisar:

```powershell
docker compose ps
docker compose logs servicio-solicitudes
docker compose logs servicio-notificaciones
docker compose exec db-solicitudes psql -U arka -d db-solicitudes -c 'SELECT evento_id, procesado FROM evento ORDER BY id;'
docker compose exec db-notificaciones psql -U arka -d db-notificaciones -c 'SELECT evento_id FROM evento_procesado;'
```

En ejecución local, confirmar que Notificaciones está en 8081 y que `NOTIFICACIONES_URL` no conserva un valor de otra sesión. Verificar también ambas conexiones `DB_URL`.

### Docker no refleja el cambio de código

```powershell
docker compose up --build -d
```

Las imágenes no montan el código como volumen; cualquier cambio Java requiere reconstruir.

## Lista de comprobación

- `git --version` responde.
- `docker version` y `docker compose version` responden.
- Si se desarrolla sin Docker, `java` y `javac` muestran Java 26.
- El Maven Wrapper de cada microservicio usa Java 26.
- `clean verify` termina correctamente en ambos servicios.
- `docker compose config` es válido.
- Compose muestra los dos PostgreSQL saludables y ambas aplicaciones iniciadas.
- Crear y enviar `INC-002` produce una entrada en `http://localhost:8081/notificaciones`.

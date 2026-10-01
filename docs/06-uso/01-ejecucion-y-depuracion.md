# Ejecutar y depurar sin Docker

Complete antes la [instalación de Temurin e IntelliJ](../01-configuracion/01-java-e-intellij.md). Ambos microservicios tienen un Maven Wrapper independiente. Los archivos Java de la raíz pertenecen al monolito anterior y no forman parte de esta ejecución.

## Compilar y probar

Desde la raíz, pruebe cada servicio por separado:

```powershell
Push-Location servicio-notificaciones
.\mvnw.cmd clean verify
Pop-Location
Push-Location servicio-solicitudes
.\mvnw.cmd clean verify
Pop-Location
```

El primer uso puede descargar Maven y dependencias. Si falla por versión de Java, compruebe `java --version`, `$env:JAVA_HOME` y `.\mvnw.cmd --version` desde la carpeta del servicio. Los informes de pruebas están en `target/surefire-reports/` de cada servicio.

## Levantar las dos aplicaciones

Abra **dos terminales** desde la raíz. Inicie primero notificaciones en el puerto 8081:

```powershell
cd servicio-notificaciones
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

En la segunda terminal inicie solicitudes, que usa el puerto 8080 predeterminado:

```powershell
cd servicio-solicitudes
.\mvnw.cmd spring-boot:run
```

Por defecto ambas aplicaciones usarían 8080; por eso se cambia el puerto de notificaciones. `servicio-solicitudes/src/main/resources/application.properties` apunta por defecto a `http://localhost:8081/eventos/solicitud-enviada`. Detenga cada proceso con Ctrl+C.

En una tercera terminal pruebe el recorrido:

```powershell
Invoke-RestMethod http://localhost:8080/solicitudes
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/crear
Invoke-RestMethod -Method Post http://localhost:8080/solicitudes/INC-002/enviar
Invoke-RestMethod http://localhost:8081/notificaciones
```

Solicitudes carga `INC-001` y `CAM-002` al arrancar y envía `CAM-002`, por lo que las listas pueden tener datos previos a las llamadas de prueba. Consulte [el flujo de arquitectura](../05-arquitectura/02-diagramas.md).

## Cambiar puertos

Si 8080 y 8081 están ocupados, puede iniciar notificaciones en 9091 y solicitudes en 9090:

```powershell
# Terminal de notificaciones, desde su carpeta
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=9091"
```

```powershell
# Terminal de solicitudes, desde su carpeta
$env:NOTIFICACIONES_URL = 'http://localhost:9091/eventos/solicitud-enviada'
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=9090"
```

Use `http://localhost:9090` y `http://localhost:9091` al probar. En esa segunda terminal, al terminar, quite la variable con `Remove-Item Env:NOTIFICACIONES_URL`. Para identificar quién ocupa un puerto: `Get-NetTCPConnection -LocalPort 8080,8081 -ErrorAction SilentlyContinue`.

## IntelliJ y puntos de interrupción

Importe los dos `pom.xml` de servicio, seleccione JDK 26 y cree una configuración de ejecución para cada clase `*Application` vigente. Configure el directorio de trabajo de cada una en su carpeta. Inicie notificaciones con `--server.port=8081` como argumento del programa; inicie solicitudes sin argumentos o con `NOTIFICACIONES_URL` si cambió el puerto. Ejecute ambas en modo Debug.

Para seguir una petición, coloque un breakpoint en `SolicitudController.enviar`, otro en `ServicioDeSolicitudes.enviar` y otro en `EventoController.recibir`. Cree `INC-002` y envíela; continúe la primera JVM para que su llamada HTTP alcance la segunda. Si la llamada falla, `PublicadorRest` escribe el error y solicitudes conserva `ENVIADA`.

## Diagnóstico breve

| Síntoma | Comprobación |
| --- | --- |
| Maven usa otro JDK | `java --version`, `$env:JAVA_HOME` y `.\mvnw.cmd --version` dentro de cada servicio. |
| IntelliJ solo detecta el proyecto raíz | Importe explícitamente los dos `pom.xml` de los microservicios. |
| Puerto ocupado | Consulte `Get-NetTCPConnection` y cambie ambos puertos y la URL interna de forma coherente. |
| Hay solicitud enviada sin notificación | Compruebe que notificaciones está activa y que `NOTIFICACIONES_URL` apunta al puerto correcto. |

Para empaquetar y ejecutar un JAR manualmente, desde cada carpeta use `.\mvnw.cmd package` y ejecute el JAR generado en `target/` con Java 26. Si quiere los dos servicios empaquetados como contenedores, continúe con [Docker y Compose](02-docker-y-compose.md).

# Temurin e IntelliJ IDEA

## 1. Instalar los JDK en Windows

Abra las descargas de Eclipse Adoptium para [Temurin 25](https://adoptium.net/temurin/releases/?version=25) y [Temurin 26](https://adoptium.net/temurin/releases/?version=26). Para cada versión, seleccione **Windows**, su arquitectura, **JDK** y el instalador **MSI**. Siga la [guía oficial del instalador de Windows](https://adoptium.net/installation/windows/). Instale ambos; configure `JAVA_HOME` y `Path` para que la terminal use **26**. Java 25 no sirve para compilar este repositorio, cuyos dos `pom.xml` declaran Java 26.

Abra una terminal PowerShell nueva y compruebe:

```powershell
java --version
javac --version
$env:JAVA_HOME
where.exe java
```

`java` y `javac` deben indicar 26, y `JAVA_HOME` debe apuntar a la carpeta del JDK 26, no a su subcarpeta `bin`. Si otra instalación domina el `Path`, ajuste las variables de entorno de Windows y abra una terminal nueva. Para comprobar una ruta temporalmente en la terminal actual:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\RUTA-REAL-DEL-JDK-26'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java --version
```

Sustituya el marcador por la carpeta instalada; no copie la ruta de ejemplo sin revisarla.

## 2. Instalar IntelliJ IDEA

Descargue [IntelliJ IDEA desde JetBrains](https://www.jetbrains.com/idea/download/) e instálelo. Después de clonar el repositorio:

1. Abra la carpeta `arka-lite`.
2. Importe `servicio-solicitudes/pom.xml` y `servicio-notificaciones/pom.xml` como proyectos Maven separados.
3. Seleccione Temurin 26 como SDK del proyecto y JVM de Maven; espere a que se descarguen las dependencias.
4. Ejecute o depure `ServicioSolicitudesApplication` y `ServicioNotificacionesApplication`, cada una con su carpeta de servicio como directorio de trabajo.

El `pom.xml` de la raíz es del monolito anterior y no actúa como padre de los microservicios. Para depurar el flujo entre ambas aplicaciones, consulte [ejecución y depuración](../06-uso/01-ejecucion-y-depuracion.md).

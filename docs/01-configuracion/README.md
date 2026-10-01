# 01 · Configuración inicial en Windows

Siga este orden. Los enlaces llevan a páginas oficiales; descargue el **JDK**, no solo el JRE. La ruta principal es PowerShell en Windows, no una terminal dentro de WSL.

1. [Instalar Temurin 25 y 26 e IntelliJ IDEA](01-java-e-intellij.md). El proyecto usa **Java 26**; Java 25 queda disponible para otras tareas.
2. [Instalar Git y configurar la identidad](02-git.md#instalar-y-configurar-git).
3. [Preparar WSL 2 e instalar Docker Desktop](03-wsl-y-docker.md). WSL va primero porque será el motor Linux de Docker.
4. [Activar Kubernetes con `kind`](03-wsl-y-docker.md#kubernetes-integrado-con-kind).
5. [Crear la cuenta GitHub, solicitar acceso y clonar](04-github-y-clonacion.md).

Para usar solamente Compose no es necesario instalar Java localmente; sí se necesita Java 26 para compilar, ejecutar y depurar con Maven o IntelliJ. Maven se obtiene mediante el Wrapper incluido en cada microservicio: no hace falta instalarlo por separado.

Cuando termine, continúe con [qué hace ARKA-Lite](../04-proyecto/01-descripcion-del-proyecto.md) y [su primera ejecución](../06-uso/README.md).

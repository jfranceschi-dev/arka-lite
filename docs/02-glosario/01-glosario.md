# 02 · Glosario por tema

Los términos describen lo que existe **hoy** en ARKA-Lite. Siga los enlaces si necesita ver el concepto aplicado.

## Java y Spring

| Término | Significado en el proyecto |
| --- | --- |
| JDK / JRE | El JDK compila y ejecuta Java; el JRE solo ejecuta. El proyecto compila con JDK 26. |
| JVM | Proceso que ejecuta cada microservicio; hay una JVM por servicio. |
| Maven / Wrapper | Herramienta de compilación y scripts `mvnw.cmd` incluidos en cada servicio; no hay que instalar Maven aparte. |
| `pom.xml` | Declara Java, dependencias y forma de empaquetar un servicio. |
| Spring Boot | Inicia el servidor HTTP y conecta los componentes configurados. |
| Bean / inyección | Objeto administrado por Spring y entregado a quien lo necesita. `@Primary` decide entre los dos repositorios de solicitudes. |
| Controlador | Adaptador de entrada que recibe HTTP y llama al servicio de dominio. |
| Dominio / puerto / adaptador | Reglas de negocio, interfaz que necesita el dominio e implementación que habla con HTTP o memoria. |
| JAR | Archivo ejecutable producido al empaquetar cada servicio. |

Ver [arquitectura](../05-arquitectura/02-diagramas.md) y [componentes Java](../05-arquitectura/01-componentes-java.md).

## Git y GitHub

| Término | Significado |
| --- | --- |
| Repositorio | Historial y archivos del proyecto. |
| Clonar | Descargar una copia de trabajo completa. |
| Commit | Registro de un cambio en el historial. |
| Rama | Línea de trabajo independiente. |
| `origin` | Nombre habitual del repositorio remoto en GitHub. |
| Pull Request | Propuesta para revisar e integrar una rama. |

Ver [configuración de Git](../01-configuracion/02-git.md) y [flujo del equipo](../07-desarrollo/01-flujo-de-trabajo.md).

## Docker y redes

| Término | Significado |
| --- | --- |
| Imagen / contenedor | Plantilla empaquetada / proceso creado a partir de ella. |
| Dockerfile | Receta para construir la imagen de cada microservicio. |
| Etiqueta o tag | Parte `:local`, `:latest` o SHA que identifica una variante de imagen. |
| Compose | Archivo y comando que construyen y ejecutan ambos servicios en una red común. |
| Puerto del host / del contenedor | En `8081:8080`, Windows escucha en 8081 y el proceso dentro del contenedor en 8080. |
| DNS interno | Dentro de Compose o Kubernetes, `servicio-notificaciones` resuelve al servicio, no a `localhost`. |
| Healthcheck | Comprobación de disponibilidad; Compose espera a que notificaciones esté saludable. |

Ver [Docker y Compose](../06-uso/02-docker-y-compose.md).

## Kubernetes

| Término | Significado |
| --- | --- |
| Clúster / nodo | Entorno Kubernetes / máquina que ejecuta sus cargas. |
| `kind` | Provisionador usado por el Kubernetes integrado de Docker Desktop. |
| Contexto | Configuración de `kubectl` que indica a qué clúster apunta; aquí `docker-desktop`. |
| Deployment / Pod | Recurso que mantiene réplicas / unidad que ejecuta un contenedor. |
| Service | Dirección estable para alcanzar los pods; no es el servicio Java de dominio. |
| `port-forward` | Túnel temporal desde un puerto local hacia un recurso del clúster. |
| Ingress | Regla de entrada HTTP(S); requiere un controlador adicional. No existe en los manifiestos actuales. |
| K9s | Interfaz de terminal opcional para inspeccionar recursos Kubernetes. |

Ver [Kubernetes local](../06-uso/04-kubernetes-local.md) y [K9s](../06-uso/06-k9s.md).

## HTTPS y automatización

| Término | Significado |
| --- | --- |
| TLS / HTTPS | Cifrado y autenticación de la conexión HTTP mediante un certificado. |
| Certificado / clave privada | Documento que identifica un nombre de dominio / secreto que lo acompaña; no publique la clave en Git. |
| Terminación TLS | Punto de entrada que recibe HTTPS y reenvía HTTP a los servicios internos. Es una ampliación opcional. |
| CI / pipeline | Pasos automáticos de GitHub Actions para verificar y construir cambios. |
| GHCR / SHA | Registro de imágenes de GitHub / identificador del commit usado como etiqueta. |

Ver [HTTPS opcional](../06-uso/07-https-y-certificados.md) y [pipeline actual](../08-automatizacion/01-pipeline-actual.md).

# Documentación de ARKA-Lite

Esta documentación acompaña a una persona que prepara una computadora Windows, entiende los dos microservicios y aprende a desarrollarlos y ejecutarlos. Los ejemplos de terminal usan PowerShell y parten de la raíz del repositorio, salvo indicación contraria.

## Recorrido recomendado

1. [Preparar la computadora y obtener acceso](01-configuracion/README.md).
2. [Conocer el proyecto y probar su API](04-proyecto/01-descripcion-del-proyecto.md).
3. [Entender la arquitectura y sus diagramas](05-arquitectura/02-diagramas.md).
4. [Ejecutar con Docker Compose](06-uso/02-docker-y-compose.md) o [sin Docker](06-uso/01-ejecucion-y-depuracion.md).
5. [Desplegar en Kubernetes local](06-uso/04-kubernetes-local.md).
6. [Trabajar con el equipo](07-desarrollo/README.md) y [entender el pipeline](08-automatizacion/README.md).

Si aparece un término nuevo, consulte el [glosario](02-glosario/01-glosario.md). Para recuperar una instrucción concreta, use la [referencia de comandos](03-comandos/01-comandos.md).

## Secciones

| Sección | Qué resuelve |
| --- | --- |
| [01 · Configuración](01-configuracion/README.md) | Instalar herramientas, verificar el entorno y clonar el repositorio. |
| [02 · Glosario](02-glosario/01-glosario.md) | Entender términos por tema. |
| [03 · Comandos](03-comandos/01-comandos.md) | Encontrar comandos y saber dónde ejecutarlos. |
| [04 · Proyecto](04-proyecto/01-descripcion-del-proyecto.md) | Conocer funcionalidades, API y límites actuales. |
| [05 · Arquitectura](05-arquitectura/02-diagramas.md) | Seguir dependencias, estados y flujos mediante diagramas. |
| [06 · Uso](06-uso/README.md) | Ejecutar, desplegar, diagnosticar y explorar opciones. |
| [07 · Desarrollo](07-desarrollo/README.md) | Modificar código y colaborar. |
| [08 · Automatización](08-automatizacion/README.md) | Comprender el CI existente y las ideas futuras. |

## Diagramas Mermaid

Los diagramas se muestran en [Arquitectura: diagramas y flujos](05-arquitectura/02-diagramas.md), [HTTPS opcional](06-uso/07-https-y-certificados.md) y [pipeline actual](08-automatizacion/01-pipeline-actual.md). Sus fuentes independientes están en archivos `.mmd` numerados: [componentes](05-arquitectura/03-componentes.mmd), [secuencia de envío](05-arquitectura/04-secuencia-envio.mmd), [estados](05-arquitectura/05-estados-solicitud.mmd), [despliegue](05-arquitectura/06-despliegue.mmd), [HTTPS](06-uso/08-flujo-https.mmd) y [pipeline](08-automatizacion/04-flujo-pipeline.mmd).

Abra las páginas `.md` para ver los diagramas representados; los `.mmd` contienen la fuente Mermaid editable.

Los archivos exigidos por herramientas permanecen en su lugar: `compose.yaml` en la raíz, manifiestos en `k8s/` y workflows en `.github/workflows/`. Los `pom.xml` y `src/` de la raíz pertenecen al monolito anterior; los dos servicios vigentes están en sus propias carpetas.

Al cambiar comportamiento, infraestructura o proceso de trabajo, actualice la guía correspondiente en el mismo Pull Request.

# Presentación del proyecto final · Upskilling Backend Java

Esta carpeta es la **presentación de ARKA-Lite**: el contenido, los generadores y los entregables (PPTX, PDF y guiones). Es un proyecto propio; la UI `arka-lite-ui` no depende de ella ni genera presentaciones.

La presentación es para el **staff de tecnología**: qué construimos, qué medimos, qué aprendimos y qué valor deja. Muchas personas del público trabajan sobre todo con la base de datos y procedimientos almacenados, así que cada término nuevo (hexagonal, ORM, Docker, Kubernetes) se explica en lenguaje simple antes de usarlo.

## Cómo está organizada

Ocho partes numeradas, del código a la operación. **Cada parte termina con una lámina de aprendizajes**: una o dos métricas y, por aprendizaje, qué aprendimos, cómo lo aplicamos y qué valor tiene para el equipo.

| Parte | Qué explica |
| --- | --- |
| Apertura | ARKA-Lite en números, ocho conceptos en una frase y la agenda |
| 1 Fundamentos | Cómo funciona Spring Boot, una API predecible (201, 400, 404, 409) y las buenas prácticas que hacen el código mantenible |
| 2 Arquitectura | El sistema por capas, cómo se conectan y comunican los servicios (síncrono y asíncrono) y qué quiere decir “hexagonal” |
| 3 Base de datos | Del procedimiento almacenado al ORM, cómo el código llega a la base, dónde se configura la conexión, una base por servicio, outbox e idempotencia |
| 4 Contenedores y Kubernetes | Qué es Docker y qué es Kubernetes, todo con un comando y qué pasa cuando un Pod se cae |
| 5 CI/CD | El pipeline de GitHub Actions: de un push a una imagen publicada |
| 6 Observabilidad | Logs centralizados con traceId y la salud de cada servicio |
| 7 Documentación | Contratos vivos con Swagger y documentación en el mismo PR |
| 8 La UI como laboratorio | La UI **no es parte del entregable**: sirve para ver cómo se comporta el sistema cuando algo falla |
| Valor y cierre | El valor agregado por pilar y lo que nos llevamos: un laboratorio que cumplió su objetivo de aprender |

Cada idea ocupa **una sola lámina**: no hay diagramas repetidos paso a paso ni portadas por sección (una barra de avance arriba a la derecha indica la parte). El reparto **no está fijo**: ninguna lámina dice quién presenta.

## Variantes

Hay tres variantes; cada una contiene a la anterior y comparten el mismo texto oral.

| Variante | Láminas | Para qué |
| --- | --- | --- |
| Resumen | 18 | Charla corta: Spring Boot, buenas prácticas, el sistema y su comunicación, la base de datos, las fallas, la plataforma, el valor y lo aprendido. |
| Ejecutivo | 39 | Las ocho partes con sus aprendizajes, sin código. |
| Técnico | 62 | El ejecutivo más el código, la configuración, el esquema SQL y los diagramas detallados. |

## Entregables

| Archivo | Para qué sirve |
| --- | --- |
| [`pptx/ARKA-Lite-resumen.pptx`](pptx/ARKA-Lite-resumen.pptx) | Versión corta para el staff. |
| [`pptx/ARKA-Lite-ejecutivo.pptx`](pptx/ARKA-Lite-ejecutivo.pptx) | Todas las partes, sin código. |
| [`pptx/ARKA-Lite-tecnico.pptx`](pptx/ARKA-Lite-tecnico.pptx) | Con código, contratos y configuración. |
| [`pdf/`](pdf/) | Contenido y guion de cada variante, para leer o imprimir. |
| [`guiones/`](guiones/) | `guion-resumen.md`, `guion-ejecutivo.md` y `guion-tecnico.md`. |
| [`BackUp-pptx/`](BackUp-pptx/) | Versiones anteriores. `version-7-partes/` es la presentación larga (93 y 139 láminas) con sus guiones por participante; `version-3-variantes/` es la primera versión corta (16, 34 y 53 láminas) con su fuente de contenido. |

Los PPTX tienen texto, tablas, diagramas e íconos editables, y las notas del expositor en cada lámina. Los entregables se generan; no se editan a mano.

## Recursos visuales

| Recurso | Dónde se usa |
| --- | --- |
| Aprendizajes | Al final de cada parte: métricas en un panel oscuro y, por aprendizaje, su valor en verde. |
| Escenario de falla | Qué falla, cómo reacciona el sistema en el tiempo y el resultado: un Pod que se cae y notificaciones caído. |
| Matriz | Buenas prácticas, quién habla con quién, cómo se comporta el sistema ante cada falla y el valor agregado por pilar. |
| Capas | El sistema de un vistazo y los recursos de Kubernetes. |
| Hexágono | Puertos y adaptadores: entrada, dominio, puertos y salida. |
| Tablas | Las bases de datos con sus tablas, columnas y llaves. |
| Contraste | Procedimientos almacenados frente a ORM; síncrono frente a asíncrono; Docker frente a Kubernetes; monolito frente a microservicios. |
| Cifras, flujos, tubería y capturas | Los números del proyecto, la bandeja de salida, el pipeline, Swagger y la UI. |
| Íconos | Trazos vectoriales nativos de PowerPoint ([Lucide](https://lucide.dev), licencia ISC). |

Las capturas viven en [`capturas/`](capturas/) y no se generan con `npm run todo`: se toman con el sistema arriba (`docker compose up --build -d`) y el script [`capturas/capturar.ps1`](capturas/capturar.ps1). Si falta una, la validación lo avisa.

## Cómo leer un guion

| Parte | Qué es |
| --- | --- |
| **En pantalla** | Lo que ve el público. |
| **Qué decir** | Texto para decir en voz alta. |
| **Qué hacer** | Indicaciones para quien expone, como las demostraciones de fallas. No se dicen. |
| **Si preguntan** | Una pregunta probable y su respuesta corta. |
| **Para pasar** | La frase que conecta con la lámina siguiente. |

## Estructura

```text
docs/presentation-data/
├── contenido/          Fuente: partes, láminas, guion y recursos visuales
├── diagramas/          Diagramas detallados (conexiones y arquitectura completa) y su geometría
├── diseno/             Colores, tipografía e íconos
├── capturas/           Capturas reales de la UI y de Swagger, y el script que las toma
├── generador-pptx/     PowerPoint y su verificador
├── generador-pdf/      PDF de contenido y guion
├── generador-guiones/  Guiones en Markdown
├── pruebas/            Pruebas del contenido y del PPTX
├── pptx/ pdf/ guiones/ Entregables generados
├── BackUp-pptx/        Versiones anteriores
└── package.json
```

## Cómo regenerar

Requiere Node.js 24 (mínimo 22.18). Desde esta carpeta:

```powershell
npm ci
npm run todo
```

En la raíz del repositorio no hay `package.json`; desde ahí, indicar la carpeta con `--prefix`:

```powershell
npm ci --prefix docs/presentation-data
npm run todo --prefix docs/presentation-data
```

`npm run todo` valida el contenido, revisa los tipos, corre las pruebas y genera PPTX, PDF y guiones. Para una sola parte: `npm run pptx`, `npm run pdf` o `npm run guiones`; para una sola variante: `npm run pptx -- resumen`.

La validación exige que cada parte numerada termine con su lámina de aprendizajes y que cada variante contenga a la anterior.

Para usar un ícono que no está en [`diseno/iconos.ts`](diseno/iconos.ts), agregarlo desde el paquete `lucide-static` con su misma estructura. `node generador-pptx/muestra-iconos.ts <salida.pptx>` genera una lámina con todos los íconos para revisarlos.

## Material de referencia

- [Descripción del proyecto y su API](../inicio/proyecto.md)
- [Flujo de una solicitud y referencias al código](../arquitectura/flujo-y-referencias.md)
- [Datos y consistencia: transacciones, outbox e idempotencia](../arquitectura/datos-y-consistencia.md)
- [Observabilidad: logs, métricas y trazas](../operaciones/observabilidad.md)
- [Infraestructura y entrega](../operaciones/infraestructura-y-entrega.md)
- [Creación de ci.yml paso a paso](../automatizacion/ci-yaml-paso-a-paso.md)
- [La UI arka-lite-ui](../../arka-lite-ui/README.md)

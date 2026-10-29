# Presentación del proyecto final · Upskilling Backend Java

Esta carpeta es la **presentación de ARKA-Lite**: el contenido, los generadores y los entregables (PPTX, PDF y guiones). Es un proyecto propio; la UI `arka-lite-ui` no depende de ella ni genera presentaciones.

La presentación es para el **staff de tecnología**, y la presenta el **equipo arka-litos**. Muchas personas del público trabajan sobre todo con la base de datos y procedimientos almacenados, así que cada término nuevo (ORM, Docker, Kubernetes, Outbox) se explica en lenguaje simple antes de usarlo.

## Cómo está organizada

Todos los equipos del curso presentan las mismas secciones, pero cada uno profundiza en algunas para no repetir contenido. El equipo anterior se enfoca en fundamentos y arquitectura hexagonal; arka-litos los ve en **vista general** y va **a fondo** en la base de datos, la interconexión de los servicios y DevOps. La presentación narra el proyecto de punta a punta: cada parte retoma lo que dejó la anterior, y **cada parte numerada termina con una lámina de aprendizajes** que se pueden llevar a cualquier proyecto, sin importar el lenguaje.

| Parte | Enfoque | Qué explica |
| --- | --- | --- |
| Apertura | | La portada, con el nombre del equipo arka-litos, y qué vamos a ver, con el enfoque de cada parte. No hay lámina de equipo. |
| 1 Fundamentos | Vista general | Primero el qué, después el cómo: el negocio en una lámina (personas y pasos), seis buenas prácticas que sirven en cualquier lenguaje y Git y documentación |
| 2 Arquitectura | Vista general | El sistema por capas, cómo funciona en la práctica (el evento es un dato que viaja, no una pieza) y hexagonal en una frase: ordena el código por dentro, no cambia el despliegue |
| 3 Base de datos | A fondo | Dos bases PostgreSQL, su estructura, del procedimiento almacenado al ORM, cómo traduce el ORM, el viaje de un dato, dónde está la cadena de conexión y las transacciones |
| 4 Interconexión de servicios | A fondo | Quién habla con quién, síncrono y asíncrono, el patrón Outbox y la idempotencia |
| 5 DevOps: Docker y Kubernetes | A fondo | Qué es DevOps. Docker: se complementa con Kubernetes, de código a contenedor, todo con un comando, la red (nombres adentro, puertos afuera), el orden de arranque y Codespaces. CI/CD: del push a la imagen, tres trabajos en paralelo, cuando un cambio rompe algo y de la imagen al commit. Kubernetes: cómo trabaja, sus recursos y un Pod que se cae |
| 6 Observabilidad | Vista general | Logs centralizados con traceId |
| 7 Demostración con la UI | En vivo | La UI no es el entregable: ejemplifica en vivo lo que se contó, con una caída de notificaciones y un evento reentregado |
| Valor y cierre | | El valor agregado por pilar y lo que nos llevamos |

Cada idea ocupa **una sola lámina**, con más diagramas que texto: el staff no tiene que leer teoría. Los diagramas se **arman clic a clic** dentro de la misma lámina (cada pieza aparece con un fundido) y cada lámina entra con una transición suave. No hay portadas por sección: una barra de avance arriba a la derecha indica la parte. Al cierre, "Lo que pueden aplicar desde mañana" junta las prácticas que funcionan también con procedimientos almacenados.

## Reparto

Cada lámina tiene un papel (el de su sección o uno propio), y [`contenido/reparto.ts`](contenido/reparto.ts) asigna los papeles a las 7 personas del equipo: 4 de desarrollo (una de ellas orquesta), 1 de base de datos y 2 de infraestructura.

| Persona | Presenta |
| --- | --- |
| Desarrollo 1 · orquesta | Apertura, fundamentos (empezando por el negocio) y cierre |
| Desarrollo 2 | Arquitectura y la demostración con la UI |
| Base de datos | Base de datos: las dos bases, su estructura, del procedimiento al ORM, la transacción y los aprendizajes |
| Desarrollo 3 | Apoyo en base de datos: la misma regla en código, el ORM, el viaje de un dato y la cadena de conexión |
| Desarrollo 4 | Interconexión de servicios |
| Infraestructura 1 | DevOps: qué es DevOps, Docker, Compose, la red, el orden de arranque y Codespaces; al final, la observabilidad |
| Infraestructura 2 | DevOps: CI/CD (del push a la imagen, por dentro, cuando falla y trazabilidad) y Kubernetes |

Las notas del expositor y el PDF dicen quién presenta cada lámina; los guiones traen el reparto con los minutos de cada persona, `guiones/guion-ejecutivo-7-personas.md` le da a cada una solo lo suyo, y [`guiones/reparto-y-recomendaciones.md`](guiones/reparto-y-recomendaciones.md) trae las recomendaciones: por qué cada persona, la línea de tiempo, los relevos, consejos, a quién pasarle cada pregunta, qué saltar si falta tiempo y la lista del día. Las recomendaciones salen de [`contenido/recomendaciones.ts`](contenido/recomendaciones.ts).

## Variantes

Hay tres variantes; cada una contiene a la anterior y comparten el mismo texto oral. **La que se presenta es la ejecutiva.**

| Variante | Láminas | Para qué |
| --- | --- | --- |
| Resumen | 19 | Charla corta: el negocio, el sistema, la base de datos, la interconexión, DevOps, una caída en vivo, el valor y lo que pueden aplicar desde mañana. |
| Ejecutivo | 48 | La presentación del equipo, unos 47 minutos con la demostración en vivo: todas las partes con sus aprendizajes, sin código. |
| Técnico | 53 | El ejecutivo más el código, la configuración, el esquema SQL y los diagramas detallados. |

El ejecutivo tiene, además, dos versiones para cuando la demostración en vivo no es posible. Salen del mismo contenido con los cambios de [`contenido/variantes.ts`](contenido/variantes.ts):

| Variante | Láminas | Para qué |
| --- | --- | --- |
| Ejecutivo con videos | 48 | Unos 44 minutos. La parte 7 muestra dos videos grabados con la UI real, dentro del PPTX: el recorrido (crear, enviar y seguir una solicitud) y la caída de notificaciones con la reentrega. Un clic reproduce cada video y Alt+P lo pausa; al lado, la lista con los mismos pasos que los rótulos del video. |
| Ejecutivo sin demostración | 45 | Unos 41 minutos. No hay parte 7: la observabilidad pasa directo al cierre, y la portada, la agenda, Codespaces y los logs ya no anuncian una demostración. |

## Entregables

| Archivo | Para qué sirve |
| --- | --- |
| [`pptx/ARKA-Lite-ejecutivo.pptx`](pptx/ARKA-Lite-ejecutivo.pptx) | La presentación del equipo. |
| [`pptx/ARKA-Lite-resumen.pptx`](pptx/ARKA-Lite-resumen.pptx) | Versión corta. |
| [`pptx/ARKA-Lite-tecnico.pptx`](pptx/ARKA-Lite-tecnico.pptx) | Con código, contratos y configuración. |
| [`pptx/ARKA-Lite-ejecutivo-con-videos.pptx`](pptx/ARKA-Lite-ejecutivo-con-videos.pptx) | La presentación del equipo con la demostración grabada: no necesita el sistema ni internet. |
| [`pptx/ARKA-Lite-ejecutivo-sin-demo.pptx`](pptx/ARKA-Lite-ejecutivo-sin-demo.pptx) | La presentación del equipo sin la parte 7. |
| [`pdf/`](pdf/) | Por variante, dos PDF: `ARKA-Lite-<variante>-laminas.pdf`, las láminas para compartir, y `ARKA-Lite-<variante>-guion.pdf`, el contenido con el guion para ensayar o imprimir. |
| [`guiones/`](guiones/) | Un guion por variante (`guion-<variante>.md`), el guion de cada persona para cada versión del ejecutivo (`guion-ejecutivo-7-personas.md`, `guion-ejecutivo-con-videos-7-personas.md` y `guion-ejecutivo-sin-demo-7-personas.md`) y el reparto con recomendaciones. |
| [`BackUp-pptx/`](BackUp-pptx/) | Versiones anteriores. `version-8-partes/` es la versión de ocho partes sin reparto (18, 39 y 62 láminas) con su fuente de contenido; `version-7-partes/` es la presentación larga (93 y 139 láminas) con sus guiones por participante; `version-3-variantes/` es la primera versión corta (16, 34 y 53 láminas). |

Los PPTX tienen texto, tablas, diagramas e íconos editables, y las notas del expositor en cada lámina. Los entregables se generan; no se editan a mano.

## Recursos visuales

| Recurso | Dónde se usa |
| --- | --- |
| Aprendizajes | Al final de cada parte: métricas en un panel oscuro y, por aprendizaje, su valor en verde. |
| Equipo | El equipo arka-litos por área y qué parte presenta cada una. |
| Ruta | Qué vamos a ver: cada parte con su enfoque (vista general, a fondo o en vivo). |
| Sistema en la práctica | La persona, la UI, los dos servicios y sus bases con las seis conexiones numeradas; el evento va como el dato que viaja. |
| Mapeo | Cómo el ORM traduce una clase a una tabla y cada operación a SQL. |
| Escenario de falla | Qué falla, cómo reacciona el sistema en el tiempo y el resultado: un Pod que se cae y notificaciones caído. |
| Matriz | Dónde está la cadena de conexión, quién habla con quién, cómo se comporta el sistema ante cada falla y el valor agregado por pilar. |
| Capas | El sistema de un vistazo y los recursos de Kubernetes. |
| Hexágono | Puertos y adaptadores: entrada, dominio, puertos y salida. |
| Tablas | Las bases de datos con sus tablas, columnas y llaves. |
| Contraste | Síncrono frente a asíncrono; monolito frente a microservicios. Docker **más** Kubernetes: se complementan. |
| Caminos | Procedimiento almacenado frente a ORM, un carril por enfoque, con la marca de dónde vive la regla del negocio. |
| Orígenes | De dónde sale la cadena de conexión: Compose, el Deployment y el Secret llegan al servicio, y la imagen no lleva nada. |
| Ramas | Una rama corta que vuelve a main por Pull Request. |
| Cifras, flujos, tubería y capturas | Los números del proyecto, la bandeja de salida, el pipeline, Swagger y la UI. |
| Íconos | Trazos vectoriales nativos de PowerPoint ([Lucide](https://lucide.dev), licencia ISC). |

Las capturas viven en [`capturas/`](capturas/) y no se generan con `npm run todo`: se toman con el sistema arriba (`docker compose up --build -d`) y el script [`capturas/capturar.ps1`](capturas/capturar.ps1). Si falta una, la validación lo avisa.

Los videos de la versión con videos viven en [`capturas/videos/`](capturas/videos/) y tampoco se generan con `npm run todo`. Se graban con el sistema arriba y `npm run videos` ([`capturas/grabar-videos.ts`](capturas/grabar-videos.ts)): Edge sin ventana abre la UI, un guion mueve un cursor visible, escribe, hace clic y muestra rótulos numerados (los pasos de [`contenido/videos.ts`](contenido/videos.ts), los mismos que lista la lámina), y para la caída detiene y vuelve a iniciar `servicio-notificaciones` de verdad, con una terminal en pantalla que muestra el comando. Las esperas, como el arranque de notificaciones, se aceleran ×4 y el video lo dice. El mismo Edge codifica los cuadros en MP4 H.264 con WebCodecs ([`mediabunny`](https://mediabunny.dev)), sin instalar ffmpeg; `videos.json` guarda la duración real, que usan los minutos y la lámina. `npm run videos -- caida` graba solo uno.

## Cómo leer un guion

Cada guion empieza con **palabras clave en una frase** ([`contenido/glosario.ts`](contenido/glosario.ts)), para que todo el equipo explique igual y sin jerga.


| Parte | Qué es |
| --- | --- |
| **En pantalla** | Lo que ve el público. |
| **Lo que se lleva el staff** | El valor de la lámina en una frase. |
| **Qué decir** | Texto para decir en voz alta. **▶ clic** marca el momento de hacer clic: ahí aparece la siguiente pieza del diagrama. La validación exige tantas marcas como clics tiene el visual. |
| **Presenta** | Quién presenta la lámina, si no es quien presenta la sección. |
| **Qué hacer** | Indicaciones para quien expone, como las demostraciones de fallas. No se dicen. |
| **Si hay tiempo, se puede agregar** | Ejemplos y datos reales del proyecto para nutrir la explicación ([`contenido/ampliar.ts`](contenido/ampliar.ts)). No cuentan en los minutos. |
| **Si preguntan** | Preguntas probables del staff, con su respuesta corta. |
| **Para pasar** | La frase que conecta con la lámina siguiente; si cambia quien presenta, es el relevo. |

## Estructura

```text
docs/presentation-data/
├── contenido/          Fuente: partes, láminas, guion, recursos visuales y reparto
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

`npm run todo` valida el contenido, revisa los tipos, corre las pruebas y genera PPTX, PDF de guion y guiones de las cinco variantes. Los PDF de láminas los exporta PowerPoint, así que van aparte y solo en Windows: `npm run pdf-laminas`, después de `npm run todo`. Para una sola parte: `npm run pptx`, `npm run pdf` o `npm run guiones`; para una sola variante: `npm run pptx -- ejecutivo-con-videos`. Si cambia la UI o los pasos de un video, grabar otra vez con `npm run videos` antes de `npm run todo`.

La validación exige que cada parte numerada termine con su lámina de aprendizajes y diga su enfoque, que cada variante contenga a la anterior, que las dos divisiones del equipo tengan a alguien para cada lámina y que el texto oral marque cada clic del diagrama. En las versiones con videos y sin demostración, además, que cada texto a reemplazar exista, que los videos estén grabados y que ninguna lámina diga «en vivo» o anuncie una demostración que no se hace.

Para usar un ícono que no está en [`diseno/iconos.ts`](diseno/iconos.ts), agregarlo desde el paquete `lucide-static` con su misma estructura. `node generador-pptx/muestra-iconos.ts <salida.pptx>` genera una lámina con todos los íconos para revisarlos.

## Material de referencia

- [Descripción del proyecto y su API](../inicio/proyecto.md)
- [Flujo de una solicitud y referencias al código](../arquitectura/flujo-y-referencias.md)
- [Datos y consistencia: transacciones, outbox e idempotencia](../arquitectura/datos-y-consistencia.md)
- [Observabilidad: logs, métricas y trazas](../operaciones/observabilidad.md)
- [Infraestructura y entrega](../operaciones/infraestructura-y-entrega.md)
- [Creación de ci.yml paso a paso](../automatizacion/ci-yaml-paso-a-paso.md)
- [La UI arka-lite-ui](../../arka-lite-ui/README.md)

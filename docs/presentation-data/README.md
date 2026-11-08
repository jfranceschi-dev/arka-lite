# Presentación del proyecto final · Upskilling Backend Java

Esta carpeta es la **presentación de ARKA-Lite**: el contenido, los generadores y los entregables (PPTX, PDF y guiones). Es un proyecto propio; la UI `arka-lite-ui` no depende de ella ni genera presentaciones.

La presentación es para el **staff de tecnología**, técnico y no técnico, y la presenta el **equipo arka-litos**. Muchas personas del público trabajan sobre todo con la base de datos y procedimientos almacenados, así que cada término nuevo (ORM, Docker, Kubernetes, Outbox) se explica con un ejemplo cotidiano antes de usarlo.

## Cómo está organizada

Todos los equipos del curso presentan las mismas secciones, pero cada uno profundiza en algunas para no repetir contenido. El equipo anterior se enfoca en fundamentos y arquitectura hexagonal; arka-litos los ve en **vista general** y va **en detalle** en la base de datos, la interconexión de los servicios y DevOps. La presentación narra el proyecto de punta a punta, y **cada parte numerada termina con una lámina de aprendizajes**.

| Parte | Enfoque | Qué explica |
| --- | --- | --- |
| Apertura | | La portada, con el nombre del equipo, y qué vamos a ver. No hay lámina de equipo para el público. |
| 1 Fundamentos | Vista general | Lo que nos quedó, porque el equipo anterior lo trabaja a fondo: analizar antes de programar y seis buenas prácticas que sirven en cualquier lenguaje |
| 2 Arquitectura | Vista general | Lo que nos quedó: el sistema por capas, cómo funciona en la práctica y hexagonal por dentro |
| 3 Base de datos | En detalle | Dos bases PostgreSQL, su estructura, del procedimiento almacenado al ORM, la misma regla escrita de las dos formas, qué es un ORM, cómo traduce, el viaje de un dato, dónde se guardan los datos de conexión (web.config frente a variables de entorno) y las transacciones |
| 4 Interconexión de servicios | En detalle | Quién habla con quién, síncrono y asíncrono, el patrón Outbox y la idempotencia |
| 5 DevOps: Docker y Kubernetes | En detalle | Qué es DevOps. Docker: se complementa con Kubernetes, de código a contenedor, sus bondades y todo con un comando. CI/CD: cómo entra un cambio (Git y Pull Request), el control de calidad automático, cuando un cambio rompe algo y la etiqueta de cada imagen. Kubernetes: cómo trabaja, contenedores y Pods, sus bondades, memoria y CPU, y un Pod que se cae |
| 6 Observabilidad | Vista general | Tres preguntas (¿está vivo?, ¿qué pasó?, ¿por dónde pasó?) y el caso de un aviso que no llegó |
| 7 Demostración | En video | Solo en la versión con videos: cómo interactúan los componentes, con una caída de notificaciones y un evento reentregado |
| Valor y cierre | | Los resultados en el idioma del negocio, lo que los sostiene y lo que nos llevamos |

Cada idea ocupa **una sola lámina**, con más diagramas que texto. Las láminas **aparecen completas, con un fundido**: no se arman por clics, y un clic siempre pasa a la siguiente, también sobre un video. En la portada, las siete partes giran despacio alrededor de ARKA-Lite (una vuelta cada 6 minutos, sin girar los textos); arranca sola y no detiene el avance. No hay portadas por sección: una barra de avance arriba a la derecha indica la parte. La presentación no menciona Codespaces, nginx ni el pool de conexiones; la validación lo comprueba.

## Reparto

Cada lámina tiene un papel (el de su sección o uno propio), y [`contenido/reparto.ts`](contenido/reparto.ts) asigna los papeles a las 7 personas del equipo.

| Persona | Área | Presenta |
| --- | --- | --- |
| Luis Cardoze | Desarrollo | Apertura y fundamentos |
| Ricardo Fábrega | Desarrollo | Arquitectura |
| Marlene Bonilla | Base de datos | Las dos bases, su estructura, del procedimiento al ORM, la transacción y los aprendizajes |
| Jossett Franceschi | Desarrollo | Apoyo en base de datos (la misma regla, el ORM y la conexión) y CI/CD |
| Abdiel Barria | Desarrollo | Interconexión de servicios, la demostración en video, resultados y cierre; recibe las preguntas |
| Kevin | Infraestructura | DevOps: qué es DevOps, Docker y Compose |
| Moises | Infraestructura | DevOps: Kubernetes; después, la observabilidad |

Cada PPTX termina con una lámina de apoyo, «Reparto de la presentación», con los números de lámina de esa versión; **se quita antes de presentar**. Las notas del expositor y el PDF dicen quién presenta cada lámina, y [`guiones/reparto-y-recomendaciones.md`](guiones/reparto-y-recomendaciones.md) trae por qué cada persona, la línea de tiempo, los relevos, consejos, a quién pasarle cada pregunta, qué saltar si falta tiempo y la lista del día.

## Las dos versiones

Solo hay dos versiones, y salen del mismo contenido con los cambios de [`contenido/variantes.ts`](contenido/variantes.ts). `guiones/reparto-y-recomendaciones.md` trae sus láminas y minutos actuales.

| Versión | Para qué |
| --- | --- |
| Con videos | Cuatro videos dentro del PPTX: en la parte 5, un ejemplo ilustrativo de CI/CD, del merge al despliegue (simulado, porque el pipeline real llega hasta publicar la imagen); en la parte 6, la búsqueda de los registros de una solicitud en Grafana (sin demostración, esa lámina muestra el diagrama de Promtail, Loki y Grafana); en la parte 7, dos grabaciones del sistema real, el recorrido y la caída de notificaciones con la reentrega, con una franja que marca qué componente trabaja. Cada video arranca solo al llegar a la lámina y Alt+P lo pausa; al lado, la lista con los mismos pasos que los rótulos del video. |
| Sin demostración | No hay parte 7: la observabilidad pasa directo al cierre, y nada anuncia una demostración. |

## Entregables

| Archivo | Para qué sirve |
| --- | --- |
| [`pptx/ARKA-Lite-ejecutivo-con-videos.pptx`](pptx/ARKA-Lite-ejecutivo-con-videos.pptx) | La presentación con la demostración grabada: no necesita el sistema ni internet. |
| [`pptx/ARKA-Lite-ejecutivo-sin-demo.pptx`](pptx/ARKA-Lite-ejecutivo-sin-demo.pptx) | La presentación sin la parte 7. |
| [`pdf/`](pdf/) | Por versión, cuatro PDF: `ARKA-Lite-<versión>-laminas.pdf`, las láminas para compartir; `ARKA-Lite-<versión>-guion.pdf`, el contenido con el guion completo para ensayar o imprimir; `ARKA-Lite-<versión>-solo-guion.pdf`, solo lo que se dice en voz alta, lámina por lámina; y `ARKA-Lite-<versión>-laminas-y-guion.pdf`, cada lámina en imagen con su guion debajo. |
| [`guiones/`](guiones/) | Por versión, el guion completo (`guion-<versión>.md`) y el de cada persona (`guion-<versión>-por-persona.md`); además, el reparto con recomendaciones. |
| [`BackUp-pptx/`](BackUp-pptx/) | Versiones anteriores. |

Los PPTX tienen texto, tablas, diagramas e íconos editables, y las notas del expositor en cada lámina. Los entregables se generan: **los cambios hechos a mano en un PPTX se pierden al regenerar**, así que van en `contenido/`.

## Recursos visuales

| Recurso | Dónde se usa |
| --- | --- |
| Aprendizajes | Al final de cada parte: métricas en un panel oscuro y, por aprendizaje, su valor en verde. |
| Ruta | Qué vamos a ver: cada parte con su enfoque. |
| Sistema en la práctica | La persona, la UI, los dos servicios y sus bases con las seis conexiones numeradas. |
| Mapeo | Cómo el ORM traduce una clase a una tabla y cada operación a SQL. |
| Pods | De la imagen al Pod: el molde, lo que pedimos, el nombre fijo y cada Pod con su contenedor adentro. |
| Escenario de falla | Qué falla, cómo reacciona el sistema en el tiempo y el resultado. |
| Matriz | Analizar antes de programar, quién habla con quién, los resultados y lo que los sostiene. |
| Capas | El sistema de un vistazo. |
| Hexágono | Las reglas al centro, con la entrada y la salida alrededor. |
| Tablas | Las bases de datos con sus tablas y columnas. |
| Contraste | Síncrono frente a asíncrono, web.config frente a variables de entorno. Docker **más** Kubernetes, y memoria y CPU en cada uno. |
| Caminos | Procedimiento almacenado frente a ORM, con la marca de dónde vive la regla del negocio. |
| Ramas | Una rama que vuelve a main por Pull Request. |
| Tarjetas, cifras, flujos y tubería | Las bondades de Docker y de Kubernetes, los números del proyecto, la bandeja de salida y el camino de DevOps. |
| Íconos | Trazos vectoriales nativos de PowerPoint ([Lucide](https://lucide.dev), licencia ISC). |

Los videos de la versión con videos viven en [`capturas/videos/`](capturas/videos/) y tampoco se generan con `npm run todo`. Se graban con el sistema arriba y `npm run videos` ([`capturas/grabar-videos.ts`](capturas/grabar-videos.ts)): Edge sin ventana abre la UI, un guion mueve un cursor visible, escribe, hace clic y muestra rótulos numerados (los pasos de [`contenido/videos.ts`](contenido/videos.ts), los mismos que lista la lámina), y para la caída detiene y vuelve a iniciar `servicio-notificaciones` de verdad, con una terminal en pantalla que muestra el comando. Las esperas, como el arranque de notificaciones, se aceleran ×4 y el video lo dice. El mismo Edge codifica los cuadros en MP4 H.264 con WebCodecs ([`mediabunny`](https://mediabunny.dev)), sin instalar ffmpeg; `videos.json` guarda la duración real, que usan los minutos y la lámina. `npm run videos -- caida` graba solo uno. El de registros conecta Loki en Grafana y carga el tablero de [`capturas/grabadora/tablero-registros.json`](capturas/grabadora/tablero-registros.json) si faltan, y antes de grabar envía una solicitud nueva para que la búsqueda tenga qué mostrar. En [`capturas/`](capturas/) también quedan las capturas que toma [`capturas/capturar.ps1`](capturas/capturar.ps1), que hoy ninguna lámina usa.

## Cómo leer un guion

Cada guion empieza con **palabras clave en una frase** ([`contenido/glosario.ts`](contenido/glosario.ts)), para que todo el equipo explique igual y sin jerga.

| Parte | Qué es |
| --- | --- |
| **En pantalla** | Lo que ve el público. |
| **Lo que se lleva el staff** | El valor de la lámina en una frase. |
| **Qué decir** | Texto para decir en voz alta. No hace falta aprendérselo. |
| **Con tus palabras** | Las ideas de la lámina en frases cortas, para parafrasear sin memorizar. |
| **Presenta** | Quién presenta la lámina, si no es quien presenta la sección. |
| **Qué hacer** | Indicaciones para quien expone. No se dicen. |
| **Si hay tiempo, se puede agregar** | Ejemplos y datos reales del proyecto para nutrir la explicación ([`contenido/ampliar.ts`](contenido/ampliar.ts)). No cuentan en los minutos. |
| **Si preguntan** | Preguntas probables del staff, con su respuesta corta. |
| **Para pasar** | La frase que conecta con la lámina siguiente; si cambia quien presenta, es el relevo. |

## Estructura

```text
docs/presentation-data/
├── contenido/          Fuente: partes, láminas, guion, recursos visuales y reparto
├── diseno/             Colores, tipografía e íconos
├── capturas/           Videos de la UI y el script que los graba; capturas de pantalla
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

`npm run todo` valida el contenido, revisa los tipos, corre las pruebas y genera PPTX, PDF de guion y guiones de las dos versiones; también borra los archivos de versiones que ya no existen. Los PDF de láminas, y el de láminas con su guion, los exporta PowerPoint, así que van aparte y solo en Windows: `npm run pdf-laminas`, después de `npm run todo`. Para una sola parte: `npm run pptx`, `npm run pdf` o `npm run guiones`; para una sola versión: `npm run pptx -- ejecutivo-con-videos`. Si cambia la UI o los pasos de un video, grabar otra vez con `npm run videos` antes de `npm run todo`.

La validación exige que cada parte numerada termine con sus aprendizajes y diga su enfoque, que el reparto tenga a alguien para cada lámina, que cada lámina traiga «Con tus palabras» y material «si hay tiempo», que cada texto a reemplazar exista, que los videos estén grabados, que ninguna lámina anuncie una demostración que no se hace y que nada mencione Codespaces, nginx ni el pool de conexiones.

Para usar un ícono que no está en [`diseno/iconos.ts`](diseno/iconos.ts), agregarlo desde el paquete `lucide-static` con su misma estructura. `node generador-pptx/muestra-iconos.ts <salida.pptx>` genera una lámina con todos los íconos para revisarlos.

## Material de referencia

- [Descripción del proyecto y su API](../inicio/proyecto.md)
- [Flujo de una solicitud y referencias al código](../arquitectura/flujo-y-referencias.md)
- [Datos y consistencia: transacciones, outbox e idempotencia](../arquitectura/datos-y-consistencia.md)
- [Observabilidad: logs, métricas y trazas](../operaciones/observabilidad.md)
- [Infraestructura y entrega](../operaciones/infraestructura-y-entrega.md)
- [Creación de ci.yml paso a paso](../automatizacion/ci-yaml-paso-a-paso.md)
- [La UI arka-lite-ui](../../arka-lite-ui/README.md)

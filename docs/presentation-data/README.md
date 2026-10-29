# Presentación del proyecto final · Upskilling Backend Java

Esta carpeta es la **presentación de ARKA-Lite**: el contenido, los generadores y los entregables (PPTX, PDF y guiones). Es un proyecto propio; la UI `arka-lite-ui` no depende de ella ni genera presentaciones.

La presentación es para el **staff de tecnología**, y la presenta el **equipo arka-litos**. Muchas personas del público trabajan sobre todo con la base de datos y procedimientos almacenados, así que cada término nuevo (ORM, Docker, Kubernetes, Outbox) se explica en lenguaje simple antes de usarlo.

## Cómo está organizada

Todos los equipos del curso presentan las mismas secciones, pero cada uno profundiza en algunas para no repetir contenido. El equipo anterior se enfoca en fundamentos y arquitectura hexagonal; arka-litos los ve en **vista general** y va **a fondo** en la base de datos, la interconexión de los servicios y DevOps. La presentación narra el proyecto de punta a punta: cada parte retoma lo que dejó la anterior, y **cada parte numerada termina con una lámina de aprendizajes** que se pueden llevar a cualquier proyecto, sin importar el lenguaje.

| Parte | Enfoque | Qué explica |
| --- | --- | --- |
| Apertura | | La portada, el equipo arka-litos (cuántas personas por área) y qué vamos a ver, con el enfoque de cada parte |
| 1 Fundamentos | Vista general | Primero el qué, después el cómo: el negocio en una lámina (personas y pasos), seis buenas prácticas que sirven en cualquier lenguaje y Git y documentación |
| 2 Arquitectura | Vista general | El sistema por capas, cómo funciona en la práctica (el evento es un dato que viaja, no una pieza) y hexagonal en una frase: ordena el código por dentro, no cambia el despliegue |
| 3 Base de datos | A fondo | Dos bases PostgreSQL, su estructura, del procedimiento almacenado al ORM, cómo traduce el ORM, el viaje de un dato, dónde está la cadena de conexión y las transacciones |
| 4 Interconexión de servicios | A fondo | Quién habla con quién, síncrono y asíncrono, el patrón Outbox y la idempotencia |
| 5 DevOps: Docker y Kubernetes | A fondo | Docker y Kubernetes se complementan, todo con un comando, los recursos de Kubernetes, un Pod que se cae y el pipeline |
| 6 Observabilidad | Vista general | Logs centralizados con traceId |
| 7 Demostración con la UI | En vivo | La UI no es el entregable: ejemplifica en vivo lo que se contó, con una caída de notificaciones y un evento reentregado |
| Valor y cierre | | El valor agregado por pilar y lo que nos llevamos |

Cada idea ocupa **una sola lámina**, con más diagramas que texto: el staff no tiene que leer teoría. Los diagramas se **arman clic a clic** dentro de la misma lámina (cada pieza aparece con un fundido) y cada lámina entra con una transición suave. No hay portadas por sección: una barra de avance arriba a la derecha indica la parte. Al cierre, "Lo que pueden aplicar desde mañana" junta las prácticas que funcionan también con procedimientos almacenados.

## Reparto

Cada lámina tiene un papel (el de su sección o uno propio), y [`contenido/reparto.ts`](contenido/reparto.ts) asigna los papeles a personas en dos divisiones del equipo:

| División | Cuándo | Quién presenta qué |
| --- | --- | --- |
| 8 personas | Si están los cinco de desarrollo | Orquestador (apertura, negocio y cierre), Desarrollo 2 (fundamentos), Desarrollo 3 (arquitectura), Desarrollo 4 (el ORM y la demostración), Desarrollo 5 (interconexión), Base de datos, Infraestructura 1 (Docker, Compose y Kubernetes) e Infraestructura 2 (autocuración, CI/CD y observabilidad) |
| 7 personas | Si son cuatro de desarrollo | Igual, pero fundamentos y arquitectura, las dos en vista general, quedan en Desarrollo 2 |

Las notas del expositor y el PDF dicen quién presenta cada lámina en las dos divisiones; los guiones traen el reparto con los minutos de cada persona.

## Variantes

Hay tres variantes; cada una contiene a la anterior y comparten el mismo texto oral. **La que se presenta es la ejecutiva.**

| Variante | Láminas | Para qué |
| --- | --- | --- |
| Resumen | 20 | Charla corta: el equipo, el negocio, el sistema, la base de datos, la interconexión, DevOps, una caída en vivo, el valor y lo que pueden aplicar desde mañana. |
| Ejecutivo | 40 | La presentación del equipo, unos 40 minutos con la demostración: todas las partes con sus aprendizajes, sin código. |
| Técnico | 47 | El ejecutivo más el código, la configuración, el esquema SQL y los diagramas detallados. |

## Entregables

| Archivo | Para qué sirve |
| --- | --- |
| [`pptx/ARKA-Lite-ejecutivo.pptx`](pptx/ARKA-Lite-ejecutivo.pptx) | La presentación del equipo. |
| [`pptx/ARKA-Lite-resumen.pptx`](pptx/ARKA-Lite-resumen.pptx) | Versión corta. |
| [`pptx/ARKA-Lite-tecnico.pptx`](pptx/ARKA-Lite-tecnico.pptx) | Con código, contratos y configuración. |
| [`pdf/`](pdf/) | Por variante, dos PDF: `ARKA-Lite-<variante>-laminas.pdf`, las láminas para compartir, y `ARKA-Lite-<variante>-guion.pdf`, el contenido con el guion para ensayar o imprimir. |
| [`guiones/`](guiones/) | `guion-resumen.md`, `guion-ejecutivo.md` y `guion-tecnico.md`, más el guion de cada persona: `guion-ejecutivo-8-personas.md` y `guion-ejecutivo-7-personas.md`. |
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

`npm run todo` valida el contenido, revisa los tipos, corre las pruebas y genera PPTX, PDF de guion y guiones. Los PDF de láminas los exporta PowerPoint, así que van aparte y solo en Windows: `npm run pdf-laminas`, después de `npm run todo`. Para una sola parte: `npm run pptx`, `npm run pdf` o `npm run guiones`; para una sola variante: `npm run pptx -- resumen`.

La validación exige que cada parte numerada termine con su lámina de aprendizajes y diga su enfoque, que cada variante contenga a la anterior, que las dos divisiones del equipo tengan a alguien para cada lámina y que el texto oral marque cada clic del diagrama.

Para usar un ícono que no está en [`diseno/iconos.ts`](diseno/iconos.ts), agregarlo desde el paquete `lucide-static` con su misma estructura. `node generador-pptx/muestra-iconos.ts <salida.pptx>` genera una lámina con todos los íconos para revisarlos.

## Material de referencia

- [Descripción del proyecto y su API](../inicio/proyecto.md)
- [Flujo de una solicitud y referencias al código](../arquitectura/flujo-y-referencias.md)
- [Datos y consistencia: transacciones, outbox e idempotencia](../arquitectura/datos-y-consistencia.md)
- [Observabilidad: logs, métricas y trazas](../operaciones/observabilidad.md)
- [Infraestructura y entrega](../operaciones/infraestructura-y-entrega.md)
- [Creación de ci.yml paso a paso](../automatizacion/ci-yaml-paso-a-paso.md)
- [La UI arka-lite-ui](../../arka-lite-ui/README.md)

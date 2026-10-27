# Presentación del proyecto final · Upskilling Backend Java

Esta carpeta es la **presentación de ARKA-Lite**: el contenido, los generadores y los entregables (PPTX, PDF y guiones). Es un proyecto propio; la UI `arka-lite-ui` no depende de ella ni genera presentaciones.

La presentación muestra lo que aprendimos en el curso y cómo funciona el proyecto: **una UI y dos microservicios Spring Boot**, cada uno con su base PostgreSQL.

## Cómo está organizada

No sigue el temario clase por clase. Cuenta cómo se construye el sistema, del "qué hace" al "cómo se opera", y cada tema del curso aparece donde se usa.

La presenta el **Equipo arka-litos**: siete personas, cuatro de desarrollo, dos de DevOps y una de base de datos. Cada quien presenta la parte de su área:

| Parte | Qué explica | Temas del curso | Presenta |
| --- | --- | --- | --- |
| Apertura | Quiénes somos, qué es ARKA-Lite y cómo vamos a recorrerlo | — | Participante 1 · Desarrollo |
| 1 El sistema por fuera | El mapa completo, la arquitectura general y los estados de una solicitud | Visión general | Participante 1 · Desarrollo |
| 2 Construir un servicio | Spring Boot, endpoints REST, la regla en el dominio, errores, Swagger, pruebas y Git | Spring Boot, endpoints REST, endpoint seguro con manejo global de errores, Git y documentación, Swagger, pruebas unitarias y commits | Participante 2 · Desarrollo |
| 3 Diseñar para cambiar | Componentes, puertos y adaptadores; de monolito a microservicios | Puertos y adaptadores, estructura base, descomposición del monolito | Participante 3 · Desarrollo |
| 4 Guardar sin perder datos | Adaptador con PostgreSQL, el problema de la consistencia, outbox e idempotencia | Modelado y consultas, adaptador con base real, el problema de la consistencia | Participante 4 · Base de datos |
| 5 Empaquetar y entregar | Dockerfile, Compose y el pipeline de integración y entrega continua | Docker y Dockerfile, Docker Compose, integración y entrega continua | Participante 5 · DevOps |
| 6 Desplegar y operar | Kubernetes, puesta a punto, logs centralizados y salud de los servicios | Kubernetes, del contenedor al clúster, puesta a punto, logs y monitoreo, centralización de logs | Participante 6 · DevOps |
| 7 Ensamblaje: la UI | Cómo la UI consume los dos servicios y demostración en vivo | Ensamblaje del sistema | Participante 7 · Desarrollo |
| Cierre | Tabla "tema del curso → dónde está en ARKA-Lite" y lo que falta | — | Participante 1 · Desarrollo |

Cada parte sigue el mismo orden: **qué problema resuelve → cómo lo aplicamos → diagrama paso a paso → evidencia**. En los diagramas, el número sobre cada flecha coincide con el paso que se lee.

Hay dos recorridos con el mismo texto oral: el **ejecutivo** (sin código) y el **técnico** (agrega código y configuración).

## Entregables

| Archivo | Para qué sirve |
| --- | --- |
| [`pptx/ARKA-Lite-ejecutivo.pptx`](pptx/ARKA-Lite-ejecutivo.pptx) | Presentación sin código, para un público mixto. |
| [`pptx/ARKA-Lite-tecnico.pptx`](pptx/ARKA-Lite-tecnico.pptx) | Presentación con código, contratos y configuración. |
| [`pdf/ARKA-Lite-ejecutivo.pdf`](pdf/ARKA-Lite-ejecutivo.pdf) | Contenido y guion del recorrido ejecutivo, para leer o imprimir. |
| [`pdf/ARKA-Lite-tecnico.pdf`](pdf/ARKA-Lite-tecnico.pdf) | Contenido y guion del recorrido técnico. |
| [`guiones/guion-ejecutivo.md`](guiones/guion-ejecutivo.md) · [`guiones/guion-tecnico.md`](guiones/guion-tecnico.md) | Guion completo de cada recorrido. |
| [`guiones/participantes/`](guiones/participantes/) | Un guion por persona (`p1.md` a `p7.md`): solo sus láminas, de quién recibe y a quién entrega. |

Los PPTX tienen texto, tablas y diagramas editables, y las notas del expositor en cada lámina. Cada diagrama se repite en láminas "paso a paso". Los entregables se generan; no se editan a mano.

## Cómo leer un guion

| Parte | Qué es |
| --- | --- |
| **En pantalla** | Lo que ve el público. |
| **Diagrama paso a paso** | Los pasos numerados; el número coincide con el de la flecha. |
| **Qué decir** | Texto para decir en voz alta. |
| **Qué hacer** | Indicaciones para quien expone. No se dicen. |
| **Si preguntan** | Una pregunta probable y su respuesta corta. |
| **Para pasar** | La frase que conecta con la lámina siguiente. |

## Estructura

```text
docs/presentation-data/
├── contenido/          Fuente: partes, láminas, guion y reparto (participantes.ts)
├── diagramas/          Diagramas de las láminas y su geometría
├── diseno/             Colores y tipografía
├── generador-pptx/     PowerPoint y su verificador
├── generador-pdf/      PDF de contenido y guion
├── generador-guiones/  Guiones en Markdown
├── pruebas/            Pruebas del contenido y del PPTX
├── pptx/ pdf/ guiones/ Entregables generados
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

`npm run todo` valida el contenido, revisa los tipos, corre las pruebas y genera PPTX, PDF y guiones. Para una sola parte: `npm run pptx`, `npm run pdf` o `npm run guiones`.

Para poner los nombres reales de las siete personas o cambiar el nombre del equipo (`EQUIPO`), editar [`contenido/participantes.ts`](contenido/participantes.ts) y regenerar.

## Material de referencia

- [Descripción del proyecto y su API](../inicio/proyecto.md)
- [Flujo de una solicitud y referencias al código](../arquitectura/flujo-y-referencias.md)
- [Datos y consistencia: transacciones, outbox e idempotencia](../arquitectura/datos-y-consistencia.md)
- [Observabilidad: logs, métricas y trazas](../operaciones/observabilidad.md)
- [Infraestructura y entrega](../operaciones/infraestructura-y-entrega.md)
- [Creación de ci.yml paso a paso](../automatizacion/ci-yaml-paso-a-paso.md)
- [La UI arka-lite-ui](../../arka-lite-ui/README.md)

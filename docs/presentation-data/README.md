# Guiones de presentación de ARKA-Lite

Material para dos presentaciones sobre la misma aplicación, adaptadas a públicos distintos. Incluye guiones, diagramas Mermaid y código para generar PowerPoint con texto, tablas, formas y conectores editables. El diseño utiliza azul marino, azul medio, azul claro y fondo blanco, con tipografía Arial.

| Presentación | Público | Duración sugerida | Enfoque |
| --- | --- | --- | --- |
| [Equipo de desarrollo](equipo-desarrollo.md) | Personas que implementan, prueban y mantienen código | 180–225 minutos, con pausas y demostraciones | Java, contratos, clases reales y recorrido técnico de los datos |
| [Staff de desarrollo](staff-desarrollo.md) | Coordinación y referentes que necesitan comprender decisiones técnicas sin revisar cada clase | 95–120 minutos, incluidas preguntas | Conceptos, responsabilidades, comunicación y efectos operativos |

“Staff” se interpreta aquí como una audiencia técnica que requiere menos detalle de implementación, conforme al alcance solicitado.

## Feedback del equipo y criterio de claridad

El [feedback integrado](feedback-integrado.md) identifica cada punto recibido, su ubicación en los guiones y la corrección técnica necesaria. Incluye flujos para público no técnico, secuencias con clases reales, comparación de monolito y servicios, y una matriz de cómo se aplicó lo aprendido.

La exposición presenta cada concepto en tres pasos: problema reconocible para el usuario, explicación visual y detalle de implementación. El guion maestro y las dos versiones por audiencia incorporan estas precisiones; los PowerPoint entregados antes siguen pendientes de sincronizar con estos cambios.

## Cómo preparar la exposición

1. Leer el [guion maestro](guion-maestro.md): apertura, nueve secciones, narración, demostraciones, preguntas y cierre.
2. Ensayar con el [guion oral de observabilidad](guion-observabilidad.md), que explica cada herramienta y sus conexiones desde cero.
3. Usar las versiones por unidad de equipo o staff para decidir qué contenido mostrar y cuánto detalle conservar.
4. Preparar los casos de laboratorio por separado. Los ejemplos y comandos del guion no son resultados observados.

El guion maestro conserva el orden acordado y relaciona cada bloque con sus unidades. El texto oral puede leerse y adaptarse; las instrucciones de apoyo son para el expositor. No se ha generado ni ajustado PowerPoint en esta etapa.

## Orden de ambas presentaciones

1. **Fundamentos:** cómo se construye código Java, variables y tipos, nombres, buenas prácticas y SOLID.
2. **Arquitectura hexagonal:** dominio, puertos, adaptadores, interfaces y organización del código.
3. **Arquitectura del sistema:** clases de servicios, comunicación y recorrido de los datos dentro de cada servicio y entre servicios.
4. **Docker:** construcción multietapa, imágenes, contenedores y Compose.
5. **Kubernetes:** reconciliación, recursos, salud y diagnóstico.
6. **CI/CD:** pipeline actual y propuesta de promoción entre ambientes.
7. **Git y GitHub:** historial, revisión y trazabilidad.
8. **Datos y consistencia:** modelo relacional, ACID, transacciones, Outbox Pattern, idempotencia, concurrencia, evolución y recuperación.
9. **Observabilidad:** logs, métricas y trazas, Grafana, Loki, recolección, instrumentación y diagnóstico operativo.

Cada lámina incluye contenido para mostrar, un guion para el expositor y una transición. Los ejemplos didácticos se identifican; las descripciones de ARKA-Lite corresponden al código actual del repositorio.

## Caso conductor

Una solicitud `INC-002` se crea como `BORRADOR`, se envía y finalmente produce un aviso. El envío guarda un evento pendiente en PostgreSQL; otro componente lo entrega por HTTP. El aviso puede aparecer después de la respuesta de envío.

La explicación distingue tres cosas: el estado de la solicitud, el estado de entrega del evento y el texto de la notificación. No se almacenan en el mismo lugar ni se completan al mismo tiempo.

## Material compartido

- [Guion maestro de la presentación completa](guion-maestro.md).
- [Cobertura del feedback, correcciones y flujos para público mixto](feedback-integrado.md).
- [Guion oral desarrollado de observabilidad](guion-observabilidad.md).

- [Flujo detallado, contrato y referencias al código](flujo-y-referencias.md).
- [Diagramas de infraestructura y entrega](infraestructura-y-entrega.md).
- [Creación y explicación de ci.yml en GitHub](ci-yaml-paso-a-paso.md).
- [Datos y consistencia: diagramas, laboratorio y referencias](datos-y-consistencia.md).
- [Observabilidad: componentes, consultas y diagnóstico](observabilidad.md).
- [Descripción de la aplicación](../inicio/proyecto.md).
- [Componentes Java](../arquitectura/componentes-java.md).
- [Preparación de bases locales](../inicio/bases-de-datos-locales.md).

No presentar como funcionalidades implementadas un broker de mensajes, entrega exactamente una vez, persistencia del texto de las notificaciones o aislamiento completo del dominio frente a frameworks. Las diferencias entre el diseño deseado y la implementación actual forman parte de los guiones.

Volver al [índice de documentación](../README.md).

## Estado del contenido

La prioridad actual son los Markdown: contenido para mostrar, guion del expositor, transiciones y diagramas Mermaid. Las secciones 1 a 9 están desarrolladas en ambos guiones.

| Versión | Unidades de contenido en Markdown | Sección de datos y consistencia |
| --- | --- | --- |
| Equipo | 65 | 46–57, doce unidades |
| Staff | 36 | 27–32, seis unidades |

Observabilidad agrega ocho unidades para equipo (58–65) y cuatro para staff (33–36). El material distingue logs de contenedores y archivos del sistema, y explica la relación entre Actuator, health, Micrometer, Prometheus y Grafana.

Los PowerPoint entregados anteriormente tienen 45 y 26 láminas respectivamente. **Las secciones 8 y 9 todavía no se han generado ni ajustado en PowerPoint.** Sus diagramas están en el material compartido como Mermaid y su composición futura en PPT queda pendiente. Los tiempos totales son orientativos y permiten dividir el material en varias sesiones.

## Generar y editar el PowerPoint

Desde la raíz del repositorio, en PowerShell:

```powershell
.\docs\presentation-data\generar-ppt.ps1
```

El script usa el runtime de presentaciones incluido en Codex; no descarga paquetes. Si cambian sus rutas, utiliza los parámetros `-RuntimeRoot` y `-SkillRoot`. Requiere `@oai/artifact-tool`, Node.js y los validadores del runtime. No necesita Java ni levantar los servicios.

Cada ejecución crea una carpeta con fecha en `output/`, con `equipo-desarrollo.pptx` y `staff-desarrollo.pptx`, a partir de las unidades presentes en los guiones al ejecutarse. Las notas del presentador incluyen el guion y las transiciones. Los PNG y reportes de validación se guardan en `.build/`; `.build/latest.json` identifica la última generación completa. Estas salidas se excluyen de Git para versionar las fuentes.

| Para cambiar | Archivo fuente |
| --- | --- |
| Contenido y notas del equipo | [equipo-desarrollo.md](equipo-desarrollo.md) |
| Contenido y notas del staff | [staff-desarrollo.md](staff-desarrollo.md) |
| Nodos, zonas, etiquetas y conexiones en PPT | [diagramas.mjs](diagramas.mjs) |
| Diagramas de documentación | [flujo-y-referencias.md](flujo-y-referencias.md) |
| Colores, tamaños y composición | [generar-ppt.mjs](generar-ppt.mjs) |
| Rutas de dependencias y ejecución | [generar-ppt.ps1](generar-ppt.ps1) |

Para agregar las próximas secciones, conserva el formato `## Sección N · Título` y agrega láminas `### NN · Título`, con bloques `**En pantalla**` y `**Guion del expositor**`. La sección se obtiene del Markdown. Para una lámina con diagrama, agrega su número a `diagramSlides` en `diagramas.mjs`. Si renumeras láminas, actualiza esa correspondencia.

En las láminas con diagrama, el dibujo sustituye al bloque «En pantalla»; el contenido completo permanece en las notas. Los diagramas Mermaid y los del PPT son fuentes distintas: actualiza ambos si cambia el flujo.

# Guion oral de observabilidad

Guion listo para ensayar la sección 9. Los bloques **Texto para decir** son narración; las indicaciones de demostración son para quien presenta. No se ejecutaron comandos, no se configuraron fuentes y no se generó PowerPoint para preparar este documento.

Corresponde a las unidades 58–65 del equipo. Para staff se pueden unir los bloques 58–59, resumir 60–62 y conservar el diagnóstico 64. Tiempo sugerido: 30–40 minutos con demostración o 15–20 minutos de explicación abreviada. Ajustar tras el ensayo.

Caso conductor: INC-002. Las respuestas JSON, consultas y situaciones son ejemplos salvo que se muestre evidencia del entorno.


## 58 · Qué significa observar una aplicación

**Idea para mostrar**

Logs, métricas y trazas responden preguntas distintas. El resultado de negocio se comprueba con sus datos.

**Texto para decir**

> Imaginemos que una persona nos dice: envié mi solicitud y nunca apareció el aviso. Para responder necesitamos más información que saber si el servidor está encendido. Queremos saber si la solicitud quedó guardada, si se creó el evento, si alguien intentó entregarlo y si el receptor produjo el aviso.

> Un log registra un hecho con contexto: por ejemplo, un intento de publicación que falló. Una métrica resume mediciones: cuántas peticiones llegaron o cuánto tardaron. Una traza relaciona operaciones dentro de una ejecución instrumentada. Cada señal nos ayuda a responder una pregunta diferente.

> La observabilidad consiste en usar esas señales para comprender el comportamiento del sistema. Los datos de negocio siguen siendo necesarios: un mensaje que dice intentando publicar no demuestra que la publicación terminó. Tampoco una aplicación que informa buena salud demuestra que una solicitud particular completó todo el recorrido.

> Durante esta sección vamos a investigar el mismo caso usando esas diferencias. Primero ubicaremos las herramientas, después seguiremos la información y finalmente practicaremos un diagnóstico.

**Demostración o apoyo del expositor**

Mostrar el caso ENVIADA con aviso ausente como escenario didáctico. No inventar un resultado observado.

**Pregunta al público:** ¿Qué sabemos realmente si solo vemos que la aplicación responde?

**Respuesta esperada:** Sabemos que respondió esa comprobación; falta verificar el recorrido de negocio.

**Transición oral:** “Para usar las señales necesitamos saber qué pieza hace cada trabajo.”


## 59 · Mapa de herramientas: quién hace qué

**Idea para mostrar**

La aplicación produce información, un agente la recoge, un backend la guarda y una interfaz permite consultarla.

**Texto para decir**

> Vamos a separar las herramientas por responsabilidad. Grafana es donde consultamos y presentamos información. Loki es donde se reciben y consultan los logs. Promtail es el agente que recoge las fuentes de logs que le hayamos configurado y las envía a Loki.

> Ahora miremos dentro de la aplicación Java. Actuator es un módulo de Spring Boot que ofrece información operativa mediante URLs. Micrometer permite instrumentar mediciones y contexto. Estas dos piezas forman parte de nuestras aplicaciones, no son contenedores adicionales de Grafana.

> Prometheus cumple otra función: un servidor Prometheus consulta periódicamente métricas y conserva las series para analizarlas en el tiempo. Nuestra aplicación tiene una forma de exponer métricas compatible con Prometheus, pero el Compose actual no incluye ese servidor.

> Por eso debemos distinguir herramienta disponible e integración terminada. En el proyecto tenemos Grafana, Loki y Promtail en Compose, y Actuator y Micrometer declarados en los servicios. La recolección histórica con Prometheus y un backend para explorar spans siguen pendientes. Grafana necesita que conectemos sus fuentes antes de mostrar esos datos.

**Demostración o apoyo del expositor**

Mostrar el mapa de observabilidad.md. Señalar qué vive dentro de la aplicación y qué es un proceso separado. Mencionar Promtail como agente heredado del laboratorio; su migración a Alloy es una propuesta, no una configuración aplicada.

**Pregunta al público:** ¿Instalar Grafana hace que aparezcan todos los servicios y sus métricas?

**Respuesta esperada:** No. Hay que producir, recoger y conectar las fuentes que alimentarán las consultas.

**Transición oral:** “Empecemos por el camino que lleva los logs desde Java hasta Loki.”


## 60 · Promtail, system.log y los logs de Docker

**Idea para mostrar**

Un archivo system.log ya contiene logs. Promtail solo recoge las fuentes configuradas y accesibles.

**Texto para decir**

> Cuando decimos logs estamos hablando de registros de hechos. Pueden venir de una aplicación, de un contenedor o del sistema operativo. Un archivo llamado system.log es un archivo de logs del sistema. No es una cosa adicional y separada de los logs.

> Promtail puede recoger distintas fuentes si se configuran y tiene acceso. Leer un archivo, recibir mensajes mediante syslog y recoger salida de Docker son mecanismos diferentes. En ARKA-Lite está configurado el descubrimiento de contenedores Docker. No se montan archivos del sistema ni se configura un receptor syslog.

> Loki recibe registros mediante un agente o cliente configurado. Actuator y health no son requisitos para Loki. Esos dos nombres pertenecen a otra conversación: cómo preguntar por la salud de la aplicación.

> También hay una posible confusión con System.err. Esa instrucción Java escribe en la salida de error del proceso. Docker puede recoger esa salida, igual que recoge la salida estándar. System.err no significa escribir en un archivo system.log del equipo.

> Sigamos el recorrido: Java escribe una línea, Docker recoge la salida del contenedor, Promtail la envía a Loki y Grafana consulta Loki cuando su fuente está configurada. La configuración agrega etiquetas como servicio, proyecto y contenedor. Estas etiquetas ayudan a seleccionar qué logs queremos revisar.

**Demostración o apoyo del expositor**

Abrir observabilidad/promtail.yaml y señalar docker_sd_configs y relabel_configs. Abrir los volúmenes de Promtail en compose.yaml: hay Docker socket y configuración, sin un directorio de logs del host.

**Pregunta al público:** ¿Dar acceso al Docker socket equivale a montar todos los archivos del sistema?

**Respuesta esperada:** No. Son accesos diferentes; leer archivos exige que sean accesibles y que su lectura esté configurada.

**Transición oral:** “Ahora veremos cómo localizar esas líneas desde Grafana.”


## 61 · Loki y Grafana Explore: encontrar una entrega

**Idea para mostrar**

Conectar la fuente, seleccionar un intervalo y buscar primero el servicio y luego el identificador.

**Texto para decir**

> Grafana necesita saber dónde consultar. Para este camino agregamos una fuente de tipo Loki y la conectamos con el contenedor Loki. Como Grafana también está en Compose, usa la dirección interna http://loki:3100. Esa dirección se resuelve dentro de la red de contenedores.

> Después entramos en Explore y seleccionamos la fuente. Antes de buscar el caso debemos revisar el intervalo de tiempo: un evento de hace una hora no aparecerá si estamos consultando solo los últimos cinco minutos.

> La consulta empieza seleccionando el servicio. Luego filtramos por el texto del ID de solicitud o del evento. Si conocemos el eventoId podemos seguir los intentos del publicador y el consumo en notificaciones con el mismo identificador.

> Si no aparecen resultados todavía no sabemos que el evento nunca ocurrió. Puede faltar la ingestión, estar mal el intervalo o no coincidir la etiqueta. Primero comprobamos la fuente y los logs de origen. Grafana presenta lo que su fuente puede devolver; no crea la evidencia que la aplicación nunca registró.

**Demostración o apoyo del expositor**

Usar {service="servicio-solicitudes"} |= "INC-002" y luego el UUID real. Repetir con servicio-notificaciones. Si el entorno no está disponible, mostrar las consultas como ejemplo, sin simular resultados.

**Pregunta al público:** ¿Buscar un traceId en Loki es lo mismo que abrir una traza con todos sus spans?

**Respuesta esperada:** No. Aquí buscamos líneas de logs; explorar spans requiere la instrumentación y el backend de trazas correspondientes.

**Transición oral:** “Los logs muestran detalle; las métricas ayudan a ver cantidades y tendencias.”


## 62 · Actuator, health, Micrometer y las métricas

**Idea para mostrar**

Actuator está en la aplicación. health es una de sus URLs. Grafana necesita una fuente conectada para mostrar datos.

**Texto para decir**

> Actuator es parte de nuestra aplicación Spring Boot. Nos ofrece rutas para consultar información operativa. Una de ellas es /actuator/health. Podemos abrirla directamente en el navegador, sin pasar por Grafana.

> Una respuesta ilustrativa es status UP. Ese estado resume los indicadores que participan en esa consulta. No significa que todos los procesos de negocio hayan terminado ni que Grafana esté viendo todos los servicios. Una aplicación puede informar UP mientras tiene eventos pendientes de entregar.

> Para las mediciones interviene Micrometer. Pensemos en un contador de peticiones o en la duración de una operación. Micrometer registra mediciones y Actuator permite exponer información. /actuator/metrics sirve para descubrir y consultar métricas de diagnóstico. /actuator/prometheus ofrece el formato que un servidor Prometheus puede recoger.

> El recorrido habitual de métricas sería aplicación instrumentada, endpoint de exposición, servidor Prometheus que recoge y conserva series, y Grafana que consulta ese servidor. En nuestro Compose falta el servidor Prometheus. Exponer la URL no crea automáticamente un histórico.

> También distinguimos health de los chequeos de Docker y Kubernetes. En este repositorio el healthcheck de notificaciones en Compose prueba su puerto TCP. Las readiness de aplicaciones en Kubernetes consultan sus rutas de negocio. No están llamando a Actuator health, aunque todas sean comprobaciones técnicas.

**Demostración o apoyo del expositor**

Mostrar, sin ejecutarlos durante la redacción, Invoke-RestMethod http://localhost:8080/actuator/health y /actuator/metrics. Dibujar por separado consulta inmediata de salud y recolección histórica de métricas. No prometer campos concretos ni componentes que no se hayan observado.

**Pregunta al público:** ¿Puede un servicio estar UP y no tener un aviso que existía antes de reiniciar?

**Respuesta esperada:** Sí. El estado de salud no conserva el texto; la persistencia de ese aviso se comprueba por separado.

**Transición oral:** “Nos falta una tercera señal: la relación entre operaciones de una ejecución.”


## 63 · Trazas, spans y el límite del outbox

**Idea para mostrar**

Una traza describe ejecución; los IDs del negocio permiten seguir una solicitud y un evento entre ejecuciones.

**Texto para decir**

> Una traza ayuda a relacionar operaciones de una ejecución. Podemos imaginar un tramo para recibir HTTP y otros para llamadas instrumentadas. Cada tramo es un span y los identificadores permiten relacionarlos cuando el contexto se propaga correctamente.

> El contexto puede propagarse en headers HTTP tanto en GET como en POST. La línea de log no se envía dentro del header; cada servicio registra localmente con el contexto disponible. traceparent es un ejemplo de estándar; el header realmente usado depende de configuración y debe verificarse.

> En nuestro proyecto Micrometer Tracing usa el puente Brave y el cliente HTTP del publicador se crea con un builder administrado por Spring. Es una base para instrumentación; no demuestra por sí sola que tengamos todas las trazas almacenadas y listas para explorar.

> Hay además una separación temporal importante. La petición del usuario guarda un evento y termina. El relevador trabaja después. Nuestro outbox conserva eventoId, pero no guarda el contexto de traza original. Por eso no vamos a prometer una única traza que una automáticamente al usuario con cada reintento posterior.

> Para investigar este flujo, solicitudId identifica el trámite y eventoId identifica el hecho que se intenta entregar. Los logs pueden llevar también traceId y spanId cuando exista contexto. Son identidades que se complementan: no debemos sustituir el ID del evento por un traceId diferente en cada ejecución.

**Demostración o apoyo del expositor**

Señalar en el diagrama de secuencia el final de la petición y el inicio posterior del relevador. Marcar el backend de trazas como ausente, sin dibujar una exportación implementada.

**Pregunta al público:** ¿Por qué seguimos el mismo eventoId aunque cambie la ejecución que lo publica?

**Respuesta esperada:** Porque identifica el mismo hecho de negocio y debe mantenerse durante la reentrega.

**Transición oral:** “Con estas señales podemos reconstruir un problema completo.”


## 64 · Diagnóstico completo: enviada, pero sin aviso

**Idea para mostrar**

Investigar registro, entrega, consumo y disponibilidad como hechos separados.

**Texto para decir**

> Ahora volvamos al reclamo inicial. La solicitud aparece ENVIADA, pero no vemos el aviso. Primero consultamos la solicitud y su evento. Queremos saber qué UUID seguir y si el emisor todavía lo considera pendiente.

> Si está pendiente, buscamos ese UUID en los logs de solicitudes. Podemos encontrar intentos y errores. Después lo buscamos en notificaciones para comprobar si hubo consumo u omisión por un ID conocido. Cuando una respuesta se pierde, es posible que el receptor haya procesado y que el emisor vuelva a entregar el mismo evento.

> Si el receptor ya tiene el ID, consultamos el texto del aviso. En el diseño actual el ID está en PostgreSQL y el texto en memoria. Después de reiniciar podemos conservar el primero y perder el segundo. Repetir el ID no reconstruye ese texto porque el receptor lo reconoce como consumido.

> La conclusión debe apoyarse en varias evidencias del mismo caso. Salud para comprobar disponibilidad técnica, logs para investigar intentos, y datos para confirmar el estado. No declaramos que el proceso terminó solo porque un tablero aparece verde.

**Demostración o apoyo del expositor**

Consultar las tablas y endpoints del laboratorio de datos-y-consistencia.md. Preparar de antemano el UUID y un registro antes y después del reinicio. Presentar las hipótesis como hipótesis hasta verificarlas.

**Pregunta al público:** ¿Qué dato permite distinguir un receptor que nunca consumió de uno que perdió el texto tras reiniciar?

**Respuesta esperada:** El registro persistente del eventoId, contrastado con el texto consultable y el momento del reinicio.

**Transición oral:** “Esta investigación nos dice qué indicadores necesitamos para enterarnos antes que el usuario.”


## 65 · Dashboards, alertas e indicadores útiles

**Idea para mostrar**

Cada panel responde una pregunta. Cada alerta necesita condición, responsable y acción.

**Texto para decir**

> Un dashboard es útil cuando podemos explicar qué decisión tomaremos con cada panel. Ver volumen de peticiones ayuda a entender carga. Ver errores y duración ayuda a detectar degradación. Para nuestro caso también interesa saber si el trabajo pendiente se está acumulando.

> Podemos proponer una medición de pendientes y otra de fallos de publicación. Pero debemos decir qué existe y qué falta. Hoy no hay un gauge de negocio implementado para el backlog. Tampoco tenemos fecha de creación del evento para medir su antigüedad: primero habría que guardar ese dato.

> Una alerta necesita una condición y un responsable. No basta con recibir un correo que diga error. La persona debe saber cómo investigar el evento, qué dependencias revisar y cuándo escalar. También importa detectar que dejaron de llegar logs o métricas: la falta de señal puede ser un fallo de la observación.

> Finalmente, no vamos a convertir cada UUID en una etiqueta de métricas o de streams de logs. Crecería el número de combinaciones con cada evento. Conservamos esos identificadores en el contexto o contenido de los registros para buscar casos concretos. El objetivo de esta sección es poder explicar qué pasó y qué acción corresponde, con evidencia.

**Demostración o apoyo del expositor**

Mostrar una propuesta textual de paneles y acciones, sin valores simulados presentados como mediciones. Cerrar con las preguntas de comprobación del material compartido.

**Pregunta al público:** ¿Qué deberíamos hacer antes de alertar por eventos pendientes durante demasiado tiempo?

**Respuesta esperada:** Registrar cuándo se crean, instrumentar la medición y acordar el umbral y procedimiento de respuesta.

**Transición oral:** “Cierre: una solicitud se entiende mejor cuando conectamos su código, sus datos y su evidencia operativa.”


## Material para la demostración y respaldo

- [Conceptos, diagramas, comandos y fuentes oficiales](observabilidad.md).
- [Laboratorio de datos y consistencia](datos-y-consistencia.md#7-guion-del-laboratorio).
- [Guion maestro de las nueve secciones](guion-maestro.md).

## Preguntas de repaso

1. ¿Qué cambia entre un log de Java, un archivo system.log y una métrica?
2. ¿Qué lee Promtail realmente en este proyecto?
3. ¿Dónde está Actuator y qué consulta health?
4. ¿Qué componente conservaría el histórico de métricas y está pendiente?
5. ¿Por qué health UP no demuestra entrega de un aviso?
6. ¿Por qué no prometemos una traza continua a través del outbox actual?

Respuestas: registros y mediciones tienen propósitos distintos; Promtail usa descubrimiento Docker; Actuator vive en la aplicación y health consulta indicadores configurados; falta un servidor Prometheus; el resultado del negocio requiere sus datos; el contexto original no se persiste en outbox.

Para el feedback sobre contenido y campos del log: [explicación y formato propuesto](feedback-integrado.md#5-logs-útiles-y-propagación-entre-servicios).

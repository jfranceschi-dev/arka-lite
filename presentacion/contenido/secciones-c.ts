import type { Seccion } from "./tipos.ts";

// Secciones 8 y 9: datos, consistencia y evidencia.

export const datos: Seccion = {
  id: "s08",
  numero: 8,
  titulo: "Datos y consistencia",
  corto: "Datos",
  participante: "p5",
  claves: {
    problema: "Si se guarda ENVIADA y justo después falla el HTTP, podríamos perder la intención de avisar.",
    sencillo: "Guardamos el estado y el evento juntos, y el receptor ignora lo que ya recibió.",
    visual: "Outbox → relevador → publicador → receptor idempotente.",
    aplicacion: "Tabla evento, RelevadorDeEventosPendientes y ConsumoIdempotente con evento_procesado.",
    evidencia: "Consultar eventos consumidos y avisos después de enviar; los logs del publicador.",
  },
  diapositivas: [
    {
      id: "s08-almacenamiento",
      titulo: "Dónde vive cada dato",
      visible: ["Cada servicio es dueño de su base", "Avisos: en memoria", "Ids consumidos: en PostgreSQL", "Sin FK entre bases"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "almacenamiento",
      tabla: {
        encabezados: ["Identificador", "Qué identifica"],
        filas: [
          ["id de solicitud (INC-002)", "El trámite"],
          ["id numérico de evento", "Una fila local del outbox"],
          ["evento_id (UUID)", "El hecho que intentamos entregar"],
        ],
      },
      marcas: [{ texto: "Los textos de aviso se pierden al reiniciar notificaciones", certeza: "implementado" }],
      guion: {
        decir: [
          "Solicitudes es dueño del trámite y de su outbox. Notificaciones es dueño del consumo y de los avisos. No hay una clave foránea que conecte las dos bases: el vínculo es el contrato del evento.",
          "Hay tres identificadores que no hay que confundir: el id del trámite, el id numérico de una fila del outbox y el UUID del evento, que es el que permite reconocer una repetición.",
          "Y algo que sorprende: el texto del aviso vive en memoria y el id consumido vive en PostgreSQL. Si notificaciones reinicia, perdemos el texto y conservamos el id.",
        ],
        demo: { accion: "Probar › Consultar avisos y Consultar eventos consumidos.", evidencia: "Dos listas distintas: textos e ids.", laboratorio: "avisos" },
        transicion: "¿Por qué guardamos el evento en la misma base?",
        respaldo: "docs/presentation-data/datos-y-consistencia.md",
      },
    },
    {
      id: "s08-acid",
      titulo: "ACID y la transacción del envío",
      visible: ["Atomicidad: estado y evento juntos", "Consistencia: invariantes como el CHECK de estado", "Aislamiento y durabilidad dependen de la base", "Una transacción no revierte una lista Java"],
      recorridos: ["tecnico"],
      codigo: {
        lenguaje: "sql",
        archivo: "servicio-solicitudes/src/main/resources/schema.sql",
        texto: "CREATE TABLE IF NOT EXISTS evento (\n    id BIGSERIAL PRIMARY KEY,\n    solicitud_id VARCHAR(20) NOT NULL REFERENCES solicitud(id),\n    tipo VARCHAR(30) NOT NULL,\n    evento_id UUID NOT NULL DEFAULT gen_random_uuid(),\n    procesado BOOLEAN NOT NULL DEFAULT FALSE\n);",
      },
      guion: {
        decir: [
          "ACID describe atomicidad, consistencia, aislamiento y durabilidad. Para el envío nos importa sobre todo la atomicidad: el estado y el evento se confirman juntos o no se confirma ninguno.",
          "Ninguna de esas palabras convierte una lista Java en una escritura de PostgreSQL. Si notificaciones agrega el texto a su lista y luego falla el guardado del id, la lista no se revierte.",
        ],
        transicion: "Veamos el patrón que usa esa transacción.",
      },
    },
    {
      id: "s08-outbox",
      titulo: "Outbox Pattern: entregar después",
      visible: ["La intención de avisar queda guardada", "El relevador la publica en ciclos", "Puede haber reentrega", "Eventual no significa “en 5 segundos”"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "entrega",
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/adaptadores/salida/RelevadorDeEventosPendientes.java",
        texto: "@Scheduled(fixedDelay = 5000)\npublic void publicarPendientes() {\n    for (EventoEntity evento : eventos.findByProcesadoFalse()) {\n        try {\n            publicador.publicar(new SolicitudEnviada(\n                evento.getEventoId().toString(),\n                evento.getSolicitudId(), evento.getTipo()));\n            evento.setProcesado(true);\n            eventos.save(evento);\n        } catch (RuntimeException ex) { /* se reintenta */ }\n    }\n}",
      },
      marcas: [
        { texto: "No hay broker: HTTP directo", certeza: "implementado" },
        { texto: "El outbox no guarda el contexto de traza original", certeza: "implementado" },
      ],
      guion: {
        decir: [
          "¿Qué pasa si guardamos ENVIADA y justo después falla el HTTP? Si la intención de avisar existiera solo en memoria, la perderíamos. El outbox la guarda en la misma transacción que el estado.",
          "El relevador toma los pendientes cada cinco segundos y el publicador intenta hasta tres veces. Si obtiene éxito, marca procesado. Si el receptor consumió pero la respuesta se perdió, el evento puede llegar otra vez.",
          "Eventual significa que el hecho se propaga después, si el sistema se recupera. No fija un tiempo máximo y no garantiza nada frente a un fallo permanente.",
        ],
        pregunta: { texto: "¿Qué resuelve el outbox y qué exige idempotencia?", respuesta: "El outbox guarda la intención junto con el cambio local; la idempotencia controla el efecto de repetir la entrega." },
        transicion: "Entonces, ¿cómo evita notificaciones duplicar el aviso?",
        respaldo: "docs/presentation-data/guion-maestro.md › Outbox Pattern",
      },
    },
    {
      id: "s08-idempotencia",
      titulo: "Idempotencia y concurrencia",
      visible: ["El mismo hecho conserva el mismo eventoId", "El receptor ignora ids ya consumidos", "Dos consumos simultáneos pueden competir", "Exactamente una vez: no lo prometemos"],
      recorridos: ["ejecutivo", "tecnico"],
      codigo: {
        lenguaje: "java",
        archivo: "servicio-notificaciones/…/adaptadores/entrada/ConsumoIdempotente.java",
        texto: "@Transactional\npublic void alRecibir(SolicitudEnviada e) {\n    if (procesados.existsById(e.eventoId())) {\n        return; // ya procesado: idempotente\n    }\n    servicio.alRecibirSolicitudEnviada(e);   // texto en memoria\n    procesados.save(new EventoProcesadoEntity(e.eventoId()));\n}",
      },
      marcas: [{ texto: "Coordinar identidad y efecto durable bajo concurrencia", certeza: "propuesta" }],
      guion: {
        decir: [
          "La idempotencia busca que repetir la misma operación no multiplique su efecto. Para reconocer la repetición, el evento conserva el mismo UUID en cada reintento. Un UUID nuevo haría parecer nuevo el mismo hecho.",
          "El consumidor pregunta si conoce el id y omite los ya registrados. Pero hay carreras posibles: dos consumos pueden preguntar al mismo tiempo antes de escribir. La clave primaria evita dos filas, pero no deshace el texto que ya se agregó en memoria.",
          "Por eso no decimos “exactamente una vez”. La mejora propuesta es coordinar la identidad y el efecto durable, y probarlo bajo concurrencia.",
        ],
        demo: { accion: "Probar › Consultar eventos consumidos antes y después de enviar.", evidencia: "Aparece un id nuevo, pero la API no dice de qué solicitud es.", laboratorio: "procesados" },
        transicion: "Cambiar estas tablas también tiene sus reglas.",
      },
    },
    {
      id: "s08-migraciones",
      titulo: "Cambiar el esquema y recuperar",
      visible: ["Cambiar una base implica configuración, esquema, migración y pruebas", "Hoy: schema.sql idempotente y validate", "Volver a una imagen no restaura datos", "Un backup sirve si sabemos restaurarlo"],
      recorridos: ["ejecutivo", "tecnico"],
      marcas: [
        { texto: "schema.sql en cada arranque, sin Flyway ni Liquibase", certeza: "implementado" },
        { texto: "Migraciones versionadas", certeza: "propuesta" },
      ],
      guion: {
        decir: [
          "Cambiar una tabla exige pensar en los datos que ya existen y en versiones que convivirán durante la transición. Solicitudes ejecuta schema.sql en cada arranque y Hibernate solo valida: los cambios se escriben como SQL idempotente.",
          "Volver a una imagen anterior no restaura datos. Un backup es útil cuando sabemos restaurarlo y qué pérdida aceptamos. Y si restauramos emisor y receptor a momentos distintos, pueden reaparecer eventos: otra vez importa la idempotencia.",
        ],
        transicion: "Para comprobar todo esto necesitamos evidencia.",
      },
    },
  ],
};

export const observabilidad: Seccion = {
  id: "s09",
  numero: 9,
  titulo: "Observabilidad",
  corto: "Observabilidad",
  participante: "p5",
  claves: {
    problema: "Alguien reporta que envió INC-002 y no vio el aviso. ¿Dónde miramos?",
    sencillo: "Los logs cuentan qué pasó, las métricas cuánto y la salud si un servicio responde.",
    visual: "Dos recorridos separados: logs por Promtail y Loki; métricas por Actuator y Prometheus.",
    aplicacion: "Logs ECS, Promtail, Loki y Grafana en Compose; Actuator y Micrometer en cada servicio.",
    evidencia: "Una búsqueda en Grafana Explore por eventoId y GET /actuator/health.",
  },
  diapositivas: [
    {
      id: "s09-senales",
      titulo: "Logs, métricas, trazas y datos",
      visible: ["Log: un hecho con contexto", "Métrica: una medición en el tiempo", "Traza: el recorrido de una ejecución", "Datos de negocio: lo que quedó guardado"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Pieza", "Dónde vive", "Qué hace"],
        filas: [
          ["Actuator", "Dentro de cada app", "Expone health, info, metrics y prometheus"],
          ["Micrometer", "Dentro de cada app", "Registra mediciones y contexto de traza"],
          ["Promtail", "Contenedor aparte", "Recoge las fuentes configuradas: aquí, Docker"],
          ["Loki", "Contenedor aparte", "Guarda y consulta logs; no necesita Actuator"],
          ["Grafana", "Contenedor aparte", "Consulta fuentes conectadas; no las descubre solo"],
          ["Prometheus", "No está en Compose", "Recogería métricas: pendiente"],
        ],
      },
      guion: {
        decir: [
          "Separemos las señales. Un log registra un hecho con contexto. Una métrica es una medición en el tiempo. Una traza describe el recorrido de una ejecución. Y los datos de negocio son lo que quedó guardado.",
          "Algunas piezas viven dentro de la aplicación, como Actuator y Micrometer. Otras son contenedores aparte: Promtail, Loki y Grafana. Prometheus no está en nuestro Compose.",
        ],
        transicion: "Empecemos por el recorrido de los logs.",
        respaldo: "docs/presentation-data/guion-observabilidad.md",
      },
    },
    {
      id: "s09-logs",
      titulo: "Recorrido de los logs",
      visible: ["La app escribe; Promtail recoge; Loki guarda; Grafana muestra", "Promtail no lee todos los archivos del equipo", "System.err es otra salida del proceso, no un system.log", "La fuente Loki se conecta a mano en Grafana"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "logs",
      codigo: { lenguaje: "yaml", archivo: "observabilidad/promtail.yaml", texto: "clients:\n  - url: http://loki:3100/loki/api/v1/push\nscrape_configs:\n  - job_name: docker\n    docker_sd_configs:\n      - host: unix:///var/run/docker.sock" },
      guion: {
        decir: [
          "La aplicación escribe, Promtail recoge, Loki guarda y Grafana muestra. Promtail solo recoge las fuentes configuradas: aquí, la salida de los contenedores Docker. No lee automáticamente todos los archivos del equipo.",
          "system.log o syslog son registros del sistema y requieren configuración aparte para recogerse. System.err es la salida de error del proceso Java; Docker la junta con la salida estándar.",
          "Grafana no descubre servicios por su cuenta. En el Compose actual hay que agregar la fuente Loki a mano.",
        ],
        demo: { accion: "Grafana › Explore › Loki: {service=\"servicio-solicitudes\"} |= \"evento\".", evidencia: "Líneas “Intentando publicar evento” con el eventoId." },
        transicion: "Las métricas siguen otro camino.",
      },
    },
    {
      id: "s09-metricas",
      titulo: "Recorrido de las métricas",
      visible: ["Micrometer mide dentro de la app", "Actuator expone /actuator/prometheus", "Prometheus recogería: pendiente", "Grafana consultaría Prometheus: pendiente"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "metricas",
      marcas: [{ texto: "Servidor Prometheus y su fuente en Grafana", certeza: "propuesta" }],
      guion: {
        decir: [
          "Micrometer registra mediciones dentro de la aplicación. Actuator las expone en /actuator/prometheus. Un servidor Prometheus las recogería y guardaría, y Grafana las consultaría ahí.",
          "Hoy ese servidor no está en el Compose: el recorrido de métricas termina en Actuator. Lo marcamos como pendiente.",
        ],
        transicion: "¿Y health? Es otra cosa.",
      },
    },
    {
      id: "s09-health",
      titulo: "Health no es negocio terminado",
      visible: ["/actuator/health vive dentro de cada app", "Resume indicadores configurados, como la base", "UP no prueba que un evento llegó", "Se consulta sin Grafana"],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Health es un endpoint de Actuator dentro de cada aplicación. Lo podemos consultar sin Grafana, y la UI lo hace en la barra lateral.",
          "Informa la salud según los indicadores configurados, por ejemplo la conexión a la base. No demuestra que todos los eventos de negocio terminaron su recorrido.",
        ],
        demo: { accion: "Probar › Salud de ambos servicios.", evidencia: "status UP con el componente db.", laboratorio: "saludSolicitudes" },
        pregunta: { texto: "Si el sistema dice UP pero un UUID no termina su recorrido, ¿qué evidencia falta?", respuesta: "Estado del evento, intentos de publicación, registro de consumo y disponibilidad del texto." },
        transicion: "Veamos qué deberían contarnos los logs para investigar ese caso.",
      },
    },
    {
      id: "s09-campos",
      titulo: "Qué registran hoy los logs",
      visible: ["Qué pasó, en qué servicio y cuándo", "Destino y resultado, cuando aplica", "Identificadores de negocio y de traza", "Separar lo registrado de lo propuesto"],
      recorridos: ["tecnico"],
      tabla: {
        encabezados: ["Campo", "Hoy", "Dónde"],
        filas: [
          ["@timestamp, log.level, logger, hilo", "Registrado", "Formato ECS de Spring Boot"],
          ["service.name y versión", "Registrado", "spring.application.name; Promtail añade la etiqueta service"],
          ["eventoId e id de solicitud", "Dentro del texto del mensaje", "PublicadorConReintento, ConsumoIdempotente"],
          ["traceId y spanId", "No aparecen en la salida observada", "Hay dependencia Brave; falta llevarlos al log"],
          ["Destino (URL) e intento", "Propuesto como campo", "Hoy el intento va en el texto del warn"],
          ["Resultado y duración", "Propuesto", "No se registran como campos"],
        ],
      },
      guion: {
        decir: [
          "Un log útil responde qué pasó, en qué servicio y caso, cuándo, hacia qué destino, con qué resultado y con qué identificadores para correlacionar.",
          "Hoy tenemos momento, nivel, servicio, y los ids de evento y solicitud dentro del texto del mensaje. En las líneas que revisamos no aparecen traceId ni spanId, aunque el proyecto incluye la dependencia de trazas. Destino, resultado y duración como campos separados son una propuesta.",
          "Un detalle: en un camino de fallo el publicador también usa System.err, así que no todas las líneas son JSON ECS.",
        ],
        transicion: "Probar también es parte de tener evidencia.",
        respaldo: "docs/presentation-data/observabilidad.md",
      },
    },
  ],
};

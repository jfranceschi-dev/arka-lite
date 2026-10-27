import type { Seccion } from "./tipos.ts";

// Partes 3 y 4: diseñar para cambiar y guardar sin perder datos.

export const diseno: Seccion = {
  id: "s03",
  numero: 3,
  titulo: "Diseñar para cambiar",
  corto: "Diseño",
  participante: "p3",
  subtitulo: "Cómo organizamos el código para cambiar una tecnología sin tocar el negocio.",
  temas: ["Puertos y adaptadores", "Estructura base de ARKA-Lite", "De monolito a microservicios"],
  claves: {
    problema: "Si las reglas dependen de HTTP o de la base, cambiar una tecnología obliga a tocar el negocio.",
    sencillo: "El negocio va en el centro y la tecnología en los bordes. Lo que cambia por motivos distintos va en servicios distintos.",
    visual: "Entrada → dominio → salida; un monolito que se separa en dos servicios.",
    aplicacion: "Paquetes dominio/ y adaptadores/ en cada servicio; adaptadores activos marcados con @Primary.",
    evidencia: "Las pruebas usan un repositorio en memoria con el mismo puerto, sin PostgreSQL.",
  },
  diapositivas: [
    {
      id: "s03-componentes",
      titulo: "Por dentro de servicio-solicitudes",
      visible: ["Entrada: traduce HTTP", "Dominio: las reglas, sin Spring", "Puertos: lo que el negocio necesita", "Salida: PostgreSQL y HTTP"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "componentes",
      guion: {
        decir: [
          "En el taller de estructura base organizamos cada servicio en tres zonas. A la izquierda, la entrada: los controladores que reciben las peticiones HTTP. En el centro, el dominio: las reglas del negocio. A la derecha, la salida: lo que habla con el exterior, como la base de datos o el otro servicio.",
          "El dominio no llama directamente a la base. Pide lo que necesita a través de puertos, que son interfaces: un contrato que dice, por ejemplo, necesito guardar y buscar solicitudes, sin decir cómo.",
          "Los adaptadores de salida cumplen ese contrato. Uno guarda en PostgreSQL; otro anota el evento pendiente; otro lo entrega a notificaciones. A esto se le llama arquitectura de puertos y adaptadores, o arquitectura hexagonal.",
        ],
        transicion: "¿Qué ganamos con esa separación?",
        respaldo: "docs/arquitectura/flujo-y-referencias.md",
      },
    },
    {
      id: "s03-capas",
      titulo: "Una consulta, capa por capa",
      visible: ["El controlador recibe el id", "El servicio pide la solicitud por el puerto", "El adaptador JPA consulta PostgreSQL", "La fila vuelve convertida en objeto del dominio"],
      recorridos: ["tecnico"],
      diagrama: "consulta",
      guion: {
        decir: [
          "Sigamos una consulta para el equipo técnico. El controlador recibe el id en la ruta y llama al servicio. El servicio pide la solicitud a través del puerto RepositorioDeSolicitudes.",
          "Quien responde es RepositorioJpa, que usa Spring Data para hacer la consulta y convierte la fila de la base en un objeto del dominio. El servicio nunca ve una tabla ni una consulta SQL.",
        ],
        transicion: "Ahora, la ventaja práctica de trabajar con puertos.",
      },
    },
    {
      id: "s03-adaptadores",
      titulo: "Cambiar la pieza sin tocar el negocio",
      idea: "El negocio conoce el contrato, no la tecnología.",
      visible: ["Hay varios adaptadores para el mismo puerto", "Spring usa el que tiene @Primary", "Hoy: PostgreSQL y publicador con reintentos", "En las pruebas: un repositorio en memoria"],
      comparacion: "Como un enchufe: el aparato no sabe de qué planta viene la electricidad, solo que el enchufe cumple la norma.",
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "dependencias",
      guion: {
        decir: [
          "Piensen en un enchufe. Un aparato no sabe si la electricidad viene de una hidroeléctrica o de paneles solares. Solo sabe que el enchufe cumple la norma. Los puertos son ese enchufe.",
          "Por eso podemos tener varios adaptadores para el mismo puerto. Hoy, Spring usa el que marcamos con @Primary: el que guarda en PostgreSQL y el que publica con reintentos. En las pruebas usamos uno que guarda en memoria, y el negocio ni se entera del cambio.",
          "Dejamos las versiones alternativas en el código a propósito, como material de aprendizaje: muestran que cambiar la pieza no obliga a tocar las reglas.",
        ],
        pregunta: { texto: "¿La interfaz guarda algo por sí misma?", respuesta: "No. Solo declara el contrato; el adaptador es el que hace el trabajo." },
        transicion: "Esa misma idea, llevada más lejos, separa aplicaciones completas.",
      },
    },
    {
      id: "s03-monolito",
      titulo: "De monolito a microservicios",
      visible: ["Separamos por responsabilidad", "El trámite y los avisos cambian por motivos distintos", "Cada servicio es dueño de su base", "Se hablan con un contrato: el evento"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "monolito",
      codigo: { lenguaje: "java", archivo: "servicio-*/…/eventos/SolicitudEnviada.java", texto: "// Copiado en ambos servicios: es el contrato HTTP\npublic record SolicitudEnviada(String eventoId, String id, String tipo) {}" },
      guion: {
        decir: [
          "En el taller de descomposición del monolito aprendimos que la pregunta clave no es técnica. Es: ¿qué partes del negocio cambian juntas?",
          "Un monolito es una sola aplicación que lo hace todo y comparte una base. En ARKA-Lite, el trámite y los avisos cambian por motivos distintos, así que los separamos en dos servicios, cada uno con su propia base.",
          "¿Cómo se hablan, entonces? Con un contrato: un mensaje llamado SolicitudEnviada, que dice qué solicitud se envió. Ese contrato está copiado en los dos proyectos, y si cambia de un lado, hay que cambiarlo del otro.",
        ],
        transicion: "¿Siempre conviene separar?",
      },
    },
    {
      id: "s03-decision",
      titulo: "Cuándo conviene separar",
      visible: ["Separar agrega red, bases propias y fallos parciales", "Se decide por negocio, equipos y operación", "En ARKA-Lite separamos para aprender esas fronteras"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Criterio", "Favorece un monolito", "Favorece microservicios"],
        filas: [
          ["Negocio", "Las partes cambian juntas", "Responsabilidades claramente distintas"],
          ["Despliegue", "Se publica todo junto", "Una parte necesita salir sola"],
          ["Carga", "Pareja", "Una parte necesita más recursos"],
          ["Equipos", "Un equipo pequeño", "Un equipo dueño de cada parte"],
        ],
      },
      guion: {
        decir: [
          "Separar no es gratis. Ahora hay red entre los servicios, cada uno tiene su base, y puede pasar que uno esté arriba y el otro caído. A eso se le llama fallo parcial.",
          "Por eso la decisión se toma con criterios como los de esta tabla: si las partes cambian juntas, si necesitan desplegarse por separado, si un equipo distinto es dueño de cada una.",
          "En ARKA-Lite separamos para aprender esas fronteras. Y justamente el fallo parcial es el problema que resolvemos en la siguiente parte.",
        ],
        pregunta: { texto: "Si un solo equipo mantiene todo y lo publica junto, ¿qué ganamos separando?", respuesta: "Poco: agregamos red y fallos parciales sin un beneficio claro." },
        transicion: "Si un servicio puede fallar mientras el otro funciona, ¿cómo evitamos perder datos?",
      },
    },
  ],
};

export const datos: Seccion = {
  id: "s04",
  numero: 4,
  titulo: "Guardar sin perder datos",
  corto: "Datos",
  participante: "p4",
  subtitulo: "Qué hicimos para que un aviso nunca se pierda ni se duplique.",
  temas: ["Modelado y consultas", "Adaptador con base de datos real", "El problema de la consistencia"],
  claves: {
    problema: "Si guardamos la solicitud y justo después falla el aviso, podríamos perder la intención de avisar.",
    sencillo: "Primero se guarda, después se avisa; y el que recibe ignora lo que ya recibió.",
    visual: "Transacción local → evento pendiente → relevador → receptor idempotente.",
    aplicacion: "Adaptador JPA, tabla evento, RelevadorDeEventosPendientes, PublicadorConReintento y ConsumoIdempotente.",
    evidencia: "En la UI, pestaña Enviadas: eventos entregados y consumidos, y 0 avisos duplicados al reentregar.",
  },
  diapositivas: [
    {
      id: "s04-jpa",
      titulo: "Un adaptador conectado a una base real",
      idea: "JPA traduce entre objetos y tablas.",
      visible: ["Cada servicio tiene su base PostgreSQL", "schema.sql crea las tablas al arrancar", "Hibernate revisa que las entidades coincidan", "La entidad JPA no es el objeto del dominio"],
      recorridos: ["ejecutivo", "tecnico"],
      codigo: {
        lenguaje: "properties",
        archivo: "servicio-solicitudes/src/main/resources/application.properties",
        texto: "spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/db-solicitudes}\nspring.sql.init.mode=always\nspring.jpa.hibernate.ddl-auto=validate",
      },
      guion: {
        decir: [
          "En el taller de modelado y consultas conectamos el adaptador a una base de datos real: PostgreSQL. Para no escribir SQL a mano en cada operación, usamos JPA, que traduce entre nuestros objetos y las tablas.",
          "Al arrancar, el servicio ejecuta un archivo llamado schema.sql que crea las tablas si no existen. Después, Hibernate revisa que las clases coincidan con las tablas. Si no coinciden, el servicio no arranca, y eso es bueno: preferimos un error al inicio que datos mal guardados.",
          "Un detalle de diseño: la clase que JPA guarda no es la misma que usa el negocio. El adaptador traduce entre las dos, y así el negocio sigue sin saber nada de la base.",
        ],
        transicion: "Ahora veamos el problema más interesante del proyecto.",
        respaldo: "docs/arquitectura/datos-y-consistencia.md",
      },
    },
    {
      id: "s04-almacenamiento",
      titulo: "Dónde vive cada dato",
      visible: ["Solicitudes guarda el trámite y sus eventos", "Notificaciones guarda qué eventos ya recibió", "El texto del aviso vive en memoria", "No hay relación directa entre las dos bases"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "almacenamiento",
      guion: {
        decir: [
          "Antes del problema, ubiquemos los datos. Solicitudes guarda el trámite y una lista de eventos pendientes. Notificaciones guarda la lista de eventos que ya recibió.",
          "Las dos bases no están conectadas entre sí. Lo único que las une es el contrato del evento.",
          "Y una aclaración honesta: el texto del aviso vive en memoria. Si notificaciones se reinicia, perdemos ese texto, pero conservamos el registro de qué eventos ya recibimos. Lo mencionamos al final como mejora pendiente.",
        ],
        transicion: "Con esto claro, veamos el problema de la consistencia.",
      },
    },
    {
      id: "s04-envio",
      titulo: "El problema de la consistencia",
      idea: "Primero se guarda. Después se avisa.",
      visible: ["Se guardan juntos la solicitud ENVIADA y un evento pendiente", "Si una de las dos falla, no se guarda ninguna", "La respuesta llega enseguida", "El aviso se entrega después"],
      porque: "Si notificaciones está caído, ningún aviso se pierde: queda pendiente.",
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "envio",
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/dominio/ServicioDeSolicitudes.java",
        texto: "@Transactional\npublic Solicitud enviar(String id) {\n    Solicitud enviada = buscar(id).enviar();\n    repositorio.guardar(enviada);\n    registrador.registrar(UUID.randomUUID().toString(),\n            enviada.id(), \"SolicitudEnviada\");\n    return enviada;\n}",
      },
      guion: {
        decir: [
          "Imagínense que envían una solicitud justo cuando el servicio de avisos está caído. Si en ese momento intentáramos avisar directamente, la solicitud quedaría enviada, pero nadie se enteraría. Ese es el problema de la consistencia.",
          "Lo que hicimos fue separar el envío en dos momentos. En el primero, guardamos la solicitud como enviada y, en la misma operación, dejamos anotado que hay un aviso pendiente. Es todo o nada: si una de las dos cosas falla, no se guarda ninguna.",
          "La respuesta le llega a la persona enseguida. El aviso se entrega en un segundo momento, que vemos en la siguiente lámina.",
        ],
        pregunta: { texto: "¿Que el envío responda bien significa que el aviso ya existe?", respuesta: "No. Significa que la solicitud y el evento quedaron guardados; el aviso llega después." },
        transicion: "¿Quién entrega ese aviso pendiente?",
        respaldo: "docs/arquitectura/flujo-y-referencias.md",
      },
    },
    {
      id: "s04-outbox",
      titulo: "La bandeja de salida",
      idea: "Un mensajero pasa cada 5 segundos.",
      visible: ["El evento espera en la tabla de pendientes", "El relevador revisa cada 5 segundos", "Lo entrega con hasta 3 intentos", "Si falla, vuelve a intentar en el siguiente ciclo"],
      comparacion: "Como dejar una carta en la bandeja de salida: aunque el mensajero no pase hoy, la carta no se pierde.",
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "entrega",
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/adaptadores/salida/RelevadorDeEventosPendientes.java",
        texto: "@Scheduled(fixedDelay = 5000)\npublic void publicarPendientes() {\n    for (EventoEntity evento : eventos.findByProcesadoFalse()) {\n        try {\n            publicador.publicar(new SolicitudEnviada(\n                evento.getEventoId().toString(),\n                evento.getSolicitudId(), evento.getTipo()));\n            evento.setProcesado(true);\n            eventos.save(evento);\n        } catch (RuntimeException ex) { /* se reintenta */ }\n    }\n}",
      },
      guion: {
        decir: [
          "Esto se llama patrón outbox, que en español sería bandeja de salida. Es como dejar una carta en la bandeja: aunque el mensajero no pase hoy, la carta no se pierde.",
          "Nuestro mensajero se llama relevador. Cada cinco segundos revisa la tabla de eventos pendientes y los entrega a notificaciones. Si no logra entregarlos, lo intenta hasta tres veces, y si aun así falla, el evento sigue pendiente para el siguiente ciclo.",
          "Un detalle importante: cada reintento lleva exactamente el mismo número de evento. Eso es lo que nos permite resolver el siguiente problema.",
        ],
        transicion: "Si se reintenta, ¿no puede llegar el aviso dos veces?",
      },
    },
    {
      id: "s04-idempotencia",
      titulo: "El mismo evento, un solo aviso",
      idea: "Repetir no multiplica el efecto.",
      visible: ["Cada evento tiene un número que no cambia", "Notificaciones anota los números que ya recibió", "Si llega uno repetido, lo ignora", "Lo comprobamos con el botón Reentregar"],
      comparacion: "Como un portero con lista de invitados: si alguien ya entró, no lo vuelve a anotar.",
      porque: "Los reintentos nos protegen de perder avisos; la idempotencia, de duplicarlos.",
      recorridos: ["ejecutivo", "tecnico"],
      codigo: {
        lenguaje: "java",
        archivo: "servicio-notificaciones/…/adaptadores/entrada/ConsumoIdempotente.java",
        texto: "@Transactional\npublic void alRecibir(SolicitudEnviada e) {\n    if (procesados.existsById(e.eventoId())) {\n        return; // ya procesado: idempotente\n    }\n    servicio.alRecibirSolicitudEnviada(e);\n    procesados.save(new EventoProcesadoEntity(e.eventoId()));\n}",
      },
      guion: {
        decir: [
          "Sí, puede llegar dos veces. Por ejemplo, si notificaciones recibió el evento pero su respuesta se perdió en el camino, el relevador piensa que falló y lo vuelve a mandar.",
          "Para eso está la idempotencia, una palabra difícil para una idea sencilla: repetir la misma operación no multiplica su efecto. Notificaciones funciona como un portero con lista de invitados: anota el número de cada evento que recibe, y si llega uno que ya está en la lista, lo ignora.",
          "En la demostración lo vamos a comprobar: vamos a reentregar a propósito un evento que ya llegó, y vamos a ver que no aparece un aviso nuevo.",
        ],
        demo: { accion: "En la UI, pestaña Enviadas: Reentregar un evento ya consumido.", evidencia: "El diálogo “El aviso no se duplicó” y Avisos duplicados en 0." },
        pregunta: { texto: "¿Qué resuelve el outbox y qué resuelve la idempotencia?", respuesta: "El outbox evita perder el evento; la idempotencia evita duplicar su efecto." },
        transicion: "Los datos están cuidados. Ahora, ¿cómo llevamos todo esto a cualquier computadora?",
      },
    },
  ],
};

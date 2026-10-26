import type { Seccion } from "./tipos.ts";

// Apertura y secciones 1 a 3. Narrativa tomada de
// docs/presentation-data/guion-maestro.md y contrastada con el código.

export const apertura: Seccion = {
  id: "s00",
  numero: null,
  titulo: "Apertura",
  corto: "Apertura",
  participante: "p1",
  diapositivas: [
    {
      id: "s00-portada",
      titulo: "ARKA-Lite: una solicitud de punta a punta",
      visible: ["Cómo viaja, se guarda y se comprueba una solicitud", "Dos servicios Spring Boot · dos PostgreSQL · una UI de laboratorio"],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Buenos días. Hoy vamos a seguir una sola solicitud durante todo su recorrido: desde que alguien la crea hasta que otro servicio deja un aviso.",
          "No vamos a memorizar herramientas. Queremos poder señalar qué componente hace cada cosa y qué evidencia demuestra que una operación terminó.",
        ],
        instrucciones: ["Tener abierta la vista Probar en otra pestaña y comprobar la salud de ambos servicios antes de empezar."],
        transicion: "Empecemos por el caso que conecta todo.",
        respaldo: "docs/presentation-data/guion-maestro.md › Apertura",
      },
    },
    {
      id: "s00-caso",
      titulo: "El caso conductor: INC-002",
      visible: ["Crear → enviar → registrar evento → entregar → consumir → consultar aviso", "Tres hechos distintos: quedó enviada, llegó el evento, existe el aviso", "No ocurren al mismo instante ni se guardan igual"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Paso", "Quién lo hace", "Cómo lo comprobamos"],
        filas: [
          ["Crear", "servicio-solicitudes", "POST /solicitudes/crear responde BORRADOR"],
          ["Enviar", "servicio-solicitudes", "POST /solicitudes/INC-002/enviar responde ENVIADA"],
          ["Registrar evento", "misma transacción", "Tabla evento; no hay API para verla"],
          ["Entregar", "relevador y publicador", "Logs del publicador"],
          ["Consumir", "servicio-notificaciones", "GET /eventos/procesados"],
          ["Consultar aviso", "servicio-notificaciones", "GET /notificaciones"],
        ],
      },
      marcas: [{ texto: "Crear siempre usa el id fijo INC-002", certeza: "implementado" }],
      guion: {
        decir: [
          "La solicitud de ejemplo es INC-002. Se crea en borrador y se envía. Ese envío guarda un evento que otro componente entregará después al servicio de notificaciones.",
          "Desde ahora vamos a separar tres hechos: el trámite quedó enviado, el evento llegó al receptor y el texto del aviso está disponible. No ocurren al mismo tiempo, y no se guardan de la misma forma.",
          "Un detalle importante: la API de creación siempre usa el id INC-002. No permite crear un id cualquiera.",
        ],
        pregunta: {
          texto: "¿Una respuesta exitosa al enviar demuestra que el aviso ya existe?",
          respuesta: "No. Confirma el envío local; la entrega y el aviso se comprueban aparte.",
        },
        transicion: "Veamos el mapa de lo que vamos a recorrer.",
        respaldo: "docs/inicio/proyecto.md › API actual",
      },
    },
    {
      id: "s00-agenda",
      titulo: "Agenda",
      visible: [
        "1 Java · 2 Hexagonal · 3 Servicios",
        "4 Docker · 5 Kubernetes · 6 CI/CD · 7 Git y GitHub",
        "8 Datos y consistencia · 9 Observabilidad",
        "10 Pruebas y calidad · 11 Seguridad básica",
      ],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Bloque", "Secciones", "Propósito"],
        filas: [
          ["A", "1 a 3", "Entender código, responsabilidades y recorrido"],
          ["B", "4 a 7", "Ejecutar, operar y entregar cambios"],
          ["C", "8 a 11", "Fallos, evidencia, calidad y seguridad"],
        ],
      },
      guion: {
        decir: [
          "El recorrido tiene tres bloques. Primero entendemos el código y cómo se reparten las responsabilidades. Después vemos cómo se ejecuta y se entrega una versión. Al final revisamos qué pasa cuando algo falla, cómo lo comprobamos, cómo probamos y qué riesgos de seguridad tenemos.",
          "En cada tema vamos a distinguir tres cosas: lo implementado, lo que es un ejemplo para explicar y lo que es una propuesta.",
        ],
        instrucciones: ["Señalar en pantalla las marcas Implementado, Ejemplo y Propuesta."],
        transicion: "Empezamos por el lenguaje en el que están escritas las reglas.",
      },
    },
  ],
};

export const java: Seccion = {
  id: "s01",
  numero: 1,
  titulo: "Fundamentos de programación con Java",
  corto: "Java",
  participante: "p1",
  claves: {
    problema: "Necesitamos expresar datos y reglas del trámite de forma que una máquina las ejecute y una persona las entienda.",
    sencillo: "Escribimos código, el compilador lo revisa y la JVM lo ejecuta. Maven organiza la construcción.",
    visual: "Archivo .java → compilador → bytecode → JVM.",
    aplicacion: "El record Solicitud y sus transiciones enviar, aprobar y rechazar.",
    evidencia: "mvn verify dentro de cada servicio y la prueba SolicitudTest.",
  },
  diapositivas: [
    {
      id: "s01-compilar",
      titulo: "Código, compilación y ejecución",
      visible: ["JDK compila · JVM ejecuta", "Maven: dependencias, pruebas y empaquetado", "Spring Boot arma la aplicación", "Cada servicio tiene su propio pom.xml"],
      recorridos: ["ejecutivo", "tecnico"],
      codigo: { lenguaje: "bash", archivo: "servicio-solicitudes/", texto: "cd servicio-solicitudes\n./mvnw clean verify      # compila, prueba y empaqueta\n./mvnw test -Dtest=SolicitudTest" },
      marcas: [{ texto: "No hay pom.xml en la raíz", certeza: "implementado" }],
      guion: {
        decir: [
          "Java nos permite expresar datos y operaciones. El JDK incluye el compilador, que revisa el programa y genera bytecode. La JVM ejecuta ese bytecode. Maven organiza dependencias, compilación, pruebas y empaquetado. Spring Boot configura los componentes y el servidor web.",
          "En ARKA-Lite cada servicio se construye por separado y tiene su propio pom.xml. No hay un proyecto único en la raíz.",
        ],
        demo: { accion: "Mostrar los dos pom.xml y el comando verify de un servicio.", evidencia: "BUILD SUCCESS y el resumen de pruebas de Maven." },
        transicion: "Ahora veamos cómo nombramos y guardamos los datos.",
        respaldo: "docs/inicio/instalacion-y-debug.md",
      },
    },
    {
      id: "s01-record",
      titulo: "La solicitud es un record con reglas",
      visible: ["Tipos con nombre: String id, Estado estado", "Un record agrupa datos inmutables", "enviar() solo acepta BORRADOR", "El objeto no sabe de HTTP ni de PostgreSQL"],
      recorridos: ["ejecutivo", "tecnico"],
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/dominio/Solicitud.java",
        texto: "public record Solicitud(String id, String tipo, Estado estado) {\n\n    public Solicitud enviar() {\n        if (estado != Estado.BORRADOR) {\n            throw new IllegalStateException(\n                \"solo se puede enviar una solicitud en BORRADOR\");\n        }\n        return new Solicitud(id, tipo, Estado.ENVIADA);\n    }\n}",
      },
      guion: {
        decir: [
          "Una variable combina un tipo con un nombre. String id guarda texto que identifica el trámite. Estado limita los cuatro estados posibles: borrador, enviada, aprobada y rechazada.",
          "Solicitud es un record: agrupa datos que no cambian. Cuando enviamos, no modificamos el objeto; obtenemos una solicitud nueva en estado ENVIADA. Y la regla está ahí mismo: solo se envía desde borrador.",
          "Fíjense en lo que no hace: no sabe guardar en PostgreSQL ni responder JSON. Solo expresa el negocio.",
        ],
        pregunta: { texto: "¿Qué pasa si intentamos enviar una solicitud ya enviada?", respuesta: "El record lanza IllegalStateException. Hoy la API lo devuelve como un 500 genérico." },
        transicion: "Con datos y reglas claros, veamos qué prácticas nos ayudan a mantenerlos.",
        respaldo: "docs/presentation-data/equipo-desarrollo.md",
      },
    },
    {
      id: "s01-solid",
      titulo: "Buenas prácticas y SOLID",
      visible: ["Una responsabilidad, un motivo de cambio", "Dependencias explícitas por constructor", "Sustituir sin cambiar lo prometido", "No una interfaz por cada clase"],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Una responsabilidad clara hace que cada cambio tenga un lugar reconocible. El controlador traduce HTTP; la regla de envío vive en el modelo.",
          "SOLID da criterios: responsabilidad única, extender sin romper, sustituir conservando el comportamiento, contratos enfocados e inversión de dependencias. No significa crear una interfaz para cada clase.",
        ],
        pregunta: { texto: "Si un repositorio en memoria responde que un id no existe, ¿puede su reemplazo inventar una solicitud?", respuesta: "No. Cambiaría el comportamiento que promete el contrato." },
        transicion: "Ahora vamos a organizar esas reglas dentro de una arquitectura.",
      },
    },
  ],
};

export const hexagonal: Seccion = {
  id: "s02",
  numero: 2,
  titulo: "Arquitectura hexagonal",
  corto: "Hexagonal",
  participante: "p1",
  claves: {
    problema: "Si las reglas dependen de HTTP o de la base, cambiar una tecnología obliga a tocar el negocio.",
    sencillo: "El centro tiene las reglas. Los bordes traducen: HTTP de entrada, base de datos de salida.",
    visual: "Controlador → caso de uso → contrato ← adaptador.",
    aplicacion: "ServicioDeSolicitudes usa RepositorioDeSolicitudes; RepositorioJpa lo implementa.",
    evidencia: "Las pruebas del servicio corren con RepositorioEnMemoria, sin PostgreSQL.",
  },
  diapositivas: [
    {
      id: "s02-consulta",
      titulo: "Una consulta, capa por capa",
      visible: ["El controlador traduce HTTP", "El caso de uso coordina", "El contrato declara lo que necesita", "El adaptador consulta PostgreSQL"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "consulta",
      guion: {
        decir: [
          "Sigamos una consulta. El controlador recibe el id por HTTP y llama al caso de uso. El caso de uso pide la solicitud a través de un contrato. El adaptador JPA hace la consulta y convierte la fila en un objeto del dominio.",
          "Un puerto es un contrato, no un proceso que reenvía datos. Y en este código no hay un puerto de entrada separado: el controlador llama directamente a ServicioDeSolicitudes.",
        ],
        demo: { accion: "Probar › Consultar INC-002.", evidencia: "Status 200 con id, tipo y estado.", laboratorio: "consultar" },
        transicion: "¿Y qué viaja exactamente por HTTP?",
        respaldo: "docs/presentation-data/flujo-y-referencias.md",
      },
    },
    {
      id: "s02-http",
      titulo: "Petición, JSON y respuesta",
      visible: ["HTTP: método, ruta, headers, status y cuerpo", "JSON es solo el cuerpo", "No todas las respuestas son 200", "Crear y consultar son operaciones distintas"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Status", "Cuándo ocurre hoy", "Estado"],
        filas: [
          ["200", "La operación terminó", "Implementado"],
          ["404", "La solicitud no existe (ManejadorGlobalDeErrores)", "Implementado"],
          ["500", "Transición inválida: IllegalStateException sin manejador", "Comportamiento actual"],
          ["201 / 409", "Crear con Location / conflicto de estado", "Propuesta"],
        ],
      },
      guion: {
        decir: [
          "Una petición HTTP tiene método y ruta, puede llevar headers y un cuerpo. Para consultar INC-002 no enviamos JSON: el id va en la ruta. JSON aparece en la respuesta.",
          "No todas las respuestas son 200. Si la solicitud no existe, el manejador responde 404. Si intentamos una transición inválida, hoy obtenemos un 500 genérico. Un 409 sería más claro, pero es una propuesta: no está implementado.",
          "Crear y consultar también son distintos. Crear usa el id fijo INC-002 y lo deja en borrador; consultar solo lee.",
        ],
        transicion: "Volvamos al contrato: ¿quién depende de quién?",
        respaldo: "docs/presentation-data/feedback-integrado.md",
      },
    },
    {
      id: "s02-dependencias",
      titulo: "Dependencias no son llamadas",
      visible: ["El caso de uso conoce la interfaz", "El adaptador la implementa", "Spring conecta la implementación @Primary", "RepositorioQueRegistra guarda en memoria"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "dependencias",
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/dominio/RepositorioDeSolicitudes.java",
        texto: "public interface RepositorioDeSolicitudes {\n    void guardar(Solicitud s);\n    Optional<Solicitud> buscar(String id);\n    List<Solicitud> todas();\n}",
      },
      marcas: [
        { texto: "RepositorioJpa es el adaptador activo (@Primary)", certeza: "implementado" },
        { texto: "RepositorioQueRegistra usa LinkedHashMap en memoria", certeza: "implementado" },
      ],
      guion: {
        decir: [
          "Cuando hablamos de inversión de dependencias hablamos de qué código conoce a qué código. El caso de uso conoce la interfaz. El adaptador también la conoce y la implementa.",
          "En ejecución la llamada sí llega al adaptador. Spring elige cuál: hay tres implementaciones y RepositorioJpa tiene @Primary. RepositorioQueRegistra, aunque su nombre suene a registro, guarda en un LinkedHashMap en memoria.",
          "El contrato declara lo que el caso de uso necesita: guardar, buscar y listar. No declara todas las operaciones SQL posibles.",
        ],
        pregunta: { texto: "¿La interfaz guarda una fila por sí misma?", respuesta: "No. Define el contrato; el adaptador ejecuta la operación." },
        transicion: "La organización interna está clara. Ahora crucemos la frontera entre dos procesos.",
      },
    },
  ],
};

export const servicios: Seccion = {
  id: "s03",
  numero: 3,
  titulo: "Arquitectura y comunicación entre servicios",
  corto: "Servicios",
  participante: "p2",
  claves: {
    problema: "Avisar es una responsabilidad distinta del trámite y puede fallar por separado.",
    sencillo: "Dos aplicaciones hablan por HTTP. Lo que comparten es un contrato JSON, no objetos.",
    visual: "UI → solicitudes → (después) → notificaciones.",
    aplicacion: "SolicitudEnviada(eventoId, id, tipo) existe copiado en ambos servicios.",
    evidencia: "Probar: enviar, luego consultar avisos y eventos consumidos por separado.",
  },
  diapositivas: [
    {
      id: "s03-contrato",
      titulo: "Servicios y contratos",
      visible: ["Un microservicio es un proceso con su contrato", "Comparten JSON, no instancias Java", "Cambiar el contrato afecta a ambos lados"],
      recorridos: ["ejecutivo", "tecnico"],
      codigo: { lenguaje: "java", archivo: "servicio-*/…/eventos/SolicitudEnviada.java", texto: "// Copiado en ambos servicios: es el contrato HTTP\npublic record SolicitudEnviada(String eventoId, String id, String tipo) {}" },
      guion: {
        decir: [
          "Una clase de servicio organiza operaciones dentro de una aplicación. Un microservicio es una aplicación ejecutable con su propio proceso y su contrato.",
          "Solicitudes y notificaciones se hablan por HTTP. Cada una tiene sus objetos Java; lo que viaja es una estructura JSON. Por eso el record SolicitudEnviada está copiado en los dos servicios: si cambia de un lado, hay que cambiar el otro.",
        ],
        transicion: "Antes de seguir: ¿siempre conviene separar en servicios?",
      },
    },
    {
      id: "s03-decision",
      titulo: "¿Monolito modular o servicios separados?",
      visible: ["Separar agrega red, datos propios y fallos parciales", "Decidir por negocio, equipos y operación", "Microservicios y Kubernetes no son requisitos universales"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Criterio", "Favorece monolito modular", "Favorece servicios separados"],
        filas: [
          ["Límites del negocio", "Las partes cambian juntas", "Responsabilidades claramente distintas"],
          ["Despliegue", "Se publica todo junto", "Una parte necesita salir sola"],
          ["Escalabilidad", "Carga pareja", "Una parte necesita más recursos"],
          ["Equipos", "Un equipo pequeño", "Equipos dueños de cada parte"],
          ["Costo de operación", "Menos piezas que vigilar", "Hay capacidad para operar más piezas"],
          ["Contratos y fallos", "Llamadas en el mismo proceso", "Se aceptan fallos parciales y versionado"],
        ],
      },
      marcas: [{ texto: "ARKA-Lite usa dos servicios para aprender esas fronteras", certeza: "ejemplo" }],
      guion: {
        decir: [
          "Antes de separar procesos preguntamos qué partes del negocio cambian juntas, quién las mantiene y cuáles necesitan desplegarse o escalar por separado.",
          "Un monolito modular mantiene límites internos dentro de una sola aplicación. Separar servicios agrega red, bases independientes y fallos parciales que hay que poder operar.",
          "ARKA-Lite usa dos servicios para aprender esas fronteras. No es una receta para todas las aplicaciones, y Kubernetes tampoco es un requisito.",
        ],
        pregunta: { texto: "Si un solo equipo mantiene todo y se despliega junto, ¿qué ganamos separando?", respuesta: "Poco; agregamos red y fallos parciales sin un beneficio claro." },
        transicion: "Veamos qué pasa cuando enviamos INC-002.",
      },
    },
    {
      id: "s03-envio",
      titulo: "El envío en dos momentos",
      visible: ["Momento 1: estado y evento en una transacción", "La API responde con eso", "Momento 2: el relevador entrega después", "No hay broker: es HTTP"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "envio",
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/dominio/ServicioDeSolicitudes.java",
        texto: "@Transactional\npublic Solicitud enviar(String id) {\n    Solicitud enviada = buscar(id).enviar();\n    repositorio.guardar(enviada);\n    registrador.registrar(UUID.randomUUID().toString(),\n            enviada.id(), \"SolicitudEnviada\");\n    return enviada;\n}",
      },
      guion: {
        decir: [
          "Cuando enviamos INC-002, solicitudes valida el estado y guarda dos cosas en una sola transacción: la solicitud ENVIADA y un evento pendiente. Con eso ya puede responder.",
          "Otro componente, el relevador, revisa los pendientes y los publica por HTTP después. No hay Kafka ni RabbitMQ en esta solución.",
          "La respuesta trae la solicitud, pero no trae el eventoId. Por eso desde fuera no podemos atar directamente un envío con su evento.",
        ],
        demo: { accion: "Probar › Enviar sobre una solicitud en BORRADOR.", evidencia: "200 con estado ENVIADA y sin eventoId.", laboratorio: "enviar" },
        pregunta: { texto: "¿El éxito del POST remoto y marcar procesado = true son una sola escritura?", respuesta: "No. Hay una ventana entre ambos pasos." },
        transicion: "Antes de la entrega, veamos cómo la UI observa lo que pasa.",
        respaldo: "docs/presentation-data/guion-maestro.md › El envío en dos momentos",
      },
    },
    {
      id: "s03-ui",
      titulo: "Cómo funciona la UI del laboratorio",
      visible: ["El navegador solo llama a /api", "El proxy llega a cada servicio por nombre", "La UI registra solo sus peticiones", "Un POST nunca se repite solo"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "ui",
      codigo: {
        lenguaje: "nginx",
        archivo: "presentacion/despliegue/nginx.conf.template",
        texto: "location /api/solicitudes {\n    proxy_pass ${ARKA_SOLICITUDES_ORIGEN}/solicitudes;\n}\nlocation = /api/salud/solicitudes {\n    proxy_pass ${ARKA_SOLICITUDES_ORIGEN}/actuator/health;\n}",
      },
      guion: {
        decir: [
          "La UI es una aplicación React servida por nginx. El navegador nunca conoce los nombres internos: llama a /api en el mismo origen y el proxy traduce a servicio-solicitudes o servicio-notificaciones.",
          "Cada petición queda en un historial con método, URL, status y duración. Pero ojo: la UI solo ve sus propias peticiones. La entrega entre servicios no pasa por aquí.",
          "Si un POST tarda más de 10 segundos, la UI lo marca como tiempo agotado y no lo repite: el cambio podría haberse guardado aunque la respuesta se perdiera.",
        ],
        transicion: "Pasemos a la demostración en vivo.",
      },
    },
    {
      id: "s03-demo",
      titulo: "Demostración: seguir INC-002",
      visible: ["Crear INC-002 si no existe", "Enviar y leer lo que confirmó la respuesta", "Consultar avisos y eventos consumidos por separado", "“Todavía no observado” no es un fallo"],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Vamos a la vista Probar. Primero listamos las solicitudes para ver el estado actual. Si INC-002 no existe, la creamos; si ya existe, la API la dejaría otra vez en borrador, y la pantalla lo advierte.",
          "Enviamos y leemos lo que la respuesta confirma: ENVIADA. Después consultamos los avisos. Puede que todavía no aparezca: el relevador trabaja en ciclos. La pantalla dice “todavía no observado”, que no es lo mismo que “falló”.",
        ],
        instrucciones: [
          "No reiniciar datos ni borrar contenedores para preparar el ejemplo.",
          "Si el aviso no aparece, activar la actualización periódica (máximo seis consultas) en lugar de repetir el envío.",
        ],
        demo: { accion: "Probar › Listar, Crear INC-002, Enviar, Consultar avisos, Consultar eventos consumidos.", evidencia: "ENVIADA en la respuesta y luego el texto “Solicitud INC-002 (SolicitudEnviada) enviada” en avisos.", laboratorio: "enviar" },
        transicion: "Ya vimos qué pasa. Ahora veamos dónde se ejecuta todo esto.",
      },
    },
  ],
};

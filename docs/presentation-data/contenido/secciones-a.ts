import type { Seccion } from "./tipos.ts";

// Apertura y partes 1 y 2. Los textos "decir" están escritos para decirse en
// voz alta, en español neutro de Panamá: frases cortas, un ejemplo cotidiano
// y cada término explicado la primera vez que aparece.

export const apertura: Seccion = {
  id: "s00",
  numero: null,
  titulo: "Apertura",
  corto: "Apertura",
  participante: "p1",
  diapositivas: [
    {
      id: "s00-portada",
      titulo: "Del endpoint al clúster",
      visible: ["Cómo construimos ARKA-Lite: una interfaz web y dos microservicios en Java."],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Buenos días a todos. Somos el equipo arka-litos, del curso Upskilling Backend Java, y hoy les vamos a contar cómo construimos ARKA-Lite, nuestro proyecto final.",
          "El título lo resume: empezamos escribiendo un endpoint, una sola operación en Java, y terminamos con un sistema completo corriendo en un clúster de Kubernetes. En el camino fuimos aplicando, uno por uno, los temas que vimos en el curso.",
        ],
        instrucciones: ["Antes de empezar, abrir la UI en http://localhost:8088 y comprobar que los dos servicios aparecen en verde."],
        transicion: "Primero, quiénes somos.",
      },
    },
    {
      id: "s00-equipo",
      titulo: "El equipo arka-litos",
      visible: ["Cuatro personas de desarrollo", "Dos personas de DevOps", "Una persona de base de datos", "Cada quien presenta la parte de su área"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: { tipo: "equipo" },
      guion: {
        decir: [
          "Somos siete personas. Cuatro somos de desarrollo: construimos los servicios, su diseño y la interfaz. Dos son de DevOps: se encargaron de empaquetar, desplegar y operar el sistema. Y una es de base de datos: cuidó cómo se guardan los datos y que ningún aviso se pierda.",
          "Por eso hoy van a escuchar varias voces: cada uno presenta la parte de su área. Debajo de cada persona ven qué partes le tocan.",
          "La idea no es que memoricen tecnologías. Queremos que, al salir, puedan explicar con sus propias palabras cómo funciona el sistema y por qué tomamos cada decisión.",
        ],
        transicion: "Empecemos por lo básico: qué hace ARKA-Lite.",
      },
    },
    {
      id: "s00-que-es",
      titulo: "Qué es ARKA-Lite",
      idea: "Registra solicitudes y avisa cuando se envían.",
      visible: ["Solicitudes: crea solicitudes y cambia su estado", "Notificaciones: crea un aviso cuando una solicitud se envía", "La interfaz web: permite usar y entender los dos"],
      iconos: ["clipboard-list", "bell", "monitor"],
      comparacion: "Como una ventanilla y un buzón: la ventanilla recibe el trámite y el buzón te avisa cuando avanzó.",
      iconoComparacion: "mailbox",
      porque: "Dos servicios con tareas distintas: así pudimos practicar todo lo que trae trabajar con microservicios.",
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "ARKA-Lite hace algo sencillo: registra solicitudes, por ejemplo una incidencia o un pedido de cambio, y avisa cuando una solicitud se envía.",
          "Por dentro son dos servicios. El de solicitudes es como la ventanilla: recibe el trámite y lleva su estado. El de notificaciones es como el buzón: cuando el trámite avanza, deja el aviso. Y encima de los dos hay una interfaz web, que es lo que usa la persona.",
          "Elegimos un problema pequeño a propósito. Así el foco no está en el negocio, sino en cómo se construye, se despliega y se opera un sistema con más de un servicio.",
        ],
        transicion: "Antes de entrar en detalle, veamos el proyecto en números.",
      },
    },
    {
      id: "s00-cifras",
      titulo: "ARKA-Lite en números",
      idea: "Un sistema pequeño, pero completo de punta a punta.",
      visible: ["Dos microservicios y una interfaz", "Todo se levanta con un solo comando", "Cada cambio pasa por pruebas automáticas"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "cifras",
        cifras: [
          { valor: "2", icono: "server", titulo: "microservicios", texto: "Spring Boot con Java 26, cada uno con su base PostgreSQL.", tono: "marino" },
          { valor: "11", icono: "code", titulo: "endpoints REST", texto: "8 en solicitudes y 3 en notificaciones, documentados con Swagger.", tono: "violeta" },
          { valor: "8", icono: "container", titulo: "contenedores", texto: "Servicios, bases, interfaz y logs, con un solo comando.", tono: "cian" },
          { valor: "67", icono: "flask-conical", titulo: "pruebas automáticas", texto: "28 en solicitudes, 10 en notificaciones y 29 en la interfaz.", tono: "correcto" },
          { valor: "5 s", icono: "timer", titulo: "para entregar un aviso", texto: "Cada cinco segundos se entregan los avisos pendientes.", tono: "advertencia" },
          { valor: "0", icono: "fingerprint", titulo: "avisos duplicados", texto: "Aunque un evento llegue dos veces, se crea un solo aviso.", tono: "marino" },
        ],
      },
      guion: {
        decir: [
          "Así se ve ARKA-Lite en números. Son dos microservicios hechos con Spring Boot, cada uno con su propia base de datos, y entre los dos exponen once endpoints REST.",
          "Todo el sistema son ocho contenedores: los servicios, sus bases, la interfaz y las herramientas de logs. Y se levantan con un solo comando.",
          "Lo cuidan sesenta y siete pruebas automáticas. Los avisos pendientes se entregan cada cinco segundos y, aunque un evento llegue dos veces, se crea un solo aviso. Esos dos números los vamos a explicar con calma más adelante.",
        ],
        transicion: "¿Y cómo se conecta esto con lo que vimos en el curso?",
      },
    },
    {
      id: "s00-agenda",
      titulo: "Cómo vamos a recorrerlo",
      idea: "Siete partes, en el orden en que se construye el sistema.",
      visible: ["Siete partes, en el orden en que se construye", "Cada tema del curso, donde se usa", "Diagramas paso a paso", "Demostración en vivo al final"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: { tipo: "ruta" },
      tabla: {
        encabezados: ["Parte", "Temas del curso que aparecen"],
        filas: [
          ["1 El sistema por fuera", "Visión general del sistema y su arquitectura"],
          ["2 Construir un servicio", "Spring Boot, endpoints REST, manejo global de errores, Swagger, pruebas, Git"],
          ["3 Diseñar para cambiar", "Puertos y adaptadores, de monolito a microservicios"],
          ["4 Guardar sin perder datos", "Adaptador con base de datos real, el problema de la consistencia"],
          ["5 Empaquetar y entregar", "Docker y Dockerfile, Docker Compose, integración y entrega continua"],
          ["6 Desplegar y operar", "Kubernetes, del contenedor al clúster, puesta a punto, logs y monitoreo"],
          ["7 Ensamblaje", "Ensamblaje del sistema y puesta a punto"],
        ],
      },
      guion: {
        decir: [
          "No vamos a seguir el temario clase por clase. Vamos a contar la historia de cómo se construye el sistema, en el orden en que tiene sentido.",
          "Primero lo vemos por fuera, como un usuario. Después entramos a un servicio y vemos cómo se arma. Luego, cómo lo diseñamos para que pueda cambiar sin romperse y cómo cuidamos los datos. Nuestros compañeros de DevOps nos muestran cómo lo empaquetamos, lo desplegamos y sabemos si está funcionando. Al final lo vemos todo junto, en vivo.",
          "En cada parte van a ver el mismo orden: qué problema resuelve, cómo lo aplicamos, un diagrama paso a paso y la prueba de que funciona.",
        ],
        instrucciones: ["Explicar que el número sobre cada flecha de los diagramas coincide con el paso que se lee."],
        transicion: "Empecemos mirando el sistema completo desde afuera.",
      },
    },
  ],
};

export const sistema: Seccion = {
  id: "s01",
  numero: 1,
  titulo: "El sistema por fuera",
  corto: "Sistema",
  participante: "p1",
  subtitulo: "Qué piezas tiene ARKA-Lite, dónde corren y cómo se hablan.",
  temas: ["Visión general", "Arquitectura", "Microservicios"],
  icono: "map",
  claves: {
    problema: "Antes de ver código, hay que saber qué piezas existen y cómo se hablan.",
    sencillo: "Una UI llama a dos microservicios por HTTP; cada uno guarda sus datos en su propia base.",
    visual: "Persona → UI → solicitudes y notificaciones → una base PostgreSQL para cada uno.",
    aplicacion: "compose.yaml levanta la UI, los dos servicios, sus bases y la observabilidad con un solo comando.",
    evidencia: "La UI en localhost:8088 con los dos servicios en verde.",
  },
  diapositivas: [
    {
      id: "s01-mapa",
      titulo: "El mapa de ARKA-Lite",
      visible: ["La UI es la puerta de entrada", "Cada servicio tiene su propia base", "Solicitudes avisa a notificaciones con un evento", "Todo se comunica por HTTP"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "arquitectura",
      guion: {
        decir: [
          "Este es el mapa. A la izquierda está la persona, usando la interfaz desde su navegador. La interfaz no guarda nada: le pide las cosas a los servicios.",
          "Arriba está el servicio de solicitudes, con su base de datos. Abajo, el de notificaciones, con la suya. Fíjense en algo importante: ninguno lee la base del otro. Si notificaciones necesita saber algo, solicitudes se lo cuenta con un mensaje que llamamos evento.",
          "Y todo viaja por HTTP, el mismo protocolo que usa cualquier página web. No hay magia: son peticiones y respuestas.",
        ],
        pregunta: { texto: "¿Por qué no comparten una sola base de datos?", respuesta: "Para que cada servicio sea dueño de sus datos y pueda cambiar sin romper al otro." },
        transicion: "Veamos qué le pasa a una solicitud durante su vida.",
        respaldo: "docs/inicio/proyecto.md",
      },
    },
    {
      id: "s01-estados",
      titulo: "La vida de una solicitud",
      idea: "Cuatro estados, y solo un momento genera un aviso.",
      visible: ["Nace en BORRADOR", "Al enviarla pasa a ENVIADA y se genera un aviso", "Desde ENVIADA se aprueba o se rechaza", "Un cambio no permitido responde 409"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "estados",
        columnas: [
          [{ icono: "file-plus", titulo: "BORRADOR", texto: "Recién creada. Nadie se entera.", tono: "neutro" }],
          [{ icono: "send", titulo: "ENVIADA", texto: "Se genera un aviso.", tono: "cian" }],
          [
            { icono: "circle-check", titulo: "APROBADA", texto: "Termina su vida.", tono: "correcto" },
            { icono: "circle-x", titulo: "RECHAZADA", texto: "Termina su vida.", tono: "error" },
          ],
        ],
        acciones: ["Enviar", "Aprobar o rechazar"],
        error: { icono: "ban", titulo: "409 · Conflicto", texto: "Enviar dos veces o aprobar algo que no está enviado: el servicio no lo permite y explica por qué.", tono: "error" },
      },
      tabla: {
        encabezados: ["Acción", "Desde", "Hacia", "¿Genera aviso?"],
        filas: [
          ["Crear", "—", "BORRADOR", "No"],
          ["Enviar", "BORRADOR", "ENVIADA", "Sí, un evento para notificaciones"],
          ["Aprobar", "ENVIADA", "APROBADA", "No"],
          ["Rechazar", "ENVIADA", "RECHAZADA", "No"],
        ],
      },
      guion: {
        decir: [
          "Toda solicitud nace en borrador. Mientras está en borrador, nadie se entera: es como un formulario que todavía no hemos entregado.",
          "Cuando la enviamos, pasa a enviada, y ese es el único momento en que se genera un aviso. Desde enviada, alguien la puede aprobar o rechazar, y ahí termina su vida.",
          "¿Qué pasa si intentamos algo que no corresponde, como enviar dos veces la misma solicitud? El servicio no lo permite y responde con un código 409, que en HTTP significa conflicto, junto con un mensaje que explica el porqué.",
        ],
        demo: { accion: "En la UI, pestaña Solicitudes: crear una solicitud nueva y enviarla.", evidencia: "La fila pasa de Borrador a Enviada y, unos segundos después, muestra 1 aviso." },
        transicion: "Esa es la vista sencilla. Ahora veamos todo lo que hay alrededor.",
      },
    },
    {
      id: "s01-macro",
      titulo: "La arquitectura completa",
      visible: ["Las piezas corren en Docker Compose o en Kubernetes", "GitHub Actions prueba cada cambio y publica las imágenes", "Los logs de todos llegan a Grafana", "Cada pieza tiene una sola responsabilidad"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "macro",
      guion: {
        decir: [
          "Este es el mismo sistema, pero con todo lo que lo rodea. El recuadro grande es el lugar donde corre: en nuestra computadora con Docker Compose, o en un clúster de Kubernetes.",
          "Abajo a la izquierda está la entrega continua. Cada vez que alguien sube un cambio a GitHub, un proceso automático lo compila, corre las pruebas y, si todo sale bien, publica las imágenes listas para desplegar.",
          "Y abajo a la derecha, la observabilidad: los logs de todos los contenedores se recogen con Promtail, se guardan en Loki y se consultan en Grafana. Así, si algo falla, no tenemos que entrar a cada servicio a buscar qué pasó.",
        ],
        pregunta: { texto: "Si mañana agregamos un tercer servicio, ¿qué partes del dibujo cambian?", respuesta: "Se agrega su caja y su base; la entrega y los logs lo cubren igual, sin cambios." },
        transicion: "Ya vimos el mapa. Ahora entremos a uno de esos servicios.",
      },
    },
  ],
};

export const servicio: Seccion = {
  id: "s02",
  numero: 2,
  titulo: "Construir un servicio",
  corto: "Servicio",
  participante: "p2",
  subtitulo: "Cómo pasamos de una idea a un endpoint que responde, avisa sus errores y está probado.",
  temas: ["Spring Boot", "Endpoints REST", "Manejo global de errores", "Swagger", "Pruebas unitarias", "Git"],
  icono: "code",
  claves: {
    problema: "Necesitamos exponer operaciones del negocio por HTTP de forma clara, documentada y probada.",
    sencillo: "Spring Boot arma la aplicación; los controladores reciben peticiones; el dominio decide; las pruebas lo comprueban.",
    visual: "Petición → controlador → servicio → repositorio → respuesta con su código HTTP.",
    aplicacion: "SolicitudController, ServicioDeSolicitudes, ManejadorGlobalDeErrores, Swagger y las pruebas JUnit.",
    evidencia: "./mvnw verify en cada servicio y Swagger en /swagger-ui/index.html.",
  },
  diapositivas: [
    {
      id: "s02-spring",
      titulo: "Primer contacto con Spring Boot",
      idea: "Spring Boot arma la aplicación por nosotros.",
      visible: ["Maven descarga lo necesario, compila y prueba", "Spring Boot levanta el servidor y conecta las piezas", "Cada pieza recibe lo que necesita por el constructor", "Las reglas del negocio no dependen de Spring"],
      iconos: ["package", "rocket", "plug", "shield-check"],
      comparacion: "Como un contratista de obra: nosotros decimos qué piezas hay y él las arma y las conecta.",
      iconoComparacion: "hard-hat",
      recorridos: ["ejecutivo", "tecnico"],
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/config/ConfiguracionDominio.java",
        texto: "@Bean\nServicioDeSolicitudes servicioDeSolicitudes(\n        RepositorioDeSolicitudes repositorio,\n        PublicadorDeEventos publicador,\n        RegistradorDeEventosSalientes registrador) {\n    return new ServicioDeSolicitudes(repositorio, publicador, registrador);\n}",
      },
      guion: {
        decir: [
          "Nuestro primer contacto con Spring Boot fue entender qué hace por nosotros. Maven se encarga de descargar las librerías, compilar y correr las pruebas. Spring Boot levanta el servidor web y conecta las piezas de la aplicación.",
          "Piénsenlo como un contratista de obra: nosotros le decimos qué piezas hay, y él las arma y las conecta. Cada pieza recibe lo que necesita por su constructor; nadie sale a buscar sus dependencias por su cuenta.",
          "Una decisión que tomamos desde el principio: las reglas del negocio no conocen a Spring. Son clases normales de Java. Eso nos va a servir mucho cuando hablemos de pruebas y de diseño.",
        ],
        demo: { accion: "Ejecutar ./mvnw clean verify dentro de servicio-solicitudes.", evidencia: "BUILD SUCCESS y el resumen de pruebas." },
        transicion: "Con la aplicación arriba, construyamos nuestro primer endpoint.",
        respaldo: "docs/arquitectura/componentes-java.md",
      },
    },
    {
      id: "s02-rest",
      titulo: "Construcción de endpoints REST",
      visible: ["Método + ruta = una operación", "El cuerpo viaja en JSON", "Cada respuesta trae un código: 201, 404, 409", "El controlador traduce; quien decide es el servicio"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "rest",
      guion: {
        decir: [
          "Un endpoint REST es una combinación de método y ruta. Por ejemplo, POST a /solicitudes significa: crea una solicitud nueva. GET a /solicitudes significa: dame la lista.",
          "Sigamos el diagrama. La interfaz manda los datos en formato JSON. El controlador los recibe y se los pasa al servicio. El servicio revisa que todo esté bien y el adaptador lo guarda en la base de datos. Si todo sale bien, la respuesta es 201, que quiere decir creado.",
          "Y si el identificador ya existía, el servicio no lo guarda y responde 409, conflicto, con un mensaje claro. Cada código cuenta qué pasó, sin tener que adivinar.",
        ],
        transicion: "¿Y dónde vive la regla que decide si algo se permite?",
        respaldo: "docs/inicio/proyecto.md",
      },
    },
    {
      id: "s02-regla",
      titulo: "La regla vive en el dominio",
      idea: "La regla del negocio está en un solo lugar.",
      visible: ["La solicitud es un record: datos que no cambian", "Solo se envía si está en BORRADOR", "Si no, lanza una excepción del dominio", "No sabe nada de HTTP ni de bases de datos"],
      iconos: ["lock", "send", "triangle-alert", "shield"],
      porque: "Si mañana cambia la regla, se cambia en un solo archivo y las pruebas lo confirman.",
      recorridos: ["ejecutivo", "tecnico"],
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/dominio/Solicitud.java",
        texto: "public record Solicitud(String id, String tipo, Estado estado) {\n\n    public Solicitud enviar() {\n        if (estado != Estado.BORRADOR) {\n            throw new TransicionNoPermitida(\n                \"solo se puede enviar una solicitud en BORRADOR\");\n        }\n        return new Solicitud(id, tipo, Estado.ENVIADA);\n    }\n}",
      },
      guion: {
        decir: [
          "La solicitud es un record de Java, que es una forma corta de declarar datos que no cambian. Cuando la enviamos, no modificamos la solicitud que teníamos: creamos una nueva en estado enviada.",
          "Y la regla está ahí mismo, a la vista: solo se puede enviar si está en borrador. Si no, lanza una excepción que se llama TransicionNoPermitida.",
          "Fíjense en lo que esta clase no sabe: no sabe de HTTP, no sabe de PostgreSQL. Solo sabe del negocio. Si mañana cambia la regla, la cambiamos en un solo lugar.",
        ],
        transicion: "Esa excepción tiene que llegarle a la persona como un mensaje que entienda.",
      },
    },
    {
      id: "s02-errores",
      titulo: "Manejo global de errores",
      idea: "Un solo lugar convierte los errores en respuestas claras.",
      visible: ["404: la solicitud no existe", "409: el identificador ya existe o el cambio no se permite", "400: faltan datos", "Siempre la misma forma: estado y mensaje"],
      porque: "La interfaz puede mostrarle a la persona exactamente qué pasó.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "cifras",
        cifras: [
          { valor: "201", icono: "circle-check", titulo: "Creada", texto: "Todo salió bien: la solicitud quedó en BORRADOR.", tono: "correcto" },
          { valor: "400", icono: "triangle-alert", titulo: "Faltan datos", texto: "El identificador o el tipo vienen vacíos.", tono: "advertencia" },
          { valor: "404", icono: "search", titulo: "No existe", texto: "No hay ninguna solicitud con ese identificador.", tono: "neutro" },
          { valor: "409", icono: "ban", titulo: "Conflicto", texto: "El identificador ya existe o el cambio no se permite.", tono: "error" },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/adaptadores/entrada/ManejadorGlobalDeErrores.java",
        texto: "@RestControllerAdvice\npublic class ManejadorGlobalDeErrores {\n\n    @ExceptionHandler(TransicionNoPermitida.class)\n    public ResponseEntity<ErrorRespuesta> transicionNoPermitida(\n            TransicionNoPermitida ex) {\n        return ResponseEntity.status(HttpStatus.CONFLICT)\n                .body(new ErrorRespuesta(409, ex.getMessage()));\n    }\n}",
      },
      guion: {
        decir: [
          "En el taller del endpoint seguro aprendimos a no repetir el manejo de errores en cada controlador. En su lugar, hay un solo componente, el manejador global, que atrapa las excepciones y las convierte en respuestas HTTP.",
          "Si la solicitud no existe, responde 404. Si el identificador ya existe o el cambio no se permite, 409. Si faltan datos, 400. Y siempre con la misma forma: un estado y un mensaje.",
          "Eso es lo que permite que la interfaz le muestre a la persona un mensaje claro, en lugar de un error genérico que nadie entiende.",
        ],
        demo: { accion: "En la UI, crear dos veces el mismo identificador.", evidencia: "Aparece el diálogo “Ese identificador ya existe” con el código 409." },
        transicion: "Ahora, ¿cómo sabe otra persona qué endpoints existen?",
      },
    },
    {
      id: "s02-swagger",
      titulo: "Documentar con Swagger",
      idea: "La documentación sale del mismo código.",
      visible: ["Cada servicio publica su contrato con OpenAPI", "Swagger lo muestra como una página", "Se puede probar cada endpoint desde ahí", "Si agregamos un endpoint, aparece solo"],
      iconos: ["file-json", "book-open", "play", "sparkles"],
      comparacion: "Como el menú de un restaurante: dice qué hay, qué lleva cada plato y qué te van a traer.",
      iconoComparacion: "utensils",
      recorridos: ["ejecutivo", "tecnico"],
      visual: { tipo: "captura", capturas: [{ archivo: "swagger-solicitudes.png", titulo: "Swagger de solicitudes", url: "localhost:8080/swagger-ui/index.html" }] },
      tabla: {
        encabezados: ["Servicio", "Swagger"],
        filas: [
          ["solicitudes", "http://localhost:8080/swagger-ui/index.html"],
          ["notificaciones", "http://localhost:8081/swagger-ui/index.html"],
        ],
      },
      guion: {
        decir: [
          "Un contrato de API es como el menú de un restaurante: dice qué se puede pedir, qué lleva cada pedido y qué te van a devolver.",
          "Cada servicio publica su contrato con un estándar llamado OpenAPI, y Swagger lo muestra como una página donde podemos ver cada endpoint y hasta probarlo.",
          "Lo mejor es que se genera desde el código. Cuando agregamos un endpoint, la documentación lo muestra sin trabajo extra, y nunca queda desactualizada. Desde la interfaz hay un menú, Contratos, que abre estas páginas directamente.",
        ],
        demo: { accion: "En la UI, menú Contratos › Swagger · solicitudes, y ejecutar GET /solicitudes.", evidencia: "La lista en JSON con código 200." },
        transicion: "Documentar no basta: también hay que comprobar que funciona.",
      },
    },
    {
      id: "s02-pruebas",
      titulo: "Pruebas unitarias",
      idea: "Cada regla tiene una prueba que la vigila.",
      visible: ["Las reglas se prueban sin levantar Spring", "Los controladores se prueban con MockMvc", "Un repositorio en memoria reemplaza a PostgreSQL", "El pipeline corre todas las pruebas en cada cambio"],
      porque: "Si alguien rompe una regla sin darse cuenta, una prueba falla antes de llegar a producción.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "tarjetas",
        tarjetas: [
          { icono: "list-checks", titulo: "SolicitudTest", texto: "Los cambios de estado permitidos y los prohibidos.", tono: "marino" },
          { icono: "flask-conical", titulo: "ServicioSolicitudesUnitTest", texto: "Crear, enviar y registrar el evento, con un repositorio en memoria.", tono: "cian" },
          { icono: "code", titulo: "SolicitudControllerWebTest", texto: "El JSON y los códigos 201, 404, 409 y 400, con MockMvc.", tono: "violeta" },
          { icono: "fingerprint", titulo: "Pruebas de notificaciones", texto: "Un evento repetido genera un solo aviso.", tono: "correcto" },
        ],
      },
      tabla: {
        encabezados: ["Prueba", "Qué comprueba"],
        filas: [
          ["SolicitudTest", "Los cambios de estado permitidos y prohibidos"],
          ["ServicioSolicitudesUnitTest", "Crear, enviar y registrar el evento"],
          ["SolicitudControllerWebTest", "El JSON y los códigos 201, 404, 409 y 400"],
          ["Pruebas de notificaciones", "Un evento repetido genera un solo aviso"],
        ],
      },
      guion: {
        decir: [
          "Las pruebas son como un vigilante que revisa cada regla todas las noches. Si alguien cambia algo y rompe una regla sin darse cuenta, la prueba falla y nos avisa.",
          "Como el negocio no depende de Spring, podemos probar las reglas sin levantar nada: son pruebas muy rápidas. En lugar de PostgreSQL usamos un repositorio en memoria que cumple el mismo contrato.",
          "Los controladores los probamos con MockMvc, que simula peticiones HTTP sin un servidor real. Solo el servicio de solicitudes tiene 28 pruebas, y el pipeline las corre todas en cada cambio.",
        ],
        demo: { accion: "./mvnw test en servicio-solicitudes.", evidencia: "Tests run: 28, Failures: 0." },
        transicion: "Las pruebas cuidan el código. Git cuida su historia.",
      },
    },
    {
      id: "s02-git",
      titulo: "Git y commits con sentido",
      idea: "Cada cambio cuenta qué hizo y por qué.",
      visible: ["Una rama corta por tarea: feat/, fix/, docs/", "Commits en español: “feat: crear solicitud por post”", "Todo entra por Pull Request con una aprobación", "Nadie sube cambios directo a main"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "ramas",
        principal: "main",
        rama: "feat/crear-solicitud-por-post",
        commits: ["feat: crear solicitud por post", "fix: responder 409 si el id ya existe", "docs: documentar POST /solicitudes"],
        fusion: "Pull Request: una aprobación y el pipeline en verde",
      },
      guion: {
        decir: [
          "Trabajamos en equipo sobre el mismo código, así que necesitábamos orden. Cada tarea se hace en una rama corta, con un nombre que dice qué es: feat para algo nuevo, fix para una corrección, docs para documentación.",
          "Cada commit sigue una convención: el tipo, dos puntos y una frase corta que dice qué hace el cambio. Por ejemplo: feat, crear solicitud por post. Así, leyendo el historial, cualquiera entiende qué pasó.",
          "Y nadie sube cambios directo a la rama principal. Todo entra por un Pull Request, otra persona lo revisa y el pipeline lo valida antes de integrarlo.",
        ],
        instrucciones: ["Mostrar el historial del repositorio en GitHub; no crear commits durante la exposición."],
        transicion: "Ya sabemos construir un servicio. Ahora veamos cómo lo diseñamos para que pueda cambiar.",
        respaldo: "docs/desarrollo/flujo-de-trabajo.md",
      },
    },
  ],
};

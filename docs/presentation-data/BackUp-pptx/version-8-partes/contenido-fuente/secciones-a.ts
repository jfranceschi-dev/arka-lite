import type { Seccion } from "./tipos.ts";

// Apertura y partes 1 y 2. Los textos "decir" están escritos para decirse en
// voz alta, en español neutro de Panamá, para un público de staff de
// tecnología: qué hicimos, qué medimos, qué aprendimos y qué valor deja.

export const apertura: Seccion = {
  id: "s00",
  numero: null,
  titulo: "Apertura",
  corto: "Apertura",
  diapositivas: [
    {
      id: "s00-portada",
      titulo: "Del endpoint al clúster",
      visible: ["Lo que aprendimos construyendo dos microservicios Java, de punta a punta."],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Buenos días. Hoy les presentamos ARKA-Lite, el proyecto final del curso Upskilling Backend Java.",
          "Empezamos escribiendo un endpoint y terminamos con un sistema de dos microservicios corriendo en Kubernetes, con su pipeline, su base de datos y su observabilidad. No les vamos a contar el temario: les vamos a contar qué construimos, qué medimos y qué aprendimos.",
        ],
        instrucciones: ["Antes de empezar, abrir la UI en http://localhost:8088 y comprobar que los dos servicios aparecen en verde."],
        transicion: "Primero, el proyecto en números.",
      },
    },
    {
      id: "s00-cifras",
      titulo: "ARKA-Lite en números",
      idea: "Registra solicitudes y avisa cuando se envían: un sistema pequeño, completo de punta a punta.",
      visible: ["Dos microservicios con su propia base", "Un solo comando levanta todo", "Cada cambio pasa por pruebas automáticas"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "cifras",
        cifras: [
          { valor: "2", icono: "server", titulo: "microservicios", texto: "Spring Boot 4 y Java 26, cada uno con su PostgreSQL.", tono: "marino" },
          { valor: "11", icono: "code", titulo: "endpoints REST", texto: "Documentados con OpenAPI y Swagger.", tono: "violeta" },
          { valor: "67", icono: "flask-conical", titulo: "pruebas automáticas", texto: "28 en solicitudes, 10 en notificaciones, 29 en la UI.", tono: "correcto" },
          { valor: "8", icono: "container", titulo: "contenedores", texto: "Servicios, bases, UI y logs con un solo comando.", tono: "cian" },
          { valor: "≤ 5 s", icono: "timer", titulo: "para entregar un aviso", texto: "El relevador revisa los pendientes cada 5 segundos.", tono: "advertencia" },
          { valor: "0", icono: "fingerprint", titulo: "avisos perdidos o duplicados", texto: "Aunque el otro servicio esté caído o el evento llegue dos veces.", tono: "marino" },
        ],
      },
      guion: {
        decir: [
          "ARKA-Lite hace algo sencillo a propósito: registra solicitudes, como una incidencia o un pedido de cambio, y avisa cuando una solicitud se envía. El problema es pequeño para que el foco esté en cómo se construye, se despliega y se opera.",
          "Son dos microservicios con Spring Boot, once endpoints documentados, sesenta y siete pruebas automáticas y ocho contenedores que se levantan con un solo comando.",
          "Y los dos números que más nos importan: un aviso se entrega en cinco segundos o menos, y no se pierde ni se duplica ninguno, aunque el otro servicio esté caído. Más adelante les mostramos cómo lo logramos.",
        ],
        transicion: "Antes de entrar, ocho palabras que vamos a usar mucho.",
      },
    },
    {
      id: "s00-conceptos",
      titulo: "Ocho conceptos, en una frase",
      idea: "Lo mínimo para seguir la presentación, sin jerga.",
      visible: ["Microservicio y API REST", "Arquitectura hexagonal y ORM", "Docker y Kubernetes", "CI/CD y observabilidad"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "tarjetas",
        columnas: 4,
        tarjetas: [
          { icono: "server", titulo: "Microservicio", texto: "Una aplicación pequeña, con una sola tarea y su propia base de datos.", tono: "marino" },
          { icono: "globe", titulo: "API REST", texto: "La puerta para pedirle algo a una aplicación por HTTP, como abrir una URL.", tono: "violeta" },
          { icono: "hexagon", titulo: "Arquitectura hexagonal", texto: "El negocio al centro; la base y la web se conectan por “enchufes”.", tono: "marino" },
          { icono: "table", titulo: "ORM (JPA)", texto: "Traduce entre clases Java y tablas: escribe el SQL rutinario por nosotros.", tono: "cian" },
          { icono: "container", titulo: "Docker", texto: "Empaqueta la aplicación con todo lo que necesita: corre igual en cualquier lado.", tono: "cian" },
          { icono: "ship-wheel", titulo: "Kubernetes", texto: "Administra esos paquetes: los arranca, los vigila y los reinicia si fallan.", tono: "correcto" },
          { icono: "workflow", titulo: "CI/CD", texto: "Un robot que compila, prueba y empaqueta cada cambio, sin pasos manuales.", tono: "correcto" },
          { icono: "chart-line", titulo: "Observabilidad", texto: "Logs y salud de todo el sistema en un solo lugar.", tono: "advertencia" },
        ],
      },
      guion: {
        decir: [
          "Sabemos que muchos de ustedes trabajan sobre todo con la base de datos y procedimientos almacenados, así que antes de entrar les dejamos ocho conceptos en una frase.",
          "Un microservicio es una aplicación pequeña con una sola tarea y su propia base. Una API REST es la puerta para pedirle cosas por HTTP. La arquitectura hexagonal pone el negocio al centro y conecta la base y la web como si fueran enchufes. Y un ORM traduce entre clases Java y tablas, para no escribir a mano el SQL de todos los días.",
          "Docker empaqueta la aplicación con todo lo que necesita; Kubernetes administra esos paquetes. CI/CD es un robot que prueba cada cambio. Y observabilidad es poder ver qué pasa adentro. Cada uno lo vamos a ver con un ejemplo.",
        ],
        pregunta: { texto: "¿Esto reemplaza a los procedimientos almacenados?", respuesta: "No necesariamente. Mueve las reglas del negocio al código; el SQL pesado o los reportes pueden seguir en la base." },
        transicion: "Este es el recorrido.",
      },
    },
    {
      id: "s00-agenda",
      titulo: "Qué vamos a ver",
      idea: "Ocho partes, del código a la operación, y en cada una lo que aprendimos.",
      visible: ["Fundamentos y arquitectura", "Base de datos", "Contenedores, CI/CD y observabilidad", "Documentación, la UI y el valor"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: { tipo: "ruta" },
      guion: {
        decir: [
          "Vamos en ocho partes, en el orden en que se construye un sistema: fundamentos, arquitectura, base de datos, contenedores y Kubernetes, integración y entrega continua, observabilidad y documentación.",
          "Después les mostramos la interfaz que usamos como laboratorio, sobre todo para ver qué pasa cuando algo falla. Y cerramos con el valor que esto deja.",
          "Cada parte termina con una lámina de aprendizajes: qué aprendimos, cómo lo aplicamos y qué valor tiene para un equipo de tecnología.",
        ],
        transicion: "Empecemos por los fundamentos.",
      },
    },
  ],
};

export const fundamentos: Seccion = {
  id: "s01",
  numero: 1,
  titulo: "Fundamentos",
  corto: "Fundamentos",
  subtitulo: "Spring Boot, REST, reglas de negocio, pruebas y Git.",
  temas: ["Spring Boot", "Endpoints REST", "Manejo global de errores", "Pruebas unitarias", "Git"],
  icono: "code",
  diapositivas: [
    {
      id: "s01-spring",
      titulo: "Cómo funciona Spring Boot",
      idea: "Spring Boot arma y conecta la aplicación; nosotros escribimos el negocio.",
      visible: ["Un main arranca todo", "Se configura solo según las librerías", "Crea las piezas y las conecta por el constructor", "Trae su propio servidor web"],
      comparacion: "Como un contratista de obra: le decimos qué piezas hay y él las arma, las conecta y abre la puerta.",
      iconoComparacion: "hard-hat",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "play", titulo: "main()", texto: "SpringApplication.run arranca la aplicación.", tono: "marino" },
          { icono: "sparkles", titulo: "Autoconfiguración", texto: "Ve web, JPA y PostgreSQL y los configura solos.", tono: "marino" },
          { icono: "plug", titulo: "Beans e inyección", texto: "Crea cada pieza y le pasa lo que necesita.", tono: "cian" },
          { icono: "server", titulo: "Servidor embebido", texto: "Tomcat queda escuchando en el puerto 8080.", tono: "cian" },
          { icono: "code", titulo: "Controlador", texto: "Recibe el JSON, llama al negocio y responde.", tono: "correcto" },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/ServicioSolicitudesApplication.java",
        texto: "@SpringBootApplication   // escaneo de componentes + autoconfiguración\n@EnableScheduling        // activa el relevador que corre cada 5 s\npublic class ServicioSolicitudesApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(ServicioSolicitudesApplication.class, args);\n    }\n}",
      },
      guion: {
        decir: [
          "Antes de Spring Boot, levantar una aplicación Java web significaba instalar un servidor, configurar la conexión a la base y conectar cada clase a mano. Spring Boot hace ese trabajo.",
          "Todo empieza en un main. Spring Boot mira qué librerías tenemos, por ejemplo web, JPA y el driver de PostgreSQL, y las configura solo. Luego crea cada pieza de la aplicación, lo que en Spring se llama un bean, y le pasa por el constructor lo que necesita: eso es la inyección de dependencias.",
          "Al final arranca su propio servidor web, Tomcat, en el puerto 8080. Cuando llega una petición, el controlador la recibe, llama al negocio y responde. Nosotros solo escribimos el negocio y decimos qué piezas hay.",
        ],
        demo: { accion: "Ejecutar ./mvnw clean verify dentro de servicio-solicitudes.", evidencia: "BUILD SUCCESS y el resumen de pruebas." },
        pregunta: { texto: "¿Qué es un bean?", respuesta: "Un objeto que Spring crea y administra, y que puede pasarle a otros por el constructor." },
        transicion: "Con la aplicación arriba, veamos cómo responde la API.",
        respaldo: "docs/arquitectura/componentes-java.md",
      },
    },
    {
      id: "s01-api",
      titulo: "Una API que responde siempre igual",
      idea: "La regla vive en el dominio; un solo componente la traduce a HTTP.",
      visible: ["Método + ruta = una operación", "La regla está en el dominio, sin Spring", "Un manejador global convierte errores en respuestas", "Siempre la misma forma: estado y mensaje"],
      porque: "Quien consume la API sabe qué pasó sin adivinar, y la UI le muestra a la persona un mensaje claro.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "cifras",
        cifras: [
          { valor: "201", icono: "circle-check", titulo: "Creada", texto: "La solicitud quedó en BORRADOR.", tono: "correcto" },
          { valor: "400", icono: "triangle-alert", titulo: "Faltan datos", texto: "El identificador o el tipo vienen vacíos.", tono: "advertencia" },
          { valor: "404", icono: "search", titulo: "No existe", texto: "No hay una solicitud con ese identificador.", tono: "neutro" },
          { valor: "409", icono: "ban", titulo: "Conflicto", texto: "El id ya existe o el cambio de estado no se permite.", tono: "error" },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/dominio/Solicitud.java",
        texto: "public record Solicitud(String id, String tipo, Estado estado) {\n\n    public Solicitud enviar() {\n        if (estado != Estado.BORRADOR) {\n            throw new TransicionNoPermitida(\n                \"solo se puede enviar una solicitud en BORRADOR\");\n        }\n        return new Solicitud(id, tipo, Estado.ENVIADA);\n    }\n}",
      },
      guion: {
        decir: [
          "Un endpoint REST es método más ruta: POST a /solicitudes crea, GET lista. El controlador solo traduce; quien decide es el dominio, que son clases Java normales, sin Spring. Por ejemplo, una solicitud solo se puede enviar si está en borrador.",
          "Si la regla no se cumple, el dominio lanza una excepción, y un único manejador global la convierte en una respuesta HTTP. Así cada error tiene su código: 400 si faltan datos, 404 si no existe, 409 si hay un conflicto. Siempre con la misma forma: estado y mensaje.",
          "Para el staff esto significa una API predecible: quien la consume sabe qué pasó sin leer el código.",
        ],
        demo: { accion: "En la UI, crear dos veces el mismo identificador.", evidencia: "El diálogo “Ese identificador ya existe” con el código 409." },
        transicion: "Que funcione no basta: el código también tiene que ser fácil de cambiar.",
        respaldo: "docs/inicio/proyecto.md",
      },
    },
    {
      id: "s01-practicas",
      titulo: "Código mantenible: buenas prácticas",
      idea: "Seis prácticas que hacen que un cambio toque un solo lugar.",
      visible: ["Una responsabilidad por clase", "Inyección por constructor", "Datos inmutables con records", "Errores en un solo lugar", "Nombres del negocio", "Pruebas y convenciones"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "matriz",
        encabezados: ["Práctica", "Cómo la aplicamos", "Por qué ayuda a mantener"],
        filas: [
          { icono: "layers", tono: "marino", celdas: ["Una responsabilidad por clase", "El controlador traduce, el servicio decide, el adaptador guarda", "Un cambio toca un solo lugar"] },
          { icono: "plug", tono: "cian", celdas: ["Inyección por constructor", "Cada pieza recibe sus dependencias; nadie hace new de lo que necesita", "Cualquier pieza se reemplaza o se prueba sola"] },
          { icono: "lock", tono: "violeta", celdas: ["Datos inmutables", "La Solicitud es un record: cambiar de estado crea una nueva", "Sin estados a medias ni efectos ocultos"] },
          { icono: "shield-alert", tono: "error", celdas: ["Errores en un solo lugar", "Excepciones del dominio y un manejador global", "Respuestas iguales, sin try/catch repetidos"] },
          { icono: "book-open", tono: "advertencia", celdas: ["Nombres del negocio", "Solicitud, enviar, TransicionNoPermitida", "El código se lee como el proceso real"] },
          { icono: "flask-conical", tono: "correcto", celdas: ["Pruebas y convenciones", "Una prueba por regla, ramas cortas y commits con formato", "Cambiar sin miedo, con un historial legible"] },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/dominio/ServicioDeSolicitudes.java",
        texto: "public class ServicioDeSolicitudes {      // sin anotaciones de Spring\n\n    private final RepositorioDeSolicitudes repositorio;       // interfaces,\n    private final PublicadorDeEventos publicador;             // no clases concretas\n    private final RegistradorDeEventosSalientes registrador;\n\n    public ServicioDeSolicitudes(RepositorioDeSolicitudes repositorio,\n                                 PublicadorDeEventos publicador,\n                                 RegistradorDeEventosSalientes registrador) {\n        this.repositorio = repositorio;   // todo llega por el constructor\n        this.publicador = publicador;\n        this.registrador = registrador;\n    }\n}",
      },
      guion: {
        decir: [
          "Un código mantenible es el que se puede cambiar sin miedo. Aplicamos seis prácticas sencillas.",
          "Cada clase tiene una sola responsabilidad: el controlador solo traduce HTTP, el servicio decide y el adaptador guarda. Las dependencias llegan por el constructor, así cualquier pieza se puede reemplazar o probar sola. Los datos son inmutables: cambiar de estado crea una solicitud nueva, en lugar de modificar la que había.",
          "Los errores se manejan en un solo lugar, los nombres son los del negocio, en español, y cada regla tiene su prueba. El resultado es que un cambio de regla toca un archivo, y una prueba nos dice si rompimos algo.",
        ],
        pregunta: { texto: "¿Esto no hace el código más largo?", respuesta: "Un poco, pero cada pieza es corta y se entiende sola; el costo se paga solo en el primer cambio." },
        transicion: "Esto es lo que aprendimos de los fundamentos.",
        respaldo: "docs/desarrollo/flujo-de-trabajo.md",
      },
    },
    {
      id: "s01-calidad",
      titulo: "Calidad que se comprueba sola",
      idea: "Cada regla tiene una prueba, y ninguna necesita una base de datos.",
      visible: ["Las reglas se prueban sin levantar Spring", "Un repositorio en memoria reemplaza a PostgreSQL", "MockMvc prueba los controladores sin servidor", "El pipeline corre todo en cada Pull Request"],
      recorridos: ["tecnico"],
      visual: {
        tipo: "tarjetas",
        tarjetas: [
          { icono: "list-checks", titulo: "SolicitudTest", texto: "Los cambios de estado permitidos y los prohibidos.", tono: "marino" },
          { icono: "flask-conical", titulo: "ServicioSolicitudesUnitTest", texto: "Crear, enviar y registrar el evento, en memoria.", tono: "cian" },
          { icono: "code", titulo: "SolicitudControllerWebTest", texto: "El JSON y los códigos 201, 400, 404 y 409.", tono: "violeta" },
          { icono: "fingerprint", titulo: "Pruebas de notificaciones", texto: "Un evento repetido genera un solo aviso.", tono: "correcto" },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/adaptadores/entrada/ManejadorGlobalDeErrores.java",
        texto: "@RestControllerAdvice\npublic class ManejadorGlobalDeErrores {\n\n    @ExceptionHandler(TransicionNoPermitida.class)\n    public ResponseEntity<ErrorRespuesta> transicionNoPermitida(\n            TransicionNoPermitida ex) {\n        return ResponseEntity.status(HttpStatus.CONFLICT)\n                .body(new ErrorRespuesta(409, ex.getMessage()));\n    }\n}",
      },
      guion: {
        decir: [
          "Como el dominio no depende de Spring, sus reglas se prueban en milisegundos. En lugar de PostgreSQL usamos un repositorio en memoria que cumple el mismo contrato, y los controladores los probamos con MockMvc, que simula peticiones HTTP sin levantar un servidor.",
          "Ninguna prueba necesita una base de datos, así que corren igual en cualquier computadora y en el pipeline.",
        ],
        demo: { accion: "./mvnw test en servicio-solicitudes.", evidencia: "Tests run: 28, Failures: 0." },
        transicion: "Esto es lo que nos llevamos de los fundamentos.",
      },
    },
    {
      id: "s01-aprendizajes",
      titulo: "Fundamentos: lo que aprendimos",
      visible: ["El negocio no depende del framework", "Los errores son parte del contrato", "Probar es barato si el diseño lo permite"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "67", titulo: "pruebas en cada cambio" }, { valor: "0", titulo: "bases de datos para probar" }],
        items: [
          { icono: "shield-check", titulo: "El negocio no depende del framework", texto: "Las reglas son clases Java sin Spring, inyectadas por constructor.", valor: "Se prueban en milisegundos y sobreviven a un cambio de framework." },
          { icono: "shield-alert", titulo: "Los errores son parte del contrato", texto: "Un manejador global responde 400, 404 y 409 con la misma forma.", valor: "Menos soporte: quien consume la API entiende qué pasó." },
          { icono: "layers", titulo: "Mantenible se diseña desde el inicio", texto: "Una responsabilidad por clase, inyección por constructor y records.", valor: "Cambios pequeños y localizados." },
          { icono: "git-pull-request", titulo: "Todo entra por Pull Request", texto: "Ramas cortas, commits con sentido y una aprobación.", valor: "Historial legible y ningún cambio sin revisar." },
        ],
      },
      guion: {
        decir: [
          "Cuatro aprendizajes de esta parte. Primero: el negocio no debe depender del framework. Mantener las reglas en clases Java simples nos permitió probarlas rápido y pensar en el negocio, no en las anotaciones.",
          "Segundo: los errores son parte del contrato. Un buen 409 con un mensaje claro ahorra muchas horas de soporte.",
          "Tercero: el código mantenible se diseña desde el inicio, con piezas pequeñas de una sola responsabilidad. Y cuarto: trabajar con ramas cortas y Pull Requests con aprobación nos dio un historial que cualquiera puede leer.",
        ],
        transicion: "Con esas bases, veamos cómo está armado el sistema completo.",
        respaldo: "docs/desarrollo/flujo-de-trabajo.md",
      },
    },
  ],
};

export const arquitectura: Seccion = {
  id: "s02",
  numero: 2,
  titulo: "Arquitectura",
  corto: "Arquitectura",
  subtitulo: "Microservicios, puertos y adaptadores, y un contrato por eventos.",
  temas: ["Microservicios", "Puertos y adaptadores", "De monolito a microservicios"],
  icono: "network",
  diapositivas: [
    {
      id: "s02-mapa",
      titulo: "El sistema de un vistazo",
      idea: "Cada capa tiene una sola responsabilidad.",
      visible: ["La UI es la puerta de entrada", "Dos servicios, cada uno dueño de su base", "Se hablan con un evento por HTTP", "La plataforma corre, entrega y observa"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "capas",
        capas: [
          { titulo: "Experiencia", tono: "violeta", elementos: [
            { icono: "user", titulo: "Persona", texto: "Usa el navegador" },
            { icono: "monitor", titulo: "arka-lite-ui", texto: "React + nginx · proxy /api" },
          ] },
          { titulo: "Servicios", tono: "marino", elementos: [
            { icono: "clipboard-list", titulo: "servicio-solicitudes", texto: "El trámite y sus estados" },
            { icono: "send", titulo: "Evento SolicitudEnviada", texto: "Por HTTP, con su eventoId", tono: "cian" },
            { icono: "bell", titulo: "servicio-notificaciones", texto: "Los avisos, sin duplicados", tono: "cian" },
          ] },
          { titulo: "Datos", tono: "neutro", elementos: [
            { icono: "database", titulo: "db-solicitudes", texto: "PostgreSQL 17 · solicitud y evento" },
            { icono: "database", titulo: "db-notificaciones", texto: "PostgreSQL 17 · evento_procesado" },
          ] },
          { titulo: "Plataforma", tono: "correcto", elementos: [
            { icono: "ship-wheel", titulo: "Compose o Kubernetes", texto: "Dónde corre" },
            { icono: "workflow", titulo: "GitHub Actions", texto: "Prueba y publica" },
            { icono: "chart-line", titulo: "Loki y Grafana", texto: "Logs en un solo lugar", tono: "advertencia" },
          ] },
        ],
      },
      guion: {
        decir: [
          "Este es el sistema por capas. Arriba, la experiencia: la persona usa la interfaz, y la interfaz no guarda nada, solo llama a los servicios por un proxy.",
          "En el medio, los dos microservicios. Solicitudes lleva el trámite; notificaciones crea los avisos. No comparten base: cada uno es dueño de sus datos, y se comunican con un evento por HTTP.",
          "Y abajo, la plataforma que lo sostiene: dónde corre, cómo se prueba y publica cada cambio, y dónde vemos los logs. Cada capa tiene una sola responsabilidad, y por eso cada una se puede cambiar sin romper las otras.",
        ],
        pregunta: { texto: "¿Por qué no comparten una sola base de datos?", respuesta: "Para que cada servicio sea dueño de sus datos y pueda cambiar sin romper al otro." },
        transicion: "¿Y cómo se conectan esas piezas entre sí?",
        respaldo: "docs/inicio/proyecto.md",
      },
    },
    {
      id: "s02-conexiones",
      titulo: "Cómo se conectan las piezas",
      visible: ["UI → solicitudes por /api", "Cada servicio → su propia base", "solicitudes → notificaciones con un evento", "UI → notificaciones para ver los avisos"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "arquitectura",
      guion: {
        decir: [
          "Sigamos los números. La persona usa la interfaz en su navegador. La interfaz llama a solicitudes por la ruta /api para crear, listar, enviar, aprobar o rechazar, y solicitudes guarda en su propia base.",
          "Cuando una solicitud se envía, solicitudes le avisa después a notificaciones con un evento por HTTP, y notificaciones anota en su base qué eventos ya recibió. Por último, la interfaz también consulta a notificaciones para mostrar los avisos.",
          "Fíjense en lo que no hay: ninguna flecha entre las dos bases. Los servicios solo se hablan por HTTP.",
        ],
        transicion: "Veamos cada conexión con más detalle.",
      },
    },
    {
      id: "s02-comunicacion",
      titulo: "Quién habla con quién, y cómo",
      idea: "Todo viaja por HTTP con JSON; cada pieza encuentra a la otra por su nombre.",
      visible: ["El navegador solo conoce la UI", "nginx reenvía /api al servicio", "El evento viaja después, desde el relevador", "Cada servicio habla solo con su base", "Se encuentran por nombre, no por IP", "El traceId acompaña cada llamada"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "matriz",
        encabezados: ["Conexión", "Cómo se habla", "Por qué así"],
        filas: [
          { icono: "monitor", tono: "violeta", celdas: ["Navegador → UI", "HTTP a localhost:8088; nginx sirve la página", "El navegador nunca conoce las direcciones internas"] },
          { icono: "route", tono: "violeta", celdas: ["UI → servicios", "nginx reenvía /api/solicitudes y /api/notificaciones", "Cambiar una dirección no obliga a tocar la UI"] },
          { icono: "send", tono: "cian", celdas: ["solicitudes → notificaciones", "POST del evento SolicitudEnviada en JSON, desde el relevador", "Si notificaciones cae, solicitudes sigue funcionando"] },
          { icono: "database", tono: "neutro", celdas: ["Servicio → su base", "JDBC a db-solicitudes:5432 o db-notificaciones", "Cada servicio es dueño de sus datos"] },
          { icono: "network", tono: "correcto", celdas: ["Cómo se encuentran", "Por nombre: la red de Compose o un Service de Kubernetes", "Sin IPs fijas: funciona igual en cualquier ambiente"] },
          { icono: "waypoints", tono: "advertencia", celdas: ["Seguimiento", "El traceId viaja en la cabecera de cada llamada HTTP", "Una sola búsqueda en Grafana sigue todo el recorrido"] },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/adaptadores/salida/PublicadorConReintento.java",
        texto: "public PublicadorConReintento(\n        @Value(\"${notificaciones.url}\") String url,   // NOTIFICACIONES_URL\n        RestClient restClientTrazada) {                // propaga el traceId\n    this.url = url;\n    this.rest = restClientTrazada;\n}\n\n// en publicar(evento): hasta 3 intentos\nrest.post()\n    .uri(url)          // http://servicio-notificaciones:8080/eventos/solicitud-enviada\n    .body(evento)      // {\"eventoId\": \"…\", \"id\": \"…\", \"tipo\": \"…\"}\n    .retrieve()\n    .toBodilessEntity();",
      },
      guion: {
        decir: [
          "Esta tabla resume todas las conexiones. El navegador solo conoce la interfaz. La interfaz no llama directo a los servicios: nginx recibe todo lo que empieza con /api y lo reenvía al servicio que corresponde.",
          "Entre servicios, solicitudes manda el evento a notificaciones con un POST en JSON, pero no en el momento de la petición: lo hace el relevador, después. Por eso, si notificaciones se cae, solicitudes sigue funcionando.",
          "Cada servicio habla solo con su propia base. Y nadie usa direcciones IP: se encuentran por nombre, gracias a la red de Docker Compose o a los Services de Kubernetes. En cada llamada viaja además un traceId, que nos permite seguir el recorrido completo en los logs.",
        ],
        pregunta: { texto: "¿Por qué no se llaman directamente por localhost?", respuesta: "Porque dentro de un contenedor localhost es el mismo contenedor; por eso cada servicio se busca por su nombre." },
        transicion: "Hay dos formas de hablarse, y usamos las dos.",
      },
    },
    {
      id: "s02-sincrono",
      titulo: "Síncrono o asíncrono",
      idea: "Lo que la persona necesita ver, se responde ya; lo que puede esperar, se avisa después.",
      visible: ["Síncrono: pido y espero la respuesta", "Asíncrono: guardo, respondo y aviso después", "La UI usa síncrono; el evento, asíncrono", "Lo asíncrono aguanta que el otro esté caído"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "contraste",
        lados: [
          { titulo: "Síncrono: pido y espero", icono: "arrow-right", tono: "marino", puntos: ["La UI llama y espera la respuesta", "Crear, listar, aprobar o rechazar", "Respuesta inmediata: 201, 404, 409", "Si el servicio está caído, la persona ve el error"] },
          { titulo: "Asíncrono: aviso después", icono: "mail", tono: "cian", puntos: ["Solicitudes guarda el evento y responde ya", "El relevador lo entrega cada 5 segundos", "Si notificaciones cae, el evento espera", "Mismo contrato JSON: SolicitudEnviada"] },
        ],
      },
      guion: {
        decir: [
          "Hay dos formas de comunicarse. Síncrona: pido y espero la respuesta, como una llamada telefónica. Es lo que hace la interfaz al crear o aprobar una solicitud, porque la persona necesita saber el resultado en ese momento.",
          "Asíncrona: dejo el mensaje y sigo, como un correo. Es lo que hace solicitudes con notificaciones: guarda el evento, responde enseguida y el relevador lo entrega después.",
          "La regla que aprendimos: lo que la persona necesita ver, síncrono; lo que puede esperar, asíncrono. Así una caída de notificaciones no afecta a quien está usando solicitudes.",
        ],
        transicion: "Ahora entremos a uno de los servicios.",
      },
    },
    {
      id: "s02-completa",
      titulo: "La arquitectura completa",
      visible: ["Compose o Kubernetes", "Outbox y consumo idempotente", "Entrega continua", "Logs con traceId"],
      recorridos: ["tecnico"],
      diagrama: "macro",
      guion: {
        decir: [
          "Para el equipo técnico, el mismo sistema con todo el detalle. Los números de las flechas siguen el orden de los pasos de abajo: la petición entra por nginx, el dominio guarda la solicitud y el evento en una transacción, el relevador lo entrega y notificaciones lo consume de forma idempotente.",
          "Abajo, la entrega continua y la observabilidad: los logs de todos los contenedores llegan a Grafana con su traceId.",
        ],
        transicion: "Veamos cómo se organiza el código por dentro.",
      },
    },
    {
      id: "s02-hexagonal",
      titulo: "Por dentro: puertos y adaptadores",
      idea: "Hexagonal: el negocio al centro y cada tecnología conectada por un enchufe (puerto).",
      visible: ["Entrada: traduce HTTP al dominio", "Dominio: las reglas, sin Spring", "Puertos: contratos que el dominio necesita", "Salida: PostgreSQL y HTTP, intercambiables"],
      comparacion: "Como un enchufe: el aparato no sabe de qué planta viene la electricidad, solo que el enchufe cumple la norma.",
      iconoComparacion: "plug",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "hexagono",
        centro: { icono: "puzzle", titulo: "Dominio", texto: "Solicitud · ServicioDeSolicitudes" },
        puertos: ["RepositorioDeSolicitudes", "RegistradorDeEventosSalientes", "PublicadorDeEventos"],
        entrada: [
          { icono: "code", titulo: "SolicitudController", texto: "REST · Swagger", tono: "violeta" },
          { icono: "shield-alert", titulo: "Manejador global", texto: "Errores → HTTP", tono: "violeta" },
        ],
        salida: [
          { icono: "database", titulo: "RepositorioJpa", texto: "@Primary · PostgreSQL", tono: "marino" },
          { icono: "inbox", titulo: "Bandeja de salida", texto: "Tabla evento", tono: "marino" },
          { icono: "send", titulo: "PublicadorConReintento", texto: "@Primary · HTTP", tono: "cian" },
          { icono: "flask-conical", titulo: "RepositorioEnMemoria", texto: "Para las pruebas", tono: "neutro" },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/config/ConfiguracionDominio.java",
        texto: "@Bean\nServicioDeSolicitudes servicioDeSolicitudes(\n        RepositorioDeSolicitudes repositorio,      // RepositorioJpa (@Primary)\n        PublicadorDeEventos publicador,            // PublicadorConReintento (@Primary)\n        RegistradorDeEventosSalientes registrador) {\n    return new ServicioDeSolicitudes(repositorio, publicador, registrador);\n}",
      },
      guion: {
        decir: [
          "¿Qué quiere decir hexagonal? El nombre viene del dibujo: un hexágono con el negocio al centro y cada lado como un enchufe hacia afuera. También se le llama puertos y adaptadores. El dominio no llama a la base: pide lo que necesita a través de puertos, que son interfaces.",
          "Para quien trabaja con procedimientos almacenados es una idea conocida: la aplicación llama a un procedimiento por su nombre y sus parámetros, sin saber cómo está escrito por dentro. Aquí es al revés: el negocio declara qué necesita, y la tecnología se enchufa a ese contrato.",
          "A la izquierda están los adaptadores de entrada, como el controlador REST. A la derecha, los de salida: el que guarda en PostgreSQL, el que anota el evento pendiente y el que lo publica con reintentos.",
          "Fíjense en el de abajo: un repositorio en memoria que cumple el mismo puerto. Lo usan las pruebas, y Spring elige el que usa la aplicación real con @Primary. Por eso cambiar la base o el mecanismo de entrega no obliga a tocar las reglas del negocio.",
        ],
        pregunta: { texto: "¿Esto no es más código que una aplicación en capas tradicional?", respuesta: "Un poco más de interfaces, a cambio de probar sin base y cambiar adaptadores sin tocar reglas." },
        transicion: "¿Y por qué dos servicios y no uno solo?",
        respaldo: "docs/arquitectura/componentes-java.md",
      },
    },
    {
      id: "s02-separar",
      titulo: "¿Monolito o microservicios?",
      idea: "Separar se decide por el negocio, no por moda.",
      visible: ["Separar agrega red, bases propias y fallos parciales", "Se decide por negocio, equipos y operación", "En ARKA-Lite separamos para aprender esas fronteras"],
      recorridos: ["tecnico"],
      visual: {
        tipo: "contraste",
        lados: [
          { titulo: "Conviene un monolito", icono: "box", tono: "neutro", puntos: ["Las partes cambian juntas", "Se publica todo junto", "La carga es pareja", "Un equipo pequeño lo mantiene"] },
          { titulo: "Conviene separar", icono: "boxes", tono: "cian", puntos: ["Responsabilidades claramente distintas", "Una parte necesita salir sola", "Una parte necesita más recursos", "Un equipo dueño de cada parte"] },
        ],
      },
      codigo: { lenguaje: "java", archivo: "servicio-*/…/eventos/SolicitudEnviada.java", texto: "// Copiado en ambos servicios: es el contrato HTTP\npublic record SolicitudEnviada(String eventoId, String id, String tipo) {}" },
      guion: {
        decir: [
          "Separar no es gratis: agrega red entre servicios, una base por servicio y fallos parciales, cuando uno está arriba y el otro caído. La decisión se toma por negocio, despliegue, carga y equipos, no por moda.",
          "En ARKA-Lite el trámite y los avisos cambian por motivos distintos, así que los separamos y los unimos con un contrato: el evento SolicitudEnviada, copiado en los dos proyectos.",
        ],
        transicion: "Esto es lo que aprendimos de la arquitectura.",
      },
    },
    {
      id: "s02-aprendizajes",
      titulo: "Arquitectura: lo que aprendimos",
      visible: ["Los puertos separan negocio y tecnología", "Separar servicios tiene un costo", "El contrato entre servicios se versiona con cuidado"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "3", titulo: "puertos en solicitudes" }, { valor: "2", titulo: "adaptadores por puerto" }],
        items: [
          { icono: "plug", titulo: "Los puertos separan negocio y tecnología", texto: "Varios adaptadores por puerto; Spring usa el @Primary.", valor: "Cambiar la base o la mensajería sin reescribir reglas." },
          { icono: "scale", titulo: "Separar servicios tiene un costo", texto: "Red, bases propias y fallos parciales.", valor: "Separar solo cuando el negocio o los equipos lo justifican." },
          { icono: "send", titulo: "Síncrono para ver, asíncrono para avisar", texto: "La UI espera la respuesta; el evento se entrega después.", valor: "Una caída parcial no detiene a quien usa el sistema." },
          { icono: "file-json", titulo: "El contrato es lo único compartido", texto: "SolicitudEnviada vive en los dos servicios y cambia junto.", valor: "Equipos independientes con un acuerdo explícito." },
        ],
      },
      guion: {
        decir: [
          "Primero: los puertos separan el negocio de la tecnología. Hoy usamos PostgreSQL y HTTP, pero cambiar a otra base o a un sistema de mensajería no obligaría a reescribir las reglas.",
          "Segundo: separar servicios tiene un costo real. Lo vale cuando el negocio o los equipos lo piden, no antes.",
          "Tercero: síncrono para lo que la persona necesita ver y asíncrono para lo que puede esperar. Y cuarto: entre dos servicios, lo único compartido debe ser el contrato. Si cambia, cambia en los dos lados, de forma coordinada.",
        ],
        transicion: "El costo más interesante de separar está en los datos. Vamos a la base de datos.",
      },
    },
  ],
};

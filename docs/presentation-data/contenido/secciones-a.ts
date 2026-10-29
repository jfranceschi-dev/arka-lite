import type { Seccion } from "./tipos.ts";

// Apertura y partes 1 y 2. Los textos "decir" están escritos para decirse en
// voz alta, en español neutro de Panamá, para un público de staff de
// tecnología. Todos los equipos presentan las mismas secciones; el equipo
// anterior profundiza en fundamentos y arquitectura hexagonal, así que aquí
// esas dos partes van en vista general y cortas. [clic] marca el momento de
// hacer clic para que aparezca la siguiente pieza del diagrama.

export const apertura: Seccion = {
  id: "s00",
  numero: null,
  titulo: "Apertura",
  corto: "Apertura",
  rol: "orquestador",
  diapositivas: [
    {
      id: "s00-portada",
      titulo: "Del endpoint al clúster",
      visible: ["Cómo construimos dos microservicios con sus datos, su plataforma y su operación."],
      valor: "En 40 minutos, prácticas que pueden aplicar en sus propios sistemas, no solo teoría.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      // Las cifras de la portada. El nombre del equipo va en el rótulo de arriba.
      visual: {
        tipo: "cifras",
        cifras: [
          { valor: "2", icono: "server", titulo: "microservicios" },
          { valor: "2", icono: "database", titulo: "bases PostgreSQL" },
          { valor: "1", icono: "terminal", titulo: "comando levanta todo" },
          { valor: "0", icono: "fingerprint", titulo: "avisos perdidos o duplicados" },
        ],
      },
      guion: {
        decir: [
          "Buenos días a todos. Somos el equipo arka-litos, del curso Upskilling Backend Java, y hoy les presentamos ARKA-Lite, nuestro proyecto final.",
          "Somos un equipo de tres áreas, las mismas que tienen ustedes: desarrollo, base de datos e infraestructura, y cada parte la presenta quien la construyó. A mí, que vengo de desarrollo y conozco el negocio de punta a punta, me toca abrir, conectar las partes y cerrar.",
          "El título lo resume: empezamos escribiendo un endpoint, una sola operación en Java, y terminamos con un sistema completo corriendo en un clúster de Kubernetes, con sus bases de datos, su pipeline y su monitoreo.",
          "El equipo anterior ya les explicó los fundamentos y la arquitectura. Nosotros les vamos a contar el proyecto desde la práctica, con diagramas y una demostración en vivo, y nos vamos a enfocar en lo que les puede servir en su día a día: cómo se cuidan los datos, cómo se hablan los sistemas y cómo se despliega y se opera todo.",
        ],
        instrucciones: [
          "Antes de empezar, abrir la UI (http://localhost:8088, o el puerto 8088 del Codespace) y comprobar que los dos servicios aparecen en verde. Guía del Codespace: docs/operaciones/codespaces.md.",
          "Tener abiertas en otras pestañas Grafana (http://localhost:3000) y la carpeta k8s/ del repositorio, por si preguntan.",
          "Cada diagrama se arma con clics: en el texto, ▶ CLIC marca el momento de hacer clic.",
        ],
        transicion: "Este es el recorrido.",
      },
    },
    {
      id: "s00-agenda",
      titulo: "Qué vamos a ver",
      idea: "Las mismas secciones que todos los equipos; nosotros vamos a fondo en datos, interconexión y DevOps.",
      visible: ["Fundamentos y arquitectura: vista general", "Base de datos: a fondo", "Interconexión de servicios: a fondo", "DevOps con Docker y Kubernetes: a fondo", "Observabilidad y demostración en vivo"],
      valor: "Saber desde el inicio dónde vamos a profundizar y qué se van a llevar.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: { tipo: "ruta" },
      guion: {
        decir: [
          "Todos los equipos presentamos las mismas secciones, pero cada uno profundiza en algunas para no repetirnos. El equipo anterior se enfocó en los fundamentos y en la arquitectura hexagonal, así que esas dos partes las vamos a ver rápido, en vista general.",
          "[clic] Donde vamos a fondo es en tres temas que tocan directo el trabajo de ustedes: la base de datos, cómo se comunican los servicios sin perder información, y DevOps, con Docker, Kubernetes y el pipeline. [clic] Después, una mirada general a la observabilidad, [clic] y cerramos con una demostración en vivo: vamos a tumbar un servicio a propósito para que vean cómo se comporta el sistema.",
          "Al final de cada parte les dejamos lo que aprendimos y cómo se puede aplicar en cualquier proyecto, también en los que usan procedimientos almacenados.",
        ],
        transicion: "Empecemos por los fundamentos, y por lo primero: el qué.",
      },
    },
  ],
};

export const fundamentos: Seccion = {
  id: "s01",
  numero: 1,
  titulo: "Fundamentos",
  corto: "Fundamentos",
  subtitulo: "Primero el qué, después el cómo: el negocio claro y buenas prácticas que sirven en cualquier lenguaje.",
  temas: ["Primero el qué", "Código mantenible", "Git y documentación"],
  icono: "code",
  enfoque: "general",
  rol: "fundamentos",
  diapositivas: [
    {
      id: "s01-negocio",
      titulo: "Primero el qué: el negocio en una lámina",
      idea: "Antes de escribir código, entendimos qué tiene que pasar, quién lo hace y qué no se permite.",
      visible: ["Quien solicita registra la solicitud", "La envía cuando está lista", "El sistema le avisa a quien debe atenderla", "Alguien la aprueba o la rechaza", "Saltarse un paso no se permite"],
      valor: "Pensar primero en el qué y después en el cómo: las reglas claras hacen el código simple.",
      rol: "orquestador",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "user", titulo: "Quien solicita", texto: "Registra qué necesita y de qué tipo.", tono: "violeta" },
          { icono: "send", titulo: "La envía", texto: "Cuando está lista.", tono: "marino" },
          { icono: "bell", titulo: "El sistema avisa", texto: "A quien debe atenderla.", tono: "cian" },
          { icono: "circle-check", titulo: "Alguien decide", texto: "La aprueba o la rechaza.", tono: "correcto" },
        ],
        desvio: { desde: 1, etiqueta: "si se salta un paso", elemento: { icono: "ban", titulo: "No se permite", texto: "Enviar dos veces o decidir sobre un borrador: el sistema explica por qué.", tono: "error" } },
      },
      guion: {
        decir: [
          "Antes de entrar a la tecnología, el aprendizaje más importante de los fundamentos: primero pensamos en el qué y después en el cómo. ¿Qué tiene que pasar, quién lo hace y qué no se puede permitir? Este es el negocio, en una lámina. Alguien registra una solicitud, por ejemplo una incidencia o un pedido de cambio: qué necesita y de qué tipo.",
          "[clic] Cuando está lista, la envía. [clic] En ese momento, el sistema le avisa a quien debe atenderla. [clic] Y esa persona la aprueba o la rechaza: es la decisión final.",
          "[clic] Igual de importante es lo que no se permite: enviar dos veces la misma solicitud, o aprobar una que todavía nadie ha enviado. El sistema no lo hace y explica por qué. Esas son las reglas del negocio, y con ellas claras, el código salió simple: un servicio para las solicitudes y otro para los avisos.",
        ],
        preguntas: [{ texto: "¿Por qué los avisos van en otro servicio?", respuesta: "Porque cambian por motivos distintos, y así el trámite sigue funcionando aunque el servicio de avisos esté caído." }],
        transicion: "Con el qué claro, el cómo: código que se pueda cambiar sin miedo.",
        respaldo: "docs/inicio/proyecto.md",
      },
    },
    {
      id: "s01-practicas",
      titulo: "Código mantenible: buenas prácticas",
      idea: "Después, el cómo: seis prácticas que hacen que un cambio toque un solo lugar, en cualquier lenguaje.",
      visible: ["Una tarea por pieza", "Las piezas se conectan, no se fabrican adentro", "Las reglas viven en un solo lugar", "Errores con respuesta clara", "Nombres del negocio", "Cada regla con su prueba"],
      valor: "Cuando cambia una regla, se toca un solo lugar y una prueba confirma que nada se rompió.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "tarjetas",
        columnas: 3,
        tarjetas: [
          { icono: "layers", titulo: "Una tarea por pieza", texto: "Quien recibe la petición no decide; quien decide no guarda.", tono: "marino" },
          { icono: "plug", titulo: "Piezas que se conectan", texto: "Cada pieza recibe lo que necesita: se cambia o se prueba sola.", tono: "cian" },
          { icono: "puzzle", titulo: "Reglas en un solo lugar", texto: "El negocio vive junto, lejos de la pantalla y de la base.", tono: "violeta" },
          { icono: "shield-alert", titulo: "Errores con respuesta clara", texto: "Siempre el mismo formato: 400, 404 o 409 con su motivo.", tono: "error" },
          { icono: "book-open", titulo: "Nombres del negocio", texto: "Solicitud, enviar, aprobar: el código se lee como el proceso.", tono: "advertencia" },
          { icono: "flask-conical", titulo: "Cada regla con su prueba", texto: "Una prueba automática avisa si un cambio rompió algo.", tono: "correcto" },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/dominio/ServicioDeSolicitudes.java",
        texto: "public class ServicioDeSolicitudes {      // sin anotaciones de Spring\n\n    private final RepositorioDeSolicitudes repositorio;       // interfaces,\n    private final PublicadorDeEventos publicador;             // no clases concretas\n    private final RegistradorDeEventosSalientes registrador;\n\n    public ServicioDeSolicitudes(RepositorioDeSolicitudes repositorio,\n                                 PublicadorDeEventos publicador,\n                                 RegistradorDeEventosSalientes registrador) {\n        this.repositorio = repositorio;   // todo llega por el constructor\n        this.publicador = publicador;\n        this.registrador = registrador;\n    }\n}",
      },
      guion: {
        decir: [
          "Con el qué claro, viene el cómo. El equipo anterior ya cubrió los fundamentos, así que nos quedamos con seis prácticas que nos sirvieron y que se pueden usar en cualquier lenguaje, sea Java, C#, Python o PL/SQL. Primera: cada pieza hace una sola tarea; la que recibe la petición no decide, y la que decide no guarda.",
          "[clic] Segunda: las piezas se conectan desde afuera, así se pueden cambiar o probar por separado. [clic] Tercera: las reglas del negocio viven en un solo lugar, no repetidas en la pantalla y en la base. [clic] Cuarta: los errores responden siempre igual: un 400 si faltan datos, un 404 si algo no existe, un 409 si la regla no lo permite.",
          "[clic] Quinta: los nombres son los del negocio, así el código se lee como el proceso. [clic] Y sexta: cada regla tiene una prueba automática que avisa si un cambio rompió algo. El resultado: cuando cambia una regla, se toca un solo lugar.",
        ],
        preguntas: [{ texto: "¿Esto no hace el código más largo?", respuesta: "Un poco más de piezas, pero cada una es corta y se entiende sola. El costo se recupera en el primer cambio." }],
        transicion: "Y como somos varios trabajando sobre el mismo código, también necesitamos orden.",
        respaldo: "docs/desarrollo/flujo-de-trabajo.md",
      },
    },
    {
      id: "s01-trabajo",
      titulo: "Trabajo en equipo: Git y documentación",
      idea: "Todo cambio entra revisado, probado y documentado.",
      visible: ["Una rama corta por tarea", "Cada commit dice qué cambió", "Entra a main solo por Pull Request", "La documentación viaja en el mismo cambio"],
      valor: "Nada llega a la rama principal sin revisión, pruebas y documentación.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "ramas",
        principal: "main",
        rama: "feat/crear-solicitud-por-post",
        commits: ["feat: crear solicitud", "test: 409 si ya existe", "docs: el nuevo POST"],
        fusion: "Pull Request: revisión, pruebas en verde y documentación",
      },
      guion: {
        decir: [
          "Muy rápido, cómo trabajamos en equipo. Cada tarea se hace en una rama corta, y cada commit dice qué cambió: una funcionalidad, una prueba, la documentación.",
          "[clic] El cambio entra a la rama principal solo por un Pull Request: otra persona lo revisa, las pruebas tienen que pasar y la documentación se actualiza en ese mismo cambio. La documentación de la API, además, la genera Swagger desde el código, así que nunca queda vieja.",
        ],
        transicion: "Esto es lo que nos llevamos de los fundamentos.",
        respaldo: "docs/desarrollo/git.md",
      },
    },
    {
      id: "s01-aprendizajes",
      titulo: "Fundamentos: lo que nos llevamos a cualquier proyecto",
      visible: ["Primero el qué, después el cómo", "Separar responsabilidades paga en el primer cambio", "Las reglas no dependen de la herramienta", "Todo cambio entra revisado"],
      valor: "Cuatro hábitos que bajan el costo de mantener cualquier sistema.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "6", titulo: "prácticas que sirven en cualquier lenguaje" }, { valor: "4", titulo: "respuestas claras: 201, 400, 404 y 409" }],
        items: [
          { icono: "target", titulo: "Primero el qué, después el cómo", texto: "Qué tiene que pasar, quién lo hace y qué no se permite.", valor: "Reglas claras antes de elegir la tecnología." },
          { icono: "layers", titulo: "Separar responsabilidades paga pronto", texto: "Pantalla, reglas y datos en piezas distintas.", valor: "Un cambio de regla toca un solo lugar." },
          { icono: "shield-check", titulo: "Las reglas no dependen de la herramienta", texto: "El negocio no sabe si detrás hay una base, una web o un framework.", valor: "Se prueba rápido y sobrevive a un cambio de tecnología." },
          { icono: "git-pull-request", titulo: "Todo cambio entra revisado", texto: "Ramas cortas, revisión, pruebas y documentación juntas.", valor: "Menos sorpresas en producción." },
        ],
      },
      guion: {
        decir: [
          "Lo que nos llevamos a cualquier proyecto. [clic] Primero el qué, después el cómo: con las reglas del negocio claras, la tecnología se elige mejor y el código sale más simple. [clic] Separar responsabilidades se paga desde el primer cambio.",
          "[clic] Las reglas no deben depender de la herramienta: si mañana cambia la base o el framework, las reglas siguen iguales. [clic] Y ningún cambio entra sin revisión, pruebas y documentación.",
        ],
        transicion: "Con esa base, veamos el sistema completo desde arriba.",
      },
    },
  ],
};

export const arquitectura: Seccion = {
  id: "s02",
  numero: 2,
  titulo: "Arquitectura",
  corto: "Arquitectura",
  subtitulo: "El sistema por fuera: qué piezas hay y cómo trabajan juntas.",
  temas: ["Microservicios", "Una base por servicio", "Hexagonal en una frase"],
  icono: "network",
  enfoque: "general",
  rol: "arquitectura",
  diapositivas: [
    {
      id: "s02-mapa",
      titulo: "El sistema de un vistazo",
      idea: "Cada capa tiene una sola responsabilidad.",
      visible: ["La UI es la puerta de entrada", "Dos servicios, cada uno dueño de su base", "Entre servicios solo viajan datos", "La plataforma corre, entrega y observa"],
      valor: "Cada capa se puede cambiar sin romper las otras.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "capas",
        capas: [
          { titulo: "Experiencia", tono: "violeta", elementos: [
            { icono: "user", titulo: "Persona", texto: "Usa el navegador" },
            { icono: "monitor", titulo: "arka-lite-ui", texto: "La pantalla · reenvía /api" },
          ] },
          { titulo: "Servicios", tono: "marino", elementos: [
            { icono: "clipboard-list", titulo: "servicio-solicitudes", texto: "El trámite y sus estados" },
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
          "Gracias. ARKA-Lite no es una aplicación grande: son piezas pequeñas, cada una con una responsabilidad. Arriba está la experiencia: la persona usa la interfaz, y la interfaz no guarda nada, solo les pasa las peticiones a los servicios.",
          "[clic] En el medio, los dos microservicios: solicitudes lleva el trámite y sus estados; notificaciones crea los avisos. [clic] Debajo, cada uno con su propia base PostgreSQL; ninguno lee la base del otro. [clic] Y abajo, la plataforma: dónde corre, cómo se prueba cada cambio y dónde se ven los logs.",
        ],
        preguntas: [{ texto: "¿Por qué no comparten una sola base de datos?", respuesta: "Para que cada servicio sea dueño de sus datos y pueda cambiar sin romper al otro." }],
        transicion: "Ahora veamos cómo trabajan juntas esas piezas en la práctica.",
        respaldo: "docs/inicio/proyecto.md",
      },
    },
    {
      id: "s02-practica",
      titulo: "Cómo funciona en la práctica",
      idea: "Seis conexiones, y ninguna une las dos bases.",
      visible: ["La persona usa la UI", "La UI le pide el trabajo a cada servicio", "Cada servicio guarda en su propia base", "Solicitudes avisa con un evento: un dato, no una pieza"],
      valor: "Los sistemas se comunican con mensajes claros, no compartiendo tablas.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "sistema",
        persona: { icono: "user", titulo: "Persona", texto: "En el navegador" },
        ui: { icono: "monitor", titulo: "La UI", texto: "arka-lite-ui · :8088", tono: "violeta" },
        servicios: [
          { icono: "clipboard-list", titulo: "Solicitudes", texto: "El trámite y sus estados · :8080", tono: "marino" },
          { icono: "bell", titulo: "Notificaciones", texto: "Los avisos · :8081", tono: "cian" },
        ],
        bases: [
          { icono: "database", titulo: "db-solicitudes", texto: "PostgreSQL 17", tono: "marino" },
          { icono: "database", titulo: "db-notificaciones", texto: "PostgreSQL 17", tono: "cian" },
        ],
        conexiones: ["usa", "crea, envía y decide", "guarda", "avisa después", "anota lo recibido", "consulta los avisos"],
        evento: "SolicitudEnviada: eventoId, id y tipo",
        nota: "Ninguna flecha une las dos bases: cada servicio es dueño de sus datos.",
      },
      guion: {
        decir: [
          "Ahora, cómo trabajan juntas en la práctica. Sigamos los números. [clic] Uno: la persona usa la interfaz. [clic] Dos: cuando crea, envía o decide una solicitud, la interfaz se lo pide al servicio de solicitudes. [clic] Tres: solicitudes lo guarda en su propia base.",
          "[clic] Cuatro, el paso más importante: cuando una solicitud se envía, solicitudes le avisa a notificaciones. Fíjense en que esa flecha no es una pieza del sistema: es un dato que viaja, un mensaje pequeño con el número del evento, la solicitud y su tipo.",
          "[clic] Cinco: notificaciones crea el aviso y anota que ya recibió ese evento. [clic] Seis: la interfaz le consulta a notificaciones para mostrar los avisos.",
          "[clic] Y lo que no hay también dice mucho: ninguna flecha une las dos bases. Si un servicio necesita algo del otro, se lo pide; nunca entra a su base.",
        ],
        preguntas: [{ texto: "¿Qué pasa si notificaciones está caído en el paso cuatro?", respuesta: "Solicitudes sigue funcionando y el aviso espera guardado. Lo vemos en la parte de interconexión y en la demostración." }],
        transicion: "¿Y cómo está ordenado cada servicio por dentro?",
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
      titulo: "Por dentro de cada servicio: hexagonal",
      idea: "Una forma de ordenar el código por dentro; no cambia cómo se despliega.",
      visible: ["Las reglas del negocio al centro", "La web entra por un lado", "La base y los otros servicios salen por el otro", "Por fuera sigue siendo un servicio en su contenedor"],
      comparacion: "Como un enchufe: el aparato funciona con cualquier toma que cumpla la norma, sin saber de qué planta viene la electricidad.",
      iconoComparacion: "plug",
      valor: "Cambiar la base o la forma de avisar sin tocar las reglas del negocio.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "hexagono",
        centro: { icono: "puzzle", titulo: "Reglas del negocio", texto: "La solicitud y sus estados" },
        puertos: ["Guardar solicitudes", "Anotar el evento", "Avisar a otros"],
        entrada: [
          { icono: "globe", titulo: "API REST", texto: "La web entra aquí", tono: "violeta" },
          { icono: "shield-alert", titulo: "Errores claros", texto: "400 · 404 · 409", tono: "violeta" },
        ],
        salida: [
          { icono: "database", titulo: "PostgreSQL", texto: "Con el ORM", tono: "marino" },
          { icono: "inbox", titulo: "Bandeja de salida", texto: "Tabla evento", tono: "marino" },
          { icono: "send", titulo: "HTTP", texto: "Hacia notificaciones", tono: "cian" },
          { icono: "flask-conical", titulo: "En memoria", texto: "Para las pruebas", tono: "neutro" },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/config/ConfiguracionDominio.java",
        texto: "@Bean\nServicioDeSolicitudes servicioDeSolicitudes(\n        RepositorioDeSolicitudes repositorio,      // RepositorioJpa (@Primary)\n        PublicadorDeEventos publicador,            // PublicadorConReintento (@Primary)\n        RegistradorDeEventosSalientes registrador) {\n    return new ServicioDeSolicitudes(repositorio, publicador, registrador);\n}",
      },
      guion: {
        decir: [
          "Como explicó el equipo anterior, la arquitectura hexagonal es una forma de ordenar el código por dentro. No cambia cómo se despliega: por fuera, cada servicio sigue siendo una aplicación en su contenedor. Al centro van las reglas del negocio y los contratos que necesitan, como guardar una solicitud o avisar que se envió.",
          "[clic] Por un lado entra la web. [clic] Por el otro salen la base de datos y las llamadas a otros servicios, conectadas como enchufes. Fíjense en la última: una versión en memoria que reemplaza a la base en las pruebas. Gracias a eso probamos todas las reglas sin levantar PostgreSQL.",
        ],
        preguntas: [{ texto: "¿Esto se parece a llamar un procedimiento almacenado?", respuesta: "En que quien llama solo conoce el nombre y los parámetros, no cómo está hecho por dentro. La diferencia es que aquí el negocio define el contrato y la base se adapta a él." }],
        transicion: "Esto es lo que nos dejó la arquitectura.",
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
          "Separar no es gratis: agrega red entre servicios, una base por servicio y fallos parciales, cuando uno está arriba y el otro caído. Conviene un monolito cuando las partes cambian juntas y las mantiene un equipo pequeño.",
          "[clic] Conviene separar cuando las responsabilidades son distintas. En ARKA-Lite el trámite y los avisos cambian por motivos distintos, así que los separamos y los unimos con un contrato: el evento SolicitudEnviada, copiado en los dos proyectos.",
        ],
        transicion: "Esto es lo que aprendimos de la arquitectura.",
      },
    },
    {
      id: "s02-aprendizajes",
      titulo: "Arquitectura: lo que aprendimos",
      visible: ["Cada servicio es dueño de sus datos", "Entre servicios viajan datos, no tablas", "Hexagonal ordena por dentro, no cambia el despliegue", "Separar tiene un costo"],
      valor: "Sistemas que cambian por separado, unidos por acuerdos claros.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "2", titulo: "servicios, cada uno con su base" }, { valor: "0", titulo: "tablas compartidas entre servicios" }],
        items: [
          { icono: "database", titulo: "Cada servicio, dueño de sus datos", texto: "Nadie lee ni escribe en la base del otro.", valor: "Cada uno cambia sin romper al otro." },
          { icono: "send", titulo: "Entre servicios viajan datos", texto: "Un evento pequeño con su número: SolicitudEnviada.", valor: "Un acuerdo claro y fácil de revisar." },
          { icono: "hexagon", titulo: "Hexagonal ordena por dentro", texto: "No cambia el despliegue: un contenedor por servicio.", valor: "Cambiar la base o la web sin tocar las reglas." },
          { icono: "scale", titulo: "Separar tiene un costo", texto: "Más red, dos bases y fallas parciales.", valor: "Separar solo cuando el negocio lo pide." },
        ],
      },
      guion: {
        decir: [
          "Cuatro aprendizajes de arquitectura. [clic] Cada servicio es dueño de sus datos. [clic] Entre servicios no se comparten tablas, se comparten mensajes.",
          "[clic] Hexagonal ordena el código por dentro, pero no cambia el despliegue. [clic] Y separar en microservicios tiene un costo real, así que se hace cuando el negocio lo justifica, no por moda.",
        ],
        transicion: "Y aquí empieza la parte en la que vamos a fondo: la base de datos.",
      },
    },
  ],
};

import type { Seccion } from "./tipos.ts";

// Apertura y partes 1 y 2. Los textos "decir" están escritos para decirse en
// voz alta, en español neutro de Panamá, para un público técnico y no técnico.
// Todos los equipos presentan las mismas secciones. El equipo anterior
// profundiza en fundamentos, Spring Boot y Java, así que aquí esas dos partes
// solo cuentan lo que nos quedó; el público ya vio cómo funcionan. "conTusPalabras" deja las ideas en frases
// cortas, para quien prefiera parafrasear en lugar de aprenderse el texto.

export const apertura: Seccion = {
  id: "s00",
  numero: null,
  titulo: "Apertura",
  corto: "Apertura",
  rol: "apertura",
  diapositivas: [
    {
      id: "s00-portada",
      titulo: "Del endpoint al clúster",
      visible: ["Cómo construimos dos microservicios con sus datos, su plataforma y su operación."],
      valor: "Prácticas que pueden aplicar en sus propios sistemas, no solo teoría.",
      // Las cifras de la portada. El nombre del equipo va en el rótulo de arriba.
      visual: {
        tipo: "cifras",
        cifras: [
          { valor: "2", icono: "server", titulo: "microservicios" },
          { valor: "2", icono: "database", titulo: "bases PostgreSQL" },
          { valor: "1", icono: "terminal", titulo: "comando levanta todo" },
          { valor: "0", icono: "fingerprint", titulo: "eventos perdidos en caídas" },
        ],
      },
      guion: {
        decir: [
          "Buenos días. Ya vimos los fundamentos y una primera mirada a los temas que ahora vamos a desarrollar: cómo se guardan y se protegen los datos, cómo se comunican los servicios y cómo llevamos una aplicación del código a la operación.",
          "Todo lo vamos a ver con ARKA-Lite, nuestro proyecto final del curso.",
        ],
        conTusPalabras: [
          "Retomamos lo que ya vieron para profundizar en los datos, la comunicación entre servicios y la operación de la aplicación.",
          "Lo vemos con ARKA-Lite, nuestro proyecto final.",
        ],
        instrucciones: ["El moderador ya presentó al equipo: saludar y entrar directo al tema, sin volver a presentarse.", "Antes de empezar, abrir este PPTX en la computadora de la sala y probar los videos: van dentro del archivo, no necesitan internet ni el sistema arriba."],
        transicion: "Veamos cómo organizamos el recorrido.",
      },
    },
    {
      id: "s00-agenda",
      titulo: "Qué vamos a ver",
      idea: "Siete partes, en el orden en que construimos el sistema; nos detenemos en las tres del centro.",
      visible: ["Fundamentos y arquitectura: vista general", "Base de datos: en detalle", "Interconexión de servicios: en detalle", "DevOps con Docker y Kubernetes: en detalle", "Observabilidad y demostración en video"],
      valor: "Saber desde el inicio dónde vamos a profundizar y qué se van a llevar.",
      visual: { tipo: "ruta" },
      guion: {
        decir: [
          "Primero les contamos lo que nos quedó de los fundamentos y la arquitectura, porque esos temas ya los vieron en la presentación anterior. Dedicaremos más tiempo a otros tres temas: la base de datos, cómo se comunican los servicios sin perder información y DevOps, que abarca cómo construimos, publicamos y operamos el sistema.",
          "Después vemos la observabilidad, que es cómo sabemos lo que pasa adentro, y les mostramos en video el sistema funcionando, incluso cuando apagamos una parte a propósito. Cerramos con los resultados.",
        ],
        conTusPalabras: [
          "Primero compartimos lo que nos quedó de los fundamentos y la arquitectura.",
          "Nos detenemos en la base de datos, la comunicación entre servicios y DevOps.",
        ],
        transicion: "Empecemos con lo que nos quedó de los fundamentos.",
      },
    },
  ],
};

export const fundamentos: Seccion = {
  id: "s01",
  numero: 1,
  titulo: "Fundamentos",
  corto: "Fundamentos",
  subtitulo: "Lo que nos quedó: analizar antes de programar y buenas prácticas para cualquier lenguaje.",
  temas: ["Analizar primero", "Código mantenible", "Reglas con su prueba"],
  icono: "code",
  enfoque: "general",
  rol: "fundamentos",
  diapositivas: [
    {
      id: "s01-analisis",
      titulo: "Lo primero: analizar antes de programar",
      idea: "Tres preguntas antes de escribir código; sus respuestas se volvieron el diseño del sistema.",
      visible: ["¿Qué tiene que pasar?", "¿Quién hace cada paso?", "¿Qué no se puede permitir?"],
      valor: "Definir las reglas desde el principio simplifica el código y evita rehacer trabajo.",
      visual: {
        tipo: "matriz",
        encabezados: ["Lo que preguntamos", "Lo que respondió el negocio", "En qué se convirtió"],
        filas: [
          { icono: "circle-help", tono: "marino", celdas: ["¿Qué tiene que pasar?", "Se registra, se envía, se avisa y se decide", "Cuatro estados: borrador, enviada, aprobada y rechazada"] },
          { icono: "users", tono: "cian", celdas: ["¿Quién hace cada paso?", "Quien solicita envía, el sistema avisa y otra persona decide", "Dos servicios: uno para las solicitudes y otro para los avisos"] },
          { icono: "ban", tono: "error", celdas: ["¿Qué no se puede permitir?", "Las reglas: se envía solo un borrador, una vez; se decide solo sobre una enviada", "Cada regla con su prueba y un error que explica por qué"] },
        ],
      },
      guion: {
        decir: [
          "De los fundamentos, lo primero que nos quedó es analizar antes de programar. Antes de escribir código nos hicimos tres preguntas sobre el negocio.",
          "Primero, qué tiene que pasar. Una persona registra una solicitud, como una incidencia o un pedido de cambio, la envía, y otra persona la aprueba o la rechaza. De ahí salieron cuatro estados: borrador, enviada, aprobada y rechazada.",
          "Segundo, quién hace cada paso. Quien solicita envía, el sistema avisa y otra persona decide. Gestionar la solicitud y producir el aviso son trabajos distintos, y por eso los separamos en dos servicios.",
          "Tercero, qué no se puede permitir. Estas son las reglas de ARKA-Lite: una solicitud solo puede enviarse cuando está en borrador y una sola vez. Solo una solicitud enviada puede aprobarse o rechazarse. Cada regla quedó con su prueba automática.",
        ],
        conTusPalabras: [
          "Antes de programar, aclaramos el proceso y sus responsables.",
          "Las respuestas produjeron cuatro estados y dos servicios.",
          "Cada regla importante quedó cubierta por una prueba.",
        ],
        preguntas: [{ texto: "¿Por qué los avisos van en otro servicio?", respuesta: "Porque cambian por motivos distintos. Así, el trámite puede seguir funcionando aunque el servicio de avisos esté caído." }],
        transicion: "Con el qué ya definido, pasamos al cómo: escribir código que se pueda cambiar con confianza.",
        respaldo: "docs/inicio/proyecto.md",
      },
    },
    {
      id: "s01-practicas",
      titulo: "Código mantenible: buenas prácticas",
      idea: "Seis prácticas que hacen que un cambio toque un solo lugar, en cualquier lenguaje.",
      visible: ["Una tarea por pieza", "Las piezas se conectan, no se fabrican adentro", "Las reglas viven en un solo lugar", "Errores con respuesta clara", "Nombres del negocio", "Cada regla con su prueba"],
      valor: "Cuando cambia una regla, se toca un solo lugar y una prueba confirma que nada se rompió.",
      visual: {
        tipo: "tarjetas",
        columnas: 3,
        tarjetas: [
          { icono: "layers", titulo: "Una tarea por pieza", texto: "Quien recibe el pedido no decide; quien decide no guarda.", tono: "marino" },
          { icono: "plug", titulo: "Piezas que se conectan", texto: "Cada pieza se puede cambiar o probar por separado.", tono: "cian" },
          { icono: "puzzle", titulo: "Reglas en un solo lugar", texto: "No repetidas en la pantalla y en la base.", tono: "violeta" },
          { icono: "shield-alert", titulo: "Errores claros", texto: "Siempre igual, con un mensaje que explica qué pasó.", tono: "error" },
          { icono: "book-open", titulo: "Nombres del negocio", texto: "Solicitud, enviar, aprobar: se lee como el proceso.", tono: "advertencia" },
          { icono: "flask-conical", titulo: "Cada regla con su prueba", texto: "Una prueba automática avisa si algo se rompió.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "Otra cosa que nos quedó es cómo escribir código fácil de mantener. Son seis prácticas que sirven en cualquier lenguaje, ya sea Java, C# o PL/SQL.",
          "La primera es que cada pieza hace una sola tarea: la que recibe el pedido no decide, y la que decide no guarda. La segunda es conectar las piezas desde afuera, para poder cambiarlas o probarlas por separado. La tercera es dejar las reglas del negocio en un solo lugar, sin repetirlas en la pantalla y en la base.",
          "La cuarta es que todos los errores sigan el mismo formato y expliquen qué pasó. La quinta es usar los nombres del negocio, para que el código se lea como el proceso. Y la sexta es que cada regla tenga su prueba automática.",
          "Es como una cocina ordenada, donde cada persona tiene su puesto y cada cosa su lugar. Así, cuando cambia una regla, tocamos un solo lugar y sabemos enseguida si algo dejó de funcionar.",
        ],
        conTusPalabras: [
          "Estas prácticas sirven en cualquier lenguaje.",
          "Cada pieza hace una tarea y cada regla vive en un lugar.",
          "Las pruebas nos avisan cuando un cambio rompe algo.",
        ],
        preguntas: [{ texto: "¿Esto no hace el código más largo?", respuesta: "Puede producir más piezas, pero cada una es corta y se entiende por separado. Esa inversión se recupera desde el primer cambio." }],
        transicion: "Esto es lo que nos llevamos a cualquier proyecto.",
        respaldo: "docs/desarrollo/flujo-de-trabajo.md",
      },
    },
    {
      id: "s01-aprendizajes",
      titulo: "Fundamentos: lo que nos quedó",
      visible: ["Analizar antes de programar", "Separar responsabilidades paga en el primer cambio", "Las reglas no dependen de la herramienta"],
      valor: "Tres hábitos que bajan el costo de mantener cualquier sistema.",
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "3", titulo: "preguntas antes de programar" }, { valor: "6", titulo: "prácticas que sirven en cualquier lenguaje" }],
        items: [
          { icono: "target", titulo: "Analizar antes de programar", texto: "Qué tiene que pasar, quién lo hace y qué no se permite.", valor: "Reglas claras antes de elegir la tecnología." },
          { icono: "layers", titulo: "Separar responsabilidades paga pronto", texto: "Pantalla, reglas y datos en piezas distintas.", valor: "Un cambio de regla toca un solo lugar." },
          { icono: "shield-check", titulo: "Las reglas no dependen de la herramienta", texto: "El negocio no sabe si detrás hay una base, una web o un framework.", valor: "Se prueba rápido y sobrevive a un cambio de tecnología." },
        ],
      },
      guion: {
        decir: [
          "Nos quedamos con tres ideas. Primero se analiza y después se programa, porque tener claras las reglas desde el inicio evita rehacer trabajo.",
          "Segundo, separamos responsabilidades para que un cambio de regla toque un solo lugar y una prueba nos avise si algo se rompió. Tercero, las reglas del negocio no deben depender de la herramienta. Así siguen siendo las mismas si cambia la base de datos o la tecnología de la aplicación.",
          "Estas tres prácticas se pueden aplicar en los sistemas actuales, sin importar el lenguaje ni cómo esté organizada la aplicación.",
        ],
        conTusPalabras: [
          "Primero analizamos y después programamos.",
          "Separar responsabilidades facilita los cambios.",
          "Las reglas deben sobrevivir a un cambio de herramienta.",
        ],
        transicion: "Ahora le paso la palabra a Ricardo, que nos muestra la arquitectura del sistema.",
      },
    },
  ],
};

export const arquitectura: Seccion = {
  id: "s02",
  numero: 2,
  titulo: "Arquitectura",
  corto: "Arquitectura",
  subtitulo: "Lo que nos quedó: cada servicio con sus datos, y mensajes entre ellos.",
  temas: ["Las capas del sistema", "Cómo se conectan", "Hexagonal por dentro"],
  icono: "network",
  enfoque: "general",
  rol: "arquitectura",
  diapositivas: [
    {
      id: "s02-mapa",
      titulo: "El sistema de un vistazo",
      idea: "Cada capa tiene una sola responsabilidad.",
      visible: ["La pantalla es la puerta de entrada", "Dos servicios, cada uno dueño de su base", "Entre servicios solo viajan datos", "La plataforma corre, entrega y vigila"],
      valor: "Cada capa se puede cambiar sin romper las otras.",
      visual: {
        tipo: "capas",
        capas: [
          { titulo: "Experiencia", tono: "violeta", elementos: [
            { icono: "user", titulo: "Persona", texto: "Usa el navegador" },
            { icono: "monitor", titulo: "La pantalla", texto: "arka-lite-ui: no guarda nada" },
          ] },
          { titulo: "Servicios", tono: "marino", elementos: [
            { icono: "clipboard-list", titulo: "Solicitudes", texto: "El trámite y sus estados" },
            { icono: "bell", titulo: "Notificaciones", texto: "Los avisos, sin duplicados", tono: "cian" },
          ] },
          { titulo: "Datos", tono: "neutro", elementos: [
            { icono: "database", titulo: "db-solicitudes", texto: "PostgreSQL: solicitudes y eventos pendientes" },
            { icono: "database", titulo: "db-notificaciones", texto: "PostgreSQL: avisos ya recibidos" },
          ] },
          { titulo: "Plataforma", tono: "correcto", elementos: [
            { icono: "ship-wheel", titulo: "Docker y Kubernetes", texto: "Dónde corre" },
            { icono: "workflow", titulo: "GitHub Actions", texto: "Prueba y publica" },
            { icono: "chart-line", titulo: "Loki y Grafana", texto: "Registros en un solo lugar", tono: "advertencia" },
          ] },
        ],
      },
      guion: {
        decir: [
          "Gracias, Luis. ARKA-Lite no es una aplicación grande, sino varias piezas pequeñas, cada una con su responsabilidad. Las vemos por capas, de arriba hacia abajo.",
          "Arriba está la pantalla que usa la persona. No guarda información, solo les pasa los pedidos a los servicios.",
          "En el centro están los dos microservicios, es decir, dos aplicaciones pequeñas con una función cada una. Uno maneja las solicitudes y sus estados, y el otro produce los avisos.",
          "Debajo, cada servicio tiene su propia base de datos, y ninguno entra en la base del otro. Al final está la plataforma, donde todo corre, se prueba y se revisa.",
          "Es como un edificio donde cada piso tiene su función, y por eso se puede cambiar uno sin reconstruir los demás.",
        ],
        conTusPalabras: [
          "El sistema tiene cuatro capas.",
          "Cada servicio tiene una tarea y una base propia.",
          "Las capas se pueden cambiar de forma independiente.",
        ],
        preguntas: [{ texto: "¿Por qué no comparten una sola base de datos?", respuesta: "Porque cada servicio debe controlar sus propios datos. Así puede cambiar sin romper al otro." }],
        transicion: "Con el mapa claro, veamos cómo colaboran esas piezas en la práctica.",
        respaldo: "docs/inicio/proyecto.md",
      },
    },
    {
      id: "s02-practica",
      titulo: "Cómo funciona en la práctica",
      idea: "Seis conexiones, y ninguna une las dos bases.",
      visible: ["La persona usa la pantalla", "La pantalla le pide el trabajo a cada servicio", "Cada servicio guarda en su propia base", "Solicitudes avisa con un evento: un mensaje pequeño"],
      valor: "Los sistemas se comunican con mensajes claros, no compartiendo tablas.",
      visual: {
        tipo: "sistema",
        persona: { icono: "user", titulo: "Persona", texto: "En el navegador" },
        ui: { icono: "monitor", titulo: "La pantalla", texto: "arka-lite-ui", tono: "violeta" },
        servicios: [
          { icono: "clipboard-list", titulo: "Solicitudes", texto: "El trámite y sus estados", tono: "marino" },
          { icono: "bell", titulo: "Notificaciones", texto: "Los avisos", tono: "cian" },
        ],
        bases: [
          { icono: "database", titulo: "db-solicitudes", texto: "PostgreSQL", tono: "marino" },
          { icono: "database", titulo: "db-notificaciones", texto: "PostgreSQL", tono: "cian" },
        ],
        conexiones: ["usa", "crea, envía y decide", "guarda", "avisa después", "anota lo recibido", "consulta los avisos"],
        evento: "El evento: número, solicitud y tipo",
        nota: "Ninguna flecha une las dos bases: cada servicio es dueño de sus datos.",
      },
      guion: {
        decir: [
          "Sigamos los números. La persona usa la pantalla, y la pantalla le pide al servicio de solicitudes que cree o envíe una solicitud. El servicio la guarda en su propia base.",
          "Cuando la solicitud se envía, el servicio produce un mensaje pequeño para avisarle a notificaciones. A ese mensaje lo llamamos evento. Notificaciones crea el aviso y anota que ya recibió ese evento, y la pantalla consulta los avisos para mostrarlos.",
          "Ninguna flecha une las dos bases. Es como dos departamentos que se intercambian notas, mientras cada uno mantiene el control de sus propios archivos.",
        ],
        conTusPalabras: [
          "La pantalla pide el trabajo y el servicio guarda los datos.",
          "Entre los servicios viaja un mensaje pequeño llamado evento.",
          "Los servicios se comunican sin compartir sus bases.",
        ],
        preguntas: [{ texto: "¿Qué pasa si notificaciones está caído en el paso cuatro?", respuesta: "Solicitudes sigue funcionando y el evento queda guardado hasta que pueda entregarse. Lo vemos en la parte de interconexión y en la demostración." }],
        transicion: "Ya vimos cómo se conectan por fuera. Ahora veamos cómo está organizado cada servicio por dentro.",
      },
    },
    {
      id: "s02-hexagonal",
      titulo: "Por dentro de cada servicio: hexagonal",
      idea: "Una forma de ordenar el código por dentro; no cambia cómo se instala.",
      visible: ["Las reglas del negocio al centro", "Los pedidos entran por un lado", "La base y los otros servicios salen por el otro", "Por fuera sigue siendo un servicio en su contenedor"],
      comparacion: "Como un enchufe: el aparato funciona con cualquier toma que cumpla la norma, sin saber de qué planta viene la electricidad.",
      iconoComparacion: "plug",
      valor: "Cambiar la base o la forma de avisar sin tocar las reglas del negocio.",
      visual: {
        tipo: "hexagono",
        centro: { icono: "puzzle", titulo: "Reglas del negocio", texto: "La solicitud y sus estados" },
        puertos: ["Guardar solicitudes", "Anotar el evento", "Avisar a otros"],
        entrada: [
          { icono: "globe", titulo: "Pedidos web", texto: "Entran aquí", tono: "violeta" },
          { icono: "shield-alert", titulo: "Errores claros", texto: "Con su motivo", tono: "violeta" },
        ],
        salida: [
          { icono: "database", titulo: "PostgreSQL", texto: "Con el ORM", tono: "marino" },
          { icono: "inbox", titulo: "Bandeja de salida", texto: "Tabla evento", tono: "marino" },
          { icono: "send", titulo: "HTTP", texto: "Hacia notificaciones", tono: "cian" },
          { icono: "flask-conical", titulo: "En memoria", texto: "Para las pruebas", tono: "neutro" },
        ],
      },
      guion: {
        decir: [
          "Cada servicio usa arquitectura hexagonal. El equipo anterior ya la explicó, así que les contamos solo lo que nos quedó.",
          "Las reglas del negocio van en el centro, y todo lo demás se conecta alrededor, como un enchufe. Por un lado entran los pedidos de la pantalla, y por el otro se conectan la base de datos y el servicio de notificaciones. Así, las reglas no dependen de los detalles de esas conexiones.",
          "Donde más nos sirvió fue en las pruebas. Cambiamos la conexión con la base por una versión en memoria, y con eso probamos todas las reglas en segundos, sin levantar una base.",
          "Y esto solo ordena el código por dentro. Desde afuera, el servicio se instala y se usa como cualquier otro.",
        ],
        conTusPalabras: [
          "Las reglas quedan en el centro.",
          "Las conexiones externas se pueden reemplazar.",
          "Así probamos las reglas rápidamente y sin una base.",
        ],
        preguntas: [{ texto: "¿Esto se parece a llamar un procedimiento almacenado?", respuesta: "Se parece en que quien llama conoce el nombre y los parámetros, pero no los detalles internos. Aquí el negocio define el contrato y la base se adapta a él." }],
        transicion: "Esto es lo que nos quedó de la arquitectura.",
        respaldo: "docs/arquitectura/componentes-java.md",
      },
    },
    {
      id: "s02-aprendizajes",
      titulo: "Arquitectura: lo que nos quedó",
      visible: ["Cada servicio es dueño de sus datos", "Entre servicios viajan mensajes, no tablas", "Hexagonal ordena por dentro, no cambia la instalación", "Separar tiene un costo"],
      valor: "Sistemas que cambian por separado, unidos por acuerdos claros.",
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "2", titulo: "servicios, cada uno con su base" }, { valor: "0", titulo: "tablas compartidas entre servicios" }],
        items: [
          { icono: "database", titulo: "Cada servicio, dueño de sus datos", texto: "Nadie lee ni escribe en la base del otro.", valor: "Cada uno cambia sin romper al otro." },
          { icono: "send", titulo: "Entre servicios viajan mensajes", texto: "Un evento pequeño con su número.", valor: "Un acuerdo claro y fácil de revisar." },
          { icono: "hexagon", titulo: "Hexagonal ordena por dentro", texto: "No cambia la instalación: un contenedor por servicio.", valor: "Cambiar la base o la web sin tocar las reglas." },
          { icono: "scale", titulo: "Separar tiene un costo", texto: "Más red, dos bases y fallas parciales.", valor: "Separar solo cuando el negocio lo pide." },
        ],
      },
      guion: {
        decir: [
          "Nos quedamos con cuatro ideas. Cada servicio es dueño de sus datos, y entre servicios viajan mensajes, no tablas.",
          "La arquitectura hexagonal ordena el código por dentro y no cambia cómo se instala.",
          "Y separar tiene un costo: más comunicación por red, más bases y más partes que pueden fallar. Por eso conviene usar microservicios cuando el negocio lo justifica. Para un sistema pequeño, una sola aplicación bien organizada puede ser la mejor decisión.",
        ],
        conTusPalabras: [
          "Cada servicio controla sus propios datos.",
          "Entre los servicios viajan mensajes, no tablas.",
          "Separar servicios tiene un costo y debe justificarse.",
        ],
        transicion: "Ahora entraremos en la base de datos. Le paso la palabra a Marlene.",
      },
    },
  ],
};

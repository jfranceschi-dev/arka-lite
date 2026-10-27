import type { Seccion } from "./tipos.ts";

// Parte 7 (ensamblaje del sistema con la UI y demostración) y cierre.

export const ensamblaje: Seccion = {
  id: "s07",
  numero: 7,
  titulo: "Ensamblaje: la UI",
  corto: "UI",
  participante: "p7",
  subtitulo: "La interfaz que junta los dos servicios y permite comprobar, en vivo, todo lo anterior.",
  temas: ["Ensamblaje del sistema", "Puesta a punto"],
  claves: {
    problema: "Dos servicios sueltos no son un producto: alguien tiene que poder usarlos y entenderlos.",
    sencillo: "Una interfaz web consume los dos servicios por un mismo origen y explica cómo funcionan.",
    visual: "Navegador → /api → nginx → solicitudes o notificaciones.",
    aplicacion: "arka-lite-ui: React, nginx como proxy, DataTables, Tom Select y SweetAlert2.",
    evidencia: "La demostración en vivo: crear, enviar, ver el aviso y reentregar sin duplicar.",
  },
  diapositivas: [
    {
      id: "s07-proxy",
      titulo: "Cómo la UI consume los dos servicios",
      visible: ["El navegador solo conoce /api", "nginx reenvía cada ruta al servicio que corresponde", "La UI registra cada petición que hace", "Si un POST tarda, no lo repite sola"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "ui",
      codigo: {
        lenguaje: "nginx",
        archivo: "arka-lite-ui/despliegue/nginx.conf.template",
        texto: "location /api/solicitudes {\n    proxy_pass ${ARKA_SOLICITUDES_ORIGEN}/solicitudes;\n}\nlocation = /api/notificaciones {\n    proxy_pass ${ARKA_NOTIFICACIONES_ORIGEN}/notificaciones;\n}",
      },
      guion: {
        decir: [
          "La interfaz es una aplicación web hecha con React y servida por nginx. El navegador nunca conoce las direcciones internas de los servicios: siempre llama a /api, en la misma dirección de la página.",
          "nginx funciona como una recepcionista: recibe cada petición y la pasa al servicio que corresponde. Lo que empieza con /api/solicitudes va a solicitudes; lo de notificaciones, a notificaciones.",
          "Y un detalle de cuidado: si una operación que cambia datos tarda demasiado, la interfaz no la repite por su cuenta, porque el cambio pudo haberse guardado aunque la respuesta no llegara.",
        ],
        transicion: "¿Y qué ve la persona cuando abre la interfaz?",
        respaldo: "arka-lite-ui/README.md",
      },
    },
    {
      id: "s07-pantallas",
      titulo: "Una interfaz simple, con ayuda",
      idea: "Cuatro pestañas: usar, seguir, validar y entender.",
      visible: ["Solicitudes: crear, ver las tuyas, enviar, aprobar o rechazar", "Enviadas: el recorrido de cada evento y Reentregar", "Salud: validar los dos servicios", "Ayuda: diagramas paso a paso de cómo funciona"],
      porque: "Cualquier persona puede usarla, y quien quiera entenderla tiene la explicación a un clic.",
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "La interfaz tiene solo cuatro pestañas. En Solicitudes creas una solicitud, ves las que creaste y tienes a la mano las acciones que corresponden a cada una. Antes de cada acción, la app te pide confirmar.",
          "En Enviadas ves el recorrido de cada evento: registrado, entregado, consumido y aviso. En Salud validas que los dos servicios estén bien, y desde ahí también abres los contratos en Swagger y los logs en Grafana.",
          "Y en Ayuda está la explicación: cada tema responde una pregunta, como qué pasa cuando envío una solicitud, con un diagrama que avanza paso a paso. Los colores de la plantilla se pueden personalizar desde la propia app.",
        ],
        transicion: "Ahora sí, vamos a verlo funcionando.",
      },
    },
    {
      id: "s07-demo",
      titulo: "Demostración en vivo",
      idea: "Todo lo que contamos, funcionando.",
      visible: ["Ver los dos servicios en verde", "Crear una solicitud nueva", "Enviarla y ver llegar el evento", "Reentregarlo: el aviso no se duplica"],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Abrimos la interfaz. Arriba a la derecha vemos que los dos servicios están en verde. Creamos una solicitud nueva, con un identificador propio. La app confirma que se creó y la marca como nuestra.",
          "Ahora la enviamos. La app nos pide confirmar, confirmamos, y en la pestaña Enviadas vemos el evento registrado. En unos segundos, el relevador lo entrega, notificaciones lo recibe y aparece el aviso. Fíjense en la línea fina bajo la barra superior: se ilumina cuando un evento termina su viaje.",
          "Y la prueba final: reentregamos a propósito el mismo evento. La app nos confirma que notificaciones lo reconoció y no creó otro aviso. Avisos duplicados: cero. Eso es la idempotencia, funcionando.",
        ],
        instrucciones: [
          "Usar un identificador que no exista, por ejemplo DEMO-01. Si ya existe, la app muestra el mensaje 409: explicarlo y usar otro.",
          "Si el evento tarda, esperar: la pestaña Enviadas se actualiza sola cada 5 segundos.",
        ],
        demo: { accion: "Solicitudes: crear DEMO-01 y enviarla. Enviadas: esperar el aviso y pulsar Reentregar.", evidencia: "201 al crear; evento entregado y consumido; 1 aviso; “El aviso no se duplicó”." },
        transicion: "Para cerrar, repasemos lo que aprendimos.",
      },
    },
  ],
};

export const cierre: Seccion = {
  id: "s08",
  numero: null,
  titulo: "Cierre",
  corto: "Cierre",
  participante: "p1",
  diapositivas: [
    {
      id: "s08-aprendizajes",
      titulo: "Lo que aprendimos, en ARKA-Lite",
      visible: ["Cada tema del curso tiene un lugar en el proyecto", "Del primer endpoint al clúster", "Con pruebas y una demostración que lo respaldan"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Tema del curso", "Dónde está en ARKA-Lite"],
        filas: [
          ["Spring Boot y endpoints REST", "Los controladores de solicitudes y notificaciones"],
          ["Manejo global de errores", "ManejadorGlobalDeErrores: 404, 409 y 400"],
          ["Git, Swagger y pruebas", "Ramas y Pull Requests, Swagger, JUnit y MockMvc"],
          ["Puertos y adaptadores", "Los paquetes dominio y adaptadores, con @Primary"],
          ["De monolito a microservicios", "Dos servicios, cada uno con su base"],
          ["Docker y Compose", "Dockerfile en dos etapas y compose.yaml"],
          ["Integración y entrega continua", "El pipeline de GitHub Actions"],
          ["Kubernetes", "Deployments, Services, Secret y disco persistente"],
          ["Base de datos y consistencia", "JPA, bandeja de salida, relevador e idempotencia"],
          ["Logs y monitoreo", "Promtail, Loki, Grafana y la salud de cada servicio"],
          ["Ensamblaje del sistema", "La interfaz: Solicitudes, Enviadas, Salud y Ayuda"],
        ],
      },
      guion: {
        decir: [
          "Esta tabla resume el curso entero. Cada tema que vimos tiene un lugar concreto en ARKA-Lite, desde el primer endpoint con Spring Boot hasta el despliegue en Kubernetes y la centralización de logs.",
          "Y no lo decimos solo en una lámina: lo acaban de ver funcionando, con pruebas automáticas que lo vigilan y un pipeline que lo valida en cada cambio.",
        ],
        transicion: "También queremos ser honestos con lo que le falta.",
      },
    },
    {
      id: "s08-limites",
      titulo: "Lo que le falta",
      idea: "Un laboratorio sólido, todavía no un producto.",
      visible: ["El texto de los avisos vive en memoria", "No hay inicio de sesión: es un laboratorio", "Sin mensajería dedicada ni métricas históricas", "El pipeline publica, pero no despliega solo"],
      porque: "Siguientes pasos: guardar el aviso en la base, agregar autenticación y sacar las contraseñas del repositorio.",
      recorridos: ["ejecutivo", "tecnico"],
      marcas: [
        { texto: "Guardar el aviso en la base, junto con su número de evento", certeza: "propuesta" },
        { texto: "Autenticación y contraseñas fuera del repositorio", certeza: "propuesta" },
      ],
      guion: {
        decir: [
          "ARKA-Lite es un laboratorio, y lo decimos con claridad. El texto de los avisos se pierde si notificaciones se reinicia. No tiene inicio de sesión y las contraseñas son de prueba. No usa un sistema de mensajería dedicado, no guarda métricas en el tiempo y el pipeline publica las imágenes, pero no las despliega solo.",
          "Los siguientes pasos serían guardar el aviso en la base junto con su número de evento, agregar autenticación y sacar las contraseñas del repositorio.",
        ],
        transicion: "Gracias por su atención.",
      },
    },
    {
      id: "s08-gracias",
      titulo: "Gracias",
      visible: ["Equipo arka-litos · Upskilling Backend Java", "¿Preguntas?"],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Empezamos con un endpoint y terminamos con un sistema de dos microservicios, empaquetado, desplegado, observado y con una interfaz que cualquiera puede usar para comprobar cómo funciona.",
          "Muchas gracias por acompañarnos, de parte de todo el equipo arka-litos. Con gusto respondemos sus preguntas.",
        ],
        respaldo: "docs/inicio/proyecto.md",
      },
    },
  ],
};

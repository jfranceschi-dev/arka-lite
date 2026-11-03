import type { Seccion } from "./tipos.ts";

// Partes 7 y 8 (documentación y la UI como laboratorio) y el cierre con el
// valor que deja el proyecto.

export const documentacion: Seccion = {
  id: "s07",
  numero: 7,
  titulo: "Documentación",
  corto: "Documentación",
  subtitulo: "Contratos que salen del código y documentación que cambia con él.",
  temas: ["OpenAPI", "Swagger", "Git y documentación"],
  icono: "book-open",
  diapositivas: [
    {
      id: "s07-swagger",
      titulo: "Contratos vivos con Swagger",
      idea: "La documentación de la API sale del mismo código.",
      visible: ["Cada servicio publica su contrato OpenAPI", "Swagger UI lo muestra y permite probarlo", "Un endpoint nuevo aparece solo", "La UI enlaza los dos Swagger"],
      iconos: ["file-json", "play", "sparkles", "link"],
      comparacion: "Como el menú de un restaurante: dice qué hay, qué lleva cada plato y qué te van a traer.",
      iconoComparacion: "utensils",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: { tipo: "captura", capturas: [{ archivo: "swagger-solicitudes.png", titulo: "Swagger de solicitudes", url: "localhost:8080/swagger-ui/index.html" }] },
      guion: {
        decir: [
          "Un contrato de API es como el menú de un restaurante: dice qué se puede pedir, qué lleva cada pedido y qué te van a devolver.",
          "Cada servicio publica su contrato con el estándar OpenAPI, usando springdoc, y Swagger lo muestra como una página donde se puede ver cada endpoint, sus códigos de respuesta y probarlo en vivo.",
          "Lo importante para el staff: se genera desde el código. Cuando agregamos un endpoint, aparece solo, y nunca queda desactualizado. Un equipo que consume la API no tiene que pedirnos un documento.",
        ],
        demo: { accion: "En la UI, pestaña Salud › Swagger · solicitudes, y ejecutar GET /solicitudes.", evidencia: "La lista en JSON con código 200." },
        transicion: "Y lo que no sale del código, lo documentamos junto al código.",
      },
    },
    {
      id: "s07-docs",
      titulo: "La documentación viaja con el cambio",
      idea: "Si un Pull Request cambia el comportamiento, cambia la documentación.",
      visible: ["Swagger para los contratos", "docs/ en el mismo repositorio", "Ayuda con diagramas dentro de la UI", "La presentación se genera desde la fuente"],
      recorridos: ["tecnico"],
      visual: {
        tipo: "tarjetas",
        tarjetas: [
          { icono: "file-json", titulo: "Contratos", texto: "OpenAPI y Swagger en cada servicio, generados del código.", tono: "violeta" },
          { icono: "book-open", titulo: "docs/ en el repositorio", texto: "Inicio, arquitectura, operaciones, automatización y desarrollo.", tono: "marino" },
          { icono: "circle-help", titulo: "Ayuda en la UI", texto: "Preguntas frecuentes con diagramas paso a paso.", tono: "cian" },
          { icono: "git-pull-request", titulo: "Regla de trabajo", texto: "Cambia un endpoint, una variable o un comando: cambia la doc en el mismo PR.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "Lo que no sale del código, vive junto al código. La carpeta docs del repositorio tiene cómo empezar, la arquitectura, la operación, el pipeline y nuestras convenciones de trabajo.",
          "Y tenemos una regla: si un Pull Request cambia un endpoint, una variable de entorno, un comando o un contrato, actualiza la documentación en el mismo Pull Request. Así la documentación no se queda atrás.",
        ],
        transicion: "Esto es lo que aprendimos de documentar.",
        respaldo: "docs/README.md",
      },
    },
    {
      id: "s07-aprendizajes",
      titulo: "Documentación: lo que aprendimos",
      visible: ["Lo que se genera no se desactualiza", "La doc se revisa en el mismo PR", "Documentar para quien llega mañana"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "11", titulo: "endpoints documentados solos" }, { valor: "2", titulo: "Swagger, uno por servicio" }],
        items: [
          { icono: "sparkles", titulo: "Lo que se genera no se desactualiza", texto: "OpenAPI sale de los controladores con springdoc.", valor: "Cero horas manteniendo un documento de API aparte." },
          { icono: "git-pull-request", titulo: "La doc se revisa en el mismo PR", texto: "El cambio y su explicación llegan juntos.", valor: "Quien revisa entiende el porqué, no solo el qué." },
          { icono: "graduation-cap", titulo: "Documentar para quien llega mañana", texto: "Guías en PowerShell, diagramas y la Ayuda de la UI.", valor: "Menos tiempo para que alguien nuevo aporte." },
        ],
      },
      guion: {
        decir: [
          "Primero: lo que se genera desde el código no se desactualiza. Es la mejor documentación de API que existe.",
          "Segundo: la documentación se revisa en el mismo Pull Request que el cambio.",
          "Y tercero: documentamos para la persona que llega mañana al equipo. Ese es el verdadero usuario de la documentación.",
        ],
        transicion: "Para ver todo esto funcionando, construimos una interfaz.",
      },
    },
  ],
};

export const laboratorio: Seccion = {
  id: "s08",
  numero: 8,
  titulo: "La UI como laboratorio",
  corto: "UI laboratorio",
  subtitulo: "No es parte del entregable: es el banco de pruebas para ver cómo se comporta el sistema, sobre todo cuando algo falla.",
  temas: ["Ensamblaje del sistema", "Fallas parciales", "Demostración"],
  icono: "flask-conical",
  diapositivas: [
    {
      id: "s08-ui",
      titulo: "Una UI para ver el sistema por dentro",
      idea: "No es parte del entregable: la hicimos para ejemplificar lo que aprendimos.",
      visible: ["Solicitudes: crear, enviar, aprobar o rechazar", "Enviadas: eventos pendientes, entregados y Reentregar", "Salud: los dos servicios, Swagger y Grafana", "Ayuda: diagramas de cómo funciona"],
      porque: "Hace visible lo invisible: la bandeja de salida, los reintentos y la idempotencia.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "captura",
        capturas: [
          { archivo: "ui-solicitudes.png", titulo: "Solicitudes", texto: "Crear, enviar y decidir.", url: "localhost:8088/#/solicitudes" },
          { archivo: "ui-enviadas.png", titulo: "Enviadas", texto: "Pendientes, entregados y Reentregar.", url: "localhost:8088/#/enviadas" },
          { archivo: "ui-salud.png", titulo: "Salud", texto: "UP o DOWN, Swagger y Grafana.", url: "localhost:8088/#/salud" },
          { archivo: "ui-ayuda.png", titulo: "Ayuda", texto: "Diagramas paso a paso.", url: "localhost:8088/#/ayuda" },
        ],
      },
      guion: {
        decir: [
          "Una aclaración importante: esta interfaz no es parte del entregable. Los entregables son los dos microservicios y su plataforma. La interfaz la agregamos como laboratorio, para que cualquiera pueda ver lo que normalmente es invisible.",
          "En Solicitudes se crean y se envían. En Enviadas se ve la bandeja de salida: qué eventos están pendientes, cuáles se entregaron, y un botón para reentregar a propósito. En Salud, si cada servicio está UP o DOWN. Y en Ayuda, diagramas de cómo funciona.",
          "Donde más vale es cuando algo falla. Veamos eso.",
        ],
        transicion: "Primer caso: el servicio de notificaciones se cae.",
        respaldo: "arka-lite-ui/README.md",
      },
    },
    {
      id: "s08-caida",
      titulo: "Si notificaciones se cae",
      idea: "El usuario no se entera; el aviso llega cuando el servicio vuelve.",
      visible: ["Enviar responde bien aunque notificaciones esté caído", "El evento queda pendiente en la bandeja", "El relevador reintenta cada 5 segundos", "Al volver, llega un solo aviso"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "escenario",
        falla: { icono: "siren", titulo: "notificaciones está caído", texto: "docker compose stop servicio-notificaciones", tono: "error" },
        pasos: [
          { momento: "0 s", icono: "send", titulo: "Enviar", texto: "Responde 200: solicitud ENVIADA y evento guardado.", tono: "marino" },
          { momento: "cada 5 s", icono: "refresh-cw", titulo: "Reintenta", texto: "3 intentos por ciclo; el evento sigue pendiente.", tono: "advertencia" },
          { momento: "en la UI", icono: "eye", titulo: "Se ve", texto: "“Notificaciones no responde” y 1 en camino.", tono: "advertencia" },
          { momento: "al volver", icono: "bell", titulo: "Entrega", texto: "Mismo eventoId: se crea el aviso.", tono: "correcto" },
        ],
        resultado: { icono: "circle-check", titulo: "1 aviso, 0 perdidos", texto: "Sin intervención y sin duplicados.", tono: "correcto" },
      },
      guion: {
        decir: [
          "Detenemos notificaciones a propósito. En la pestaña Salud aparece en DOWN.",
          "Ahora enviamos una solicitud. La respuesta es buena: la solicitud queda enviada y su evento queda guardado. La persona no ve ningún error, porque no depende de que el otro servicio esté arriba.",
          "En Enviadas aparece un aviso: notificaciones no responde y el evento espera en la bandeja de salida. El relevador lo intenta cada cinco segundos y falla, pero no lo pierde. Cuando levantamos notificaciones, en el siguiente ciclo lo entrega con el mismo número, y aparece exactamente un aviso.",
        ],
        instrucciones: [
          "Antes: docker compose stop servicio-notificaciones. Mostrar Salud en DOWN.",
          "Crear y enviar DEMO-01; mostrar en Enviadas el aviso amarillo “Notificaciones no responde” y “1 en camino”. No hace falta recargar: la pantalla se actualiza sola y el indicador de servicios vuelve a 2 de 2.",
          "docker compose start servicio-notificaciones y esperar unos segundos: el evento pasa a entregado y aparece 1 aviso.",
        ],
        demo: { accion: "Detener notificaciones, enviar DEMO-01, mirar Enviadas y volver a iniciar notificaciones.", evidencia: "Evento en camino mientras está caído; al volver, entregado y 1 aviso." },
        pregunta: { texto: "¿Cuánto tiempo puede esperar un evento pendiente?", respuesta: "Indefinidamente: está en la base. Se entrega en el primer ciclo después de que notificaciones vuelve." },
        transicion: "Ese es el caso más importante, pero no el único.",
      },
    },
    {
      id: "s08-fallas",
      titulo: "Cómo se comporta cuando algo falla",
      idea: "Cada falla tiene una reacción prevista y algo visible en la UI.",
      visible: ["Servicio caído: el evento espera", "Evento repetido: se ignora", "Acción inválida: 409 con mensaje", "Datos incompletos: 400"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "matriz",
        encabezados: ["Qué falla", "Cómo reacciona el sistema", "Qué se ve en la UI"],
        filas: [
          { icono: "siren", tono: "error", celdas: ["notificaciones está caído", "El evento queda pendiente y se reintenta cada 5 s", "Aviso “Notificaciones no responde” · 1 en camino"] },
          { icono: "copy", tono: "advertencia", celdas: ["El evento llega dos veces", "ConsumoIdempotente lo reconoce y lo ignora", "“El aviso no se duplicó” · 0 duplicados"] },
          { icono: "ban", tono: "error", celdas: ["Enviar dos veces o aprobar un borrador", "El dominio rechaza la transición: 409", "Diálogo con el motivo del 409"] },
          { icono: "triangle-alert", tono: "advertencia", celdas: ["Faltan datos o el id ya existe", "Se valida antes de guardar: 400 o 409", "Diálogo “Faltan datos” o “Ese identificador ya existe”"] },
          { icono: "timer", tono: "neutro", celdas: ["Un POST tarda o se corta", "La UI no lo repite sola: pudo haberse guardado", "Error de tiempo agotado, sin reintento automático"] },
        ],
      },
      guion: {
        decir: [
          "Esta tabla resume cómo se comporta el sistema ante cada falla que probamos, y qué ve la persona en la interfaz.",
          "Si un evento llega dos veces, se ignora. Si alguien intenta una acción que no corresponde, como enviar dos veces, recibe un 409 con el motivo. Si faltan datos, un 400 sin guardar nada.",
          "Y un detalle de diseño en la propia interfaz: si una operación que cambia datos tarda o se corta, no la repite sola, porque el cambio pudo haberse guardado aunque la respuesta no llegara. Ninguna falla queda sin una reacción prevista.",
        ],
        demo: { accion: "En Enviadas, Reentregar un evento ya consumido; en Solicitudes, enviar dos veces la misma solicitud.", evidencia: "“El aviso no se duplicó” y el diálogo 409." },
        transicion: "Esto es lo que aprendimos con la UI como laboratorio.",
      },
    },
    {
      id: "s08-aprendizajes",
      titulo: "La UI como laboratorio: lo que aprendimos",
      visible: ["Diseñar para la falla, no solo para el éxito", "Hacer visible lo asíncrono", "Una herramienta de demo también enseña"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "5", titulo: "fallas con reacción prevista" }, { valor: "29", titulo: "pruebas de la UI" }],
        items: [
          { icono: "siren", titulo: "Diseñar para la falla", texto: "Cada falla probada tiene una reacción y un mensaje.", valor: "Menos incidentes y menos llamadas a soporte." },
          { icono: "eye", titulo: "Hacer visible lo asíncrono", texto: "Pendientes, entregados y consumidos en una pantalla.", valor: "Explicar el sistema a negocio sin abrir el código." },
          { icono: "lightbulb", titulo: "La demo también enseña", texto: "Ayuda con diagramas y botones para provocar fallas.", valor: "Material de capacitación para quien llegue al equipo." },
        ],
      },
      guion: {
        decir: [
          "Primero: hay que diseñar para la falla, no solo para el camino feliz. La pregunta no es si algo va a fallar, sino cómo se comporta cuando falle.",
          "Segundo: lo asíncrono hay que hacerlo visible. Sin la pestaña Enviadas, un evento pendiente sería invisible.",
          "Y tercero: una herramienta de demostración también sirve para capacitar. Esta interfaz se puede usar para explicarle el sistema a cualquiera.",
        ],
        transicion: "Para cerrar, el valor que deja todo esto.",
      },
    },
  ],
};

export const cierre: Seccion = {
  id: "s09",
  numero: null,
  titulo: "Valor y cierre",
  corto: "Cierre",
  diapositivas: [
    {
      id: "s09-valor",
      titulo: "El valor agregado",
      idea: "Prácticas que un equipo de tecnología puede reutilizar desde mañana.",
      visible: ["Resiliencia ante fallas parciales", "Entornos reproducibles", "Calidad en cada cambio", "Trazabilidad de punta a punta"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "matriz",
        encabezados: ["Pilar", "Qué construimos", "Valor para el equipo"],
        filas: [
          { icono: "shield-check", tono: "correcto", celdas: ["Resiliencia", "Outbox, reintentos e idempotencia", "0 avisos perdidos o duplicados ante caídas"] },
          { icono: "container", tono: "cian", celdas: ["Reproducibilidad", "Docker, Compose y Kubernetes", "1 comando y la misma imagen en todo ambiente"] },
          { icono: "flask-conical", tono: "marino", celdas: ["Calidad", "67 pruebas y pipeline por PR", "Errores detectados en minutos, antes de integrar"] },
          { icono: "waypoints", tono: "advertencia", celdas: ["Trazabilidad", "Logs centralizados, traceId e imagen por SHA", "Diagnóstico en minutos y versiones rastreables"] },
          { icono: "file-json", tono: "violeta", celdas: ["Contratos y diseño", "OpenAPI generado y puertos y adaptadores", "Integraciones claras y tecnología intercambiable"] },
        ],
      },
      guion: {
        decir: [
          "Si tuviéramos que resumir el valor en una lámina, sería esta. Construimos resiliencia: ante una caída parcial no se pierde ni se duplica un aviso. Reproducibilidad: un comando y la misma imagen en cualquier ambiente.",
          "Calidad: sesenta y siete pruebas en cada Pull Request. Trazabilidad: logs centralizados con traceId e imágenes rastreables a su commit. Y contratos claros con un diseño que permite cambiar tecnología sin tocar el negocio.",
          "Nada de esto es exclusivo de ARKA-Lite: son prácticas que cualquier equipo puede adoptar desde mañana.",
        ],
        transicion: "Si nos llevamos solo tres ideas, que sean estas.",
      },
    },
    {
      id: "s09-aprendizajes",
      titulo: "Lo que nos llevamos",
      visible: ["Diseñar para la falla", "Automatizar la confianza", "Hacer visible el sistema"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "0", titulo: "avisos perdidos o duplicados" }, { valor: "67", titulo: "pruebas en cada cambio" }],
        items: [
          { icono: "siren", titulo: "Diseñar para la falla", texto: "Guardar primero, reintentar e ignorar duplicados.", valor: "Sistemas que se recuperan solos." },
          { icono: "workflow", titulo: "Automatizar la confianza", texto: "Pruebas, pipeline, imágenes y estado declarado.", valor: "Cambiar rápido sin miedo a romper." },
          { icono: "eye", titulo: "Hacer visible el sistema", texto: "Logs, trazas, salud, Swagger y la UI laboratorio.", valor: "Diagnosticar y explicar en minutos." },
        ],
      },
      guion: {
        decir: [
          "Tres ideas. Diseñar para la falla: en un sistema distribuido, algo siempre va a fallar, y la diferencia está en cómo reacciona.",
          "Automatizar la confianza: pruebas, pipeline e infraestructura declarada nos permiten cambiar rápido sin miedo.",
          "Y hacer visible el sistema: lo que no se ve no se puede diagnosticar ni explicar.",
        ],
        transicion: "Gracias por su atención.",
      },
    },
    {
      id: "s09-gracias",
      titulo: "Gracias",
      visible: ["Un laboratorio que cumplió su objetivo: aprender.", "Proyecto final · Upskilling Backend Java"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      guion: {
        decir: [
          "ARKA-Lite fue un laboratorio, y cumplió su objetivo: aprender. Empezamos con un endpoint y terminamos con dos microservicios con su base de datos, empaquetados, desplegados, observados y documentados, que saben comportarse cuando algo falla.",
          "Muchas gracias por acompañarnos. Con gusto respondemos sus preguntas.",
        ],
        respaldo: "docs/inicio/proyecto.md",
      },
    },
  ],
};

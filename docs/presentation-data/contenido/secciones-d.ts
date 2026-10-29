import type { Seccion } from "./tipos.ts";

// Parte 7, la demostración con la UI, y el cierre con el valor que deja el
// proyecto y lo que el staff puede aplicar desde mañana. La UI no es el
// entregable ni un laboratorio aparte: es el ejemplo práctico de lo que se
// contó en las partes anteriores.

export const demostracion: Seccion = {
  id: "s07",
  numero: 7,
  titulo: "Demostración con la UI",
  corto: "Demostración",
  subtitulo: "La UI ejemplifica en vivo lo que contamos: estados, Outbox, idempotencia y salud.",
  temas: ["Crear y enviar", "Una caída en vivo", "Reentregar"],
  icono: "monitor",
  enfoque: "vivo",
  rol: "demostracion",
  diapositivas: [
    {
      id: "s07-ui",
      titulo: "La UI: lo que contamos, en vivo",
      idea: "La forma de ver funcionando cada parte de la presentación.",
      visible: ["Solicitudes: los estados y los errores claros", "Enviadas: la bandeja de salida y Reentregar", "Salud: cada servicio, Swagger y Grafana", "Ayuda: diagramas de cómo funciona"],
      porque: "Hace visible lo que normalmente no se ve: la bandeja de salida, los reintentos y la idempotencia.",
      valor: "Ver lo invisible: la bandeja de salida, los reintentos y la idempotencia, en pantalla.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "captura",
        capturas: [
          { archivo: "ui-solicitudes.png", titulo: "Solicitudes", texto: "El negocio: estados y errores 400, 404 y 409.", url: "localhost:8088/#/solicitudes" },
          { archivo: "ui-enviadas.png", titulo: "Enviadas", texto: "La interconexión: pendientes, entregados y Reentregar.", url: "localhost:8088/#/enviadas" },
          { archivo: "ui-salud.png", titulo: "Salud", texto: "La observabilidad: UP o DOWN, Swagger y Grafana.", url: "localhost:8088/#/salud" },
          { archivo: "ui-ayuda.png", titulo: "Ayuda", texto: "Diagramas paso a paso.", url: "localhost:8088/#/ayuda" },
        ],
      },
      guion: {
        decir: [
          "Gracias. Todo lo que les contamos se puede ver funcionando, y para eso construimos esta interfaz. No es el entregable del proyecto: es la forma de ejemplificar cada parte en vivo. En Solicitudes se ve el negocio: crear, enviar, aprobar o rechazar, con sus mensajes de error claros.",
          "[clic] En Enviadas se ve la interconexión: la bandeja de salida, qué eventos están pendientes, cuáles se entregaron y un botón para reentregar a propósito. [clic] En Salud, si cada servicio está arriba, con enlaces a Swagger y a Grafana. [clic] Y en Ayuda, diagramas de cómo funciona.",
          "Hagamos la prueba más interesante: tumbar un servicio a propósito.",
        ],
        instrucciones: ["Cambiar al navegador con la UI: http://localhost:8088 o el puerto 8088 del Codespace. Los comandos docker compose de la siguiente lámina se escriben en esa misma computadora o en la terminal del Codespace. Si el sistema no está disponible, seguir con las capturas de esta lámina y de la siguiente."],
        transicion: "Vamos a detener el servicio de notificaciones.",
        respaldo: "arka-lite-ui/README.md",
      },
    },
    {
      id: "s07-caida",
      titulo: "En vivo: si notificaciones se cae",
      idea: "La persona no se entera; el aviso llega cuando el servicio vuelve, una sola vez.",
      visible: ["Enviar responde bien aunque notificaciones esté caído", "El evento queda pendiente en la bandeja", "El relevador reintenta cada 5 segundos", "Al volver, llega un solo aviso"],
      valor: "Ver con sus propios ojos que una caída no hace perder ni duplicar información.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "escenario",
        falla: { icono: "siren", titulo: "notificaciones está caído", texto: "docker compose stop servicio-notificaciones", tono: "error" },
        pasos: [
          { momento: "0 s", icono: "send", titulo: "Enviar", texto: "Responde bien: solicitud ENVIADA y evento guardado.", tono: "marino" },
          { momento: "cada 5 s", icono: "refresh-cw", titulo: "Reintenta", texto: "3 intentos por ciclo; el evento sigue pendiente.", tono: "advertencia" },
          { momento: "en la UI", icono: "eye", titulo: "Se ve", texto: "“Notificaciones no responde” y 1 en camino.", tono: "advertencia" },
          { momento: "al volver", icono: "bell", titulo: "Entrega", texto: "Mismo eventoId: se crea el aviso.", tono: "correcto" },
        ],
        resultado: { icono: "circle-check", titulo: "1 aviso, 0 perdidos", texto: "Sin intervención y, al reentregar, sin duplicados.", tono: "correcto" },
      },
      guion: {
        decir: [
          "Detenemos notificaciones a propósito; en Salud aparece en rojo. [clic] Ahora enviamos una solicitud. La respuesta es buena: la solicitud queda enviada y su evento queda guardado. La persona no ve ningún error, porque enviar no depende del otro servicio. Eso es lo asíncrono.",
          "[clic] Mientras tanto, el relevador intenta entregar el evento cada cinco segundos y falla, pero no lo pierde. [clic] La pantalla de Enviadas lo muestra: notificaciones no responde, y hay un evento en camino.",
          "[clic] Levantamos notificaciones, y en el siguiente ciclo el evento se entrega con el mismo número: aparece exactamente un aviso. Eso es el Outbox. [clic] Y para cerrar, reentregamos ese mismo evento a propósito: notificaciones lo reconoce y no crea otro aviso. Cero perdidos y cero duplicados, en vivo.",
        ],
        instrucciones: [
          "Antes: docker compose stop servicio-notificaciones. Mostrar Salud en rojo (DOWN).",
          "Crear y enviar DEMO-01; mostrar en Enviadas el aviso amarillo “Notificaciones no responde” y “1 en camino”. No hace falta recargar: la pantalla se actualiza sola.",
          "docker compose start servicio-notificaciones y esperar unos segundos: el evento pasa a entregado y aparece 1 aviso.",
          "En Enviadas, pulsar Reentregar sobre ese evento: aparece “El aviso no se duplicó” y Avisos duplicados sigue en 0.",
          "Los clics de la lámina acompañan lo que pasa en la UI; si la demostración en vivo falla, contarla con la lámina.",
        ],
        demo: { accion: "Detener notificaciones, enviar DEMO-01, mirar Enviadas, volver a iniciar notificaciones y reentregar el evento.", evidencia: "Evento en camino mientras está caído; al volver, entregado y 1 aviso; al reentregar, 0 duplicados." },
        preguntas: [{ texto: "¿Cuánto tiempo puede esperar un evento pendiente?", respuesta: "Indefinidamente: está en la base. Se entrega en el primer ciclo después de que notificaciones vuelve." }],
        transicion: "Esto es lo que aprendimos de la demostración.",
      },
    },
    {
      id: "s07-fallas",
      titulo: "Cómo se comporta cuando algo falla",
      idea: "Cada falla tiene una reacción prevista y algo visible en la UI.",
      visible: ["Servicio caído: el evento espera", "Evento repetido: se ignora", "Acción inválida: 409 con mensaje", "Datos incompletos: 400"],
      recorridos: ["tecnico"],
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
          "Esta tabla resume cómo se comporta el sistema ante cada falla que probamos. Notificaciones caído: el evento espera. [clic] Un evento repetido: se ignora. [clic] Una acción que no corresponde, como enviar dos veces: un 409 con el motivo.",
          "[clic] Datos que faltan o un identificador repetido: un 400 o un 409 antes de guardar. [clic] Y si una operación tarda o se corta, la interfaz no la repite sola, porque el cambio pudo haberse guardado.",
        ],
        demo: { accion: "En Solicitudes, enviar dos veces la misma solicitud.", evidencia: "El diálogo con el 409." },
        transicion: "Esto es lo que aprendimos de la demostración.",
      },
    },
    {
      id: "s07-aprendizajes",
      titulo: "Demostración: lo que aprendimos",
      visible: ["Diseñar para la falla, no solo para el éxito", "Hacer visible lo asíncrono", "Mostrar en vivo explica más que una lámina"],
      valor: "Una herramienta que explica el sistema a cualquiera, también a quien llegue nuevo al equipo.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "5", titulo: "fallas con reacción prevista" }, { valor: "4", titulo: "pantallas para ver el sistema por dentro" }],
        items: [
          { icono: "siren", titulo: "Diseñar para la falla", texto: "Cada falla probada tiene una reacción y un mensaje.", valor: "Menos incidentes y menos llamadas a soporte." },
          { icono: "eye", titulo: "Hacer visible lo asíncrono", texto: "Pendientes, entregados y consumidos en una pantalla.", valor: "Explicar el sistema sin abrir el código." },
          { icono: "lightbulb", titulo: "Mostrar en vivo explica más", texto: "Botones para provocar fallas y ver la reacción.", valor: "Material de capacitación para quien llegue al equipo." },
        ],
      },
      guion: {
        decir: [
          "Tres aprendizajes de la demostración. [clic] Hay que diseñar para la falla, no solo para el camino feliz. [clic] Lo asíncrono hay que hacerlo visible: sin la pestaña Enviadas, un evento pendiente sería invisible. [clic] Y mostrarlo en vivo explica más que cualquier lámina; esta misma interfaz sirve para capacitar a quien llegue al equipo.",
        ],
        transicion: "Para cerrar, el valor que deja todo esto.",
      },
    },
  ],
};

export const cierre: Seccion = {
  id: "s08",
  numero: null,
  titulo: "Valor y cierre",
  corto: "Cierre",
  rol: "orquestador",
  diapositivas: [
    {
      id: "s08-valor",
      titulo: "El valor agregado",
      idea: "Prácticas que un equipo de tecnología puede reutilizar, en cualquier lenguaje.",
      visible: ["Datos consistentes ante fallas", "Conexiones fuera del código", "Entornos reproducibles", "Calidad en cada cambio", "Trazabilidad de punta a punta"],
      valor: "Cinco pilares que cualquier equipo puede adoptar.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "matriz",
        encabezados: ["Pilar", "Qué construimos", "Valor para el equipo"],
        filas: [
          { icono: "shield-check", tono: "correcto", celdas: ["Datos consistentes", "Transacción local, Outbox e idempotencia", "0 avisos perdidos o duplicados ante caídas"] },
          { icono: "key-round", tono: "advertencia", celdas: ["Conexión segura", "Cadena de conexión y claves fuera del código", "Cambiar de servidor o de clave sin recompilar"] },
          { icono: "container", tono: "cian", celdas: ["Reproducibilidad", "Docker, Compose y Kubernetes", "1 comando y la misma imagen en todo ambiente"] },
          { icono: "flask-conical", tono: "marino", celdas: ["Calidad", "Pruebas automáticas y pipeline en cada cambio", "Errores detectados en minutos, antes de integrar"] },
          { icono: "waypoints", tono: "violeta", celdas: ["Trazabilidad", "Logs centralizados, traceId e imagen por commit", "Diagnóstico en minutos y versiones rastreables"] },
        ],
      },
      guion: {
        decir: [
          "Gracias. Si tuviéramos que resumir el valor en una lámina, sería esta. Datos consistentes: ante una caída, no se pierde ni se duplica un aviso. [clic] Conexión segura: la cadena de conexión y las claves viven fuera del código.",
          "[clic] Reproducibilidad: un comando y la misma imagen en cualquier ambiente. [clic] Calidad: pruebas automáticas en cada cambio, antes de integrarlo. [clic] Y trazabilidad: logs en un solo lugar e imágenes rastreables hasta su commit.",
        ],
        transicion: "Y lo más importante: qué pueden aplicar ustedes desde mañana.",
      },
    },
    {
      id: "s08-manana",
      titulo: "Lo que pueden aplicar desde mañana",
      idea: "No hace falta reescribir nada: estas prácticas funcionan también con procedimientos almacenados.",
      visible: ["Sacar la cadena de conexión del código", "Guardar y avisar en la misma transacción", "Hacer idempotente lo que se reintenta", "Un identificador que cruce sistemas", "El mismo paquete en todos los ambientes"],
      valor: "Cinco prácticas concretas que se pueden empezar a aplicar sin cambiar de tecnología.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "matriz",
        encabezados: ["Práctica", "Cómo se ve en sus sistemas de hoy", "Qué evita"],
        filas: [
          { icono: "key-round", tono: "advertencia", celdas: ["Cadena de conexión fuera del código", "Variables de entorno o un gestor de secretos en el servidor", "Claves en el repositorio y recompilar por cambiar de servidor"] },
          { icono: "inbox", tono: "marino", celdas: ["Guardar y avisar en la misma transacción", "Una tabla de pendientes que llena el procedimiento y un job que la entrega", "Avisos perdidos cuando el otro sistema está caído"] },
          { icono: "fingerprint", tono: "cian", celdas: ["Idempotencia en lo que se reintenta", "Una tabla de procesados con llave única por número de operación", "Pagos, correos o registros duplicados"] },
          { icono: "waypoints", tono: "violeta", celdas: ["Un identificador que cruce sistemas", "El mismo número en el log de la aplicación, del procedimiento y del otro sistema", "Horas buscando un error entre sistemas"] },
          { icono: "container", tono: "correcto", celdas: ["El mismo paquete en todos los ambientes", "Contenedores para aplicaciones y bases de prueba", "El clásico “en mi máquina funciona”"] },
        ],
      },
      guion: {
        decir: [
          "Esta es la lámina que más nos importa que se lleven. Nada de esto exige reescribir sus sistemas; todo funciona también con procedimientos almacenados. Primero: saquen la cadena de conexión del código; usen variables de entorno o un gestor de secretos.",
          "[clic] Segundo: si un procedimiento tiene que avisarle a otro sistema, no lo llamen ahí mismo. Anoten el aviso en una tabla de pendientes, en la misma transacción, y que un job lo entregue. Ese es el Outbox. [clic] Tercero: todo lo que se reintenta, un pago, un correo, un registro, debe ser idempotente: una tabla de procesados con llave única.",
          "[clic] Cuarto: un mismo identificador en todos los logs, para seguir una operación de un sistema a otro. [clic] Y quinto: el mismo paquete en todos los ambientes, para que lo que se prueba sea lo que se despliega.",
        ],
        preguntas: [{ texto: "¿Por dónde empezamos?", respuesta: "Por la cadena de conexión: es el cambio más pequeño y baja un riesgo real de seguridad. Después, la tabla de pendientes en el proceso que más falle hoy." }],
        transicion: "Si nos llevamos solo tres ideas, que sean estas.",
      },
    },
    {
      id: "s08-aprendizajes",
      titulo: "Lo que nos llevamos",
      visible: ["Diseñar para la falla", "Automatizar la confianza", "Hacer visible el sistema"],
      valor: "Tres ideas para recordar al salir de la sala.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "0", titulo: "avisos perdidos o duplicados" }, { valor: "1", titulo: "comando para levantar todo" }],
        items: [
          { icono: "siren", titulo: "Diseñar para la falla", texto: "Guardar primero, reintentar e ignorar duplicados.", valor: "Sistemas que se recuperan solos." },
          { icono: "workflow", titulo: "Automatizar la confianza", texto: "Pruebas, pipeline, imágenes y estado declarado.", valor: "Cambiar rápido sin miedo a romper." },
          { icono: "eye", titulo: "Hacer visible el sistema", texto: "Logs, trazas, salud, Swagger y la UI.", valor: "Diagnosticar y explicar en minutos." },
        ],
      },
      guion: {
        decir: [
          "Tres ideas para cerrar. [clic] Diseñar para la falla: en un sistema distribuido algo siempre va a fallar, y la diferencia está en cómo reacciona. [clic] Automatizar la confianza: pruebas, pipeline e infraestructura declarada para cambiar rápido sin miedo. [clic] Y hacer visible el sistema: lo que no se ve no se puede diagnosticar ni explicar.",
        ],
        transicion: "Gracias por su atención.",
      },
    },
    {
      id: "s08-gracias",
      titulo: "Gracias",
      visible: ["Equipo arka-litos", "Proyecto final · Upskilling Backend Java"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Empezamos con un endpoint y terminamos con dos microservicios con sus bases de datos, empaquetados, desplegados, observados y documentados, que saben comportarse cuando algo falla.",
          "Muchas gracias por acompañarnos, de parte de todo el equipo arka-litos. Con gusto respondemos sus preguntas.",
        ],
        instrucciones: ["Quien orquesta recibe las preguntas y se las pasa a quien presentó esa parte."],
        respaldo: "docs/inicio/proyecto.md",
      },
    },
  ],
};

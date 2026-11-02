import type { Seccion } from "./tipos.ts";
import { VIDEOS, visualDeVideo } from "./videos.ts";

// Parte 7, la demostración grabada con la UI, y el cierre con los resultados
// que deja el proyecto. La UI no es el entregable ni un laboratorio aparte: es
// el ejemplo práctico de lo que se contó en las partes anteriores.

export const demostracion: Seccion = {
  id: "s07",
  numero: 7,
  titulo: "Demostración",
  corto: "Demostración",
  subtitulo: "En video, cómo interactúan los componentes: solicitudes, bandeja de salida y notificaciones.",
  temas: ["Crear y enviar", "Una caída grabada", "Reentregar"],
  icono: "monitor",
  enfoque: "video",
  rol: "demostracion",
  diapositivas: [
    {
      id: "s07-ui",
      titulo: "En video: cómo interactúan los componentes",
      idea: "De la solicitud al aviso, pasando por cada componente.",
      visible: ["La pantalla le pide a solicitudes que guarde", "Solicitudes deja el evento en la bandeja de salida", "El relevador lo entrega a notificaciones", "Notificaciones crea un solo aviso"],
      valor: "Ver lo invisible: cómo viaja un evento de un servicio a otro.",
      visual: visualDeVideo(VIDEOS.recorrido),
      guion: {
        decir: [
          "Gracias, Moises. Veamos cómo interactúan los componentes en una grabación del sistema real. La franja superior indica qué componente está trabajando en cada momento.",
          "Primero, la pantalla le pide al servicio de solicitudes que cree una nueva solicitud y esta queda en borrador.",
          "Después la enviamos. El servicio cambia el estado a enviada, guarda el evento en la bandeja de salida y responde sin esperar a que notificaciones lo reciba.",
          "Pocos segundos después, sin intervención de una persona, el relevador toma el evento de la bandeja y lo entrega a notificaciones. Finalmente, notificaciones crea un solo aviso.",
        ],
        conTusPalabras: [
          "La grabación muestra el sistema real.",
          "Solicitudes guarda y deja el evento pendiente.",
          "Notificaciones recibe el evento y crea un aviso.",
        ],
        instrucciones: [
          "El video arranca solo al llegar a la lámina. Alt+P lo pausa y lo reanuda si quieren detenerse a explicar.",
          "Narrar al ritmo de los rótulos numerados del video; la lista de la lámina tiene los mismos pasos.",
        ],
        transicion: "Ahora repetiremos el recorrido, pero esta vez apagaremos un servicio a propósito.",
      },
    },
    {
      id: "s07-caida",
      titulo: "En video: si notificaciones se cae",
      idea: "La persona no se entera; el aviso llega cuando el servicio vuelve, una sola vez.",
      visible: ["Enviar responde bien aunque notificaciones esté caído", "El aviso queda pendiente en la bandeja", "Se reintenta cada 5 segundos", "Al volver, llega un solo aviso"],
      valor: "Ver, con el sistema real, que una caída no hace perder ni duplicar información.",
      visual: visualDeVideo(VIDEOS.caida),
      guion: {
        decir: [
          "Esta grabación también utiliza el sistema real. Primero detenemos a propósito el servicio de notificaciones y la franja superior cambia a rojo.",
          "Después enviamos una solicitud y la persona no recibe un error, porque el envío no depende de la respuesta inmediata del otro servicio.",
          "Ese comportamiento es comunicación asíncrona. El evento permanece en la bandeja de salida y el relevador intenta entregarlo cada cinco segundos.",
          "Luego levantamos de nuevo notificaciones. Esa parte del video está acelerada porque el servicio necesita unos segundos para arrancar.",
          "En el siguiente intento, el evento se entrega con el mismo número y aparece un solo aviso.",
          "Para terminar, entregamos intencionalmente el mismo evento otra vez. Notificaciones reconoce el número y evita crear un segundo aviso.",
          "El resultado es que no perdemos eventos y tampoco generamos avisos duplicados.",
        ],
        conTusPalabras: [
          "Apagamos notificaciones y el trámite continúa.",
          "El evento espera y se entrega cuando el servicio regresa.",
          "Una entrega repetida no crea otro aviso.",
        ],
        instrucciones: [
          "El video arranca solo al llegar a la lámina; Alt+P lo pausa. Dura poco más de un minuto y sus rótulos numerados coinciden con la lista de la lámina.",
        ],
        preguntas: [
          { texto: "¿Cuánto tiempo puede esperar un evento pendiente?", respuesta: "Puede esperar indefinidamente porque permanece en la base. Se entrega en la primera revisión después de que notificaciones regresa." },
        ],
        transicion: "La prueba reúne varias decisiones técnicas. Ahora resumamos qué aprendimos al verla funcionar.",
      },
    },
    {
      id: "s07-aprendizajes",
      titulo: "Demostración: lo que aprendimos",
      visible: ["Diseñar para la falla, no solo para el éxito", "Hacer visible lo asíncrono", "Verlo funcionar explica más que una lámina"],
      valor: "Una herramienta que explica el sistema a cualquiera, también a quien llegue nuevo al equipo.",
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "0", titulo: "eventos perdidos durante la caída" }, { valor: "1", titulo: "aviso por evento, aunque se reentregue" }],
        items: [
          { icono: "siren", titulo: "Diseñar para la falla", texto: "Cada falla probada tiene una reacción y un mensaje.", valor: "Menos incidentes y menos llamadas a soporte." },
          { icono: "eye", titulo: "Hacer visible lo asíncrono", texto: "Pendientes y entregados en una pantalla.", valor: "Explicar el sistema sin abrir el código." },
          { icono: "lightbulb", titulo: "Verlo funcionar explica más", texto: "Provocar la falla y ver la reacción.", valor: "Material de capacitación para quien llegue al equipo." },
        ],
      },
      guion: {
        decir: [
          "La demostración nos deja tres aprendizajes. Primero, debemos diseñar para las fallas y no únicamente para el recorrido exitoso.",
          "También debemos hacer visible lo que ocurre de forma asíncrona. Sin la pestaña Enviadas, un evento pendiente quedaría oculto.",
          "Finalmente, ver el sistema funcionando facilita la explicación y convierte la misma pantalla en una herramienta para capacitar a quienes se incorporen.",
        ],
        conTusPalabras: [
          "Debemos diseñar para las fallas.",
          "Lo asíncrono debe hacerse visible.",
          "La demostración también sirve para capacitar.",
        ],
        transicion: "Para cerrar, le paso la palabra a Abdiel, que presentará los resultados.",
      },
    },
  ],
};

export const cierre: Seccion = {
  id: "s08",
  numero: null,
  titulo: "Valor y cierre",
  corto: "Cierre",
  rol: "cierre",
  diapositivas: [
    {
      id: "s08-resultados",
      titulo: "Resultados para el negocio",
      idea: "Lo que el sistema logra, en el idioma del negocio, y cómo lo comprobamos.",
      visible: ["Entregas sin pérdidas ni duplicados", "El trámite no se detiene", "Las reglas se cumplen", "Reemplaza lo que falla", "Cambios con menos riesgo"],
      valor: "Cada resultado técnico se traduce en algo que el negocio puede sentir.",
      visual: {
        tipo: "matriz",
        encabezados: ["Resultado", "Qué significa para el negocio", "Cómo lo comprobamos"],
        filas: [
          { icono: "bell", tono: "correcto", celdas: ["Entregas sin pérdidas ni duplicados", "Lo pendiente queda guardado, y reenviarlo no crea otro aviso", "Tumbamos un servicio y reentregamos el mismo evento"] },
          { icono: "activity", tono: "marino", celdas: ["El trámite no se detiene", "Se puede enviar aunque el servicio de avisos esté caído", "Enviamos con el servicio de avisos apagado"] },
          { icono: "shield-check", tono: "cian", celdas: ["Las reglas se cumplen", "No se envía dos veces ni se aprueba un borrador; el sistema explica por qué", "Una prueba automática por cada regla"] },
          { icono: "heart-pulse", tono: "correcto", celdas: ["Reemplaza lo que falla", "Una copia que falla se reemplaza, y lo pendiente sigue guardado", "Kubernetes reemplaza el servicio caído"] },
          { icono: "flask-conical", tono: "violeta", celdas: ["Cambios con menos riesgo", "Un error se detecta en minutos, antes de llegar a los usuarios", "Cada cambio pasa por pruebas automáticas"] },
        ],
      },
      guion: {
        decir: [
          "Gracias, Ricardo. Lo que acabamos de ver se traduce en estos resultados para el negocio.",
          "Primero, los eventos pendientes permanecen guardados si se interrumpe la entrega, y reenviar el mismo evento no crea otro aviso.",
          "Segundo, el trámite no se detiene. Aunque el servicio de avisos esté caído, la persona puede enviar su solicitud y el aviso llega cuando el servicio regresa.",
          "Tercero, las reglas del negocio se cumplen y cada una tiene una prueba que la vigila.",
          "Cuarto, Kubernetes puede reemplazar una copia que falla, mientras los eventos pendientes permanecen guardados en la base.",
          "Por último, los cambios llegan con menos riesgo, porque detectamos los errores en minutos y antes de que afecten a los usuarios.",
        ],
        conTusPalabras: [
          "No se pierden eventos ni se duplican avisos.",
          "El trámite continúa aunque notificaciones esté detenido.",
          "Las pruebas y la recuperación reducen el riesgo.",
        ],
        transicion: "Estos resultados no dependen de la suerte, sino de varias decisiones que trabajan juntas.",
      },
    },
    {
      id: "s08-sostiene",
      titulo: "Lo que sostiene los resultados",
      idea: "Detrás de cada resultado hay una decisión técnica concreta.",
      visible: ["Datos consistentes", "Configuración separada", "Reproducibilidad", "Calidad", "Trazabilidad"],
      valor: "Cinco pilares que cualquier equipo puede adoptar.",
      visual: {
        tipo: "matriz",
        encabezados: ["Pilar", "Qué construimos", "Qué aporta"],
        filas: [
          { icono: "shield-check", tono: "correcto", celdas: ["Datos consistentes", "Transacción, bandeja de salida e idempotencia", "Eventos guardados y sin avisos duplicados ante caídas"] },
          { icono: "key-round", tono: "advertencia", celdas: ["Configuración separada", "Datos de conexión y claves fuera del código", "Cambiar de servidor o de clave sin tocar el sistema"] },
          { icono: "container", tono: "cian", celdas: ["Reproducibilidad", "Docker, Compose y Kubernetes", "1 comando y el mismo sistema en todo ambiente"] },
          { icono: "flask-conical", tono: "marino", celdas: ["Calidad", "Pruebas automáticas y pipeline en cada cambio", "Errores detectados en minutos, antes de integrar"] },
          { icono: "waypoints", tono: "violeta", celdas: ["Trazabilidad", "Registros en un solo lugar y número de seguimiento", "Saber qué pasó y qué versión corre, en minutos"] },
        ],
      },
      guion: {
        decir: [
          "Detrás de cada resultado hay una práctica que aprendimos y aplicamos. La transacción, la bandeja de salida y el control de duplicados mantienen consistentes los datos.",
          "La configuración está separada del código, así que podemos cambiar las claves sin modificar la aplicación.",
          "También ejecutamos el mismo sistema en distintos ambientes mediante un solo comando. Las pruebas automáticas revisan cada cambio antes de incorporarlo.",
          "Además, reunimos los registros en un solo lugar y relacionamos cada versión con el cambio que la produjo.",
          "Así protegemos los datos, mantenemos las claves fuera del código, repetimos la instalación, revisamos los cambios y podemos identificar de dónde salió cada versión.",
          "La mayoría puede comenzar a aplicarse sin reemplazar la tecnología que ya utilizamos.",
        ],
        conTusPalabras: [
          "Cada resultado se apoya en una práctica concreta.",
          "Datos, configuración, pruebas y registros trabajan juntos.",
          "Podemos aplicar estas ideas sin cambiar de tecnología.",
        ],
        transicion: "Si tuviéramos que resumir todo el recorrido en tres ideas, serían las siguientes.",
      },
    },
    {
      id: "s08-aprendizajes",
      titulo: "Lo que nos llevamos",
      visible: ["Diseñar para la falla", "Automatizar las revisiones", "Hacer visible el sistema"],
      valor: "Tres ideas para recordar al salir de la sala.",
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "0", titulo: "eventos perdidos si un servicio se cae" }, { valor: "1", titulo: "comando para levantar todo" }],
        items: [
          { icono: "siren", titulo: "Diseñar para la falla", texto: "Guardar primero, reintentar e ignorar duplicados.", valor: "Sistemas que se recuperan solos." },
          { icono: "workflow", titulo: "Automatizar las revisiones", texto: "Pruebas, pipeline e imágenes.", valor: "Cambiar rápido sin miedo a romper." },
          { icono: "eye", titulo: "Hacer visible el sistema", texto: "Registros, seguimiento y salud.", valor: "Diagnosticar y explicar en minutos." },
        ],
      },
      guion: {
        decir: [
          "De toda la capacitación nos llevamos tres ideas. La primera es diseñar pensando en la falla, porque algún componente fallará y debemos definir cómo responderá el sistema.",
          "La segunda es automatizar las revisiones y dejar la infraestructura descrita en archivos. Así podemos hacer cambios con mayor confianza y menor riesgo.",
          "La tercera es hacer visible el sistema. Lo que no podemos ver tampoco podemos diagnosticarlo ni explicarlo con claridad.",
        ],
        conTusPalabras: [
          "Diseñamos pensando en las fallas.",
          "La automatización nos permite cambiar con confianza.",
          "Lo visible se puede diagnosticar y explicar.",
        ],
        transicion: "Ese es el aprendizaje que conecta todo el recorrido: prepararnos para las fallas, revisar los cambios y poder entender qué ocurre en el sistema.",
      },
    },
    {
      id: "s08-gracias",
      titulo: "Gracias",
      visible: ["Equipo arka-litos", "Proyecto final · Upskilling Backend Java"],
      guion: {
        decir: [
          "Comenzamos con una sola operación en Java y terminamos con un sistema completo de dos servicios, cada uno con su propia base de datos.",
          "El sistema quedó empaquetado, instalado, vigilado y documentado. Además, puede conservar la información y recuperarse cuando una de sus partes falla.",
          "Muchas gracias. Con gusto respondemos sus preguntas.",
        ],
        conTusPalabras: [
          "Pasamos de una operación a un sistema completo.",
          "El sistema sabe conservar los datos y recuperarse.",
          "Muchas gracias. Escuchamos sus preguntas.",
        ],
        instrucciones: ["Abdiel recibe las preguntas y se las pasa a quien presentó esa parte."],
        respaldo: "docs/inicio/proyecto.md",
      },
    },
  ],
};

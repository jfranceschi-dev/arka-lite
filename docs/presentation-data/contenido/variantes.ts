import type { Diapositiva, Guion, ModoDemo, Seccion } from "./tipos.ts";
import { VIDEOS, visualDeVideo } from "./videos.ts";

// Lo que cambia en el ejecutivo según cómo se muestra la UI. En vivo es la
// presentación normal. Con videos, la parte 7 cuenta dos videos grabados con
// la UI real (capturas/videos/), para cuando no se puede hacer en vivo. Sin
// demostración, la parte 7 no se presenta y nada la anuncia. Aquí está solo
// lo que cambia; la validación avisa si un texto a reemplazar ya no existe.

export interface Cambio {
  // [texto actual, texto nuevo], en cualquier texto de la lámina.
  reemplazos?: [string, string][];
  // Campos que se cambian completos.
  campos?: Omit<Partial<Diapositiva>, "guion" | "id" | "recorridos">;
  // Campos del guion que se cambian completos.
  guion?: Partial<Guion>;
}

export interface Modo {
  // Partes que no se presentan.
  sinSecciones?: string[];
  secciones?: Record<string, Partial<Omit<Seccion, "diapositivas">>>;
  // Sin el sistema a mano, ninguna lámina propone una demostración.
  sinDemostraciones?: boolean;
  laminas: Record<string, Cambio>;
}

// Codespaces se presenta igual, pero ya no es «así hacemos la demostración».
const codespaces: Cambio = {
  reemplazos: [
    ["levantado en la nube desde una rama: así hacemos la demostración.", "levantado en la nube desde una rama: cualquiera lo prueba o lo muestra."],
    ["Una pieza que nos resolvió la demostración: GitHub Codespaces.", "Una pieza que resuelve cómo probar o mostrar el sistema sin instalar nada: GitHub Codespaces."],
    ["[clic] Y la demostración se hace desde el navegador.", "[clic] Y todo se usa desde el navegador."],
  ],
};

const PORTADA_CLICS = "Cada diagrama se arma con clics: en el texto, ▶ CLIC marca el momento de hacer clic.";

export const CAMBIOS: Record<Exclude<ModoDemo, "vivo">, Modo> = {
  video: {
    sinDemostraciones: true,
    secciones: {
      s07: {
        enfoque: "video",
        subtitulo: "La UI ejemplifica, en video, lo que contamos: estados, Outbox, idempotencia y salud.",
        temas: ["Crear y enviar", "Una caída grabada", "Reentregar"],
      },
    },
    laminas: {
      "s00-portada": {
        reemplazos: [["con diagramas y una demostración en vivo,", "con diagramas y videos del sistema funcionando,"]],
        guion: {
          instrucciones: [
            "Antes de empezar, abrir este PPTX en la computadora de la sala y probar los videos de la parte 7: van dentro del archivo, no necesitan internet ni el sistema arriba.",
            PORTADA_CLICS,
          ],
        },
      },
      "s00-agenda": {
        reemplazos: [
          ["Observabilidad y demostración en vivo", "Observabilidad y demostración en video"],
          ["[clic] y cerramos con una demostración en vivo: vamos a tumbar un servicio a propósito para que vean cómo se comporta el sistema.", "[clic] y cerramos con la demostración en video: grabamos el sistema real mientras tumbábamos un servicio a propósito, para que vean cómo se comporta."],
        ],
      },
      "s05-codespaces": codespaces,
      "s06-aprendizajes": { guion: { transicion: "Y ahora sí, veamos todo esto funcionando, en video." } },
      "s07-ui": {
        campos: {
          titulo: "La UI en video: lo que contamos, funcionando",
          idea: "Un recorrido de un minuto: crear, enviar y seguir una solicitud hasta su aviso.",
          visual: visualDeVideo(VIDEOS.recorrido),
        },
        guion: {
          decir: [
            "Gracias. Todo lo que les contamos se puede ver funcionando, y para eso construimos esta interfaz. No es el entregable del proyecto: es la forma de ejemplificar cada parte. La grabamos con el sistema real, tal cual se usa.",
            "[clic] Primero creamos una solicitud: queda en borrador. La enviamos, y fíjense que la respuesta es inmediata: pasa a enviada y su evento queda en la bandeja de salida.",
            "En Enviadas se ve el evento en camino y, en pocos segundos, consumido y con su aviso, sin que nadie haga nada. Después, Salud: los dos servicios y sus bases en verde. Y Ayuda: cada concepto con un diagrama que se reproduce paso a paso.",
            "Ahora, la prueba más interesante: tumbar un servicio a propósito.",
          ],
          instrucciones: [
            "El video va dentro del PPTX: el clic lo reproduce. Alt+P lo pausa y lo reanuda si quieren detenerse a explicar.",
            "Narrar al ritmo de los rótulos numerados del video; la lista de la lámina tiene los mismos pasos.",
          ],
          transicion: "Vamos con la caída.",
        },
      },
      "s07-caida": {
        campos: {
          titulo: "En video: si notificaciones se cae",
          visual: visualDeVideo(VIDEOS.caida),
          valor: "Ver, con el sistema real, que una caída no hace perder ni duplicar información.",
        },
        guion: {
          decir: [
            "Esto también lo grabamos con el sistema real, sin trucos. [clic] Detenemos notificaciones a propósito, con docker compose stop, y en Salud aparece sin respuesta.",
            "Enviamos una solicitud y la respuesta es buena: la persona no ve ningún error, porque enviar no depende del otro servicio. Eso es lo asíncrono. En Enviadas aparece el aviso amarillo: el evento espera en la bandeja de salida y el relevador reintenta cada cinco segundos.",
            "Levantamos notificaciones; esa parte va acelerada, porque el servicio tarda unos segundos en arrancar. En el siguiente ciclo el evento se entrega con el mismo número y aparece exactamente un aviso. Eso es el Outbox.",
            "Y para cerrar, reentregamos ese mismo evento a propósito: notificaciones lo reconoce y no crea otro aviso. Cero perdidos y cero duplicados.",
          ],
          instrucciones: [
            "El clic reproduce el video; Alt+P lo pausa. Dura poco más de un minuto y sus rótulos numerados coinciden con la lista de la lámina.",
            "Las filas anteriores dicen «Aviso no disponible»: notificaciones guarda los textos en memoria y se reinició. Si preguntan, la respuesta está abajo.",
          ],
          preguntas: [
            { texto: "¿Cuánto tiempo puede esperar un evento pendiente?", respuesta: "Indefinidamente: está en la base. Se entrega en el primer ciclo después de que notificaciones vuelve." },
            { texto: "¿Por qué las otras filas dicen «Aviso no disponible»?", respuesta: "Notificaciones guarda el texto de los avisos en memoria y, al reiniciarse, lo pierde. Lo que sí guarda en su base es qué eventos ya procesó; por eso no los repite." },
          ],
          ampliar: [
            "El video es una grabación real: los comandos de la terminal se ejecutaron en ese momento contra el sistema levantado con Docker Compose.",
            "Si alguien quiere verlo funcionando después de la presentación, el sistema se levanta con un comando o en un Codespace.",
          ],
        },
      },
    },
  },
  sin: {
    sinSecciones: ["s07"],
    sinDemostraciones: true,
    laminas: {
      "s00-portada": {
        reemplazos: [["con diagramas y una demostración en vivo,", "con diagramas y ejemplos reales del sistema,"]],
        guion: { instrucciones: [PORTADA_CLICS] },
      },
      "s00-agenda": {
        reemplazos: [
          ["Observabilidad y demostración en vivo", "Observabilidad: vista general"],
          ["[clic] Después, una mirada general a la observabilidad, [clic] y cerramos con una demostración en vivo: vamos a tumbar un servicio a propósito para que vean cómo se comporta el sistema.", "[clic] Y después, una mirada general a la observabilidad, antes de cerrar con lo que pueden aplicar desde mañana."],
        ],
      },
      "s02-practica": { reemplazos: [["Lo vemos en la parte de interconexión y en la demostración.", "Lo vemos en la parte de interconexión."]] },
      "s05-codespaces": codespaces,
      "s06-logs": { reemplazos: [["que la interfaz muestra en verde o en rojo; lo van a ver en la demostración.", "que la interfaz muestra en verde o en rojo."]] },
      "s06-aprendizajes": { guion: { transicion: "Para cerrar, le devuelvo la palabra a quien abrió, con el valor que deja todo esto." } },
    },
  },
};

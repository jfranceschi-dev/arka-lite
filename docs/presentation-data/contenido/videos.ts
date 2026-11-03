import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DIR_VIDEOS } from "../entregables.ts";
import type { Visual } from "./tipos.ts";

// Videos de la versión con videos: tres con el sistema real (cómo interactúan
// los componentes, la caída de notificaciones y la búsqueda de registros en
// Grafana) y uno simulado del camino de un cambio hasta el despliegue. capturas/grabar-videos.ts los graba y usa estos mismos pasos como rótulos numerados del video; la lámina los lista al
// lado, así lo que se lee y lo que se ve coinciden.
export interface Video {
  // En capturas/videos/.
  archivo: string;
  // Imagen PNG que se ve antes de reproducir y en el PDF de láminas.
  portada: string;
  // Portada que abre el video.
  titulo: string;
  subtitulo: string;
  // Dirección que se muestra en la barra del marco de navegador: el video
  // recorre varias pestañas, así que va la de la UI.
  url: string;
  pasos: string[];
}

export const VIDEOS = {
  recorrido: {
    archivo: "demo-recorrido.mp4",
    portada: "demo-recorrido.png",
    titulo: "De la solicitud al aviso",
    subtitulo: "Cómo interactúan los componentes cuando todos están arriba.",
    url: "ARKA-Lite · componentes",
    pasos: [
      "La pantalla le pide a solicitudes crearla: queda en BORRADOR",
      "Al enviarla, solicitudes deja el evento en la bandeja de salida",
      "El relevador lo entrega a notificaciones, que crea un solo aviso",
    ],
  },
  caida: {
    archivo: "demo-caida.mp4",
    portada: "demo-caida.png",
    titulo: "Si notificaciones se cae",
    subtitulo: "Tumbamos un servicio a propósito: el aviso no se pierde ni se duplica.",
    url: "ARKA-Lite · componentes",
    pasos: [
      "Detenemos notificaciones a propósito",
      "Enviamos una solicitud: responde bien, sin errores",
      "El evento espera en la bandeja de salida y se reintenta cada 5 segundos",
      "Levantamos notificaciones otra vez",
      "Llega un solo aviso, con el mismo evento",
      "Reentregamos el mismo evento a propósito: no se duplica",
    ],
  },
  registros: {
    archivo: "demo-registros.mp4",
    portada: "demo-registros.png",
    titulo: "Un aviso no llegó: ¿dónde buscamos?",
    subtitulo: "Todos los registros en un solo lugar, y una búsqueda por el código de la solicitud.",
    url: "Grafana · registros",
    pasos: [
      "Promtail recolecta y Loki guarda los registros de todos los servicios",
      "En Grafana escribimos el código de la solicitud",
      "Aparecen juntos los registros de solicitudes y de notificaciones",
      "Se ve hasta dónde llegó: aquí, el aviso se creó",
    ],
  },
  cicd: {
    archivo: "ejemplo-cicd.mp4",
    portada: "ejemplo-cicd.png",
    titulo: "Del push al despliegue",
    subtitulo: "Ejemplo ilustrativo: un cambio, desde la computadora de quien desarrolla hasta la pantalla de los usuarios.",
    url: "Ejemplo ilustrativo",
    pasos: [
      "Quien desarrolla termina su cambio y hace push: lo sube a su rama en GitHub",
      "Abre un Pull Request y otra persona revisa y aprueba el cambio",
      "El pipeline arranca solo: compila y corre todas las pruebas",
      "Con el merge, el cambio entra a main y se publica la imagen",
      "Se instala la imagen nueva y los usuarios ya ven la versión 1.5",
    ],
  },
} satisfies Record<string, Video>;

export type NombreVideo = keyof typeof VIDEOS;

// Lo que grabar-videos.ts anota de cada video grabado.
export interface Grabado {
  segundos: number;
  grabado: string;
}

export const MANIFIESTO = join(DIR_VIDEOS, "videos.json");

export function grabados(): Record<string, Grabado> {
  return existsSync(MANIFIESTO) ? (JSON.parse(readFileSync(MANIFIESTO, "utf8")) as Record<string, Grabado>) : {};
}

// Duración real del video; sin grabar, no se sabe.
export function segundosDeVideo(archivo: string): number | undefined {
  return grabados()[archivo]?.segundos;
}

// El visual de la lámina: el video en su marco y sus pasos al lado.
export function visualDeVideo(v: Video): Visual {
  return { tipo: "video", archivo: v.archivo, portada: v.portada, url: v.url, pasos: v.pasos };
}

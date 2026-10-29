import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DIR_VIDEOS } from "../entregables.ts";
import type { Visual } from "./tipos.ts";

// Videos de la demostración con la UI, para la variante que no puede hacerla
// en vivo. capturas/grabar-videos.ts los graba con el sistema arriba y usa
// estos mismos pasos como rótulos numerados del video; la lámina los lista al
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
    titulo: "La UI de ARKA-Lite",
    subtitulo: "Crear, enviar y seguir una solicitud hasta su aviso, con los dos servicios arriba.",
    url: "localhost:8088",
    pasos: [
      "Creamos una solicitud: queda en BORRADOR",
      "La enviamos: pasa a ENVIADA y su evento queda en la bandeja de salida",
      "En Enviadas, el evento llega solo a notificaciones y crea un aviso",
      "Salud: los dos servicios y sus bases, en verde",
      "Ayuda: cada concepto con un diagrama paso a paso",
    ],
  },
  caida: {
    archivo: "demo-caida.mp4",
    portada: "demo-caida.png",
    titulo: "Si notificaciones se cae",
    subtitulo: "Tumbamos un servicio a propósito: el aviso no se pierde ni se duplica.",
    url: "localhost:8088",
    pasos: [
      "Detenemos notificaciones a propósito",
      "Enviamos una solicitud: responde bien, sin errores",
      "El evento espera en la bandeja de salida y se reintenta cada 5 segundos",
      "Levantamos notificaciones otra vez",
      "Llega un solo aviso, con el mismo evento",
      "Reentregamos el mismo evento a propósito: no se duplica",
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

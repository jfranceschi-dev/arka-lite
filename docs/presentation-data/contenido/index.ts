import type { Diapositiva, Recorrido, Seccion } from "./tipos.ts";
import { apertura, sistema, servicio } from "./secciones-a.ts";
import { diseno, datos } from "./secciones-b.ts";
import { despliegue, observabilidad } from "./secciones-c.ts";
import { ensamblaje, cierre } from "./secciones-d.ts";

// Orden de la presentación: del sistema visto por fuera a su ensamblaje.
export const secciones: Seccion[] = [
  apertura,
  sistema,
  servicio,
  diseno,
  datos,
  despliegue,
  observabilidad,
  ensamblaje,
  cierre,
];

// Una diapositiva del recorrido con su sección. Las secciones numeradas
// empiezan con una portada generada desde sus cinco claves.
export interface Lamina {
  seccion: Seccion;
  diapositiva: Diapositiva | null;
  id: string;
}

export function idPortada(seccion: Seccion): string {
  return `${seccion.id}-portada-seccion`;
}

export function laminas(recorrido: Recorrido): Lamina[] {
  const salida: Lamina[] = [];
  for (const s of secciones) {
    if (s.claves) salida.push({ seccion: s, diapositiva: null, id: idPortada(s) });
    for (const d of s.diapositivas) {
      if (d.recorridos.includes(recorrido)) salida.push({ seccion: s, diapositiva: d, id: d.id });
    }
  }
  return salida;
}

export function etiquetaSeccion(s: Seccion): string {
  return s.numero === null ? s.titulo : `${s.numero} · ${s.titulo}`;
}

export * from "./tipos.ts";
export { participantes, participantePorId } from "./participantes.ts";

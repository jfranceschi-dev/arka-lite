import type { Diapositiva, Recorrido, Seccion } from "./tipos.ts";
import { apertura, fundamentos, arquitectura } from "./secciones-a.ts";
import { datos } from "./secciones-b.ts";
import { plataforma, cicd, observabilidad } from "./secciones-c.ts";
import { documentacion, laboratorio, cierre } from "./secciones-d.ts";

// Orden de la presentación: del código a la operación, la UI como laboratorio
// y el valor que deja.
export const secciones: Seccion[] = [
  apertura,
  fundamentos,
  arquitectura,
  datos,
  plataforma,
  cicd,
  observabilidad,
  documentacion,
  laboratorio,
  cierre,
];

// Una diapositiva del recorrido con su sección.
export interface Lamina {
  seccion: Seccion;
  diapositiva: Diapositiva;
  id: string;
}

export function laminas(recorrido: Recorrido): Lamina[] {
  const salida: Lamina[] = [];
  for (const s of secciones) {
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

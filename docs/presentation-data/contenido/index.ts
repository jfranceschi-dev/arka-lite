import type { Diapositiva, Recorrido, Seccion } from "./tipos.ts";
import { apertura, fundamentos, arquitectura } from "./secciones-a.ts";
import { datos, interconexion } from "./secciones-b.ts";
import { devops, observabilidad } from "./secciones-c.ts";
import { demostracion, cierre } from "./secciones-d.ts";
import { AMPLIAR } from "./ampliar.ts";

// Orden de la presentación: las partes que el equipo anterior trabajó a fondo
// (fundamentos y arquitectura) en vista general; después, a fondo, la base
// de datos, la interconexión y DevOps; la observabilidad, la demostración en
// vivo con la UI y el valor que deja.
export const secciones: Seccion[] = [
  apertura,
  fundamentos,
  arquitectura,
  datos,
  interconexion,
  devops,
  observabilidad,
  demostracion,
  cierre,
];

// El material para decir si hay tiempo vive aparte, para que las secciones
// sigan siendo fáciles de leer; aquí se suma a cada lámina.
for (const s of secciones) for (const d of s.diapositivas) if (AMPLIAR[d.id]) d.guion.ampliar = AMPLIAR[d.id];

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

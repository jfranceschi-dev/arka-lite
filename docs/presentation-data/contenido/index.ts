import { modoDe, type Diapositiva, type Seccion, type Variante } from "./tipos.ts";
import { apertura, fundamentos, arquitectura } from "./secciones-a.ts";
import { datos, interconexion } from "./secciones-b.ts";
import { devops, observabilidad } from "./secciones-c.ts";
import { demostracion, cierre } from "./secciones-d.ts";
import { AMPLIAR } from "./ampliar.ts";
import { CAMBIOS, type Cambio } from "./variantes.ts";

// Orden de la presentación: las partes que el equipo anterior trabajó a fondo
// (fundamentos y arquitectura) en vista general; después, en detalle, la base
// de datos, la interconexión y DevOps; la observabilidad, la demostración con
// la UI y el valor que deja.
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

// Las secciones que presenta la versión, con sus cambios (variantes.ts).
export function seccionesDe(variante: Variante): Seccion[] {
  const m = CAMBIOS[modoDe(variante)];
  return secciones.filter((s) => !m?.sinSecciones?.includes(s.id));
}

// Las partes numeradas de la versión: la agenda, la portada y el avance.
export function partesDe(variante: Variante): Seccion[] {
  return seccionesDe(variante).filter((s) => s.numero !== null);
}

// Una copia de la lámina con los cambios de la versión. Los reemplazos corren
// sobre todo su texto.
export function aplicarCambio(d: Diapositiva, c: Cambio): Diapositiva {
  let json = JSON.stringify(d);
  for (const [antes, despues] of c.reemplazos ?? []) json = json.replaceAll(JSON.stringify(antes).slice(1, -1), JSON.stringify(despues).slice(1, -1));
  const nueva = JSON.parse(json) as Diapositiva;
  return { ...nueva, ...c.campos, guion: { ...nueva.guion, ...c.guion } };
}

export function laminas(variante: Variante): Lamina[] {
  const m = CAMBIOS[modoDe(variante)];
  const partes = partesDe(variante);
  const salida: Lamina[] = [];
  for (const s of seccionesDe(variante)) {
    for (const original of s.diapositivas) {
      if (m?.sinLaminas?.includes(original.id)) continue;
      const cambio = m?.laminas[original.id];
      let d = cambio ? aplicarCambio(original, cambio) : original;
      if (d.visual?.tipo === "ruta") d = { ...d, visual: { tipo: "ruta", partes } };
      salida.push({ seccion: s, diapositiva: d, id: d.id });
    }
  }
  return salida;
}

export function etiquetaSeccion(s: Seccion): string {
  return s.numero === null ? s.titulo : `${s.numero} · ${s.titulo}`;
}

export * from "./tipos.ts";

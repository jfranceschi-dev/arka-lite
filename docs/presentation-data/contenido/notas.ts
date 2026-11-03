import type { Lamina } from "./index.ts";
import { quienPresenta, rolDe } from "./reparto.ts";

// Notas del expositor en texto plano para PowerPoint: quién presenta, el texto
// para leer de corrido y, aparte, lo mínimo de apoyo. El material adicional
// queda en los guiones.
export function textoNotas(l: Lamina): string {
  const g = l.diapositiva.guion;
  const partes: string[] = [`PRESENTA: ${quienPresenta(rolDe(l))}`, "", ...g.decir, ...(g.transicion ? [g.transicion] : [])];
  partes.push("", "SI SE TE OLVIDA, DI ESTO", ...g.conTusPalabras.map((t) => `• ${t}`));
  if (g.instrucciones?.length) partes.push("", "QUÉ HACER (no se dice)", ...g.instrucciones.map((t) => `• ${t}`));
  for (const p of g.preguntas ?? []) partes.push("", `SI PREGUNTAN: ${p.texto}`, p.respuesta);
  return partes.join("\n");
}

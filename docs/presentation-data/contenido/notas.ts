import { CLIC, etiquetaSeccion, type Lamina } from "./index.ts";
import { quienPresenta, rolDe } from "./reparto.ts";

// Notas del expositor en texto plano para PowerPoint. Dicen quién presenta
// la lámina en cada división del equipo y separan lo que se dice de las
// instrucciones para quien expone.
export function textoNotas(l: Lamina): string {
  const partes: string[] = [`SECCIÓN: ${etiquetaSeccion(l.seccion)}`, `PRESENTA: ${quienPresenta(rolDe(l))}`];
  const g = l.diapositiva.guion;
  if (l.diapositiva.valor) partes.push("LO QUE SE LLEVA EL STAFF", l.diapositiva.valor);
  // ▶ CLIC: el momento de hacer clic para que aparezca la siguiente pieza.
  partes.push("QUÉ DECIR (▶ CLIC = hacer clic)", ...g.decir.map((t) => `“${t.replaceAll(CLIC, "▶ CLIC")}”`));
  const hacer = [...(g.instrucciones ?? []), ...(g.demo ? [`Mostrar: ${g.demo.accion} Debe verse: ${g.demo.evidencia}`] : [])];
  if (hacer.length) partes.push("QUÉ HACER (no se dice)", ...hacer.map((t) => `• ${t}`));
  if (g.ampliar?.length) partes.push("SI HAY TIEMPO, SE PUEDE AGREGAR", ...g.ampliar.map((t) => `“${t}”`));
  for (const p of g.preguntas ?? []) partes.push("SI PREGUNTAN", p.texto, "RESPUESTA CORTA", p.respuesta);
  if (g.transicion) partes.push("PARA PASAR", `“${g.transicion}”`);
  if (g.respaldo) partes.push("PARA LEER MÁS", g.respaldo);
  return partes.join("\n");
}

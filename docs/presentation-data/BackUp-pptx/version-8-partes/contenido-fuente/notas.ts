import { etiquetaSeccion, type Lamina } from "./index.ts";

// Notas del expositor en texto plano para PowerPoint. Separan lo que se dice
// de las instrucciones para quien expone. No dicen quién presenta: el reparto
// se decide el día de la presentación.
export function textoNotas(l: Lamina): string {
  const partes: string[] = [`SECCIÓN: ${etiquetaSeccion(l.seccion)}`];
  const g = l.diapositiva.guion;
  partes.push("QUÉ DECIR", ...g.decir.map((t) => `“${t}”`));
  const hacer = [...(g.instrucciones ?? []), ...(g.demo ? [`Mostrar: ${g.demo.accion} Debe verse: ${g.demo.evidencia}`] : [])];
  if (hacer.length) partes.push("QUÉ HACER (no se dice)", ...hacer.map((t) => `• ${t}`));
  if (g.pregunta) partes.push("SI PREGUNTAN", g.pregunta.texto, "RESPUESTA CORTA", g.pregunta.respuesta);
  if (g.transicion) partes.push("PARA PASAR", `“${g.transicion}”`);
  if (g.respaldo) partes.push("PARA LEER MÁS", g.respaldo);
  return partes.join("\n");
}

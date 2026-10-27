import { etiquetaSeccion, type Lamina } from "./index.ts";
import { participantePorId } from "./participantes.ts";

// Notas del expositor en texto plano para PowerPoint. Separan lo que se dice
// de las instrucciones para quien expone.
export function textoNotas(l: Lamina): string {
  const p = participantePorId(l.seccion.participante);
  const partes: string[] = [`PRESENTA: ${p.nombre} · ${etiquetaSeccion(l.seccion)}`];
  const d = l.diapositiva;
  if (!d) {
    const c = l.seccion.claves;
    partes.push(
      "QUÉ DECIR",
      `“Ahora vamos con ${l.seccion.titulo.toLowerCase()}. Primero, qué problema resuelve.”`,
      "QUÉ HACER (no se dice)",
      "Leer las cinco preguntas antes de avanzar.",
    );
    if (c) partes.push("RESPUESTAS", `Problema: ${c.problema}`, `Cómo funciona: ${c.sencillo}`, `Cómo se ve: ${c.visual}`, `En ARKA-Lite: ${c.aplicacion}`, `Cómo se comprueba: ${c.evidencia}`);
    return partes.join("\n");
  }
  const g = d.guion;
  partes.push("QUÉ DECIR", ...g.decir.map((t) => `“${t}”`));
  const hacer = [...(g.instrucciones ?? []), ...(g.demo ? [`Mostrar: ${g.demo.accion} Debe verse: ${g.demo.evidencia}`] : [])];
  if (hacer.length) partes.push("QUÉ HACER (no se dice)", ...hacer.map((t) => `• ${t}`));
  if (g.pregunta) partes.push("SI PREGUNTAN", g.pregunta.texto, "RESPUESTA CORTA", g.pregunta.respuesta);
  if (g.transicion) partes.push("PARA PASAR", `“${g.transicion}”`);
  if (g.respaldo) partes.push("PARA LEER MÁS", g.respaldo);
  return partes.join("\n");
}

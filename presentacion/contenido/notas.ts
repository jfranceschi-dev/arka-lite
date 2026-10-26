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
      "TEXTO PARA DECIR",
      `“Ahora vamos con ${l.seccion.titulo.toLowerCase()}. Primero, qué problema resuelve.”`,
      "INSTRUCCIONES (no se dicen)",
      "Leer en voz alta las cinco preguntas antes de avanzar.",
    );
    if (c) partes.push("RESPUESTAS", `Problema: ${c.problema}`, `En sencillo: ${c.sencillo}`, `Visual: ${c.visual}`, `En ARKA-Lite: ${c.aplicacion}`, `Evidencia: ${c.evidencia}`);
    return partes.join("\n");
  }
  const g = d.guion;
  partes.push("TEXTO PARA DECIR", ...g.decir.map((t) => `“${t}”`));
  if (g.instrucciones?.length) partes.push("INSTRUCCIONES (no se dicen)", ...g.instrucciones.map((t) => `• ${t}`));
  if (g.pregunta) partes.push("PREGUNTA AL PÚBLICO", g.pregunta.texto, "RESPUESTA ESPERADA", g.pregunta.respuesta);
  if (g.demo) partes.push("DEMOSTRACIÓN SUGERIDA", g.demo.accion, "EVIDENCIA QUE DEBERÍA OBSERVARSE", g.demo.evidencia);
  if (g.transicion) partes.push("TRANSICIÓN", `“${g.transicion}”`);
  if (g.respaldo) partes.push("RESPALDO", g.respaldo);
  return partes.join("\n");
}

// Genera los guiones en Markdown desde la misma fuente que el PPTX, en
// docs/presentation-data/guiones/: un guion por variante (resumen, ejecutivo y
// técnico). No reparte láminas por persona: quién presenta cada parte se
// decide aparte.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DIR_GUIONES } from "../entregables.ts";
import { laminas, etiquetaSeccion, NOMBRE_RECORRIDO, RECORRIDOS, secciones, type Lamina } from "../contenido/index.ts";
import type { Recorrido } from "../contenido/tipos.ts";
import { lineasDeVisual, nombreDeVisual } from "../contenido/visuales.ts";
import { diagramaPorId } from "../diagramas/definiciones.ts";

const base = DIR_GUIONES;
mkdirSync(base, { recursive: true });
// Los guiones por participante de la versión anterior ya no se generan.
rmSync(join(base, "participantes"), { recursive: true, force: true });

const AVISO = "> Archivo generado por `npm run guiones` desde `docs/presentation-data/contenido/`. No editar a mano: los cambios se hacen en la fuente.";

const CERTEZA = { implementado: "ya existe en el código", ejemplo: "ejemplo para explicar", propuesta: "propuesta, no existe aún" } as const;

const DESCRIPCION: Record<Recorrido, string> = {
  resumen: "Charla corta para el staff: el sistema, la consistencia de datos, el comportamiento ante fallas, la plataforma, el valor y lo aprendido.",
  ejecutivo: "Todas las partes, cada una con su lámina de aprendizajes, sin código.",
  tecnico: "El recorrido ejecutivo más el código, la configuración y los diagramas detallados.",
};

function bloqueLamina(l: Lamina, numero: number, recorrido: Recorrido): string {
  const d = l.diapositiva;
  const salida: string[] = [];
  salida.push(`### ${numero}. ${d.titulo}`, "");
  if (d.visual && !d.tabla) {
    salida.push(`**En pantalla · ${nombreDeVisual(d.visual)}:**`, "", ...lineasDeVisual(d.visual).map((v) => `- ${v}`), "");
    salida.push("**Ideas clave:**", "", ...d.visible.map((v) => `- ${v}`), "");
  } else {
    salida.push("**En pantalla:**", "", ...d.visible.map((v) => `- ${v}`), "");
  }
  if (d.comparacion) salida.push(`**Comparación:** ${d.comparacion}`, "");
  if (d.porque) salida.push(`**Por qué importa:** ${d.porque}`, "");
  if (d.diagrama) {
    const fig = diagramaPorId(d.diagrama);
    salida.push(`**Diagrama · ${fig.titulo}.** Cada número coincide con el de la flecha en la lámina.`, "", ...fig.pasos.map((p, i) => `${i + 1}. ${p.texto}`), "");
  }
  if (d.tabla) {
    const celda = (t: string) => t.replace(/\|/g, "\\|");
    salida.push(`| ${d.tabla.encabezados.map(celda).join(" | ")} |`, `| ${d.tabla.encabezados.map(() => "---").join(" | ")} |`, ...d.tabla.filas.map((f) => `| ${f.map(celda).join(" | ")} |`), "");
  }
  if (d.marcas?.length) salida.push(`**Ojo:** ${d.marcas.map((m) => `${m.texto} (${CERTEZA[m.certeza]})`).join(" · ")}`, "");
  if (d.codigo && recorrido === "tecnico") salida.push(`**Código:** \`${d.codigo.archivo}\``, "");
  salida.push("**Qué decir**", "", ...d.guion.decir.flatMap((t) => [`> ${t}`, ">"]).slice(0, -1), "");
  const hacer = [...(d.guion.instrucciones ?? []), ...(d.guion.demo ? [`Mostrar: ${d.guion.demo.accion} Debe verse: ${d.guion.demo.evidencia}`] : [])];
  if (hacer.length) salida.push("**Qué hacer** (no se dice)", "", ...hacer.map((t) => `- ${t}`), "");
  if (d.guion.pregunta) salida.push(`**Si preguntan:** ${d.guion.pregunta.texto}`, "", `**Respuesta corta:** ${d.guion.pregunta.respuesta}`, "");
  if (d.guion.transicion) salida.push(`**Para pasar:** “${d.guion.transicion}”`, "");
  if (d.guion.respaldo) salida.push(`**Para leer más:** \`${d.guion.respaldo}\``, "");
  return salida.join("\n");
}

function guion(recorrido: Recorrido): string {
  const lista = laminas(recorrido);
  const salida = [
    `# Guion de ARKA-Lite · recorrido ${NOMBRE_RECORRIDO[recorrido].toLowerCase()}`,
    "",
    AVISO,
    "",
    `${lista.length} láminas. ${DESCRIPCION[recorrido]}`,
    "",
    "## Partes",
    "",
    ...secciones.filter((s) => s.numero !== null && s.diapositivas.some((d) => d.recorridos.includes(recorrido))).map((s) => `${s.numero}. **${s.titulo}**: ${s.subtitulo ?? ""}`),
    "",
    "El reparto no está fijo: cada parte se puede asignar a cualquier persona. Las notas de cada lámina del PPTX traen el mismo texto.",
    "",
    "Cómo leer este guion: **Qué decir** es el texto en voz alta; **Qué hacer** son indicaciones para quien expone; **Para pasar** es la frase que conecta con la lámina siguiente.",
    "",
  ];
  let seccionActual = "";
  lista.forEach((l, i) => {
    if (l.seccion.id !== seccionActual) {
      seccionActual = l.seccion.id;
      salida.push(`## ${etiquetaSeccion(l.seccion)}`, "");
    }
    salida.push(bloqueLamina(l, i + 1, recorrido));
  });
  return salida.join("\n");
}

for (const r of RECORRIDOS) writeFileSync(join(base, `guion-${r}.md`), guion(r), "utf8");
console.log(`Guiones generados en ${base}: ${RECORRIDOS.join(", ")}.`);

// Genera los guiones en Markdown desde la misma fuente que la web y el PPTX,
// en docs/presentation-data/guiones/: guion-ejecutivo.md, guion-tecnico.md y
// participantes/<id>.md con las partes de cada persona.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DIR_GUIONES } from "../entregables.ts";
import { laminas, etiquetaSeccion, secciones, type Lamina } from "../contenido/index.ts";
import { EQUIPO, participantes, participantePorId } from "../contenido/participantes.ts";
import type { Recorrido } from "../contenido/tipos.ts";
import { lineasDeVisual, nombreDeVisual } from "../contenido/visuales.ts";
import { diagramaPorId } from "../diagramas/definiciones.ts";

const base = DIR_GUIONES;
mkdirSync(join(base, "participantes"), { recursive: true });

const AVISO = "> Archivo generado por `npm run guiones` desde `docs/presentation-data/contenido/`. No editar a mano: los cambios se hacen en la fuente.";

const CERTEZA = { implementado: "ya existe en el código", ejemplo: "ejemplo para explicar", propuesta: "propuesta, no existe aún" } as const;

function bloqueLamina(l: Lamina, numero: number, recorrido: Recorrido | "ambos"): string {
  const d = l.diapositiva;
  const salida: string[] = [];
  if (!d) {
    const c = l.seccion.claves;
    salida.push(`### ${numero}. Portada · ${l.seccion.titulo}`, "");
    if (c) {
      salida.push("**En pantalla:** cinco preguntas con su respuesta corta.", "");
      salida.push(`- **¿Qué problema resuelve?** ${c.problema}`, `- **¿Cómo funciona?** ${c.sencillo}`, `- **¿Cómo se ve?** ${c.visual}`, `- **¿Dónde está en ARKA-Lite?** ${c.aplicacion}`, `- **¿Cómo lo comprobamos?** ${c.evidencia}`, "");
    }
    salida.push("**Qué decir**", "", `> Ahora vamos con ${l.seccion.titulo.toLowerCase()}. Primero, qué problema resuelve.`, "");
    salida.push("**Qué hacer:** leer las cinco preguntas antes de avanzar.", "");
    return salida.join("\n");
  }
  const solo = recorrido === "ambos" && d.recorridos.length === 1 ? ` _(solo recorrido ${d.recorridos[0] === "tecnico" ? "técnico" : "ejecutivo"})_` : "";
  salida.push(`### ${numero}. ${d.titulo}${solo}`, "");
  if (d.visual && !d.tabla) {
    salida.push(`**En pantalla · ${nombreDeVisual(d.visual)}:**`, "", ...lineasDeVisual(d.visual).map((v) => `- ${v}`), "");
    salida.push("**Ideas clave:**", "", ...d.visible.map((v) => `- ${v}`), "");
  } else {
    salida.push("**En pantalla:**", "", ...d.visible.map((v) => `- ${v}`), "");
  }
  if (d.comparacion) salida.push(`**Comparación:** ${d.comparacion}`, "");
  if (d.diagrama) {
    const fig = diagramaPorId(d.diagrama);
    salida.push(`**Diagrama paso a paso · ${fig.titulo}.** Cada número coincide con el de la flecha en la lámina.`, "", ...fig.pasos.map((p, i) => `${i + 1}. ${p.texto}`), "");
  }
  if (d.tabla) {
    const celda = (t: string) => t.replace(/\|/g, "\\|");
    salida.push(`| ${d.tabla.encabezados.map(celda).join(" | ")} |`, `| ${d.tabla.encabezados.map(() => "---").join(" | ")} |`, ...d.tabla.filas.map((f) => `| ${f.map(celda).join(" | ")} |`), "");
  }
  if (d.marcas?.length) salida.push(`**Ojo:** ${d.marcas.map((m) => `${m.texto} (${CERTEZA[m.certeza]})`).join(" · ")}`, "");
  if (d.codigo && recorrido !== "ejecutivo") salida.push(`**Código (solo recorrido técnico):** \`${d.codigo.archivo}\``, "");
  salida.push("**Qué decir**", "", ...d.guion.decir.flatMap((t) => [`> ${t}`, ">"]).slice(0, -1), "");
  const hacer = [...(d.guion.instrucciones ?? []), ...(d.guion.demo ? [`Mostrar: ${d.guion.demo.accion} Debe verse: ${d.guion.demo.evidencia}`] : [])];
  if (hacer.length) salida.push("**Qué hacer** (no se dice)", "", ...hacer.map((t) => `- ${t}`), "");
  if (d.guion.pregunta) salida.push(`**Si preguntan:** ${d.guion.pregunta.texto}`, "", `**Respuesta corta:** ${d.guion.pregunta.respuesta}`, "");
  if (d.guion.transicion) salida.push(`**Para pasar:** “${d.guion.transicion}”`, "");
  if (d.guion.respaldo) salida.push(`**Para leer más:** \`${d.guion.respaldo}\``, "");
  return salida.join("\n");
}

function guionCompleto(recorrido: Recorrido): string {
  const lista = laminas(recorrido);
  const salida = [
    `# Guion de ARKA-Lite · recorrido ${recorrido === "ejecutivo" ? "ejecutivo" : "técnico"}`,
    "",
    AVISO,
    "",
    recorrido === "ejecutivo"
      ? "Centrado en conceptos y decisiones. El código queda para el recorrido técnico; ambos usan el mismo contenido."
      : "Incluye código, contratos y configuración. Comparte el texto oral con el recorrido ejecutivo para no contradecirse.",
    "",
    "## Reparto",
    "",
    `${EQUIPO}: siete personas, cada una presenta la parte de su área.`,
    "",
    "| Participante | Área | Rol | Secciones |",
    "| --- | --- | --- | --- |",
    ...participantes.map((p) => `| ${p.nombre} | ${p.perfil} | ${p.rol} | ${secciones.filter((s) => s.participante === p.id).map((s) => s.corto).join(", ")} |`),
    "",
    "Cómo leer este guion: **Qué decir** es el texto en voz alta; **Qué hacer** son indicaciones para quien expone; **Para pasar** es la frase que conecta con la lámina siguiente.",
    "",
  ];
  let seccionActual = "";
  lista.forEach((l, i) => {
    if (l.seccion.id !== seccionActual) {
      seccionActual = l.seccion.id;
      salida.push(`## ${etiquetaSeccion(l.seccion)} · presenta ${participantePorId(l.seccion.participante).nombre}`, "");
    }
    salida.push(bloqueLamina(l, i + 1, recorrido));
  });
  return salida.join("\n");
}

function guionParticipante(id: string): string {
  const p = participantePorId(id);
  const lista = laminas("tecnico");
  const propias = lista.map((l, i) => ({ l, i })).filter((x) => x.l.seccion.participante === id);
  const salida = [
    `# Guion de ${p.nombre}`,
    "",
    AVISO,
    "",
    `**Área:** ${p.perfil} · **Rol:** ${p.rol}`,
    "",
    `**Secciones:** ${secciones.filter((s) => s.participante === id).map((s) => etiquetaSeccion(s)).join(" · ")}`,
    "",
    "Este guion sigue el recorrido técnico. Las diapositivas marcadas como _solo recorrido técnico_ se omiten en el ejecutivo; el texto oral de las demás es el mismo en ambos.",
    "",
    "## Antes de empezar",
    "",
    "- Abrir la UI en `http://localhost:8088` (Compose) o por port-forward (Kubernetes).",
    "- En la UI (http://localhost:8088), confirmar que solicitudes y notificaciones aparecen en verde (UP).",
    "- No reiniciar datos ni borrar contenedores para preparar el ejemplo.",
    "",
  ];
  let bloqueAnterior = -2;
  for (const { l, i } of propias) {
    if (i !== bloqueAnterior + 1) {
      const previa = lista[i - 1];
      if (previa) {
        const quien = participantePorId(previa.seccion.participante);
        const frase = previa.diapositiva?.guion.transicion;
        salida.push(`## Recibes de ${quien.nombre === p.nombre ? "tu bloque anterior" : quien.nombre}`, "", frase ? `Última frase: “${frase}”` : "", "");
      } else {
        salida.push("## Abres la presentación", "");
      }
    }
    salida.push(bloqueLamina(l, i + 1, "ambos"));
    const siguiente = lista[i + 1];
    if (siguiente && siguiente.seccion.participante !== id) {
      salida.push(`**Entregas a ${participantePorId(siguiente.seccion.participante).nombre}**, que empieza con: ${siguiente.diapositiva?.titulo ?? `la portada de ${siguiente.seccion.titulo}`}.`, "");
    }
    bloqueAnterior = i;
  }
  return salida.join("\n");
}

writeFileSync(join(base, "guion-ejecutivo.md"), guionCompleto("ejecutivo"), "utf8");
writeFileSync(join(base, "guion-tecnico.md"), guionCompleto("tecnico"), "utf8");
for (const p of participantes) {
  writeFileSync(join(base, "participantes", `${p.id}.md`), guionParticipante(p.id), "utf8");
}
console.log(`Guiones generados en ${base}: ejecutivo, técnico y ${participantes.length} participantes.`);

// Genera los guiones en Markdown desde la misma fuente que el PPTX, en
// docs/presentation-data/guiones/: un guion por versión, un guion por persona
// para cada una y el reparto con recomendaciones.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DIR_GUIONES } from "../entregables.ts";
import { laminas, etiquetaSeccion, modoDe, nombreVariante, partesDe, seccionesDe, VARIANTES, type Lamina, type Variante } from "../contenido/index.ts";
import { NOMBRE_ENFOQUE, type ModoDemo } from "../contenido/tipos.ts";
import { DIVISION, minutosDeLamina, NOMBRE_ROL, personaCon, quienPresenta, rangos, rolDe, rolesDe, turnos, type Division } from "../contenido/reparto.ts";
import { GLOSARIO } from "../contenido/glosario.ts";
import { CHECKLIST, CONSEJOS, GENERALES, PERFIL, PREGUNTAS_A_QUIEN, RECORTES, VERSIONES } from "../contenido/recomendaciones.ts";

const base = DIR_GUIONES;
mkdirSync(base, { recursive: true });
// Los guiones de versiones anteriores que ya no se generan.
rmSync(join(base, "participantes"), { recursive: true, force: true });
for (const f of readdirSync(base)) if (f.endsWith(".md")) rmSync(join(base, f));

const AVISO = "> Archivo generado por `npm run guiones` desde `docs/presentation-data/contenido/`. No editar a mano: los cambios se hacen en la fuente.";

const DESCRIPCION: Record<Variante, string> = {
  "ejecutivo-con-videos": "Fundamentos y arquitectura en vista general; base de datos, interconexión y DevOps en detalle; observabilidad y la demostración grabada: tres videos dentro del PPTX, dos del sistema real y un ejemplo ilustrativo de CI/CD.",
  "ejecutivo-sin-demo": "Fundamentos y arquitectura en vista general; base de datos, interconexión y DevOps en detalle; la observabilidad pasa directo al cierre.",
};

const CON_DEMO: Record<ModoDemo, string> = { video: "contando los videos", sin: "" };

const LEER = [
  "| Bloque | Qué es |",
  "| --- | --- |",
  "| **Qué decir** | El texto para leer de corrido, con la frase que conecta con la lámina siguiente al final. No hace falta aprendérselo. |",
  "| **Si se te olvida, di esto** | Las ideas de la lámina en frases cortas, para decirlas a tu manera. |",
  "| **Qué hacer** | Indicaciones para quien expone. No se dicen. |",
  "| **Si preguntan** | Preguntas probables y su respuesta corta. |",
  "| **Si hay tiempo** | Material adicional. No cuenta en los minutos. |",
];

const minutos = (m: number) => Math.max(1, Math.round(m));

const archivoPorPersona = (v: Variante, division: Division) => `guion-${v}-${division.id}.md`;

function tablaDivision(division: Division, variante: Variante): string[] {
  return [
    "| Persona | Área | Qué presenta | Láminas | Habla |",
    "| --- | --- | --- | --- | --- |",
    ...turnos(division, variante).map((t) => `| ${t.persona.nombre} | ${t.persona.area} | ${rolesDe(t).map((r) => NOMBRE_ROL[r]).join(" y ")} | ${rangos(t.laminas.map((x) => x.numero))} | ~${minutos(t.minutos)} min |`),
  ];
}

function bloqueLamina(l: Lamina, numero: number, conPresenta: boolean): string {
  const d = l.diapositiva;
  const salida: string[] = [];
  salida.push(`### ${numero}. ${d.titulo}`, "");
  if (conPresenta) salida.push(`**Presenta:** ${quienPresenta(rolDe(l))}`, "");
  salida.push("**Qué decir**", "", ...[...d.guion.decir, ...(d.guion.transicion ? [d.guion.transicion] : [])].flatMap((t) => [`> ${t}`, ">"]).slice(0, -1), "");
  salida.push("**Si se te olvida, di esto**", "", ...d.guion.conTusPalabras.map((t) => `- ${t}`), "");
  if (d.guion.instrucciones?.length) salida.push("**Qué hacer** (no se dice)", "", ...d.guion.instrucciones.map((t) => `- ${t}`), "");
  for (const p of d.guion.preguntas ?? []) salida.push(`**Si preguntan:** ${p.texto}`, "", p.respuesta, "");
  if (d.guion.ampliar?.length) salida.push("**Si hay tiempo**", "", ...d.guion.ampliar.flatMap((t) => [`> ${t}`, ">"]).slice(0, -1), "");
  return salida.join("\n");
}

function guion(variante: Variante): string {
  const lista = laminas(variante);
  const total = lista.reduce((a, l) => a + minutosDeLamina(l), 0);
  const partes = partesDe(variante).filter((s) => lista.some((l) => l.seccion.id === s.id));
  const numeros = (id: string) => lista.map((l, i) => (l.seccion.id === id ? i + 1 : 0)).filter(Boolean);
  const demo = CON_DEMO[modoDe(variante)];
  const salida = [
    `# Guion de ARKA-Lite · ${nombreVariante(variante).toLowerCase()}`,
    "",
    AVISO,
    "",
    `${lista.length} láminas, unos ${minutos(total)} minutos${demo ? ` ${demo}` : ""}; las preguntas van aparte. ${DESCRIPCION[variante]}`,
    "",
    "## Cómo está pensada",
    "",
    "Todos los equipos presentan las mismas secciones, pero cada uno profundiza en algunas para no repetir contenido. El equipo anterior se enfoca en fundamentos y arquitectura hexagonal; nosotros los vemos en vista general y nos detenemos en la base de datos, la interconexión de los servicios y DevOps. La presentación narra el proyecto de punta a punta: cada parte retoma lo que dejó la anterior.",
    "",
    "| Parte | Enfoque | Láminas | Qué se ve |",
    "| --- | --- | --- | --- |",
    ...partes.map((s) => `| ${s.numero}. ${s.titulo} | ${s.enfoque ? NOMBRE_ENFOQUE[s.enfoque] : ""} | ${rangos(numeros(s.id))} | ${s.subtitulo ?? ""} |`),
    "",
    "## Reparto",
    "",
    "Luis abre, Abdiel cierra y recibe las preguntas, y se las pasa a quien presentó esa parte. Los minutos salen del texto de **Qué decir**, a unas 130 palabras por minuto, o de lo que duren los videos.",
    "",
    DIVISION.cuando,
    "",
    ...tablaDivision(DIVISION, variante),
    "",
    `Cada persona tiene su guion aparte en \`${archivoPorPersona(variante, DIVISION)}\`. Las notas de cada lámina del PPTX traen el mismo texto y dicen quién presenta.`,
    "",
    "## Cómo leer este guion",
    "",
    ...LEER,
    "",
    "## Palabras clave, en una frase",
    "",
    "Para que todo el equipo explique igual y sin jerga. Si alguien del público no conoce una palabra, se dice esta frase.",
    "",
    "| Palabra | En una frase |",
    "| --- | --- |",
    ...GLOSARIO.map((g) => `| ${g.termino} | ${g.frase} |`),
    "",
  ];
  let seccionActual = "";
  lista.forEach((l, i) => {
    if (l.seccion.id !== seccionActual) {
      seccionActual = l.seccion.id;
      const enfoque = l.seccion.enfoque ? ` · ${NOMBRE_ENFOQUE[l.seccion.enfoque].toLowerCase()}` : "";
      salida.push(`## ${etiquetaSeccion(l.seccion)}${enfoque}`, "", `Presenta: ${quienPresenta(l.seccion.rol)}.`, "");
    }
    salida.push(bloqueLamina(l, i + 1, rolDe(l) !== l.seccion.rol));
  });
  return salida.join("\n");
}

// El guion de cada persona en una división: solo sus láminas, con quién le
// pasa la palabra y a quién se la entrega.
function guionPorPersona(division: Division, variante: Variante): string {
  const lista = laminas(variante);
  const quien = (i: number) => (i >= 0 && i < lista.length ? personaCon(rolDe(lista[i])).nombre : null);
  const salida = [
    `# Guion por persona · ${nombreVariante(variante).toLowerCase()} · ${division.titulo}`,
    "",
    AVISO,
    "",
    `${division.cuando} ${nombreVariante(variante)}, ${lista.length} láminas. Cada persona tiene aquí solo lo suyo, con el número de lámina del PPTX.`,
    "",
    ...tablaDivision(division, variante),
    "",
  ];
  for (const t of turnos(division, variante)) {
    salida.push(`## ${t.persona.nombre} · ${rolesDe(t).map((r) => NOMBRE_ROL[r]).join(" y ")}`, "", `Láminas ${rangos(t.laminas.map((x) => x.numero))} · unos ${minutos(t.minutos)} minutos.`, "");
    // Los relevos: cada vez que le toca, quién le pasa la palabra y a quién
    // se la entrega.
    let anterior = -2;
    for (const { l, numero } of t.laminas) {
      const i = numero - 1;
      if (i !== anterior + 1) {
        const recibe = quien(i - 1);
        salida.push(`> **Recibes la palabra** ${recibe ? `de ${recibe}, después de la lámina ${i}` : "al empezar la presentación"}.`, "");
      }
      salida.push(bloqueLamina(l, numero, false));
      const entrega = quien(i + 1);
      if (entrega && entrega !== t.persona.nombre) salida.push(`> **Entregas la palabra** a ${entrega} (lámina ${numero + 1}).`, "");
      anterior = i;
    }
  }
  return salida.join("\n");
}


// El reparto recomendado: quién presenta qué y por qué, la línea de tiempo de
// cada versión, los relevos, los consejos por persona, a quién pasarle cada
// pregunta, qué saltar si falta tiempo y la lista del día.
function repartoYRecomendaciones(division: Division): string {
  const recorrido: Variante = "ejecutivo-con-videos";
  const min = minutosDeLamina;
  const fmt = (m: number) => {
    const seg = Math.round(m * 60);
    return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}`;
  };
  const totalDe = (v: Variante) => laminas(v).reduce((a, l) => a + min(l), 0);
  const salida = [
    "# Reparto de la presentación y recomendaciones",
    "",
    AVISO,
    "",
    division.cuando,
    "",
    "## Las dos versiones",
    "",
    "| Versión | Láminas | Minutos | Cuándo usarla | Qué tiene de distinto | Archivos |",
    "| --- | --- | --- | --- | --- | --- |",
    ...VARIANTES.map((v) => {
      const { cuando, cambia } = VERSIONES[modoDe(v)];
      return `| ${nombreVariante(v)} | ${laminas(v).length} | ~${Math.round(totalDe(v))} | ${cuando} | ${cambia} | \`pptx/ARKA-Lite-${v}.pptx\` y \`guiones/${archivoPorPersona(v, division)}\` |`;
    }),
    "",
    "Cada PPTX trae además, al final, la lámina «Reparto de la presentación», que no cuenta aquí y se quita antes de presentar.",
    "",
    "## Quién presenta qué",
    "",
    "Los números de lámina son los de la versión con videos; en la versión sin demostración cambian solo a partir del cierre.",
    "",
    "| Persona | Área | Láminas | Qué presenta | Minutos | Por qué esta persona |",
    "| --- | --- | --- | --- | --- | --- |",
    ...turnos(division, recorrido).map((t) => `| ${t.persona.nombre} | ${t.persona.area} | ${rangos(t.laminas.map((x) => x.numero))} | ${rolesDe(t).map((r) => NOMBRE_ROL[r]).join(" · ")} | ~${Math.round(t.minutos)} | ${rolesDe(t).map((r) => PERFIL[r]).join(" ")} |`),
    "",
  ];
  for (const v of VARIANTES) {
    const lista = laminas(v);
    salida.push(`## Línea de tiempo · ${nombreVariante(v).toLowerCase()}`, "", "| Parte | Láminas | Desde | Hasta | Presenta |", "| --- | --- | --- | --- | --- |");
    let reloj = 0;
    for (const sec of seccionesDe(v)) {
      const suyas = lista.map((l, i) => ({ l, numero: i + 1 })).filter(({ l }) => l.seccion.id === sec.id);
      if (!suyas.length) continue;
      const desde = reloj;
      reloj += suyas.reduce((a, { l }) => a + min(l), 0);
      const quienes = [...new Set(suyas.map(({ l }) => personaCon(rolDe(l)).nombre))].join(", ");
      salida.push(`| ${etiquetaSeccion(sec)} | ${rangos(suyas.map((x) => x.numero))} | ${fmt(desde)} | ${fmt(reloj)} | ${quienes} |`);
    }
    salida.push("");
  }
  const lista = laminas(recorrido);
  salida.push("## Relevos", "", "Cada vez que cambia quien presenta. La frase de relevo es el final del texto de la lámina anterior.", "", "| Al llegar a la lámina | Entrega | Recibe |", "| --- | --- | --- |");
  lista.forEach((l, i) => {
    if (i === 0) return;
    const antes = personaCon(rolDe(lista[i - 1])).nombre;
    const ahora = personaCon(rolDe(l)).nombre;
    if (antes !== ahora) salida.push(`| ${i + 1}. ${l.diapositiva.titulo} | ${antes} | ${ahora} |`);
  });
  salida.push("", "## Consejos por persona", "");
  for (const t of turnos(division, recorrido)) {
    salida.push(`### ${t.persona.nombre}`, "", ...rolesDe(t).flatMap((r) => CONSEJOS[r]).map((c) => `- ${c}`), "");
  }
  salida.push("## Consejos para todo el equipo", "", ...GENERALES.map((g) => `- ${g}`), "");
  salida.push("## A quién pasarle cada pregunta", "", "Abdiel recibe las preguntas al final y se las pasa a quien corresponde.", "", "| Si preguntan por | Responde |", "| --- | --- |", ...PREGUNTAS_A_QUIEN.map((p) => `| ${p.tema} | ${personaCon(p.rol).nombre} |`), "");
  const recortes = RECORTES.map((r) => ({ r, i: lista.findIndex((l) => l.id === r.id) })).filter((x) => x.i >= 0);
  const ahorro = recortes.reduce((a, { i }) => a + min(lista[i]), 0);
  salida.push("## Si falta tiempo", "", `Estas láminas se pueden saltar (en PowerPoint: Ocultar diapositiva) sin tocar lo principal. Juntas ahorran unos ${Math.round(ahorro)} minutos. Antes de ocultar una, revisen la frase con la que termina la lámina anterior.`, "", "| Lámina | Por qué se puede saltar |", "| --- | --- |", ...recortes.map(({ r, i }) => `| ${i + 1}. ${lista[i].diapositiva.titulo} | ${r.motivo} |`), "");
  salida.push("Los videos se graban con `npm run videos` y el sistema arriba: el script maneja la pantalla en Edge sin ventana, detiene y vuelve a iniciar notificaciones, graba la simulación de CI/CD y deja los MP4 en `capturas/videos/`.", "");
  salida.push("## El día de la presentación", "", ...CHECKLIST.map((c) => `- [ ] ${c}`), "");
  return salida.join("\n");
}

for (const v of VARIANTES) {
  writeFileSync(join(base, `guion-${v}.md`), guion(v), "utf8");
  writeFileSync(join(base, archivoPorPersona(v, DIVISION)), guionPorPersona(DIVISION, v), "utf8");
}
writeFileSync(join(base, "reparto-y-recomendaciones.md"), repartoYRecomendaciones(DIVISION), "utf8");
console.log(`Guiones generados en ${base}: ${VARIANTES.join(", ")}, por persona y reparto con recomendaciones.`);

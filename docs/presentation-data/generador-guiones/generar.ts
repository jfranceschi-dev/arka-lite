// Genera los guiones en Markdown desde la misma fuente que el PPTX, en
// docs/presentation-data/guiones/: un guion por variante (resumen, ejecutivo,
// técnico y el ejecutivo con videos o sin demostración), un guion por persona
// para cada versión del ejecutivo y el reparto con recomendaciones.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DIR_GUIONES } from "../entregables.ts";
import { laminas, etiquetaSeccion, modoDe, nombreVariante, partesDe, recorridoDe, seccionesDe, VARIANTES, type Lamina, type Variante } from "../contenido/index.ts";
import { CLIC, NOMBRE_ENFOQUE, type ModoDemo } from "../contenido/tipos.ts";
import { DIVISIONES, minutosDeLamina, NOMBRE_ROL, personaCon, quienPresenta, rolDe, type Division, type Persona } from "../contenido/reparto.ts";
import { lineasDeVisual, nombreDeVisual } from "../contenido/visuales.ts";
import { diagramaPorId } from "../diagramas/definiciones.ts";
import { GLOSARIO } from "../contenido/glosario.ts";
import { CHECKLIST, CONSEJOS, GENERALES, PERFIL, PREGUNTAS_A_QUIEN, RECORTES, VERSIONES } from "../contenido/recomendaciones.ts";

const base = DIR_GUIONES;
mkdirSync(base, { recursive: true });
// Los guiones de versiones anteriores que ya no se generan.
rmSync(join(base, "participantes"), { recursive: true, force: true });
for (const f of readdirSync(base)) if (f.endsWith(".md")) rmSync(join(base, f));

const AVISO = "> Archivo generado por `npm run guiones` desde `docs/presentation-data/contenido/`. No editar a mano: los cambios se hacen en la fuente.";

const CERTEZA = { implementado: "ya existe en el código", ejemplo: "ejemplo para explicar", propuesta: "propuesta, no existe aún" } as const;

const DESCRIPCION: Record<Variante, string> = {
  resumen: "Charla corta: el equipo, el negocio, el sistema, la base de datos, la interconexión, DevOps, una caída en vivo y el valor.",
  ejecutivo: "La presentación del equipo arka-litos: fundamentos y arquitectura en vista general; base de datos, interconexión y DevOps a fondo; observabilidad y demostración en vivo.",
  tecnico: "El recorrido ejecutivo más el código, la configuración y los diagramas detallados.",
  "ejecutivo-con-videos": "El recorrido ejecutivo con la demostración grabada: dos videos de la UI real dentro del PPTX, para cuando no se puede hacer en vivo.",
  "ejecutivo-sin-demo": "El recorrido ejecutivo sin la parte 7: la observabilidad pasa directo al cierre.",
};

// Las variantes del ejecutivo: cada una tiene su guion por persona.
const POR_PERSONA = VARIANTES.filter((v) => recorridoDe(v) === "ejecutivo");

const CON_DEMO: Record<ModoDemo, string> = { vivo: "contando la demostración en vivo", video: "contando los videos", sin: "" };

const LEER = [
  "| Bloque | Qué es |",
  "| --- | --- |",
  "| **En pantalla** | Lo que ve el público. |",
  "| **Lo que se lleva el staff** | El valor de la lámina en una frase: lo que el público tiene que recordar. |",
  "| **Qué decir** | El texto para decir en voz alta. No hace falta leerlo palabra por palabra. **▶ clic** marca el momento de hacer clic: ahí aparece la siguiente pieza del diagrama. |",
  "| **Qué hacer** | Indicaciones para quien expone, como las demostraciones. No se dicen. |",
  "| **Si hay tiempo, se puede agregar** | Ejemplos y datos reales del proyecto para nutrir la explicación. No cuentan en los minutos. |",
  "| **Si preguntan** | Preguntas probables del staff y su respuesta corta. |",
  "| **Para pasar** | La frase que conecta con la lámina siguiente; si cambia quien presenta, es el relevo. |",
];

const minutos = (m: number) => Math.max(1, Math.round(m));

const archivoPorPersona = (v: Variante, division: Division) => `guion-${v}-${division.id}.md`;

// "1–4, 36–38": los números de lámina en rangos.
function rangos(numeros: number[]): string {
  const salida: string[] = [];
  for (let i = 0; i < numeros.length; i++) {
    let j = i;
    while (j + 1 < numeros.length && numeros[j + 1] === numeros[j] + 1) j++;
    salida.push(i === j ? `${numeros[i]}` : `${numeros[i]}–${numeros[j]}`);
    i = j;
  }
  return salida.join(", ");
}

interface Turno {
  persona: Persona;
  laminas: { l: Lamina; numero: number }[];
  minutos: number;
}

function turnos(division: Division, variante: Variante): Turno[] {
  const lista = laminas(variante);
  return division.personas
    .map((persona) => {
      const suyas = lista.map((l, i) => ({ l, numero: i + 1 })).filter(({ l }) => personaCon(division, rolDe(l)) === persona);
      return { persona, laminas: suyas, minutos: suyas.reduce((a, { l }) => a + minutosDeLamina(l), 0) };
    })
    .filter((t) => t.laminas.length > 0);
}

// Los papeles que la persona presenta de verdad en la variante: sin
// demostración, quien solo la tenía a su cargo presenta uno menos.
const rolesDe = (t: Turno) => t.persona.roles.filter((r) => t.laminas.some(({ l }) => rolDe(l) === r));

function tablaDivision(division: Division, variante: Variante): string[] {
  return [
    "| Persona | Área | Qué presenta | Láminas | Habla |",
    "| --- | --- | --- | --- | --- |",
    ...turnos(division, variante).map((t) => `| ${t.persona.nombre} | ${t.persona.area} | ${rolesDe(t).map((r) => NOMBRE_ROL[r]).join(" y ")} | ${rangos(t.laminas.map((x) => x.numero))} | ~${minutos(t.minutos)} min |`),
  ];
}

function bloqueLamina(l: Lamina, numero: number, variante: Variante, conPresenta: boolean): string {
  const d = l.diapositiva;
  const salida: string[] = [];
  salida.push(`### ${numero}. ${d.titulo}`, "");
  if (conPresenta) salida.push(`**Presenta:** ${quienPresenta(rolDe(l))}`, "");
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
  if (d.codigo && recorridoDe(variante) === "tecnico") salida.push(`**Código:** \`${d.codigo.archivo}\``, "");
  if (d.valor) salida.push(`**Lo que se lleva el staff:** ${d.valor}`, "");
  salida.push("**Qué decir**", "", ...d.guion.decir.flatMap((t) => [`> ${t.replaceAll(CLIC, "**▶ clic**")}`, ">"]).slice(0, -1), "");
  const hacer = [...(d.guion.instrucciones ?? []), ...(d.guion.demo ? [`Mostrar: ${d.guion.demo.accion} Debe verse: ${d.guion.demo.evidencia}`] : [])];
  if (hacer.length) salida.push("**Qué hacer** (no se dice)", "", ...hacer.map((t) => `- ${t}`), "");
  if (d.guion.ampliar?.length) salida.push("**Si hay tiempo, se puede agregar**", "", ...d.guion.ampliar.flatMap((t) => [`> ${t}`, ">"]).slice(0, -1), "");
  for (const p of d.guion.preguntas ?? []) salida.push(`**Si preguntan:** ${p.texto}`, "", `**Respuesta corta:** ${p.respuesta}`, "");
  if (d.guion.transicion) salida.push(`**Para pasar:** “${d.guion.transicion}”`, "");
  if (d.guion.respaldo) salida.push(`**Para leer más:** \`${d.guion.respaldo}\``, "");
  return salida.join("\n");
}

function guion(variante: Variante): string {
  const lista = laminas(variante);
  const total = lista.reduce((a, l) => a + minutosDeLamina(l), 0);
  const partes = partesDe(variante).filter((s) => lista.some((l) => l.seccion.id === s.id));
  const numeros = (id: string) => lista.map((l, i) => (l.seccion.id === id ? i + 1 : 0)).filter(Boolean);
  const demo = CON_DEMO[modoDe(variante)];
  const porPersona = POR_PERSONA.includes(variante) ? variante : "ejecutivo";
  const salida = [
    `# Guion de ARKA-Lite · ${nombreVariante(variante).toLowerCase()}`,
    "",
    AVISO,
    "",
    `${lista.length} láminas, unos ${minutos(total)} minutos${demo ? ` ${demo}` : ""}; las preguntas van aparte. ${DESCRIPCION[variante]}`,
    "",
    "## Cómo está pensada",
    "",
    "Todos los equipos presentan las mismas secciones, pero cada uno profundiza en algunas para no repetir contenido. El equipo anterior se enfoca en fundamentos y arquitectura hexagonal; nosotros los vemos en vista general y vamos a fondo en la base de datos, la interconexión de los servicios y DevOps. La presentación narra el proyecto de punta a punta: cada parte retoma lo que dejó la anterior.",
    "",
    "| Parte | Enfoque | Láminas | Qué se ve |",
    "| --- | --- | --- | --- |",
    ...partes.map((s) => `| ${s.numero}. ${s.titulo} | ${s.enfoque ? NOMBRE_ENFOQUE[s.enfoque] : ""} | ${rangos(numeros(s.id))} | ${s.subtitulo ?? ""} |`),
    "",
    "## Reparto",
    "",
    "Quien orquesta abre, presenta el negocio, conecta las partes y cierra; también recibe las preguntas y se las pasa a quien presentó esa parte. Los minutos salen del texto de **Qué decir**, a unas 130 palabras por minuto, más la demostración en vivo o lo que duren los videos.",
    "",
    ...DIVISIONES.flatMap((div) => [`### ${div.titulo}`, "", div.cuando, "", ...tablaDivision(div, variante), ""]),
    `Cada persona tiene su guion aparte en ${DIVISIONES.map((d) => `\`${archivoPorPersona(porPersona, d)}\``).join(" y ")}. Las notas de cada lámina del PPTX traen el mismo texto y dicen quién presenta.`,
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
    salida.push(bloqueLamina(l, i + 1, variante, rolDe(l) !== l.seccion.rol));
  });
  return salida.join("\n");
}

// El guion de cada persona en una división: solo sus láminas, con quién le
// pasa la palabra y a quién se la entrega.
function guionPorPersona(division: Division, variante: Variante): string {
  const lista = laminas(variante);
  const quien = (i: number) => (i >= 0 && i < lista.length ? personaCon(division, rolDe(lista[i])).nombre : null);
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
      salida.push(bloqueLamina(l, numero, variante, false));
      const entrega = quien(i + 1);
      if (entrega && entrega !== t.persona.nombre) salida.push(`> **Entregas la palabra** a ${entrega} (lámina ${numero + 1}).`, "");
      anterior = i;
    }
  }
  return salida.join("\n");
}


// El reparto recomendado del recorrido ejecutivo: quién presenta qué y por
// qué, la línea de tiempo, los relevos, los consejos por persona, a quién
// pasarle cada pregunta, qué saltar si falta tiempo y la lista del día.
function repartoYRecomendaciones(division: Division): string {
  const recorrido: Variante = "ejecutivo";
  const lista = laminas(recorrido);
  const persona = (l: Lamina) => personaCon(division, rolDe(l));
  const min = minutosDeLamina;
  const fmt = (m: number) => {
    const seg = Math.round(m * 60);
    return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}`;
  };
  const total = lista.reduce((a, l) => a + min(l), 0);
  const salida = [
    "# Reparto de la presentación y recomendaciones",
    "",
    AVISO,
    "",
    `Recorrido ejecutivo: ${lista.length} láminas, unos ${Math.round(total)} minutos con la demostración en vivo. ${division.cuando}`,
    "",
    "## Quién presenta qué",
    "",
    "| Persona | Área | Láminas | Qué presenta | Minutos | Por qué esta persona |",
    "| --- | --- | --- | --- | --- | --- |",
    ...turnos(division, recorrido).map((t) => `| ${t.persona.nombre} | ${t.persona.area} | ${rangos(t.laminas.map((x) => x.numero))} | ${t.persona.roles.map((r) => NOMBRE_ROL[r]).join(" · ")} | ~${Math.round(t.minutos)} | ${t.persona.roles.map((r) => PERFIL[r]).join(" ")} |`),
    "",
    "## Línea de tiempo",
    "",
    "Minuto en que empieza y termina cada parte, contando la demostración en vivo. Sirve para que quien orquesta sepa si van a tiempo.",
    "",
    "| Parte | Láminas | Desde | Hasta | Presenta |",
    "| --- | --- | --- | --- | --- |",
  ];
  let reloj = 0;
  for (const sec of seccionesDe(recorrido)) {
    const suyas = lista.map((l, i) => ({ l, numero: i + 1 })).filter(({ l }) => l.seccion.id === sec.id);
    if (!suyas.length) continue;
    const desde = reloj;
    reloj += suyas.reduce((a, { l }) => a + min(l), 0);
    const quienes = [...new Set(suyas.map(({ l }) => persona(l).nombre))].join(", ");
    salida.push(`| ${etiquetaSeccion(sec)} | ${rangos(suyas.map((x) => x.numero))} | ${fmt(desde)} | ${fmt(reloj)} | ${quienes} |`);
  }
  salida.push("", "## Relevos", "", "Cada vez que cambia quien presenta. La frase de relevo está en el **Para pasar** de la lámina anterior.", "", "| Al llegar a la lámina | Entrega | Recibe |", "| --- | --- | --- |");
  lista.forEach((l, i) => {
    if (i === 0) return;
    const antes = persona(lista[i - 1]).nombre;
    const ahora = persona(l).nombre;
    if (antes !== ahora) salida.push(`| ${i + 1}. ${l.diapositiva.titulo} | ${antes} | ${ahora} |`);
  });
  salida.push("", "## Consejos por persona", "");
  for (const t of turnos(division, recorrido)) {
    salida.push(`### ${t.persona.nombre}`, "", ...t.persona.roles.flatMap((r) => CONSEJOS[r]).map((c) => `- ${c}`), "");
  }
  salida.push("## Consejos para todo el equipo", "", ...GENERALES.map((g) => `- ${g}`), "");
  salida.push("## A quién pasarle cada pregunta", "", "Quien orquesta recibe las preguntas al final y se las pasa a quien corresponde.", "", "| Si preguntan por | Responde |", "| --- | --- |", ...PREGUNTAS_A_QUIEN.map((p) => `| ${p.tema} | ${personaCon(division, p.rol).nombre} |`), "");
  const recortes = RECORTES.map((r) => ({ r, i: lista.findIndex((l) => l.id === r.id) })).filter((x) => x.i >= 0);
  const ahorro = recortes.reduce((a, { i }) => a + min(lista[i]), 0);
  salida.push("## Si falta tiempo", "", `Estas láminas se pueden saltar en vivo (en PowerPoint: Ocultar diapositiva) sin tocar las partes que van a fondo. Juntas ahorran unos ${Math.round(ahorro)} minutos.`, "", "| Lámina | Por qué se puede saltar |", "| --- | --- |", ...recortes.map(({ r, i }) => `| ${i + 1}. ${lista[i].diapositiva.titulo} | ${r.motivo} |`), "");
  salida.push(
    "## Si no se puede hacer la demostración en vivo",
    "",
    "El ejecutivo tiene tres versiones, con las mismas láminas salvo la demostración. Cada una tiene su PPTX, sus PDF y su guion por persona.",
    "",
    "| Versión | Láminas | Minutos | Cuándo usarla | Qué cambia | Archivos |",
    "| --- | --- | --- | --- | --- | --- |",
    ...POR_PERSONA.map((v) => {
      const l = laminas(v);
      const m = l.reduce((a, x) => a + min(x), 0);
      const { cuando, cambia } = VERSIONES[modoDe(v)];
      return `| ${nombreVariante(v)} | ${l.length} | ~${Math.round(m)} | ${cuando} | ${cambia} | \`pptx/ARKA-Lite-${v}.pptx\` y \`guiones/${archivoPorPersona(v, division)}\` |`;
    }),
    "",
    "Los videos se graban con `npm run videos` y el sistema arriba: el script maneja la UI en Edge sin ventana, detiene y vuelve a iniciar notificaciones, y deja los MP4 en `capturas/videos/`.",
    "",
  );
  salida.push("## El día de la presentación", "", ...CHECKLIST.map((c) => `- [ ] ${c}`), "");
  return salida.join("\n");
}

for (const v of VARIANTES) writeFileSync(join(base, `guion-${v}.md`), guion(v), "utf8");
for (const v of POR_PERSONA) for (const div of DIVISIONES) writeFileSync(join(base, archivoPorPersona(v, div)), guionPorPersona(div, v), "utf8");
writeFileSync(join(base, "reparto-y-recomendaciones.md"), repartoYRecomendaciones(DIVISIONES[0]), "utf8");
console.log(`Guiones generados en ${base}: ${VARIANTES.join(", ")}, por persona (${POR_PERSONA.join(", ")}) y reparto con recomendaciones.`);

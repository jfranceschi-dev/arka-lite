import { existsSync } from "node:fs";
import { join } from "node:path";
import { laminas, secciones } from "./index.ts";
import { modoDe, VARIANTES, type ModoDemo, type Visual } from "./tipos.ts";
import { DIR_CAPTURAS, DIR_VIDEOS } from "../entregables.ts";
import { DIVISION } from "./reparto.ts";
import { AMPLIAR } from "./ampliar.ts";
import { GLOSARIO } from "./glosario.ts";
import { CHECKLIST, CONSEJOS, GENERALES, PERFIL, RECORTES, VERSIONES } from "./recomendaciones.ts";
import { CAMBIOS } from "./variantes.ts";

function validarVisual(id: string, v: Visual | undefined): string[] {
  if (!v) return [];
  const errores: string[] = [];
  if (v.tipo === "captura") {
    for (const c of v.capturas) if (!existsSync(join(DIR_CAPTURAS, c.archivo))) errores.push(`${id}: falta la captura capturas/${c.archivo} (ejecutar capturas/capturar.ps1)`);
    if (v.capturas.length === 0 || v.capturas.length > 4) errores.push(`${id}: una lámina lleva de 1 a 4 capturas`);
  }
  if (v.tipo === "video") {
    for (const f of [v.archivo, v.portada]) if (!existsSync(join(DIR_VIDEOS, f))) errores.push(`${id}: falta capturas/videos/${f} (ejecutar npm run videos)`);
    if (v.pasos.length < 2 || v.pasos.length > 7) errores.push(`${id}: un video lleva de 2 a 7 pasos`);
  }
  if (v.tipo === "estados" && v.acciones.length !== v.columnas.length - 1) errores.push(`${id}: cada paso entre columnas de estados necesita su acción`);
  if (v.tipo === "flujo" && v.desvio && (v.desvio.desde < 0 || v.desvio.desde >= v.pasos.length)) errores.push(`${id}: el desvío cuelga de un paso que no existe`);
  if (v.tipo === "flujo" && (v.pasos.length < 2 || v.pasos.length > 6)) errores.push(`${id}: un flujo lleva de 2 a 6 pasos`);
  if (v.tipo === "tuberia" && (v.etapas.length < 2 || v.etapas.length > 7)) errores.push(`${id}: una tubería lleva de 2 a 7 etapas`);
  if (v.tipo === "cifras" && (v.cifras.length < 2 || v.cifras.length > 6)) errores.push(`${id}: una lámina de cifras lleva de 2 a 6 números`);
  if (v.tipo === "tarjetas" && (v.tarjetas.length < 2 || v.tarjetas.length > 12)) errores.push(`${id}: una lámina de tarjetas lleva de 2 a 12 tarjetas`);
  if (v.tipo === "aprendizajes" && (v.items.length < 2 || v.items.length > 4 || v.metricas.length < 1 || v.metricas.length > 2)) errores.push(`${id}: los aprendizajes llevan de 2 a 4 ítems y 1 o 2 métricas`);
  if (v.tipo === "escenario" && (v.pasos.length < 2 || v.pasos.length > 5)) errores.push(`${id}: un escenario lleva de 2 a 5 pasos`);
  if (v.tipo === "capas" && (v.capas.length < 2 || v.capas.length > 5 || v.capas.some((c) => c.elementos.length < 1 || c.elementos.length > 4))) errores.push(`${id}: de 2 a 5 capas, cada una con 1 a 4 piezas`);
  if (v.tipo === "matriz" && (v.filas.length < 2 || v.filas.length > 6)) errores.push(`${id}: una matriz lleva de 2 a 6 filas`);
  if (v.tipo === "hexagono" && (v.entrada.length > 3 || v.salida.length > 4 || v.puertos.length > 4)) errores.push(`${id}: el hexágono lleva hasta 3 entradas, 4 salidas y 4 puertos`);
  if (v.tipo === "tablas" && (v.bases.length < 1 || v.bases.length > 3)) errores.push(`${id}: de 1 a 3 bases`);
  if (v.tipo === "equipo" && (v.areas.length < 2 || v.areas.length > 5)) errores.push(`${id}: el equipo lleva de 2 a 5 áreas`);
  if (v.tipo === "mapeo" && v.clase.campos.length !== v.tabla.columnas.length) errores.push(`${id}: cada campo de la clase necesita su columna`);
  if (v.tipo === "mapeo" && (v.operaciones.length < 1 || v.operaciones.length > 3)) errores.push(`${id}: el mapeo lleva de 1 a 3 operaciones`);
  if (v.tipo === "caminos" && (v.caminos.length < 2 || v.caminos.length > 3 || v.caminos.some((c) => c.pasos.length < 2 || c.pasos.length > 5 || c.flechas.length !== c.pasos.length - 1 || (c.regla !== undefined && (c.regla < 0 || c.regla >= c.pasos.length)) || (c.grupos ?? []).some((g) => g.desde < 0 || g.hasta >= c.pasos.length || g.desde > g.hasta)))) errores.push(`${id}: de 2 a 3 caminos, cada uno con 2 a 5 pasos, una flecha entre pasos, y la regla y los grupos en pasos que existan`);
  if (v.tipo === "codigos" && v.lados.some((l) => l.codigo.split("\n").length > 10 || l.puntos.length > 3)) errores.push(`${id}: cada código lleva hasta 10 líneas y 3 puntos`);
  if (v.tipo === "origenes" && (v.fuentes.length < 1 || v.fuentes.length > 3)) errores.push(`${id}: de 1 a 3 fuentes`);
  if (v.tipo === "pods" && (v.pods.length < 1 || v.pods.length > 3)) errores.push(`${id}: de 1 a 3 Pods`);
  return errores;
}

// Lo que una versión no puede decir: con videos, nada es «en vivo»; sin
// demostración, nada la anuncia.
const PROHIBIDO: Record<ModoDemo, RegExp> = { video: /en vivo/i, sin: /demostraci[oó]n|en video/i };

// Lo que no se menciona en ninguna versión: temas que el equipo decidió no
// tocar y las marcas de clic, porque las láminas ya no se arman por clics.
const NUNCA = /nginx|hikari|\bpools?\b|codespace|\[clic\]|▶/i;

// Reglas de consistencia del contenido. Las usan `npm run validar`, las pruebas
// y el CI.
export const LIMITES = { lineasVisibles: 6, caracteresPorLinea: 90 } as const;

export function validarContenido(): string[] {
  const errores: string[] = [];
  const ids = new Set<string>();

  for (const s of secciones) {
    // Cada parte numerada cierra con sus aprendizajes.
    const ultima = s.diapositivas[s.diapositivas.length - 1];
    if (s.numero !== null && ultima?.visual?.tipo !== "aprendizajes") errores.push(`${s.id}: una sección numerada termina con su lámina de aprendizajes`);
    s.diapositivas.forEach((d, i) => {
      if (ids.has(d.id)) errores.push(`${d.id}: id repetido`);
      ids.add(d.id);
      if (d.visible.length === 0 || d.visible.length > LIMITES.lineasVisibles) errores.push(`${d.id}: necesita entre 1 y ${LIMITES.lineasVisibles} líneas visibles`);
      for (const l of d.visible) if (l.length > LIMITES.caracteresPorLinea) errores.push(`${d.id}: línea visible demasiado larga: "${l}"`);
      if (d.guion.decir.length === 0) errores.push(`${d.id}: falta el texto para decir`);
      // Quien no se aprenda el texto tiene las ideas para decirlas a su manera.
      if (d.guion.conTusPalabras.length < 2) errores.push(`${d.id}: "con tus palabras" lleva al menos 2 frases`);
      const ultima = s === secciones[secciones.length - 1] && i === s.diapositivas.length - 1;
      if (!ultima && !d.guion.transicion) errores.push(`${d.id}: falta la transición`);
      for (const p of d.guion.preguntas ?? []) if (!p.respuesta) errores.push(`${d.id}: la pregunta "${p.texto}" necesita respuesta`);
      if (d.iconos && d.iconos.length !== d.visible.length) errores.push(`${d.id}: necesita un ícono por línea visible (${d.iconos.length} de ${d.visible.length})`);
      errores.push(...validarVisual(d.id, d.visual));
      // El reparto tiene a alguien para cada lámina.
      const rol = d.rol ?? s.rol;
      if (!DIVISION.personas.some((p) => p.roles.includes(rol))) errores.push(`${d.id}: nadie presenta el papel ${rol}`);
    });
    if (s.numero !== null && !s.icono) errores.push(`${s.id}: una sección numerada necesita su ícono`);
    if (s.numero !== null && !s.enfoque) errores.push(`${s.id}: una sección numerada dice si va en detalle o en vista general`);
  }

  // Cada lámina trae material para decir si hay tiempo.
  const todas = new Map(secciones.flatMap((s) => s.diapositivas).map((d) => [d.id, d]));
  for (const id of Object.keys(AMPLIAR)) if (!todas.has(id)) errores.push(`ampliar: la lámina ${id} no existe`);
  for (const d of todas.values()) if (!d.id.endsWith("-gracias") && !AMPLIAR[d.id]) errores.push(`${d.id}: falta el material "si hay tiempo" en ampliar.ts`);

  // Los recortes sugeridos son láminas que existen.
  for (const r of RECORTES) if (!todas.has(r.id)) errores.push(`recomendaciones: el recorte ${r.id} no existe`);

  // Las versiones: cada reemplazo encuentra su texto y ninguna lámina anuncia
  // lo que no se hace.
  for (const [modo, m] of Object.entries(CAMBIOS)) {
    for (const id of m.sinSecciones ?? []) if (!secciones.some((s) => s.id === id)) errores.push(`variantes ${modo}: la sección ${id} no existe`);
    for (const id of m.sinLaminas ?? []) if (!todas.has(id)) errores.push(`variantes ${modo}: la lámina ${id} no existe`);
    for (const [id, c] of Object.entries(m.laminas)) {
      const d = todas.get(id);
      if (!d) {
        errores.push(`variantes ${modo}: la lámina ${id} no existe`);
        continue;
      }
      const json = JSON.stringify(d);
      for (const [antes] of c.reemplazos ?? []) if (!json.includes(JSON.stringify(antes).slice(1, -1))) errores.push(`variantes ${modo} · ${id}: ya no dice «${antes}»`);
    }
  }
  for (const v of VARIANTES) {
    const modo = modoDe(v);
    for (const l of laminas(v)) {
      const d = l.diapositiva;
      // La agenda lleva las secciones completas: se revisa solo el texto propio.
      const propio = JSON.stringify({ ...d, visual: d.visual?.tipo === "ruta" ? undefined : d.visual });
      const prohibido = propio.match(new RegExp(`.{0,40}${PROHIBIDO[modo].source}.{0,40}`, "i"));
      if (prohibido) errores.push(`${v} · ${d.id}: todavía dice «${prohibido[0]}»`);
      const nunca = propio.match(new RegExp(`.{0,40}${NUNCA.source}.{0,40}`, "i"));
      if (nunca) errores.push(`${v} · ${d.id}: no se menciona «${nunca[0]}»`);
      if (d.visual?.tipo === "video") errores.push(...validarVisual(`${v} · ${d.id}`, d.visual).filter((e) => !errores.includes(e)));
    }
  }
  const apoyo = JSON.stringify({ GLOSARIO, GENERALES, CONSEJOS, PERFIL, RECORTES, CHECKLIST, VERSIONES, secciones: secciones.map((s) => [s.titulo, s.subtitulo, s.temas]) });
  const enApoyo = apoyo.match(new RegExp(`.{0,40}${NUNCA.source}.{0,40}`, "i"));
  if (enApoyo) errores.push(`material de apoyo: no se menciona «${enApoyo[0]}»`);

  return errores;
}

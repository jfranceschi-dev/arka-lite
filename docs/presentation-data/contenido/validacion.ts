import { existsSync } from "node:fs";
import { join } from "node:path";
import { secciones } from "./index.ts";
import { CLIC, type Diapositiva, type Visual } from "./tipos.ts";
import { clicsDeVisual } from "./visuales.ts";
import { diagramas } from "../diagramas/definiciones.ts";
import { DIR_CAPTURAS } from "../entregables.ts";
import { DIVISIONES } from "./reparto.ts";
import { AMPLIAR } from "./ampliar.ts";

function validarVisual(id: string, v: Visual | undefined): string[] {
  if (!v) return [];
  const errores: string[] = [];
  if (v.tipo === "captura") {
    for (const c of v.capturas) if (!existsSync(join(DIR_CAPTURAS, c.archivo))) errores.push(`${id}: falta la captura capturas/${c.archivo} (ejecutar capturas/capturar.ps1)`);
    if (v.capturas.length === 0 || v.capturas.length > 4) errores.push(`${id}: una lámina lleva de 1 a 4 capturas`);
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
  return errores;
}

// La portada y el cierre no se arman por clics.
export function clicsDeLamina(d: Diapositiva): number {
  return d.id === "s00-portada" || d.id.endsWith("-gracias") ? 0 : clicsDeVisual(d.visual);
}

// Reglas de consistencia entre contenido y diagramas. Las usan
// `npm run validar`, las pruebas y el CI.
export const LIMITES = { lineasVisibles: 6, caracteresPorLinea: 90 } as const;

export function validarContenido(): string[] {
  const errores: string[] = [];
  const ids = new Set<string>();
  const idsDiagramas = new Set(diagramas.map((d) => d.id));

  for (const s of secciones) {
    // Cada parte numerada cierra con sus aprendizajes, desde el recorrido ejecutivo.
    const ultima = s.diapositivas[s.diapositivas.length - 1];
    if (s.numero !== null && (ultima?.visual?.tipo !== "aprendizajes" || !ultima.recorridos.includes("ejecutivo"))) errores.push(`${s.id}: una sección numerada termina con su lámina de aprendizajes`);
    s.diapositivas.forEach((d, i) => {
      if (ids.has(d.id)) errores.push(`${d.id}: id repetido`);
      ids.add(d.id);
      if (d.recorridos.length === 0) errores.push(`${d.id}: no pertenece a ningún recorrido`);
      // Cada variante contiene a la anterior: resumen ⊂ ejecutivo ⊂ técnico.
      if (d.recorridos.includes("resumen") && !d.recorridos.includes("ejecutivo")) errores.push(`${d.id}: lo que está en el resumen también va en el ejecutivo`);
      if (d.recorridos.includes("ejecutivo") && !d.recorridos.includes("tecnico")) errores.push(`${d.id}: lo que está en el ejecutivo también va en el técnico`);
      if (d.visible.length === 0 || d.visible.length > LIMITES.lineasVisibles) errores.push(`${d.id}: necesita entre 1 y ${LIMITES.lineasVisibles} líneas visibles`);
      for (const l of d.visible) if (l.length > LIMITES.caracteresPorLinea) errores.push(`${d.id}: línea visible demasiado larga: "${l}"`);
      if (d.guion.decir.length === 0) errores.push(`${d.id}: falta el texto para decir`);
      const ultima = s === secciones[secciones.length - 1] && i === s.diapositivas.length - 1;
      if (!ultima && !d.guion.transicion) errores.push(`${d.id}: falta la transición`);
      if (d.diagrama && !idsDiagramas.has(d.diagrama)) errores.push(`${d.id}: diagrama ${d.diagrama} no existe`);
      for (const p of d.guion.preguntas ?? []) if (!p.respuesta) errores.push(`${d.id}: la pregunta "${p.texto}" necesita respuesta`);
      // El texto oral marca cada clic del diagrama, en el momento justo.
      const marcas = d.guion.decir.join(" ").split(CLIC).length - 1;
      if (marcas !== clicsDeLamina(d)) errores.push(`${d.id}: el texto oral tiene ${marcas} marcas ${CLIC} y el visual arma ${clicsDeLamina(d)} clics`);
      if (d.iconos && d.iconos.length !== d.visible.length) errores.push(`${d.id}: necesita un ícono por línea visible (${d.iconos.length} de ${d.visible.length})`);
      errores.push(...validarVisual(d.id, d.visual));
      // Cada división del equipo tiene a alguien para cada lámina.
      const rol = d.rol ?? s.rol;
      for (const div of DIVISIONES) if (!div.personas.some((p) => p.roles.includes(rol))) errores.push(`${d.id}: nadie presenta el papel ${rol} en la división de ${div.titulo}`);
    });
    if (s.numero !== null && !s.icono) errores.push(`${s.id}: una sección numerada necesita su ícono`);
    if (s.numero !== null && !s.enfoque) errores.push(`${s.id}: una sección numerada dice si va a fondo o en vista general`);
  }


  // Cada lámina del ejecutivo trae material para decir si hay tiempo.
  const todas = new Map(secciones.flatMap((s) => s.diapositivas).map((d) => [d.id, d]));
  for (const id of Object.keys(AMPLIAR)) if (!todas.has(id)) errores.push(`ampliar: la lámina ${id} no existe`);
  for (const d of todas.values()) if (d.recorridos.includes("ejecutivo") && !d.id.endsWith("-gracias") && !AMPLIAR[d.id]) errores.push(`${d.id}: falta el material "si hay tiempo" en ampliar.ts`);

  for (const d of diagramas) {
    const nodos = new Set(d.nodos.map((n) => n.id));
    const aristas = new Set(d.aristas.map((a) => a.id));
    const zonas = new Set((d.zonas ?? []).map((z) => z.id));
    for (const n of d.nodos) {
      if (n.x < 0 || n.y < 0 || n.x + n.w > d.ancho || n.y + n.h > d.alto) errores.push(`${d.id}.${n.id}: fuera del lienzo`);
    }
    for (const a of d.aristas) {
      if (!nodos.has(a.desde) || !nodos.has(a.hacia)) errores.push(`${d.id}.${a.id}: nodo inexistente`);
    }
    if (d.pasos.length === 0) errores.push(`${d.id}: necesita al menos un paso`);
    d.pasos.forEach((p, i) => {
      for (const id of p.nodos) if (!nodos.has(id)) errores.push(`${d.id} paso ${i + 1}: nodo ${id} no existe`);
      for (const id of p.aristas) if (!aristas.has(id)) errores.push(`${d.id} paso ${i + 1}: arista ${id} no existe`);
      for (const id of p.zonas ?? []) if (!zonas.has(id)) errores.push(`${d.id} paso ${i + 1}: zona ${id} no existe`);
    });
  }

  return errores;
}

import { existsSync } from "node:fs";
import { join } from "node:path";
import { secciones } from "./index.ts";
import { participantes } from "./participantes.ts";
import type { Visual } from "./tipos.ts";
import { diagramas } from "../diagramas/definiciones.ts";
import { DIR_CAPTURAS } from "../entregables.ts";

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
  return errores;
}

// Reglas de consistencia entre contenido y diagramas. Las usan
// `npm run validar`, las pruebas y el CI.
export const LIMITES = { lineasVisibles: 6, caracteresPorLinea: 90 } as const;

export function validarContenido(): string[] {
  const errores: string[] = [];
  const ids = new Set<string>();
  const idsDiagramas = new Set(diagramas.map((d) => d.id));
  const idsParticipantes = new Set(participantes.map((p) => p.id));

  for (const s of secciones) {
    if (!idsParticipantes.has(s.participante)) errores.push(`${s.id}: participante ${s.participante} no existe`);
    if (s.numero !== null && !s.claves) errores.push(`${s.id}: una sección numerada necesita sus cinco claves`);
    s.diapositivas.forEach((d, i) => {
      if (ids.has(d.id)) errores.push(`${d.id}: id repetido`);
      ids.add(d.id);
      if (d.recorridos.length === 0) errores.push(`${d.id}: no pertenece a ningún recorrido`);
      if (d.visible.length === 0 || d.visible.length > LIMITES.lineasVisibles) errores.push(`${d.id}: necesita entre 1 y ${LIMITES.lineasVisibles} líneas visibles`);
      for (const l of d.visible) if (l.length > LIMITES.caracteresPorLinea) errores.push(`${d.id}: línea visible demasiado larga: "${l}"`);
      if (d.guion.decir.length === 0) errores.push(`${d.id}: falta el texto para decir`);
      const ultima = s === secciones[secciones.length - 1] && i === s.diapositivas.length - 1;
      if (!ultima && !d.guion.transicion) errores.push(`${d.id}: falta la transición`);
      if (d.diagrama && !idsDiagramas.has(d.diagrama)) errores.push(`${d.id}: diagrama ${d.diagrama} no existe`);
      if (d.guion.pregunta && !d.guion.pregunta.respuesta) errores.push(`${d.id}: la pregunta necesita respuesta esperada`);
      if (d.iconos && d.iconos.length !== d.visible.length) errores.push(`${d.id}: necesita un ícono por línea visible (${d.iconos.length} de ${d.visible.length})`);
      errores.push(...validarVisual(d.id, d.visual));
    });
    if (s.numero !== null && !s.icono) errores.push(`${s.id}: una sección numerada necesita su ícono`);
  }


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

  for (const id of idsDiagramas) {
    const usado = secciones.some((s) => s.diapositivas.some((d) => d.diagrama === id));
    if (!usado) errores.push(`diagrama ${id}: ninguna diapositiva lo usa`);
  }
  return errores;
}

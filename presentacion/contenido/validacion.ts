import { secciones } from "./index.ts";
import { participantes } from "./participantes.ts";
import { operaciones } from "./laboratorio.ts";
import { diagramas } from "../diagramas/definiciones.ts";

// Reglas de consistencia entre contenido, diagramas y laboratorio. Las usan
// `npm run validar`, las pruebas y el CI.
export const LIMITES = { lineasVisibles: 6, caracteresPorLinea: 90 } as const;

export function validarContenido(): string[] {
  const errores: string[] = [];
  const ids = new Set<string>();
  const idsDiapositivas = new Set(secciones.flatMap((s) => s.diapositivas.map((d) => d.id)));
  const idsDiagramas = new Set(diagramas.map((d) => d.id));
  const idsOperaciones = new Set(operaciones.map((o) => o.id));
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
      const lab = d.guion.demo?.laboratorio;
      if (lab && !idsOperaciones.has(lab)) errores.push(`${d.id}: operación ${lab} no existe`);
      if (d.guion.pregunta && !d.guion.pregunta.respuesta) errores.push(`${d.id}: la pregunta necesita respuesta esperada`);
    });
  }

  for (const o of operaciones) {
    if (!idsDiapositivas.has(o.explicacion)) errores.push(`operación ${o.id}: la explicación ${o.explicacion} no existe`);
    if (!o.ruta.startsWith("/api/")) errores.push(`operación ${o.id}: el navegador solo debe usar /api`);
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

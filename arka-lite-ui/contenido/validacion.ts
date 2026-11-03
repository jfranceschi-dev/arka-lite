import { operaciones } from "./laboratorio.ts";
import { temasAyuda } from "./ayuda.ts";
import { diagramas } from "../diagramas/definiciones.ts";

// Reglas de consistencia entre operaciones, temas de Ayuda y diagramas. Las usan `npm run validar`, las pruebas y el CI.
export function validarContenido(): string[] {
  const errores: string[] = [];
  const idsTemas = new Set(temasAyuda.map((t) => t.id));
  const idsDiagramas = new Set(diagramas.map((d) => d.id));

  for (const o of operaciones) {
    if (!idsTemas.has(o.explicacion)) errores.push(`operación ${o.id}: el tema ${o.explicacion} no existe`);
    if (!o.ruta.startsWith("/api/")) errores.push(`operación ${o.id}: el navegador solo debe usar /api`);
  }
  for (const t of temasAyuda) {
    if (t.diagrama && !idsDiagramas.has(t.diagrama)) errores.push(`tema ${t.id}: el diagrama ${t.diagrama} no existe`);
  }
  if (idsTemas.size !== temasAyuda.length) errores.push("hay ids de tema repetidos");

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
    if (!temasAyuda.some((t) => t.diagrama === d.id)) errores.push(`diagrama ${d.id}: ningún tema de Ayuda lo usa`);
  }
  return errores;
}

// Genera las tres variantes en docs/presentation-data/pptx/.
//   npm run pptx               → resumen, ejecutivo y técnico
//   npm run pptx -- tecnico    → solo una
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RECORRIDOS, type Recorrido } from "../contenido/tipos.ts";
import { DIR_PPTX } from "../entregables.ts";
import { generarPptx, nombreArchivo } from "./construir.ts";

const salida = DIR_PPTX;
mkdirSync(salida, { recursive: true });

const pedido = process.argv[2] as Recorrido | undefined;
const recorridos: Recorrido[] = pedido && RECORRIDOS.includes(pedido) ? [pedido] : RECORRIDOS;

for (const r of recorridos) {
  const ruta = join(salida, nombreArchivo(r));
  writeFileSync(ruta, await generarPptx(r));
  console.log("PPTX generado:", ruta);
}

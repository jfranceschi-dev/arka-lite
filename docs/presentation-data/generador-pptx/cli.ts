// Genera los dos recorridos en docs/presentation-data/pptx/.
//   npm run pptx               → ejecutivo y técnico
//   npm run pptx -- tecnico    → solo uno
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Recorrido } from "../contenido/tipos.ts";
import { DIR_PPTX } from "../entregables.ts";
import { generarPptx, nombreArchivo } from "./construir.ts";

const salida = DIR_PPTX;
mkdirSync(salida, { recursive: true });

const pedido = process.argv[2];
const recorridos: Recorrido[] = pedido === "ejecutivo" || pedido === "tecnico" ? [pedido] : ["ejecutivo", "tecnico"];

for (const r of recorridos) {
  const ruta = join(salida, nombreArchivo(r));
  writeFileSync(ruta, await generarPptx(r));
  console.log("PPTX generado:", ruta);
}

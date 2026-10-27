// Genera los dos recorridos en docs/presentation-data/pptx/.
//   npm run pptx               → ejecutivo y técnico
//   npm run pptx -- tecnico    → solo uno
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Recorrido } from "../contenido/tipos.ts";
import { DIR_PPTX } from "../entregables.ts";
import { construirPresentacion, nombreArchivo } from "./construir.ts";

const salida = DIR_PPTX;
mkdirSync(salida, { recursive: true });

const pedido = process.argv[2];
const recorridos: Recorrido[] = pedido === "ejecutivo" || pedido === "tecnico" ? [pedido] : ["ejecutivo", "tecnico"];

for (const r of recorridos) {
  const ruta = join(salida, nombreArchivo(r));
  await construirPresentacion(r).writeFile({ fileName: ruta });
  console.log("PPTX generado:", ruta);
}

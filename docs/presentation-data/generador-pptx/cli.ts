// Genera las dos versiones en docs/presentation-data/pptx/.
//   npm run pptx                          → las dos
//   npm run pptx -- ejecutivo-con-videos  → solo una
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { VARIANTES, type Variante } from "../contenido/tipos.ts";
import { DIR_PPTX } from "../entregables.ts";
import { generarPptx, nombreArchivo } from "./construir.ts";

const salida = DIR_PPTX;
mkdirSync(salida, { recursive: true });
// Solo quedan las versiones que se presentan. "~$" es el bloqueo de PowerPoint
// cuando el archivo está abierto.
for (const f of readdirSync(salida)) if (f.endsWith(".pptx") && !f.startsWith("~$") && !VARIANTES.some((v) => f === nombreArchivo(v))) rmSync(join(salida, f));

const pedido = process.argv[2] as Variante | undefined;
const variantes: Variante[] = pedido && VARIANTES.includes(pedido) ? [pedido] : VARIANTES;

for (const r of variantes) {
  const ruta = join(salida, nombreArchivo(r));
  writeFileSync(ruta, await generarPptx(r));
  console.log("PPTX generado:", ruta);
}

// Genera los dos recorridos en presentacion/salida/.
//   npm run pptx               → ejecutivo y técnico
//   npm run pptx -- tecnico    → solo uno
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Recorrido } from "../contenido/tipos.ts";
import { construirPresentacion, nombreArchivo } from "./construir.ts";

const salida = join(dirname(fileURLToPath(import.meta.url)), "..", "salida");
mkdirSync(salida, { recursive: true });

const pedido = process.argv[2];
const recorridos: Recorrido[] = pedido === "ejecutivo" || pedido === "tecnico" ? [pedido] : ["ejecutivo", "tecnico"];

for (const r of recorridos) {
  const ruta = join(salida, nombreArchivo(r));
  await construirPresentacion(r).writeFile({ fileName: ruta });
  console.log("PPTX generado:", ruta);
}

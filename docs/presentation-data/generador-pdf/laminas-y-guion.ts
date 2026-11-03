// Genera el PDF de cada lámina con su guion debajo, a partir de las imágenes que
// exporta PowerPoint. Lo llama exportar-laminas.ps1 (npm run pdf-laminas):
//   node generador-pdf/laminas-y-guion.ts <carpeta>   (con <carpeta>/<variante>/<n>.png)
import { createWriteStream } from "node:fs";
import { join } from "node:path";
import { VARIANTES } from "../contenido/tipos.ts";
import { DIR_PDF } from "../entregables.ts";
import { construirLaminasYGuion, nombreLaminasYGuion } from "./lectura.ts";

const carpeta = process.argv[2];
if (!carpeta) throw new Error("Falta la carpeta con las imágenes de las láminas.");

for (const v of VARIANTES) {
  const ruta = join(DIR_PDF, nombreLaminasYGuion(v));
  const doc = construirLaminasYGuion(v, join(carpeta, v));
  await new Promise<void>((listo, fallo) => {
    const salida = createWriteStream(ruta);
    salida.on("finish", listo);
    salida.on("error", fallo);
    doc.pipe(salida);
    doc.end();
  });
  console.log("PDF de láminas y guion:", ruta);
}

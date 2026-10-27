// Genera el PDF de contenido y guion de cada recorrido en
// docs/presentation-data/pdf/.
//   npm run pdf
import { createWriteStream, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Recorrido } from "../contenido/tipos.ts";
import { DIR_PDF } from "../entregables.ts";
import { construirPdf, nombreArchivoPdf } from "./construir.ts";

mkdirSync(DIR_PDF, { recursive: true });

for (const r of ["ejecutivo", "tecnico"] as Recorrido[]) {
  const ruta = join(DIR_PDF, nombreArchivoPdf(r));
  const doc = construirPdf(r);
  await new Promise<void>((listo, fallo) => {
    const salida = createWriteStream(ruta);
    salida.on("finish", listo);
    salida.on("error", fallo);
    doc.pipe(salida);
    doc.end();
  });
  console.log("PDF generado:", ruta);
}

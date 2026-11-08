// Genera el PDF de contenido y guion, y el que trae solo el guion, de cada
// variante en docs/presentation-data/pdf/.
//   npm run pdf
import { createWriteStream, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { VARIANTES } from "../contenido/tipos.ts";
import { DIR_PDF } from "../entregables.ts";
import { construirPdf, nombreArchivoPdf } from "./construir.ts";
import { construirSoloGuion, nombreSoloGuion } from "./lectura.ts";

mkdirSync(DIR_PDF, { recursive: true });
// Solo quedan las versiones que se presentan; sus PDF de láminas los exporta
// npm run pdf-laminas.
for (const f of readdirSync(DIR_PDF)) {
  if (!f.endsWith(".pdf") || VARIANTES.some((v) => f.startsWith(`ARKA-Lite-${v}-`))) continue;
  try {
    rmSync(join(DIR_PDF, f), { force: true });
  } catch {
    console.warn(`No se pudo borrar ${f}: está abierto en otro programa. Bórralo a mano después.`);
  }
}

const pdfs = VARIANTES.flatMap((r) => [
  { ruta: join(DIR_PDF, nombreArchivoPdf(r)), construir: () => construirPdf(r) },
  { ruta: join(DIR_PDF, nombreSoloGuion(r)), construir: () => construirSoloGuion(r) },
]);
for (const { ruta, construir } of pdfs) {
  const doc = construir();
  await new Promise<void>((listo, fallo) => {
    const salida = createWriteStream(ruta);
    salida.on("finish", listo);
    salida.on("error", fallo);
    doc.pipe(salida);
    doc.end();
  });
  console.log("PDF generado:", ruta);
}

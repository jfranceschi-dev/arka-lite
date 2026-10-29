// Genera el PDF de contenido y guion de cada recorrido en
// docs/presentation-data/pdf/.
//   npm run pdf
import { createWriteStream, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { RECORRIDOS } from "../contenido/tipos.ts";
import { DIR_PDF } from "../entregables.ts";
import { construirPdf, nombreArchivoPdf } from "./construir.ts";

mkdirSync(DIR_PDF, { recursive: true });
// Los PDF de guion de versiones anteriores se llamaban ARKA-Lite-<variante>.pdf.
for (const r of RECORRIDOS) {
  const viejo = join(DIR_PDF, `ARKA-Lite-${r}.pdf`);
  try {
    rmSync(viejo, { force: true });
  } catch {
    console.warn(`No se pudo borrar ${viejo}: está abierto en otro programa. Bórralo a mano después.`);
  }
}

for (const r of RECORRIDOS) {
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

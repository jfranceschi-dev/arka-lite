// Comprueba que cada PPTX generado es un paquete válido: tamaño 16:9, una
// nota por diapositiva y texto editable (sin diapositivas hechas de imágenes).
//   node generador-pptx/verificar.ts
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const salida = join(dirname(fileURLToPath(import.meta.url)), "..", "salida");
let fallos = 0;

for (const archivo of readdirSync(salida).filter((f) => f.endsWith(".pptx"))) {
  const zip = await JSZip.loadAsync(readFileSync(join(salida, archivo)));
  const presentacion = await zip.file("ppt/presentation.xml")?.async("string");
  const tam = presentacion?.match(/<p:sldSz cx="(\d+)" cy="(\d+)"/);
  const diapositivas = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
  const notas = Object.keys(zip.files).filter((f) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(f));
  const imagenes = Object.keys(zip.files).filter((f) => f.startsWith("ppt/media/") && !zip.files[f].dir);
  let sinTexto = 0;
  let formas = 0;
  const fuera: string[] = [];
  const [ancho, alto] = [Number(tam?.[1] ?? 0), Number(tam?.[2] ?? 0)];
  for (const d of diapositivas) {
    const xml = (await zip.file(d)?.async("string")) ?? "";
    if (!xml.includes("<a:t>")) sinTexto++;
    formas += (xml.match(/<p:sp>/g) ?? []).length + (xml.match(/<p:cxnSp>/g) ?? []).length;
    // Toda forma con texto o conector debe quedar dentro de la diapositiva.
    // Los círculos decorativos de portada salen a propósito y se excluyen.
    for (const forma of xml.split(/<p:sp>|<p:cxnSp>/).slice(1)) {
      if (forma.includes('prst="ellipse"')) continue;
      const off = forma.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>/);
      const ext = forma.match(/<a:ext cx="(\d+)" cy="(\d+)"\/>/);
      if (!off || !ext) continue;
      const [x, y, w, h] = [Number(off[1]), Number(off[2]), Number(ext[1]), Number(ext[2])];
      if (x < 0 || y < 0 || x + w > ancho + 1 || y + h > alto + 1) fuera.push(d.replace("ppt/slides/", ""));
    }
  }
  const problemas: string[] = [];
  if (fuera.length) problemas.push(`formas fuera de la diapositiva en ${Array.from(new Set(fuera)).join(", ")}`);
  if (!tam || Number(tam[1]) / Number(tam[2]) < 1.77 || Number(tam[1]) / Number(tam[2]) > 1.78) problemas.push(`tamaño no es 16:9 (${tam?.[1]}×${tam?.[2]})`);
  if (notas.length < diapositivas.length) problemas.push(`faltan notas: ${notas.length} de ${diapositivas.length}`);
  if (sinTexto > 0) problemas.push(`${sinTexto} diapositivas sin texto editable`);
  if (imagenes.length > 0) problemas.push(`${imagenes.length} imágenes incrustadas`);
  console.log(`${archivo}: ${diapositivas.length} diapositivas · ${notas.length} notas · ${formas} formas editables · ${imagenes.length} imágenes${problemas.length ? " · PROBLEMAS: " + problemas.join("; ") : " · OK"}`);
  if (problemas.length) fallos++;
}
process.exit(fallos ? 1 : 0);

import PDFDocument from "pdfkit";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { laminas, nombreVariante, type Lamina, type Variante } from "../contenido/index.ts";
import { quienPresenta, rolDe } from "../contenido/reparto.ts";
import { color } from "../diseno/tokens.ts";
import { texto } from "./construir.ts";

// Dos PDF para leer en voz alta, sin nada más: solo el guion, y cada lámina con
// su guion debajo. El guion es lo que se dice (decir) y la frase para pasar a
// la siguiente lámina; lo demás (con tus palabras, preguntas, si hay tiempo)
// queda en el PDF de guion completo.

type Doc = PDFKit.PDFDocument;
const ANCHO = 612;
const ALTO = 792;
const M = 54;
const CW = ANCHO - 2 * M;
const FUENTE = "Helvetica";
const NEGRITA = "Helvetica-Bold";
const CURSIVA = "Helvetica-Oblique";
const GRIS = "#5A6E87";

export const nombreSoloGuion = (v: Variante): string => `ARKA-Lite-${v}-solo-guion.pdf`;
export const nombreLaminasYGuion = (v: Variante): string => `ARKA-Lite-${v}-laminas-y-guion.pdf`;

function documento(v: Variante, que: string): Doc {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: M, bottom: M, left: M, right: M }, info: { Title: texto(`ARKA-Lite · ${que} · ${nombreVariante(v)}`) } });
  doc.font(NEGRITA).fontSize(20).fillColor(color.texto).text(texto(`ARKA-Lite · ${que}`), M, M, { width: CW });
  doc.font(FUENTE).fontSize(11).fillColor(GRIS).text(texto(`Versión ${nombreVariante(v).toLowerCase()}`), M, doc.y + 2, { width: CW });
  doc.moveDown(1);
  return doc;
}

// Número, título y quién presenta; nunca queda solo al pie de una página.
function encabezado(doc: Doc, numero: number, l: Lamina) {
  if (doc.y + 90 > ALTO - M) doc.addPage();
  doc.font(NEGRITA).fontSize(9).fillColor(color.azul).text(texto(`LÁMINA ${numero} · PRESENTA ${quienPresenta(rolDe(l)).toUpperCase()}`), M, doc.y, { width: CW, characterSpacing: 0.6 });
  doc.font(NEGRITA).fontSize(14).fillColor(color.texto).text(texto(l.diapositiva.titulo), M, doc.y + 2, { width: CW });
  doc.moveDown(0.5);
}

function guion(doc: Doc, l: Lamina) {
  for (const parrafo of l.diapositiva.guion.decir) {
    doc.font(FUENTE).fontSize(12).fillColor(color.texto).text(texto(parrafo), M, doc.y, { width: CW, lineGap: 3 });
    doc.moveDown(0.55);
  }
  const transicion = l.diapositiva.guion.transicion;
  if (transicion) {
    doc.font(CURSIVA).fontSize(12).fillColor(color.azul).text(texto(transicion), M, doc.y, { width: CW, lineGap: 3 });
    doc.moveDown(0.55);
  }
}

export function construirSoloGuion(v: Variante): Doc {
  const doc = documento(v, "Guion");
  laminas(v).forEach((l, i) => {
    encabezado(doc, i + 1, l);
    guion(doc, l);
    doc.moveDown(0.6);
  });
  return doc;
}

// Las imágenes son las láminas exportadas por PowerPoint: <carpeta>/<n>.png.
export function construirLaminasYGuion(v: Variante, carpeta: string): Doc {
  const doc = documento(v, "Láminas y guion");
  laminas(v).forEach((l, i) => {
    if (i > 0) doc.addPage();
    const imagen = join(carpeta, `${i + 1}.png`);
    if (!existsSync(imagen)) throw new Error(`Falta la imagen de la lámina ${i + 1}: ${imagen}`);
    const alto = (CW * 9) / 16;
    const y = doc.y;
    doc.image(imagen, M, y, { width: CW, height: alto });
    doc.rect(M, y, CW, alto).lineWidth(0.75).strokeColor("#C9D6E5").stroke();
    doc.y = y + alto + 14;
    encabezado(doc, i + 1, l);
    guion(doc, l);
  });
  return doc;
}

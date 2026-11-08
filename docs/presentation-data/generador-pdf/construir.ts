import PDFDocument from "pdfkit";
import { laminas, etiquetaSeccion, nombreVariante, partesDe, type Lamina, type Variante } from "../contenido/index.ts";
import { quienPresenta, rolDe } from "../contenido/reparto.ts";
import { color } from "../diseno/tokens.ts";

// PDF de lectura: cada lámina con lo que se ve y el guion (qué decir, con tus
// palabras, si preguntan, para pasar). Usa las fuentes
// estándar del PDF para que el resultado sea igual en Windows y en CI.

type Doc = PDFKit.PDFDocument;
const ANCHO = 612;
const ALTO = 792;
const M = 54;
const CW = ANCHO - 2 * M;
const FUENTE = "Helvetica";
const NEGRITA = "Helvetica-Bold";
const CURSIVA = "Helvetica-Oblique";

export function nombreArchivoPdf(variante: Variante): string {
  return `ARKA-Lite-${variante}-guion.pdf`;
}

// Las fuentes estándar solo cubren WinAnsi: los símbolos fuera de ese juego
// se reemplazan por equivalentes legibles.
const REEMPLAZOS: Record<string, string> = { "→": "->", "←": "<-", "↔": "<->", "⇒": "=>", "✓": "OK", "✗": "X", "≥": ">=", "≤": "<=", "≠": "!=", "≈": "~", "⟶": "->", "↑": "^", "↓": "v", "×": "x" };
export function texto(t: string): string {
  return Array.from(t)
    .map((c) => REEMPLAZOS[c] ?? (c.charCodeAt(0) < 0x2000 || "–—‘’“”•…€™·«»".includes(c) ? c : "?"))
    .join("");
}

function espacio(doc: Doc, alto: number) {
  if (doc.y + alto > ALTO - M) doc.addPage();
}

function titulo(doc: Doc, t: string, tamano: number, c: string = color.texto) {
  doc.font(NEGRITA).fontSize(tamano).fillColor(c).text(texto(t), M, doc.y, { width: CW });
}

function etiqueta(doc: Doc, t: string, c: string = color.azul) {
  espacio(doc, 40);
  doc.moveDown(0.5).font(NEGRITA).fontSize(8.5).fillColor(c).text(texto(t.toUpperCase()), M, doc.y, { width: CW, characterSpacing: 0.8 });
  doc.moveDown(0.25);
}

function parrafo(doc: Doc, t: string, opciones: { fuente?: string; tamano?: number; c?: string; sangria?: number } = {}) {
  doc.font(opciones.fuente ?? FUENTE).fontSize(opciones.tamano ?? 10.5).fillColor(opciones.c ?? color.texto)
    .text(texto(t), M + (opciones.sangria ?? 0), doc.y, { width: CW - (opciones.sangria ?? 0), lineGap: 2 });
}

function vinetas(doc: Doc, lineas: string[], numeradas = false) {
  lineas.forEach((l, i) => {
    espacio(doc, 16);
    const y = doc.y;
    doc.font(NEGRITA).fontSize(10.5).fillColor(color.azul).text(numeradas ? `${i + 1}.` : "•", M, y, { width: 16 });
    doc.font(FUENTE).fontSize(10.5).fillColor(color.texto).text(texto(l), M + 18, y, { width: CW - 18, lineGap: 2 });
    doc.moveDown(0.15);
  });
}

// Recuadro con fondo para el texto que se dice en voz alta.
function recuadro(doc: Doc, encabezado: string, parrafos: string[], fondo: string, borde: string) {
  doc.font(FUENTE).fontSize(10.5);
  const cuerpo = parrafos.map(texto).join("\n\n");
  const alto = doc.heightOfString(cuerpo, { width: CW - 24, lineGap: 2 }) + 34;
  espacio(doc, Math.min(alto, 300));
  const y = doc.y + 4;
  if (alto < ALTO - 2 * M) {
    doc.roundedRect(M, y, CW, alto, 8).fillAndStroke(fondo, borde);
    doc.font(NEGRITA).fontSize(8.5).fillColor(color.azul).text(texto(encabezado.toUpperCase()), M + 12, y + 10, { width: CW - 24, characterSpacing: 0.8 });
    doc.font(FUENTE).fontSize(10.5).fillColor(color.texto).text(cuerpo, M + 12, y + 24, { width: CW - 24, lineGap: 2 });
    doc.y = y + alto + 4;
  } else {
    etiqueta(doc, encabezado);
    parrafo(doc, cuerpo);
  }
}

function portada(doc: Doc, variante: Variante) {
  doc.rect(0, 0, ANCHO, ALTO).fill(color.marino);
  doc.rect(0, 0, 10, ALTO).fill(color.cian);
  doc.font(NEGRITA).fontSize(14).fillColor(color.cianClaro).text("ARKA-Lite", M, 120);
  doc.font(NEGRITA).fontSize(34).fillColor("#FFFFFF").text("Proyecto final · Upskilling Backend Java", M, 150, { width: CW });
  doc.moveDown(0.6).font(FUENTE).fontSize(15).fillColor(color.sobreOscuroSecundario)
    .text("Equipo arka-litos: dos microservicios Spring Boot, sus bases de datos y su plataforma, contados de punta a punta.", { width: CW });
  doc.moveDown(1.5).font(NEGRITA).fontSize(11).fillColor(color.cian)
    .text(`${nombreVariante(variante).toUpperCase()} · CONTENIDO Y GUION`, { characterSpacing: 1.5 });
  doc.moveDown(3).font(NEGRITA).fontSize(10).fillColor(color.cianClaro).text("PARTES", { characterSpacing: 1.2 });
  doc.moveDown(0.4);
  for (const sec of partesDe(variante)) {
    doc.font(NEGRITA).fontSize(10.5).fillColor("#FFFFFF").text(`${sec.numero}. ${sec.titulo}`, M, doc.y, { continued: true })
      .font(FUENTE).fillColor(color.sobreOscuroSecundario).text(`  ${texto(sec.subtitulo ?? "")}`);
    doc.moveDown(0.3);
  }
  doc.font(FUENTE).fontSize(9).fillColor(color.sobreOscuroSecundario)
    .text("Generado desde docs/presentation-data/contenido. Cada lámina tiene: lo que se ve y el guion: qué decir, con tus palabras, si preguntan y para pasar.", M, ALTO - M - 30, { width: CW });
}

function encabezadoSeccion(doc: Doc, l: Lamina) {
  espacio(doc, 120);
  const y = doc.y + 6;
  doc.roundedRect(M, y, CW, 46, 10).fill(color.franja);
  doc.font(NEGRITA).fontSize(16).fillColor("#FFFFFF").text(texto(etiquetaSeccion(l.seccion)), M + 14, y + 9, { width: CW - 28 });
  if (l.seccion.subtitulo) doc.font(FUENTE).fontSize(9).fillColor(color.sobreOscuroSecundario).text(texto(l.seccion.subtitulo), M + 14, y + 29, { width: CW - 28 });
  doc.x = M;
  doc.y = y + 58;
}

function lamina(doc: Doc, l: Lamina, numero: number) {
  const d = l.diapositiva;
  espacio(doc, 90);
  doc.moveDown(0.6);
  doc.moveTo(M, doc.y).lineTo(M + CW, doc.y).lineWidth(0.6).stroke(color.borde);
  doc.moveDown(0.5);
  titulo(doc, `${numero}. ${d.titulo}`, 14);
  parrafo(doc, `Presenta: ${quienPresenta(rolDe(l))}`, { fuente: CURSIVA, tamano: 9, c: color.secundario });
  recuadro(doc, "Qué decir", [...d.guion.decir, ...(d.guion.transicion ? [d.guion.transicion] : [])], color.cianSuave, color.cianClaro);
  etiqueta(doc, "Si se te olvida, di esto", color.correcto);
  vinetas(doc, d.guion.conTusPalabras);
  if (d.guion.instrucciones?.length) {
    etiqueta(doc, "Qué hacer (no se dice)", color.advertenciaTexto);
    vinetas(doc, d.guion.instrucciones);
  }
  for (const p of d.guion.preguntas ?? []) {
    etiqueta(doc, "Si preguntan");
    parrafo(doc, p.texto, { fuente: NEGRITA });
    parrafo(doc, p.respuesta);
  }
  if (d.guion.ampliar?.length) {
    etiqueta(doc, "Si hay tiempo");
    vinetas(doc, d.guion.ampliar);
  }
}

export function construirPdf(variante: Variante): Doc {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: M, bottom: M, left: M, right: M }, bufferPages: true, info: { Title: `ARKA-Lite · ${nombreVariante(variante).toLowerCase()}`, Subject: "Proyecto final de Upskilling Backend Java" } });
  portada(doc, variante);
  doc.addPage();
  let seccion = "";
  laminas(variante).forEach((l, i) => {
    if (l.seccion.id !== seccion) {
      seccion = l.seccion.id;
      encabezadoSeccion(doc, l);
    }
    lamina(doc, l, i + 1);
  });
  // Pie con número de página, salvo en la portada.
  const paginas = doc.bufferedPageRange();
  for (let i = 1; i < paginas.count; i++) {
    doc.switchToPage(i);
    doc.font(FUENTE).fontSize(8).fillColor(color.secundario)
      .text(`ARKA-Lite · ${nombreVariante(variante).toLowerCase()} · ${i + 1}/${paginas.count}`, M, ALTO - M + 18, { width: CW, align: "right", lineBreak: false });
  }
  return doc;
}

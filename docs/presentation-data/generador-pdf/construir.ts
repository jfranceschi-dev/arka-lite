import PDFDocument from "pdfkit";
import { laminas, etiquetaSeccion, secciones, type Lamina } from "../contenido/index.ts";
import { EQUIPO, participantes, participantePorId } from "../contenido/participantes.ts";
import type { Recorrido, Tabla } from "../contenido/tipos.ts";
import { lineasDeVisual, nombreDeVisual } from "../contenido/visuales.ts";
import { diagramaPorId } from "../diagramas/definiciones.ts";
import { numeroDePaso, posicionEtiqueta, posicionNumero, rutaArista } from "../diagramas/geometria.ts";
import type { Diagrama } from "../diagramas/tipos.ts";
import { color, trazo } from "../diseno/tokens.ts";

// PDF de lectura: cada lámina con lo que se ve, su diagrama paso a paso y el
// guion (qué decir, qué hacer, si preguntan, para pasar). Usa las fuentes
// estándar del PDF para que el resultado sea igual en Windows y en CI.

type Doc = PDFKit.PDFDocument;
const ANCHO = 612;
const ALTO = 792;
const M = 54;
const CW = ANCHO - 2 * M;
const FUENTE = "Helvetica";
const NEGRITA = "Helvetica-Bold";
const CURSIVA = "Helvetica-Oblique";
const MONO = "Courier";

export function nombreArchivoPdf(recorrido: Recorrido): string {
  return `ARKA-Lite-${recorrido === "ejecutivo" ? "ejecutivo" : "tecnico"}.pdf`;
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

function tabla(doc: Doc, t: Tabla) {
  const columnas = t.encabezados.length;
  const ancho = CW / columnas;
  const fila = (celdas: string[], negrita: boolean, fondo: string | null) => {
    doc.font(negrita ? NEGRITA : FUENTE).fontSize(9);
    const alto = Math.max(...celdas.map((c) => doc.heightOfString(texto(c), { width: ancho - 10 }))) + 10;
    espacio(doc, alto);
    const y = doc.y;
    if (fondo) doc.rect(M, y, CW, alto).fill(fondo);
    doc.moveTo(M, y + alto).lineTo(M + CW, y + alto).lineWidth(0.5).stroke(color.borde);
    celdas.forEach((c, i) => {
      doc.font(negrita ? NEGRITA : FUENTE).fontSize(9).fillColor(color.texto).text(texto(c), M + i * ancho + 5, y + 5, { width: ancho - 10 });
    });
    doc.y = y + alto;
  };
  doc.moveDown(0.3);
  fila(t.encabezados, true, color.superficie2);
  for (const f of t.filas) fila(f, false, null);
  doc.moveDown(0.5);
}

const GUIONES: Partial<Record<string, [number, number]>> = { posterior: [6, 4], interno: [1.5, 4], error: [3, 4], dependencia: [4, 3] };

// Diagrama estático: todos los elementos visibles y cada flecha con el
// número del paso que la explica.
function diagrama(doc: Doc, d: Diagrama) {
  const altoMax = 230;
  const e = Math.min(CW / d.ancho, altoMax / d.alto);
  const w = d.ancho * e;
  const h = d.alto * e;
  espacio(doc, h + 20);
  const ox = M + (CW - w) / 2;
  const oy = doc.y + 6;
  const X = (v: number) => ox + v * e;
  const Y = (v: number) => oy + v * e;
  doc.save();
  doc.roundedRect(ox, oy, w, h, 6).fill(color.superficie2);

  for (const z of d.zonas ?? []) {
    doc.roundedRect(X(z.x), Y(z.y), z.w * e, z.h * e, 6).lineWidth(0.8);
    if (z.punteada) doc.dash(4, { space: 3 });
    doc.fillAndStroke("#FFFFFF", color.borde).undash();
    doc.font(NEGRITA).fontSize(Math.max(5.5, 11 * e)).fillColor(color.secundario).text(texto(z.etiqueta), X(z.x + 10), Y(z.y + 6), { width: z.w * e - 10, lineBreak: false });
  }

  for (const a of d.aristas) {
    const t = trazo[a.tipo];
    const ruta = rutaArista(d, a);
    doc.lineWidth(Math.max(0.6, t.ancho * e * 1.4)).strokeColor(t.color);
    const g = GUIONES[a.tipo];
    if (g) doc.dash(g[0], { space: g[1] });
    doc.moveTo(X(ruta[0][0]), Y(ruta[0][1]));
    for (const p of ruta.slice(1)) doc.lineTo(X(p[0]), Y(p[1]));
    doc.stroke().undash();
    if (t.punta !== "ninguna" && ruta.length > 1) {
      const [ax, ay] = ruta[ruta.length - 2];
      const [bx, by] = ruta[ruta.length - 1];
      const ang = Math.atan2(by - ay, bx - ax);
      const l = 6;
      const px = X(bx);
      const py = Y(by);
      doc.moveTo(px, py).lineTo(px - l * Math.cos(ang - 0.45), py - l * Math.sin(ang - 0.45)).lineTo(px - l * Math.cos(ang + 0.45), py - l * Math.sin(ang + 0.45)).closePath();
      if (t.punta === "llena") doc.fill(t.color);
      else doc.lineWidth(0.8).stroke(t.color);
    }
    if (a.etiqueta) {
      const p = posicionEtiqueta(ruta, a.lado);
      const tam = Math.max(6.5, 11 * e);
      doc.font(MONO).fontSize(tam);
      const ancho = doc.widthOfString(texto(a.etiqueta)) + 4;
      const x = p.ancla === "middle" ? X(p.x) - ancho / 2 : p.ancla === "end" ? X(p.x) - ancho : X(p.x);
      doc.rect(x, Y(p.y) - tam, ancho, tam + 2).fill(color.superficie2);
      doc.fillColor(t.color).text(texto(a.etiqueta), x + 2, Y(p.y) - tam + 1, { lineBreak: false });
    }
    const n = numeroDePaso(d, a.id);
    if (n !== null && ruta.length > 1) {
      const [nx, ny] = posicionNumero(ruta);
      const r = Math.max(5, 11 * e);
      doc.circle(X(nx), Y(ny), r).fill(t.color);
      doc.font(NEGRITA).fontSize(r * 1.1).fillColor("#FFFFFF").text(String(n), X(nx) - r, Y(ny) - r * 0.55, { width: 2 * r, align: "center", lineBreak: false });
    }
  }

  for (const n of d.nodos) {
    const tipo = n.tipo ?? "componente";
    const fondo = tipo === "memoria" ? color.advertenciaSuave : tipo === "datos" ? "#EEF3FA" : tipo === "infra" ? color.superficie2 : "#FFFFFF";
    const borde = tipo === "memoria" ? color.advertencia : tipo === "pendiente" ? color.secundario : color.azul;
    const radio = tipo === "persona" ? (n.h * e) / 2 : 5;
    doc.lineWidth(0.9);
    if (tipo === "memoria" || tipo === "pendiente" || tipo === "contrato") doc.dash(3, { space: 2 });
    if (tipo === "decision") {
      const cx = X(n.x + n.w / 2);
      const cy = Y(n.y + n.h / 2);
      doc.polygon([cx, Y(n.y)], [X(n.x + n.w), cy], [cx, Y(n.y + n.h)], [X(n.x), cy]).fillAndStroke(color.cianSuave, color.cian);
    } else {
      doc.roundedRect(X(n.x), Y(n.y), n.w * e, n.h * e, radio).fillAndStroke(fondo, borde);
    }
    doc.undash();
    const tamT = Math.max(5.5, 14 * e);
    const tamS = Math.max(6, 11.5 * e);
    doc.font(NEGRITA).fontSize(tamT);
    const altoT = doc.heightOfString(texto(n.titulo), { width: n.w * e - 6 });
    doc.font(FUENTE).fontSize(tamS);
    const altoS = n.subtitulo ? doc.heightOfString(texto(n.subtitulo), { width: n.w * e - 6 }) : 0;
    const y0 = Y(n.y) + (n.h * e - altoT - altoS) / 2;
    doc.font(NEGRITA).fontSize(tamT).fillColor(color.texto).text(texto(n.titulo), X(n.x) + 3, y0, { width: n.w * e - 6, align: "center" });
    if (n.subtitulo) doc.font(FUENTE).fontSize(tamS).fillColor(color.secundario).text(texto(n.subtitulo), X(n.x) + 3, y0 + altoT, { width: n.w * e - 6, align: "center" });
  }
  doc.restore();
  doc.x = M;
  doc.y = oy + h + 8;

  // Leyenda corta: solo los tipos de flecha que aparecen.
  const tipos = Array.from(new Set(d.aristas.map((a) => a.tipo)));
  let x = M;
  const y = doc.y;
  for (const tipo of tipos) {
    const t = trazo[tipo];
    const g = GUIONES[tipo];
    doc.lineWidth(1.4).strokeColor(t.color);
    if (g) doc.dash(g[0], { space: g[1] });
    doc.moveTo(x, y + 4).lineTo(x + 18, y + 4).stroke().undash();
    doc.font(FUENTE).fontSize(7.5).fillColor(color.secundario);
    const ancho = doc.widthOfString(t.etiqueta);
    doc.text(t.etiqueta, x + 22, y, { lineBreak: false });
    x += 22 + ancho + 14;
  }
  doc.x = M;
  doc.y = y + 14;
}

function portada(doc: Doc, recorrido: Recorrido) {
  doc.rect(0, 0, ANCHO, ALTO).fill(color.marino);
  doc.rect(0, 0, 10, ALTO).fill(color.cian);
  doc.font(NEGRITA).fontSize(14).fillColor(color.cianClaro).text("ARKA-Lite", M, 120);
  doc.font(NEGRITA).fontSize(34).fillColor("#FFFFFF").text("Proyecto final · Upskilling Backend Java", M, 150, { width: CW });
  doc.moveDown(0.6).font(FUENTE).fontSize(15).fillColor(color.sobreOscuroSecundario)
    .text("Una UI y dos microservicios Spring Boot: lo que aprendimos y cómo funciona.", { width: CW });
  doc.moveDown(1.5).font(NEGRITA).fontSize(11).fillColor(color.cian)
    .text(`RECORRIDO ${recorrido === "ejecutivo" ? "EJECUTIVO" : "TÉCNICO"} · CONTENIDO Y GUION`, { characterSpacing: 1.5 });
  doc.moveDown(3).font(NEGRITA).fontSize(10).fillColor(color.cianClaro).text(`REPARTO · ${EQUIPO.toUpperCase()}`, { characterSpacing: 1.2 });
  doc.moveDown(0.4);
  for (const p of participantes) {
    const temas = secciones.filter((s) => s.participante === p.id).map((s) => s.corto).join(", ");
    doc.font(NEGRITA).fontSize(10.5).fillColor("#FFFFFF").text(`${p.nombre} · ${p.perfil}`, M, doc.y, { continued: true })
      .font(FUENTE).fillColor(color.sobreOscuroSecundario).text(`  ${texto(temas)}`);
    doc.moveDown(0.3);
  }
  doc.font(FUENTE).fontSize(9).fillColor(color.sobreOscuroSecundario)
    .text("Generado desde docs/presentation-data/contenido. Cada lámina tiene: lo que se ve, el diagrama paso a paso cuando lo hay, y el guion: qué decir, qué hacer, si preguntan y para pasar.", M, ALTO - M - 30, { width: CW });
}

function encabezadoSeccion(doc: Doc, l: Lamina) {
  espacio(doc, 120);
  const y = doc.y + 6;
  doc.roundedRect(M, y, CW, 46, 10).fill(color.franja);
  doc.font(NEGRITA).fontSize(16).fillColor("#FFFFFF").text(texto(etiquetaSeccion(l.seccion)), M + 14, y + 9, { width: CW - 28 });
  doc.font(FUENTE).fontSize(9).fillColor(color.sobreOscuroSecundario).text(`Presenta: ${participantePorId(l.seccion.participante).nombre} · ${participantePorId(l.seccion.participante).perfil}`, M + 14, y + 29, { width: CW - 28 });
  doc.x = M;
  doc.y = y + 58;
}

function lamina(doc: Doc, l: Lamina, numero: number, recorrido: Recorrido) {
  const d = l.diapositiva;
  espacio(doc, 90);
  doc.moveDown(0.6);
  doc.moveTo(M, doc.y).lineTo(M + CW, doc.y).lineWidth(0.6).stroke(color.borde);
  doc.moveDown(0.5);
  if (!d) {
    titulo(doc, `${numero}. Portada · ${l.seccion.titulo}`, 14);
    const c = l.seccion.claves;
    if (c) {
      etiqueta(doc, "En pantalla");
      vinetas(doc, [`¿Qué problema resuelve? ${c.problema}`, `¿Cómo funciona? ${c.sencillo}`, `¿Cómo se ve? ${c.visual}`, `¿Dónde está en ARKA-Lite? ${c.aplicacion}`, `¿Cómo lo comprobamos? ${c.evidencia}`]);
    }
    recuadro(doc, "Qué decir", [`“Ahora vamos con ${l.seccion.titulo.toLowerCase()}. Primero, qué problema resuelve.”`], color.cianSuave, color.cianClaro);
    return;
  }
  titulo(doc, `${numero}. ${d.titulo}`, 14);
  if (d.visual && !d.tabla) {
    etiqueta(doc, `En pantalla · ${nombreDeVisual(d.visual)}`);
    vinetas(doc, lineasDeVisual(d.visual));
    etiqueta(doc, "Ideas clave");
  } else {
    etiqueta(doc, "En pantalla");
  }
  vinetas(doc, d.visible);
  if (d.comparacion) parrafo(doc, `Comparación: ${d.comparacion}`, { fuente: CURSIVA, tamano: 9.5, c: color.secundario });
  if (d.diagrama) {
    const fig = diagramaPorId(d.diagrama);
    etiqueta(doc, `Diagrama paso a paso · ${fig.titulo}`);
    diagrama(doc, fig);
    vinetas(doc, fig.pasos.map((p) => p.texto), true);
    if (fig.nota) parrafo(doc, fig.nota, { fuente: CURSIVA, tamano: 9.5, c: color.secundario });
  }
  if (d.tabla) tabla(doc, d.tabla);
  if (d.codigo && recorrido === "tecnico") {
    etiqueta(doc, `Código · ${d.codigo.archivo}`);
    doc.font(MONO).fontSize(8);
    const alto = doc.heightOfString(texto(d.codigo.texto), { width: CW - 20 }) + 16;
    espacio(doc, Math.min(alto, 400));
    const y = doc.y;
    doc.roundedRect(M, y, CW, alto, 6).fill(color.codigoFondo);
    doc.font(MONO).fontSize(8).fillColor(color.codigoTexto).text(texto(d.codigo.texto), M + 10, y + 8, { width: CW - 20 });
    doc.x = M;
    doc.y = y + alto + 4;
  }
  recuadro(doc, "Qué decir", d.guion.decir.map((t) => `“${t}”`), color.cianSuave, color.cianClaro);
  const hacer = [...(d.guion.instrucciones ?? []), ...(d.guion.demo ? [`Mostrar: ${d.guion.demo.accion} Debe verse: ${d.guion.demo.evidencia}`] : [])];
  if (hacer.length) {
    etiqueta(doc, "Qué hacer (no se dice)", color.advertenciaTexto);
    vinetas(doc, hacer);
  }
  if (d.guion.pregunta) {
    etiqueta(doc, "Si preguntan");
    parrafo(doc, d.guion.pregunta.texto, { fuente: NEGRITA });
    parrafo(doc, d.guion.pregunta.respuesta);
  }
  if (d.guion.transicion) {
    etiqueta(doc, "Para pasar");
    parrafo(doc, `“${d.guion.transicion}”`, { fuente: CURSIVA });
  }
}

export function construirPdf(recorrido: Recorrido): Doc {
  const doc = new PDFDocument({ size: "LETTER", margins: { top: M, bottom: M, left: M, right: M }, bufferPages: true, info: { Title: `ARKA-Lite · recorrido ${recorrido === "ejecutivo" ? "ejecutivo" : "técnico"}`, Subject: "Proyecto final de Upskilling Backend Java" } });
  portada(doc, recorrido);
  doc.addPage();
  let seccion = "";
  laminas(recorrido).forEach((l, i) => {
    if (l.seccion.id !== seccion) {
      seccion = l.seccion.id;
      encabezadoSeccion(doc, l);
    }
    lamina(doc, l, i + 1, recorrido);
  });
  // Pie con número de página, salvo en la portada.
  const paginas = doc.bufferedPageRange();
  for (let i = 1; i < paginas.count; i++) {
    doc.switchToPage(i);
    doc.font(FUENTE).fontSize(8).fillColor(color.secundario)
      .text(`ARKA-Lite · recorrido ${recorrido === "ejecutivo" ? "ejecutivo" : "técnico"} · ${i + 1}/${paginas.count}`, M, ALTO - M + 18, { width: CW, align: "right", lineBreak: false });
  }
  return doc;
}

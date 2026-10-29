import PptxGenJS from "pptxgenjs";
import { laminas, etiquetaSeccion, NOMBRE_RECORRIDO, secciones, type Lamina } from "../contenido/index.ts";
import { textoNotas } from "../contenido/notas.ts";
import type { BloqueCodigo, Certeza, Diapositiva, Recorrido, Tabla } from "../contenido/tipos.ts";
import { diagramaPorId } from "../diagramas/definiciones.ts";
import type { NombreIcono } from "../diseno/iconos.ts";
import { color } from "../diseno/tokens.ts";
import { colorCodigo, resaltar } from "../diseno/resaltado.ts";
import { ACC, ACC_S, ACC_T, CW, FUENTE, H, M, MONO, PRI, PROF, halo, sombra, TITULO, W, encabezado, hex, icono, insignia, logo, marcarPasos, mezclar, pie, type Slide } from "./base.ts";
import { diagrama } from "./diagrama.ts";
import { generarBuffer } from "./posproceso.ts";
import { tamQueCabe } from "./medidas.ts";
import { dibujarVisual, type Caja } from "./visuales.ts";

// Genera el PPTX desde la fuente de contenido. Todo es editable: textos,
// tablas, diagramas e íconos son formas nativas; solo las capturas de pantalla
// son imágenes. Las plantillas siguen el lienzo de diseño: portada oscura,
// portadas de sección con su ícono, láminas de una idea con tarjetas e íconos,
// láminas de impacto (cifras, flujos, capturas, escenarios de falla) y, en el
// recorrido técnico, diagramas detallados con sus pasos en la misma lámina.

export function nombreArchivo(recorrido: Recorrido): string {
  return `ARKA-Lite-${recorrido}.pptx`;
}

// ── Piezas comunes ────────────────────────────────────────────────────────

// Fila de chips con las frases visibles de una lámina de diagrama o tabla.
function chips(s: Slide, lineas: string[], y: number) {
  if (!lineas.length) return;
  const gap = 0.14;
  const ancho = (CW - gap * (lineas.length - 1)) / lineas.length;
  lineas.forEach((t, i) => {
    s.addText(t, { x: M + i * (ancho + gap), y, w: ancho, h: 0.42, shape: "roundRect", rectRadius: 0.08, margin: [2, 8, 2, 8], fill: { color: hex(color.fondo) }, line: { color: hex(color.linea), width: 0.75 }, fontFace: FUENTE, fontSize: tamQueCabe(t, ancho - 0.25, 0.38, 11, 7.5), color: hex(color.texto), valign: "middle", fit: "shrink" });
  });
}

const estiloCerteza: Record<Certeza, { fondo: string; texto: string; nombre: string }> = {
  implementado: { fondo: color.correctoSuave, texto: color.correcto, nombre: "Ya existe" },
  ejemplo: { fondo: ACC_S, texto: ACC_T, nombre: "Ejemplo" },
  propuesta: { fondo: color.advertenciaSuave, texto: color.advertenciaTexto, nombre: "Propuesta" },
};

function marcas(s: Slide, lista: { texto: string; certeza: Certeza }[], y: number) {
  let x = M;
  for (const m of lista) {
    const e = estiloCerteza[m.certeza];
    const texto = `${e.nombre} · ${m.texto}`;
    const ancho = Math.min(CW, 0.3 + texto.length * 0.066);
    if (x + ancho > W - M) { x = M; y += 0.36; }
    s.addText(texto, { x, y, w: ancho, h: 0.3, shape: "roundRect", rectRadius: 0.15, fill: { color: hex(e.fondo) }, line: { color: hex(e.fondo), width: 0 }, color: hex(e.texto), fontFace: FUENTE, fontSize: 9.5, bold: true, align: "center", valign: "middle", margin: 2 });
    x += ancho + 0.12;
  }
}

function tamanoCodigo(b: BloqueCodigo, ancho: number, alto: number): number {
  const lineas = b.texto.split("\n");
  const largo = Math.max(...lineas.map((l) => l.length), 10);
  const porAncho = ((ancho - 0.3) * 72) / (0.6 * largo);
  const porAlto = ((alto - 0.45) * 72) / (1.3 * lineas.length);
  return Math.max(7.5, Math.min(20, Math.floor(Math.min(porAncho, porAlto) * 2) / 2));
}

function codigo(s: Slide, b: BloqueCodigo, caja: Caja) {
  icono(s, "file-code", caja.x, caja.y + 0.01, 0.22, ACC_T);
  s.addText(b.archivo, { x: caja.x + 0.3, y: caja.y, w: caja.w - 0.3, h: 0.25, margin: 0, fontFace: MONO, fontSize: 9, color: hex(ACC_T) });
  const tam = tamanoCodigo(b, caja.w, caja.h - 0.3);
  const tramos: PptxGenJS.TextProps[] = [];
  const lineas = b.texto.split("\n");
  lineas.forEach((linea, i) => {
    const partes = resaltar(linea, b.lenguaje);
    if (partes.length === 0) partes.push({ texto: " ", clase: "texto" });
    partes.forEach((p, j) => tramos.push({ text: p.texto, options: { color: hex(colorCodigo[p.clase]), italic: p.clase === "comentario", breakLine: j === partes.length - 1 && i < lineas.length - 1 } }));
  });
  s.addText(tramos, { x: caja.x, y: caja.y + 0.3, w: caja.w, h: caja.h - 0.3, shape: "roundRect", rectRadius: 0.1, fill: { color: hex(color.codigoFondo) }, line: { color: hex(color.codigoFondo), width: 0 }, fontFace: MONO, fontSize: tam, valign: "top", margin: 12, lineSpacingMultiple: 1.1, shadow: sombra() });
}

function tabla(s: Slide, t: Tabla, caja: Caja) {
  const largos = t.encabezados.map((h, c) => Math.max(h.length, ...t.filas.map((f) => (f[c] ?? "").length)));
  const sumaLargos = largos.reduce((a, b) => a + b, 0);
  const colW = largos.map((l) => Math.max(1.4, (caja.w * l) / sumaLargos));
  const factor = caja.w / colW.reduce((a, b) => a + b, 0);
  const anchos = colW.map((w) => w * factor);
  let tam = 14;
  const altoCon = (pt: number) =>
    [t.encabezados, ...t.filas].reduce((suma, fila) => {
      const lineas = Math.max(...fila.map((celda, c) => Math.ceil(((celda ?? "").length || 1) / Math.max(4, ((anchos[c] - 0.2) * 72) / (pt * 0.52)))));
      return suma + (lineas * pt * 1.25) / 72 + 0.16;
    }, 0);
  while (tam > 9 && altoCon(tam) > caja.h) tam -= 0.5;
  const filas: PptxGenJS.TableRow[] = [
    t.encabezados.map((h) => ({ text: h, options: { bold: true, color: "FFFFFF", fill: { color: hex(PRI) } } })),
    ...t.filas.map((f, i) => f.map((c, j) => ({ text: c, options: { bold: j === 0, color: hex(color.texto), fill: { color: i % 2 === 0 ? "FFFFFF" : hex(color.fondo) } } }))),
  ];
  s.addTable(filas, { x: caja.x, y: caja.y, w: caja.w, colW: anchos, fontFace: FUENTE, fontSize: tam, valign: "middle", margin: [6, 8, 6, 8], border: { type: "solid", color: hex(color.linea), pt: 0.75 }, autoPage: false });
}

// La comparación cotidiana: ícono en un círculo y la frase al lado.
function comparacion(s: Slide, d: Diapositiva, caja: Caja) {
  s.addShape("roundRect", { x: caja.x, y: caja.y, w: caja.w, h: caja.h, rectRadius: 0.12, fill: { color: hex(ACC_S) }, line: { color: hex(mezclar(ACC, "#FFFFFF", 0.45)), width: 1 } });
  const dd = Math.min(0.66, caja.h - 0.24);
  insignia(s, d.iconoComparacion ?? "lightbulb", caja.x + 0.2, caja.y + (caja.h - dd) / 2, dd, "#FFFFFF", ACC_T);
  const tam = tamQueCabe(`Piénsenlo así: ${d.comparacion ?? ""}`, caja.w - dd - 0.6, caja.h - 0.16, 14.5, 9);
  s.addText([{ text: "Piénsenlo así: ", options: { bold: true, color: hex(ACC_T) } }, { text: d.comparacion ?? "", options: { color: hex(color.texto) } }], { x: caja.x + dd + 0.38, y: caja.y + 0.08, w: caja.w - dd - 0.55, h: caja.h - 0.16, margin: 0, fontFace: FUENTE, fontSize: tam, valign: "middle", fit: "shrink" });
}

function franjaPorque(s: Slide, texto: string) {
  s.addShape("rect", { x: 0, y: H - 0.98, w: W, h: 0.52, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 } });
  icono(s, "target", M, H - 0.86, 0.28, ACC);
  s.addText([
    { text: "¿Por qué importa?  ", options: { bold: true, color: hex(ACC) } },
    { text: texto, options: { color: "FFFFFF" } },
  ], { x: M + 0.4, y: H - 0.98, w: CW - 0.4, h: 0.52, margin: 0, valign: "middle", fontFace: FUENTE, fontSize: tamQueCabe(`¿Por qué importa?  ${texto}`, CW - 0.45, 0.5, 14, 9), fit: "shrink" });
}

// ── Plantillas ────────────────────────────────────────────────────────────

// Las partes numeradas en órbita alrededor del sistema: el motivo de la portada y
// del cierre. Cada nodo es una parte de la presentación, con su número, su
// ícono y su nombre corto; los rayos dicen que todas son el mismo sistema.
function orbita(s: Slide, cx: number, cy: number, r: number, centro: { icono: NombreIcono; texto: string }) {
  const partes = secciones.filter((x) => x.numero !== null);
  const anillo = (radio: number, ancho: number, transparencia: number, guion?: "dash") =>
    s.addShape("ellipse", { x: cx - radio, y: cy - radio, w: 2 * radio, h: 2 * radio, fill: { color: hex(PROF), transparency: 100 }, line: { color: hex(ACC), width: ancho, transparency: transparencia, dashType: guion } });
  anillo(r + 0.75, 0.75, 82);
  anillo(r, 1.25, 50, "dash");
  anillo(r - 0.85, 0.75, 75);

  const paso = 360 / partes.length;
  const nodos = partes.map((sec, i) => {
    const a = ((-90 + paso / 2 + i * paso) * Math.PI) / 180;
    return { sec, a, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  // Rayos del centro a cada parte, por debajo de los nodos.
  const dc = 1.8;
  for (const n of nodos) {
    const x1 = cx + (dc / 2 + 0.08) * Math.cos(n.a);
    const y1 = cy + (dc / 2 + 0.08) * Math.sin(n.a);
    const x2 = n.x - 0.36 * Math.cos(n.a);
    const y2 = n.y - 0.36 * Math.sin(n.a);
    s.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1, line: { color: hex(ACC), width: 1, transparency: 60 } });
  }

  // El sistema al centro, con un halo.
  s.addShape("ellipse", { x: cx - dc / 2 - 0.18, y: cy - dc / 2 - 0.18, w: dc + 0.36, h: dc + 0.36, fill: { color: hex(ACC), transparency: 85 }, line: { color: hex(ACC), width: 0.75, transparency: 60 } });
  s.addShape("ellipse", { x: cx - dc / 2, y: cy - dc / 2, w: dc, h: dc, fill: { color: hex(PRI) }, line: { color: hex(ACC), width: 2 }, shadow: halo() });
  icono(s, centro.icono, cx - 0.33, cy - 0.58, 0.66, ACC, 1.5);
  s.addText(centro.texto, { x: cx - dc / 2 + 0.1, y: cy + 0.16, w: dc - 0.2, h: 0.42, margin: 0, fontFace: TITULO, fontSize: tamQueCabe(centro.texto, dc - 0.3, 0.4, 15, 9, true), bold: true, color: "FFFFFF", align: "center", valign: "middle" });

  const dn = 0.66;
  for (const n of nodos) {
    s.addShape("ellipse", { x: n.x - dn / 2, y: n.y - dn / 2, w: dn, h: dn, fill: { color: hex(mezclar(PROF, ACC, 0.12)) }, line: { color: hex(ACC), width: 1.5 }, shadow: halo() });
    icono(s, n.sec.icono ?? "flag", n.x - 0.17, n.y - 0.17, 0.34, ACC);
    s.addText(String(n.sec.numero), { x: n.x + dn / 2 - 0.2, y: n.y - dn / 2 - 0.08, w: 0.26, h: 0.26, shape: "ellipse", margin: 0, fill: { color: hex(ACC) }, line: { color: hex(PROF), width: 1 }, fontFace: TITULO, fontSize: 9, bold: true, color: hex(PROF), align: "center", valign: "middle" });
    const derecha = Math.cos(n.a) > 0;
    const lw = 1.25;
    s.addText(n.sec.corto, { x: derecha ? n.x + dn / 2 + 0.1 : n.x - dn / 2 - 0.1 - lw, y: n.y - 0.16, w: lw, h: 0.32, margin: 0, fontFace: FUENTE, fontSize: 10.5, bold: true, color: hex(color.sobreOscuro), align: derecha ? "left" : "right", valign: "middle" });
  }
}

function fondoOscuro(s: Slide) {
  s.background = { color: hex(PROF) };
  s.addShape("rect", { x: 0, y: 0, w: 0.12, h: H, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
}

function portadaGeneral(pptx: PptxGenJS, l: Lamina, recorrido: Recorrido) {
  const s = pptx.addSlide();
  fondoOscuro(s);
  orbita(s, 9.55, 3.72, 2.15, { icono: "ship-wheel", texto: "ARKA-Lite" });
  logo(s, 0.83, 0.58, true);
  s.addText("PROYECTO FINAL · UPSKILLING BACKEND JAVA", { x: 0.83, y: 1.5, w: 6, h: 0.3, margin: 0, fontFace: FUENTE, fontSize: 12, bold: true, color: hex(ACC), charSpacing: 3 });
  // El título va partido en dos líneas para que nunca alcance al subtítulo.
  const titulo = l.diapositiva.titulo.replace(/^Del endpoint /, "Del endpoint\n");
  s.addText(titulo, { x: 0.83, y: 1.88, w: 6.0, h: 1.95, margin: 0, fontFace: TITULO, fontSize: 54, bold: true, color: "FFFFFF", valign: "top", lineSpacingMultiple: 0.95, fit: "shrink" });
  s.addText(l.diapositiva.visible.join(" "), { x: 0.83, y: 3.92, w: 4.9, h: 0.8, margin: 0, fontFace: FUENTE, fontSize: 17, color: hex(color.sobreOscuroSecundario), valign: "top" });

  // Las cifras clave del proyecto: el visual de la portada.
  const cifras = l.diapositiva.visual;
  const kpis = cifras?.tipo === "cifras" ? cifras.cifras.slice(0, 4) : [];
  const kw = 1.34;
  kpis.forEach((k, i) => {
    const x = 0.83 + i * (kw + 0.1);
    s.addShape("roundRect", { x, y: 4.92, w: kw, h: 1.0, rectRadius: 0.1, fill: { color: hex(mezclar(PROF, "#FFFFFF", 0.07)) }, line: { color: hex(mezclar(PROF, ACC, 0.35)), width: 0.75 } });
    s.addShape("rect", { x, y: 5.02, w: 0.05, h: 0.8, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
    s.addText(k.valor, { x: x + 0.16, y: 4.98, w: kw - 0.24, h: 0.46, margin: 0, fontFace: TITULO, fontSize: 26, bold: true, color: "FFFFFF", valign: "middle", fit: "shrink" });
    s.addText(k.titulo, { x: x + 0.16, y: 5.44, w: kw - 0.22, h: 0.42, margin: 0, fontFace: FUENTE, fontSize: tamQueCabe(k.titulo, kw - 0.26, 0.4, 10, 7.5), color: hex(color.sobreOscuroSecundario), valign: "top" });
  });

  const variante = `VERSIÓN ${NOMBRE_RECORRIDO[recorrido].toUpperCase()} · STAFF DE TECNOLOGÍA`;
  s.addText(variante, { x: 0.83, y: 6.28, w: 0.5 + variante.length * 0.1, h: 0.36, shape: "roundRect", rectRadius: 0.18, margin: 0, fill: { color: hex(mezclar(PROF, ACC, 0.2)) }, line: { color: hex(ACC), width: 1 }, fontFace: FUENTE, fontSize: 10, bold: true, color: hex(ACC), align: "center", valign: "middle", charSpacing: 1 });
  s.addNotes(textoNotas(l));
}

function cierreFinal(pptx: PptxGenJS, l: Lamina) {
  const s = pptx.addSlide();
  fondoOscuro(s);
  orbita(s, 9.55, 3.72, 2.15, { icono: "sparkles", texto: "¿Preguntas?" });
  logo(s, 0.83, 0.58, true);
  s.addText(l.diapositiva.titulo, { x: 0.83, y: 2.2, w: 6, h: 1.4, margin: 0, fontFace: TITULO, fontSize: 72, bold: true, color: "FFFFFF" });
  s.addShape("rect", { x: 0.83, y: 3.75, w: 0.9, h: 0.06, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  s.addText(l.diapositiva.visible.join("\n"), { x: 0.83, y: 4.0, w: 5.6, h: 1.4, margin: 0, fontFace: FUENTE, fontSize: 20, color: hex(color.sobreOscuroSecundario), valign: "top", paraSpaceAfter: 6 });
  s.addNotes(textoNotas(l));
}

// Lámina de concepto: la idea grande a la izquierda, tarjetas con ícono a la
// derecha, la comparación cotidiana y la franja "¿Por qué importa?".
function concepto(s: Slide, d: Diapositiva, abajo: number, conCodigo: boolean) {
  const izqW = 5.75;
  const derX = M + izqW + 0.45;
  const derW = W - M - derX;
  const idea = d.idea ?? d.titulo;
  s.addShape("rect", { x: M, y: 1.62, w: 0.08, h: 1.0, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  s.addText(idea, { x: M + 0.28, y: 1.55, w: izqW - 0.28, h: 1.9, margin: 0, fontFace: TITULO, fontSize: tamQueCabe(idea, izqW - 0.32, 1.9, 32, 16, true), bold: true, color: hex(PRI), valign: "top", fit: "shrink" });
  if (d.comparacion) comparacion(s, d, { x: M, y: Math.max(3.65, abajo - 1.45), w: izqW, h: 1.3 });
  if (conCodigo && d.codigo) {
    codigo(s, d.codigo, { x: derX, y: 1.5, w: derW, h: abajo - 1.6 });
    return;
  }
  const n = d.visible.length;
  const gap = 0.16;
  const alto = Math.min(1.15, (abajo - 1.55 - gap * (n - 1)) / n);
  d.visible.forEach((t, i) => {
    const y = 1.55 + i * (alto + gap);
    const ultimo = i === n - 1 && n > 2;
    const tono = i === 0 ? PRI : ultimo ? color.correcto : ACC_T;
    s.addShape("roundRect", { x: derX, y, w: derW, h: alto, rectRadius: 0.12, fill: { color: i === 1 ? hex(ACC_S) : "FFFFFF" }, line: { color: hex(i === 1 ? ACC : color.linea), width: 1.25 }, shadow: sombra() });
    const ic = d.iconos?.[i];
    if (ic) insignia(s, ic, derX + 0.17, y + (alto - 0.62) / 2, 0.62, tono, "#FFFFFF");
    else s.addText(String(i + 1), { x: derX + 0.2, y: y + (alto - 0.5) / 2, w: 0.5, h: 0.5, shape: "ellipse", margin: 0, fill: { color: hex(tono) }, line: { color: hex(tono), width: 0 }, fontFace: TITULO, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    s.addText(t, { x: derX + 0.95, y, w: derW - 1.1, h: alto, margin: 0, fontFace: FUENTE, fontSize: tamQueCabe(t, derW - 1.15, alto - 0.1, 16, 9), color: hex(color.texto), valign: "middle", fit: "shrink" });
  });
}

// Columna izquierda de una lámina con una sola captura: la idea, las frases
// visibles con su ícono y la comparación.
function columnaCaptura(s: Slide, d: Diapositiva, c: Caja) {
  s.addShape("rect", { x: c.x, y: c.y + 0.06, w: 0.08, h: 0.9, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  s.addText(d.idea ?? d.titulo, { x: c.x + 0.26, y: c.y, w: c.w - 0.26, h: 1.25, margin: 0, fontFace: TITULO, fontSize: tamQueCabe(d.idea ?? d.titulo, c.w - 0.3, 1.25, 24, 14, true), bold: true, color: hex(PRI), valign: "top", fit: "shrink" });
  const conComp = !!d.comparacion;
  const yLista = c.y + 1.45;
  const altoLista = c.h - 1.45 - (conComp ? 1.45 : 0);
  const fila = Math.min(0.72, altoLista / d.visible.length);
  d.visible.forEach((t, i) => {
    const y = yLista + i * fila;
    insignia(s, d.iconos?.[i] ?? "check", c.x, y + (fila - 0.46) / 2, 0.46, ACC_S, ACC_T);
    s.addText(t, { x: c.x + 0.6, y, w: c.w - 0.6, h: fila, margin: 0, fontFace: FUENTE, fontSize: tamQueCabe(t, c.w - 0.65, fila - 0.04, 13.5, 8), color: hex(color.texto), valign: "middle", fit: "shrink" });
  });
  if (conComp) comparacion(s, d, { x: c.x, y: c.y + c.h - 1.3, w: c.w, h: 1.3 });
}

function laminaVisual(s: Slide, d: Diapositiva, abajo: number, iconoSeccion?: NombreIcono) {
  const v = d.visual!;
  const capturaSola = v.tipo === "captura" && v.capturas.length === 1;
  let arriba = 1.5;
  if (d.idea && !capturaSola) {
    s.addText(d.idea, { x: M, y: 1.28, w: CW, h: 0.42, margin: 0, fontFace: FUENTE, fontSize: tamQueCabe(d.idea, CW, 0.42, 17, 11), color: hex(color.secundario), valign: "middle", fit: "shrink" });
    arriba = 1.88;
  }
  let fondo = abajo;
  if (d.comparacion && !capturaSola) {
    comparacion(s, d, { x: M, y: abajo - 0.72, w: CW, h: 0.72 });
    fondo = abajo - 0.92;
  }
  dibujarVisual(s, v, { x: M, y: arriba, w: CW, h: fondo - arriba }, capturaSola ? (c) => columnaCaptura(s, d, c) : undefined, iconoSeccion);
}

// Avance de las partes numeradas, arriba a la derecha: orienta sin gastar una
// lámina de portada por sección.
function avance(s: Slide, l: Lamina) {
  const total = secciones.filter((x) => x.numero !== null).length;
  const n = l.seccion.numero;
  if (n === null) return;
  const ancho = 0.3;
  const x0 = W - M - total * (ancho + 0.07);
  for (let i = 1; i <= total; i++) {
    s.addShape("roundRect", { x: x0 + (i - 1) * (ancho + 0.07), y: 0.47, w: ancho, h: 0.08, rectRadius: 0.04, fill: { color: hex(i === n ? ACC : i < n ? mezclar(ACC, "#FFFFFF", 0.55) : color.linea) }, line: { color: "FFFFFF", width: 0 } });
  }
}

// Diagrama detallado completo, con todos sus pasos numerados debajo: el
// número de cada paso coincide con el de la flecha.
function laminaDiagrama(s: Slide, d: Diapositiva, abajo: number) {
  const fig = diagramaPorId(d.diagrama!);
  const n = fig.pasos.length;
  const cols = Math.min(4, n);
  const filas = Math.ceil(n / cols);
  const altoPaso = 0.62;
  const hLeyenda = filas * altoPaso + (filas - 1) * 0.1;
  const yLeyenda = abajo - hLeyenda;
  diagrama(s, fig, { x: M, y: 1.4, w: CW, h: yLeyenda - 1.55 }, { paso: null });
  const gap = 0.14;
  const ancho = (CW - gap * (cols - 1)) / cols;
  fig.pasos.forEach((p, i) => {
    const x = M + (i % cols) * (ancho + gap);
    const y = yLeyenda + Math.floor(i / cols) * (altoPaso + 0.1);
    s.addShape("roundRect", { x, y, w: ancho, h: altoPaso, rectRadius: 0.08, fill: { color: hex(ACC_S) }, line: { color: hex(mezclar(ACC, "#FFFFFF", 0.4)), width: 0.75 } });
    s.addText(String(i + 1), { x: x + 0.1, y: y + (altoPaso - 0.34) / 2, w: 0.34, h: 0.34, shape: "ellipse", margin: 0, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 }, fontFace: TITULO, fontSize: 11, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    s.addText(p.texto, { x: x + 0.52, y: y + 0.03, w: ancho - 0.6, h: altoPaso - 0.06, margin: 0, fontFace: FUENTE, fontSize: tamQueCabe(p.texto, ancho - 0.65, altoPaso - 0.08, 11, 7.5), color: hex(color.texto), valign: "middle", fit: "shrink" });
  });
}

function contenido(pptx: PptxGenJS, l: Lamina, recorrido: Recorrido) {
  const d = l.diapositiva;
  const s = pptx.addSlide();
  // Las formas que el visual dibuja por pasos aparecen clic a clic.
  marcarPasos(s);
  s.background = { color: "FFFFFF" };
  encabezado(s, etiquetaSeccion(l.seccion), d.titulo);
  avance(s, l);
  const conCodigo = recorrido === "tecnico" && !!d.codigo;
  const conPorque = !!d.porque && (!d.diagrama || !!d.visual) && (!d.tabla || !!d.visual);
  const baseAbajo = conPorque ? H - 1.12 : H - 0.55;
  const abajo = d.marcas?.length ? baseAbajo - 0.45 : baseAbajo;

  if (d.visual) {
    laminaVisual(s, d, abajo, l.seccion.icono);
  } else if (d.diagrama) {
    laminaDiagrama(s, d, abajo);
  } else if (d.tabla) {
    chips(s, d.visible, 1.42);
    tabla(s, d.tabla, { x: M, y: 2.02, w: CW, h: abajo - 2.1 });
  } else {
    concepto(s, d, abajo, conCodigo);
  }
  if (d.marcas?.length) marcas(s, d.marcas, abajo + 0.08);
  if (conPorque) franjaPorque(s, d.porque!);
  pie(s, `ARKA-Lite · ${etiquetaSeccion(l.seccion)}`);
  s.addNotes(textoNotas(l));

  // El código no cabe junto a un diagrama, una tabla o un visual: va en su
  // propia lámina, solo en el recorrido técnico.
  if (conCodigo && d.codigo && (d.diagrama || d.tabla || d.visual)) {
    const sc = pptx.addSlide();
    sc.background = { color: "FFFFFF" };
    encabezado(sc, etiquetaSeccion(l.seccion), `${d.titulo} · el código`);
    avance(sc, l);
    codigo(sc, d.codigo, { x: M, y: 1.5, w: CW, h: H - 2.15 });
    pie(sc, `ARKA-Lite · ${etiquetaSeccion(l.seccion)}`);
    sc.addNotes(`QUÉ HACER (no se dice)\nMostrar el archivo ${d.codigo.archivo} y leer solo las líneas que se mencionan en el texto de la lámina anterior.`);
  }
}

export function construirPresentacion(recorrido: Recorrido): PptxGenJS {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Upskilling Backend Java";
  pptx.company = "ARKA-Lite";
  pptx.title = `ARKA-Lite · Recorrido ${NOMBRE_RECORRIDO[recorrido].toLowerCase()}`;
  pptx.subject = "Proyecto final de Upskilling Backend Java";
  pptx.theme = { headFontFace: TITULO, bodyFontFace: FUENTE };
  for (const l of laminas(recorrido)) {
    if (l.id === "s00-portada") portadaGeneral(pptx, l, recorrido);
    else if (l.id.endsWith("-gracias")) cierreFinal(pptx, l);
    else contenido(pptx, l, recorrido);
  }
  return pptx;
}

// El archivo final: la presentación con el posproceso de los íconos.
export function generarPptx(recorrido: Recorrido): Promise<Buffer> {
  return generarBuffer(construirPresentacion(recorrido));
}

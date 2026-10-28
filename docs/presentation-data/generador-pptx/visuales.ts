import { existsSync } from "node:fs";
import { join } from "node:path";
import { secciones } from "../contenido/index.ts";
import type { Captura, ElementoVisual, Icono, Tono, Visual } from "../contenido/tipos.ts";
import { DIR_CAPTURAS } from "../entregables.ts";
import { color } from "../diseno/tokens.ts";
import { ACC, ACC_S, ACC_T, FUENTE, H, MONO, PRI, PROF, sombra, TITULO, colorDeTono, flecha, hex, icono, insignia, mezclar, type Slide } from "./base.ts";
import { tamQueCabe } from "./medidas.ts";

// Láminas de impacto: cada tipo de Visual tiene su composición. Todas dibujan
// dentro de la caja que reciben y usan formas nativas e íconos vectoriales;
// solo las capturas son imágenes.

export interface Caja {
  x: number;
  y: number;
  w: number;
  h: number;
}

function tarjeta(s: Slide, c: Caja, fondo = "#FFFFFF", borde: string = color.linea) {
  s.addShape("roundRect", { x: c.x, y: c.y, w: c.w, h: c.h, rectRadius: 0.14, fill: { color: hex(fondo) }, line: { color: hex(borde), width: 1 }, shadow: sombra() });
}

function texto(s: Slide, t: string, c: Caja, o: { tam?: number; color?: string; negrita?: boolean; alinear?: "left" | "center" | "right"; vertical?: "top" | "middle" | "bottom"; fuente?: string } = {}) {
  const tam = tamQueCabe(t, c.w - 0.03, c.h, o.tam ?? 13, 7, !!o.negrita || o.fuente === TITULO);
  s.addText(t, { x: c.x, y: c.y, w: c.w, h: c.h, margin: 0, fontFace: o.fuente ?? FUENTE, fontSize: tam, bold: o.negrita, color: hex(o.color ?? color.texto), align: o.alinear ?? "left", valign: o.vertical ?? "top", fit: "shrink" });
}

// ── Ruta de la agenda ─────────────────────────────────────────────────────

function ruta(s: Slide, c: Caja) {
  const partes = secciones.filter((x) => x.numero !== null);
  const paso = c.w / partes.length;
  const d = Math.min(1.0, paso - 0.45);
  const yc = c.y + 0.3 + d / 2;
  s.addShape("line", { x: c.x + paso / 2, y: yc, w: paso * (partes.length - 1), h: 0, line: { color: hex(mezclar(ACC, "#FFFFFF", 0.35)), width: 4 } });
  partes.forEach((sec, i) => {
    const cx = c.x + i * paso + paso / 2;
    s.addShape("ellipse", { x: cx - d / 2, y: yc - d / 2, w: d, h: d, fill: { color: hex(PRI) }, line: { color: "FFFFFF", width: 3 }, shadow: sombra() });
    icono(s, sec.icono ?? "flag", cx - d * 0.25, yc - d * 0.25, d * 0.5, "#FFFFFF");
    s.addText(String(sec.numero), { x: cx + d * 0.16, y: yc - d / 2 - 0.08, w: 0.34, h: 0.34, shape: "ellipse", margin: 0, fill: { color: hex(ACC) }, line: { color: "FFFFFF", width: 1.5 }, fontFace: TITULO, fontSize: 11.5, bold: true, color: hex(PROF), align: "center", valign: "middle" });
    texto(s, sec.titulo, { x: cx - paso / 2 + 0.04, y: yc + d / 2 + 0.16, w: paso - 0.08, h: 0.62 }, { tam: 14, negrita: true, alinear: "center", fuente: TITULO });
    texto(s, (sec.temas ?? []).slice(0, 3).join(" · "), { x: cx - paso / 2 + 0.06, y: yc + d / 2 + 0.82, w: paso - 0.12, h: Math.max(0.6, c.y + c.h - (yc + d / 2 + 0.82)) }, { tam: 10.5, color: color.secundario, alinear: "center" });
  });
}

// ── Cifras ────────────────────────────────────────────────────────────────

function cifras(s: Slide, c: Caja, lista: (ElementoVisual & { valor: string })[]) {
  const cols = lista.length <= 4 ? lista.length : Math.ceil(lista.length / 2);
  const filas = Math.ceil(lista.length / cols);
  const gap = 0.24;
  const w = (c.w - gap * (cols - 1)) / cols;
  const h = (c.h - gap * (filas - 1)) / filas;
  lista.forEach((e, i) => {
    const x = c.x + (i % cols) * (w + gap);
    const y = c.y + Math.floor(i / cols) * (h + gap);
    const t = colorDeTono(e.tono);
    tarjeta(s, { x, y, w, h });
    s.addShape("rect", { x: x + 0.14, y, w: w - 0.28, h: 0.07, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    insignia(s, e.icono, x + w - 0.86, y + 0.26, 0.62, t.suave, t.fuerte);
    const grande = filas === 1 ? 60 : 48;
    texto(s, e.valor, { x: x + 0.28, y: y + 0.2, w: w - 1.2, h: grande / 72 + 0.12 }, { tam: grande, negrita: true, color: t.fuerte, fuente: TITULO, vertical: "middle" });
    const yT = y + 0.3 + grande / 72;
    texto(s, e.titulo, { x: x + 0.28, y: yT, w: w - 0.5, h: 0.42 }, { tam: 15, negrita: true, fuente: TITULO });
    if (e.texto) texto(s, e.texto, { x: x + 0.28, y: yT + 0.42, w: w - 0.5, h: h - (yT - y) - 0.5 }, { tam: 12, color: color.secundario });
  });
}

// ── Flujo ─────────────────────────────────────────────────────────────────

function flujo(s: Slide, c: Caja, v: Extract<Visual, { tipo: "flujo" }>) {
  const n = v.pasos.length;
  const paso = c.w / n;
  const altoDesvio = v.desvio ? 1.2 : 0;
  const d = Math.max(0.75, Math.min(1.6, paso - 0.9, c.h - altoDesvio - 1.6));
  // Sin desvío, el flujo queda centrado en el alto disponible.
  const bloque = d + 0.62 + Math.min(1.0, c.h - altoDesvio - d - 0.62);
  const arriba = v.desvio ? 0.12 : Math.max(0.12, (c.h - bloque) / 2);
  const yc = c.y + arriba + d / 2;
  const yTexto = yc + d / 2 + 0.62;
  const hTexto = Math.max(0.45, Math.min(1.0, c.h - altoDesvio - (yTexto - c.y)));
  v.pasos.forEach((e, i) => {
    const t = colorDeTono(e.tono ?? (i === n - 1 ? "correcto" : "marino"));
    const cx = c.x + i * paso + paso / 2;
    s.addShape("ellipse", { x: cx - d / 2, y: yc - d / 2, w: d, h: d, fill: { color: hex(t.suave) }, line: { color: hex(t.fuerte), width: 2.5 }, shadow: sombra() });
    icono(s, e.icono, cx - d * 0.27, yc - d * 0.27, d * 0.54, t.fuerte, 1.75);
    s.addText(String(i + 1), { x: cx - d / 2 - 0.04, y: yc - d / 2 - 0.04, w: 0.38, h: 0.38, shape: "ellipse", margin: 0, fill: { color: hex(t.fuerte) }, line: { color: "FFFFFF", width: 1.5 }, fontFace: TITULO, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    texto(s, e.titulo, { x: cx - paso / 2 + 0.05, y: yc + d / 2 + 0.14, w: paso - 0.1, h: 0.46 }, { tam: 18, negrita: true, alinear: "center", fuente: TITULO });
    if (e.texto) texto(s, e.texto, { x: cx - paso / 2 + 0.12, y: yTexto, w: paso - 0.24, h: hTexto }, { tam: 14, color: color.secundario, alinear: "center" });
    if (i < n - 1) flecha(s, cx + d / 2 + 0.1, yc, cx + paso - d / 2 - 0.1, yc, ACC, 3);
  });
  if (v.desvio) {
    const t = colorDeTono(v.desvio.elemento.tono ?? "advertencia");
    const cx = c.x + v.desvio.desde * paso + paso / 2;
    const ancho = Math.min(4.6, c.w * 0.42);
    const caja = { x: Math.min(Math.max(c.x, cx + 0.5), c.x + c.w - ancho), y: c.y + c.h - 0.95, w: ancho, h: 0.95 };
    s.addShape("line", { x: cx, y: yTexto + Math.min(hTexto, 0.5) + 0.04, w: 0, h: caja.y + caja.h / 2 - (yTexto + Math.min(hTexto, 0.5) + 0.04), line: { color: hex(t.fuerte), width: 2, dashType: "dash" } });
    flecha(s, cx, caja.y + caja.h / 2, caja.x, caja.y + caja.h / 2, t.fuerte, 2, "dash");
    texto(s, v.desvio.etiqueta, { x: cx - 1.6, y: caja.y + caja.h / 2 - 0.36, w: 1.5, h: 0.3 }, { tam: 11, negrita: true, color: t.fuerte, alinear: "right" });
    tarjeta(s, caja, t.suave, mezclar(t.fuerte, "#FFFFFF", 0.5));
    insignia(s, v.desvio.elemento.icono, caja.x + 0.18, caja.y + 0.17, 0.6, "#FFFFFF", t.fuerte);
    texto(s, v.desvio.elemento.titulo, { x: caja.x + 0.92, y: caja.y + 0.12, w: caja.w - 1.05, h: 0.36 }, { tam: 14.5, negrita: true, color: t.fuerte, fuente: TITULO });
    if (v.desvio.elemento.texto) texto(s, v.desvio.elemento.texto, { x: caja.x + 0.92, y: caja.y + 0.48, w: caja.w - 1.05, h: 0.4 }, { tam: 11.5, color: color.texto });
  }
}

// ── Tubería ───────────────────────────────────────────────────────────────

function tuberia(s: Slide, c: Caja, etapas: ElementoVisual[]) {
  const n = etapas.length;
  const solape = 0.18;
  const w = (c.w + solape * (n - 1)) / n;
  const h = Math.min(1.9, c.h * 0.45);
  const y = c.y + Math.max(0.2, (c.h - h - 1.2) / 2);
  etapas.forEach((e, i) => {
    const x = c.x + i * (w - solape);
    const fondo = e.tono ? colorDeTono(e.tono).fuerte : mezclar(PRI, ACC_T, n === 1 ? 0 : i / (n - 1));
    s.addShape(i === 0 ? "homePlate" : "chevron", { x, y, w, h, fill: { color: hex(fondo) }, line: { color: "FFFFFF", width: 2 }, shadow: sombra() });
    const ti = Math.min(0.62, h * 0.34);
    icono(s, e.icono, x + w / 2 - ti / 2 + (i === 0 ? -0.1 : 0.05), y + h * 0.18, ti, "#FFFFFF");
    texto(s, e.titulo, { x: x + 0.3, y: y + h * 0.18 + ti + 0.1, w: w - 0.5, h: 0.42 }, { tam: 16, negrita: true, color: "#FFFFFF", alinear: "center", fuente: TITULO });
    if (e.texto) texto(s, e.texto, { x: x + 0.12, y: y + h + 0.22, w: w - 0.24, h: Math.min(1.0, c.h - h - 0.3) }, { tam: 14, color: color.secundario, alinear: "center" });
    if (e.texto) s.addShape("line", { x: x + w / 2 - 0.05, y: y + h + 0.06, w: 0, h: 0.12, line: { color: hex(fondo), width: 2 } });
  });
}

// ── Estados ───────────────────────────────────────────────────────────────

function estados(s: Slide, c: Caja, v: Extract<Visual, { tipo: "estados" }>) {
  const cols = v.columnas.length;
  const altoError = v.error ? 1.05 : 0;
  const areaH = c.h - altoError - (v.error ? 0.3 : 0);
  const wCol = 2.75;
  const hueco = (c.w - wCol * cols) / (cols - 1);
  const hEst = 1.05;
  const centros: { x: number; y: number }[][] = [];
  v.columnas.forEach((col, i) => {
    const x = c.x + i * (wCol + hueco);
    const gap = 0.45;
    const total = col.length * hEst + (col.length - 1) * gap;
    const y0 = c.y + (areaH - total) / 2;
    centros.push([]);
    col.forEach((e, j) => {
      const y = y0 + j * (hEst + gap);
      const t = colorDeTono(e.tono);
      s.addShape("roundRect", { x, y, w: wCol, h: hEst, rectRadius: hEst / 2, fill: { color: hex(t.suave) }, line: { color: hex(t.fuerte), width: 2.25 }, shadow: sombra() });
      insignia(s, e.icono, x + 0.18, y + (hEst - 0.7) / 2, 0.7, t.fuerte, "#FFFFFF");
      texto(s, e.titulo, { x: x + 1.0, y: y + 0.17, w: wCol - 1.12, h: 0.42 }, { tam: 17, negrita: true, color: t.fuerte, fuente: TITULO, vertical: "middle" });
      if (e.texto) texto(s, e.texto, { x: x + 1.0, y: y + 0.56, w: wCol - 1.12, h: 0.36 }, { tam: 11.5, color: color.texto });
      centros[i].push({ x, y: y + hEst / 2 });
    });
  });
  for (let i = 0; i < cols - 1; i++) {
    const desde = centros[i];
    const hacia = centros[i + 1];
    const accion = v.acciones[i] ?? "";
    const x1 = desde[0].x + wCol + 0.08;
    const x2 = hacia[0].x - 0.08;
    const ym = desde.reduce((a, b) => a + b.y, 0) / desde.length;
    for (const h of hacia) flecha(s, x1, ym, x2, h.y, ACC, 3);
    const ancho = Math.min(hueco - 0.1, 0.3 + accion.length * 0.105);
    s.addText(accion, { x: (x1 + x2) / 2 - ancho / 2, y: ym - 0.68, w: ancho, h: 0.36, shape: "roundRect", rectRadius: 0.18, margin: [0, 6, 0, 6], fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 }, fontFace: FUENTE, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", fit: "shrink" });
  }
  if (v.error) {
    const t = colorDeTono(v.error.tono ?? "error");
    const caja = { x: c.x + c.w * 0.2, y: c.y + c.h - altoError, w: c.w * 0.6, h: altoError };
    tarjeta(s, caja, t.suave, mezclar(t.fuerte, "#FFFFFF", 0.45));
    insignia(s, v.error.icono, caja.x + 0.22, caja.y + (altoError - 0.66) / 2, 0.66, "#FFFFFF", t.fuerte);
    texto(s, v.error.titulo, { x: caja.x + 1.05, y: caja.y + 0.14, w: caja.w - 1.2, h: 0.4 }, { tam: 17, negrita: true, color: t.fuerte, fuente: TITULO });
    if (v.error.texto) texto(s, v.error.texto, { x: caja.x + 1.05, y: caja.y + 0.54, w: caja.w - 1.2, h: 0.42 }, { tam: 12.5 });
  }
}

// ── Contraste ─────────────────────────────────────────────────────────────

function contraste(s: Slide, c: Caja, v: Extract<Visual, { tipo: "contraste" }>) {
  const gap = 0.7;
  const w = (c.w - gap) / 2;
  v.lados.forEach((l, i) => {
    const x = c.x + i * (w + gap);
    const t = colorDeTono(l.tono);
    tarjeta(s, { x, y: c.y, w, h: c.h });
    s.addShape("roundRect", { x, y: c.y, w, h: 1.0, rectRadius: 0.14, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    s.addShape("rect", { x, y: c.y + 0.6, w, h: 0.4, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    insignia(s, l.icono, x + 0.25, c.y + 0.17, 0.66, "#FFFFFF", t.fuerte);
    texto(s, l.titulo, { x: x + 1.1, y: c.y + 0.12, w: w - 1.25, h: 0.76 }, { tam: 19, negrita: true, color: "#FFFFFF", fuente: TITULO, vertical: "middle" });
    const filas = l.puntos.length;
    const altoFila = Math.min(0.85, (c.h - 1.25) / filas);
    l.puntos.forEach((p, j) => {
      const y = c.y + 1.2 + j * altoFila;
      const marca = l.tono === "error" ? "circle-x" : l.tono === "correcto" || l.tono === "cian" ? "circle-check" : "arrow-right";
      icono(s, marca, x + 0.32, y + (altoFila - 0.36) / 2, 0.36, t.fuerte);
      texto(s, p, { x: x + 0.86, y, w: w - 1.1, h: altoFila }, { tam: 15, vertical: "middle" });
      if (j < filas - 1) s.addShape("line", { x: x + 0.3, y: y + altoFila, w: w - 0.6, h: 0, line: { color: hex(color.linea), width: 0.75 } });
    });
  });
  const cx = c.x + w + gap / 2;
  s.addText("vs", { x: cx - 0.36, y: c.y + c.h / 2 - 0.36, w: 0.72, h: 0.72, shape: "ellipse", margin: 0, fill: { color: hex(PROF) }, line: { color: "FFFFFF", width: 3 }, fontFace: TITULO, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", shadow: sombra() });
}

// ── Tarjetas ──────────────────────────────────────────────────────────────

function tarjetas(s: Slide, c: Caja, v: Extract<Visual, { tipo: "tarjetas" }>) {
  let y0 = c.y;
  if (v.comando) {
    s.addShape("roundRect", { x: c.x, y: c.y, w: c.w, h: 0.62, rectRadius: 0.1, fill: { color: hex(color.codigoFondo) }, line: { color: hex(color.codigoFondo), width: 0 }, shadow: sombra() });
    icono(s, "terminal", c.x + 0.22, c.y + 0.15, 0.32, ACC);
    s.addText([{ text: "$ ", options: { color: hex(ACC) } }, { text: v.comando, options: { color: "FFFFFF" } }], { x: c.x + 0.7, y: c.y, w: c.w - 0.9, h: 0.62, margin: 0, fontFace: MONO, fontSize: 18, bold: true, valign: "middle" });
    y0 += 0.85;
  }
  const n = v.tarjetas.length;
  const cols = v.columnas ?? (n <= 3 ? n : n === 4 ? 2 : n <= 6 ? 3 : 4);
  const filas = Math.ceil(n / cols);
  const gap = 0.2;
  const w = (c.w - gap * (cols - 1)) / cols;
  const h = (c.y + c.h - y0 - gap * (filas - 1)) / filas;
  const compacta = h < 1.3;
  // Con tarjetas grandes, la letra crece con ellas.
  const grande = !compacta && w > 4 && h > 1.6;
  v.tarjetas.forEach((e, i) => {
    const x = c.x + (i % cols) * (w + gap);
    const y = y0 + Math.floor(i / cols) * (h + gap);
    const t = colorDeTono(e.tono);
    tarjeta(s, { x, y, w, h });
    s.addShape("rect", { x, y: y + 0.14, w: 0.07, h: h - 0.28, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    const d = compacta ? 0.5 : grande ? 0.86 : 0.62;
    if (grande) {
      // Ícono grande a la izquierda; título y texto centrados a su lado.
      insignia(s, e.icono, x + 0.3, y + (h - d) / 2, d, t.suave, t.fuerte);
      const tx = x + 0.3 + d + 0.28;
      texto(s, e.titulo, { x: tx, y: y + h / 2 - 0.5, w: x + w - tx - 0.2, h: 0.46 }, { tam: 20, negrita: true, fuente: TITULO, vertical: "bottom", color: t.fuerte });
      if (e.texto) texto(s, e.texto, { x: tx, y: y + h / 2 + 0.02, w: x + w - tx - 0.2, h: h / 2 - 0.15 }, { tam: 16, color: color.texto });
      return;
    }
    insignia(s, e.icono, x + 0.22, y + (compacta ? (h - d) / 2 : 0.2), d, t.suave, t.fuerte);
    const tx = x + 0.22 + d + 0.16;
    if (compacta) {
      texto(s, e.titulo, { x: tx, y: y + 0.08, w: x + w - tx - 0.12, h: h * 0.45 }, { tam: 13, negrita: true, fuente: TITULO, vertical: "bottom" });
      if (e.texto) texto(s, e.texto, { x: tx, y: y + 0.08 + h * 0.45, w: x + w - tx - 0.12, h: h * 0.5 - 0.1 }, { tam: 10.5, color: color.secundario });
    } else {
      texto(s, e.titulo, { x: tx, y: y + 0.2, w: x + w - tx - 0.15, h: d }, { tam: 15, negrita: true, fuente: TITULO, vertical: "middle" });
      if (e.texto) texto(s, e.texto, { x: x + 0.28, y: y + 0.32 + d, w: w - 0.45, h: h - d - 0.45 }, { tam: 13, color: color.secundario });
    }
  });
}

// ── Capturas ──────────────────────────────────────────────────────────────

const PROPORCION = 1350 / 2160;

function marcoNavegador(s: Slide, cap: Captura, x: number, y: number, w: number) {
  const barra = Math.max(0.24, w * 0.035);
  const hImg = w * PROPORCION;
  s.addShape("roundRect", { x, y, w, h: barra + hImg, rectRadius: 0.1, fill: { color: "E9EEF5" }, line: { color: "C7D2E2", width: 1 }, shadow: { type: "outer", blur: 14, offset: 4, angle: 90, color: "0B1F3A", opacity: 0.22 } });
  ["E5484D", "F5A524", "30A46C"].forEach((c, i) => s.addShape("ellipse", { x: x + 0.12 + i * barra * 0.45, y: y + barra * 0.32, w: barra * 0.34, h: barra * 0.34, fill: { color: c }, line: { color: c, width: 0 } }));
  if (cap.url) s.addText(cap.url, { x: x + 0.2 + barra * 1.5, y: y + barra * 0.16, w: Math.min(w * 0.55, 4.2), h: barra * 0.68, shape: "roundRect", rectRadius: barra * 0.3, margin: [0, 6, 0, 6], fill: { color: "FFFFFF" }, line: { color: "FFFFFF", width: 0 }, fontFace: FUENTE, fontSize: Math.max(7, barra * 26), color: hex(color.secundario), valign: "middle", fit: "shrink" });
  const ruta = join(DIR_CAPTURAS, cap.archivo);
  if (existsSync(ruta)) s.addImage({ path: ruta, x, y: y + barra, w, h: hImg, altText: cap.titulo });
  else texto(s, `Falta la captura ${cap.archivo}: ejecutar capturas/capturar.ps1`, { x, y: y + barra, w, h: hImg }, { tam: 12, color: color.error, alinear: "center", vertical: "middle" });
  return barra + hImg;
}

function captura(s: Slide, c: Caja, v: Extract<Visual, { tipo: "captura" }>, lateral?: (caja: Caja) => void) {
  const n = v.capturas.length;
  if (n === 1) {
    const cap = v.capturas[0];
    const wTexto = lateral ? 4.3 : 0;
    const maxW = Math.min(c.w - wTexto - (lateral ? 0.4 : 0), (c.h - 0.05) / PROPORCION / 1.035);
    const x = c.x + c.w - maxW;
    marcoNavegador(s, cap, x, c.y, maxW);
    lateral?.({ x: c.x, y: c.y, w: x - c.x - 0.4, h: c.h });
    return;
  }
  // Varias capturas: una celda por captura, con la miniatura a la izquierda y
  // su nombre y descripción al lado.
  const cols = 2;
  const filas = Math.ceil(n / cols);
  const gapX = 0.4;
  const gapY = 0.22;
  const celdaW = (c.w - gapX) / cols;
  const celdaH = (c.h - gapY * (filas - 1)) / filas;
  const w = Math.min(celdaW * 0.64, (celdaH - 0.06) / (PROPORCION + 0.036));
  v.capturas.forEach((cap, i) => {
    const x = c.x + (i % cols) * (celdaW + gapX);
    const y = c.y + Math.floor(i / cols) * (celdaH + gapY);
    const alto = marcoNavegador(s, cap, x, y + (celdaH - w * (PROPORCION + 0.036)) / 2, w);
    const tx = x + w + 0.26;
    const tw = celdaW - w - 0.3;
    const ty = y + (celdaH - alto) / 2;
    s.addText(String(i + 1), { x: tx, y: ty + alto / 2 - 0.62, w: 0.4, h: 0.4, shape: "ellipse", margin: 0, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 }, fontFace: TITULO, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    texto(s, cap.titulo, { x: tx + 0.5, y: ty + alto / 2 - 0.66, w: tw - 0.5, h: 0.48 }, { tam: 20, negrita: true, fuente: TITULO, vertical: "middle", color: PRI });
    if (cap.texto) texto(s, cap.texto, { x: tx, y: ty + alto / 2 - 0.08, w: tw, h: alto / 2 }, { tam: 14, color: color.secundario });
  });
}

// ── Ramas de Git ──────────────────────────────────────────────────────────

function ramas(s: Slide, c: Caja, v: Extract<Visual, { tipo: "ramas" }>) {
  const yMain = c.y + c.h - 1.1;
  const yRama = c.y + 1.2;
  const x0 = c.x + 0.4;
  const x1 = c.x + c.w - 0.4;
  const verde = color.correcto;
  s.addShape("line", { x: x0, y: yMain, w: x1 - x0, h: 0, line: { color: hex(PRI), width: 6 } });
  s.addText(v.principal, { x: x0 - 0.1, y: yMain + 0.22, w: 1.6, h: 0.4, shape: "roundRect", rectRadius: 0.2, margin: 0, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 }, fontFace: MONO, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  const xSale = x0 + 1.2;
  const xVuelve = x1 - 1.6;
  const n = v.commits.length;
  const paso = (xVuelve - xSale - 1.4) / Math.max(n, 1);
  // Sale de main, sube a la rama y vuelve por Pull Request.
  s.addShape("line", { x: xSale, y: yRama, w: 0.7, h: yMain - yRama, flipV: true, line: { color: hex(ACC), width: 5 } });
  s.addShape("line", { x: xSale + 0.7, y: yRama, w: xVuelve - xSale - 1.4, h: 0, line: { color: hex(ACC), width: 5 } });
  s.addShape("line", { x: xVuelve - 0.7, y: yRama, w: 0.7, h: yMain - yRama, line: { color: hex(verde), width: 5, endArrowType: "triangle" } });
  s.addText(v.rama, { x: xSale + 0.75, y: yRama - 0.78, w: 4.6, h: 0.4, shape: "roundRect", rectRadius: 0.2, margin: [0, 10, 0, 10], fill: { color: hex(ACC_S) }, line: { color: hex(ACC), width: 1 }, fontFace: MONO, fontSize: 13, bold: true, color: hex(ACC_T), valign: "middle", fit: "shrink" });
  icono(s, "git-branch", xSale - 0.05, yRama - 0.8, 0.4, ACC_T);
  v.commits.forEach((m, i) => {
    const cx = xSale + 0.7 + paso * (i + 0.5);
    s.addShape("ellipse", { x: cx - 0.2, y: yRama - 0.2, w: 0.4, h: 0.4, fill: { color: "FFFFFF" }, line: { color: hex(ACC), width: 4 }, shadow: sombra() });
    s.addText(m, { x: cx - paso / 2 + 0.05, y: yRama + 0.32, w: paso - 0.1, h: 0.62, margin: 0, fontFace: MONO, fontSize: 11.5, color: hex(color.texto), align: "center", valign: "top", fit: "shrink" });
  });
  [x0 + 0.5, xSale, xVuelve, x1 - 0.5].forEach((cx) => s.addShape("ellipse", { x: cx - 0.17, y: yMain - 0.17, w: 0.34, h: 0.34, fill: { color: hex(PRI) }, line: { color: "FFFFFF", width: 2 } }));
  const caja = { x: xVuelve - 3.8, y: yMain - 1.32, w: 3.45, h: 0.82 };
  tarjeta(s, caja, color.correctoSuave, mezclar(verde, "#FFFFFF", 0.5));
  icono(s, "git-pull-request", caja.x + 0.16, caja.y + 0.2, 0.42, verde);
  texto(s, v.fusion, { x: caja.x + 0.7, y: caja.y + 0.06, w: caja.w - 0.8, h: caja.h - 0.12 }, { tam: 12.5, negrita: true, color: verde, vertical: "middle" });
  void H;
}

// ── Aprendizajes ──────────────────────────────────────────────────────────

// Panel oscuro con el ícono de la sección y sus métricas; a la derecha, cada
// aprendizaje con su explicación y, en verde, el valor que deja.
function aprendizajes(s: Slide, c: Caja, v: Extract<Visual, { tipo: "aprendizajes" }>, iconoSeccion?: Icono) {
  const panelW = 3.25;
  s.addShape("roundRect", { x: c.x, y: c.y, w: panelW, h: c.h, rectRadius: 0.16, fill: { color: hex(PROF) }, line: { color: hex(PROF), width: 0 }, shadow: sombra() });
  insignia(s, iconoSeccion ?? "graduation-cap", c.x + 0.3, c.y + 0.3, 0.78, ACC, PROF);
  texto(s, "LO QUE APRENDIMOS", { x: c.x + 0.3, y: c.y + 1.22, w: panelW - 0.5, h: 0.3 }, { tam: 11, negrita: true, color: ACC });
  const n = v.metricas.length;
  const zona = c.h - 1.75;
  const alto = zona / n;
  v.metricas.forEach((m, i) => {
    const y = c.y + 1.62 + i * alto;
    if (i > 0) s.addShape("line", { x: c.x + 0.3, y: y - 0.06, w: panelW - 0.6, h: 0, line: { color: hex(mezclar(PROF, "#FFFFFF", 0.2)), width: 0.75 } });
    const grande = n === 1 ? 64 : 52;
    texto(s, m.valor, { x: c.x + 0.3, y: y + 0.02, w: panelW - 0.5, h: grande / 72 + 0.08 }, { tam: grande, negrita: true, color: "#FFFFFF", fuente: TITULO, vertical: "middle" });
    texto(s, m.titulo, { x: c.x + 0.3, y: y + grande / 72 + 0.12, w: panelW - 0.5, h: Math.max(0.35, alto - grande / 72 - 0.2) }, { tam: 13, color: color.sobreOscuroSecundario });
  });

  const x0 = c.x + panelW + 0.3;
  const w = c.x + c.w - x0;
  const gap = 0.2;
  const h = (c.h - gap * (v.items.length - 1)) / v.items.length;
  const valorW = Math.min(3.6, w * 0.4);
  v.items.forEach((e, i) => {
    const y = c.y + i * (h + gap);
    const t = colorDeTono(e.tono ?? "marino");
    tarjeta(s, { x: x0, y, w, h });
    const d = Math.min(0.78, h - 0.4);
    insignia(s, e.icono, x0 + 0.25, y + (h - d) / 2, d, t.suave, t.fuerte);
    const tx = x0 + 0.25 + d + 0.25;
    const tw = w - valorW - (tx - x0) - 0.25;
    texto(s, e.titulo, { x: tx, y: y + 0.14, w: tw, h: h * 0.42 }, { tam: 17, negrita: true, fuente: TITULO, color: PRI, vertical: "bottom" });
    if (e.texto) texto(s, e.texto, { x: tx, y: y + 0.18 + h * 0.42, w: tw, h: h * 0.58 - 0.3 }, { tam: 13, color: color.secundario });
    // El valor: una franja verde al final de la tarjeta.
    const vx = x0 + w - valorW;
    s.addShape("roundRect", { x: vx, y: y + 0.12, w: valorW - 0.12, h: h - 0.24, rectRadius: 0.1, fill: { color: hex(color.correctoSuave) }, line: { color: hex(color.correctoSuave), width: 0 } });
    icono(s, "target", vx + 0.16, y + 0.24, 0.26, color.correcto);
    texto(s, "VALOR", { x: vx + 0.5, y: y + 0.22, w: 1.5, h: 0.28 }, { tam: 10, negrita: true, color: color.correcto });
    texto(s, e.valor, { x: vx + 0.16, y: y + 0.54, w: valorW - 0.44, h: h - 0.74 }, { tam: 13.5, negrita: true, color: color.texto, vertical: "middle" });
  });
}

// ── Escenario de falla ────────────────────────────────────────────────────

// Arriba la falla, en el medio la reacción del sistema en el tiempo y abajo
// el resultado. Se lee de arriba abajo y de izquierda a derecha.
function escenario(s: Slide, c: Caja, v: Extract<Visual, { tipo: "escenario" }>) {
  const banda = (e: ElementoVisual, y: number, h: number, etiqueta: string) => {
    const t = colorDeTono(e.tono);
    s.addShape("roundRect", { x: c.x, y, w: c.w, h, rectRadius: 0.12, fill: { color: hex(t.suave) }, line: { color: hex(mezclar(t.fuerte, "#FFFFFF", 0.45)), width: 1.25 }, shadow: sombra() });
    s.addShape("rect", { x: c.x, y: y + 0.12, w: 0.09, h: h - 0.24, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    insignia(s, e.icono, c.x + 0.3, y + (h - 0.6) / 2, 0.6, t.fuerte, "#FFFFFF");
    texto(s, etiqueta, { x: c.x + 1.1, y: y + 0.1, w: 2.4, h: 0.26 }, { tam: 10, negrita: true, color: t.fuerte });
    const linea = e.texto ? `${e.titulo}  ·  ${e.texto}` : e.titulo;
    s.addText([{ text: e.titulo, options: { bold: true, color: hex(t.fuerte) } }, ...(e.texto ? [{ text: `   ${e.texto}`, options: { color: hex(color.texto) } }] : [])], { x: c.x + 1.1, y: y + 0.32, w: c.w - 1.3, h: h - 0.4, margin: 0, fontFace: FUENTE, fontSize: tamQueCabe(linea, c.w - 1.35, h - 0.42, 17, 10, true), valign: "middle", fit: "shrink" });
  };
  const hb = 0.82;
  banda(v.falla, c.y, hb, "QUÉ FALLA");
  banda(v.resultado, c.y + c.h - hb, hb, "RESULTADO");

  const n = v.pasos.length;
  const top = c.y + hb + 0.28;
  const alto = c.h - 2 * hb - 0.56;
  const paso = c.w / n;
  const d = Math.min(0.95, alto * 0.32);
  const yc = top + 0.5 + d / 2;
  // Flechas de la falla a la línea de tiempo y de la línea al resultado.
  // Van por el borde derecho de la primera y la última columna para no
  // pisar los textos de los pasos.
  const xFalla = c.x + paso / 2 + d / 2 + 0.25;
  const xResultado = c.x + c.w - paso / 2 + d / 2 + 0.25;
  flecha(s, xFalla, c.y + hb + 0.02, xFalla, yc - 0.12, colorDeTono(v.falla.tono).fuerte, 2, "dash");
  flecha(s, xResultado, yc + 0.12, xResultado, c.y + c.h - hb - 0.02, colorDeTono(v.resultado.tono).fuerte, 2, "dash");
  s.addShape("line", { x: c.x + paso / 2, y: yc, w: paso * (n - 1), h: 0, line: { color: hex(mezclar(ACC, "#FFFFFF", 0.3)), width: 4 } });
  v.pasos.forEach((e, i) => {
    const t = colorDeTono(e.tono);
    const cx = c.x + i * paso + paso / 2;
    const chipW = Math.min(paso - 0.3, 0.5 + e.momento.length * 0.1);
    s.addText(e.momento, { x: cx - chipW / 2, y: top, w: chipW, h: 0.32, shape: "roundRect", rectRadius: 0.16, margin: 0, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 }, fontFace: FUENTE, fontSize: 11, bold: true, color: "FFFFFF", align: "center", valign: "middle", fit: "shrink" });
    s.addShape("ellipse", { x: cx - d / 2, y: yc - d / 2, w: d, h: d, fill: { color: hex(t.suave) }, line: { color: hex(t.fuerte), width: 2.5 }, shadow: sombra() });
    icono(s, e.icono, cx - d * 0.27, yc - d * 0.27, d * 0.54, t.fuerte, 1.75);
    if (i < n - 1) flecha(s, cx + d / 2 + 0.08, yc, cx + paso - d / 2 - 0.08, yc, ACC, 3);
    const ty = yc + d / 2 + 0.1;
    texto(s, e.titulo, { x: cx - paso / 2 + 0.08, y: ty, w: paso - 0.16, h: 0.4 }, { tam: 17, negrita: true, alinear: "center", fuente: TITULO, color: t.fuerte });
    if (e.texto) texto(s, e.texto, { x: cx - paso / 2 + 0.14, y: ty + 0.42, w: paso - 0.28, h: Math.max(0.4, top + alto - ty - 0.42) }, { tam: 13, color: color.secundario, alinear: "center" });
  });
}

// ── Capas ─────────────────────────────────────────────────────────────────

// Cada capa es una franja con su nombre a la izquierda y sus piezas como
// tarjetas; las flechas indican que cada capa usa la de abajo.
function capas(s: Slide, c: Caja, v: Extract<Visual, { tipo: "capas" }>) {
  const n = v.capas.length;
  const gap = 0.22;
  const h = (c.h - gap * (n - 1)) / n;
  const etiquetaW = 1.75;
  v.capas.forEach((capa, i) => {
    const y = c.y + i * (h + gap);
    const t = colorDeTono(capa.tono);
    s.addShape("roundRect", { x: c.x, y, w: c.w, h, rectRadius: 0.12, fill: { color: hex(mezclar(t.suave, "#FFFFFF", 0.25)) }, line: { color: hex(mezclar(t.fuerte, "#FFFFFF", 0.7)), width: 1 } });
    s.addText(capa.titulo.toUpperCase(), { x: c.x, y, w: etiquetaW, h, shape: "roundRect", rectRadius: 0.12, margin: [0, 6, 0, 6], fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 }, fontFace: FUENTE, fontSize: Math.min(13, (72 * (etiquetaW - 0.3)) / (capa.titulo.length * 0.8)), bold: true, color: "FFFFFF", align: "center", valign: "middle", charSpacing: 1 });
    const m = capa.elementos.length;
    const x0 = c.x + etiquetaW + 0.2;
    const pg = 0.18;
    const w = (c.x + c.w - 0.15 - x0 - pg * (m - 1)) / m;
    capa.elementos.forEach((e, j) => {
      const x = x0 + j * (w + pg);
      const te = colorDeTono(e.tono ?? capa.tono);
      const hc = h - 0.2;
      tarjeta(s, { x, y: y + 0.1, w, h: hc }, "#FFFFFF", mezclar(te.fuerte, "#FFFFFF", 0.6));
      const dd = Math.min(0.62, hc - 0.2);
      insignia(s, e.icono, x + 0.16, y + 0.1 + (hc - dd) / 2, dd, te.suave, te.fuerte);
      const tx = x + 0.16 + dd + 0.16;
      texto(s, e.titulo, { x: tx, y: y + 0.14, w: x + w - tx - 0.1, h: hc * 0.5 - 0.02 }, { tam: 15, negrita: true, fuente: TITULO, vertical: "bottom", color: te.fuerte });
      if (e.texto) texto(s, e.texto, { x: tx, y: y + 0.14 + hc * 0.5, w: x + w - tx - 0.1, h: hc * 0.5 - 0.1 }, { tam: 12, color: color.secundario });
    });
    if (i < n - 1) flecha(s, c.x + etiquetaW / 2, y + h - 0.02, c.x + etiquetaW / 2, y + h + gap + 0.02, PRI, 2.5);
  });
}

// ── Tablas de base de datos ───────────────────────────────────────────────

function tablas(s: Slide, c: Caja, v: Extract<Visual, { tipo: "tablas" }>) {
  const nb = v.bases.length;
  const hueco = nb > 1 ? 1.9 : 0;
  const unidades = v.bases.reduce((a, b) => a + b.tablas.length, 0);
  const anchoUtil = c.w - hueco * (nb - 1);
  const maxCols = Math.max(...v.bases.flatMap((b) => b.tablas.map((t) => t.columnas.length)));
  const filaH = Math.min(0.62, (c.h - 1.0 - 0.56 - 0.5) / maxCols);
  const tablaH = 0.56 + maxCols * filaH + 0.12;
  const baseH = Math.min(c.h, 1.0 + tablaH + 0.3);
  const y0 = c.y + (c.h - baseH) / 2;
  let x = c.x;
  const centros: number[] = [];
  v.bases.forEach((b, i) => {
    const w = (anchoUtil * b.tablas.length) / unidades;
    const t = colorDeTono(b.tono);
    tarjeta(s, { x, y: y0, w, h: baseH }, mezclar(t.suave, "#FFFFFF", 0.35), mezclar(t.fuerte, "#FFFFFF", 0.55));
    s.addShape("roundRect", { x, y: y0, w, h: 0.82, rectRadius: 0.14, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    s.addShape("rect", { x, y: y0 + 0.5, w, h: 0.32, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    icono(s, "database", x + 0.24, y0 + 0.2, 0.44, "#FFFFFF");
    texto(s, b.titulo, { x: x + 0.82, y: y0 + 0.08, w: w - 1.0, h: 0.4 }, { tam: 18, negrita: true, color: "#FFFFFF", fuente: TITULO, vertical: "middle" });
    if (b.subtitulo) texto(s, b.subtitulo, { x: x + 0.82, y: y0 + 0.46, w: w - 1.0, h: 0.28 }, { tam: 11.5, color: color.sobreOscuroSecundario });
    const tg = 0.25;
    const tw = (w - 0.5 - tg * (b.tablas.length - 1)) / b.tablas.length;
    b.tablas.forEach((tb, j) => {
      const tx = x + 0.25 + j * (tw + tg);
      const ty = y0 + 1.05;
      tarjeta(s, { x: tx, y: ty, w: tw, h: tablaH });
      s.addShape("roundRect", { x: tx, y: ty, w: tw, h: 0.56, rectRadius: 0.14, fill: { color: hex(t.suave) }, line: { color: hex(t.suave), width: 0 } });
      s.addShape("rect", { x: tx, y: ty + 0.36, w: tw, h: 0.2, fill: { color: hex(t.suave) }, line: { color: hex(t.suave), width: 0 } });
      icono(s, "table", tx + 0.16, ty + 0.14, 0.3, t.fuerte);
      texto(s, tb.nombre, { x: tx + 0.56, y: ty + 0.06, w: tw - 0.7, h: 0.44 }, { tam: 15, negrita: true, color: t.fuerte, fuente: MONO, vertical: "middle" });
      tb.columnas.forEach((col, k) => {
        const cy = ty + 0.6 + k * filaH;
        if (k > 0) s.addShape("line", { x: tx + 0.15, y: cy, w: tw - 0.3, h: 0, line: { color: hex(color.linea), width: 0.75 } });
        const [nombre, ...resto] = col.split(" · ");
        const clave = /PK|FK/.test(resto.join(" "));
        icono(s, clave ? "key-round" : "hash", tx + 0.17, cy + 0.12, 0.22, clave ? color.advertencia : color.secundario);
        s.addText([{ text: nombre, options: { bold: true, color: hex(color.texto), fontFace: MONO } }, ...(resto.length ? [{ text: `  ${resto.join(" · ")}`, options: { color: hex(color.secundario), fontFace: FUENTE } }] : [])], { x: tx + 0.48, y: cy, w: tw - 0.58, h: filaH, margin: 0, fontSize: tamQueCabe(col, tw - 0.62, filaH - 0.04, 14, 8), valign: "middle", fit: "shrink" });
      });
    });
    centros.push(x + w);
    x += w + hueco;
    void i;
  });
  if (nb > 1) {
    const yE = y0 + 1.05 + tablaH / 2;
    for (let i = 0; i < nb - 1; i++) {
      const x1 = centros[i] + 0.08;
      const x2 = x1 + hueco - 0.16;
      flecha(s, x1, yE, x2, yE, ACC_T, 2.5, "dash");
      texto(s, v.enlace, { x: x1, y: yE - 0.62, w: hueco - 0.16, h: 0.56 }, { tam: 12, negrita: true, color: ACC_T, alinear: "center", vertical: "bottom" });
      texto(s, "sin llaves foráneas entre bases", { x: x1, y: yE + 0.08, w: hueco - 0.16, h: 0.5 }, { tam: 10.5, color: color.secundario, alinear: "center" });
    }
  }
}

// ── Matriz ────────────────────────────────────────────────────────────────

function matriz(s: Slide, c: Caja, v: Extract<Visual, { tipo: "matriz" }>) {
  const iconoW = 0.85;
  const proporcion = [0.27, 0.39, 0.34];
  const resto = c.w - iconoW;
  const anchos = proporcion.map((p) => resto * p);
  const xs = anchos.map((_, i) => c.x + iconoW + anchos.slice(0, i).reduce((a, b) => a + b, 0));
  const hh = 0.46;
  s.addShape("roundRect", { x: c.x, y: c.y, w: c.w, h: hh, rectRadius: 0.1, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 } });
  v.encabezados.forEach((e, i) => texto(s, e.toUpperCase(), { x: xs[i] + 0.12, y: c.y, w: anchos[i] - 0.24, h: hh }, { tam: 11.5, negrita: true, color: "#FFFFFF", vertical: "middle" }));
  const gap = 0.12;
  const n = v.filas.length;
  const h = (c.h - hh - 0.14 - gap * (n - 1)) / n;
  v.filas.forEach((f, i) => {
    const y = c.y + hh + 0.14 + i * (h + gap);
    const t = colorDeTono(f.tono);
    tarjeta(s, { x: c.x, y, w: c.w, h });
    s.addShape("rect", { x: c.x, y: y + 0.1, w: 0.07, h: h - 0.2, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    const d = Math.min(0.56, h - 0.16);
    insignia(s, f.icono, c.x + (iconoW - d) / 2 + 0.03, y + (h - d) / 2, d, t.suave, t.fuerte);
    f.celdas.forEach((celda, j) => {
      if (j > 0) s.addShape("line", { x: xs[j], y: y + 0.14, w: 0, h: h - 0.28, line: { color: hex(color.linea), width: 0.75 } });
      texto(s, celda, { x: xs[j] + 0.14, y: y + 0.06, w: anchos[j] - 0.28, h: h - 0.12 }, { tam: j === 0 ? 15 : 14, negrita: j === 0, color: j === 0 ? t.fuerte : color.texto, vertical: "middle", fuente: j === 0 ? TITULO : FUENTE });
    });
  });
}

// ── Hexágono: puertos y adaptadores ───────────────────────────────────────

function hexagono(s: Slide, c: Caja, v: Extract<Visual, { tipo: "hexagono" }>) {
  const entW = 2.5;
  const salW = 2.7;
  const puertoW = 2.85;
  const hexW = c.w - entW - salW - puertoW - 0.45 - 0.2 - 0.45;
  const hexH = Math.min(c.h - 0.6, hexW * 0.88);
  const xHex = c.x + entW + 0.45;
  const yHex = c.y + 0.45 + (c.h - 0.45 - hexH) / 2;
  const xPuerto = xHex + hexW + 0.2;
  const xSal = xPuerto + puertoW + 0.45;
  const cabecera = (t: string, x: number, w: number) => texto(s, t, { x, y: c.y, w, h: 0.3 }, { tam: 11, negrita: true, color: ACC_T, alinear: "center" });
  cabecera("ENTRADA", c.x, entW);
  cabecera("DOMINIO", xHex, hexW);
  cabecera("PUERTOS", xPuerto, puertoW);
  cabecera("SALIDA", xSal, salW);

  // Dominio al centro, con un anillo exterior.
  s.addShape("hexagon", { x: xHex - 0.12, y: yHex - 0.12, w: hexW + 0.24, h: hexH + 0.24, fill: { color: hex(ACC_S) }, line: { color: hex(ACC), width: 1.5, dashType: "dash" } });
  s.addShape("hexagon", { x: xHex, y: yHex, w: hexW, h: hexH, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 }, shadow: sombra() });
  const di = Math.min(0.9, hexH * 0.3);
  icono(s, v.centro.icono, xHex + hexW / 2 - di / 2, yHex + hexH * 0.18, di, ACC, 1.75);
  texto(s, v.centro.titulo, { x: xHex + 0.3, y: yHex + hexH * 0.18 + di + 0.08, w: hexW - 0.6, h: 0.5 }, { tam: 24, negrita: true, color: "#FFFFFF", alinear: "center", fuente: TITULO });
  if (v.centro.texto) texto(s, v.centro.texto, { x: xHex + hexW * 0.2, y: yHex + hexH * 0.18 + di + 0.6, w: hexW * 0.6, h: Math.max(0.4, hexH * 0.82 - di - 0.75) }, { tam: 12, color: color.sobreOscuroSecundario, alinear: "center" });

  const columna = (lista: ElementoVisual[], x: number, w: number, lado: "izq" | "der") => {
    const gap = 0.16;
    const zona = c.h - 0.45;
    const h = Math.min(1.0, (zona - gap * (lista.length - 1)) / lista.length);
    const total = lista.length * h + gap * (lista.length - 1);
    const y0 = c.y + 0.45 + (zona - total) / 2;
    return lista.map((e, i) => {
      const y = y0 + i * (h + gap);
      const t = colorDeTono(e.tono);
      tarjeta(s, { x, y, w, h }, "#FFFFFF", mezclar(t.fuerte, "#FFFFFF", 0.55));
      const d = Math.min(0.52, h - 0.2);
      insignia(s, e.icono, x + 0.14, y + (h - d) / 2, d, t.suave, t.fuerte);
      const tx = x + 0.14 + d + 0.12;
      texto(s, e.titulo, { x: tx, y: y + 0.08, w: x + w - tx - 0.08, h: h * 0.5 - 0.04 }, { tam: 13.5, negrita: true, fuente: TITULO, vertical: "bottom", color: t.fuerte });
      if (e.texto) texto(s, e.texto, { x: tx, y: y + h * 0.5 + 0.02, w: x + w - tx - 0.08, h: h * 0.5 - 0.1 }, { tam: 11, color: color.secundario });
      return { y: y + h / 2, x: lado === "izq" ? x + w : x };
    });
  };
  const entradas = columna(v.entrada, c.x, entW, "izq");
  for (const p of entradas) flecha(s, p.x + 0.06, p.y, xHex - 0.16, Math.min(Math.max(p.y, yHex + hexH * 0.3), yHex + hexH * 0.7), color.azulVivo, 2.25);

  // Puertos: contratos que el dominio declara y la salida implementa.
  const pg = 0.16;
  const ph = Math.min(0.62, (hexH - pg * (v.puertos.length - 1)) / v.puertos.length);
  const pTotal = v.puertos.length * ph + pg * (v.puertos.length - 1);
  const py0 = yHex + (hexH - pTotal) / 2;
  v.puertos.forEach((p, i) => {
    const y = py0 + i * (ph + pg);
    s.addShape("roundRect", { x: xPuerto, y, w: puertoW, h: ph, rectRadius: 0.08, fill: { color: "FFFFFF" }, line: { color: hex(ACC), width: 1.5, dashType: "dash" } });
    s.addText([{ text: "«puerto»", options: { italic: true, color: hex(color.secundario), fontSize: 8.5, breakLine: true } }, { text: p, options: { bold: true, color: hex(ACC_T), fontFace: MONO, fontSize: tamQueCabe(p, puertoW - 0.55, 0.3, 11, 7) } }], { x: xPuerto + 0.08, y, w: puertoW - 0.16, h: ph, margin: 0, fontFace: FUENTE, valign: "middle", align: "center", fit: "shrink" });
    flecha(s, xHex + hexW - 0.15, y + ph / 2, xPuerto - 0.02, y + ph / 2, ACC, 1.5);
  });
  const salidas = columna(v.salida, xSal, salW, "der");
  for (const p of salidas) flecha(s, p.x - 0.06, p.y, xPuerto + puertoW + 0.06, Math.min(Math.max(p.y, py0 + 0.1), py0 + pTotal - 0.1), color.secundario, 1.5, "dash");
}

export function dibujarVisual(s: Slide, v: Visual, c: Caja, lateral?: (caja: Caja) => void, iconoSeccion?: Icono) {
  switch (v.tipo) {
    case "ruta": return ruta(s, c);
    case "aprendizajes": return aprendizajes(s, c, v, iconoSeccion);
    case "escenario": return escenario(s, c, v);
    case "capas": return capas(s, c, v);
    case "tablas": return tablas(s, c, v);
    case "matriz": return matriz(s, c, v);
    case "hexagono": return hexagono(s, c, v);
    case "cifras": return cifras(s, c, v.cifras);
    case "flujo": return flujo(s, c, v);
    case "tuberia": return tuberia(s, c, v.etapas);
    case "estados": return estados(s, c, v);
    case "contraste": return contraste(s, c, v);
    case "tarjetas": return tarjetas(s, c, v);
    case "captura": return captura(s, c, v, lateral);
    case "ramas": return ramas(s, c, v);
  }
}

export function tonoPorDefecto(t: Tono | undefined): Tono {
  return t ?? "marino";
}

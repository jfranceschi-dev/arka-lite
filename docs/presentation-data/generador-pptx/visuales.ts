import { existsSync } from "node:fs";
import { join } from "node:path";
import { secciones } from "../contenido/index.ts";
import { NOMBRE_ENFOQUE, type Captura, type ElementoVisual, type Enfoque, type Icono, type Tono, type Visual } from "../contenido/tipos.ts";
import { DIR_CAPTURAS } from "../entregables.ts";
import { color } from "../diseno/tokens.ts";
import { ACC, ACC_S, ACC_T, FUENTE, H, MONO, PRI, PROF, fijarPaso, halo, sombra, TITULO, colorDeTono, flecha, hex, icono, insignia, mezclar, type Slide } from "./base.ts";
import { pasoDeParte } from "../contenido/visuales.ts";
import { tamQueCabe } from "./medidas.ts";
import { colorCodigo, resaltar } from "../diseno/resaltado.ts";

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

// Cada parte con su enfoque: las que el equipo presenta a fondo van más
// grandes y con halo; las de vista general, más pequeñas.
const estiloEnfoque: Record<Enfoque, { fondo: string; texto: string; borde: string }> = {
  fondo: { fondo: ACC, texto: PROF, borde: ACC },
  general: { fondo: "#FFFFFF", texto: color.secundario, borde: color.linea },
  vivo: { fondo: "#5B3FC4", texto: "#FFFFFF", borde: "#5B3FC4" },
};

function ruta(s: Slide, c: Caja) {
  const partes = secciones.filter((x) => x.numero !== null);
  const paso = c.w / partes.length;
  const d = Math.min(1.05, paso - 0.45);
  const bloque = 0.3 + d + 1.25 + 1.0;
  const yc = c.y + Math.max(0.1, (c.h - bloque) / 2) + 0.3 + d / 2;
  s.addShape("line", { x: c.x + paso / 2, y: yc, w: paso * (partes.length - 1), h: 0, line: { color: hex(mezclar(ACC, "#FFFFFF", 0.35)), width: 4 } });
  partes.forEach((sec, i) => {
    fijarPaso(pasoDeParte(i));
    const cx = c.x + i * paso + paso / 2;
    const enfoque = sec.enfoque ?? "general";
    const fondo = enfoque === "fondo";
    const dd = fondo ? d : d * 0.78;
    const relleno = enfoque === "general" ? mezclar(PRI, "#FFFFFF", 0.3) : enfoque === "vivo" ? "#5B3FC4" : PRI;
    s.addShape("ellipse", { x: cx - dd / 2, y: yc - dd / 2, w: dd, h: dd, fill: { color: hex(relleno) }, line: { color: fondo ? hex(ACC) : "FFFFFF", width: fondo ? 3.5 : 3 }, shadow: fondo ? halo() : sombra() });
    icono(s, sec.icono ?? "flag", cx - dd * 0.25, yc - dd * 0.25, dd * 0.5, "#FFFFFF");
    s.addText(String(sec.numero), { x: cx + dd * 0.16, y: yc - dd / 2 - 0.08, w: 0.34, h: 0.34, shape: "ellipse", margin: 0, fill: { color: hex(ACC) }, line: { color: "FFFFFF", width: 1.5 }, fontFace: TITULO, fontSize: 11.5, bold: true, color: hex(PROF), align: "center", valign: "middle" });
    const yT = yc + d / 2 + 0.14;
    texto(s, sec.titulo, { x: cx - paso / 2 + 0.04, y: yT, w: paso - 0.08, h: 0.62 }, { tam: 15, negrita: true, alinear: "center", fuente: TITULO });
    const e = estiloEnfoque[enfoque];
    const etiqueta = NOMBRE_ENFOQUE[enfoque].toUpperCase();
    const chipW = Math.min(paso - 0.16, 0.4 + etiqueta.length * 0.085);
    s.addText(etiqueta, { x: cx - chipW / 2, y: yT + 0.7, w: chipW, h: 0.3, shape: "roundRect", rectRadius: 0.15, margin: 0, fill: { color: hex(e.fondo) }, line: { color: hex(e.borde), width: 1 }, fontFace: FUENTE, fontSize: 9.5, bold: true, color: hex(e.texto), align: "center", valign: "middle", charSpacing: 1 });
    texto(s, (sec.temas ?? []).slice(0, 3).join(" · "), { x: cx - paso / 2 + 0.06, y: yT + 1.12, w: paso - 0.12, h: Math.max(0.6, c.y + c.h - (yT + 1.12)) }, { tam: 11.5, color: color.secundario, alinear: "center" });
  });
}

// ── Equipo ────────────────────────────────────────────────────────────────

// Una columna por área: su ícono en una franja de color, qué aporta y qué
// partes presenta.
function equipo(s: Slide, c: Caja, v: Extract<Visual, { tipo: "equipo" }>) {
  const n = v.areas.length;
  const gap = 0.25;
  const w = (c.w - gap * (n - 1)) / n;
  const banda = 1.1;
  v.areas.forEach((a, i) => {
    const x = c.x + i * (w + gap);
    const t = colorDeTono(a.tono);
    tarjeta(s, { x, y: c.y, w, h: c.h });
    s.addShape("roundRect", { x, y: c.y, w, h: banda, rectRadius: 0.14, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    s.addShape("rect", { x, y: c.y + banda - 0.2, w, h: 0.2, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    const d = 0.86;
    insignia(s, a.icono, x + (w - d) / 2, c.y + (banda - d) / 2, d, "#FFFFFF", t.fuerte, true);
    texto(s, a.titulo, { x: x + 0.15, y: c.y + banda + 0.1, w: w - 0.3, h: 0.42 }, { tam: 19, negrita: true, fuente: TITULO, color: t.fuerte, alinear: "center", vertical: "middle" });
    // Cuántas personas: un chip con el ícono de personas.
    const cw = Math.min(w - 0.4, 0.75 + a.cuantos.length * 0.085);
    const cx0 = x + (w - cw) / 2;
    s.addShape("roundRect", { x: cx0, y: c.y + banda + 0.56, w: cw, h: 0.32, rectRadius: 0.16, fill: { color: hex(t.suave) }, line: { color: hex(t.suave), width: 0 } });
    icono(s, "users", cx0 + 0.12, c.y + banda + 0.6, 0.24, t.fuerte);
    texto(s, a.cuantos, { x: cx0 + 0.42, y: c.y + banda + 0.56, w: cw - 0.5, h: 0.32 }, { tam: 11.5, negrita: true, color: t.fuerte, vertical: "middle" });
    if (a.texto) texto(s, a.texto, { x: x + 0.2, y: c.y + banda + 0.98, w: w - 0.4, h: 0.62 }, { tam: 12.5, color: color.secundario, alinear: "center" });
    const yL = c.y + banda + 1.66;
    s.addShape("line", { x: x + 0.3, y: yL, w: w - 0.6, h: 0, line: { color: hex(color.linea), width: 0.75 } });
    texto(s, "PRESENTA", { x: x + 0.2, y: yL + 0.1, w: w - 0.4, h: 0.26 }, { tam: 9.5, negrita: true, color: t.fuerte, alinear: "center" });
    const ch = 0.32;
    const cg = 0.06;
    a.partes.forEach((p, j) => {
      const y = yL + 0.44 + j * (ch + cg);
      s.addText(p, { x: x + 0.25, y, w: w - 0.5, h: ch, shape: "roundRect", rectRadius: ch / 2, margin: 0, fill: { color: hex(t.suave) }, line: { color: hex(mezclar(t.fuerte, "#FFFFFF", 0.6)), width: 0.75 }, fontFace: FUENTE, fontSize: tamQueCabe(p, w - 0.7, ch - 0.04, 12.5, 9, true), bold: true, color: hex(t.fuerte), align: "center", valign: "middle" });
    });
  });
}

// ── El sistema en la práctica ─────────────────────────────────────────────

// Segmentos rectos con la punta en el último.
function codo(s: Slide, puntos: [number, number][], c: string, ancho: number, guion?: "dash") {
  for (let i = 0; i < puntos.length - 1; i++) {
    const [x1, y1] = puntos[i];
    const [x2, y2] = puntos[i + 1];
    const ultimo = i === puntos.length - 2;
    s.addShape("line", { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1, line: { color: hex(c), width: ancho, dashType: guion, endArrowType: ultimo ? "triangle" : undefined } });
  }
}

function numero(s: Slide, n: number, cx: number, cy: number, fondo: string = PRI) {
  s.addText(String(n), { x: cx - 0.19, y: cy - 0.19, w: 0.38, h: 0.38, shape: "ellipse", margin: 0, fill: { color: hex(fondo) }, line: { color: "FFFFFF", width: 1.5 }, fontFace: TITULO, fontSize: 12.5, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
}

// Tarjeta de una pieza: barra de color, ícono y nombre.
function pieza(s: Slide, e: ElementoVisual, c: Caja, tonoBase: Tono) {
  const t = colorDeTono(e.tono ?? tonoBase);
  tarjeta(s, c, "#FFFFFF", mezclar(t.fuerte, "#FFFFFF", 0.5));
  s.addShape("rect", { x: c.x, y: c.y + 0.12, w: 0.08, h: c.h - 0.24, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
  const d = Math.min(0.7, c.h - 0.36);
  insignia(s, e.icono, c.x + 0.22, c.y + (c.h - d) / 2, d, t.suave, t.fuerte);
  const tx = c.x + 0.22 + d + 0.16;
  texto(s, e.titulo, { x: tx, y: c.y + 0.12, w: c.x + c.w - tx - 0.12, h: c.h / 2 - 0.08 }, { tam: 16, negrita: true, fuente: TITULO, color: t.fuerte, vertical: "bottom" });
  if (e.texto) texto(s, e.texto, { x: tx, y: c.y + c.h / 2 + 0.02, w: c.x + c.w - tx - 0.12, h: c.h / 2 - 0.14 }, { tam: 12.5, color: color.secundario });
}

function baseDeDatos(s: Slide, e: ElementoVisual, c: Caja) {
  const t = colorDeTono(e.tono ?? "marino");
  s.addShape("can", { x: c.x, y: c.y, w: c.w, h: c.h, fill: { color: hex(t.suave) }, line: { color: hex(t.fuerte), width: 2 }, shadow: sombra() });
  texto(s, e.titulo, { x: c.x + 0.1, y: c.y + c.h * 0.34, w: c.w - 0.2, h: 0.36 }, { tam: 15, negrita: true, fuente: MONO, color: t.fuerte, alinear: "center", vertical: "middle" });
  if (e.texto) texto(s, e.texto, { x: c.x + 0.1, y: c.y + c.h * 0.34 + 0.36, w: c.w - 0.2, h: 0.3 }, { tam: 12, color: color.secundario, alinear: "center" });
}

function etiquetaConexion(s: Slide, t: string, c: Caja, alinear: "left" | "center" | "right", tinta: string = PRI) {
  texto(s, t, c, { tam: 13, negrita: true, color: tinta, alinear, vertical: "middle" });
}

function sistema(s: Slide, c: Caja, v: Extract<Visual, { tipo: "sistema" }>) {
  const hNota = 0.5;
  const hm = c.h - hNota - 0.15;
  const hc = 1.2;
  const yTop = c.y + 0.2;
  const yBot = c.y + hm - 0.2 - hc;
  const ct = yTop + hc / 2;
  const cb = yBot + hc / 2;
  const ym = (ct + cb) / 2;
  const xUi = c.x + 1.75;
  const wUi = 2.35;
  const xSv = c.x + 5.35;
  const wSv = 2.85;
  const xDb = c.x + 9.6;
  const wDb = c.w - 9.6;
  const xCodo = c.x + 4.8;
  const linea = mezclar(PRI, "#FFFFFF", 0.15);

  // Persona
  const violeta = colorDeTono("violeta");
  const dp = 0.95;
  const px = c.x + 0.62;
  s.addShape("ellipse", { x: px - dp / 2, y: ym - dp / 2, w: dp, h: dp, fill: { color: hex(violeta.suave) }, line: { color: hex(violeta.fuerte), width: 2 }, shadow: sombra() });
  icono(s, v.persona.icono, px - 0.26, ym - 0.26, 0.52, violeta.fuerte, 1.75);
  texto(s, v.persona.titulo, { x: px - 0.62, y: ym + dp / 2 + 0.06, w: 1.24, h: 0.3 }, { tam: 13, negrita: true, alinear: "center", fuente: TITULO });
  if (v.persona.texto) texto(s, v.persona.texto, { x: px - 0.7, y: ym + dp / 2 + 0.34, w: 1.4, h: 0.28 }, { tam: 10.5, color: color.secundario, alinear: "center" });

  // UI, servicios y bases
  pieza(s, v.ui, { x: xUi, y: ym - hc / 2, w: wUi, h: hc }, "violeta");
  pieza(s, v.servicios[0], { x: xSv, y: yTop, w: wSv, h: hc }, "marino");
  pieza(s, v.servicios[1], { x: xSv, y: yBot, w: wSv, h: hc }, "cian");
  baseDeDatos(s, v.bases[0], { x: xDb, y: yTop, w: wDb, h: hc });
  baseDeDatos(s, v.bases[1], { x: xDb, y: yBot, w: wDb, h: hc });

  // 1. Persona → UI. Cada conexión aparece en su clic.
  fijarPaso(1);
  codo(s, [[px + dp / 2 + 0.06, ym], [xUi - 0.06, ym]], linea, 2.5);
  numero(s, 1, (px + dp / 2 + xUi) / 2, ym);
  etiquetaConexion(s, v.conexiones[0], { x: px + dp / 2, y: ym - 0.62, w: xUi - px - dp / 2, h: 0.36 }, "center");
  // 2. UI → servicio 1 y 6. UI → servicio 2, por el mismo codo.
  fijarPaso(2);
  codo(s, [[xUi + wUi + 0.04, ym - 0.28], [xCodo, ym - 0.28], [xCodo, ct], [xSv - 0.06, ct]], linea, 2.5);
  numero(s, 2, xCodo, (ym - 0.28 + ct) / 2);
  etiquetaConexion(s, v.conexiones[1], { x: xUi, y: ct - 0.05, w: xCodo - xUi - 0.3, h: 0.5 }, "right");
  fijarPaso(6);
  codo(s, [[xUi + wUi + 0.04, ym + 0.28], [xCodo, ym + 0.28], [xCodo, cb], [xSv - 0.06, cb]], linea, 2.5);
  numero(s, 6, xCodo, (ym + 0.28 + cb) / 2);
  etiquetaConexion(s, v.conexiones[5], { x: xUi, y: cb - 0.45, w: xCodo - xUi - 0.3, h: 0.5 }, "right");
  // 3 y 5. Cada servicio → su base.
  fijarPaso(3);
  codo(s, [[xSv + wSv + 0.06, ct], [xDb - 0.06, ct]], linea, 2.5);
  numero(s, 3, (xSv + wSv + xDb) / 2, ct);
  etiquetaConexion(s, v.conexiones[2], { x: xSv + wSv + 0.05, y: ct - 0.78, w: xDb - xSv - wSv - 0.1, h: 0.56 }, "center");
  fijarPaso(5);
  codo(s, [[xSv + wSv + 0.06, cb], [xDb - 0.06, cb]], linea, 2.5);
  numero(s, 5, (xSv + wSv + xDb) / 2, cb);
  etiquetaConexion(s, v.conexiones[4], { x: xSv + wSv + 0.05, y: cb - 0.78, w: xDb - xSv - wSv - 0.1, h: 0.56 }, "center");

  // 4. El evento: un dato que viaja entre los servicios, no una pieza.
  fijarPaso(4);
  const xe = xSv + wSv / 2;
  codo(s, [[xe, yTop + hc + 0.06], [xe, yBot - 0.06]], ACC_T, 3, "dash");
  numero(s, 4, xe, ym, ACC_T);
  etiquetaConexion(s, v.conexiones[3], { x: xCodo + 0.3, y: ym - 0.18, w: xe - xCodo - 0.55, h: 0.36 }, "right", ACC_T);
  const pw = 3.15;
  const ph = 0.82;
  const pX = xe + 0.4;
  s.addShape("roundRect", { x: pX, y: ym - ph / 2, w: pw, h: ph, rectRadius: 0.12, fill: { color: hex(ACC_S) }, line: { color: hex(ACC), width: 1.25, dashType: "dash" } });
  icono(s, "mail", pX + 0.16, ym - 0.2, 0.4, ACC_T);
  texto(s, "EL DATO QUE VIAJA", { x: pX + 0.68, y: ym - ph / 2 + 0.08, w: pw - 0.8, h: 0.24 }, { tam: 9.5, negrita: true, color: ACC_T });
  texto(s, v.evento, { x: pX + 0.68, y: ym - ph / 2 + 0.3, w: pw - 0.8, h: ph - 0.36 }, { tam: 12, color: color.texto, vertical: "middle" });

  // Entre las dos bases no hay flecha: el último clic lo remata.
  fijarPaso(7);
  const xb = xDb + wDb / 2;
  s.addShape("line", { x: xb, y: yTop + hc + 0.08, w: 0, h: yBot - yTop - hc - 0.16, line: { color: hex(color.linea), width: 2, dashType: "sysDot" } });
  insignia(s, "ban", xb - 0.26, ym - 0.26, 0.52, color.errorSuave, color.error);

  // La nota de abajo.
  const yN = c.y + c.h - hNota;
  s.addShape("roundRect", { x: c.x, y: yN, w: c.w, h: hNota, rectRadius: 0.1, fill: { color: hex(color.fondo) }, line: { color: hex(color.linea), width: 0.75 } });
  icono(s, "shield-check", c.x + 0.2, yN + 0.1, 0.3, color.correcto);
  texto(s, v.nota, { x: c.x + 0.65, y: yN, w: c.w - 0.85, h: hNota }, { tam: 14, negrita: true, color: color.texto, vertical: "middle" });
}

// ── Mapeo del ORM ─────────────────────────────────────────────────────────

// La clase a la izquierda, la tabla a la derecha y una flecha por campo;
// abajo, cada operación del código y el SQL que Hibernate envía.
function mapeo(s: Slide, c: Caja, v: Extract<Visual, { tipo: "mapeo" }>) {
  const wCaja = 4.55;
  const hCab = 0.8;
  const hFila = 0.5;
  const n = v.clase.campos.length;
  const hCaja = hCab + n * hFila + 0.14;
  const xT = c.x + c.w - wCaja;
  const cabecera = (x: number, titulo: string, subtitulo: string, nombre: Icono, t: { fuerte: string; suave: string }) => {
    tarjeta(s, { x, y: c.y, w: wCaja, h: hCaja });
    s.addShape("roundRect", { x, y: c.y, w: wCaja, h: hCab, rectRadius: 0.14, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    s.addShape("rect", { x, y: c.y + hCab - 0.2, w: wCaja, h: 0.2, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    icono(s, nombre, x + 0.22, c.y + 0.2, 0.4, "#FFFFFF");
    texto(s, titulo, { x: x + 0.78, y: c.y + 0.06, w: wCaja - 0.95, h: 0.4 }, { tam: 18, negrita: true, color: "#FFFFFF", fuente: MONO, vertical: "middle" });
    texto(s, subtitulo, { x: x + 0.78, y: c.y + 0.44, w: wCaja - 0.95, h: 0.3 }, { tam: 11, color: color.sobreOscuroSecundario });
  };
  const tc = colorDeTono("marino");
  const tt = colorDeTono("cian");
  cabecera(c.x, v.clase.titulo, v.clase.subtitulo, "code", tc);
  cabecera(xT, v.tabla.titulo, v.tabla.subtitulo, "table", tt);
  v.clase.campos.forEach((campo, i) => {
    fijarPaso(1);
    const y = c.y + hCab + 0.07 + i * hFila;
    const col = v.tabla.columnas[i];
    if (i > 0) {
      s.addShape("line", { x: c.x + 0.2, y, w: wCaja - 0.4, h: 0, line: { color: hex(color.linea), width: 0.75 } });
      s.addShape("line", { x: xT + 0.2, y, w: wCaja - 0.4, h: 0, line: { color: hex(color.linea), width: 0.75 } });
    }
    texto(s, campo.nombre, { x: c.x + 0.3, y, w: wCaja - 0.5, h: hFila }, { tam: 15, color: tc.fuerte, fuente: MONO, vertical: "middle", negrita: true });
    const clave = /PK|FK/.test(col.detalle ?? "");
    icono(s, clave ? "key-round" : "hash", xT + 0.24, y + (hFila - 0.24) / 2, 0.24, clave ? color.advertencia : color.secundario);
    s.addText([{ text: col.nombre, options: { bold: true, color: hex(tt.fuerte), fontFace: MONO } }, ...(col.detalle ? [{ text: `   ${col.detalle}`, options: { color: hex(color.secundario), fontFace: FUENTE } }] : [])], { x: xT + 0.6, y, w: wCaja - 0.75, h: hFila, margin: 0, fontSize: 15, valign: "middle", fit: "shrink" });
    // Flecha de ida y vuelta entre el campo y su columna.
    const yc = y + hFila / 2;
    s.addShape("line", { x: c.x + wCaja + 0.1, y: yc, w: xT - c.x - wCaja - 0.2, h: 0, line: { color: hex(ACC), width: 2.25, beginArrowType: "triangle", endArrowType: "triangle" } });
  });
  // El traductor al medio, sobre las flechas.
  const xm = c.x + wCaja + (xT - c.x - wCaja) / 2;
  const pw = 2.3;
  s.addText([{ text: "Hibernate", options: { bold: true, color: hex(ACC_T), fontFace: TITULO, fontSize: 16, breakLine: true } }, { text: "traduce en los dos sentidos", options: { color: hex(color.secundario), fontSize: 11 } }], { x: xm - pw / 2, y: c.y + 0.02, w: pw, h: hCab - 0.06, shape: "roundRect", rectRadius: 0.12, margin: 0, fill: { color: hex(ACC_S) }, line: { color: hex(ACC), width: 1 }, fontFace: FUENTE, align: "center", valign: "middle" });

  // Operaciones: lo que escribe el código y el SQL que llega a la base.
  const yOp = c.y + hCaja + 0.3;
  fijarPaso(2);
  texto(s, "LO QUE ESCRIBE EL CÓDIGO  →  EL SQL QUE HIBERNATE ENVÍA A POSTGRESQL", { x: c.x, y: yOp, w: c.w, h: 0.3 }, { tam: 11, negrita: true, color: ACC_T });
  const hOp = Math.min(0.56, (c.y + c.h - yOp - 0.4 - 0.12 * (v.operaciones.length - 1)) / v.operaciones.length);
  const wCod = 3.55;
  v.operaciones.forEach((o, i) => {
    fijarPaso(2 + i);
    const y = yOp + 0.4 + i * (hOp + 0.12);
    s.addText(o.codigo, { x: c.x, y, w: wCod, h: hOp, shape: "roundRect", rectRadius: 0.08, margin: 8, fill: { color: hex(color.codigoFondo) }, line: { color: hex(color.codigoFondo), width: 0 }, fontFace: MONO, fontSize: tamQueCabe(o.codigo, wCod - 0.3, hOp - 0.06, 14, 9), bold: true, color: hex(ACC), valign: "middle", fit: "shrink" });
    flecha(s, c.x + wCod + 0.1, y + hOp / 2, c.x + wCod + 0.6, y + hOp / 2, ACC_T, 2.5);
    const xs = c.x + wCod + 0.7;
    s.addText(o.sql, { x: xs, y, w: c.x + c.w - xs, h: hOp, shape: "roundRect", rectRadius: 0.08, margin: 8, fill: { color: hex(color.fondo) }, line: { color: hex(color.linea), width: 0.75 }, fontFace: MONO, fontSize: tamQueCabe(o.sql, c.x + c.w - xs - 0.3, hOp - 0.06, 14, 9), color: hex(color.texto), valign: "middle", fit: "shrink" });
  });
}

// ── Cifras ────────────────────────────────────────────────────────────────

function cifras(s: Slide, c: Caja, lista: (ElementoVisual & { valor: string })[]) {
  const cols = lista.length <= 4 ? lista.length : Math.ceil(lista.length / 2);
  const filas = Math.ceil(lista.length / cols);
  const gap = 0.24;
  const w = (c.w - gap * (cols - 1)) / cols;
  // Una sola fila no ocupa todo el alto: queda centrada.
  const h = filas === 1 ? Math.min(c.h, 3.4) : (c.h - gap * (filas - 1)) / filas;
  const y0 = filas === 1 ? c.y + (c.h - h) / 2 : c.y;
  lista.forEach((e, i) => {
    fijarPaso(i);
    const x = c.x + (i % cols) * (w + gap);
    const y = y0 + Math.floor(i / cols) * (h + gap);
    const t = colorDeTono(e.tono);
    tarjeta(s, { x, y, w, h });
    s.addShape("rect", { x: x + 0.14, y, w: w - 0.28, h: 0.07, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    insignia(s, e.icono, x + w - 0.86, y + 0.26, 0.62, t.suave, t.fuerte);
    const grande = filas === 1 ? 60 : 48;
    texto(s, e.valor, { x: x + 0.28, y: y + 0.2, w: w - 1.2, h: grande / 72 + 0.12 }, { tam: grande, negrita: true, color: t.fuerte, fuente: TITULO, vertical: "middle" });
    const yT = y + 0.3 + grande / 72;
    const unaFila = filas === 1;
    texto(s, e.titulo, { x: x + 0.28, y: yT, w: w - 0.5, h: unaFila ? 0.5 : 0.42 }, { tam: unaFila ? 18 : 15, negrita: true, fuente: TITULO });
    if (e.texto) texto(s, e.texto, { x: x + 0.28, y: yT + (unaFila ? 0.55 : 0.42), w: w - 0.5, h: h - (yT - y) - (unaFila ? 0.65 : 0.5) }, { tam: unaFila ? 15 : 12, color: unaFila ? color.texto : color.secundario });
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
    fijarPaso(i);
    const t = colorDeTono(e.tono ?? (i === n - 1 ? "correcto" : "marino"));
    const cx = c.x + i * paso + paso / 2;
    s.addShape("ellipse", { x: cx - d / 2, y: yc - d / 2, w: d, h: d, fill: { color: hex(t.suave) }, line: { color: hex(t.fuerte), width: 2.5 }, shadow: sombra() });
    icono(s, e.icono, cx - d * 0.27, yc - d * 0.27, d * 0.54, t.fuerte, 1.75);
    s.addText(String(i + 1), { x: cx - d / 2 - 0.04, y: yc - d / 2 - 0.04, w: 0.38, h: 0.38, shape: "ellipse", margin: 0, fill: { color: hex(t.fuerte) }, line: { color: "FFFFFF", width: 1.5 }, fontFace: TITULO, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    texto(s, e.titulo, { x: cx - paso / 2 + 0.05, y: yc + d / 2 + 0.14, w: paso - 0.1, h: 0.46 }, { tam: 18, negrita: true, alinear: "center", fuente: TITULO });
    if (e.texto) texto(s, e.texto, { x: cx - paso / 2 + 0.12, y: yTexto, w: paso - 0.24, h: hTexto }, { tam: 14, color: color.secundario, alinear: "center" });
    if (i < n - 1) {
      fijarPaso(i + 1);
      flecha(s, cx + d / 2 + 0.1, yc, cx + paso - d / 2 - 0.1, yc, ACC, 3);
    }
  });
  if (v.desvio) {
    fijarPaso(n);
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
    fijarPaso(i);
    const x = c.x + i * (w - solape);
    const fondo = e.tono ? colorDeTono(e.tono).fuerte : mezclar(PRI, ACC_T, n === 1 ? 0 : i / (n - 1));
    s.addShape(i === 0 ? "homePlate" : "chevron", { x, y, w, h, fill: { color: hex(fondo) }, line: { color: "FFFFFF", width: 2 }, shadow: sombra() });
    // El texto va en el cuerpo de la flecha, entre la muesca y la punta.
    const muesca = Math.min(w, h) * 0.5;
    const x0 = i === 0 ? x + 0.12 : x + muesca * 0.8;
    const x1 = x + w - muesca * 0.35;
    const ti = Math.min(0.62, h * 0.34);
    icono(s, e.icono, (x0 + x1) / 2 - ti / 2, y + h * 0.18, ti, "#FFFFFF");
    texto(s, e.titulo, { x: x0, y: y + h * 0.18 + ti + 0.1, w: x1 - x0, h: 0.42 }, { tam: 16, negrita: true, color: "#FFFFFF", alinear: "center", fuente: TITULO });
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
    fijarPaso(i);
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
    fijarPaso(i + 1);
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
    fijarPaso(cols);
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
    fijarPaso(i);
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
  fijarPaso(1);
  const cx = c.x + w + gap / 2;
  // "vs" cuando son dos maneras de hacer lo mismo; "+" cuando se complementan.
  const suma = v.union === "+";
  s.addText(suma ? "+" : "vs", { x: cx - 0.36, y: c.y + c.h / 2 - 0.36, w: 0.72, h: 0.72, shape: "ellipse", margin: 0, fill: { color: hex(suma ? ACC : PROF) }, line: { color: "FFFFFF", width: 3 }, fontFace: TITULO, fontSize: suma ? 28 : 16, bold: true, color: suma ? hex(PROF) : "FFFFFF", align: "center", valign: "middle", shadow: suma ? halo() : sombra() });
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
  const grande = !compacta && w > 4 && h > 1.45;
  // Con pocas tarjetas, cada una aparece en su clic.
  const porClic = !v.comando && n <= 6;
  v.tarjetas.forEach((e, i) => {
    if (porClic) fijarPaso(i);
    const x = c.x + (i % cols) * (w + gap);
    const y = y0 + Math.floor(i / cols) * (h + gap);
    const t = colorDeTono(e.tono);
    tarjeta(s, { x, y, w, h });
    s.addShape("rect", { x, y: y + 0.14, w: 0.07, h: h - 0.28, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    const d = compacta ? 0.5 : grande ? 0.86 : h > 1.8 ? 0.74 : 0.62;
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
      // Con tarjetas altas, la letra crece para que se lea de lejos.
      const alta = h > 1.8;
      texto(s, e.titulo, { x: tx, y: y + 0.2, w: x + w - tx - 0.15, h: d }, { tam: alta ? 18 : 15, negrita: true, fuente: TITULO, vertical: "middle", color: alta ? t.fuerte : color.texto });
      if (e.texto) texto(s, e.texto, { x: x + 0.28, y: y + 0.36 + d, w: w - 0.45, h: h - d - 0.5 }, { tam: alta ? 16 : 13, color: alta ? color.texto : color.secundario });
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
    fijarPaso(i);
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
  // La vuelta a main por Pull Request aparece en el clic.
  fijarPaso(1);
  s.addShape("line", { x: xVuelve - 0.7, y: yRama, w: 0.7, h: yMain - yRama, line: { color: hex(verde), width: 5, endArrowType: "triangle" } });
  fijarPaso(0);
  s.addText(v.rama, { x: xSale + 0.75, y: yRama - 0.78, w: 4.6, h: 0.4, shape: "roundRect", rectRadius: 0.2, margin: 8, fill: { color: hex(ACC_S) }, line: { color: hex(ACC), width: 1 }, fontFace: MONO, fontSize: 13, bold: true, color: hex(ACC_T), valign: "middle", fit: "shrink" });
  icono(s, "git-branch", xSale - 0.05, yRama - 0.8, 0.4, ACC_T);
  v.commits.forEach((m, i) => {
    const cx = xSale + 0.7 + paso * (i + 0.5);
    s.addShape("ellipse", { x: cx - 0.2, y: yRama - 0.2, w: 0.4, h: 0.4, fill: { color: "FFFFFF" }, line: { color: hex(ACC), width: 4 }, shadow: sombra() });
    s.addText(m, { x: cx - paso / 2 + 0.05, y: yRama + 0.32, w: paso - 0.1, h: 0.62, margin: 0, fontFace: MONO, fontSize: 11.5, color: hex(color.texto), align: "center", valign: "top", fit: "shrink" });
  });
  [x0 + 0.5, xSale, xVuelve, x1 - 0.5].forEach((cx) => s.addShape("ellipse", { x: cx - 0.17, y: yMain - 0.17, w: 0.34, h: 0.34, fill: { color: hex(PRI) }, line: { color: "FFFFFF", width: 2 } }));
  fijarPaso(1);
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
    fijarPaso(i + 1);
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
  fijarPaso(v.pasos.length + 1);
  banda(v.resultado, c.y + c.h - hb, hb, "RESULTADO");

  const n = v.pasos.length;
  const top = c.y + hb + 0.28;
  const alto = c.h - 2 * hb - 0.56;
  const paso = c.w / n;
  const d = Math.min(0.95, alto * 0.32);
  const yc = top + 0.5 + d / 2;
  // Flechas de la falla a la línea de tiempo y de la línea al resultado,
  // sin pisar los textos de los pasos.
  const xFalla = c.x + paso / 2 + d / 2 + 0.25;
  // La flecha al resultado sale debajo del texto del último paso.
  const xResultado = c.x + c.w - paso / 2;
  flecha(s, xResultado, top + alto + 0.02, xResultado, c.y + c.h - hb - 0.02, colorDeTono(v.resultado.tono).fuerte, 2, "dash");
  fijarPaso(1);
  flecha(s, xFalla, c.y + hb + 0.02, xFalla, yc - 0.12, colorDeTono(v.falla.tono).fuerte, 2, "dash");
  s.addShape("line", { x: c.x + paso / 2, y: yc, w: paso * (n - 1), h: 0, line: { color: hex(mezclar(ACC, "#FFFFFF", 0.3)), width: 4 } });
  v.pasos.forEach((e, i) => {
    fijarPaso(i + 1);
    const t = colorDeTono(e.tono);
    const cx = c.x + i * paso + paso / 2;
    const chipW = Math.min(paso - 0.3, 0.5 + e.momento.length * 0.1);
    s.addText(e.momento, { x: cx - chipW / 2, y: top, w: chipW, h: 0.32, shape: "roundRect", rectRadius: 0.16, margin: 0, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 }, fontFace: FUENTE, fontSize: 11, bold: true, color: "FFFFFF", align: "center", valign: "middle", fit: "shrink" });
    s.addShape("ellipse", { x: cx - d / 2, y: yc - d / 2, w: d, h: d, fill: { color: hex(t.suave) }, line: { color: hex(t.fuerte), width: 2.5 }, shadow: sombra() });
    icono(s, e.icono, cx - d * 0.27, yc - d * 0.27, d * 0.54, t.fuerte, 1.75);
    if (i < n - 1) {
      fijarPaso(i + 2);
      flecha(s, cx + d / 2 + 0.08, yc, cx + paso - d / 2 - 0.08, yc, ACC, 3);
      fijarPaso(i + 1);
    }
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
    fijarPaso(i);
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
    if (i < n - 1) {
      fijarPaso(i + 1);
      flecha(s, c.x + etiquetaW / 2, y + h - 0.02, c.x + etiquetaW / 2, y + h + gap + 0.02, PRI, 2.5);
    }
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
  // Cada tabla aparece en su clic; la base, con su primera tabla.
  let tablaGlobal = 0;
  v.bases.forEach((b, i) => {
    fijarPaso(tablaGlobal);
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
      fijarPaso(tablaGlobal++);
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
    fijarPaso(unidades);
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
    fijarPaso(i);
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
  fijarPaso(1);
  const entradas = columna(v.entrada, c.x, entW, "izq");
  for (const p of entradas) flecha(s, p.x + 0.06, p.y, xHex - 0.16, Math.min(Math.max(p.y, yHex + hexH * 0.3), yHex + hexH * 0.7), color.azulVivo, 2.25);

  // Puertos: contratos que el dominio declara y la salida implementa.
  fijarPaso(0);
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
  fijarPaso(2);
  const salidas = columna(v.salida, xSal, salW, "der");
  for (const p of salidas) flecha(s, p.x - 0.06, p.y, xPuerto + puertoW + 0.06, Math.min(Math.max(p.y, py0 + 0.1), py0 + pTotal - 0.1), color.secundario, 1.5, "dash");
}

// ── Caminos ───────────────────────────────────────────────────────────────

// Un carril por manera de hacerlo, de izquierda a derecha. La pieza donde
// vive la regla del negocio lleva una marca encima: así se ve, sin leer,
// que con procedimientos la regla está en la base y con ORM en el código.
function caminos(s: Slide, c: Caja, v: Extract<Visual, { tipo: "caminos" }>) {
  const n = v.caminos.length;
  const gap = 0.35;
  const hc = (c.h - gap * (n - 1)) / n;
  const etiquetaW = 2.05;
  v.caminos.forEach((camino, i) => {
    fijarPaso(i);
    const dibujarGrupos = (x0g: number, bwg: number, sep: number, byg: number) => {
      for (const g of camino.grupos ?? []) {
        const tg = colorDeTono(g.tono);
        const x1 = x0g + g.desde * (bwg + sep) + 0.04;
        const x2 = x0g + g.hasta * (bwg + sep) + bwg - 0.04;
        const yb = byg - 0.1;
        s.addShape("line", { x: x1, y: yb, w: x2 - x1, h: 0, line: { color: hex(tg.fuerte), width: 2 } });
        s.addShape("line", { x: x1, y: yb, w: 0, h: 0.08, line: { color: hex(tg.fuerte), width: 2 } });
        s.addShape("line", { x: x2, y: yb, w: 0, h: 0.08, line: { color: hex(tg.fuerte), width: 2 } });
        const pw = Math.min(x2 - x1 + 0.6, 0.4 + g.titulo.length * 0.085);
        s.addText(g.titulo, { x: (x1 + x2) / 2 - pw / 2, y: yb - 0.36, w: pw, h: 0.3, shape: "roundRect", rectRadius: 0.15, margin: 0, fill: { color: hex(tg.fuerte) }, line: { color: hex(tg.fuerte), width: 0 }, fontFace: FUENTE, fontSize: tamQueCabe(g.titulo, pw - 0.15, 0.28, 10, 7.5, true), bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      }
    };
    const y = c.y + i * (hc + gap);
    const t = colorDeTono(camino.tono);
    s.addShape("roundRect", { x: c.x, y, w: c.w, h: hc, rectRadius: 0.14, fill: { color: hex(mezclar(t.suave, "#FFFFFF", 0.35)) }, line: { color: hex(mezclar(t.fuerte, "#FFFFFF", 0.65)), width: 1 } });
    s.addText(camino.titulo, { x: c.x, y, w: etiquetaW, h: hc, shape: "roundRect", rectRadius: 0.14, margin: 8, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 }, fontFace: TITULO, fontSize: tamQueCabe(camino.titulo, etiquetaW - 0.3, hc - 0.2, 16, 10, true), bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    const m = camino.pasos.length;
    const x0 = c.x + etiquetaW + 0.3;
    const ancho = c.x + c.w - 0.2 - x0;
    // Sin etiquetas en las flechas, las cajas pueden ser más anchas.
    const hueco = camino.flechas.some((f) => f) ? 1.3 : 0.6;
    const bw = Math.min(2.4, (ancho - hueco * (m - 1)) / m);
    const separa = m > 1 ? (ancho - bw * m) / (m - 1) : 0;
    const bh = Math.min(1.4, hc - 0.6);
    const by = y + hc - bh - 0.18;
    dibujarGrupos(x0, bw, separa, by);
    camino.pasos.forEach((p, j) => {
      const x = x0 + j * (bw + separa);
      const regla = j === camino.regla;
      const tp = colorDeTono(regla ? "advertencia" : p.tono ?? camino.tono);
      tarjeta(s, { x, y: by, w: bw, h: bh }, regla ? tp.suave : "#FFFFFF", regla ? tp.fuerte : mezclar(tp.fuerte, "#FFFFFF", 0.55));
      if (regla) {
        s.addShape("roundRect", { x, y: by, w: bw, h: bh, rectRadius: 0.14, fill: { color: hex(tp.suave), transparency: 100 }, line: { color: hex(tp.fuerte), width: 2.5 } });
        const chipW = 2.1;
        s.addText("AQUÍ VIVE LA REGLA", { x: x + (bw - chipW) / 2, y: by - 0.36, w: chipW, h: 0.3, shape: "roundRect", rectRadius: 0.15, margin: 0, fill: { color: hex(tp.fuerte) }, line: { color: hex(tp.fuerte), width: 0 }, fontFace: FUENTE, fontSize: 9.5, bold: true, color: "FFFFFF", align: "center", valign: "middle", charSpacing: 1 });
      }
      const d = 0.5;
      insignia(s, p.icono, x + (bw - d) / 2, by + 0.1, d, regla ? "#FFFFFF" : tp.suave, tp.fuerte);
      texto(s, p.titulo, { x: x + 0.08, y: by + 0.64, w: bw - 0.16, h: 0.32 }, { tam: 14, negrita: true, fuente: TITULO, color: tp.fuerte, alinear: "center", vertical: "middle" });
      if (p.texto) texto(s, p.texto, { x: x + 0.1, y: by + 0.96, w: bw - 0.2, h: bh - 1.02 }, { tam: 11.5, color: color.texto, alinear: "center" });
      if (j < m - 1) {
        const ym = by + bh / 2;
        flecha(s, x + bw + 0.08, ym, x + bw + separa - 0.08, ym, tp.fuerte === colorDeTono("advertencia").fuerte ? colorDeTono(camino.tono).fuerte : tp.fuerte, 2.5);
        const etiqueta = camino.flechas[j];
        if (etiqueta) s.addText(etiqueta, { x: x + bw + 0.04, y: ym - 0.62, w: separa - 0.08, h: 0.56, margin: 0, fontFace: MONO, fontSize: tamQueCabe(etiqueta, separa - 0.12, 0.54, 11.5, 8), bold: true, color: hex(colorDeTono(camino.tono).fuerte), align: "center", valign: "bottom" });
      }
    });
  });
}

// ── Dos códigos ───────────────────────────────────────────────────────────

// La misma idea escrita de dos formas: cada lado con su encabezado, el
// código resaltado y, debajo, lo que implica.
function codigos(s: Slide, c: Caja, v: Extract<Visual, { tipo: "codigos" }>) {
  const gap = 0.5;
  const w = (c.w - gap) / 2;
  const hCab = 0.62;
  const hPunto = 0.4;
  const hPuntos = Math.max(...v.lados.map((l) => l.puntos.length)) * hPunto;
  const hCod = c.h - hCab - hPuntos - 0.3;
  v.lados.forEach((l, i) => {
    fijarPaso(i);
    const x = c.x + i * (w + gap);
    const t = colorDeTono(l.tono);
    tarjeta(s, { x, y: c.y, w, h: c.h });
    s.addShape("roundRect", { x, y: c.y, w, h: hCab, rectRadius: 0.14, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    s.addShape("rect", { x, y: c.y + hCab - 0.2, w, h: 0.2, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    insignia(s, l.icono, x + 0.16, c.y + 0.08, 0.46, "#FFFFFF", t.fuerte);
    texto(s, l.titulo, { x: x + 0.74, y: c.y, w: w - 0.9, h: hCab }, { tam: 16, negrita: true, fuente: TITULO, color: "#FFFFFF", vertical: "middle" });
    const lineas = l.codigo.split("\n");
    const largo = Math.max(...lineas.map((t) => t.length), 10);
    const tam = Math.max(8, Math.min(14, Math.floor(Math.min(((w - 0.6) * 72) / (0.6 * largo), ((hCod - 0.3) * 72) / (1.3 * lineas.length)) * 2) / 2));
    const tramos: { text: string; options: Record<string, unknown> }[] = [];
    lineas.forEach((linea, k) => {
      const partes = resaltar(linea, l.lenguaje);
      if (partes.length === 0) partes.push({ texto: " ", clase: "texto" });
      partes.forEach((p, j) => tramos.push({ text: p.texto, options: { color: hex(colorCodigo[p.clase]), italic: p.clase === "comentario", breakLine: j === partes.length - 1 && k < lineas.length - 1 } }));
    });
    s.addText(tramos as never, { x: x + 0.18, y: c.y + hCab + 0.15, w: w - 0.36, h: hCod, shape: "roundRect", rectRadius: 0.08, fill: { color: hex(color.codigoFondo) }, line: { color: hex(color.codigoFondo), width: 0 }, fontFace: MONO, fontSize: tam, valign: "middle", margin: 10, lineSpacingMultiple: 1.1 });
    const marca = l.tono === "neutro" ? "arrow-right" : "circle-check";
    l.puntos.forEach((pto, k) => {
      const y = c.y + hCab + 0.15 + hCod + 0.12 + k * hPunto;
      icono(s, marca, x + 0.24, y + (hPunto - 0.28) / 2, 0.28, t.fuerte);
      texto(s, pto, { x: x + 0.66, y, w: w - 0.85, h: hPunto }, { tam: 14, vertical: "middle" });
    });
  });
}

// ── Orígenes ──────────────────────────────────────────────────────────────

// Las fuentes a la izquierda llegan al centro, que con ese valor llega al
// destino. Abajo, lo que nunca lleva el valor.
function origenes(s: Slide, c: Caja, v: Extract<Visual, { tipo: "origenes" }>) {
  const hNota = 0.66;
  const hMain = c.h - hNota - 0.22;
  const F = v.fuentes.length;
  const wF = 3.75;
  const gF = 0.18;
  const hF = Math.min(1.15, (hMain - gF * (F - 1)) / F);
  const yF0 = c.y + (hMain - (hF * F + gF * (F - 1))) / 2;
  const xC = c.x + wF + 0.85;
  const wC = 3.55;
  const hC = Math.min(hMain, 2.45);
  const yC = c.y + (hMain - hC) / 2;
  const xD = xC + wC + 1.25;
  const wD = c.x + c.w - xD;
  const hD = 1.5;
  const yD = c.y + (hMain - hD) / 2;

  // El centro: dónde se usa el valor.
  const tc = colorDeTono(v.centro.tono ?? "marino");
  tarjeta(s, { x: xC, y: yC, w: wC, h: hC });
  s.addShape("roundRect", { x: xC, y: yC, w: wC, h: 0.62, rectRadius: 0.14, fill: { color: hex(tc.fuerte) }, line: { color: hex(tc.fuerte), width: 0 } });
  s.addShape("rect", { x: xC, y: yC + 0.42, w: wC, h: 0.2, fill: { color: hex(tc.fuerte) }, line: { color: hex(tc.fuerte), width: 0 } });
  icono(s, v.centro.icono, xC + 0.18, yC + 0.13, 0.36, "#FFFFFF");
  texto(s, v.centro.titulo, { x: xC + 0.66, y: yC + 0.05, w: wC - 0.8, h: 0.52 }, { tam: 15, negrita: true, fuente: TITULO, color: "#FFFFFF", vertical: "middle" });
  if (v.centro.texto) texto(s, v.centro.texto, { x: xC + 0.2, y: yC + 0.72, w: wC - 0.4, h: 0.5 }, { tam: 12, color: color.secundario });
  const yCod = yC + 1.26;
  s.addText(v.centro.valor, { x: xC + 0.18, y: yCod, w: wC - 0.36, h: yC + hC - yCod - 0.16, shape: "roundRect", rectRadius: 0.08, margin: 8, fill: { color: hex(color.codigoFondo) }, line: { color: hex(color.codigoFondo), width: 0 }, fontFace: MONO, fontSize: 11.5, color: hex(ACC), valign: "middle", fit: "shrink" });

  // Cada fuente, con su flecha al centro, en su clic.
  v.fuentes.forEach((f, i) => {
    fijarPaso(i + 1);
    const y = yF0 + i * (hF + gF);
    const t = colorDeTono(f.tono);
    tarjeta(s, { x: c.x, y, w: wF, h: hF });
    s.addShape("rect", { x: c.x, y: y + 0.1, w: 0.07, h: hF - 0.2, fill: { color: hex(t.fuerte) }, line: { color: hex(t.fuerte), width: 0 } });
    const d = 0.5;
    insignia(s, f.icono, c.x + 0.18, y + 0.1, d, t.suave, t.fuerte);
    texto(s, f.titulo, { x: c.x + 0.8, y: y + 0.06, w: wF - 0.9, h: 0.3 }, { tam: 13.5, negrita: true, fuente: TITULO, color: t.fuerte, vertical: "middle" });
    if (f.texto) texto(s, f.texto, { x: c.x + 0.8, y: y + 0.36, w: wF - 0.9, h: 0.26 }, { tam: 11, color: color.secundario });
    s.addText(f.valor, { x: c.x + 0.18, y: y + hF - 0.42, w: wF - 0.3, h: 0.32, shape: "roundRect", rectRadius: 0.06, margin: 4, fill: { color: hex(color.fondo) }, line: { color: hex(color.linea), width: 0.5 }, fontFace: MONO, fontSize: tamQueCabe(f.valor, wF - 0.45, 0.3, 11, 7.5), color: hex(color.texto), valign: "middle", fit: "shrink" });
    const destinoY = yC + hC * ((i + 1) / (F + 1));
    flecha(s, c.x + wF + 0.06, y + hF / 2, xC - 0.08, destinoY, t.fuerte, 2.25);
  });

  // El destino y la flecha que los une.
  fijarPaso(F + 1);
  const td = colorDeTono(v.destino.tono ?? "marino");
  s.addShape("can", { x: xD, y: yD, w: wD, h: hD, fill: { color: hex(td.suave) }, line: { color: hex(td.fuerte), width: 2 }, shadow: sombra() });
  texto(s, v.destino.titulo, { x: xD + 0.1, y: yD + hD * 0.32, w: wD - 0.2, h: 0.4 }, { tam: 15, negrita: true, fuente: MONO, color: td.fuerte, alinear: "center", vertical: "middle" });
  if (v.destino.texto) texto(s, v.destino.texto, { x: xD + 0.1, y: yD + hD * 0.32 + 0.4, w: wD - 0.2, h: 0.3 }, { tam: 12, color: color.secundario, alinear: "center" });
  const ym = yC + hC / 2;
  flecha(s, xC + wC + 0.08, ym, xD - 0.08, ym, td.fuerte, 2.5);
  texto(s, v.enlace, { x: xC + wC + 0.05, y: ym - 0.6, w: xD - xC - wC - 0.1, h: 0.52 }, { tam: 11.5, negrita: true, color: td.fuerte, alinear: "center", vertical: "bottom" });

  // Lo que nunca lleva el valor.
  fijarPaso(F + 2);
  const tn = colorDeTono(v.nota.tono ?? "error");
  const yN = c.y + c.h - hNota;
  tarjeta(s, { x: xC, y: yN, w: c.x + c.w - xC, h: hNota }, tn.suave, mezclar(tn.fuerte, "#FFFFFF", 0.5));
  insignia(s, v.nota.icono, xC + 0.16, yN + (hNota - 0.46) / 2, 0.46, "#FFFFFF", tn.fuerte);
  s.addText([{ text: `${v.nota.titulo}:  `, options: { bold: true, color: hex(tn.fuerte) } }, ...(v.nota.texto ? [{ text: v.nota.texto, options: { color: hex(color.texto) } }] : [])], { x: xC + 0.75, y: yN, w: c.x + c.w - xC - 0.9, h: hNota, margin: 0, fontFace: FUENTE, fontSize: tamQueCabe(`${v.nota.titulo}:  ${v.nota.texto ?? ""}`, c.x + c.w - xC - 0.95, hNota - 0.06, 13, 9), valign: "middle", fit: "shrink" });
}

export function dibujarVisual(s: Slide, v: Visual, c: Caja, lateral?: (caja: Caja) => void, iconoSeccion?: Icono) {
  fijarPaso(0);
  try {
    dibujarSegunTipo(s, v, c, lateral, iconoSeccion);
  } finally {
    fijarPaso(0);
  }
}

function dibujarSegunTipo(s: Slide, v: Visual, c: Caja, lateral?: (caja: Caja) => void, iconoSeccion?: Icono) {
  switch (v.tipo) {
    case "ruta": return ruta(s, c);
    case "equipo": return equipo(s, c, v);
    case "sistema": return sistema(s, c, v);
    case "mapeo": return mapeo(s, c, v);
    case "caminos": return caminos(s, c, v);
    case "codigos": return codigos(s, c, v);
    case "origenes": return origenes(s, c, v);
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

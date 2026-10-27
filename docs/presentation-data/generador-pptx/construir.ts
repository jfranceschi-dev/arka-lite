import PptxGenJS from "pptxgenjs";
import { laminas, etiquetaSeccion, secciones, type Lamina } from "../contenido/index.ts";
import { EQUIPO, participantePorId, participantes } from "../contenido/participantes.ts";
import { textoNotas } from "../contenido/notas.ts";
import type { BloqueCodigo, Certeza, Diapositiva, Recorrido, Tabla } from "../contenido/tipos.ts";
import { diagramaPorId } from "../diagramas/definiciones.ts";
import type { NombreIcono } from "../diseno/iconos.ts";
import { color } from "../diseno/tokens.ts";
import { colorCodigo, resaltar } from "../diseno/resaltado.ts";
import { ACC, ACC_S, ACC_T, CW, FUENTE, H, M, MONO, PRI, PROF, sombra, TITULO, W, encabezado, hex, icono, insignia, logo, mezclar, pie, type Slide } from "./base.ts";
import { diagrama } from "./diagrama.ts";
import { generarBuffer } from "./posproceso.ts";
import { tamQueCabe } from "./medidas.ts";
import { dibujarVisual, type Caja } from "./visuales.ts";

// Genera el PPTX desde la fuente de contenido. Todo es editable: textos,
// tablas, diagramas e íconos son formas nativas; solo las capturas de pantalla
// son imágenes. Las plantillas siguen el lienzo de diseño: portada oscura,
// portadas de sección con su ícono, láminas de una idea con tarjetas e íconos,
// láminas de impacto (cifras, flujos, capturas) y diagramas paso a paso.

export function nombreArchivo(recorrido: Recorrido): string {
  return `ARKA-Lite-${recorrido === "ejecutivo" ? "ejecutivo" : "tecnico"}.pptx`;
}

// Cuántas diapositivas de pasos se generan por diagrama en cada recorrido.
const MAX_GRUPOS: Record<Recorrido, number> = { ejecutivo: 3, tecnico: 5 };

export function agruparPasos(total: number, maximo: number): [number, number][] {
  const grupos = Math.min(total, maximo);
  const salida: [number, number][] = [];
  let inicio = 0;
  for (let g = 0; g < grupos; g++) {
    const tam = Math.ceil((total - inicio) / (grupos - g));
    salida.push([inicio, inicio + tam - 1]);
    inicio += tam;
  }
  return salida;
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

function portadaGeneral(pptx: PptxGenJS, l: Lamina, recorrido: Recorrido) {
  const s = pptx.addSlide();
  s.background = { color: hex(PROF) };
  s.addShape("ellipse", { x: 8.3, y: -1.9, w: 7.2, h: 7.2, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 } });
  s.addShape("ellipse", { x: 10.9, y: 4.6, w: 3.4, h: 3.4, fill: { color: hex(mezclar(PRI, ACC, 0.18)) }, line: { color: hex(PRI), width: 0 } });
  s.addShape("rect", { x: 0, y: 0, w: 0.12, h: H, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  logo(s, 0.83, 0.58, true);
  s.addText("PROYECTO FINAL · UPSKILLING BACKEND JAVA", { x: 0.83, y: 2.0, w: 7, h: 0.3, margin: 0, fontFace: FUENTE, fontSize: 12, bold: true, color: hex(ACC), charSpacing: 3 });
  // El título va partido en dos líneas para que nunca alcance al subtítulo.
  const titulo = (l.diapositiva?.titulo ?? "ARKA-Lite").replace(/^Del endpoint /, "Del endpoint\n");
  s.addText(titulo, { x: 0.83, y: 2.38, w: 7.2, h: 1.95, margin: 0, fontFace: TITULO, fontSize: 54, bold: true, color: "FFFFFF", valign: "top", lineSpacingMultiple: 0.95, fit: "shrink" });
  s.addText((l.diapositiva?.visible ?? []).join(" "), { x: 0.83, y: 4.5, w: 6.8, h: 0.9, margin: 0, fontFace: FUENTE, fontSize: 18, color: hex(color.sobreOscuroSecundario), valign: "top" });
  // Las siete personas del equipo, en fila, con el color de su área.
  const tonoPerfil = { Desarrollo: "#3B74C4", DevOps: "#1F9A6E", "Base de datos": "#7A63E0" } as const;
  participantes.forEach((p, i) => {
    s.addText(p.id.toUpperCase(), { x: 0.83 + i * 0.44, y: 5.78, w: 0.38, h: 0.38, shape: "ellipse", margin: 0, fill: { color: hex(tonoPerfil[p.perfil]) }, line: { color: hex(PROF), width: 1.5 }, fontFace: FUENTE, fontSize: 8.5, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  });
  s.addText(`${EQUIPO} · ${recorrido === "ejecutivo" ? "Recorrido ejecutivo" : "Recorrido técnico"}`, { x: 0.83, y: 6.45, w: 10, h: 0.3, margin: 0, fontFace: FUENTE, fontSize: 11.5, color: hex(color.sobreOscuroSecundario) });

  // Mini arquitectura: UI → dos servicios → dos bases, con sus íconos.
  const linea = (x: number, y: number, w: number, h: number) => s.addShape("line", { x, y, w, h, line: { color: "5D7598", width: 1.75 } });
  linea(10.62, 2.31, 0, 0.58);
  linea(9.68, 2.89, 1.9, 0);
  linea(9.68, 2.89, 0, 0.38);
  linea(11.58, 2.89, 0, 0.38);
  linea(9.68, 4.02, 0, 0.62);
  linea(11.58, 4.02, 0, 0.62);
  const caja = (t: string, ic: NombreIcono, x: number, y: number, fondo: string, texto: string) => {
    s.addShape("roundRect", { x, y, w: 1.67, h: 0.75, rectRadius: 0.14, fill: { color: hex(fondo) }, line: { color: hex(fondo), width: 0 }, shadow: { type: "outer", blur: 10, offset: 3, angle: 90, color: "000000", opacity: 0.3 } });
    icono(s, ic, x + 0.14, y + 0.24, 0.27, texto);
    s.addText(t, { x: x + 0.46, y, w: 1.18, h: 0.75, margin: 0, fontFace: TITULO, fontSize: 12, bold: true, color: hex(texto), valign: "middle", fit: "shrink" });
  };
  caja("UI", "monitor", 9.79, 1.56, ACC, PROF);
  caja("Solicitudes", "clipboard-list", 8.85, 3.27, "#FFFFFF", PROF);
  caja("Notificaciones", "bell", 10.75, 3.27, "#FFFFFF", PROF);
  const base = (x: number) => {
    s.addShape("roundRect", { x, y: 4.64, w: 1.25, h: 0.62, rectRadius: 0.3, fill: { color: hex(PROF) }, line: { color: "9FB4D2", width: 1.5 } });
    icono(s, "database", x + 0.14, 4.8, 0.3, "9FB4D2");
    s.addText("PostgreSQL", { x: x + 0.44, y: 4.64, w: 0.78, h: 0.62, margin: 0, fontFace: FUENTE, fontSize: 9.5, bold: true, color: "FFFFFF", valign: "middle", fit: "shrink" });
  };
  base(9.06);
  base(10.96);
  s.addNotes(textoNotas(l));
}

function portadaSeccion(pptx: PptxGenJS, l: Lamina) {
  const sec = l.seccion;
  const s = pptx.addSlide();
  s.background = { color: hex(PRI) };
  const total = secciones.filter((x) => x.numero !== null).length;
  // Ícono grande de la parte, dentro de dos anillos.
  s.addShape("ellipse", { x: 8.75, y: 0.75, w: 3.9, h: 3.9, fill: { color: hex(mezclar(PRI, "#FFFFFF", 0.06)) }, line: { color: hex(mezclar(PRI, ACC, 0.35)), width: 1.5 } });
  s.addShape("ellipse", { x: 9.35, y: 1.35, w: 2.7, h: 2.7, fill: { color: hex(mezclar(PRI, ACC, 0.16)) }, line: { color: hex(mezclar(PRI, ACC, 0.5)), width: 1 } });
  if (sec.icono) icono(s, sec.icono, 9.95, 1.95, 1.5, ACC, 1.5);
  s.addText(`PARTE ${sec.numero} DE ${total}`, { x: 0.83, y: 0.62, w: 5, h: 0.3, margin: 0, fontFace: FUENTE, fontSize: 12, bold: true, color: hex(ACC), charSpacing: 3 });
  // Avance: un segmento por parte, encendido hasta la actual.
  for (let i = 1; i <= total; i++) {
    s.addShape("roundRect", { x: 0.83 + (i - 1) * 0.42, y: 1.02, w: 0.34, h: 0.08, rectRadius: 0.04, fill: { color: hex(i <= (sec.numero ?? 0) ? ACC : mezclar(PRI, "#FFFFFF", 0.18)) }, line: { color: hex(PRI), width: 0 } });
  }
  s.addText(String(sec.numero).padStart(2, "0"), { x: 0.62, y: 1.05, w: 5, h: 2.1, margin: 0, fontFace: TITULO, fontSize: 140, bold: true, color: hex(mezclar(PRI, "#FFFFFF", 0.13)) });
  s.addText(sec.titulo, { x: 0.83, y: 3.05, w: 7.9, h: 0.9, margin: 0, fontFace: TITULO, fontSize: 44, bold: true, color: "FFFFFF", fit: "shrink" });
  if (sec.subtitulo) s.addText(sec.subtitulo, { x: 0.83, y: 3.95, w: 7.8, h: 0.95, margin: 0, fontFace: FUENTE, fontSize: 19, color: hex(color.sobreOscuroSecundario), valign: "top", fit: "shrink" });
  let x = 0.83;
  let y = 5.1;
  for (const t of sec.temas ?? []) {
    const ancho = 0.5 + t.length * 0.105;
    if (x + ancho > W - M) { x = 0.83; y += 0.55; }
    s.addText(t, { x, y, w: ancho, h: 0.42, shape: "roundRect", rectRadius: 0.21, fill: { color: hex(mezclar(PRI, "#FFFFFF", 0.13)) }, line: { color: hex(mezclar(PRI, "#FFFFFF", 0.13)), width: 0 }, fontFace: FUENTE, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 2 });
    x += ancho + 0.14;
  }
  const p = participantePorId(sec.participante);
  s.addText(p.id.toUpperCase(), { x: 0.83, y: 6.5, w: 0.4, h: 0.4, shape: "ellipse", margin: 0, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 }, fontFace: FUENTE, fontSize: 10, bold: true, color: hex(PROF), align: "center", valign: "middle" });
  s.addText(`Presenta ${p.nombre} · ${p.perfil}`, { x: 1.35, y: 6.5, w: 6, h: 0.4, margin: 0, valign: "middle", fontFace: FUENTE, fontSize: 13, color: hex(color.sobreOscuroSecundario) });
  s.addNotes(textoNotas(l));
}

function cierreFinal(pptx: PptxGenJS, l: Lamina) {
  const s = pptx.addSlide();
  s.background = { color: hex(PROF) };
  s.addShape("ellipse", { x: 8.9, y: -1.4, w: 6.2, h: 6.2, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 } });
  s.addShape("rect", { x: 0, y: 0, w: 0.12, h: H, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  icono(s, "sparkles", 10.6, 0.9, 1.9, ACC, 1.25);
  logo(s, 0.83, 0.58, true);
  s.addText(l.diapositiva?.titulo ?? "Gracias", { x: 0.83, y: 2.3, w: 9, h: 1.4, margin: 0, fontFace: TITULO, fontSize: 72, bold: true, color: "FFFFFF" });
  s.addText((l.diapositiva?.visible ?? []).join("\n"), { x: 0.83, y: 3.8, w: 9, h: 1.2, margin: 0, fontFace: FUENTE, fontSize: 22, color: hex(color.sobreOscuroSecundario), valign: "top" });
  const tonoPerfil = { Desarrollo: "#3B74C4", DevOps: "#1F9A6E", "Base de datos": "#7A63E0" } as const;
  participantes.forEach((p, i) => {
    const x = 0.83 + i * 0.86;
    s.addText(p.id.toUpperCase(), { x, y: 5.55, w: 0.66, h: 0.66, shape: "ellipse", margin: 0, fill: { color: hex(tonoPerfil[p.perfil]) }, line: { color: "FFFFFF", width: 2 }, fontFace: TITULO, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    s.addText(p.perfil === "Base de datos" ? "BD" : p.perfil, { x: x - 0.12, y: 6.26, w: 0.9, h: 0.24, margin: 0, fontFace: FUENTE, fontSize: 8.5, color: hex(color.sobreOscuroSecundario), align: "center" });
  });
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

function laminaVisual(s: Slide, d: Diapositiva, abajo: number) {
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
  dibujarVisual(s, v, { x: M, y: arriba, w: CW, h: fondo - arriba }, capturaSola ? (c) => columnaCaptura(s, d, c) : undefined);
}

function contenido(pptx: PptxGenJS, l: Lamina, recorrido: Recorrido) {
  const d = l.diapositiva;
  if (!d) return;
  const s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  encabezado(s, etiquetaSeccion(l.seccion), d.titulo);
  const conCodigo = recorrido === "tecnico" && !!d.codigo;
  const conPorque = !!d.porque && (!d.diagrama || !!d.visual) && (!d.tabla || !!d.visual);
  const baseAbajo = conPorque ? H - 1.12 : H - 0.55;
  const abajo = d.marcas?.length ? baseAbajo - 0.45 : baseAbajo;
  const fig = d.diagrama ? diagramaPorId(d.diagrama) : null;

  if (d.visual) {
    laminaVisual(s, d, abajo);
  } else if (fig) {
    chips(s, d.visible, 1.42);
    diagrama(s, fig, { x: M, y: 1.98, w: CW, h: abajo - 2.0 }, { paso: null });
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
  // propia lámina.
  if (conCodigo && d.codigo && (fig || d.tabla || d.visual)) {
    const sc = pptx.addSlide();
    sc.background = { color: "FFFFFF" };
    encabezado(sc, etiquetaSeccion(l.seccion), `${d.titulo} · el código`);
    codigo(sc, d.codigo, { x: M, y: 1.5, w: CW, h: H - 2.15 });
    pie(sc, `ARKA-Lite · ${etiquetaSeccion(l.seccion)}`);
    sc.addNotes(`QUÉ HACER (no se dice)\nMostrar el archivo ${d.codigo.archivo} y leer solo las líneas que se mencionan en el texto de la lámina anterior.`);
  }

  if (fig) {
    const grupos = d.pasoEstatico !== undefined ? [[d.pasoEstatico, d.pasoEstatico] as [number, number]] : agruparPasos(fig.pasos.length, MAX_GRUPOS[recorrido]);
    grupos.forEach(([a, b], g) => {
      const sp = pptx.addSlide();
      sp.background = { color: "FFFFFF" };
      encabezado(sp, `${etiquetaSeccion(l.seccion)} · paso a paso ${g + 1} de ${grupos.length}`, fig.titulo);
      diagrama(sp, fig, { x: M, y: 1.42, w: CW, h: 4.32 }, { paso: a, rango: [a, b] });
      const pasos = fig.pasos.slice(a, b + 1);
      const gap = 0.14;
      const ancho = (CW - gap * (pasos.length - 1)) / pasos.length;
      pasos.forEach((p, i) => {
        const x = M + i * (ancho + gap);
        sp.addShape("roundRect", { x, y: 5.88, w: ancho, h: 1.0, rectRadius: 0.1, fill: { color: hex(ACC_S) }, line: { color: hex(ACC), width: 1 }, shadow: sombra() });
        sp.addText(String(a + i + 1), { x: x + 0.15, y: 6.13, w: 0.46, h: 0.46, shape: "ellipse", margin: 0, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 }, fontFace: TITULO, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
        sp.addText(p.texto, { x: x + 0.72, y: 5.92, w: ancho - 0.85, h: 0.92, margin: 0, fontFace: FUENTE, fontSize: tamQueCabe(p.texto, ancho - 0.9, 0.9, 13, 8), color: hex(color.texto), valign: "middle", fit: "shrink" });
      });
      pie(sp, `ARKA-Lite · ${etiquetaSeccion(l.seccion)}`);
      sp.addNotes(["QUÉ DECIR", ...pasos.map((p, i) => `Paso ${a + i + 1}: “${p.texto}”`), "QUÉ HACER (no se dice)", "Señalar la flecha con el mismo número y lo que aparece resaltado en cian."].join("\n"));
    });
  }
}

export function construirPresentacion(recorrido: Recorrido): PptxGenJS {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = EQUIPO;
  pptx.company = "ARKA-Lite";
  pptx.title = `ARKA-Lite · Recorrido ${recorrido === "ejecutivo" ? "ejecutivo" : "técnico"}`;
  pptx.subject = "Proyecto final de Upskilling Backend Java";
  pptx.theme = { headFontFace: TITULO, bodyFontFace: FUENTE };
  for (const l of laminas(recorrido)) {
    if (l.id === "s00-portada") portadaGeneral(pptx, l, recorrido);
    else if (l.id === "s08-gracias") cierreFinal(pptx, l);
    else if (!l.diapositiva) portadaSeccion(pptx, l);
    else contenido(pptx, l, recorrido);
  }
  return pptx;
}

// El archivo final: la presentación con el posproceso de los íconos.
export function generarPptx(recorrido: Recorrido): Promise<Buffer> {
  return generarBuffer(construirPresentacion(recorrido));
}

import type PptxGenJS from "pptxgenjs";
import type { NombreIcono } from "../diseno/iconos.ts";
import { color, tipografia, tono as tonos } from "../diseno/tokens.ts";
import { segmentosDeIcono } from "../diseno/trazos.ts";
import type { Tono } from "../contenido/tipos.ts";

// Medidas, colores y piezas que comparten todas las plantillas del PPTX.

export type Slide = PptxGenJS.Slide;
export const W = 13.333;
export const H = 7.5;
export const M = 0.67;
export const CW = W - 2 * M;
export const FUENTE = tipografia.pptx;
export const TITULO = tipografia.pptxTitulo;
export const MONO = tipografia.pptxMono;
export const hex = (c: string) => c.replace("#", "").toUpperCase();

// Plantilla TGS: marino profundo, marino y cian.
export const PROF = color.marino;
export const PRI = color.franja;
export const ACC = color.cian;
export const ACC_T = color.cianTexto;
export const ACC_S = color.cianSuave;

export function mezclar(a: string, b: string, t: number): string {
  const rgb = (h: string) => [0, 2, 4].map((i) => parseInt(h.replace("#", "").slice(i, i + 2), 16));
  const [x, y] = [rgb(a), rgb(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

export function colorDeTono(t: Tono | undefined) {
  return tonos[t ?? "marino"];
}

// Sombras: una suave para separar tarjetas del fondo y un halo cian para lo
// que está activo en un paso. Son funciones porque pptxgenjs modifica el
// objeto que recibe: compartirlo entre formas multiplica sus valores.
export const sombra = (): PptxGenJS.ShadowProps => ({ type: "outer", blur: 6, offset: 1.5, angle: 90, color: "0B1F3A", opacity: 0.14 });
export const halo = (): PptxGenJS.ShadowProps => ({ type: "outer", blur: 9, offset: 0, angle: 0, color: hex(ACC), opacity: 0.6 });

// Ícono vectorial nativo: una sola forma, solo trazo, en la caja indicada.
// Los nombres empiezan con "Icono" para que el posproceso redondee las puntas.
export function icono(s: Slide, nombre: NombreIcono, x: number, y: number, tam: number, colorTrazo: string, grosor = 2) {
  const e = tam / 24;
  const puntos = segmentosDeIcono(nombre).map((g): NonNullable<PptxGenJS.ShapeProps["points"]>[number] => {
    if (g.tipo === "M") return { x: g.x * e, y: g.y * e, moveTo: true };
    if (g.tipo === "L") return { x: g.x * e, y: g.y * e };
    if (g.tipo === "C") return { x: g.x * e, y: g.y * e, curve: { type: "cubic", x1: g.x1 * e, y1: g.y1 * e, x2: g.x2 * e, y2: g.y2 * e } };
    return { close: true };
  });
  // pptxgenjs dibuja custGeom, pero sus tipos no lo incluyen entre las formas.
  s.addShape("custGeom" as PptxGenJS.SHAPE_NAME, { x, y, w: tam, h: tam, points: puntos, line: { color: hex(colorTrazo), width: Math.max(0.75, (tam * 72 * grosor) / 24) }, objectName: `Icono ${nombre}` });
}

// Ícono dentro de un círculo de color.
export function insignia(s: Slide, nombre: NombreIcono, x: number, y: number, d: number, fondo: string, trazo: string, conSombra = false) {
  s.addShape("ellipse", { x, y, w: d, h: d, fill: { color: hex(fondo) }, line: { color: hex(fondo), width: 0 }, shadow: conSombra ? sombra() : undefined });
  const t = d * 0.52;
  icono(s, nombre, x + (d - t) / 2, y + (d - t) / 2, t, trazo);
}

export function pie(s: Slide, texto: string, oscuro = false) {
  const c = oscuro ? hex(color.sobreOscuroSecundario) : "9AA5B8";
  s.addText(texto.toUpperCase(), { x: M, y: H - 0.38, w: 8, h: 0.22, margin: 0, fontFace: FUENTE, fontSize: 8, bold: true, color: c, charSpacing: 1.2 });
  s.slideNumber = { x: W - M - 0.8, y: H - 0.38, w: 0.8, h: 0.22, fontFace: FUENTE, fontSize: 8, color: c, align: "right" };
}

export function encabezado(s: Slide, sobretitulo: string, titulo: string) {
  s.addShape("rect", { x: 0, y: 0, w: W, h: 0.08, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  s.addText(sobretitulo.toUpperCase(), { x: M, y: 0.4, w: CW, h: 0.26, margin: 0, fontFace: FUENTE, fontSize: 10.5, bold: true, color: hex(ACC_T), charSpacing: 2.5 });
  s.addText(titulo, { x: M, y: 0.66, w: CW, h: 0.62, margin: 0, fontFace: TITULO, fontSize: 28, bold: true, color: hex(color.texto), fit: "shrink" });
}

export function logo(s: Slide, x: number, y: number, oscuro: boolean) {
  s.addShape("ellipse", { x, y, w: 0.36, h: 0.36, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  s.addText("A", { x, y, w: 0.36, h: 0.36, margin: 0, align: "center", valign: "middle", fontFace: TITULO, fontSize: 13, bold: true, color: hex(PROF) });
  s.addText("ARKA-Lite", { x: x + 0.46, y, w: 2.2, h: 0.36, margin: 0, valign: "middle", fontFace: TITULO, fontSize: 15, bold: true, color: oscuro ? "FFFFFF" : hex(color.texto) });
}

// Flecha horizontal o vertical simple entre dos puntos.
export function flecha(s: Slide, x1: number, y1: number, x2: number, y2: number, c: string, ancho = 2, guion?: "dash" | "sysDot") {
  s.addShape("line", {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1,
    line: { color: hex(c), width: ancho, endArrowType: "triangle", dashType: guion },
  });
}

// ── Pasos por clic ──────────────────────────────────────────────────────────
// Lo que se dibuja dentro de conPaso(n, …) aparece en el clic n de la lámina;
// el paso 0 ya está visible al llegar. Cada forma lleva la marca "[pN]" en
// su nombre y el posproceso arma con ellas la secuencia de clics.
let pasoActual = 0;

export function conPaso<T>(n: number, dibujar: () => T): T {
  const antes = pasoActual;
  pasoActual = n;
  try {
    return dibujar();
  } finally {
    pasoActual = antes;
  }
}

export const marcaDePaso = (n: number) => `[p${n}] `;

// Hace que las formas de la lámina lleven la marca del paso actual.
export function marcarPasos(s: Slide) {
  const marcar = <T extends { objectName?: string }>(o: T | undefined): T | undefined =>
    pasoActual > 0 ? ({ ...(o ?? {}), objectName: `${marcaDePaso(pasoActual)}${o?.objectName ?? "Forma"}` } as T) : o;
  const forma = s.addShape.bind(s);
  const texto = s.addText.bind(s);
  const imagen = s.addImage.bind(s);
  s.addShape = ((tipo, o) => forma(tipo, marcar(o)!)) as typeof s.addShape;
  s.addText = ((t, o) => texto(t, marcar(o))) as typeof s.addText;
  s.addImage = ((o) => imagen(marcar(o)!)) as typeof s.addImage;
}

// Versión sin bloque: fija el paso para lo que se dibuje a continuación.
// dibujarVisual vuelve al paso 0 al terminar cada visual.
export function fijarPaso(n: number) {
  pasoActual = n;
}

import PptxGenJS from "pptxgenjs";
import { laminas, etiquetaSeccion, secciones, type Lamina } from "../contenido/index.ts";
import { EQUIPO, participantePorId } from "../contenido/participantes.ts";
import { textoNotas } from "../contenido/notas.ts";
import type { BloqueCodigo, Certeza, Diapositiva, Recorrido, Tabla } from "../contenido/tipos.ts";
import { diagramaPorId } from "../diagramas/definiciones.ts";
import { estadoEnPaso, numeroDePaso, posicionEtiqueta, posicionNumero, rutaArista, type EstadoElemento } from "../diagramas/geometria.ts";
import type { Diagrama, Paso } from "../diagramas/tipos.ts";
import { color, tipografia, trazo, type TipoTrazo } from "../diseno/tokens.ts";
import { colorCodigo, resaltar } from "../diseno/resaltado.ts";

// Genera el PPTX desde la fuente de contenido. Todo es editable: textos,
// tablas y diagramas son formas nativas. Las plantillas siguen el lienzo de
// diseño: portada oscura, portadas de sección a todo color, láminas de una
// idea con tarjetas numeradas y diagramas que avanzan paso a paso.

type Slide = PptxGenJS.Slide;
const W = 13.333;
const H = 7.5;
const M = 0.67;
const CW = W - 2 * M;
const FUENTE = tipografia.pptx;
const TITULO = tipografia.pptxTitulo;
const MONO = tipografia.pptxMono;
const hex = (c: string) => c.replace("#", "").toUpperCase();

// Plantilla TGS: marino profundo, marino y cian.
const PROF = color.marino;
const PRI = color.franja;
const ACC = color.cian;
const ACC_T = color.cianTexto;
const ACC_S = color.cianSuave;

function mezclar(a: string, b: string, t: number): string {
  const rgb = (h: string) => [0, 2, 4].map((i) => parseInt(h.replace("#", "").slice(i, i + 2), 16));
  const [x, y] = [rgb(a), rgb(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

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

function pie(s: Slide, texto: string, oscuro = false) {
  const c = oscuro ? hex(color.sobreOscuroSecundario) : "9AA5B8";
  s.addText(texto.toUpperCase(), { x: M, y: H - 0.38, w: 8, h: 0.22, margin: 0, fontFace: FUENTE, fontSize: 8, bold: true, color: c, charSpacing: 1.2 });
  s.slideNumber = { x: W - M - 0.8, y: H - 0.38, w: 0.8, h: 0.22, fontFace: FUENTE, fontSize: 8, color: c, align: "right" };
}

function encabezado(s: Slide, sobretitulo: string, titulo: string) {
  s.addShape("rect", { x: 0, y: 0, w: W, h: 0.08, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  s.addText(sobretitulo.toUpperCase(), { x: M, y: 0.4, w: CW, h: 0.26, margin: 0, fontFace: FUENTE, fontSize: 10.5, bold: true, color: hex(ACC_T), charSpacing: 2.5 });
  s.addText(titulo, { x: M, y: 0.66, w: CW, h: 0.62, margin: 0, fontFace: TITULO, fontSize: 28, bold: true, color: hex(color.texto), fit: "shrink" });
}

function logo(s: Slide, x: number, y: number, oscuro: boolean) {
  s.addShape("ellipse", { x, y, w: 0.36, h: 0.36, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  s.addText("A", { x, y, w: 0.36, h: 0.36, margin: 0, align: "center", valign: "middle", fontFace: TITULO, fontSize: 13, bold: true, color: hex(PROF) });
  s.addText("ARKA-Lite", { x: x + 0.46, y, w: 2.2, h: 0.36, margin: 0, valign: "middle", fontFace: TITULO, fontSize: 15, bold: true, color: oscuro ? "FFFFFF" : hex(color.texto) });
}

// Fila de chips con las frases visibles de una lámina de diagrama o tabla.
function chips(s: Slide, lineas: string[], y: number) {
  if (!lineas.length) return;
  const gap = 0.14;
  const ancho = (CW - gap * (lineas.length - 1)) / lineas.length;
  lineas.forEach((t, i) => {
    s.addText(t, { x: M + i * (ancho + gap), y, w: ancho, h: 0.46, shape: "roundRect", rectRadius: 0.08, margin: [2, 8, 2, 8], fill: { color: hex(color.fondo) }, line: { color: hex(color.linea), width: 0.75 }, fontFace: FUENTE, fontSize: 11, color: hex(color.texto), valign: "middle", fit: "shrink" });
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
  return Math.max(7.5, Math.min(14, Math.floor(Math.min(porAncho, porAlto) * 2) / 2));
}

function codigo(s: Slide, b: BloqueCodigo, caja: { x: number; y: number; w: number; h: number }) {
  s.addText(b.archivo, { x: caja.x, y: caja.y, w: caja.w, h: 0.25, margin: 0, fontFace: MONO, fontSize: 9, color: hex(ACC_T) });
  const tam = tamanoCodigo(b, caja.w, caja.h - 0.3);
  const tramos: PptxGenJS.TextProps[] = [];
  const lineas = b.texto.split("\n");
  lineas.forEach((linea, i) => {
    const partes = resaltar(linea, b.lenguaje);
    if (partes.length === 0) partes.push({ texto: " ", clase: "texto" });
    partes.forEach((p, j) => tramos.push({ text: p.texto, options: { color: hex(colorCodigo[p.clase]), italic: p.clase === "comentario", breakLine: j === partes.length - 1 && i < lineas.length - 1 } }));
  });
  s.addText(tramos, { x: caja.x, y: caja.y + 0.3, w: caja.w, h: caja.h - 0.3, shape: "roundRect", rectRadius: 0.1, fill: { color: hex(color.codigoFondo) }, line: { color: hex(color.codigoFondo), width: 0 }, fontFace: MONO, fontSize: tam, valign: "top", margin: 12, lineSpacingMultiple: 1.1 });
}

function tabla(s: Slide, t: Tabla, caja: { x: number; y: number; w: number; h: number }) {
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
  s.addTable(filas, { x: caja.x, y: caja.y, w: caja.w, colW: anchos, fontFace: FUENTE, fontSize: tam, valign: "middle", margin: [5, 8, 5, 8], border: { type: "solid", color: hex(color.linea), pt: 0.75 }, autoPage: false });
}

// ── Diagramas ─────────────────────────────────────────────────────────────

interface Resalte {
  paso: number | null;
  rango?: [number, number];
}

function estadoResalte(pasos: Paso[], r: Resalte, id: string, campo: "nodos" | "aristas" | "zonas"): EstadoElemento {
  if (r.paso === null && !r.rango) return "pasado";
  const [a, b] = r.rango ?? [r.paso ?? 0, r.paso ?? 0];
  const lista = (p: Paso) => (campo === "zonas" ? p.zonas ?? [] : p[campo]);
  for (let i = a; i <= b; i++) if (lista(pasos[i]).includes(id)) return "actual";
  return estadoEnPaso(pasos, a, id, campo) === "pasado" ? "pasado" : "futuro";
}

const guiones: Partial<Record<TipoTrazo, "dash" | "sysDot" | "sysDash" | "lgDash">> = { posterior: "dash", interno: "sysDot", error: "sysDash", dependencia: "lgDash" };

function diagrama(s: Slide, d: Diagrama, caja: { x: number; y: number; w: number; h: number }, r: Resalte) {
  const e = Math.min(caja.w / d.ancho, caja.h / d.alto);
  const ox = caja.x + (caja.w - d.ancho * e) / 2;
  const oy = caja.y + (caja.h - d.alto * e) / 2;
  const X = (px: number) => ox + px * e;
  const Y = (py: number) => oy + py * e;
  const pt = (px: number) => Math.max(8, Math.round(px * e * 72 * 2) / 2);

  for (const z of d.zonas ?? []) {
    const est = estadoResalte(d.pasos, r, z.id, "zonas");
    s.addShape("roundRect", { x: X(z.x), y: Y(z.y), w: z.w * e, h: z.h * e, rectRadius: 0.12, fill: { color: hex(est === "actual" ? ACC_S : color.fondo) }, line: { color: hex(est === "actual" ? ACC : color.linea), width: 1, dashType: z.punteada ? "dash" : "solid" } });
    s.addText(z.etiqueta, { x: X(z.x + 12), y: Y(z.y + 6), w: Math.min(z.w * e - 0.2, 6), h: 0.22, margin: 0, fontFace: FUENTE, fontSize: Math.max(8, pt(11)), bold: true, color: hex(est === "actual" ? ACC_T : color.secundario), charSpacing: 1 });
  }

  for (const a of d.aristas) {
    const est = estadoResalte(d.pasos, r, a.id, "aristas");
    const t = trazo[a.tipo];
    const c = est === "actual" ? ACC : est === "futuro" ? "#C7D2E2" : t.color;
    const ruta = rutaArista(d, a);
    for (let i = 0; i < ruta.length - 1; i++) {
      const [x1, y1] = ruta[i];
      const [x2, y2] = ruta[i + 1];
      const ultimo = i === ruta.length - 2;
      s.addShape("line", {
        x: X(Math.min(x1, x2)), y: Y(Math.min(y1, y2)), w: Math.abs(x2 - x1) * e, h: Math.abs(y2 - y1) * e,
        flipH: x2 < x1, flipV: y2 < y1,
        line: { color: hex(c), width: est === "actual" ? t.ancho + 1 : t.ancho, dashType: guiones[a.tipo] ?? "solid", endArrowType: ultimo && t.punta !== "ninguna" ? (t.punta === "llena" ? "triangle" : "arrow") : undefined },
      });
    }
    if (a.etiqueta) {
      const p = posicionEtiqueta(ruta, a.lado);
      const ancho = 0.14 + a.etiqueta.length * pt(12) * 0.0085;
      const x = p.ancla === "middle" ? X(p.x) - ancho / 2 : p.ancla === "end" ? X(p.x) - ancho : X(p.x);
      s.addText(a.etiqueta, { x, y: Y(p.y) - 0.17, w: ancho, h: 0.21, margin: 0, align: p.ancla === "middle" ? "center" : p.ancla === "end" ? "right" : "left", fontFace: FUENTE, fontSize: pt(12), bold: true, color: hex(est === "futuro" ? color.secundario : c) });
    }
    const n = numeroDePaso(d, a.id);
    if (n !== null && ruta.length > 1) {
      const [nx, ny] = posicionNumero(ruta);
      const rr = Math.max(0.12, 12 * e);
      s.addText(String(n), { x: X(nx) - rr, y: Y(ny) - rr, w: 2 * rr, h: 2 * rr, shape: "ellipse", margin: 0, align: "center", valign: "middle", fontFace: FUENTE, fontSize: Math.max(8, pt(12)), bold: true, color: est === "futuro" ? hex(c) : "FFFFFF", fill: { color: est === "futuro" ? "FFFFFF" : hex(c) }, line: { color: hex(c), width: 1 } });
    }
  }

  for (const n of d.nodos) {
    const est = estadoResalte(d.pasos, r, n.id, "nodos");
    const tipo = n.tipo ?? "componente";
    const actual = est === "actual";
    const fondo = tipo === "memoria" ? color.advertenciaSuave : actual ? ACC_S : tipo === "datos" ? "#EEF3FA" : tipo === "infra" ? color.fondo : "#FFFFFF";
    const borde = actual ? ACC : tipo === "memoria" ? color.advertencia : tipo === "pendiente" ? color.secundario : est === "pasado" ? PRI : "#C7D2E2";
    const textoColor = tipo === "pendiente" || est === "futuro" ? color.secundario : tipo === "memoria" ? "#5C3404" : color.texto;
    const tramos: PptxGenJS.TextProps[] = [];
    if (tipo === "contrato") tramos.push({ text: "«interfaz»", options: { italic: true, fontSize: pt(10.5), color: hex(color.secundario), breakLine: true } });
    tramos.push({ text: n.titulo, options: { bold: true, fontSize: pt(15), color: hex(textoColor), breakLine: !!n.subtitulo } });
    if (n.subtitulo) tramos.push({ text: n.subtitulo, options: { fontSize: pt(12), color: hex(color.secundario) } });
    // rectRadius solo existe en roundRect: aplicarlo a un rombo deja un PPTX
    // que PowerPoint no puede abrir.
    const forma = tipo === "decision" ? { shape: "diamond" as const } : { shape: "roundRect" as const, rectRadius: tipo === "persona" ? (n.h * e) / 2 : 0.1 };
    s.addText(tramos, {
      x: X(n.x), y: Y(n.y), w: n.w * e, h: n.h * e, ...forma,
      fill: { color: hex(tipo === "decision" ? (actual ? ACC : ACC_S) : fondo) },
      line: { color: hex(borde), width: actual ? 2.5 : 1.25, dashType: tipo === "memoria" || tipo === "pendiente" || tipo === "contrato" ? "dash" : "solid" },
      fontFace: FUENTE, align: "center", valign: "middle", margin: 3, fit: "shrink",
    });
  }
}

// ── Plantillas ────────────────────────────────────────────────────────────

function portadaGeneral(pptx: PptxGenJS, l: Lamina, recorrido: Recorrido) {
  const s = pptx.addSlide();
  s.background = { color: hex(PROF) };
  s.addShape("ellipse", { x: 8.54, y: -1.67, w: 6.67, h: 6.67, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 } });
  s.addShape("rect", { x: 0, y: 0, w: 0.12, h: H, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  logo(s, 0.83, 0.58, true);
  s.addText("PROYECTO FINAL · UPSKILLING BACKEND JAVA", { x: 0.83, y: 2.0, w: 7, h: 0.3, margin: 0, fontFace: FUENTE, fontSize: 12, bold: true, color: hex(ACC), charSpacing: 3 });
  // El título va partido en dos líneas para que nunca alcance al subtítulo.
  const titulo = (l.diapositiva?.titulo ?? "ARKA-Lite").replace(/^Del endpoint /, "Del endpoint\n");
  s.addText(titulo, { x: 0.83, y: 2.38, w: 7.2, h: 1.95, margin: 0, fontFace: TITULO, fontSize: 54, bold: true, color: "FFFFFF", valign: "top", lineSpacingMultiple: 0.95, fit: "shrink" });
  s.addText((l.diapositiva?.visible ?? []).join(" "), { x: 0.83, y: 4.5, w: 6.8, h: 0.9, margin: 0, fontFace: FUENTE, fontSize: 18, color: hex(color.sobreOscuroSecundario), valign: "top" });
  s.addText(`${EQUIPO} · ${recorrido === "ejecutivo" ? "Recorrido ejecutivo" : "Recorrido técnico"}`, { x: 0.83, y: 6.45, w: 10, h: 0.3, margin: 0, fontFace: FUENTE, fontSize: 11.5, color: hex(color.sobreOscuroSecundario) });

  // Mini arquitectura: UI → dos servicios → dos bases.
  const linea = (x: number, y: number, w: number, h: number) => s.addShape("line", { x, y, w, h, line: { color: "5D7598", width: 1.5 } });
  linea(10.62, 2.31, 0, 0.58);
  linea(9.68, 2.89, 1.9, 0);
  linea(9.68, 2.89, 0, 0.38);
  linea(11.58, 2.89, 0, 0.38);
  linea(9.68, 4.02, 0, 0.62);
  linea(11.58, 4.02, 0, 0.62);
  const caja = (t: string, x: number, y: number, fondo: string, texto: string) => s.addText(t, { x, y, w: 1.67, h: 0.75, shape: "roundRect", rectRadius: 0.14, fill: { color: hex(fondo) }, line: { color: hex(fondo), width: 0 }, fontFace: TITULO, fontSize: 14, bold: true, color: hex(texto), align: "center", valign: "middle", margin: 2 });
  caja("UI", 9.79, 1.56, ACC, PROF);
  caja("Solicitudes", 8.85, 3.27, "#FFFFFF", PROF);
  caja("Notificaciones", 10.75, 3.27, "#FFFFFF", PROF);
  const base = (x: number) => s.addText("PostgreSQL", { x, y: 4.64, w: 1.25, h: 0.62, shape: "roundRect", rectRadius: 0.3, fill: { color: hex(PROF) }, line: { color: "9FB4D2", width: 1.5 }, fontFace: FUENTE, fontSize: 11, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 2 });
  base(9.06);
  base(10.96);
  s.addNotes(textoNotas(l));
}

function portadaSeccion(pptx: PptxGenJS, l: Lamina) {
  const sec = l.seccion;
  const s = pptx.addSlide();
  s.background = { color: hex(PRI) };
  const total = secciones.filter((x) => x.numero !== null).length;
  s.addText(`PARTE ${sec.numero} DE ${total}`, { x: 0.83, y: 0.62, w: 5, h: 0.3, margin: 0, fontFace: FUENTE, fontSize: 12, bold: true, color: hex(ACC), charSpacing: 3 });
  s.addText(String(sec.numero).padStart(2, "0"), { x: 0.62, y: 0.86, w: 5, h: 2.3, margin: 0, fontFace: TITULO, fontSize: 150, bold: true, color: hex(mezclar(PRI, "#FFFFFF", 0.13)) });
  s.addText(sec.titulo, { x: 0.83, y: 3.05, w: 11, h: 0.9, margin: 0, fontFace: TITULO, fontSize: 44, bold: true, color: "FFFFFF", fit: "shrink" });
  if (sec.subtitulo) s.addText(sec.subtitulo, { x: 0.83, y: 3.95, w: 10.6, h: 0.75, margin: 0, fontFace: FUENTE, fontSize: 19, color: hex(color.sobreOscuroSecundario), valign: "top" });
  let x = 0.83;
  let y = 5.05;
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
  s.addShape("rect", { x: 0, y: 0, w: 0.12, h: H, fill: { color: hex(ACC) }, line: { color: hex(ACC), width: 0 } });
  logo(s, 0.83, 0.58, true);
  s.addText(l.diapositiva?.titulo ?? "Gracias", { x: 0.83, y: 2.5, w: 11, h: 1.4, margin: 0, fontFace: TITULO, fontSize: 72, bold: true, color: "FFFFFF" });
  s.addText((l.diapositiva?.visible ?? []).join("\n"), { x: 0.83, y: 4.0, w: 11, h: 1.2, margin: 0, fontFace: FUENTE, fontSize: 22, color: hex(color.sobreOscuroSecundario), valign: "top" });
  s.addNotes(textoNotas(l));
}

// Lámina de concepto: la idea grande a la izquierda, tarjetas numeradas a la
// derecha, la comparación cotidiana y la franja "¿Por qué importa?".
function concepto(s: Slide, d: Diapositiva, abajo: number, conCodigo: boolean) {
  const izqW = 5.75;
  const derX = M + izqW + 0.45;
  const derW = W - M - derX;
  const idea = d.idea ?? d.titulo;
  s.addText(idea, { x: M, y: 1.55, w: izqW, h: 1.9, margin: 0, fontFace: TITULO, fontSize: 32, bold: true, color: hex(PRI), valign: "top", fit: "shrink" });
  if (d.comparacion) {
    const y = Math.max(3.65, abajo - 1.45);
    s.addShape("roundRect", { x: M, y, w: izqW, h: 1.3, rectRadius: 0.12, fill: { color: hex(color.fondo) }, line: { color: hex(color.fondo), width: 0 } });
    s.addText("≈", { x: M + 0.22, y: y + 0.25, w: 0.5, h: 0.5, shape: "roundRect", rectRadius: 0.1, margin: 0, fill: { color: hex(ACC_S) }, line: { color: hex(ACC_S), width: 0 }, fontFace: TITULO, fontSize: 20, bold: true, color: hex(ACC_T), align: "center", valign: "middle" });
    s.addText(d.comparacion, { x: M + 0.88, y: y + 0.12, w: izqW - 1.05, h: 1.06, margin: 0, fontFace: FUENTE, fontSize: 14.5, color: hex(color.texto), valign: "middle", fit: "shrink" });
  }
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
    s.addShape("roundRect", { x: derX, y, w: derW, h: alto, rectRadius: 0.12, fill: { color: i === 1 ? hex(ACC_S) : "FFFFFF" }, line: { color: hex(i === 1 ? ACC : color.linea), width: 1.25 } });
    s.addText(String(i + 1), { x: derX + 0.2, y: y + (alto - 0.5) / 2, w: 0.5, h: 0.5, shape: "ellipse", margin: 0, fill: { color: hex(tono) }, line: { color: hex(tono), width: 0 }, fontFace: TITULO, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    s.addText(t, { x: derX + 0.88, y, w: derW - 1.05, h: alto, margin: 0, fontFace: FUENTE, fontSize: 16, color: hex(color.texto), valign: "middle", fit: "shrink" });
  });
}

function franjaPorque(s: Slide, texto: string) {
  s.addShape("rect", { x: 0, y: H - 0.98, w: W, h: 0.52, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 } });
  s.addText([
    { text: "¿Por qué importa?  ", options: { bold: true, color: hex(ACC) } },
    { text: texto, options: { color: "FFFFFF" } },
  ], { x: M, y: H - 0.98, w: CW, h: 0.52, margin: 0, valign: "middle", fontFace: FUENTE, fontSize: 14, fit: "shrink" });
}

function contenido(pptx: PptxGenJS, l: Lamina, recorrido: Recorrido) {
  const d = l.diapositiva;
  if (!d) return;
  const s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  encabezado(s, etiquetaSeccion(l.seccion), d.titulo);
  const conCodigo = recorrido === "tecnico" && !!d.codigo;
  const conPorque = !!d.porque && !d.diagrama && !d.tabla;
  const baseAbajo = conPorque ? H - 1.12 : H - 0.55;
  const abajo = d.marcas?.length ? baseAbajo - 0.45 : baseAbajo;
  const fig = d.diagrama ? diagramaPorId(d.diagrama) : null;

  if (fig) {
    chips(s, d.visible, 1.42);
    diagrama(s, fig, { x: M, y: 2.0, w: CW, h: abajo - 2.05 }, { paso: null });
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

  // El código no cabe junto a un diagrama o una tabla: va en su propia lámina.
  if (conCodigo && d.codigo && (fig || d.tabla)) {
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
      diagrama(sp, fig, { x: M, y: 1.42, w: CW, h: 4.3 }, { paso: a, rango: [a, b] });
      const pasos = fig.pasos.slice(a, b + 1);
      const gap = 0.14;
      const ancho = (CW - gap * (pasos.length - 1)) / pasos.length;
      pasos.forEach((p, i) => {
        const x = M + i * (ancho + gap);
        sp.addShape("roundRect", { x, y: 5.88, w: ancho, h: 1.0, rectRadius: 0.1, fill: { color: hex(ACC_S) }, line: { color: hex(ACC), width: 1 } });
        sp.addText(String(a + i + 1), { x: x + 0.15, y: 6.13, w: 0.46, h: 0.46, shape: "ellipse", margin: 0, fill: { color: hex(PRI) }, line: { color: hex(PRI), width: 0 }, fontFace: TITULO, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
        sp.addText(p.texto, { x: x + 0.72, y: 5.92, w: ancho - 0.85, h: 0.92, margin: 0, fontFace: FUENTE, fontSize: 13, color: hex(color.texto), valign: "middle", fit: "shrink" });
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

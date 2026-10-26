import PptxGenJS from "pptxgenjs";
import { laminas, etiquetaSeccion, type Lamina } from "../contenido/index.ts";
import { participantes } from "../contenido/participantes.ts";
import { textoNotas } from "../contenido/notas.ts";
import type { BloqueCodigo, Certeza, Recorrido, Tabla } from "../contenido/tipos.ts";
import { diagramaPorId } from "../diagramas/definiciones.ts";
import { estadoEnPaso, posicionEtiqueta, rutaArista, type EstadoElemento } from "../diagramas/geometria.ts";
import type { Diagrama, Paso } from "../diagramas/tipos.ts";
import { color, tipografia, trazo, type TipoTrazo } from "../diseno/tokens.ts";
import { colorCodigo, resaltar } from "../diseno/resaltado.ts";

// Genera el PPTX desde la misma fuente que la web. Todo es editable: textos,
// tablas y diagramas como formas y conectores nativos. Cada animación se
// convierte en diapositivas estáticas por pasos.

type Slide = PptxGenJS.Slide;
const W = 13.333;
const H = 7.5;
const M = 0.6;
const CW = W - 2 * M;
const FUENTE = tipografia.pptx;
const MONO = tipografia.pptxMono;
const hex = (c: string) => c.replace("#", "").toUpperCase();

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

function pie(s: Slide, texto: string, oscuro = false) {
  s.addText(texto.toUpperCase(), { x: M, y: H - 0.42, w: 8, h: 0.25, margin: 0, fontFace: FUENTE, fontSize: 8.5, bold: true, color: oscuro ? hex(color.sobreOscuroSecundario) : "9CA3AF", charSpacing: 1.2 });
  s.slideNumber = { x: W - M - 0.8, y: H - 0.42, w: 0.8, h: 0.25, fontFace: FUENTE, fontSize: 8.5, color: oscuro ? hex(color.sobreOscuroSecundario) : "9CA3AF", align: "right" };
}

function encabezado(s: Slide, sobretitulo: string, titulo: string) {
  s.addText(sobretitulo.toUpperCase(), { x: M, y: 0.4, w: CW, h: 0.28, margin: 0, fontFace: FUENTE, fontSize: 11, bold: true, color: hex(color.cianTexto), charSpacing: 2 });
  s.addText(titulo, { x: M, y: 0.7, w: CW, h: 0.7, margin: 0, fontFace: tipografia.pptxTitulo, fontSize: 26, bold: true, color: hex(color.marino), fit: "shrink" });
}

function vinetas(s: Slide, lineas: string[], caja: { x: number; y: number; w: number; h: number }, tamano: number, columnas = 1) {
  const porColumna = Math.ceil(lineas.length / columnas);
  const anchoCol = (caja.w - (columnas - 1) * 0.3) / columnas;
  for (let c = 0; c < columnas; c++) {
    const grupo = lineas.slice(c * porColumna, (c + 1) * porColumna);
    if (grupo.length === 0) continue;
    s.addText(
      grupo.map((t) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: true, paraSpaceAfter: 6 } })),
      { x: caja.x + c * (anchoCol + 0.3), y: caja.y, w: anchoCol, h: caja.h, margin: 0, valign: "top", fontFace: FUENTE, fontSize: tamano, color: hex(color.texto) },
    );
  }
}

const estiloCerteza: Record<Certeza, { fondo: string; texto: string; nombre: string }> = {
  implementado: { fondo: color.correctoSuave, texto: color.correcto, nombre: "Implementado" },
  ejemplo: { fondo: color.cianSuave, texto: color.cianTexto, nombre: "Ejemplo" },
  propuesta: { fondo: color.advertenciaSuave, texto: color.advertenciaTexto, nombre: "Propuesta" },
};

function marcas(s: Slide, lista: { texto: string; certeza: Certeza }[], y: number) {
  let x = M;
  for (const m of lista) {
    const e = estiloCerteza[m.certeza];
    const texto = `${e.nombre} · ${m.texto}`;
    const ancho = Math.min(CW, 0.3 + texto.length * 0.068);
    if (x + ancho > W - M) { x = M; y += 0.38; }
    s.addText(texto, { x, y, w: ancho, h: 0.3, shape: "roundRect", rectRadius: 0.15, fill: { color: hex(e.fondo) }, color: hex(e.texto), fontFace: FUENTE, fontSize: 9.5, bold: true, align: "center", valign: "middle", margin: 2 });
    x += ancho + 0.12;
  }
}

// Tamaño de fuente que cabe en la caja, estimando caracteres por línea.
function tamanoCodigo(b: BloqueCodigo, ancho: number, alto: number): number {
  const lineas = b.texto.split("\n");
  const largo = Math.max(...lineas.map((l) => l.length), 10);
  const porAncho = ((ancho - 0.3) * 72) / (0.6 * largo);
  const porAlto = ((alto - 0.45) * 72) / (1.3 * lineas.length);
  return Math.max(7.5, Math.min(13, Math.floor(Math.min(porAncho, porAlto) * 2) / 2));
}

function codigo(s: Slide, b: BloqueCodigo, caja: { x: number; y: number; w: number; h: number }) {
  s.addText(b.archivo, { x: caja.x, y: caja.y, w: caja.w, h: 0.25, margin: 0, fontFace: MONO, fontSize: 9, color: hex(color.cianTexto) });
  const tam = tamanoCodigo(b, caja.w, caja.h - 0.3);
  const tramos: PptxGenJS.TextProps[] = [];
  const lineas = b.texto.split("\n");
  lineas.forEach((linea, i) => {
    const partes = resaltar(linea, b.lenguaje);
    if (partes.length === 0) partes.push({ texto: " ", clase: "texto" });
    partes.forEach((p, j) => tramos.push({ text: p.texto, options: { color: hex(colorCodigo[p.clase]), italic: p.clase === "comentario", breakLine: j === partes.length - 1 && i < lineas.length - 1 } }));
  });
  s.addText(tramos, { x: caja.x, y: caja.y + 0.3, w: caja.w, h: caja.h - 0.3, fill: { color: hex(color.codigoFondo) }, fontFace: MONO, fontSize: tam, valign: "top", margin: 10, lineSpacingMultiple: 1.1 });
}

function tabla(s: Slide, t: Tabla, caja: { x: number; y: number; w: number; h: number }) {
  const largos = t.encabezados.map((h, c) => Math.max(h.length, ...t.filas.map((f) => (f[c] ?? "").length)));
  const sumaLargos = largos.reduce((a, b) => a + b, 0);
  const colW = largos.map((l) => Math.max(1.3, (caja.w * l) / sumaLargos));
  const factor = caja.w / colW.reduce((a, b) => a + b, 0);
  const anchos = colW.map((w) => w * factor);
  let tam = 12;
  const altoCon = (pt: number) =>
    [t.encabezados, ...t.filas].reduce((suma, fila) => {
      const lineas = Math.max(...fila.map((celda, c) => Math.ceil(((celda ?? "").length || 1) / Math.max(4, ((anchos[c] - 0.15) * 72) / (pt * 0.52)))));
      return suma + (lineas * pt * 1.22) / 72 + 0.12;
    }, 0);
  while (tam > 8.5 && altoCon(tam) > caja.h) tam -= 0.5;
  const filas: PptxGenJS.TableRow[] = [
    t.encabezados.map((h) => ({ text: h, options: { bold: true, color: hex(color.secundario), fill: { color: hex(color.superficie2) } } })),
    ...t.filas.map((f) => f.map((c, j) => ({ text: c, options: { bold: j === 0, color: hex(color.texto) } }))),
  ];
  s.addTable(filas, { x: caja.x, y: caja.y, w: caja.w, colW: anchos, fontFace: FUENTE, fontSize: tam, valign: "middle", margin: [3, 6, 3, 6], border: { type: "solid", color: "DCE4F0", pt: 0.75 }, autoPage: false });
}

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

const guion: Partial<Record<TipoTrazo, "dash" | "sysDot" | "sysDash" | "lgDash">> = { posterior: "dash", interno: "sysDot", error: "sysDash", dependencia: "lgDash" };

function diagrama(s: Slide, d: Diagrama, caja: { x: number; y: number; w: number; h: number }, r: Resalte) {
  const e = Math.min(caja.w / d.ancho, caja.h / d.alto);
  const ox = caja.x + (caja.w - d.ancho * e) / 2;
  const oy = caja.y + (caja.h - d.alto * e) / 2;
  const X = (px: number) => ox + px * e;
  const Y = (py: number) => oy + py * e;
  const pt = (px: number) => Math.max(7, Math.round(px * e * 72 * 2) / 2);
  s.addShape("rect", { x: ox, y: oy, w: d.ancho * e, h: d.alto * e, fill: { color: hex(color.superficie2) }, line: { color: hex(color.superficie2), width: 0 } });

  for (const z of d.zonas ?? []) {
    const est = estadoResalte(d.pasos, r, z.id, "zonas");
    s.addShape("roundRect", { x: X(z.x), y: Y(z.y), w: z.w * e, h: z.h * e, rectRadius: 0.12, fill: { color: "FFFFFF" }, line: { color: est === "actual" ? hex(color.cian) : "DCE4F0", width: 1, dashType: z.punteada ? "dash" : "solid" } });
    s.addText(z.etiqueta, { x: X(z.x + 12), y: Y(z.y + 8), w: Math.min(z.w * e - 0.2, 5), h: 0.22, margin: 0, fontFace: FUENTE, fontSize: pt(11), bold: true, color: hex(color.secundario), charSpacing: 1 });
  }

  for (const a of d.aristas) {
    const est = estadoResalte(d.pasos, r, a.id, "aristas");
    const t = trazo[a.tipo];
    const c = est === "actual" ? color.cian : est === "futuro" ? "#C7D2E2" : t.color;
    const ruta = rutaArista(d, a);
    for (let i = 0; i < ruta.length - 1; i++) {
      const [x1, y1] = ruta[i];
      const [x2, y2] = ruta[i + 1];
      const ultimo = i === ruta.length - 2;
      s.addShape("line", {
        x: X(Math.min(x1, x2)), y: Y(Math.min(y1, y2)), w: Math.abs(x2 - x1) * e, h: Math.abs(y2 - y1) * e,
        flipH: x2 < x1, flipV: y2 < y1,
        line: { color: hex(c), width: est === "actual" ? t.ancho + 0.8 : t.ancho * 0.85, dashType: guion[a.tipo] ?? "solid", endArrowType: ultimo && t.punta !== "ninguna" ? (t.punta === "llena" ? "triangle" : "arrow") : undefined },
      });
    }
    if (a.etiqueta) {
      const p = posicionEtiqueta(ruta, a.lado);
      const ancho = 0.12 + a.etiqueta.length * pt(12) * 0.0085;
      const x = p.ancla === "middle" ? X(p.x) - ancho / 2 : p.ancla === "end" ? X(p.x) - ancho : X(p.x);
      s.addText(a.etiqueta, { x, y: Y(p.y) - 0.16, w: ancho, h: 0.2, margin: 0, align: p.ancla === "middle" ? "center" : p.ancla === "end" ? "right" : "left", fontFace: MONO, fontSize: pt(11.5), bold: true, color: hex(est === "futuro" ? color.secundario : c), fill: { color: hex(color.superficie2) } });
    }
  }

  for (const n of d.nodos) {
    const est = estadoResalte(d.pasos, r, n.id, "nodos");
    const tipo = n.tipo ?? "componente";
    const actual = est === "actual";
    const fondo = tipo === "memoria" ? color.advertenciaSuave : actual ? color.cianSuave : tipo === "datos" ? "#EEF3FA" : tipo === "infra" ? color.superficie2 : "#FFFFFF";
    const borde = actual ? color.cian : tipo === "memoria" ? color.advertencia : tipo === "pendiente" ? color.secundario : est === "pasado" ? color.azul : "#C7D2E2";
    const textoColor = tipo === "pendiente" || est === "futuro" ? color.secundario : tipo === "memoria" ? "#5C3404" : color.texto;
    const tramos: PptxGenJS.TextProps[] = [];
    if (tipo === "contrato") tramos.push({ text: "«interfaz»", options: { italic: true, fontSize: pt(10), color: hex(color.secundario), breakLine: true } });
    tramos.push({ text: n.titulo, options: { bold: true, fontSize: pt(14), color: hex(textoColor), breakLine: !!n.subtitulo } });
    if (n.subtitulo) tramos.push({ text: n.subtitulo, options: { fontSize: pt(11.5), color: hex(color.secundario) } });
    s.addText(tramos, {
      x: X(n.x), y: Y(n.y), w: n.w * e, h: n.h * e, shape: tipo === "decision" ? "diamond" : "roundRect", rectRadius: tipo === "persona" ? (n.h * e) / 2 : 0.1,
      fill: { color: hex(tipo === "decision" ? (actual ? color.cian : color.cianSuave) : fondo) },
      line: { color: hex(borde), width: actual ? 2.25 : 1.1, dashType: tipo === "memoria" || tipo === "pendiente" || tipo === "contrato" ? "dash" : "solid" },
      fontFace: FUENTE, align: "center", valign: "middle", margin: 3, fit: "shrink",
    });
  }
}

function leyenda(s: Slide, d: Diagrama, y: number) {
  const tipos = Array.from(new Set(d.aristas.map((a) => a.tipo)));
  let x = M;
  for (const tipo of tipos) {
    const t = trazo[tipo];
    s.addShape("line", { x, y: y + 0.11, w: 0.42, h: 0, line: { color: hex(t.color), width: t.ancho * 0.85, dashType: guion[tipo] ?? "solid", endArrowType: t.punta === "llena" ? "triangle" : "arrow" } });
    s.addText(t.etiqueta, { x: x + 0.5, y, w: 1.9, h: 0.22, margin: 0, fontFace: FUENTE, fontSize: 9, color: hex(color.secundario) });
    x += 2.3;
  }
  s.addText("Explicación basada en el código · no es una ejecución observada", { x: W - M - 4.6, y, w: 4.6, h: 0.22, margin: 0, align: "right", fontFace: FUENTE, fontSize: 9, italic: true, color: hex(color.secundario) });
}

function portadaGeneral(pptx: PptxGenJS, l: Lamina, recorrido: Recorrido) {
  const s = pptx.addSlide();
  s.background = { color: hex(color.marino) };
  s.addShape("ellipse", { x: W - 3.3, y: -1.6, w: 4.8, h: 4.8, fill: { color: "13294D" }, line: { color: "13294D", width: 0 } });
  s.addShape("ellipse", { x: W - 2.1, y: H - 2.6, w: 3.6, h: 3.6, fill: { color: hex(color.azul) }, line: { color: hex(color.azul), width: 0 } });
  s.addText("ARKA-Lite", { x: M, y: 1.9, w: 8, h: 1, margin: 0, fontFace: tipografia.pptxTitulo, fontSize: 54, bold: true, color: "FFFFFF" });
  s.addText(l.diapositiva?.titulo ?? "", { x: M, y: 2.95, w: 8.5, h: 0.6, margin: 0, fontFace: FUENTE, fontSize: 22, bold: true, color: hex(color.cian) });
  s.addText((l.diapositiva?.visible ?? []).join("\n"), { x: M, y: 3.65, w: 8.5, h: 0.9, margin: 0, fontFace: FUENTE, fontSize: 15, color: hex(color.sobreOscuroSecundario), valign: "top" });
  s.addText(`RECORRIDO ${recorrido === "ejecutivo" ? "EJECUTIVO" : "TÉCNICO"}`, { x: M, y: 4.85, w: 3.4, h: 0.45, shape: "roundRect", rectRadius: 0.22, fill: { color: hex(color.marino) }, line: { color: hex(color.cian), width: 1.25 }, fontFace: FUENTE, fontSize: 11, bold: true, color: hex(color.cian), align: "center", charSpacing: 1.6 });
  s.addText(`Presentan: ${participantes.map((p) => p.nombre).join(" · ")}`, { x: M, y: 5.6, w: 9, h: 0.3, margin: 0, fontFace: FUENTE, fontSize: 11, color: hex(color.sobreOscuroSecundario) });
  pie(s, "ARKA-Lite · Apertura", true);
  s.addNotes(textoNotas(l));
}

function portadaSeccion(pptx: PptxGenJS, l: Lamina) {
  const s = pptx.addSlide();
  s.background = { color: hex(color.marino) };
  s.addShape("ellipse", { x: W - 2.6, y: H - 2.6, w: 3.6, h: 3.6, fill: { color: "13294D" }, line: { color: "13294D", width: 0 } });
  s.addText(`SECCIÓN ${l.seccion.numero}`, { x: M, y: 0.6, w: 4, h: 0.3, margin: 0, fontFace: FUENTE, fontSize: 13, bold: true, color: hex(color.cian), charSpacing: 3 });
  s.addText(l.seccion.titulo, { x: M, y: 0.95, w: CW, h: 0.9, margin: 0, fontFace: tipografia.pptxTitulo, fontSize: 34, bold: true, color: "FFFFFF", fit: "shrink" });
  const c = l.seccion.claves;
  const filas: [string, string][] = c
    ? [["¿Qué problema resuelve?", c.problema], ["¿Cómo funciona, en sencillo?", c.sencillo], ["¿Cómo se representa?", c.visual], ["¿Dónde se aplicó en ARKA-Lite?", c.aplicacion], ["¿Qué evidencia lo comprueba?", c.evidencia]]
    : [];
  filas.forEach(([pregunta, respuesta], i) => {
    const y = 2.15 + i * 0.92;
    s.addText(pregunta, { x: M, y, w: 3.6, h: 0.8, margin: 0, fontFace: FUENTE, fontSize: 13, bold: true, color: hex(color.cianClaro), valign: "top" });
    s.addText(respuesta, { x: M + 3.8, y, w: CW - 3.8, h: 0.8, margin: 0, fontFace: FUENTE, fontSize: 15, color: "FFFFFF", valign: "top", fit: "shrink" });
  });
  pie(s, `ARKA-Lite · ${etiquetaSeccion(l.seccion)}`, true);
  s.addNotes(textoNotas(l));
}

function contenido(pptx: PptxGenJS, l: Lamina, recorrido: Recorrido) {
  const d = l.diapositiva;
  if (!d) return;
  const s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  encabezado(s, etiquetaSeccion(l.seccion), d.titulo);
  const conCodigo = recorrido === "tecnico" && d.codigo;
  const yMarcas = H - 0.95;
  const abajo = d.marcas?.length ? yMarcas - 0.12 : H - 0.6;
  const fig = d.diagrama ? diagramaPorId(d.diagrama) : null;

  if (fig) {
    vinetas(s, d.visible, { x: M, y: 1.5, w: CW, h: 0.95 }, 13.5, 2);
    diagrama(s, fig, { x: M, y: 2.5, w: CW, h: abajo - 2.5 - 0.3 }, { paso: null });
    leyenda(s, fig, abajo - 0.26);
  } else if (d.tabla) {
    vinetas(s, d.visible, { x: M, y: 1.5, w: CW, h: 0.95 }, 13.5, 2);
    tabla(s, d.tabla, { x: M, y: 2.55, w: CW, h: abajo - 2.6 });
  } else if (conCodigo && d.codigo) {
    vinetas(s, d.visible, { x: M, y: 1.65, w: 5.1, h: abajo - 1.7 }, 17);
    codigo(s, d.codigo, { x: M + 5.4, y: 1.6, w: CW - 5.4, h: abajo - 1.65 });
  } else {
    vinetas(s, d.visible, { x: M, y: 1.75, w: CW, h: abajo - 1.8 }, 22);
  }
  if (d.marcas?.length) marcas(s, d.marcas, yMarcas);
  pie(s, `ARKA-Lite · ${etiquetaSeccion(l.seccion)}`);
  s.addNotes(textoNotas(l));

  // El código no cabe junto a un diagrama o una tabla: va en su propia diapositiva.
  if (conCodigo && d.codigo && (fig || d.tabla)) {
    const sc = pptx.addSlide();
    sc.background = { color: "FFFFFF" };
    encabezado(sc, etiquetaSeccion(l.seccion), `${d.titulo} · código`);
    codigo(sc, d.codigo, { x: M, y: 1.6, w: CW, h: H - 2.3 });
    pie(sc, `ARKA-Lite · ${etiquetaSeccion(l.seccion)}`);
    sc.addNotes(`Mostrar el archivo ${d.codigo.archivo}. Leer solo las líneas señaladas en el texto oral de la diapositiva anterior.`);
  }

  if (fig) {
    const grupos = d.pasoEstatico !== undefined ? [[d.pasoEstatico, d.pasoEstatico] as [number, number]] : agruparPasos(fig.pasos.length, MAX_GRUPOS[recorrido]);
    grupos.forEach(([a, b], g) => {
      const sp = pptx.addSlide();
      sp.background = { color: "FFFFFF" };
      encabezado(sp, `${etiquetaSeccion(l.seccion)} · paso a paso ${g + 1}/${grupos.length}`, fig.titulo);
      diagrama(sp, fig, { x: M, y: 1.5, w: CW, h: 4.25 }, { paso: a, rango: [a, b] });
      const textos = fig.pasos.slice(a, b + 1).map((p, i) => ({ text: `${a + i + 1}. ${p.texto}`, options: { breakLine: true, paraSpaceAfter: 4 } }));
      sp.addText(textos, { x: M, y: 5.85, w: CW, h: 0.95, margin: 0, valign: "top", fontFace: FUENTE, fontSize: b - a > 2 ? 11.5 : 13, color: hex(color.texto), fit: "shrink" });
      leyenda(sp, fig, H - 0.72);
      pie(sp, `ARKA-Lite · ${etiquetaSeccion(l.seccion)}`);
      sp.addNotes(["TEXTO PARA DECIR", ...fig.pasos.slice(a, b + 1).map((p, i) => `Paso ${a + i + 1}: “${p.texto}”`), "INSTRUCCIONES (no se dicen)", "Señalar en el diagrama los elementos resaltados en cian. Es una explicación del código, no una ejecución observada."].join("\n"));
    });
  }
}

export function construirPresentacion(recorrido: Recorrido): PptxGenJS {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Equipo ARKA-Lite";
  pptx.company = "ARKA-Lite";
  pptx.title = `ARKA-Lite · Recorrido ${recorrido === "ejecutivo" ? "ejecutivo" : "técnico"}`;
  pptx.subject = "Generado desde presentacion/contenido";
  pptx.theme = { headFontFace: tipografia.pptxTitulo, bodyFontFace: FUENTE };
  for (const l of laminas(recorrido)) {
    if (l.id === "s00-portada") portadaGeneral(pptx, l, recorrido);
    else if (!l.diapositiva) portadaSeccion(pptx, l);
    else contenido(pptx, l, recorrido);
  }
  return pptx;
}

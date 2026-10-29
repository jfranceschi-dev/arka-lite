import type PptxGenJS from "pptxgenjs";
import { estadoEnPaso, numeroDePaso, posicionEtiqueta, posicionNumero, rutaArista, type EstadoElemento } from "../diagramas/geometria.ts";
import { iconoDeNodo } from "../diagramas/iconos-de-nodo.ts";
import type { Diagrama, Nodo, Paso, Zona } from "../diagramas/tipos.ts";
import { area, color, trazo, type TipoTrazo } from "../diseno/tokens.ts";
import { ACC, ACC_S, ACC_T, FUENTE, halo, PRI, sombra, TITULO, hex, icono, mezclar, type Slide } from "./base.ts";
import { anchoEtiqueta, tamTituloYSubtitulo } from "./medidas.ts";

// Dibuja un diagrama con formas nativas. Cada zona toma el color de su parte
// del sistema; cada nodo es una tarjeta con su ícono; lo que se explica en el
// paso actual se resalta en cian y lo que viene después queda atenuado.

export interface Resalte {
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

// La zona más pequeña con área que contiene el centro del nodo.
function zonaDe(d: Diagrama, n: Nodo): Zona | undefined {
  const cx = n.x + n.w / 2;
  const cy = n.y + n.h / 2;
  return (d.zonas ?? [])
    .filter((z) => z.area && cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h)
    .sort((a, b) => a.w * a.h - b.w * b.h)[0];
}

export function diagrama(s: Slide, d: Diagrama, caja: { x: number; y: number; w: number; h: number }, r: Resalte) {
  const e = Math.min(caja.w / d.ancho, caja.h / d.alto);
  const ox = caja.x + (caja.w - d.ancho * e) / 2;
  const oy = caja.y + (caja.h - d.alto * e) / 2;
  const X = (px: number) => ox + px * e;
  const Y = (py: number) => oy + py * e;
  const pt = (px: number) => Math.max(8, Math.round(px * e * 72 * 2) / 2);
  const conPasos = r.paso !== null || !!r.rango;

  for (const z of d.zonas ?? []) {
    const est = estadoResalte(d.pasos, r, z.id, "zonas");
    const a = z.area ? area[z.area] : null;
    const actual = est === "actual";
    const fondo = actual ? ACC_S : a ? a.suave : color.fondo;
    const borde = actual ? ACC : a ? a.borde : color.linea;
    s.addShape("roundRect", { x: X(z.x), y: Y(z.y), w: z.w * e, h: z.h * e, rectRadius: 0.12, fill: { color: hex(fondo) }, line: { color: hex(borde), width: actual ? 1.75 : 1, dashType: z.punteada ? "dash" : "solid" } });
    // La etiqueta es una píldora a la medida de su texto; si no cabe en la
    // zona, se achica la letra.
    const maximo = z.w * e - 0.2;
    let tam = Math.max(7.5, pt(11));
    while (tam > 6.5 && anchoEtiqueta(z.etiqueta, tam) + 0.2 > maximo) tam -= 0.5;
    const ancho = Math.min(maximo, anchoEtiqueta(z.etiqueta, tam) + 0.2);
    const tinta = actual ? ACC_T : a ? a.fuerte : color.secundario;
    s.addText(z.etiqueta, { x: X(z.x) + 0.08, y: Y(z.y) + 0.06, w: ancho, h: 0.24, margin: 0, align: "center", shape: "roundRect", rectRadius: 0.12, fill: { color: "FFFFFF" }, line: { color: hex(borde), width: 0.75 }, fontFace: FUENTE, fontSize: tam, bold: true, color: hex(tinta), charSpacing: 0.8, valign: "middle" });
  }

  for (const a of d.aristas) {
    const est = estadoResalte(d.pasos, r, a.id, "aristas");
    const t = trazo[a.tipo];
    const c = est === "actual" ? ACC : est === "futuro" ? "#CBD5E3" : t.color;
    const ruta = rutaArista(d, a);
    for (let i = 0; i < ruta.length - 1; i++) {
      const [x1, y1] = ruta[i];
      const [x2, y2] = ruta[i + 1];
      const ultimo = i === ruta.length - 2;
      s.addShape("line", {
        x: X(Math.min(x1, x2)), y: Y(Math.min(y1, y2)), w: Math.abs(x2 - x1) * e, h: Math.abs(y2 - y1) * e,
        flipH: x2 < x1, flipV: y2 < y1,
        line: { color: hex(c), width: est === "actual" ? t.ancho + 1.25 : t.ancho, dashType: guiones[a.tipo] ?? "solid", endArrowType: ultimo && t.punta !== "ninguna" ? (t.punta === "llena" ? "triangle" : "arrow") : undefined },
      });
    }
    if (a.etiqueta) {
      const p = posicionEtiqueta(ruta, a.lado);
      const ancho = 0.14 + a.etiqueta.length * pt(12) * 0.0085;
      const x = p.ancla === "middle" ? X(p.x) - ancho / 2 : p.ancla === "end" ? X(p.x) - ancho : X(p.x);
      s.addText(a.etiqueta, { x, y: Y(p.y) - 0.17, w: ancho, h: 0.21, margin: 0, align: p.ancla === "middle" ? "center" : p.ancla === "end" ? "right" : "left", fontFace: FUENTE, fontSize: pt(12), bold: true, color: hex(est === "futuro" ? "#9AA5B8" : est === "actual" ? ACC_T : t.color) });
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
    const actual = est === "actual" && conPasos;
    const futuro = est === "futuro";
    const zona = zonaDe(d, n);
    const tinta = zona?.area ? area[zona.area].fuerte : tipo === "datos" ? area.datos.fuerte : PRI;
    const fondo = tipo === "memoria" ? color.advertenciaSuave : actual ? "#FFFFFF" : tipo === "datos" ? "#F3F6FA" : tipo === "infra" ? "#FBFCFE" : "#FFFFFF";
    const borde = actual ? ACC : tipo === "memoria" ? color.advertencia : tipo === "pendiente" ? color.secundario : futuro ? "#D5DDE8" : mezclar(tinta, "#FFFFFF", 0.55);
    const textoColor = tipo === "pendiente" || futuro ? "#8A95AB" : tipo === "memoria" ? "#5C3404" : color.texto;
    const x = X(n.x);
    const y = Y(n.y);
    const w = n.w * e;
    const h = n.h * e;
    const nombre = iconoDeNodo(n);
    const tamIcono = Math.min(h * 0.52, 0.34);
    const izq = tipo === "persona" ? h * 0.32 : 0.1;
    const d0 = tamIcono + 0.12;
    // El texto se mide con y sin ícono; si con ícono quedaría muy pequeño,
    // el nodo va sin ícono y con el texto centrado.
    const extra = tipo === "contrato" ? 0.18 : 0;
    const maxT = Math.max(9, 15 * e * 72);
    const maxS = Math.max(8, 12 * e * 72);
    const anchoConIcono = w - izq - d0 - 0.2;
    const conIconoTam = tamTituloYSubtitulo(n.titulo, n.subtitulo, anchoConIcono, h - 0.08 - extra, maxT, maxS);
    const sinIconoTam = tamTituloYSubtitulo(n.titulo, n.subtitulo, w - (tipo === "decision" ? w * 0.4 : 0.16), h - (tipo === "decision" ? h * 0.35 : 0.08) - extra, maxT, maxS);
    const conIcono = !!nombre && tipo !== "decision" && h >= 0.34 && anchoConIcono > 0.4 && conIconoTam[0] >= Math.min(8.5, sinIconoTam[0]);
    const [tt, ts] = conIcono ? conIconoTam : sinIconoTam;

    const tramos: PptxGenJS.TextProps[] = [];
    if (tipo === "contrato") tramos.push({ text: "«interfaz»", options: { italic: true, fontSize: Math.min(ts, pt(10.5)), color: hex(color.secundario), breakLine: true } });
    tramos.push({ text: n.titulo, options: { bold: true, fontSize: tt, color: hex(textoColor), breakLine: !!n.subtitulo } });
    if (n.subtitulo) tramos.push({ text: n.subtitulo, options: { fontSize: ts, color: hex(futuro ? "#9AA5B8" : color.secundario) } });
    // rectRadius solo existe en roundRect: aplicarlo a un rombo deja un PPTX
    // que PowerPoint no puede abrir.
    const forma = tipo === "decision" ? { shape: "diamond" as const } : { shape: "roundRect" as const, rectRadius: tipo === "persona" ? h / 2 : 0.09 };
    const efecto = futuro || tipo === "pendiente" ? undefined : actual ? halo() : sombra();
    if (conIcono) {
      // Tarjeta con el ícono a la izquierda y el texto alineado a su lado.
      s.addShape(forma.shape, { x, y, w, h, ...(forma.shape === "roundRect" ? { rectRadius: forma.rectRadius } : {}), fill: { color: hex(fondo) }, line: { color: hex(borde), width: actual ? 2.25 : 1, dashType: tipo === "memoria" || tipo === "pendiente" || tipo === "contrato" ? "dash" : "solid" }, shadow: efecto });
      const fondoIcono = futuro ? "#EEF2F7" : actual ? ACC_S : mezclar(tinta, "#FFFFFF", 0.88);
      s.addShape("ellipse", { x: x + izq, y: y + (h - d0) / 2, w: d0, h: d0, fill: { color: hex(fondoIcono) }, line: { color: hex(fondoIcono), width: 0 } });
      icono(s, nombre!, x + izq + 0.06, y + (h - tamIcono) / 2, tamIcono, futuro ? "#A9B4C6" : actual ? ACC_T : tinta);
      s.addText(tramos, { x: x + izq + d0 + 0.06, y, w: w - izq - d0 - 0.12, h, margin: [1, 2, 1, 2], fontFace: FUENTE, align: "left", valign: "middle", fit: "shrink", lineSpacingMultiple: 0.95 });
    } else {
      s.addText(tramos, {
        x, y, w, h, ...forma,
        fill: { color: hex(tipo === "decision" ? (actual ? ACC : ACC_S) : fondo) },
        line: { color: hex(borde), width: actual ? 2.25 : 1, dashType: tipo === "memoria" || tipo === "pendiente" || tipo === "contrato" ? "dash" : "solid" },
        shadow: tipo === "decision" ? undefined : efecto,
        fontFace: FUENTE, align: "center", valign: "middle", margin: 3, fit: "shrink",
      });
    }
  }
  void TITULO;
}

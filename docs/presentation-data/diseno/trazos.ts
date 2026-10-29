import { ICONOS, type ElementoIcono, type NombreIcono } from "./iconos.ts";

// Convierte un ícono (elementos SVG en una cuadrícula de 24 × 24) en una lista
// de segmentos absolutos: moverse, línea recta, curva cúbica y cerrar. Con
// eso el PPTX dibuja el ícono como forma nativa y el PDF como trazo vectorial.

export type Segmento =
  | { tipo: "M" | "L"; x: number; y: number }
  | { tipo: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { tipo: "Z" };

const K = 0.5522847498; // control de una curva cúbica que aproxima un cuarto de círculo

function elipse(cx: number, cy: number, rx: number, ry: number): Segmento[] {
  const kx = rx * K;
  const ky = ry * K;
  return [
    { tipo: "M", x: cx + rx, y: cy },
    { tipo: "C", x1: cx + rx, y1: cy + ky, x2: cx + kx, y2: cy + ry, x: cx, y: cy + ry },
    { tipo: "C", x1: cx - kx, y1: cy + ry, x2: cx - rx, y2: cy + ky, x: cx - rx, y: cy },
    { tipo: "C", x1: cx - rx, y1: cy - ky, x2: cx - kx, y2: cy - ry, x: cx, y: cy - ry },
    { tipo: "C", x1: cx + kx, y1: cy - ry, x2: cx + rx, y2: cy - ky, x: cx + rx, y: cy },
    { tipo: "Z" },
  ];
}

function rectangulo(x: number, y: number, w: number, h: number, rx: number, ry: number): Segmento[] {
  if (!rx && !ry) return [{ tipo: "M", x, y }, { tipo: "L", x: x + w, y }, { tipo: "L", x: x + w, y: y + h }, { tipo: "L", x, y: y + h }, { tipo: "Z" }];
  rx = Math.min(rx || ry, w / 2);
  ry = Math.min(ry || rx, h / 2);
  const kx = rx * K;
  const ky = ry * K;
  return [
    { tipo: "M", x: x + rx, y },
    { tipo: "L", x: x + w - rx, y },
    { tipo: "C", x1: x + w - rx + kx, y1: y, x2: x + w, y2: y + ry - ky, x: x + w, y: y + ry },
    { tipo: "L", x: x + w, y: y + h - ry },
    { tipo: "C", x1: x + w, y1: y + h - ry + ky, x2: x + w - rx + kx, y2: y + h, x: x + w - rx, y: y + h },
    { tipo: "L", x: x + rx, y: y + h },
    { tipo: "C", x1: x + rx - kx, y1: y + h, x2: x, y2: y + h - ry + ky, x, y: y + h - ry },
    { tipo: "L", x, y: y + ry },
    { tipo: "C", x1: x, y1: y + ry - ky, x2: x + rx - kx, y2: y, x: x + rx, y },
    { tipo: "Z" },
  ];
}

// Arco elíptico de SVG a curvas cúbicas (parametrización por el centro,
// tramos de 90° como máximo).
function arco(x1: number, y1: number, rx: number, ry: number, rotacion: number, grande: boolean, barrido: boolean, x2: number, y2: number): Segmento[] {
  if (rx === 0 || ry === 0) return [{ tipo: "L", x: x2, y: y2 }];
  const fi = (rotacion * Math.PI) / 180;
  const [cos, sen] = [Math.cos(fi), Math.sin(fi)];
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const xp = cos * dx + sen * dy;
  const yp = -sen * dx + cos * dy;
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  let coef = Math.sqrt(Math.max(0, num / den));
  if (grande === barrido) coef = -coef;
  const cxp = (coef * rx * yp) / ry;
  const cyp = (-coef * ry * xp) / rx;
  const cx = cos * cxp - sen * cyp + (x1 + x2) / 2;
  const cy = sen * cxp + cos * cyp + (y1 + y2) / 2;
  const angulo = (ux: number, uy: number, vx: number, vy: number) => {
    const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    return a;
  };
  const t1 = angulo(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
  let dt = angulo((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
  if (!barrido && dt > 0) dt -= 2 * Math.PI;
  if (barrido && dt < 0) dt += 2 * Math.PI;
  const tramos = Math.ceil(Math.abs(dt) / (Math.PI / 2));
  const paso = dt / tramos;
  const salida: Segmento[] = [];
  const punto = (t: number) => [cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sen, cy + rx * Math.cos(t) * sen + ry * Math.sin(t) * cos];
  const derivada = (t: number) => [-rx * Math.sin(t) * cos - ry * Math.cos(t) * sen, -rx * Math.sin(t) * sen + ry * Math.cos(t) * cos];
  const alfa = (4 / 3) * Math.tan(paso / 4);
  for (let i = 0; i < tramos; i++) {
    const ta = t1 + i * paso;
    const tb = ta + paso;
    const [ax, ay] = punto(ta);
    const [bx, by] = punto(tb);
    const [dax, day] = derivada(ta);
    const [dbx, dby] = derivada(tb);
    salida.push({ tipo: "C", x1: ax + alfa * dax, y1: ay + alfa * day, x2: bx - alfa * dbx, y2: by - alfa * dby, x: bx, y: by });
  }
  return salida;
}

function ruta(d: string): Segmento[] {
  const fichas = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
  const salida: Segmento[] = [];
  let i = 0;
  let cmd = "";
  let [x, y, x0, y0] = [0, 0, 0, 0];
  let ultimoControl: [number, number] | null = null;
  let ultimoCuad: [number, number] | null = null;
  const n = () => Number(fichas[i++]);
  while (i < fichas.length) {
    if (/[a-zA-Z]/.test(fichas[i])) cmd = fichas[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    let control: [number, number] | null = null;
    let cuad: [number, number] | null = null;
    if (C === "M") {
      x = ox + n(); y = oy + n(); x0 = x; y0 = y;
      salida.push({ tipo: "M", x, y });
      cmd = rel ? "l" : "L";
    } else if (C === "L") {
      x = ox + n(); y = oy + n();
      salida.push({ tipo: "L", x, y });
    } else if (C === "H") {
      x = ox + n();
      salida.push({ tipo: "L", x, y });
    } else if (C === "V") {
      y = oy + n();
      salida.push({ tipo: "L", x, y });
    } else if (C === "C" || C === "S") {
      let x1: number, y1: number;
      if (C === "C") { x1 = ox + n(); y1 = oy + n(); }
      else { [x1, y1] = ultimoControl ? [2 * x - ultimoControl[0], 2 * y - ultimoControl[1]] : [x, y]; }
      const x2 = ox + n(); const y2 = oy + n();
      x = ox + n(); y = oy + n();
      salida.push({ tipo: "C", x1, y1, x2, y2, x, y });
      control = [x2, y2];
    } else if (C === "Q" || C === "T") {
      let qx: number, qy: number;
      if (C === "Q") { qx = ox + n(); qy = oy + n(); }
      else { [qx, qy] = ultimoCuad ? [2 * x - ultimoCuad[0], 2 * y - ultimoCuad[1]] : [x, y]; }
      const nx = ox + n(); const ny = oy + n();
      salida.push({ tipo: "C", x1: x + (2 / 3) * (qx - x), y1: y + (2 / 3) * (qy - y), x2: nx + (2 / 3) * (qx - nx), y2: ny + (2 / 3) * (qy - ny), x: nx, y: ny });
      x = nx; y = ny;
      cuad = [qx, qy];
    } else if (C === "A") {
      const rx = n(); const ry = n(); const rot = n(); const grande = n() !== 0; const barrido = n() !== 0;
      const nx = ox + n(); const ny = oy + n();
      salida.push(...arco(x, y, rx, ry, rot, grande, barrido, nx, ny));
      x = nx; y = ny;
    } else if (C === "Z") {
      salida.push({ tipo: "Z" });
      x = x0; y = y0;
    } else {
      throw new Error(`Comando SVG no soportado: ${cmd}`);
    }
    ultimoControl = control;
    ultimoCuad = cuad;
  }
  return salida;
}

function elemento([tag, a]: ElementoIcono): Segmento[] {
  const v = (k: string) => Number(a[k] ?? 0);
  switch (tag) {
    case "path": return ruta(a.d);
    case "circle": return elipse(v("cx"), v("cy"), v("r"), v("r"));
    case "ellipse": return elipse(v("cx"), v("cy"), v("rx"), v("ry"));
    case "rect": return rectangulo(v("x"), v("y"), v("width"), v("height"), v("rx"), v("ry"));
    case "line": return [{ tipo: "M", x: v("x1"), y: v("y1") }, { tipo: "L", x: v("x2"), y: v("y2") }];
    case "polyline":
    case "polygon": {
      const p = a.points.trim().split(/[\s,]+/).map(Number);
      const s: Segmento[] = [];
      for (let i = 0; i < p.length; i += 2) s.push({ tipo: i === 0 ? "M" : "L", x: p[i], y: p[i + 1] });
      if (tag === "polygon") s.push({ tipo: "Z" });
      return s;
    }
    default: throw new Error(`Elemento SVG no soportado: ${tag}`);
  }
}

const cache = new Map<NombreIcono, Segmento[]>();

export function segmentosDeIcono(nombre: NombreIcono): Segmento[] {
  let s = cache.get(nombre);
  if (!s) {
    s = (ICONOS[nombre] as ElementoIcono[]).flatMap(elemento);
    cache.set(nombre, s);
  }
  return s;
}

export function existeIcono(nombre: string): nombre is NombreIcono {
  return nombre in ICONOS;
}

import type { Arista, Diagrama, Nodo, Paso } from "./tipos.ts";

export type Punto = [number, number];

const centro = (n: Nodo): Punto => [n.x + n.w / 2, n.y + n.h / 2];

export function buscarNodo(d: Diagrama, id: string): Nodo {
  const n = d.nodos.find((x) => x.id === id);
  if (!n) throw new Error(`El diagrama ${d.id} no tiene el nodo ${id}`);
  return n;
}

// Ruta de una arista: recta entre bordes enfrentados cuando los nodos
// comparten fila o columna; en otro caso, un codo horizontal y vertical.
export function rutaArista(d: Diagrama, a: Arista): Punto[] {
  if (a.puntos) return a.puntos;
  const n1 = buscarNodo(d, a.desde);
  const n2 = buscarNodo(d, a.hacia);
  const [x1, y1] = centro(n1);
  const [x2, y2] = centro(n2);
  const off = a.desfase ?? 0;
  const mismaFila = Math.abs(y1 - y2) < Math.min(n1.h, n2.h) / 2;
  const mismaColumna = Math.abs(x1 - x2) < Math.min(n1.w, n2.w) / 2;
  if (mismaFila) {
    const y = (y1 + y2) / 2 + off;
    return x2 > x1 ? [[n1.x + n1.w, y], [n2.x, y]] : [[n1.x, y], [n2.x + n2.w, y]];
  }
  if (mismaColumna) {
    const x = (x1 + x2) / 2 + off;
    return y2 > y1 ? [[x, n1.y + n1.h], [x, n2.y]] : [[x, n1.y], [x, n2.y + n2.h]];
  }
  const salidaX = x2 > x1 ? n1.x + n1.w : n1.x;
  const entradaY = y2 > y1 ? n2.y : n2.y + n2.h;
  return [[salidaX, y1 + off], [x2 + off, y1 + off], [x2 + off, entradaY]];
}

export function posicionEtiqueta(ruta: Punto[], lado?: Arista["lado"]): { x: number; y: number; ancla: "middle" | "start" | "end" } {
  let mejor = 0;
  let largo = -1;
  for (let i = 0; i < ruta.length - 1; i++) {
    const l = Math.hypot(ruta[i + 1][0] - ruta[i][0], ruta[i + 1][1] - ruta[i][1]);
    if (l > largo) { largo = l; mejor = i; }
  }
  const [ax, ay] = ruta[mejor];
  const [bx, by] = ruta[mejor + 1];
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const horizontal = Math.abs(by - ay) < Math.abs(bx - ax);
  const l = lado ?? (horizontal ? "arriba" : "derecha");
  if (l === "arriba") return { x: mx, y: my - 9, ancla: "middle" };
  if (l === "abajo") return { x: mx, y: my + 19, ancla: "middle" };
  if (l === "izquierda") return { x: mx - 10, y: my + 4, ancla: "end" };
  return { x: mx + 10, y: my + 4, ancla: "start" };
}

// Estado de cada elemento en un paso: actual, ya recorrido o pendiente.
export type EstadoElemento = "actual" | "pasado" | "futuro";

export function estadoEnPaso(pasos: Paso[], indice: number, id: string, campo: "nodos" | "aristas" | "zonas"): EstadoElemento {
  const lista = (p: Paso) => (campo === "zonas" ? p.zonas ?? [] : p[campo]);
  if (lista(pasos[indice]).includes(id)) return "actual";
  for (let i = 0; i < indice; i++) if (lista(pasos[i]).includes(id)) return "pasado";
  const aparece = pasos.some((p) => lista(p).includes(id));
  return aparece ? "futuro" : "pasado";
}

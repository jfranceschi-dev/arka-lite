import type { NombreIcono } from "../diseno/iconos.ts";
import type { AreaSistema, TipoTrazo } from "../diseno/tokens.ts";

// Coordenadas en un lienzo virtual. La web las dibuja en SVG escalable y el
// generador PPTX las convierte a pulgadas dentro de la diapositiva.

export type TipoNodo =
  | "componente"
  | "persona"
  | "contrato"
  | "datos"
  | "memoria"
  | "pendiente"
  | "decision"
  | "infra";

export interface DetalleNodo {
  hace: string;
  recibe: string;
  devuelve: string;
  archivo: string;
}

export interface Nodo {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  titulo: string;
  subtitulo?: string;
  tipo?: TipoNodo;
  // Sin valor, iconos-de-nodo.ts lo deduce del tipo o del título.
  icono?: NombreIcono;
  detalle: DetalleNodo;
}

export interface Arista {
  id: string;
  desde: string;
  hacia: string;
  tipo: TipoTrazo;
  etiqueta?: string;
  // Separa la ida y la vuelta entre los mismos nodos.
  desfase?: number;
  // Recorrido explícito, del origen al destino, cuando no es una recta.
  puntos?: [number, number][];
  lado?: "arriba" | "abajo" | "izquierda" | "derecha";
}

export interface Zona {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  etiqueta: string;
  // Una zona punteada agrupa algo que ocurre junto, como una transacción.
  punteada?: boolean;
  // Parte del sistema a la que pertenece: le da su color.
  area?: AreaSistema;
}

export interface Paso {
  texto: string;
  nodos: string[];
  aristas: string[];
  zonas?: string[];
}

export interface Diagrama {
  id: string;
  titulo: string;
  descripcion: string;
  ancho: number;
  alto: number;
  zonas?: Zona[];
  nodos: Nodo[];
  aristas: Arista[];
  pasos: Paso[];
  // Aclaración permanente bajo el diagrama.
  nota?: string;
}

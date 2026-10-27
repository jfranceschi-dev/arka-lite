// Fuente única de la línea gráfica. La web la recibe como tema de Tailwind
// (generar-css.ts escribe web/src/estilos/tokens.css) y el generador PPTX la
// importa directamente. Un valor nuevo se agrega aquí y en ningún otro lugar.

export const color = {
  marino: "#0B1F3A",
  franja: "#0B2350",
  azul: "#1F4E8C",
  azulVivo: "#2E6DB4",
  cian: "#2BA6CB",
  cianTexto: "#0B6E8A",
  cianClaro: "#7FD3EA",
  cianSuave: "#E3F4FA",
  fondo: "#F4F7FB",
  linea: "#DFE6F0",
  superficie: "#FFFFFF",
  superficie2: "#F0F4FB",
  texto: "#0B1A3C",
  secundario: "#55627E",
  borde: "#C7D6EA",
  tinta: "#0A1430",
  correcto: "#0A6648",
  correctoSuave: "#E1F1EA",
  error: "#AB243E",
  errorSuave: "#F7E3E7",
  advertencia: "#A85D08",
  advertenciaTexto: "#8A4B06",
  advertenciaSuave: "#FBE7BD",
  sobreOscuro: "#E8EDF8",
  sobreOscuroSecundario: "#9FBEE0",
  tarjetaOscura: "#13294D",
  bordeOscuro: "#3A5A8C",
  codigoFondo: "#0B1F3A",
  codigoTexto: "#E8EDF8",
  codigoClave: "#7FD3EA",
  codigoTipo: "#9FBEE0",
  codigoCadena: "#F2C66D",
  codigoComentario: "#8FA2BF",
  codigoAnotacion: "#FFB38A",
} as const;

// Cada parte del sistema tiene su color en los diagramas de arquitectura:
// fuerte para títulos e íconos, suave para el fondo de su zona.
export type AreaSistema = "ui" | "solicitudes" | "notificaciones" | "datos" | "entrega" | "observabilidad" | "plataforma";

export const area: Record<AreaSistema, { fuerte: string; suave: string; borde: string }> = {
  ui: { fuerte: "#5B3FC4", suave: "#F1EEFD", borde: "#C9BEF4" },
  solicitudes: { fuerte: color.azul, suave: "#EAF0FA", borde: "#AFC4E6" },
  notificaciones: { fuerte: color.cianTexto, suave: "#E5F5FA", borde: "#9DD7E8" },
  datos: { fuerte: "#3D5675", suave: "#EEF2F7", borde: "#C2CEDD" },
  entrega: { fuerte: color.correcto, suave: "#E6F4EE", borde: "#A9D8C3" },
  observabilidad: { fuerte: color.advertenciaTexto, suave: "#FCF2E2", borde: "#EDCC93" },
  plataforma: { fuerte: color.secundario, suave: "#F7F9FC", borde: "#C7D2E2" },
};

// Tonos de los elementos visuales de las láminas (cifras, tarjetas, flujos).
export const tono = {
  marino: { fuerte: color.franja, suave: "#E8EEF8" },
  cian: { fuerte: color.cianTexto, suave: color.cianSuave },
  violeta: { fuerte: "#5B3FC4", suave: "#F1EEFD" },
  correcto: { fuerte: color.correcto, suave: color.correctoSuave },
  error: { fuerte: color.error, suave: color.errorSuave },
  advertencia: { fuerte: color.advertenciaTexto, suave: "#FCEFD6" },
  neutro: { fuerte: color.secundario, suave: color.fondo },
} as const;

export const tipografia = {
  web: "'Plus Jakarta Sans', system-ui, 'Segoe UI', sans-serif",
  mono: "'Cascadia Mono', Consolas, 'SFMono-Regular', ui-monospace, monospace",
  // PowerPoint usa fuentes instaladas en Windows para que el texto siga editable.
  pptx: "Segoe UI",
  pptxTitulo: "Segoe UI Semibold",
  pptxMono: "Consolas",
} as const;

export const espacio = [4, 8, 12, 16, 20, 24, 32, 48] as const;

export const radio = {
  capsula: 999,
  franja: 26,
  tarjeta: 20,
  recuadro: 14,
  chico: 12,
} as const;

export const movimiento = {
  rapidoMs: 120,
  normalMs: 200,
  lentoMs: 320,
  curva: "cubic-bezier(.2,.8,.2,1)",
} as const;

// Tipos de trazo de los diagramas. Cada uno cambia de patrón, punta e
// icono además del color, para no depender solo del color.
export type TipoTrazo =
  | "peticion"
  | "respuesta"
  | "posterior"
  | "interno"
  | "observado"
  | "error"
  | "dependencia";

export interface EstiloTrazo {
  etiqueta: string;
  significado: string;
  color: string;
  colorOscuro: string;
  ancho: number;
  guiones: number[] | null;
  punta: "llena" | "abierta" | "hueca" | "ninguna";
}

export const trazo: Record<TipoTrazo, EstiloTrazo> = {
  peticion: {
    etiqueta: "Petición",
    significado: "Alguien pide algo por HTTP.",
    color: color.azulVivo,
    colorOscuro: "#5E9BE0",
    ancho: 2.5,
    guiones: null,
    punta: "llena",
  },
  respuesta: {
    etiqueta: "Respuesta",
    significado: "Vuelve status, headers y cuerpo.",
    color: color.cianTexto,
    colorOscuro: color.cianClaro,
    ancho: 1.8,
    guiones: null,
    punta: "abierta",
  },
  posterior: {
    etiqueta: "Trabajo posterior",
    significado: "Ocurre después de responder.",
    color: color.secundario,
    colorOscuro: color.sobreOscuroSecundario,
    ancho: 2,
    guiones: [8, 6],
    punta: "llena",
  },
  interno: {
    etiqueta: "Paso interno explicado",
    significado: "Sale del código; la UI no lo observa.",
    color: color.secundario,
    colorOscuro: color.sobreOscuroSecundario,
    ancho: 2.5,
    guiones: [1, 6],
    punta: "llena",
  },
  observado: {
    etiqueta: "Resultado observado",
    significado: "La UI recibió esta respuesta.",
    color: color.correcto,
    colorOscuro: "#4ADE80",
    ancho: 4,
    guiones: null,
    punta: "llena",
  },
  error: {
    etiqueta: "Error",
    significado: "4xx, 5xx, tiempo agotado o sin conexión.",
    color: color.error,
    colorOscuro: "#FF8FA3",
    ancho: 2.5,
    guiones: [3, 5],
    punta: "llena",
  },
  dependencia: {
    etiqueta: "Dependencia de código",
    significado: "Quién conoce a quién; no es una llamada.",
    color: color.azul,
    colorOscuro: color.sobreOscuroSecundario,
    ancho: 1.8,
    guiones: [4, 4],
    punta: "hueca",
  },
};

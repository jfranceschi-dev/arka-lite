// Modelo de la fuente de contenido. La presentación web, el recorrido
// ejecutivo, el técnico, las notas del expositor, los guiones por
// participante y la exportación PPTX leen estos mismos objetos.

export type Recorrido = "ejecutivo" | "tecnico";

// Implementado: se reconoce en el código o la configuración revisados.
// Ejemplo: ayuda a explicar; no es una medición observada.
// Propuesta: requiere implementación y validación posteriores.
export type Certeza = "implementado" | "ejemplo" | "propuesta";

export interface Marca {
  texto: string;
  certeza: Certeza;
}

export interface BloqueCodigo {
  lenguaje: "java" | "yaml" | "json" | "bash" | "sql" | "properties" | "http" | "nginx";
  archivo: string;
  texto: string;
}

export interface Tabla {
  encabezados: string[];
  filas: string[][];
}

export interface Pregunta {
  texto: string;
  respuesta: string;
}

export interface Demostracion {
  accion: string;
  evidencia: string;
  // Acción del laboratorio que la ejecuta, si existe (ver laboratorio.ts).
  laboratorio?: string;
}

export interface Guion {
  // Texto oral, listo para ensayar. Cada elemento es un párrafo.
  decir: string[];
  // Instrucciones para quien expone; no se dicen en voz alta.
  instrucciones?: string[];
  transicion?: string;
  respaldo?: string;
  pregunta?: Pregunta;
  demo?: Demostracion;
}

export interface Diapositiva {
  id: string;
  titulo: string;
  // Contenido visible: frases cortas, nunca párrafos.
  visible: string[];
  recorridos: Recorrido[];
  diagrama?: string;
  // Paso del diagrama que representa la diapositiva en PPTX. Sin valor, se
  // exporta un paso por diapositiva.
  pasoEstatico?: number;
  tabla?: Tabla;
  // Solo se muestra en el recorrido técnico.
  codigo?: BloqueCodigo;
  marcas?: Marca[];
  guion: Guion;
}

// Las cinco preguntas que responde cada tema.
export interface Claves {
  problema: string;
  sencillo: string;
  visual: string;
  aplicacion: string;
  evidencia: string;
}

export interface Seccion {
  id: string;
  // null para apertura y cierre.
  numero: number | null;
  titulo: string;
  corto: string;
  participante: string;
  claves?: Claves;
  diapositivas: Diapositiva[];
}

export interface Participante {
  id: string;
  nombre: string;
  rol: string;
}

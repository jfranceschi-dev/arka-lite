// Modelo de la fuente de contenido de la presentación. El PPTX, el PDF, las
// notas del expositor y los guiones (completos y por participante) leen estos
// mismos objetos.

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
  // Contenido visible: frases cortas, nunca párrafos. En las láminas de
  // concepto se muestran como tarjetas numeradas.
  visible: string[];
  // La idea de la lámina en una frase grande. Sin valor, se usa el título.
  idea?: string;
  // Una comparación cotidiana que ayuda a entender la idea.
  comparacion?: string;
  // Por qué importa, en una línea: la franja inferior de la lámina.
  porque?: string;
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
  // Frase de la portada de la sección: qué se va a ver.
  subtitulo?: string;
  // Temas del curso que aparecen en la sección (chips de la portada).
  temas?: string[];
  claves?: Claves;
  diapositivas: Diapositiva[];
}

export interface Participante {
  id: string;
  nombre: string;
  // Área de la persona en el equipo.
  perfil: "Desarrollo" | "DevOps" | "Base de datos";
  rol: string;
}

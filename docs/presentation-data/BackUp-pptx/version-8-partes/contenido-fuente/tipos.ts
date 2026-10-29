import type { NombreIcono } from "../diseno/iconos.ts";

// Modelo de la fuente de contenido de la presentación. El PPTX, el PDF, las
// notas del expositor y los guiones leen estos mismos objetos.

// Variantes para el staff de tecnología: resumen (charla corta, ~13 láminas),
// ejecutivo (todas las secciones, sin código) y técnico (agrega código y
// diagramas detallados). Cada una contiene a la anterior.
export type Recorrido = "resumen" | "ejecutivo" | "tecnico";
export const RECORRIDOS: Recorrido[] = ["resumen", "ejecutivo", "tecnico"];
export const NOMBRE_RECORRIDO: Record<Recorrido, string> = { resumen: "Resumen", ejecutivo: "Ejecutivo", tecnico: "Técnico" };

export type Icono = NombreIcono;

// Color de un elemento visual. Dice si algo es bueno, malo o neutro, y a qué
// parte del sistema pertenece.
export type Tono = "marino" | "cian" | "violeta" | "correcto" | "error" | "advertencia" | "neutro";

export interface ElementoVisual {
  icono: Icono;
  titulo: string;
  texto?: string;
  tono?: Tono;
}

export interface Lado {
  titulo: string;
  icono: Icono;
  tono: Tono;
  puntos: string[];
}

// Captura de pantalla real, guardada en capturas/.
export interface Captura {
  archivo: string;
  titulo: string;
  texto?: string;
  // Dirección que se muestra en la barra del marco de navegador.
  url?: string;
}

// Recurso visual principal de una lámina. En el PPTX reemplaza a las tarjetas,
// la tabla o el diagrama de la lámina principal; el diagrama, si lo hay, sigue
// en las láminas paso a paso. Los guiones y el PDF lo cuentan como texto.
export interface Capa {
  titulo: string;
  tono: Tono;
  elementos: ElementoVisual[];
}

export interface TablaDeBase {
  nombre: string;
  columnas: string[];
}

export interface Base {
  titulo: string;
  subtitulo?: string;
  tono: Tono;
  tablas: TablaDeBase[];
}

export type Visual =
  // El recorrido de las partes numeradas (sale de las secciones).
  | { tipo: "ruta" }
  // Lo que aprendimos en la sección: una o dos métricas y, por aprendizaje,
  // qué aprendimos, cómo lo aplicamos y qué valor le deja al equipo.
  | { tipo: "aprendizajes"; metricas: { valor: string; titulo: string }[]; items: (ElementoVisual & { valor: string })[] }
  // Qué pasa cuando algo falla: la falla, la reacción del sistema en el
  // tiempo y el resultado.
  | { tipo: "escenario"; falla: ElementoVisual; pasos: (ElementoVisual & { momento: string })[]; resultado: ElementoVisual }
  // Capas apiladas de arriba abajo, cada una con sus piezas.
  | { tipo: "capas"; capas: Capa[] }
  // Bases de datos con sus tablas y columnas, y qué las une.
  | { tipo: "tablas"; bases: Base[]; enlace: string }
  // Filas con tres columnas: por ejemplo, qué falla, cómo reacciona y qué se ve.
  | { tipo: "matriz"; encabezados: [string, string, string]; filas: { icono: Icono; tono?: Tono; celdas: [string, string, string] }[] }
  // Puertos y adaptadores: el dominio al centro, entrada a la izquierda y
  // salida a la derecha.
  | { tipo: "hexagono"; centro: ElementoVisual; puertos: string[]; entrada: ElementoVisual[]; salida: ElementoVisual[] }
  // Números grandes con su explicación.
  | { tipo: "cifras"; cifras: (ElementoVisual & { valor: string })[] }
  // Pasos en fila. El desvío cuelga de un paso: lo que pasa si algo falla.
  | { tipo: "flujo"; pasos: ElementoVisual[]; desvio?: { desde: number; etiqueta: string; elemento: ElementoVisual } }
  // Etapas encadenadas de un proceso automático.
  | { tipo: "tuberia"; etapas: ElementoVisual[] }
  // Estados en columnas; cada acción lleva de una columna a la siguiente.
  | { tipo: "estados"; columnas: ElementoVisual[][]; acciones: string[]; error?: ElementoVisual }
  // Dos maneras de hacerlo, lado a lado.
  | { tipo: "contraste"; lados: [Lado, Lado] }
  // Cuadrícula de tarjetas, con un comando opcional arriba.
  | { tipo: "tarjetas"; tarjetas: ElementoVisual[]; columnas?: number; comando?: string }
  // Capturas reales en un marco de navegador.
  | { tipo: "captura"; capturas: Captura[] }
  // Una rama de trabajo que vuelve a main por Pull Request.
  | { tipo: "ramas"; principal: string; rama: string; commits: string[]; fusion: string };

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
  // Un ícono por línea visible: acompaña cada tarjeta de concepto.
  iconos?: Icono[];
  // La idea de la lámina en una frase grande. Sin valor, se usa el título.
  idea?: string;
  // Una comparación cotidiana que ayuda a entender la idea.
  comparacion?: string;
  iconoComparacion?: Icono;
  visual?: Visual;
  // Por qué importa, en una línea: la franja inferior de la lámina.
  porque?: string;
  recorridos: Recorrido[];
  // Diagrama detallado: se dibuja completo, con sus pasos numerados debajo.
  diagrama?: string;
  tabla?: Tabla;
  // Solo se muestra en el recorrido técnico.
  codigo?: BloqueCodigo;
  marcas?: Marca[];
  guion: Guion;
}

export interface Seccion {
  id: string;
  // null para apertura y cierre.
  numero: number | null;
  titulo: string;
  corto: string;
  // Frase de la portada de la sección: qué se va a ver.
  subtitulo?: string;
  // Temas del curso que aparecen en la sección (chips de la portada).
  temas?: string[];
  // Ícono de la sección en la agenda y en las láminas de aprendizajes.
  icono?: Icono;
  diapositivas: Diapositiva[];
}

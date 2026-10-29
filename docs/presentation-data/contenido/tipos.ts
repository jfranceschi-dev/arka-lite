import type { NombreIcono } from "../diseno/iconos.ts";

// Modelo de la fuente de contenido de la presentación. El PPTX, el PDF, las
// notas del expositor y los guiones leen estos mismos objetos.

// Variantes para el staff de tecnología: resumen (charla corta, ~19 láminas),
// ejecutivo (todas las secciones, sin código) y técnico (agrega código y
// diagramas detallados). Cada una contiene a la anterior.
export type Recorrido = "resumen" | "ejecutivo" | "tecnico";
export const RECORRIDOS: Recorrido[] = ["resumen", "ejecutivo", "tecnico"];
export const NOMBRE_RECORRIDO: Record<Recorrido, string> = { resumen: "Resumen", ejecutivo: "Ejecutivo", tecnico: "Técnico" };

// Cómo se muestra la UI en la demostración: en vivo, con videos grabados
// (cuando no se puede en vivo) o sin demostración.
export type ModoDemo = "vivo" | "video" | "sin";

// Lo que se genera: cada recorrido con la demostración en vivo y, además, el
// ejecutivo con videos y sin demostración. Las dos variantes extra salen del
// ejecutivo con los cambios de contenido/variantes.ts.
export type Variante = Recorrido | "ejecutivo-con-videos" | "ejecutivo-sin-demo";
export const VARIANTES: Variante[] = [...RECORRIDOS, "ejecutivo-con-videos", "ejecutivo-sin-demo"];
const DEFINICION: Record<Variante, { recorrido: Recorrido; demo: ModoDemo; nombre: string }> = {
  resumen: { recorrido: "resumen", demo: "vivo", nombre: "Resumen" },
  ejecutivo: { recorrido: "ejecutivo", demo: "vivo", nombre: "Ejecutivo" },
  tecnico: { recorrido: "tecnico", demo: "vivo", nombre: "Técnico" },
  "ejecutivo-con-videos": { recorrido: "ejecutivo", demo: "video", nombre: "Ejecutivo con videos" },
  "ejecutivo-sin-demo": { recorrido: "ejecutivo", demo: "sin", nombre: "Ejecutivo sin demostración" },
};
export const recorridoDe = (v: Variante): Recorrido => DEFINICION[v].recorrido;
export const modoDe = (v: Variante): ModoDemo => DEFINICION[v].demo;
export const nombreVariante = (v: Variante): string => DEFINICION[v].nombre;

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

export interface LadoCodigo {
  titulo: string;
  icono: Icono;
  tono: Tono;
  lenguaje: BloqueCodigo["lenguaje"];
  codigo: string;
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

// Una pieza con nombre y una línea que la explica: una columna de la clase o
// de la tabla en el mapeo del ORM.
export interface Campo {
  nombre: string;
  detalle?: string;
}

export type Visual =
  // El recorrido de las partes numeradas, con su enfoque: vista general o a
  // fondo. laminas() pone las partes de la variante; sin ellas, son todas.
  | { tipo: "ruta"; partes?: Seccion[] }
  // El equipo por área: cuántas personas, qué aporta cada una y qué partes
  // presenta.
  | { tipo: "equipo"; areas: (ElementoVisual & { cuantos: string; partes: string[] })[] }
  // El sistema en la práctica: la persona, la UI, los dos servicios y sus
  // bases, con las seis conexiones numeradas. El evento no es una pieza: es
  // el dato que viaja entre los dos servicios.
  | {
      tipo: "sistema";
      persona: ElementoVisual;
      ui: ElementoVisual;
      servicios: [ElementoVisual, ElementoVisual];
      bases: [ElementoVisual, ElementoVisual];
      // En orden: persona→UI, UI→servicio 1, servicio 1→base 1,
      // servicio 1⇢servicio 2 (el evento), servicio 2→base 2, UI→servicio 2.
      conexiones: [string, string, string, string, string, string];
      evento: string;
      nota: string;
    }
  // Dos o más maneras de recorrer el mismo camino, una por carril. El paso
  // "regla" de cada carril lleva la marca de dónde vive la regla del negocio;
  // los grupos marcan con un corchete qué pasos son una etapa (CI, CD).
  | { tipo: "caminos"; caminos: { titulo: string; tono: Tono; pasos: ElementoVisual[]; flechas: string[]; regla?: number; grupos?: { desde: number; hasta: number; titulo: string; tono: Tono }[] }[] }
  // La misma idea escrita de dos formas, en código, lado a lado, con lo que
  // implica cada una debajo.
  | { tipo: "codigos"; lados: [LadoCodigo, LadoCodigo] }
  // De dónde sale un valor: varias fuentes llegan al centro, que lo usa para
  // llegar al destino. La nota dice lo que nunca lo lleva.
  | { tipo: "origenes"; fuentes: (ElementoVisual & { valor: string })[]; centro: ElementoVisual & { valor: string }; enlace: string; destino: ElementoVisual; nota: ElementoVisual }
  // Cómo el ORM traduce una clase a una tabla y cada operación a SQL.
  | { tipo: "mapeo"; clase: { titulo: string; subtitulo: string; campos: Campo[] }; tabla: { titulo: string; subtitulo: string; columnas: Campo[] }; operaciones: { codigo: string; sql: string }[] }
  // Lo que aprendimos en la sección: una o dos métricas y, por aprendizaje,
  // qué aprendimos, cómo lo aplicamos y qué valor le deja al equipo.
  | { tipo: "aprendizajes"; metricas: { valor: string; titulo: string }[]; items: (ElementoVisual & { valor: string })[] }
  // Qué pasa cuando algo falla: la falla, la reacción del sistema en el
  // tiempo y el resultado.
  | { tipo: "escenario"; falla: ElementoVisual; pasos: (ElementoVisual & { momento: string })[]; resultado: ElementoVisual }
  // Capas apiladas de arriba abajo, cada una con sus piezas.
  // Con paralelas, las capas ocurren al mismo tiempo: sin flechas entre ellas.
  | { tipo: "capas"; capas: Capa[]; paralelas?: boolean }
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
  // Dos maneras de hacerlo, lado a lado. Con union "+", los dos lados no
  // compiten: se complementan.
  | { tipo: "contraste"; lados: [Lado, Lado]; union?: "vs" | "+" }
  // Cuadrícula de tarjetas, con un comando opcional arriba.
  | { tipo: "tarjetas"; tarjetas: ElementoVisual[]; columnas?: number; comando?: string }
  // Capturas reales en un marco de navegador.
  | { tipo: "captura"; capturas: Captura[] }
  // Un video grabado con la UI (capturas/videos/) en un marco de navegador,
  // con sus pasos al lado: los mismos rótulos numerados del video. Un clic lo
  // reproduce.
  | { tipo: "video"; archivo: string; portada: string; url: string; pasos: string[] }
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
  // Preguntas probables del staff, con su respuesta corta.
  preguntas?: Pregunta[];
  // Más para decir si hay tiempo o si preguntan: ejemplos y datos reales.
  // No cuenta en los minutos. Sale de contenido/ampliar.ts.
  ampliar?: string[];
  demo?: Demostracion;
}

// En el texto oral, [clic] marca el momento de hacer clic: la siguiente pieza
// del diagrama aparece ahí. Hay tantas marcas como clics tiene el visual.
export const CLIC = "[clic]";

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
  // Lo que el staff se lleva de la lámina: el valor, en una frase. Va en el
  // guion y en las notas, no en la pantalla.
  valor?: string;
  recorridos: Recorrido[];
  // Quién la presenta, si no es el rol de su sección.
  rol?: Rol;
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
  // Todos los equipos presentan cada sección; cada equipo profundiza en las
  // suyas y ve las demás de forma general.
  enfoque?: Enfoque;
  // Quién presenta la sección (ver reparto.ts).
  rol: Rol;
  diapositivas: Diapositiva[];
}

// "vivo" es la demostración: ni vista general ni a fondo, sino todo junto.
// "video" es la misma demostración, grabada.
export type Enfoque = "general" | "fondo" | "vivo" | "video";
export const NOMBRE_ENFOQUE: Record<Enfoque, string> = { general: "Vista general", fondo: "A fondo", vivo: "En vivo", video: "En video" };

// Papeles de la presentación. Cada división del equipo asigna los papeles a
// personas; así el contenido no cambia si el equipo es de 7 u 8.
export type Rol = "orquestador" | "fundamentos" | "arquitectura" | "bd" | "orm" | "interconexion" | "plataforma" | "operacion" | "demostracion";

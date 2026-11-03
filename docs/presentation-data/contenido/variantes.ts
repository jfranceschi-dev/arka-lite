import type { Diapositiva, Guion, ModoDemo, Visual } from "./tipos.ts";

// Lo que cambia entre las dos versiones. El contenido base es la versión con
// videos; sin demostración, la parte 7 no se presenta y nada la anuncia. Aquí
// está solo lo que cambia; la validación avisa si un texto a reemplazar ya no
// existe.

export interface Cambio {
  // [texto actual, texto nuevo], en cualquier texto de la lámina.
  reemplazos?: [string, string][];
  // Campos que se cambian completos.
  campos?: Omit<Partial<Diapositiva>, "guion" | "id">;
  // Campos del guion que se cambian completos.
  guion?: Partial<Guion>;
}

export interface Modo {
  // Partes que no se presentan.
  sinSecciones?: string[];
  // Láminas sueltas que no se presentan.
  sinLaminas?: string[];
  laminas: Record<string, Cambio>;
}

const REGISTROS_SIN_VIDEO: Visual = {
  tipo: "flujo",
  pasos: [
    { icono: "server", titulo: "Los servicios", texto: "Anotan lo que hacen, con su número.", tono: "marino" },
    { icono: "scan-eye", titulo: "Promtail", texto: "El recolector: toma los registros de cada contenedor.", tono: "advertencia" },
    { icono: "archive", titulo: "Loki", texto: "La base de datos de los registros.", tono: "advertencia" },
    { icono: "chart-line", titulo: "Grafana", texto: "La pantalla para buscarlos y graficarlos.", tono: "correcto" },
  ],
};

export const CAMBIOS: Partial<Record<ModoDemo, Modo>> = {
  sin: {
    sinSecciones: ["s07"],
    sinLaminas: ["s05-flujo"],
    laminas: {
      "s05-trazabilidad": { guion: { transicion: "La imagen ya está publicada y rastreada. Ahora, dónde corre. Le paso la palabra a Moises, que nos explica Kubernetes." } },
      "s00-portada": {
        guion: { instrucciones: ["El moderador ya presentó al equipo: saludar y entrar directo al tema, sin volver a presentarse.", "Antes de empezar, abrir este PPTX en la computadora de la sala y quitar la última lámina, que es solo para el equipo."] },
      },
      "s00-agenda": {
        reemplazos: [
          ["Siete partes, en el orden", "Seis partes, en el orden"],
          ["Observabilidad y demostración en video", "Observabilidad: vista general"],
          ["que es cómo sabemos lo que pasa adentro, y les mostramos en video el sistema funcionando, incluso cuando apagamos una parte a propósito. Cerramos con los resultados.", "que es cómo sabemos lo que pasa adentro, y cerramos con los resultados."],
        ],
      },
      "s02-practica": { reemplazos: [["Lo vemos en la parte de interconexión y en la demostración.", "Lo vemos en la parte de interconexión."]] },
      // Sin el video de Grafana, vuelve el diagrama de las tres herramientas.
      "s06-logs": {
        campos: {
          idea: "Todos los registros en un solo lugar, y una sola búsqueda para seguir el recorrido.",
          comparacion: "Promtail es quien recoge las cartas, Loki es el archivo donde se guardan y Grafana es el buscador.",
          iconoComparacion: "search",
          visual: REGISTROS_SIN_VIDEO,
        },
        guion: { instrucciones: ["No hace falta explicar cómo se escribe la consulta en Grafana: basta la idea de buscar el código de la solicitud."] },
      },
      "s06-aprendizajes": { guion: { transicion: "Para cerrar, le paso la palabra a Abdiel, con los resultados." } },
      "s08-resultados": { reemplazos: [["Lo que acabamos de ver se traduce", "Gracias, Moises. Lo que les contamos se traduce"]] },
    },
  },
};

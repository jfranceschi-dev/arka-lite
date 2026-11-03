import type { ModoDemo, Rol } from "./tipos.ts";

// Recomendaciones para repartir y ensayar la presentación. Las usa el
// generador de guiones para armar guiones/reparto-y-recomendaciones.md con los
// números de lámina y los minutos de la versión actual.

// Las dos versiones: cuándo usar cada una y qué tienen de distinto.
export const VERSIONES: Record<ModoDemo, { cuando: string; cambia: string }> = {
  video: {
    cuando: "Hay tiempo para la parte 7: no necesita internet ni el sistema arriba.",
    cambia: "Tres videos dentro del PPTX, que arrancan solos: un ejemplo ilustrativo de CI/CD en la parte 5 y dos del sistema real en la parte 7.",
  },
  sin: {
    cuando: "Falta tiempo, o el público ya vio la pantalla.",
    cambia: "No hay parte 7: la observabilidad pasa directo al cierre, y nada anuncia una demostración.",
  },
};

export const GENERALES: string[] = [
  "No hace falta aprenderse el texto. Lean la sección «Qué decir» un par de veces y, en la presentación, apóyense en «Con tus palabras»: esas frases, dichas a su manera, ya cubren la lámina.",
  "Ensayen juntos al menos una vez con el PowerPoint en modo presentación: los relevos son lo que más se nota. Las láminas ya aparecen completas: no hay que hacer clics para armarlas.",
  "Cada persona ensaya con su guion de `guion-<versión>-por-persona.md`: ahí está solo lo suyo, con de quién recibe la palabra y a quién se la entrega.",
  "El bloque «Si hay tiempo» no cuenta en los minutos: úsenlo solo si van adelantados o si el público pregunta.",
  "Cada lámina trae «Lo que se lleva el staff». Si en una lámina solo alcanzan a decir una frase, que sea esa.",
  "Hay público técnico y no técnico: si una palabra técnica no se entiende, usen la frase del glosario y la comparación de la lámina.",
];

// Por qué cada papel le va a quien lo presenta, y qué cuidar al presentarlo.
export const PERFIL: Record<Rol, string> = {
  apertura: "Conecta con la presentación anterior y da el recorrido.",
  fundamentos: "Fundamentos solo cuenta lo que nos quedó: el equipo anterior ya la trabajó a fondo.",
  arquitectura: "Arquitectura solo cuenta lo que nos quedó: hexagonal ya lo explicó el equipo anterior.",
  bd: "La base de datos es el terreno que el staff mejor conoce, y nadie habla mejor su idioma.",
  orm: "Apoya a base de datos con la parte de código: la misma regla, el ORM y los datos de conexión.",
  interconexion: "Es el corazón técnico: cómo no se pierde ni se duplica nada.",
  plataforma: "Abre DevOps con el camino completo y explica cómo se empaqueta: Docker y Compose.",
  cicd: "Cómo entra un cambio y el camino automático: baja la carga del equipo de infraestructura.",
  operacion: "Operar y observar: Kubernetes, Pods, memoria y CPU, y la observabilidad.",
  demostracion: "Acompaña los videos de la pantalla con su narración.",
  cierre: "Cierra con los resultados en el idioma del negocio y recibe las preguntas.",
};

export const CONSEJOS: Record<Rol, string[]> = {
  apertura: [
    "No volver a presentar al equipo, porque ya lo hizo el moderador: abrir conectando con la presentación anterior, en menos de un minuto.",
    "Avisar desde el inicio que todo se explica con ejemplos: el público no técnico se relaja.",
  ],
  fundamentos: [
    "Ser breve: la idea fuerza es «analizar antes de programar».",
    "No enseñar Java ni Spring Boot: eso lo cubre el equipo anterior. Contar lo que nos quedó.",
  ],
  arquitectura: [
    "Hexagonal en una frase: ordena el código por dentro y no cambia cómo se instala.",
    "En «Cómo funciona en la práctica», remarcar que ninguna flecha une las dos bases.",
  ],
  bd: [
    "Apoyarse en lo que el staff ya sabe: procedimientos, BEGIN y COMMIT, llaves e índices.",
    "En «Del procedimiento almacenado al ORM», dejar claro que la base no pierde importancia: lo que cambia es dónde vive la regla.",
    "Las preguntas de código (el ORM, Java, la configuración) pasárselas a Jossett.",
  ],
  orm: [
    "Abrir «La misma regla» aclarando que los procedimientos no están mal: baja la defensiva de la sala.",
    "En «¿Qué es un ORM?», quedarse en la idea del intérprete; el detalle va en la lámina siguiente.",
    "En los datos de conexión, conectar con lo que ya hacen hoy: el web.config.",
  ],
  interconexion: [
    "Llevar la bandeja de salida y la idempotencia al mundo del staff: una tabla de pendientes con una tarea programada, y una tabla de procesados con llave única.",
    "Cerrar con «Quién habla con quién»: es el resumen de la parte. Recorrer primero el camino de arriba (lo que la persona espera) y luego el de abajo (lo que pasa después).",
  ],
  plataforma: [
    "Abrir DevOps con el camino completo antes de entrar a Docker: así cada lámina tiene su lugar.",
    "Molde y contenedor: si la sala se queda con eso, Docker ya está entendido.",
    "En «De código a contenedor», remarcar que el contenedor corre con un usuario sin privilegios, por seguridad.",
  ],
  cicd: [
    "Antes de decir CI/CD, explicar rama, main y Pull Request: sin eso, lo demás no se entiende.",
    "Usar la comparación del control de calidad y evitar el detalle del archivo del pipeline.",
    "«Cuando un cambio rompe algo» es la lámina de más valor: detenerse ahí.",
  ],
  operacion: [
    "«Contenedores y Pods» es la lámina más difícil de DevOps: seguir el diagrama de izquierda a derecha, sin apuro.",
    "Decir con honestidad qué es teórico y qué está en el proyecto: una copia por pieza y topes solo en la pantalla.",
    "Si preguntan por producción, recordar que esto es un laboratorio.",
    "En observabilidad, decir qué hace cada herramienta (Promtail recolecta, Loki guarda, Grafana muestra) y contar el caso del aviso que no llegó; no explicar cómo se escribe la consulta.",
  ],
  demostracion: [
    "Abrir el PPTX antes en la computadora de la sala y probar que los videos arrancan solos y se oyen las indicaciones.",
    "Practicar la narración con el video: Alt+P lo pausa si hace falta explicar algo.",
  ],
  cierre: [
    "Hablar en el idioma del negocio: qué gana una persona que usa el sistema.",
    "Recibir las preguntas al final y pasárselas a quien presentó esa parte, según la tabla de preguntas.",
    "Llevar el tiempo con la línea de tiempo de este documento y avisar con una seña acordada si alguien se pasa.",
  ],
};

// A quién pasarle cada tipo de pregunta del público.
export const PREGUNTAS_A_QUIEN: { tema: string; rol: Rol }[] = [
  { tema: "El negocio y el alcance del proyecto", rol: "fundamentos" },
  { tema: "Microservicios y por qué dos bases", rol: "arquitectura" },
  { tema: "Procedimientos almacenados, modelo, transacciones e índices", rol: "bd" },
  { tema: "El ORM, el SQL que genera y los datos de conexión", rol: "orm" },
  { tema: "Eventos, reintentos y duplicados", rol: "interconexion" },
  { tema: "Docker y Compose", rol: "plataforma" },
  { tema: "Git, Pull Request y el pipeline", rol: "cicd" },
  { tema: "Kubernetes, Pods, memoria y CPU", rol: "operacion" },
  { tema: "Los registros, Grafana y el número de seguimiento", rol: "operacion" },
];

// Láminas que se pueden saltar en vivo si falta tiempo (en PowerPoint:
// Ocultar diapositiva), sin tocar las partes que van en detalle.
export const RECORTES: { id: string; motivo: string }[] = [
  { id: "s02-mapa", motivo: "«Cómo funciona en la práctica» muestra lo mismo con más detalle." },
  { id: "s03-orm", motivo: "«¿Qué es un ORM?» ya deja la idea; esta lámina agrega el detalle." },
  { id: "s05-compose", motivo: "Se puede decir en una frase al final de las bondades de Docker." },
  { id: "s05-trazabilidad", motivo: "Su mensaje cabe en una frase al final del pipeline." },
  { id: "s08-sostiene", motivo: "«Resultados para el negocio» lleva el mensaje más útil." },
];

export const CHECKLIST: string[] = [
  "Descargar la última versión del PPTX y abrirla en modo presentación.",
  "Ocultar o borrar la última lámina, «Reparto de la presentación»: es solo para el equipo.",
  "En la versión con videos, comprobar que arrancan solos en la computadora de la sala.",
  "Cada persona con su guion a mano: el PDF de guion o su guion por persona en el teléfono.",
  "Acordar con Abdiel la seña de tiempo.",
];

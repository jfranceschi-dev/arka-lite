import type { Rol } from "./tipos.ts";

// Recomendaciones para repartir y ensayar la presentación. Las usa el
// generador de guiones para armar guiones/reparto-y-recomendaciones.md con los
// números de lámina y los minutos de la versión actual.

// Minutos que suma la demostración en vivo además del texto oral.
export const MINUTOS_DEMO_EN_VIVO = 3;

export const GENERALES: string[] = [
  "Ensayen juntos al menos una vez con el PowerPoint en modo presentación: los clics y los relevos son lo que más se nota.",
  "Cada persona ensaya con su guion de `guion-ejecutivo-7-personas.md`: ahí está solo lo suyo, con de quién recibe la palabra y a quién se la entrega.",
  "El bloque «Si hay tiempo» no cuenta en los minutos: úsenlo solo si van adelantados o si el público pregunta.",
  "Cada lámina trae «Lo que se lleva el staff». Si en una lámina solo alcanzan a decir una frase, que sea esa.",
  "Si una palabra técnica no se entiende, usen la frase del glosario del guion: así todo el equipo explica igual.",
];

// Por qué cada papel le va a quien lo presenta, y qué cuidar al presentarlo.
export const PERFIL: Record<Rol, string> = {
  orquestador: "Conoce el negocio de punta a punta: abre con el qué, conecta las partes y cierra con lo que el staff puede aplicar.",
  fundamentos: "Fundamentos va en vista general: el equipo anterior ya la trabajó a fondo.",
  arquitectura: "Arquitectura va en vista general: lo de hexagonal ya lo explicó el equipo anterior.",
  bd: "La base de datos es el terreno que el staff mejor conoce, y nadie habla mejor su idioma.",
  orm: "Apoya a base de datos con la parte de código: Java, el ORM y la configuración.",
  interconexion: "Es el corazón técnico: cómo no se pierde ni se duplica nada.",
  plataforma: "Construir y empaquetar con Docker y Compose, y la observabilidad.",
  operacion: "Entregar y operar: del pipeline al clúster.",
  demostracion: "Tiene práctica con la UI: hace la demostración en vivo.",
};

export const CONSEJOS: Record<Rol, string[]> = {
  orquestador: [
    "Abrir con el nombre del equipo y el enfoque: vamos a fondo en datos, interconexión y DevOps.",
    "Llevar el tiempo con la línea de tiempo de este documento y avisar con una seña acordada si alguien se pasa.",
    "En el cierre, detenerse en «Lo que pueden aplicar desde mañana»: es la lámina más importante para el staff.",
    "Recibir las preguntas y pasárselas a quien presentó esa parte, según la tabla de preguntas.",
  ],
  fundamentos: [
    "Ser breve: la idea fuerza es «primero el qué, después el cómo».",
    "Contar las buenas prácticas con ejemplos que el staff reconozca, no con detalles de Java.",
  ],
  arquitectura: [
    "Hexagonal en una frase: ordena el código por dentro y no cambia cómo se despliega.",
    "En «Cómo funciona en la práctica», remarcar que el evento es un dato que viaja, no una pieza del sistema.",
  ],
  bd: [
    "Apoyarse en lo que el staff ya sabe: procedimientos, BEGIN y COMMIT, llaves, CHECK e índices.",
    "En «Del procedimiento almacenado al ORM», dejar claro que la base no pierde importancia: lo que cambia es dónde vive la regla.",
    "Las preguntas de código (Hibernate, Java, configuración) pasárselas a Desarrollo 3.",
  ],
  orm: [
    "Entrar con «Gracias» y salir devolviendo la palabra al administrador de base de datos para la transacción: el guion ya trae las frases.",
    "Tener a mano cómo ver el SQL que genera Hibernate (spring.jpa.show-sql) por si preguntan por rendimiento.",
    "En la cadena de conexión, recalcar que la clave no está en el código ni en la imagen: es lo que más le interesa al staff.",
  ],
  interconexion: [
    "Llevar el Outbox y la idempotencia al mundo del staff: una tabla de pendientes con un job, y una tabla de procesados con llave única.",
    "Anticipar la demostración: «en un momento lo van a ver en vivo».",
  ],
  plataforma: [
    "Abrir DevOps con el ciclo completo antes de entrar a Docker: así cada lámina tiene su lugar.",
    "Ser dueño del Codespace el día de la presentación y apoyar la demostración desde la terminal.",
    "En observabilidad, mostrar Grafana en vivo solo si sobra tiempo; la lámina basta.",
  ],
  operacion: [
    "Contar el CI/CD desde el push y la diferencia entre entrega continua y despliegue continuo.",
    "«Cuando un cambio rompe algo» es la lámina de más valor del CI: detenerse ahí.",
    "Si hay un clúster local disponible, se puede borrar un Pod en vivo; si no, contarlo con los clics de la lámina.",
  ],
  demostracion: [
    "Abrir el Codespace, o el Compose local, 15 minutos antes y comprobar que Salud muestra los dos servicios en verde.",
    "Practicar la secuencia: detener notificaciones, enviar una solicitud, mirar Enviadas, levantar notificaciones y Reentregar.",
    "Plan B: si la red falla, contar la demostración con los clics de la lámina; las capturas de la UI ya están en la presentación.",
  ],
};

// A quién pasarle cada tipo de pregunta del público.
export const PREGUNTAS_A_QUIEN: { tema: string; rol: Rol }[] = [
  { tema: "El negocio y el alcance del proyecto", rol: "orquestador" },
  { tema: "Microservicios y por qué dos bases", rol: "arquitectura" },
  { tema: "Procedimientos almacenados, modelo, transacciones e índices", rol: "bd" },
  { tema: "Hibernate, el SQL que genera y la cadena de conexión", rol: "orm" },
  { tema: "Eventos, reintentos y duplicados", rol: "interconexion" },
  { tema: "Docker, Compose, Codespaces y los logs", rol: "plataforma" },
  { tema: "El pipeline, las imágenes y Kubernetes", rol: "operacion" },
  { tema: "La interfaz y la demostración", rol: "demostracion" },
];

// Láminas que se pueden saltar en vivo si falta tiempo (en PowerPoint:
// Ocultar diapositiva), sin tocar las partes que van a fondo.
export const RECORTES: { id: string; motivo: string }[] = [
  { id: "s02-mapa", motivo: "«Cómo funciona en la práctica» muestra lo mismo con más detalle." },
  { id: "s08-valor", motivo: "«Lo que pueden aplicar desde mañana» lleva el mensaje más útil para el staff." },
  { id: "s06-aprendizajes", motivo: "Su mensaje cabe en una frase al final de la lámina de logs." },
];

export const CHECKLIST: string[] = [
  "Descargar la última versión del PPTX ejecutivo de la rama y abrirla en modo presentación.",
  "Codespace arrancado 15 minutos antes, con Salud en verde y Grafana abierto en otra pestaña.",
  "Cada persona con su guion a mano: el PDF de guion o `guion-ejecutivo-7-personas.md` en el teléfono.",
  "Probar el clicker o el teclado con un diagrama que se arme por clics.",
  "Acordar con quien orquesta la seña de tiempo.",
];

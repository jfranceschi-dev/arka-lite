// Temas de Ayuda. Los primeros explican la app a quien la usa, en lenguaje
// simple; los de "Para el equipo técnico" muestran el detalle del código.

export type GrupoAyuda = "Para usar la app" | "Cómo está hecha" | "Para el equipo técnico";

export interface TemaAyuda {
  id: string;
  grupo: GrupoAyuda;
  titulo: string;
  // La pregunta que responde, como título de la página.
  pregunta: string;
  resumen: string;
  // Sin diagrama: la página de contratos y peticiones.
  diagrama?: string;
  // Diagramas técnicos: muestran qué hace cada pieza y qué archivo la implementa.
  tecnico?: boolean;
  probar?: { texto: string; vista: "solicitudes" | "enviadas" | "salud" };
}

export const temasAyuda: TemaAyuda[] = [
  { id: "mapa", grupo: "Para usar la app", titulo: "¿Qué es ARKA-Lite?", pregunta: "¿Qué es ARKA-Lite y qué piezas tiene?",
    resumen: "Una aplicación para registrar solicitudes y avisar cuando se envían. Por dentro son dos servicios que trabajan juntos, cada uno con su propia base de datos.",
    diagrama: "arquitectura", probar: { texto: "Ver la salud de los dos servicios", vista: "salud" } },
  { id: "crear", grupo: "Para usar la app", titulo: "Crear una solicitud", pregunta: "¿Qué pasa cuando creo una solicitud?",
    resumen: "El servicio revisa los datos y guarda la solicitud en BORRADOR. Si el identificador ya existe, te lo dice y no guarda nada.",
    diagrama: "ayuda-crear", probar: { texto: "Crear una solicitud", vista: "solicitudes" } },
  { id: "enviar", grupo: "Para usar la app", titulo: "Qué pasa al enviar", pregunta: "¿Qué pasa cuando envío una solicitud?",
    resumen: "Primero se guarda y después se avisa. Por eso el aviso puede tardar unos segundos, y por eso nunca se pierde aunque notificaciones esté caído.",
    diagrama: "ayuda-enviar", probar: { texto: "Enviar una solicitud", vista: "solicitudes" } },
  { id: "duplicado", grupo: "Para usar la app", titulo: "Por qué el aviso no se duplica", pregunta: "¿Por qué nunca aparecen dos avisos?",
    resumen: "Cada evento tiene un número único. Notificaciones anota los números que ya recibió y, si uno se repite, lo ignora.",
    diagrama: "ayuda-duplicado", probar: { texto: "Probar con Reentregar", vista: "enviadas" } },
  { id: "salud", grupo: "Para usar la app", titulo: "Cómo saber si todo funciona", pregunta: "¿Cómo sé si los servicios están bien?",
    resumen: "La app le pregunta a cada servicio si responde y si tiene su base de datos disponible.",
    diagrama: "ayuda-salud", probar: { texto: "Validar los servicios", vista: "salud" } },

  { id: "macro", grupo: "Cómo está hecha", titulo: "La arquitectura completa", pregunta: "¿Cómo está armado todo el sistema?",
    resumen: "Las piezas que corren juntas, cómo llegan las versiones nuevas y a dónde van los logs.", diagrama: "macro" },
  { id: "componentes", grupo: "Cómo está hecha", titulo: "Por dentro de un servicio", pregunta: "¿Qué hay dentro de servicio-solicitudes?",
    resumen: "Puertos y adaptadores: las reglas del negocio en el centro y la tecnología en los bordes.", diagrama: "componentes" },
  { id: "monolito", grupo: "Cómo está hecha", titulo: "Por qué dos servicios", pregunta: "¿Por qué no es una sola aplicación?",
    resumen: "El trámite y los avisos cambian por motivos distintos, así que cada uno es un servicio con su base.", diagrama: "monolito" },

  { id: "tec-rest", grupo: "Para el equipo técnico", titulo: "POST /solicitudes", pregunta: "Crear una solicitud, capa por capa", resumen: "Controlador, servicio, adaptador JPA y manejo global de errores.", diagrama: "rest", tecnico: true },
  { id: "tec-consulta", grupo: "Para el equipo técnico", titulo: "GET /solicitudes/{id}", pregunta: "Consultar una solicitud, capa por capa", resumen: "Del controlador a PostgreSQL y de vuelta.", diagrama: "consulta", tecnico: true },
  { id: "tec-envio", grupo: "Para el equipo técnico", titulo: "Envío y transacción", pregunta: "Estado y evento en una sola transacción", resumen: "Qué confirma la respuesta de POST /solicitudes/{id}/enviar.", diagrama: "envio", tecnico: true },
  { id: "tec-entrega", grupo: "Para el equipo técnico", titulo: "Outbox e idempotencia", pregunta: "Entrega posterior del evento", resumen: "Relevador, publicador con reintentos y consumo idempotente.", diagrama: "entrega", tecnico: true },
  { id: "tec-datos", grupo: "Para el equipo técnico", titulo: "Dónde vive cada dato", pregunta: "Dónde vive cada dato", resumen: "Dos bases PostgreSQL y una lista en memoria.", diagrama: "almacenamiento", tecnico: true },
  { id: "tec-adaptadores", grupo: "Para el equipo técnico", titulo: "Dependencias y @Primary", pregunta: "Dependencias de código frente a llamadas", resumen: "Quién conoce a quién y cómo Spring elige el adaptador.", diagrama: "dependencias", tecnico: true },
  { id: "tec-ui", grupo: "Para el equipo técnico", titulo: "Cómo llama la UI", pregunta: "De un clic a una pantalla actualizada", resumen: "Cliente HTTP, proxy /api y servicios.", diagrama: "ui", tecnico: true },
  { id: "tec-docker", grupo: "Para el equipo técnico", titulo: "Docker", pregunta: "De Dockerfile a contenedor", resumen: "Construcción en dos etapas, imagen, contenedor, red y puertos.", diagrama: "docker", tecnico: true },
  { id: "tec-kubernetes", grupo: "Para el equipo técnico", titulo: "Kubernetes", pregunta: "Los recursos de Kubernetes", resumen: "Deployment, Pod, Service, Secret y PVC.", diagrama: "kubernetes", tecnico: true },
  { id: "tec-cicd", grupo: "Para el equipo técnico", titulo: "Pipeline", pregunta: "De un push a una imagen publicada", resumen: "Los pasos de GitHub Actions.", diagrama: "cicd", tecnico: true },
  { id: "tec-logs", grupo: "Para el equipo técnico", titulo: "Logs", pregunta: "Recorrido de los logs", resumen: "La app escribe, Promtail recoge, Loki guarda y Grafana muestra.", diagrama: "logs", tecnico: true },
  { id: "tec-metricas", grupo: "Para el equipo técnico", titulo: "Salud y métricas", pregunta: "Salud y métricas", resumen: "Qué expone Actuator y qué queda pendiente.", diagrama: "metricas", tecnico: true },
  { id: "detalle", grupo: "Para el equipo técnico", titulo: "Contratos y peticiones", pregunta: "Contratos de la API y peticiones de esta sesión", resumen: "Cada ruta que usa la UI, a qué servicio llega y qué puede responder. Abajo, las peticiones que hizo esta pestaña." },
];

export function temaPorId(id: string | null): TemaAyuda {
  return temasAyuda.find((t) => t.id === id) ?? temasAyuda[0];
}

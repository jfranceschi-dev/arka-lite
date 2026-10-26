// Catálogo de operaciones del laboratorio. Cada ruta se comprobó en el código:
// SolicitudController, NotificacionController, EventoController,
// ManejadorGlobalDeErrores y application.properties de cada servicio.
// El navegador siempre usa /api del mismo origen; el proxy traduce.

export type Servicio = "solicitudes" | "notificaciones";

export interface RespuestaContrato {
  status: string;
  cuando: string;
  cuerpo: string;
}

export interface Operacion {
  id: string;
  etiqueta: string;
  servicio: Servicio;
  metodo: "GET" | "POST";
  // Ruta para el navegador; {id} se reemplaza con la solicitud elegida.
  ruta: string;
  // Ruta real en el servicio, después del proxy.
  rutaServicio: string;
  escritura: boolean;
  sencillo: string;
  despues: string;
  respuestas: RespuestaContrato[];
  // Diapositiva que explica la operación.
  explicacion: string;
  archivo: string;
}

const CTRL = "servicio-solicitudes/…/adaptadores/entrada/SolicitudController.java";

export const operaciones: Operacion[] = [
  {
    id: "listar",
    etiqueta: "Listar solicitudes",
    servicio: "solicitudes",
    metodo: "GET",
    ruta: "/api/solicitudes",
    rutaServicio: "/solicitudes",
    escritura: false,
    sencillo: "Ver todas las solicitudes guardadas en PostgreSQL.",
    despues: "Nada cambia: es una consulta.",
    respuestas: [{ status: "200", cuando: "Siempre que el servicio responde.", cuerpo: "[{ id, tipo, estado }]" }],
    explicacion: "s02-consulta",
    archivo: CTRL,
  },
  {
    id: "consultar",
    etiqueta: "Consultar una solicitud",
    servicio: "solicitudes",
    metodo: "GET",
    ruta: "/api/solicitudes/{id}",
    rutaServicio: "/solicitudes/{id}",
    escritura: false,
    sencillo: "Ver el estado actual de una solicitud.",
    despues: "Nada cambia: es una consulta.",
    respuestas: [
      { status: "200", cuando: "La solicitud existe.", cuerpo: "{ id, tipo, estado }" },
      { status: "404", cuando: "No existe.", cuerpo: "{ estado: 404, mensaje: \"No existe la solicitud …\" }" },
    ],
    explicacion: "s02-consulta",
    archivo: CTRL,
  },
  {
    id: "crear",
    etiqueta: "Crear INC-002",
    servicio: "solicitudes",
    metodo: "POST",
    ruta: "/api/solicitudes/crear",
    rutaServicio: "/solicitudes/crear",
    escritura: true,
    sencillo: "Crear la solicitud de demostración INC-002 en BORRADOR.",
    despues: "La API siempre usa el id INC-002 y el tipo Incidencia. Si INC-002 ya existe, vuelve a quedar en BORRADOR.",
    respuestas: [{ status: "200", cuando: "Se guardó.", cuerpo: "{ id: \"INC-002\", tipo: \"Incidencia\", estado: \"BORRADOR\" }" }],
    explicacion: "s01-record",
    archivo: CTRL,
  },
  {
    id: "enviar",
    etiqueta: "Enviar",
    servicio: "solicitudes",
    metodo: "POST",
    ruta: "/api/solicitudes/{id}/enviar",
    rutaServicio: "/solicitudes/{id}/enviar",
    escritura: true,
    sencillo: "Pasar la solicitud de BORRADOR a ENVIADA y registrar el evento.",
    despues: "El relevador intentará entregar el evento en un ciclo posterior. La UI no ve ese paso.",
    respuestas: [
      { status: "200", cuando: "Estaba en BORRADOR.", cuerpo: "{ id, tipo, estado: \"ENVIADA\" } — sin eventoId" },
      { status: "404", cuando: "No existe.", cuerpo: "{ estado: 404, mensaje }" },
      { status: "500", cuando: "No estaba en BORRADOR: IllegalStateException sin manejador.", cuerpo: "Error genérico de Spring Boot" },
    ],
    explicacion: "s03-envio",
    archivo: CTRL,
  },
  {
    id: "aprobar",
    etiqueta: "Aprobar",
    servicio: "solicitudes",
    metodo: "POST",
    ruta: "/api/solicitudes/{id}/aprobar",
    rutaServicio: "/solicitudes/{id}/aprobar",
    escritura: true,
    sencillo: "Aprobar una solicitud ENVIADA.",
    despues: "No genera evento ni aviso.",
    respuestas: [
      { status: "200", cuando: "Estaba ENVIADA.", cuerpo: "{ id, tipo, estado: \"APROBADA\" }" },
      { status: "404", cuando: "No existe.", cuerpo: "{ estado: 404, mensaje }" },
      { status: "500", cuando: "No estaba ENVIADA.", cuerpo: "Error genérico de Spring Boot" },
    ],
    explicacion: "s01-record",
    archivo: CTRL,
  },
  {
    id: "rechazar",
    etiqueta: "Rechazar",
    servicio: "solicitudes",
    metodo: "POST",
    ruta: "/api/solicitudes/{id}/rechazar",
    rutaServicio: "/solicitudes/{id}/rechazar",
    escritura: true,
    sencillo: "Rechazar una solicitud ENVIADA.",
    despues: "No genera evento ni aviso.",
    respuestas: [
      { status: "200", cuando: "Estaba ENVIADA.", cuerpo: "{ id, tipo, estado: \"RECHAZADA\" }" },
      { status: "404", cuando: "No existe.", cuerpo: "{ estado: 404, mensaje }" },
      { status: "500", cuando: "No estaba ENVIADA.", cuerpo: "Error genérico de Spring Boot" },
    ],
    explicacion: "s01-record",
    archivo: CTRL,
  },
  {
    id: "avisos",
    etiqueta: "Consultar avisos",
    servicio: "notificaciones",
    metodo: "GET",
    ruta: "/api/notificaciones",
    rutaServicio: "/notificaciones",
    escritura: false,
    sencillo: "Ver los textos de aviso. Viven en memoria del servicio.",
    despues: "Nada cambia. Si el servicio reinicia, esta lista empieza vacía.",
    respuestas: [{ status: "200", cuando: "Siempre que el servicio responde.", cuerpo: "[{ texto }]" }],
    explicacion: "s08-almacenamiento",
    archivo: "servicio-notificaciones/…/adaptadores/entrada/NotificacionController.java",
  },
  {
    id: "procesados",
    etiqueta: "Consultar eventos consumidos",
    servicio: "notificaciones",
    metodo: "GET",
    ruta: "/api/eventos/procesados",
    rutaServicio: "/eventos/procesados",
    escritura: false,
    sencillo: "Ver los eventoId ya consumidos. Se guardan en PostgreSQL.",
    despues: "Nada cambia. La respuesta no dice a qué solicitud pertenece cada id.",
    respuestas: [{ status: "200", cuando: "Siempre que el servicio responde.", cuerpo: "[\"uuid\", …]" }],
    explicacion: "s08-idempotencia",
    archivo: "servicio-notificaciones/…/adaptadores/entrada/EventoController.java",
  },
  {
    id: "saludSolicitudes",
    etiqueta: "Salud de solicitudes",
    servicio: "solicitudes",
    metodo: "GET",
    ruta: "/api/salud/solicitudes",
    rutaServicio: "/actuator/health",
    escritura: false,
    sencillo: "Preguntar a Actuator si el servicio y su base están bien.",
    despues: "UP no demuestra que los eventos terminaron su recorrido.",
    respuestas: [
      { status: "200", cuando: "UP.", cuerpo: "{ status: \"UP\", components: { db, … } }" },
      { status: "503", cuando: "DOWN.", cuerpo: "{ status: \"DOWN\", … }" },
    ],
    explicacion: "s09-health",
    archivo: "servicio-solicitudes/src/main/resources/application.properties",
  },
  {
    id: "saludNotificaciones",
    etiqueta: "Salud de notificaciones",
    servicio: "notificaciones",
    metodo: "GET",
    ruta: "/api/salud/notificaciones",
    rutaServicio: "/actuator/health",
    escritura: false,
    sencillo: "Preguntar a Actuator si notificaciones y su base están bien.",
    despues: "UP no demuestra que los avisos estén completos.",
    respuestas: [
      { status: "200", cuando: "UP.", cuerpo: "{ status: \"UP\", components: { db, … } }" },
      { status: "503", cuando: "DOWN.", cuerpo: "{ status: \"DOWN\", … }" },
    ],
    explicacion: "s09-health",
    archivo: "servicio-notificaciones/src/main/resources/application.properties",
  },
];

export function operacionPorId(id: string): Operacion {
  const o = operaciones.find((x) => x.id === id);
  if (!o) throw new Error(`No existe la operación ${id}`);
  return o;
}

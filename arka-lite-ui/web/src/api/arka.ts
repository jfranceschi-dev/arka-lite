import type { RegistroPeticion } from "./cliente.ts";

// Formas de los cuerpos JSON tal como los devuelven los controladores hoy.
export type EstadoSolicitud = "BORRADOR" | "ENVIADA" | "APROBADA" | "RECHAZADA";

export interface Solicitud {
  id: string;
  tipo: string;
  estado: EstadoSolicitud;
}

export interface Notificacion {
  texto: string;
}

export function esSolicitud(x: unknown): x is Solicitud {
  return !!x && typeof x === "object" && typeof (x as Solicitud).id === "string" && typeof (x as Solicitud).estado === "string";
}

export function comoSolicitudes(r: RegistroPeticion | undefined): Solicitud[] | null {
  if (!r || r.estado !== "correcto") return null;
  if (Array.isArray(r.respuesta)) return r.respuesta.filter(esSolicitud);
  if (esSolicitud(r.respuesta)) return [r.respuesta];
  return null;
}

export function comoAvisos(r: RegistroPeticion | undefined): Notificacion[] | null {
  if (!r || r.estado !== "correcto" || !Array.isArray(r.respuesta)) return null;
  return r.respuesta.filter((x): x is Notificacion => !!x && typeof x === "object" && typeof (x as Notificacion).texto === "string");
}

export function comoIdsConsumidos(r: RegistroPeticion | undefined): string[] | null {
  if (!r || r.estado !== "correcto" || !Array.isArray(r.respuesta)) return null;
  return r.respuesta.filter((x): x is string => typeof x === "string");
}

// ServicioDeNotificaciones arma el texto como "Solicitud <id> (<tipo>) enviada".
export function avisoDe(avisos: Notificacion[], idSolicitud: string): Notificacion | undefined {
  return avisos.find((a) => a.texto.startsWith(`Solicitud ${idSolicitud} `));
}

// Estado más reciente conocido de cada solicitud según las respuestas
// observadas, de la más nueva a la más vieja.
export function estadosConocidos(registros: RegistroPeticion[]): Map<string, Solicitud> {
  const mapa = new Map<string, Solicitud>();
  for (const r of registros) {
    if (r.servicio !== "solicitudes" || r.estado !== "correcto") continue;
    const lista = comoSolicitudes(r) ?? [];
    for (const s of lista) if (!mapa.has(s.id)) mapa.set(s.id, s);
  }
  return mapa;
}

export interface Permiso {
  permitido: boolean;
  motivo: string;
}

// Qué escrituras corresponden al estado actual. La regla vive en el record
// Solicitud; aquí solo se explica antes de enviar la petición.
export function permisoEscritura(operacion: string, s: Solicitud | undefined): Permiso {
  if (operacion === "crear") return { permitido: true, motivo: "Crea INC-002 en BORRADOR. Si ya existe, vuelve a BORRADOR." };
  if (!s) return { permitido: false, motivo: "Primero lista o consulta la solicitud para conocer su estado." };
  if (operacion === "enviar") {
    return s.estado === "BORRADOR"
      ? { permitido: true, motivo: "Está en BORRADOR: se puede enviar." }
      : { permitido: false, motivo: `${s.id} está ${s.estado}. Solo se envía desde BORRADOR; la API respondería 409.` };
  }
  if (operacion === "aprobar" || operacion === "rechazar") {
    return s.estado === "ENVIADA"
      ? { permitido: true, motivo: "Está ENVIADA: se puede decidir." }
      : { permitido: false, motivo: `${s.id} está ${s.estado}. Solo se decide una solicitud ENVIADA; la API respondería 409.` };
  }
  return { permitido: false, motivo: "Operación desconocida." };
}

// GET /eventos de solicitudes: una fila por evento del outbox.
export interface EventoSaliente {
  eventoId: string;
  solicitudId: string;
  tipo: string;
  procesado: boolean;
}

export function comoEventosSalientes(r: RegistroPeticion | undefined): EventoSaliente[] | null {
  if (!r || r.estado !== "correcto" || !Array.isArray(r.respuesta)) return null;
  return r.respuesta.filter((x): x is EventoSaliente =>
    !!x && typeof x === "object" && typeof (x as EventoSaliente).eventoId === "string" && typeof (x as EventoSaliente).solicitudId === "string");
}

export function avisosDe(avisos: Notificacion[], idSolicitud: string): Notificacion[] {
  return avisos.filter((a) => a.texto.startsWith(`Solicitud ${idSolicitud} `));
}

// Ids creados desde este navegador. Es una comodidad local: si el
// almacenamiento no está disponible, la lista empieza vacía.
const CLAVE_MIAS = "arka-lite-ui:mis-solicitudes";

export function leerMisSolicitudes(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(CLAVE_MIAS) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function guardarMisSolicitudes(ids: string[]): void {
  try {
    localStorage.setItem(CLAVE_MIAS, JSON.stringify(ids.slice(0, 100)));
  } catch {
    // Sin almacenamiento local la lista vive solo mientras la pestaña esté abierta.
  }
}

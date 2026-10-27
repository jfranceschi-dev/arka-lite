import type { Operacion, Servicio } from "../../../contenido/laboratorio.ts";

// Cliente HTTP del laboratorio. Registra solo lo que esta UI envía y recibe.
// No reintenta: tras un tiempo agotado, un POST pudo haberse confirmado.
// No guarda headers, cookies ni credenciales.

export type TipoError = "http" | "tiempo" | "conexion" | "proxy";

export interface RegistroPeticion {
  id: string;
  operacionId: string;
  etiqueta: string;
  servicio: Servicio;
  metodo: "GET" | "POST";
  url: string;
  destinoInterno: string;
  escritura: boolean;
  inicio: string;
  duracionMs: number | null;
  estado: "esperando" | "correcto" | "error";
  status: number | null;
  cuerpoEnviado: string | null;
  respuesta: unknown;
  textoRespuesta: string | null;
  error: { tipo: TipoError; mensaje: string } | null;
  ids: string[];
}

export interface OpcionesCliente {
  limiteMs?: number;
  fetchImpl?: typeof fetch;
  ahora?: () => number;
  alIniciar?: (r: RegistroPeticion) => void;
}

export const LIMITE_MS = 10_000;

let contador = 0;
function nuevoId(): string {
  contador += 1;
  return `p${Date.now().toString(36)}-${contador}`;
}

export function construirUrl(op: Operacion, id?: string): string {
  if (op.ruta.includes("{id}")) {
    if (!id) throw new Error(`${op.etiqueta} necesita el id de una solicitud`);
    return op.ruta.replace("{id}", encodeURIComponent(id));
  }
  return op.ruta;
}

// Identificadores que trae la respuesta. Nunca se supone un eventoId: la
// respuesta de enviar no lo incluye.
export function extraerIds(cuerpo: unknown): string[] {
  if (Array.isArray(cuerpo)) {
    return cuerpo.flatMap((x) => (typeof x === "string" ? [x] : extraerIds(x)));
  }
  if (cuerpo && typeof cuerpo === "object" && "id" in cuerpo && typeof (cuerpo as { id: unknown }).id === "string") {
    return [(cuerpo as { id: string }).id];
  }
  return [];
}

function mensajeHttp(status: number, cuerpo: unknown): string {
  if (cuerpo && typeof cuerpo === "object") {
    const c = cuerpo as Record<string, unknown>;
    if (typeof c.mensaje === "string") return c.mensaje;
    if (typeof c.error === "string") return `${c.error}${typeof c.path === "string" ? ` en ${c.path}` : ""}`;
    if (typeof c.status === "string") return `Estado ${c.status}`;
  }
  if (status === 404) return "No encontrado.";
  if (status === 409) return "Conflicto con el estado actual.";
  if (status >= 500) return "El servicio respondió con un error interno.";
  return `Respuesta ${status}.`;
}

// cuerpo: objeto que se envía como JSON (crear una solicitud, reentregar un evento).
export async function ejecutar(op: Operacion, id: string | undefined, opciones: OpcionesCliente = {}, cuerpo?: unknown): Promise<RegistroPeticion> {
  const fetchImpl = opciones.fetchImpl ?? fetch;
  const ahora = opciones.ahora ?? (() => performance.now());
  const limite = opciones.limiteMs ?? LIMITE_MS;
  const url = construirUrl(op, id);
  const registro: RegistroPeticion = {
    id: nuevoId(),
    operacionId: op.id,
    etiqueta: id && op.ruta.includes("{id}") ? `${op.etiqueta} ${id}` : op.etiqueta,
    servicio: op.servicio,
    metodo: op.metodo,
    url,
    destinoInterno: `servicio-${op.servicio}:8080${op.rutaServicio.replace("{id}", id ?? "{id}")}`,
    escritura: op.escritura,
    inicio: new Date().toISOString(),
    duracionMs: null,
    estado: "esperando",
    status: null,
    cuerpoEnviado: cuerpo === undefined ? null : JSON.stringify(cuerpo),
    respuesta: null,
    textoRespuesta: null,
    error: null,
    ids: [],
  };
  opciones.alIniciar?.({ ...registro });

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), limite);
  const t0 = ahora();
  try {
    const r = await fetchImpl(url, {
      method: op.metodo,
      headers: cuerpo === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: registro.cuerpoEnviado ?? undefined,
      credentials: "omit",
      cache: "no-store",
      signal: control.signal,
    });
    const texto = await r.text();
    let recibido: unknown = null;
    let esJson = false;
    if (texto) {
      try {
        recibido = JSON.parse(texto);
        esJson = true;
      } catch {
        recibido = null;
      }
    }
    registro.duracionMs = Math.round(ahora() - t0);
    registro.status = r.status;
    registro.textoRespuesta = texto || null;
    registro.respuesta = recibido;
    if (r.ok) {
      registro.estado = "correcto";
      registro.ids = extraerIds(recibido);
    } else if (!esJson && [502, 503, 504].includes(r.status)) {
      registro.estado = "error";
      registro.error = { tipo: "proxy", mensaje: `El proxy no pudo llegar a servicio-${op.servicio} (${r.status}).` };
    } else {
      registro.estado = "error";
      registro.error = { tipo: "http", mensaje: mensajeHttp(r.status, recibido) };
    }
  } catch (e) {
    registro.duracionMs = Math.round(ahora() - t0);
    registro.estado = "error";
    if (control.signal.aborted) {
      registro.error = {
        tipo: "tiempo",
        mensaje: op.escritura
          ? `Sin respuesta en ${limite / 1000} s. El cambio pudo haberse guardado: consulta el estado antes de repetir.`
          : `Sin respuesta en ${limite / 1000} s.`,
      };
    } else {
      registro.error = { tipo: "conexion", mensaje: `Sin conexión con el proxy /api (${e instanceof Error ? e.message : "error de red"}).` };
    }
  } finally {
    clearTimeout(temporizador);
  }
  return registro;
}

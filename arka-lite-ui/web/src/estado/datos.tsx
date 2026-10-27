import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { operacionPorId } from "../../../contenido/laboratorio.ts";
import { avisosDe, comoAvisos, comoEventosSalientes, comoIdsConsumidos, comoSolicitudes, guardarMisSolicitudes, leerMisSolicitudes, type EventoSaliente, type Notificacion, type Solicitud } from "../api/arka.ts";
import type { RegistroPeticion } from "../api/cliente.ts";
import { useHistorial } from "./historial.tsx";

// Lo que la UI sabe de los dos servicios, compartido por todas las pantallas.
// Mientras haya eventos sin consumir se vuelve a consultar cada 5 s (el ciclo
// del relevador), con un máximo para no consultar sin fin.

export const PERIODO_MS = 5000;
const MAX_ACTUALIZACIONES = 12;

export interface SaludServicio {
  estado: "sin-validar" | "validando" | "up" | "down" | "sin-respuesta";
  ms: number | null;
  base: string | null;
  validadoEn: number | null;
}

export interface FilaEnviada {
  solicitud: Solicitud;
  evento: EventoSaliente;
  consumido: boolean;
  avisos: number;
}

interface Datos {
  solicitudes: Solicitud[] | null;
  salientes: EventoSaliente[] | null;
  consumidos: string[] | null;
  avisos: Notificacion[] | null;
  salud: { solicitudes: SaludServicio; notificaciones: SaludServicio };
  mias: string[];
  // false hasta la primera consulta: así "cargando" no se confunde con "falló".
  cargado: boolean;
  pendientes: number;
  enviadas: FilaEnviada[];
  duplicados: number;
  // Cambia cada vez que un evento termina su recorrido; la UI lo anima.
  pulso: number;
  actualizar: () => Promise<void>;
  validarSalud: () => Promise<void>;
  crear: (id: string, tipo: string) => Promise<RegistroPeticion>;
  cambiarEstado: (accion: "enviar" | "aprobar" | "rechazar", id: string) => Promise<RegistroPeticion>;
  reentregar: (e: EventoSaliente) => Promise<{ r: RegistroPeticion; antes: number; despues: number }>;
}

const Contexto = createContext<Datos | null>(null);
const SIN_VALIDAR: SaludServicio = { estado: "sin-validar", ms: null, base: null, validadoEn: null };

function leerSalud(r: RegistroPeticion): SaludServicio {
  const cuerpo = r.respuesta as { status?: string; components?: { db?: { status?: string } } } | null;
  const estado = cuerpo?.status === "UP" ? "up" : cuerpo?.status ? "down" : "sin-respuesta";
  return { estado, ms: r.duracionMs, base: cuerpo?.components?.db?.status ?? null, validadoEn: Date.now() };
}

export function ProveedorDatos({ children }: { children: ReactNode }) {
  const { lanzar } = useHistorial();
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);
  const [salientes, setSalientes] = useState<EventoSaliente[] | null>(null);
  const [consumidos, setConsumidos] = useState<string[] | null>(null);
  const [avisos, setAvisos] = useState<Notificacion[] | null>(null);
  const [salud, setSalud] = useState({ solicitudes: SIN_VALIDAR, notificaciones: SIN_VALIDAR });
  const [mias, setMias] = useState<string[]>(leerMisSolicitudes);
  const [pulso, setPulso] = useState(0);
  const [cargado, setCargado] = useState(false);
  const vueltas = useRef(0);
  const consumidosAntes = useRef<number | null>(null);

  const actualizar = useCallback(async () => {
    const [s, e, c, a] = await Promise.all([
      lanzar(operacionPorId("listar")),
      lanzar(operacionPorId("salientes")),
      lanzar(operacionPorId("procesados")),
      lanzar(operacionPorId("avisos")),
    ]);
    setSolicitudes(comoSolicitudes(s));
    setSalientes(comoEventosSalientes(e));
    const ids = comoIdsConsumidos(c);
    setConsumidos(ids);
    setAvisos(comoAvisos(a));
    if (ids && consumidosAntes.current !== null && ids.length > consumidosAntes.current) setPulso((n) => n + 1);
    if (ids) consumidosAntes.current = ids.length;
    setCargado(true);
  }, [lanzar]);

  const validarSalud = useCallback(async () => {
    setSalud((x) => ({ solicitudes: { ...x.solicitudes, estado: "validando" }, notificaciones: { ...x.notificaciones, estado: "validando" } }));
    const [s, n] = await Promise.all([lanzar(operacionPorId("saludSolicitudes")), lanzar(operacionPorId("saludNotificaciones"))]);
    setSalud({ solicitudes: leerSalud(s), notificaciones: leerSalud(n) });
  }, [lanzar]);

  useEffect(() => {
    void validarSalud();
    void actualizar();
  }, [validarSalud, actualizar]);

  const pendientes = useMemo(() => {
    if (!salientes || !consumidos) return 0;
    const ya = new Set(consumidos);
    return salientes.filter((e) => !e.procesado || !ya.has(e.eventoId)).length;
  }, [salientes, consumidos]);

  useEffect(() => {
    if (pendientes === 0) { vueltas.current = 0; return; }
    if (vueltas.current >= MAX_ACTUALIZACIONES) return;
    const t = setTimeout(() => { vueltas.current += 1; void actualizar(); }, PERIODO_MS);
    return () => clearTimeout(t);
  }, [pendientes, salientes, consumidos, actualizar]);

  const enviadas = useMemo<FilaEnviada[]>(() => {
    const porId = new Map((solicitudes ?? []).map((s) => [s.id, s]));
    const ya = new Set(consumidos ?? []);
    return [...(salientes ?? [])].reverse().map((e) => ({
      solicitud: porId.get(e.solicitudId) ?? { id: e.solicitudId, tipo: "—", estado: "ENVIADA" },
      evento: e,
      consumido: ya.has(e.eventoId),
      avisos: avisosDe(avisos ?? [], e.solicitudId).length,
    }));
  }, [solicitudes, salientes, consumidos, avisos]);

  // Avisos de más: una solicitud con más avisos que eventos consumidos.
  const duplicados = useMemo(() => {
    const porSolicitud = new Map<string, number>();
    for (const f of enviadas) if (f.consumido) porSolicitud.set(f.evento.solicitudId, (porSolicitud.get(f.evento.solicitudId) ?? 0) + 1);
    let n = 0;
    for (const [id, c] of porSolicitud) n += Math.max(0, avisosDe(avisos ?? [], id).length - c);
    return n;
  }, [enviadas, avisos]);

  const crear = useCallback(async (id: string, tipo: string) => {
    const r = await lanzar(operacionPorId("crearNueva"), undefined, { id, tipo });
    const creada = comoSolicitudes(r)?.[0];
    if (r.estado === "correcto" && creada) {
      setMias((m) => { const n = [creada.id, ...m.filter((x) => x !== creada.id)]; guardarMisSolicitudes(n); return n; });
      await actualizar();
    }
    return r;
  }, [lanzar, actualizar]);

  const cambiarEstado = useCallback(async (accion: "enviar" | "aprobar" | "rechazar", id: string) => {
    const r = await lanzar(operacionPorId(accion), id);
    vueltas.current = 0;
    await actualizar();
    return r;
  }, [lanzar, actualizar]);

  const reentregar = useCallback(async (e: EventoSaliente) => {
    const antes = avisosDe(avisos ?? [], e.solicitudId).length;
    const r = await lanzar(operacionPorId("reentregar"), undefined, { eventoId: e.eventoId, id: e.solicitudId, tipo: e.tipo });
    const a = comoAvisos(await lanzar(operacionPorId("avisos"))) ?? [];
    setAvisos(a);
    await actualizar();
    return { r, antes, despues: avisosDe(a, e.solicitudId).length };
  }, [lanzar, actualizar, avisos]);

  const valor = useMemo<Datos>(() => ({
    solicitudes, salientes, consumidos, avisos, salud, mias, cargado, pendientes, enviadas, duplicados, pulso,
    actualizar, validarSalud, crear, cambiarEstado, reentregar,
  }), [solicitudes, salientes, consumidos, avisos, salud, mias, cargado, pendientes, enviadas, duplicados, pulso, actualizar, validarSalud, crear, cambiarEstado, reentregar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useDatos(): Datos {
  const v = useContext(Contexto);
  if (!v) throw new Error("useDatos fuera de ProveedorDatos");
  return v;
}

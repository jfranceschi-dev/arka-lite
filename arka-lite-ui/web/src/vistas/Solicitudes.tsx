import { useMemo, useState, type FormEvent } from "react";
import { avisosDe, type Solicitud } from "../api/arka.ts";
import type { RegistroPeticion } from "../api/cliente.ts";
import { useDatos } from "../estado/datos.tsx";
import { Encabezado, Marco, Tarjeta } from "../componentes/Marco.tsx";
import { SelectorTipo } from "../componentes/SelectorTipo.tsx";
import { TablaDatos, esc, type Columna } from "../componentes/TablaDatos.tsx";
import { avisar, confirmar, informarError } from "../componentes/dialogos.ts";
import { Icono } from "../componentes/Iconos.tsx";
import { rutaA } from "../rutas.ts";

type Filtro = "todas" | "mias" | "borrador" | "enviadas";
type Accion = "enviar" | "aprobar" | "rechazar";

const ESTADOS: Record<string, { texto: string; clase: string }> = {
  BORRADOR: { texto: "Borrador", clase: "insignia insignia-borrador" },
  ENVIADA: { texto: "Enviada", clase: "insignia insignia-enviada" },
  APROBADA: { texto: "Aprobada", clase: "insignia insignia-aprobada" },
  RECHAZADA: { texto: "Rechazada", clase: "insignia insignia-rechazada" },
};

export const insignia = (estado: string) => {
  const e = ESTADOS[estado] ?? { texto: estado, clase: "insignia insignia-borrador" };
  return `<span class="${e.clase}">${esc(e.texto)}</span>`;
};

const boton = (accion: Accion, id: string, texto: string, estilo: string) =>
  `<button type="button" class="arka-boton arka-boton-chico ${estilo}" data-accion="${accion}" data-id="${esc(id)}" aria-label="${esc(texto)} ${esc(id)}">${esc(texto)}</button>`;

const CONFIRMACIONES: Record<Accion, (id: string) => { titulo: string; texto: string; confirmar: string; tono?: "peligro" }> = {
  enviar: (id) => ({ titulo: `¿Enviar ${id}?`, texto: "Pasará a ENVIADA y, en unos segundos, notificaciones creará su aviso.", confirmar: "Sí, enviar" }),
  aprobar: (id) => ({ titulo: `¿Aprobar ${id}?`, texto: "La solicitud quedará APROBADA. Esta decisión no se puede cambiar.", confirmar: "Sí, aprobar" }),
  rechazar: (id) => ({ titulo: `¿Rechazar ${id}?`, texto: "La solicitud quedará RECHAZADA. Esta decisión no se puede cambiar.", confirmar: "Sí, rechazar", tono: "peligro" }),
};

const HECHO: Record<Accion, string> = { enviar: "enviada", aprobar: "aprobada", rechazar: "rechazada" };

export const explicarError = (r: RegistroPeticion) => `${r.status ? `${r.status} · ` : ""}${r.error?.mensaje ?? "No se pudo completar."}`;

export function Solicitudes() {
  const { solicitudes, mias, avisos, enviadas, cargado, crear, cambiarEstado } = useDatos();
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [id, setId] = useState("");
  const [tipo, setTipo] = useState("Incidencia");
  const [ocupado, setOcupado] = useState(false);
  const [resaltada, setResaltada] = useState<string | null>(null);

  const todas = solicitudes ?? [];
  const cuenta: Record<Filtro, number> = {
    todas: todas.length,
    mias: todas.filter((s) => mias.includes(s.id)).length,
    borrador: todas.filter((s) => s.estado === "BORRADOR").length,
    enviadas: todas.filter((s) => s.estado !== "BORRADOR").length,
  };
  const filas = useMemo(() => todas.filter((s) =>
    filtro === "todas" ? true : filtro === "mias" ? mias.includes(s.id) : filtro === "borrador" ? s.estado === "BORRADOR" : s.estado !== "BORRADOR",
  ), [todas, filtro, mias]);

  // El evento más reciente de cada solicitud: ¿ya lo consumió notificaciones?
  const consumido = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const f of enviadas) if (!m.has(f.solicitud.id)) m.set(f.solicitud.id, f.consumido);
    return m;
  }, [enviadas]);

  const columnas = useMemo<Columna<Solicitud>[]>(() => [
    { titulo: "ID", valor: (s) => s.id, html: (s) => `<span class="celda-id">${esc(s.id)}</span>${mias.includes(s.id) ? ' <span class="marca-tuya">tuya</span>' : ""}` },
    { titulo: "Tipo", valor: (s) => s.tipo, html: (s) => esc(s.tipo) },
    { titulo: "Estado", valor: (s) => s.estado, html: (s) => insignia(s.estado) },
    { titulo: "Aviso", valor: (s) => avisosDe(avisos ?? [], s.id).length, html: (s) => {
      const n = avisosDe(avisos ?? [], s.id).length;
      if (n > 0) return `${n} aviso${n > 1 ? "s" : ""}`;
      if (s.estado === "BORRADOR" || !consumido.has(s.id)) return '<span class="texto-tenue">—</span>';
      return consumido.get(s.id)
        ? '<span class="texto-tenue" title="El evento se consumió, pero notificaciones guarda los textos en memoria y se reinició.">No disponible</span>'
        : '<span class="texto-tenue">En camino…</span>';
    } },
    { titulo: "Acciones", valor: () => "", ordenable: false, clase: "dt-right", html: (s) =>
      s.estado === "BORRADOR" ? boton("enviar", s.id, "Enviar", "arka-boton-primario")
        : s.estado === "ENVIADA" ? `<span class="grupo-botones">${boton("aprobar", s.id, "Aprobar", "arka-boton-exito")}${boton("rechazar", s.id, "Rechazar", "arka-boton-peligro-suave")}</span>`
          : '<span class="texto-tenue">Decidida</span>' },
  ], [mias, avisos, consumido]);

  const alAccion = async (accion: string, idFila: string) => {
    const a = accion as Accion;
    if (!CONFIRMACIONES[a] || !(await confirmar(CONFIRMACIONES[a](idFila)))) return;
    const r = await cambiarEstado(a, idFila);
    if (r.estado === "correcto") {
      setResaltada(idFila);
      avisar(`${idFila} ${HECHO[a]}`, a === "enviar" ? "Sigue su aviso en la pestaña Enviadas." : "La tabla ya muestra el nuevo estado.");
    } else {
      await informarError("No se pudo completar", explicarError(r));
    }
  };

  const enviarFormulario = async (e: FormEvent) => {
    e.preventDefault();
    const limpio = id.trim();
    if (!limpio || !tipo.trim()) { await informarError("Faltan datos", "Escribe un identificador y elige un tipo."); return; }
    setOcupado(true);
    const r = await crear(limpio, tipo);
    setOcupado(false);
    if (r.estado === "correcto") {
      const nuevo = r.ids[0] ?? limpio.toUpperCase();
      setId("");
      setResaltada(nuevo);
      avisar("Solicitud creada", `${nuevo} quedó en BORRADOR.`);
    } else {
      await informarError(r.status === 409 ? "Ese identificador ya existe" : "No se pudo crear", explicarError(r));
    }
  };

  return (
    <Marco vista="solicitudes">
      <Encabezado titulo="Solicitudes" descripcion="Crea una solicitud y dale seguimiento. Cada acción llama a los servicios reales." />
      <div className="flex flex-wrap gap-6 items-start">
        <form onSubmit={(e) => void enviarFormulario(e)} aria-labelledby="titulo-nueva" className="flex-[1_1_300px] max-w-full lg:max-w-[360px] bg-white border border-linea rounded-tarjeta p-6 flex flex-col gap-4">
          <h2 id="titulo-nueva" className="m-0 text-[16px] font-bold">Nueva solicitud</h2>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nuevo-id" className="text-[13px] font-semibold">Identificador</label>
            <input id="nuevo-id" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} maxLength={20} placeholder="SOL-100" pattern="[A-Za-z0-9-]+" autoComplete="off"
              aria-describedby="ayuda-id" className="campo font-mono" />
            <span id="ayuda-id" className="text-[12px] text-secundario">Letras, números y guiones.</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nuevo-tipo" className="text-[13px] font-semibold">Tipo</label>
            <SelectorTipo id="nuevo-tipo" valor={tipo} alCambiar={setTipo} />
          </div>
          <button type="submit" disabled={ocupado} className="arka-boton arka-boton-primario arka-boton-grande">
            <Icono nombre="mas" tamano={16} />{ocupado ? "Creando…" : "Crear solicitud"}
          </button>
          <p className="m-0 text-[12.5px] text-secundario">Queda en BORRADOR. La envías desde la tabla.</p>
        </form>

        <Tarjeta etiqueta="Todas las solicitudes" className="flex-[3_1_600px]">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <h2 className="m-0 text-[16px] font-bold">Todas las solicitudes</h2>
            <div role="group" aria-label="Qué solicitudes mostrar" className="flex flex-wrap gap-1.5">
              {([["todas", "Todas"], ["mias", "Creadas aquí"], ["borrador", "En borrador"], ["enviadas", "Enviadas"]] as [Filtro, string][]).map(([f, t]) => (
                <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)} className={`chip ${filtro === f ? "chip-activo" : ""}`}>
                  {t} <span className="chip-cuenta">{cuenta[f]}</span>
                </button>
              ))}
            </div>
          </div>
          {cargado && solicitudes === null ? (
            <p className="m-0 nota-vacia">No se pudo leer la lista. Revisa la <a href={rutaA("salud")}>salud de los servicios</a>.</p>
          ) : (
            <TablaDatos filas={filas} columnas={columnas} etiqueta="Tabla de solicitudes" alAccion={(a, i) => void alAccion(a, i)}
              claseFila={(s) => (s.id === resaltada ? "fila-nueva" : "")} />
          )}
        </Tarjeta>
      </div>
    </Marco>
  );
}

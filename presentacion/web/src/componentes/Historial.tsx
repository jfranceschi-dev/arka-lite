import { useMemo, useState } from "react";
import type { RegistroPeticion } from "../api/cliente.ts";
import { rutaA } from "../rutas.ts";
import { Icono } from "./Iconos.tsx";
import { hora } from "./ResultadoPeticion.tsx";

type Filtro = "todos" | string;

// Historial filtrable por servicio, operación y resultado. Solo contiene las
// peticiones que hizo esta UI.
export function Historial({ registros }: { registros: RegistroPeticion[] }) {
  const [servicio, setServicio] = useState<Filtro>("todos");
  const [operacion, setOperacion] = useState<Filtro>("todos");
  const [resultado, setResultado] = useState<Filtro>("todos");
  const filtrados = useMemo(
    () =>
      registros.filter(
        (r) =>
          (servicio === "todos" || r.servicio === servicio) &&
          (operacion === "todos" || (operacion === "escritura" ? r.escritura : !r.escritura)) &&
          (resultado === "todos" || r.estado === resultado),
      ),
    [registros, servicio, operacion, resultado],
  );
  return (
    <section aria-label="Historial de peticiones" className="bg-superficie rounded-tarjeta p-5 flex flex-col gap-3.5">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[17px] font-bold">Historial de peticiones de esta UI</h2>
          <span className="text-[12.5px] text-secundario">No ve el tráfico interno entre servicios. Se borra al cerrar la pestaña.</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Selector etiqueta="Servicio" valor={servicio} cambiar={setServicio} opciones={[["todos", "Todos"], ["solicitudes", "Solicitudes"], ["notificaciones", "Notificaciones"]]} />
          <Selector etiqueta="Operación" valor={operacion} cambiar={setOperacion} opciones={[["todos", "Todas"], ["consulta", "Consultas"], ["escritura", "Escrituras"]]} />
          <Selector etiqueta="Resultado" valor={resultado} cambiar={setResultado} opciones={[["todos", "Todos"], ["correcto", "Correcto"], ["error", "Error"], ["esperando", "Esperando"]]} />
        </div>
      </div>
      {filtrados.length === 0 ? (
        <p className="m-0 rounded-recuadro bg-superficie2 p-4 text-[14px] text-secundario">
          {registros.length === 0 ? "Todavía no hay peticiones. Usa una acción para empezar." : "Ninguna petición coincide con los filtros."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-[13.5px]">
            <thead>
              <tr className="text-left text-secundario text-[12px]">
                {["Hora", "Servicio", "Operación", "Petición", "Status", "Duración", "Resultado", ""].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2.5 bg-superficie2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r) => (
                <tr key={r.id} className="border-b border-[#12182814]">
                  <td className="px-3 py-2.5 font-mono text-[12.5px]">{hora(r.inicio)}</td>
                  <td className="px-3 py-2.5">{r.servicio === "solicitudes" ? "Solicitudes" : "Notificaciones"}</td>
                  <td className="px-3 py-2.5">{r.escritura ? <span className="px-2 py-0.5 rounded-capsula bg-advertencia-suave text-advertencia-texto text-[11.5px] font-bold">Escritura</span> : "Consulta"}</td>
                  <td className="px-3 py-2.5 font-mono text-[12.5px] break-all">{r.metodo} {r.url}</td>
                  <td className="px-3 py-2.5 font-mono">{r.status ?? "—"}</td>
                  <td className="px-3 py-2.5">{r.duracionMs !== null ? `${r.duracionMs} ms` : "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 font-bold ${r.estado === "correcto" ? "text-correcto" : r.estado === "error" ? "text-error" : "text-secundario"}`}>
                      <Icono nombre={r.estado === "correcto" ? "check" : r.estado === "error" ? "x" : "reloj"} tamano={16} />
                      {r.estado === "correcto" ? "Correcto" : r.estado === "error" ? (r.error?.tipo === "tiempo" ? "Tiempo agotado" : r.error?.tipo === "conexion" ? "Sin conexión" : "Error") : "Esperando"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5"><a href={rutaA("detalle", r.id)} className="font-semibold">Detalle</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Selector({ etiqueta, valor, cambiar, opciones }: { etiqueta: string; valor: string; cambiar: (v: string) => void; opciones: [string, string][] }) {
  return (
    <label className="flex flex-col gap-1 text-[12px] font-bold text-secundario">
      {etiqueta}
      <select value={valor} onChange={(e) => cambiar(e.target.value)} className="h-10 px-3 rounded-capsula border-[1.5px] border-[#12182836] bg-white text-[13px] font-semibold text-texto">
        {opciones.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}

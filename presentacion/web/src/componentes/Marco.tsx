import type { ReactNode } from "react";
import { operacionPorId } from "../../../contenido/laboratorio.ts";
import { useHistorial } from "../estado/historial.tsx";
import { rutaA, type Vista } from "../rutas.ts";
import { Icono, type NombreIcono } from "./Iconos.tsx";

// Estructura de la propuesta A: lateral profundo de altura completa, barra
// constante y contenido sobre fondo claro.
const navegacion: { vista: Vista; etiqueta: string; icono: NombreIcono }[] = [
  { vista: "entender", etiqueta: "Entender", icono: "libro" },
  { vista: "probar", etiqueta: "Probar", icono: "matraz" },
  { vista: "detalle", etiqueta: "Detalle técnico", icono: "codigo" },
];

export function Marco({ vista, lateral, barra, children }: { vista: Vista; lateral?: ReactNode; barra?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-wrap bg-fondo text-texto">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:p-3 focus:bg-white focus:rounded-chico">Saltar al contenido</a>
      <nav aria-label="Navegación principal" className="flex-[1_1_272px] lg:flex-[0_0_272px] bg-franja text-white rounded-r-[28px] px-3.5 pt-6 pb-5 flex flex-col gap-5 no-imprimir">
        <div className="flex items-center gap-3 px-2">
          <svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#2BA6CB" /><path d="M9 23 L16 9 L23 23 M11.8 18 H20.2" fill="none" stroke="#0A1430" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="flex flex-col"><b className="text-[16px] tracking-[-0.01em]">ARKA-Lite</b><span className="text-[12px] text-white/75">Presentación y laboratorio</span></div>
        </div>
        <div className="flex flex-col gap-1.5">
          {navegacion.map((n) => (
            <a key={n.vista} href={rutaA(n.vista)} aria-current={vista === n.vista ? "page" : undefined}
              className={`flex items-center gap-2.5 h-11 px-3.5 rounded-capsula text-[14px] no-underline ${vista === n.vista ? "bg-cian text-tinta font-bold" : "text-white font-semibold hover:bg-white/10"}`}>
              <Icono nombre={n.icono} />{n.etiqueta}
            </a>
          ))}
        </div>
        {lateral}
        <SaludServicios />
      </nav>
      <div className="flex-[999_1_560px] min-w-0 px-4 sm:px-7 pt-6 pb-8 flex flex-col gap-5">
        {barra}
        <main id="contenido" tabIndex={-1} className="flex flex-col gap-5 min-w-0 outline-none">{children}</main>
      </div>
    </div>
  );
}

export function Franja({ ruta, titulo, descripcion, derecha }: { ruta: string; titulo: string; descripcion?: string; derecha?: ReactNode }) {
  return (
    <header className="bg-franja text-white rounded-franja p-6 flex flex-wrap gap-4 justify-between items-end">
      <div className="flex flex-col gap-2 max-w-[760px] min-w-0">
        <div className="text-[12.5px] text-white/75">{ruta}</div>
        <h1 className="m-0 text-[clamp(24px,2.6vw,32px)] leading-[1.15] font-extrabold tracking-[-0.02em]">{titulo}</h1>
        {descripcion && <p className="m-0 text-[15px] text-white/80">{descripcion}</p>}
      </div>
      {derecha}
    </header>
  );
}

function SaludServicios() {
  const { registros, lanzar, enCurso } = useHistorial();
  const ultimo = (op: string) => registros.find((r) => r.operacionId === op && r.estado !== "esperando");
  const filas = [
    { op: "saludSolicitudes", nombre: "Solicitudes" },
    { op: "saludNotificaciones", nombre: "Notificaciones" },
  ];
  const ocupado = enCurso.has("saludSolicitudes") || enCurso.has("saludNotificaciones");
  return (
    <div className="mt-auto border-t border-white/15 pt-3.5 px-3.5 flex flex-col gap-2">
      <div className="text-[11px] font-bold tracking-[0.08em] text-white/75">SALUD DE LOS SERVICIOS</div>
      {filas.map((f) => {
        const r = ultimo(f.op);
        const estado = r?.estado === "correcto" ? (r.respuesta as { status?: string })?.status ?? "UP" : r ? "Sin respuesta" : "Sin consultar";
        const bien = r?.estado === "correcto";
        return (
          <div key={f.op} className="flex items-center gap-2 text-[13px]">
            <Icono nombre={bien ? "checkCirculo" : r ? "xCirculo" : "hueco"} tamano={16} className={bien ? "text-[#4ADE80]" : r ? "text-[#FF8FA3]" : "text-white/75"} />
            {f.nombre} · {estado}
          </div>
        );
      })}
      <button type="button" disabled={ocupado} onClick={() => { void lanzar(operacionPorId("saludSolicitudes")); void lanzar(operacionPorId("saludNotificaciones")); }}
        className="self-start mt-1 inline-flex items-center gap-2 h-9 px-3 rounded-capsula border border-white/20 bg-white/10 text-[12.5px] font-semibold disabled:opacity-60">
        <Icono nombre="pulso" tamano={14} />{ocupado ? "Consultando…" : "Consultar /actuator/health"}
      </button>
    </div>
  );
}

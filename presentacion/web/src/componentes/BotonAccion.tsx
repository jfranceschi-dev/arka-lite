import type { Operacion } from "../../../contenido/laboratorio.ts";
import { Icono, type NombreIcono } from "./Iconos.tsx";

const iconos: Record<string, NombreIcono> = {
  listar: "buscar", consultar: "buscar", crear: "mas", enviar: "enviar", aprobar: "check", rechazar: "x",
  avisos: "mensaje", procesados: "lista", saludSolicitudes: "pulso", saludNotificaciones: "pulso",
};

// Consultas con borde; escrituras rellenas y etiquetadas. Una escritura no
// se ejecuta con un solo clic: primero pide confirmación.
export function BotonAccion({ op, onClick, enCurso, deshabilitado, motivo, resaltado, etiqueta }: {
  op: Operacion;
  onClick: () => void;
  enCurso: boolean;
  deshabilitado?: boolean;
  motivo?: string;
  resaltado?: boolean;
  etiqueta?: string;
}) {
  const idMotivo = motivo ? `motivo-${op.id}` : undefined;
  const base = "w-full flex items-center gap-2.5 min-h-11 px-4 py-1.5 rounded-capsula text-[14px] font-bold text-left";
  const estilo = deshabilitado
    ? "border-[1.5px] border-dashed border-[#B8C3D6] bg-superficie2 text-secundario cursor-not-allowed"
    : op.escritura
      ? "bg-franja text-white"
      : "border-[1.5px] border-azul bg-white text-azul";
  const nombre = `${etiqueta ?? op.etiqueta} · ${op.metodo}${op.escritura ? " · cambia datos" : ""}`;
  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={onClick} disabled={deshabilitado || enCurso} aria-describedby={idMotivo} aria-busy={enCurso} aria-label={nombre}
        className={`${base} ${estilo} ${resaltado ? "ring-4 ring-cian/40" : ""} ${enCurso ? "esperando" : ""}`}>
        <Icono nombre={iconos[op.id] ?? "flecha"} />
        <span className="flex-1">{enCurso ? `${etiqueta ?? op.etiqueta}…` : etiqueta ?? op.etiqueta}</span>
        <span className={`font-mono text-[11.5px] font-semibold ${op.escritura && !deshabilitado ? "text-cian-claro" : "text-secundario"}`}>{op.metodo}</span>
      </button>
      {motivo && <p id={idMotivo} className={`m-0 px-1 text-[12.5px] leading-snug ${deshabilitado ? "text-advertencia-texto" : "text-secundario"}`}>{motivo}</p>}
    </div>
  );
}

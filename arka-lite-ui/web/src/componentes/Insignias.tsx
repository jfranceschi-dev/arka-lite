import type { EstadoSolicitud } from "../api/arka.ts";
import { Icono, type NombreIcono } from "./Iconos.tsx";

// Los modos de evidencia siempre se muestran con icono, trazo y texto.
export function ModoEvidencia({ modo, sobreOscuro = false }: { modo: "explicacion" | "real"; sobreOscuro?: boolean }) {
  if (modo === "explicacion") {
    return (
      <span className={`inline-flex items-center gap-2 h-8 px-3 rounded-capsula border-[1.5px] border-dashed text-[13px] font-bold ${sobreOscuro ? "border-cian-claro text-white" : "border-azul-vivo text-azul"}`}>
        <Icono nombre="animacion" tamano={16} />Explicación animada · basada en el código
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 h-8 px-3 rounded-capsula text-[13px] font-bold ${sobreOscuro ? "bg-white text-franja" : "bg-franja text-white"}`}>
      <Icono nombre="real" tamano={16} className={sobreOscuro ? "text-cian-texto" : "text-cian"} />Petición real · observada por la UI
    </span>
  );
}

const estados: Record<EstadoSolicitud, { clase: string; icono: NombreIcono }> = {
  BORRADOR: { clase: "bg-[#52607F1F] text-[#3D4A66]", icono: "lapiz" },
  ENVIADA: { clase: "bg-[#2E6DB421] text-azul", icono: "enviar" },
  APROBADA: { clase: "bg-correcto-suave text-correcto", icono: "check" },
  RECHAZADA: { clase: "bg-error-suave text-error", icono: "x" },
};

export function InsigniaEstado({ estado }: { estado: string }) {
  const e = estados[estado as EstadoSolicitud] ?? estados.BORRADOR;
  return (
    <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-capsula text-[12px] font-bold ${e.clase}`}>
      <Icono nombre={e.icono} tamano={14} />{estado}
    </span>
  );
}

export function NoObservado({ texto = "Todavía no observado" }: { texto?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-capsula border-[1.5px] border-[#12182836] text-secundario text-[12px] font-bold">
      <Icono nombre="hueco" tamano={14} />{texto}
    </span>
  );
}

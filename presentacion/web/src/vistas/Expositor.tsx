import { useCallback, useEffect, useState } from "react";
import { etiquetaSeccion } from "../../../contenido/index.ts";
import { participantePorId } from "../../../contenido/participantes.ts";
import { usePreferencias } from "../estado/preferencias.tsx";
import { PanelGuion } from "../componentes/Lamina.tsx";
import { Icono } from "../componentes/Iconos.tsx";
import { navegar } from "../rutas.ts";
import { useLaminas, useSincronizacion, useTecladoLaminas } from "./navegacionLaminas.ts";

function formatoTiempo(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// Modo expositor: diapositiva actual, la siguiente, el guion separado de las
// instrucciones y un cronómetro. Se sincroniza con Presentar en otra ventana.
export function Expositor({ idLamina }: { idLamina: string | null }) {
  const { recorrido } = usePreferencias();
  const nav = useLaminas(recorrido, idLamina, "expositor");
  useTecladoLaminas(nav);
  useSincronizacion(nav.actual.id, useCallback((id: string) => navegar("expositor", id), []));
  const [inicio, setInicio] = useState(() => Date.now());
  const [ahora, setAhora] = useState(() => Date.now());
  const [pausado, setPausado] = useState(false);
  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [pausado]);
  const { actual, siguiente, indice, lista } = nav;

  return (
    <div className="min-h-screen bg-fondo p-4 sm:p-6 flex flex-col gap-4">
      <div className="bg-franja text-white rounded-[22px] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <b className="text-[15px]">Modo expositor · {etiquetaSeccion(actual.seccion)}</b>
          <span className="text-[13px] text-white/75">Presenta: {participantePorId(actual.seccion.participante).nombre} · Recorrido {recorrido === "ejecutivo" ? "ejecutivo" : "técnico"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[18px] px-3 py-1.5 rounded-capsula bg-white/10" aria-label="Tiempo transcurrido">{formatoTiempo(ahora - inicio)}</span>
          <button type="button" onClick={() => setPausado((p) => !p)} className="h-10 px-3.5 rounded-capsula border border-white/20 text-[13px] font-semibold">{pausado ? "Reanudar" : "Pausar"}</button>
          <button type="button" onClick={() => { setInicio(Date.now()); setAhora(Date.now()); }} className="h-10 px-3.5 rounded-capsula border border-white/20 text-[13px] font-semibold">Reiniciar</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-start">
        <section className="flex-[3_1_560px] min-w-0 bg-superficie rounded-tarjeta p-6">
          <PanelGuion lamina={actual} grande />
        </section>
        <aside className="flex-[2_1_320px] min-w-0 flex flex-col gap-4">
          <div className="bg-marino text-white rounded-tarjeta p-5 flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-[0.12em] text-cian">AHORA · {indice + 1}/{lista.length}</span>
            <b className="text-[22px] leading-tight">{actual.diapositiva?.titulo ?? `Portada · ${actual.seccion.titulo}`}</b>
            <ul className="m-0 pl-4 text-[14px] text-sobre-oscuro-secundario">{(actual.diapositiva?.visible ?? []).map((v) => <li key={v}>{v}</li>)}</ul>
          </div>
          <div className="bg-superficie rounded-tarjeta p-5 flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-[0.12em] text-secundario">SIGUIENTE</span>
            <b className="text-[17px]">{siguiente ? siguiente.diapositiva?.titulo ?? `Portada · ${siguiente.seccion.titulo}` : "Fin de la presentación"}</b>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => nav.ir(indice - 1)} className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-capsula border-[1.5px] border-[#12182836] bg-white font-semibold"><Icono nombre="anterior" />Anterior</button>
            <button type="button" onClick={() => nav.ir(indice + 1)} className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-capsula bg-franja text-white font-bold">Siguiente<Icono nombre="siguiente" /></button>
          </div>
          <p className="m-0 text-[12.5px] text-secundario">Abre Presentar en la pantalla proyectada: ambas ventanas avanzan juntas.</p>
        </aside>
      </div>
    </div>
  );
}

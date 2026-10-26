import { useCallback } from "react";
import { secciones, etiquetaSeccion } from "../../../contenido/index.ts";
import { usePreferencias } from "../estado/preferencias.tsx";
import { LaminaVista } from "../componentes/Lamina.tsx";
import { Icono } from "../componentes/Iconos.tsx";
import { navegar, rutaA } from "../rutas.ts";
import { useLaminas, useSincronizacion, useTecladoLaminas } from "./navegacionLaminas.ts";

// Propuesta B como modo de proyección: escenario oscuro a pantalla completa,
// la diapositiva domina y la línea de secciones queda abajo.
export function Presentar({ idLamina }: { idLamina: string | null }) {
  const { recorrido } = usePreferencias();
  const nav = useLaminas(recorrido, idLamina, "presentar");
  const extra = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && !document.fullscreenElement) { navegar("entender", nav.actual.id); return true; }
    if (e.key === "f" || e.key === "F") {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen?.().catch(() => undefined);
      return true;
    }
    return false;
  }, [nav.actual.id]);
  useTecladoLaminas(nav, extra);
  useSincronizacion(nav.actual.id, useCallback((id: string) => navegar("presentar", id), []));
  const { actual, indice, lista } = nav;

  return (
    <div className="min-h-screen bg-[#07142A] text-sobre-oscuro px-4 sm:px-10 py-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-imprimir">
        <b className="text-[14px] tracking-[0.06em]">ARKA-LITE · {etiquetaSeccion(actual.seccion).toUpperCase()}</b>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] text-sobre-oscuro-secundario" aria-live="polite">{indice + 1} / {lista.length}</span>
          <a href={rutaA("expositor", actual.id)} target="_blank" rel="noopener" aria-label="Abrir modo expositor" className="inline-flex items-center justify-center w-10 h-10 rounded-capsula border border-white/20 text-sobre-oscuro"><Icono nombre="pantalla" /></a>
          <a href={rutaA("entender", actual.id)} className="inline-flex items-center gap-2 h-10 px-3.5 rounded-capsula border border-white/20 text-sobre-oscuro text-[13px] font-semibold no-underline"><Icono nombre="cerrar" tamano={16} />Salir</a>
        </div>
      </div>
      <main className="flex-1 w-full max-w-[1400px] mx-auto bg-marino rounded-tarjeta p-6 sm:p-10">
        <LaminaVista lamina={actual} recorrido={recorrido} oscuro />
      </main>
      <div className="flex items-center justify-center gap-2 no-imprimir">
        <button type="button" aria-label="Anterior" onClick={() => nav.ir(indice - 1)} className="w-11 h-11 rounded-capsula border border-white/25 inline-flex items-center justify-center"><Icono nombre="anterior" /></button>
        <button type="button" aria-label="Siguiente" onClick={() => nav.ir(indice + 1)} className="w-11 h-11 rounded-capsula bg-cian text-tinta inline-flex items-center justify-center"><Icono nombre="siguiente" /></button>
      </div>
      <nav aria-label="Secciones" className="grid gap-1 w-full max-w-[1400px] mx-auto no-imprimir" style={{ gridTemplateColumns: `repeat(${secciones.length}, minmax(0, 1fr))` }}>
        {secciones.map((s) => {
          const items = lista.map((l, i) => ({ l, i })).filter((x) => x.l.seccion.id === s.id);
          if (items.length === 0) return null;
          const hecho = items.filter((x) => x.i <= indice).length / items.length;
          const activa = s.id === actual.seccion.id;
          return (
            <a key={s.id} href={rutaA("presentar", items[0].l.id)} aria-current={activa ? "step" : undefined}
              className={`flex flex-col gap-1.5 text-[11px] no-underline ${activa ? "text-white font-bold" : "text-sobre-oscuro-secundario"}`}>
              <span className="h-1 rounded-capsula" style={{ background: `linear-gradient(90deg, #2BA6CB ${hecho * 100}%, rgba(255,255,255,.16) ${hecho * 100}%)` }} />
              <span className="truncate">{s.numero === null ? s.corto : `${String(s.numero).padStart(2, "0")} ${s.corto}`}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

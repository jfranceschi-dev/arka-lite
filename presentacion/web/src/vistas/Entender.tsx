import { useCallback, useEffect, useRef, useState } from "react";
import { secciones, etiquetaSeccion, type Lamina } from "../../../contenido/index.ts";
import type { Recorrido } from "../../../contenido/tipos.ts";
import { usePreferencias } from "../estado/preferencias.tsx";
import { Marco, Franja } from "../componentes/Marco.tsx";
import { LaminaVista, PanelGuion } from "../componentes/Lamina.tsx";
import { Icono } from "../componentes/Iconos.tsx";
import { navegar, rutaA } from "../rutas.ts";
import { useLaminas, useTecladoLaminas, type NavegacionLaminas } from "./navegacionLaminas.ts";

export function Entender({ idLamina }: { idLamina: string | null }) {
  const { recorrido, setRecorrido } = usePreferencias();
  const nav = useLaminas(recorrido, idLamina, "entender");
  const [general, setGeneral] = useState(false);
  const extra = useCallback((e: KeyboardEvent) => {
    if (e.key === "g" || e.key === "G") { setGeneral((v) => !v); return true; }
    if (e.key === "p" || e.key === "P") { navegar("presentar", nav.actual.id); return true; }
    return general;
  }, [general, nav.actual.id]);
  useTecladoLaminas(nav, extra);
  const { actual, indice, lista } = nav;

  return (
    <Marco
      vista="entender"
      lateral={<IndiceSecciones nav={nav} />}
      barra={<BarraConstante nav={nav} recorrido={recorrido} setRecorrido={setRecorrido} abrirGeneral={() => setGeneral(true)} />}
    >
      <Franja
        ruta={`Entender › ${etiquetaSeccion(actual.seccion)}`}
        titulo={actual.diapositiva?.titulo ?? actual.seccion.titulo}
        descripcion={actual.diapositiva ? undefined : "Las cinco preguntas que responde esta sección."}
        derecha={<span className="text-[13px] text-white/75">Recorrido {recorrido === "ejecutivo" ? "ejecutivo" : "técnico"}</span>}
      />
      <div className="flex flex-wrap gap-5 items-start">
        <section aria-label="Diapositiva" className="flex-[2_1_640px] min-w-0 bg-superficie rounded-tarjeta p-6">
          <LaminaVista lamina={actual} recorrido={recorrido} />
        </section>
        <aside aria-label="Guion del expositor" className="flex-[1_1_320px] min-w-0 bg-superficie rounded-tarjeta p-5">
          <PanelGuion lamina={actual} />
        </aside>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap no-imprimir">
        <button type="button" onClick={() => nav.ir(indice - 1)} disabled={indice === 0}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-capsula border-[1.5px] border-[#12182836] bg-white font-semibold disabled:opacity-40">
          <Icono nombre="anterior" />Anterior
        </button>
        <span className="text-[13px] text-secundario">Flechas o AvPág para avanzar · G vista general · P presentar</span>
        <button type="button" onClick={() => nav.ir(indice + 1)} disabled={indice === lista.length - 1}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-capsula bg-franja text-white font-bold disabled:opacity-40">
          Siguiente<Icono nombre="siguiente" />
        </button>
      </div>
      {general && <VistaGeneral nav={nav} cerrar={() => setGeneral(false)} />}
    </Marco>
  );
}

function BarraConstante({ nav, recorrido, setRecorrido, abrirGeneral }: { nav: NavegacionLaminas; recorrido: Recorrido; setRecorrido: (r: Recorrido) => void; abrirGeneral: () => void }) {
  const { indice, lista, actual } = nav;
  const [exportando, setExportando] = useState<"no" | "si" | "listo" | "error">("no");
  const [mensaje, setMensaje] = useState("");
  const exportar = async () => {
    setExportando("si");
    setMensaje("");
    try {
      const { construirPresentacion, nombreArchivo } = await import("../../../generador-pptx/construir.ts");
      const pptx = construirPresentacion(recorrido);
      await pptx.writeFile({ fileName: nombreArchivo(recorrido) });
      setExportando("listo");
      setMensaje(`Descargado ${nombreArchivo(recorrido)}`);
    } catch (e) {
      setExportando("error");
      setMensaje(`No se pudo generar: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  const avance = ((indice + 1) / lista.length) * 100;
  return (
    <div className="bg-franja text-white rounded-[22px] px-4 py-3 flex flex-wrap gap-3 items-center justify-between no-imprimir">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[11px] font-bold tracking-[0.08em] text-white/75">RECORRIDO</span>
        <div role="group" aria-label="Recorrido" className="flex p-1 rounded-capsula bg-white/10">
          {(["ejecutivo", "tecnico"] as const).map((r) => (
            <button key={r} type="button" aria-pressed={recorrido === r} onClick={() => { setRecorrido(r); navegar("entender", actual.id); }}
              className={`h-9 px-4 rounded-capsula text-[13px] ${recorrido === r ? "bg-white text-franja font-bold" : "text-white font-semibold"}`}>
              {r === "ejecutivo" ? "Ejecutivo" : "Técnico"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[13px] text-white/80 pr-1.5" aria-live="polite">Diapositiva {indice + 1} de {lista.length}</span>
        <BotonBarra icono="rejilla" onClick={abrirGeneral}>Vista general</BotonBarra>
        <a href={rutaA("expositor", actual.id)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-10 px-3.5 rounded-capsula border border-white/15 bg-white/10 text-white text-[13px] font-semibold no-underline">
          <Icono nombre="pantalla" tamano={16} />Modo expositor
        </a>
        <BotonBarra icono="ampliar" onClick={() => { navegar("presentar", actual.id); void document.documentElement.requestFullscreen?.().catch(() => undefined); }}>Presentar</BotonBarra>
        <BotonBarra icono="descargar" onClick={() => void exportar()} disabled={exportando === "si"}>
          {exportando === "si" ? "Generando PPTX…" : `Exportar PPTX ${recorrido === "ejecutivo" ? "ejecutivo" : "técnico"}`}
        </BotonBarra>
      </div>
      {mensaje && <p role="status" className={`m-0 basis-full text-[13px] ${exportando === "error" ? "text-[#FF8FA3]" : "text-[#4ADE80]"}`}>{mensaje}</p>}
      <div className="basis-full h-1 rounded-capsula bg-white/12" aria-hidden="true">
        <div className="h-1 rounded-capsula bg-cian" style={{ width: `${avance}%` }} />
      </div>
    </div>
  );
}

function BotonBarra({ icono, onClick, children, disabled }: { icono: Parameters<typeof Icono>[0]["nombre"]; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="inline-flex items-center gap-2 h-10 px-3.5 rounded-capsula border border-white/15 bg-white/10 text-white text-[13px] font-semibold disabled:opacity-60">
      <Icono nombre={icono} tamano={16} />{children}
    </button>
  );
}

function IndiceSecciones({ nav }: { nav: NavegacionLaminas }) {
  const seccionActual = nav.actual.seccion.id;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[11px] font-bold tracking-[0.08em] text-white/75 px-3.5 pb-1.5">SECCIONES</div>
      {secciones.map((s) => {
        const primera = nav.lista.findIndex((l) => l.seccion.id === s.id);
        if (primera < 0) return null;
        const activa = s.id === seccionActual;
        return (
          <a key={s.id} href={rutaA("entender", nav.lista[primera].id)} aria-current={activa ? "true" : undefined}
            className={`flex items-center gap-2.5 min-h-8 px-3.5 py-1 rounded-capsula text-[13px] no-underline ${activa ? "bg-white/10 text-white font-bold" : "text-white/75 hover:text-white"}`}>
            <span className={`w-5 font-mono text-[11px] ${activa ? "text-cian-claro" : ""}`}>{s.numero === null ? "··" : String(s.numero).padStart(2, "0")}</span>
            {s.corto}
          </a>
        );
      })}
    </div>
  );
}

function VistaGeneral({ nav, cerrar }: { nav: NavegacionLaminas; cerrar: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[aria-current='true']")?.focus();
    const alPulsar = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [cerrar]);
  const grupos = new Map<string, { titulo: string; items: { l: Lamina; i: number }[] }>();
  nav.lista.forEach((l, i) => {
    const g = grupos.get(l.seccion.id) ?? { titulo: etiquetaSeccion(l.seccion), items: [] };
    g.items.push({ l, i });
    grupos.set(l.seccion.id, g);
  });
  return (
    <div role="dialog" aria-modal="true" aria-label="Vista general" className="fixed inset-0 z-50 bg-[#040A1A8C] p-4 sm:p-10 overflow-auto">
      <div ref={ref} className="max-w-[1280px] mx-auto bg-superficie rounded-[24px] p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[22px] font-extrabold">Vista general</h2>
          <button type="button" onClick={cerrar} className="inline-flex items-center gap-2 h-10 px-4 rounded-capsula border-[1.5px] border-[#12182836] font-semibold"><Icono nombre="cerrar" tamano={16} />Cerrar</button>
        </div>
        {Array.from(grupos.values()).map((g) => (
          <section key={g.titulo} className="flex flex-col gap-2">
            <h3 className="m-0 text-[14px] font-bold text-cian-texto">{g.titulo}</h3>
            <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              {g.items.map(({ l, i }) => (
                <button key={l.id} type="button" aria-current={i === nav.indice ? "true" : undefined} onClick={() => { nav.ir(i); cerrar(); }}
                  className={`text-left rounded-recuadro p-3 min-h-[76px] flex flex-col gap-1 ${i === nav.indice ? "bg-franja text-white" : "bg-superficie2 hover:bg-cian-suave"}`}>
                  <span className={`font-mono text-[11px] ${i === nav.indice ? "text-cian-claro" : "text-secundario"}`}>{i + 1}</span>
                  <span className="text-[14px] font-semibold leading-snug">{l.diapositiva?.titulo ?? `Portada · ${l.seccion.titulo}`}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

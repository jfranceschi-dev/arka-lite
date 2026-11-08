import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDatos } from "../estado/datos.tsx";
import { useEnlaces } from "../estado/enlaces.ts";
import { TEMAS, useTema, type Tema } from "../estado/tema.tsx";
import { rutaA, type Vista } from "../rutas.ts";
import { Icono } from "./Iconos.tsx";

// Propuesta A · Minimal: una barra superior con cuatro pestañas y el
// contenido centrado. El "hilo de eventos" bajo la barra recorre la pantalla
// cada vez que un evento termina su viaje entre los dos servicios.

const pestanas: { vista: Vista; etiqueta: string }[] = [
  { vista: "solicitudes", etiqueta: "Solicitudes" },
  { vista: "enviadas", etiqueta: "Enviadas" },
  { vista: "salud", etiqueta: "Salud" },
  { vista: "ayuda", etiqueta: "Ayuda" },
];

export function Marco({ vista, children }: { vista: Vista; children: ReactNode }) {
  const { pulso } = useDatos();
  return (
    <div className="min-h-screen bg-fondo text-texto">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:p-3 focus:bg-white focus:rounded-chico">Saltar al contenido</a>
      <header className="bg-white border-b border-linea sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 min-h-16 flex flex-wrap items-center gap-x-8 gap-y-2 py-2 sm:py-0">
          <a href={rutaA("solicitudes")} className="flex items-center gap-2.5 no-underline text-texto">
            <Marca />
            <b className="text-[16px] tracking-[-0.01em]">ARKA-Lite</b>
          </a>
          <nav aria-label="Principal" className="flex gap-1 self-stretch overflow-x-auto">
            {pestanas.map((p) => (
              <a key={p.vista} href={rutaA(p.vista)} aria-current={vista === p.vista ? "page" : undefined}
                className={`pestana flex items-center px-3.5 min-h-12 text-[14px] no-underline whitespace-nowrap ${vista === p.vista ? "text-texto font-bold pestana-activa" : "text-secundario font-semibold hover:text-texto"}`}>
                {p.etiqueta}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <IndicadorSalud />
            <MenuContratos />
            <SelectorTema />
          </div>
        </div>
        <div className="hilo" aria-hidden="true"><span key={pulso} className={pulso > 0 ? "hilo-viaje" : ""} /></div>
      </header>
      <main id="contenido" tabIndex={-1} key={vista} className="entrada max-w-[1200px] mx-auto px-4 sm:px-8 pt-8 sm:pt-10 pb-12 flex flex-col gap-7 outline-none">
        {children}
      </main>
    </div>
  );
}

function Marca() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" className="marca">
      <circle cx="16" cy="16" r="16" fill="var(--tema-acc)" />
      <path d="M9 23 L16 9 L23 23 M11.8 18 H20.2" fill="none" stroke="var(--tema-prof)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IndicadorSalud() {
  const { salud } = useDatos();
  const estados = [salud.solicitudes.estado, salud.notificaciones.estado];
  const arriba = estados.filter((e) => e === "up").length;
  const validando = estados.includes("validando");
  const sinValidar = estados.every((e) => e === "sin-validar");
  const clase = validando || sinValidar ? "bg-[#EEF1F6] text-secundario" : arriba === 2 ? "bg-correcto-suave text-correcto" : "bg-error-suave text-error";
  const texto = validando ? "Validando…" : sinValidar ? "Sin validar" : `${arriba} de 2 servicios UP`;
  return (
    <a href={rutaA("salud")} className={`hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-capsula text-[12.5px] font-bold no-underline ${clase}`}>
      <span className={`w-2 h-2 rounded-full bg-current ${arriba === 2 && !validando ? "latido" : ""}`} />{texto}
    </a>
  );
}

function useMenu() {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => { if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => { document.removeEventListener("mousedown", fuera); document.removeEventListener("keydown", tecla); };
  }, [abierto]);
  return { abierto, setAbierto, caja };
}

function MenuContratos() {
  const enlaces = useEnlaces();
  const { abierto, setAbierto, caja } = useMenu();
  const items = [
    { href: enlaces.swaggerSolicitudes, titulo: "Swagger · solicitudes", detalle: "Contrato de la API de solicitudes" },
    { href: enlaces.swaggerNotificaciones, titulo: "Swagger · notificaciones", detalle: "Contrato de la API de notificaciones" },
    { href: enlaces.grafana, titulo: "Grafana", detalle: "Logs de los dos servicios" },
  ];
  return (
    <div ref={caja} className="relative">
      <button type="button" aria-expanded={abierto} aria-haspopup="true" onClick={() => setAbierto(!abierto)}
        className="boton-fantasma inline-flex items-center gap-2 h-9 px-3 rounded-chico text-[13px] font-semibold">
        <Icono nombre="codigo" tamano={16} />Contratos
      </button>
      {abierto && (
        <div role="menu" aria-label="Contratos y herramientas" className="menu-flotante absolute right-0 mt-2 w-[280px] bg-white border border-linea rounded-recuadro shadow-[0_16px_40px_rgba(11,26,60,0.14)] p-2 z-40">
          {items.map((i) => (
            <a key={i.titulo} role="menuitem" href={i.href} target="_blank" rel="noopener noreferrer" onClick={() => setAbierto(false)}
              className="flex items-start gap-3 p-2.5 rounded-chico no-underline text-texto hover:bg-acc-suave">
              <Icono nombre="externo" tamano={16} className="mt-0.5 text-acc-texto" />
              <span className="flex flex-col"><b className="text-[13.5px]">{i.titulo}</b><span className="text-[12px] text-secundario">{i.detalle}</span></span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectorTema() {
  const { tema, elegir } = useTema();
  const { abierto, setAbierto, caja } = useMenu();
  const [principal, setPrincipal] = useState(tema.principal);
  const [acento, setAcento] = useState(tema.acento);
  useEffect(() => { setPrincipal(tema.principal); setAcento(tema.acento); }, [tema]);
  const igual = (t: Tema) => t.principal.toLowerCase() === tema.principal.toLowerCase() && t.acento.toLowerCase() === tema.acento.toLowerCase();
  return (
    <div ref={caja} className="relative">
      <button type="button" aria-expanded={abierto} aria-haspopup="dialog" aria-label="Personalizar colores" title="Personalizar colores" onClick={() => setAbierto(!abierto)}
        className="boton-fantasma inline-flex items-center justify-center w-9 h-9 rounded-chico">
        <Icono nombre="paleta" tamano={18} />
      </button>
      {abierto && (
        <div role="dialog" aria-label="Personalizar colores" className="menu-flotante absolute right-0 mt-2 w-[300px] bg-white border border-linea rounded-recuadro shadow-[0_16px_40px_rgba(11,26,60,0.14)] p-4 z-40 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <b className="text-[14px]">Colores de la plantilla</b>
            <span className="text-[12px] text-secundario">Se guardan en este navegador.</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TEMAS.map((t) => (
              <button key={t.nombre} type="button" aria-pressed={igual(t)} onClick={() => elegir(t)}
                className={`flex items-center gap-2 p-2 rounded-chico border text-left text-[12px] font-semibold ${igual(t) ? "border-acc bg-acc-suave" : "border-linea hover:border-secundario"}`}>
                <span className="flex shrink-0"><span className="w-4 h-4 rounded-l-full" style={{ background: t.principal }} /><span className="w-4 h-4 rounded-r-full" style={{ background: t.acento }} /></span>
                {t.nombre}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t border-linea pt-3">
            <span className="text-[12px] font-bold text-secundario">PERSONALIZADO</span>
            <label className="flex items-center justify-between gap-3 text-[13px]">Color principal
              <input type="color" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="w-10 h-8 border border-linea rounded cursor-pointer" />
            </label>
            <label className="flex items-center justify-between gap-3 text-[13px]">Acento
              <input type="color" value={acento} onChange={(e) => setAcento(e.target.value)} className="w-10 h-8 border border-linea rounded cursor-pointer" />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => elegir({ nombre: "Personalizado", principal, acento })} className="arka-boton arka-boton-primario flex-1">Aplicar</button>
              <button type="button" onClick={() => elegir(TEMAS[0])} className="arka-boton arka-boton-secundario">TGS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Encabezado de cada pantalla: título, una frase y acciones opcionales.
export function Encabezado({ titulo, descripcion, acciones }: { titulo: string; descripcion: string; acciones?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5 min-w-0">
        <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.02em]">{titulo}</h1>
        <p className="m-0 text-[15px] text-secundario max-w-[720px]">{descripcion}</p>
      </div>
      {acciones}
    </div>
  );
}

export function Tarjeta({ children, etiqueta, className = "" }: { children: ReactNode; etiqueta: string; className?: string }) {
  return (
    <section aria-label={etiqueta} className={`bg-white border border-linea rounded-tarjeta p-5 sm:p-6 flex flex-col gap-4 min-w-0 ${className}`}>
      {children}
    </section>
  );
}

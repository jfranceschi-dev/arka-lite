import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Tema de la plantilla. El color principal y el acento se pueden cambiar
// desde la UI; los demás tonos se derivan de esos dos para que el texto
// siempre tenga contraste suficiente. TGS (marino y cian) es el de fábrica.

export interface Tema {
  nombre: string;
  principal: string;
  acento: string;
}

export const TEMAS: Tema[] = [
  { nombre: "TGS · marino y cian", principal: "#0B2350", acento: "#2BA6CB" },
  { nombre: "Grafito y azul", principal: "#1F2937", acento: "#3B82F6" },
  { nombre: "Institucional verde", principal: "#0F3D2E", acento: "#1FA97A" },
  { nombre: "Vino y oro", principal: "#4A1430", acento: "#D4A017" },
];

export const TEMA_INICIAL = TEMAS[0];
const CLAVE = "arka-lite-ui:tema";

const aRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const aHex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();

export function mezclar(a: string, b: string, t: number): string {
  const [r1, g1, b1] = aRgb(a);
  const [r2, g2, b2] = aRgb(b);
  return aHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

function luminancia(hex: string): number {
  const canal = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = aRgb(hex);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Oscurece el color hasta que se lea bien sobre blanco y sobre su tono suave.
function textoLegible(acento: string): string {
  let c = acento;
  for (let i = 0; i < 20 && contraste(c, "#FFFFFF") < 5; i++) c = mezclar(c, "#000000", 0.08);
  return c;
}

export interface TonosTema {
  principal: string;
  profundo: string;
  acento: string;
  acentoTexto: string;
  acentoSuave: string;
  sobreAcento: string;
  sobrePrincipal: string;
}

export function tonos(t: Tema): TonosTema {
  return {
    principal: t.principal,
    profundo: mezclar(t.principal, "#000000", 0.25),
    acento: t.acento,
    acentoTexto: textoLegible(t.acento),
    acentoSuave: mezclar(t.acento, "#FFFFFF", 0.88),
    sobreAcento: contraste(t.acento, "#0A1430") >= contraste(t.acento, "#FFFFFF") ? "#0A1430" : "#FFFFFF",
    sobrePrincipal: contraste(t.principal, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#0A1430",
  };
}

export function aplicarTema(t: Tema): void {
  const v = tonos(t);
  const raiz = document.documentElement.style;
  raiz.setProperty("--tema-pri", v.principal);
  raiz.setProperty("--tema-prof", v.profundo);
  raiz.setProperty("--tema-acc", v.acento);
  raiz.setProperty("--tema-acc-texto", v.acentoTexto);
  raiz.setProperty("--tema-acc-suave", v.acentoSuave);
  raiz.setProperty("--tema-sobre-acc", v.sobreAcento);
  raiz.setProperty("--tema-sobre-pri", v.sobrePrincipal);
}

function leer(): Tema {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as Tema | null;
    if (v && /^#[0-9a-f]{6}$/i.test(v.principal) && /^#[0-9a-f]{6}$/i.test(v.acento)) return { nombre: String(v.nombre ?? "Personalizado"), principal: v.principal, acento: v.acento };
  } catch {
    // Sin almacenamiento local: se usa el tema de fábrica.
  }
  return TEMA_INICIAL;
}

interface ContextoTema {
  tema: Tema;
  elegir: (t: Tema) => void;
}

const Contexto = createContext<ContextoTema | null>(null);

export function ProveedorTema({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(leer);
  useEffect(() => { aplicarTema(tema); }, [tema]);
  const valor = useMemo<ContextoTema>(() => ({
    tema,
    elegir: (t) => {
      setTema(t);
      try { localStorage.setItem(CLAVE, JSON.stringify(t)); } catch { /* sin almacenamiento */ }
    },
  }), [tema]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTema(): ContextoTema {
  const v = useContext(Contexto);
  if (!v) throw new Error("useTema fuera de ProveedorTema");
  return v;
}

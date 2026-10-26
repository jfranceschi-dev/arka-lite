import { useCallback, useEffect, useMemo } from "react";
import { laminas, type Lamina } from "../../../contenido/index.ts";
import type { Recorrido } from "../../../contenido/tipos.ts";
import { navegar, type Vista } from "../rutas.ts";

export interface NavegacionLaminas {
  lista: Lamina[];
  indice: number;
  actual: Lamina;
  siguiente: Lamina | null;
  ir: (i: number) => void;
}

export function useLaminas(recorrido: Recorrido, idActual: string | null, vista: Vista): NavegacionLaminas {
  const lista = useMemo(() => laminas(recorrido), [recorrido]);
  const encontrado = idActual ? lista.findIndex((l) => l.id === idActual) : 0;
  const indice = encontrado < 0 ? 0 : encontrado;
  const ir = useCallback(
    (i: number) => {
      const n = Math.max(0, Math.min(lista.length - 1, i));
      navegar(vista, lista[n].id);
    },
    [lista, vista],
  );
  return { lista, indice, actual: lista[indice], siguiente: lista[indice + 1] ?? null, ir };
}

// Teclado: flechas, AvPág/RePág, Inicio/Fin. No interfiere con campos de
// formulario ni con la barra espaciadora sobre botones.
export function useTecladoLaminas(nav: NavegacionLaminas, extra?: (e: KeyboardEvent) => boolean): void {
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      const destino = e.target as HTMLElement | null;
      if (destino && (destino.closest("input, textarea, select, [contenteditable='true']") || e.altKey || e.ctrlKey || e.metaKey)) return;
      if (extra?.(e)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); nav.ir(nav.indice + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); nav.ir(nav.indice - 1); }
      else if (e.key === "Home") { e.preventDefault(); nav.ir(0); }
      else if (e.key === "End") { e.preventDefault(); nav.ir(nav.lista.length - 1); }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [nav, extra]);
}

// Sincroniza la presentación y el modo expositor abiertos en otra ventana.
const CANAL = "arka-presentacion";

export function useSincronizacion(idActual: string, alRecibir: (id: string) => void): void {
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const canal = new BroadcastChannel(CANAL);
    canal.onmessage = (m: MessageEvent<{ lamina?: string }>) => {
      if (m.data?.lamina && m.data.lamina !== idActual) alRecibir(m.data.lamina);
    };
    canal.postMessage({ lamina: idActual });
    return () => canal.close();
  }, [idActual, alRecibir]);
}

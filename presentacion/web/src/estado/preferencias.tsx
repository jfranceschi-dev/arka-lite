import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Recorrido } from "../../../contenido/index.ts";

// Preferencias de quien mira: recorrido y movimiento. Se recuerdan en el
// navegador solo como comodidad; si el almacenamiento falla, se usan valores
// por defecto.
export type Movimiento = "normal" | "reducido";

interface Preferencias {
  recorrido: Recorrido;
  movimiento: Movimiento;
  setRecorrido: (r: Recorrido) => void;
  setMovimiento: (m: Movimiento) => void;
}

const Contexto = createContext<Preferencias | null>(null);

function leer(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function guardar(clave: string, valor: string): void {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento disponible: la preferencia dura lo que la pestaña.
  }
}

function movimientoInicial(): Movimiento {
  const guardado = leer("arka.movimiento");
  if (guardado === "normal" || guardado === "reducido") return guardado;
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reducido" : "normal";
}

export function ProveedorPreferencias({ children }: { children: ReactNode }) {
  const [recorrido, setRecorridoEstado] = useState<Recorrido>(() => (leer("arka.recorrido") === "tecnico" ? "tecnico" : "ejecutivo"));
  const [movimiento, setMovimientoEstado] = useState<Movimiento>(movimientoInicial);

  useEffect(() => {
    document.documentElement.dataset.movimiento = movimiento;
  }, [movimiento]);

  const valor = useMemo<Preferencias>(
    () => ({
      recorrido,
      movimiento,
      setRecorrido: (r) => { setRecorridoEstado(r); guardar("arka.recorrido", r); },
      setMovimiento: (m) => { setMovimientoEstado(m); guardar("arka.movimiento", m); },
    }),
    [recorrido, movimiento],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePreferencias(): Preferencias {
  const v = useContext(Contexto);
  if (!v) throw new Error("usePreferencias fuera de ProveedorPreferencias");
  return v;
}

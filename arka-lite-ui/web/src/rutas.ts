import { useEffect, useState } from "react";

// Navegación por hash: funciona igual en Vite, nginx y port-forward sin
// configurar reescrituras de rutas en el servidor.
export type Vista = "solicitudes" | "enviadas" | "salud" | "ayuda";

export interface Ruta {
  vista: Vista;
  parametro: string | null;
}

const VISTAS: Vista[] = ["solicitudes", "enviadas", "salud", "ayuda"];

export function leerRuta(hash: string): Ruta {
  const partes = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const vista = VISTAS.includes(partes[0] as Vista) ? (partes[0] as Vista) : "solicitudes";
  return { vista, parametro: partes[1] ? decodeURIComponent(partes[1]) : null };
}

export function rutaA(vista: Vista, parametro?: string | null): string {
  return parametro ? `#/${vista}/${encodeURIComponent(parametro)}` : `#/${vista}`;
}

export function navegar(vista: Vista, parametro?: string | null): void {
  window.location.hash = rutaA(vista, parametro);
}

export function useRuta(): Ruta {
  const [ruta, setRuta] = useState<Ruta>(() => leerRuta(window.location.hash));
  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta(window.location.hash));
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  }, []);
  return ruta;
}

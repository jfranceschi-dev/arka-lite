import type { ReactNode } from "react";

// Iconos de trazo en rejilla 24 × 24, grosor 1.7, color del texto.
const trazos: Record<string, ReactNode> = {
  libro: <><path d="M3 5.5h6a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H3z" /><path d="M21 5.5h-6a3 3 0 0 0-3 3V20a2.5 2.5 0 0 1 2.5-2.5H21z" /></>,
  matraz: <><path d="M9 3h6M10 3v6L4.5 18.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3" /><path d="M7.5 15h9" /></>,
  codigo: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  rejilla: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></>,
  pantalla: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  ampliar: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  play: <path d="M7 5v14l12-7z" fill="currentColor" stroke="none" />,
  pausa: <path d="M8 5v14M16 5v14" />,
  anterior: <path d="M15 6l-6 6 6 6" />,
  siguiente: <path d="M9 6l6 6-6 6" />,
  reiniciar: <><path d="M4 12a8 8 0 1 0 2.3-5.6" /><path d="M4 4v4.5h4.5" /></>,
  repetir: <><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v4.5h-4.5" /></>,
  buscar: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>,
  lapiz: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  enviar: <path d="M4 12l16-8-6 16-2.5-6.5z" />,
  mas: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  checkCirculo: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></>,
  xCirculo: <><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></>,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  hueco: <circle cx="12" cy="12" r="7" />,
  aviso: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16v.01" /></>,
  sinRed: <><path d="M3 3l18 18" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M5 12.5a10 10 0 0 1 4-2.3M19 12.5a10 10 0 0 0-3.3-2" /><path d="M12 20h.01" /></>,
  pulso: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  mensaje: <path d="M4 6h16v10H8l-4 4z" />,
  lista: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  descargar: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></>,
  real: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /></>,
  animacion: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l6-3.5z" /></>,
  cerrar: <path d="M6 6l12 12M18 6L6 18" />,
  base: <><ellipse cx="12" cy="6" rx="7" ry="2.5" /><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /></>,
};

export type NombreIcono = keyof typeof trazos;

export function Icono({ nombre, tamano = 18, className }: { nombre: NombreIcono; tamano?: number; className?: string }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} focusable="false">
      {trazos[nombre]}
    </svg>
  );
}

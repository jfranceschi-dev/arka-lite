import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Algunas pruebas corren en entorno node, sin window.
if (typeof window !== "undefined") {
  afterEach(() => {
    cleanup();
    // SweetAlert2 monta sus diálogos fuera del árbol de React.
    document.querySelectorAll(".swal2-container").forEach((n) => n.remove());
    document.body.className = "";
    window.location.hash = "";
    try { window.localStorage.clear(); } catch { /* sin almacenamiento */ }
  });

  // jsdom no implementa matchMedia.
  if (!window.matchMedia) {
    window.matchMedia = (consulta: string) => ({
      matches: false, media: consulta, onchange: null,
      addListener: () => undefined, removeListener: () => undefined,
      addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
    }) as MediaQueryList;
  }
}

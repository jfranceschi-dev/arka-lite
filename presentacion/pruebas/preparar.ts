import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Las pruebas del generador PPTX corren en entorno node, sin window.
if (typeof window !== "undefined") {
  afterEach(() => {
    cleanup();
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

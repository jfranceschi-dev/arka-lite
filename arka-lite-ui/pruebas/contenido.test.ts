import { describe, expect, it } from "vitest";
import { validarContenido } from "../contenido/validacion.ts";
import { operaciones } from "../contenido/laboratorio.ts";
import { temasAyuda } from "../contenido/ayuda.ts";
import { diagramas } from "../diagramas/definiciones.ts";
import { estadoEnPaso, numeroDePaso, rutaArista } from "../diagramas/geometria.ts";

describe("operaciones y temas de Ayuda", () => {
  it("son consistentes: cada operación apunta a un tema y cada tema a un diagrama", () => {
    expect(validarContenido()).toEqual([]);
  });

  it("solo expone rutas verificadas; el endpoint de eventos solo para reentregar", () => {
    const rutas = operaciones.map((o) => `${o.metodo} ${o.rutaServicio}`);
    expect(rutas).toContain("POST /solicitudes");
    expect(rutas).toContain("POST /solicitudes/{id}/enviar");
    expect(rutas).toContain("GET /eventos/procesados");
    expect(rutas).toContain("GET /eventos");
    expect(operaciones.filter((o) => o.rutaServicio.includes("/eventos/solicitud-enviada")).map((o) => o.id)).toEqual(["reentregar"]);
  });

  it("la Ayuda empieza por el mapa del sistema y explica el envío en lenguaje simple", () => {
    expect(temasAyuda[0].diagrama).toBe("arquitectura");
    const enviar = temasAyuda.find((t) => t.id === "enviar")!;
    expect(enviar.diagrama).toBe("ayuda-enviar");
    expect(enviar.tecnico).toBeFalsy();
  });
});

describe("geometría de diagramas", () => {
  it("cada arista empieza y termina dentro del lienzo", () => {
    for (const d of diagramas) {
      for (const a of d.aristas) {
        const ruta = rutaArista(d, a);
        expect(ruta.length, `${d.id}.${a.id}`).toBeGreaterThanOrEqual(2);
        for (const [x, y] of ruta) {
          expect(x, `${d.id}.${a.id}`).toBeGreaterThanOrEqual(0);
          expect(y, `${d.id}.${a.id}`).toBeGreaterThanOrEqual(0);
          expect(x, `${d.id}.${a.id}`).toBeLessThanOrEqual(d.ancho);
          expect(y, `${d.id}.${a.id}`).toBeLessThanOrEqual(d.alto);
        }
      }
    }
  });

  it("marca actual, pasado y futuro según el paso, y numera cada flecha", () => {
    const envio = diagramas.find((d) => d.id === "envio")!;
    expect(estadoEnPaso(envio.pasos, 0, "e1", "aristas")).toBe("actual");
    expect(estadoEnPaso(envio.pasos, 2, "e1", "aristas")).toBe("pasado");
    expect(estadoEnPaso(envio.pasos, 0, "e5", "aristas")).toBe("futuro");
    expect(numeroDePaso(envio, "e5")).toBe(5);
  });
});

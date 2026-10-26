import { describe, expect, it } from "vitest";
import { laminas, secciones } from "../contenido/index.ts";
import { validarContenido } from "../contenido/validacion.ts";
import { operaciones } from "../contenido/laboratorio.ts";
import { diagramas } from "../diagramas/definiciones.ts";
import { estadoEnPaso, rutaArista } from "../diagramas/geometria.ts";

describe("fuente de contenido", () => {
  it("es consistente: ids, diagramas, operaciones, guiones y transiciones", () => {
    expect(validarContenido()).toEqual([]);
  });

  it("organiza once secciones numeradas más apertura y cierre", () => {
    expect(secciones.filter((s) => s.numero !== null).map((s) => s.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(secciones[0].titulo).toBe("Apertura");
    expect(secciones[secciones.length - 1].titulo).toBe("Cierre");
  });

  it("el recorrido técnico contiene todo el ejecutivo más sus diapositivas propias", () => {
    const ejecutivo = laminas("ejecutivo").map((l) => l.id);
    const tecnico = new Set(laminas("tecnico").map((l) => l.id));
    const soloEjecutivo = ejecutivo.filter((id) => !tecnico.has(id));
    expect(soloEjecutivo).toEqual([]);
    expect(tecnico.size).toBeGreaterThan(ejecutivo.length);
  });

  it("solo expone en el laboratorio rutas verificadas, sin el endpoint interno de eventos", () => {
    const rutas = operaciones.map((o) => `${o.metodo} ${o.rutaServicio}`);
    expect(rutas).toContain("POST /solicitudes/crear");
    expect(rutas).toContain("POST /solicitudes/{id}/enviar");
    expect(rutas).toContain("GET /eventos/procesados");
    expect(rutas.some((r) => r.includes("/eventos/solicitud-enviada"))).toBe(false);
  });

  it("incluye los diez diagramas pedidos, con logs y métricas por separado", () => {
    expect(diagramas.map((d) => d.id)).toEqual(["ui", "consulta", "dependencias", "envio", "entrega", "almacenamiento", "docker", "kubernetes", "cicd", "logs", "metricas"]);
  });
});

describe("geometría de diagramas", () => {
  it("cada arista empieza y termina en el borde de sus nodos", () => {
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

  it("marca actual, pasado y futuro según el paso", () => {
    const envio = diagramas.find((d) => d.id === "envio")!;
    expect(estadoEnPaso(envio.pasos, 0, "e1", "aristas")).toBe("actual");
    expect(estadoEnPaso(envio.pasos, 2, "e1", "aristas")).toBe("pasado");
    expect(estadoEnPaso(envio.pasos, 0, "e5", "aristas")).toBe("futuro");
  });
});

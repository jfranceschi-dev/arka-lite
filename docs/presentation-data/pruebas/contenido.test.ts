import { describe, expect, it } from "vitest";
import { laminas, secciones } from "../contenido/index.ts";
import { validarContenido } from "../contenido/validacion.ts";
import { diagramas } from "../diagramas/definiciones.ts";
import { estadoEnPaso, rutaArista } from "../diagramas/geometria.ts";

describe("fuente de contenido", () => {
  it("es consistente: ids, diagramas, operaciones, guiones y transiciones", () => {
    expect(validarContenido()).toEqual([]);
  });

  it("organiza ocho partes numeradas más apertura y cierre", () => {
    expect(secciones.filter((s) => s.numero !== null).map((s) => s.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(secciones[0].titulo).toBe("Apertura");
    expect(secciones.map((s) => s.titulo)).toContain("Base de datos");
    expect(secciones[secciones.length - 1].titulo).toBe("Valor y cierre");
  });

  it("cada variante contiene a la anterior y sigue siendo corta", () => {
    const resumen = laminas("resumen").map((l) => l.id);
    const ejecutivo = laminas("ejecutivo").map((l) => l.id);
    const tecnico = new Set(laminas("tecnico").map((l) => l.id));
    expect(resumen.filter((id) => !ejecutivo.includes(id))).toEqual([]);
    expect(ejecutivo.filter((id) => !tecnico.has(id))).toEqual([]);
    expect(resumen.length).toBeLessThanOrEqual(20);
    expect(ejecutivo.length).toBeLessThanOrEqual(40);
  });

  it("cada parte numerada termina con sus aprendizajes", () => {
    for (const s of secciones.filter((x) => x.numero !== null)) {
      expect(s.diapositivas[s.diapositivas.length - 1].visual?.tipo, s.id).toBe("aprendizajes");
    }
  });

  it("muestra cómo se comporta el sistema cuando algo falla", () => {
    const escenarios = laminas("resumen").filter((l) => l.diapositiva.visual?.tipo === "escenario");
    expect(escenarios.length).toBeGreaterThanOrEqual(1);
  });

  it("no reparte láminas por persona", () => {
    const texto = JSON.stringify(secciones);
    expect(texto).not.toContain("Participante");
    expect(texto).not.toContain("participante");
  });

  it("no gira alrededor de una sola solicitud de ejemplo", () => {
    const texto = JSON.stringify(secciones);
    expect(texto).not.toContain("INC-002");
    expect(texto).not.toContain("caso conductor");
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

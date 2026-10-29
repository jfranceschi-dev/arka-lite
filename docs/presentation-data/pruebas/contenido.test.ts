import { describe, expect, it } from "vitest";
import { laminas, secciones } from "../contenido/index.ts";
import { validarContenido } from "../contenido/validacion.ts";
import { DIVISIONES, personaCon, rolDe } from "../contenido/reparto.ts";
import { diagramas } from "../diagramas/definiciones.ts";
import { estadoEnPaso, rutaArista } from "../diagramas/geometria.ts";

describe("fuente de contenido", () => {
  it("es consistente: ids, diagramas, operaciones, guiones y transiciones", () => {
    expect(validarContenido()).toEqual([]);
  });

  it("organiza siete partes numeradas más apertura y cierre", () => {
    expect(secciones.filter((s) => s.numero !== null).map((s) => s.numero)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(secciones[0].titulo).toBe("Apertura");
    expect(secciones.map((s) => s.titulo)).toContain("Base de datos");
    expect(secciones[secciones.length - 1].titulo).toBe("Valor y cierre");
  });

  it("va a fondo en base de datos, interconexión y DevOps, y en vista general en fundamentos y arquitectura", () => {
    const enfoque = Object.fromEntries(secciones.filter((s) => s.numero !== null).map((s) => [s.id, s.enfoque]));
    expect(enfoque).toMatchObject({ s01: "general", s02: "general", s03: "fondo", s04: "fondo", s05: "fondo" });
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

  it("el equipo arka-litos aparece en todas las variantes", () => {
    for (const r of ["resumen", "ejecutivo", "tecnico"] as const) expect(laminas(r).map((l) => l.id)).toContain("s00-equipo");
  });

  it("reparte cada lámina en las dos divisiones: 8 y 7 personas", () => {
    expect(DIVISIONES.map((d) => d.personas.length)).toEqual([8, 7]);
    for (const d of DIVISIONES) {
      expect(d.personas.filter((p) => p.area === "Desarrollo").length).toBe(d.personas.length - 3);
      for (const l of laminas("tecnico")) expect(() => personaCon(d, rolDe(l))).not.toThrow();
    }
  });

  it("el evento es un dato que viaja, no una pieza del sistema", () => {
    const mapa = secciones.flatMap((s) => s.diapositivas).find((d) => d.id === "s02-mapa")!;
    expect(mapa.visual?.tipo).toBe("capas");
    const piezas = mapa.visual?.tipo === "capas" ? mapa.visual.capas.flatMap((c) => c.elementos.map((e) => e.titulo)) : [];
    expect(piezas.join(" ")).not.toContain("SolicitudEnviada");
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

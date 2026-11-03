import { describe, expect, it } from "vitest";
import { laminas, partesDe, secciones } from "../contenido/index.ts";
import { validarContenido } from "../contenido/validacion.ts";
import { DIVISION, minutosDeLamina, personaCon, rolDe } from "../contenido/reparto.ts";
import { VARIANTES } from "../contenido/tipos.ts";

describe("fuente de contenido", () => {
  it("es consistente: ids, guiones, transiciones y temas que no se mencionan", () => {
    expect(validarContenido()).toEqual([]);
  });

  it("organiza siete partes numeradas más apertura y cierre", () => {
    expect(secciones.filter((s) => s.numero !== null).map((s) => s.numero)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(secciones[0].titulo).toBe("Apertura");
    expect(secciones.map((s) => s.titulo)).toContain("Base de datos");
    expect(secciones[secciones.length - 1].titulo).toBe("Valor y cierre");
  });

  it("va en detalle en base de datos, interconexión y DevOps, y en vista general en fundamentos y arquitectura", () => {
    const enfoque = Object.fromEntries(secciones.filter((s) => s.numero !== null).map((s) => [s.id, s.enfoque]));
    expect(enfoque).toMatchObject({ s01: "general", s02: "general", s03: "fondo", s04: "fondo", s05: "fondo" });
  });

  it("solo hay dos versiones", () => {
    expect(VARIANTES).toEqual(["ejecutivo-con-videos", "ejecutivo-sin-demo"]);
  });

  it("cada parte numerada termina con sus aprendizajes", () => {
    for (const s of secciones.filter((x) => x.numero !== null)) {
      expect(s.diapositivas[s.diapositivas.length - 1].visual?.tipo, s.id).toBe("aprendizajes");
    }
  });

  it("cada lámina trae sus ideas para decirlas con otras palabras", () => {
    for (const s of secciones) for (const d of s.diapositivas) expect(d.guion.conTusPalabras.length, d.id).toBeGreaterThanOrEqual(2);
  });

  it("explica qué es un ORM y cómo se complementan los contenedores y los Pods", () => {
    const ids = secciones.flatMap((s) => s.diapositivas).map((d) => d.id);
    expect(ids).toContain("s03-que-es-orm");
    expect(secciones.flatMap((s) => s.diapositivas).some((d) => d.visual?.tipo === "pods")).toBe(true);
  });

  it("muestra cómo se comporta el sistema cuando algo falla", () => {
    const escenarios = laminas("ejecutivo-sin-demo").filter((l) => l.diapositiva.visual?.tipo === "escenario");
    expect(escenarios.length).toBeGreaterThanOrEqual(1);
  });

  it("reparte cada lámina entre 7 personas: 4 de desarrollo, 1 de base de datos y 2 de infraestructura", () => {
    expect(DIVISION.personas.length).toBe(7);
    expect(DIVISION.personas.filter((p) => p.area === "Desarrollo").length).toBe(4);
    for (const v of VARIANTES) for (const l of laminas(v)) expect(() => personaCon(rolDe(l))).not.toThrow();
  });

  it("Jossett presenta CI/CD y Abdiel cierra", () => {
    const lista = laminas("ejecutivo-sin-demo");
    const quien = (id: string) => personaCon(rolDe(lista.find((l) => l.id === id)!)).nombre;
    expect(quien("s05-pipeline")).toBe("Jossett Franceschi");
    expect(quien("s08-gracias")).toBe("Abdiel Barria");
    expect(JSON.stringify(DIVISION)).not.toContain("Rodolfo");
  });

  it("el evento es un dato que viaja, no una pieza del sistema", () => {
    const mapa = secciones.flatMap((s) => s.diapositivas).find((d) => d.id === "s02-practica")!;
    expect(mapa.visual?.tipo).toBe("sistema");
    const piezas = mapa.visual?.tipo === "sistema" ? mapa.visual.servicios.map((e) => e.titulo) : [];
    expect(piezas.join(" ")).not.toContain("SolicitudEnviada");
  });

  it("la versión sin demostración no tiene la parte 7 ni la anuncia", () => {
    const lista = laminas("ejecutivo-sin-demo");
    expect(lista.some((l) => l.seccion.id === "s07")).toBe(false);
    expect(partesDe("ejecutivo-sin-demo").map((s) => s.numero)).toEqual([1, 2, 3, 4, 5, 6]);
    const agenda = lista.find((l) => l.id === "s00-agenda")!.diapositiva;
    expect(agenda.visual?.tipo === "ruta" ? agenda.visual.partes?.length : 0).toBe(6);
    expect(JSON.stringify(lista.map((l) => l.diapositiva.guion))).not.toMatch(/demostraci[oó]n/i);
  });

  it("la versión con videos muestra sus cuatro videos, y la otra ninguno", () => {
    const lista = laminas("ejecutivo-con-videos");
    const videos = lista.filter((l) => l.diapositiva.visual?.tipo === "video");
    expect(videos.map((l) => l.id)).toEqual(["s05-flujo", "s06-logs", "s07-ui", "s07-caida"]);
    expect(laminas("ejecutivo-sin-demo").filter((l) => l.diapositiva.visual?.tipo === "video")).toEqual([]);
    expect(lista.find((l) => l.seccion.id === "s07")!.seccion.enfoque).toBe("video");
    // Lo que se dice encima del video no suma: manda lo que dure más.
    for (const l of videos) expect(minutosDeLamina(l)).toBeGreaterThan(0.4);
  });

  it("no gira alrededor de una sola solicitud de ejemplo", () => {
    const texto = JSON.stringify(secciones);
    expect(texto).not.toContain("INC-002");
    expect(texto).not.toContain("caso conductor");
  });
});

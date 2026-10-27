// @vitest-environment node
import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { agruparPasos, construirPresentacion } from "../generador-pptx/construir.ts";
import { laminas } from "../contenido/index.ts";

describe("generador PPTX", () => {
  it("reparte los pasos sin perder ninguno", () => {
    expect(agruparPasos(10, 3)).toEqual([[0, 3], [4, 6], [7, 9]]);
    expect(agruparPasos(2, 5)).toEqual([[0, 0], [1, 1]]);
  });

  it("produce un PPTX 16:9 con una nota por diapositiva", async () => {
    const pptx = construirPresentacion("ejecutivo");
    const datos = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
    const zip = await JSZip.loadAsync(datos);
    const presentacion = await zip.file("ppt/presentation.xml")!.async("string");
    expect(presentacion).toContain('<p:sldSz cx="12192000" cy="6858000"');
    const diapositivas = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
    const notas = Object.keys(zip.files).filter((f) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(f));
    expect(diapositivas.length).toBeGreaterThanOrEqual(laminas("ejecutivo").length);
    expect(notas.length).toBe(diapositivas.length);
    const portada = await zip.file("ppt/slides/slide1.xml")!.async("string");
    expect(portada).toContain("ARKA-Lite");
    expect(portada).toContain("Recorrido ejecutivo");
    expect(portada).toContain("UPSKILLING BACKEND JAVA");
  });

  it("separa qué decir de qué hacer en las notas", async () => {
    const datos = (await construirPresentacion("tecnico").write({ outputType: "nodebuffer" })) as Buffer;
    const zip = await JSZip.loadAsync(datos);
    const textos = await Promise.all(Object.keys(zip.files).filter((f) => f.startsWith("ppt/notesSlides/notesSlide")).map((f) => zip.file(f)!.async("string")));
    const todo = textos.join("\n");
    expect(todo).toContain("QUÉ DECIR");
    expect(todo).toContain("QUÉ HACER (no se dice)");
    expect(todo).toContain("SI PREGUNTAN");
  });
});

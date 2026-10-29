// @vitest-environment node
import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { construirPresentacion, generarPptx, nombreArchivo } from "../generador-pptx/construir.ts";
import { clicsEnXml } from "../generador-pptx/posproceso.ts";
import { laminas } from "../contenido/index.ts";
import { clicsDeLamina } from "../contenido/validacion.ts";

describe("generador PPTX", () => {
  it("nombra un archivo por variante", () => {
    expect(nombreArchivo("resumen")).toBe("ARKA-Lite-resumen.pptx");
    expect(nombreArchivo("tecnico")).toBe("ARKA-Lite-tecnico.pptx");
  });

  it("el ejecutivo no repite diagramas paso a paso: una lámina por contenido", async () => {
    const datos = (await construirPresentacion("ejecutivo").write({ outputType: "nodebuffer" })) as Buffer;
    const zip = await JSZip.loadAsync(datos);
    const diapositivas = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
    expect(diapositivas.length).toBe(laminas("ejecutivo").length);
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
    expect(portada).toContain("VERSIÓN EJECUTIVO");
    expect(portada).toContain("Base de datos");
    expect(portada).toContain("UPSKILLING BACKEND JAVA");
  });

  it("separa qué decir de qué hacer en las notas", async () => {
    const datos = (await construirPresentacion("tecnico").write({ outputType: "nodebuffer" })) as Buffer;
    const zip = await JSZip.loadAsync(datos);
    const textos = await Promise.all(Object.keys(zip.files).filter((f) => f.startsWith("ppt/notesSlides/notesSlide")).map((f) => zip.file(f)!.async("string")));
    const todo = textos.join("\n");
    expect(todo).toContain("QUÉ DECIR");
    expect(todo).toContain("PRESENTA:");
    expect(todo).toContain("QUÉ HACER (no se dice)");
    expect(todo).toContain("SI PREGUNTAN");
  });

  it("cada lámina entra con transición y arma su diagrama con los mismos clics que marca el guion", async () => {
    const zip = await JSZip.loadAsync(await generarPptx("ejecutivo"));
    const lista = laminas("ejecutivo");
    for (let i = 0; i < lista.length; i++) {
      const xml = await zip.file(`ppt/slides/slide${i + 1}.xml`)!.async("string");
      expect(xml, lista[i].id).toContain("<p:transition");
      expect(clicsEnXml(xml), lista[i].id).toBe(clicsDeLamina(lista[i].diapositiva));
    }
  });
});

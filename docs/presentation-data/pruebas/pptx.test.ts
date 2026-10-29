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
    expect(nombreArchivo("ejecutivo-con-videos")).toBe("ARKA-Lite-ejecutivo-con-videos.pptx");
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
    expect(portada).toContain("EQUIPO ARKA-LITOS");
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
    for (const v of ["ejecutivo", "ejecutivo-sin-demo"] as const) {
      const zip = await JSZip.loadAsync(await generarPptx(v));
      const lista = laminas(v);
      for (let i = 0; i < lista.length; i++) {
        const xml = await zip.file(`ppt/slides/slide${i + 1}.xml`)!.async("string");
        expect(xml, `${v} · ${lista[i].id}`).toContain("<p:transition");
        expect(clicsEnXml(xml), `${v} · ${lista[i].id}`).toBe(clicsDeLamina(lista[i].diapositiva));
      }
    }
  });

  it("con videos, cada video va dentro del PPTX y se reproduce en el primer clic", async () => {
    const zip = await JSZip.loadAsync(await generarPptx("ejecutivo-con-videos"));
    const lista = laminas("ejecutivo-con-videos");
    expect(Object.keys(zip.files).filter((f) => /^ppt\/media\/.*\.mp4$/.test(f)).length).toBeGreaterThanOrEqual(2);
    for (const id of ["s07-ui", "s07-caida"]) {
      const i = lista.findIndex((l) => l.id === id);
      const xml = await zip.file(`ppt/slides/slide${i + 1}.xml`)!.async("string");
      expect(xml, id).toContain("<a:videoFile");
      expect(xml, id).toContain('cmd="playFrom(0.0)"');
      expect(xml, id).toContain('cmd="togglePause"');
      expect(xml, id).toContain("<p:cMediaNode");
      expect(clicsEnXml(xml), id).toBe(1);
    }
    const portada = await zip.file("ppt/slides/slide1.xml")!.async("string");
    expect(portada).toContain("VERSIÓN EJECUTIVO CON VIDEOS");
  });
});

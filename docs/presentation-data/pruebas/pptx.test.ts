// @vitest-environment node
import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { generarPptx, nombreArchivo } from "../generador-pptx/construir.ts";
import { laminas } from "../contenido/index.ts";
import { DIVISION, personaCon, rolDe } from "../contenido/reparto.ts";

const generar = async (v: Parameters<typeof generarPptx>[0]) => JSZip.loadAsync(await generarPptx(v));

describe("generador PPTX", () => {
  it("nombra un archivo por versión", () => {
    expect(nombreArchivo("ejecutivo-con-videos")).toBe("ARKA-Lite-ejecutivo-con-videos.pptx");
    expect(nombreArchivo("ejecutivo-sin-demo")).toBe("ARKA-Lite-ejecutivo-sin-demo.pptx");
  });

  it("produce un PPTX 16:9 con una lámina por contenido, el reparto al final y una nota por diapositiva", async () => {
    const zip = await generar("ejecutivo-sin-demo");
    const presentacion = await zip.file("ppt/presentation.xml")!.async("string");
    expect(presentacion).toContain('<p:sldSz cx="12192000" cy="6858000"');
    const diapositivas = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
    const notas = Object.keys(zip.files).filter((f) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(f));
    expect(diapositivas.length).toBe(laminas("ejecutivo-sin-demo").length + 1);
    expect(notas.length).toBe(diapositivas.length);
    const portada = await zip.file("ppt/slides/slide1.xml")!.async("string");
    expect(portada).toContain("ARKA-Lite");
    expect(portada).toContain("Base de datos");
    expect(portada).toContain("UPSKILLING BACKEND JAVA");
    expect(portada).toContain("EQUIPO ARKA-LITOS");
    expect(portada).not.toContain("SIN DEMOSTRACIÓN");
  });

  it("la última lámina es el reparto, con el equipo y sus números de lámina", async () => {
    for (const v of ["ejecutivo-sin-demo", "ejecutivo-con-videos"] as const) {
      const zip = await generar(v);
      const lista = laminas(v);
      const xml = await zip.file(`ppt/slides/slide${lista.length + 1}.xml`)!.async("string");
      expect(xml).toContain("Reparto de la presentación");
      for (const p of DIVISION.personas) if (lista.some((l) => personaCon(rolDe(l)) === p)) expect(xml, p.nombre).toContain(p.nombre);
      expect(xml).not.toContain("Rodolfo");
    }
  });

  it("separa qué decir, con tus palabras y qué hacer en las notas", async () => {
    const zip = await generar("ejecutivo-con-videos");
    const textos = await Promise.all(Object.keys(zip.files).filter((f) => f.startsWith("ppt/notesSlides/notesSlide")).map((f) => zip.file(f)!.async("string")));
    const todo = textos.join("\n");
    expect(todo).toContain("SI SE TE OLVIDA");
    expect(todo).toContain("PRESENTA:");
    expect(todo).toContain("QUÉ HACER (no se dice)");
    expect(todo).toContain("SI PREGUNTAN");
  });

  it("cada lámina entra completa, con un fundido, y un clic siempre avanza", async () => {
    for (const v of ["ejecutivo-sin-demo", "ejecutivo-con-videos"] as const) {
      const zip = await generar(v);
      const lista = laminas(v);
      for (let i = 0; i < lista.length; i++) {
        const xml = await zip.file(`ppt/slides/slide${i + 1}.xml`)!.async("string");
        expect(xml, `${v} · ${lista[i].id}`).toContain("<p:transition");
        expect(xml, `${v} · ${lista[i].id}`).not.toContain("interactiveSeq");
        expect(xml, `${v} · ${lista[i].id}`).not.toContain('presetClass="entr"');
      }
    }
  });

  it("cada video va dentro del PPTX y arranca solo al llegar a la lámina", async () => {
    const zip = await generar("ejecutivo-con-videos");
    const lista = laminas("ejecutivo-con-videos");
    expect(Object.keys(zip.files).filter((f) => /^ppt\/media\/.*\.mp4$/.test(f)).length).toBeGreaterThanOrEqual(2);
    for (const id of ["s05-flujo", "s07-ui", "s07-caida"]) {
      const i = lista.findIndex((l) => l.id === id);
      const xml = await zip.file(`ppt/slides/slide${i + 1}.xml`)!.async("string");
      expect(xml, id).toContain("<a:videoFile");
      expect(xml, id).toContain('cmd="playFrom(0.0)"');
      expect(xml, id).toContain('nodeType="afterEffect"');
      expect(xml, id).toContain("<p:cMediaNode");
    }
  });
});

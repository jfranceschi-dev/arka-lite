import { writeFileSync } from "node:fs";
import JSZip from "jszip";
import type PptxGenJS from "pptxgenjs";

// pptxgenjs no permite elegir la punta ni la unión de una línea. Los íconos se
// ven mejor con puntas y uniones redondeadas, como en su diseño original, así
// que se ajustan en el XML de cada lámina antes de escribir el archivo.
export function redondearIconos(xml: string): string {
  return xml.replace(/<p:sp>[\s\S]*?<\/p:sp>/g, (forma) => {
    if (!/<p:cNvPr [^>]*name="Icono /.test(forma)) return forma;
    return forma.replace(/<a:ln w="(\d+)">([\s\S]*?)<\/a:ln>/, '<a:ln w="$1" cap="rnd">$2<a:round/></a:ln>');
  });
}

export async function generarBuffer(pptx: PptxGenJS): Promise<Buffer> {
  const datos = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  const zip = await JSZip.loadAsync(datos);
  for (const nombre of Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    const xml = await zip.file(nombre)!.async("string");
    zip.file(nombre, redondearIconos(xml));
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export async function generarArchivo(pptx: PptxGenJS, ruta: string): Promise<void> {
  writeFileSync(ruta, await generarBuffer(pptx));
}

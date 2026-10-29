import { writeFileSync } from "node:fs";
import JSZip from "jszip";
import type PptxGenJS from "pptxgenjs";

// pptxgenjs no permite elegir la punta ni la unión de una línea. Los íconos se
// ven mejor con puntas y uniones redondeadas, como en su diseño original, así
// que se ajustan en el XML de cada lámina antes de escribir el archivo.
export function redondearIconos(xml: string): string {
  return xml.replace(/<p:sp>[\s\S]*?<\/p:sp>/g, (forma) => {
    if (!/<p:cNvPr [^>]*name="(\[p\d+\] )?Icono /.test(forma)) return forma;
    return forma.replace(/<a:ln w="(\d+)">([\s\S]*?)<\/a:ln>/, '<a:ln w="$1" cap="rnd">$2<a:round/></a:ln>');
  });
}

// pptxgenjs tampoco escribe transiciones ni animaciones. Cada lámina entra
// con un fundido, y las formas marcadas con "[pN]" aparecen con un fundido
// en el clic N: todas las del mismo paso a la vez.
export function animar(xml: string): string {
  const pasos = new Map<number, { id: string; forma: boolean }[]>();
  for (const m of xml.matchAll(/<p:(nvSpPr|nvPicPr)>\s*<p:cNvPr id="(\d+)" name="\[p(\d+)\] /g)) {
    const n = Number(m[3]);
    if (!pasos.has(n)) pasos.set(n, []);
    pasos.get(n)!.push({ id: m[2], forma: m[1] === "nvSpPr" });
  }
  const transicion = '<p:transition spd="med"><p:fade/></p:transition>';
  let tiempos = "";
  if (pasos.size > 0) {
    let id = 2;
    const nuevo = () => ++id;
    const clics = [...pasos.keys()].sort((a, b) => a - b).map((n) => {
      const efectos = pasos.get(n)!.map((f, i) => {
        const a = nuevo();
        const b = nuevo();
        const c = nuevo();
        return `<p:par><p:cTn id="${a}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="${i === 0 ? "clickEffect" : "withEffect"}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:set><p:cBhvr><p:cTn id="${b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${f.id}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set><p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${c}" dur="400"/><p:tgtEl><p:spTgt spid="${f.id}"/></p:tgtEl></p:cBhvr></p:animEffect></p:childTnLst></p:cTn></p:par>`;
      });
      const externo = nuevo();
      const interno = nuevo();
      return `<p:par><p:cTn id="${externo}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${interno}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${efectos.join("")}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
    });
    const construir = [...pasos.values()].flat().filter((f) => f.forma).map((f) => `<p:bldP spid="${f.id}" grpId="0" animBg="1"/>`).join("");
    tiempos = `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${clics.join("")}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst>${construir ? `<p:bldLst>${construir}</p:bldLst>` : ""}</p:timing>`;
  }
  return xml.replace("</p:clrMapOvr></p:sld>", `</p:clrMapOvr>${transicion}${tiempos}</p:sld>`);
}

// Cuántos clics arma cada lámina, según las marcas de su XML.
export function clicsEnXml(xml: string): number {
  return new Set([...xml.matchAll(/name="\[p(\d+)\] /g)].map((m) => m[1])).size;
}

export async function generarBuffer(pptx: PptxGenJS): Promise<Buffer> {
  const datos = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  const zip = await JSZip.loadAsync(datos);
  for (const nombre of Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    const xml = await zip.file(nombre)!.async("string");
    zip.file(nombre, animar(redondearIconos(xml)));
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export async function generarArchivo(pptx: PptxGenJS, ruta: string): Promise<void> {
  writeFileSync(ruta, await generarBuffer(pptx));
}

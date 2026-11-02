import { writeFileSync } from "node:fs";
import JSZip from "jszip";
import type PptxGenJS from "pptxgenjs";
import { segundosDeVideo } from "../contenido/videos.ts";

// pptxgenjs no permite elegir la punta ni la unión de una línea. Los íconos se
// ven mejor con puntas y uniones redondeadas, como en su diseño original, así
// que se ajustan en el XML de cada lámina antes de escribir el archivo.
export function redondearIconos(xml: string): string {
  return xml.replace(/<p:sp>[\s\S]*?<\/p:sp>/g, (forma) => {
    if (!/<p:cNvPr [^>]*name="Icono /.test(forma)) return forma;
    return forma.replace(/<a:ln w="(\d+)">([\s\S]*?)<\/a:ln>/, '<a:ln w="$1" cap="rnd">$2<a:round/></a:ln>');
  });
}

// pptxgenjs numera los videos con su propia cuenta y puede repetir el id de
// otra forma de la lámina; la animación que reproduce el video apuntaría a
// la forma equivocada y PowerPoint no abriría el archivo. Cada id repetido
// recibe uno nuevo, antes de escribir las animaciones.
export function idsUnicos(xml: string): string {
  const usados = new Set<string>();
  let siguiente = Math.max(0, ...[...xml.matchAll(/<p:cNvPr id="(\d+)"/g)].map((m) => Number(m[1])));
  return xml.replace(/<p:cNvPr id="(\d+)"/g, (todo, id: string) => {
    if (!usados.has(id)) {
      usados.add(id);
      return todo;
    }
    return `<p:cNvPr id="${++siguiente}"`;
  });
}

// pptxgenjs tampoco escribe transiciones ni animaciones. Cada lámina entra
// completa, con un fundido: quien presenta no necesita clics para armarla. Un
// video se reproduce solo al llegar a su lámina, sin pausa al hacerle clic: con
// ella, el clic sobre el video lo detenía en vez de pasar a la lámina siguiente.
export function animar(xml: string): string {
  const transicion = '<p:transition spd="med"><p:fade/></p:transition>';
  const video = xml.match(/<p:nvPicPr>\s*<p:cNvPr id="(\d+)" name="Video ([^"]*)"/);
  let tiempos = "";
  if (video) {
    const spid = video[1];
    const ms = Math.round((segundosDeVideo(video[2]) ?? 60) * 1000);
    const reproducir = `<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst><p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="${ms}" fill="hold"/><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
    // El nodo de medios del video: sin él, PowerPoint no lo reproduce.
    const medio = `<p:video><p:cMediaNode vol="80000"><p:cTn id="7" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cMediaNode></p:video>`;
    tiempos = `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${reproducir}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>${medio}</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
  }
  return xml.replace("</p:clrMapOvr></p:sld>", `</p:clrMapOvr>${transicion}${tiempos}</p:sld>`);
}

export async function generarBuffer(pptx: PptxGenJS): Promise<Buffer> {
  const datos = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  const zip = await JSZip.loadAsync(datos);
  for (const nombre of Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    const xml = await zip.file(nombre)!.async("string");
    zip.file(nombre, animar(redondearIconos(idsUnicos(xml))));
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export async function generarArchivo(pptx: PptxGenJS, ruta: string): Promise<void> {
  writeFileSync(ruta, await generarBuffer(pptx));
}

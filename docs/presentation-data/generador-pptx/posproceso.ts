import { writeFileSync } from "node:fs";
import JSZip from "jszip";
import type PptxGenJS from "pptxgenjs";
import { segundosDeVideo } from "../contenido/videos.ts";

// pptxgenjs no permite elegir la punta ni la unión de una línea. Los íconos se
// ven mejor con puntas y uniones redondeadas, como en su diseño original, así
// que se ajustan en el XML de cada lámina antes de escribir el archivo.
export function redondearIconos(xml: string): string {
  return xml.replace(/<p:sp>[\s\S]*?<\/p:sp>/g, (forma) => {
    if (!/<p:cNvPr [^>]*name="(\[p\d+\] )?Icono /.test(forma)) return forma;
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
// con un fundido, y las formas marcadas con "[pN]" aparecen con un fundido
// en el clic N: todas las del mismo paso a la vez. Un video marcado con
// "[vN]" se reproduce en el clic N, y un clic sobre el video lo pausa o lo
// reanuda, como cuando se inserta a mano en PowerPoint.
export function animar(xml: string): string {
  const pasos = new Map<number, { id: string; tipo: "forma" | "imagen" | "video"; ms: number }[]>();
  for (const m of xml.matchAll(/<p:(nvSpPr|nvPicPr)>\s*<p:cNvPr id="(\d+)" name="\[([pv])(\d+)\] ([^"]*)"/g)) {
    const n = Number(m[4]);
    const video = m[3] === "v";
    const ms = video ? Math.round((segundosDeVideo(m[5].replace(/^Video /, "")) ?? 60) * 1000) : 0;
    if (!pasos.has(n)) pasos.set(n, []);
    pasos.get(n)!.push({ id: m[2], tipo: video ? "video" : m[1] === "nvSpPr" ? "forma" : "imagen", ms });
  }
  const transicion = '<p:transition spd="med"><p:fade/></p:transition>';
  let tiempos = "";
  if (pasos.size > 0) {
    let id = 2;
    const nuevo = () => ++id;
    const condicion = (spid: string) => `<p:cond evt="onClick" delay="0"><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cond>`;
    const clics = [...pasos.keys()].sort((a, b) => a - b).map((n) => {
      const efectos = pasos.get(n)!.map((f, i) => {
        const nodo = i === 0 ? "clickEffect" : "withEffect";
        const a = nuevo();
        const b = nuevo();
        if (f.tipo === "video") {
          return `<p:par><p:cTn id="${a}" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="${nodo}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="${b}" dur="${f.ms}" fill="hold"/><p:tgtEl><p:spTgt spid="${f.id}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>`;
        }
        const c = nuevo();
        return `<p:par><p:cTn id="${a}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="${nodo}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:set><p:cBhvr><p:cTn id="${b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${f.id}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set><p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${c}" dur="400"/><p:tgtEl><p:spTgt spid="${f.id}"/></p:tgtEl></p:cBhvr></p:animEffect></p:childTnLst></p:cTn></p:par>`;
      });
      const externo = nuevo();
      const interno = nuevo();
      return `<p:par><p:cTn id="${externo}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${interno}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${efectos.join("")}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
    });
    const videos = [...pasos.values()].flat().filter((f) => f.tipo === "video");
    // Clic sobre el video: pausa o reanuda.
    const pausas = videos.map((f) => {
      const [a, b, c, d, e] = [nuevo(), nuevo(), nuevo(), nuevo(), nuevo()];
      return `<p:seq concurrent="1" nextAc="seek"><p:cTn id="${a}" restart="whenNotActive" fill="hold" evtFilter="cancelBubble" nodeType="interactiveSeq"><p:stCondLst>${condicion(f.id)}</p:stCondLst><p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst><p:par><p:cTn id="${b}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${c}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${d}" presetID="2" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="togglePause"><p:cBhvr><p:cTn id="${e}" dur="1" fill="hold"/><p:tgtEl><p:spTgt spid="${f.id}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:nextCondLst>${condicion(f.id)}</p:nextCondLst></p:seq>`;
    });
    // El nodo de medios de cada video: sin él, PowerPoint no lo reproduce.
    const medios = videos.map((f) => `<p:video><p:cMediaNode vol="80000"><p:cTn id="${nuevo()}" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${f.id}"/></p:tgtEl></p:cMediaNode></p:video>`);
    const construir = [...pasos.values()].flat().filter((f) => f.tipo === "forma").map((f) => `<p:bldP spid="${f.id}" grpId="0" animBg="1"/>`).join("");
    tiempos = `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${clics.join("")}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>${pausas.join("")}${medios.join("")}</p:childTnLst></p:cTn></p:par></p:tnLst>${construir ? `<p:bldLst>${construir}</p:bldLst>` : ""}</p:timing>`;
  }
  return xml.replace("</p:clrMapOvr></p:sld>", `</p:clrMapOvr>${transicion}${tiempos}</p:sld>`);
}

// Cuántos clics arma cada lámina, según las marcas de su XML.
export function clicsEnXml(xml: string): number {
  return new Set([...xml.matchAll(/name="\[[pv](\d+)\] /g)].map((m) => m[1])).size;
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

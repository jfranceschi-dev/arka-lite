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

// La lámina en EMU (LAYOUT_WIDE): las trayectorias se escriben en fracciones
// de su ancho y su alto.
const LAMINA = { ancho: 12192000, alto: 6858000 };
// Una vuelta completa de la órbita de la portada: muy despacio, para que se
// note sin distraer.
const VUELTA_MS = 360_000;

interface Forma {
  id: string;
  nombre: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function formas(xml: string): Forma[] {
  return [...xml.matchAll(/<p:sp>[\s\S]*?<\/p:sp>/g)].flatMap(([sp]) => {
    const nv = sp.match(/<p:cNvPr id="(\d+)" name="([^"]*)"/);
    const off = sp.match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>/);
    const ext = sp.match(/<a:ext cx="(\d+)" cy="(\d+)"\/>/);
    if (!nv || !off || !ext) return [];
    return [{ id: nv[1], nombre: nv[2], x: Number(off[1]), y: Number(off[2]), w: Number(ext[1]), h: Number(ext[2]) }];
  });
}

// La vuelta completa por el anillo, desde donde está el nodo: su posición
// ($ va de 0 a 1 en cada vuelta) con seno y coseno, en fracciones del ancho y
// del alto de la lámina. Una trayectoria dibujada no sirve: PowerPoint reparte
// su tiempo según el largo medido en esas fracciones, que no son cuadradas, y
// cada parte aceleraba y frenaba en momentos distintos.
function vuelta(r: number, desde: number, id: number, grupo: number): string {
  const eje = (atributo: "ppt_x" | "ppt_y", n: number) => {
    const [radio, f, inicio] = atributo === "ppt_x" ? [r / LAMINA.ancho, "cos", Math.cos(desde)] : [r / LAMINA.alto, "sin", Math.sin(desde)];
    // Los números van entre paréntesis: con un ángulo o un inicio negativos, «+-» y «--» no se leen bien.
    const fmla = `#${atributo}+${radio.toFixed(6)}*(${f}(2*pi*$+(${desde.toFixed(6)}))-(${inicio.toFixed(6)}))`;
    return `<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="${n}" dur="${VUELTA_MS}" fill="hold"/><p:tgtEl><p:spTgt spid="${grupo}"/></p:tgtEl><p:attrNameLst><p:attrName>${atributo}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0" fmla="${fmla}"><p:val><p:fltVal val="0"/></p:val></p:tav><p:tav tm="100000"><p:val><p:fltVal val="1"/></p:val></p:tav></p:tavLst></p:anim>`;
  };
  return eje("ppt_x", id) + eje("ppt_y", id + 1);
}

// Las partes de la portada recorren el anillo punteado. Cada parte (nodo,
// ícono, número y nombre, marcados «Órbita n») se junta en un grupo y el grupo
// sigue la vuelta: se mueve como una sola pieza, sin girar, así los textos
// siempre se leen y todas las partes guardan la misma distancia entre sí.
function orbitar(xml: string): { xml: string; efectos: string } | undefined {
  const todas = formas(xml);
  const anillo = todas.find((f) => f.nombre === "Órbita anillo");
  if (!anillo) return undefined;
  const [cx, cy, r] = [anillo.x + anillo.w / 2, anillo.y + anillo.h / 2, anillo.w / 2];
  let siguiente = Math.max(0, ...[...xml.matchAll(/<p:cNvPr id="(\d+)"/g)].map((m) => Number(m[1])));
  let id = 5;
  const efectos: string[] = [];
  for (const nodo of todas.filter((f) => f.nombre.startsWith("Órbita ") && / nodo$/.test(f.nombre))) {
    const marca = nodo.nombre.replace(/ nodo$/, "");
    const piezas = todas.filter((f) => f.nombre.startsWith(`${marca} `) || f.nombre.endsWith(`· ${marca}`));
    const bloques = piezas.map((f) => [...xml.matchAll(/<p:sp>[\s\S]*?<\/p:sp>/g)].map((m) => m[0]).find((sp) => sp.includes(`<p:cNvPr id="${f.id}" `))!);
    const [x0, y0] = [Math.min(...piezas.map((f) => f.x)), Math.min(...piezas.map((f) => f.y))];
    const [x1, y1] = [Math.max(...piezas.map((f) => f.x + f.w)), Math.max(...piezas.map((f) => f.y + f.h))];
    const grupo = ++siguiente;
    const caja = `<a:off x="${x0}" y="${y0}"/><a:ext cx="${x1 - x0}" cy="${y1 - y0}"/>`;
    const xmlGrupo = `<p:grpSp><p:nvGrpSpPr><p:cNvPr id="${grupo}" name="${marca}"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm>${caja}<a:chOff x="${x0}" y="${y0}"/><a:chExt cx="${x1 - x0}" cy="${y1 - y0}"/></a:xfrm></p:grpSpPr>${bloques.join("")}</p:grpSp>`;
    // El grupo queda donde estaba la primera pieza, para conservar el orden de
    // dibujo. Las demás se quitan antes: después, la primera coincidencia de su
    // texto sería la copia que ya está dentro del grupo.
    for (const b of bloques.slice(1)) xml = xml.replace(b, "");
    xml = xml.replace(bloques[0], xmlGrupo);
    const desde = Math.atan2(nodo.y + nodo.h / 2 - cy, nodo.x + nodo.w / 2 - cx);
    const tipo = efectos.length ? "withEffect" : "afterEffect";
    const efecto = id++;
    efectos.push(`<p:par><p:cTn id="${efecto}" presetID="0" presetClass="path" presetSubtype="0" repeatCount="indefinite" fill="hold" nodeType="${tipo}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${vuelta(r, desde, id, grupo)}</p:childTnLst></p:cTn></p:par>`);
    id += 2;
  }
  return { xml, efectos: efectos.join("") };
}

// pptxgenjs tampoco escribe transiciones ni animaciones. Cada lámina entra
// completa, con un fundido: quien presenta no necesita clics para armarla. Un
// video se reproduce solo al llegar a su lámina, sin pausa al hacerle clic: con
// ella, el clic sobre el video lo detenía en vez de pasar a la lámina siguiente.
// La órbita de la portada también arranca sola.
export function animar(xml: string): string {
  const transicion = '<p:transition spd="med"><p:fade/></p:transition>';
  const video = xml.match(/<p:nvPicPr>\s*<p:cNvPr id="(\d+)" name="Video ([^"]*)"/);
  let efectos: string | undefined;
  let medio = "";
  if (video) {
    const spid = video[1];
    const ms = Math.round((segundosDeVideo(video[2]) ?? 60) * 1000);
    efectos = `<p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="${ms}" fill="hold"/><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>`;
    // El nodo de medios del video: sin él, PowerPoint no lo reproduce.
    medio = `<p:video><p:cMediaNode vol="80000"><p:cTn id="7" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cMediaNode></p:video>`;
  } else {
    const orbita = orbitar(xml);
    if (orbita) ({ xml, efectos } = orbita);
  }
  let tiempos = "";
  if (efectos) {
    // Al entrar a la lámina, sin esperar un clic.
    const alEntrar = `<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst><p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${efectos}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
    tiempos = `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${alEntrar}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>${medio}</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
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

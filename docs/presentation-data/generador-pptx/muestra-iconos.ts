// Lámina de muestra con todos los íconos, para revisarlos a ojo en PowerPoint.
//   node generador-pptx/muestra-iconos.ts <salida.pptx>
import PptxGenJS from "pptxgenjs";
import { ICONOS, type NombreIcono } from "../diseno/iconos.ts";
import { FUENTE, icono, insignia } from "./base.ts";
import { generarArchivo } from "./posproceso.ts";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
const nombres = Object.keys(ICONOS) as NombreIcono[];
const porLamina = 70;
for (let inicio = 0; inicio < nombres.length; inicio += porLamina) {
  const s = pptx.addSlide();
  nombres.slice(inicio, inicio + porLamina).forEach((n, i) => {
    const x = 0.3 + (i % 10) * 1.27;
    const y = 0.2 + Math.floor(i / 10) * 1.04;
    if (i % 3 === 0) insignia(s, n, x + 0.3, y, 0.62, "#E3F4FA", "#0B6E8A");
    else icono(s, n, x + 0.35, y + 0.05, 0.5, "#0B2350");
    s.addText(n, { x, y: y + 0.66, w: 1.22, h: 0.22, margin: 0, align: "center", fontFace: FUENTE, fontSize: 7.5, color: "55627E" });
  });
}
await generarArchivo(pptx, process.argv[2]);
console.log("muestra:", process.argv[2]);

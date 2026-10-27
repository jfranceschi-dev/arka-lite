// Dónde quedan los entregables generados: en esta misma carpeta
// (docs/presentation-data/). Son salida de los generadores; no se editan a mano.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ENTREGABLES = dirname(fileURLToPath(import.meta.url));
export const DIR_PPTX = join(ENTREGABLES, "pptx");
export const DIR_PDF = join(ENTREGABLES, "pdf");
export const DIR_GUIONES = join(ENTREGABLES, "guiones");
// Capturas reales de la UI y de Swagger que usan las láminas. No se generan
// con npm run todo: se toman con capturas/capturar.ps1 con el sistema arriba.
export const DIR_CAPTURAS = join(ENTREGABLES, "capturas");

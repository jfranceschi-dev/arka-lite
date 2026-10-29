import { validarContenido } from "./validacion.ts";
import { temasAyuda } from "./ayuda.ts";
import { operaciones } from "./laboratorio.ts";

const errores = validarContenido();
if (errores.length > 0) {
  console.error(`Contenido inválido (${errores.length}):`);
  for (const e of errores) console.error(" -", e);
  process.exit(1);
}
console.log(`Contenido válido · ${operaciones.length} operaciones · ${temasAyuda.length} temas de Ayuda`);

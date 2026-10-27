import { validarContenido } from "./validacion.ts";
import { laminas } from "./index.ts";

const errores = validarContenido();
if (errores.length > 0) {
  console.error(`Contenido inválido (${errores.length}):`);
  for (const e of errores) console.error(" -", e);
  process.exit(1);
}
console.log(`Contenido válido · ejecutivo: ${laminas("ejecutivo").length} láminas · técnico: ${laminas("tecnico").length} láminas`);

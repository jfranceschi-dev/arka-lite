import { validarContenido } from "./validacion.ts";
import { laminas, NOMBRE_RECORRIDO, RECORRIDOS } from "./index.ts";

const errores = validarContenido();
if (errores.length > 0) {
  console.error(`Contenido inválido (${errores.length}):`);
  for (const e of errores) console.error(" -", e);
  process.exit(1);
}
console.log(`Contenido válido · ${RECORRIDOS.map((r) => `${NOMBRE_RECORRIDO[r].toLowerCase()}: ${laminas(r).length} láminas`).join(" · ")}`);

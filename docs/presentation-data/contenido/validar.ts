import { validarContenido } from "./validacion.ts";
import { laminas, nombreVariante, VARIANTES } from "./index.ts";

const errores = validarContenido();
if (errores.length > 0) {
  console.error(`Contenido inválido (${errores.length}):`);
  for (const e of errores) console.error(" -", e);
  process.exit(1);
}
console.log(`Contenido válido · ${VARIANTES.map((v) => `${nombreVariante(v).toLowerCase()}: ${laminas(v).length} láminas`).join(" · ")}`);

import type { BloqueCodigo } from "../contenido/tipos.ts";
import { color } from "./tokens.ts";

// Resaltado de sintaxis mínimo y sin dependencias. Lo usan la web y el PPTX
// para que el código se vea igual en ambos. Prioriza legibilidad, no exactitud.
export type ClaseCodigo = "comentario" | "cadena" | "anotacion" | "clave" | "tipo" | "numero" | "texto";

const PALABRAS: Record<BloqueCodigo["lenguaje"], string[]> = {
  java: ["public", "private", "final", "class", "record", "interface", "return", "new", "if", "else", "throw", "try", "catch", "for", "void", "static", "implements", "extends", "import", "package"],
  yaml: ["true", "false", "null"],
  json: ["true", "false", "null"],
  bash: ["cd", "export", "docker", "kubectl", "npm", "git", "curl"],
  sql: ["CREATE", "TABLE", "IF", "NOT", "EXISTS", "PRIMARY", "KEY", "REFERENCES", "DEFAULT", "NULL", "ALTER", "ADD", "COLUMN", "INDEX", "ON", "WHERE", "BOOLEAN", "UUID", "VARCHAR", "BIGSERIAL", "TRUE", "FALSE"],
  properties: [],
  http: ["GET", "POST"],
  nginx: ["location", "proxy_pass", "listen", "server", "return", "proxy_set_header", "limit_except", "deny"],
};

const comentarioCon = (l: BloqueCodigo["lenguaje"]) =>
  l === "java" || l === "json" || l === "http" ? String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/` : l === "sql" ? String.raw`--[^\n]*` : String.raw`#[^\n]*`;

export function resaltar(texto: string, lenguaje: BloqueCodigo["lenguaje"]): { texto: string; clase: ClaseCodigo }[] {
  const palabras = PALABRAS[lenguaje];
  const partes = [
    `(?<comentario>${comentarioCon(lenguaje)})`,
    String.raw`(?<cadena>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')`,
    String.raw`(?<anotacion>@\w+|\$\{[^}]+\})`,
    lenguaje === "yaml" || lenguaje === "properties" ? String.raw`(?<llave>^[ \t-]*[\w.-]+(?=\s*[:=]))` : null,
    palabras.length ? `(?<clave>\\b(?:${palabras.join("|")})\\b)` : null,
    String.raw`(?<tipo>\b[A-Z][a-zA-Z0-9]+\b)`,
    String.raw`(?<numero>\b\d+(?:\.\d+)?\b)`,
  ].filter(Boolean);
  const re = new RegExp(partes.join("|"), "gm");
  const salida: { texto: string; clase: ClaseCodigo }[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > ultimo) salida.push({ texto: texto.slice(ultimo, i), clase: "texto" });
    const g = m.groups ?? {};
    const clase: ClaseCodigo = g.comentario ? "comentario" : g.cadena ? "cadena" : g.anotacion ? "anotacion" : g.llave || g.clave ? "clave" : g.tipo ? (lenguaje === "sql" ? "texto" : "tipo") : g.numero ? "numero" : "texto";
    salida.push({ texto: m[0], clase });
    ultimo = i + m[0].length;
  }
  if (ultimo < texto.length) salida.push({ texto: texto.slice(ultimo), clase: "texto" });
  return salida;
}

export const colorCodigo: Record<ClaseCodigo, string> = {
  comentario: color.codigoComentario,
  cadena: color.codigoCadena,
  anotacion: color.codigoAnotacion,
  clave: color.codigoClave,
  tipo: color.codigoTipo,
  numero: color.codigoCadena,
  texto: color.codigoTexto,
};

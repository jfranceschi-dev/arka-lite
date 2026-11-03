// Escribe web/src/estilos/tokens.css a partir de tokens.ts para que Tailwind
// y el generador PPTX usen exactamente los mismos valores.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { color, tipografia, radio, movimiento } from "./tokens.ts";

const aKebab = (s: string) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

const lineas: string[] = [
  "/* GENERADO por diseno/generar-css.ts desde diseno/tokens.ts. No editar a mano. */",
  "@theme {",
  ...Object.entries(color).map(([k, v]) => `  --color-${aKebab(k)}: ${v};`),
  `  --font-sans: ${tipografia.web};`,
  `  --font-mono: ${tipografia.mono};`,
  ...Object.entries(radio).map(([k, v]) => `  --radius-${aKebab(k)}: ${v}px;`),
  `  --ease-arka: ${movimiento.curva};`,
  "}",
  ":root {",
  `  --mov-rapido: ${movimiento.rapidoMs}ms;`,
  `  --mov-normal: ${movimiento.normalMs}ms;`,
  `  --mov-lento: ${movimiento.lentoMs}ms;`,
  "}",
  "",
];

const destino = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "src", "estilos", "tokens.css");
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, lineas.join("\n"), "utf8");
console.log("tokens.css generado:", destino);

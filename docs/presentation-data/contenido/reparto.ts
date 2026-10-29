import type { Lamina } from "./index.ts";
import { MINUTOS_DEMO_EN_VIVO } from "./recomendaciones.ts";
import { CLIC, type Rol } from "./tipos.ts";
import { segundosDeVideo } from "./videos.ts";

// Quién presenta qué. Cada lámina tiene un papel (el de su sección o uno
// propio), y la división del equipo asigna los papeles a personas: 7 personas,
// 4 de desarrollo (una de ellas orquesta), 1 de base de datos y 2 de
// infraestructura.

// El nombre del equipo: va en la portada y en el cierre.
export const NOMBRE_EQUIPO = "Equipo arka-litos";

export const NOMBRE_ROL: Record<Rol, string> = {
  orquestador: "Apertura, el negocio y el cierre",
  fundamentos: "Fundamentos",
  arquitectura: "Arquitectura",
  bd: "Base de datos",
  orm: "Apoyo en base de datos: la misma regla, el ORM y la conexión",
  interconexion: "Interconexión de servicios",
  plataforma: "DevOps: Docker, Compose y Codespaces, y la observabilidad",
  operacion: "DevOps: CI/CD y Kubernetes",
  demostracion: "Demostración con la UI",
};

export interface Persona {
  nombre: string;
  area: "Desarrollo" | "Base de datos" | "Infraestructura";
  roles: Rol[];
}

export interface Division {
  id: string;
  titulo: string;
  cuando: string;
  personas: Persona[];
}

export const DIVISIONES: Division[] = [
  {
    id: "7-personas",
    titulo: "7 personas",
    cuando: "Cuatro de desarrollo (una de ellas orquesta), una de base de datos y dos de infraestructura. En base de datos, una persona de desarrollo apoya con la parte de código.",
    personas: [
      { nombre: "Desarrollo 1 · orquesta", area: "Desarrollo", roles: ["orquestador", "fundamentos"] },
      { nombre: "Desarrollo 2", area: "Desarrollo", roles: ["arquitectura", "demostracion"] },
      { nombre: "Desarrollo 3", area: "Desarrollo", roles: ["orm"] },
      { nombre: "Desarrollo 4", area: "Desarrollo", roles: ["interconexion"] },
      { nombre: "Base de datos", area: "Base de datos", roles: ["bd"] },
      { nombre: "Infraestructura 1", area: "Infraestructura", roles: ["plataforma"] },
      { nombre: "Infraestructura 2", area: "Infraestructura", roles: ["operacion"] },
    ],
  },
];

export function rolDe(l: Lamina): Rol {
  return l.diapositiva.rol ?? l.seccion.rol;
}

export function personaCon(division: Division, rol: Rol): Persona {
  const p = division.personas.find((x) => x.roles.includes(rol));
  if (!p) throw new Error(`La división ${division.id} no asigna el papel ${rol}`);
  return p;
}

// El nombre de quien presenta; si hubiera varias divisiones, uno por división.
export function quienPresenta(rol: Rol): string {
  const nombres = DIVISIONES.map((d) => personaCon(d, rol).nombre);
  if (nombres.every((n) => n === nombres[0])) return nombres[0];
  return DIVISIONES.map((d, i) => `${nombres[i]} (${d.titulo})`).join(" · ");
}

// Palabras de la parte oral: a unas 130 por minuto, da los minutos de cada
// persona y de toda la presentación.
const contar = (texto: string) => texto.split(/\s+/).filter(Boolean).length;

export function palabras(l: Lamina): number {
  return contar(l.diapositiva.guion.decir.join(" "));
}

export const PALABRAS_POR_MINUTO = 130;

// Cuánto dura una lámina: el texto oral, más la demostración en vivo si la
// hay. Con un video, lo que se dice después del clic va encima del video:
// cuenta lo que dure más, la narración o el video.
export function minutosDeLamina(l: Lamina): number {
  const d = l.diapositiva;
  const hablado = palabras(l) / PALABRAS_POR_MINUTO;
  if (l.seccion.enfoque === "vivo" && d.guion.demo) return hablado + MINUTOS_DEMO_EN_VIVO;
  if (d.visual?.tipo !== "video") return hablado;
  const texto = d.guion.decir.join(" ");
  const corte = Math.max(0, texto.indexOf(CLIC));
  const encima = contar(texto.slice(corte)) / PALABRAS_POR_MINUTO;
  return contar(texto.slice(0, corte)) / PALABRAS_POR_MINUTO + Math.max(encima, (segundosDeVideo(d.visual.archivo) ?? 0) / 60);
}

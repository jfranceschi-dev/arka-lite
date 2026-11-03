import { laminas, type Lamina } from "./index.ts";
import type { Rol, Variante } from "./tipos.ts";
import { segundosDeVideo } from "./videos.ts";

// Quién presenta qué. Cada lámina tiene un papel (el de su sección o uno
// propio), y el reparto asigna los papeles a las 7 personas del equipo: 4 de
// desarrollo, 1 de base de datos y 2 de infraestructura.

// El nombre del equipo: va en la portada y en el cierre.
export const NOMBRE_EQUIPO = "Equipo arka-litos";

export const NOMBRE_ROL: Record<Rol, string> = {
  apertura: "Apertura",
  fundamentos: "Fundamentos",
  arquitectura: "Arquitectura",
  bd: "Base de datos",
  orm: "Apoyo en base de datos: la misma regla, el ORM y la conexión",
  interconexion: "Interconexión de servicios",
  plataforma: "DevOps: qué es, Docker y Compose",
  cicd: "DevOps: CI/CD",
  operacion: "DevOps: Kubernetes, y la observabilidad",
  demostracion: "Demostración en video",
  cierre: "Resultados, valor y cierre",
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

export const DIVISION: Division = {
  id: "por-persona",
  titulo: "7 personas",
  cuando: "Cuatro de desarrollo, una de base de datos y dos de infraestructura. Jossett apoya en base de datos y presenta CI/CD, para bajar la carga de infraestructura.",
  personas: [
    { nombre: "Luis Cardoze", area: "Desarrollo", roles: ["apertura", "fundamentos"] },
    { nombre: "Ricardo Fábrega", area: "Desarrollo", roles: ["arquitectura"] },
    { nombre: "Marlene Bonilla", area: "Base de datos", roles: ["bd"] },
    { nombre: "Jossett Franceschi", area: "Desarrollo", roles: ["orm", "cicd"] },
    { nombre: "Abdiel Barria", area: "Desarrollo", roles: ["interconexion", "demostracion", "cierre"] },
    { nombre: "Kevin", area: "Infraestructura", roles: ["plataforma"] },
    { nombre: "Moises", area: "Infraestructura", roles: ["operacion"] },
  ],
};

export function rolDe(l: Lamina): Rol {
  return l.diapositiva.rol ?? l.seccion.rol;
}

export function personaCon(rol: Rol): Persona {
  const p = DIVISION.personas.find((x) => x.roles.includes(rol));
  if (!p) throw new Error(`Nadie presenta el papel ${rol}`);
  return p;
}

// El nombre de quien presenta.
export function quienPresenta(rol: Rol): string {
  return personaCon(rol).nombre;
}

// Palabras de la parte oral: a unas 130 por minuto, da los minutos de cada
// persona y de toda la presentación.
const contar = (texto: string) => texto.split(/\s+/).filter(Boolean).length;

export function palabras(l: Lamina): number {
  return contar(l.diapositiva.guion.decir.join(" "));
}

export const PALABRAS_POR_MINUTO = 130;

// Cuánto dura una lámina: el texto oral. Con un video, lo que se dice va encima
// del video: cuenta lo que dure más, la narración o el video.
export function minutosDeLamina(l: Lamina): number {
  const d = l.diapositiva;
  const hablado = palabras(l) / PALABRAS_POR_MINUTO;
  if (d.visual?.tipo !== "video") return hablado;
  return Math.max(hablado, (segundosDeVideo(d.visual.archivo) ?? 0) / 60);
}

// "1–4 y 36–38": los números de lámina en rangos.
export function rangos(numeros: number[]): string {
  const salida: string[] = [];
  for (let i = 0; i < numeros.length; i++) {
    let j = i;
    while (j + 1 < numeros.length && numeros[j + 1] === numeros[j] + 1) j++;
    salida.push(i === j ? `${numeros[i]}` : `${numeros[i]}–${numeros[j]}`);
    i = j;
  }
  return salida.join(" y ");
}

export interface Turno {
  persona: Persona;
  laminas: { l: Lamina; numero: number }[];
  minutos: number;
}

export function turnos(division: Division, variante: Variante): Turno[] {
  const lista = laminas(variante);
  return division.personas
    .map((persona) => {
      const suyas = lista.map((l, i) => ({ l, numero: i + 1 })).filter(({ l }) => personaCon(rolDe(l)) === persona);
      return { persona, laminas: suyas, minutos: suyas.reduce((a, { l }) => a + minutosDeLamina(l), 0) };
    })
    .filter((t) => t.laminas.length > 0);
}

// Los papeles que la persona presenta de verdad en la versión: sin
// demostración, quien la tenía a su cargo presenta uno menos.
export const rolesDe = (t: Turno): Rol[] => t.persona.roles.filter((r) => t.laminas.some(({ l }) => rolDe(l) === r));

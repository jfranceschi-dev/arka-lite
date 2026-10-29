import type { Lamina } from "./index.ts";
import type { Rol } from "./tipos.ts";

// Quién presenta qué. Cada lámina tiene un papel (el de su sección o uno
// propio); cada división del equipo asigna los papeles a personas. Hay dos
// divisiones porque el equipo puede ser de 8 (cinco de desarrollo) o de 7
// (cuatro de desarrollo, si una persona no está).

export const NOMBRE_ROL: Record<Rol, string> = {
  orquestador: "Apertura, el negocio y el cierre",
  fundamentos: "Fundamentos",
  arquitectura: "Arquitectura",
  bd: "Base de datos",
  orm: "El ORM por dentro",
  interconexion: "Interconexión de servicios",
  plataforma: "Docker, CI/CD y Codespaces",
  operacion: "Kubernetes, autocuración y observabilidad",
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

const comunes: Persona[] = [
  { nombre: "Base de datos", area: "Base de datos", roles: ["bd"] },
  { nombre: "Infraestructura 1", area: "Infraestructura", roles: ["plataforma"] },
  { nombre: "Infraestructura 2", area: "Infraestructura", roles: ["operacion"] },
];

export const DIVISIONES: Division[] = [
  {
    id: "8-personas",
    titulo: "8 personas",
    cuando: "Si estamos los cinco de desarrollo.",
    personas: [
      { nombre: "Orquestador", area: "Desarrollo", roles: ["orquestador"] },
      { nombre: "Desarrollo 2", area: "Desarrollo", roles: ["fundamentos"] },
      { nombre: "Desarrollo 3", area: "Desarrollo", roles: ["arquitectura"] },
      { nombre: "Desarrollo 4", area: "Desarrollo", roles: ["orm", "demostracion"] },
      { nombre: "Desarrollo 5", area: "Desarrollo", roles: ["interconexion"] },
      ...comunes,
    ],
  },
  {
    id: "7-personas",
    titulo: "7 personas",
    cuando: "Si somos cuatro de desarrollo: fundamentos y arquitectura, las dos partes en vista general, quedan en una sola persona.",
    personas: [
      { nombre: "Orquestador", area: "Desarrollo", roles: ["orquestador"] },
      { nombre: "Desarrollo 2", area: "Desarrollo", roles: ["fundamentos", "arquitectura"] },
      { nombre: "Desarrollo 3", area: "Desarrollo", roles: ["orm", "demostracion"] },
      { nombre: "Desarrollo 4", area: "Desarrollo", roles: ["interconexion"] },
      ...comunes,
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

// "Desarrollo 3 (8 personas) · Desarrollo 2 (7 personas)", o un solo nombre
// si coincide en las dos divisiones.
export function quienPresenta(rol: Rol): string {
  const nombres = DIVISIONES.map((d) => personaCon(d, rol).nombre);
  if (nombres.every((n) => n === nombres[0])) return nombres[0];
  return DIVISIONES.map((d, i) => `${nombres[i]} (${d.titulo})`).join(" · ");
}

// Palabras de la parte oral: a unas 130 por minuto, da los minutos de cada
// persona y de toda la presentación.
export function palabras(l: Lamina): number {
  return l.diapositiva.guion.decir.join(" ").split(/\s+/).filter(Boolean).length;
}

export const PALABRAS_POR_MINUTO = 130;

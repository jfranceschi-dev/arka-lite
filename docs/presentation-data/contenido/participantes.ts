import type { Participante } from "./tipos.ts";

export const EQUIPO = "Equipo arka-litos";

// Reparto para el equipo de siete personas: cuatro de desarrollo, dos de
// DevOps y una de base de datos. Cada quien presenta la parte de su área.
// Cambiar aquí los nombres reales; el PPTX, el PDF y los guiones por
// participante toman estos valores.
export const participantes: Participante[] = [
  { id: "p1", nombre: "Participante 1", perfil: "Desarrollo", rol: "Abre, presenta el sistema por fuera y cierra." },
  { id: "p2", nombre: "Participante 2", perfil: "Desarrollo", rol: "Explica cómo se construye un servicio con Spring Boot." },
  { id: "p3", nombre: "Participante 3", perfil: "Desarrollo", rol: "Explica cómo diseñamos el código para que pueda cambiar." },
  { id: "p4", nombre: "Participante 4", perfil: "Base de datos", rol: "Explica la base de datos, la consistencia y la idempotencia." },
  { id: "p5", nombre: "Participante 5", perfil: "DevOps", rol: "Explica Docker, Docker Compose y el pipeline de integración y entrega continua." },
  { id: "p6", nombre: "Participante 6", perfil: "DevOps", rol: "Explica Kubernetes, la puesta a punto y la centralización de logs." },
  { id: "p7", nombre: "Participante 7", perfil: "Desarrollo", rol: "Explica la interfaz web y conduce la demostración en vivo." },
];

export function participantePorId(id: string): Participante {
  const p = participantes.find((x) => x.id === id);
  if (!p) throw new Error(`No existe el participante ${id}`);
  return p;
}

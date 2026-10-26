import type { Participante } from "./tipos.ts";

// Reparto para un equipo de cinco personas. Cambiar aquí los nombres reales;
// la web, el PPTX y los guiones por participante toman estos valores.
export const participantes: Participante[] = [
  { id: "p1", nombre: "Participante 1", rol: "Abre, explica Java y arquitectura hexagonal, y cierra." },
  { id: "p2", nombre: "Participante 2", rol: "Explica servicios, comunicación y conduce la demostración en vivo." },
  { id: "p3", nombre: "Participante 3", rol: "Explica Docker y Kubernetes." },
  { id: "p4", nombre: "Participante 4", rol: "Explica CI/CD, Git y GitHub, pruebas y seguridad básica." },
  { id: "p5", nombre: "Participante 5", rol: "Explica datos y consistencia, y observabilidad." },
];

export function participantePorId(id: string): Participante {
  const p = participantes.find((x) => x.id === id);
  if (!p) throw new Error(`No existe el participante ${id}`);
  return p;
}

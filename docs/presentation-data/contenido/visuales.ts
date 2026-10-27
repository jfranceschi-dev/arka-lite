import { secciones } from "./index.ts";
import { participantes } from "./participantes.ts";
import type { ElementoVisual, Visual } from "./tipos.ts";

// El recurso visual de una lámina contado en texto, para los guiones y el
// PDF. Dice lo mismo que se ve en el PPTX, en el mismo orden.

const linea = (e: ElementoVisual) => (e.texto ? `${e.titulo}: ${e.texto}` : e.titulo);

export function nombreDeVisual(v: Visual): string {
  const nombres: Record<Visual["tipo"], string> = {
    equipo: "El equipo por área",
    ruta: "La ruta de las siete partes",
    cifras: "Números grandes",
    flujo: "Flujo paso a paso",
    tuberia: "Las etapas del pipeline",
    estados: "Los estados y sus cambios",
    contraste: "Dos maneras, lado a lado",
    tarjetas: "Tarjetas",
    captura: "Capturas reales",
    ramas: "Una rama de Git",
  };
  return nombres[v.tipo];
}

export function lineasDeVisual(v: Visual): string[] {
  switch (v.tipo) {
    case "equipo":
      return (["Desarrollo", "DevOps", "Base de datos"] as const).map((perfil) => {
        const quienes = participantes.filter((p) => p.perfil === perfil);
        return `${perfil} (${quienes.length}): ${quienes.map((p) => p.nombre).join(", ")}`;
      });
    case "ruta":
      return secciones.filter((s) => s.numero !== null).map((s) => {
        const p = participantes.find((x) => x.id === s.participante)!;
        return `${s.numero}. ${s.titulo} · presenta ${p.nombre} (${p.perfil})`;
      });
    case "cifras":
      return v.cifras.map((c) => `${c.valor} ${c.titulo}${c.texto ? `: ${c.texto}` : ""}`);
    case "flujo":
      return [
        ...v.pasos.map((p, i) => `${i + 1}. ${linea(p)}`),
        ...(v.desvio ? [`Si ${v.desvio.etiqueta} en el paso ${v.desvio.desde + 1}: ${linea(v.desvio.elemento)}`] : []),
      ];
    case "tuberia":
      return v.etapas.map((e, i) => `${i + 1}. ${linea(e)}`);
    case "estados":
      return [
        v.columnas.map((col) => col.map((e) => e.titulo).join(" o ")).join(" → "),
        ...v.columnas.flat().filter((e) => e.texto).map(linea),
        ...v.acciones.map((a, i) => `${a}: de ${v.columnas[i].map((e) => e.titulo).join(" o ")} a ${v.columnas[i + 1].map((e) => e.titulo).join(" o ")}`),
        ...(v.error ? [linea(v.error)] : []),
      ];
    case "contraste":
      return v.lados.map((l) => `${l.titulo}: ${l.puntos.join("; ")}`);
    case "tarjetas":
      return [...(v.comando ? [`Comando: ${v.comando}`] : []), ...v.tarjetas.map(linea)];
    case "captura":
      return v.capturas.map((c) => `Captura de ${c.titulo}${c.url ? ` (${c.url})` : ""}${c.texto ? `: ${c.texto}` : ""}`);
    case "ramas":
      return [`Rama ${v.rama} sale de ${v.principal}`, ...v.commits.map((c) => `Commit: ${c}`), `Vuelve a ${v.principal}: ${v.fusion}`];
  }
}

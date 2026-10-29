import { secciones } from "./index.ts";
import { NOMBRE_ENFOQUE, type ElementoVisual, type Seccion, type Visual } from "./tipos.ts";
import { segundosDeVideo } from "./videos.ts";

// El recurso visual de una lámina contado en texto, para los guiones y el
// PDF. Dice lo mismo que se ve en el PPTX, en el mismo orden.

const linea = (e: ElementoVisual) => (e.texto ? `${e.titulo}: ${e.texto}` : e.titulo);

export function nombreDeVisual(v: Visual): string {
  const nombres: Record<Visual["tipo"], string> = {
    ruta: "La ruta de las partes",
    equipo: "El equipo por área",
    sistema: "El sistema en la práctica",
    mapeo: "De la clase a la tabla",
    caminos: "Dos caminos, lado a lado",
    codigos: "La misma idea, en dos códigos",
    origenes: "De dónde sale cada valor",
    aprendizajes: "Lo que aprendimos",
    escenario: "Qué pasa cuando falla",
    capas: "Capas del sistema",
    tablas: "Bases de datos y sus tablas",
    matriz: "Tabla de tres columnas",
    hexagono: "Puertos y adaptadores",
    cifras: "Números grandes",
    flujo: "Flujo paso a paso",
    tuberia: "Las etapas del pipeline",
    estados: "Los estados y sus cambios",
    contraste: "Dos maneras, lado a lado",
    tarjetas: "Tarjetas",
    captura: "Capturas reales",
    video: "Video de la UI",
    ramas: "Una rama de Git",
  };
  return nombres[v.tipo];
}

export function lineasDeVisual(v: Visual): string[] {
  switch (v.tipo) {
    case "ruta":
      return partesDeRuta(v).map((s) => `${s.numero}. ${s.titulo}${s.enfoque ? ` (${NOMBRE_ENFOQUE[s.enfoque].toLowerCase()})` : ""}${s.subtitulo ? `: ${s.subtitulo}` : ""}`);
    case "equipo":
      return v.areas.map((a) => `${a.titulo}: ${a.cuantos} ${a.cuantos === "1" ? "persona" : "personas"}. ${a.texto ?? ""} Presenta: ${a.partes.join(", ")}.`);
    case "sistema": {
      const [s1, s2] = v.servicios;
      const [b1, b2] = v.bases;
      const pares = [[v.persona, v.ui], [v.ui, s1], [s1, b1], [s1, s2], [s2, b2], [v.ui, s2]];
      return [
        ...pares.map(([a, b], i) => `${i + 1}. ${a.titulo} ${i === 3 ? "⇢" : "→"} ${b.titulo}: ${v.conexiones[i]}${i === 3 ? ` (${v.evento})` : ""}`),
        v.nota,
      ];
    }
    case "caminos":
      return v.caminos.map((c) => {
        const grupos = (c.grupos ?? []).map((g) => `${g.titulo}: pasos ${g.desde + 1} a ${g.hasta + 1}`).join("; ");
        return `${c.titulo}: ${c.pasos.map((p, i) => `${linea(p)}${i === c.regla ? " (aquí vive la regla)" : ""}${c.flechas[i] ? ` → [${c.flechas[i]}]` : i < c.pasos.length - 1 ? " →" : ""}`).join(" ")}${grupos ? ` (${grupos})` : ""}`;
      });
    case "codigos":
      return v.lados.map((l) => `${l.titulo}: ${l.codigo.replaceAll("\n", " ")} · ${l.puntos.join("; ")}`);
    case "origenes":
      return [
        `Centro: ${linea(v.centro)} (${v.centro.valor.replaceAll("\n", "; ")})`,
        ...v.fuentes.map((f) => `Viene de ${linea(f)}: ${f.valor}`),
        `Llega a ${linea(v.destino)} por ${v.enlace}`,
        `Nunca: ${linea(v.nota)}`,
      ];
    case "mapeo":
      return [
        `${v.clase.titulo} (${v.clase.subtitulo}) ↔ ${v.tabla.titulo} (${v.tabla.subtitulo})`,
        ...v.clase.campos.map((c, i) => `${c.nombre} ↔ ${v.tabla.columnas[i]?.nombre ?? ""}${v.tabla.columnas[i]?.detalle ? ` (${v.tabla.columnas[i].detalle})` : ""}`),
        ...v.operaciones.map((o) => `${o.codigo} → ${o.sql}`),
      ];
    case "aprendizajes":
      return [...v.metricas.map((m) => `Métrica: ${m.valor} ${m.titulo}`), ...v.items.map((e) => `${linea(e)} Valor: ${e.valor}`)];
    case "escenario":
      return [`Falla: ${linea(v.falla)}`, ...v.pasos.map((p, i) => `${i + 1}. [${p.momento}] ${linea(p)}`), `Resultado: ${linea(v.resultado)}`];
    case "capas":
      return v.capas.map((c) => `${c.titulo}: ${c.elementos.map(linea).join("; ")}`);
    case "tablas":
      return [
        ...v.bases.map((b) => `${b.titulo}${b.subtitulo ? ` (${b.subtitulo})` : ""}: ${b.tablas.map((t) => `${t.nombre} [${t.columnas.join(", ")}]`).join("; ")}`),
        `Entre bases: ${v.enlace}`,
      ];
    case "matriz":
      return v.filas.map((f) => f.celdas.map((c, i) => `${v.encabezados[i]}: ${c}`).join(" · "));
    case "hexagono":
      return [`Centro: ${linea(v.centro)}`, `Puertos: ${v.puertos.join(", ")}`, `Entrada: ${v.entrada.map(linea).join("; ")}`, `Salida: ${v.salida.map(linea).join("; ")}`];
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
    case "video": {
      const seg = segundosDeVideo(v.archivo);
      return [`Video capturas/videos/${v.archivo}${seg ? `, ${duracion(seg)}` : ""}. Un clic lo reproduce.`, ...v.pasos.map((p, i) => `${i + 1}. ${p}`)];
    }
    case "ramas":
      return [`Rama ${v.rama} sale de ${v.principal}`, ...v.commits.map((c) => `Commit: ${c}`), `Vuelve a ${v.principal}: ${v.fusion}`];
  }
}

// Duración legible de un video: 1:16.
export function duracion(segundos: number): string {
  const s = Math.round(segundos);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Las partes que muestra la agenda: las de la variante o, sin ellas, todas.
export function partesDeRuta(v: Extract<Visual, { tipo: "ruta" }>): Seccion[] {
  return v.partes ?? secciones.filter((s) => s.numero !== null);
}

// Bloques consecutivos de partes con el mismo enfoque: la agenda aparece por
// bloques, no parte por parte.
function bloquesDeEnfoque(partes: Seccion[]): number[] {
  let bloque = 0;
  return partes.map((s, i) => (i > 0 && s.enfoque !== partes[i - 1].enfoque ? ++bloque : bloque));
}

// Paso en el que aparece cada parte de la agenda.
export function pasoDeParte(partes: Seccion[], indice: number): number {
  return bloquesDeEnfoque(partes)[indice] ?? 0;
}

// Cuántos clics arma el visual: lo que se ve al llegar a la lámina es el
// paso 0 y cada clic muestra el siguiente. Los dibujos del PPTX y las marcas
// [clic] del texto oral siguen esta misma cuenta.
export function clicsDeVisual(v: Visual | undefined): number {
  if (!v) return 0;
  switch (v.tipo) {
    case "ruta": return Math.max(0, ...bloquesDeEnfoque(partesDeRuta(v)));
    case "equipo": return 0;
    case "sistema": return 7;
    case "mapeo": return 1 + v.operaciones.length;
    case "caminos": return v.caminos.length - 1;
    case "codigos": return 1;
    case "origenes": return v.fuentes.length + 2;
    case "aprendizajes": return v.items.length;
    case "escenario": return v.pasos.length + 1;
    case "capas": return v.capas.length - 1;
    case "tablas": return v.bases.reduce((a, b) => a + b.tablas.length, 0);
    case "matriz": return v.filas.length - 1;
    case "hexagono": return 2;
    case "cifras": return v.cifras.length - 1;
    case "flujo": return v.pasos.length - 1 + (v.desvio ? 1 : 0);
    case "tuberia": return v.etapas.length - 1;
    case "estados": return v.columnas.length - 1 + (v.error ? 1 : 0);
    case "contraste": return 1;
    case "tarjetas": return v.comando || v.tarjetas.length > 6 ? 0 : v.tarjetas.length - 1;
    case "captura": return v.capturas.length - 1;
    // Un clic reproduce el video.
    case "video": return 1;
    case "ramas": return 1;
  }
}

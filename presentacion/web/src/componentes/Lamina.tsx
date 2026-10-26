import type { Lamina } from "../../../contenido/index.ts";
import { etiquetaSeccion } from "../../../contenido/index.ts";
import { participantePorId } from "../../../contenido/participantes.ts";
import type { Recorrido } from "../../../contenido/tipos.ts";
import { diagramaPorId } from "../../../diagramas/definiciones.ts";
import { Diagrama } from "../diagramas/Diagrama.tsx";
import { rutaA } from "../rutas.ts";
import { Codigo } from "./Codigo.tsx";
import { Icono } from "./Iconos.tsx";
import { InsigniaCerteza } from "./Insignias.tsx";

// Contenido visible de una lámina. Lo usan Entender (claro) y Presentar
// (oscuro); el PPTX lo traduce desde la misma fuente.
export function LaminaVista({ lamina, recorrido, oscuro = false }: { lamina: Lamina; recorrido: Recorrido; oscuro?: boolean }) {
  const { seccion, diapositiva: d } = lamina;
  const sec = oscuro ? "text-sobre-oscuro-secundario" : "text-secundario";
  if (!d) {
    const c = seccion.claves;
    const filas: [string, string | undefined][] = [
      ["¿Qué problema resuelve?", c?.problema],
      ["¿Cómo funciona en palabras sencillas?", c?.sencillo],
      ["¿Cómo se representa?", c?.visual],
      ["¿Dónde se aplicó en ARKA-Lite?", c?.aplicacion],
      ["¿Qué evidencia lo comprueba?", c?.evidencia],
    ];
    return (
      <div className="flex flex-col gap-6">
        <div className={`text-[13px] font-bold tracking-[0.12em] ${oscuro ? "text-cian" : "text-cian-texto"}`}>SECCIÓN {seccion.numero}</div>
        <h2 className={`m-0 text-[clamp(30px,4vw,48px)] leading-[1.08] font-extrabold tracking-[-0.02em] ${oscuro ? "text-white" : ""}`}>{seccion.titulo}</h2>
        <dl className="m-0 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {filas.map(([pregunta, respuesta]) => (
            <div key={pregunta} className={`rounded-recuadro p-4 flex flex-col gap-1.5 ${oscuro ? "bg-white/5" : "bg-superficie2"}`}>
              <dt className={`text-[13px] font-bold ${oscuro ? "text-cian-claro" : "text-cian-texto"}`}>{pregunta}</dt>
              <dd className={`m-0 text-[16px] leading-snug ${oscuro ? "text-white" : ""}`}>{respuesta}</dd>
            </div>
          ))}
        </dl>
        <p className={`m-0 text-[14px] ${sec}`}>Presenta: {participantePorId(seccion.participante).nombre}</p>
      </div>
    );
  }
  const verCodigo = recorrido === "tecnico" && d.codigo;
  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="flex flex-col gap-2">
        <div className={`text-[13px] font-bold tracking-[0.12em] uppercase ${oscuro ? "text-cian" : "text-cian-texto"}`}>{etiquetaSeccion(seccion)}</div>
        <h2 className={`m-0 text-[clamp(28px,3.4vw,44px)] leading-[1.1] font-extrabold tracking-[-0.02em] ${oscuro ? "text-white" : ""}`}>{d.titulo}</h2>
      </div>
      <ul className={`m-0 p-0 list-none grid gap-x-8 gap-y-2.5 ${d.diagrama || d.tabla ? "[grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]" : ""}`}>
        {d.visible.map((v) => (
          <li key={v} className={`flex gap-3 items-start text-[clamp(16px,1.5vw,20px)] leading-snug ${oscuro ? "text-white" : ""}`}>
            <span aria-hidden="true" className={`mt-[0.55em] w-2 h-2 rounded-full shrink-0 ${oscuro ? "bg-cian" : "bg-cian-texto"}`} />{v}
          </li>
        ))}
      </ul>
      {d.marcas && (
        <ul className="m-0 p-0 list-none flex flex-wrap gap-2">
          {d.marcas.map((m) => (
            <li key={m.texto} className={`flex items-center gap-2 text-[14px] ${oscuro ? "text-white" : ""}`}><InsigniaCerteza certeza={m.certeza} />{m.texto}</li>
          ))}
        </ul>
      )}
      {d.diagrama && <Diagrama diagrama={diagramaPorId(d.diagrama)} oscuro={oscuro} pasoInicial={0} mostrarInspector={!oscuro} />}
      {d.tabla && (
        <div className="overflow-x-auto">
          <table className={`w-full min-w-[640px] border-collapse text-[15px] ${oscuro ? "text-white" : ""}`}>
            <thead>
              <tr>{d.tabla.encabezados.map((h) => <th key={h} scope="col" className={`text-left px-3 py-2.5 text-[13px] ${oscuro ? "bg-white/8 text-sobre-oscuro-secundario" : "bg-superficie2 text-secundario"}`}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {d.tabla.filas.map((f, i) => (
                <tr key={i} className={oscuro ? "border-b border-white/10" : "border-b border-[#12182814]"}>
                  {f.map((c, j) => <td key={j} className={`px-3 py-2.5 align-top ${j === 0 ? "font-semibold" : ""}`}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {verCodigo && d.codigo && <Codigo bloque={d.codigo} />}
      {recorrido === "ejecutivo" && d.codigo && (
        <p className={`m-0 text-[13px] ${sec}`}>El código de esta diapositiva aparece en el recorrido técnico.</p>
      )}
    </div>
  );
}

export function PanelGuion({ lamina, grande = false }: { lamina: Lamina; grande?: boolean }) {
  const d = lamina.diapositiva;
  const participante = participantePorId(lamina.seccion.participante);
  if (!d) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-[11px] font-bold tracking-[0.08em] text-cian-texto">GUION · PORTADA DE SECCIÓN</div>
        <p className={`m-0 leading-relaxed ${grande ? "text-[22px]" : "text-[15px]"}`}>“Ahora vamos con {lamina.seccion.titulo.toLowerCase()}. Primero, qué problema resuelve.”</p>
        <p className="m-0 text-[13px] text-secundario">Presenta: {participante.nombre}. Leer en voz alta las cinco preguntas antes de avanzar.</p>
      </div>
    );
  }
  const g = d.guion;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[11px] font-bold tracking-[0.08em] text-cian-texto">GUION · TEXTO PARA DECIR</div>
        <span className="text-[12px] text-secundario">Presenta: <b className="text-texto">{participante.nombre}</b></span>
      </div>
      <div className="flex flex-col gap-3">
        {g.decir.map((p) => <p key={p} className={`m-0 leading-relaxed ${grande ? "text-[22px]" : "text-[15px]"}`}>“{p}”</p>)}
      </div>
      {g.instrucciones && (
        <div className="flex gap-2.5 items-start rounded-chico bg-advertencia-suave px-3 py-2.5 text-[13.5px] leading-snug text-[#5C3404]">
          <Icono nombre="pantalla" tamano={16} className="shrink-0 mt-0.5" />
          <div><b>Solo para quien expone, no se dice:</b><ul className="m-0 mt-1 pl-4">{g.instrucciones.map((i) => <li key={i}>{i}</li>)}</ul></div>
        </div>
      )}
      {g.pregunta && (
        <div className="border-t border-[#1218281A] pt-3 flex flex-col gap-1">
          <b className="text-[13.5px]">Pregunta al público</b>
          <span className={grande ? "text-[19px]" : "text-[14.5px]"}>{g.pregunta.texto}</span>
          <b className="text-[13.5px] mt-1.5">Respuesta esperada</b>
          <span className={`text-secundario ${grande ? "text-[17px]" : "text-[14px]"}`}>{g.pregunta.respuesta}</span>
        </div>
      )}
      {g.demo && (
        <div className="border-t border-[#1218281A] pt-3 flex flex-col gap-1">
          <b className="text-[13.5px]">Demostración sugerida</b>
          <span className="text-[14px]">{g.demo.accion}</span>
          <b className="text-[13.5px] mt-1.5">Evidencia que debería observarse</b>
          <span className="text-[14px] text-secundario">{g.demo.evidencia}</span>
          {g.demo.laboratorio && (
            <a href={rutaA("probar", g.demo.laboratorio)} className="self-start mt-2 inline-flex items-center gap-2 h-10 px-4 rounded-capsula bg-cian-suave text-[#0B5A72] font-bold text-[14px] no-underline">
              Probar esta acción en el laboratorio<Icono nombre="flecha" tamano={16} />
            </a>
          )}
        </div>
      )}
      {g.transicion && (
        <p className="m-0 flex gap-2 items-start text-[13.5px] text-secundario"><Icono nombre="flecha" tamano={16} className="shrink-0 mt-0.5" /><span><b className="text-texto">Transición:</b> “{g.transicion}”</span></p>
      )}
      {g.respaldo && <p className="m-0 text-[12px] text-secundario">Respaldo: {g.respaldo}</p>}
    </div>
  );
}

import { useMemo, useState } from "react";
import { temasAyuda, temaPorId, type GrupoAyuda } from "../../../contenido/ayuda.ts";
import { operaciones, type Operacion } from "../../../contenido/laboratorio.ts";
import { diagramaPorId } from "../../../diagramas/definiciones.ts";
import type { RegistroPeticion } from "../api/cliente.ts";
import { useHistorial } from "../estado/historial.tsx";
import { useEnlaces } from "../estado/enlaces.ts";
import { Marco, Tarjeta } from "../componentes/Marco.tsx";
import { Diagrama } from "../diagramas/Diagrama.tsx";
import { TablaDatos, esc, type Columna } from "../componentes/TablaDatos.tsx";
import { Icono } from "../componentes/Iconos.tsx";
import { rutaA } from "../rutas.ts";

// Ayuda: cada tema responde una pregunta con un diagrama que avanza paso a
// paso. Las tarjetas de abajo cuentan cada paso en lenguaje simple y se
// mueven junto con el diagrama.

const GRUPOS: GrupoAyuda[] = ["Para usar la app", "Cómo está hecha", "Para el equipo técnico"];

export function Ayuda({ idTema }: { idTema: string | null }) {
  const tema = temaPorId(idTema);
  const indice = temasAyuda.indexOf(tema);
  const anterior = temasAyuda[indice - 1];
  const siguiente = temasAyuda[indice + 1];

  return (
    <Marco vista="ayuda">
      <div className="flex flex-wrap gap-8 items-start">
        <nav aria-label="Temas de ayuda" className="flex-[1_1_220px] max-w-full lg:max-w-[250px] flex flex-col gap-1 lg:sticky lg:top-24">
          {GRUPOS.map((g) => (
            <div key={g} className="flex flex-col gap-0.5 mb-3">
              <span className="text-[11px] font-bold tracking-[0.08em] text-secundario px-3 pb-1.5">{g.toUpperCase()}</span>
              {temasAyuda.filter((t) => t.grupo === g).map((t) => (
                <a key={t.id} href={rutaA("ayuda", t.id)} aria-current={t.id === tema.id ? "page" : undefined}
                  className={`px-3 py-2 rounded-chico text-[13.5px] no-underline ${t.id === tema.id ? "bg-acc-suave text-acc-texto font-bold" : "text-texto hover:bg-white"}`}>
                  {t.titulo}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="flex-[999_1_620px] min-w-0 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold tracking-[0.08em] text-acc-texto">{tema.grupo.toUpperCase()}</span>
            <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.02em]">{tema.pregunta}</h1>
            <p className="m-0 text-[16px] leading-relaxed text-secundario max-w-[760px]">{tema.resumen}</p>
          </div>

          {tema.diagrama ? <Explicacion key={tema.id} idDiagrama={tema.diagrama} tecnico={!!tema.tecnico} /> : <DetalleTecnico />}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {anterior ? <a href={rutaA("ayuda", anterior.id)} className="arka-boton arka-boton-secundario no-underline"><Icono nombre="anterior" tamano={16} />{anterior.titulo}</a> : <span />}
            {tema.probar && <a href={rutaA(tema.probar.vista)} className="arka-boton arka-boton-acento no-underline"><Icono nombre="real" tamano={16} />{tema.probar.texto}</a>}
            {siguiente ? <a href={rutaA("ayuda", siguiente.id)} className="arka-boton arka-boton-primario no-underline">{siguiente.titulo}<Icono nombre="siguiente" tamano={16} /></a> : <span />}
          </div>
        </div>
      </div>
    </Marco>
  );
}

function Explicacion({ idDiagrama, tecnico }: { idDiagrama: string; tecnico: boolean }) {
  const diagrama = diagramaPorId(idDiagrama);
  const [paso, setPaso] = useState(0);
  return (
    <>
      <Tarjeta etiqueta="Diagrama paso a paso">
        <Diagrama diagrama={diagrama} sencillo={!tecnico} mostrarInspector={tecnico} pasoActivo={paso} alCambiarPaso={setPaso} />
      </Tarjeta>
      {!tecnico && (
        <ol aria-label="Pasos" className="m-0 p-0 list-none grid gap-3 grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
          {diagrama.pasos.map((p, i) => (
            <li key={i}>
              <button type="button" onClick={() => setPaso(i)} aria-current={i === paso ? "step" : undefined}
                className={`paso-ayuda w-full h-full text-left rounded-recuadro p-4 flex gap-3 items-start border ${i === paso ? "paso-ayuda-actual" : i < paso ? "bg-white border-linea" : "bg-white border-linea opacity-75"}`}>
                <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-extrabold ${i <= paso ? "bg-pri text-sobre-pri" : "bg-fondo text-secundario"}`}>{i + 1}</span>
                <span className="text-[14px] leading-relaxed">{p.texto}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      {diagrama.nota && !tecnico && <p className="m-0 rounded-recuadro bg-acc-suave text-acc-texto px-4 py-3 text-[14px] font-semibold">{diagrama.nota}</p>}
    </>
  );
}

function DetalleTecnico() {
  const { registros } = useHistorial();
  const enlaces = useEnlaces();
  const contratos = useMemo<Columna<Operacion>[]>(() => [
    { titulo: "Operación", valor: (o) => o.etiqueta, html: (o) => `<b>${esc(o.etiqueta)}</b><br><span class="texto-tenue texto-chico">${esc(o.sencillo)}</span>` },
    { titulo: "Ruta en la UI", valor: (o) => o.ruta, html: (o) => `<span class="celda-id">${esc(o.metodo)} ${esc(o.ruta)}</span>` },
    { titulo: "Servicio", valor: (o) => o.servicio, html: (o) => `${esc(o.servicio)}<br><span class="texto-tenue texto-chico">${esc(o.rutaServicio)}</span>` },
    { titulo: "Respuestas", valor: (o) => o.respuestas.map((r) => r.status).join(" "), ordenable: false, html: (o) => o.respuestas.map((r) => `<span class="insignia insignia-codigo" title="${esc(r.cuando)}">${esc(r.status)}</span>`).join(" ") },
  ], []);
  const peticiones = useMemo<Columna<RegistroPeticion>[]>(() => [
    { titulo: "Hora", valor: (r) => r.inicio, html: (r) => esc(new Date(r.inicio).toLocaleTimeString("es-PA")) },
    { titulo: "Petición", valor: (r) => `${r.metodo} ${r.url}`, html: (r) => `<span class="celda-id">${esc(r.metodo)} ${esc(r.url)}</span>` },
    { titulo: "Destino", valor: (r) => r.destinoInterno, html: (r) => `<span class="texto-tenue texto-chico">${esc(r.destinoInterno)}</span>` },
    { titulo: "Status", valor: (r) => r.status ?? 0, html: (r) => `<span class="insignia ${r.estado === "correcto" ? "insignia-aprobada" : r.estado === "error" ? "insignia-rechazada" : "insignia-borrador"}">${esc(r.status ?? "…")}</span>` },
    { titulo: "Duración", valor: (r) => r.duracionMs ?? 0, html: (r) => (r.duracionMs !== null ? `${r.duracionMs} ms` : "—") },
  ], []);
  return (
    <>
      <Tarjeta etiqueta="Contratos de la API">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-[16px] font-bold">Contratos que usa la UI</h2>
          <div className="flex flex-wrap gap-2">
            <a href={enlaces.swaggerSolicitudes} target="_blank" rel="noopener noreferrer" className="arka-boton arka-boton-secundario arka-boton-chico no-underline"><Icono nombre="externo" tamano={14} />Swagger solicitudes</a>
            <a href={enlaces.swaggerNotificaciones} target="_blank" rel="noopener noreferrer" className="arka-boton arka-boton-secundario arka-boton-chico no-underline"><Icono nombre="externo" tamano={14} />Swagger notificaciones</a>
          </div>
        </div>
        <TablaDatos filas={operaciones} columnas={contratos} etiqueta="Contratos de la API" />
      </Tarjeta>
      <Tarjeta etiqueta="Peticiones de esta sesión">
        <h2 className="m-0 text-[16px] font-bold">Peticiones de esta sesión</h2>
        <TablaDatos filas={registros} columnas={peticiones} etiqueta="Peticiones de esta sesión" porPagina={5} />
      </Tarjeta>
    </>
  );
}

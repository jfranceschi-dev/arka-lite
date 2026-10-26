import { useEffect, useMemo, useRef, useState } from "react";
import { operacionPorId, type Operacion } from "../../../contenido/laboratorio.ts";
import { avisoDe, comoAvisos, comoIdsConsumidos, comoSolicitudes, estadosConocidos, permisoEscritura } from "../api/arka.ts";
import type { RegistroPeticion } from "../api/cliente.ts";
import { useHistorial } from "../estado/historial.tsx";
import { Marco, Franja } from "../componentes/Marco.tsx";
import { BotonAccion } from "../componentes/BotonAccion.tsx";
import { ResultadoSencillo, ResultadoTecnico } from "../componentes/ResultadoPeticion.tsx";
import { TramoObservado } from "../componentes/TramoObservado.tsx";
import { Historial } from "../componentes/Historial.tsx";
import { Icono } from "../componentes/Iconos.tsx";
import { InsigniaEstado, ModoEvidencia, NoObservado } from "../componentes/Insignias.tsx";

const CONSULTAS = ["listar", "consultar", "avisos", "procesados"] as const;
const MAX_CONSULTAS_PERIODICAS = 6;
const PERIODO_MS = 5000;

export function Probar({ resaltar }: { resaltar: string | null }) {
  const { registros, lanzar, enCurso } = useHistorial();
  const [seleccion, setSeleccion] = useState("INC-002");
  const [confirmar, setConfirmar] = useState<Operacion | null>(null);
  const [detalle, setDetalle] = useState<"sencilla" | "tecnica">("sencilla");
  const conocidos = useMemo(() => estadosConocidos(registros), [registros]);
  const solicitudActual = conocidos.get(seleccion);
  const ultimo = registros[0];
  const listado = comoSolicitudes(registros.find((r) => r.operacionId === "listar" && r.estado === "correcto"));

  const ejecutar = (op: Operacion) => {
    if (op.escritura) { setConfirmar(op); return; }
    void lanzar(op, op.ruta.includes("{id}") ? seleccion : undefined);
  };

  return (
    <Marco vista="probar" lateral={<CasoConductor registros={registros} />}>
      <Franja ruta="Probar › Laboratorio" titulo="Laboratorio del caso INC-002"
        descripcion="Cada botón hace una petición real por el proxy /api. Las escrituras piden confirmación y nunca se repiten solas."
        derecha={<ModoEvidencia modo="real" sobreOscuro />} />

      <div className="flex flex-wrap gap-5 items-start">
        <section aria-label="Acciones" className="flex-[1_1_330px] min-w-0 bg-superficie rounded-tarjeta p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="seleccion" className="text-[13px] font-bold">Solicitud seleccionada</label>
            <input id="seleccion" value={seleccion} onChange={(e) => setSeleccion(e.target.value.trim().toUpperCase())} maxLength={20}
              aria-describedby="ayuda-seleccion" className="h-11 px-4 rounded-capsula border-[1.5px] border-[#12182836] font-mono text-[14px]" />
            <span id="ayuda-seleccion" className="text-[12px] font-medium text-secundario">Sirve para consultar y para las escrituras sobre una solicitud existente. No crea ids nuevos.</span>
          </div>
          {solicitudActual && <div className="flex items-center gap-2 text-[13px]">Estado conocido: <InsigniaEstado estado={solicitudActual.estado} /></div>}

          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-bold tracking-[0.08em] text-secundario">CONSULTAS · NO CAMBIAN DATOS</div>
            {CONSULTAS.map((id) => {
              const op = operacionPorId(id);
              return <BotonAccion key={id} op={op} enCurso={enCurso.has(id)} resaltado={resaltar === id} onClick={() => ejecutar(op)}
                etiqueta={id === "consultar" ? `Consultar ${seleccion || "…"}` : undefined} deshabilitado={id === "consultar" && !seleccion} />;
            })}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#1218281A] pt-4">
            <div className="text-[11px] font-bold tracking-[0.08em] text-advertencia-texto">ESCRITURAS · CAMBIAN DATOS</div>
            {(["crear", "enviar", "aprobar", "rechazar"] as const).map((id) => {
              const op = operacionPorId(id);
              const permiso = permisoEscritura(id, id === "crear" ? undefined : solicitudActual);
              return <BotonAccion key={id} op={op} enCurso={enCurso.has(id)} resaltado={resaltar === id} onClick={() => ejecutar(op)}
                deshabilitado={!permiso.permitido} motivo={permiso.motivo} etiqueta={id === "crear" ? undefined : `${op.etiqueta} ${seleccion}`} />;
            })}
          </div>

          {confirmar && (
            <div role="alertdialog" aria-labelledby="titulo-confirmar" aria-describedby="texto-confirmar" className="rounded-recuadro border-2 border-advertencia bg-advertencia-suave p-4 flex flex-col gap-3">
              <b id="titulo-confirmar" className="text-[15px]">¿{confirmar.etiqueta}{confirmar.id === "crear" ? "" : ` ${seleccion}`}?</b>
              <p id="texto-confirmar" className="m-0 text-[13.5px] leading-snug text-[#5C3404]">Esta operación cambia datos y no se repetirá sola. {confirmar.despues}</p>
              <div className="flex gap-2 flex-wrap">
                <button type="button" autoFocus onClick={() => setConfirmar(null)} className="h-10 px-4 rounded-capsula border-[1.5px] border-[#12182836] bg-white font-semibold">Cancelar</button>
                <button type="button" onClick={() => { const op = confirmar; setConfirmar(null); void lanzar(op, op.id === "crear" ? undefined : seleccion).then((r) => { if (op.id === "crear" && r.estado === "correcto") setSeleccion("INC-002"); }); }}
                  className="h-10 px-4 rounded-capsula bg-franja text-white font-bold">Confirmar</button>
              </div>
            </div>
          )}
        </section>

        <section aria-label="Última petición" className="flex-[2_1_560px] min-w-0 bg-superficie rounded-tarjeta p-5 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5 items-center justify-between">
            <h2 className="m-0 text-[17px] font-bold">{ultimo ? `Última petición · ${ultimo.etiqueta}` : "Última petición"}</h2>
            <div role="group" aria-label="Nivel de detalle" className="flex p-1 rounded-capsula bg-superficie2">
              {(["sencilla", "tecnica"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={detalle === v} onClick={() => setDetalle(v)}
                  className={`h-9 px-4 rounded-capsula text-[13px] ${detalle === v ? "bg-franja text-white font-bold" : "font-semibold"}`}>
                  {v === "sencilla" ? "Vista sencilla" : "Detalle técnico"}
                </button>
              ))}
            </div>
          </div>
          <TramoObservado r={ultimo} />
          {ultimo ? (detalle === "sencilla" ? <ResultadoSencillo r={ultimo} /> : <ResultadoTecnico r={ultimo} />) : (
            <p className="m-0 rounded-recuadro bg-superficie2 p-4 text-[14px] text-secundario">Empieza con “Listar solicitudes” para ver el estado actual sin cambiar nada.</p>
          )}
          <Seguimiento registros={registros} lanzar={lanzar} />
        </section>
      </div>

      {listado && (
        <section aria-label="Solicitudes listadas" className="bg-superficie rounded-tarjeta p-5 flex flex-col gap-3">
          <h2 className="m-0 text-[17px] font-bold">Solicitudes del último listado</h2>
          {listado.length === 0 ? <p className="m-0 text-secundario">La lista está vacía.</p> : (
            <div className="flex flex-wrap gap-2">
              {listado.map((s) => (
                <button key={s.id} type="button" onClick={() => setSeleccion(s.id)} aria-pressed={s.id === seleccion}
                  className={`inline-flex items-center gap-2.5 h-11 pl-4 pr-2 rounded-capsula border-[1.5px] ${s.id === seleccion ? "border-cian-texto bg-cian-suave" : "border-[#12182824] bg-white"}`}>
                  <b className="font-mono text-[13.5px]">{s.id}</b><span className="text-[13px] text-secundario">{s.tipo}</span><InsigniaEstado estado={s.estado} />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <Historial registros={registros} />
    </Marco>
  );
}

// Seguimiento de un envío: lo que confirmó la respuesta y, por separado, lo
// que se observa después en avisos y eventos consumidos.
function Seguimiento({ registros, lanzar }: { registros: RegistroPeticion[]; lanzar: ReturnType<typeof useHistorial>["lanzar"] }) {
  const envio = registros.find((r) => r.operacionId === "enviar" && r.estado === "correcto");
  const [periodico, setPeriodico] = useState<{ activo: boolean; hechas: number }>({ activo: false, hechas: 0 });
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);
  const idEnviado = envio?.ids[0];
  const despues = (r: RegistroPeticion) => envio && r.inicio > envio.inicio;
  const avisosTras = registros.find((r) => r.operacionId === "avisos" && r.estado === "correcto" && despues(r));
  const procesadosTras = registros.find((r) => r.operacionId === "procesados" && r.estado === "correcto" && despues(r));
  const procesadosAntes = registros.find((r) => r.operacionId === "procesados" && r.estado === "correcto" && envio && r.inicio < envio.inicio);
  const aviso = idEnviado && avisosTras ? avisoDe(comoAvisos(avisosTras) ?? [], idEnviado) : undefined;
  const idsTras = comoIdsConsumidos(procesadosTras);
  const idsAntes = comoIdsConsumidos(procesadosAntes);
  const nuevos = idsTras && idsAntes ? idsTras.filter((x) => !idsAntes.includes(x)) : null;

  useEffect(() => {
    if (!periodico.activo) return;
    if (aviso || periodico.hechas >= MAX_CONSULTAS_PERIODICAS) { setPeriodico((p) => ({ ...p, activo: false })); return; }
    temporizador.current = setTimeout(() => {
      void lanzar(operacionPorId("avisos"));
      void lanzar(operacionPorId("procesados"));
      setPeriodico((p) => ({ ...p, hechas: p.hechas + 1 }));
    }, periodico.hechas === 0 ? 0 : PERIODO_MS);
    return () => { if (temporizador.current) clearTimeout(temporizador.current); };
  }, [periodico, aviso, lanzar]);

  if (!envio || !idEnviado) return null;
  return (
    <section aria-label="Seguimiento del envío" className="border-t border-[#1218281A] pt-4 flex flex-col gap-3">
      <h3 className="m-0 text-[15px] font-bold">Seguimiento del envío de {idEnviado}</h3>
      <ul className="m-0 p-0 list-none flex flex-col gap-2 text-[14px]">
        <li className="flex items-center gap-2 flex-wrap"><Icono nombre="checkCirculo" className="text-correcto" /> La respuesta confirmó: <InsigniaEstado estado="ENVIADA" /> <span className="text-secundario">(sin eventoId)</span></li>
        <li className="flex items-center gap-2 flex-wrap">
          {aviso ? <><Icono nombre="checkCirculo" className="text-correcto" /> Aviso observado: “{aviso.texto}”</> : <><NoObservado /> Aviso de {idEnviado} {avisosTras ? "no aparece en la última consulta" : "sin consultar desde el envío"}</>}
        </li>
        <li className="flex items-center gap-2 flex-wrap">
          {idsTras ? (
            nuevos ? <><Icono nombre="aviso" className="text-advertencia" /> {nuevos.length} eventoId nuevo{nuevos.length === 1 ? "" : "s"} desde el envío. La API no dice de qué solicitud es.</>
              : <><Icono nombre="aviso" className="text-advertencia" /> {idsTras.length} eventoId consumidos. Sin consulta previa al envío, no se puede saber cuál es nuevo.</>
          ) : <><NoObservado /> Eventos consumidos sin consultar desde el envío</>}
        </li>
      </ul>
      <div className="flex flex-wrap gap-2 items-center">
        {periodico.activo ? (
          <button type="button" onClick={() => setPeriodico({ activo: false, hechas: periodico.hechas })} className="inline-flex items-center gap-2 h-10 px-4 rounded-capsula bg-franja text-white text-[13px] font-bold">
            <Icono nombre="pausa" tamano={16} />Detener actualización ({periodico.hechas} de {MAX_CONSULTAS_PERIODICAS})
          </button>
        ) : (
          <button type="button" onClick={() => setPeriodico({ activo: true, hechas: 0 })} disabled={!!aviso} className="inline-flex items-center gap-2 h-10 px-4 rounded-capsula border-[1.5px] border-azul text-azul bg-white text-[13px] font-bold disabled:opacity-50">
            <Icono nombre="repetir" tamano={16} />Consultar avisos e ids cada 5 s · máx. {MAX_CONSULTAS_PERIODICAS}
          </button>
        )}
        <span className="text-[12.5px] text-secundario">Solo repite consultas GET. Nunca repite el envío.</span>
      </div>
      <p className="m-0 text-[12.5px] text-secundario">No hay API para consultar el outbox ni para relacionar una solicitud con su eventoId.</p>
    </section>
  );
}

function CasoConductor({ registros }: { registros: RegistroPeticion[] }) {
  const hay = (op: string) => registros.some((r) => r.operacionId === op && r.estado === "correcto");
  const avisos = registros.find((r) => r.operacionId === "avisos" && r.estado === "correcto");
  const avisoInc = avisos ? avisoDe(comoAvisos(avisos) ?? [], "INC-002") : undefined;
  const pasos: { t: string; estado: "observado" | "explicado" | "no"; d: string }[] = [
    { t: "1 · Crear", estado: hay("crear") ? "observado" : "no", d: hay("crear") ? "Observado · BORRADOR" : "Todavía no observado" },
    { t: "2 · Enviar", estado: hay("enviar") ? "observado" : "no", d: hay("enviar") ? "Observado · ENVIADA" : "Todavía no observado" },
    { t: "3 · Registrar evento", estado: "explicado", d: "Explicado · no hay API del outbox" },
    { t: "4 · Entregar", estado: "explicado", d: "Explicado · la UI no ve este tramo" },
    { t: "5 · Consumir", estado: hay("procesados") ? "observado" : "no", d: hay("procesados") ? "Ids consultados · sin relación directa" : "Todavía no observado" },
    { t: "6 · Consultar aviso", estado: avisoInc ? "observado" : "no", d: avisoInc ? "Observado · aviso de INC-002" : "Todavía no observado" },
  ];
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] font-bold tracking-[0.08em] text-white/75 px-3.5 pb-2">CASO INC-002</div>
      {pasos.map((p) => (
        <div key={p.t} className="flex gap-2.5 px-3.5 py-1.5">
          <Icono nombre={p.estado === "observado" ? "checkCirculo" : p.estado === "explicado" ? "libro" : "hueco"} tamano={20}
            className={`shrink-0 ${p.estado === "observado" ? "text-[#4ADE80]" : p.estado === "explicado" ? "text-cian-claro" : "text-white/75"}`} />
          <span className="flex flex-col gap-0.5"><b className="text-[13.5px]">{p.t}</b><span className="text-[12px] text-white/75">{p.d}</span></span>
        </div>
      ))}
    </div>
  );
}

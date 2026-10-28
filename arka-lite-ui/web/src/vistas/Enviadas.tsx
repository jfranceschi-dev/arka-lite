import { useMemo } from "react";
import Swal from "sweetalert2";
import { useDatos, type FilaEnviada } from "../estado/datos.tsx";
import { Encabezado, Marco, Tarjeta } from "../componentes/Marco.tsx";
import { TablaDatos, esc, type Columna } from "../componentes/TablaDatos.tsx";
import { confirmar, informarError } from "../componentes/dialogos.ts";
import { Icono } from "../componentes/Iconos.tsx";
import { insignia, explicarError } from "./Solicitudes.tsx";
import { rutaA } from "../rutas.ts";

// Cada envío genera un evento. Esta pantalla cruza lo que dice cada servicio
// y permite reentregar un evento para comprobar que el aviso no se duplica.

const paso = (estado: "hecho" | "en-curso" | "perdido" | "", texto: string, titulo?: string) =>
  `<span class="recorrido-paso ${estado}"${titulo ? ` title="${esc(titulo)}"` : ""}><span class="recorrido-punto"></span>${esc(texto)}</span>`;

// Notificaciones guarda los textos de los avisos en memoria: si se reinicia,
// un evento consumido queda sin aviso. No es un aviso pendiente.
const SIN_AVISO = "El evento se consumió, pero notificaciones guarda los textos en memoria y se reinició.";

const SIN_DATOS = "Notificaciones no responde: todavía no se sabe si lo consumió.";

// Sin datos de notificaciones (nunca respondió en esta sesión), lo que pasa
// después de entregar no se marca como hecho ni como en curso.
function recorrido(f: FilaEnviada, sinDatos: boolean): string {
  const entregado = f.evento.procesado;
  const consumido = f.consumido;
  const aviso = f.avisos > 0;
  const pasoConsumido = sinDatos ? paso("", "Consumido", SIN_DATOS) : paso(consumido ? "hecho" : entregado ? "en-curso" : "", "Consumido");
  const pasoAviso = sinDatos ? paso("", "Aviso", SIN_DATOS) : aviso ? paso("hecho", "Aviso") : consumido ? paso("perdido", "Aviso no disponible", SIN_AVISO) : paso("", "Aviso");
  return `<span class="recorrido">${paso("hecho", "Registrado")}${paso(entregado ? "hecho" : "en-curso", entregado ? "Entregado" : "Entregando")}${pasoConsumido}${pasoAviso}</span>`;
}

export function Enviadas() {
  const { enviadas, pendientes, duplicados, salientes, consumidos: idsConsumidos, cargado, notificacionesSinRespuesta, reentregar, actualizar } = useDatos();
  const sinDatos = idsConsumidos === null;
  const entregados = enviadas.filter((f) => f.evento.procesado).length;
  const consumidos = enviadas.filter((f) => f.consumido).length;

  const columnas = useMemo<Columna<FilaEnviada>[]>(() => [
    { titulo: "Solicitud", valor: (f) => f.solicitud.id, html: (f) => `<span class="celda-id">${esc(f.solicitud.id)}</span><br><span class="texto-tenue texto-chico">${esc(f.solicitud.tipo)} · evento ${esc(f.evento.eventoId.slice(0, 8))}…</span>` },
    { titulo: "Estado", valor: (f) => f.solicitud.estado, html: (f) => insignia(f.solicitud.estado) },
    { titulo: "Recorrido del evento", valor: (f) => (f.consumido ? 3 : f.evento.procesado ? 2 : 1), html: (f) => recorrido(f, sinDatos) },
    { titulo: "Avisos", valor: (f) => f.avisos, html: (f) => sinDatos ? `<span class="texto-tenue" title="${esc(SIN_DATOS)}">—</span>`
      : f.avisos > 0 || !f.consumido ? `<b>${f.avisos}</b>` : `<span class="texto-tenue" title="${esc(SIN_AVISO)}">No disponible</span>` },
    { titulo: "Comprobar", valor: () => "", ordenable: false, clase: "dt-right", html: (f) => f.consumido
      ? `<button type="button" class="arka-boton arka-boton-chico arka-boton-acento" data-accion="reentregar" data-id="${esc(f.evento.eventoId)}" aria-label="Reentregar el evento de ${esc(f.solicitud.id)}">Reentregar</button>`
      : `<span class="texto-tenue texto-chico">${notificacionesSinRespuesta ? "Espera a notificaciones" : "Se actualiza solo"}</span>` },
  ], [notificacionesSinRespuesta, sinDatos]);

  const alAccion = async (_accion: string, eventoId: string) => {
    const fila = enviadas.find((f) => f.evento.eventoId === eventoId);
    if (!fila) return;
    const ok = await confirmar({
      titulo: `¿Reentregar el evento de ${fila.solicitud.id}?`,
      texto: "Enviaremos otra vez el mismo evento a notificaciones. Si la idempotencia funciona, no aparecerá un aviso nuevo.",
      confirmar: "Sí, reentregar",
    });
    if (!ok) return;
    const { r, antes, despues } = await reentregar(fila.evento);
    if (r.estado !== "correcto") { await informarError("No se pudo reentregar", explicarError(r)); return; }
    const igual = despues === antes;
    await Swal.fire({
      icon: igual ? "success" : "error",
      title: igual ? "El aviso no se duplicó" : "Apareció un aviso nuevo",
      text: igual
        ? `Notificaciones reconoció el evento de ${fila.solicitud.id} y lo ignoró. Siguen ${despues} aviso${despues === 1 ? "" : "s"}.`
        : `Los avisos de ${fila.solicitud.id} pasaron de ${antes} a ${despues}. Revisa ConsumoIdempotente.`,
      confirmButtonText: "Entendido",
      buttonsStyling: false,
      customClass: { popup: "arka-swal", title: "arka-swal-titulo", htmlContainer: "arka-swal-texto", confirmButton: "arka-boton arka-boton-primario", icon: "arka-swal-icono" },
      showClass: { popup: "arka-swal-entra" },
      hideClass: { popup: "arka-swal-sale" },
    });
  };

  const tarjetas = [
    { titulo: "Eventos registrados", valor: enviadas.length, detalle: "en solicitudes" },
    { titulo: "Entregados", valor: entregados, detalle: pendientes > 0 ? `${pendientes} en camino` : "todos entregados" },
    { titulo: "Consumidos", valor: sinDatos ? "—" : consumidos, detalle: sinDatos ? "notificaciones no responde" : "en notificaciones" },
  ];

  return (
    <Marco vista="enviadas">
      <Encabezado titulo="Enviadas" descripcion="Cada envío genera un evento. Aquí ves si llegó a notificaciones y si produjo un solo aviso."
        acciones={<button type="button" onClick={() => void actualizar()} className="arka-boton arka-boton-secundario"><Icono nombre="repetir" tamano={16} />Actualizar</button>} />

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {tarjetas.map((t) => (
          <div key={t.titulo} className="bg-white border border-linea rounded-tarjeta p-5 flex flex-col gap-1">
            <span className="text-[12px] font-bold text-secundario">{t.titulo}</span>
            <b className="text-[30px] leading-none font-extrabold cifra">{t.valor}</b>
            <span className="text-[12px] text-secundario">{t.detalle}</span>
          </div>
        ))}
        <div className={`rounded-tarjeta p-5 flex flex-col gap-1 border ${duplicados === 0 ? "bg-correcto-suave border-[#BFE3D2] text-correcto" : "bg-error-suave border-[#EBC2CB] text-error"}`}>
          <span className="text-[12px] font-bold">Avisos duplicados</span>
          <b className="text-[30px] leading-none font-extrabold cifra">{duplicados}</b>
          <span className="text-[12px]">{duplicados === 0 ? "idempotencia correcta" : "revisar el consumidor"}</span>
        </div>
      </div>

      {notificacionesSinRespuesta && salientes !== null ? (
        <p role="status" className="m-0 flex items-center gap-2.5 rounded-recuadro bg-advertencia-suave text-advertencia-texto px-4 py-3 text-[14px] font-semibold">
          <Icono nombre="aviso" tamano={18} />
          Notificaciones no responde.{pendientes > 0 ? ` ${pendientes} evento${pendientes > 1 ? "s esperan" : " espera"} en la bandeja de salida de solicitudes:` : " Los eventos que envíes esperarán en la bandeja de salida:"} el relevador reintenta cada 5 segundos y los entrega cuando vuelva. No se pierde ninguno.
        </p>
      ) : pendientes > 0 && (
        <p role="status" className="m-0 flex items-center gap-2.5 rounded-recuadro bg-acc-suave text-acc-texto px-4 py-3 text-[14px] font-semibold">
          <span className="punto-viaje" aria-hidden="true" />
          {pendientes} evento{pendientes > 1 ? "s" : ""} en camino. El relevador revisa cada 5 segundos y esta pantalla se actualiza sola.
        </p>
      )}

      <Tarjeta etiqueta="Solicitudes enviadas">
        {cargado && salientes === null ? (
          <p className="m-0 nota-vacia">No se pudo leer los eventos. Revisa la <a href={rutaA("salud")}>salud de los servicios</a>.</p>
        ) : (
          <TablaDatos filas={enviadas} columnas={columnas} etiqueta="Tabla de solicitudes enviadas" alAccion={(a, i) => void alAccion(a, i)} />
        )}
        <p className="m-0 text-[12.5px] text-secundario"><b className="text-texto">Reentregar</b> envía otra vez el mismo evento a notificaciones. Si el aviso no se duplica, la idempotencia funciona. <a href={rutaA("ayuda", "duplicado")}>¿Cómo funciona?</a></p>
      </Tarjeta>
    </Marco>
  );
}

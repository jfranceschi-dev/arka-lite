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

const paso = (hecho: boolean, enCurso: boolean, texto: string) =>
  `<span class="recorrido-paso ${hecho ? "hecho" : enCurso ? "en-curso" : ""}"><span class="recorrido-punto"></span>${esc(texto)}</span>`;

function recorrido(f: FilaEnviada): string {
  const entregado = f.evento.procesado;
  const consumido = f.consumido;
  const aviso = f.avisos > 0;
  return `<span class="recorrido">${paso(true, false, "Registrado")}${paso(entregado, !entregado, entregado ? "Entregado" : "Entregando")}${paso(consumido, entregado && !consumido, "Consumido")}${paso(aviso, consumido && !aviso, "Aviso")}</span>`;
}

export function Enviadas() {
  const { enviadas, pendientes, duplicados, salientes, cargado, reentregar, actualizar } = useDatos();
  const entregados = enviadas.filter((f) => f.evento.procesado).length;
  const consumidos = enviadas.filter((f) => f.consumido).length;

  const columnas = useMemo<Columna<FilaEnviada>[]>(() => [
    { titulo: "Solicitud", valor: (f) => f.solicitud.id, html: (f) => `<span class="celda-id">${esc(f.solicitud.id)}</span><br><span class="texto-tenue texto-chico">${esc(f.solicitud.tipo)} · evento ${esc(f.evento.eventoId.slice(0, 8))}…</span>` },
    { titulo: "Estado", valor: (f) => f.solicitud.estado, html: (f) => insignia(f.solicitud.estado) },
    { titulo: "Recorrido del evento", valor: (f) => (f.consumido ? 3 : f.evento.procesado ? 2 : 1), html: recorrido },
    { titulo: "Avisos", valor: (f) => f.avisos, html: (f) => `<b>${f.avisos}</b>` },
    { titulo: "Comprobar", valor: () => "", ordenable: false, clase: "dt-right", html: (f) => f.consumido
      ? `<button type="button" class="arka-boton arka-boton-chico arka-boton-acento" data-accion="reentregar" data-id="${esc(f.evento.eventoId)}" aria-label="Reentregar el evento de ${esc(f.solicitud.id)}">Reentregar</button>`
      : '<span class="texto-tenue texto-chico">Se actualiza solo</span>' },
  ], []);

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
    { titulo: "Consumidos", valor: consumidos, detalle: "en notificaciones" },
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

      {pendientes > 0 && (
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

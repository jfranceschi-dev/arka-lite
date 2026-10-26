import { operacionPorId } from "../../../contenido/laboratorio.ts";
import type { RegistroPeticion } from "../api/cliente.ts";
import { rutaA } from "../rutas.ts";
import { Codigo } from "./Codigo.tsx";
import { Icono } from "./Iconos.tsx";
import { InsigniaEstado, NoObservado } from "./Insignias.tsx";

export function hora(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleTimeString("es-PA", { hour12: false })}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

function significado(r: RegistroPeticion): string {
  if (r.estado === "esperando") return "Esperando la respuesta del proxy.";
  if (r.error?.tipo === "tiempo") return r.error.mensaje;
  if (r.error?.tipo === "conexion") return "El navegador no pudo hablar con el proxy /api. Revisa que la UI y el proxy estén arriba.";
  if (r.error?.tipo === "proxy") return "El proxy respondió, pero no pudo llegar al servicio. El servicio puede estar detenido o arrancando.";
  if (r.status === 404) return "La solicitud no existe. No cambió nada.";
  if (r.status && r.status >= 500) return r.escritura
    ? "El servicio rechazó la operación con un error interno. Hoy es lo que ocurre con una transición de estado inválida."
    : "El servicio respondió con un error interno.";
  switch (r.operacionId) {
    case "crear": return "INC-002 quedó en BORRADOR.";
    case "enviar": return "La solicitud y su evento pendiente se guardaron juntos. El aviso todavía no existe.";
    case "aprobar": return "La solicitud quedó APROBADA. No genera evento.";
    case "rechazar": return "La solicitud quedó RECHAZADA. No genera evento.";
    case "avisos": return "Estos son los textos de aviso en memoria del servicio.";
    case "procesados": return "Estos son los eventoId consumidos. No dicen a qué solicitud pertenecen.";
    case "saludSolicitudes":
    case "saludNotificaciones": return "Actuator resume sus indicadores. No prueba que los eventos terminaron.";
    default: return "La consulta terminó.";
  }
}

// Vista sencilla: qué pidió la persona, quién respondió, qué significa.
export function ResultadoSencillo({ r }: { r: RegistroPeticion }) {
  const op = operacionPorId(r.operacionId);
  const bien = r.estado === "correcto";
  const esperando = r.estado === "esperando";
  const cuerpo = r.respuesta as { estado?: string } | null;
  return (
    <div className="flex flex-col gap-3">
      <div role="status" className={`flex items-center gap-3 rounded-recuadro px-4 py-3 ${esperando ? "bg-superficie2" : bien ? "bg-correcto-suave" : "bg-error-suave"}`}>
        <Icono nombre={esperando ? "reloj" : bien ? "checkCirculo" : r.error?.tipo === "conexion" ? "sinRed" : "xCirculo"} tamano={26}
          className={`${esperando ? "text-secundario esperando" : bien ? "text-correcto" : "text-error"}`} />
        <div className="flex flex-col">
          <b className="text-[17px]">{esperando ? `${r.etiqueta}: esperando…` : bien ? `${r.etiqueta}: correcto` : `${r.etiqueta}: ${r.error?.tipo === "tiempo" ? "tiempo agotado" : r.error?.tipo === "conexion" ? "sin conexión" : "error"}`}</b>
          <span className={`text-[13.5px] font-semibold ${bien ? "text-correcto" : esperando ? "text-secundario" : "text-error"}`}>
            {r.status ? `Respuesta ${r.status}` : esperando ? "Sin respuesta todavía" : "Sin respuesta HTTP"}{r.duracionMs !== null ? ` · ${r.duracionMs} ms observados por la UI` : ""}
          </span>
        </div>
        {bien && cuerpo?.estado && <span className="ml-auto"><InsigniaEstado estado={cuerpo.estado} /></span>}
      </div>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <Dato titulo="Qué pediste">{op.sencillo}</Dato>
        <Dato titulo="Quién la recibió">servicio-{op.servicio}, a través del proxy /api</Dato>
        <Dato titulo="Qué significa">{significado(r)}</Dato>
        <Dato titulo="Qué podría pasar después">{op.despues}</Dato>
      </div>
      {r.error && !esperando && <p className="m-0 text-[13.5px] text-error">{r.error.mensaje}</p>}
      <a href={rutaA("entender", op.explicacion)} className="self-start text-[13.5px] font-bold">Ver la explicación de este paso ›</a>
    </div>
  );
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-superficie2 rounded-recuadro p-3.5 flex flex-col gap-1">
      <span className="text-[12px] font-bold text-secundario">{titulo}</span>
      <span className="text-[14.5px] leading-snug">{children}</span>
    </div>
  );
}

// Detalle técnico: método, URL, hora, status, duración, cuerpos, error e ids.
export function ResultadoTecnico({ r }: { r: RegistroPeticion }) {
  const json = r.respuesta !== null ? JSON.stringify(r.respuesta, null, 2) : r.textoRespuesta;
  return (
    <div className="flex flex-col gap-3">
      <dl className="m-0 grid grid-cols-[150px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[14px]">
        <dt className="text-secundario font-semibold">Método</dt><dd className="m-0 font-mono">{r.metodo}</dd>
        <dt className="text-secundario font-semibold">URL del navegador</dt><dd className="m-0 font-mono break-all">{r.url}</dd>
        <dt className="text-secundario font-semibold">Destino del proxy</dt><dd className="m-0 font-mono break-all">http://{r.destinoInterno}</dd>
        <dt className="text-secundario font-semibold">Inicio</dt><dd className="m-0 font-mono">{hora(r.inicio)}</dd>
        <dt className="text-secundario font-semibold">Status HTTP</dt><dd className="m-0 font-mono">{r.status ?? "—"}</dd>
        <dt className="text-secundario font-semibold">Duración</dt><dd className="m-0 font-mono">{r.duracionMs !== null ? `${r.duracionMs} ms` : "—"}</dd>
        <dt className="text-secundario font-semibold">Cuerpo enviado</dt><dd className="m-0">{r.cuerpoEnviado ?? "Sin cuerpo"}</dd>
        <dt className="text-secundario font-semibold">Error</dt><dd className="m-0">{r.error ? `${r.error.tipo}: ${r.error.mensaje}` : "Ninguno"}</dd>
        <dt className="text-secundario font-semibold">Ids recibidos</dt>
        <dd className="m-0 flex flex-wrap gap-1.5">
          {r.ids.length ? r.ids.map((id) => <span key={id} className="font-mono text-[12.5px] px-2 py-0.5 rounded-capsula bg-cian-suave text-[#0B5A72]">{id}</span>) : <span>Ninguno</span>}
          {r.operacionId === "enviar" && <NoObservado texto="eventoId: no viene en la respuesta" />}
        </dd>
      </dl>
      {json && <Codigo bloque={{ lenguaje: "json", archivo: "Respuesta", texto: json }} compacto />}
      <p className="m-0 text-[12.5px] text-secundario">No se registran headers, cookies ni credenciales.</p>
    </div>
  );
}

import { useState } from "react";
import { operaciones, operacionPorId } from "../../../contenido/laboratorio.ts";
import { useHistorial } from "../estado/historial.tsx";
import type { RegistroPeticion } from "../api/cliente.ts";
import { Marco, Franja } from "../componentes/Marco.tsx";
import { ResultadoTecnico, hora } from "../componentes/ResultadoPeticion.tsx";
import { Codigo } from "../componentes/Codigo.tsx";
import { rutaA } from "../rutas.ts";

const NGINX = `location /api/solicitudes {
    limit_except GET POST { deny all; }
    proxy_pass \${ARKA_SOLICITUDES_ORIGEN}/solicitudes;
}
location = /api/notificaciones {
    limit_except GET { deny all; }
    proxy_pass \${ARKA_NOTIFICACIONES_ORIGEN}/notificaciones;
}
location = /api/eventos/procesados {
    limit_except GET { deny all; }
    proxy_pass \${ARKA_NOTIFICACIONES_ORIGEN}/eventos/procesados;
}
# /eventos/solicitud-enviada no se publica: es interno.`;

// Contratos verificados, peticiones observadas, código y configuración.
export function Detalle({ idRegistro }: { idRegistro: string | null }) {
  const { registros, porId } = useHistorial();
  const registro = idRegistro ? porId(idRegistro) : registros[0];
  return (
    <Marco vista="detalle" lateral={<Contratos />}>
      <Franja ruta={`Detalle técnico${registro ? ` › Petición de las ${hora(registro.inicio)}` : ""}`}
        titulo={registro ? `${registro.metodo} ${registro.url}` : "Contratos, peticiones y configuración"}
        descripcion={registro ? undefined : "Todavía no hay peticiones en esta pestaña. Abajo están los contratos verificados en el código."} />
      {registro && <PeticionObservada r={registro} otras={registros} />}
      <ContratosDetalle />
      <section aria-label="Configuración del proxy" className="bg-superficie rounded-tarjeta p-5 flex flex-col gap-3">
        <h2 className="m-0 text-[17px] font-bold">Configuración del proxy</h2>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <Caja titulo="Lo que usa el navegador" valor="/api/… en el mismo origen" nota="Sin CORS ni nombres internos." />
          <Caja titulo="Lo que usa el proxy" valor="http://servicio-solicitudes:8080 · http://servicio-notificaciones:8080" nota="Nombres de Service en Compose y en Kubernetes." />
          <Caja titulo="Puerto publicado / del contenedor" valor="8088 → 8080" nota="Compose publica 8088; en Kubernetes se usa port-forward." />
        </div>
        <Codigo bloque={{ lenguaje: "nginx", archivo: "presentacion/despliegue/nginx.conf.template (extracto)", texto: NGINX }} />
      </section>
      <OpenApi />
    </Marco>
  );
}

function PeticionObservada({ r, otras }: { r: RegistroPeticion; otras: RegistroPeticion[] }) {
  const op = operacionPorId(r.operacionId);
  return (
    <div className="flex flex-wrap gap-5 items-start">
      <section aria-label="Petición observada" className="flex-[3_1_560px] min-w-0 bg-superficie rounded-tarjeta p-5 flex flex-col gap-3">
        <h2 className="m-0 text-[17px] font-bold">Petición y respuesta observadas</h2>
        <ResultadoTecnico r={r} />
        <a href={rutaA("entender", op.explicacion)} className="self-start text-[13.5px] font-bold">Ver la explicación de esta operación ›</a>
      </section>
      <aside aria-label="Otras peticiones" className="flex-[1_1_280px] min-w-0 bg-superficie rounded-tarjeta p-5 flex flex-col gap-2">
        <h2 className="m-0 text-[15px] font-bold">Otras peticiones</h2>
        <ul className="m-0 p-0 list-none flex flex-col gap-1">
          {otras.slice(0, 12).map((x) => (
            <li key={x.id}>
              <a href={rutaA("detalle", x.id)} aria-current={x.id === r.id ? "true" : undefined}
                className={`block rounded-chico px-3 py-2 text-[13px] no-underline ${x.id === r.id ? "bg-franja text-white" : "bg-superficie2 text-texto"}`}>
                <span className="font-mono">{hora(x.inicio)}</span> · {x.etiqueta} · {x.status ?? x.error?.tipo ?? "…"}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function ContratosDetalle() {
  return (
    <section aria-label="Contratos" className="bg-superficie rounded-tarjeta p-5 flex flex-col gap-3">
      <h2 className="m-0 text-[17px] font-bold">Respuestas posibles por ruta</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-[13.5px]">
          <thead>
            <tr className="text-left text-secundario text-[12px]">
              {["Navegador", "Servicio", "Status", "Cuándo", "Cuerpo"].map((h) => <th key={h} scope="col" className="px-3 py-2.5 bg-superficie2">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {operaciones.flatMap((o) => o.respuestas.map((resp, i) => (
              <tr key={`${o.id}-${i}`} className="border-b border-[#12182814] align-top">
                <td className="px-3 py-2 font-mono text-[12.5px]">{i === 0 ? `${o.metodo} ${o.ruta}` : ""}</td>
                <td className="px-3 py-2 font-mono text-[12.5px]">{i === 0 ? o.rutaServicio : ""}</td>
                <td className={`px-3 py-2 font-mono font-bold ${resp.status.startsWith("2") ? "text-correcto" : "text-error"}`}>{resp.status}</td>
                <td className="px-3 py-2">{resp.cuando}</td>
                <td className="px-3 py-2 font-mono text-[12.5px]">{resp.cuerpo}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      <p className="m-0 text-[12.5px] text-secundario">201 y 409 no están implementados. POST /eventos/solicitud-enviada es interno y el proxy no lo publica.</p>
    </section>
  );
}

function OpenApi() {
  const [estado, setEstado] = useState<{ servicio: string; rutas: string[] } | { error: string } | null>(null);
  const cargar = async (servicio: "solicitudes" | "notificaciones") => {
    try {
      const r = await fetch(`/api/openapi/${servicio}`, { headers: { Accept: "application/json" }, credentials: "omit" });
      if (!r.ok) throw new Error(`status ${r.status}`);
      const doc = (await r.json()) as { paths?: Record<string, Record<string, unknown>> };
      const rutas = Object.entries(doc.paths ?? {}).flatMap(([ruta, metodos]) => Object.keys(metodos).map((m) => `${m.toUpperCase()} ${ruta}`));
      setEstado({ servicio, rutas });
    } catch (e) {
      setEstado({ error: `No se pudo leer OpenAPI de ${servicio}: ${e instanceof Error ? e.message : String(e)}` });
    }
  };
  return (
    <section aria-label="OpenAPI" className="bg-superficie rounded-tarjeta p-5 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h2 className="m-0 text-[17px] font-bold">OpenAPI publicado por cada servicio</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => void cargar("solicitudes")} className="h-10 px-4 rounded-capsula border-[1.5px] border-azul text-azul font-bold text-[13px]">Leer de solicitudes</button>
          <button type="button" onClick={() => void cargar("notificaciones")} className="h-10 px-4 rounded-capsula border-[1.5px] border-azul text-azul font-bold text-[13px]">Leer de notificaciones</button>
        </div>
      </div>
      {!estado && <p className="m-0 text-[13.5px] text-secundario">Springdoc expone /v3/api-docs; el proxy lo publica en /api/openapi/… Es una consulta, no se guarda en el historial.</p>}
      {estado && "error" in estado && <p role="alert" className="m-0 text-[13.5px] text-error">{estado.error}</p>}
      {estado && "rutas" in estado && (
        <ul className="m-0 pl-5 font-mono text-[13px]">{estado.rutas.map((r) => <li key={r}>{r}</li>)}</ul>
      )}
    </section>
  );
}

function Caja({ titulo, valor, nota }: { titulo: string; valor: string; nota: string }) {
  return (
    <div className="bg-superficie2 rounded-recuadro p-3.5 flex flex-col gap-1.5 min-w-0">
      <span className="text-[11px] font-bold tracking-[0.08em] text-secundario">{titulo.toUpperCase()}</span>
      <span className="font-mono text-[13px] break-all">{valor}</span>
      <span className="text-[12.5px] text-secundario">{nota}</span>
    </div>
  );
}

function Contratos() {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[11px] font-bold tracking-[0.08em] text-white/75 px-3.5 pb-1.5">CONTRATOS VERIFICADOS</div>
      {operaciones.map((o) => (
        <div key={o.id} className="flex gap-2 items-baseline px-3.5 py-1 font-mono text-[12px] text-white/85">
          <b className={`w-9 shrink-0 ${o.metodo === "GET" ? "text-sobre-oscuro-secundario" : "text-codigo-cadena"}`}>{o.metodo}</b>
          <span className="break-all">{o.rutaServicio}</span>
        </div>
      ))}
      <div className="flex gap-2 items-baseline px-3.5 py-1 font-mono text-[12px] text-white/75">
        <b className="w-9 shrink-0 text-codigo-cadena">POST</b><span>/eventos/solicitud-enviada</span>
      </div>
      <p className="m-0 px-3.5 text-[11.5px] text-white/75">Interno: lo llama el publicador, no la UI.</p>
    </div>
  );
}

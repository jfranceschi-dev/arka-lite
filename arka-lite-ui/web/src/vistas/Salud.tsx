import { useDatos, type SaludServicio } from "../estado/datos.tsx";
import { useEnlaces } from "../estado/enlaces.ts";
import { Encabezado, Marco, Tarjeta } from "../componentes/Marco.tsx";
import { Icono, type NombreIcono } from "../componentes/Iconos.tsx";
import { avisar } from "../componentes/dialogos.ts";
import { rutaA } from "../rutas.ts";

const TEXTO: Record<SaludServicio["estado"], string> = { "sin-validar": "Sin validar", validando: "Validando…", up: "UP", down: "DOWN", "sin-respuesta": "Sin respuesta" };

function TarjetaServicio({ nombre, rol, icono, s }: { nombre: string; rol: string; icono: NombreIcono; s: SaludServicio }) {
  const bien = s.estado === "up";
  const mal = s.estado === "down" || s.estado === "sin-respuesta";
  return (
    <Tarjeta etiqueta={nombre}>
      <div className="flex items-center gap-3.5">
        <span className="w-11 h-11 rounded-recuadro bg-acc-suave text-acc-texto flex items-center justify-center"><Icono nombre={icono} tamano={22} /></span>
        <div className="flex flex-col min-w-0"><b className="text-[16px]">{nombre}</b><span className="text-[13px] text-secundario">{rol}</span></div>
        <span className={`ml-auto px-3 py-1.5 rounded-capsula font-extrabold text-[13px] ${bien ? "bg-correcto-suave text-correcto" : mal ? "bg-error-suave text-error" : "bg-[#EEF1F6] text-secundario"}`}>{TEXTO[s.estado]}</span>
      </div>
      <dl className="m-0 grid grid-cols-2 gap-3">
        <div className="bg-fondo rounded-recuadro p-3"><dt className="text-[12px] text-secundario">Responde en</dt><dd className="m-0 mt-1 text-[20px] font-extrabold">{s.ms !== null ? `${s.ms} ms` : "—"}</dd></div>
        <div className="bg-fondo rounded-recuadro p-3"><dt className="text-[12px] text-secundario">Base de datos</dt><dd className={`m-0 mt-1 text-[20px] font-extrabold ${s.base === "UP" ? "text-correcto" : s.base ? "text-error" : ""}`}>{s.base ? `PostgreSQL · ${s.base}` : "—"}</dd></div>
      </dl>
    </Tarjeta>
  );
}

export function Salud() {
  const { salud, validarSalud } = useDatos();
  const enlaces = useEnlaces();
  const validando = salud.solicitudes.estado === "validando" || salud.notificaciones.estado === "validando";
  const ultima = Math.max(salud.solicitudes.validadoEn ?? 0, salud.notificaciones.validadoEn ?? 0);

  const validar = async () => {
    await validarSalud();
    avisar("Validación terminada", "Los resultados ya están en pantalla.", "info");
  };

  const herramientas = [
    { href: enlaces.swaggerSolicitudes, titulo: "Contrato de solicitudes", detalle: "Swagger: endpoints, cuerpos y respuestas" },
    { href: enlaces.swaggerNotificaciones, titulo: "Contrato de notificaciones", detalle: "Swagger: endpoints, cuerpos y respuestas" },
    { href: enlaces.grafana, titulo: "Grafana", detalle: "Logs de los dos servicios, por eventoId" },
  ];

  return (
    <Marco vista="salud">
      <Encabezado titulo="Salud de los servicios" descripcion={ultima ? `Última validación: ${new Date(ultima).toLocaleTimeString("es-PA")}` : "Comprueba que los dos servicios responden y tienen su base de datos."}
        acciones={<button type="button" onClick={() => void validar()} disabled={validando} className="arka-boton arka-boton-primario"><Icono nombre="pulso" tamano={16} />{validando ? "Validando…" : "Validar servicios"}</button>} />
      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        <TarjetaServicio nombre="Solicitudes" rol="Guarda las solicitudes y sus eventos" icono="lista" s={salud.solicitudes} />
        <TarjetaServicio nombre="Notificaciones" rol="Recibe los eventos y crea los avisos" icono="campana" s={salud.notificaciones} />
      </div>
      <p className="m-0 bg-white border border-linea rounded-recuadro px-5 py-4 text-[14px] leading-relaxed text-secundario">
        <b className="text-texto">¿Qué significa UP?</b> Que el servicio responde y su base de datos está disponible. No garantiza que todos los avisos ya llegaron: eso se revisa en <a href={rutaA("enviadas")}>Enviadas</a>.
      </p>
      <Tarjeta etiqueta="Contratos y herramientas">
        <h2 className="m-0 text-[16px] font-bold">Contratos y herramientas</h2>
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {herramientas.map((h) => (
            <a key={h.titulo} href={h.href} target="_blank" rel="noopener noreferrer" className="enlace-herramienta flex items-start gap-3 p-4 rounded-recuadro border border-linea no-underline text-texto">
              <Icono nombre="externo" tamano={18} className="mt-0.5 text-acc-texto" />
              <span className="flex flex-col gap-0.5"><b className="text-[14px]">{h.titulo}</b><span className="text-[12.5px] text-secundario">{h.detalle}</span></span>
            </a>
          ))}
        </div>
      </Tarjeta>
    </Marco>
  );
}

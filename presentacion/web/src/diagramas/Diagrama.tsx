import { useEffect, useMemo, useRef, useState } from "react";
import type { Diagrama as TDiagrama, Nodo } from "../../../diagramas/tipos.ts";
import { estadoEnPaso, posicionEtiqueta, rutaArista, type EstadoElemento, type Punto } from "../../../diagramas/geometria.ts";
import { color, trazo, type TipoTrazo } from "../../../diseno/tokens.ts";
import { usePreferencias } from "../estado/preferencias.tsx";
import { Icono } from "../componentes/Iconos.tsx";
import { ModoEvidencia } from "../componentes/Insignias.tsx";

// Dibuja una definición de diagramas/definiciones.ts. Reproducir, pausar o
// reiniciar solo cambia lo resaltado: nunca envía peticiones ni toca datos.

interface Props {
  diagrama: TDiagrama;
  oscuro?: boolean;
  pasoInicial?: number;
  mostrarInspector?: boolean;
}

const VELOCIDADES = [0.5, 1, 1.5, 2];

function paleta(oscuro: boolean) {
  return oscuro
    ? { fondo: color.marino, tarjeta: color.tarjetaOscura, borde: color.bordeOscuro, texto: color.sobreOscuro, secundario: color.sobreOscuroSecundario, futuro: "#2A4570", zona: "rgba(255,255,255,.035)", zonaBorde: "rgba(255,255,255,.12)", actual: color.cian, actualFondo: "#123A55" }
    : { fondo: color.superficie2, tarjeta: color.superficie, borde: color.borde, texto: color.texto, secundario: color.secundario, futuro: "#C7D2E2", zona: "#FFFFFF", zonaBorde: "#DCE4F0", actual: color.cian, actualFondo: color.cianSuave };
}

function partirTexto(texto: string, maximo: number): string[] {
  const palabras = texto.split(" ");
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    if ((actual + " " + p).trim().length > maximo && actual) {
      lineas.push(actual);
      actual = p;
    } else {
      actual = (actual + " " + p).trim();
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

const camino = (r: Punto[]) => r.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

export function Diagrama({ diagrama, oscuro = false, pasoInicial = 0, mostrarInspector = true }: Props) {
  const { movimiento } = usePreferencias();
  const reducido = movimiento === "reducido";
  const [paso, setPaso] = useState(Math.min(pasoInicial, diagrama.pasos.length - 1));
  const [reproduciendo, setReproduciendo] = useState(false);
  const [velocidad, setVelocidad] = useState(1);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);
  const p = paleta(oscuro);
  const total = diagrama.pasos.length;

  useEffect(() => {
    setPaso(Math.min(pasoInicial, diagrama.pasos.length - 1));
    setSeleccion(null);
    setReproduciendo(false);
  }, [diagrama.id, pasoInicial, diagrama.pasos.length]);

  useEffect(() => {
    if (!reproduciendo) return;
    temporizador.current = setInterval(() => {
      setPaso((x) => {
        if (x >= total - 1) {
          setReproduciendo(false);
          return x;
        }
        return x + 1;
      });
    }, Math.round(2400 / velocidad));
    return () => {
      if (temporizador.current) clearInterval(temporizador.current);
    };
  }, [reproduciendo, velocidad, total]);

  const pasoActual = diagrama.pasos[paso];
  const idSeleccion = seleccion ?? pasoActual.nodos[0] ?? diagrama.nodos[0].id;
  const nodoSeleccionado = diagrama.nodos.find((n) => n.id === idSeleccion) ?? diagrama.nodos[0];

  const rutas = useMemo(() => new Map(diagrama.aristas.map((a) => [a.id, rutaArista(diagrama, a)])), [diagrama]);
  const tiposUsados = useMemo(() => Array.from(new Set(diagrama.aristas.map((a) => a.tipo))), [diagrama]);

  const colorArista = (tipo: TipoTrazo, estado: EstadoElemento) =>
    estado === "actual" ? p.actual : estado === "futuro" ? p.futuro : oscuro ? trazo[tipo].colorOscuro : trazo[tipo].color;

  const marcadores = new Map<string, { punta: string; color: string }>();
  const idMarcador = (punta: string, c: string) => {
    const id = `m-${diagrama.id}-${punta}-${c.replace(/[^a-zA-Z0-9]/g, "")}`;
    marcadores.set(id, { punta, color: c });
    return id;
  };

  const aristas = diagrama.aristas.map((a) => {
    const estado = estadoEnPaso(diagrama.pasos, paso, a.id, "aristas");
    const c = colorArista(a.tipo, estado);
    const t = trazo[a.tipo];
    const marcador = t.punta === "ninguna" ? null : idMarcador(t.punta, c);
    return { a, estado, c, t, marcador, ruta: rutas.get(a.id) ?? [] };
  });

  const ir = (n: number) => {
    setReproduciendo(false);
    setPaso(Math.max(0, Math.min(total - 1, n)));
    setSeleccion(null);
  };

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 no-imprimir">
        <ModoEvidencia modo="explicacion" sobreOscuro={oscuro} />
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Controles de la explicación">
          <BotonControl oscuro={oscuro} etiqueta="Paso anterior" onClick={() => ir(paso - 1)} disabled={paso === 0}><Icono nombre="anterior" /></BotonControl>
          <button type="button" onClick={() => {
            if (reproduciendo) { setReproduciendo(false); return; }
            if (paso >= total - 1) setPaso(0);
            setReproduciendo(true);
          }}
            className={`inline-flex items-center gap-2 h-11 px-4 rounded-capsula font-bold text-[14px] ${oscuro ? "bg-cian text-tinta" : "bg-franja text-white"}`}>
            <Icono nombre={reproduciendo ? "pausa" : "play"} />{reproduciendo ? "Pausar" : "Reproducir"}
          </button>
          <BotonControl oscuro={oscuro} etiqueta="Paso siguiente" onClick={() => ir(paso + 1)} disabled={paso === total - 1}><Icono nombre="siguiente" /></BotonControl>
          <button type="button" onClick={() => ir(0)} className={`inline-flex items-center gap-1.5 h-11 px-3 rounded-capsula border-[1.5px] text-[13px] font-semibold ${oscuro ? "border-white/25 text-sobre-oscuro" : "border-[#12182836] bg-white text-texto"}`}>
            <Icono nombre="reiniciar" tamano={16} />Reiniciar
          </button>
          <button type="button" aria-label={`Velocidad ${velocidad} veces. Cambiar`} onClick={() => setVelocidad(VELOCIDADES[(VELOCIDADES.indexOf(velocidad) + 1) % VELOCIDADES.length])}
            className={`h-11 px-3 rounded-capsula border-[1.5px] font-mono text-[13px] font-bold ${oscuro ? "border-white/25 text-sobre-oscuro" : "border-[#12182836] bg-white text-texto"}`}>
            {velocidad}×
          </button>
          <InterruptorMovimiento oscuro={oscuro} />
        </div>
      </div>

      <div className={`rounded-recuadro overflow-x-auto ${oscuro ? "" : "bg-superficie2"}`}>
        <svg viewBox={`0 0 ${diagrama.ancho} ${diagrama.alto}`} className="w-full h-auto min-w-[760px] block" role="group" aria-label={`${diagrama.titulo}. ${diagrama.descripcion}`}>
          <defs>
            <pattern id={`trama-${diagrama.id}`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="12" height="12" fill={oscuro ? "#2A2310" : "#FFF4DC"} />
              <rect width="6" height="12" fill={oscuro ? "#3A2E12" : "#FBE7BD"} />
            </pattern>
            {Array.from(marcadores.entries()).map(([id, m]) => (
              <marker key={id} id={id} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
                {m.punta === "llena" && <path d="M0 0 L10 5 L0 10 Z" fill={m.color} />}
                {m.punta === "abierta" && <path d="M1 1 L9 5 L1 9" fill="none" stroke={m.color} strokeWidth="1.6" />}
                {m.punta === "hueca" && <path d="M1 1 L9 5 L1 9 Z" fill={oscuro ? color.marino : "#FFFFFF"} stroke={m.color} strokeWidth="1.4" />}
              </marker>
            ))}
          </defs>

          {(diagrama.zonas ?? []).map((z) => {
            const estado = estadoEnPaso(diagrama.pasos, paso, z.id, "zonas");
            return (
              <g key={z.id}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={18} fill={z.punteada && estado === "actual" ? (oscuro ? "rgba(43,166,203,.10)" : "rgba(43,166,203,.08)") : p.zona}
                  stroke={estado === "actual" ? p.actual : p.zonaBorde} strokeWidth={z.punteada ? 2 : 1.2} strokeDasharray={z.punteada ? "8 6" : undefined} />
                <text x={z.x + 16} y={z.y + 24} fontSize={12} fontWeight={800} letterSpacing="0.08em" fill={p.secundario}>{z.etiqueta}</text>
              </g>
            );
          })}

          {aristas.map(({ a, estado, c, t, marcador, ruta }) => (
            <g key={a.id}>
              <path d={camino(ruta)} fill="none" stroke={c} strokeWidth={t.ancho} strokeDasharray={t.guiones?.join(" ")} strokeLinecap="round" strokeLinejoin="round"
                markerEnd={marcador ? `url(#${marcador})` : undefined} />
              {estado === "actual" && !reducido && (
                <path d={camino(ruta)} fill="none" stroke={oscuro ? "#FFFFFF" : "#FFFFFF"} strokeOpacity={0.85} strokeWidth={Math.max(1.2, t.ancho - 1)} strokeDasharray="4 10" className="trazo-activo" />
              )}
              {a.etiqueta && (() => {
                const pos = posicionEtiqueta(ruta, a.lado);
                return (
                  <text x={pos.x} y={pos.y} textAnchor={pos.ancla} fontSize={13} fontWeight={600} fontFamily="Cascadia Mono, Consolas, monospace"
                    fill={estado === "futuro" ? p.secundario : c} stroke={oscuro ? color.marino : color.superficie2} strokeWidth={5} paintOrder="stroke">
                    {a.etiqueta}
                  </text>
                );
              })()}
            </g>
          ))}

          {diagrama.nodos.map((n) => (
            <NodoSvg key={n.id} n={n} diagramaId={diagrama.id} estado={estadoEnPaso(diagrama.pasos, paso, n.id, "nodos")} seleccionado={n.id === idSeleccion}
              p={p} oscuro={oscuro} alElegir={() => setSeleccion(n.id)} />
          ))}
        </svg>
      </div>

      <div aria-live="polite" className={`flex gap-3 items-start rounded-recuadro px-4 py-3 ${oscuro ? "bg-white/5" : "bg-superficie2"}`}>
        <span className={`shrink-0 inline-flex items-center justify-center min-w-11 h-8 px-2 rounded-chico font-mono font-bold text-[13px] ${oscuro ? "bg-cian text-tinta" : "bg-franja text-white"}`}>{paso + 1}/{total}</span>
        <p className={`m-0 text-[16px] leading-relaxed ${oscuro ? "text-white" : ""}`}>{pasoActual.texto}</p>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[12.5px]" aria-label="Leyenda">
        {tiposUsados.map((tipo) => (
          <span key={tipo} className={`inline-flex items-center gap-2 ${oscuro ? "text-sobre-oscuro-secundario" : "text-secundario"}`}>
            <svg width="38" height="12" viewBox="0 0 38 12" aria-hidden="true">
              <line x1="2" y1="6" x2="28" y2="6" stroke={oscuro ? trazo[tipo].colorOscuro : trazo[tipo].color} strokeWidth={trazo[tipo].ancho} strokeDasharray={trazo[tipo].guiones?.join(" ")} strokeLinecap="round" />
              {trazo[tipo].punta === "llena" && <path d="M27 1 L37 6 L27 11 Z" fill={oscuro ? trazo[tipo].colorOscuro : trazo[tipo].color} />}
              {trazo[tipo].punta === "abierta" && <path d="M28 1 L36 6 L28 11" fill="none" stroke={oscuro ? trazo[tipo].colorOscuro : trazo[tipo].color} strokeWidth="1.6" />}
              {trazo[tipo].punta === "hueca" && <path d="M28 1 L36 6 L28 11 Z" fill="none" stroke={oscuro ? trazo[tipo].colorOscuro : trazo[tipo].color} strokeWidth="1.4" />}
            </svg>
            {trazo[tipo].etiqueta}
          </span>
        ))}
        <span className={`inline-flex items-center gap-2 ${oscuro ? "text-sobre-oscuro-secundario" : "text-secundario"}`}>
          <span className="inline-block w-6 h-3 rounded-sm border-2" style={{ borderColor: color.cian }} />Paso actual
        </span>
      </div>

      {diagrama.nota && <p className={`m-0 text-[13.5px] ${oscuro ? "text-sobre-oscuro-secundario" : "text-secundario"}`}>{diagrama.nota}</p>}

      {mostrarInspector && (
        <section aria-label="Nodo seleccionado" className={`rounded-recuadro p-4 flex flex-col gap-2 ${oscuro ? "bg-white/5 text-white" : "bg-white border border-[#DCE4F0]"}`}>
          <div className={`text-[11px] font-bold tracking-[0.08em] ${oscuro ? "text-cian-claro" : "text-cian-texto"}`}>NODO SELECCIONADO · {nodoSeleccionado.titulo.toUpperCase()}</div>
          <dl className="m-0 grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[14px] leading-snug">
            <dt className={`font-semibold ${oscuro ? "text-sobre-oscuro-secundario" : "text-secundario"}`}>Qué hace</dt><dd className="m-0">{nodoSeleccionado.detalle.hace}</dd>
            <dt className={`font-semibold ${oscuro ? "text-sobre-oscuro-secundario" : "text-secundario"}`}>Recibe</dt><dd className="m-0">{nodoSeleccionado.detalle.recibe}</dd>
            <dt className={`font-semibold ${oscuro ? "text-sobre-oscuro-secundario" : "text-secundario"}`}>Devuelve</dt><dd className="m-0">{nodoSeleccionado.detalle.devuelve}</dd>
            <dt className={`font-semibold ${oscuro ? "text-sobre-oscuro-secundario" : "text-secundario"}`}>Archivo</dt><dd className={`m-0 font-mono text-[12.5px] break-all ${oscuro ? "text-cian-claro" : "text-cian-texto"}`}>{nodoSeleccionado.detalle.archivo}</dd>
          </dl>
          <p className={`m-0 text-[12px] ${oscuro ? "text-sobre-oscuro-secundario" : "text-secundario"}`}>Selecciona cualquier nodo con el ratón o con Tab y Enter.</p>
        </section>
      )}
    </div>
  );
}

function BotonControl({ children, etiqueta, onClick, disabled, oscuro }: { children: React.ReactNode; etiqueta: string; onClick: () => void; disabled?: boolean; oscuro: boolean }) {
  return (
    <button type="button" aria-label={etiqueta} title={etiqueta} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center w-11 h-11 rounded-capsula border-[1.5px] disabled:opacity-40 disabled:cursor-not-allowed ${oscuro ? "border-white/25 text-sobre-oscuro" : "border-[#12182836] bg-white text-texto"}`}>
      {children}
    </button>
  );
}

export function InterruptorMovimiento({ oscuro = false }: { oscuro?: boolean }) {
  const { movimiento, setMovimiento } = usePreferencias();
  const reducido = movimiento === "reducido";
  return (
    <button type="button" role="switch" aria-checked={reducido} onClick={() => setMovimiento(reducido ? "normal" : "reducido")}
      className={`inline-flex items-center gap-2 h-11 px-3 rounded-capsula border-[1.5px] text-[13px] font-semibold ${oscuro ? "border-white/25 text-sobre-oscuro" : "border-[#12182836] bg-white text-texto"}`}>
      <span className={`inline-flex items-center w-8 h-5 p-0.5 rounded-capsula ${reducido ? "bg-cian-texto justify-end" : "bg-[#B8C3D6] justify-start"}`}>
        <span className="w-4 h-4 rounded-full bg-white" />
      </span>
      Sin movimiento
    </button>
  );
}

function NodoSvg({ n, diagramaId, estado, seleccionado, p, oscuro, alElegir }: {
  n: Nodo; diagramaId: string; estado: EstadoElemento; seleccionado: boolean; p: ReturnType<typeof paleta>; oscuro: boolean; alElegir: () => void;
}) {
  const actual = estado === "actual";
  const tipo = n.tipo ?? "componente";
  const fondo = tipo === "memoria" ? `url(#trama-${diagramaId})` : actual ? p.actualFondo : tipo === "datos" ? (oscuro ? "#0F2342" : "#EEF3FA") : tipo === "infra" ? (oscuro ? "#0F2342" : color.superficie2) : p.tarjeta;
  const borde = actual ? p.actual : tipo === "memoria" ? color.advertencia : tipo === "pendiente" ? p.secundario : estado === "pasado" ? (oscuro ? "#5E7FB5" : color.azul) : p.borde;
  const discontinuo = tipo === "memoria" || tipo === "pendiente" || tipo === "contrato" ? "7 5" : undefined;
  const textoColor = tipo === "memoria" ? (oscuro ? "#F2C66D" : "#5C3404") : tipo === "pendiente" ? p.secundario : p.texto;
  const sub = n.subtitulo ? partirTexto(n.subtitulo, Math.floor(n.w / 7.4)) : [];
  const titulo = partirTexto(n.titulo, Math.floor(n.w / 8.6));
  const lineas = titulo.length + sub.length;
  const inicioY = n.y + n.h / 2 - ((lineas - 1) * 17) / 2 + 5;
  const cx = n.x + n.w / 2;
  return (
    <g role="button" tabIndex={0} aria-pressed={seleccionado} aria-label={`${n.titulo}${n.subtitulo ? `. ${n.subtitulo}` : ""}${actual ? ". Paso actual" : ""}`}
      className="nodo-diagrama cursor-pointer" opacity={estado === "futuro" ? 0.5 : 1} onClick={alElegir}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alElegir(); } }}>
      {tipo === "decision" ? (
        <polygon points={`${cx},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${cx},${n.y + n.h} ${n.x},${n.y + n.h / 2}`} fill={actual ? color.cian : oscuro ? "#1F4E8C" : color.cianSuave}
          stroke={actual ? p.actual : borde} strokeWidth={actual ? 3 : 1.5} />
      ) : (
        <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={tipo === "persona" ? n.h / 2 : 14} fill={fondo} stroke={borde} strokeWidth={actual ? 3 : 1.6} strokeDasharray={discontinuo}
          style={actual ? { filter: `drop-shadow(0 0 6px ${oscuro ? "rgba(43,166,203,.55)" : "rgba(43,166,203,.45)"})` } : undefined} />
      )}
      {seleccionado && (
        <rect x={n.x - 6} y={n.y - 6} width={n.w + 12} height={n.h + 12} rx={18} fill="none" stroke={oscuro ? "#FFFFFF" : color.franja} strokeWidth={1.6} strokeDasharray="5 4" />
      )}
      {tipo === "contrato" && <text x={cx} y={n.y + 16} textAnchor="middle" fontSize={11} fill={p.secundario} fontStyle="italic">«interfaz»</text>}
      <text textAnchor="middle" fill={tipo === "decision" && actual ? color.tinta : textoColor}>
        {titulo.map((l, i) => (
          <tspan key={`t${i}`} x={cx} y={inicioY + i * 17 + (tipo === "contrato" ? 6 : 0)} fontSize={15} fontWeight={800}>{l}</tspan>
        ))}
        {sub.map((l, i) => (
          <tspan key={`s${i}`} x={cx} y={inicioY + (titulo.length + i) * 17 + (tipo === "contrato" ? 6 : 0)} fontSize={12.5} fontWeight={500} fill={tipo === "decision" && actual ? color.tinta : p.secundario}>{l}</tspan>
        ))}
      </text>
    </g>
  );
}

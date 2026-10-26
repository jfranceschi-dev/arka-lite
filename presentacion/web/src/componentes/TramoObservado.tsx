import type { RegistroPeticion } from "../api/cliente.ts";
import { color } from "../../../diseno/tokens.ts";

// Tramo de la última petición. Solo navegador ↔ proxy es observado; el salto
// del proxy al servicio se deduce de la configuración y se dibuja punteado.
export function TramoObservado({ r }: { r: RegistroPeticion | undefined }) {
  const estado = !r ? "inactivo" : r.estado;
  const colorTramo = estado === "correcto" ? color.correcto : estado === "error" ? color.error : estado === "esperando" ? color.azulVivo : "#C7D2E2";
  const servicio = r ? `servicio-${r.servicio}` : "servicio";
  const leyenda = estado === "esperando" ? "Esperando respuesta" : estado === "correcto" ? `Observado: ${r?.status}` : estado === "error" ? "Error observado" : "Sin peticiones todavía";
  return (
    <figure className="m-0 flex flex-col gap-2" aria-label={`Tramo de la última petición: ${leyenda}`}>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 760 92" className="w-full min-w-[560px] h-auto" role="img" aria-label={`Navegador a proxy: ${leyenda}. Proxy a ${servicio}: explicado, no observado.`}>
          <rect x="4" y="22" width="150" height="48" rx="12" fill={color.franja} />
          <text x="79" y="51" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">Navegador</text>
          <line x1="154" y1="46" x2="292" y2="46" stroke={colorTramo} strokeWidth={estado === "correcto" ? 4 : 2.5} strokeDasharray={estado === "error" ? "3 5" : undefined} />
          {estado === "esperando" && <line x1="154" y1="46" x2="292" y2="46" stroke="#fff" strokeWidth="1.6" strokeDasharray="4 10" className="trazo-activo" />}
          <text x="223" y="34" textAnchor="middle" fontSize="12" fontWeight="700" fill={colorTramo}>{leyenda}</text>
          <rect x="296" y="22" width="150" height="48" rx="12" fill="#fff" stroke={color.azul} strokeWidth="1.5" />
          <text x="371" y="51" textAnchor="middle" fill={color.texto} fontSize="14" fontWeight="700">Proxy /api</text>
          <line x1="446" y1="46" x2="584" y2="46" stroke={color.secundario} strokeWidth="2.5" strokeDasharray="1 6" strokeLinecap="round" />
          <text x="515" y="34" textAnchor="middle" fontSize="12" fill={color.secundario}>explicado</text>
          <rect x="588" y="22" width="168" height="48" rx="12" fill="#fff" stroke={color.azul} strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="672" y="51" textAnchor="middle" fill={color.texto} fontSize="13" fontWeight="700">{servicio}</text>
        </svg>
      </div>
    </figure>
  );
}

import type { NombreIcono } from "../diseno/iconos.ts";
import type { Nodo } from "./tipos.ts";

// Ícono de cada nodo: el que declara el nodo o, si no tiene, uno deducido de
// su tipo y su título. Las reglas van de lo más específico a lo más general.
const reglas: [RegExp, NombreIcono][] = [
  [/github actions/, "workflow"],
  [/github/, "github"],
  [/ghcr/, "package-check"],
  [/swagger/, "book-open"],
  [/actuator/, "heart-pulse"],
  [/micrometer/, "gauge"],
  [/prometheus/, "activity"],
  [/promtail/, "scan-eye"],
  [/loki/, "archive"],
  [/grafana/, "chart-line"],
  [/traza/, "waypoints"],
  [/configuraci/, "settings"],
  [/manejador/, "shield-alert"],
  [/consumo/, "fingerprint"],
  [/relevador/, "timer"],
  [/publicador/, "send"],
  [/controller/, "code"],
  [/^repositorio(jpa|enmemoria)|^evento.*repository|registrador/, "save"],
  [/servicio ?de/, "settings"],
  [/proxy|nginx/, "network"],
  [/react|spa\b|pantalla/, "app-window"],
  [/arka-lite-ui|^ui$|interfaz/, "monitor"],
  [/acci[oó]n|^control$/, "mouse-pointer-click"],
  [/cliente http/, "globe"],
  [/historial/, "list-todo"],
  [/^api\b/, "server"],
  [/spring data/, "layers"],
  [/^spring/, "settings"],
  [/proceso java|aplicaci[oó]n spring/, "server"],
  [/sin fk/, "split"],
  [/etapa build/, "settings"],
  [/\.jar/, "file-code"],
  [/etapa final|^imagen/, "package"],
  [/contenedor/, "container"],
  [/deployment/, "layers"],
  [/replicaset/, "copy"],
  [/^service\b/, "link"],
  [/^pod\b/, "box"],
  [/secret/, "key-round"],
  [/pvc|disco/, "hard-drive"],
  [/arranque/, "power"],
  [/despliegue/, "rocket"],
  [/ignorar/, "ban"],
  [/aviso/, "bell"],
  [/salida del contenedor/, "terminal"],
  [/una aplicaci[oó]n/, "box"],
  [/notificaciones/, "bell"],
  [/solicitudes/, "clipboard-list"],
  [/^solicitud$|^notificacion$/, "file-text"],
  [/puertos/, "plug"],
  [/tu equipo/, "monitor"],
  [/equipo/, "users"],
  [/persona/, "user"],
];

export function iconoDeNodo(n: Nodo): NombreIcono | null {
  if (n.icono) return n.icono;
  if (n.tipo === "decision") return null;
  const t = n.titulo.toLowerCase();
  if (n.tipo === "contrato") return "plug";
  if (n.tipo === "datos" && !/pvc|disco|sin fk/.test(t)) return "database";
  for (const [patron, icono] of reglas) if (patron.test(t)) return icono;
  if (n.tipo === "persona") return "user";
  return null;
}

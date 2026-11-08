import { vi } from "vitest";

// Doble de prueba del proxy /api: reproduce las respuestas que dan hoy los
// controladores (200/201, 404 y 409 con ErrorRespuesta, 400 sin datos).
// Solo se usa en pruebas; la UI no tiene modo simulado. Con
// notificacionesCaido, notificaciones responde 502 (como el proxy cuando el
// servicio no está) y lo que se envía queda pendiente en la bandeja de salida.
export function crearApiFalsa({ notificacionesCaido = false } = {}) {
  const solicitudes = new Map<string, { id: string; tipo: string; estado: string }>([
    ["INC-001", { id: "INC-001", tipo: "Incidente", estado: "BORRADOR" }],
    ["CAM-002", { id: "CAM-002", tipo: "Cambio", estado: "ENVIADA" }],
  ]);
  const avisos = [{ texto: "Solicitud CAM-002 (SolicitudEnviada) enviada" }];
  const procesados = ["0b9c7a4e-1111-4c1e-9a55-aaaaaaaaaaaa"];
  const salientes = [{ eventoId: "0b9c7a4e-1111-4c1e-9a55-aaaaaaaaaaaa", solicitudId: "CAM-002", tipo: "SolicitudEnviada", procesado: true }];
  const json = (status: number, cuerpo: unknown) => new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });
  const transicion = (id: string, desde: string, hacia: string) => {
    const s = solicitudes.get(id);
    if (!s) return json(404, { estado: 404, mensaje: `No existe la solicitud ${id}` });
    if (s.estado !== desde) return json(409, { estado: 409, mensaje: `solo desde ${desde}` });
    const n = { ...s, estado: hacia };
    solicitudes.set(id, n);
    return json(200, n);
  };

  const fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const ruta = String(url);
    const metodo = init?.method ?? "GET";
    if (ruta === "/api/solicitudes" && metodo === "GET") return json(200, Array.from(solicitudes.values()));
    if (ruta === "/api/solicitudes" && metodo === "POST") {
      const { id, tipo } = JSON.parse(String(init?.body ?? "{}")) as { id?: string; tipo?: string };
      if (!id?.trim() || !tipo?.trim()) return json(400, { estado: 400, mensaje: "id y tipo son obligatorios" });
      const clave = id.trim().toUpperCase();
      if (solicitudes.has(clave)) return json(409, { estado: 409, mensaje: `Ya existe la solicitud ${clave}` });
      const s = { id: clave, tipo: tipo.trim(), estado: "BORRADOR" };
      solicitudes.set(clave, s);
      return json(201, s);
    }
    if (ruta === "/api/solicitudes/crear" && metodo === "POST") {
      const s = { id: "INC-002", tipo: "Incidencia", estado: "BORRADOR" };
      solicitudes.set(s.id, s);
      return json(200, s);
    }
    const accion = ruta.match(/^\/api\/solicitudes\/([^/]+)\/(enviar|aprobar|rechazar)$/);
    if (accion && metodo === "POST") {
      const id = decodeURIComponent(accion[1]);
      if (accion[2] === "enviar") {
        const r = transicion(id, "BORRADOR", "ENVIADA");
        if (r.status === 200 && notificacionesCaido) {
          salientes.push({ eventoId: `evento-${id}`, solicitudId: id, tipo: "SolicitudEnviada", procesado: false });
        } else if (r.status === 200) {
          procesados.push(`evento-${id}`);
          salientes.push({ eventoId: `evento-${id}`, solicitudId: id, tipo: "SolicitudEnviada", procesado: true });
          avisos.push({ texto: `Solicitud ${id} (SolicitudEnviada) enviada` });
        }
        return r;
      }
      return transicion(id, "ENVIADA", accion[2] === "aprobar" ? "APROBADA" : "RECHAZADA");
    }
    const una = ruta.match(/^\/api\/solicitudes\/([^/]+)$/);
    if (una && metodo === "GET") {
      const s = solicitudes.get(decodeURIComponent(una[1]));
      return s ? json(200, s) : json(404, { estado: 404, mensaje: `No existe la solicitud ${decodeURIComponent(una[1])}` });
    }
    const deNotificaciones = ["/api/notificaciones", "/api/eventos/procesados", "/api/eventos/solicitud-enviada", "/api/salud/notificaciones"];
    if (notificacionesCaido && deNotificaciones.includes(ruta)) return new Response("<html>502 Bad Gateway</html>", { status: 502 });
    if (ruta === "/api/notificaciones") return json(200, avisos);
    if (ruta === "/api/eventos/procesados") return json(200, procesados);
    if (ruta === "/api/eventos/salientes") return json(200, salientes);
    if (ruta === "/api/eventos/solicitud-enviada" && metodo === "POST") {
      // Igual que ConsumoIdempotente: un eventoId ya consumido se ignora.
      const e = JSON.parse(String(init?.body ?? "{}")) as { eventoId: string; id: string; tipo: string };
      if (!procesados.includes(e.eventoId)) {
        procesados.push(e.eventoId);
        avisos.push({ texto: `Solicitud ${e.id} (${e.tipo}) enviada` });
      }
      return new Response(null, { status: 200 });
    }
    if (ruta.startsWith("/api/salud/")) return json(200, { status: "UP", components: { db: { status: "UP" } } });
    return new Response("<html>404</html>", { status: 404 });
  });
  return { fetch, solicitudes, avisos };
}

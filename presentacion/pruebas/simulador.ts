import { vi } from "vitest";

// Doble de prueba del proxy /api: reproduce las respuestas que dan hoy los
// controladores (200, 404 con ErrorRespuesta y 500 en transiciones inválidas).
// Solo se usa en pruebas; la UI no tiene modo simulado.
export function crearApiFalsa() {
  const solicitudes = new Map<string, { id: string; tipo: string; estado: string }>([
    ["INC-001", { id: "INC-001", tipo: "Incidente", estado: "BORRADOR" }],
    ["CAM-002", { id: "CAM-002", tipo: "Cambio", estado: "ENVIADA" }],
  ]);
  const avisos = [{ texto: "Solicitud CAM-002 (SolicitudEnviada) enviada" }];
  const procesados = ["0b9c7a4e-1111-4c1e-9a55-aaaaaaaaaaaa"];
  const json = (status: number, cuerpo: unknown) => new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });
  const transicion = (id: string, desde: string, hacia: string) => {
    const s = solicitudes.get(id);
    if (!s) return json(404, { estado: 404, mensaje: `No existe la solicitud ${id}` });
    if (s.estado !== desde) return json(500, { status: 500, error: "Internal Server Error", path: `/solicitudes/${id}` });
    const n = { ...s, estado: hacia };
    solicitudes.set(id, n);
    return json(200, n);
  };

  const fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const ruta = String(url);
    const metodo = init?.method ?? "GET";
    if (ruta === "/api/solicitudes" && metodo === "GET") return json(200, Array.from(solicitudes.values()));
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
        if (r.status === 200) {
          procesados.push(`evento-${id}`);
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
    if (ruta === "/api/notificaciones") return json(200, avisos);
    if (ruta === "/api/eventos/procesados") return json(200, procesados);
    if (ruta.startsWith("/api/salud/")) return json(200, { status: "UP", components: { db: { status: "UP" } } });
    return new Response("<html>404</html>", { status: 404 });
  });
  return { fetch, solicitudes };
}

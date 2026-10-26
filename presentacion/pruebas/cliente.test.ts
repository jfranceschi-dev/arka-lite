import { describe, expect, it, vi } from "vitest";
import { construirUrl, ejecutar, extraerIds } from "../web/src/api/cliente.ts";
import { operacionPorId } from "../contenido/laboratorio.ts";

const respuesta = (status: number, cuerpo: unknown, tipo = "application/json") =>
  new Response(typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo), { status, headers: { "Content-Type": tipo } });

describe("cliente HTTP del laboratorio", () => {
  it("usa solo rutas /api del mismo origen y codifica el id", () => {
    expect(construirUrl(operacionPorId("listar"))).toBe("/api/solicitudes");
    expect(construirUrl(operacionPorId("enviar"), "INC 002/x")).toBe("/api/solicitudes/INC%20002%2Fx/enviar");
    expect(() => construirUrl(operacionPorId("consultar"))).toThrow(/necesita el id/);
  });

  it("registra método, status, duración e ids de una respuesta correcta", async () => {
    const fetchImpl = vi.fn(async () => respuesta(200, { id: "INC-002", tipo: "Incidencia", estado: "ENVIADA" }));
    let t = 0;
    const r = await ejecutar(operacionPorId("enviar"), "INC-002", { fetchImpl, ahora: () => (t += 40) });
    expect(r.estado).toBe("correcto");
    expect(r.status).toBe(200);
    expect(r.metodo).toBe("POST");
    expect(r.duracionMs).toBe(40);
    expect(r.ids).toEqual(["INC-002"]);
    expect(r.destinoInterno).toBe("servicio-solicitudes:8080/solicitudes/INC-002/enviar");
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.credentials).toBe("omit");
    expect(init.body).toBeUndefined();
  });

  it("no inventa un eventoId: solo extrae los ids que vienen en el cuerpo", () => {
    expect(extraerIds({ id: "INC-002", estado: "ENVIADA" })).toEqual(["INC-002"]);
    expect(extraerIds([{ id: "A" }, { id: "B" }])).toEqual(["A", "B"]);
    expect(extraerIds(["uuid-1", "uuid-2"])).toEqual(["uuid-1", "uuid-2"]);
    expect(extraerIds([{ texto: "Solicitud X" }])).toEqual([]);
  });

  it("muestra el mensaje de ErrorRespuesta en un 404", async () => {
    const r = await ejecutar(operacionPorId("consultar"), "INC-009", { fetchImpl: async () => respuesta(404, { estado: 404, mensaje: "No existe la solicitud INC-009" }) });
    expect(r.estado).toBe("error");
    expect(r.error).toEqual({ tipo: "http", mensaje: "No existe la solicitud INC-009" });
  });

  it("trata un 500 de Spring como error HTTP, no como 409", async () => {
    const r = await ejecutar(operacionPorId("enviar"), "CAM-002", { fetchImpl: async () => respuesta(500, { status: 500, error: "Internal Server Error", path: "/solicitudes/CAM-002/enviar" }) });
    expect(r.status).toBe(500);
    expect(r.error?.tipo).toBe("http");
    expect(r.error?.mensaje).toContain("Internal Server Error");
  });

  it("distingue un 502 del proxy cuando el servicio no responde", async () => {
    const r = await ejecutar(operacionPorId("avisos"), undefined, { fetchImpl: async () => respuesta(502, "<html>Bad Gateway</html>", "text/html") });
    expect(r.error?.tipo).toBe("proxy");
    expect(r.error?.mensaje).toContain("servicio-notificaciones");
  });

  it("marca la desconexión como error de conexión", async () => {
    const r = await ejecutar(operacionPorId("listar"), undefined, { fetchImpl: async () => { throw new TypeError("Failed to fetch"); } });
    expect(r.error?.tipo).toBe("conexion");
  });

  it("no reintenta un POST tras un tiempo agotado y advierte que pudo guardarse", async () => {
    const fetchImpl = vi.fn((_: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_, rechazar) => {
      init?.signal?.addEventListener("abort", () => rechazar(new DOMException("Abortado", "AbortError")));
    }));
    const r = await ejecutar(operacionPorId("enviar"), "INC-002", { fetchImpl, limiteMs: 20 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(r.error?.tipo).toBe("tiempo");
    expect(r.error?.mensaje).toMatch(/pudo haberse guardado/);
  });
});

import { describe, expect, it } from "vitest";
import { avisoDe, estadosConocidos, permisoEscritura } from "../web/src/api/arka.ts";
import type { RegistroPeticion } from "../web/src/api/cliente.ts";

const registro = (parcial: Partial<RegistroPeticion>): RegistroPeticion => ({
  id: "r", operacionId: "listar", etiqueta: "", servicio: "solicitudes", metodo: "GET", url: "", destinoInterno: "",
  escritura: false, inicio: "2026-10-26T10:00:00.000Z", duracionMs: 1, estado: "correcto", status: 200,
  cuerpoEnviado: null, respuesta: null, textoRespuesta: null, error: null, ids: [], ...parcial,
});

describe("reglas de la UI sobre el estado de una solicitud", () => {
  it("solo permite enviar desde BORRADOR y explica por qué no en otro caso", () => {
    expect(permisoEscritura("enviar", { id: "INC-001", tipo: "Incidente", estado: "BORRADOR" }).permitido).toBe(true);
    const p = permisoEscritura("enviar", { id: "CAM-002", tipo: "Cambio", estado: "ENVIADA" });
    expect(p.permitido).toBe(false);
    expect(p.motivo).toContain("409");
  });

  it("solo permite aprobar o rechazar una solicitud ENVIADA", () => {
    expect(permisoEscritura("aprobar", { id: "X", tipo: "t", estado: "ENVIADA" }).permitido).toBe(true);
    expect(permisoEscritura("rechazar", { id: "X", tipo: "t", estado: "BORRADOR" }).permitido).toBe(false);
  });

  it("no permite escribir sobre una solicitud cuyo estado no se conoce", () => {
    expect(permisoEscritura("enviar", undefined).permitido).toBe(false);
    expect(permisoEscritura("crear", undefined).permitido).toBe(true);
  });

  it("toma el estado más reciente observado", () => {
    const mapa = estadosConocidos([
      registro({ operacionId: "enviar", respuesta: { id: "INC-002", tipo: "Incidencia", estado: "ENVIADA" } }),
      registro({ respuesta: [{ id: "INC-002", tipo: "Incidencia", estado: "BORRADOR" }, { id: "INC-001", tipo: "Incidente", estado: "BORRADOR" }] }),
    ]);
    expect(mapa.get("INC-002")?.estado).toBe("ENVIADA");
    expect(mapa.get("INC-001")?.estado).toBe("BORRADOR");
  });

  it("encuentra el aviso de una solicitud por el formato que arma ServicioDeNotificaciones", () => {
    const avisos = [{ texto: "Solicitud CAM-002 (SolicitudEnviada) enviada" }, { texto: "Solicitud INC-002 (SolicitudEnviada) enviada" }];
    expect(avisoDe(avisos, "INC-002")?.texto).toContain("INC-002");
    expect(avisoDe(avisos, "INC-00")).toBeUndefined();
  });
});

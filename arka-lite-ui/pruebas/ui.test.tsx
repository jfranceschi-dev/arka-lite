import { describe, expect, it } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../web/src/App.tsx";
import { crearApiFalsa } from "./simulador.ts";

function montar(hash = "") {
  window.location.hash = hash;
  const api = crearApiFalsa();
  const utilidades = render(<App cliente={{ fetchImpl: api.fetch as unknown as typeof fetch }} />);
  return { api, ...utilidades, usuario: userEvent.setup() };
}

const llamadas = (api: ReturnType<typeof crearApiFalsa>, metodo: string) =>
  api.fetch.mock.calls.filter(([, init]) => (init?.method ?? "GET") === metodo).map(([url]) => String(url));

const dialogo = () => screen.findByRole("dialog");

describe("Solicitudes", () => {
  it("abre por defecto, valida los dos servicios y lista las solicitudes en la tabla", async () => {
    const { api } = montar();
    expect(screen.getByRole("heading", { level: 1, name: "Solicitudes" })).toBeInTheDocument();
    expect(await screen.findByText("2 de 2 servicios UP")).toBeInTheDocument();
    const tabla = screen.getByRole("table", { name: "Tabla de solicitudes" });
    await waitFor(() => expect(within(tabla).getByText("INC-001")).toBeInTheDocument());
    expect(within(tabla).getByText("CAM-002")).toBeInTheDocument();
    expect(llamadas(api, "GET")).toEqual(expect.arrayContaining(["/api/solicitudes", "/api/eventos/salientes", "/api/eventos/procesados", "/api/notificaciones", "/api/salud/solicitudes", "/api/salud/notificaciones"]));
  });

  it("crea una solicitud por POST, avisa y la marca como propia", async () => {
    const { api, usuario } = montar();
    await screen.findByText("INC-001");
    await usuario.type(screen.getByRole("textbox", { name: "Identificador" }), "sol-100");
    await usuario.click(screen.getByRole("button", { name: "Crear solicitud" }));
    expect(await screen.findByText("SOL-100 quedó en BORRADOR.")).toBeInTheDocument();
    const post = api.fetch.mock.calls.find(([url, init]) => String(url) === "/api/solicitudes" && init?.method === "POST")!;
    expect(post[1]!.body).toBe('{"id":"SOL-100","tipo":"Incidencia"}');
    const tabla = screen.getByRole("table", { name: "Tabla de solicitudes" });
    await waitFor(() => expect(within(tabla).getByText("SOL-100")).toBeInTheDocument());
    expect(within(tabla).getByText("tuya")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /Creadas aquí/ }));
    await waitFor(() => expect(within(tabla).queryByText("INC-001")).not.toBeInTheDocument());
  });

  it("explica con un diálogo que un identificador ya existe", async () => {
    const { usuario } = montar();
    await screen.findByText("INC-001");
    await usuario.type(screen.getByRole("textbox", { name: "Identificador" }), "INC-001");
    await usuario.click(screen.getByRole("button", { name: "Crear solicitud" }));
    const d = await dialogo();
    expect(d).toHaveTextContent("Ese identificador ya existe");
    expect(d).toHaveTextContent("409 · Ya existe la solicitud INC-001");
  });

  it("pide confirmación antes de enviar y no envía si se cancela", async () => {
    const { api, usuario } = montar();
    await usuario.click(await screen.findByRole("button", { name: "Enviar INC-001" }));
    expect(await dialogo()).toHaveTextContent("¿Enviar INC-001?");
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(llamadas(api, "POST")).toEqual([]);

    await usuario.click(screen.getByRole("button", { name: "Enviar INC-001" }));
    await usuario.click(await screen.findByRole("button", { name: "Sí, enviar" }));
    await waitFor(() => expect(llamadas(api, "POST")).toEqual(["/api/solicitudes/INC-001/enviar"]));
    expect(await screen.findByText("INC-001 enviada")).toBeInTheDocument();
  });
});

describe("Enviadas", () => {
  it("muestra el recorrido del evento y comprueba que reentregar no duplica el aviso", async () => {
    const { api, usuario } = montar("#/enviadas");
    expect(screen.getByRole("heading", { level: 1, name: "Enviadas" })).toBeInTheDocument();
    const tabla = screen.getByRole("table", { name: "Tabla de solicitudes enviadas" });
    await waitFor(() => expect(within(tabla).getByText("CAM-002")).toBeInTheDocument());
    await usuario.click(within(tabla).getByRole("button", { name: "Reentregar el evento de CAM-002" }));
    expect(await dialogo()).toHaveTextContent("¿Reentregar el evento de CAM-002?");
    await usuario.click(screen.getByRole("button", { name: "Sí, reentregar" }));
    expect(await screen.findByText("El aviso no se duplicó")).toBeInTheDocument();
    expect(llamadas(api, "POST")).toEqual(["/api/eventos/solicitud-enviada"]);
    expect(screen.getByText("Avisos duplicados").parentElement).toHaveTextContent("0");
  });
});

describe("Salud", () => {
  it("valida los dos servicios y enlaza los contratos Swagger y Grafana", async () => {
    const { usuario } = montar("#/salud");
    const solicitudes = screen.getByRole("region", { name: "Solicitudes" });
    await waitFor(() => expect(within(solicitudes).getByText("UP")).toBeInTheDocument());
    expect(within(solicitudes).getByText("PostgreSQL · UP")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Validar servicios" }));
    expect(await screen.findByText("Validación terminada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contrato de solicitudes/ })).toHaveAttribute("href", expect.stringContaining(":8080/swagger-ui/index.html"));
    expect(screen.getByRole("link", { name: /Contrato de notificaciones/ })).toHaveAttribute("href", expect.stringContaining(":8081/swagger-ui/index.html"));
    expect(screen.getByRole("link", { name: /^Grafana/ })).toHaveAttribute("href", expect.stringContaining(":3000"));
  });
});

describe("Ayuda", () => {
  it("explica el envío paso a paso y las tarjetas siguen al diagrama", async () => {
    const { usuario } = montar("#/ayuda/enviar");
    expect(screen.getByRole("heading", { level: 1, name: "¿Qué pasa cuando envío una solicitud?" })).toBeInTheDocument();
    const pasos = screen.getByRole("list", { name: "Pasos" });
    expect(within(pasos).getAllByRole("button")).toHaveLength(8);
    await usuario.click(within(pasos).getByRole("button", { name: /relevador busca eventos pendientes/ }));
    expect(within(pasos).getByRole("button", { name: /relevador busca eventos pendientes/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Paso 4 de 8")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Paso siguiente" }));
    expect(within(pasos).getByRole("button", { name: /Se lo entrega al servicio de notificaciones/ })).toHaveAttribute("aria-current", "step");
  });

  it("agrupa los temas y deja el detalle técnico al final", () => {
    montar("#/ayuda");
    const temas = screen.getByRole("navigation", { name: "Temas de ayuda" });
    expect(within(temas).getByText("PARA USAR LA APP")).toBeInTheDocument();
    expect(within(temas).getByText("PARA EL EQUIPO TÉCNICO")).toBeInTheDocument();
    expect(within(temas).getByRole("link", { name: "Contratos y peticiones" })).toHaveAttribute("href", "#/ayuda/detalle");
  });

  it("muestra los contratos de la API en el detalle técnico", async () => {
    montar("#/ayuda/detalle");
    const tabla = screen.getByRole("table", { name: "Contratos de la API" });
    await waitFor(() => expect(within(tabla).getByText("POST /api/solicitudes")).toBeInTheDocument());
  });
});

describe("Tema", () => {
  it("cambia los colores de la plantilla y los recuerda", async () => {
    const { usuario } = montar();
    await usuario.click(screen.getByRole("button", { name: "Personalizar colores" }));
    await usuario.click(within(screen.getByRole("dialog", { name: "Personalizar colores" })).getByRole("button", { name: /Grafito y azul/ }));
    expect(document.documentElement.style.getPropertyValue("--tema-pri")).toBe("#1F2937");
    expect(JSON.parse(localStorage.getItem("arka-lite-ui:tema")!).principal).toBe("#1F2937");
    await usuario.click(screen.getByRole("button", { name: "TGS" }));
    expect(document.documentElement.style.getPropertyValue("--tema-pri")).toBe("#0B2350");
  });
});

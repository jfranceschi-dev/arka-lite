import { describe, expect, it } from "vitest";
import { act, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../web/src/App.tsx";
import { crearApiFalsa } from "./simulador.ts";

function montar(hash = "#/entender") {
  window.location.hash = hash;
  const api = crearApiFalsa();
  const utilidades = render(<App cliente={{ fetchImpl: api.fetch as unknown as typeof fetch }} />);
  return { api, ...utilidades, usuario: userEvent.setup() };
}

const llamadas = (api: ReturnType<typeof crearApiFalsa>, metodo: string) =>
  api.fetch.mock.calls.filter(([, init]) => (init?.method ?? "GET") === metodo).map(([url]) => String(url));

describe("vista Entender", () => {
  it("muestra la portada, el guion y avanza con el teclado", async () => {
    const { usuario } = montar();
    expect(screen.getByRole("heading", { level: 1, name: "ARKA-Lite: una solicitud de punta a punta" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Guion del expositor" })).toHaveTextContent("Buenos días");
    await usuario.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "El caso conductor: INC-002" })).toBeInTheDocument());
    expect(screen.getByText(/Diapositiva 2 de/)).toBeInTheDocument();
  });

  it("separa las instrucciones del texto para decir", () => {
    montar("#/entender/s03-demo");
    const guion = screen.getByRole("complementary", { name: "Guion del expositor" });
    expect(within(guion).getByText(/Solo para quien expone, no se dice/)).toBeInTheDocument();
    expect(within(guion).getByRole("link", { name: /Probar esta acción/ })).toHaveAttribute("href", "#/probar/enviar");
  });

  it("muestra el código solo en el recorrido técnico", async () => {
    const { usuario } = montar("#/entender/s01-record");
    const codigo = (_: string, el: Element | null) => el?.tagName === "CODE" && !!el.textContent?.includes("public record Solicitud");
    expect(screen.queryByText(codigo)).not.toBeInTheDocument();
    expect(screen.getByText(/aparece en el recorrido técnico/)).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Técnico" }));
    await waitFor(() => expect(screen.getByText(codigo)).toBeInTheDocument());
  });

  it("reproduce el diagrama sin hacer ninguna petición", async () => {
    const { api, usuario } = montar("#/entender/s03-envio");
    expect(screen.getByText(/Explicación animada · basada en el código/)).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Paso siguiente" }));
    await usuario.click(screen.getByRole("button", { name: "Reproducir" }));
    await usuario.click(screen.getByRole("button", { name: "Pausar" }));
    await usuario.click(screen.getByRole("button", { name: /Reiniciar/ }));
    expect(screen.getByText("1/5")).toBeInTheDocument();
    expect(api.fetch).not.toHaveBeenCalled();
  });

  it("permite elegir un nodo y explica qué hace y qué archivo lo implementa", async () => {
    const { usuario } = montar("#/entender/s02-consulta");
    await usuario.click(screen.getByRole("button", { name: /^RepositorioJpa/ }));
    const inspector = screen.getByRole("region", { name: "Nodo seleccionado" });
    expect(inspector).toHaveTextContent("Implementa el contrato con Spring Data JPA");
    expect(inspector).toHaveTextContent("RepositorioJpa.java");
  });

  it("desactiva el movimiento", async () => {
    const { usuario } = montar("#/entender/s03-envio");
    await usuario.click(screen.getByRole("switch", { name: /Sin movimiento/ }));
    expect(document.documentElement.dataset.movimiento).toBe("reducido");
  });

  it("abre la vista general con G y la cierra con Escape", async () => {
    const { usuario } = montar();
    await usuario.keyboard("g");
    expect(screen.getByRole("dialog", { name: "Vista general" })).toBeInTheDocument();
    await usuario.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("vista Probar", () => {
  it("lista solicitudes y registra la petición en el historial", async () => {
    const { usuario } = montar("#/probar");
    await usuario.click(screen.getByRole("button", { name: /Listar solicitudes/ }));
    const listado = await screen.findByRole("region", { name: "Solicitudes listadas" });
    expect(within(listado).getByText("INC-001")).toBeInTheDocument();
    expect(within(listado).getByText("CAM-002")).toBeInTheDocument();
    const historial = screen.getByRole("region", { name: "Historial de peticiones" });
    expect(within(historial).getByText("GET /api/solicitudes")).toBeInTheDocument();
  });

  it("no ejecuta una escritura sin confirmación", async () => {
    const { api, usuario } = montar("#/probar");
    await usuario.click(screen.getByRole("button", { name: /Crear INC-002/ }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Si INC-002 ya existe, vuelve a quedar en BORRADOR");
    expect(llamadas(api, "POST")).toEqual([]);
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(llamadas(api, "POST")).toEqual([]);
  });

  it("recorre crear, enviar y seguir el aviso de INC-002", async () => {
    const { api, usuario } = montar("#/probar");
    await usuario.click(screen.getByRole("button", { name: /Crear INC-002/ }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar" }));
    await screen.findByText(/INC-002 quedó en BORRADOR/);

    await usuario.click(screen.getByRole("button", { name: /Enviar INC-002/ }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar" }));
    await screen.findByText(/El aviso todavía no existe/);
    expect(llamadas(api, "POST")).toEqual(["/api/solicitudes/crear", "/api/solicitudes/INC-002/enviar"]);

    const seguimiento = screen.getByRole("region", { name: "Seguimiento del envío" });
    expect(seguimiento).toHaveTextContent("sin eventoId");
    expect(within(seguimiento).getAllByText(/Todavía no observado/)).toHaveLength(2);

    await usuario.click(screen.getByRole("button", { name: "Consultar avisos · GET" }));
    await waitFor(() => expect(screen.getByRole("region", { name: "Seguimiento del envío" })).toHaveTextContent("Aviso observado: “Solicitud INC-002 (SolicitudEnviada) enviada”"));

    // Ya enviada: la UI explica por qué no se puede volver a enviar.
    expect(screen.getByRole("button", { name: /Enviar INC-002/ })).toBeDisabled();
    expect(screen.getByText(/INC-002 está ENVIADA. Solo se envía desde BORRADOR/)).toBeInTheDocument();
  });

  it("muestra un 404 con el mensaje de la API", async () => {
    const { usuario } = montar("#/probar");
    const campo = screen.getByRole("textbox", { name: /Solicitud seleccionada/ });
    await usuario.clear(campo);
    await usuario.type(campo, "INC-009");
    await usuario.click(screen.getByRole("button", { name: /Consultar INC-009/ }));
    expect(await screen.findByText("No existe la solicitud INC-009")).toBeInTheDocument();
  });

  it("explica la desconexión del proxy", async () => {
    window.location.hash = "#/probar";
    const fetchImpl = (async () => { throw new TypeError("Failed to fetch"); }) as typeof fetch;
    const usuario = userEvent.setup();
    render(<App cliente={{ fetchImpl }} />);
    await usuario.click(screen.getByRole("button", { name: /Listar solicitudes/ }));
    expect(await screen.findByText(/no pudo hablar con el proxy \/api/)).toBeInTheDocument();
  });

  it("filtra el historial por resultado", async () => {
    const { usuario } = montar("#/probar");
    await usuario.click(screen.getByRole("button", { name: /Listar solicitudes/ }));
    await screen.findByRole("region", { name: "Solicitudes listadas" });
    await act(async () => { await usuario.selectOptions(screen.getByRole("combobox", { name: "Resultado" }), "error"); });
    expect(screen.getByText("Ninguna petición coincide con los filtros.")).toBeInTheDocument();
  });
});

describe("vista Detalle técnico", () => {
  it("muestra los contratos verificados aunque no haya peticiones", () => {
    montar("#/detalle");
    expect(screen.getByRole("heading", { level: 1, name: "Contratos, peticiones y configuración" })).toBeInTheDocument();
    expect(screen.getByText(/201 y 409 no están implementados/)).toBeInTheDocument();
  });
});

// Graba los videos de la demostración con la UI que usa la variante
// «ejecutivo con videos», para presentar cuando no se puede hacer en vivo.
// Requiere el sistema arriba (docker compose up --build -d) y Edge o Chrome.
//   npm run videos                 → los dos videos
//   npm run videos -- caida        → solo uno: recorrido o caida
// Detiene y vuelve a iniciar servicio-notificaciones a propósito: es la caída
// que muestra el video. Al terminar, regenerar con npm run todo.
//
// Cómo graba: Edge sin ventana abre la UI y manda cada cuadro que pinta
// (Page.startScreencast); el guion mueve un cursor visible, hace clics,
// escribe y muestra los rótulos de contenido/videos.ts. Después, otra página
// del mismo Edge codifica los cuadros en un MP4 H.264 con WebCodecs. Los
// tramos de espera, como el arranque de notificaciones, se aceleran.
import { execFile, execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { chromium, type Browser, type BrowserContext, type CDPSession, type Locator, type Page } from "playwright-core";
import { DIR_VIDEOS, ENTREGABLES } from "../entregables.ts";
import { grabados, MANIFIESTO, VIDEOS, type Grabado, type NombreVideo, type Video } from "../contenido/videos.ts";

const UI = process.env.ARKA_UI ?? "http://localhost:8088";
const RAIZ = join(ENTREGABLES, "..", "..");
const GRABADORA = join(ENTREGABLES, "capturas", "grabadora");
// 1440×810 puntos a escala 4/3: cuadros de 1920×1080.
const VISTA = { width: 1440, height: 810 };
const ESCALA = 4 / 3;
const ANCHO = 1920;
const ALTO = 1080;
const FPS = 30;
// Cuantizador constante: las pantallas quietas casi no pesan y el texto se lee
// nítido. El bitrate es el respaldo si el codificador no admite cuantizador.
const CALIDAD = { quantizer: 27, bitrate: 2_500_000 };

const dormir = (ms: number) => new Promise((listo) => setTimeout(listo, ms));
// Sin bloquear: mientras corre el comando siguen llegando cuadros.
const docker = (args: string[]) => promisify(execFile)("docker", args, { cwd: RAIZ });

interface Cuadro {
  t: number;
  datos: Buffer;
}

// Una grabación: los cuadros que manda el navegador, con su hora, y los
// tramos acelerados.
class Grabacion {
  cuadros: Cuadro[] = [];
  tramos: { desde: number; factor: number }[] = [];
  fin = 0;
  // Captura del momento clave: la imagen que se ve antes de reproducir.
  imagenPortada?: Buffer;
  private mouse = { x: VISTA.width / 2, y: VISTA.height / 2 };
  private cdp!: CDPSession;
  readonly p: Page;
  readonly video: Video;

  constructor(p: Page, video: Video) {
    this.p = p;
    this.video = video;
  }

  async empezar() {
    this.cdp = await this.p.context().newCDPSession(this.p);
    this.cdp.on("Page.screencastFrame", (f) => {
      this.cuadros.push({ t: Date.now(), datos: Buffer.from(f.data, "base64") });
      void this.cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    });
    await this.cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: ANCHO, maxHeight: ALTO, everyNthFrame: 1 });
    this.tramos.push({ desde: Date.now(), factor: 1 });
    await this.p.mouse.move(this.mouse.x, this.mouse.y);
  }

  async terminar() {
    await dormir(400);
    this.fin = Date.now();
    await this.cdp.send("Page.stopScreencast");
    await this.cdp.detach();
  }

  private llamar(metodo: string, ...args: unknown[]) {
    return this.p.evaluate(([m, a]) => (globalThis as any).__grabadora[m as string](...(a as unknown[])), [metodo, args] as const);
  }

  async portada() {
    await this.llamar("portada", "ARKA-LITE · EQUIPO ARKA-LITOS", this.video.titulo, this.video.subtitulo);
    await dormir(3200);
    await this.llamar("quitarPortada");
    await dormir(700);
  }

  async rotulo(numero: number) {
    await this.llamar("rotulo", numero, this.video.pasos[numero - 1]);
    await dormir(1300);
  }

  // Muestra el comando en la terminal de la capa y lo ejecuta de verdad.
  async comando(args: string[], salida: string) {
    await this.llamar("terminal", ["docker", ...args].join(" "));
    await dormir(300);
    this.acelerar(4, "×4 · acelerado");
    await docker(args);
    this.acelerar(1);
    await this.llamar("salida", salida);
    await dormir(1600);
  }

  quitarTerminal() {
    return this.llamar("quitarTerminal");
  }

  // Desde ahora el video corre `factor` veces más rápido; el aviso lo dice.
  acelerar(factor: number, aviso?: string) {
    this.tramos.push({ desde: Date.now(), factor });
    void this.llamar("acelerado", factor > 1 ? (aviso ?? `×${factor} · acelerado`) : "");
  }

  async marcarPortada() {
    this.imagenPortada = await this.p.screenshot();
  }

  // El cursor viaja con suavidad hasta el centro del elemento.
  async mover(objetivo: Locator) {
    await objetivo.scrollIntoViewIfNeeded();
    const caja = await objetivo.boundingBox();
    if (!caja) throw new Error(`No se ve el elemento: ${objetivo}`);
    const destino = { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
    const desde = { ...this.mouse };
    const distancia = Math.hypot(destino.x - desde.x, destino.y - desde.y);
    const pasos = Math.max(12, Math.min(40, Math.round(distancia / 22)));
    for (let i = 1; i <= pasos; i++) {
      const k = i / pasos;
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      await this.p.mouse.move(desde.x + (destino.x - desde.x) * e, desde.y + (destino.y - desde.y) * e);
      await dormir(16);
    }
    this.mouse = destino;
  }

  async clic(objetivo: Locator, despues = 700) {
    await objetivo.waitFor({ state: "visible", timeout: 20_000 });
    await this.mover(objetivo);
    await dormir(250);
    await this.p.mouse.down();
    await dormir(90);
    await this.p.mouse.up();
    await dormir(despues);
  }

  async escribir(texto: string) {
    await this.p.keyboard.type(texto, { delay: 110 });
    await dormir(350);
  }

  pestana(vista: string) {
    return this.p.locator(`nav[aria-label="Principal"] a[href="#/${vista}"]`);
  }

  boton(nombre: string) {
    return this.p.getByRole("button", { name: nombre, exact: true });
  }

  confirmar() {
    return this.clic(this.p.locator(".swal2-confirm"), 900);
  }

  // Segundo del video que corresponde a una hora real, según los tramos.
  aVideo(t: number): number {
    let v = 0;
    for (let i = 0; i < this.tramos.length; i++) {
      const a = this.tramos[i].desde;
      const b = this.tramos[i + 1]?.desde ?? Infinity;
      if (t <= a) break;
      v += (Math.min(t, b) - a) / this.tramos[i].factor;
    }
    return v / 1000;
  }
}

// Un identificador que todavía no existe, para no chocar con un 409.
async function idLibre(): Promise<string> {
  const existentes = new Set(((await (await fetch(`${UI}/api/solicitudes`)).json()) as { id: string }[]).map((s) => s.id));
  for (let n = 201; ; n++) if (!existentes.has(`SOL-${n}`)) return `SOL-${n}`;
}

const fila = (g: Grabacion, id: string) => g.p.locator("tr", { has: g.p.locator(".celda-id", { hasText: new RegExp(`^${id}$`) }) });

// Los dos servicios arriba: crear, enviar, ver el aviso en Enviadas, la salud
// en verde y un diagrama de Ayuda.
async function recorrido(g: Grabacion) {
  const id = await idLibre();
  await g.portada();

  await g.rotulo(1);
  await g.clic(g.p.locator("#nuevo-id"), 200);
  await g.escribir(id);
  await g.clic(g.p.locator(".ts-control"), 300);
  await g.escribir("Cam");
  await g.p.keyboard.press("Enter");
  await dormir(500);
  await g.clic(g.boton("Crear solicitud"), 2600);

  await g.rotulo(2);
  await g.clic(fila(g, id).locator('button[data-accion="enviar"]'));
  await g.confirmar();

  // Sin pausa: el relevador entrega en menos de 5 segundos y se alcanza a
  // ver el evento en camino.
  await g.rotulo(3);
  await g.clic(g.pestana("enviadas"), 300);
  await g.mover(fila(g, id).locator(".recorrido"));
  await fila(g, id).locator('button[data-accion="reentregar"]').waitFor({ timeout: 60_000 });
  await g.mover(fila(g, id).locator(".recorrido"));
  await g.marcarPortada();
  await dormir(3500);

  await g.rotulo(4);
  await g.clic(g.pestana("salud"), 600);
  await g.clic(g.boton("Validar servicios"), 3200);

  await g.rotulo(5);
  await g.clic(g.pestana("ayuda"), 600);
  await g.clic(g.p.locator('a[href="#/ayuda/enviar"]'), 900);
  await g.clic(g.boton("Reproducir"), 7500);
}

// Notificaciones se cae: enviar igual responde, el evento espera, y al volver
// llega un solo aviso; reentregarlo no lo duplica.
async function caida(g: Grabacion) {
  const id = await idLibre();
  await g.portada();
  try {
    await g.rotulo(1);
    await g.comando(["compose", "stop", "servicio-notificaciones"], "✔ Container arka-lite-servicio-notificaciones-1  Stopped");
    await g.quitarTerminal();
    await g.clic(g.boton("Validar servicios"), 400);
    await g.p.getByLabel("Notificaciones", { exact: true }).getByText(/DOWN|Sin respuesta/).waitFor({ timeout: 30_000 });
    await dormir(2600);

    await g.rotulo(2);
    await g.clic(g.pestana("solicitudes"), 600);
    await g.clic(g.p.locator("#nuevo-id"), 200);
    await g.escribir(id);
    await g.clic(g.boton("Crear solicitud"), 2200);
    await g.clic(fila(g, id).locator('button[data-accion="enviar"]'));
    await g.confirmar();
    await dormir(2400);

    await g.rotulo(3);
    await g.clic(g.pestana("enviadas"), 900);
    await g.p.getByText("Notificaciones no responde.").waitFor({ timeout: 30_000 });
    await g.mover(g.p.getByText("Notificaciones no responde."));
    await g.marcarPortada();
    await dormir(4500);
    await g.mover(fila(g, id).locator(".recorrido"));
    await dormir(3000);

    await g.rotulo(4);
    await g.comando(["compose", "start", "servicio-notificaciones"], "✔ Container arka-lite-servicio-notificaciones-1  Started");
    g.acelerar(4, "×4 · esperando que notificaciones arranque y el relevador entregue");
    await fila(g, id).locator('button[data-accion="reentregar"]').waitFor({ timeout: 240_000 });
    g.acelerar(1);
    await g.quitarTerminal();
    await dormir(800);

    await g.rotulo(5);
    await g.mover(fila(g, id).locator("td").nth(3));
    await dormir(2500);
    await g.mover(g.p.getByText("Avisos duplicados"));
    await dormir(2500);

    await g.rotulo(6);
    await g.clic(fila(g, id).locator('button[data-accion="reentregar"]'));
    await g.confirmar();
    await g.p.getByText("El aviso no se duplicó").waitFor({ timeout: 30_000 });
    await dormir(3800);
    await g.clic(g.boton("Entendido"), 2500);
  } finally {
    execFileSync("docker", ["compose", "start", "servicio-notificaciones"], { cwd: RAIZ, stdio: "ignore" });
  }
}

const GUIONES: Record<NombreVideo, { inicio: string; guion: (g: Grabacion) => Promise<void> }> = {
  recorrido: { inicio: "solicitudes", guion: recorrido },
  caida: { inicio: "salud", guion: caida },
};

async function abrirNavegador(): Promise<Browser> {
  for (const channel of ["msedge", "chrome"]) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      // Se prueba el siguiente.
    }
  }
  throw new Error("No se encontró Edge ni Chrome.");
}

async function grabar(contexto: BrowserContext, nombre: NombreVideo): Promise<Grabacion> {
  const p = await contexto.newPage();
  await p.goto(`${UI}/#/${GUIONES[nombre].inicio}`);
  await p.getByText("2 de 2 servicios UP").waitFor({ timeout: 60_000 });
  await dormir(1500);
  const g = new Grabacion(p, VIDEOS[nombre]);
  await g.empezar();
  await GUIONES[nombre].guion(g);
  await g.terminar();
  await p.close();
  return g;
}

// Codifica la grabación en otra página del mismo navegador, que pide los
// cuadros y la biblioteca a rutas que responde este script.
async function codificar(navegador: Browser, g: Grabacion): Promise<{ mp4: Buffer; segundos: number }> {
  const contexto = await navegador.newContext();
  const p = await contexto.newPage();
  const archivos: Record<string, string> = {
    "/mediabunny.mjs": join(ENTREGABLES, "node_modules", "mediabunny", "dist", "bundles", "mediabunny.min.mjs"),
    "/codificar.mjs": join(GRABADORA, "codificar.js"),
  };
  await p.route("https://grabadora.arka/**", (r) => {
    const ruta = new URL(r.request().url()).pathname;
    if (ruta.startsWith("/cuadro/")) return r.fulfill({ body: g.cuadros[Number(ruta.slice(8))].datos, contentType: "image/jpeg" });
    if (archivos[ruta]) return r.fulfill({ body: readFileSync(archivos[ruta]), contentType: "text/javascript" });
    return r.fulfill({ body: "<!doctype html><title>Codificador</title>", contentType: "text/html" });
  });
  await p.goto("https://grabadora.arka/");
  const cambios = g.cuadros.map((c, i) => ({ cuadro: i, desde: Math.max(0, g.aVideo(c.t)) }));
  cambios[0].desde = 0;
  const total = g.aVideo(g.fin);
  const base64 = await p.evaluate(async (args) => (await import("/codificar.mjs" as string)).codificar(args), { ancho: ANCHO, alto: ALTO, fps: FPS, calidad: CALIDAD, total, cambios });
  await contexto.close();
  return { mp4: Buffer.from(base64, "base64"), segundos: Math.round(total * 10) / 10 };
}

const pedido = process.argv[2] as NombreVideo | undefined;
const nombres = (pedido && pedido in VIDEOS ? [pedido] : Object.keys(VIDEOS)) as NombreVideo[];
mkdirSync(DIR_VIDEOS, { recursive: true });

const navegador = await abrirNavegador();
const contexto = await navegador.newContext({ viewport: VISTA, deviceScaleFactor: ESCALA, locale: "es-PA", timezoneId: "America/Panama" });
await contexto.addInitScript({ path: join(GRABADORA, "superposicion.js") });
const manifiesto: Record<string, Grabado> = grabados();
try {
  for (const nombre of nombres) {
    const video = VIDEOS[nombre];
    console.log(`Grabando ${video.archivo}…`);
    const g = await grabar(contexto, nombre);
    console.log(`  ${g.cuadros.length} cuadros; codificando…`);
    const { mp4, segundos } = await codificar(navegador, g);
    writeFileSync(join(DIR_VIDEOS, video.archivo), mp4);
    writeFileSync(join(DIR_VIDEOS, video.portada), g.imagenPortada ?? g.cuadros[g.cuadros.length - 1].datos);
    manifiesto[video.archivo] = { segundos, grabado: new Date().toISOString().slice(0, 10) };
    writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + "\n");
    console.log(`  ${video.archivo}: ${segundos} s, ${(mp4.length / 1e6).toFixed(1)} MB`);
  }
} finally {
  await navegador.close();
}

// Capa que se dibuja encima de la UI solo mientras se graba un video: el
// cursor (la grabación no lo captura), los rótulos numerados, una terminal
// con los comandos que se escriben fuera del navegador, la portada y el aviso
// de tramo acelerado. grabar-videos.ts la inyecta en la página; la UI no
// cambia. Vive en un shadow root para no mezclarse con los estilos de la UI.
(() => {
  const MARINO = "#0B1F3A";
  const CIAN = "#2BA6CB";
  const CIAN_CLARO = "#7FD3EA";

  const estilos = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: "Segoe UI", system-ui, sans-serif; }
    .capa { position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; }
    .cursor { position: absolute; left: 0; top: 0; width: 26px; height: 26px; transform: translate(-200px, -200px); filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
    .onda { position: absolute; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%; border: 3px solid ${CIAN}; background: rgba(43,166,203,.18); animation: onda .55s ease-out forwards; }
    @keyframes onda { from { transform: scale(.35); opacity: 1; } to { transform: scale(1.35); opacity: 0; } }
    .rotulo { position: absolute; left: 50%; bottom: 26px; width: max-content; max-width: 1240px; display: flex; align-items: center; gap: 16px; padding: 14px 26px 14px 14px;
      background: rgba(11,31,58,.95); color: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(11,31,58,.35);
      transform: translate(-50%, 20px); opacity: 0; transition: opacity .35s, transform .35s; }
    .rotulo.visible { transform: translate(-50%, 0); opacity: 1; }
    .rotulo b { flex: none; width: 38px; height: 38px; border-radius: 50%; background: ${CIAN}; color: ${MARINO}; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; }
    .rotulo span { font-size: 22px; font-weight: 600; line-height: 1.25; }
    .terminal { position: absolute; left: 28px; bottom: 112px; width: 640px; border-radius: 12px; overflow: hidden; background: #0D1526; box-shadow: 0 14px 34px rgba(0,0,0,.4);
      opacity: 0; transform: translateY(12px); transition: opacity .3s, transform .3s; }
    .terminal.visible { opacity: 1; transform: none; }
    .barra { display: flex; align-items: center; gap: 7px; padding: 9px 12px; background: #1B2740; color: #9FBEE0; font-size: 13px; font-weight: 600; }
    .barra i { width: 11px; height: 11px; border-radius: 50%; background: #3A5A8C; }
    .lineas { padding: 14px 16px 16px; font-family: Consolas, "Cascadia Mono", monospace; font-size: 17px; line-height: 1.5; color: #E8EDF8; white-space: pre-wrap; }
    .lineas .prompt { color: ${CIAN_CLARO}; }
    .lineas .salida { color: #8FD9B6; font-family: Consolas, "Cascadia Mono", monospace; }
    .acelerado { position: absolute; top: 86px; left: 50%; transform: translateX(-50%); padding: 7px 16px; border-radius: 999px; background: #FBE7BD; color: #8A4B06; font-size: 16px; font-weight: 800;
      box-shadow: 0 4px 14px rgba(0,0,0,.15); opacity: 0; transition: opacity .3s; }
    .acelerado.visible { opacity: 1; }
    .portada { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 120px; gap: 18px;
      background: linear-gradient(135deg, ${MARINO} 0%, #0B2350 60%, #123A6B 100%); color: #fff; opacity: 0; transition: opacity .5s; }
    .portada.visible { opacity: 1; }
    .portada small { color: ${CIAN_CLARO}; font-size: 18px; font-weight: 700; letter-spacing: .14em; }
    .portada h1 { margin: 0; font-size: 58px; line-height: 1.1; font-weight: 800; }
    .portada p { margin: 0; font-size: 26px; color: #CFE0F2; max-width: 980px; line-height: 1.35; }
    .portada hr { width: 90px; height: 6px; border: 0; border-radius: 3px; background: ${CIAN}; margin: 6px 0 0; }
  `;

  const flecha = `<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2 L4 20 L9 15.5 L12.5 22.5 L15.5 21 L12 14 L19 14 Z" fill="#fff" stroke="#0B1F3A" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

  function montar() {
    const anfitrion = document.createElement("div");
    anfitrion.id = "grabadora-arka";
    const raiz = anfitrion.attachShadow({ mode: "open" });
    raiz.innerHTML = `<style>${estilos}</style><div class="capa">
      <div class="portada"><small></small><h1></h1><hr><p></p></div>
      <div class="terminal"><div class="barra"><i></i><i></i><i></i>&nbsp;Terminal</div><div class="lineas"></div></div>
      <div class="acelerado"></div>
      <div class="rotulo"><b></b><span></span></div>
      <div class="cursor">${flecha}</div>
    </div>`;
    document.documentElement.appendChild(anfitrion);
    const $ = (s) => raiz.querySelector(s);
    const capa = $(".capa");
    const cursor = $(".cursor");

    let x = -200;
    let y = -200;
    document.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      cursor.style.transform = `translate(${x - 4}px, ${y - 2}px)`;
    }, true);
    document.addEventListener("mousedown", () => {
      const onda = document.createElement("div");
      onda.className = "onda";
      onda.style.left = `${x}px`;
      onda.style.top = `${y}px`;
      capa.insertBefore(onda, cursor);
      setTimeout(() => onda.remove(), 700);
    }, true);

    const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms));

    window.__grabadora = {
      portada(etiqueta, titulo, subtitulo) {
        $(".portada small").textContent = etiqueta;
        $(".portada h1").textContent = titulo;
        $(".portada p").textContent = subtitulo;
        $(".portada").classList.add("visible");
      },
      quitarPortada() {
        $(".portada").classList.remove("visible");
      },
      async rotulo(numero, texto) {
        const r = $(".rotulo");
        if (r.classList.contains("visible")) {
          r.classList.remove("visible");
          await esperar(320);
        }
        $(".rotulo b").textContent = String(numero);
        $(".rotulo span").textContent = texto;
        r.style.display = "flex";
        r.classList.add("visible");
      },
      quitarRotulo() {
        $(".rotulo").classList.remove("visible");
      },
      // Escribe el comando letra por letra; la salida se agrega después.
      async terminal(comando) {
        const lineas = $(".lineas");
        lineas.innerHTML = '<span class="prompt">PS arka-lite&gt; </span><span class="cmd"></span>';
        $(".terminal").classList.add("visible");
        await esperar(350);
        const cmd = lineas.querySelector(".cmd");
        for (const letra of comando) {
          cmd.textContent += letra;
          await esperar(28);
        }
      },
      salida(texto) {
        const s = document.createElement("div");
        s.className = "salida";
        s.textContent = texto;
        $(".lineas").appendChild(s);
      },
      quitarTerminal() {
        $(".terminal").classList.remove("visible");
      },
      acelerado(texto) {
        const a = $(".acelerado");
        if (texto) a.textContent = texto;
        a.classList.toggle("visible", !!texto);
      },
    };
  }

  if (document.documentElement) montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();

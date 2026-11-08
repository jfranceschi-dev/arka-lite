// Arma el MP4 dentro del navegador: dibuja en un lienzo el cuadro de la
// grabación que corresponde a cada instante y lo codifica en H.264 con
// WebCodecs, a cuadros por segundo constantes (PowerPoint lo reproduce sin
// complementos). grabar-videos.ts sirve los cuadros en /cuadro/<n> y
// mediabunny en /mediabunny.mjs, y recibe el video en base64.
import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, Quality } from "./mediabunny.mjs";

// cambios: en qué segundo del video empieza a verse cada cuadro, en orden.
// El primero empieza en 0. calidad: cuantizador constante (como el CRF de
// ffmpeg), con un bitrate de respaldo si el codificador no lo admite.
export async function codificar({ ancho, alto, fps, calidad, total, cambios }) {
  const lienzo = new OffscreenCanvas(ancho, alto);
  const g = lienzo.getContext("2d");
  const salida = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
  const fuente = new CanvasSource(lienzo, { codec: "avc", quality: new Quality(calidad), keyFrameInterval: 2 });
  salida.addVideoTrack(fuente, { frameRate: fps });
  await salida.start();

  let actual = -1;
  for (let k = 0; k < Math.ceil(total * fps); k++) {
    const t = k / fps;
    let siguiente = actual;
    while (siguiente + 1 < cambios.length && cambios[siguiente + 1].desde <= t) siguiente++;
    if (siguiente !== actual) {
      actual = siguiente;
      const imagen = await createImageBitmap(await (await fetch(`/cuadro/${cambios[actual].cuadro}`)).blob());
      g.drawImage(imagen, 0, 0, ancho, alto);
      imagen.close();
    }
    await fuente.add(t, 1 / fps);
  }
  await salida.finalize();

  const bytes = new Uint8Array(salida.target.buffer);
  let binario = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binario);
}

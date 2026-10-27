// Tamaños de letra que caben. PowerPoint no aplica "reducir al desbordar"
// hasta que alguien edita el texto, así que el generador estima el ancho de
// Segoe UI y elige el tamaño que entra en la caja sin partir palabras.

const EM = { normal: 0.52, negrita: 0.57, mayusculas: 0.7 } as const;

function anchoLetra(tam: number, negrita: boolean, mayusculas = false): number {
  return (tam * (mayusculas ? EM.mayusculas : negrita ? EM.negrita : EM.normal)) / 72;
}

export function lineas(texto: string, ancho: number, tam: number, negrita = false): number {
  const porLinea = Math.max(1, ancho / anchoLetra(tam, negrita));
  let total = 0;
  for (const parrafo of texto.split("\n")) {
    let actual = 0;
    let n = 1;
    for (const palabra of parrafo.split(/\s+/).filter(Boolean)) {
      if (actual === 0) actual = palabra.length;
      else if (actual + 1 + palabra.length <= porLinea) actual += 1 + palabra.length;
      else { n++; actual = palabra.length; }
    }
    total += n;
  }
  return total;
}

// El tamaño más grande, desde `maximo`, en que el texto cabe a lo ancho (sin
// partir palabras) y a lo alto.
export function tamQueCabe(texto: string, ancho: number, alto: number, maximo: number, minimo = 7, negrita = false, interlineado = 1.22): number {
  const larga = Math.max(1, ...texto.split(/\s+/).map((p) => p.length));
  for (let t = maximo; t > minimo; t -= 0.5) {
    if (larga * anchoLetra(t, negrita) > ancho) continue;
    if ((lineas(texto, ancho, t, negrita) * t * interlineado) / 72 <= alto) return t;
  }
  return minimo;
}

// Título y subtítulo dentro de la misma caja: reduce los dos en proporción.
export function tamTituloYSubtitulo(titulo: string, subtitulo: string | undefined, ancho: number, alto: number, maxTitulo: number, maxSub: number): [number, number] {
  for (let f = 1; f > 0.4; f -= 0.04) {
    const t = Math.max(7, maxTitulo * f);
    const s = Math.max(6.5, maxSub * f);
    const larga = Math.max(...titulo.split(/\s+/).map((p) => p.length));
    const largaSub = subtitulo ? Math.max(...subtitulo.split(/\s+/).map((p) => p.length)) : 0;
    if (larga * anchoLetra(t, true) > ancho || largaSub * anchoLetra(s, false) > ancho) continue;
    const h = (lineas(titulo, ancho, t, true) * t * 1.18 + (subtitulo ? lineas(subtitulo, ancho, s) * s * 1.18 : 0)) / 72;
    if (h <= alto) return [t, s];
  }
  return [7, 6.5];
}

// Ancho de una etiqueta en mayúsculas con espaciado entre letras.
export function anchoEtiqueta(texto: string, tam: number, espaciado = 0.8): number {
  return texto.length * (anchoLetra(tam, true, true) + espaciado / 72);
}

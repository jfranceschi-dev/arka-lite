// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ICONOS, type NombreIcono } from "../diseno/iconos.ts";
import { segmentosDeIcono } from "../diseno/trazos.ts";
import { redondearIconos } from "../generador-pptx/posproceso.ts";
import { lineas, tamQueCabe } from "../generador-pptx/medidas.ts";

describe("íconos vectoriales", () => {
  it("convierte cada ícono en trazos finitos dentro de su cuadrícula", () => {
    for (const nombre of Object.keys(ICONOS) as NombreIcono[]) {
      const segmentos = segmentosDeIcono(nombre);
      expect(segmentos.length, nombre).toBeGreaterThan(1);
      expect(segmentos[0].tipo, nombre).toBe("M");
      for (const g of segmentos) {
        if (g.tipo === "Z") continue;
        const valores = g.tipo === "C" ? [g.x1, g.y1, g.x2, g.y2, g.x, g.y] : [g.x, g.y];
        for (const v of valores) {
          expect(Number.isFinite(v), nombre).toBe(true);
          expect(v, nombre).toBeGreaterThan(-1);
          expect(v, nombre).toBeLessThan(25);
        }
      }
    }
  });

  it("redondea las puntas solo de las formas que son íconos", () => {
    const icono = '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Icono bell"/></p:nvSpPr><a:ln w="19050"><a:solidFill/></a:ln></p:sp>';
    const otra = '<p:sp><p:nvSpPr><p:cNvPr id="3" name="Shape 1"/></p:nvSpPr><a:ln w="19050"><a:solidFill/></a:ln></p:sp>';
    const salida = redondearIconos(icono + otra);
    expect(salida).toContain('<a:ln w="19050" cap="rnd"><a:solidFill/><a:round/></a:ln></p:sp><p:sp>');
    expect(salida.endsWith(otra)).toBe(true);
  });
});

describe("tamaño de letra que cabe", () => {
  it("no parte palabras: baja la letra hasta que la más larga entra", () => {
    const tam = tamQueCabe("ServicioSolicitudesUnitTest", 1.5, 1, 16);
    expect(tam).toBeLessThan(16);
    expect((27 * tam * 0.52) / 72).toBeLessThanOrEqual(1.5);
  });

  it("cuenta las líneas al envolver por palabras", () => {
    expect(lineas("uno dos tres", 10, 12)).toBe(1);
    expect(lineas("uno dos tres", 0.3, 12)).toBe(3);
  });
});

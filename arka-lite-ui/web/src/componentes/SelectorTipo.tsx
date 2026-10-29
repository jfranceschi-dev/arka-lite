import { useEffect, useRef } from "react";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.css";

// Tom Select sobre un <select>: buscar con el teclado y, si el tipo no está
// en la lista, escribir uno nuevo (el servicio acepta cualquier tipo).
export const TIPOS = ["Incidencia", "Cambio", "Consulta", "Requerimiento"];

export function SelectorTipo({ id, valor, alCambiar }: { id: string; valor: string; alCambiar: (v: string) => void }) {
  const select = useRef<HTMLSelectElement>(null);
  const ts = useRef<TomSelect | null>(null);
  const cambio = useRef(alCambiar);
  cambio.current = alCambiar;

  useEffect(() => {
    const t = new TomSelect(select.current!, {
      create: true,
      maxItems: 1,
      persist: false,
      placeholder: "Elige o escribe un tipo",
      options: TIPOS.map((x) => ({ value: x, text: x })),
      items: valor ? [valor] : [],
      render: {
        option_create: (datos: { input: string }, escape: (s: string) => string) => `<div class="create">Usar «${escape(datos.input)}»</div>`,
        no_results: () => '<div class="no-results">Sin coincidencias</div>',
      },
      onChange: (v: string) => cambio.current(v),
    });
    ts.current = t;
    return () => { t.destroy(); ts.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = ts.current;
    if (t && t.getValue() !== valor) t.setValue(valor, true);
  }, [valor]);

  return <select ref={select} id={id} className="arka-selector" defaultValue={valor} />;
}

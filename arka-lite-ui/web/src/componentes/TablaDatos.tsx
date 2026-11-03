import { useEffect, useRef } from "react";
import $ from "jquery";
import DataTable, { type Api } from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";

// jQuery DataTables dentro de React: React solo pone la <table>; DataTables
// arma filas, búsqueda, orden y paginación. Los botones de cada fila se
// atienden con un solo manejador delegado (data-accion y data-id).

export interface Columna<T> {
  titulo: string;
  // Valor para ordenar y buscar.
  valor: (fila: T) => string | number;
  // HTML a mostrar. Todo dato variable debe pasar por esc().
  html?: (fila: T) => string;
  ordenable?: boolean;
  clase?: string;
}

export const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const IDIOMA = {
  emptyTable: "Todavía no hay registros",
  info: "Mostrando _START_ a _END_ de _TOTAL_",
  infoEmpty: "Sin registros",
  infoFiltered: "(de _MAX_ en total)",
  lengthMenu: "Mostrar _MENU_",
  loadingRecords: "Cargando…",
  processing: "Procesando…",
  search: "Buscar",
  searchPlaceholder: "id, tipo o estado",
  zeroRecords: "Nada coincide con la búsqueda",
  paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" },
  aria: { orderable: "Ordenar por esta columna", orderableReverse: "Invertir el orden" },
};

export function TablaDatos<T>({ filas, columnas, etiqueta, alAccion, claseFila, porPagina = 10 }: {
  filas: T[];
  columnas: Columna<T>[];
  etiqueta: string;
  alAccion?: (accion: string, id: string) => void;
  claseFila?: (fila: T) => string;
  porPagina?: number;
}) {
  const tabla = useRef<HTMLTableElement>(null);
  const api = useRef<Api<T> | null>(null);
  const accion = useRef(alAccion);
  const clase = useRef(claseFila);
  const cols = useRef(columnas);
  accion.current = alAccion;
  clase.current = claseFila;
  cols.current = columnas;

  useEffect(() => {
    const el = tabla.current!;
    const dt = new DataTable<T>(el, {
      data: [],
      // Los títulos se fijan al montar; cada celda usa las columnas vigentes.
      columns: columnas.map((c, i) => ({
        title: c.titulo,
        data: null,
        orderable: c.ordenable ?? true,
        className: c.clase,
        render: (_d: unknown, tipo: string, fila: T) => {
          const col = cols.current[i];
          return tipo === "display" && col.html ? col.html(fila) : col.valor(fila);
        },
      })),
      language: IDIOMA,
      pageLength: porPagina,
      lengthMenu: [5, 10, 25, 50],
      order: [],
      autoWidth: false,
      createdRow: (fila: Node, datos: object | unknown[]) => { const c = clase.current?.(datos as T); if (c) (fila as HTMLElement).classList.add(...c.split(" ")); },
    });
    api.current = dt;
    $(el).on("click", "button[data-accion]", (e) => {
      const b = e.currentTarget as HTMLButtonElement;
      accion.current?.(b.dataset.accion ?? "", b.dataset.id ?? "");
    });
    return () => {
      $(el).off("click");
      dt.destroy();
      api.current = null;
    };
    // Las columnas se fijan al montar; los datos cambian con el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dt = api.current;
    if (!dt) return;
    dt.clear();
    dt.rows.add(filas);
    dt.draw(false);
  }, [filas, columnas, claseFila]);

  return (
    <div className="arka-tabla">
      <table ref={tabla} aria-label={etiqueta} className="display" style={{ width: "100%" }} />
    </div>
  );
}

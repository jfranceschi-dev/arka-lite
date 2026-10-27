import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ejecutar, type OpcionesCliente, type RegistroPeticion } from "../api/cliente.ts";
import type { Operacion } from "../../../contenido/laboratorio.ts";

// Historial de las peticiones que hizo esta UI, en memoria de la pestaña.
interface Historial {
  registros: RegistroPeticion[];
  enCurso: Set<string>;
  lanzar: (op: Operacion, id?: string, cuerpo?: unknown) => Promise<RegistroPeticion>;
  porId: (id: string) => RegistroPeticion | undefined;
}

const Contexto = createContext<Historial | null>(null);

export function ProveedorHistorial({ children, opciones }: { children: ReactNode; opciones?: OpcionesCliente }) {
  const [registros, setRegistros] = useState<RegistroPeticion[]>([]);
  const [enCurso, setEnCurso] = useState<Set<string>>(new Set());

  const lanzar = useCallback(
    async (op: Operacion, id?: string, cuerpo?: unknown) => {
      let idRegistro = "";
      setEnCurso((s) => new Set(s).add(op.id));
      const final = await ejecutar(op, id, {
        ...opciones,
        alIniciar: (r) => {
          idRegistro = r.id;
          setRegistros((lista) => [r, ...lista]);
        },
      }, cuerpo);
      setRegistros((lista) => lista.map((r) => (r.id === idRegistro ? final : r)));
      setEnCurso((s) => {
        const n = new Set(s);
        n.delete(op.id);
        return n;
      });
      return final;
    },
    [opciones],
  );

  const valor = useMemo<Historial>(
    () => ({ registros, enCurso, lanzar, porId: (id) => registros.find((r) => r.id === id) }),
    [registros, enCurso, lanzar],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useHistorial(): Historial {
  const v = useContext(Contexto);
  if (!v) throw new Error("useHistorial fuera de ProveedorHistorial");
  return v;
}

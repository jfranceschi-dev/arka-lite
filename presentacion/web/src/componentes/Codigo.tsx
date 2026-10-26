import type { BloqueCodigo } from "../../../contenido/tipos.ts";
import { resaltar, type ClaseCodigo } from "../../../diseno/resaltado.ts";

const clases: Record<ClaseCodigo, string> = {
  comentario: "text-codigo-comentario italic",
  cadena: "text-codigo-cadena",
  anotacion: "text-codigo-anotacion",
  clave: "text-codigo-clave",
  tipo: "text-codigo-tipo",
  numero: "text-codigo-cadena",
  texto: "",
};

export function Codigo({ bloque, compacto = false }: { bloque: BloqueCodigo; compacto?: boolean }) {
  return (
    <figure className="m-0 flex flex-col gap-2 min-w-0">
      <figcaption className="font-mono text-[12px] text-cian-texto break-all">{bloque.archivo}</figcaption>
      <pre className={`m-0 rounded-recuadro bg-codigo-fondo text-codigo-texto font-mono overflow-x-auto ${compacto ? "text-[12.5px] p-3" : "text-[14px] p-4"} leading-relaxed`}>
        <code>
          {resaltar(bloque.texto, bloque.lenguaje).map((t, i) => (
            <span key={i} className={clases[t.clase]}>{t.texto}</span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

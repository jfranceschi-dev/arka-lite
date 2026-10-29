import type { OpcionesCliente } from "./api/cliente.ts";
import { ProveedorDatos } from "./estado/datos.tsx";
import { ProveedorHistorial } from "./estado/historial.tsx";
import { ProveedorPreferencias } from "./estado/preferencias.tsx";
import { ProveedorTema } from "./estado/tema.tsx";
import { useRuta } from "./rutas.ts";
import { Ayuda } from "./vistas/Ayuda.tsx";
import { Enviadas } from "./vistas/Enviadas.tsx";
import { Salud } from "./vistas/Salud.tsx";
import { Solicitudes } from "./vistas/Solicitudes.tsx";

function Vistas() {
  const ruta = useRuta();
  switch (ruta.vista) {
    case "enviadas": return <Enviadas />;
    case "salud": return <Salud />;
    case "ayuda": return <Ayuda idTema={ruta.parametro} />;
    default: return <Solicitudes />;
  }
}

// Los datos y el historial viven arriba de las pantallas: cambiar de pestaña
// no repite consultas ni pierde lo que ya se observó.
export function App({ cliente }: { cliente?: OpcionesCliente }) {
  return (
    <ProveedorTema>
      <ProveedorPreferencias>
        <ProveedorHistorial opciones={cliente}>
          <ProveedorDatos>
            <Vistas />
          </ProveedorDatos>
        </ProveedorHistorial>
      </ProveedorPreferencias>
    </ProveedorTema>
  );
}

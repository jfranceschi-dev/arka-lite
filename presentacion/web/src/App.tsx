import type { OpcionesCliente } from "./api/cliente.ts";
import { ProveedorHistorial } from "./estado/historial.tsx";
import { ProveedorPreferencias } from "./estado/preferencias.tsx";
import { useRuta } from "./rutas.ts";
import { Detalle } from "./vistas/Detalle.tsx";
import { Entender } from "./vistas/Entender.tsx";
import { Expositor } from "./vistas/Expositor.tsx";
import { Presentar } from "./vistas/Presentar.tsx";
import { Probar } from "./vistas/Probar.tsx";

function Vistas() {
  const ruta = useRuta();
  switch (ruta.vista) {
    case "probar": return <Probar resaltar={ruta.parametro} />;
    case "detalle": return <Detalle idRegistro={ruta.parametro} />;
    case "presentar": return <Presentar idLamina={ruta.parametro} />;
    case "expositor": return <Expositor idLamina={ruta.parametro} />;
    default: return <Entender idLamina={ruta.parametro} />;
  }
}

// El historial vive arriba de las vistas: pasar de Probar a Entender o a
// Detalle no pierde las peticiones observadas.
export function App({ cliente }: { cliente?: OpcionesCliente }) {
  return (
    <ProveedorPreferencias>
      <ProveedorHistorial opciones={cliente}>
        <Vistas />
      </ProveedorHistorial>
    </ProveedorPreferencias>
  );
}

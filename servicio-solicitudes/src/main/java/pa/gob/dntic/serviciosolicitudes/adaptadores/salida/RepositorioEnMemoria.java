package pa.gob.dntic.serviciosolicitudes.adaptadores.salida;

import org.springframework.stereotype.Repository;
import pa.gob.dntic.serviciosolicitudes.dominio.RepositorioDeSolicitudes;
import pa.gob.dntic.serviciosolicitudes.dominio.Solicitud;
import java.util.*;

@Repository("repositorioDeSolicitudesEnMemoria")
public class RepositorioEnMemoria implements RepositorioDeSolicitudes {

    private final Map<String, Solicitud> almacen = new LinkedHashMap<>();

    public void guardar(Solicitud s) {
        almacen.put(s.id(), s);
    }

    public void enviar(Solicitud s) {
        guardar(s);
    }

    public Optional<Solicitud> buscar(String id) {
        return Optional.ofNullable(almacen.get(id));
    }

    public List<Solicitud> todas() {
        return new ArrayList<>(almacen.values());
    }

}

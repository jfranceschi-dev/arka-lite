package pa.gob.dntic.serviciosolicitudes.dominio;

import java.util.List;
import java.util.Optional;
import pa.gob.dntic.serviciosolicitudes.dominio.Solicitud;
/*
 * PUERTO de salida. El dominio dice qué necesita del almacenamiento,
 * sin decir cómo. Vive en el dominio; lo implementa un adaptador afuera.
 */
public interface RepositorioDeSolicitudes {
    void guardar(Solicitud s);
    void enviar(Solicitud s);
    Optional<Solicitud> buscar(String id);
    List<Solicitud> todas();
}

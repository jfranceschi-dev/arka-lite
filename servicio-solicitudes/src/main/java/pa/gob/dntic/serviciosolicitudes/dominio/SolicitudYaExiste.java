package pa.gob.dntic.serviciosolicitudes.dominio;

public class SolicitudYaExiste extends RuntimeException {
    public SolicitudYaExiste(String id) { super("Ya existe la solicitud " + id); }
}

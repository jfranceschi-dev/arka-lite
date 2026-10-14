package pa.gob.dntic.serviciosolicitudes.adaptadores.salida;

/*
 * Señala que PublicadorConReintento agotó sus reintentos sin publicar el
 * evento. Quien llama a publicar() (RelevadorDeEventosPendientes) la usa
 * para decidir dejar el evento como no procesado, en vez de asumir éxito.
 */
public class PublicacionFallidaException extends RuntimeException {
    public PublicacionFallidaException(String eventoId) {
        super("no se pudo publicar el evento " + eventoId + " tras agotar los reintentos");
    }
}

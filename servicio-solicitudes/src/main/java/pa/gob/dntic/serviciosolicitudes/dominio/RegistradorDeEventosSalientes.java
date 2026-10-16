package pa.gob.dntic.serviciosolicitudes.dominio;

/*
 * PUERTO de salida: deja constancia duradera de un evento (outbox) en la
 * misma transacción que el cambio de estado de la solicitud, ANTES de
 * intentar publicarlo por HTTP. Si la publicación falla o el proceso se
 * reinicia, el evento sigue en la base y se puede reintentar — no depende
 * de que la petición HTTP original haya tenido éxito.
 */
public interface RegistradorDeEventosSalientes {
    void registrar(String eventoId, String solicitudId, String tipo);
}

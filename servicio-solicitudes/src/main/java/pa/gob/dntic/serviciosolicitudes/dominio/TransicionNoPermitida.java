package pa.gob.dntic.serviciosolicitudes.dominio;

/*
 * Regla del record Solicitud: el cambio de estado pedido no se permite desde
 * el estado actual. Extiende IllegalStateException para no cambiar el
 * significado de las pruebas existentes; el manejador de errores la
 * traduce a 409 Conflict.
 */
public class TransicionNoPermitida extends IllegalStateException {
    public TransicionNoPermitida(String mensaje) { super(mensaje); }
}

package pa.gob.dntic.serviciosolicitudes.dominio;

/* Una fila del outbox vista desde el dominio: qué evento, de qué solicitud y si ya se entregó. */
public record EventoSaliente(String eventoId, String solicitudId, String tipo, boolean procesado) {}

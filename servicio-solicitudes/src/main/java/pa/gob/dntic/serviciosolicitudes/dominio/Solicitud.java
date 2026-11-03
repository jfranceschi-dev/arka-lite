package pa.gob.dntic.serviciosolicitudes.dominio;

/* DOMINIO puro: ni una anotación de Spring. Solo negocio. */
public record Solicitud(String id, String tipo, Estado estado) {

    public Solicitud enviar() {
        if (estado != Estado.BORRADOR) {
            throw new TransicionNoPermitida("solo se puede enviar una solicitud en BORRADOR");
        }
        return new Solicitud(id, tipo, Estado.ENVIADA);
    }

    public Solicitud aprobar() {
        if (estado != Estado.ENVIADA) {
            throw new TransicionNoPermitida("solo se aprueba una solicitud ENVIADA");
        }
        return new Solicitud(id, tipo, Estado.APROBADA);
    }

    public Solicitud rechazar() {
        if (estado != Estado.ENVIADA) {
            throw new TransicionNoPermitida("solo se rechaza una solicitud ENVIADA");
        }
        return new Solicitud(id, tipo, Estado.RECHAZADA);
    }
}

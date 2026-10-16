package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "evento")
public class EventoEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "solicitud_id")
    private String solicitudId;
    private String tipo;

    @Column(name = "evento_id")
    private UUID eventoId;

    private boolean procesado;

    protected EventoEntity() {}

    // Constructor original: lo usa OperacionEnviar, que no está conectado al
    // flujo real (ver comentario en ese archivo). Se deja igual que antes;
    // no asigna eventoId, así que si algún día se invoca, Postgres le pone
    // el DEFAULT gen_random_uuid() de la columna.
    public EventoEntity(String solicitudId, String tipo) {
        this.solicitudId = solicitudId;
        this.tipo = tipo;
    }

    // Constructor del outbox real: lo usa RegistradorDeEventosJpa, con el
    // mismo eventoId que luego se reintenta publicar.
    public EventoEntity(UUID eventoId, String solicitudId, String tipo) {
        this.eventoId = eventoId;
        this.solicitudId = solicitudId;
        this.tipo = tipo;
        this.procesado = false;
    }

    public Long getId() { return id; }
    public UUID getEventoId() { return eventoId; }
    public String getSolicitudId() { return solicitudId; }
    public String getTipo() { return tipo; }
    public boolean isProcesado() { return procesado; }
    public void setProcesado(boolean procesado) { this.procesado = procesado; }
}

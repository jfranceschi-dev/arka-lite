package pa.gob.dntic.servicionotificaciones.adaptadores.persistencia;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "evento_procesado")
public class EventoProcesadoEntity {

    @Id
    @Column(name = "evento_id", length = 64, nullable = false)
    private String eventoId;

    protected EventoProcesadoEntity() {
    }

    public EventoProcesadoEntity(String eventoId) {
        this.eventoId = eventoId;
    }
}

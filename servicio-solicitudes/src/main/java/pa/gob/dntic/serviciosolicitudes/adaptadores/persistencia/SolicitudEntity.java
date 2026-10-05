package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "solicitudes")
public class SolicitudEntity {
    private String id;
    private String tipo;
    private String estado;

    protected SolicitudEntity() {}
    public SolicitudEntity(String id, String tipo, String estado) {
        this.id = id;
        this.tipo = tipo;
        this.estado = estado;
    }

    public String getId() { return id;}
    public String getTipo() { return tipo; }
    public String getEstado() { return estado; }

    public void setEstado(String enviada) { this.estado = enviada; }
}

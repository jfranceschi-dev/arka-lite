package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class OperacionEnviar {
    private final SolicitudJpaRepository solicitudes;
    private final EventoJpaRepository eventos;

    public OperacionEnviar(SolicitudJpaRepository s, EventoJpaRepository e) {
        this.solicitudes = s;
        this.eventos = e;
    }

    @Transactional
    public void enviar(String id) {
        SolicitudEntity s = solicitudes.findById(id).orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        s.setEstado("ENVIADA");
        solicitudes.save(s);
        eventos.save(new EventoEntity(id, "SolicitudEnviada"));
        // si cualquiera de los dos revienta, Ninguna queda guardada, se hace rollback de la transacción
    }
}

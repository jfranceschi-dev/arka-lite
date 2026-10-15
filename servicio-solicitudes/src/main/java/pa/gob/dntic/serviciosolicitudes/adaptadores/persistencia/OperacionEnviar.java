package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import pa.gob.dntic.serviciosolicitudes.dominio.SolicitudNoEncontrada;

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
        actualizarEstado(id);
        eventos.save(new EventoEntity(id, "SolicitudEnviada"));
    }

    @Transactional
    public void enviarConFallo(String id) {
        actualizarEstado(id);
        // La base rechaza esta segunda escritura; la excepción provoca el rollback del UPDATE.
        eventos.saveAndFlush(new EventoEntity(null, "SolicitudEnviada"));
    }

    private void actualizarEstado(String id) {
        SolicitudEntity solicitud = solicitudes.findById(id)
                .orElseThrow(() -> new SolicitudNoEncontrada(id));
        solicitud.setEstado("ENVIADA");
        solicitudes.saveAndFlush(solicitud);
    }
}

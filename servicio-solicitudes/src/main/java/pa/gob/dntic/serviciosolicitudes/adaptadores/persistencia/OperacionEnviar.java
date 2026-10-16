package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

// NO está conectado al flujo real: nada llama a OperacionEnviar.enviar().
// ServicioDeSolicitudes.enviar() usa su propio camino (RepositorioJpa +
// RegistradorDeEventosJpa, ambos dentro de un @Transactional en el dominio)
// para lograr lo mismo que esta clase intenta: guardar la solicitud y el
// evento juntos. Se deja esta clase sin tocar porque es un repo de
// aprendizaje — sirve para comparar un enfoque (todo en un método de
// persistencia) contra el que quedó cableado (puertos separados).
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

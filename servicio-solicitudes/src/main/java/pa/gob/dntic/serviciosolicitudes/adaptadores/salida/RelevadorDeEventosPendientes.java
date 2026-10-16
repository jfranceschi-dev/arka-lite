package pa.gob.dntic.serviciosolicitudes.adaptadores.salida;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia.EventoEntity;
import pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia.EventoJpaRepository;
import pa.gob.dntic.serviciosolicitudes.dominio.PublicadorDeEventos;
import pa.gob.dntic.serviciosolicitudes.eventos.SolicitudEnviada;

import java.util.List;

/*
 * Relevador del outbox: cada ciclo busca los eventos que ServicioDeSolicitudes
 * guardó con procesado=false y los intenta publicar con el mismo
 * PublicadorDeEventos de siempre (PublicadorConReintento, con sus 3
 * reintentos). Si publicar() termina lanzando (porque agotó los reintentos),
 * el evento se deja sin marcar y este método lo vuelve a intentar en el
 * próximo ciclo — así sobrevive a un reinicio del proceso, que es lo que el
 * publicador por sí solo no podía garantizar.
 */
@Component
public class RelevadorDeEventosPendientes {
    private final EventoJpaRepository eventos;
    private final PublicadorDeEventos publicador;

    public RelevadorDeEventosPendientes(EventoJpaRepository eventos, PublicadorDeEventos publicador) {
        this.eventos = eventos;
        this.publicador = publicador;
    }

    @Scheduled(fixedDelay = 5000)
    public void publicarPendientes() {
        List<EventoEntity> pendientes = eventos.findByProcesadoFalse();
        for (EventoEntity evento : pendientes) {
            try {
                publicador.publicar(new SolicitudEnviada(
                        evento.getEventoId().toString(),
                        evento.getSolicitudId(),
                        evento.getTipo()
                ));
                evento.setProcesado(true);
                eventos.save(evento);
            } catch (RuntimeException ex) {
                // Se deja procesado=false a propósito: se reintenta en el
                // próximo ciclo (5s), el evento nunca se descarta en silencio.
            }
        }
    }
}

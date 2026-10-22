package pa.gob.dntic.servicionotificaciones.adaptadores.entrada;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import pa.gob.dntic.servicionotificaciones.adaptadores.persistencia.EventoProcesadoEntity;
import pa.gob.dntic.servicionotificaciones.adaptadores.persistencia.EventoProcesadoRepository;
import pa.gob.dntic.servicionotificaciones.dominio.ServicioDeNotificaciones;
import pa.gob.dntic.servicionotificaciones.eventos.SolicitudEnviada;

import java.util.List;

@Service
public class ConsumoIdempotente {
    private final EventoProcesadoRepository procesados;
    private final ServicioDeNotificaciones servicio;

    private static final Logger logger = LoggerFactory.getLogger(ConsumoIdempotente.class);

    public ConsumoIdempotente(EventoProcesadoRepository procesados,
            ServicioDeNotificaciones servicio
            ) {
        this.procesados = procesados;
        this.servicio = servicio;
    }

    @Transactional
    public void alRecibir(SolicitudEnviada e) {
        logger.info("Consume evento {} de solicitud {}", e.eventoId(), e.id());
        if (procesados.existsById(e.eventoId())) {
            logger.info("evento {} ya fue procesado, se ignora (idempotente)", e.eventoId());
            return;
        }
        try {
            servicio.alRecibirSolicitudEnviada(e);
            procesados.save(new EventoProcesadoEntity(e.eventoId()));
            logger.info("aviso creado para solicitud {} (evento {})", e.id(), e.eventoId());
        } catch (RuntimeException ex) {
            logger.error("fallo al guardar el aviso de {} (evento {})", e.id(), e.eventoId(), ex);
            throw ex;
        }

    }

    public List<String> identificadoresProcesados() {
        return procesados.findAll().stream()
                .map(EventoProcesadoEntity::getEventoId)
                .toList();
    }
}

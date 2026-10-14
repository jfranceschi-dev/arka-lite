package pa.gob.dntic.servicionotificaciones.adaptadores.entrada;

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

    public ConsumoIdempotente(EventoProcesadoRepository procesados,
            ServicioDeNotificaciones servicio
            ) {
        this.procesados = procesados;
        this.servicio = servicio;
    }

    @Transactional
    public void alRecibir(SolicitudEnviada e) {
        if (procesados.existsById(e.eventoId())) {
            return;
        }

        servicio.alRecibirSolicitudEnviada(e);
        procesados.save(new EventoProcesadoEntity(e.eventoId()));
    }

    public List<String> identificadoresProcesados() {
        return procesados.findAll().stream()
                .map(EventoProcesadoEntity::getEventoId)
                .toList();
    }
}

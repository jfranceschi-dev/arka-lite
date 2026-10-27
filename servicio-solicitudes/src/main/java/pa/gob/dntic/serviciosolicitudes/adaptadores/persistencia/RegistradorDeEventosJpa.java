package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import org.springframework.stereotype.Component;
import pa.gob.dntic.serviciosolicitudes.dominio.ConsultaDeEventosSalientes;
import pa.gob.dntic.serviciosolicitudes.dominio.EventoSaliente;
import pa.gob.dntic.serviciosolicitudes.dominio.RegistradorDeEventosSalientes;

import java.util.List;
import java.util.UUID;

/*
 * ADAPTADOR del outbox: guarda el evento en la tabla `evento` con
 * procesado=false. Quien lo publica después es RelevadorDeEventosPendientes,
 * no este adaptador — aquí solo se deja constancia. También responde la
 * consulta del outbox (todos los eventos, entregados o no).
 */
@Component
public class RegistradorDeEventosJpa implements RegistradorDeEventosSalientes, ConsultaDeEventosSalientes {
    private final EventoJpaRepository eventos;

    public RegistradorDeEventosJpa(EventoJpaRepository eventos) {
        this.eventos = eventos;
    }

    @Override
    public void registrar(String eventoId, String solicitudId, String tipo) {
        eventos.save(new EventoEntity(UUID.fromString(eventoId), solicitudId, tipo));
    }

    @Override
    public List<EventoSaliente> todos() {
        return eventos.findAll().stream()
                .map(e -> new EventoSaliente(
                        e.getEventoId() == null ? null : e.getEventoId().toString(),
                        e.getSolicitudId(), e.getTipo(), e.isProcesado()))
                .toList();
    }
}

package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import org.springframework.stereotype.Component;
import pa.gob.dntic.serviciosolicitudes.dominio.RegistradorDeEventosSalientes;

import java.util.UUID;

/*
 * ADAPTADOR del outbox: guarda el evento en la tabla `evento` con
 * procesado=false. Quien lo publica después es RelevadorDeEventosPendientes,
 * no este adaptador — aquí solo se deja constancia.
 */
@Component
public class RegistradorDeEventosJpa implements RegistradorDeEventosSalientes {
    private final EventoJpaRepository eventos;

    public RegistradorDeEventosJpa(EventoJpaRepository eventos) {
        this.eventos = eventos;
    }

    @Override
    public void registrar(String eventoId, String solicitudId, String tipo) {
        eventos.save(new EventoEntity(UUID.fromString(eventoId), solicitudId, tipo));
    }
}

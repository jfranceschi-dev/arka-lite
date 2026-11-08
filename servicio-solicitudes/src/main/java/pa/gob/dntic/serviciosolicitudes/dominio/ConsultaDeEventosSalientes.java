package pa.gob.dntic.serviciosolicitudes.dominio;

import java.util.List;

/*
 * PUERTO de consulta del outbox. Permite comparar, desde fuera, los eventos
 * que solicitudes registró con los que notificaciones dice haber consumido.
 */
public interface ConsultaDeEventosSalientes {
    List<EventoSaliente> todos();
}

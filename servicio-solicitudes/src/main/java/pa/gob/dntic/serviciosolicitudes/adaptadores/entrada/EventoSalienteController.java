package pa.gob.dntic.serviciosolicitudes.adaptadores.entrada;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import pa.gob.dntic.serviciosolicitudes.dominio.ConsultaDeEventosSalientes;
import pa.gob.dntic.serviciosolicitudes.dominio.EventoSaliente;

import java.util.List;

/*
 * ADAPTADOR de entrada de solo lectura sobre el outbox. GET /eventos
 * devuelve cada evento con su eventoId y si el relevador ya lo entregó, para
 * cruzarlo con GET /eventos/procesados de notificaciones.
 */
@RestController
public class EventoSalienteController {

    private final ConsultaDeEventosSalientes consulta;

    public EventoSalienteController(ConsultaDeEventosSalientes consulta) {
        this.consulta = consulta;
    }

    @GetMapping("/eventos")
    public List<EventoSaliente> todos() {
        return consulta.todos();
    }
}

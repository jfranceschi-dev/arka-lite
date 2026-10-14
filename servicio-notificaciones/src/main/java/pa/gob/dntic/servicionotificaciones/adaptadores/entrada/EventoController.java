package pa.gob.dntic.servicionotificaciones.adaptadores.entrada;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import pa.gob.dntic.servicionotificaciones.eventos.SolicitudEnviada;

@RestController
public class EventoController {
    private final ConsumoIdempotente consumo;

    public EventoController(ConsumoIdempotente consumo) {
        this.consumo = consumo;
    }

    // Evento
    @PostMapping("/eventos/solicitud-enviada")
    public void recibir(@RequestBody SolicitudEnviada evento){
        consumo.alRecibir(evento);
    }
}

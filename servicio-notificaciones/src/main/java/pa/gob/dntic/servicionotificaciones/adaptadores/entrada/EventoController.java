package pa.gob.dntic.servicionotificaciones.adaptadores.entrada;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import pa.gob.dntic.servicionotificaciones.eventos.SolicitudEnviada;

import java.util.List;

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

    @GetMapping("/eventos/procesados")
    public List<String> procesados() {
        return consumo.identificadoresProcesados();
    }
}

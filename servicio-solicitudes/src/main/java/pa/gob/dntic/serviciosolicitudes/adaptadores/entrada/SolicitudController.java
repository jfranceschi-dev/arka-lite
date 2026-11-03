package pa.gob.dntic.serviciosolicitudes.adaptadores.entrada;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pa.gob.dntic.serviciosolicitudes.dominio.Estado;
import pa.gob.dntic.serviciosolicitudes.dominio.ServicioDeSolicitudes;
import pa.gob.dntic.serviciosolicitudes.dominio.Solicitud;
import java.util.List;

/*
 * ADAPTADOR de entrada: traduce la web hacia el dominio. Es DELGADO:
 * no tiene lógica ni almacenamiento; solo llama al servicio.
 */
@RestController
@RequestMapping("/solicitudes")
public class SolicitudController {

    private final ServicioDeSolicitudes servicio;

    public SolicitudController(ServicioDeSolicitudes servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Solicitud> todas() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Solicitud porId(@PathVariable String id) {
        return servicio.buscar(id);
    }

    // Alta con id y tipo elegidos. 201 si se creó; 409 si el id ya existe.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Solicitud crear(@RequestBody NuevaSolicitud nueva) {
        return servicio.crear(nueva.id(), nueva.tipo());
    }

    // Atajo de demostración: siempre INC-002 y, si existe, la deja en BORRADOR.
    @PostMapping("/crear")
    public Solicitud crearNueva() {
        Solicitud nueva = new Solicitud ("INC-002", "Incidencia", Estado.BORRADOR);
        return servicio.registrar(nueva.id(), nueva.tipo());
    }

    @PostMapping("/{id}/enviar")
    public Solicitud enviar(@PathVariable String id) {
        return servicio.enviar(id);
    }

    @PostMapping({"/{id}/aprobar"})
    public Solicitud aprobar(@PathVariable String id) {
        return servicio.aprobar(id);
    }

    @PostMapping({"/{id}/rechazar"})
    public Solicitud rechazar(@PathVariable String id) {
        return servicio.rechazar(id);
    }
}

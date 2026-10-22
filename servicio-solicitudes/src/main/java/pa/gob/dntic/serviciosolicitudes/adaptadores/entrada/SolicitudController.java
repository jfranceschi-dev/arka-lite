package pa.gob.dntic.serviciosolicitudes.adaptadores.entrada;

import org.springframework.web.bind.annotation.*;
import pa.gob.dntic.serviciosolicitudes.dominio.Estado;
import pa.gob.dntic.serviciosolicitudes.dominio.ServicioDeSolicitudes;
import pa.gob.dntic.serviciosolicitudes.dominio.Solicitud;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/*|
 * ADAPTADOR de entrada: traduce la web hacia el dominio. Es DELGADO:
 * no tiene lógica ni almacenamiento; solo llama al servicio.
 */
@RestController
@RequestMapping("/solicitudes")
public class SolicitudController {

    private final ServicioDeSolicitudes servicio;
    private static final Logger log = LoggerFactory.getLogger(SolicitudController.class);

    public SolicitudController(ServicioDeSolicitudes servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Solicitud> todas() {
        log.info("servicio=servicio-solicitudes accion=listar mensaje=\"Recibe petición para listar solicitudes\"");
        List<Solicitud> solicitudes = servicio.listar();
//        return servicio.listar();
        log.info("servicio=servicio-solicitudes accion=listar cantidad={} mensaje=\"Consulta completada\"", solicitudes.size());

        return solicitudes;

    }

    @GetMapping("/{id}")
    public Solicitud porId(@PathVariable String id) {
        log.info("servicio=servicio-solicitudes accion=buscar solicitudId={} mensaje=\"Recibe consulta de solicitud\"", id);
//        return servicio.buscar(id);
        Solicitud solicitud = servicio.buscar(id);
        log.info("servicio=servicio-solicitudes accion=buscar solicitudId={} mensaje=\"Consulta completada\"", id);
        return solicitud;
    }

    @PostMapping("/crear")
    public Solicitud crearNueva() {
        log.info("servicio=servicio-solicitudes accion=crear mensaje=\"Recibe petición para crear solicitud\"");

        Solicitud nueva = new Solicitud ("INC-002", "Incidencia", Estado.BORRADOR);

        Solicitud creada = servicio.registrar(nueva.id(), nueva.tipo());

        log.info("servicio=servicio-solicitudes accion=crear solicitudId={} mensaje=\"Solicitud creada\"", creada.id());
        return creada;
        //  return servicio.registrar(nueva.id(), nueva.tipo());

    }

    @PostMapping("/{id}/enviar")
    public Solicitud enviar(@PathVariable String id) {
        log.info("servicio=servicio-solicitudes accion=enviar solicitudId={} mensaje=\"Recibe petición de envío\"", id);

        Solicitud enviada = servicio.enviar(id);

        log.info("servicio=servicio-solicitudes accion=enviar solicitudId={} mensaje=\"Solicitud enviada\"", id);

//        return servicio.enviar(id);
        return enviada;
    }

    @PostMapping({"/{id}/aprobar"})
    public Solicitud aprobar(@PathVariable String id) {
        log.info("servicio=servicio-solicitudes accion=aprobar solicitudId={} mensaje=\"Recibe petición de aprobación\"", id);

        Solicitud aprobada = servicio.aprobar(id);
        log.info("servicio=servicio-solicitudes accion=aprobar solicitudId={} mensaje=\"Solicitud aprobada\"", id);
        return aprobada;
//        return servicio.aprobar(id);
    }

    @PostMapping({"/{id}/rechazar"})
    public Solicitud rechazar(@PathVariable String id) {

        log.info("servicio=servicio-solicitudes accion=rechazar solicitudId={} mensaje=\"Recibe petición de rechazo\"", id);
        Solicitud rechazada = servicio.rechazar(id);

        log.info("servicio=servicio-solicitudes accion=rechazar solicitudId={} mensaje=\"Solicitud rechazada\"", id);

        return rechazada;
//        return servicio.rechazar(id);
    }
}

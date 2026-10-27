package pa.gob.dntic.serviciosolicitudes.dominio;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;

/*
 * Dominio de Solicitudes (Etapa 1) + publicación de evento (Etapa 2).
 * Depende de tres PUERTOS: el repositorio, el registrador de outbox y el
 * publicador. NO conoce a Notificaciones.
 */
public class ServicioDeSolicitudes {

    private final RepositorioDeSolicitudes repositorio;
    // Ya no se llama directamente desde este archivo (ver enviar() más abajo):
    // la publicación por HTTP la dispara RelevadorDeEventosPendientes, en
    // segundo plano, leyendo lo que registrador.registrar() deja en la tabla
    // evento. Se deja el puerto inyectado para no romper el cableado de
    // PublicadorConReintento/PublicadorRest como beans de Spring.
    private final PublicadorDeEventos publicador;
    private final RegistradorDeEventosSalientes registrador;

    public ServicioDeSolicitudes(
            RepositorioDeSolicitudes repositorio,
            PublicadorDeEventos publicador,
            RegistradorDeEventosSalientes registrador) {
        this.repositorio = repositorio;
        this.publicador = publicador;
        this.registrador = registrador;
    }

    // Alta desde la API: a diferencia de registrar(), no pisa una solicitud
    // existente ni acepta datos vacíos.
    public Solicitud crear(String id, String tipo) {
        if (id == null || id.isBlank() || tipo == null || tipo.isBlank()) {
            throw new IllegalArgumentException("id y tipo son obligatorios");
        }
        String idNormalizado = id.trim().toUpperCase();
        if (repositorio.buscar(idNormalizado).isPresent()) {
            throw new SolicitudYaExiste(idNormalizado);
        }
        return registrar(idNormalizado, tipo.trim());
    }

    public Solicitud registrar(String id, String tipo) {
        Solicitud s = new Solicitud(id, tipo, Estado.BORRADOR);
        repositorio.guardar(s);
        return s;
    }

    // @Transactional: guardar la solicitud ENVIADA y registrar el evento en
    // el outbox pasan en la misma transacción. Si cualquiera de los dos
    // falla, no queda ninguno a medias (antes eran dos pasos sueltos: se
    // guardaba la solicitud y, aparte, se intentaba notificar por HTTP en el
    // mismo hilo de la petición).
    @Transactional
    public Solicitud enviar(String id) {
        Solicitud enviada = buscar(id).enviar();
        repositorio.guardar(enviada);
        registrador.registrar(UUID.randomUUID().toString(), enviada.id(), "SolicitudEnviada");
        return enviada;
    }

    public Solicitud aprobar(String id) {
        Solicitud request = buscar(id);
        Solicitud aprobada = request.aprobar();
        repositorio.guardar(aprobada);
        return aprobada;
    }

    public Solicitud rechazar(String id) {
        Solicitud request = buscar(id);
        Solicitud rechazada = request.rechazar();
        repositorio.guardar(rechazada);
        return rechazada;
    }

    public List<Solicitud> listar() { return repositorio.todas(); }

    public Solicitud buscar(String id) {
        return repositorio.buscar(id).orElseThrow(() -> new SolicitudNoEncontrada(id));
    }
}

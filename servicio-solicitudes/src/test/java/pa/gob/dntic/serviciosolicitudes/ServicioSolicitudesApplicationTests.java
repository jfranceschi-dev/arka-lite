package pa.gob.dntic.serviciosolicitudes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pa.gob.dntic.serviciosolicitudes.adaptadores.entrada.SolicitudController;
import pa.gob.dntic.serviciosolicitudes.adaptadores.salida.RepositorioEnMemoria;
import pa.gob.dntic.serviciosolicitudes.dominio.Estado;
import pa.gob.dntic.serviciosolicitudes.dominio.PublicadorDeEventos;
import pa.gob.dntic.serviciosolicitudes.dominio.RegistradorDeEventosSalientes;
import pa.gob.dntic.serviciosolicitudes.dominio.RepositorioDeSolicitudes;
import pa.gob.dntic.serviciosolicitudes.dominio.ServicioDeSolicitudes;
import pa.gob.dntic.serviciosolicitudes.dominio.Solicitud;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ServicioSolicitudesApplicationTests {

    private ServicioDeSolicitudes servicio;
    private SolicitudController controller;

    @BeforeEach
    void onBefore() {
        RepositorioDeSolicitudes repositorio = new RepositorioEnMemoria();
        PublicadorDeEventos publicador = evento -> {
        };
        // registrador: ServicioDeSolicitudes.enviar() ahora lo necesita para
        // el outbox; aquí no se verifica nada con él, solo hace falta para
        // poder construir el servicio.
        RegistradorDeEventosSalientes registrador = (eventoId, solicitudId, tipo) -> {
        };
        servicio = new ServicioDeSolicitudes(repositorio, publicador, registrador);
        controller = new SolicitudController(servicio);
    }

    @Test
    void givenUnaSolicitudCreada_whenSeConsultaPorId_thenDevuelveLaSolicitud() {
        Solicitud creada = controller.crearNueva();

        Solicitud consultada = controller.porId(creada.id());

        assertEquals(creada.id(), consultada.id());
        assertEquals(Estado.BORRADOR, consultada.estado());
    }

    @Test
    void givenUnaSolicitudRegistrada_whenSeEnvia_thenQuedaEnviada() {
        controller.crearNueva();

        Solicitud enviada = controller.enviar("INC-002");

        assertEquals(Estado.ENVIADA, enviada.estado());
    }

    @Test
    void givenUnaSolicitudEnviada_whenSeAprueba_thenQuedaAprobada() {
        controller.crearNueva();
        controller.enviar("INC-002");

        Solicitud aprobada = controller.aprobar("INC-002");

        assertEquals(Estado.APROBADA, aprobada.estado());
    }

    @Test
    void givenUnaSolicitudEnviada_whenSeRechaza_thenQuedaRechazada() {
        controller.crearNueva();
        controller.enviar("INC-002");

        Solicitud rechazada = controller.rechazar("INC-002");

        assertEquals(Estado.RECHAZADA, rechazada.estado());
    }

    @Test
    void givenSolicitudesRegistradas_whenSeListan_thenDevuelvenTodas() {
        servicio.registrar("SOL-100", "Incidencia");
        servicio.registrar("SOL-101", "Cambio");

        List<Solicitud> solicitudes = controller.todas();

        assertEquals(2, solicitudes.size());
    }
}


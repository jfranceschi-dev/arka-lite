package pa.gob.dntic.serviciosolicitudes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pa.gob.dntic.serviciosolicitudes.adaptadores.salida.RepositorioEnMemoria;
import pa.gob.dntic.serviciosolicitudes.dominio.Estado;
import pa.gob.dntic.serviciosolicitudes.dominio.PublicadorDeEventos;
import pa.gob.dntic.serviciosolicitudes.dominio.RepositorioDeSolicitudes;
import pa.gob.dntic.serviciosolicitudes.dominio.ServicioDeSolicitudes;
import pa.gob.dntic.serviciosolicitudes.dominio.Solicitud;
import pa.gob.dntic.serviciosolicitudes.dominio.SolicitudNoEncontrada;
import pa.gob.dntic.serviciosolicitudes.eventos.SolicitudEnviada;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ServicioSolicitudesUnitTest {

    private ServicioDeSolicitudes servicio;
    private final List<SolicitudEnviada> eventosPublicados = new ArrayList<>();

    @BeforeEach
    void onBefore() {
        RepositorioDeSolicitudes repositorio = new RepositorioEnMemoria();
        PublicadorDeEventos publicador = eventosPublicados::add;
        servicio = new ServicioDeSolicitudes(repositorio, publicador);
        eventosPublicados.clear();
    }

    @Test
    void givenUnaSolicitudNueva_whenSeRegistra_thenQuedaEnBorrador() {
        Solicitud solicitud = servicio.registrar("SOL-001", "Incidencia");

        assertEquals(Estado.BORRADOR, solicitud.estado());
    }

    @Test
    void givenUnaSolicitudEnBorrador_whenSeEnvia_thenQuedaEnviadaYPublicaEvento() {
        servicio.registrar("SOL-001", "Incidencia");

        Solicitud enviada = servicio.enviar("SOL-001");

        assertEquals(Estado.ENVIADA, enviada.estado());
        assertEquals(1, eventosPublicados.size());
        assertEquals("SOL-001", eventosPublicados.getFirst().id());
        assertEquals("Incidencia", eventosPublicados.getFirst().tipo());
        assertDoesNotThrow(() -> java.util.UUID.fromString(eventosPublicados.getFirst().eventoId()));
    }

    @Test
    void givenUnaSolicitudEnviada_whenSeAprueba_thenQuedaAprobada() {
        servicio.registrar("SOL-002", "Cambio");
        servicio.enviar("SOL-002");

        Solicitud aprobada = servicio.aprobar("SOL-002");

        assertEquals(Estado.APROBADA, aprobada.estado());
    }

    @Test
    void givenUnaSolicitudEnviada_whenSeRechaza_thenQuedaRechazada() {
        servicio.registrar("SOL-003", "Reclamo");
        servicio.enviar("SOL-003");

        Solicitud rechazada = servicio.rechazar("SOL-003");

        assertEquals(Estado.RECHAZADA, rechazada.estado());
    }

    @Test
    void givenDosSolicitudesRegistradas_whenSeListan_thenDevuelvenLasDos() {
        servicio.registrar("SOL-001", "Incidencia");
        servicio.registrar("SOL-002", "Cambio");

        List<Solicitud> solicitudes = servicio.listar();

        assertEquals(2, solicitudes.size());
    }

    @Test
    void givenUnaSolicitudInexistente_whenSeBusca_thenLanzaSolicitudNoEncontrada() {
        assertThrows(SolicitudNoEncontrada.class, () -> servicio.buscar("NO-EXISTE"));
    }

    @Test
    void givenUnaSolicitudEnviada_whenSeEnviaOtraVez_thenLanzaIllegalStateException() {
        servicio.registrar("SOL-004", "Incidencia");
        servicio.enviar("SOL-004");

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> servicio.enviar("SOL-004")
        );

        assertEquals("solo se puede enviar una solicitud en BORRADOR", exception.getMessage());
    }

    @Test
    void givenUnaSolicitudEnBorrador_whenSeAprueba_thenLanzaIllegalStateException() {
        servicio.registrar("SOL-005", "Cambio");

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> servicio.aprobar("SOL-005")
        );

        assertEquals("solo se aprueba una solicitud ENVIADA", exception.getMessage());
    }

    @Test
    void givenUnaSolicitudEnBorrador_whenSeRechaza_thenLanzaIllegalStateException() {
        servicio.registrar("SOL-006", "Reclamo");

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> servicio.rechazar("SOL-006")
        );

        assertEquals("solo se rechaza una solicitud ENVIADA", exception.getMessage());
    }
}

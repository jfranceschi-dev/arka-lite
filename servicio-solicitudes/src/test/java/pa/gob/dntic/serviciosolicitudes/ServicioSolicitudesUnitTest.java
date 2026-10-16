package pa.gob.dntic.serviciosolicitudes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pa.gob.dntic.serviciosolicitudes.adaptadores.salida.RepositorioEnMemoria;
import pa.gob.dntic.serviciosolicitudes.dominio.Estado;
import pa.gob.dntic.serviciosolicitudes.dominio.PublicadorDeEventos;
import pa.gob.dntic.serviciosolicitudes.dominio.RegistradorDeEventosSalientes;
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
    // Se deja esta lista y el publicador que la llena: antes enviar()
    // publicaba sincrónicamente y este era el punto de verificación. Ya no
    // se llena (enviar() ya no llama a publicador.publicar()), así que las
    // pruebas que verifican la publicación ahora usan eventosRegistrados.
    private final List<SolicitudEnviada> eventosPublicados = new ArrayList<>();
    private final List<String[]> eventosRegistrados = new ArrayList<>();

    @BeforeEach
    void onBefore() {
        RepositorioDeSolicitudes repositorio = new RepositorioEnMemoria();
        PublicadorDeEventos publicador = eventosPublicados::add;
        RegistradorDeEventosSalientes registrador = (eventoId, solicitudId, tipo) ->
                eventosRegistrados.add(new String[] { eventoId, solicitudId, tipo });
        servicio = new ServicioDeSolicitudes(repositorio, publicador, registrador);
        eventosPublicados.clear();
        eventosRegistrados.clear();
    }

    @Test
    void givenUnaSolicitudNueva_whenSeRegistra_thenQuedaEnBorrador() {
        Solicitud solicitud = servicio.registrar("SOL-001", "Incidencia");

        assertEquals(Estado.BORRADOR, solicitud.estado());
    }

    @Test
    void givenUnaSolicitudEnBorrador_whenSeEnvia_thenQuedaEnviadaYRegistraEventoEnElOutbox() {
        servicio.registrar("SOL-001", "Incidencia");

        Solicitud enviada = servicio.enviar("SOL-001");

        assertEquals(Estado.ENVIADA, enviada.estado());
        // enviar() ya no publica por HTTP en el mismo hilo: deja el evento
        // registrado (outbox) para que RelevadorDeEventosPendientes lo
        // publique después. Por eso no se verifica eventosPublicados aquí.
        assertEquals(0, eventosPublicados.size());
        assertEquals(1, eventosRegistrados.size());
        assertEquals("SOL-001", eventosRegistrados.getFirst()[1]);
        assertEquals("SolicitudEnviada", eventosRegistrados.getFirst()[2]);
        assertDoesNotThrow(() -> java.util.UUID.fromString(eventosRegistrados.getFirst()[0]));
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

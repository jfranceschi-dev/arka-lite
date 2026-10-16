package pa.gob.dntic.servicionotificaciones;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pa.gob.dntic.servicionotificaciones.adaptadores.salida.RepositorioEnMemoria;
import pa.gob.dntic.servicionotificaciones.dominio.Notificacion;
import pa.gob.dntic.servicionotificaciones.dominio.ServicioDeNotificaciones;
import pa.gob.dntic.servicionotificaciones.eventos.SolicitudEnviada;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ServicioNotificacionesUnitTest {

    private ServicioDeNotificaciones servicio;

    @BeforeEach
    void onBefore() {
        servicio = new ServicioDeNotificaciones(new RepositorioEnMemoria());
    }

    @Test
    void givenUnaSolicitudEnviada_whenSeRecibeElEvento_thenSeGuardaLaNotificacionEsperada() {
        SolicitudEnviada evento = new SolicitudEnviada("EVT-001", "SOL-001", "Incidencia");

        servicio.alRecibirSolicitudEnviada(evento);

        List<Notificacion> notificaciones = servicio.listar();
        assertEquals(1, notificaciones.size());
        assertEquals("Solicitud SOL-001 (Incidencia) enviada", notificaciones.getFirst().texto());
    }

    @Test
    void givenDosSolicitudesEnviadas_whenSeListanLasNotificaciones_thenDevuelvenAmbas() {
        servicio.alRecibirSolicitudEnviada(new SolicitudEnviada("EVT-001", "SOL-001", "Incidencia"));
        servicio.alRecibirSolicitudEnviada(new SolicitudEnviada("EVT-002", "SOL-002", "Cambio"));

        List<Notificacion> notificaciones = servicio.listar();

        assertEquals(2, notificaciones.size());
        assertEquals("Solicitud SOL-001 (Incidencia) enviada", notificaciones.get(0).texto());
        assertEquals("Solicitud SOL-002 (Cambio) enviada", notificaciones.get(1).texto());
    }

    @Test
    void givenUnaSolicitudEnviada_whenSeProcesaElEvento_thenLaNotificacionIncluyeIdYTipo() {
        servicio.alRecibirSolicitudEnviada(new SolicitudEnviada("EVT-003", "SOL-003", "Reclamo"));

        assertEquals("Solicitud SOL-003 (Reclamo) enviada", servicio.listar().getFirst().texto());
    }
}

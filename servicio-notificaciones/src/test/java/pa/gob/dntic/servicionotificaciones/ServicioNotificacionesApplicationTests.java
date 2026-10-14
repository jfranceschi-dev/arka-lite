package pa.gob.dntic.servicionotificaciones;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pa.gob.dntic.servicionotificaciones.adaptadores.entrada.ConsumoIdempotente;
import pa.gob.dntic.servicionotificaciones.adaptadores.entrada.NotificacionController;
import pa.gob.dntic.servicionotificaciones.adaptadores.persistencia.EventoProcesadoRepository;
import pa.gob.dntic.servicionotificaciones.adaptadores.salida.RepositorioEnMemoria;
import pa.gob.dntic.servicionotificaciones.dominio.Notificacion;
import pa.gob.dntic.servicionotificaciones.dominio.ServicioDeNotificaciones;
import pa.gob.dntic.servicionotificaciones.eventos.SolicitudEnviada;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ServicioNotificacionesApplicationTests {

    private ConsumoIdempotente consumo;
    private NotificacionController controller;
    private EventoProcesadoRepository procesados;

    @BeforeEach
    void onBefore() {
        ServicioDeNotificaciones servicio = new ServicioDeNotificaciones(new RepositorioEnMemoria());
        procesados = mock(EventoProcesadoRepository.class);
        when(procesados.existsById(anyString())).thenReturn(false);
        consumo = new ConsumoIdempotente(procesados, servicio);
        controller = new NotificacionController(servicio);
    }

    @Test
    void givenUnEventoCuandoSeManeja_thenSeGeneraLaNotificacion() {
        consumo.alRecibir(new SolicitudEnviada("EVT-100", "SOL-100", "Incidencia"));

        List<Notificacion> notificaciones = controller.todas();

        assertEquals(1, notificaciones.size());
        assertEquals("Solicitud SOL-100 (Incidencia) enviada", notificaciones.getFirst().texto());
    }

    @Test
    void givenDosEventosCuandoSeReciben_thenSeListanLasDosNotificaciones() {
        consumo.alRecibir(new SolicitudEnviada("EVT-101", "SOL-101", "Cambio"));
        consumo.alRecibir(new SolicitudEnviada("EVT-102", "SOL-102", "Reclamo"));

        List<Notificacion> notificaciones = controller.todas();

        assertEquals(2, notificaciones.size());
        assertEquals("Solicitud SOL-101 (Cambio) enviada", notificaciones.get(0).texto());
        assertEquals("Solicitud SOL-102 (Reclamo) enviada", notificaciones.get(1).texto());
    }

    @Test
    void givenListaVacia_whenSeConsultaNotificaciones_thenDevuelveListaVacia() {
        List<Notificacion> notificaciones = controller.todas();

        assertEquals(0, notificaciones.size());
    }

    @Test
    void givenElMismoEventoDosVeces_whenSeRecibe_thenSoloGeneraUnaNotificacion() {
        SolicitudEnviada evento = new SolicitudEnviada("EVT-103", "SOL-103", "Incidencia");
        when(procesados.existsById("EVT-103")).thenReturn(false, true);

        consumo.alRecibir(evento);
        consumo.alRecibir(evento);

        assertEquals(1, controller.todas().size());
    }
}


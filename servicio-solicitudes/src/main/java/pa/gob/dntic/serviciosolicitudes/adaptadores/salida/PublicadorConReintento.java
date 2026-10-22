package pa.gob.dntic.serviciosolicitudes.adaptadores.salida;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import pa.gob.dntic.serviciosolicitudes.dominio.PublicadorDeEventos;
import pa.gob.dntic.serviciosolicitudes.eventos.SolicitudEnviada;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestClient;
import java.util.UUID;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
@Primary
public class PublicadorConReintento implements PublicadorDeEventos {

    // (2) el logger -- una sola linea , con el nombre de esta clase igual en cualquier clase.
    private static final Logger log = LoggerFactory.getLogger(PublicadorConReintento.class);



    private static final int MAXIMO_INTENTOS = 3;
    private static final long ESPERA_MILISEGUNDOS = 500L;

    // (3) RestClient instrumentado (se inyecta; no se crea con resclient.create() para que el tracid cruce)
    private final RestClient rest = RestClient.create();
    private final String url;

    // Esta cola en memoria habría perdido todo al reiniciar el proceso; por
    // eso sigue comentada. Lo que la reemplaza es la tabla `evento`
    // (columna procesado) más RelevadorDeEventosPendientes, que sí sobrevive
    // a un reinicio porque vive en la base, no en memoria.
    //private final Queue<SolicitudEnviada> pendientes = new ConcurrentLinkedQueue<>();

    //@Value("${notificaciones.url}")
    public PublicadorConReintento(@Value("${notificaciones.url}")String url) {
        this.url = url;
    }

    @Override
    public void publicar(SolicitudEnviada evento) {
        //Se camvio para que coincida con los otros metodos y se pueda usar
        //SolicitudEnviada evento = new SolicitudEnviada(UUID.randomUUID().toString(), solicitudId, tipo);

        log.info("publica evento {} de solicitud {}", evento.eventoId(),evento.id());
        for (int intento = 1; intento <= MAXIMO_INTENTOS; intento++) {
            try {
                rest.post()
                        .uri(url)
                        .body(evento)
                        .retrieve()
                        .toBodilessEntity();
                return;
            } catch (RuntimeException ex) {
                if (intento == MAXIMO_INTENTOS) {
                    log.error("no entregado tras {} intentos ; va a outbox: {}",intento,evento.eventoId(),ex);
                    guardarParaReintento(evento);
                    return;
                }
                log.warn("intento {} fallo pra {}; reintentado",intento,evento.eventoId());
                dormir(ESPERA_MILISEGUNDOS * intento);
            }
        }
    }

    private void guardarParaReintento(SolicitudEnviada evento) {
        //pendientes.add(evento);
        // Antes esto se quedaba solo en el log y el evento se perdía para
        // siempre (el guardado en 'pendientes' estaba comentado). Ahora se
        // deja constancia en evento_id (tabla evento, outbox) desde que se
        // creó el evento en ServicioDeSolicitudes.enviar(), así que lanzar
        // aquí no pierde nada: solo le avisa a quien llamó (hoy,
        // RelevadorDeEventosPendientes) que falló, para que no lo marque
        // como procesado y lo reintente en el próximo ciclo.


//        System.err.println("evento no publicado tras agotar reintentos, queda pendiente: " + evento.eventoId());
//        throw new PublicacionFallidaException(evento.eventoId());
    }

    private void dormir(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}

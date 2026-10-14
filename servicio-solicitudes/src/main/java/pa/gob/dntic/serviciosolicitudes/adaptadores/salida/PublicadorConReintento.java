package pa.gob.dntic.serviciosolicitudes.adaptadores.salida;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import pa.gob.dntic.serviciosolicitudes.dominio.PublicadorDeEventos;
import pa.gob.dntic.serviciosolicitudes.eventos.SolicitudEnviada;

import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;

public class PublicadorConReintento {
    private static final int MAXIMO_INTENTOS = 3;
    private static final long ESPERA_MILISEGUNDOS = 500L;

    private final RestClient rest = RestClient.create();
    private final String url;
    //private final Queue<SolicitudEnviada> pendientes = new ConcurrentLinkedQueue<>();

    //@Value("${notificaciones.url}")
    public PublicadorConReintento(String url) {
        this.url = url;
    }

    public void publicar(String solicitudId, String tipo) {
        SolicitudEnviada evento = new SolicitudEnviada(UUID.randomUUID().toString(), solicitudId, tipo);
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
                    guardarParaReintento(evento);
                    return;
                }

                dormir(ESPERA_MILISEGUNDOS * intento);
            }
        }
    }

    private void guardarParaReintento(SolicitudEnviada evento) {
        //pendientes.add(evento);
        System.err.println("evento guardado para reintento: " + evento.eventoId());
    }

    private void dormir(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}

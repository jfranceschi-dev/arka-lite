package pa.gob.dntic.serviciosolicitudes.adaptadores.salida;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import pa.gob.dntic.serviciosolicitudes.dominio.PublicadorDeEventos;
import pa.gob.dntic.serviciosolicitudes.eventos.SolicitudEnviada;

// NO es el bean activo: PublicadorConReintento tiene @Primary, así que
// Spring inyecta ese y no este cuando algo pide un PublicadorDeEventos. Se
// deja esta versión sin reintentos como referencia de "antes" para
// comparar contra PublicadorConReintento.
@Component
public class PublicadorRest implements PublicadorDeEventos {
      private final RestClient rest = RestClient.create();
    private final String url;
    public PublicadorRest(@Value("${notificaciones.url}") String url) {
        this.url = url;
    }

    public void publicar(SolicitudEnviada evento) {
        try {
            rest.post().uri(url)
                .body(evento)
                .retrieve()
                .toBodilessEntity();
        }catch (RuntimeException ex){
            System.err.println("no se pudo notificar (se sigue igual): " + ex.getMessage());
        }
    }

}

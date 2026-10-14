package pa.gob.dntic.serviciosolicitudes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableScheduling: habilita RelevadorDeEventosPendientes, que revisa
// periódicamente la tabla evento en busca de eventos sin publicar.
@SpringBootApplication
@EnableScheduling
public class ServicioSolicitudesApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServicioSolicitudesApplication.class, args);
    }

}

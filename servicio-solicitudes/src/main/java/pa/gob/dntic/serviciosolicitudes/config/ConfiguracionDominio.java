package pa.gob.dntic.serviciosolicitudes.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import pa.gob.dntic.serviciosolicitudes.dominio.PublicadorDeEventos;
import pa.gob.dntic.serviciosolicitudes.dominio.RepositorioDeSolicitudes;
import pa.gob.dntic.serviciosolicitudes.dominio.ServicioDeSolicitudes;

@Configuration
public class ConfiguracionDominio {

    @Bean
    public ServicioDeSolicitudes servicioDeSolicitudes(
            RepositorioDeSolicitudes repositorio,
            PublicadorDeEventos publicador) {
        return new ServicioDeSolicitudes(repositorio, publicador);
    }

    @Bean
    public CommandLineRunner seed(ServicioDeSolicitudes servicio) {
        return args -> {
            servicio.registrar("INC-001", "Incidente");
            servicio.registrar("CAM-002", "Cambio");
            servicio.enviar("CAM-002");   // dispara una notificación al arrancar
        };
    }
}

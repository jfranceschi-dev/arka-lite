package pa.gob.dntic.serviciosolicitudes.config;

import io.micrometer.observation.ObservationRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class PropagacionDeTraza {
    @Bean
    RestClient restClientTrazada(RestClient.Builder builder) {
        return builder.build();
    }
}

//Recuerda: cada servicio necesita micrometer-tracing-bridge-brave y login estructurado (JSON) para que la traza se propague y se pueda reconstruir.
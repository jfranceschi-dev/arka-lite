package pa.gob.dntic.serviciosolicitudes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class PropagacionDeTraza {
    @Bean
    RestClient restClientTrazado(RestClient.Builder builder) {
        return builder.build();
    }

}
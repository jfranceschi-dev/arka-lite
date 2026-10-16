package pa.gob.dntic.serviciosolicitudes.adaptadores.entrada;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pa.gob.dntic.serviciosolicitudes.adaptadores.salida.RepositorioEnMemoria;
import pa.gob.dntic.serviciosolicitudes.dominio.ServicioDeSolicitudes;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SolicitudControllerWebTest {

    private MockMvc mvc;

    @BeforeEach
    void prepararMvc() {
        // tercer argumento (registrador): solo hace falta para que compile;
        // enviar() lo usa para el outbox, esta prueba no verifica eso.
        ServicioDeSolicitudes servicio = new ServicioDeSolicitudes(
                new RepositorioEnMemoria(), evento -> { }, (eventoId, solicitudId, tipo) -> { }
        );
        mvc = MockMvcBuilders.standaloneSetup(new SolicitudController(servicio))
                .setControllerAdvice(new ManejadorGlobalDeErrores())
                .build();
    }

    @Test
    void creaEnviaYExponeLaSolicitudComoJson() throws Exception {
        mvc.perform(post("/solicitudes/crear"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("INC-002"))
                .andExpect(jsonPath("$.estado").value("BORRADOR"));

        mvc.perform(post("/solicitudes/INC-002/enviar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ENVIADA"));
    }

    @Test
    void unaSolicitudInexistenteDevuelveErrorNotFound() throws Exception {
        mvc.perform(get("/solicitudes/NO-EXISTE").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.estado").value(404))
                .andExpect(jsonPath("$.mensaje").value("No existe la solicitud NO-EXISTE"));
    }
}

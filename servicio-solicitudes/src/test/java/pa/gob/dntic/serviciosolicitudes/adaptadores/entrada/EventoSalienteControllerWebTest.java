package pa.gob.dntic.serviciosolicitudes.adaptadores.entrada;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pa.gob.dntic.serviciosolicitudes.dominio.EventoSaliente;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EventoSalienteControllerWebTest {

    @Test
    void exponeLosEventosDelOutboxConSuEstadoDeEntrega() throws Exception {
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new EventoSalienteController(() -> List.of(
                new EventoSaliente("e-1", "CAM-002", "SolicitudEnviada", true),
                new EventoSaliente("e-2", "SOL-100", "SolicitudEnviada", false)))).build();

        mvc.perform(get("/eventos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventoId").value("e-1"))
                .andExpect(jsonPath("$[0].procesado").value(true))
                .andExpect(jsonPath("$[1].solicitudId").value("SOL-100"))
                .andExpect(jsonPath("$[1].procesado").value(false));
    }
}

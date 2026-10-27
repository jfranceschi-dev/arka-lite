package pa.gob.dntic.serviciosolicitudes.adaptadores.entrada;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pa.gob.dntic.serviciosolicitudes.dominio.SolicitudNoEncontrada;
import pa.gob.dntic.serviciosolicitudes.dominio.SolicitudYaExiste;
import pa.gob.dntic.serviciosolicitudes.dominio.TransicionNoPermitida;

@RestControllerAdvice
public class ManejadorGlobalDeErrores {

    @ExceptionHandler(SolicitudNoEncontrada.class)
    public ResponseEntity<ErrorRespuesta> noEncontrada(SolicitudNoEncontrada ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorRespuesta(404, ex.getMessage()));
    }

    @ExceptionHandler(SolicitudYaExiste.class)
    public ResponseEntity<ErrorRespuesta> yaExiste(SolicitudYaExiste ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorRespuesta(409, ex.getMessage()));
    }

    @ExceptionHandler(TransicionNoPermitida.class)
    public ResponseEntity<ErrorRespuesta> transicionNoPermitida(TransicionNoPermitida ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorRespuesta(409, ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorRespuesta> datosInvalidos(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorRespuesta(400, ex.getMessage()));
    }
}

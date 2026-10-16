package pa.gob.dntic.servicionotificaciones.adaptadores.persistencia;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoProcesadoRepository extends JpaRepository<EventoProcesadoEntity, String> {
}

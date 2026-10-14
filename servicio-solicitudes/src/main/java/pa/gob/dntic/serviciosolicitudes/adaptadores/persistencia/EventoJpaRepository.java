package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventoJpaRepository extends JpaRepository<EventoEntity, Long> {
    List<EventoEntity> findByProcesadoFalse();
}

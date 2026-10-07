package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoJpaRepository extends JpaRepository<EventoEntity, Long> {
}

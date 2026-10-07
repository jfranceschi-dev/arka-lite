package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Spring Data genera la implementacion (SELECT/INSERT/UPDATE/DELETE) sola
public interface SolicitudJpaRepository extends JpaRepository<SolicitudEntity, String> {
    List<SolicitudEntity> findByEstado(String estado); // usa el indice sobre estado (S45)
}

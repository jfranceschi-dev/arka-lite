package pa.gob.dntic.serviciosolicitudes.adaptadores.persistencia;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;
import pa.gob.dntic.serviciosolicitudes.dominio.Estado;
import pa.gob.dntic.serviciosolicitudes.dominio.RepositorioDeSolicitudes;
import pa.gob.dntic.serviciosolicitudes.dominio.Solicitud;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class RepositorioJpa implements RepositorioDeSolicitudes {
    private final SolicitudJpaRepository jpa;

    public RepositorioJpa(SolicitudJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public void guardar(Solicitud s) {
        jpa.save(new SolicitudEntity(
                s.id(),
                s.tipo(),
                s.estado().name()
        ));
    }

    @Override
    public Optional<Solicitud> buscar(String id) {
        return jpa.findById(id).map(this::aDominio);
    }

    @Override
    public List<Solicitud> todas() {
        return jpa.findAll().stream().map(this::aDominio).toList();
    }

    private Solicitud aDominio(SolicitudEntity e) {
        return new Solicitud(
                e.getId(),
                e.getTipo(),
                Estado.valueOf(e.getEstado())
        );
    }
}

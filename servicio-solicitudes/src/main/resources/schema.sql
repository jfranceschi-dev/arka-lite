CREATE TABLE IF NOT EXISTS solicitud (
    id VARCHAR(20) PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL
    CHECK (estado IN ('BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA'))
);

CREATE INDEX IF NOT EXISTS idx_solicitud_estado ON solicitud (estado);


CREATE TABLE IF NOT EXISTS evento (
    id BIGSERIAL PRIMARY KEY,
    solicitud_id VARCHAR(20) NOT NULL
    REFERENCES solicitud(id),
    tipo VARCHAR(30) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evento_solicitud ON evento (solicitud_id);
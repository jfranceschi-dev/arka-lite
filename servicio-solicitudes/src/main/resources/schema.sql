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
    tipo VARCHAR(30) NOT NULL,
    -- evento_id: mismo id que se manda por HTTP a notificaciones. Se guarda
    -- aquí para que un reintento publique siempre el mismo id (y el
    -- idempotente del otro lado lo pueda deduplicar).
    evento_id UUID NOT NULL DEFAULT gen_random_uuid(),
    -- procesado: outbox. false = todavía no se publicó con éxito.
    -- RelevadorDeEventosPendientes solo toca los que están en false.
    procesado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_evento_solicitud ON evento (solicitud_id);
CREATE INDEX IF NOT EXISTS idx_evento_pendiente ON evento (procesado) WHERE procesado = FALSE;
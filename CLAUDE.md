# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

ARKA-Lite is a learning/lab project: two independent Spring Boot 4.1.1 microservices on **Java 26**, each its own Maven project (own `pom.xml`, Maven Wrapper, `Dockerfile`). **There is no root `pom.xml`** — always run Maven from inside a service folder.

- `servicio-solicitudes` (port 8080): create/list/send/approve/reject *solicitudes*; owns the outbox.
- `servicio-notificaciones` (port 8081 via Compose/local, 8080 inside its container): consumes the `SolicitudEnviada` event and records a notification.
- `arka-lite-ui/` (Node 24, React + Vite + Tailwind): the minimal UI that consumes both services, with four tabs: **Solicitudes** (`#/solicitudes`, default: create via `POST /solicitudes`, list all/own ones in jQuery DataTables, Tom Select for the type, SweetAlert2 confirmations for Enviar/Aprobar/Rechazar), **Enviadas** (outbox vs consumed events, Reentregar to show idempotency), **Salud** (validate both services, links to Swagger and Grafana served by nginx at `/enlaces.json`) and **Ayuda** (step-by-step diagrams; topics in `contenido/ayuda.ts`, diagrams in `diagramas/`). The template colors are customizable at runtime (`web/src/estado/tema.tsx`, TGS navy/cyan by default). It does NOT generate presentations. Runs as part of `compose.yaml` (port 8088) or via `k8s/arka-lite-ui.yaml` (applied with the rest of `k8s/`). Details in `arka-lite-ui/README.md`.
- `docs/presentation-data/` (Node 24, own `package.json`): the final presentation of the **Upskilling Backend Java** course. Owns its content (`contenido/`), slide diagrams, the PPTX/PDF/script generators and the generated `pptx/`, `pdf/`, `guiones/` (don't edit those by hand; run `npm run todo` there). Slides draw icons as native vector shapes from `diseno/iconos.ts` (Lucide subset) and embed real screenshots from `capturas/` (refresh them with `capturas/capturar.ps1` while the Compose stack is up). The audience is technology staff (many used to stored procedures): three variants (`resumen` ⊂ `ejecutivo` ⊂ `tecnico`), eight numbered parts each ending in an `aprendizajes` slide, one slide per idea (no step-by-step repeats, no per-presenter split), plain-language explanations of jargon (hexagonal, ORM, Docker, Kubernetes), and the UI framed as a lab to show failure behavior, not a deliverable. Older decks live in `BackUp-pptx/`. Write in neutral Panamanian Spanish.

Code, domain names, docs, branch names and commit messages are in **Spanish**; follow that.

## Commands

Run from inside `servicio-solicitudes/` or `servicio-notificaciones/` (`.\mvnw.cmd` on PowerShell, `./mvnw` in bash):

```bash
./mvnw clean verify                                # compile + all tests (what CI runs, per service)
./mvnw test                                        # tests only
./mvnw test -Dtest=ServicioSolicitudesUnitTest     # single class
./mvnw test -Dtest=SolicitudTest#nombreDelMetodo   # single method
```

Tests do **not** need PostgreSQL: there are no `@SpringBootTest`/`@DataJpaTest` tests. Tests build the domain by hand with `RepositorioEnMemoria` and lambdas for ports, and controllers via `MockMvcBuilders.standaloneSetup`. If you add a constructor parameter to `ServicioDeSolicitudes` (or similar), every test that constructs it must be updated.

Whole system (from repo root):

```bash
docker compose up --build -d     # both services, two Postgres 17, the UI (8088), Loki (3100), Promtail, Grafana (3000)
docker compose logs servicio-solicitudes
docker compose down
bash smoke.sh                    # end-to-end smoke test against Compose
```

Images don't mount source; any Java change requires `--build`.

Running the apps outside Docker requires PostgreSQL: solicitudes → `localhost:5432/db-solicitudes`, notificaciones → `localhost:5433/db-notificaciones` (user/pass `arka`, overridable via `DB_URL`/`DB_USER`/`DB_PASSWORD`). Compose only publishes the notificaciones DB (5433), not the solicitudes DB — see `docs/inicio/bases-de-datos-locales.md`. Start notificaciones with `-Dspring-boot.run.arguments=--server.port=8081`; solicitudes targets it via `NOTIFICACIONES_URL` (default `http://localhost:8081/eventos/solicitud-enviada`).

Kubernetes (Docker Desktop or minikube): `bash construir.sh` builds `servicio-*:local` and `arka-lite-ui:local` images, then `kubectl apply -f k8s/`. `verificar_sistema.sh` checks Docker/CI/K8s layers end to end.

## Architecture

Both services use hexagonal packages under `pa.gob.dntic.<servicio>`:

- `dominio/` — records and ports (interfaces), no Spring annotations. Exception: `ServicioDeSolicitudes.enviar()` uses `jakarta.transaction.Transactional`.
- `adaptadores/entrada/` — REST controllers, error handling, and (in notificaciones) `ConsumoIdempotente`.
- `adaptadores/salida/` — HTTP publishers, in-memory repositories, the outbox relay.
- `adaptadores/persistencia/` — JPA entities/repositories.
- `config/` (solicitudes) / `ConfiguracionNotificaciones` — domain services are **not** component-scanned; they are wired as `@Bean`s here.

**Multiple adapters per port, selected by `@Primary`.** This is deliberate teaching material, not dead code — don't delete it as cleanup:
- `RepositorioDeSolicitudes`: active = `RepositorioJpa` (`@Primary`); `RepositorioEnMemoria` and `RepositorioQueRegistra` are alternatives (the in-memory one is used by tests).
- `PublicadorDeEventos`: active = `PublicadorConReintento` (`@Primary`); `PublicadorRest` is the simpler original.
- `OperacionEnviar` is an unused alternative transactional approach kept for comparison.

### Event flow (outbox + idempotent consumer)

1. `POST /solicitudes/{id}/enviar` → `ServicioDeSolicitudes.enviar()` saves the solicitud as `ENVIADA` and, in the same transaction, inserts a row in table `evento` (`procesado=false`, fresh `evento_id` UUID) through the `RegistradorDeEventosSalientes` port. No HTTP call happens in the request.
2. `RelevadorDeEventosPendientes` (`@Scheduled(fixedDelay = 5000)`, enabled by `@EnableScheduling`) reads pending events and calls `PublicadorConReintento` (3 attempts, linear backoff). On final failure it throws `PublicacionFallidaException`, the row stays `procesado=false` and is retried next cycle with the **same** `evento_id`.
3. Notificaciones `POST /eventos/solicitud-enviada` → `ConsumoIdempotente` skips events whose `eventoId` is already in table `evento_procesado`, otherwise creates the notification and records the id.

Notification texts live only in memory (`RepositorioEnMemoria`); only processed event ids are persisted. The `SolicitudEnviada(eventoId, id, tipo)` record is duplicated in both services' `eventos/` package — it is the HTTP contract, so change both together.

Outgoing HTTP must use the injected `restClientTrazada` bean (built from `RestClient.Builder` in `PropagacionDeTraza`) so Micrometer/Brave propagates the trace id across services; `RestClient.create()` would break trace correlation. Logs are ECS-structured JSON; Promtail ships container logs to Loki for querying by `traceId` in Grafana.

### Database schema

No Flyway/Liquibase.
- **solicitudes:** `schema.sql` runs on every startup (`spring.sql.init.mode=always`) and Hibernate runs with `ddl-auto=validate`. Schema changes go into `schema.sql` as idempotent SQL (`CREATE ... IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) that also upgrades existing databases, and entities must match or startup fails.
- **notificaciones:** `ddl-auto=update`. `schema.notificaciones.sql` is set as a schema location, but `spring.sql.init.mode` isn't, so it only runs against embedded DBs; in PostgreSQL Hibernate creates the table.

### Seed data and CI coupling

`ConfiguracionDominio.seed` (a `CommandLineRunner`) registers `INC-001` and `CAM-002` and sends `CAM-002` on **every** startup. `POST /solicitudes` creates a solicitud with a chosen id (201, 409 if it exists, 400 if data is missing); `POST /solicitudes/crear` is a demo shortcut that always creates or resets `INC-002`. Invalid state transitions return 409 (`TransicionNoPermitida`). `GET /eventos` lists the outbox. CI (`.github/workflows/ci.yml`) runs `mvn -B verify` per service against a Postgres service container, then boots the solicitudes JAR and polls `GET /solicitudes` until it contains `CAM-002` — changing the seed breaks CI. CI then pushes images to GHCR tagged with the commit SHA.

## Conventions (from `docs/desarrollo/`)

- Branches: `feat/…`, `fix/…`, `docs/…` (lowercase, hyphens, no accents). No direct pushes to `main`; PR with one approval.
- Conventional Commits in Spanish, lowercase, imperative, no trailing period: `fix: impedir el envío de una solicitud aprobada`.
- Constructor injection only; domain rules stay out of controllers; keep the domain free of Spring.
- Human documentation lives in `docs/` and must be linked from `docs/README.md`; update the affected docs in the same PR when behavior, ports, env vars, commands or contracts change. Doc examples use PowerShell.

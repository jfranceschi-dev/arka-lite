# Laboratorio 24 — Transacciones desde el adaptador

**Sesión 48 · estudio independiente · mínimo 2 horas**

Del taller, ARKA ya guarda en una base real. Ahora demuestras que una operación que toca **dos tablas** es **atómica**: o se completa entera, o **no deja rastro**. Implementas la operación y **provocas un fallo** para comprobar el rollback. `verificar.sh` (desde `ejemplo/`, con Docker) te califica de **0 a 5**.

## Qué implementar

En el adaptador de persistencia, dos endpoints sobre `servicio-solicitudes`:

1. **`POST /solicitudes/{id}/enviar`** — la operación **`@Transactional`** que escribe en **dos tablas**: actualiza `solicitud.estado = 'ENVIADA'` **y** inserta una fila en `evento`.
2. **`POST /solicitudes/{id}/enviar-con-fallo`** — la **misma** operación, pero forzando un fallo **entre** las dos escrituras (p. ej., insertar un `evento` con un `solicitud_id` inexistente, que viola la clave foránea). Debe estar **`@Transactional`** también.

La clave: como ambas están envueltas en una transacción, cuando la segunda escritura de `enviar-con-fallo` revienta, Spring hace **rollback** y la primera (el `UPDATE`) **no queda**.

## Las cinco compuertas

1. La **base responde** y tiene la tabla `solicitud`.
2. **Camino bueno:** `enviar` deja `estado='ENVIADA'` **y** 1 evento (las dos escrituras).
3–4. **Atomicidad:** tras `enviar-con-fallo`, la solicitud sigue en `BORRADOR` y **sin eventos** — el rollback deshizo la primera escritura. *(Vale 2 puntos: es el corazón del lab.)*
5. La conexión a la base usa el **nombre** `base-datos` por config (no `localhost`).

## Cómo probar

```
docker compose up --build
curl -X POST localhost:8080/solicitudes/LAB-OK/enviar          # debe dejar estado+evento
curl -X POST localhost:8080/solicitudes/LAB-FALLO/enviar-con-fallo   # debe fallar y NO dejar nada
bash verificar.sh
docker compose down
```
Para mirar la base a mano: `docker compose exec base-datos psql -U arka -d arka -c "SELECT * FROM solicitud;"`

## Trampas que el verificador castiga

- **Sin `@Transactional`** en `enviar-con-fallo` → la primera escritura **sí** queda cuando la segunda falla: dato a medias. Reprueba las 3–4. **Ese es el punto entero del lab.**
- **Atrapar la excepción dentro del método** (try/catch que se la traga) → Spring no ve el fallo y **no** hace rollback. Deja que la excepción salga.
- **Escribir en una sola tabla** → no hay atomicidad que probar. Deben ser dos escrituras.
- **`localhost` en `DB_URL`** → dentro del contenedor no es la base. Usa `base-datos`. (Compuerta 5.)

## Retos de estiramiento (para las horas completas)

- **Persistencia real entre `down`/`up`.** Agrega un **volumen** a Postgres en el compose para que los datos sobrevivan a `docker compose down`. ¿Por qué sin volumen se pierden?
- **`aprobar` transaccional.** Repite el patrón para "aprobar" (estado `APROBADA` + evento). Misma forma.
- **¿Qué NO revierte?** Investiga: si dentro de la transacción haces una llamada REST a otro servicio (como notificaciones), ¿el rollback deshace **esa** llamada? (No — es el problema de la consistencia distribuida, que viene en S49.)
- **Aislamiento.** Dos `enviar` a la misma solicitud a la vez: ¿qué pasa? (Otra vez, el tema de S49.)

## Cómo se evalúa

Tu **puntaje /5** es la nota; las cinco son obligatorias. Las 3–4 (atomicidad) son el corazón: el criterio del programa es literal — *ante el fallo simulado, no quedan datos parciales.* Un `@Transactional` que no revierte no sirve; hay que **verlo** revertir.

**Criterio de aceptación (del programa):** *la operación es atómica: o se completa entera o no deja rastro.* 5/5 = adaptador de persistencia con transacciones seguras — Etapa 3a cerrada.

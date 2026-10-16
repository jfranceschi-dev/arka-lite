# Plantilla de diseño — flujo consistente

## Operación: Aprobar una solicitud

## Diagrama (edítalo)
```
[ solicitudes ]                                               [ notificaciones ]
(su base: db_solicitudes)                                      (su base: db_notificaciones)
|                                                               ^
|  1. Transacción local:                                        |
|     UPDATE solicitud SET estado = 'APROBADA'                  |
|     (commit en SU base)                                       | 4. Consumo IDEMPOTENTE:
|                                                               |    Guarda eventoId en db_notificaciones
|  2. Publica evento SolicitudAprobada ------------------------> 3. Recibe evento
|     Payload: { eventoId: "evt-99", solicitudId: "SOL-1" }     |    ¿eventoId ya está en su base?
|                                                               |    - SÍ -> Ignora (deduplica)
v                                                               |    - NO -> Registra aviso
APROBADA                                                        v
                                                               Aviso creado (una vez)
```


## Preguntas (respóndelas para TU diseño)

- **Dueño de cada dato:**
- -->**solicitudes**: es dueño exclusivo del estado de la solicitud (APROBADA).   
- -->**notificaciones**:  es dueño exclusivo de la bitácora y envío de avisos.
- -->**Demostración de independencia**: Ningún servicio tiene credenciales ni acceso a la base de datos del otro.

- **Cómo se propaga el cambio:** 
- --> Mediante un evento de dominio asíncrono (SolicitudAprobada).   
- --> El evento incluye un identificador único del evento (id), el solicitudId, y la fecha/hora.
- **Si el evento se pierde:** 
- --> Se aplica una estrategia de entrega al menos una vez con reintentos automáticos hasta que notificaciones confirme la recepción.
- **Si el evento llega duplicado:** 
- --> El servicio notificaciones mantiene una tabla de eventos procesados (eventos_procesados con llave primaria evento_id).   
- --> Antes de procesar o enviar el aviso, consulta si el id del evento ya existe en su base. Si existe, lo omite inmediatamente; si no existe, procesa el envío y guarda el id en la misma transacción local.
- **Ventana de inconsistencia / cuándo converge:** 
- --> **Ventana de inconsistencia:** Inicia en el instante en que solicitudes hace commit del estado APROBADA y termina cuando notificaciones consume el evento y registra la notificación.   
- --> **Convergencia:** Es una consistencia eventual (suele tardar milisegundos en red normal, o segundos si hay reintentos).
- **Compensación (si aplica):** 
- --> Este flujo (aprobar a notificar), la falla en notificaciones no debe desaprobar la solicitud. Se confía en la reentrega idempotente del evento.

---

## Ejemplo RESUELTO (otra operación: "enviar") — úsalo de modelo, NO lo copies

**Operación:** enviar una solicitud (solicitudes → notificaciones).

- **Dueño:** solicitudes es dueño del estado; notificaciones es dueño de los avisos. Ninguno toca la base del otro.
- **Propagación:** solicitudes hace su transacción local (estado=ENVIADA, commit) y **publica** `SolicitudEnviada{ id:"evt-42", solicitudId:"CAM-002" }`.
- **Pérdida:** si el evento no llega, se **reintenta** (al menos una vez) hasta confirmar entrega.
- **Duplicado:** notificaciones guarda los `id` de eventos procesados; si `evt-42` llega otra vez, lo **ignora** → un solo aviso.
- **Ventana:** entre el commit de solicitudes y la llegada del evento, notificaciones aún no sabe. Convergen cuando el evento se entrega (segundos, normalmente).
- **Compensación:** enviar no requiere deshacer nada aguas arriba; basta evento + idempotencia. (Una operación que SÍ requiera deshacer usaría saga.)
```
  [ solicitudes ]                                   [ notificaciones ]
   (su base)                                          (su base)
       |  1. transacción local: estado = APROBADA          ^
       |     (commit en SU base)                           |
       |                                                   | 4. consumir IDEMPOTENTE
       |  2. publica evento -----(evento: id, ...)---------> 3. recibe (¿ya visto el id? -> ignora)
       |                                                   |    si es nuevo: registra aviso
       v                                                   v
    APROBADA                                          Aviso creado (una vez)
```

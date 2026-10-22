# Corrección del arranque con una base existente

`schema.sql` agrega las columnas `evento_id` y `procesado` antes de crear
el índice de pendientes. Puede ejecutarse nuevamente sin reemplazar los
UUID ni cambiar el estado de los eventos existentes del outbox.

Los eventos de una tabla anterior al outbox reciben un UUID y quedan como
procesados para evitar reenviar notificaciones históricas con identificadores
nuevos. Esto no acredita su entrega: si hubo entregas fallidas históricas,
deben conciliarse con notificaciones antes de reactivarlas manualmente.
Los eventos nuevos mantienen `procesado = false` por defecto.

Promtail usa `observabilidad/promtail.yaml`, un archivo montado en modo
lectura. El montaje rechaza una ruta inexistente en vez de crear una carpeta.
La carpeta antigua `promtail-config.yaml` ya no se utiliza.

Desde la raíz del proyecto:

```powershell
docker compose config --quiet
docker compose up --build -d
docker compose ps -a
docker compose logs --tail 100 servicio-solicitudes promtail
```

Solicitudes debe completar el inicio sin errores de columnas; Promtail debe
permanecer ejecutándose sin errores al leer la configuración ni enviar logs.
En Grafana, configurar la fuente Loki con URL `http://loki:3100` y consultar
`{service="servicio-solicitudes"}` en Explore para verificar la recepción.

No eliminar los volúmenes para corregir este problema: contienen los datos
existentes de PostgreSQL.

# Demostración en vivo con GitHub Codespaces

Un Codespace es una computadora Linux en la nube que GitHub crea a partir del repositorio y que se usa desde el navegador. Sirve para hacer la demostración de la UI sin Docker en la computadora de quien presenta y sin depender de la red corporativa: las imágenes se construyen en la nube, y el navegador solo necesita llegar a GitHub.

La configuración está en [`.devcontainer/`](../../.devcontainer/):

| Archivo | Qué hace |
| --- | --- |
| `devcontainer.json` | Pide una máquina de 4 núcleos, instala Docker dentro del contenedor (docker-in-docker) y reenvía los puertos de la UI, Grafana y los dos Swagger. |
| `levantar.sh` | Construye las imágenes al crear el Codespace y, cada vez que arranca, levanta el sistema con `docker compose up --build -d` y espera a que la UI vea los dos servicios. |

Docker corre **dentro** del Codespace porque Promtail lee los logs del mismo Docker que corre los contenedores, y `compose.yaml` monta `observabilidad/promtail.yaml` desde la carpeta del proyecto.

## Antes de empezar

- Una cuenta de GitHub con acceso a `jfranceschi-dev/arka-lite`.
- La configuración tiene que estar en la rama desde la que se crea el Codespace. Mientras no llegue a `main`, se elige la rama que la tiene.
- Cuota: GitHub cobra Codespaces por horas de núcleo. Esta máquina tiene 4 núcleos, así que cada hora encendida consume 4 horas de núcleo de la cuota mensual de la cuenta. Hay que detenerlo al terminar.

## Crear el Codespace

Desde GitHub: **Code › Codespaces › Create codespace on** la rama elegida. O desde PowerShell con la CLI de GitHub:

```powershell
gh codespace create --repo jfranceschi-dev/arka-lite --branch main
gh codespace code --web
```

La primera vez tarda varios minutos: descarga las imágenes base y compila los dos servicios Java y la UI. Al terminar, `levantar.sh` levanta los ocho contenedores, espera a que la UI vea los dos servicios y escribe "ARKA-Lite está arriba" en la terminal de creación. El puerto 8088 suele abrirse solo en otra pestaña; si no, se abre desde **PORTS**.

## Abrir la UI, Swagger y Grafana

En la pestaña **PORTS** del Codespace aparecen los puertos con su nombre:

| Puerto | Qué es |
| --- | --- |
| 8088 | UI de ARKA-Lite |
| 3000 | Grafana |
| 18080 | solicitudes · Swagger |
| 18081 | notificaciones · Swagger |

Cada puerto tiene su propia dirección `https://<codespace>-<puerto>.app.github.dev`. Por eso `levantar.sh` escribe un archivo `.env` (ignorado por Git) con las direcciones del Codespace, y `compose.yaml` las usa para los enlaces a Swagger y Grafana de la pestaña **Salud** de la UI. Fuera de Codespaces no hay `.env` y los enlaces siguen apuntando a `localhost`.

| Variable de `.env` | Para qué |
| --- | --- |
| `ARKA_URL_PUBLICA_SOLICITUDES` | Enlace a Swagger de solicitudes. |
| `ARKA_URL_PUBLICA_NOTIFICACIONES` | Enlace a Swagger de notificaciones. |
| `ARKA_URL_PUBLICA_GRAFANA` | Enlace a Grafana y su dirección raíz (`GF_SERVER_ROOT_URL`). |
| `ARKA_FORWARD_HEADERS` | `framework`: los servicios leen las cabeceras `X-Forwarded-*` del proxy https, y Swagger arma bien la dirección de **Try it out**. |

Los puertos son **privados**: solo los abre la cuenta dueña del Codespace, en un navegador con la sesión de GitHub iniciada. Para la demostración basta con presentar desde esa cuenta; no hace falta hacerlos públicos.

## Durante la demostración

Los comandos de la demostración se escriben en la terminal del Codespace (Bash), desde la raíz del repositorio:

```bash
docker compose stop servicio-notificaciones    # notificaciones cae: Salud lo muestra en rojo
docker compose start servicio-notificaciones   # vuelve: el evento pendiente se entrega
docker compose ps                              # estado de los contenedores
docker compose logs -f servicio-solicitudes    # logs de un servicio
```

La demostración con Kubernetes (borrar un Pod y ver que vuelve) no está en el Codespace: necesita el clúster local de [Kubernetes con Docker Desktop](kubernetes-local.md).

## Lista para el día de la presentación

1. Arrancar el Codespace unos 15 minutos antes y esperar el mensaje "ARKA-Lite está arriba".
2. Abrir el puerto 8088 y comprobar en **Salud** que los dos servicios están en verde.
3. Probar los enlaces a Swagger y a Grafana desde la pestaña **Salud**.
4. Dejar abierta la terminal del Codespace para los comandos de la demostración.
5. Tener a mano el plan B: las capturas de [`presentation-data/capturas/`](../presentation-data/capturas/) ya están en las láminas.

Un Codespace sin uso se detiene solo después de 30 minutos, el valor por defecto. Para una presentación larga se puede subir en **GitHub › Settings › Codespaces › Default idle timeout**.

## Comprobar que todo funciona

`smoke.sh` levanta el sistema, comprueba siete capas y al final ejecuta `docker compose down`. Si se usa antes de presentar, hay que volver a levantar el sistema después:

```bash
bash smoke.sh
bash .devcontainer/levantar.sh
```

## Al terminar

Desde GitHub (**Code › Codespaces**) o desde PowerShell:

```powershell
gh codespace list
gh codespace stop
gh codespace delete
```

`stop` conserva el Codespace y sus imágenes para la próxima vez; `delete` lo borra.

## Si algo falla

| Síntoma | Qué revisar |
| --- | --- |
| El puerto 8088 no abre o da error 502 | Los servicios todavía arrancan. En la terminal: `docker compose ps` y, si hace falta, `bash .devcontainer/levantar.sh`. |
| Los enlaces de Swagger o Grafana van a `localhost` | Falta `.env` o hay uno propio. Volver a ejecutar `bash .devcontainer/levantar.sh`, que lo escribe si no existe uno a mano. |
| Grafana no muestra logs | En Grafana, la fuente de datos Loki con URL `http://loki:3100`; ver [observabilidad](observabilidad.md). |
| "Docker no arrancó dentro del contenedor" | Reconstruir el contenedor: **Ctrl+Shift+P › Codespaces: Rebuild Container**. |

Volver a [Operaciones](README.md).

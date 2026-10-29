# arka-lite-ui · La interfaz de ARKA-Lite

Aplicación web minimalista para usar los dos microservicios de ARKA-Lite y entender cómo funcionan. Tiene cuatro pestañas:

| Pestaña | Ruta | Para qué sirve |
| --- | --- | --- |
| **Solicitudes** (inicio) | `#/solicitudes` | Crear una solicitud con `POST /solicitudes` (identificador y tipo con Tom Select), ver todas o solo las creadas desde este navegador en una tabla jQuery DataTables (buscar, ordenar, paginar) y ejecutar la acción que corresponde a cada una: Enviar, Aprobar o Rechazar. Cada acción pide confirmación con SweetAlert2. |
| **Enviadas** | `#/enviadas` | El recorrido del evento de cada envío (registrado → entregado → consumido → aviso), los totales y **Reentregar**, que manda otra vez el mismo evento para comprobar que el aviso no se duplica. Se actualiza sola cada 5 s mientras hay eventos en camino. Si notificaciones no responde, lo dice, cuenta los eventos que esperan en la bandeja de salida y sigue consultando hasta que vuelva; un evento consumido cuyo aviso se perdió al reiniciar notificaciones aparece como “Aviso no disponible”. |
| **Salud** | `#/salud` | **Validar servicios**: estado, tiempo de respuesta y base de datos de cada servicio, con accesos a los contratos Swagger y a Grafana. |
| **Ayuda** | `#/ayuda/{tema}` | Explica la app con diagramas paso a paso: qué es ARKA-Lite, crear, enviar, por qué el aviso no se duplica, cómo saber si todo funciona, la arquitectura completa y, para el equipo técnico, cada flujo del código y los contratos de la API. |

En la barra superior están, además, el indicador de salud, el menú **Contratos** (Swagger de cada API y Grafana) y el botón para **personalizar los colores** de la plantilla.

La UI no genera presentaciones. La presentación del curso vive en su propio proyecto: [`docs/presentation-data/`](../docs/presentation-data/README.md).

## Diseño

- **Propuesta A · Minimal** del lienzo de diseño: barra superior con pestañas, contenido centrado y un solo acento.
- **Tema personalizable:** TGS (marino y cian) por defecto, tres paletas más y un color principal y un acento libres. Los demás tonos se derivan con contraste suficiente. Se guarda en el navegador (`estado/tema.tsx`, variables `--tema-*` en `web/src/estilos/plantilla.css`).
- **Animación propia, el "hilo de eventos":** una línea fina bajo la barra por la que viaja un destello cada vez que un evento termina su recorrido entre los dos servicios. Las pantallas entran subiendo 6 px y las filas nuevas se iluminan un instante. Todo se apaga con *sin movimiento* o con la preferencia del sistema.
- **Librerías:** jQuery DataTables (tablas), Tom Select (selector de tipo), SweetAlert2 (confirmaciones y avisos), todas con el estilo de la plantilla.

## Estructura

```text
arka-lite-ui/
├── contenido/        Operaciones de la API (laboratorio.ts) y temas de Ayuda (ayuda.ts)
├── diagramas/        Diagramas de Ayuda (nodos, aristas, pasos) y su geometría
├── diseno/           Tokens de color, tipografía y radios
├── web/src/
│   ├── api/          Cliente HTTP con historial y formas de las respuestas
│   ├── componentes/  Marco, TablaDatos (DataTables), SelectorTipo (Tom Select), diálogos (SweetAlert2)
│   ├── diagramas/    Dibujo SVG animado de las definiciones
│   ├── estado/       Datos de los servicios, tema, enlaces, historial y preferencias
│   ├── estilos/      Tailwind, tokens y plantilla.css
│   └── vistas/       Solicitudes, Enviadas, Salud y Ayuda
├── pruebas/          Pruebas de la UI, del cliente, de las operaciones y de los diagramas (Vitest)
├── despliegue/       Plantilla de nginx: servidor web, proxy de las API y /enlaces.json
└── Dockerfile
```

Fuera de esta carpeta, la UI usa:

| Archivo | Para qué |
| --- | --- |
| `compose.yaml` | El servicio `arka-lite-ui`, junto con los demás del sistema. |
| `k8s/arka-lite-ui.yaml` | ConfigMap, Deployment y Service. Se aplica con el resto de `k8s/`. |
| `.github/workflows/ci.yml` | Job `arka-lite-ui`: valida, prueba, construye y publica la imagen. |

## Requisitos

- Node.js 24 (mínimo 22.18: los scripts `.ts` se ejecutan con Node sin compilar).
- Para Compose: Docker con Compose v2. Para Kubernetes: un clúster local (Docker Desktop o minikube).

## Comandos

Desde `arka-lite-ui/`:

```powershell
npm ci                    # instala dependencias
npm run dev               # UI en http://localhost:5173; el proxy de Vite llama a localhost:8080 y :8081
npm test                  # pruebas (Vitest + Testing Library)
npm run validar           # coherencia de operaciones, temas de Ayuda y diagramas
npm run typecheck         # TypeScript
npm run build             # web/dist
npm run todo              # todo lo anterior en orden
```

`npm run dev` necesita los servicios Java en `localhost:8080` (solicitudes) y `localhost:8081` (notificaciones), como en `docs/inicio/instalacion-y-debug.md`. Para otros destinos: `ARKA_SOLICITUDES_ORIGEN` y `ARKA_NOTIFICACIONES_ORIGEN`.

## Docker Compose

La UI es parte de `compose.yaml`: se levanta con el resto del sistema. Desde la raíz del repositorio:

```powershell
docker compose up --build -d
docker compose ps
```

| Dirección | Valor |
| --- | --- |
| La usa el navegador | `http://localhost:8088` y `http://localhost:8088/api/…` (mismo origen) |
| La usa el proxy | `http://servicio-solicitudes:8080` y `http://servicio-notificaciones:8080` |
| Puerto publicado | `8088` |
| Puerto del contenedor | `8080` (nginx sin privilegios) |

Compose publica las API en `http://localhost:18080` (solicitudes) y
`http://localhost:18081` (notificaciones). Los enlaces de Swagger se ajustan
automáticamente con `SOLICITUDES_PORT` y `NOTIFICACIONES_PORT`; el proxy sigue
usando los nombres y puertos internos. Si el navegador llega por otra dirección,
como en GitHub Codespaces, `ARKA_URL_PUBLICA_SOLICITUDES`,
`ARKA_URL_PUBLICA_NOTIFICACIONES` y `ARKA_URL_PUBLICA_GRAFANA` (en `.env`)
reemplazan a `http://localhost:…` en los enlaces; ver
[`docs/operaciones/codespaces.md`](../docs/operaciones/codespaces.md). Para usar `npm run dev` contra estas API,
definir `ARKA_SOLICITUDES_ORIGEN=http://localhost:18080` y
`ARKA_NOTIFICACIONES_ORIGEN=http://localhost:18081` antes de iniciarlo.

Diagnóstico:

```powershell
docker compose logs arka-lite-ui
curl.exe -s http://localhost:8088/salud
curl.exe -s http://localhost:8088/enlaces.json
curl.exe -s http://localhost:8088/api/salud/solicitudes
```

Detener: `docker compose down`.

## Kubernetes local

```powershell
bash construir.sh            # construye servicio-solicitudes, servicio-notificaciones y arka-lite-ui
kubectl apply -f k8s/
kubectl rollout status deploy/arka-lite-ui
kubectl port-forward svc/arka-lite-ui 8088:8080
```

`construir.sh` también carga las imágenes en minikube si ese es el contexto activo. No se usa Ingress: el acceso local es por port-forward. nginx resuelve los nombres de los Services al arrancar; el initContainer `esperar-servicios` espera a que ambos respondan, así que el orden de aplicación no importa. Para que los enlaces a Swagger funcionen en el clúster, hacer también port-forward de cada servicio (los comandos están en el ConfigMap).

## Enlaces a Swagger y Grafana

nginx publica `/enlaces.json` con tres variables de entorno; si no responde (por ejemplo con `npm run dev`), la UI usa los puertos de Compose en el mismo equipo.

| Variable | Valor por defecto |
| --- | --- |
| `ARKA_ENLACE_SWAGGER_SOLICITUDES` | `http://localhost:8080/swagger-ui/index.html` |
| `ARKA_ENLACE_SWAGGER_NOTIFICACIONES` | `http://localhost:8081/swagger-ui/index.html` |
| `ARKA_ENLACE_GRAFANA` | `http://localhost:3000` |

## Rutas que publica el proxy

| Navegador | Servicio | Métodos |
| --- | --- | --- |
| `/api/solicitudes…` | `servicio-solicitudes:8080/solicitudes…` | GET, POST |
| `/api/eventos/salientes` | `servicio-solicitudes:8080/eventos` (outbox) | GET |
| `/api/notificaciones` | `servicio-notificaciones:8080/notificaciones` | GET |
| `/api/eventos/procesados` | `servicio-notificaciones:8080/eventos/procesados` | GET |
| `/api/eventos/solicitud-enviada` | `servicio-notificaciones:8080/eventos/solicitud-enviada` | POST |
| `/api/salud/solicitudes`, `/api/salud/notificaciones` | `/actuator/health` de cada servicio | GET |
| `/api/openapi/solicitudes`, `/api/openapi/notificaciones` | `/v3/api-docs` de cada servicio | GET |
| `/salud` | nginx de la UI (readiness y liveness) | GET |
| `/enlaces.json` | nginx de la UI (enlaces a Swagger y Grafana) | GET |

`POST /api/eventos/solicitud-enviada` se publica solo para que **Reentregar** compruebe la idempotencia. No se reenvían cookies ni `Authorization`.

## Recorrido de uso

1. Abrir `http://localhost:8088`. La barra muestra **2 de 2 servicios UP**.
2. **Solicitudes › Nueva solicitud:** escribir un identificador (por ejemplo `SOL-100`), elegir el tipo y pulsar **Crear solicitud**. Responde 201 y la fila aparece marcada como *tuya*. Repetir el mismo identificador muestra un diálogo con el 409.
3. **Enviar** en la fila: confirmar en el diálogo. La solicitud pasa a ENVIADA.
4. **Enviadas:** el evento aparece registrado y, en unos segundos, entregado y consumido. El hilo bajo la barra se ilumina cuando termina.
5. **Reentregar:** confirmar. El diálogo dice "El aviso no se duplicó" y **Avisos duplicados** sigue en 0.
6. **Ayuda › Qué pasa al enviar:** el mismo recorrido, paso a paso.

## Editar el contenido

- **Temas de Ayuda:** `contenido/ayuda.ts` (pregunta, resumen, diagrama y dónde probarlo).
- **Diagramas:** `diagramas/definiciones.ts` (lienzo de 1200 px de ancho, pasos y detalle de cada nodo). El número de cada flecha es el primer paso que la usa.
- **Operaciones:** `contenido/laboratorio.ts`, solo con rutas verificadas en el código.
- **Paletas del tema:** `TEMAS` en `web/src/estado/tema.tsx`.

Después de cualquier cambio: `npm run todo`. `npm run validar` falla si una operación apunta a un tema que no existe, un tema usa un diagrama inexistente o un nodo queda fuera del lienzo.

## Qué se verificó (2026-10-27)

| Comprobación | Resultado |
| --- | --- |
| `npm run validar`, `typecheck`, `test`, `build` | Correctos: 13 operaciones, 21 temas de Ayuda y 29 pruebas (crear por POST, 409 con diálogo, confirmar y cancelar Enviar, Reentregar sin duplicar, Salud con enlaces, Ayuda paso a paso, cambio de tema). |
| Compose con la UI | La imagen se construyó y nginx arrancó sano; `/enlaces.json` responde con los enlaces configurados. |
| En el navegador, contra los servicios reales | Solicitudes con la tabla y el selector de tipo; diálogo de confirmación con el estilo de la plantilla; Ayuda con el diagrama de envío. |

## Pendiente de verificar

- **Kubernetes:** los manifiestos no se aplicaron en un clúster en esta revisión.
- **GitHub Actions:** el job `arka-lite-ui` no se ejecutó en GitHub.

## Limitaciones

- "Creadas aquí" y el tema elegido se guardan en el navegador; en otro navegador empiezan de cero.
- Los textos de aviso viven en memoria de notificaciones: si ese servicio se reinicia, se pierden (la columna Aviso muestra "No disponible"), aunque los eventos consumidos siguen en PostgreSQL.
- El historial de peticiones vive en la pestaña y se pierde al cerrarla.

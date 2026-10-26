# ARKA-Lite · Presentación, laboratorio y generador PPTX

Aplicación React que explica ARKA-Lite a una audiencia mixta y permite probar sus API reales. Una sola fuente de contenido alimenta la presentación web, el recorrido ejecutivo y el técnico, las notas del expositor, los guiones por participante y la exportación a PowerPoint.

| Vista | Para qué sirve |
| --- | --- |
| **Entender** | Presentación guiada: diapositivas, diagramas animados y guion del expositor. Incluye vista general, modo expositor y modo Presentar a pantalla completa. |
| **Probar** | Laboratorio que ejecuta las operaciones reales a través del proxy `/api`, con vista sencilla, detalle técnico, seguimiento del envío e historial filtrable. |
| **Detalle técnico** | Peticiones observadas, contratos verificados en el código, configuración del proxy y lectura de OpenAPI. |

Diseño: se eligió la propuesta **A · Franja** (estructura de aplicación inspirada en la línea gráfica de TGS: lateral profundo, barra constante, franja de página y un solo acento cian), con el **escenario oscuro de la propuesta B** para proyectar. Las tres propuestas están en el lienzo de diseño del proyecto.

## Estructura

```text
presentacion/
├── contenido/        Fuente del contenido: secciones, guiones, participantes y operaciones del laboratorio
├── diagramas/        Definiciones de los diagramas (nodos, aristas, pasos) y su geometría
├── diseno/           Tokens compartidos (color, tipografía, radios, trazos) y resaltado de código
├── web/src/
│   ├── api/          Clientes de API: cliente HTTP con historial y formas de las respuestas
│   ├── componentes/  Componentes visuales
│   ├── diagramas/    Dibujo SVG animado de las definiciones
│   ├── estado/       Preferencias e historial de peticiones
│   └── vistas/       Entender, Probar, Detalle, Presentar y Expositor
├── generador-pptx/   Exportación a PowerPoint (Node y navegador) y su verificador
├── guiones/          Generador de guiones; salida/ contiene los Markdown generados
├── pruebas/          Pruebas de la UI, del cliente, del contenido y del PPTX (Vitest)
├── despliegue/       Plantilla de nginx: servidor web y proxy de las API
├── salida/           PPTX generados de ejemplo
└── Dockerfile
```

Fuera de esta carpeta, la integración agrega solo:

| Archivo | Cambio |
| --- | --- |
| `compose.ui.yaml` | Extensión de Compose con el servicio `arka-ui`. `compose.yaml` no cambia. |
| `k8s/ui/arka-ui.yaml` | ConfigMap, Deployment y Service de la UI. Está en una subcarpeta para que `kubectl apply -f k8s/` siga aplicando solo lo existente. |
| `.github/workflows/ci.yml` | Job nuevo `presentacion`. El job existente no cambia. |
| `docs/README.md` | Enlace a este documento. |
| `.claude/launch.json` | Configuración local para previsualizar la UI desde Claude Code. Se puede borrar. |

## Requisitos

- Node.js 24 (mínimo 22.18: los scripts `.ts` se ejecutan con Node sin compilar).
- Para Compose: Docker con Compose v2. Para Kubernetes: un clúster local (Docker Desktop o minikube).

## Comandos

Desde `presentacion/`:

```bash
npm ci                    # instala dependencias
npm run dev               # UI en http://localhost:5173; el proxy de Vite llama a localhost:8080 y :8081
npm test                  # pruebas (Vitest + Testing Library)
npm run validar           # coherencia de contenido, diagramas y laboratorio
npm run typecheck         # TypeScript
npm run build             # web/dist
npm run pptx              # salida/ARKA-Lite-ejecutivo.pptx y salida/ARKA-Lite-tecnico.pptx
npm run verificar-pptx    # 16:9, notas en cada diapositiva, sin imágenes, nada fuera de la diapositiva
npm run guiones           # guiones/salida/*.md
npm run todo              # todo lo anterior en orden
```

`npm run dev` necesita los servicios Java en `localhost:8080` (solicitudes) y `localhost:8081` (notificaciones), como en `docs/inicio/instalacion-y-debug.md`. Para otros destinos: `ARKA_SOLICITUDES_ORIGEN` y `ARKA_NOTIFICACIONES_ORIGEN`.

## Docker Compose

Desde la raíz del repositorio:

```bash
docker compose -f compose.yaml -f compose.ui.yaml up --build -d
docker compose -f compose.yaml -f compose.ui.yaml ps
```

| Dirección | Valor |
| --- | --- |
| La usa el navegador | `http://localhost:8088` y `http://localhost:8088/api/…` (mismo origen) |
| La usa el proxy | `http://servicio-solicitudes:8080` y `http://servicio-notificaciones:8080` (nombres internos de la red) |
| Puerto publicado | `8088` |
| Puerto del contenedor | `8080` (nginx sin privilegios) |

Diagnóstico:

```bash
docker compose -f compose.yaml -f compose.ui.yaml logs arka-ui
curl -s http://localhost:8088/salud
curl -s http://localhost:8088/api/salud/solicitudes
```

Detener: `docker compose -f compose.yaml -f compose.ui.yaml down`.

## Kubernetes local

```bash
docker build -t arka-ui:local presentacion
bash construir.sh                       # imágenes de los servicios, como hasta ahora
kubectl apply -f k8s/
kubectl apply -f k8s/ui/
kubectl rollout status deploy/arka-ui
kubectl port-forward svc/arka-ui 8088:8080
```

En minikube, además: `minikube image load arka-ui:local`. No se usa Ingress: el acceso local es por port-forward. El navegador solo ve `http://localhost:8088`; los nombres de Service viven en el ConfigMap `arka-ui-rutas` y los usa nginx.

Diagnóstico:

```bash
kubectl get pods,svc -l app=arka-ui
kubectl describe pod -l app=arka-ui
kubectl logs deploy/arka-ui --tail=80
```

nginx resuelve los nombres de los Services al arrancar: aplicar `k8s/` antes que `k8s/ui/`.

## Rutas que publica el proxy

| Navegador | Servicio | Métodos |
| --- | --- | --- |
| `/api/solicitudes…` | `servicio-solicitudes:8080/solicitudes…` | GET, POST |
| `/api/notificaciones` | `servicio-notificaciones:8080/notificaciones` | GET |
| `/api/eventos/procesados` | `servicio-notificaciones:8080/eventos/procesados` | GET |
| `/api/salud/solicitudes`, `/api/salud/notificaciones` | `/actuator/health` de cada servicio | GET |
| `/api/openapi/solicitudes`, `/api/openapi/notificaciones` | `/v3/api-docs` de cada servicio | GET |
| `/salud` | nginx de la UI (readiness y liveness) | GET |

`POST /eventos/solicitud-enviada` es interno y no se publica. No se reenvían cookies ni `Authorization`.

## Editar el contenido

- **Diapositivas y guiones:** `contenido/secciones-*.ts`. Cada diapositiva tiene contenido visible breve, texto para decir, instrucciones separadas, transición, respaldo y, en los puntos principales, pregunta, respuesta esperada, demostración y evidencia. `recorridos` decide si va en el ejecutivo, en el técnico o en ambos; el código solo se muestra en el técnico.
- **Participantes:** `contenido/participantes.ts`. Poner los nombres reales; web, PPTX y guiones los toman de ahí.
- **Diagramas:** `diagramas/definiciones.ts` (coordenadas en un lienzo de 1200 px de ancho, pasos y detalle de cada nodo).
- **Línea gráfica:** `diseno/tokens.ts`. `npm run tokens` regenera el tema de Tailwind.
- **Laboratorio:** `contenido/laboratorio.ts`, solo con rutas verificadas en el código.

Después de cualquier cambio: `npm run todo`. `npm run validar` falla si una diapositiva pierde su transición, una línea visible es demasiado larga, un diagrama o una operación no existe, o un nodo queda fuera del lienzo.

## Exportar a PowerPoint

- En la web: **Entender › Exportar PPTX**, según el recorrido elegido.
- En la terminal: `npm run pptx` (ambos) o `npm run pptx -- tecnico`.

El PPTX es 16:9, lleva notas del expositor en cada diapositiva y todo es editable: textos, tablas, y diagramas como formas y conectores nativos. Cada animación se convierte en diapositivas estáticas por pasos (hasta 3 por diagrama en el ejecutivo y 5 en el técnico). No se trasladan animaciones de React a animaciones nativas de PowerPoint. No se incrusta ninguna imagen. Usa Segoe UI y Consolas para que el texto siga editable en Windows; en otro sistema PowerPoint sustituirá la fuente.

## Recorrido de demostración

1. **Entender › Apertura**: el caso INC-002 y los tres hechos (enviada, entregada, aviso disponible).
2. **Probar › Consultar /actuator/health** (barra lateral): ambos servicios UP.
3. **Listar solicitudes**: INC-001 en BORRADOR y CAM-002 en ENVIADA (carga inicial).
4. **Consultar eventos consumidos**: deja una referencia previa al envío.
5. **Crear INC-002 › Confirmar**: BORRADOR. Si INC-002 ya existía, vuelve a BORRADOR; la pantalla lo advierte antes de confirmar.
6. **Enviar INC-002 › Confirmar**: la respuesta confirma ENVIADA, sin eventoId. El aviso aparece como “todavía no observado”.
7. **Consultar avisos e ids cada 5 s**: solo GET, máximo seis veces, se detiene al ver el aviso. Debe aparecer “Solicitud INC-002 (SolicitudEnviada) enviada” y un eventoId nuevo, que la API no relaciona con la solicitud.
8. Intentar **Enviar** otra vez: el botón queda desactivado y explica que la API respondería 500.
9. **Detalle técnico**: método, URL, destino del proxy, status, duración, cuerpo e ids de cada petición.

## Qué se verificó (2026-10-26)

| Comprobación | Resultado |
| --- | --- |
| `npm run validar`, `typecheck`, `build` | Correctos. 49 láminas en el ejecutivo y 52 en el técnico. |
| `npm test` | 37 pruebas correctas: cliente HTTP (404, 500, 502, desconexión, tiempo agotado sin reintento), reglas de estado, contenido, geometría, PPTX y vistas (navegación con teclado, guion, recorrido técnico, diagrama sin peticiones, inspector de nodos, movimiento reducido, confirmación de escrituras, flujo INC-002 completo, 404, desconexión, filtros). |
| PPTX | 82 diapositivas en el ejecutivo y 112 en el técnico; 16:9; una nota por diapositiva; 0 imágenes; ninguna forma fuera de la diapositiva. PowerPoint 2013 abrió el archivo. El navegador genera el mismo archivo que Node. |
| Servicios reales | Ambos JAR con JDK 26 contra PostgreSQL 17 en PGlite (WASM), porque Docker no arrancó. La UI construida, con el proxy de Vite: crear INC-002 → enviar (200, ENVIADA) → el relevador entregó → notificaciones consumió → aviso observado. Logs: `Intentando publicar evento <uuid> de solicitud: INC-002`, `Consume evento <uuid> de solicitud INC-002`, `aviso creado para solicitud INC-002`. Reenviar devolvió 500 y un id inexistente 404. |
| Compose | `docker compose -f compose.yaml -f compose.ui.yaml config` válido, 8 servicios. |
| Kubernetes y CI | YAML analizado: recursos, selectores, probes, ConfigMap y pasos del job coherentes. |
| Accesibilidad | Sin desplazamiento horizontal a 375 px; nombres accesibles en botones e iconos; foco visible; movimiento reducido. |

## Pendiente de verificar

- **Imagen Docker y nginx en ejecución:** Docker Desktop no arrancó en el equipo de prueba (falta el kernel de WSL 2: `wsl --update`). No se construyó la imagen ni se probó la plantilla de nginx en vivo; el proxy probado fue el de Vite, con las mismas rutas.
- **`docker compose up` completo** con la UI, Loki, Promtail y Grafana.
- **Kubernetes:** no había clúster; los manifiestos no se aplicaron.
- **GitHub Actions:** el job `presentacion` no se ejecutó en GitHub.
- **Vista de las diapositivas en PowerPoint:** no se pudieron exportar imágenes por automatización para revisarlas a ojo; el tamaño de letra del código y de las tablas se calcula para no desbordar.
- **PostgreSQL real:** la prueba integrada usó PGlite (PostgreSQL 17 en WASM), no el contenedor `postgres:17`.

## Limitaciones

- La UI solo registra sus propias peticiones; no ve la entrega entre servicios.
- No hay API para consultar el outbox ni para relacionar una solicitud con su eventoId: el seguimiento lo dice explícitamente.
- El historial vive en la pestaña y se pierde al cerrarla.
- Crear siempre usa INC-002, como la API.
- No hay modo sin conexión: sin servicios, Probar muestra errores de conexión y Entender sigue funcionando.

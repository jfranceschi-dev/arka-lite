import type { Seccion } from "./tipos.ts";

// Partes 4, 5 y 6: contenedores y Kubernetes, integración y entrega continua,
// y observabilidad.

export const plataforma: Seccion = {
  id: "s04",
  numero: 4,
  titulo: "Contenedores y Kubernetes",
  corto: "Contenedores",
  subtitulo: "El mismo sistema en cualquier computadora y un clúster que se repara solo.",
  temas: ["Docker y Dockerfile", "Docker Compose", "Kubernetes", "Puesta a punto"],
  icono: "container",
  diapositivas: [
    {
      id: "s04-conceptos",
      titulo: "¿Qué es Docker y qué es Kubernetes?",
      idea: "Docker empaqueta la aplicación; Kubernetes administra lo empaquetado.",
      visible: ["Docker: la caja con la app y todo lo que necesita", "Imagen: el paquete; contenedor: el paquete corriendo", "Kubernetes: arranca, vigila y reinicia las cajas", "Compose hace lo mismo en una sola computadora"],
      comparacion: "Como el transporte de carga: Docker es el contenedor estándar y Kubernetes, el puerto que los acomoda, los vigila y reemplaza el que se daña.",
      iconoComparacion: "ship-wheel",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "contraste",
        lados: [
          { titulo: "Docker: la caja", icono: "container", tono: "cian", puntos: ["Empaqueta la app con Java y todo lo que usa", "Imagen: un paquete que no cambia", "Corre igual en una laptop y en un servidor", "Compose levanta varias cajas juntas"] },
          { titulo: "Kubernetes: el administrador", icono: "ship-wheel", tono: "correcto", puntos: ["Decide dónde corre cada caja", "Si una se cae, levanta otra", "Le da a cada servicio un nombre fijo", "Puede correr más copias si hay carga"] },
        ],
      },
      guion: {
        decir: [
          "Dos palabras que se escuchan mucho. Docker resuelve el clásico “en mi máquina funciona”: empaqueta la aplicación con Java y todo lo que necesita en una imagen, un paquete que no cambia. Cuando esa imagen corre, se llama contenedor, y corre igual en una laptop o en un servidor.",
          "Kubernetes es el siguiente nivel: no empaqueta, administra. Decide dónde corre cada contenedor, lo vigila, y si uno se cae, levanta otro. Piénsenlo como un puerto de carga: Docker es el contenedor estándar y Kubernetes es el puerto que los acomoda y reemplaza el que se daña.",
          "En una sola computadora usamos Docker Compose; en un clúster, Kubernetes. La misma imagen sirve en los dos.",
        ],
        pregunta: { texto: "¿Docker es una máquina virtual?", respuesta: "No. Es más liviano: comparte el sistema operativo y solo aísla la aplicación y lo que necesita." },
        transicion: "Veamos el sistema completo levantado con Docker.",
      },
    },
    {
      id: "s04-docker",
      titulo: "De código a contenedor",
      idea: "Una receta que da el mismo resultado en cualquier computadora.",
      visible: ["Dockerfile: la receta", "Etapa build: compila con Maven", "Imagen: solo Java y el JAR", "Contenedor: corre sin privilegios"],
      recorridos: ["tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "file-code", titulo: "Dockerfile", texto: "La receta: qué instalar y qué copiar.", tono: "marino" },
          { icono: "settings", titulo: "Etapa build", texto: "Compila el JAR con Maven.", tono: "marino" },
          { icono: "package", titulo: "Imagen", texto: "Solo Java y el JAR: más liviana.", tono: "cian" },
          { icono: "container", titulo: "Contenedor", texto: "Corre con un usuario sin privilegios.", tono: "correcto" },
        ],
      },
      codigo: {
        lenguaje: "bash",
        archivo: "servicio-solicitudes/Dockerfile",
        texto: "FROM maven:3.9-eclipse-temurin-26 AS build\nRUN mvn -q clean package -DskipTests\n\nFROM eclipse-temurin:26-jre\nCOPY --from=build /build/target/*.jar app.jar\nRUN useradd -r -u 1001 appuser1\nUSER appuser1\nENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]",
      },
      guion: {
        decir: [
          "El Dockerfile tiene dos etapas. La primera trae Maven y compila. La segunda solo lleva Java y el JAR, así la imagen final es más liviana y no carga herramientas de compilación.",
          "Además corre con un usuario sin privilegios: si alguien llegara a comprometer el proceso, no sería administrador del contenedor.",
        ],
        transicion: "Un contenedor solo no es el sistema. Necesitamos levantarlos todos juntos.",
        respaldo: "docs/operaciones/docker-y-compose.md",
      },
    },
    {
      id: "s04-compose",
      titulo: "Todo el sistema con un comando",
      idea: "Ocho contenedores, una red y la configuración por variables de entorno.",
      visible: ["Servicios, bases, UI y logs en un archivo", "Cada servicio se llama por su nombre", "La configuración entra por variables", "La misma imagen sirve en Compose y en Kubernetes"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "tarjetas",
        comando: "docker compose up --build -d",
        columnas: 4,
        tarjetas: [
          { icono: "monitor", titulo: "arka-lite-ui", texto: ":8088 · la interfaz y su proxy", tono: "violeta" },
          { icono: "clipboard-list", titulo: "servicio-solicitudes", texto: ":8080 · el trámite", tono: "marino" },
          { icono: "bell", titulo: "servicio-notificaciones", texto: ":8081 · los avisos", tono: "cian" },
          { icono: "database", titulo: "db-solicitudes", texto: "PostgreSQL 17 · solo red interna", tono: "neutro" },
          { icono: "database", titulo: "db-notificaciones", texto: "PostgreSQL 17 · :5433", tono: "neutro" },
          { icono: "scan-eye", titulo: "promtail", texto: "recoge los logs", tono: "advertencia" },
          { icono: "archive", titulo: "loki", texto: ":3100 · guarda los logs", tono: "advertencia" },
          { icono: "chart-line", titulo: "grafana", texto: ":3000 · busca en los logs", tono: "advertencia" },
        ],
      },
      guion: {
        decir: [
          "¿Cuántas veces hemos escuchado “en mi máquina funciona”? Con Docker, cada servicio viaja con su receta, y con Compose levantamos el sistema completo con un solo comando: los dos servicios, sus bases, la interfaz y las herramientas de logs.",
          "Dentro de la red de Compose, cada servicio encuentra al otro por su nombre, no por localhost. Y la configuración entra por variables de entorno, así que la misma imagen sirve en nuestra computadora y en el clúster, sin recompilar.",
          "Para un equipo nuevo, esto es la diferencia entre un día configurando y cinco minutos.",
        ],
        demo: { accion: "docker compose ps", evidencia: "La UI, los servicios y las bases arriba y sanos." },
        pregunta: { texto: "Dentro de un contenedor, ¿a dónde lleva localhost?", respuesta: "Al mismo contenedor, no a otro servicio. Por eso usamos el nombre del servicio." },
        transicion: "En nuestra computadora usamos Compose. En un clúster, Kubernetes.",
      },
    },
    {
      id: "s04-kubernetes",
      titulo: "Los recursos de Kubernetes",
      idea: "Decimos el estado que queremos; Kubernetes lo mantiene.",
      visible: ["Deployment y Pod por componente", "Service: un nombre fijo", "Secret para la contraseña", "Disco persistente para cada base"],
      recorridos: ["tecnico"],
      visual: {
        tipo: "capas",
        capas: [
          { titulo: "Acceso", tono: "violeta", elementos: [
            { icono: "network", titulo: "Service", texto: "Un nombre fijo por componente" },
            { icono: "route", titulo: "port-forward", texto: "La UI en localhost:8088" },
          ] },
          { titulo: "Cómputo", tono: "marino", elementos: [
            { icono: "layers", titulo: "5 Deployments", texto: "UI, 2 servicios y 2 bases" },
            { icono: "hourglass", titulo: "initContainers", texto: "Esperan a la base y al otro servicio" },
            { icono: "heart-pulse", titulo: "readinessProbe", texto: "Sin tráfico hasta estar listo", tono: "correcto" },
          ] },
          { titulo: "Configuración", tono: "advertencia", elementos: [
            { icono: "key-round", titulo: "Secret arka-postgres", texto: "La contraseña de las bases" },
            { icono: "settings", titulo: "Variables de entorno", texto: "DB_URL, NOTIFICACIONES_URL" },
          ] },
          { titulo: "Datos", tono: "neutro", elementos: [
            { icono: "hard-drive", titulo: "PersistentVolumeClaim", texto: "Un disco por base: sobrevive al Pod" },
          ] },
        ],
      },
      codigo: { lenguaje: "bash", archivo: "despliegue local", texto: "bash construir.sh           # imágenes de los 3 componentes\nkubectl apply -f k8s/\nkubectl get pods,svc,pvc\nkubectl port-forward svc/arka-lite-ui 8088:8080" },
      guion: {
        decir: [
          "Para el equipo técnico, estos son los recursos. Un Deployment por componente, que crea su Pod; un Service que le da un nombre fijo; la contraseña en un Secret; y un disco persistente por base, que sobrevive si el Pod se recrea.",
          "Antes de arrancar, cada servicio espera con initContainers a que su base y sus dependencias respondan, y una readinessProbe evita mandarle tráfico antes de tiempo. Todo se aplica con un solo kubectl apply.",
        ],
        transicion: "¿Y qué pasa cuando algo se cae?",
        respaldo: "docs/operaciones/kubernetes-local.md",
      },
    },
    {
      id: "s04-autocuracion",
      titulo: "Cuando un Pod se cae",
      idea: "Kubernetes vuelve solo al estado que declaramos.",
      visible: ["El Deployment detecta que falta una copia", "Crea un Pod nuevo", "Espera a la base y a su salud", "Vuelve a recibir tráfico, sin intervención"],
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "escenario",
        falla: { icono: "siren", titulo: "Se cae el Pod de solicitudes", texto: "Un error, un nodo reiniciado o un kubectl delete.", tono: "error" },
        pasos: [
          { momento: "0 s", icono: "radar", titulo: "Detecta", texto: "Falta 1 de 1 copias.", tono: "advertencia" },
          { momento: "+1 s", icono: "rotate-ccw", titulo: "Recrea", texto: "Un Pod nuevo con la misma imagen.", tono: "cian" },
          { momento: "+segundos", icono: "hourglass", titulo: "Espera", texto: "initContainers: base y notificaciones.", tono: "cian" },
          { momento: "Ready", icono: "heart-pulse", titulo: "Listo", texto: "La readinessProbe responde.", tono: "correcto" },
        ],
        resultado: { icono: "circle-check", titulo: "Sin intervención manual", texto: "Los eventos pendientes siguen en la base y se entregan.", tono: "correcto" },
      },
      guion: {
        decir: [
          "Kubernetes funciona como un termostato: no le decimos qué hacer paso a paso, le decimos el estado que queremos, por ejemplo una copia de cada servicio, y él lo mantiene.",
          "Si el Pod de solicitudes se cae, el Deployment detecta que falta una copia y crea otro con la misma imagen. El Pod nuevo espera a que su base y notificaciones respondan, y solo cuando su prueba de salud contesta, el Service le vuelve a mandar tráfico.",
          "Y como los eventos pendientes están en la base, no en memoria, nada se pierde mientras tanto. Nadie tuvo que despertarse a las tres de la mañana.",
        ],
        demo: { accion: "kubectl delete pod -l app=servicio-solicitudes y luego kubectl get pods -w.", evidencia: "Aparece un Pod nuevo que vuelve a estar Ready." },
        pregunta: { texto: "¿Y si se cae la base?", respuesta: "Su Pod también se recrea y los datos siguen en el disco persistente; los servicios esperan a que vuelva." },
        transicion: "Esto es lo que aprendimos de la plataforma.",
      },
    },
    {
      id: "s04-aprendizajes",
      titulo: "Contenedores y Kubernetes: lo que aprendimos",
      visible: ["La imagen es el entregable", "Configurar por variables, no por código", "Declarar el estado y dejar que se mantenga"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "1", titulo: "comando para levantar todo" }, { valor: "5", titulo: "manifiestos en k8s/" }],
        items: [
          { icono: "package", titulo: "La imagen es el entregable", texto: "Dos etapas, solo Java y el JAR, usuario sin privilegios.", valor: "Lo que se prueba es exactamente lo que se despliega." },
          { icono: "settings", titulo: "Configurar por variables", texto: "La misma imagen en Compose y en Kubernetes.", valor: "Un solo artefacto para todos los ambientes." },
          { icono: "ship-wheel", titulo: "Declarar el estado deseado", texto: "Deployments, initContainers y readinessProbe.", valor: "El clúster se repara solo y no recibe tráfico antes de tiempo." },
        ],
      },
      guion: {
        decir: [
          "Primero: la imagen es el entregable. Lo que se prueba es exactamente lo que se despliega.",
          "Segundo: configurar por variables de entorno y no por código. Así hay un solo artefacto para todos los ambientes.",
          "Y tercero: con Kubernetes declaramos el estado que queremos y el clúster lo mantiene. Arrancar no es lo mismo que estar listo, y eso hay que decírselo explícitamente.",
        ],
        transicion: "¿Y quién construye y prueba esas imágenes? Nadie a mano: el pipeline.",
      },
    },
  ],
};

export const cicd: Seccion = {
  id: "s05",
  numero: 5,
  titulo: "CI/CD",
  corto: "CI/CD",
  subtitulo: "Integración y entrega continua: cada cambio se prueba y se empaqueta solo.",
  temas: ["Integración continua", "Entrega continua", "GitHub Actions", "Git"],
  icono: "workflow",
  diapositivas: [
    {
      id: "s05-pipeline",
      titulo: "Cada cambio se prueba solo",
      idea: "Del push a una imagen publicada, sin pasos manuales.",
      visible: ["Cada push o Pull Request dispara el pipeline", "Compila y prueba cada servicio con su base", "Comprueba que el servicio realmente arranca", "Publica la imagen con el SHA del commit"],
      porque: "Un cambio roto se detecta en minutos, antes de llegar a los demás.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "tuberia",
        etapas: [
          { icono: "git-pull-request", titulo: "Push o PR", texto: "Alguien sube un cambio." },
          { icono: "settings", titulo: "Compilar", texto: "Java 26 y Maven, un job por servicio." },
          { icono: "flask-conical", titulo: "Probar", texto: "mvn verify con PostgreSQL de servicio." },
          { icono: "power", titulo: "Arrancar", texto: "Levanta el JAR y espera ver CAM-002." },
          { icono: "package", titulo: "Imagen", texto: "Se construye con Docker." },
          { icono: "cloud-upload", titulo: "Publicar", texto: "En GHCR, con el SHA del commit." },
        ],
      },
      codigo: {
        lenguaje: "yaml",
        archivo: ".github/workflows/ci.yml",
        texto: "on:\n  push:\n    branches: [ main ]\n  pull_request:\njobs:\n  construir-probar-publicar:\n    strategy:\n      matrix:\n        include:\n          - servicio: servicio-solicitudes\n            base_datos: db-solicitudes\n    steps:\n      - run: mvn -B verify\n        working-directory: ${{ matrix.servicio }}",
      },
      guion: {
        decir: [
          "Con GitHub Actions, cada vez que alguien sube un cambio o abre un Pull Request, se dispara el pipeline. Por cada servicio prepara Java y una base PostgreSQL, compila y corre todas las pruebas.",
          "Luego hace algo que muchos pipelines no hacen: arranca el servicio de verdad y espera a ver los datos iniciales. Así detectamos errores de configuración que las pruebas unitarias no ven.",
          "Si todo pasa, construye la imagen y la publica etiquetada con el código del commit. Cada imagen se puede rastrear hasta el cambio exacto que la produjo.",
        ],
        pregunta: { texto: "¿Publicar la imagen la despliega en Kubernetes?", respuesta: "No. Hoy desplegar es un paso aparte; es el siguiente paso natural." },
        transicion: "El pipeline funciona porque todo entra por el mismo camino.",
        respaldo: "docs/automatizacion/ci-yaml-paso-a-paso.md",
      },
    },
    {
      id: "s05-ramas",
      titulo: "Todo entra por Pull Request",
      idea: "Ramas cortas, commits con sentido y el pipeline en verde.",
      visible: ["Una rama corta por tarea: feat/, fix/, docs/", "Commits en español con Conventional Commits", "Una aprobación y el pipeline en verde", "Nadie sube directo a main"],
      recorridos: ["tecnico"],
      visual: {
        tipo: "ramas",
        principal: "main",
        rama: "feat/crear-solicitud-por-post",
        commits: ["feat: crear solicitud por post", "fix: responder 409 si el id ya existe", "docs: documentar POST /solicitudes"],
        fusion: "Pull Request: una aprobación y el pipeline en verde",
      },
      guion: {
        decir: [
          "Cada tarea va en una rama corta con un nombre que dice qué es, y cada commit sigue una convención: tipo, dos puntos y qué hace el cambio.",
          "Nadie sube directo a main: todo entra por un Pull Request, con una aprobación y el pipeline en verde.",
        ],
        instrucciones: ["Mostrar el historial del repositorio en GitHub; no crear commits durante la exposición."],
        transicion: "Esto es lo que aprendimos de la integración continua.",
        respaldo: "docs/desarrollo/flujo-de-trabajo.md",
      },
    },
    {
      id: "s05-aprendizajes",
      titulo: "CI/CD: lo que aprendimos",
      visible: ["Probar que arranca, no solo que compila", "Cada imagen se rastrea a su commit", "El pipeline es la puerta de entrada"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "2", titulo: "jobs en paralelo, uno por servicio" }, { valor: "1", titulo: "imagen por commit" }],
        items: [
          { icono: "power", titulo: "Probar que arranca, no solo que compila", texto: "El pipeline levanta el JAR y consulta GET /solicitudes.", valor: "Los errores de configuración aparecen antes de desplegar." },
          { icono: "hash", titulo: "Cada imagen se rastrea a su commit", texto: "Etiqueta con el SHA en GHCR.", valor: "Saber qué código corre y volver atrás con certeza." },
          { icono: "git-merge", titulo: "El pipeline es la puerta", texto: "Pull Request, una aprobación y todo en verde.", valor: "La calidad no depende de la memoria de nadie." },
        ],
      },
      guion: {
        decir: [
          "Primero: hay que probar que el servicio arranca, no solo que compila. Muchos errores de configuración solo aparecen al arrancar.",
          "Segundo: cada imagen se etiqueta con su commit. Eso nos dice exactamente qué código está corriendo y nos permite volver atrás con certeza.",
          "Y tercero: el pipeline es la puerta de entrada. La calidad no depende de que alguien se acuerde de correr las pruebas.",
        ],
        transicion: "Ya está desplegado. ¿Cómo sabemos qué pasa adentro?",
      },
    },
  ],
};

export const observabilidad: Seccion = {
  id: "s06",
  numero: 6,
  titulo: "Observabilidad",
  corto: "Observabilidad",
  subtitulo: "Logs centralizados, trazas entre servicios y salud de cada componente.",
  temas: ["Logs y monitoreo", "Centralización de logs", "Trazas", "Salud con Actuator"],
  icono: "chart-line",
  diapositivas: [
    {
      id: "s06-logs",
      titulo: "Todos los logs, en un solo lugar",
      idea: "Seguir un evento de un servicio a otro sin entrar a ningún contenedor.",
      visible: ["Cada servicio escribe sus logs en JSON (ECS)", "Promtail los recoge de todos los contenedores", "Loki los guarda por servicio", "Grafana los busca por traceId o eventoId"],
      comparacion: "Como la caja negra de un avión: registra lo que pasó, para revisarlo después.",
      iconoComparacion: "plane",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "server", titulo: "Servicios", texto: "Logs JSON con traceId y eventoId.", tono: "marino" },
          { icono: "scan-eye", titulo: "Promtail", texto: "Los recoge de cada contenedor.", tono: "advertencia" },
          { icono: "archive", titulo: "Loki", texto: "Los guarda, etiquetados por servicio.", tono: "advertencia" },
          { icono: "chart-line", titulo: "Grafana", texto: "Una búsqueda para todo el sistema.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "Con dos servicios, cada uno tiene sus propios logs. Si algo falla, no queremos entrar contenedor por contenedor a buscar.",
          "Cada servicio escribe sus logs en JSON, con un formato estándar. Promtail los recoge de todos los contenedores, Loki los guarda etiquetados por servicio y Grafana nos deja buscarlos en un solo lugar.",
          "Las llamadas entre servicios llevan el traceId, así que con una sola búsqueda vemos el viaje de un evento: cuándo lo publicó el relevador y cuándo lo consumió notificaciones.",
        ],
        demo: { accion: "Grafana › Explore › Loki: {service=\"servicio-notificaciones\"} |= \"evento\".", evidencia: "Las líneas “Consume evento” y “aviso creado” con el número del evento." },
        transicion: "Los logs cuentan qué pasó. La salud dice cómo estamos ahora.",
        respaldo: "docs/operaciones/observabilidad.md",
      },
    },
    {
      id: "s06-salud",
      titulo: "Salud de cada servicio",
      idea: "Cada servicio responde: ¿estás bien?",
      visible: ["Actuator expone health, info y métricas", "La salud revisa la conexión con la base", "Kubernetes y la UI la consultan", "UP no garantiza que todos los avisos llegaron"],
      iconos: ["heart-pulse", "database", "ship-wheel", "triangle-alert"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: { tipo: "captura", capturas: [{ archivo: "ui-salud.png", titulo: "La pestaña Salud de la UI", url: "localhost:8088/#/salud" }] },
      guion: {
        decir: [
          "Cada servicio expone su salud con Spring Boot Actuator: por dentro revisa, por ejemplo, que pueda hablar con su base. La interfaz la muestra en la pestaña Salud.",
          "Pero ojo: que un servicio diga UP solo significa que responde. No garantiza que todos los avisos llegaron. Para eso miramos los eventos pendientes y los logs.",
          "Las métricas ya se exponen en formato Prometheus; guardarlas en el tiempo y ponerles alertas es el siguiente paso.",
        ],
        pregunta: { texto: "Si todo está UP y falta un aviso, ¿qué miramos?", respuesta: "Si el evento sigue pendiente en Enviadas, y los logs del relevador y de notificaciones." },
        transicion: "Esto es lo que aprendimos de la observabilidad.",
      },
    },
    {
      id: "s06-aprendizajes",
      titulo: "Observabilidad: lo que aprendimos",
      visible: ["Logs estructurados desde el día uno", "Un identificador que cruce servicios", "Salud no es lo mismo que correcto"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "1", titulo: "lugar para buscar todos los logs" }, { valor: "8", titulo: "contenedores observados" }],
        items: [
          { icono: "braces", titulo: "Logs estructurados desde el día uno", texto: "JSON con formato ECS, sin cambiar el código de negocio.", valor: "Buscar por campo en lugar de leer texto." },
          { icono: "waypoints", titulo: "Un identificador que cruce servicios", texto: "traceId propagado por el RestClient y eventoId en cada log.", valor: "Diagnosticar un fallo entre servicios en minutos." },
          { icono: "activity", titulo: "Salud no es lo mismo que correcto", texto: "UP dice que responde; los pendientes dicen si entrega.", valor: "Medir el resultado del negocio, no solo el proceso." },
        ],
      },
      guion: {
        decir: [
          "Primero: los logs estructurados se configuran desde el día uno. Después es mucho más caro.",
          "Segundo: en un sistema distribuido hace falta un identificador que cruce los servicios. Sin el traceId o el eventoId, diagnosticar es adivinar.",
          "Y tercero: salud no es lo mismo que correcto. Un servicio puede estar UP y tener avisos pendientes; hay que medir el resultado, no solo el proceso.",
        ],
        transicion: "Todo esto también tiene que estar documentado.",
      },
    },
  ],
};

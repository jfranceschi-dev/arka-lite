import type { Seccion } from "./tipos.ts";

// Partes 5 y 6: empaquetar y entregar; desplegar y operar. Cada una la
// presenta una persona de DevOps.

export const despliegue: Seccion = {
  id: "s05",
  numero: 5,
  titulo: "Empaquetar y entregar",
  corto: "Empaquetar",
  participante: "p5",
  subtitulo: "Cómo hicimos que el sistema corra igual en cualquier computadora y que cada cambio se pruebe solo.",
  temas: ["Docker y Dockerfile", "Docker Compose", "Integración y entrega continua"],
  icono: "package",
  claves: {
    problema: "“En mi máquina funciona”: cada computadora tiene otro Java, otras variables y otra red.",
    sencillo: "Docker empaqueta cada servicio, Compose levanta el sistema y el pipeline prueba cada cambio.",
    visual: "Dockerfile → imagen → contenedor; push → pipeline → imagen publicada.",
    aplicacion: "Un Dockerfile por servicio, compose.yaml y .github/workflows/ci.yml.",
    evidencia: "docker compose ps con todo sano y la ejecución en GitHub Actions.",
  },
  diapositivas: [
    {
      id: "s05-docker",
      titulo: "Docker y Dockerfile",
      idea: "Una receta que funciona igual en cualquier computadora.",
      visible: ["Dockerfile: la receta", "Imagen: el resultado empaquetado", "Contenedor: la imagen corriendo", "Dos etapas: compilar y ejecutar"],
      comparacion: "Como una receta de cocina: con los mismos ingredientes y pasos, sale el mismo plato en cualquier cocina.",
      iconoComparacion: "chef-hat",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "file-code", titulo: "Dockerfile", texto: "La receta: qué instalar y qué copiar.", tono: "marino" },
          { icono: "settings", titulo: "Etapa build", texto: "Compila el JAR con Maven.", tono: "marino" },
          { icono: "package", titulo: "Imagen", texto: "Solo Java y el JAR, con un usuario sin privilegios.", tono: "cian" },
          { icono: "container", titulo: "Contenedor", texto: "La imagen corriendo, igual en cualquier computadora.", tono: "correcto" },
        ],
      },
      diagrama: "docker",
      codigo: {
        lenguaje: "bash",
        archivo: "servicio-solicitudes/Dockerfile",
        texto: "FROM maven:3.9-eclipse-temurin-26 AS build\nRUN mvn -q clean package -DskipTests\n\nFROM eclipse-temurin:26-jre\nCOPY --from=build /build/target/*.jar app.jar\nRUN useradd -r -u 1001 appuser1\nUSER appuser1\nENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]",
      },
      guion: {
        decir: [
          "¿Cuántas veces hemos escuchado “en mi máquina funciona”? Docker existe para que eso no vuelva a pasar.",
          "El Dockerfile es una receta. La imagen es el plato ya preparado y empaquetado. Y el contenedor es ese plato servido: la imagen corriendo. Con la misma receta, sale lo mismo en cualquier computadora.",
          "En el taller del Dockerfile usamos dos etapas. La primera tiene todas las herramientas para compilar. La segunda solo lleva lo necesario para ejecutar, así la imagen final es más liviana, y corre con un usuario sin privilegios, que es más seguro.",
        ],
        transicion: "Un contenedor solo no es el sistema. Necesitamos levantarlos todos juntos.",
        respaldo: "docs/operaciones/docker-y-compose.md",
      },
    },
    {
      id: "s05-compose",
      titulo: "Docker Compose: el sistema completo",
      idea: "Un solo comando levanta todo el sistema.",
      visible: ["Servicios, bases, UI y logs en un archivo", "Dentro de la red, cada servicio se llama por su nombre", "Las variables de entorno cambian la configuración", "El puerto publicado no tiene que ser el interno"],
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
      tabla: {
        encabezados: ["Quién llama", "A quién", "Dirección"],
        filas: [
          ["Navegador", "UI", "http://localhost:8088"],
          ["Proxy de la UI", "solicitudes", "http://servicio-solicitudes:8080"],
          ["solicitudes", "notificaciones", "http://servicio-notificaciones:8080"],
          ["solicitudes", "su base", "jdbc:postgresql://db-solicitudes:5432/…"],
        ],
      },
      guion: {
        decir: [
          "En el taller de Compose conectamos los dos microservicios. Con un solo comando levantamos todo: los dos servicios, sus dos bases, la interfaz y las herramientas de logs.",
          "Dentro de la red que crea Compose, cada servicio encuentra al otro por su nombre. Solicitudes no llama a localhost: llama a servicio-notificaciones. Esto es importante, porque dentro de un contenedor, localhost es el mismo contenedor.",
          "Y la configuración entra por variables de entorno: la dirección de la base, la del otro servicio. Así la misma imagen sirve en nuestra computadora y en el clúster, sin recompilar.",
        ],
        demo: { accion: "docker compose ps", evidencia: "La UI, los servicios y las bases arriba y sanos." },
        pregunta: { texto: "Dentro de un contenedor, ¿a dónde lleva localhost?", respuesta: "Al mismo contenedor, no a otro servicio. Por eso usamos el nombre del servicio." },
        transicion: "Ya corre en cualquier computadora. Ahora, cómo validamos cada cambio sin hacerlo a mano.",
      },
    },
    {
      id: "s05-cicd",
      titulo: "Integración y entrega continua",
      idea: "Cada cambio se prueba solo.",
      visible: ["Cada push o Pull Request dispara el pipeline", "Compila y prueba cada servicio con su base", "Comprueba que el servicio arranca", "Publica la imagen con el código del commit"],
      porque: "Un cambio roto se detecta en minutos, antes de que llegue a los demás.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "tuberia",
        etapas: [
          { icono: "git-pull-request", titulo: "Push o PR", texto: "Alguien sube un cambio." },
          { icono: "settings", titulo: "Compilar", texto: "Java 26 y Maven, un trabajo por servicio." },
          { icono: "flask-conical", titulo: "Probar", texto: "Todas las pruebas, cada servicio con su base." },
          { icono: "power", titulo: "Arrancar", texto: "¿El servicio realmente levanta?" },
          { icono: "package", titulo: "Imagen", texto: "Se construye con Docker." },
          { icono: "cloud-upload", titulo: "Publicar", texto: "En GHCR, con el SHA del commit." },
        ],
      },
      diagrama: "cicd",
      guion: {
        decir: [
          "En el taller del pipeline configuramos GitHub Actions para que trabaje por nosotros. Cada vez que alguien sube un cambio o abre un Pull Request, se dispara solo.",
          "Por cada servicio, prepara Java y una base de datos, compila, corre todas las pruebas y comprueba que el servicio realmente arranca. Si algo falla, nos avisa en minutos.",
          "Si todo pasa, construye la imagen y la publica con el código del commit. Así cada imagen se puede relacionar con el cambio exacto que la produjo. Integración continua es probar seguido; entrega continua es dejar siempre una versión lista para desplegar.",
        ],
        pregunta: { texto: "¿Publicar la imagen la despliega en Kubernetes?", respuesta: "No. Desplegar es un paso aparte." },
        transicion: "Con cada cambio probado y empaquetado, falta llevarlo al clúster.",
        respaldo: "docs/automatizacion/ci-yaml-paso-a-paso.md",
      },
    },
    {
      id: "s05-yaml",
      titulo: "Leer ci.yml",
      visible: ["on: push a main y pull_request", "Una matriz: un job por servicio", "mvn -B verify en la carpeta del servicio", "Imagen etiquetada con el SHA"],
      recorridos: ["tecnico"],
      codigo: {
        lenguaje: "yaml",
        archivo: ".github/workflows/ci.yml",
        texto: "on:\n  push:\n    branches: [ main ]\n  pull_request:\njobs:\n  construir-probar-publicar:\n    strategy:\n      matrix:\n        include:\n          - servicio: servicio-solicitudes\n            base_datos: db-solicitudes\n    steps:\n      - run: mvn -B verify\n        working-directory: ${{ matrix.servicio }}",
      },
      guion: {
        decir: [
          "Antes de pasar al clúster, para el equipo técnico, veamos el archivo que lo hace. GitHub encuentra los workflows en la carpeta .github/workflows. La sección on dice cuándo se dispara: con cada push a main y con cada Pull Request.",
          "La matriz crea un trabajo por servicio, cada uno con su base. Cada trabajo corre mvn verify dentro de su carpeta. En solicitudes, además, arranca el JAR y espera ver la solicitud CAM-002 que se carga al iniciar. Al final, construye y publica la imagen.",
        ],
        instrucciones: ["Abrir el archivo en GitHub solo en modo lectura."],
        transicion: "Con las imágenes publicadas, falta llevarlas al clúster.",
      },
    },
  ],
};

export const observabilidad: Seccion = {
  id: "s06",
  numero: 6,
  titulo: "Desplegar y operar",
  corto: "Operar",
  participante: "p6",
  subtitulo: "Cómo lo llevamos a un clúster, lo mantenemos corriendo y sabemos qué pasa adentro.",
  temas: ["Fundamentos de Kubernetes", "Del contenedor al clúster", "Puesta a punto", "Logs y monitoreo", "Centralización de logs"],
  icono: "ship-wheel",
  claves: {
    problema: "Si un servicio se cae de madrugada, alguien tiene que levantarlo y después averiguar qué pasó.",
    sencillo: "Kubernetes mantiene el sistema corriendo; los logs y la salud nos dicen qué está pasando.",
    visual: "Deployment → Pod → Service; App → Promtail → Loki → Grafana.",
    aplicacion: "Los manifiestos de k8s/, Promtail, Loki y Grafana, y Actuator en cada servicio.",
    evidencia: "kubectl get pods, una búsqueda en Grafana por número de evento y la pestaña Salud de la UI.",
  },
  diapositivas: [
    {
      id: "s06-kubernetes",
      titulo: "Del contenedor al clúster",
      idea: "Decimos qué queremos; Kubernetes se encarga de mantenerlo.",
      visible: ["Deployment: cuántas copias de cada servicio", "Pod: donde corre el contenedor", "Service: un nombre fijo para encontrarlo", "Secret y disco persistente para las bases"],
      comparacion: "Como un termostato: le dices la temperatura que quieres y él se encarga de mantenerla.",
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "kubernetes",
      codigo: { lenguaje: "bash", archivo: "despliegue local", texto: "bash construir.sh           # imágenes de los 3 componentes\nkubectl apply -f k8s/\nkubectl get pods,svc,pvc\nkubectl port-forward svc/arka-lite-ui 8088:8080" },
      guion: {
        decir: [
          "Kubernetes funciona como un termostato. No le decimos qué hacer paso a paso: le decimos el estado que queremos, por ejemplo una copia de cada servicio, y él se encarga de mantenerlo.",
          "El Deployment dice cuántas copias queremos. Cada copia corre en un Pod. El Service le da a cada servicio un nombre fijo dentro del clúster, para que los demás lo encuentren. Y las bases guardan su contraseña en un Secret y sus datos en un disco que sobrevive a los reinicios.",
          "En el taller desplegamos ARKA-Lite completo en un clúster con un solo comando: kubectl apply sobre la carpeta k8s.",
        ],
        transicion: "¿Y cómo sabe Kubernetes si un servicio está bien?",
        respaldo: "docs/operaciones/kubernetes-local.md",
      },
    },
    {
      id: "s06-arranque",
      titulo: "Puesta a punto: arranque y salud",
      idea: "Arrancar no es lo mismo que estar listo. Si un Pod se ve así, esta es la primera pregunta:",
      visible: ["Antes de arrancar, espera a sus dependencias", "Readiness: ¿ya puede recibir tráfico?", "Liveness: ¿hay que reiniciarlo?", "Si un Pod muere, Kubernetes crea otro"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "tarjetas",
        columnas: 2,
        tarjetas: [
          { icono: "hourglass", titulo: "Pending", texto: "¿Hay recursos o falta el disco?", tono: "advertencia" },
          { icono: "image-off", titulo: "ImagePullBackOff", texto: "¿Existe la imagen en el clúster?", tono: "error" },
          { icono: "refresh-cw", titulo: "CrashLoopBackOff", texto: "¿Qué dicen los logs del contenedor?", tono: "error" },
          { icono: "heart-pulse", titulo: "Running, sin Ready", texto: "¿Responde la ruta de salud?", tono: "advertencia" },
        ],
      },
      tabla: {
        encabezados: ["Si el Pod está…", "Primera pregunta"],
        filas: [
          ["Pending", "¿Hay recursos o falta el disco?"],
          ["ImagePullBackOff", "¿Existe la imagen en el clúster?"],
          ["CrashLoopBackOff", "¿Qué dicen los logs del contenedor?"],
          ["Running, sin Ready", "¿Responde la ruta de salud?"],
        ],
      },
      guion: {
        decir: [
          "En la puesta a punto aprendimos que arrancar no es lo mismo que estar listo. Por eso, antes de iniciar, cada servicio espera a que su base y sus dependencias respondan.",
          "Kubernetes hace dos preguntas a cada Pod. La primera: ¿ya puedes recibir tráfico? Si no, no le manda peticiones. La segunda: ¿sigues vivo? Si no responde, lo reinicia.",
          "Y si borramos un Pod a propósito, Kubernetes crea otro solo. En la tabla está la primera pregunta que nos hacemos según el estado en que veamos un Pod.",
        ],
        demo: { accion: "kubectl delete pod de servicio-solicitudes y luego kubectl get pods.", evidencia: "Aparece un Pod nuevo que vuelve a estar Ready." },
        transicion: "El sistema corre. ¿Cómo sabemos qué está pasando adentro?",
      },
    },
    {
      id: "s06-logs",
      titulo: "Centralizar los logs",
      idea: "Todos los logs, en un solo lugar.",
      visible: ["Cada servicio escribe sus logs en JSON", "Promtail los recoge", "Loki los guarda", "Grafana permite buscarlos"],
      comparacion: "Como la caja negra de un avión: registra todo lo que pasó, para revisarlo después.",
      iconoComparacion: "plane",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "server", titulo: "Servicios", texto: "Escriben sus logs en JSON, con el traceId.", tono: "marino" },
          { icono: "scan-eye", titulo: "Promtail", texto: "Los recoge de todos los contenedores.", tono: "advertencia" },
          { icono: "archive", titulo: "Loki", texto: "Los guarda y los ordena por servicio.", tono: "advertencia" },
          { icono: "chart-line", titulo: "Grafana", texto: "Permite buscarlos en un solo lugar.", tono: "correcto" },
        ],
      },
      diagrama: "logs",
      codigo: { lenguaje: "yaml", archivo: "observabilidad/promtail.yaml", texto: "clients:\n  - url: http://loki:3100/loki/api/v1/push\nscrape_configs:\n  - job_name: docker\n    docker_sd_configs:\n      - host: unix:///var/run/docker.sock" },
      guion: {
        decir: [
          "Los logs son como la caja negra de un avión: registran lo que pasó para poder revisarlo después. El problema es que cada servicio tiene su propia caja negra.",
          "En el taller de centralización de logs armamos este recorrido. Cada servicio escribe sus logs en formato JSON. Promtail los recoge de todos los contenedores, Loki los guarda y Grafana nos deja buscarlos en un solo lugar.",
          "Así podemos seguir un evento de un servicio a otro buscando su número, sin entrar a cada contenedor. Desde la interfaz, el menú Contratos tiene un acceso directo a Grafana.",
        ],
        demo: { accion: "Grafana › Explore › Loki: {service=\"servicio-solicitudes\"} |= \"evento\".", evidencia: "Las líneas “Intentando publicar evento” con el número del evento." },
        transicion: "Además de los logs, cada servicio dice si está bien.",
        respaldo: "docs/operaciones/observabilidad.md",
      },
    },
    {
      id: "s06-campos",
      titulo: "Qué registran hoy los logs",
      visible: ["Momento, nivel y servicio", "Número de evento y de solicitud dentro del mensaje", "La traza viaja entre servicios por el RestClient", "Campos de destino y duración: propuesta"],
      recorridos: ["tecnico"],
      tabla: {
        encabezados: ["Campo", "Hoy", "Dónde"],
        filas: [
          ["@timestamp, log.level, logger", "Registrado", "Formato ECS de Spring Boot"],
          ["service", "Registrado", "Etiqueta que agrega Promtail"],
          ["eventoId e id de solicitud", "Dentro del texto", "PublicadorConReintento, ConsumoIdempotente"],
          ["Destino, intento y duración", "Propuesto", "Hoy van en el texto o no se registran"],
        ],
      },
      guion: {
        decir: [
          "Para el equipo técnico: un buen log responde qué pasó, en qué servicio, cuándo y con qué identificadores. Hoy registramos el momento, el nivel, el servicio y los números de evento y de solicitud dentro del mensaje.",
          "Las llamadas entre servicios usan un RestClient preparado para propagar la traza. Registrar el destino, el intento y la duración como campos separados queda como mejora propuesta.",
        ],
        transicion: "Además de los logs, cada servicio dice si está bien.",
      },
    },
    {
      id: "s06-salud",
      titulo: "Salud y monitoreo",
      idea: "Cada servicio responde: ¿estás bien?",
      visible: ["Actuator expone la salud de cada servicio", "Revisa, por ejemplo, la conexión con la base", "Kubernetes y la UI la consultan", "UP no garantiza que todos los avisos llegaron"],
      iconos: ["heart-pulse", "database", "ship-wheel", "triangle-alert"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: { tipo: "captura", capturas: [{ archivo: "ui-salud.png", titulo: "La pestaña Salud de la UI", url: "localhost:8088/#/salud" }] },
      diagrama: "metricas",
      guion: {
        decir: [
          "Cada servicio tiene una dirección de salud que responde si está bien. Por dentro revisa, por ejemplo, que pueda hablar con su base de datos. Kubernetes la usa para decidir si un Pod está listo, y la interfaz la muestra en la pestaña Salud.",
          "Pero ojo: que un servicio diga UP solo significa que responde. No garantiza que todos los avisos llegaron. Para eso miramos la pestaña Enviadas y los logs.",
          "Las métricas, como cuántas peticiones recibe cada servicio, ya se exponen. Guardarlas en el tiempo con Prometheus queda como siguiente paso.",
        ],
        pregunta: { texto: "Si todo está UP y falta un aviso, ¿qué miramos?", respuesta: "Si el evento se entregó y se consumió, en Enviadas, y los logs del relevador y de notificaciones." },
        transicion: "Ya tenemos todas las piezas. Falta ensamblarlas con la interfaz.",
      },
    },
  ],
};

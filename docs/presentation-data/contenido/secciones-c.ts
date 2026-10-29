import type { Seccion } from "./tipos.ts";

// Partes 5 y 6: DevOps (Docker, Kubernetes y CI/CD, a fondo) y
// observabilidad (vista general).

export const devops: Seccion = {
  id: "s05",
  numero: 5,
  titulo: "DevOps: Docker y Kubernetes",
  corto: "DevOps",
  subtitulo: "Docker empaqueta, Kubernetes administra y el pipeline prueba cada cambio.",
  temas: ["Docker y Compose", "Kubernetes", "CI/CD con GitHub Actions"],
  icono: "container",
  enfoque: "fondo",
  rol: "plataforma",
  diapositivas: [
    {
      id: "s05-devops",
      titulo: "¿Qué es DevOps? Del código a la operación",
      idea: "No es una herramienta: es un solo camino, automático y repetible, del código a producción y de vuelta.",
      visible: ["El código entra por ramas y Pull Request", "Se construye y se prueba solo, en cada cambio", "Se empaqueta en una imagen y se publica", "Se despliega y se opera en Kubernetes", "Se observa, y lo aprendido vuelve al código"],
      valor: "Un camino único y automático del código a producción: menos pasos manuales y menos errores.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "tuberia",
        etapas: [
          { icono: "git-branch", titulo: "Código", texto: "Ramas y Pull Request." },
          { icono: "settings", titulo: "Construir", texto: "Maven compila." },
          { icono: "flask-conical", titulo: "Probar", texto: "En cada cambio." },
          { icono: "package", titulo: "Imagen", texto: "Docker la empaqueta." },
          { icono: "cloud-upload", titulo: "Publicar", texto: "En GHCR." },
          { icono: "ship-wheel", titulo: "Operar", texto: "Kubernetes la despliega." },
          { icono: "chart-line", titulo: "Observar", texto: "Loki y Grafana." },
        ],
      },
      guion: {
        decir: [
          "Gracias. DevOps no es una herramienta ni un puesto: es una forma de trabajar en la que desarrollo y operación dejan de ser dos mundos separados. Todo cambio recorre el mismo camino, de forma automática y repetible. Empieza en el código, en una rama con su Pull Request.",
          "[clic] Se construye, [clic] y se prueba solo, en cada cambio. [clic] Se empaqueta en una imagen Docker [clic] que se publica en un registro. [clic] Esa imagen se despliega y se opera en Kubernetes, [clic] y lo que pasa adentro se observa con los logs en un solo lugar. Lo que aprendemos al observar vuelve al código, y el ciclo empieza otra vez.",
          "En las próximas láminas recorremos ese camino con ARKA-Lite, pieza por pieza: primero Docker y Kubernetes, después el pipeline, y al final cómo se opera.",
        ],
        preguntas: [{ texto: "¿DevOps es un equipo aparte?", respuesta: "Es una práctica. Puede haber personas que la impulsen, pero funciona cuando desarrollo e infraestructura comparten el mismo camino y las mismas herramientas." }],
        transicion: "Empecemos por las dos herramientas que más se nombran: Docker y Kubernetes.",
        respaldo: "docs/operaciones/infraestructura-y-entrega.md",
      },
    },
    {
      id: "s05-complemento",
      titulo: "Docker y Kubernetes: no compiten, se complementan",
      idea: "Docker construye la caja; Kubernetes la pone a correr y la cuida.",
      visible: ["Docker empaqueta la app con todo lo que necesita", "Kubernetes decide dónde corre y la vigila", "La misma imagen sirve en los dos", "Uno sin el otro queda a medias"],
      comparacion: "Como el transporte de carga: Docker es el contenedor estándar y Kubernetes, el puerto que los acomoda, los vigila y reemplaza el que se daña.",
      iconoComparacion: "ship-wheel",
      valor: "El mismo paquete del laptop al servidor, y un sistema que se cuida solo.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "contraste",
        union: "+",
        lados: [
          { titulo: "Docker: empaqueta", icono: "container", tono: "cian", puntos: ["Mete la app con Java y todo lo que usa", "Crea una imagen que no cambia", "Corre igual en una laptop o en un servidor", "Compose levanta varias cajas juntas"] },
          { titulo: "Kubernetes: administra", icono: "ship-wheel", tono: "correcto", puntos: ["Decide dónde corre cada caja", "Si una se cae, levanta otra", "Le da a cada servicio un nombre fijo", "Puede correr más copias si hay carga"] },
        ],
      },
      guion: {
        decir: [
          "Docker y Kubernetes muchas veces se presentan como si uno reemplazara al otro, y no es así: no compiten, se complementan. Docker resuelve el clásico “en mi máquina funciona”: empaqueta la aplicación con Java y todo lo que necesita en una imagen, un paquete que no cambia y que corre igual en una laptop o en un servidor.",
          "[clic] Kubernetes empieza donde termina Docker. No empaqueta nada: toma esas imágenes y las administra. Decide dónde corre cada contenedor, lo vigila y, si uno se cae, levanta otro.",
          "Piénsenlo como el transporte de carga: Docker es el contenedor estándar y Kubernetes es el puerto que los acomoda y reemplaza el que se daña. En nuestra computadora, Docker Compose levanta los ocho contenedores del sistema con un solo comando; en el clúster, esas mismas imágenes las administra Kubernetes, sin recompilar nada.",
        ],
        preguntas: [
          { texto: "¿Docker es una máquina virtual?", respuesta: "No. Es más liviano: comparte el sistema operativo y solo aísla la aplicación y lo que necesita." },
          { texto: "¿Necesitamos Kubernetes para todo?", respuesta: "No. Para un sistema pequeño basta Docker Compose en un servidor. Kubernetes vale la pena cuando hay varios servicios, varias copias o hay que recuperarse solo." },
        ],
        transicion: "Veamos cómo nace un contenedor.",
        respaldo: "docs/operaciones/docker-y-compose.md",
      },
    },
    {
      id: "s05-docker",
      titulo: "De código a contenedor",
      idea: "Una receta que da el mismo resultado en cualquier computadora.",
      visible: ["Dockerfile: la receta", "Etapa build: compila con Maven", "Imagen: solo Java y el JAR", "Contenedor: corre sin privilegios"],
      valor: "La receta queda escrita: cualquiera construye la misma imagen, en cualquier computadora.",
      recorridos: ["ejecutivo", "tecnico"],
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
          "Así nace un contenedor. Todo empieza en el Dockerfile, que es la receta: qué se instala y qué se copia. [clic] En una primera etapa, Maven compila el código y produce el archivo JAR, que es la aplicación lista para correr.",
          "[clic] En la segunda etapa se arma la imagen final, solo con Java y ese JAR: más liviana y sin herramientas de compilación. Una imagen es un paquete que no cambia: la misma que probamos es la que se despliega.",
          "[clic] Cuando la imagen corre, se llama contenedor. El nuestro corre con un usuario sin privilegios: si alguien comprometiera la aplicación, no sería administrador del contenedor.",
        ],
        transicion: "Un contenedor solo no es el sistema. Necesitamos levantarlos todos juntos.",
        respaldo: "docs/operaciones/docker-y-compose.md",
      },
    },
    {
      id: "s05-compose",
      titulo: "Todo el sistema con un comando",
      idea: "Ocho contenedores, una red y la configuración por variables de entorno.",
      visible: ["Servicios, bases, UI y logs en un archivo", "Cada servicio se llama por su nombre", "La configuración entra por variables", "La misma imagen sirve en Compose y en Kubernetes"],
      valor: "Una persona nueva levanta el sistema completo en minutos, no en un día.",
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
          "Con Docker, cada servicio viaja con su receta, y con Docker Compose levantamos el sistema completo con un solo comando: los dos servicios, sus dos bases, la interfaz y las herramientas de logs. Ocho contenedores en total.",
          "Dentro de la red de Compose, cada servicio encuentra al otro por su nombre, no por localhost. Y la configuración, como la cadena de conexión que vimos en la parte de datos, entra por variables de entorno. Así la misma imagen sirve en nuestra computadora y en el clúster, sin recompilar.",
          "Para alguien que llega nuevo al equipo, esto es la diferencia entre un día configurando su máquina y cinco minutos.",
        ],
        demo: { accion: "docker compose ps", evidencia: "La UI, los servicios y las bases arriba y sanos." },
        preguntas: [{ texto: "Dentro de un contenedor, ¿a dónde lleva localhost?", respuesta: "Al mismo contenedor, no a otro servicio. Por eso usamos el nombre del servicio." }],
        transicion: "Y ese mismo comando también corre en la nube: Codespaces.",
      },
    },
    {
      id: "s05-codespaces",
      titulo: "Sin instalar nada: GitHub Codespaces",
      idea: "El sistema completo, levantado en la nube desde una rama: así hacemos la demostración.",
      visible: ["Se crea desde una rama del repositorio", "Una máquina en la nube con Docker adentro", "Un script construye y levanta los 8 contenedores", "La UI, Grafana y Swagger se abren por https"],
      porque: "Probar o mostrar el sistema no depende de la computadora de nadie ni de la red de la oficina.",
      valor: "Cualquiera del equipo prueba o muestra el sistema desde un navegador, sin instalar nada.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "git-branch", titulo: "Una rama", texto: "Code › Codespaces › Crear.", tono: "marino" },
          { icono: "cloud", titulo: "Máquina en la nube", texto: "4 núcleos y Docker adentro.", tono: "marino" },
          { icono: "container", titulo: "levantar.sh", texto: "Construye y levanta los 8 contenedores.", tono: "cian" },
          { icono: "globe", titulo: "Puertos https", texto: "UI, Grafana y Swagger, privados.", tono: "cian" },
          { icono: "monitor", titulo: "Demo", texto: "Desde el navegador.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "Una pieza que nos resolvió la demostración: GitHub Codespaces. Desde una rama del repositorio se crea una máquina en la nube lista para trabajar. [clic] La configuración vive en el mismo repositorio, en la carpeta .devcontainer: pide cuatro núcleos y Docker adentro.",
          "[clic] Al crearla, un script construye las imágenes y levanta los ocho contenedores, igual que en nuestra computadora. [clic] Cada puerto queda publicado por https y privado para la cuenta que lo abrió: la interfaz, Grafana y los dos Swagger. [clic] Y la demostración se hace desde el navegador.",
          "El valor: cualquiera del equipo puede probar o mostrar el sistema sin instalar nada y sin depender de la red de la oficina. Lo verificamos con la prueba de humo completa: siete de siete.",
        ],
        preguntas: [{ texto: "¿Cuánto cuesta?", respuesta: "GitHub lo cobra por horas de núcleo: esta máquina de 4 núcleos consume 4 por cada hora encendida. Se detiene al terminar y deja de consumir." }],
        transicion: "¿Y quién construye y publica las imágenes en cada cambio? El pipeline.",
        respaldo: "docs/operaciones/codespaces.md",
      },
    },
    {
      id: "s05-pipeline",
      titulo: "CI/CD: del push a la imagen publicada",
      idea: "CI comprueba cada cambio; CD deja la imagen lista para desplegar.",
      visible: ["Un push a una rama de trabajo, solo, no dispara nada", "Pull Request: el CI compila, prueba, arranca y construye", "Fusión a main: el mismo CI y luego el CD publica la imagen", "Desplegar en Kubernetes hoy es un paso manual"],
      porque: "Un cambio roto se detecta en el Pull Request, en minutos, antes de llegar a main.",
      valor: "Un error se detecta antes de llegar a main, y cada imagen se rastrea hasta su commit.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "caminos",
        caminos: [
          {
            titulo: "Pull Request hacia main",
            tono: "marino",
            pasos: [
              { icono: "git-pull-request", titulo: "Abres el PR", texto: "Desde tu rama feat/…" },
              { icono: "flask-conical", titulo: "Compila y prueba", texto: "mvn verify con PostgreSQL temporal" },
              { icono: "power", titulo: "Arranca", texto: "El servicio responde de verdad" },
              { icono: "package", titulo: "Construye la imagen", texto: "docker build" },
              { icono: "circle-check", titulo: "Verde o rojo", texto: "El resultado queda en el PR" },
            ],
            flechas: ["", "", "", ""],
            grupos: [{ desde: 1, hasta: 3, titulo: "CI · integración continua", tono: "cian" }],
          },
          {
            titulo: "Fusión a main",
            tono: "correcto",
            pasos: [
              { icono: "git-merge", titulo: "Fusionas a main", texto: "Después de la revisión" },
              { icono: "flask-conical", titulo: "El mismo CI", texto: "Compila, prueba y arranca" },
              { icono: "cloud-upload", titulo: "Publica en GHCR", texto: "La imagen, con el SHA del commit" },
              { icono: "ship-wheel", titulo: "Despliegue", texto: "kubectl apply -f k8s/ · manual" },
            ],
            flechas: ["", "", ""],
            grupos: [
              { desde: 1, hasta: 1, titulo: "CI", tono: "cian" },
              { desde: 2, hasta: 2, titulo: "CD · entrega continua", tono: "correcto" },
              { desde: 3, hasta: 3, titulo: "Hoy, a mano", tono: "advertencia" },
            ],
          },
        ],
      },
      codigo: {
        lenguaje: "yaml",
        archivo: ".github/workflows/ci.yml",
        texto: "on:\n  push:\n    branches: [ main ]   # fusión a main\n  pull_request:          # cada PR\njobs:\n  construir-probar-publicar:\n    services:\n      postgres: { image: postgres:17 }\n    steps:\n      - run: mvn -B verify\n      - run: java -jar … # espera ver CAM-002\n      - run: docker build … && docker push ghcr.io/…:${{ github.sha }}",
      },
      guion: {
        decir: [
          "Así funciona el pipeline, desde el momento del push. Primero, algo que sorprende: un push a una rama de trabajo, por sí solo, no dispara nada. El pipeline arranca cuando se abre o se actualiza un Pull Request hacia main. Ahí corre la integración continua, el CI: un servidor de GitHub compila cada servicio, corre todas sus pruebas contra un PostgreSQL temporal, arranca el servicio de verdad hasta ver sus datos iniciales y construye la imagen Docker. El resultado queda en el mismo Pull Request: verde o rojo.",
          "[clic] Cuando el Pull Request se aprueba y se fusiona a main, corre otra vez el mismo CI, y después viene el CD, la entrega continua: la imagen se publica en el registro de GitHub, etiquetada con el código del commit, lista para desplegar.",
          "Y una distinción que vale la pena: CD puede ser entrega continua, que es dejar la imagen lista, o despliegue continuo, que es instalarla sola en el ambiente. Nosotros llegamos a la entrega; el despliegue en Kubernetes es un paso aparte, con kubectl apply. Automatizarlo es el siguiente paso natural, con una aprobación de por medio.",
        ],
        preguntas: [
          { texto: "¿Por qué no se despliega solo?", respuesta: "Porque es un laboratorio con un clúster local. En un ambiente real se agrega un paso de despliegue con aprobación, o una herramienta que aplica en el clúster lo que está en main." },
          { texto: "¿Las pruebas usan la base real?", respuesta: "No: GitHub crea un PostgreSQL temporal para cada ejecución, con una clave distinta cada vez, y lo descarta al terminar." },
        ],
        transicion: "La imagen ya está publicada. Ahora, dónde corre: Kubernetes. Le paso la palabra a mi compañero.",
        respaldo: "docs/automatizacion/ci-yaml-paso-a-paso.md",
      },
    },
    {
      id: "s05-k8s-como",
      titulo: "Cómo trabaja Kubernetes: del archivo al Pod",
      idea: "Describimos en un archivo cómo queremos el sistema; Kubernetes hace lo necesario para que así sea, todo el tiempo.",
      visible: ["Escribimos el estado deseado en YAML", "kubectl apply se lo entrega al clúster", "El Deployment crea los Pods", "El Service les da un nombre fijo", "Kubernetes compara y corrige sin parar"],
      comparacion: "Como un termostato: no le decimos cuándo prender el aire, le decimos la temperatura que queremos y él se encarga.",
      iconoComparacion: "thermometer",
      valor: "El clúster se mantiene solo como lo describimos, sin intervención manual.",
      rol: "operacion",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "file-code", titulo: "Manifiesto YAML", texto: "Qué imagen, cuántas copias y qué variables.", tono: "marino" },
          { icono: "terminal", titulo: "kubectl apply", texto: "Se lo entrega al clúster.", tono: "marino" },
          { icono: "layers", titulo: "Deployment", texto: "Crea los Pods con la imagen.", tono: "cian" },
          { icono: "network", titulo: "Service", texto: "Un nombre fijo para encontrarlos.", tono: "cian" },
          { icono: "refresh-cw", titulo: "Ciclo de control", texto: "Compara lo que hay con lo pedido y corrige.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "Gracias. Para entender Kubernetes hay que cambiar el chip: no le damos órdenes paso a paso, le decimos cómo queremos que esté el sistema. Eso se escribe en un archivo YAML, un manifiesto: qué imagen usar, cuántas copias de cada servicio y qué variables recibe.",
          "[clic] Con kubectl apply, ese archivo se le entrega al clúster. [clic] El Deployment lee el manifiesto y crea los Pods, que son donde corren los contenedores. [clic] El Service les da un nombre fijo, para que los demás los encuentren aunque un Pod se reemplace.",
          "[clic] Y lo más importante: Kubernetes compara todo el tiempo lo que hay con lo que pedimos. Si falta algo, lo crea; si sobra, lo quita. A eso se le llama ciclo de control, y es lo que hace que el sistema se repare solo.",
        ],
        preguntas: [{ texto: "¿Qué pasa si alguien cambia algo a mano en el clúster?", respuesta: "El ciclo de control lo devuelve a lo que dice el manifiesto. Por eso los cambios se hacen en el archivo, versionado en el repositorio, y no a mano." }],
        transicion: "Veamos las piezas que usamos en ARKA-Lite.",
        respaldo: "docs/operaciones/kubernetes-local.md",
      },
    },
    {
      id: "s05-kubernetes",
      titulo: "Los recursos de Kubernetes",
      idea: "Describimos el estado que queremos; Kubernetes lo mantiene.",
      visible: ["Deployment y Pod por componente", "Service: un nombre fijo", "Secret para la clave de la base", "Un disco persistente para cada base"],
      valor: "El estado del sistema queda escrito y versionado, no en la memoria de alguien.",
      rol: "operacion",
      recorridos: ["ejecutivo", "tecnico"],
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
            { icono: "key-round", titulo: "Secret arka-postgres", texto: "La clave de las bases" },
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
          "Estas son las piezas que usamos en ARKA-Lite. Arriba, el acceso: un Service le da a cada componente un nombre fijo, para que los demás lo encuentren aunque el contenedor cambie.",
          "[clic] Luego, el cómputo: un Deployment por componente, cinco en total, que dice cuántas copias queremos. Antes de arrancar, cada servicio espera a que su base responda, y una prueba de salud evita mandarle tráfico antes de tiempo.",
          "[clic] La configuración: la clave de la base en un Secret, como vimos en la parte de datos, y el resto en variables de entorno. [clic] Y los datos: cada base tiene su disco persistente, que sobrevive aunque el Pod se recree. Todo se aplica con un solo comando: kubectl apply sobre la carpeta k8s.",
        ],
        preguntas: [{ texto: "¿Por qué la base corre como un Deployment y no como un servicio administrado?", respuesta: "Porque es un ambiente de laboratorio. En producción conviene una base administrada o un StatefulSet con respaldos." }],
        transicion: "¿Y qué pasa cuando algo se cae?",
        respaldo: "docs/operaciones/kubernetes-local.md",
      },
    },
    {
      id: "s05-autocuracion",
      titulo: "Cuando un Pod se cae",
      idea: "Kubernetes vuelve solo al estado que declaramos.",
      visible: ["El Deployment detecta que falta una copia", "Crea un Pod nuevo", "Espera a la base y a su salud", "Vuelve a recibir tráfico, sin intervención"],
      valor: "Un sistema que se recupera solo, sin que nadie se despierte a las tres de la mañana.",
      rol: "operacion",
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
          "Ya vimos que Kubernetes compara todo el tiempo lo que hay con lo que pedimos. Veamos qué pasa cuando se cae el Pod de solicitudes, por un error, porque se reinició el servidor o porque alguien lo borró.",
          "[clic] En el mismo instante, el Deployment detecta que falta una copia. [clic] En un segundo, crea un Pod nuevo con la misma imagen. [clic] El Pod nuevo espera a que su base y notificaciones respondan, [clic] y solo cuando su prueba de salud contesta, vuelve a recibir tráfico.",
          "[clic] Nadie intervino. Y como los avisos pendientes están en la base, no en memoria, nada se pierde mientras tanto. Aquí se juntan las tres partes que vimos a fondo: la base guarda, el Outbox espera y Kubernetes repara.",
        ],
        demo: { accion: "kubectl delete pod -l app=servicio-solicitudes y luego kubectl get pods -w.", evidencia: "Aparece un Pod nuevo que vuelve a estar Ready." },
        preguntas: [{ texto: "¿Y si se cae la base?", respuesta: "Su Pod también se recrea y los datos siguen en el disco persistente; los servicios esperan a que vuelva." }],
        transicion: "Esto es lo que aprendimos de DevOps.",
      },
    },
    {
      id: "s05-aprendizajes",
      titulo: "DevOps: lo que aprendimos",
      visible: ["Docker y Kubernetes se complementan", "La imagen es el entregable", "Configurar por variables, no por código", "Declarar el estado y probar que arranca"],
      valor: "Despliegues repetibles y un sistema que se repara solo.",
      rol: "operacion",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "1", titulo: "comando para levantar todo" }, { valor: "1", titulo: "imagen por commit, rastreable" }],
        items: [
          { icono: "container", titulo: "Docker y Kubernetes se complementan", texto: "Uno empaqueta; el otro ejecuta y cuida.", valor: "Un mismo paquete, de la laptop al clúster." },
          { icono: "package", titulo: "La imagen es el entregable", texto: "Lo que prueba el pipeline es lo que se despliega.", valor: "Sin sorpresas entre ambientes." },
          { icono: "settings", titulo: "Configurar por variables", texto: "La cadena de conexión y las direcciones vienen del ambiente.", valor: "Un solo artefacto para todos los ambientes." },
          { icono: "ship-wheel", titulo: "Declarar el estado deseado", texto: "Deployments, pruebas de salud y un pipeline que arranca el servicio.", valor: "El clúster se repara solo y los errores aparecen antes." },
        ],
      },
      guion: {
        decir: [
          "Cuatro aprendizajes de DevOps. [clic] Docker y Kubernetes no compiten: uno empaqueta y el otro ejecuta y cuida. [clic] La imagen es el entregable: lo que prueba el pipeline es exactamente lo que se despliega.",
          "[clic] Configurar por variables y no por código, empezando por la cadena de conexión. [clic] Y declarar el estado que queremos, y probar que el servicio arranca, no solo que compila.",
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
  subtitulo: "Logs en un solo lugar, trazas entre servicios y salud de cada componente.",
  temas: ["Logs centralizados", "Trazas", "Salud con Actuator"],
  icono: "chart-line",
  enfoque: "general",
  rol: "operacion",
  diapositivas: [
    {
      id: "s06-logs",
      titulo: "Todos los logs, en un solo lugar",
      idea: "Seguir un evento de un servicio a otro sin entrar a ningún contenedor.",
      visible: ["Cada servicio escribe sus logs en JSON", "Promtail los recoge de todos los contenedores", "Loki los guarda por servicio", "Grafana los busca por traceId o eventoId"],
      comparacion: "Como la caja negra de un avión: registra lo que pasó, para revisarlo después.",
      iconoComparacion: "plane",
      valor: "Diagnosticar un error entre sistemas en minutos, con una sola búsqueda.",
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
          "La observabilidad la vemos de forma general. Con varios servicios, cada uno tiene sus logs, y si algo falla no queremos entrar contenedor por contenedor. Cada servicio escribe sus logs en JSON, con un formato estándar. [clic] Promtail los recoge de todos los contenedores, [clic] Loki los guarda etiquetados por servicio [clic] y Grafana nos deja buscarlos en un solo lugar.",
          "Como cada llamada lleva su traceId, con una sola búsqueda vemos el viaje completo de un evento: cuándo lo publicó el relevador y cuándo lo consumió notificaciones. Y cada servicio expone su salud, que la interfaz muestra en verde o en rojo; lo van a ver en la demostración.",
        ],
        demo: { accion: "Grafana › Explore › Loki: {service=\"servicio-notificaciones\"} |= \"evento\".", evidencia: "Las líneas “Consume evento” y “aviso creado” con el número del evento." },
        transicion: "Esto es lo que aprendimos de observar el sistema.",
        respaldo: "docs/operaciones/observabilidad.md",
      },
    },
    {
      id: "s06-salud",
      titulo: "Salud de cada servicio",
      idea: "Cada servicio responde: ¿estás bien?",
      visible: ["Actuator expone health, info y métricas", "La salud revisa la conexión con la base", "Kubernetes y la UI la consultan", "UP no garantiza que todos los avisos llegaron"],
      iconos: ["heart-pulse", "database", "ship-wheel", "triangle-alert"],
      recorridos: ["tecnico"],
      visual: { tipo: "captura", capturas: [{ archivo: "ui-salud.png", titulo: "La pestaña Salud de la UI", url: "localhost:8088/#/salud" }] },
      guion: {
        decir: [
          "Cada servicio expone su salud con Spring Boot Actuator: por dentro revisa, por ejemplo, que pueda hablar con su base. La interfaz la muestra en la pestaña Salud.",
          "Pero ojo: que un servicio diga UP solo significa que responde. No garantiza que todos los avisos llegaron. Para eso miramos los eventos pendientes y los logs.",
        ],
        preguntas: [{ texto: "Si todo está UP y falta un aviso, ¿qué miramos?", respuesta: "Si el evento sigue pendiente en Enviadas, y los logs del relevador y de notificaciones." }],
        transicion: "Esto es lo que aprendimos de la observabilidad.",
      },
    },
    {
      id: "s06-aprendizajes",
      titulo: "Observabilidad: lo que aprendimos",
      visible: ["Logs estructurados desde el día uno", "Un identificador que cruce servicios", "Salud no es lo mismo que correcto"],
      valor: "Saber qué pasa adentro sin adivinar.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "1", titulo: "lugar para buscar todos los logs" }, { valor: "8", titulo: "contenedores observados" }],
        items: [
          { icono: "braces", titulo: "Logs estructurados desde el día uno", texto: "JSON con formato estándar, sin cambiar el código de negocio.", valor: "Buscar por campo en lugar de leer texto." },
          { icono: "waypoints", titulo: "Un identificador que cruce servicios", texto: "El traceId viaja en cada llamada y el eventoId en cada log.", valor: "Diagnosticar un fallo entre servicios en minutos." },
          { icono: "activity", titulo: "Salud no es lo mismo que correcto", texto: "UP dice que responde; los pendientes dicen si entrega.", valor: "Medir el resultado del negocio, no solo el proceso." },
        ],
      },
      guion: {
        decir: [
          "Tres aprendizajes. [clic] Los logs estructurados se configuran desde el día uno; después es mucho más caro. [clic] En un sistema distribuido hace falta un identificador que cruce los servicios. [clic] Y salud no es lo mismo que correcto: un servicio puede estar arriba y tener avisos pendientes; hay que medir el resultado, no solo el proceso.",
        ],
        transicion: "Y ahora sí, veamos todo esto funcionando.",
      },
    },
  ],
};

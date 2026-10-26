import type { Seccion } from "./tipos.ts";

// Secciones 4 a 7: ejecutar, operar y entregar cambios.

export const docker: Seccion = {
  id: "s04",
  numero: 4,
  titulo: "Docker y ejecución en contenedores",
  corto: "Docker",
  participante: "p3",
  claves: {
    problema: "“En mi máquina funciona”: cada equipo tiene otro Java, otras variables y otra red.",
    sencillo: "El Dockerfile es la receta, la imagen el resultado y el contenedor el proceso que corre.",
    visual: "Etapa build → JAR → etapa final → imagen → contenedor.",
    aplicacion: "Dockerfile multietapa de cada servicio y de la UI; compose.yaml y compose.ui.yaml.",
    evidencia: "docker compose ps con los servicios saludables y la UI respondiendo en localhost:8088.",
  },
  diapositivas: [
    {
      id: "s04-imagen",
      titulo: "Imagen, contenedor y Dockerfile",
      visible: ["Receta → imagen → contenedor", "Dos etapas: compilar y ejecutar", "La imagen final no lleva Maven", "Corre sin usuario root"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "docker",
      codigo: {
        lenguaje: "bash",
        archivo: "servicio-solicitudes/Dockerfile",
        texto: "FROM maven:3.9-eclipse-temurin-26 AS build\nRUN mvn -q clean package -DskipTests\n\nFROM eclipse-temurin:26-jre\nCOPY --from=build /build/target/*.jar app.jar\nRUN useradd -r -u 1001 appuser1\nUSER appuser1\nENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]",
      },
      marcas: [{ texto: "La imagen omite pruebas; el CI ejecuta verify antes", certeza: "implementado" }],
      guion: {
        decir: [
          "El Dockerfile es la receta. La imagen es el resultado empaquetado. El contenedor es un proceso creado desde esa imagen con una configuración. Una misma imagen sirve para muchos contenedores.",
          "Nuestros Dockerfile tienen dos etapas. La primera tiene Maven y JDK 26 y construye el JAR. La final solo lleva JRE 26 y el JAR, y corre con un usuario sin privilegios.",
          "Empaquetar reduce diferencias, pero siguen importando la arquitectura del equipo, la red, la configuración, los recursos y los datos.",
        ],
        transicion: "¿Cómo se encuentran los contenedores entre sí?",
        respaldo: "docs/operaciones/docker-y-compose.md",
      },
    },
    {
      id: "s04-red",
      titulo: "Configuración, red y puertos",
      visible: ["Variables de entorno cambian conexiones sin tocar el JAR", "Dentro de la red: nombre del servicio", "localhost dentro de un contenedor es el propio contenedor", "Puerto publicado ≠ puerto interno"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Quién llama", "A dónde", "Con qué dirección"],
        filas: [
          ["Navegador", "UI", "http://localhost:8088"],
          ["Navegador", "API", "http://localhost:8088/api/… (mismo origen)"],
          ["Proxy de la UI", "solicitudes", "http://servicio-solicitudes:8080"],
          ["solicitudes", "notificaciones", "http://servicio-notificaciones:8080/eventos/solicitud-enviada"],
          ["Tu equipo", "notificaciones", "http://localhost:8081 (publicado)"],
        ],
      },
      marcas: [{ texto: "Compose no declara volúmenes estables para las bases", certeza: "implementado" }],
      guion: {
        decir: [
          "DB_URL y NOTIFICACIONES_URL cambian las conexiones sin recompilar. Dentro de Compose, cada servicio se encuentra por su nombre. Si dentro de un contenedor escribimos localhost, llegamos al mismo contenedor, no a otro servicio.",
          "EXPOSE documenta un puerto. El mapeo de Compose es el que publica el acceso desde nuestro equipo. Cambiar el puerto publicado no cambia el puerto interno del proceso.",
          "Las bases del Compose no tienen volúmenes estables declarados: no prometamos que los datos sobreviven a recrear contenedores.",
        ],
        demo: { accion: "docker compose -f compose.yaml -f compose.ui.yaml ps", evidencia: "Ambos servicios y la UI arriba; notificaciones healthy." },
        pregunta: { texto: "¿Cambiar el puerto publicado de 8081 a otro cambia el puerto del proceso?", respuesta: "No necesariamente: cambia el acceso desde el equipo; el destino interno sigue igual." },
        transicion: "Docker ejecuta procesos. Kubernetes agrega control declarativo.",
      },
    },
  ],
};

export const kubernetes: Seccion = {
  id: "s05",
  numero: 5,
  titulo: "Kubernetes y operación declarativa",
  corto: "Kubernetes",
  participante: "p3",
  claves: {
    problema: "Si un proceso muere a las tres de la mañana, alguien tiene que volver a iniciarlo.",
    sencillo: "Declaramos el estado deseado y Kubernetes trabaja para mantenerlo.",
    visual: "Deployment → ReplicaSet → Pod; Service → Pods listos.",
    aplicacion: "k8s/*.yaml para servicios y bases; k8s/ui/arka-ui.yaml para la UI.",
    evidencia: "kubectl get pods,svc,pvc y la UI por port-forward.",
  },
  diapositivas: [
    {
      id: "s05-recursos",
      titulo: "Estado deseado y recursos",
      visible: ["Un Pod ejecuta contenedores", "Deployment y ReplicaSet mantienen réplicas", "Service da un acceso estable a Pods listos", "Secret y PVC: credencial y disco"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "kubernetes",
      marcas: [
        { texto: "Sin Ingress, HPA ni ConfigMap en los manifiestos de los servicios", certeza: "implementado" },
        { texto: "Docker puede usarse sin Kubernetes", certeza: "implementado" },
      ],
      guion: {
        decir: [
          "En Kubernetes declaramos qué queremos: una imagen, un número de réplicas y una configuración. Los controladores comparan eso con lo que pasa y actúan.",
          "El Pod ejecuta los contenedores. El Deployment y su ReplicaSet mantienen la cantidad de Pods. El Service da un nombre estable y envía tráfico solo a Pods listos. Un Pod no reparte subredes.",
          "Las bases piden almacenamiento con un PVC, y un Secret entrega la contraseña. Compose y Kubernetes son dos rutas de ejecución distintas; Docker puede usarse sin Kubernetes.",
        ],
        transicion: "¿Cómo sabe Kubernetes si un Pod está bien?",
        respaldo: "docs/operaciones/kubernetes-local.md",
      },
    },
    {
      id: "s05-salud",
      titulo: "Arranque, salud y recuperación",
      visible: ["initContainers esperan dependencias", "Readiness: ¿puede recibir tráfico?", "Liveness: ¿hay que reiniciarlo?", "Reponer un Pod no recupera la memoria"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Estado del Pod", "Primera pregunta"],
        filas: [
          ["Pending", "¿Hay recursos o un PVC sin enlazar?"],
          ["ImagePullBackOff", "¿Existe la imagen en el clúster local?"],
          ["CrashLoopBackOff", "¿Qué dicen los logs del contenedor?"],
          ["Running sin Ready", "¿Responde la ruta de readiness?"],
        ],
      },
      codigo: { lenguaje: "bash", archivo: "diagnóstico", texto: "kubectl get pods,svc,pvc\nkubectl describe pod <nombre>\nkubectl logs deploy/servicio-solicitudes --tail=80\nkubectl port-forward svc/arka-ui 8088:8080" },
      guion: {
        decir: [
          "Los initContainers esperan a la base y a notificaciones antes de iniciar la aplicación. La readiness decide si un Pod recibe tráfico; la liveness permite reiniciar un contenedor que dejó de responder.",
          "Las aplicaciones tienen readiness sobre /solicitudes y /notificaciones; las bases usan pg_isready. La UI que agregamos tiene readiness y liveness sobre /salud.",
          "Si un Pod de notificaciones se reemplaza, los avisos en memoria se pierden. Y un PVC no sustituye un backup restaurable.",
        ],
        pregunta: { texto: "¿Dos Pods de notificaciones comparten la misma lista de avisos?", respuesta: "No. Cada proceso tiene su propia memoria." },
        demo: { accion: "kubectl get pods,svc,pvc y kubectl describe de un Pod.", evidencia: "Pods Running y Ready; eventos del Pod sin errores." },
        transicion: "Ya sabemos dónde corre una versión. Veamos cómo se valida y se publica.",
      },
    },
  ],
};

export const cicd: Seccion = {
  id: "s06",
  numero: 6,
  titulo: "CI/CD con GitHub Actions",
  corto: "CI/CD",
  participante: "p4",
  claves: {
    problema: "Sin verificación automática, un cambio roto puede llegar a main sin que nadie lo note.",
    sencillo: "Cada push o PR compila, prueba y publica imágenes de forma repetible.",
    visual: "Evento → jobs de matriz → preparar → probar → construir → publicar.",
    aplicacion: ".github/workflows/ci.yml con matriz por servicio y un job para la UI.",
    evidencia: "La ejecución en Actions y la imagen en GHCR con el SHA del commit.",
  },
  diapositivas: [
    {
      id: "s06-conceptos",
      titulo: "Integración, entrega y despliegue",
      visible: ["Integración: compilar y probar seguido", "Entrega: dejar una versión lista", "Despliegue: llevarla al destino", "Nuestro CI verifica y publica; no despliega"],
      recorridos: ["ejecutivo", "tecnico"],
      diagrama: "cicd",
      marcas: [{ texto: "No hay paso de despliegue al clúster", certeza: "implementado" }],
      guion: {
        decir: [
          "Integración continua es comprobar cambios con construcción y pruebas de forma frecuente. Entrega continua es dejar una versión validada lista. Despliegue continuo es llevarla además al destino de forma automática.",
          "En ARKA-Lite el workflow verifica los servicios y publica imágenes en GHCR. No despliega. Un pipeline verde no demuestra que el clúster esté corriendo la versión nueva.",
        ],
        pregunta: { texto: "¿Publicar una imagen en GHCR inicia un rollout en Kubernetes?", respuesta: "No. Hace falta un mecanismo de despliegue adicional." },
        transicion: "Leamos el archivo que lo hace.",
      },
    },
    {
      id: "s06-yaml",
      titulo: "Leer ci.yml",
      visible: ["on: push a main y pull_request", "Matriz: un job por servicio con su PostgreSQL", "mvn -B verify en la carpeta del servicio", "Imagen etiquetada con el SHA"],
      recorridos: ["tecnico"],
      codigo: {
        lenguaje: "yaml",
        archivo: ".github/workflows/ci.yml",
        texto: "on:\n  push:\n    branches: [ main ]\n  pull_request:\njobs:\n  construir-probar-publicar:\n    strategy:\n      matrix:\n        include:\n          - servicio: servicio-solicitudes\n            base_datos: db-solicitudes\n    steps:\n      - run: mvn -B verify\n        working-directory: ${{ matrix.servicio }}",
      },
      guion: {
        decir: [
          "GitHub descubre los workflows en .github/workflows. on dice qué eventos lo inician: push a main y Pull Requests. jobs agrupa trabajos y runs-on elige la máquina.",
          "La matriz crea un job por servicio. Cada uno prepara PostgreSQL y Java 26, ejecuta mvn verify dentro de su carpeta y, en solicitudes, comprueba que el JAR arranca y muestra CAM-002.",
          "Después construye la imagen y la publica en GHCR con el SHA del commit, usando el token del job. Agregamos además un job para la UI que valida el contenido, prueba, construye y genera el PPTX.",
        ],
        instrucciones: ["Abrir el archivo en GitHub solo en modo lectura."],
        transicion: "Cuando algo falla, ¿por dónde empezamos?",
        respaldo: "docs/presentation-data/ci-yaml-paso-a-paso.md",
      },
    },
    {
      id: "s06-investigar",
      titulo: "Investigar una ejecución",
      visible: ["Elegir la ejecución del commit correcto", "Abrir el job y el paso que falló", "Repetir sin corregir no arregla nada", "Verde ≠ desplegado"],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "En Actions elegimos la ejecución del commit correcto, abrimos el job del servicio y el paso que falló. Un error de compilación se investiga en Maven; una publicación rechazada, en el evento y los permisos.",
          "La publicación también se intenta en Pull Requests y puede fallar por permisos, por ejemplo desde un fork. Separar validación y publicación es una mejora propuesta.",
        ],
        demo: { accion: "Recorrer Actions › ejecución › job › paso, en modo lectura.", evidencia: "El SHA de la ejecución coincide con el commit revisado." },
        transicion: "El pipeline empieza con cambios versionados. Veamos esa historia.",
      },
    },
  ],
};

export const git: Seccion = {
  id: "s07",
  numero: 7,
  titulo: "Git y GitHub para trabajo colaborativo",
  corto: "Git",
  participante: "p4",
  claves: {
    problema: "Cinco personas cambian el mismo código: hay que saber qué cambió, quién lo revisó y por qué.",
    sencillo: "Git guarda la historia; GitHub agrega revisión y automatización.",
    visual: "Edición → staging → commit → push → Pull Request → revisión → merge.",
    aplicacion: "Ramas feat/, fix/ y docs/; Conventional Commits en español; PR con una aprobación.",
    evidencia: "El historial del repositorio y los PR integrados.",
  },
  diapositivas: [
    {
      id: "s07-historia",
      titulo: "Historia local y colaboración",
      visible: ["git add elige · git commit registra · git push publica", "Un commit local aún no está en GitHub", "Revisar git diff --staged antes de confirmar", "GitHub: PR, revisión y checks"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Comando", "Qué hace"],
        filas: [
          ["git switch -c feat/…", "Crea una rama corta para la tarea"],
          ["git add ruta", "Selecciona cambios para el próximo commit"],
          ["git commit -m \"feat: …\"", "Registra la selección localmente"],
          ["git push -u origin feat/…", "Publica la rama en GitHub"],
        ],
      },
      guion: {
        decir: [
          "Git guarda la historia del código y funciona en local. GitHub aloja el repositorio y agrega issues, Pull Requests, revisión y checks. Actions ejecuta automatizaciones y GHCR guarda las imágenes.",
          "Editar cambia el directorio de trabajo. git add selecciona lo que entra al próximo commit. git commit lo registra localmente. git push lo publica. Antes de confirmar, revisamos git status y git diff --staged.",
        ],
        instrucciones: ["No crear commits ni PR durante la exposición; mostrar ejemplos existentes."],
        transicion: "¿Y cuando dos cambios chocan?",
        respaldo: "docs/desarrollo/flujo-de-trabajo.md",
      },
    },
    {
      id: "s07-revision",
      titulo: "Conflictos, revisión y trazabilidad",
      visible: ["Resolver un conflicto exige entender ambos cambios", "La revisión evalúa significado, no solo formato", "Issue → PR → commit → ejecución → imagen", "revert deshace sin reescribir la historia"],
      recorridos: ["ejecutivo", "tecnico"],
      marcas: [{ texto: "Proteger main y exigir checks", certeza: "propuesta" }],
      guion: {
        decir: [
          "Un conflicto aparece cuando Git no puede combinar dos cambios solo. Resolverlo exige entender ambos y volver a probar; borrar las marcas del archivo no basta.",
          "En la revisión explicamos el problema, el cambio y cómo se comprobó. La trazabilidad une issue, PR, commit, ejecución, imagen y versión desplegada. Proteger main y exigir checks son políticas propuestas que hay que configurar.",
        ],
        pregunta: { texto: "¿Un commit pequeño garantiza una buena revisión?", respuesta: "Ayuda, pero también hacen falta contexto, pruebas y entender el impacto." },
        transicion: "Ya sabemos cómo cambia el código. Ahora, cómo conservamos el significado de los datos cuando algo falla.",
      },
    },
  ],
};

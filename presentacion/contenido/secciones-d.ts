import type { Seccion } from "./tipos.ts";

// Secciones 10 y 11 (ampliación del material existente) y cierre.
// Capacidades actuales comprobadas en el repositorio; recomendaciones marcadas.

export const pruebas: Seccion = {
  id: "s10",
  numero: 10,
  titulo: "Pruebas y calidad",
  corto: "Pruebas",
  participante: "p4",
  claves: {
    problema: "Sin pruebas, cada cambio depende de que alguien recuerde revisar todo a mano.",
    sencillo: "Pruebas pequeñas para reglas, pruebas de borde para adaptadores y una comprobación de arranque.",
    visual: "Dominio → servicio → controlador → arranque real en CI.",
    aplicacion: "JUnit en ambos servicios, MockMvc standalone, prueba de contrato del repositorio y pruebas de la UI con Vitest.",
    evidencia: "mvn verify, npm test y el resultado de cada job en Actions.",
  },
  diapositivas: [
    {
      id: "s10-hoy",
      titulo: "Qué pruebas existen hoy",
      visible: ["Reglas del dominio sin Spring", "Controladores con MockMvc standalone", "Contrato del repositorio con varias implementaciones", "Arranque real con PostgreSQL en CI"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Prueba", "Qué comprueba", "Necesita PostgreSQL"],
        filas: [
          ["SolicitudTest", "Transiciones válidas e inválidas del record", "No"],
          ["ServicioSolicitudesUnitTest", "Envío registra evento; errores de estado", "No"],
          ["SolicitudControllerWebTest", "JSON de crear y enviar; 404", "No"],
          ["RepositorioDeSolicitudesContractTest", "Guardar, actualizar y buscar en cada implementación", "No"],
          ["ServicioNotificacionesApplicationTests", "Un evento repetido genera un solo aviso", "No (mock)"],
          ["Arranque en ci.yml", "El JAR inicia y muestra CAM-002", "Sí"],
          ["presentacion: npm test", "Cliente HTTP, contenido, diagramas y vistas de la UI", "No"],
        ],
      },
      marcas: [{ texto: "Ninguna prueba ejercita el relevador ni la entrega HTTP real", certeza: "implementado" }],
      guion: {
        decir: [
          "Las reglas del dominio se prueban sin levantar Spring: así son rápidas y deterministas. Los controladores se prueban con MockMvc sin servidor real. Hay una prueba de contrato que corre la misma verificación sobre varias implementaciones del repositorio.",
          "En notificaciones hay una prueba que manda el mismo evento dos veces y comprueba que se genera un solo aviso. Y en CI, solicitudes además arranca con PostgreSQL real.",
          "Lo que falta también es información: ninguna prueba ejercita el relevador ni la entrega HTTP entre servicios.",
        ],
        demo: { accion: "./mvnw test en un servicio y npm test en presentacion/.", evidencia: "Resumen de pruebas sin fallos." },
        transicion: "¿Qué agregaríamos primero?",
      },
    },
    {
      id: "s10-siguiente",
      titulo: "Calidad: lo siguiente",
      visible: ["Integración con PostgreSQL real (Testcontainers)", "Prueba de entrega con fallo y reintento", "Concurrencia del consumo idempotente", "Análisis estático y cobertura en CI"],
      recorridos: ["ejecutivo", "tecnico"],
      marcas: [
        { texto: "Pruebas de integración con base real", certeza: "propuesta" },
        { texto: "Prueba de reentrega y concurrencia", certeza: "propuesta" },
        { texto: "Formateador y análisis estático en CI", certeza: "propuesta" },
      ],
      guion: {
        decir: [
          "Propondríamos tres pruebas antes que cualquier otra cosa: una de integración con PostgreSQL real, una que simule que notificaciones falla y luego vuelve, y una que mande el mismo evento en paralelo.",
          "Después, análisis estático y cobertura como checks del Pull Request. Todo esto es propuesta: hoy no está configurado.",
        ],
        transicion: "Pasemos a seguridad básica.",
      },
    },
  ],
};

export const seguridad: Seccion = {
  id: "s11",
  numero: 11,
  titulo: "Seguridad básica",
  corto: "Seguridad",
  participante: "p4",
  claves: {
    problema: "Un laboratorio abierto se parece mucho a un sistema expuesto si se publica sin cambios.",
    sencillo: "Saber qué protege hoy el sistema y qué habría que cerrar antes de exponerlo.",
    visual: "Tabla de lo que hay y de lo que falta.",
    aplicacion: "Usuarios sin privilegios en contenedores, token del job con permisos mínimos, proxy que no expone el endpoint interno.",
    evidencia: "Dockerfile, ci.yml, compose.yaml y la configuración de nginx.",
  },
  diapositivas: [
    {
      id: "s11-hoy",
      titulo: "Lo que hay hoy",
      visible: ["Contenedores sin root", "Token del job con permisos mínimos", "Errores 404 sin detalles internos", "Sin autenticación: es un laboratorio"],
      recorridos: ["ejecutivo", "tecnico"],
      tabla: {
        encabezados: ["Tema", "Estado actual", "Dónde"],
        filas: [
          ["Usuario del contenedor", "No root (appuser1; nginx sin privilegios)", "Dockerfile"],
          ["Permisos del CI", "contents: read, packages: write", "ci.yml"],
          ["Contraseña de la base en CI", "Distinta en cada ejecución (run_id)", "ci.yml"],
          ["Autenticación de las API", "No existe", "Controladores"],
          ["Credenciales de laboratorio", "arka/arka en texto plano y en el Secret", "compose.yaml, k8s/"],
          ["Endpoint interno de eventos", "Accesible en el puerto publicado 8081", "compose.yaml"],
          ["Actuator", "health con detalles, metrics y prometheus expuestos", "application.properties"],
          ["Grafana", "Acceso anónimo como Admin", "compose.yaml"],
        ],
      },
      guion: {
        decir: [
          "Empecemos por lo que está bien. Los contenedores no corren como root. El token del job tiene solo los permisos que necesita. La contraseña de la base en CI cambia en cada ejecución.",
          "Ahora lo que hay que tener presente: no hay autenticación en las API. Las credenciales son de laboratorio y están en texto plano. El endpoint interno de eventos queda accesible si alguien llega al puerto 8081. Actuator muestra detalles. Y Grafana entra como administrador anónimo.",
          "Todo esto es aceptable para un laboratorio local. No lo es para publicar.",
        ],
        instrucciones: ["No mostrar valores de credenciales en pantalla, aunque sean de laboratorio."],
        transicion: "¿Qué cerraríamos primero?",
      },
    },
    {
      id: "s11-recomendaciones",
      titulo: "Antes de exponerlo",
      visible: ["Autenticación y autorización", "Secretos fuera del repositorio", "Endpoint de eventos solo en red interna", "Actuator y Grafana restringidos", "Escaneo de dependencias e imágenes"],
      recorridos: ["ejecutivo", "tecnico"],
      marcas: [
        { texto: "Autenticación y autorización en las API", certeza: "propuesta" },
        { texto: "Secretos gestionados fuera del repositorio", certeza: "propuesta" },
        { texto: "Escaneo de dependencias e imágenes en CI", certeza: "propuesta" },
      ],
      guion: {
        decir: [
          "Antes de exponer ARKA-Lite: autenticación y autorización en las API; secretos gestionados fuera del repositorio; el endpoint de eventos accesible solo desde la red interna o con credenciales de servicio; Actuator limitado a lo necesario; Grafana con usuarios reales.",
          "Y en CI, escaneo de dependencias e imágenes. Lo bueno es que la UI ya muestra un patrón: su proxy solo expone las rutas de lectura que necesita y no expone el endpoint interno.",
        ],
        transicion: "Cerremos con el estado actual y la siguiente mejora.",
      },
    },
  ],
};

export const cierre: Seccion = {
  id: "s12",
  numero: null,
  titulo: "Cierre",
  corto: "Cierre",
  participante: "p1",
  diapositivas: [
    {
      id: "s12-estado",
      titulo: "Estado actual",
      visible: ["Dos servicios con su base y outbox", "Consumo idempotente por eventoId", "Compose, Kubernetes local y CI que publica", "UI de laboratorio con historial de peticiones"],
      recorridos: ["ejecutivo", "tecnico"],
      marcas: [
        { texto: "Outbox con reintento e idempotencia del receptor", certeza: "implementado" },
        { texto: "Logs ECS hacia Loki", certeza: "implementado" },
      ],
      guion: {
        decir: [
          "Hoy ARKA-Lite tiene dos servicios con su propia base. El envío guarda estado y evento juntos, y un relevador entrega después. El receptor ignora eventos repetidos.",
          "Lo ejecutamos con Compose o con Kubernetes local, y el CI verifica y publica imágenes. La UI de laboratorio permite probar las API y ver cada petición.",
        ],
        transicion: "También conviene decir claramente lo que no hace.",
      },
    },
    {
      id: "s12-limitaciones",
      titulo: "Limitaciones",
      visible: ["Avisos en memoria", "Crear usa siempre INC-002", "Transición inválida responde 500", "Sin broker, sin Prometheus, sin despliegue automático", "Sin autenticación"],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Los textos de aviso se pierden al reiniciar. Crear siempre usa INC-002. Una transición inválida responde 500 en lugar de un error claro. No hay broker, ni servidor Prometheus, ni despliegue automático, ni autenticación.",
          "Ninguna de estas limitaciones es un secreto: son el punto de partida de la siguiente mejora.",
        ],
        transicion: "¿Cuál haríamos primero?",
      },
    },
    {
      id: "s12-mejora",
      titulo: "Siguiente mejora propuesta",
      visible: ["Guardar el aviso y su id de forma durable y coherente", "Probar reentrega y concurrencia", "Responder 409 en transiciones inválidas", "Definir la garantía antes de prometerla"],
      recorridos: ["ejecutivo", "tecnico"],
      marcas: [{ texto: "Aviso e id consumido en la misma transacción de PostgreSQL", certeza: "propuesta" }],
      guion: {
        decir: [
          "La prioridad propuesta es conservar el aviso y su id consumido de forma durable y coherente, en la misma base y la misma transacción, y probar qué pasa con reentregas y consumos simultáneos.",
          "En paralelo, responder 409 cuando la transición no corresponde. Y antes de prometer una garantía, definirla y demostrarla.",
        ],
        transicion: "Para cerrar, unas preguntas que ya podemos responder.",
      },
    },
    {
      id: "s12-cierre",
      titulo: "Si mañana falta un aviso…",
      visible: ["¿Qué quedó confirmado?", "¿Dónde se conserva?", "¿Qué componente actúa después?", "¿Puede repetirse la entrega?", "¿Qué evidencia demuestra la recuperación?"],
      recorridos: ["ejecutivo", "tecnico"],
      guion: {
        decir: [
          "Empezamos con una regla en Java y terminamos investigando una operación distribuida. La arquitectura ubicó responsabilidades, Docker y Kubernetes nos dieron dónde ejecutar, Git y Actions relacionaron cada cambio con su validación, y datos y observabilidad nos dieron evidencia.",
          "Si mañana alguien reporta un aviso ausente, ya tenemos preguntas concretas. Gracias. ¿Preguntas?",
        ],
        respaldo: "docs/presentation-data/guion-maestro.md › Cierre general",
      },
    },
  ],
};

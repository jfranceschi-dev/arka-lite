# ARKA-Lite: guion para staff de desarrollo

Duración sugerida: 95–120 minutos, incluidas preguntas. 36 unidades de contenido. Audiencia técnica que necesita comprender responsabilidades, decisiones y efectos operativos sin recorrer cada método.

## Sección 1 · Fundamentos

### 01 · La solicitud como caso conductor

**En pantalla**

- Una solicitud se crea, se envía y genera un aviso.
- El estado del trámite y la entrega del aviso son hechos distintos.
- El diseño debe permitir comprender y comprobar ambos.

**Guion del expositor**

“Seguiremos una solicitud desde su creación hasta el aviso. El objetivo es entender cómo se organiza el código y qué ocurre cuando los servicios colaboran. Una respuesta de envío exitosa no implica que el aviso ya esté disponible: esa diferencia es parte del diseño y debe reflejarse en nuestras expectativas.”

**Transición:** “Empezaremos por los elementos con los que el equipo expresa estas reglas.”

### 02 · Java y la construcción de la aplicación

**En pantalla**

- Java expresa datos y operaciones mediante tipos, clases y métodos.
- El JDK compila; la JVM ejecuta.
- Maven construye y prueba; Spring Boot conecta componentes.

**Guion del expositor**

“El código describe lo que la aplicación puede hacer. La compilación detecta incompatibilidades de tipos; las pruebas comprueban comportamientos. Spring Boot facilita el arranque y la conexión de componentes, pero las reglas del negocio deben seguir siendo claras. Cada microservicio de ARKA-Lite se construye por separado.”

**Transición:** “Una parte importante de la calidad empieza en cómo representamos y nombramos los datos.”

### 03 · Tipos y nombres de variables

**En pantalla**

- `String solicitudId`: identifica una solicitud.
- `boolean procesado`: expresa una condición.
- `int intentos`: cuenta intentos.
- `Estado estado`: limita los estados permitidos.

**Guion del expositor**

“Los tipos reducen ambigüedades. Java distingue valores primitivos, como enteros y booleanos, de referencias a objetos, como textos y solicitudes. El nombre debe explicar el significado: `esperaMilisegundos` aclara una unidad que `tiempo` no explica. Variables y métodos usan camelCase; las clases, PascalCase. Lo importante para la revisión es que el vocabulario sea consistente y reconocible para el negocio.”

**Transición:** “Esa claridad debe mantenerse cuando el código crece.”

### 04 · Buenas prácticas y SOLID

**En pantalla**

- S: separar responsabilidades y motivos de cambio.
- O: ampliar capacidades mediante contratos estables.
- L: reemplazar componentes respetando su comportamiento.
- I: usar contratos pequeños y enfocados.
- D: depender de contratos, no de tecnologías concretas.

**Guion del expositor**

“SOLID ayuda a revisar decisiones. Por ejemplo, cambiar el almacenamiento no debería cambiar las reglas de aprobación. Eso exige contratos claros y pruebas que confirmen que el reemplazo se comporta igual. También buscamos nombres comprensibles, validaciones, manejo explícito de fallos y métodos con una intención clara. Los principios no son una lista de anotaciones ni una garantía automática de calidad.”

**Puente a la sección 2:** “La arquitectura hexagonal organiza estas responsabilidades alrededor del negocio.”

## Sección 2 · Arquitectura hexagonal

### 05 · El core de la aplicación

**En pantalla**

- Dominio: significado y reglas de la solicitud.
- Puertos: operaciones que se ofrecen o se necesitan.
- Adaptadores: conexión con HTTP, almacenamiento y otros sistemas.

**Guion del expositor**

“El core reúne las reglas y las operaciones que las coordinan. Una solicitud solo puede enviarse desde borrador. Esa regla debe conservar su significado aunque cambie la forma de recibir peticiones o guardar datos. El hexágono representa la frontera del negocio; no obliga a tener seis piezas.”

**Transición:** “Veamos cómo una petición atraviesa esa frontera.”

### 06 · Entrada, contrato, dominio y salida

**En pantalla**

`Entrada → puerto de entrada → caso de uso y dominio → puerto de salida → adaptador de salida`

**Guion del expositor**

“El adaptador de entrada recibe una petición. El puerto expresa qué operación ofrece la aplicación. El caso de uso aplica las reglas y pide guardar por un contrato de salida. El adaptador de salida resuelve la tecnología concreta. Una interfaz es ese contrato de operaciones; no es una pantalla. En ARKA-Lite, la entrada llama directamente al servicio: no hay una interfaz de entrada independiente. Sí existe una interfaz para el repositorio de solicitudes.”

“Podemos verlo como recibir una consulta, aplicar una operación y recuperar datos guardados. Técnicamente el controlador llama al caso de uso, que usa un contrato; una implementación conectada realiza el trabajo. El puerto es ese contrato, no un proceso que reenvía mensajes. Para PostgreSQL usamos RepositorioJpa; RepositorioQueRegistra es un ejemplo en memoria.”

**Transición:** “La ventaja se observa cuando necesitamos cambiar una pieza.”

### 07 · Importancia de la separación

**En pantalla**

- Un cambio de HTTP se concentra en la entrada.
- Un cambio de persistencia se concentra en su adaptador.
- Las reglas pueden probarse sin iniciar toda la infraestructura.
- Los contratos y las pruebas limitan el impacto del reemplazo.

**Guion del expositor**

“Esta organización ayuda a reducir el alcance de un cambio y localizar errores. No significa que cualquier tecnología se sustituya sin esfuerzo: el nuevo adaptador debe conservar las expectativas del contrato, y hay que probar su integración. Hexagonal tampoco resuelve por sí sola disponibilidad o entrega de mensajes. Es una forma de ordenar responsabilidades para poder trabajar sobre ellas.”

“El reemplazo de una base también requiere configuración, estructura de datos, migraciones y pruebas. Mantener el contrato reduce impacto sobre reglas, pero no vuelve automática la sustitución.”

**Transición:** “En el repositorio estas responsabilidades se reconocen por sus componentes y carpetas.”

### 08 · Organización del código

**En pantalla**

- `dominio`: solicitudes, estados, casos de uso y contratos.
- `adaptadores/entrada`: controladores HTTP.
- `adaptadores/persistencia`: acceso a PostgreSQL.
- `adaptadores/salida`: publicación y procesamiento de pendientes.
- `config` y `eventos`: conexiones y contratos de mensajes.

**Guion del expositor**

“La carpeta ayuda a encontrar una responsabilidad, pero no la demuestra por sí misma. Un adaptador de persistencia es una salida aunque su carpeta no se llame salida. El diseño actual también tiene simplificaciones: hay coordinación transaccional dentro del paquete dominio y acceso directo a JPA en algunos componentes. Presentamos una aplicación de aprendizaje, con sus límites reales.”

**Puente a la sección 3:** “Ahora ampliamos la vista: dos aplicaciones separadas deben completar el recorrido del trámite.”

## Sección 3 · Arquitectura y flujo entre servicios

### 09 · Monolito, servicios y elección de arquitectura

**En pantalla**

- Monolito modular o servicios: decisión según necesidades.
- Solicitudes gestiona el ciclo de vida del trámite.
- Notificaciones recibe eventos y produce avisos.
- PostgreSQL almacena solicitudes y registros de eventos.
- Loki, Promtail y Grafana apoyan la observación.

**Guion del expositor**

“Una clase de servicio organiza operaciones dentro del programa. Un microservicio es una aplicación con proceso y API propios. Aquí existen dos microservicios de negocio y varios servicios de infraestructura. Cada aplicación conoce a la otra por su contrato HTTP; no comparte sus objetos Java ni consulta directamente su base para completar este flujo.”

“Antes de elegir monolito o servicios preguntamos cómo cambia el negocio, qué necesita desplegarse por separado y qué puede operar el equipo. Un monolito puede estar modularizado. Varios servicios agregan independencia potencial y también contratos, red y fallos parciales. El laboratorio separado sirve para aprender esos costos y beneficios.”

**Transición:** “Compartir un contrato no significa que ambos procesos terminen al mismo tiempo.”

### 10 · Comunicación y tiempos de respuesta

**En pantalla**

- Comunicación directa: una petición espera respuesta.
- Mensajería con broker: alternativa con intermediario.
- ARKA-Lite registra pendientes y los entrega después por HTTP.

**Guion del expositor**

“La operación del usuario termina cuando la solicitud y el evento quedan guardados. Otro componente entrega el evento. Esa entrega utiliza HTTP, pero se ejecuta fuera de la petición original. No hay un broker instalado. Este diseño permite conservar trabajo pendiente durante una indisponibilidad del receptor, siempre que conservemos la base de datos.”

**Transición:** “Separaremos el recorrido en registro y entrega.”

### 11 · Registro del envío

**En pantalla**

`Cliente → entrada HTTP → reglas del dominio → solicitud enviada + evento pendiente → respuesta`

**Guion del expositor**

“Primero se valida que el trámite pueda enviarse. Después se guardan el nuevo estado y un evento pendiente en una transacción local. La tabla de pendientes se denomina outbox. Si falla esa transacción, no debe confirmarse el envío. Si tiene éxito, la respuesta confirma el registro, aunque todavía no exista un aviso en notificaciones.”

**Transición:** “La segunda parte comienza cuando el sistema toma ese pendiente.”

### 12 · Entrega y creación del aviso

**En pantalla**

`Pendiente → publicador HTTP → entrada de notificaciones → comprobación de evento → core → aviso`

**Guion del expositor**

“Un relevador consulta los pendientes, con cinco segundos de espera entre ciclos. El publicador intenta entregar cada evento hasta tres veces por publicación. El receptor comprueba el identificador, crea el aviso si no lo había procesado y registra ese identificador. Tras una respuesta exitosa, el emisor marca el evento como entregado. Los cinco segundos no son una garantía de tiempo máximo: también influyen los intentos y la red.”

**Transición:** “Para evaluar la confiabilidad hay que distinguir los datos que permanecen de los que se pierden.”

### 13 · Datos y límites actuales

**En pantalla**

- Solicitudes y eventos pendientes: PostgreSQL.
- Identificadores consumidos: PostgreSQL de notificaciones.
- Textos de avisos: memoria de notificaciones.
- Reiniciar notificaciones pierde los textos, pero conserva los identificadores.

**Guion del expositor**

“Esta diferencia es importante: el sistema puede recordar que procesó un evento y ya no tener el texto del aviso. Repetir ese identificador no lo reconstruye. Tampoco debemos prometer procesamiento exactamente una vez ante concurrencia. Son límites que orientan una siguiente mejora de persistencia y recuperación, no detalles que debamos ocultar bajo un diagrama ideal.”

**Transición:** “Conocer estas ubicaciones permite hacer mejores preguntas durante una incidencia.”

### 14 · Seguimiento y decisiones

**En pantalla**

- ¿La solicitud quedó enviada?
- ¿El evento está pendiente o procesado?
- ¿El receptor registró el identificador?
- ¿El aviso sigue disponible?

**Guion del expositor**

“Una comprobación de salud indica que un servicio responde; no demuestra que una solicitud concreta completó todo el flujo. Para seguirla usamos su identificador, el del evento y los logs. La arquitectura nos da puntos claros de observación. Las próximas decisiones deben definir cómo conservar avisos, cómo tratar fallos prolongados y qué información mostrar al usuario mientras espera.”

**Transición a Docker:** “La siguiente sección explica cómo ejecutar estos componentes y mantener visibles sus límites operativos.”

Diagramas y respaldo técnico: [arquitectura y flujo](flujo-y-referencias.md).

## Sección 4 · Docker y ejecución en contenedores

### 15 · Docker: del código al proceso

**En pantalla**

- Dockerfile: receta de construcción.
- Imagen: aplicación empaquetada con su runtime.
- Contenedor: proceso creado desde una imagen.

**Guion del expositor**

Recorrer las dos etapas de los Dockerfile reales: Maven 3.9 con JDK 26 genera el JAR y JRE 26 lo ejecuta. COPY --from evita llevar Maven y el código fuente al runtime. El usuario final no es root. package usa -DskipTests: el build de Docker no demuestra que las pruebas pasaron. Fuentes: Dockerfile de cada servicio y documentación oficial de builds multietapa.

“El contenedor reduce diferencias de ejecución; la red, los datos, las credenciales y los recursos siguen importando. Docker no es una garantía de funcionamiento idéntico en todos los entornos.”

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 16 · Compose: red y dependencias de ARKA-Lite

**En pantalla**

- Dos aplicaciones y dos bases PostgreSQL.
- DNS interno por nombre de servicio.
- Healthchecks ordenan el arranque local.
- Loki, Promtail y Grafana acompañan el laboratorio.

**Guion del expositor**

Seguir la petición en localhost:8080, la URL interna servicio-notificaciones:8080 y ambas conexiones JDBC. depends_on con service_healthy espera salud inicial, no garantiza disponibilidad permanente. Los logs son un flujo separado del negocio. En Compose hay cuatro componentes de negocio y datos, más tres de observabilidad. No dibujar un broker inexistente.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 17 · Imagen, configuración y datos

**En pantalla**

- Imagen: JAR y JRE versionados.
- Variables: DB_URL, DB_USER y NOTIFICACIONES_URL.
- Datos: fuera del ciclo de vida del contenedor.
- Puerto publicado: host 8081 conecta al 8080 de notificaciones.

**Guion del expositor**

Una imagen puede crear varios contenedores con distinta configuración. localhost dentro del contenedor apunta a ese contenedor. EXPOSE no publica puertos. Compose configura el mapeo. No incluir contraseñas en imágenes. El Compose actual no declara volúmenes de datos estables para las bases: no prometer recuperación tras recreación o limpieza.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

## Sección 5 · Kubernetes y operación declarativa

### 18 · Recursos reales del laboratorio

**En pantalla**

- Deployment: ejecuta aplicaciones y bases.
- Service: nombre estable y selección por etiquetas.
- Secret: credencial referenciada por los contenedores.
- PVC: almacenamiento solicitado para PostgreSQL.

**Guion del expositor**

Leer k8s/solicitudes.yaml, notificaciones.yaml y ambos db-*.yaml. solicitudes expone NodePort y notificaciones usa Service interno. Los initContainers esperan la base y, en solicitudes, el receptor. Los PVC piden 1Gi. Las bases usan estrategia Recreate. La credencial incluida es de laboratorio. No hay Ingress, HPA ni ConfigMap declarados en estos archivos.

“El Pod ejecuta contenedores, Deployment y ReplicaSet mantienen réplicas, y Service dirige tráfico a destinos disponibles. Kubernetes no es obligatorio para usar Docker. Compose levanta el laboratorio local por una ruta distinta de los manifiestos Kubernetes.”

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 19 · Arranque, salud y persistencia

**En pantalla**

- initContainer: espera una dependencia al iniciar.
- Readiness: decide si el Pod recibe tráfico.
- Liveness: puede reiniciar un contenedor bloqueado.
- PVC: separa los datos de la vida del Pod.

**Guion del expositor**

Las aplicaciones tienen readiness HTTP sobre /solicitudes y /notificaciones. Las bases tienen readiness y liveness mediante pg_isready. No atribuir liveness a las aplicaciones: sus manifiestos no la incluyen. Los PVC conservan datos mientras permanezcan el volumen y su política de retención. Readiness exitosa no prueba la entrega de un evento.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

## Sección 6 · CI/CD y trazabilidad de entregas

### 20 · GitHub Actions: pipeline actual

**En pantalla**

- Evento: push a main o Pull Request.
- Matriz: solicitudes y notificaciones.
- Runner: Ubuntu, Java 26 y PostgreSQL 17.
- Salida: imagen en GHCR etiquetada con SHA.

**Guion del expositor**

Cada entrada de matriz crea un job con su base. verify valida el servicio y solicitudes añade una prueba de arranque con búsqueda de CAM-002. El login usa GITHUB_TOKEN. No hay workflow_dispatch ni paso kubectl. La publicación también se intenta en PR y puede fallar por permisos, especialmente desde forks. Señalar este límite como configuración actual, no como cambio aplicado.

“El workflow valida acciones concretas y publica imágenes. No despliega automáticamente al clúster ni comprueba todas las configuraciones de producción.”

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 21 · Promoción entre ambientes y recuperación

**En pantalla**

- PROPUESTA: validar la misma imagen en cada ambiente.
- Configurar secretos y conexiones por destino.
- Aprobar producción con evidencia de pruebas.
- Verificar negocio y disponer de rollback.

**Guion del expositor**

Esta ruta no existe en el workflow actual. Promover por digest evita reconstruir una versión diferente. Registrar quién aprobó y qué imagen quedó desplegada. Rollback de aplicación no revierte datos ni contratos automáticamente. Comprobar compatibilidad de esquema antes de retroceder. Kubernetes rollout y healthchecks deben acompañarse de un caso funcional de envío y recepción.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.


### 22 · Creación de ci.yml en GitHub

**En pantalla**

- Repositorio: Code, Add file, Create new file.
- Ruta: .github/workflows/ci.yml.
- Editar el YAML en una rama y abrir un Pull Request.
- En ARKA-Lite el archivo ya existe: se edita.

**Guion del expositor**

GitHub reconoce workflows en .github/workflows con extensión .yml o .yaml. ci.yml y ci.yaml son nombres válidos, pero crear ambos con los mismos eventos duplicaría ejecuciones. Aquí usamos ci.yml porque es el archivo existente. Alternativa: Actions, New workflow y set up a workflow yourself. Explicar que guardar el archivo implica un commit y que no se requiere un servidor Jenkins. No crear otro workflow de demostración en el repositorio real. Fuente: https://docs.github.com/en/actions/get-started/quickstart .

**Transición:** Revisar el siguiente componente del workflow con el mismo commit de ejemplo.

### 23 · YAML: nombre, eventos y runner

**En pantalla**

```yaml
name: CI-Arkalitos
on:
  push:
    branches: [main]
  pull_request:
jobs:
  construir-probar-publicar:
    runs-on: ubuntu-latest
    permissions: {contents: read, packages: write}
```

**Guion del expositor**

Fragmento real, abreviado: los pasos y demás propiedades continúan dentro del job. name identifica el workflow en Actions. on selecciona eventos. push filtrado ejecuta ante commits que llegan a main y pull_request cubre actividad de PR. jobs contiene trabajos y runs-on elige su runner. permissions permite leer código y escribir paquetes con el token del job. Usar espacios para la indentación. El workflow actual no tiene workflow_dispatch, por lo que no ofrece ejecución manual mediante Run workflow. Un push a una rama de trabajo sin PR no satisface por sí solo estos disparadores.

**Transición:** Revisar el siguiente componente del workflow con el mismo commit de ejemplo.

### 24 · GitHub Actions: ejecución, checks y logs

**En pantalla**

- Abrir Actions y elegir CI-Arkalitos.
- Elegir la ejecución del commit o Pull Request.
- Abrir el job del servicio y expandir el paso.
- Corregir la causa, publicar otro commit y comprobar.

**Guion del expositor**

Demostración en GitHub: seleccionar Actions, workflow, ejecución, job de la matriz y step. Comprobar rama, SHA, evento y resultado para no inspeccionar una ejecución antigua. En el PR, la sección de checks enlaza los mismos resultados. Error de YAML: revisar ruta e indentación. Error Maven: buscar la primera causa y el resumen de pruebas. Error de push a GHCR: revisar evento y permisos, especialmente en PR de forks. Verde confirma los trabajos ejecutados, no un despliegue. No afirmar que hay runs, checks requeridos o paquetes publicados sin observar el repositorio remoto. Mostrar la interfaz como recorrido didáctico. Fuente: https://docs.github.com/en/actions/how-tos/monitor-workflows/use-workflow-run-logs .

**Transición:** Revisar el siguiente componente del workflow con el mismo commit de ejemplo.

## Sección 7 · Git y GitHub para trabajo colaborativo

### 25 · Git y GitHub: responsabilidades

**En pantalla**

- Git guarda historial y ramas de forma distribuida.
- GitHub aloja repositorios y coordina Pull Requests.
- Actions ejecuta automatizaciones.
- GHCR almacena las imágenes del proyecto.

**Guion del expositor**

Git funciona localmente sin GitHub. Una rama referencia una línea de commits y un commit conserva un snapshot con sus metadatos. GitHub agrega revisión, issues y checks. El SHA del commit conecta el cambio con la imagen generada por nuestro workflow. Evitar confundir GitHub con el registro de imágenes o con Kubernetes.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

### 26 · GitHub: revisión y trazabilidad completa

**En pantalla**

- Issue: problema y criterio de aceptación.
- Pull Request: cambio, impacto y evidencia.
- Actions: compilación y resultados de pruebas.
- Release e imagen: versión rastreable.

**Guion del expositor**

Ejercicio integrador: persistir avisos. La propuesta debe explicar migración, idempotencia y recuperación tras reinicio. La revisión cubre contrato, pruebas y operación. Proponer protección de main y checks requeridos sin afirmar que ya están activos. Seguir la cadena issue, PR, commit, workflow, digest e imagen desplegada. Cierre: demostrar que el aviso persiste y que reintentar un evento no crea duplicados.

**Transición:** Relacionar este punto con el siguiente paso del recorrido de la solicitud.

## Sección 8 · Datos y consistencia

Objetivo: distinguir persistencia, integridad local y propagación entre servicios, y definir evidencia de recuperación. Material compartido: [datos y consistencia](datos-y-consistencia.md).

### 27 · Datos y responsabilidades

**En pantalla**

- El estado del trámite pertenece a solicitudes.
- La entrega pendiente pertenece al outbox.
- El receptor registra los eventos consumidos.
- El aviso tiene hoy una vida limitada al proceso.

**Guion del expositor**

Cada dato tiene dueño y condiciones de conservación. Una respuesta de envío exitosa confirma el registro local. No prueba que el texto del aviso esté disponible. El sistema actual puede recordar el consumo de un evento después de haber perdido el texto por reinicio. Esta distinción orienta las expectativas de operación y las decisiones de inversión.

**Transición:** Primero veremos qué garantiza la base dentro de un servicio.

### 28 · Transacciones y consistencia local

**En pantalla**

- La transacción agrupa estado y evento pendiente.
- Commit confirma los cambios locales.
- Rollback evita una escritura parcial de ese envío.
- La llamada HTTP posterior queda fuera de esa frontera.

**Guion del expositor**

ACID reúne atomicidad, consistencia, aislamiento y durabilidad. En este caso interesa que el trámite no quede enviado sin registrar el trabajo pendiente dentro de esa transacción. No garantiza una entrega simultánea al segundo servicio ni evita cualquier carrera. La durabilidad depende de conservar el almacenamiento y no sustituye un backup restaurable.

**Transición:** Entre servicios aparecen confirmaciones en momentos distintos.

### 29 · Consistencia eventual y experiencia del usuario

**En pantalla**

- Envío registrado y aviso disponible ocurren en momentos distintos.
- El outbox permite retomar pendientes tras un fallo temporal.
- Los reintentos pueden repetir una entrega.
- Es necesario definir demora aceptable y seguimiento.

**Guion del expositor**

La propagación posterior permite tolerar indisponibilidad temporal del receptor sin perder la intención de entrega, siempre que conservemos la base. La espera de cinco segundos entre ciclos no es una garantía de entrega máxima. Propuesta de experiencia: distinguir registro del envío y disponibilidad del aviso. No hay endpoint de seguimiento por evento dedicado implementado para esa experiencia. Una demora temporal es diferente de un aviso perdido que no se reconstruye.

**Transición:** La confiabilidad depende de cómo tratamos repetición y recuperación.

### 30 · Duplicados, reinicios y límites actuales

**En pantalla**

- El receptor omite IDs que ya conoce.
- El texto del aviso sigue en memoria.
- Dos operaciones simultáneas necesitan controles adicionales.
- Prioridad propuesta: efecto e identidad durables juntos.

**Guion del expositor**

No prometemos exactamente una vez. La comprobación de un ID antes de escribir no impide dos operaciones concurrentes. Un reinicio elimina avisos pero mantiene los IDs; repetir esos eventos no recupera los textos. Propuesta: almacenar aviso e identidad de consumo de manera atómica y verificar envíos concurrentes. Son mejoras por implementar, no capacidades ya presentes.

**Transición:** Persistir más datos exige gestionar su evolución y recuperación.

### 31 · Cambios de datos y recuperación

**En pantalla**

- Las migraciones cambian estructura y datos de forma controlada.
- Los contratos deben tolerar versiones coexistentes.
- Rollback de aplicación no restaura automáticamente la base.
- Backup útil: restauración y pérdida aceptable comprobadas.

**Guion del expositor**

El repositorio utiliza scripts e inicialización de esquema, no una plataforma de migraciones versionadas configurada. Proponemos acordar compatibilidad, respaldo, prueba de restauración y responsables antes de cambios relevantes. RPO define cuánta pérdida de datos se admite y RTO cuánto tiempo se admite para recuperar el servicio. No hay valores comprometidos para ARKA-Lite en esta presentación. Un PVC mantiene almacenamiento, pero no aporta por sí solo una copia independiente recuperable.

**Transición:** Estas decisiones se convierten en criterios verificables.

### 32 · Evidencia para aceptar la siguiente mejora

**En pantalla**

- Confirmar integridad del estado y del evento.
- Recuperar entrega después de indisponibilidad.
- Conservar avisos tras reinicio sin duplicar su efecto.
- Comprobar concurrencia y restauración.

**Guion del expositor**

El equipo debe mostrar pruebas y consultas que distingan registro, entrega, consumo y disponibilidad. Pedir evidencia del resultado y no solo un endpoint saludable. Acordar seguimiento de pendientes, dueño de la recuperación y condiciones de éxito para el usuario. Las capacidades propuestas se aceptan cuando se demuestran con fallos controlados, no solo cuando el camino exitoso funciona.

**Transición:** Cierre: una garantía de consistencia debe tener una frontera y una forma de comprobarla.

Fuentes de la sección: [código, diagramas y respaldo conceptual](datos-y-consistencia.md#fuentes).

## Sección 9 · Observabilidad

Objetivo: investigar el recorrido de una solicitud con logs, métricas, trazas y datos de negocio. Material compartido: [observabilidad](observabilidad.md).

### 33 · Observabilidad y éxito de negocio

**En pantalla**

- Logs: qué ocurrió y con qué contexto.
- Métricas: cuánto, con qué frecuencia y con qué demora.
- Trazas: qué operaciones participaron en una ejecución.
- Salud técnica y éxito de negocio requieren evidencia distinta.

**Guion del expositor**

“Si una persona nos dice que envió una solicitud y no recibió aviso, necesitamos evidencia del recorrido. Los logs cuentan hechos con contexto, las métricas muestran cantidades y tendencias, y las trazas relacionan operaciones de una ejecución. También consultamos los datos del trámite. Una comprobación de salud no responde por sí sola qué pasó con esa solicitud.”

“En esta sección queremos aprender a formular la pregunta correcta y ubicar su fuente. No hace falta que todos conozcan cada consulta: sí necesitamos entender qué demuestra cada señal y quién debe actuar cuando falta un paso.”

**Transición:** Veamos qué responsabilidad tiene cada herramienta.

### 34 · Herramientas y alcance actual

**En pantalla**

| Componente | Responsabilidad | Situación actual |
| --- | --- | --- |
| Grafana | Consultar y visualizar | Incluido en Compose |
| Loki | Almacenar y consultar logs | Incluido en Compose |
| Promtail | Recoger logs de Docker | Configurado hacia Loki |
| Actuator | URLs de salud y métricas dentro de la aplicación | Configurado en ambos servicios |
| Micrometer | Registra mediciones e instrumenta trazas | Dependencias del proyecto |
| Prometheus | Recoger y almacenar métricas | Formato expuesto, servidor ausente |

**Guion del expositor**

“La aplicación escribe, Promtail recoge, Loki guarda y Grafana muestra. Cada pieza tiene un trabajo. Promtail aquí recoge la salida de Docker; no está leyendo automáticamente archivos system.log del sistema operativo. Esos archivos también son logs y requerirían configurar su acceso.”

“Actuator está dentro de cada aplicación Spring Boot. health es una URL que podemos abrir para consultar su salud. Micrometer registra mediciones y Actuator permite exponerlas. Grafana no descubre automáticamente todos los servicios por eso: necesita fuentes conectadas. Para métricas históricas proponemos un servidor Prometheus, que todavía falta en Compose.”

“Por tanto, separamos lo disponible de la integración completa. Grafana, Loki y Promtail están en Compose. Hay instrumentación en las aplicaciones. Los paneles de métricas, un backend de trazas y las alertas requieren trabajo adicional. Promtail es además una pieza heredada cuyo reemplazo por un agente soportado debe planificarse.”

“Actuator y health no son requisitos para Loki. Los logs llegan mediante un agente como Promtail; la salud se consulta por otra ruta. Para un log útil pedimos hecho, componente, caso, momento, destino y resultado, y después verificamos qué de eso registra realmente el código.”

**Transición:** Las herramientas deben ayudar a responder preguntas concretas durante una incidencia.

### 35 · Investigación de una solicitud

**En pantalla**

- Confirmar estado de la solicitud y pendiente del outbox.
- Buscar solicitudId y eventoId en publicador y receptor.
- Separar error HTTP, consumo duplicado y pérdida de texto.
- Comparar datos persistidos con logs y salud.

**Guion del expositor**

“Vamos a investigar un caso. Primero comprobamos si la solicitud quedó enviada y si el evento sigue pendiente. Con su UUID buscamos intentos de publicación y consumo. Luego comparamos el ID consumido con el texto consultable.”

“En el diseño actual puede existir el ID en PostgreSQL y haberse perdido el aviso de memoria tras reiniciar. El servicio puede responder health UP durante esa situación. Por eso salud y resultado del negocio se verifican por separado. El diagnóstico debe indicar qué se confirmó, qué falta y qué evidencia lo sostiene.”

“Los headers de contexto sirven en peticiones HTTP instrumentadas como GET o POST. En nuestro flujo el evento va en un POST y el trabajo del outbox empieza después de la petición original. Seguimos eventoId para unir el mismo hecho entre intentos, sin prometer una traza continua.”

**Transición:** Podemos convertir estas preguntas en indicadores operativos.

### 36 · Indicadores y respuesta operativa

**En pantalla**

- Definir demora aceptable para entregar un aviso.
- Observar pendientes, errores y disponibilidad.
- Acordar responsable y acción de recuperación.
- Comprobar que la telemetría llega y puede consultarse.

**Guion del expositor**

“Un dashboard debe responder preguntas que permitan actuar. Nos interesa saber si llegan peticiones, si aumentan errores y si se acumulan eventos. Para medir algunos de esos puntos todavía necesitamos instrumentación; por ejemplo, no hay una fecha del evento que permita calcular su antigüedad.”

“Una alerta necesita una condición, un responsable y una acción. También necesitamos detectar que dejó de llegar la propia telemetría. No vamos a interpretar una gráfica vacía como prueba de salud. La mejora se acepta cuando podemos demostrar el recorrido de investigación con un caso controlado.”

**Transición:** Cierre: observar permite distinguir demora, fallo y pérdida de información, y decidir cómo responder.

Aclaraciones didácticas de la sección 9: [Promtail, logs del sistema, Actuator, health y Grafana](observabilidad.md#explicación-inicial-qué-es-cada-cosa).

Para ensayo y adaptación oral: [guion maestro](guion-maestro.md) y [guion desarrollado de observabilidad](guion-observabilidad.md).

Integración del feedback y explicación en dos niveles: [cobertura, correcciones y diagramas](feedback-integrado.md).

# Guion de ARKA-Lite · recorrido técnico

> Archivo generado por `npm run guiones` desde `presentacion/contenido/`. No editar a mano: los cambios se hacen en la fuente.

Incluye código, contratos y configuración. Comparte el texto oral con el recorrido ejecutivo para no contradecirse.

## Reparto

| Participante | Rol | Secciones |
| --- | --- | --- |
| Participante 1 | Abre, explica Java y arquitectura hexagonal, y cierra. | Apertura, Java, Hexagonal, Cierre |
| Participante 2 | Explica servicios, comunicación y conduce la demostración en vivo. | Servicios |
| Participante 3 | Explica Docker y Kubernetes. | Docker, Kubernetes |
| Participante 4 | Explica CI/CD, Git y GitHub, pruebas y seguridad básica. | CI/CD, Git, Pruebas, Seguridad |
| Participante 5 | Explica datos y consistencia, y observabilidad. | Datos, Observabilidad |

Convenciones: las citas son texto para decir; las **Instrucciones** no se dicen en voz alta.

## Apertura · presenta Participante 1

### 1. ARKA-Lite: una solicitud de punta a punta

**Visible:**

- Cómo viaja, se guarda y se comprueba una solicitud
- Dos servicios Spring Boot · dos PostgreSQL · una UI de laboratorio

**Texto para decir**

> Buenos días. Hoy vamos a seguir una sola solicitud durante todo su recorrido: desde que alguien la crea hasta que otro servicio deja un aviso.
>
> No vamos a memorizar herramientas. Queremos poder señalar qué componente hace cada cosa y qué evidencia demuestra que una operación terminó.

**Instrucciones (no se dicen):**

- Tener abierta la vista Probar en otra pestaña y comprobar la salud de ambos servicios antes de empezar.

**Transición:** “Empecemos por el caso que conecta todo.”

**Respaldo:** docs/presentation-data/guion-maestro.md › Apertura

### 2. El caso conductor: INC-002

**Visible:**

- Crear → enviar → registrar evento → entregar → consumir → consultar aviso
- Tres hechos distintos: quedó enviada, llegó el evento, existe el aviso
- No ocurren al mismo instante ni se guardan igual

| Paso | Quién lo hace | Cómo lo comprobamos |
| --- | --- | --- |
| Crear | servicio-solicitudes | POST /solicitudes/crear responde BORRADOR |
| Enviar | servicio-solicitudes | POST /solicitudes/INC-002/enviar responde ENVIADA |
| Registrar evento | misma transacción | Tabla evento; no hay API para verla |
| Entregar | relevador y publicador | Logs del publicador |
| Consumir | servicio-notificaciones | GET /eventos/procesados |
| Consultar aviso | servicio-notificaciones | GET /notificaciones |

**Marcas:** Crear siempre usa el id fijo INC-002 (implementado)

**Texto para decir**

> La solicitud de ejemplo es INC-002. Se crea en borrador y se envía. Ese envío guarda un evento que otro componente entregará después al servicio de notificaciones.
>
> Desde ahora vamos a separar tres hechos: el trámite quedó enviado, el evento llegó al receptor y el texto del aviso está disponible. No ocurren al mismo tiempo, y no se guardan de la misma forma.
>
> Un detalle importante: la API de creación siempre usa el id INC-002. No permite crear un id cualquiera.

**Pregunta al público:** ¿Una respuesta exitosa al enviar demuestra que el aviso ya existe?

**Respuesta esperada:** No. Confirma el envío local; la entrega y el aviso se comprueban aparte.

**Transición:** “Veamos el mapa de lo que vamos a recorrer.”

**Respaldo:** docs/inicio/proyecto.md › API actual

### 3. Agenda

**Visible:**

- 1 Java · 2 Hexagonal · 3 Servicios
- 4 Docker · 5 Kubernetes · 6 CI/CD · 7 Git y GitHub
- 8 Datos y consistencia · 9 Observabilidad
- 10 Pruebas y calidad · 11 Seguridad básica

| Bloque | Secciones | Propósito |
| --- | --- | --- |
| A | 1 a 3 | Entender código, responsabilidades y recorrido |
| B | 4 a 7 | Ejecutar, operar y entregar cambios |
| C | 8 a 11 | Fallos, evidencia, calidad y seguridad |

**Texto para decir**

> El recorrido tiene tres bloques. Primero entendemos el código y cómo se reparten las responsabilidades. Después vemos cómo se ejecuta y se entrega una versión. Al final revisamos qué pasa cuando algo falla, cómo lo comprobamos, cómo probamos y qué riesgos de seguridad tenemos.
>
> En cada tema vamos a distinguir tres cosas: lo implementado, lo que es un ejemplo para explicar y lo que es una propuesta.

**Instrucciones (no se dicen):**

- Señalar en pantalla las marcas Implementado, Ejemplo y Propuesta.

**Transición:** “Empezamos por el lenguaje en el que están escritas las reglas.”

## 1 · Fundamentos de programación con Java · presenta Participante 1

### 4. Portada · Fundamentos de programación con Java

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Necesitamos expresar datos y reglas del trámite de forma que una máquina las ejecute y una persona las entienda.
- ¿Cómo funciona, en sencillo? Escribimos código, el compilador lo revisa y la JVM lo ejecuta. Maven organiza la construcción.
- ¿Cómo se representa? Archivo .java → compilador → bytecode → JVM.
- ¿Dónde se aplicó? El record Solicitud y sus transiciones enviar, aprobar y rechazar.
- ¿Qué evidencia lo comprueba? mvn verify dentro de cada servicio y la prueba SolicitudTest.

**Texto para decir**

> Ahora vamos con fundamentos de programación con java. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 5. Código, compilación y ejecución

**Visible:**

- JDK compila · JVM ejecuta
- Maven: dependencias, pruebas y empaquetado
- Spring Boot arma la aplicación
- Cada servicio tiene su propio pom.xml

**Marcas:** No hay pom.xml en la raíz (implementado)

**Código (recorrido técnico):** `servicio-solicitudes/`

**Texto para decir**

> Java nos permite expresar datos y operaciones. El JDK incluye el compilador, que revisa el programa y genera bytecode. La JVM ejecuta ese bytecode. Maven organiza dependencias, compilación, pruebas y empaquetado. Spring Boot configura los componentes y el servidor web.
>
> En ARKA-Lite cada servicio se construye por separado y tiene su propio pom.xml. No hay un proyecto único en la raíz.

**Demostración sugerida:** Mostrar los dos pom.xml y el comando verify de un servicio.

**Evidencia que debería observarse:** BUILD SUCCESS y el resumen de pruebas de Maven.

**Transición:** “Ahora veamos cómo nombramos y guardamos los datos.”

**Respaldo:** docs/inicio/instalacion-y-debug.md

### 6. La solicitud es un record con reglas

**Visible:**

- Tipos con nombre: String id, Estado estado
- Un record agrupa datos inmutables
- enviar() solo acepta BORRADOR
- El objeto no sabe de HTTP ni de PostgreSQL

**Código (recorrido técnico):** `servicio-solicitudes/…/dominio/Solicitud.java`

**Texto para decir**

> Una variable combina un tipo con un nombre. String id guarda texto que identifica el trámite. Estado limita los cuatro estados posibles: borrador, enviada, aprobada y rechazada.
>
> Solicitud es un record: agrupa datos que no cambian. Cuando enviamos, no modificamos el objeto; obtenemos una solicitud nueva en estado ENVIADA. Y la regla está ahí mismo: solo se envía desde borrador.
>
> Fíjense en lo que no hace: no sabe guardar en PostgreSQL ni responder JSON. Solo expresa el negocio.

**Pregunta al público:** ¿Qué pasa si intentamos enviar una solicitud ya enviada?

**Respuesta esperada:** El record lanza IllegalStateException. Hoy la API lo devuelve como un 500 genérico.

**Transición:** “Con datos y reglas claros, veamos qué prácticas nos ayudan a mantenerlos.”

**Respaldo:** docs/presentation-data/equipo-desarrollo.md

### 7. Buenas prácticas y SOLID

**Visible:**

- Una responsabilidad, un motivo de cambio
- Dependencias explícitas por constructor
- Sustituir sin cambiar lo prometido
- No una interfaz por cada clase

**Texto para decir**

> Una responsabilidad clara hace que cada cambio tenga un lugar reconocible. El controlador traduce HTTP; la regla de envío vive en el modelo.
>
> SOLID da criterios: responsabilidad única, extender sin romper, sustituir conservando el comportamiento, contratos enfocados e inversión de dependencias. No significa crear una interfaz para cada clase.

**Pregunta al público:** Si un repositorio en memoria responde que un id no existe, ¿puede su reemplazo inventar una solicitud?

**Respuesta esperada:** No. Cambiaría el comportamiento que promete el contrato.

**Transición:** “Ahora vamos a organizar esas reglas dentro de una arquitectura.”

## 2 · Arquitectura hexagonal · presenta Participante 1

### 8. Portada · Arquitectura hexagonal

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Si las reglas dependen de HTTP o de la base, cambiar una tecnología obliga a tocar el negocio.
- ¿Cómo funciona, en sencillo? El centro tiene las reglas. Los bordes traducen: HTTP de entrada, base de datos de salida.
- ¿Cómo se representa? Controlador → caso de uso → contrato ← adaptador.
- ¿Dónde se aplicó? ServicioDeSolicitudes usa RepositorioDeSolicitudes; RepositorioJpa lo implementa.
- ¿Qué evidencia lo comprueba? Las pruebas del servicio corren con RepositorioEnMemoria, sin PostgreSQL.

**Texto para decir**

> Ahora vamos con arquitectura hexagonal. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 9. Una consulta, capa por capa

**Visible:**

- El controlador traduce HTTP
- El caso de uso coordina
- El contrato declara lo que necesita
- El adaptador consulta PostgreSQL

**Diagrama:** Consulta de una solicitud. Pasos:

1. La UI pide GET /solicitudes/INC-002. El id viaja en la ruta; no hay cuerpo.
2. El controlador no decide reglas: llama al caso de uso.
3. El caso de uso llama buscar(id) a través del contrato. Spring conectó RepositorioJpa.
4. RepositorioJpa usa Spring Data JPA, que consulta PostgreSQL.
5. La fila vuelve como entidad y el adaptador la convierte en Solicitud del dominio.
6. Si no existe, el servicio lanza SolicitudNoEncontrada y el manejador responde 404.
7. Spring escribe la solicitud como JSON con id, tipo y estado.

**Texto para decir**

> Sigamos una consulta. El controlador recibe el id por HTTP y llama al caso de uso. El caso de uso pide la solicitud a través de un contrato. El adaptador JPA hace la consulta y convierte la fila en un objeto del dominio.
>
> Un puerto es un contrato, no un proceso que reenvía datos. Y en este código no hay un puerto de entrada separado: el controlador llama directamente a ServicioDeSolicitudes.

**Demostración sugerida:** Probar › Consultar INC-002.

**Evidencia que debería observarse:** Status 200 con id, tipo y estado.

**Transición:** “¿Y qué viaja exactamente por HTTP?”

**Respaldo:** docs/presentation-data/flujo-y-referencias.md

### 10. Petición, JSON y respuesta

**Visible:**

- HTTP: método, ruta, headers, status y cuerpo
- JSON es solo el cuerpo
- No todas las respuestas son 200
- Crear y consultar son operaciones distintas

| Status | Cuándo ocurre hoy | Estado |
| --- | --- | --- |
| 200 | La operación terminó | Implementado |
| 404 | La solicitud no existe (ManejadorGlobalDeErrores) | Implementado |
| 500 | Transición inválida: IllegalStateException sin manejador | Comportamiento actual |
| 201 / 409 | Crear con Location / conflicto de estado | Propuesta |

**Texto para decir**

> Una petición HTTP tiene método y ruta, puede llevar headers y un cuerpo. Para consultar INC-002 no enviamos JSON: el id va en la ruta. JSON aparece en la respuesta.
>
> No todas las respuestas son 200. Si la solicitud no existe, el manejador responde 404. Si intentamos una transición inválida, hoy obtenemos un 500 genérico. Un 409 sería más claro, pero es una propuesta: no está implementado.
>
> Crear y consultar también son distintos. Crear usa el id fijo INC-002 y lo deja en borrador; consultar solo lee.

**Transición:** “Volvamos al contrato: ¿quién depende de quién?”

**Respaldo:** docs/presentation-data/feedback-integrado.md

### 11. Dependencias no son llamadas

**Visible:**

- El caso de uso conoce la interfaz
- El adaptador la implementa
- Spring conecta la implementación @Primary
- RepositorioQueRegistra guarda en memoria

**Diagrama:** Dependencias de código frente a llamadas. Pasos:

1. El caso de uso conoce solo la interfaz que necesita. No importa RepositorioJpa.
2. El adaptador también conoce la interfaz y la implementa. Ambos dependen del contrato.
3. En ejecución, la llamada sí llega al adaptador.
4. Spring decide cuál: RepositorioJpa tiene @Primary. RepositorioQueRegistra guarda en un LinkedHashMap en memoria.

**Marcas:** RepositorioJpa es el adaptador activo (@Primary) (implementado) · RepositorioQueRegistra usa LinkedHashMap en memoria (implementado)

**Código (recorrido técnico):** `servicio-solicitudes/…/dominio/RepositorioDeSolicitudes.java`

**Texto para decir**

> Cuando hablamos de inversión de dependencias hablamos de qué código conoce a qué código. El caso de uso conoce la interfaz. El adaptador también la conoce y la implementa.
>
> En ejecución la llamada sí llega al adaptador. Spring elige cuál: hay tres implementaciones y RepositorioJpa tiene @Primary. RepositorioQueRegistra, aunque su nombre suene a registro, guarda en un LinkedHashMap en memoria.
>
> El contrato declara lo que el caso de uso necesita: guardar, buscar y listar. No declara todas las operaciones SQL posibles.

**Pregunta al público:** ¿La interfaz guarda una fila por sí misma?

**Respuesta esperada:** No. Define el contrato; el adaptador ejecuta la operación.

**Transición:** “La organización interna está clara. Ahora crucemos la frontera entre dos procesos.”

## 3 · Arquitectura y comunicación entre servicios · presenta Participante 2

### 12. Portada · Arquitectura y comunicación entre servicios

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Avisar es una responsabilidad distinta del trámite y puede fallar por separado.
- ¿Cómo funciona, en sencillo? Dos aplicaciones hablan por HTTP. Lo que comparten es un contrato JSON, no objetos.
- ¿Cómo se representa? UI → solicitudes → (después) → notificaciones.
- ¿Dónde se aplicó? SolicitudEnviada(eventoId, id, tipo) existe copiado en ambos servicios.
- ¿Qué evidencia lo comprueba? Probar: enviar, luego consultar avisos y eventos consumidos por separado.

**Texto para decir**

> Ahora vamos con arquitectura y comunicación entre servicios. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 13. Servicios y contratos

**Visible:**

- Un microservicio es un proceso con su contrato
- Comparten JSON, no instancias Java
- Cambiar el contrato afecta a ambos lados

**Código (recorrido técnico):** `servicio-*/…/eventos/SolicitudEnviada.java`

**Texto para decir**

> Una clase de servicio organiza operaciones dentro de una aplicación. Un microservicio es una aplicación ejecutable con su propio proceso y su contrato.
>
> Solicitudes y notificaciones se hablan por HTTP. Cada una tiene sus objetos Java; lo que viaja es una estructura JSON. Por eso el record SolicitudEnviada está copiado en los dos servicios: si cambia de un lado, hay que cambiar el otro.

**Transición:** “Antes de seguir: ¿siempre conviene separar en servicios?”

### 14. ¿Monolito modular o servicios separados?

**Visible:**

- Separar agrega red, datos propios y fallos parciales
- Decidir por negocio, equipos y operación
- Microservicios y Kubernetes no son requisitos universales

| Criterio | Favorece monolito modular | Favorece servicios separados |
| --- | --- | --- |
| Límites del negocio | Las partes cambian juntas | Responsabilidades claramente distintas |
| Despliegue | Se publica todo junto | Una parte necesita salir sola |
| Escalabilidad | Carga pareja | Una parte necesita más recursos |
| Equipos | Un equipo pequeño | Equipos dueños de cada parte |
| Costo de operación | Menos piezas que vigilar | Hay capacidad para operar más piezas |
| Contratos y fallos | Llamadas en el mismo proceso | Se aceptan fallos parciales y versionado |

**Marcas:** ARKA-Lite usa dos servicios para aprender esas fronteras (ejemplo)

**Texto para decir**

> Antes de separar procesos preguntamos qué partes del negocio cambian juntas, quién las mantiene y cuáles necesitan desplegarse o escalar por separado.
>
> Un monolito modular mantiene límites internos dentro de una sola aplicación. Separar servicios agrega red, bases independientes y fallos parciales que hay que poder operar.
>
> ARKA-Lite usa dos servicios para aprender esas fronteras. No es una receta para todas las aplicaciones, y Kubernetes tampoco es un requisito.

**Pregunta al público:** Si un solo equipo mantiene todo y se despliega junto, ¿qué ganamos separando?

**Respuesta esperada:** Poco; agregamos red y fallos parciales sin un beneficio claro.

**Transición:** “Veamos qué pasa cuando enviamos INC-002.”

### 15. El envío en dos momentos

**Visible:**

- Momento 1: estado y evento en una transacción
- La API responde con eso
- Momento 2: el relevador entrega después
- No hay broker: es HTTP

**Diagrama:** Envío: estado y evento en una transacción. Pasos:

1. La persona confirma y la UI hace POST /api/solicitudes/INC-002/enviar.
2. SolicitudController recibe la petición y llama al caso de uso.
3. ServicioDeSolicitudes comprueba que INC-002 está en BORRADOR y la pasa a ENVIADA.
4. En una sola transacción se guardan la solicitud ENVIADA y un evento pendiente.
5. La API responde 200 con la solicitud. La respuesta no trae eventoId: la entrega ocurre después.

**Código (recorrido técnico):** `servicio-solicitudes/…/dominio/ServicioDeSolicitudes.java`

**Texto para decir**

> Cuando enviamos INC-002, solicitudes valida el estado y guarda dos cosas en una sola transacción: la solicitud ENVIADA y un evento pendiente. Con eso ya puede responder.
>
> Otro componente, el relevador, revisa los pendientes y los publica por HTTP después. No hay Kafka ni RabbitMQ en esta solución.
>
> La respuesta trae la solicitud, pero no trae el eventoId. Por eso desde fuera no podemos atar directamente un envío con su evento.

**Pregunta al público:** ¿El éxito del POST remoto y marcar procesado = true son una sola escritura?

**Respuesta esperada:** No. Hay una ventana entre ambos pasos.

**Demostración sugerida:** Probar › Enviar sobre una solicitud en BORRADOR.

**Evidencia que debería observarse:** 200 con estado ENVIADA y sin eventoId.

**Transición:** “Antes de la entrega, veamos cómo la UI observa lo que pasa.”

**Respaldo:** docs/presentation-data/guion-maestro.md › El envío en dos momentos

### 16. Cómo funciona la UI del laboratorio

**Visible:**

- El navegador solo llama a /api
- El proxy llega a cada servicio por nombre
- La UI registra solo sus peticiones
- Un POST nunca se repite solo

**Diagrama:** Cómo funciona la UI. Pasos:

1. La persona pulsa un control. Las consultas y las escrituras se ven distintas.
2. React registra la acción en curso. Una escritura pide confirmación antes de salir.
3. El cliente HTTP mide el tiempo y corta la espera a los 10 s. Nunca repite un POST.
4. El navegador llama a /api en el mismo origen. El proxy traduce al servicio.
5. El proxy llega al servicio por su nombre interno, nunca por localhost.
6. Vuelven status y cuerpo: 200, 404, 500, o un error del proxy si el servicio no responde.
7. La petición queda en el historial con método, URL, status y duración.
8. La pantalla explica el resultado y qué podría pasar después.

**Código (recorrido técnico):** `presentacion/despliegue/nginx.conf.template`

**Texto para decir**

> La UI es una aplicación React servida por nginx. El navegador nunca conoce los nombres internos: llama a /api en el mismo origen y el proxy traduce a servicio-solicitudes o servicio-notificaciones.
>
> Cada petición queda en un historial con método, URL, status y duración. Pero ojo: la UI solo ve sus propias peticiones. La entrega entre servicios no pasa por aquí.
>
> Si un POST tarda más de 10 segundos, la UI lo marca como tiempo agotado y no lo repite: el cambio podría haberse guardado aunque la respuesta se perdiera.

**Transición:** “Pasemos a la demostración en vivo.”

### 17. Demostración: seguir INC-002

**Visible:**

- Crear INC-002 si no existe
- Enviar y leer lo que confirmó la respuesta
- Consultar avisos y eventos consumidos por separado
- “Todavía no observado” no es un fallo

**Texto para decir**

> Vamos a la vista Probar. Primero listamos las solicitudes para ver el estado actual. Si INC-002 no existe, la creamos; si ya existe, la API la dejaría otra vez en borrador, y la pantalla lo advierte.
>
> Enviamos y leemos lo que la respuesta confirma: ENVIADA. Después consultamos los avisos. Puede que todavía no aparezca: el relevador trabaja en ciclos. La pantalla dice “todavía no observado”, que no es lo mismo que “falló”.

**Instrucciones (no se dicen):**

- No reiniciar datos ni borrar contenedores para preparar el ejemplo.
- Si el aviso no aparece, activar la actualización periódica (máximo seis consultas) en lugar de repetir el envío.

**Demostración sugerida:** Probar › Listar, Crear INC-002, Enviar, Consultar avisos, Consultar eventos consumidos.

**Evidencia que debería observarse:** ENVIADA en la respuesta y luego el texto “Solicitud INC-002 (SolicitudEnviada) enviada” en avisos.

**Transición:** “Ya vimos qué pasa. Ahora veamos dónde se ejecuta todo esto.”

## 4 · Docker y ejecución en contenedores · presenta Participante 3

### 18. Portada · Docker y ejecución en contenedores

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? “En mi máquina funciona”: cada equipo tiene otro Java, otras variables y otra red.
- ¿Cómo funciona, en sencillo? El Dockerfile es la receta, la imagen el resultado y el contenedor el proceso que corre.
- ¿Cómo se representa? Etapa build → JAR → etapa final → imagen → contenedor.
- ¿Dónde se aplicó? Dockerfile multietapa de cada servicio y de la UI; compose.yaml y compose.ui.yaml.
- ¿Qué evidencia lo comprueba? docker compose ps con los servicios saludables y la UI respondiendo en localhost:8088.

**Texto para decir**

> Ahora vamos con docker y ejecución en contenedores. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 19. Imagen, contenedor y Dockerfile

**Visible:**

- Receta → imagen → contenedor
- Dos etapas: compilar y ejecutar
- La imagen final no lleva Maven
- Corre sin usuario root

**Diagrama:** De Dockerfile a contenedor. Pasos:

1. La etapa build tiene Maven y JDK 26. Compila el JAR y omite las pruebas.
2. La etapa final solo lleva JRE 26 y el JAR. Corre con un usuario sin privilegios.
3. El resultado es una imagen: la misma receta para cualquier contenedor.
4. Un contenedor es un proceso creado desde esa imagen, con su configuración.
5. Dentro de la red, solicitudes llama a servicio-notificaciones:8080. localhost sería el propio contenedor.
6. Desde tu equipo entras por el puerto publicado. EXPOSE solo documenta.

**Marcas:** La imagen omite pruebas; el CI ejecuta verify antes (implementado)

**Código (recorrido técnico):** `servicio-solicitudes/Dockerfile`

**Texto para decir**

> El Dockerfile es la receta. La imagen es el resultado empaquetado. El contenedor es un proceso creado desde esa imagen con una configuración. Una misma imagen sirve para muchos contenedores.
>
> Nuestros Dockerfile tienen dos etapas. La primera tiene Maven y JDK 26 y construye el JAR. La final solo lleva JRE 26 y el JAR, y corre con un usuario sin privilegios.
>
> Empaquetar reduce diferencias, pero siguen importando la arquitectura del equipo, la red, la configuración, los recursos y los datos.

**Transición:** “¿Cómo se encuentran los contenedores entre sí?”

**Respaldo:** docs/operaciones/docker-y-compose.md

### 20. Configuración, red y puertos

**Visible:**

- Variables de entorno cambian conexiones sin tocar el JAR
- Dentro de la red: nombre del servicio
- localhost dentro de un contenedor es el propio contenedor
- Puerto publicado ≠ puerto interno

| Quién llama | A dónde | Con qué dirección |
| --- | --- | --- |
| Navegador | UI | http://localhost:8088 |
| Navegador | API | http://localhost:8088/api/… (mismo origen) |
| Proxy de la UI | solicitudes | http://servicio-solicitudes:8080 |
| solicitudes | notificaciones | http://servicio-notificaciones:8080/eventos/solicitud-enviada |
| Tu equipo | notificaciones | http://localhost:8081 (publicado) |

**Marcas:** Compose no declara volúmenes estables para las bases (implementado)

**Texto para decir**

> DB_URL y NOTIFICACIONES_URL cambian las conexiones sin recompilar. Dentro de Compose, cada servicio se encuentra por su nombre. Si dentro de un contenedor escribimos localhost, llegamos al mismo contenedor, no a otro servicio.
>
> EXPOSE documenta un puerto. El mapeo de Compose es el que publica el acceso desde nuestro equipo. Cambiar el puerto publicado no cambia el puerto interno del proceso.
>
> Las bases del Compose no tienen volúmenes estables declarados: no prometamos que los datos sobreviven a recrear contenedores.

**Pregunta al público:** ¿Cambiar el puerto publicado de 8081 a otro cambia el puerto del proceso?

**Respuesta esperada:** No necesariamente: cambia el acceso desde el equipo; el destino interno sigue igual.

**Demostración sugerida:** docker compose -f compose.yaml -f compose.ui.yaml ps

**Evidencia que debería observarse:** Ambos servicios y la UI arriba; notificaciones healthy.

**Transición:** “Docker ejecuta procesos. Kubernetes agrega control declarativo.”

## 5 · Kubernetes y operación declarativa · presenta Participante 3

### 21. Portada · Kubernetes y operación declarativa

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Si un proceso muere a las tres de la mañana, alguien tiene que volver a iniciarlo.
- ¿Cómo funciona, en sencillo? Declaramos el estado deseado y Kubernetes trabaja para mantenerlo.
- ¿Cómo se representa? Deployment → ReplicaSet → Pod; Service → Pods listos.
- ¿Dónde se aplicó? k8s/*.yaml para servicios y bases; k8s/ui/arka-ui.yaml para la UI.
- ¿Qué evidencia lo comprueba? kubectl get pods,svc,pvc y la UI por port-forward.

**Texto para decir**

> Ahora vamos con kubernetes y operación declarativa. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 22. Estado deseado y recursos

**Visible:**

- Un Pod ejecuta contenedores
- Deployment y ReplicaSet mantienen réplicas
- Service da un acceso estable a Pods listos
- Secret y PVC: credencial y disco

**Diagrama:** Kubernetes: estado deseado. Pasos:

1. Declaramos un Deployment: imagen, réplicas y configuración.
2. El ReplicaSet mantiene el número de Pods pedido. Si uno falta, crea otro.
3. El Pod ejecuta el contenedor. Antes, sus initContainers esperan la base y notificaciones.
4. El Service da un nombre estable y envía tráfico solo a Pods listos.
5. El Secret entrega la contraseña como variable de entorno.
6. La base guarda sus datos en un PVC, que sobrevive al Pod. Aun así, no es un backup.
7. La aplicación llega a la base por su Service, no por la IP del Pod.

**Marcas:** Sin Ingress, HPA ni ConfigMap en los manifiestos de los servicios (implementado) · Docker puede usarse sin Kubernetes (implementado)

**Texto para decir**

> En Kubernetes declaramos qué queremos: una imagen, un número de réplicas y una configuración. Los controladores comparan eso con lo que pasa y actúan.
>
> El Pod ejecuta los contenedores. El Deployment y su ReplicaSet mantienen la cantidad de Pods. El Service da un nombre estable y envía tráfico solo a Pods listos. Un Pod no reparte subredes.
>
> Las bases piden almacenamiento con un PVC, y un Secret entrega la contraseña. Compose y Kubernetes son dos rutas de ejecución distintas; Docker puede usarse sin Kubernetes.

**Transición:** “¿Cómo sabe Kubernetes si un Pod está bien?”

**Respaldo:** docs/operaciones/kubernetes-local.md

### 23. Arranque, salud y recuperación

**Visible:**

- initContainers esperan dependencias
- Readiness: ¿puede recibir tráfico?
- Liveness: ¿hay que reiniciarlo?
- Reponer un Pod no recupera la memoria

| Estado del Pod | Primera pregunta |
| --- | --- |
| Pending | ¿Hay recursos o un PVC sin enlazar? |
| ImagePullBackOff | ¿Existe la imagen en el clúster local? |
| CrashLoopBackOff | ¿Qué dicen los logs del contenedor? |
| Running sin Ready | ¿Responde la ruta de readiness? |

**Código (recorrido técnico):** `diagnóstico`

**Texto para decir**

> Los initContainers esperan a la base y a notificaciones antes de iniciar la aplicación. La readiness decide si un Pod recibe tráfico; la liveness permite reiniciar un contenedor que dejó de responder.
>
> Las aplicaciones tienen readiness sobre /solicitudes y /notificaciones; las bases usan pg_isready. La UI que agregamos tiene readiness y liveness sobre /salud.
>
> Si un Pod de notificaciones se reemplaza, los avisos en memoria se pierden. Y un PVC no sustituye un backup restaurable.

**Pregunta al público:** ¿Dos Pods de notificaciones comparten la misma lista de avisos?

**Respuesta esperada:** No. Cada proceso tiene su propia memoria.

**Demostración sugerida:** kubectl get pods,svc,pvc y kubectl describe de un Pod.

**Evidencia que debería observarse:** Pods Running y Ready; eventos del Pod sin errores.

**Transición:** “Ya sabemos dónde corre una versión. Veamos cómo se valida y se publica.”

## 6 · CI/CD con GitHub Actions · presenta Participante 4

### 24. Portada · CI/CD con GitHub Actions

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Sin verificación automática, un cambio roto puede llegar a main sin que nadie lo note.
- ¿Cómo funciona, en sencillo? Cada push o PR compila, prueba y publica imágenes de forma repetible.
- ¿Cómo se representa? Evento → jobs de matriz → preparar → probar → construir → publicar.
- ¿Dónde se aplicó? .github/workflows/ci.yml con matriz por servicio y un job para la UI.
- ¿Qué evidencia lo comprueba? La ejecución en Actions y la imagen en GHCR con el SHA del commit.

**Texto para decir**

> Ahora vamos con ci/cd con github actions. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 25. Integración, entrega y despliegue

**Visible:**

- Integración: compilar y probar seguido
- Entrega: dejar una versión lista
- Despliegue: llevarla al destino
- Nuestro CI verifica y publica; no despliega

**Diagrama:** CI/CD con GitHub Actions. Pasos:

1. Un push a main o un Pull Request inicia el workflow.
2. La matriz crea un job por servicio, cada uno con su PostgreSQL.
3. Cada job ejecuta mvn -B verify dentro de la carpeta del servicio.
4. Solo solicitudes comprueba además que el JAR arranca y muestra CAM-002.
5. Ambos construyen la imagen y la publican en GHCR con el SHA del commit.
6. No hay paso de despliegue. Un pipeline verde no cambia lo que corre en el clúster.

**Marcas:** No hay paso de despliegue al clúster (implementado)

**Texto para decir**

> Integración continua es comprobar cambios con construcción y pruebas de forma frecuente. Entrega continua es dejar una versión validada lista. Despliegue continuo es llevarla además al destino de forma automática.
>
> En ARKA-Lite el workflow verifica los servicios y publica imágenes en GHCR. No despliega. Un pipeline verde no demuestra que el clúster esté corriendo la versión nueva.

**Pregunta al público:** ¿Publicar una imagen en GHCR inicia un rollout en Kubernetes?

**Respuesta esperada:** No. Hace falta un mecanismo de despliegue adicional.

**Transición:** “Leamos el archivo que lo hace.”

### 26. Leer ci.yml

**Visible:**

- on: push a main y pull_request
- Matriz: un job por servicio con su PostgreSQL
- mvn -B verify en la carpeta del servicio
- Imagen etiquetada con el SHA

**Código (recorrido técnico):** `.github/workflows/ci.yml`

**Texto para decir**

> GitHub descubre los workflows en .github/workflows. on dice qué eventos lo inician: push a main y Pull Requests. jobs agrupa trabajos y runs-on elige la máquina.
>
> La matriz crea un job por servicio. Cada uno prepara PostgreSQL y Java 26, ejecuta mvn verify dentro de su carpeta y, en solicitudes, comprueba que el JAR arranca y muestra CAM-002.
>
> Después construye la imagen y la publica en GHCR con el SHA del commit, usando el token del job. Agregamos además un job para la UI que valida el contenido, prueba, construye y genera el PPTX.

**Instrucciones (no se dicen):**

- Abrir el archivo en GitHub solo en modo lectura.

**Transición:** “Cuando algo falla, ¿por dónde empezamos?”

**Respaldo:** docs/presentation-data/ci-yaml-paso-a-paso.md

### 27. Investigar una ejecución

**Visible:**

- Elegir la ejecución del commit correcto
- Abrir el job y el paso que falló
- Repetir sin corregir no arregla nada
- Verde ≠ desplegado

**Texto para decir**

> En Actions elegimos la ejecución del commit correcto, abrimos el job del servicio y el paso que falló. Un error de compilación se investiga en Maven; una publicación rechazada, en el evento y los permisos.
>
> La publicación también se intenta en Pull Requests y puede fallar por permisos, por ejemplo desde un fork. Separar validación y publicación es una mejora propuesta.

**Demostración sugerida:** Recorrer Actions › ejecución › job › paso, en modo lectura.

**Evidencia que debería observarse:** El SHA de la ejecución coincide con el commit revisado.

**Transición:** “El pipeline empieza con cambios versionados. Veamos esa historia.”

## 7 · Git y GitHub para trabajo colaborativo · presenta Participante 4

### 28. Portada · Git y GitHub para trabajo colaborativo

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Cinco personas cambian el mismo código: hay que saber qué cambió, quién lo revisó y por qué.
- ¿Cómo funciona, en sencillo? Git guarda la historia; GitHub agrega revisión y automatización.
- ¿Cómo se representa? Edición → staging → commit → push → Pull Request → revisión → merge.
- ¿Dónde se aplicó? Ramas feat/, fix/ y docs/; Conventional Commits en español; PR con una aprobación.
- ¿Qué evidencia lo comprueba? El historial del repositorio y los PR integrados.

**Texto para decir**

> Ahora vamos con git y github para trabajo colaborativo. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 29. Historia local y colaboración

**Visible:**

- git add elige · git commit registra · git push publica
- Un commit local aún no está en GitHub
- Revisar git diff --staged antes de confirmar
- GitHub: PR, revisión y checks

| Comando | Qué hace |
| --- | --- |
| git switch -c feat/… | Crea una rama corta para la tarea |
| git add ruta | Selecciona cambios para el próximo commit |
| git commit -m "feat: …" | Registra la selección localmente |
| git push -u origin feat/… | Publica la rama en GitHub |

**Texto para decir**

> Git guarda la historia del código y funciona en local. GitHub aloja el repositorio y agrega issues, Pull Requests, revisión y checks. Actions ejecuta automatizaciones y GHCR guarda las imágenes.
>
> Editar cambia el directorio de trabajo. git add selecciona lo que entra al próximo commit. git commit lo registra localmente. git push lo publica. Antes de confirmar, revisamos git status y git diff --staged.

**Instrucciones (no se dicen):**

- No crear commits ni PR durante la exposición; mostrar ejemplos existentes.

**Transición:** “¿Y cuando dos cambios chocan?”

**Respaldo:** docs/desarrollo/flujo-de-trabajo.md

### 30. Conflictos, revisión y trazabilidad

**Visible:**

- Resolver un conflicto exige entender ambos cambios
- La revisión evalúa significado, no solo formato
- Issue → PR → commit → ejecución → imagen
- revert deshace sin reescribir la historia

**Marcas:** Proteger main y exigir checks (propuesta)

**Texto para decir**

> Un conflicto aparece cuando Git no puede combinar dos cambios solo. Resolverlo exige entender ambos y volver a probar; borrar las marcas del archivo no basta.
>
> En la revisión explicamos el problema, el cambio y cómo se comprobó. La trazabilidad une issue, PR, commit, ejecución, imagen y versión desplegada. Proteger main y exigir checks son políticas propuestas que hay que configurar.

**Pregunta al público:** ¿Un commit pequeño garantiza una buena revisión?

**Respuesta esperada:** Ayuda, pero también hacen falta contexto, pruebas y entender el impacto.

**Transición:** “Ya sabemos cómo cambia el código. Ahora, cómo conservamos el significado de los datos cuando algo falla.”

## 8 · Datos y consistencia · presenta Participante 5

### 31. Portada · Datos y consistencia

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Si se guarda ENVIADA y justo después falla el HTTP, podríamos perder la intención de avisar.
- ¿Cómo funciona, en sencillo? Guardamos el estado y el evento juntos, y el receptor ignora lo que ya recibió.
- ¿Cómo se representa? Outbox → relevador → publicador → receptor idempotente.
- ¿Dónde se aplicó? Tabla evento, RelevadorDeEventosPendientes y ConsumoIdempotente con evento_procesado.
- ¿Qué evidencia lo comprueba? Consultar eventos consumidos y avisos después de enviar; los logs del publicador.

**Texto para decir**

> Ahora vamos con datos y consistencia. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 32. Dónde vive cada dato

**Visible:**

- Cada servicio es dueño de su base
- Avisos: en memoria
- Ids consumidos: en PostgreSQL
- Sin FK entre bases

**Diagrama:** Dónde vive cada dato. Pasos:

1. Solicitudes guarda el trámite en su propia base.
2. En la misma base guarda el evento pendiente: así no se pierde la intención de avisar.
3. Notificaciones guarda en PostgreSQL los eventoId que ya consumió.
4. El texto del aviso vive en memoria: si el proceso reinicia, se pierde y el id permanece.
5. No hay FK entre bases. Lo que las une es el contrato del evento.

| Identificador | Qué identifica |
| --- | --- |
| id de solicitud (INC-002) | El trámite |
| id numérico de evento | Una fila local del outbox |
| evento_id (UUID) | El hecho que intentamos entregar |

**Marcas:** Los textos de aviso se pierden al reiniciar notificaciones (implementado)

**Texto para decir**

> Solicitudes es dueño del trámite y de su outbox. Notificaciones es dueño del consumo y de los avisos. No hay una clave foránea que conecte las dos bases: el vínculo es el contrato del evento.
>
> Hay tres identificadores que no hay que confundir: el id del trámite, el id numérico de una fila del outbox y el UUID del evento, que es el que permite reconocer una repetición.
>
> Y algo que sorprende: el texto del aviso vive en memoria y el id consumido vive en PostgreSQL. Si notificaciones reinicia, perdemos el texto y conservamos el id.

**Demostración sugerida:** Probar › Consultar avisos y Consultar eventos consumidos.

**Evidencia que debería observarse:** Dos listas distintas: textos e ids.

**Transición:** “¿Por qué guardamos el evento en la misma base?”

**Respaldo:** docs/presentation-data/datos-y-consistencia.md

### 33. ACID y la transacción del envío

**Visible:**

- Atomicidad: estado y evento juntos
- Consistencia: invariantes como el CHECK de estado
- Aislamiento y durabilidad dependen de la base
- Una transacción no revierte una lista Java

**Código (recorrido técnico):** `servicio-solicitudes/src/main/resources/schema.sql`

**Texto para decir**

> ACID describe atomicidad, consistencia, aislamiento y durabilidad. Para el envío nos importa sobre todo la atomicidad: el estado y el evento se confirman juntos o no se confirma ninguno.
>
> Ninguna de esas palabras convierte una lista Java en una escritura de PostgreSQL. Si notificaciones agrega el texto a su lista y luego falla el guardado del id, la lista no se revierte.

**Transición:** “Veamos el patrón que usa esa transacción.”

### 34. Outbox Pattern: entregar después

**Visible:**

- La intención de avisar queda guardada
- El relevador la publica en ciclos
- Puede haber reentrega
- Eventual no significa “en 5 segundos”

**Diagrama:** Entrega posterior del evento. Pasos:

1. El evento espera en la tabla con procesado = false.
2. El relevador revisa la tabla cada 5 segundos. No es una promesa de entrega en 5 s.
3. El publicador intenta hasta tres veces con el mismo eventoId.
4. La petición HTTP llega a EventoController. No hay broker: es HTTP directo.
5. ConsumoIdempotente pregunta si ya conoce ese eventoId.
6. Si es nuevo: crea el aviso en memoria y guarda el id en PostgreSQL.
7. Si ya lo conocía: lo ignora. Así una reentrega no duplica el aviso.
8. Notificaciones responde 200 al publicador.
9. Solo entonces el relevador marca procesado = true.
10. Si el 200 se pierde, el evento sigue pendiente y puede llegar dos veces. No prometemos exactamente una vez.

**Marcas:** No hay broker: HTTP directo (implementado) · El outbox no guarda el contexto de traza original (implementado)

**Código (recorrido técnico):** `servicio-solicitudes/…/adaptadores/salida/RelevadorDeEventosPendientes.java`

**Texto para decir**

> ¿Qué pasa si guardamos ENVIADA y justo después falla el HTTP? Si la intención de avisar existiera solo en memoria, la perderíamos. El outbox la guarda en la misma transacción que el estado.
>
> El relevador toma los pendientes cada cinco segundos y el publicador intenta hasta tres veces. Si obtiene éxito, marca procesado. Si el receptor consumió pero la respuesta se perdió, el evento puede llegar otra vez.
>
> Eventual significa que el hecho se propaga después, si el sistema se recupera. No fija un tiempo máximo y no garantiza nada frente a un fallo permanente.

**Pregunta al público:** ¿Qué resuelve el outbox y qué exige idempotencia?

**Respuesta esperada:** El outbox guarda la intención junto con el cambio local; la idempotencia controla el efecto de repetir la entrega.

**Transición:** “Entonces, ¿cómo evita notificaciones duplicar el aviso?”

**Respaldo:** docs/presentation-data/guion-maestro.md › Outbox Pattern

### 35. Idempotencia y concurrencia

**Visible:**

- El mismo hecho conserva el mismo eventoId
- El receptor ignora ids ya consumidos
- Dos consumos simultáneos pueden competir
- Exactamente una vez: no lo prometemos

**Marcas:** Coordinar identidad y efecto durable bajo concurrencia (propuesta)

**Código (recorrido técnico):** `servicio-notificaciones/…/adaptadores/entrada/ConsumoIdempotente.java`

**Texto para decir**

> La idempotencia busca que repetir la misma operación no multiplique su efecto. Para reconocer la repetición, el evento conserva el mismo UUID en cada reintento. Un UUID nuevo haría parecer nuevo el mismo hecho.
>
> El consumidor pregunta si conoce el id y omite los ya registrados. Pero hay carreras posibles: dos consumos pueden preguntar al mismo tiempo antes de escribir. La clave primaria evita dos filas, pero no deshace el texto que ya se agregó en memoria.
>
> Por eso no decimos “exactamente una vez”. La mejora propuesta es coordinar la identidad y el efecto durable, y probarlo bajo concurrencia.

**Demostración sugerida:** Probar › Consultar eventos consumidos antes y después de enviar.

**Evidencia que debería observarse:** Aparece un id nuevo, pero la API no dice de qué solicitud es.

**Transición:** “Cambiar estas tablas también tiene sus reglas.”

### 36. Cambiar el esquema y recuperar

**Visible:**

- Cambiar una base implica configuración, esquema, migración y pruebas
- Hoy: schema.sql idempotente y validate
- Volver a una imagen no restaura datos
- Un backup sirve si sabemos restaurarlo

**Marcas:** schema.sql en cada arranque, sin Flyway ni Liquibase (implementado) · Migraciones versionadas (propuesta)

**Texto para decir**

> Cambiar una tabla exige pensar en los datos que ya existen y en versiones que convivirán durante la transición. Solicitudes ejecuta schema.sql en cada arranque y Hibernate solo valida: los cambios se escriben como SQL idempotente.
>
> Volver a una imagen anterior no restaura datos. Un backup es útil cuando sabemos restaurarlo y qué pérdida aceptamos. Y si restauramos emisor y receptor a momentos distintos, pueden reaparecer eventos: otra vez importa la idempotencia.

**Transición:** “Para comprobar todo esto necesitamos evidencia.”

## 9 · Observabilidad · presenta Participante 5

### 37. Portada · Observabilidad

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Alguien reporta que envió INC-002 y no vio el aviso. ¿Dónde miramos?
- ¿Cómo funciona, en sencillo? Los logs cuentan qué pasó, las métricas cuánto y la salud si un servicio responde.
- ¿Cómo se representa? Dos recorridos separados: logs por Promtail y Loki; métricas por Actuator y Prometheus.
- ¿Dónde se aplicó? Logs ECS, Promtail, Loki y Grafana en Compose; Actuator y Micrometer en cada servicio.
- ¿Qué evidencia lo comprueba? Una búsqueda en Grafana Explore por eventoId y GET /actuator/health.

**Texto para decir**

> Ahora vamos con observabilidad. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 38. Logs, métricas, trazas y datos

**Visible:**

- Log: un hecho con contexto
- Métrica: una medición en el tiempo
- Traza: el recorrido de una ejecución
- Datos de negocio: lo que quedó guardado

| Pieza | Dónde vive | Qué hace |
| --- | --- | --- |
| Actuator | Dentro de cada app | Expone health, info, metrics y prometheus |
| Micrometer | Dentro de cada app | Registra mediciones y contexto de traza |
| Promtail | Contenedor aparte | Recoge las fuentes configuradas: aquí, Docker |
| Loki | Contenedor aparte | Guarda y consulta logs; no necesita Actuator |
| Grafana | Contenedor aparte | Consulta fuentes conectadas; no las descubre solo |
| Prometheus | No está en Compose | Recogería métricas: pendiente |

**Texto para decir**

> Separemos las señales. Un log registra un hecho con contexto. Una métrica es una medición en el tiempo. Una traza describe el recorrido de una ejecución. Y los datos de negocio son lo que quedó guardado.
>
> Algunas piezas viven dentro de la aplicación, como Actuator y Micrometer. Otras son contenedores aparte: Promtail, Loki y Grafana. Prometheus no está en nuestro Compose.

**Transición:** “Empecemos por el recorrido de los logs.”

**Respaldo:** docs/presentation-data/guion-observabilidad.md

### 39. Recorrido de los logs

**Visible:**

- La app escribe; Promtail recoge; Loki guarda; Grafana muestra
- Promtail no lee todos los archivos del equipo
- System.err es otra salida del proceso, no un system.log
- La fuente Loki se conecta a mano en Grafana

**Diagrama:** Recorrido de los logs. Pasos:

1. La aplicación escribe en su salida estándar con formato ECS.
2. Docker conserva la salida de cada contenedor.
3. Promtail lee solo las fuentes configuradas: aquí, contenedores Docker.
4. Loki guarda los logs y responde consultas.
5. Grafana consulta Loki cuando alguien conecta esa fuente.

**Código (recorrido técnico):** `observabilidad/promtail.yaml`

**Texto para decir**

> La aplicación escribe, Promtail recoge, Loki guarda y Grafana muestra. Promtail solo recoge las fuentes configuradas: aquí, la salida de los contenedores Docker. No lee automáticamente todos los archivos del equipo.
>
> system.log o syslog son registros del sistema y requieren configuración aparte para recogerse. System.err es la salida de error del proceso Java; Docker la junta con la salida estándar.
>
> Grafana no descubre servicios por su cuenta. En el Compose actual hay que agregar la fuente Loki a mano.

**Demostración sugerida:** Grafana › Explore › Loki: {service="servicio-solicitudes"} |= "evento".

**Evidencia que debería observarse:** Líneas “Intentando publicar evento” con el eventoId.

**Transición:** “Las métricas siguen otro camino.”

### 40. Recorrido de las métricas

**Visible:**

- Micrometer mide dentro de la app
- Actuator expone /actuator/prometheus
- Prometheus recogería: pendiente
- Grafana consultaría Prometheus: pendiente

**Diagrama:** Recorrido de las métricas. Pasos:

1. Micrometer registra mediciones dentro de cada aplicación.
2. Actuator las expone en /actuator/prometheus. Health es otro endpoint del mismo módulo.
3. Un servidor Prometheus las recogería. Hoy no está en el Compose: pendiente.
4. Grafana las consultaría en Prometheus. También pendiente.

**Marcas:** Servidor Prometheus y su fuente en Grafana (propuesta)

**Texto para decir**

> Micrometer registra mediciones dentro de la aplicación. Actuator las expone en /actuator/prometheus. Un servidor Prometheus las recogería y guardaría, y Grafana las consultaría ahí.
>
> Hoy ese servidor no está en el Compose: el recorrido de métricas termina en Actuator. Lo marcamos como pendiente.

**Transición:** “¿Y health? Es otra cosa.”

### 41. Health no es negocio terminado

**Visible:**

- /actuator/health vive dentro de cada app
- Resume indicadores configurados, como la base
- UP no prueba que un evento llegó
- Se consulta sin Grafana

**Texto para decir**

> Health es un endpoint de Actuator dentro de cada aplicación. Lo podemos consultar sin Grafana, y la UI lo hace en la barra lateral.
>
> Informa la salud según los indicadores configurados, por ejemplo la conexión a la base. No demuestra que todos los eventos de negocio terminaron su recorrido.

**Pregunta al público:** Si el sistema dice UP pero un UUID no termina su recorrido, ¿qué evidencia falta?

**Respuesta esperada:** Estado del evento, intentos de publicación, registro de consumo y disponibilidad del texto.

**Demostración sugerida:** Probar › Salud de ambos servicios.

**Evidencia que debería observarse:** status UP con el componente db.

**Transición:** “Veamos qué deberían contarnos los logs para investigar ese caso.”

### 42. Qué registran hoy los logs

**Visible:**

- Qué pasó, en qué servicio y cuándo
- Destino y resultado, cuando aplica
- Identificadores de negocio y de traza
- Separar lo registrado de lo propuesto

| Campo | Hoy | Dónde |
| --- | --- | --- |
| @timestamp, log.level, logger, hilo | Registrado | Formato ECS de Spring Boot |
| service.name y versión | Registrado | spring.application.name; Promtail añade la etiqueta service |
| eventoId e id de solicitud | Dentro del texto del mensaje | PublicadorConReintento, ConsumoIdempotente |
| traceId y spanId | No aparecen en la salida observada | Hay dependencia Brave; falta llevarlos al log |
| Destino (URL) e intento | Propuesto como campo | Hoy el intento va en el texto del warn |
| Resultado y duración | Propuesto | No se registran como campos |

**Texto para decir**

> Un log útil responde qué pasó, en qué servicio y caso, cuándo, hacia qué destino, con qué resultado y con qué identificadores para correlacionar.
>
> Hoy tenemos momento, nivel, servicio, y los ids de evento y solicitud dentro del texto del mensaje. En las líneas que revisamos no aparecen traceId ni spanId, aunque el proyecto incluye la dependencia de trazas. Destino, resultado y duración como campos separados son una propuesta.
>
> Un detalle: en un camino de fallo el publicador también usa System.err, así que no todas las líneas son JSON ECS.

**Transición:** “Probar también es parte de tener evidencia.”

**Respaldo:** docs/presentation-data/observabilidad.md

## 10 · Pruebas y calidad · presenta Participante 4

### 43. Portada · Pruebas y calidad

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Sin pruebas, cada cambio depende de que alguien recuerde revisar todo a mano.
- ¿Cómo funciona, en sencillo? Pruebas pequeñas para reglas, pruebas de borde para adaptadores y una comprobación de arranque.
- ¿Cómo se representa? Dominio → servicio → controlador → arranque real en CI.
- ¿Dónde se aplicó? JUnit en ambos servicios, MockMvc standalone, prueba de contrato del repositorio y pruebas de la UI con Vitest.
- ¿Qué evidencia lo comprueba? mvn verify, npm test y el resultado de cada job en Actions.

**Texto para decir**

> Ahora vamos con pruebas y calidad. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 44. Qué pruebas existen hoy

**Visible:**

- Reglas del dominio sin Spring
- Controladores con MockMvc standalone
- Contrato del repositorio con varias implementaciones
- Arranque real con PostgreSQL en CI

| Prueba | Qué comprueba | Necesita PostgreSQL |
| --- | --- | --- |
| SolicitudTest | Transiciones válidas e inválidas del record | No |
| ServicioSolicitudesUnitTest | Envío registra evento; errores de estado | No |
| SolicitudControllerWebTest | JSON de crear y enviar; 404 | No |
| RepositorioDeSolicitudesContractTest | Guardar, actualizar y buscar en cada implementación | No |
| ServicioNotificacionesApplicationTests | Un evento repetido genera un solo aviso | No (mock) |
| Arranque en ci.yml | El JAR inicia y muestra CAM-002 | Sí |
| presentacion: npm test | Cliente HTTP, contenido, diagramas y vistas de la UI | No |

**Marcas:** Ninguna prueba ejercita el relevador ni la entrega HTTP real (implementado)

**Texto para decir**

> Las reglas del dominio se prueban sin levantar Spring: así son rápidas y deterministas. Los controladores se prueban con MockMvc sin servidor real. Hay una prueba de contrato que corre la misma verificación sobre varias implementaciones del repositorio.
>
> En notificaciones hay una prueba que manda el mismo evento dos veces y comprueba que se genera un solo aviso. Y en CI, solicitudes además arranca con PostgreSQL real.
>
> Lo que falta también es información: ninguna prueba ejercita el relevador ni la entrega HTTP entre servicios.

**Demostración sugerida:** ./mvnw test en un servicio y npm test en presentacion/.

**Evidencia que debería observarse:** Resumen de pruebas sin fallos.

**Transición:** “¿Qué agregaríamos primero?”

### 45. Calidad: lo siguiente

**Visible:**

- Integración con PostgreSQL real (Testcontainers)
- Prueba de entrega con fallo y reintento
- Concurrencia del consumo idempotente
- Análisis estático y cobertura en CI

**Marcas:** Pruebas de integración con base real (propuesta) · Prueba de reentrega y concurrencia (propuesta) · Formateador y análisis estático en CI (propuesta)

**Texto para decir**

> Propondríamos tres pruebas antes que cualquier otra cosa: una de integración con PostgreSQL real, una que simule que notificaciones falla y luego vuelve, y una que mande el mismo evento en paralelo.
>
> Después, análisis estático y cobertura como checks del Pull Request. Todo esto es propuesta: hoy no está configurado.

**Transición:** “Pasemos a seguridad básica.”

## 11 · Seguridad básica · presenta Participante 4

### 46. Portada · Seguridad básica

**Visible:** las cinco preguntas de la sección.

- ¿Qué problema resuelve? Un laboratorio abierto se parece mucho a un sistema expuesto si se publica sin cambios.
- ¿Cómo funciona, en sencillo? Saber qué protege hoy el sistema y qué habría que cerrar antes de exponerlo.
- ¿Cómo se representa? Tabla de lo que hay y de lo que falta.
- ¿Dónde se aplicó? Usuarios sin privilegios en contenedores, token del job con permisos mínimos, proxy que no expone el endpoint interno.
- ¿Qué evidencia lo comprueba? Dockerfile, ci.yml, compose.yaml y la configuración de nginx.

**Texto para decir**

> Ahora vamos con seguridad básica. Primero, qué problema resuelve.

**Instrucciones (no se dicen):** leer en voz alta las cinco preguntas antes de avanzar.

### 47. Lo que hay hoy

**Visible:**

- Contenedores sin root
- Token del job con permisos mínimos
- Errores 404 sin detalles internos
- Sin autenticación: es un laboratorio

| Tema | Estado actual | Dónde |
| --- | --- | --- |
| Usuario del contenedor | No root (appuser1; nginx sin privilegios) | Dockerfile |
| Permisos del CI | contents: read, packages: write | ci.yml |
| Contraseña de la base en CI | Distinta en cada ejecución (run_id) | ci.yml |
| Autenticación de las API | No existe | Controladores |
| Credenciales de laboratorio | arka/arka en texto plano y en el Secret | compose.yaml, k8s/ |
| Endpoint interno de eventos | Accesible en el puerto publicado 8081 | compose.yaml |
| Actuator | health con detalles, metrics y prometheus expuestos | application.properties |
| Grafana | Acceso anónimo como Admin | compose.yaml |

**Texto para decir**

> Empecemos por lo que está bien. Los contenedores no corren como root. El token del job tiene solo los permisos que necesita. La contraseña de la base en CI cambia en cada ejecución.
>
> Ahora lo que hay que tener presente: no hay autenticación en las API. Las credenciales son de laboratorio y están en texto plano. El endpoint interno de eventos queda accesible si alguien llega al puerto 8081. Actuator muestra detalles. Y Grafana entra como administrador anónimo.
>
> Todo esto es aceptable para un laboratorio local. No lo es para publicar.

**Instrucciones (no se dicen):**

- No mostrar valores de credenciales en pantalla, aunque sean de laboratorio.

**Transición:** “¿Qué cerraríamos primero?”

### 48. Antes de exponerlo

**Visible:**

- Autenticación y autorización
- Secretos fuera del repositorio
- Endpoint de eventos solo en red interna
- Actuator y Grafana restringidos
- Escaneo de dependencias e imágenes

**Marcas:** Autenticación y autorización en las API (propuesta) · Secretos gestionados fuera del repositorio (propuesta) · Escaneo de dependencias e imágenes en CI (propuesta)

**Texto para decir**

> Antes de exponer ARKA-Lite: autenticación y autorización en las API; secretos gestionados fuera del repositorio; el endpoint de eventos accesible solo desde la red interna o con credenciales de servicio; Actuator limitado a lo necesario; Grafana con usuarios reales.
>
> Y en CI, escaneo de dependencias e imágenes. Lo bueno es que la UI ya muestra un patrón: su proxy solo expone las rutas de lectura que necesita y no expone el endpoint interno.

**Transición:** “Cerremos con el estado actual y la siguiente mejora.”

## Cierre · presenta Participante 1

### 49. Estado actual

**Visible:**

- Dos servicios con su base y outbox
- Consumo idempotente por eventoId
- Compose, Kubernetes local y CI que publica
- UI de laboratorio con historial de peticiones

**Marcas:** Outbox con reintento e idempotencia del receptor (implementado) · Logs ECS hacia Loki (implementado)

**Texto para decir**

> Hoy ARKA-Lite tiene dos servicios con su propia base. El envío guarda estado y evento juntos, y un relevador entrega después. El receptor ignora eventos repetidos.
>
> Lo ejecutamos con Compose o con Kubernetes local, y el CI verifica y publica imágenes. La UI de laboratorio permite probar las API y ver cada petición.

**Transición:** “También conviene decir claramente lo que no hace.”

### 50. Limitaciones

**Visible:**

- Avisos en memoria
- Crear usa siempre INC-002
- Transición inválida responde 500
- Sin broker, sin Prometheus, sin despliegue automático
- Sin autenticación

**Texto para decir**

> Los textos de aviso se pierden al reiniciar. Crear siempre usa INC-002. Una transición inválida responde 500 en lugar de un error claro. No hay broker, ni servidor Prometheus, ni despliegue automático, ni autenticación.
>
> Ninguna de estas limitaciones es un secreto: son el punto de partida de la siguiente mejora.

**Transición:** “¿Cuál haríamos primero?”

### 51. Siguiente mejora propuesta

**Visible:**

- Guardar el aviso y su id de forma durable y coherente
- Probar reentrega y concurrencia
- Responder 409 en transiciones inválidas
- Definir la garantía antes de prometerla

**Marcas:** Aviso e id consumido en la misma transacción de PostgreSQL (propuesta)

**Texto para decir**

> La prioridad propuesta es conservar el aviso y su id consumido de forma durable y coherente, en la misma base y la misma transacción, y probar qué pasa con reentregas y consumos simultáneos.
>
> En paralelo, responder 409 cuando la transición no corresponde. Y antes de prometer una garantía, definirla y demostrarla.

**Transición:** “Para cerrar, unas preguntas que ya podemos responder.”

### 52. Si mañana falta un aviso…

**Visible:**

- ¿Qué quedó confirmado?
- ¿Dónde se conserva?
- ¿Qué componente actúa después?
- ¿Puede repetirse la entrega?
- ¿Qué evidencia demuestra la recuperación?

**Texto para decir**

> Empezamos con una regla en Java y terminamos investigando una operación distribuida. La arquitectura ubicó responsabilidades, Docker y Kubernetes nos dieron dónde ejecutar, Git y Actions relacionaron cada cambio con su validación, y datos y observabilidad nos dieron evidencia.
>
> Si mañana alguien reporta un aviso ausente, ya tenemos preguntas concretas. Gracias. ¿Preguntas?

**Respaldo:** docs/presentation-data/guion-maestro.md › Cierre general

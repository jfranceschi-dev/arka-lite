# Guion de ARKA-Lite · recorrido ejecutivo

> Archivo generado por `npm run guiones` desde `docs/presentation-data/contenido/`. No editar a mano: los cambios se hacen en la fuente.

Equipo arka-litos · 34 láminas. Todas las partes, cada una con su lámina de aprendizajes, sin código.

## Partes

1. **Fundamentos**: Spring Boot, REST, reglas de negocio, pruebas y Git.
2. **Arquitectura**: Microservicios, puertos y adaptadores, y un contrato por eventos.
3. **Base de datos**: Una base por servicio, un esquema que se cuida solo y datos consistentes.
4. **Contenedores y Kubernetes**: El mismo sistema en cualquier computadora y un clúster que se repara solo.
5. **CI/CD**: Integración y entrega continua: cada cambio se prueba y se empaqueta solo.
6. **Observabilidad**: Logs centralizados, trazas entre servicios y salud de cada componente.
7. **Documentación**: Contratos que salen del código y documentación que cambia con él.
8. **La UI como laboratorio**: No es parte del entregable: es el banco de pruebas para ver cómo se comporta el sistema, sobre todo cuando algo falla.

El reparto no está fijo: cada parte se puede asignar a cualquier persona del equipo. Las notas de cada lámina del PPTX traen el mismo texto.

Cómo leer este guion: **Qué decir** es el texto en voz alta; **Qué hacer** son indicaciones para quien expone; **Para pasar** es la frase que conecta con la lámina siguiente.

## Apertura

### 1. Del endpoint al clúster

**En pantalla:**

- Lo que aprendimos construyendo dos microservicios Java, de punta a punta.

**Qué decir**

> Buenos días. Somos el equipo arka-litos, del curso Upskilling Backend Java, y hoy les presentamos ARKA-Lite, nuestro proyecto final.
>
> Empezamos escribiendo un endpoint y terminamos con un sistema de dos microservicios corriendo en Kubernetes, con su pipeline, su base de datos y su observabilidad. No les vamos a contar el temario: les vamos a contar qué construimos, qué medimos y qué aprendimos.

**Qué hacer** (no se dice)

- Antes de empezar, abrir la UI en http://localhost:8088 y comprobar que los dos servicios aparecen en verde.

**Para pasar:** “Primero, el proyecto en números.”

### 2. ARKA-Lite en números

**En pantalla · Números grandes:**

- 2 microservicios: Spring Boot 4 y Java 26, cada uno con su PostgreSQL.
- 11 endpoints REST: Documentados con OpenAPI y Swagger.
- 67 pruebas automáticas: 28 en solicitudes, 10 en notificaciones, 29 en la UI.
- 8 contenedores: Servicios, bases, UI y logs con un solo comando.
- ≤ 5 s para entregar un aviso: El relevador revisa los pendientes cada 5 segundos.
- 0 avisos perdidos o duplicados: Aunque el otro servicio esté caído o el evento llegue dos veces.

**Ideas clave:**

- Dos microservicios con su propia base
- Un solo comando levanta todo
- Cada cambio pasa por pruebas automáticas

**Qué decir**

> ARKA-Lite hace algo sencillo a propósito: registra solicitudes, como una incidencia o un pedido de cambio, y avisa cuando una solicitud se envía. El problema es pequeño para que el foco esté en cómo se construye, se despliega y se opera.
>
> Son dos microservicios con Spring Boot, once endpoints documentados, sesenta y siete pruebas automáticas y ocho contenedores que se levantan con un solo comando.
>
> Y los dos números que más nos importan: un aviso se entrega en cinco segundos o menos, y no se pierde ni se duplica ninguno, aunque el otro servicio esté caído. Más adelante les mostramos cómo lo logramos.

**Para pasar:** “Antes de entrar, ocho palabras que vamos a usar mucho.”

### 3. Ocho conceptos, en una frase

**En pantalla · Tarjetas:**

- Microservicio: Una aplicación pequeña, con una sola tarea y su propia base de datos.
- API REST: La puerta para pedirle algo a una aplicación por HTTP, como abrir una URL.
- Arquitectura hexagonal: El negocio al centro; la base y la web se conectan por “enchufes”.
- ORM (JPA): Traduce entre clases Java y tablas: escribe el SQL rutinario por nosotros.
- Docker: Empaqueta la aplicación con todo lo que necesita: corre igual en cualquier lado.
- Kubernetes: Administra esos paquetes: los arranca, los vigila y los reinicia si fallan.
- CI/CD: Un robot que compila, prueba y empaqueta cada cambio, sin pasos manuales.
- Observabilidad: Logs y salud de todo el sistema en un solo lugar.

**Ideas clave:**

- Microservicio y API REST
- Arquitectura hexagonal y ORM
- Docker y Kubernetes
- CI/CD y observabilidad

**Qué decir**

> Sabemos que muchos de ustedes trabajan sobre todo con la base de datos y procedimientos almacenados, así que antes de entrar les dejamos ocho conceptos en una frase.
>
> Un microservicio es una aplicación pequeña con una sola tarea y su propia base. Una API REST es la puerta para pedirle cosas por HTTP. La arquitectura hexagonal pone el negocio al centro y conecta la base y la web como si fueran enchufes. Y un ORM traduce entre clases Java y tablas, para no escribir a mano el SQL de todos los días.
>
> Docker empaqueta la aplicación con todo lo que necesita; Kubernetes administra esos paquetes. CI/CD es un robot que prueba cada cambio. Y observabilidad es poder ver qué pasa adentro. Cada uno lo vamos a ver con un ejemplo.

**Si preguntan:** ¿Esto reemplaza a los procedimientos almacenados?

**Respuesta corta:** No necesariamente. Mueve las reglas del negocio al código; el SQL pesado o los reportes pueden seguir en la base.

**Para pasar:** “Este es el recorrido.”

### 4. Qué vamos a ver

**En pantalla · La ruta de las partes:**

- 1. Fundamentos: Spring Boot, REST, reglas de negocio, pruebas y Git.
- 2. Arquitectura: Microservicios, puertos y adaptadores, y un contrato por eventos.
- 3. Base de datos: Una base por servicio, un esquema que se cuida solo y datos consistentes.
- 4. Contenedores y Kubernetes: El mismo sistema en cualquier computadora y un clúster que se repara solo.
- 5. CI/CD: Integración y entrega continua: cada cambio se prueba y se empaqueta solo.
- 6. Observabilidad: Logs centralizados, trazas entre servicios y salud de cada componente.
- 7. Documentación: Contratos que salen del código y documentación que cambia con él.
- 8. La UI como laboratorio: No es parte del entregable: es el banco de pruebas para ver cómo se comporta el sistema, sobre todo cuando algo falla.

**Ideas clave:**

- Fundamentos y arquitectura
- Base de datos
- Contenedores, CI/CD y observabilidad
- Documentación, la UI y el valor

**Qué decir**

> Vamos en ocho partes, en el orden en que se construye un sistema: fundamentos, arquitectura, base de datos, contenedores y Kubernetes, integración y entrega continua, observabilidad y documentación.
>
> Después les mostramos la interfaz que usamos como laboratorio, sobre todo para ver qué pasa cuando algo falla. Y cerramos con el valor que esto deja.
>
> Cada parte termina con una lámina de aprendizajes: qué aprendimos, cómo lo aplicamos y qué valor tiene para un equipo de tecnología.

**Para pasar:** “Empecemos por los fundamentos.”

## 1 · Fundamentos

### 5. Una API que responde siempre igual

**En pantalla · Números grandes:**

- 201 Creada: La solicitud quedó en BORRADOR.
- 400 Faltan datos: El identificador o el tipo vienen vacíos.
- 404 No existe: No hay una solicitud con ese identificador.
- 409 Conflicto: El id ya existe o el cambio de estado no se permite.

**Ideas clave:**

- Método + ruta = una operación
- La regla está en el dominio, sin Spring
- Un manejador global convierte errores en respuestas
- Siempre la misma forma: estado y mensaje

**Por qué importa:** Quien consume la API sabe qué pasó sin adivinar, y la UI le muestra a la persona un mensaje claro.

**Qué decir**

> Un endpoint REST es método más ruta: POST a /solicitudes crea, GET lista. El controlador solo traduce; quien decide es el dominio, que son clases Java normales, sin Spring. Por ejemplo, una solicitud solo se puede enviar si está en borrador.
>
> Si la regla no se cumple, el dominio lanza una excepción, y un único manejador global la convierte en una respuesta HTTP. Así cada error tiene su código: 400 si faltan datos, 404 si no existe, 409 si hay un conflicto. Siempre con la misma forma: estado y mensaje.
>
> Para el staff esto significa una API predecible: quien la consume sabe qué pasó sin leer el código.

**Qué hacer** (no se dice)

- Mostrar: En la UI, crear dos veces el mismo identificador. Debe verse: El diálogo “Ese identificador ya existe” con el código 409.

**Para pasar:** “¿Y cómo sabemos que las reglas siguen funcionando después de cada cambio?”

**Para leer más:** `docs/inicio/proyecto.md`

### 6. Fundamentos: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 67 pruebas en cada cambio
- Métrica: 0 bases de datos para probar
- El negocio no depende del framework: Las reglas son clases Java sin Spring, inyectadas por constructor. Valor: Se prueban en milisegundos y sobreviven a un cambio de framework.
- Los errores son parte del contrato: Un manejador global responde 400, 404 y 409 con la misma forma. Valor: Menos soporte: quien consume la API entiende qué pasó.
- Todo entra por Pull Request: Ramas cortas, commits con sentido y una aprobación. Valor: Historial legible y ningún cambio sin revisar.

**Ideas clave:**

- El negocio no depende del framework
- Los errores son parte del contrato
- Probar es barato si el diseño lo permite

**Qué decir**

> Tres aprendizajes de esta parte. Primero: el negocio no debe depender del framework. Mantener las reglas en clases Java simples nos permitió probarlas rápido y pensar en el negocio, no en las anotaciones.
>
> Segundo: los errores son parte del contrato. Un buen 409 con un mensaje claro ahorra muchas horas de soporte.
>
> Y tercero: trabajar con ramas cortas y Pull Requests con aprobación nos dio un historial que cualquiera puede leer.

**Para pasar:** “Con esas bases, veamos cómo está armado el sistema completo.”

**Para leer más:** `docs/desarrollo/flujo-de-trabajo.md`

## 2 · Arquitectura

### 7. El sistema de un vistazo

**En pantalla · Capas del sistema:**

- Experiencia: Persona: Usa el navegador; arka-lite-ui: React + nginx · proxy /api
- Servicios: servicio-solicitudes: El trámite y sus estados; Evento SolicitudEnviada: Por HTTP, con su eventoId; servicio-notificaciones: Los avisos, sin duplicados
- Datos: db-solicitudes: PostgreSQL 17 · solicitud y evento; db-notificaciones: PostgreSQL 17 · evento_procesado
- Plataforma: Compose o Kubernetes: Dónde corre; GitHub Actions: Prueba y publica; Loki y Grafana: Logs en un solo lugar

**Ideas clave:**

- La UI es la puerta de entrada
- Dos servicios, cada uno dueño de su base
- Se hablan con un evento por HTTP
- La plataforma corre, entrega y observa

**Qué decir**

> Este es el sistema por capas. Arriba, la experiencia: la persona usa la interfaz, y la interfaz no guarda nada, solo llama a los servicios por un proxy.
>
> En el medio, los dos microservicios. Solicitudes lleva el trámite; notificaciones crea los avisos. No comparten base: cada uno es dueño de sus datos, y se comunican con un evento por HTTP.
>
> Y abajo, la plataforma que lo sostiene: dónde corre, cómo se prueba y publica cada cambio, y dónde vemos los logs. Cada capa tiene una sola responsabilidad, y por eso cada una se puede cambiar sin romper las otras.

**Si preguntan:** ¿Por qué no comparten una sola base de datos?

**Respuesta corta:** Para que cada servicio sea dueño de sus datos y pueda cambiar sin romper al otro.

**Para pasar:** “Ahora entremos a uno de los servicios.”

**Para leer más:** `docs/inicio/proyecto.md`

### 8. Por dentro: puertos y adaptadores

**En pantalla · Puertos y adaptadores:**

- Centro: Dominio: Solicitud · ServicioDeSolicitudes
- Puertos: RepositorioDeSolicitudes, RegistradorDeEventosSalientes, PublicadorDeEventos
- Entrada: SolicitudController: REST · Swagger; Manejador global: Errores → HTTP
- Salida: RepositorioJpa: @Primary · PostgreSQL; Bandeja de salida: Tabla evento; PublicadorConReintento: @Primary · HTTP; RepositorioEnMemoria: Para las pruebas

**Ideas clave:**

- Entrada: traduce HTTP al dominio
- Dominio: las reglas, sin Spring
- Puertos: contratos que el dominio necesita
- Salida: PostgreSQL y HTTP, intercambiables

**Comparación:** Como un enchufe: el aparato no sabe de qué planta viene la electricidad, solo que el enchufe cumple la norma.

**Qué decir**

> ¿Qué quiere decir hexagonal? El nombre viene del dibujo: un hexágono con el negocio al centro y cada lado como un enchufe hacia afuera. También se le llama puertos y adaptadores. El dominio no llama a la base: pide lo que necesita a través de puertos, que son interfaces.
>
> Para quien trabaja con procedimientos almacenados es una idea conocida: la aplicación llama a un procedimiento por su nombre y sus parámetros, sin saber cómo está escrito por dentro. Aquí es al revés: el negocio declara qué necesita, y la tecnología se enchufa a ese contrato.
>
> A la izquierda están los adaptadores de entrada, como el controlador REST. A la derecha, los de salida: el que guarda en PostgreSQL, el que anota el evento pendiente y el que lo publica con reintentos.
>
> Fíjense en el de abajo: un repositorio en memoria que cumple el mismo puerto. Lo usan las pruebas, y Spring elige el de producción con @Primary. Por eso cambiar la base o el mecanismo de entrega no obliga a tocar las reglas del negocio.

**Si preguntan:** ¿Esto no es más código que una aplicación en capas tradicional?

**Respuesta corta:** Un poco más de interfaces, a cambio de probar sin base y cambiar adaptadores sin tocar reglas.

**Para pasar:** “¿Y por qué dos servicios y no uno solo?”

**Para leer más:** `docs/arquitectura/componentes-java.md`

### 9. Arquitectura: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 3 puertos en solicitudes
- Métrica: 2 adaptadores por puerto
- Los puertos separan negocio y tecnología: Varios adaptadores por puerto; Spring usa el @Primary. Valor: Cambiar la base o la mensajería sin reescribir reglas.
- Separar servicios tiene un costo: Red, bases propias y fallos parciales. Valor: Separar solo cuando el negocio o los equipos lo justifican.
- El contrato es lo único compartido: SolicitudEnviada vive en los dos servicios y cambia junto. Valor: Equipos independientes con un acuerdo explícito.

**Ideas clave:**

- Los puertos separan negocio y tecnología
- Separar servicios tiene un costo
- El contrato entre servicios se versiona con cuidado

**Qué decir**

> Primero: los puertos separan el negocio de la tecnología. Hoy usamos PostgreSQL y HTTP, pero cambiar a otra base o a un sistema de mensajería no obligaría a reescribir las reglas.
>
> Segundo: separar servicios tiene un costo real. Lo vale cuando el negocio o los equipos lo piden, no antes.
>
> Y tercero: entre dos servicios, lo único compartido debe ser el contrato. Si cambia, cambia en los dos lados, de forma coordinada.

**Para pasar:** “El costo más interesante de separar está en los datos. Vamos a la base de datos.”

## 3 · Base de datos

### 10. Del procedimiento almacenado al ORM

**En pantalla · Dos maneras, lado a lado:**

- Con procedimientos almacenados: La regla vive en la base: EXEC sp_enviar; Cambiar una regla es cambiar la base; Para probar hace falta la base con datos; Atado a un motor: T-SQL o PL/SQL
- Con un ORM: JPA + Hibernate: La regla vive en Java, en el dominio; Hibernate genera el SQL de guardar y buscar; Las reglas se prueban sin base, en milisegundos; Cambiar de motor no toca las reglas

**Ideas clave:**

- Con SP, la regla vive en la base
- Con ORM, la regla vive en el código
- Hibernate escribe el INSERT, UPDATE y SELECT
- No es todo o nada: el SQL pesado puede seguir en la base

**Por qué importa:** No es todo o nada: las reglas van al código y los reportes o consultas pesadas pueden seguir en SQL.

**Qué decir**

> Muchos de ustedes trabajan con procedimientos almacenados: la regla del negocio vive en la base, y la aplicación solo hace EXEC con parámetros. Funciona, pero cambiar una regla es cambiar la base, y probarla exige una base con datos.
>
> En ARKA-Lite usamos un ORM, que significa mapeo objeto-relacional. En Java el estándar se llama JPA y la herramienta que lo hace es Hibernate. Una clase Java se marca como entidad y queda asociada a una tabla: cada campo es una columna. Cuando guardamos o buscamos, Hibernate escribe el INSERT, el UPDATE o el SELECT por nosotros.
>
> Ojo: no es todo o nada. Las reglas del negocio pasan al código, donde se prueban en milisegundos, y lo que de verdad es trabajo de base de datos, como reportes pesados, puede seguir en SQL.

**Si preguntan:** ¿Y el rendimiento? ¿El SQL que genera Hibernate es bueno?

**Respuesta corta:** Para guardar y buscar por llave, sí. Para consultas complejas se puede escribir SQL propio; además, los índices y constraints siguen siendo trabajo de la base.

**Para pasar:** “¿Y cómo llega, paso a paso, una línea de Java hasta PostgreSQL?”

**Para leer más:** `docs/arquitectura/datos-y-consistencia.md`

### 11. Cómo el código llega a la base

**En pantalla · Flujo paso a paso:**

- 1. Dominio: Pide guardar la solicitud, sin SQL.
- 2. Spring Data: save() y findById(), sin escribir SQL.
- 3. Hibernate: Objeto → INSERT o UPDATE.
- 4. JDBC + pool: Reutiliza conexiones con usuario y clave.
- 5. PostgreSQL: Ejecuta y confirma la transacción.

**Ideas clave:**

- El dominio pide guardar, sin SQL
- Spring Data ofrece save y findById
- Hibernate convierte el objeto en SQL
- JDBC y un pool de conexiones hablan con PostgreSQL

**Comparación:** Como un traductor: el código habla Java, la base habla SQL, y el ORM traduce en los dos sentidos.

**Qué decir**

> Sigamos una línea de código. El dominio dice: guardar esta solicitud. No sabe nada de SQL. Spring Data nos da métodos listos, como save o findById, sin escribir una sola consulta.
>
> Por debajo, Hibernate convierte el objeto en un INSERT o un UPDATE. Y el driver JDBC, con un pool de conexiones que las reutiliza, como el que ya conocen de cualquier aplicación, se lo manda a PostgreSQL, que ejecuta y confirma la transacción.
>
> La dirección de la base, el usuario y la clave no están en el código: llegan por variables de entorno. Eso lo vamos a ver con Docker.

**Para pasar:** “Ahora veamos qué tablas tiene cada servicio.”

### 12. Una base por servicio

**En pantalla · Bases de datos y sus tablas:**

- db-solicitudes (PostgreSQL 17 · schema.sql): solicitud [id · PK, tipo, estado · CHECK (4 estados)]; evento [solicitud_id · FK, evento_id · UUID, procesado · false = pendiente]
- db-notificaciones (PostgreSQL 17 · Hibernate): evento_procesado [evento_id · PK, un registro por evento recibido]
- Entre bases: evento_id por HTTP

**Ideas clave:**

- PostgreSQL 17 en cada servicio
- solicitud y evento viven juntas
- evento_procesado recuerda lo recibido
- Ninguna llave foránea cruza bases

**Por qué importa:** Cada servicio cambia su esquema sin coordinarse con el otro; solo el contrato del evento es compartido.

**Qué decir**

> Cada servicio tiene su propia base PostgreSQL. En la de solicitudes hay dos tablas: la solicitud, con un CHECK que solo admite los cuatro estados válidos, y la tabla evento, que funciona como bandeja de salida: cada fila es un aviso pendiente de entregar.
>
> En la de notificaciones hay una sola tabla importante: evento_procesado, la lista de eventos que ya recibió.
>
> Fíjense en la flecha: no hay llaves foráneas entre bases. Lo único que viaja de un lado al otro es el evento_id. Esa es la frontera entre los dos servicios.

**Si preguntan:** ¿Por qué no un JOIN entre las dos bases?

**Respuesta corta:** Porque cada servicio es dueño de sus datos; un JOIN entre bases los volvería a acoplar.

**Para pasar:** “Ahora, el problema más interesante: ¿qué pasa si guardo y el otro servicio está caído?”

**Para leer más:** `docs/arquitectura/datos-y-consistencia.md`

### 13. Guardar primero, avisar después

**En pantalla · Flujo paso a paso:**

- 1. Enviar: Solicitud ENVIADA + evento pendiente, en una transacción.
- 2. Bandeja de salida: El evento espera en la tabla evento.
- 3. Relevador: Cada 5 s entrega los pendientes, hasta 3 intentos.
- 4. Notificaciones: Lo recibe y el evento queda procesado.
- Si si falla en el paso 3: Sigue pendiente: Mismo eventoId; se reintenta en el siguiente ciclo.

**Ideas clave:**

- Solicitud ENVIADA y evento pendiente, juntos
- Si una falla, no se guarda ninguna
- El relevador entrega cada 5 s, con 3 intentos
- Si falla, sigue pendiente con el mismo eventoId

**Comparación:** Como dejar una carta en la bandeja de salida: aunque el mensajero no pase hoy, la carta no se pierde.

**Por qué importa:** Si notificaciones está caído, ningún aviso se pierde: queda pendiente hasta que vuelve.

**Qué decir**

> Este es el problema de la consistencia. Si al enviar una solicitud llamáramos directamente a notificaciones y justo estuviera caído, la solicitud quedaría enviada y nadie se enteraría.
>
> La solución se llama patrón outbox, o bandeja de salida. Al enviar, guardamos la solicitud y un evento pendiente en la misma transacción: o se guardan las dos cosas, o ninguna. La respuesta le llega a la persona enseguida.
>
> Después, un relevador revisa la bandeja cada cinco segundos y entrega los pendientes, con hasta tres intentos. Si aun así falla, el evento sigue pendiente, con el mismo número, para el siguiente ciclo.

**Si preguntan:** ¿Que el envío responda bien significa que el aviso ya existe?

**Respuesta corta:** No. Significa que la solicitud y el evento quedaron guardados; el aviso llega después.

**Para pasar:** “Si se reintenta, ¿no puede llegar el aviso dos veces?”

**Para leer más:** `docs/arquitectura/flujo-y-referencias.md`

### 14. El mismo evento, un solo aviso

**En pantalla · Flujo paso a paso:**

- 1. Llega el evento: Trae su eventoId.
- 2. ¿Ya lo recibimos?: Se busca en evento_procesado.
- 3. Crear el aviso: Solo si el número es nuevo.
- 4. Anotar el número: En la misma transacción.
- Si ya estaba en el paso 2: Ignorarlo: No se crea otro aviso. Duplicados: cero.

**Ideas clave:**

- Cada evento trae un número que no cambia
- Notificaciones anota los números recibidos
- Si llega uno repetido, lo ignora
- Se comprueba con el botón Reentregar

**Comparación:** Como un portero con lista de invitados: si alguien ya entró, no lo vuelve a anotar.

**Qué decir**

> Sí, puede llegar dos veces. Si notificaciones recibió el evento pero su respuesta se perdió, el relevador cree que falló y lo vuelve a mandar.
>
> Para eso está la idempotencia: repetir la misma operación no multiplica su efecto. Notificaciones funciona como un portero con lista: anota el número de cada evento, y si llega uno que ya está en la lista, lo ignora.
>
> El outbox evita perder avisos; la idempotencia evita duplicarlos. Juntos dan lo que en la industria se llama entrega al menos una vez con efecto exactamente una vez.

**Qué hacer** (no se dice)

- Mostrar: En la UI, pestaña Enviadas: Reentregar un evento ya consumido. Debe verse: El diálogo “El aviso no se duplicó” y Avisos duplicados en 0.

**Si preguntan:** ¿Qué resuelve el outbox y qué resuelve la idempotencia?

**Respuesta corta:** El outbox evita perder el evento; la idempotencia evita duplicar su efecto.

**Para pasar:** “Esto es lo que aprendimos de la base de datos.”

### 15. Base de datos: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 0 avisos perdidos
- Métrica: 0 avisos duplicados
- El ORM no elimina el trabajo de base de datos: Hibernate escribe el SQL rutinario; índices, CHECK y transacciones siguen siendo diseño de BD. Valor: Reglas que se prueban en código y una base que se cuida sola.
- Guardar primero, avisar después: Solicitud y evento en una transacción local; el relevador entrega después. Valor: Un servicio caído no hace perder información.
- Todo reintento necesita idempotencia: Un eventoId fijo y una tabla de eventos ya procesados. Valor: Se puede reintentar sin miedo a duplicar efectos.
- El esquema también es código: schema.sql idempotente, CHECK, índice parcial y validación al arrancar. Valor: Despliegues repetibles y errores visibles al inicio.

**Ideas clave:**

- La transacción local es la herramienta más confiable
- Reintentar exige idempotencia
- El esquema también es código

**Qué decir**

> Cuatro aprendizajes de datos. El primero, para quienes vienen de los procedimientos almacenados: el ORM no elimina el trabajo de base de datos. Escribe el SQL rutinario, pero los índices, los CHECK y las transacciones siguen siendo diseño de base.
>
> Segundo: la transacción local es la herramienta más confiable que tenemos. En lugar de coordinar dos servicios al mismo tiempo, guardamos todo en nuestra base y avisamos después.
>
> Tercero: cualquier reintento necesita idempotencia del otro lado. Si no, los reintentos que nos protegen de perder datos nos terminan duplicando datos.
>
> Y cuarto: el esquema también es código. Versionado, idempotente y validado al arrancar.

**Para pasar:** “Los datos están cuidados. Ahora, ¿cómo llevamos todo esto a cualquier ambiente?”

## 4 · Contenedores y Kubernetes

### 16. ¿Qué es Docker y qué es Kubernetes?

**En pantalla · Dos maneras, lado a lado:**

- Docker: la caja: Empaqueta la app con Java y todo lo que usa; Imagen: un paquete que no cambia; Corre igual en una laptop y en un servidor; Compose levanta varias cajas juntas
- Kubernetes: el administrador: Decide dónde corre cada caja; Si una se cae, levanta otra; Le da a cada servicio un nombre fijo; Puede correr más copias si hay carga

**Ideas clave:**

- Docker: la caja con la app y todo lo que necesita
- Imagen: el paquete; contenedor: el paquete corriendo
- Kubernetes: arranca, vigila y reinicia las cajas
- Compose hace lo mismo en una sola computadora

**Comparación:** Como el transporte de carga: Docker es el contenedor estándar y Kubernetes, el puerto que los acomoda, los vigila y reemplaza el que se daña.

**Qué decir**

> Dos palabras que se escuchan mucho. Docker resuelve el clásico “en mi máquina funciona”: empaqueta la aplicación con Java y todo lo que necesita en una imagen, un paquete que no cambia. Cuando esa imagen corre, se llama contenedor, y corre igual en una laptop o en un servidor.
>
> Kubernetes es el siguiente nivel: no empaqueta, administra. Decide dónde corre cada contenedor, lo vigila, y si uno se cae, levanta otro. Piénsenlo como un puerto de carga: Docker es el contenedor estándar y Kubernetes es el puerto que los acomoda y reemplaza el que se daña.
>
> En una sola computadora usamos Docker Compose; en un clúster, Kubernetes. La misma imagen sirve en los dos.

**Si preguntan:** ¿Docker es una máquina virtual?

**Respuesta corta:** No. Es más liviano: comparte el sistema operativo y solo aísla la aplicación y lo que necesita.

**Para pasar:** “Veamos el sistema completo levantado con Docker.”

### 17. Todo el sistema con un comando

**En pantalla · Tarjetas:**

- Comando: docker compose up --build -d
- arka-lite-ui: :8088 · la interfaz y su proxy
- servicio-solicitudes: :8080 · el trámite
- servicio-notificaciones: :8081 · los avisos
- db-solicitudes: PostgreSQL 17 · solo red interna
- db-notificaciones: PostgreSQL 17 · :5433
- promtail: recoge los logs
- loki: :3100 · guarda los logs
- grafana: :3000 · busca en los logs

**Ideas clave:**

- Servicios, bases, UI y logs en un archivo
- Cada servicio se llama por su nombre
- La configuración entra por variables
- La misma imagen sirve en Compose y en Kubernetes

**Qué decir**

> ¿Cuántas veces hemos escuchado “en mi máquina funciona”? Con Docker, cada servicio viaja con su receta, y con Compose levantamos el sistema completo con un solo comando: los dos servicios, sus bases, la interfaz y las herramientas de logs.
>
> Dentro de la red de Compose, cada servicio encuentra al otro por su nombre, no por localhost. Y la configuración entra por variables de entorno, así que la misma imagen sirve en nuestra computadora y en el clúster, sin recompilar.
>
> Para un equipo nuevo, esto es la diferencia entre un día configurando y cinco minutos.

**Qué hacer** (no se dice)

- Mostrar: docker compose ps Debe verse: La UI, los servicios y las bases arriba y sanos.

**Si preguntan:** Dentro de un contenedor, ¿a dónde lleva localhost?

**Respuesta corta:** Al mismo contenedor, no a otro servicio. Por eso usamos el nombre del servicio.

**Para pasar:** “En nuestra computadora usamos Compose. En un clúster, Kubernetes.”

### 18. Cuando un Pod se cae

**En pantalla · Qué pasa cuando falla:**

- Falla: Se cae el Pod de solicitudes: Un error, un nodo reiniciado o un kubectl delete.
- 1. [0 s] Detecta: Falta 1 de 1 copias.
- 2. [+1 s] Recrea: Un Pod nuevo con la misma imagen.
- 3. [+segundos] Espera: initContainers: base y notificaciones.
- 4. [Ready] Listo: La readinessProbe responde.
- Resultado: Sin intervención manual: Los eventos pendientes siguen en la base y se entregan.

**Ideas clave:**

- El Deployment detecta que falta una copia
- Crea un Pod nuevo
- Espera a la base y a su salud
- Vuelve a recibir tráfico, sin intervención

**Qué decir**

> Kubernetes funciona como un termostato: no le decimos qué hacer paso a paso, le decimos el estado que queremos, por ejemplo una copia de cada servicio, y él lo mantiene.
>
> Si el Pod de solicitudes se cae, el Deployment detecta que falta una copia y crea otro con la misma imagen. El Pod nuevo espera a que su base y notificaciones respondan, y solo cuando su prueba de salud contesta, el Service le vuelve a mandar tráfico.
>
> Y como los eventos pendientes están en la base, no en memoria, nada se pierde mientras tanto. Nadie tuvo que despertarse a las tres de la mañana.

**Qué hacer** (no se dice)

- Mostrar: kubectl delete pod -l app=servicio-solicitudes y luego kubectl get pods -w. Debe verse: Aparece un Pod nuevo que vuelve a estar Ready.

**Si preguntan:** ¿Y si se cae la base?

**Respuesta corta:** Su Pod también se recrea y los datos siguen en el disco persistente; los servicios esperan a que vuelva.

**Para pasar:** “Esto es lo que aprendimos de la plataforma.”

### 19. Contenedores y Kubernetes: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 1 comando para levantar todo
- Métrica: 5 manifiestos en k8s/
- La imagen es el entregable: Dos etapas, solo Java y el JAR, usuario sin privilegios. Valor: Lo que se prueba es exactamente lo que se despliega.
- Configurar por variables: La misma imagen en Compose y en Kubernetes. Valor: Un solo artefacto para todos los ambientes.
- Declarar el estado deseado: Deployments, initContainers y readinessProbe. Valor: El clúster se repara solo y no recibe tráfico antes de tiempo.

**Ideas clave:**

- La imagen es el entregable
- Configurar por variables, no por código
- Declarar el estado y dejar que se mantenga

**Qué decir**

> Primero: la imagen es el entregable. Lo que se prueba es exactamente lo que se despliega.
>
> Segundo: configurar por variables de entorno y no por código. Así hay un solo artefacto para todos los ambientes.
>
> Y tercero: con Kubernetes declaramos el estado que queremos y el clúster lo mantiene. Arrancar no es lo mismo que estar listo, y eso hay que decírselo explícitamente.

**Para pasar:** “¿Y quién construye y prueba esas imágenes? Nadie a mano: el pipeline.”

## 5 · CI/CD

### 20. Cada cambio se prueba solo

**En pantalla · Las etapas del pipeline:**

- 1. Push o PR: Alguien sube un cambio.
- 2. Compilar: Java 26 y Maven, un job por servicio.
- 3. Probar: mvn verify con PostgreSQL de servicio.
- 4. Arrancar: Levanta el JAR y espera ver CAM-002.
- 5. Imagen: Se construye con Docker.
- 6. Publicar: En GHCR, con el SHA del commit.

**Ideas clave:**

- Cada push o Pull Request dispara el pipeline
- Compila y prueba cada servicio con su base
- Comprueba que el servicio realmente arranca
- Publica la imagen con el SHA del commit

**Por qué importa:** Un cambio roto se detecta en minutos, antes de llegar a los demás.

**Qué decir**

> Con GitHub Actions, cada vez que alguien sube un cambio o abre un Pull Request, se dispara el pipeline. Por cada servicio prepara Java y una base PostgreSQL, compila y corre todas las pruebas.
>
> Luego hace algo que muchos pipelines no hacen: arranca el servicio de verdad y espera a ver los datos iniciales. Así detectamos errores de configuración que las pruebas unitarias no ven.
>
> Si todo pasa, construye la imagen y la publica etiquetada con el código del commit. Cada imagen se puede rastrear hasta el cambio exacto que la produjo.

**Si preguntan:** ¿Publicar la imagen la despliega en Kubernetes?

**Respuesta corta:** No. Hoy desplegar es un paso aparte; es el siguiente paso natural.

**Para pasar:** “El pipeline funciona porque todo entra por el mismo camino.”

**Para leer más:** `docs/automatizacion/ci-yaml-paso-a-paso.md`

### 21. CI/CD: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 2 jobs en paralelo, uno por servicio
- Métrica: 1 imagen por commit
- Probar que arranca, no solo que compila: El pipeline levanta el JAR y consulta GET /solicitudes. Valor: Los errores de configuración aparecen antes de desplegar.
- Cada imagen se rastrea a su commit: Etiqueta con el SHA en GHCR. Valor: Saber qué código corre y volver atrás con certeza.
- El pipeline es la puerta: Pull Request, una aprobación y todo en verde. Valor: La calidad no depende de la memoria de nadie.

**Ideas clave:**

- Probar que arranca, no solo que compila
- Cada imagen se rastrea a su commit
- El pipeline es la puerta de entrada

**Qué decir**

> Primero: hay que probar que el servicio arranca, no solo que compila. Muchos errores de configuración solo aparecen al arrancar.
>
> Segundo: cada imagen se etiqueta con su commit. Eso nos dice exactamente qué código está corriendo y nos permite volver atrás con certeza.
>
> Y tercero: el pipeline es la puerta de entrada. La calidad no depende de que alguien se acuerde de correr las pruebas.

**Para pasar:** “Ya está desplegado. ¿Cómo sabemos qué pasa adentro?”

## 6 · Observabilidad

### 22. Todos los logs, en un solo lugar

**En pantalla · Flujo paso a paso:**

- 1. Servicios: Logs JSON con traceId y eventoId.
- 2. Promtail: Los recoge de cada contenedor.
- 3. Loki: Los guarda, etiquetados por servicio.
- 4. Grafana: Una búsqueda para todo el sistema.

**Ideas clave:**

- Cada servicio escribe sus logs en JSON (ECS)
- Promtail los recoge de todos los contenedores
- Loki los guarda por servicio
- Grafana los busca por traceId o eventoId

**Comparación:** Como la caja negra de un avión: registra lo que pasó, para revisarlo después.

**Qué decir**

> Con dos servicios, cada uno tiene sus propios logs. Si algo falla, no queremos entrar contenedor por contenedor a buscar.
>
> Cada servicio escribe sus logs en JSON, con un formato estándar. Promtail los recoge de todos los contenedores, Loki los guarda etiquetados por servicio y Grafana nos deja buscarlos en un solo lugar.
>
> Las llamadas entre servicios llevan el traceId, así que con una sola búsqueda vemos el viaje de un evento: cuándo lo publicó el relevador y cuándo lo consumió notificaciones.

**Qué hacer** (no se dice)

- Mostrar: Grafana › Explore › Loki: {service="servicio-notificaciones"} |= "evento". Debe verse: Las líneas “Consume evento” y “aviso creado” con el número del evento.

**Para pasar:** “Los logs cuentan qué pasó. La salud dice cómo estamos ahora.”

**Para leer más:** `docs/operaciones/observabilidad.md`

### 23. Salud de cada servicio

**En pantalla · Capturas reales:**

- Captura de La pestaña Salud de la UI (localhost:8088/#/salud)

**Ideas clave:**

- Actuator expone health, info y métricas
- La salud revisa la conexión con la base
- Kubernetes y la UI la consultan
- UP no garantiza que todos los avisos llegaron

**Qué decir**

> Cada servicio expone su salud con Spring Boot Actuator: por dentro revisa, por ejemplo, que pueda hablar con su base. La interfaz la muestra en la pestaña Salud.
>
> Pero ojo: que un servicio diga UP solo significa que responde. No garantiza que todos los avisos llegaron. Para eso miramos los eventos pendientes y los logs.
>
> Las métricas ya se exponen en formato Prometheus; guardarlas en el tiempo y ponerles alertas es el siguiente paso.

**Si preguntan:** Si todo está UP y falta un aviso, ¿qué miramos?

**Respuesta corta:** Si el evento sigue pendiente en Enviadas, y los logs del relevador y de notificaciones.

**Para pasar:** “Esto es lo que aprendimos de la observabilidad.”

### 24. Observabilidad: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 1 lugar para buscar todos los logs
- Métrica: 8 contenedores observados
- Logs estructurados desde el día uno: JSON con formato ECS, sin cambiar el código de negocio. Valor: Buscar por campo en lugar de leer texto.
- Un identificador que cruce servicios: traceId propagado por el RestClient y eventoId en cada log. Valor: Diagnosticar un fallo entre servicios en minutos.
- Salud no es lo mismo que correcto: UP dice que responde; los pendientes dicen si entrega. Valor: Medir el resultado del negocio, no solo el proceso.

**Ideas clave:**

- Logs estructurados desde el día uno
- Un identificador que cruce servicios
- Salud no es lo mismo que correcto

**Qué decir**

> Primero: los logs estructurados se configuran desde el día uno. Después es mucho más caro.
>
> Segundo: en un sistema distribuido hace falta un identificador que cruce los servicios. Sin el traceId o el eventoId, diagnosticar es adivinar.
>
> Y tercero: salud no es lo mismo que correcto. Un servicio puede estar UP y tener avisos pendientes; hay que medir el resultado, no solo el proceso.

**Para pasar:** “Todo esto también tiene que estar documentado.”

## 7 · Documentación

### 25. Contratos vivos con Swagger

**En pantalla · Capturas reales:**

- Captura de Swagger de solicitudes (localhost:8080/swagger-ui/index.html)

**Ideas clave:**

- Cada servicio publica su contrato OpenAPI
- Swagger UI lo muestra y permite probarlo
- Un endpoint nuevo aparece solo
- La UI enlaza los dos Swagger

**Comparación:** Como el menú de un restaurante: dice qué hay, qué lleva cada plato y qué te van a traer.

**Qué decir**

> Un contrato de API es como el menú de un restaurante: dice qué se puede pedir, qué lleva cada pedido y qué te van a devolver.
>
> Cada servicio publica su contrato con el estándar OpenAPI, usando springdoc, y Swagger lo muestra como una página donde se puede ver cada endpoint, sus códigos de respuesta y probarlo en vivo.
>
> Lo importante para el staff: se genera desde el código. Cuando agregamos un endpoint, aparece solo, y nunca queda desactualizado. Un equipo que consume la API no tiene que pedirnos un documento.

**Qué hacer** (no se dice)

- Mostrar: En la UI, pestaña Salud › Swagger · solicitudes, y ejecutar GET /solicitudes. Debe verse: La lista en JSON con código 200.

**Para pasar:** “Y lo que no sale del código, lo documentamos junto al código.”

### 26. Documentación: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 11 endpoints documentados solos
- Métrica: 2 Swagger, uno por servicio
- Lo que se genera no se desactualiza: OpenAPI sale de los controladores con springdoc. Valor: Cero horas manteniendo un documento de API aparte.
- La doc se revisa en el mismo PR: El cambio y su explicación llegan juntos. Valor: Quien revisa entiende el porqué, no solo el qué.
- Documentar para quien llega mañana: Guías en PowerShell, diagramas y la Ayuda de la UI. Valor: Menos tiempo para que alguien nuevo aporte.

**Ideas clave:**

- Lo que se genera no se desactualiza
- La doc se revisa en el mismo PR
- Documentar para quien llega mañana

**Qué decir**

> Primero: lo que se genera desde el código no se desactualiza. Es la mejor documentación de API que existe.
>
> Segundo: la documentación se revisa en el mismo Pull Request que el cambio.
>
> Y tercero: documentamos para la persona que llega mañana al equipo. Ese es el verdadero usuario de la documentación.

**Para pasar:** “Para ver todo esto funcionando, construimos una interfaz.”

## 8 · La UI como laboratorio

### 27. Una UI para ver el sistema por dentro

**En pantalla · Capturas reales:**

- Captura de Solicitudes (localhost:8088/#/solicitudes): Crear, enviar y decidir.
- Captura de Enviadas (localhost:8088/#/enviadas): Pendientes, entregados y Reentregar.
- Captura de Salud (localhost:8088/#/salud): UP o DOWN, Swagger y Grafana.
- Captura de Ayuda (localhost:8088/#/ayuda): Diagramas paso a paso.

**Ideas clave:**

- Solicitudes: crear, enviar, aprobar o rechazar
- Enviadas: eventos pendientes, entregados y Reentregar
- Salud: los dos servicios, Swagger y Grafana
- Ayuda: diagramas de cómo funciona

**Por qué importa:** Hace visible lo invisible: la bandeja de salida, los reintentos y la idempotencia.

**Qué decir**

> Una aclaración importante: esta interfaz no es parte del entregable. Los entregables son los dos microservicios y su plataforma. La interfaz la agregamos como laboratorio, para que cualquiera pueda ver lo que normalmente es invisible.
>
> En Solicitudes se crean y se envían. En Enviadas se ve la bandeja de salida: qué eventos están pendientes, cuáles se entregaron, y un botón para reentregar a propósito. En Salud, si cada servicio está UP o DOWN. Y en Ayuda, diagramas de cómo funciona.
>
> Donde más vale es cuando algo falla. Veamos eso.

**Para pasar:** “Primer caso: el servicio de notificaciones se cae.”

**Para leer más:** `arka-lite-ui/README.md`

### 28. Si notificaciones se cae

**En pantalla · Qué pasa cuando falla:**

- Falla: notificaciones está caído: docker compose stop servicio-notificaciones
- 1. [0 s] Enviar: Responde 200: solicitud ENVIADA y evento guardado.
- 2. [cada 5 s] Reintenta: 3 intentos por ciclo; el evento sigue pendiente.
- 3. [en la UI] Se ve: Salud en DOWN y “1 evento en camino”.
- 4. [al volver] Entrega: Mismo eventoId: se crea el aviso.
- Resultado: 1 aviso, 0 perdidos: Sin intervención y sin duplicados.

**Ideas clave:**

- Enviar responde bien aunque notificaciones esté caído
- El evento queda pendiente en la bandeja
- El relevador reintenta cada 5 segundos
- Al volver, llega un solo aviso

**Qué decir**

> Detenemos notificaciones a propósito. En la pestaña Salud aparece en DOWN.
>
> Ahora enviamos una solicitud. La respuesta es buena: la solicitud queda enviada y su evento queda guardado. La persona no ve ningún error, porque no depende de que el otro servicio esté arriba.
>
> En Enviadas vemos el evento en camino. El relevador lo intenta cada cinco segundos y falla, pero no lo pierde. Cuando levantamos notificaciones, en el siguiente ciclo lo entrega con el mismo número, y aparece exactamente un aviso.

**Qué hacer** (no se dice)

- Antes: docker compose stop servicio-notificaciones. Mostrar Salud en DOWN.
- Crear y enviar DEMO-01; mostrar en Enviadas “1 evento en camino”.
- docker compose start servicio-notificaciones y esperar unos segundos: el evento pasa a entregado y aparece 1 aviso.
- Mostrar: Detener notificaciones, enviar DEMO-01, mirar Enviadas y volver a iniciar notificaciones. Debe verse: Evento en camino mientras está caído; al volver, entregado y 1 aviso.

**Si preguntan:** ¿Cuánto tiempo puede esperar un evento pendiente?

**Respuesta corta:** Indefinidamente: está en la base. Se entrega en el primer ciclo después de que notificaciones vuelve.

**Para pasar:** “Ese es el caso más importante, pero no el único.”

### 29. Cómo se comporta cuando algo falla

**En pantalla · Tabla de tres columnas:**

- Qué falla: notificaciones está caído · Cómo reacciona el sistema: El evento queda pendiente y se reintenta cada 5 s · Qué se ve en la UI: Salud en DOWN · “evento en camino”
- Qué falla: El evento llega dos veces · Cómo reacciona el sistema: ConsumoIdempotente lo reconoce y lo ignora · Qué se ve en la UI: “El aviso no se duplicó” · 0 duplicados
- Qué falla: Enviar dos veces o aprobar un borrador · Cómo reacciona el sistema: El dominio rechaza la transición: 409 · Qué se ve en la UI: Diálogo con el motivo del 409
- Qué falla: Faltan datos o el id ya existe · Cómo reacciona el sistema: Se valida antes de guardar: 400 o 409 · Qué se ve en la UI: Diálogo “Faltan datos” o “Ese identificador ya existe”
- Qué falla: Un POST tarda o se corta · Cómo reacciona el sistema: La UI no lo repite sola: pudo haberse guardado · Qué se ve en la UI: Error de tiempo agotado, sin reintento automático

**Ideas clave:**

- Servicio caído: el evento espera
- Evento repetido: se ignora
- Acción inválida: 409 con mensaje
- Datos incompletos: 400

**Qué decir**

> Esta tabla resume cómo se comporta el sistema ante cada falla que probamos, y qué ve la persona en la interfaz.
>
> Si un evento llega dos veces, se ignora. Si alguien intenta una acción que no corresponde, como enviar dos veces, recibe un 409 con el motivo. Si faltan datos, un 400 sin guardar nada.
>
> Y un detalle de diseño en la propia interfaz: si una operación que cambia datos tarda o se corta, no la repite sola, porque el cambio pudo haberse guardado aunque la respuesta no llegara. Ninguna falla queda sin una reacción prevista.

**Qué hacer** (no se dice)

- Mostrar: En Enviadas, Reentregar un evento ya consumido; en Solicitudes, enviar dos veces la misma solicitud. Debe verse: “El aviso no se duplicó” y el diálogo 409.

**Para pasar:** “Esto es lo que aprendimos con la UI como laboratorio.”

### 30. La UI como laboratorio: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 5 fallas con reacción prevista
- Métrica: 29 pruebas de la UI
- Diseñar para la falla: Cada falla probada tiene una reacción y un mensaje. Valor: Menos incidentes y menos llamadas a soporte.
- Hacer visible lo asíncrono: Pendientes, entregados y consumidos en una pantalla. Valor: Explicar el sistema a negocio sin abrir el código.
- La demo también enseña: Ayuda con diagramas y botones para provocar fallas. Valor: Material de capacitación para quien llegue al equipo.

**Ideas clave:**

- Diseñar para la falla, no solo para el éxito
- Hacer visible lo asíncrono
- Una herramienta de demo también enseña

**Qué decir**

> Primero: hay que diseñar para la falla, no solo para el camino feliz. La pregunta no es si algo va a fallar, sino cómo se comporta cuando falle.
>
> Segundo: lo asíncrono hay que hacerlo visible. Sin la pestaña Enviadas, un evento pendiente sería invisible.
>
> Y tercero: una herramienta de demostración también sirve para capacitar. Esta interfaz se puede usar para explicarle el sistema a cualquiera.

**Para pasar:** “Para cerrar, el valor que deja todo esto.”

## Valor y cierre

### 31. El valor agregado

**En pantalla · Tabla de tres columnas:**

- Pilar: Resiliencia · Qué construimos: Outbox, reintentos e idempotencia · Valor para el equipo: 0 avisos perdidos o duplicados ante caídas
- Pilar: Reproducibilidad · Qué construimos: Docker, Compose y Kubernetes · Valor para el equipo: 1 comando y la misma imagen en todo ambiente
- Pilar: Calidad · Qué construimos: 67 pruebas y pipeline por PR · Valor para el equipo: Errores detectados en minutos, no en producción
- Pilar: Trazabilidad · Qué construimos: Logs centralizados, traceId e imagen por SHA · Valor para el equipo: Diagnóstico en minutos y versiones rastreables
- Pilar: Contratos y diseño · Qué construimos: OpenAPI generado y puertos y adaptadores · Valor para el equipo: Integraciones claras y tecnología intercambiable

**Ideas clave:**

- Resiliencia ante fallas parciales
- Entornos reproducibles
- Calidad en cada cambio
- Trazabilidad de punta a punta

**Qué decir**

> Si tuviéramos que resumir el valor en una lámina, sería esta. Construimos resiliencia: ante una caída parcial no se pierde ni se duplica un aviso. Reproducibilidad: un comando y la misma imagen en cualquier ambiente.
>
> Calidad: sesenta y siete pruebas en cada Pull Request. Trazabilidad: logs centralizados con traceId e imágenes rastreables a su commit. Y contratos claros con un diseño que permite cambiar tecnología sin tocar el negocio.
>
> Nada de esto es exclusivo de ARKA-Lite: son prácticas que cualquier equipo puede adoptar desde mañana.

**Para pasar:** “Si nos llevamos solo tres ideas, que sean estas.”

### 32. Lo que nos llevamos

**En pantalla · Lo que aprendimos:**

- Métrica: 0 avisos perdidos o duplicados
- Métrica: 67 pruebas en cada cambio
- Diseñar para la falla: Guardar primero, reintentar e ignorar duplicados. Valor: Sistemas que se recuperan solos.
- Automatizar la confianza: Pruebas, pipeline, imágenes y estado declarado. Valor: Cambiar rápido sin miedo a romper.
- Hacer visible el sistema: Logs, trazas, salud, Swagger y la UI laboratorio. Valor: Diagnosticar y explicar en minutos.

**Ideas clave:**

- Diseñar para la falla
- Automatizar la confianza
- Hacer visible el sistema

**Qué decir**

> Tres ideas. Diseñar para la falla: en un sistema distribuido, algo siempre va a fallar, y la diferencia está en cómo reacciona.
>
> Automatizar la confianza: pruebas, pipeline e infraestructura declarada nos permiten cambiar rápido sin miedo.
>
> Y hacer visible el sistema: lo que no se ve no se puede diagnosticar ni explicar.

**Para pasar:** “También queremos ser honestos con lo que le falta.”

### 33. Lo que sigue

**En pantalla · Tarjetas:**

- Persistir los avisos: Hoy el texto vive en memoria; los eventos procesados sí están en la base.
- Seguridad: Autenticación y contraseñas en un gestor de secretos.
- Métricas y alertas: Prometheus ya está expuesto: falta guardarlas y alertar.
- Entrega a Kubernetes: El pipeline publica; falta que despliegue solo.

**Ideas clave:**

- Guardar el texto del aviso en la base
- Autenticación y secretos fuera del repositorio
- Métricas en el tiempo con alertas
- Desplegar automáticamente después del pipeline

**Ojo:** Las cuatro son propuestas: no existen todavía en el código (propuesta, no existe aún)

**Qué decir**

> ARKA-Lite es un laboratorio y lo decimos con claridad. El texto de los avisos vive en memoria, no hay inicio de sesión, las métricas no se guardan en el tiempo y el pipeline publica las imágenes, pero no las despliega solo.
>
> Esos son los siguientes pasos naturales, y la arquitectura ya está preparada para ellos: por ejemplo, guardar los avisos es cambiar un adaptador, sin tocar el negocio.

**Para pasar:** “Gracias por su atención.”

### 34. Gracias

**En pantalla:**

- Equipo arka-litos · Upskilling Backend Java
- ¿Preguntas?

**Qué decir**

> Empezamos con un endpoint y terminamos con un sistema de dos microservicios, con su base de datos, empaquetado, desplegado, observado y documentado, que sabe comportarse cuando algo falla.
>
> Muchas gracias por acompañarnos. Con gusto respondemos sus preguntas.

**Para leer más:** `docs/inicio/proyecto.md`

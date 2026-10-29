# Guion por persona · ejecutivo sin demostración · 7 personas

> Archivo generado por `npm run guiones` desde `docs/presentation-data/contenido/`. No editar a mano: los cambios se hacen en la fuente.

Cuatro de desarrollo (una de ellas orquesta), una de base de datos y dos de infraestructura. En base de datos, una persona de desarrollo apoya con la parte de código. Ejecutivo sin demostración, 45 láminas. Cada persona tiene aquí solo lo suyo, con el número de lámina del PPTX.

| Persona | Área | Qué presenta | Láminas | Habla |
| --- | --- | --- | --- | --- |
| Desarrollo 1 · orquesta | Desarrollo | Apertura, el negocio y el cierre y Fundamentos | 1–6, 42–45 | ~8 min |
| Desarrollo 2 | Desarrollo | Arquitectura | 7–10 | ~3 min |
| Desarrollo 3 | Desarrollo | Apoyo en base de datos: la misma regla, el ORM y la conexión | 14–17 | ~5 min |
| Desarrollo 4 | Desarrollo | Interconexión de servicios | 20–24 | ~5 min |
| Base de datos | Base de datos | Base de datos | 11–13, 18–19 | ~5 min |
| Infraestructura 1 | Infraestructura | DevOps: Docker, Compose y Codespaces, y la observabilidad | 25–31, 40–41 | ~8 min |
| Infraestructura 2 | Infraestructura | DevOps: CI/CD y Kubernetes | 32–39 | ~8 min |

## Desarrollo 1 · orquesta · Apertura, el negocio y el cierre y Fundamentos

Láminas 1–6, 42–45 · unos 8 minutos.

> **Recibes la palabra** al empezar la presentación.

### 1. Del endpoint al clúster

**En pantalla · Números grandes:**

- 2 microservicios
- 2 bases PostgreSQL
- 1 comando levanta todo
- 0 avisos perdidos o duplicados

**Ideas clave:**

- Cómo construimos dos microservicios con sus datos, su plataforma y su operación.

**Lo que se lleva el staff:** En 40 minutos, prácticas que pueden aplicar en sus propios sistemas, no solo teoría.

**Qué decir**

> Buenos días a todos. Somos el equipo arka-litos, del curso Upskilling Backend Java, y hoy les presentamos ARKA-Lite, nuestro proyecto final.
>
> Somos un equipo de tres áreas, las mismas que tienen ustedes: desarrollo, base de datos e infraestructura, y cada parte la presenta quien la construyó. A mí, que vengo de desarrollo y conozco el negocio de punta a punta, me toca abrir, conectar las partes y cerrar.
>
> El título lo resume: empezamos escribiendo un endpoint, una sola operación en Java, y terminamos con un sistema completo corriendo en un clúster de Kubernetes, con sus bases de datos, su pipeline y su monitoreo.
>
> El equipo anterior ya les explicó los fundamentos y la arquitectura. Nosotros les vamos a contar el proyecto desde la práctica, con diagramas y ejemplos reales del sistema, y nos vamos a enfocar en lo que les puede servir en su día a día: cómo se cuidan los datos, cómo se hablan los sistemas y cómo se despliega y se opera todo.

**Qué hacer** (no se dice)

- Cada diagrama se arma con clics: en el texto, ▶ CLIC marca el momento de hacer clic.

**Si hay tiempo, se puede agregar**

> ARKA-Lite nació como el laboratorio del curso: cada tema que veíamos lo aplicábamos al mismo sistema. Por eso creció por capas: primero un endpoint, después la base de datos, la comunicación entre servicios, los contenedores, el pipeline y la observabilidad.
>
> Todo lo que van a ver está en un solo repositorio, con su documentación, y se levanta con un solo comando. Si a alguien le interesa revisarlo después, con gusto se lo compartimos.
>
> Trabajamos como trabajaría un equipo real: cada cambio en una rama, revisado por otra persona y probado por el pipeline antes de entrar. Mezclar áreas nos obligó a ponernos de acuerdo en contratos claros: qué expone cada servicio, qué guarda cada base y cómo se despliega cada pieza.

**Para pasar:** “Este es el recorrido.”

### 2. Qué vamos a ver

**En pantalla · La ruta de las partes:**

- 1. Fundamentos (vista general): Primero el qué, después el cómo: el negocio claro y buenas prácticas que sirven en cualquier lenguaje.
- 2. Arquitectura (vista general): El sistema por fuera: qué piezas hay y cómo trabajan juntas.
- 3. Base de datos (a fondo): Dos bases PostgreSQL, el ORM, la cadena de conexión y las transacciones.
- 4. Interconexión de servicios (a fondo): Cómo se hablan los servicios: síncrono, asíncrono, Outbox e idempotencia.
- 5. DevOps: Docker y Kubernetes (a fondo): Docker empaqueta, Kubernetes administra y el pipeline prueba cada cambio.
- 6. Observabilidad (vista general): Logs en un solo lugar, trazas entre servicios y salud de cada componente.

**Ideas clave:**

- Fundamentos y arquitectura: vista general
- Base de datos: a fondo
- Interconexión de servicios: a fondo
- DevOps con Docker y Kubernetes: a fondo
- Observabilidad: vista general

**Lo que se lleva el staff:** Saber desde el inicio dónde vamos a profundizar y qué se van a llevar.

**Qué decir**

> Todos los equipos presentamos las mismas secciones, pero cada uno profundiza en algunas para no repetirnos. El equipo anterior se enfocó en los fundamentos y en la arquitectura hexagonal, así que esas dos partes las vamos a ver rápido, en vista general.
>
> **▶ clic** Donde vamos a fondo es en tres temas que tocan directo el trabajo de ustedes: la base de datos, cómo se comunican los servicios sin perder información, y DevOps, con Docker, Kubernetes y el pipeline. **▶ clic** Y después, una mirada general a la observabilidad, antes de cerrar con lo que pueden aplicar desde mañana.
>
> Al final de cada parte les dejamos lo que aprendimos y cómo se puede aplicar en cualquier proyecto, también en los que usan procedimientos almacenados.

**Si hay tiempo, se puede agregar**

> Las partes generales son cortas a propósito: el equipo anterior ya las explicó. El tiempo lo dedicamos a lo que más valor les deja: los datos, la comunicación entre sistemas y la operación.
>
> Al final juntamos lo que pueden aplicar desde mañana, aunque sus sistemas usen procedimientos almacenados.

**Para pasar:** “Empecemos por los fundamentos, y por lo primero: el qué.”

### 3. Primero el qué: el negocio en una lámina

**En pantalla · Flujo paso a paso:**

- 1. Quien solicita: Registra qué necesita y de qué tipo.
- 2. La envía: Cuando está lista.
- 3. El sistema avisa: A quien debe atenderla.
- 4. Alguien decide: La aprueba o la rechaza.
- Si si se salta un paso en el paso 2: No se permite: Enviar dos veces o decidir sobre un borrador: el sistema explica por qué.

**Ideas clave:**

- Quien solicita registra la solicitud
- La envía cuando está lista
- El sistema le avisa a quien debe atenderla
- Alguien la aprueba o la rechaza
- Saltarse un paso no se permite

**Lo que se lleva el staff:** Pensar primero en el qué y después en el cómo: las reglas claras hacen el código simple.

**Qué decir**

> Antes de entrar a la tecnología, el aprendizaje más importante de los fundamentos: primero pensamos en el qué y después en el cómo. ¿Qué tiene que pasar, quién lo hace y qué no se puede permitir? Este es el negocio, en una lámina. Alguien registra una solicitud, por ejemplo una incidencia o un pedido de cambio: qué necesita y de qué tipo.
>
> **▶ clic** Cuando está lista, la envía. **▶ clic** En ese momento, el sistema le avisa a quien debe atenderla. **▶ clic** Y esa persona la aprueba o la rechaza: es la decisión final.
>
> **▶ clic** Igual de importante es lo que no se permite: enviar dos veces la misma solicitud, o aprobar una que todavía nadie ha enviado. El sistema no lo hace y explica por qué. Esas son las reglas del negocio, y con ellas claras, el código salió simple: un servicio para las solicitudes y otro para los avisos.

**Si hay tiempo, se puede agregar**

> Antes de escribir una línea de código nos hicimos tres preguntas: qué tiene que pasar, quién hace cada paso y qué no se puede permitir. Las respuestas se volvieron las reglas del sistema.
>
> Por dentro, esos pasos son cuatro estados: borrador, enviada, aprobada y rechazada. La base de datos también los cuida: la columna estado solo acepta esos cuatro valores.
>
> Al arrancar, el sistema siempre registra dos solicitudes de ejemplo: INC-001, una incidencia en borrador, y CAM-002, un cambio que se envía. El pipeline usa CAM-002 para comprobar que el servicio arrancó de verdad.

**Si preguntan:** ¿Por qué los avisos van en otro servicio?

**Respuesta corta:** Porque cambian por motivos distintos, y así el trámite sigue funcionando aunque el servicio de avisos esté caído.

**Para pasar:** “Con el qué claro, el cómo: código que se pueda cambiar sin miedo.”

**Para leer más:** `docs/inicio/proyecto.md`

### 4. Código mantenible: buenas prácticas

**En pantalla · Tarjetas:**

- Una tarea por pieza: Quien recibe la petición no decide; quien decide no guarda.
- Piezas que se conectan: Cada pieza recibe lo que necesita: se cambia o se prueba sola.
- Reglas en un solo lugar: El negocio vive junto, lejos de la pantalla y de la base.
- Errores con respuesta clara: Siempre el mismo formato: 400, 404 o 409 con su motivo.
- Nombres del negocio: Solicitud, enviar, aprobar: el código se lee como el proceso.
- Cada regla con su prueba: Una prueba automática avisa si un cambio rompió algo.

**Ideas clave:**

- Una tarea por pieza
- Las piezas se conectan, no se fabrican adentro
- Las reglas viven en un solo lugar
- Errores con respuesta clara
- Nombres del negocio
- Cada regla con su prueba

**Lo que se lleva el staff:** Cuando cambia una regla, se toca un solo lugar y una prueba confirma que nada se rompió.

**Qué decir**

> Con el qué claro, viene el cómo. El equipo anterior ya cubrió los fundamentos, así que nos quedamos con seis prácticas que nos sirvieron y que se pueden usar en cualquier lenguaje, sea Java, C#, Python o PL/SQL. Primera: cada pieza hace una sola tarea; la que recibe la petición no decide, y la que decide no guarda.
>
> **▶ clic** Segunda: las piezas se conectan desde afuera, así se pueden cambiar o probar por separado. **▶ clic** Tercera: las reglas del negocio viven en un solo lugar, no repetidas en la pantalla y en la base. **▶ clic** Cuarta: los errores responden siempre igual: un 400 si faltan datos, un 404 si algo no existe, un 409 si la regla no lo permite.
>
> **▶ clic** Quinta: los nombres son los del negocio, así el código se lee como el proceso. **▶ clic** Y sexta: cada regla tiene una prueba automática que avisa si un cambio rompió algo. El resultado: cuando cambia una regla, se toca un solo lugar.

**Si hay tiempo, se puede agregar**

> Un ejemplo concreto: el controlador de solicitudes no decide nada; solo convierte el JSON y llama al servicio. Si mañana cambia la regla de envío, se toca la clase Solicitud y su prueba, nada más.
>
> Lo de las piezas que se conectan desde afuera tiene un nombre: inyección de dependencias. En ARKA-Lite todo llega por el constructor, y por eso en las pruebas cambiamos la base real por una en memoria sin tocar el negocio.

**Si preguntan:** ¿Esto no hace el código más largo?

**Respuesta corta:** Un poco más de piezas, pero cada una es corta y se entiende sola. El costo se recupera en el primer cambio.

**Para pasar:** “Y como somos varios trabajando sobre el mismo código, también necesitamos orden.”

**Para leer más:** `docs/desarrollo/flujo-de-trabajo.md`

### 5. Trabajo en equipo: Git y documentación

**En pantalla · Una rama de Git:**

- Rama feat/crear-solicitud-por-post sale de main
- Commit: feat: crear solicitud
- Commit: test: 409 si ya existe
- Commit: docs: el nuevo POST
- Vuelve a main: Pull Request: revisión, pruebas en verde y documentación

**Ideas clave:**

- Una rama corta por tarea
- Cada commit dice qué cambió
- Entra a main solo por Pull Request
- La documentación viaja en el mismo cambio

**Lo que se lleva el staff:** Nada llega a la rama principal sin revisión, pruebas y documentación.

**Qué decir**

> Muy rápido, cómo trabajamos en equipo. Cada tarea se hace en una rama corta, y cada commit dice qué cambió: una funcionalidad, una prueba, la documentación.
>
> **▶ clic** El cambio entra a la rama principal solo por un Pull Request: otra persona lo revisa, las pruebas tienen que pasar y la documentación se actualiza en ese mismo cambio. La documentación de la API, además, la genera Swagger desde el código, así que nunca queda vieja.

**Si hay tiempo, se puede agregar**

> Usamos un formato común para los mensajes de commit: el tipo, dos puntos y qué hace el cambio, por ejemplo: fix: impedir el envío de una solicitud aprobada. Con eso, el historial se lee como una bitácora.
>
> Nadie sube directo a main, ni siquiera quien orquesta. Eso nos protegió más de una vez de romper algo que otro compañero estaba usando.

**Para pasar:** “Esto es lo que nos llevamos de los fundamentos.”

**Para leer más:** `docs/desarrollo/git.md`

### 6. Fundamentos: lo que nos llevamos a cualquier proyecto

**En pantalla · Lo que aprendimos:**

- Métrica: 6 prácticas que sirven en cualquier lenguaje
- Métrica: 4 respuestas claras: 201, 400, 404 y 409
- Primero el qué, después el cómo: Qué tiene que pasar, quién lo hace y qué no se permite. Valor: Reglas claras antes de elegir la tecnología.
- Separar responsabilidades paga pronto: Pantalla, reglas y datos en piezas distintas. Valor: Un cambio de regla toca un solo lugar.
- Las reglas no dependen de la herramienta: El negocio no sabe si detrás hay una base, una web o un framework. Valor: Se prueba rápido y sobrevive a un cambio de tecnología.
- Todo cambio entra revisado: Ramas cortas, revisión, pruebas y documentación juntas. Valor: Menos sorpresas en producción.

**Ideas clave:**

- Primero el qué, después el cómo
- Separar responsabilidades paga en el primer cambio
- Las reglas no dependen de la herramienta
- Todo cambio entra revisado

**Lo que se lleva el staff:** Cuatro hábitos que bajan el costo de mantener cualquier sistema.

**Qué decir**

> Lo que nos llevamos a cualquier proyecto. **▶ clic** Primero el qué, después el cómo: con las reglas del negocio claras, la tecnología se elige mejor y el código sale más simple. **▶ clic** Separar responsabilidades se paga desde el primer cambio.
>
> **▶ clic** Las reglas no deben depender de la herramienta: si mañana cambia la base o el framework, las reglas siguen iguales. **▶ clic** Y ningún cambio entra sin revisión, pruebas y documentación.

**Si hay tiempo, se puede agregar**

> Si tuviéramos que elegir una sola práctica para empezar en un sistema existente, sería poner las reglas del negocio en un solo lugar con su prueba. Es la que más rápido devuelve la inversión.

**Para pasar:** “Con esa base, veamos el sistema completo desde arriba.”

> **Entregas la palabra** a Desarrollo 2 (lámina 7).

> **Recibes la palabra** de Infraestructura 1, después de la lámina 41.

### 42. El valor agregado

**En pantalla · Tabla de tres columnas:**

- Pilar: Datos consistentes · Qué construimos: Transacción local, Outbox e idempotencia · Valor para el equipo: 0 avisos perdidos o duplicados ante caídas
- Pilar: Conexión segura · Qué construimos: Cadena de conexión y claves fuera del código · Valor para el equipo: Cambiar de servidor o de clave sin recompilar
- Pilar: Reproducibilidad · Qué construimos: Docker, Compose y Kubernetes · Valor para el equipo: 1 comando y la misma imagen en todo ambiente
- Pilar: Calidad · Qué construimos: Pruebas automáticas y pipeline en cada cambio · Valor para el equipo: Errores detectados en minutos, antes de integrar
- Pilar: Trazabilidad · Qué construimos: Logs centralizados, traceId e imagen por commit · Valor para el equipo: Diagnóstico en minutos y versiones rastreables

**Ideas clave:**

- Datos consistentes ante fallas
- Conexiones fuera del código
- Entornos reproducibles
- Calidad en cada cambio
- Trazabilidad de punta a punta

**Lo que se lleva el staff:** Cinco pilares que cualquier equipo puede adoptar.

**Qué decir**

> Gracias. Si tuviéramos que resumir el valor en una lámina, sería esta. Datos consistentes: ante una caída, no se pierde ni se duplica un aviso. **▶ clic** Conexión segura: la cadena de conexión y las claves viven fuera del código.
>
> **▶ clic** Reproducibilidad: un comando y la misma imagen en cualquier ambiente. **▶ clic** Calidad: pruebas automáticas en cada cambio, antes de integrarlo. **▶ clic** Y trazabilidad: logs en un solo lugar e imágenes rastreables hasta su commit.

**Si hay tiempo, se puede agregar**

> Si alguien pregunta por números: cero avisos perdidos o duplicados en las pruebas de caída, un comando para levantar los ocho contenedores y una imagen rastreable por cada commit.

**Para pasar:** “Y lo más importante: qué pueden aplicar ustedes desde mañana.”

### 43. Lo que pueden aplicar desde mañana

**En pantalla · Tabla de tres columnas:**

- Práctica: Cadena de conexión fuera del código · Cómo se ve en sus sistemas de hoy: Variables de entorno o un gestor de secretos en el servidor · Qué evita: Claves en el repositorio y recompilar por cambiar de servidor
- Práctica: Guardar y avisar en la misma transacción · Cómo se ve en sus sistemas de hoy: Una tabla de pendientes que llena el procedimiento y un job que la entrega · Qué evita: Avisos perdidos cuando el otro sistema está caído
- Práctica: Idempotencia en lo que se reintenta · Cómo se ve en sus sistemas de hoy: Una tabla de procesados con llave única por número de operación · Qué evita: Pagos, correos o registros duplicados
- Práctica: Un identificador que cruce sistemas · Cómo se ve en sus sistemas de hoy: El mismo número en el log de la aplicación, del procedimiento y del otro sistema · Qué evita: Horas buscando un error entre sistemas
- Práctica: El mismo paquete en todos los ambientes · Cómo se ve en sus sistemas de hoy: Contenedores para aplicaciones y bases de prueba · Qué evita: El clásico “en mi máquina funciona”

**Ideas clave:**

- Sacar la cadena de conexión del código
- Guardar y avisar en la misma transacción
- Hacer idempotente lo que se reintenta
- Un identificador que cruce sistemas
- El mismo paquete en todos los ambientes

**Lo que se lleva el staff:** Cinco prácticas concretas que se pueden empezar a aplicar sin cambiar de tecnología.

**Qué decir**

> Esta es la lámina que más nos importa que se lleven. Nada de esto exige reescribir sus sistemas; todo funciona también con procedimientos almacenados. Primero: saquen la cadena de conexión del código; usen variables de entorno o un gestor de secretos.
>
> **▶ clic** Segundo: si un procedimiento tiene que avisarle a otro sistema, no lo llamen ahí mismo. Anoten el aviso en una tabla de pendientes, en la misma transacción, y que un job lo entregue. Ese es el Outbox. **▶ clic** Tercero: todo lo que se reintenta, un pago, un correo, un registro, debe ser idempotente: una tabla de procesados con llave única.
>
> **▶ clic** Cuarto: un mismo identificador en todos los logs, para seguir una operación de un sistema a otro. **▶ clic** Y quinto: el mismo paquete en todos los ambientes, para que lo que se prueba sea lo que se despliega.

**Si hay tiempo, se puede agregar**

> El orden que recomendamos: primero la cadena de conexión, porque es un cambio pequeño que baja un riesgo real; después la tabla de pendientes en el proceso que más falla hoy; y luego la idempotencia en lo que se reintenta.
>
> Ninguna de estas prácticas exige Java, microservicios ni Kubernetes. Son decisiones de diseño que se pueden tomar en el sistema que ya tienen.

**Si preguntan:** ¿Por dónde empezamos?

**Respuesta corta:** Por la cadena de conexión: es el cambio más pequeño y baja un riesgo real de seguridad. Después, la tabla de pendientes en el proceso que más falle hoy.

**Para pasar:** “Si nos llevamos solo tres ideas, que sean estas.”

### 44. Lo que nos llevamos

**En pantalla · Lo que aprendimos:**

- Métrica: 0 avisos perdidos o duplicados
- Métrica: 1 comando para levantar todo
- Diseñar para la falla: Guardar primero, reintentar e ignorar duplicados. Valor: Sistemas que se recuperan solos.
- Automatizar la confianza: Pruebas, pipeline, imágenes y estado declarado. Valor: Cambiar rápido sin miedo a romper.
- Hacer visible el sistema: Logs, trazas, salud, Swagger y la UI. Valor: Diagnosticar y explicar en minutos.

**Ideas clave:**

- Diseñar para la falla
- Automatizar la confianza
- Hacer visible el sistema

**Lo que se lleva el staff:** Tres ideas para recordar al salir de la sala.

**Qué decir**

> Tres ideas para cerrar. **▶ clic** Diseñar para la falla: en un sistema distribuido algo siempre va a fallar, y la diferencia está en cómo reacciona. **▶ clic** Automatizar la confianza: pruebas, pipeline e infraestructura declarada para cambiar rápido sin miedo. **▶ clic** Y hacer visible el sistema: lo que no se ve no se puede diagnosticar ni explicar.

**Si hay tiempo, se puede agregar**

> Si se llevan una sola frase: diseñen pensando en qué pasa cuando algo falla, no solo cuando todo sale bien. Y antes de pensar en el cómo, tengan claro el qué.

**Para pasar:** “Gracias por su atención.”

### 45. Gracias

**En pantalla:**

- Equipo arka-litos
- Proyecto final · Upskilling Backend Java

**Qué decir**

> Empezamos con un endpoint y terminamos con dos microservicios con sus bases de datos, empaquetados, desplegados, observados y documentados, que saben comportarse cuando algo falla.
>
> Muchas gracias por acompañarnos, de parte de todo el equipo arka-litos. Con gusto respondemos sus preguntas.

**Qué hacer** (no se dice)

- Quien orquesta recibe las preguntas y se las pasa a quien presentó esa parte.

**Para leer más:** `docs/inicio/proyecto.md`

## Desarrollo 2 · Arquitectura

Láminas 7–10 · unos 3 minutos.

> **Recibes la palabra** de Desarrollo 1 · orquesta, después de la lámina 6.

### 7. El sistema de un vistazo

**En pantalla · Capas del sistema:**

- Experiencia: Persona: Usa el navegador; arka-lite-ui: La pantalla · reenvía /api
- Servicios: servicio-solicitudes: El trámite y sus estados; servicio-notificaciones: Los avisos, sin duplicados
- Datos: db-solicitudes: PostgreSQL 17 · solicitud y evento; db-notificaciones: PostgreSQL 17 · evento_procesado
- Plataforma: Compose o Kubernetes: Dónde corre; GitHub Actions: Prueba y publica; Loki y Grafana: Logs en un solo lugar

**Ideas clave:**

- La UI es la puerta de entrada
- Dos servicios, cada uno dueño de su base
- Entre servicios solo viajan datos
- La plataforma corre, entrega y observa

**Lo que se lleva el staff:** Cada capa se puede cambiar sin romper las otras.

**Qué decir**

> Gracias. ARKA-Lite no es una aplicación grande: son piezas pequeñas, cada una con una responsabilidad. Arriba está la experiencia: la persona usa la interfaz, y la interfaz no guarda nada, solo les pasa las peticiones a los servicios.
>
> **▶ clic** En el medio, los dos microservicios: solicitudes lleva el trámite y sus estados; notificaciones crea los avisos. **▶ clic** Debajo, cada uno con su propia base PostgreSQL; ninguno lee la base del otro. **▶ clic** Y abajo, la plataforma: dónde corre, cómo se prueba cada cambio y dónde se ven los logs.

**Si hay tiempo, se puede agregar**

> La interfaz es delgada a propósito: no guarda nada ni toma decisiones. Si mañana se cambia por otra, los servicios no se enteran.
>
> La plataforma es la misma para los dos servicios: el mismo Compose, el mismo pipeline y el mismo lugar para los logs. Eso baja mucho el costo de tener dos servicios en lugar de uno.

**Si preguntan:** ¿Por qué no comparten una sola base de datos?

**Respuesta corta:** Para que cada servicio sea dueño de sus datos y pueda cambiar sin romper al otro.

**Para pasar:** “Ahora veamos cómo trabajan juntas esas piezas en la práctica.”

**Para leer más:** `docs/inicio/proyecto.md`

### 8. Cómo funciona en la práctica

**En pantalla · El sistema en la práctica:**

- 1. Persona → La UI: usa
- 2. La UI → Solicitudes: crea, envía y decide
- 3. Solicitudes → db-solicitudes: guarda
- 4. Solicitudes ⇢ Notificaciones: avisa después (SolicitudEnviada: eventoId, id y tipo)
- 5. Notificaciones → db-notificaciones: anota lo recibido
- 6. La UI → Notificaciones: consulta los avisos
- Ninguna flecha une las dos bases: cada servicio es dueño de sus datos.

**Ideas clave:**

- La persona usa la UI
- La UI le pide el trabajo a cada servicio
- Cada servicio guarda en su propia base
- Solicitudes avisa con un evento: un dato, no una pieza

**Lo que se lleva el staff:** Los sistemas se comunican con mensajes claros, no compartiendo tablas.

**Qué decir**

> Ahora, cómo trabajan juntas en la práctica. Sigamos los números. **▶ clic** Uno: la persona usa la interfaz. **▶ clic** Dos: cuando crea, envía o decide una solicitud, la interfaz se lo pide al servicio de solicitudes. **▶ clic** Tres: solicitudes lo guarda en su propia base.
>
> **▶ clic** Cuatro, el paso más importante: cuando una solicitud se envía, solicitudes le avisa a notificaciones. Fíjense en que esa flecha no es una pieza del sistema: es un dato que viaja, un mensaje pequeño con el número del evento, la solicitud y su tipo.
>
> **▶ clic** Cinco: notificaciones crea el aviso y anota que ya recibió ese evento. **▶ clic** Seis: la interfaz le consulta a notificaciones para mostrar los avisos.
>
> **▶ clic** Y lo que no hay también dice mucho: ninguna flecha une las dos bases. Si un servicio necesita algo del otro, se lo pide; nunca entra a su base.

**Si hay tiempo, se puede agregar**

> El mensaje que viaja entre servicios lleva solo tres datos: el número del evento, el identificador de la solicitud y su tipo. Mientras más pequeño el mensaje, más fácil es que los dos lados se pongan de acuerdo.
>
> Ese contrato está copiado en los dos servicios. Si un día cambia, se cambia en los dos al mismo tiempo: es lo único que comparten.

**Si preguntan:** ¿Qué pasa si notificaciones está caído en el paso cuatro?

**Respuesta corta:** Solicitudes sigue funcionando y el aviso espera guardado. Lo vemos en la parte de interconexión.

**Para pasar:** “¿Y cómo está ordenado cada servicio por dentro?”

### 9. Por dentro de cada servicio: hexagonal

**En pantalla · Puertos y adaptadores:**

- Centro: Reglas del negocio: La solicitud y sus estados
- Puertos: Guardar solicitudes, Anotar el evento, Avisar a otros
- Entrada: API REST: La web entra aquí; Errores claros: 400 · 404 · 409
- Salida: PostgreSQL: Con el ORM; Bandeja de salida: Tabla evento; HTTP: Hacia notificaciones; En memoria: Para las pruebas

**Ideas clave:**

- Las reglas del negocio al centro
- La web entra por un lado
- La base y los otros servicios salen por el otro
- Por fuera sigue siendo un servicio en su contenedor

**Comparación:** Como un enchufe: el aparato funciona con cualquier toma que cumpla la norma, sin saber de qué planta viene la electricidad.

**Lo que se lleva el staff:** Cambiar la base o la forma de avisar sin tocar las reglas del negocio.

**Qué decir**

> Como explicó el equipo anterior, la arquitectura hexagonal es una forma de ordenar el código por dentro. No cambia cómo se despliega: por fuera, cada servicio sigue siendo una aplicación en su contenedor. Al centro van las reglas del negocio y los contratos que necesitan, como guardar una solicitud o avisar que se envió.
>
> **▶ clic** Por un lado entra la web. **▶ clic** Por el otro salen la base de datos y las llamadas a otros servicios, conectadas como enchufes. Fíjense en la última: una versión en memoria que reemplaza a la base en las pruebas. Gracias a eso probamos todas las reglas sin levantar PostgreSQL.

**Si hay tiempo, se puede agregar**

> En solicitudes hay tres contratos hacia afuera: guardar solicitudes, anotar eventos y publicarlos. Cada uno puede tener más de una implementación, y Spring usa la que está marcada como principal.
>
> Dejamos a propósito implementaciones alternativas, por ejemplo un publicador simple sin reintentos, para mostrar que se puede cambiar una por otra sin tocar las reglas.

**Si preguntan:** ¿Esto se parece a llamar un procedimiento almacenado?

**Respuesta corta:** En que quien llama solo conoce el nombre y los parámetros, no cómo está hecho por dentro. La diferencia es que aquí el negocio define el contrato y la base se adapta a él.

**Para pasar:** “Esto es lo que nos dejó la arquitectura.”

**Para leer más:** `docs/arquitectura/componentes-java.md`

### 10. Arquitectura: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 2 servicios, cada uno con su base
- Métrica: 0 tablas compartidas entre servicios
- Cada servicio, dueño de sus datos: Nadie lee ni escribe en la base del otro. Valor: Cada uno cambia sin romper al otro.
- Entre servicios viajan datos: Un evento pequeño con su número: SolicitudEnviada. Valor: Un acuerdo claro y fácil de revisar.
- Hexagonal ordena por dentro: No cambia el despliegue: un contenedor por servicio. Valor: Cambiar la base o la web sin tocar las reglas.
- Separar tiene un costo: Más red, dos bases y fallas parciales. Valor: Separar solo cuando el negocio lo pide.

**Ideas clave:**

- Cada servicio es dueño de sus datos
- Entre servicios viajan datos, no tablas
- Hexagonal ordena por dentro, no cambia el despliegue
- Separar tiene un costo

**Lo que se lleva el staff:** Sistemas que cambian por separado, unidos por acuerdos claros.

**Qué decir**

> Cuatro aprendizajes de arquitectura. **▶ clic** Cada servicio es dueño de sus datos. **▶ clic** Entre servicios no se comparten tablas, se comparten mensajes.
>
> **▶ clic** Hexagonal ordena el código por dentro, pero no cambia el despliegue. **▶ clic** Y separar en microservicios tiene un costo real, así que se hace cuando el negocio lo justifica, no por moda.

**Si hay tiempo, se puede agregar**

> Lo más difícil de los microservicios no fue el código, fueron las fronteras: decidir qué dato es de quién. Una vez claro eso, lo demás se ordenó solo.

**Para pasar:** “Y aquí empieza la parte en la que vamos a fondo: la base de datos.”

> **Entregas la palabra** a Base de datos (lámina 11).

## Desarrollo 3 · Apoyo en base de datos: la misma regla, el ORM y la conexión

Láminas 14–17 · unos 5 minutos.

> **Recibes la palabra** de Base de datos, después de la lámina 13.

### 14. La misma regla, escrita de las dos formas

**En pantalla · La misma idea, en dos códigos:**

- Hoy: en un procedimiento: CREATE PROCEDURE sp_enviar @id VARCHAR(20) AS BEGIN   IF (SELECT estado FROM solicitud       WHERE id = @id) <> 'BORRADOR'     THROW 50001, 'Solo se envía en BORRADOR', 1;   UPDATE solicitud SET estado = 'ENVIADA'    WHERE id = @id; END · La regla y el dato viven juntos en la base; Probarla exige una base con datos; Cambiarla es desplegar en la base
- ARKA-Lite: en el código: public Solicitud enviar() {     if (estado != Estado.BORRADOR)         throw new TransicionNoPermitida(             "solo se puede enviar en BORRADOR");     return new Solicitud(id, tipo, Estado.ENVIADA); } // Hibernate escribe el SQL: // UPDATE solicitud SET estado = ? WHERE id = ? · La regla vive en el código, con su prueba; Se prueba en milisegundos, sin base; La base sigue cuidando llaves, CHECK e índices

**Ideas clave:**

- Hoy: la regla dentro de un procedimiento almacenado
- ARKA-Lite: la misma regla en un método Java
- El SQL rutinario lo escribe Hibernate
- La base sigue cuidando llaves, CHECK e índices

**Lo que se lleva el staff:** La misma regla, más fácil de probar y de cambiar, sin que la base pierda su papel.

**Qué decir**

> Gracias. Tomemos una regla real del negocio: solo se puede enviar una solicitud que está en borrador. A la izquierda, cómo la escribiríamos hoy: un procedimiento que consulta el estado, lanza un error si no está en borrador y hace el UPDATE. La regla y el dato viven juntos en la base, y para probarla hace falta una base con datos.
>
> **▶ clic** A la derecha, la misma regla en ARKA-Lite: el método enviar de la clase Solicitud. Si el estado no es borrador, lanza un error; si lo es, devuelve la solicitud enviada. No hay SQL: el UPDATE lo escribe Hibernate cuando el servicio guarda, siempre con parámetros.
>
> ¿Qué ganamos? Esa regla se prueba en milisegundos, sin base de datos, y si cambia, se cambia en un solo lugar junto con su prueba. ¿Qué no perdemos? La base sigue cuidando lo suyo: la llave primaria, el CHECK de los estados y los índices.

**Si hay tiempo, se puede agregar**

> La prueba de esa regla es así de simple: se crea una solicitud ya enviada, se intenta enviarla otra vez y se verifica que el sistema lo rechaza. Corre en milisegundos y no necesita ninguna base.
>
> Para probar lo mismo en el procedimiento habría que preparar datos en una base, ejecutarlo y revisar el resultado. Funciona, pero es más lento y más difícil de repetir en cada cambio.

**Si preguntan:** ¿Y si la regla necesita consultar muchos datos?

**Respuesta corta:** Para decidir, el servicio pide solo lo que necesita por llave. Si es un cálculo sobre millones de filas, ese trabajo puede seguir en la base, como una consulta o un procedimiento bien delimitado.

**Para pasar:** “Ahora veamos cómo hace Hibernate esa traducción.”

### 15. El ORM por dentro: una clase es una tabla

**En pantalla · De la clase a la tabla:**

- SolicitudEntity (Clase Java · @Entity · @Table("solicitud")) ↔ solicitud (Tabla en PostgreSQL)
- @Id String id ↔ id (VARCHAR(20) · PK)
- String tipo ↔ tipo (VARCHAR(20))
- String estado ↔ estado (VARCHAR(20) · CHECK)
- jpa.save(nueva) → INSERT INTO solicitud (id, tipo, estado) VALUES (?, ?, ?)
- jpa.findById("CAM-002") → SELECT id, tipo, estado FROM solicitud WHERE id = ?
- jpa.save(enviada) → UPDATE solicitud SET tipo = ?, estado = ? WHERE id = ?

**Ideas clave:**

- @Entity dice que la clase es una tabla
- Cada campo es una columna
- @Id marca la llave primaria
- save y findById se vuelven SQL con parámetros

**Lo que se lleva el staff:** El SQL de todos los días sale solo y siempre con parámetros: menos código y menos riesgo de inyección.

**Qué decir**

> Esta es la traducción, lado a lado. A la izquierda, una clase Java: SolicitudEntity. Con la anotación arroba Entity le decimos a Hibernate que esta clase representa una tabla, y con arroba Table, cuál: la tabla solicitud. **▶ clic** Cada campo de la clase corresponde a una columna, y arroba Id marca la llave primaria.
>
> Con eso, Hibernate ya sabe todo. Abajo ven qué pasa cuando el código llama a un método. **▶ clic** Guardar una solicitud nueva se convierte en un INSERT. **▶ clic** Buscar por identificador, en un SELECT con su WHERE. **▶ clic** Y guardar una que ya existe, por ejemplo cuando se envía, en un UPDATE.
>
> Fíjense en los signos de interrogación: los valores viajan siempre como parámetros, nunca pegados al texto del SQL. Es lo mismo que hacemos con los parámetros de un procedimiento, y es lo que nos protege de la inyección SQL.
>
> Nosotros no escribimos ninguna de esas consultas. Lo que sí cuidamos fue el diseño de las tablas, porque el ORM confía en que la base esté bien hecha.

**Si hay tiempo, se puede agregar**

> El repositorio de Spring Data no tiene ni una consulta escrita: hereda de JpaRepository, y con eso ya trae guardar, buscar por llave, listar y borrar.
>
> Cuando el código guarda una solicitud que ya existe, Hibernate primero la busca por su llave y después decide si hace un INSERT o un UPDATE. Por eso las llaves bien definidas importan: el ORM las usa todo el tiempo.

**Si preguntan:** ¿Se puede ver el SQL que genera?

**Respuesta corta:** Sí: con spring.jpa.show-sql=true se imprime en el log. Es lo primero que conviene activar para revisar el rendimiento.

**Si preguntan:** ¿Y las consultas complejas?

**Respuesta corta:** Se pueden escribir a mano, en JPQL o en SQL nativo, con la anotación @Query. El ORM no lo impide.

**Para pasar:** “Ahora sigamos un dato completo, desde la pantalla hasta la fila.”

### 16. El viaje de un dato: de la pantalla a la fila

**En pantalla · Flujo paso a paso:**

- 1. Pantalla: Manda JSON: SOL-100, tipo Consulta.
- 2. Controlador: Convierte el JSON en un objeto.
- 3. Reglas: Revisa que el id no exista. Sin SQL.
- 4. Hibernate: Objeto → INSERT con parámetros.
- 5. PostgreSQL: Guarda la fila y hace COMMIT.

**Ideas clave:**

- La pantalla manda JSON
- El controlador lo convierte en un objeto
- Las reglas validan, sin SQL
- Hibernate arma el INSERT
- PostgreSQL guarda la fila y confirma

**Comparación:** Como un traductor: el código habla Java, la base habla SQL, y el ORM traduce en los dos sentidos.

**Lo que se lleva el staff:** Cada pieza hace una sola traducción; si algo falla, se sabe en qué punto.

**Qué decir**

> Ahora sigamos un dato de punta a punta. La persona llena el formulario y la pantalla manda un JSON: identificador SOL-100, tipo Consulta. **▶ clic** El controlador recibe ese JSON y lo convierte en un objeto de Java.
>
> **▶ clic** Ese objeto pasa por las reglas del negocio, que revisan, por ejemplo, que el identificador no exista. Hasta aquí no hay ni una línea de SQL. **▶ clic** Cuando las reglas dicen que sí, Hibernate lo traduce a un INSERT con sus parámetros. **▶ clic** El driver toma una conexión del pool, y PostgreSQL guarda la fila y confirma con un COMMIT.
>
> Y de regreso, el mismo camino al revés: la fila se vuelve objeto, el objeto se vuelve JSON y la pantalla muestra la solicitud creada, con un 201.

**Si hay tiempo, se puede agregar**

> Entre el controlador y la base hay dos objetos distintos a propósito: la Solicitud del negocio, que no sabe nada de tablas, y la SolicitudEntity, que es el reflejo de la tabla. Un adaptador traduce entre los dos.
>
> Si el identificador ya existe, el viaje se corta en las reglas: no se toca la base y la persona recibe un 409 con el motivo.

**Para pasar:** “Para hablar con la base, la aplicación necesita su dirección, su usuario y su clave. ¿Dónde están?”

### 17. ¿Dónde está la cadena de conexión?

**En pantalla · De dónde sale cada valor:**

- Centro: El servicio al arrancar: application.properties solo tiene marcadores. (url=${DB_URL}; username=${DB_USER}; password=${DB_PASSWORD})
- Viene de Docker Compose: compose.yaml, en cada servicio: DB_URL → db-solicitudes:5432
- Viene de Kubernetes · Deployment: La dirección y el usuario: DB_URL · DB_USER
- Viene de Kubernetes · Secret: La clave, guardada aparte: DB_PASSWORD ← Secret arka-postgres
- Llega a db-solicitudes: PostgreSQL 17 por pool de conexiones
- Nunca: La imagen Docker: no lleva ni dirección ni clave. La misma imagen sirve en cualquier ambiente.

**Ideas clave:**

- El código solo tiene marcadores: ${DB_URL}
- Compose los llena con variables de entorno
- Kubernetes: la dirección en el Deployment y la clave en un Secret
- La imagen no lleva ni dirección ni clave

**Por qué importa:** Cambiar de servidor o rotar una clave no obliga a recompilar ni a tocar el código.

**Lo que se lleva el staff:** Las claves fuera del código: rotarlas o cambiar de servidor no requiere recompilar.

**Qué decir**

> Esta es la pregunta que siempre nos hacen: ¿dónde está la cadena de conexión? Empecemos por el centro: el servicio, al arrancar, lee su archivo de configuración, y ese archivo no tiene la dirección ni la clave. Solo tiene marcadores: DB_URL, DB_USER y DB_PASSWORD.
>
> ¿Quién llena esos marcadores? El ambiente donde corre. **▶ clic** En Docker Compose, las variables se definen para cada servicio en el archivo compose.yaml. **▶ clic** En Kubernetes, la dirección y el usuario van en el Deployment, **▶ clic** y la clave se guarda aparte, en un Secret: un objeto del clúster hecho para datos sensibles, que el contenedor recibe como variable al arrancar.
>
> **▶ clic** Con esos valores, el servicio abre su pool de conexiones contra la base.
>
> **▶ clic** ¿Y la imagen Docker? No lleva ni dirección ni clave. Es la misma imagen en desarrollo, en pruebas y en producción. Cambiar de servidor de base de datos o rotar una clave no obliga a recompilar ni a tocar el código.

**Si hay tiempo, se puede agregar**

> Un detalle honesto: el archivo de configuración trae un valor por defecto para trabajar en la computadora de cada uno. En un ambiente real nunca se usa, porque ahí siempre llegan las variables.
>
> En el pipeline, la clave de la base de pruebas cambia en cada ejecución: se arma con el número de la corrida. Ni siquiera la base temporal tiene una clave fija.

**Si preguntan:** ¿El Secret no está en el repositorio?

**Respuesta corta:** En este laboratorio sí, con una clave de ejemplo, para que cualquiera lo levante. En un ambiente real el Secret se crea aparte, o lo alimenta un gestor de secretos, y nunca se versiona.

**Si preguntan:** ¿Y si no usamos Kubernetes?

**Respuesta corta:** La misma idea funciona con variables de entorno del servidor o con un gestor de secretos. Lo importante es que la clave no viva en el código ni en el paquete que se despliega.

**Si preguntan:** ¿Quién puede ver la clave en Kubernetes?

**Respuesta corta:** Quien tenga permiso de leer Secrets en ese espacio del clúster; ese acceso se controla con roles.

**Para pasar:** “Con la conexión resuelta, mi compañero de base de datos les cuenta qué pasa cuando se guarda: la transacción.”

**Para leer más:** `docs/inicio/bases-de-datos-locales.md`

> **Entregas la palabra** a Base de datos (lámina 18).

## Desarrollo 4 · Interconexión de servicios

Láminas 20–24 · unos 5 minutos.

> **Recibes la palabra** de Base de datos, después de la lámina 19.

### 20. Quién habla con quién, y cómo

**En pantalla · Tabla de tres columnas:**

- Conexión: Navegador → UI · Cómo se habla: HTTP a localhost:8088; nginx sirve la página · Por qué así: El navegador nunca conoce las direcciones internas
- Conexión: UI → servicios · Cómo se habla: nginx reenvía /api/solicitudes y /api/notificaciones · Por qué así: Cambiar una dirección no obliga a tocar la UI
- Conexión: solicitudes → notificaciones · Cómo se habla: POST del evento SolicitudEnviada en JSON, desde el relevador · Por qué así: Si notificaciones cae, solicitudes sigue funcionando
- Conexión: Cómo se encuentran · Cómo se habla: Por nombre: la red de Compose o un Service de Kubernetes · Por qué así: Sin IPs fijas: funciona igual en cualquier ambiente
- Conexión: Seguimiento · Cómo se habla: El traceId viaja en la cabecera de cada llamada HTTP · Por qué así: Una sola búsqueda en Grafana sigue todo el recorrido

**Ideas clave:**

- El navegador solo conoce la UI
- nginx reenvía /api al servicio
- El evento viaja después, desde el relevador
- Se encuentran por nombre, no por IP
- El traceId acompaña cada llamada

**Lo que se lleva el staff:** Cada conexión tiene un porqué: cambiar una dirección o seguir un error no obliga a tocar todo.

**Qué decir**

> Gracias. Ya vimos que los servicios no comparten base. Entonces, ¿cómo se hablan? Esta tabla lo resume, fila por fila. Primero, el navegador solo conoce la interfaz, nunca las direcciones internas.
>
> **▶ clic** La interfaz tampoco llama directo a los servicios: nginx, su servidor web, recibe todo lo que empieza con /api y lo reenvía al servicio que corresponde. Si un servicio cambia de dirección, la pantalla ni se entera.
>
> **▶ clic** Entre servicios, solicitudes le manda el evento a notificaciones con un POST en JSON. Pero no en el momento en que la persona envía, sino después, desde un proceso que llamamos el relevador. En un momento vemos por qué.
>
> **▶ clic** Nadie usa direcciones IP: cada pieza encuentra a la otra por su nombre. **▶ clic** Y en cada llamada viaja un traceId, un número que nos deja seguir el recorrido completo en los logs.

**Si hay tiempo, se puede agregar**

> nginx espera menos que la interfaz, nueve segundos contra diez, para que el proxy responda con un error claro antes de que el navegador corte la petición.
>
> La llamada entre servicios usa un cliente HTTP preparado para pasar el traceId. Con un cliente cualquiera, el seguimiento entre servicios se rompería; por eso es una regla del equipo.

**Si preguntan:** ¿Por qué no se llaman directamente por localhost?

**Respuesta corta:** Porque dentro de un contenedor localhost es el mismo contenedor; por eso cada servicio se busca por su nombre.

**Si preguntan:** ¿Por qué HTTP y no una cola de mensajes como RabbitMQ o Kafka?

**Respuesta corta:** Para el laboratorio, HTTP con Outbox da la garantía que necesitamos sin otra pieza que operar. Si el volumen crece, el mismo diseño se puede pasar a una cola sin tocar las reglas.

**Para pasar:** “Hay dos formas de hablarse, y usamos las dos.”

### 21. Síncrono o asíncrono

**En pantalla · Dos maneras, lado a lado:**

- Síncrono: La UI llama y espera que se complete el proceso.; Respuesta inmediata; Si el servicio se cae, la persona ve error
- Asíncrono: Servicio solicitudes envía evento a servicio notificaciones y continúa con su proceso; Respuesta puede demorar; Si notificaciones se cae, el evento espera

**Ideas clave:**

- Síncrono: la UI llama y espera
- Asíncrono: solicitudes envía el evento y sigue
- Síncrono responde ya; asíncrono puede demorar
- Si notificaciones se cae, el evento espera

**Comparación:** Síncrono es una llamada: me quedo en la línea hasta que me responden. Asíncrono es un correo: lo envío y sigo con lo mío.

**Lo que se lleva el staff:** La caída de un sistema secundario no detiene a quien está atendiendo al usuario.

**Qué decir**

> Hay dos formas de comunicarse. La síncrona es como una llamada telefónica: la interfaz llama y espera a que el proceso se complete. La respuesta es inmediata, y por eso la usamos para crear, aprobar o rechazar: la persona necesita saber el resultado en ese momento. El costo es que, si el servicio se cae, la persona ve el error.
>
> **▶ clic** La asíncrona es como un correo: el servicio de solicitudes envía el evento a notificaciones y continúa con su proceso, sin esperar. La respuesta puede demorar unos segundos, pero si notificaciones se cae, el evento no se pierde: espera hasta que el servicio vuelva.
>
> La regla que aprendimos: lo que la persona necesita ver, síncrono; lo que puede esperar, asíncrono. Y esto pasa también en sus sistemas de hoy: un procedimiento que llama a otro sistema y espera su respuesta falla si el otro está caído.

**Si hay tiempo, se puede agregar**

> Un ejemplo de la vida diaria: cuando pagamos con tarjeta, la aprobación es síncrona, porque necesitamos saber si pasó; el correo con el comprobante es asíncrono, porque puede llegar un minuto después.
>
> La pregunta que nos hacemos en cada caso es: si el otro sistema está caído, ¿la persona tiene que enterarse? Si la respuesta es no, va asíncrono.

**Si preguntan:** ¿Por qué no hacerlo todo asíncrono?

**Respuesta corta:** Porque quien crea o aprueba una solicitud necesita saber en ese momento si se pudo. Lo asíncrono es para lo que puede esperar.

**Para pasar:** “¿Y cómo logramos que el evento espere sin perderse? Con el patrón Outbox.”

### 22. Patrón Outbox: guardar primero, avisar después

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

**Lo que se lleva el staff:** Ningún aviso se pierde, aunque el otro sistema esté caído. Y se puede aplicar también con procedimientos y un job.

**Qué decir**

> Pensemos en el problema. Si al enviar una solicitud llamáramos directamente a notificaciones y justo estuviera caído, la solicitud quedaría enviada y nadie se enteraría. Por eso usamos el patrón Outbox, o bandeja de salida, que se apoya en la transacción que vimos en la parte de datos.
>
> Al enviar, en una sola transacción se guardan la solicitud como enviada y su aviso pendiente. O se guardan las dos cosas, o ninguna, y la persona recibe su respuesta enseguida. **▶ clic** El aviso queda esperando en la tabla evento, como una carta en la bandeja de salida.
>
> **▶ clic** Después, un proceso que llamamos el relevador revisa la bandeja cada cinco segundos y entrega los pendientes, con hasta tres intentos. **▶ clic** Si notificaciones lo recibe, la fila se marca como procesada. **▶ clic** Si falla, la fila sigue pendiente, con el mismo número de evento, y se reintenta en el siguiente ciclo.
>
> Esto se puede aplicar hoy mismo en un sistema con procedimientos almacenados: en lugar de llamar a otro sistema dentro del procedimiento, se anota el aviso en una tabla de pendientes y un job lo entrega.

**Si hay tiempo, se puede agregar**

> El relevador hace hasta tres intentos por ciclo, esperando un poco más entre cada uno. Si los tres fallan, no pasa nada grave: la fila sigue pendiente y el siguiente ciclo, cinco segundos después, vuelve a intentar.
>
> El número del evento se genera una sola vez, al guardar. Por eso cada reintento manda exactamente el mismo número, y del otro lado se puede reconocer como repetido.
>
> En un sistema con procedimientos se traduce así: una tabla de pendientes con una columna procesado, un INSERT dentro de la misma transacción del procedimiento y un job que recorre los pendientes.

**Si preguntan:** ¿Que el envío responda bien significa que el aviso ya existe?

**Respuesta corta:** No. Significa que la solicitud y el evento quedaron guardados; el aviso llega después.

**Si preguntan:** ¿Qué pasa si se cae solicitudes con avisos pendientes?

**Respuesta corta:** Nada se pierde: están en la base. Cuando el servicio vuelve, el relevador los encuentra y los entrega.

**Para pasar:** “Pero si se reintenta, ¿no puede llegar el aviso dos veces?”

**Para leer más:** `docs/arquitectura/flujo-y-referencias.md`

### 23. Idempotencia: el mismo evento, un solo aviso

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

**Lo que se lleva el staff:** Se puede reintentar sin miedo: un pago, un correo o un aviso nunca se duplica.

**Qué decir**

> Sí, puede llegar dos veces. Imaginen que notificaciones recibió el evento y creó el aviso, pero la respuesta se perdió en la red. El relevador cree que falló y lo vuelve a mandar. Para eso está la idempotencia: repetir la misma operación no multiplica su efecto.
>
> Así funciona: llega el evento con su número. **▶ clic** Notificaciones busca ese número en la tabla evento_procesado. **▶ clic** Si es nuevo, crea el aviso **▶ clic** y anota el número, en la misma transacción. **▶ clic** Si ya estaba, lo ignora: no se crea otro aviso. Como un portero con lista de invitados.
>
> Los dos patrones se complementan: el Outbox evita perder y la idempotencia evita duplicar. Y sirve en cualquier sistema: todo proceso que se reintenta, un pago, un correo, un registro, debería tener una tabla de procesados con una llave única.

**Si hay tiempo, se puede agregar**

> Lo probamos a propósito: la interfaz tiene un botón para reentregar un evento ya consumido, y el contador de avisos duplicados se mantiene en cero.
>
> La idempotencia no es solo para mensajes: un pago, un registro de asistencia o una importación de archivos deberían poder reintentarse sin duplicar. La receta es la misma: un número único por operación y una tabla que lo recuerde.

**Si preguntan:** ¿Qué resuelve el Outbox y qué resuelve la idempotencia?

**Respuesta corta:** El Outbox evita perder el evento; la idempotencia evita duplicar su efecto.

**Si preguntan:** ¿Y si llegan dos entregas al mismo tiempo?

**Respuesta corta:** La llave primaria de evento_procesado lo impide: solo una de las dos transacciones puede anotar el número; la otra falla y su reintento lo encuentra ya procesado.

**Para pasar:** “Esto es lo que aprendimos de la interconexión.”

### 24. Interconexión: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 0 avisos perdidos
- Métrica: 0 avisos duplicados
- Síncrono para ver, asíncrono para avisar: La UI espera la respuesta; el evento se entrega después. Valor: Una caída parcial no detiene a quien usa el sistema.
- Guardar primero, avisar después: Solicitud y evento en la misma transacción; el relevador entrega. Valor: Un servicio caído no hace perder información.
- Todo reintento necesita idempotencia: Un número de evento fijo y la lista de los ya recibidos. Valor: Reintentar sin miedo a duplicar.
- El contrato es lo único compartido: SolicitudEnviada: eventoId, id y tipo, igual en los dos lados. Valor: Equipos independientes con un acuerdo claro.

**Ideas clave:**

- Síncrono para ver, asíncrono para avisar
- Guardar primero, avisar después
- Todo reintento necesita idempotencia
- El contrato es lo único compartido

**Lo que se lleva el staff:** Cero avisos perdidos y cero duplicados, con patrones que sirven en cualquier tecnología.

**Qué decir**

> Cuatro aprendizajes. **▶ clic** Síncrono para lo que la persona necesita ver, asíncrono para lo que puede esperar. **▶ clic** Guardar primero y avisar después: una transacción local y una bandeja de salida son más confiables que coordinar dos sistemas al mismo tiempo.
>
> **▶ clic** Todo reintento necesita idempotencia del otro lado. **▶ clic** Y entre dos servicios, lo único compartido es el contrato del mensaje; si cambia, cambia en los dos lados.

**Si hay tiempo, se puede agregar**

> Juntos, Outbox e idempotencia logran lo que en la industria se llama entrega al menos una vez con efecto exactamente una vez. Es la base de muchos sistemas de pagos y de notificaciones.

**Para pasar:** “Hasta aquí, el código y los datos. Ahora, ¿cómo llevamos todo esto a cualquier ambiente? Le paso la palabra a infraestructura.”

> **Entregas la palabra** a Infraestructura 1 (lámina 25).

## Base de datos · Base de datos

Láminas 11–13, 18–19 · unos 5 minutos.

> **Recibes la palabra** de Desarrollo 2, después de la lámina 10.

### 11. Dos bases, una por servicio

**En pantalla · Números grandes:**

- 2 bases de datos: db-solicitudes y db-notificaciones: una por servicio.
- 17 PostgreSQL: El mismo motor y la misma versión en las dos.
- 0 JOIN entre bases: Ni consultas ni llaves foráneas que crucen de una a otra.
- 1 disco por base: En Kubernetes, los datos sobreviven aunque el contenedor se reinicie.

**Ideas clave:**

- Dos bases de datos, una por servicio
- El mismo motor: PostgreSQL 17
- Ninguna consulta cruza de una base a otra
- En Kubernetes, cada base tiene su disco

**Lo que se lleva el staff:** Cada base cambia a su ritmo, sin coordinar despliegues con otros equipos.

**Qué decir**

> Gracias. Como les contó mi compañero de arquitectura, el sistema tiene dos bases de datos, una para cada microservicio: db-solicitudes y db-notificaciones. **▶ clic** Las dos están montadas en PostgreSQL, versión diecisiete.
>
> ¿Por qué dos y no una? Porque cada servicio es dueño de sus datos. Solicitudes guarda las solicitudes y los avisos que tiene pendientes; notificaciones guarda qué avisos ya recibió. Si mañana una cambia su estructura, la otra ni se entera.
>
> **▶ clic** Eso tiene una consecuencia que para quienes trabajamos con bases de datos pesa mucho: no hay ningún JOIN entre las dos bases, ni llaves foráneas que crucen. Si un servicio necesita algo del otro, se lo pregunta por HTTP.
>
> **▶ clic** Y cada base corre en su propio contenedor. En Kubernetes, además, tiene su disco persistente: los datos sobreviven aunque el contenedor se reinicie.

**Si hay tiempo, se puede agregar**

> En nuestra computadora, la base de notificaciones se publica en el puerto 5433 para consultarla con cualquier herramienta; la de solicitudes solo se ve dentro de la red de Docker. Lo que no se publica, no se alcanza desde afuera.
>
> En Kubernetes, cada base tiene su disco persistente: si el contenedor se reinicia, los datos siguen ahí. Solo se perderían si se borra el disco.

**Si preguntan:** ¿Y si necesito un reporte que junte datos de las dos?

**Respuesta corta:** Se arma fuera de los servicios, por ejemplo con una réplica o un proceso de reportes que lea de ambas. Lo que no se hace es que un servicio lea la base del otro.

**Si preguntan:** ¿No es más difícil administrar dos bases?

**Respuesta corta:** Son dos bases pequeñas con una sola responsabilidad cada una. Se respaldan y se monitorean como cualquier PostgreSQL, y la caída de una no tumba a la otra.

**Para pasar:** “Veamos qué hay dentro de cada una.”

**Para leer más:** `docs/inicio/bases-de-datos-locales.md`

### 12. La estructura de las bases

**En pantalla · Bases de datos y sus tablas:**

- db-solicitudes (PostgreSQL 17 · schema.sql): solicitud [id · PK · VARCHAR(20), tipo · VARCHAR(20), estado · CHECK: 4 estados]; evento [id · PK · BIGSERIAL, solicitud_id · FK a solicitud, tipo · SolicitudEnviada, evento_id · UUID, procesado · false = pendiente]
- db-notificaciones (PostgreSQL 17 · Hibernate): evento_procesado [evento_id · PK, uno por evento recibido]
- Entre bases: evento_id por HTTP

**Ideas clave:**

- solicitud: el trámite y su estado
- evento: los avisos pendientes de entregar
- evento_procesado: los avisos ya recibidos
- Lo único que cruza es el evento_id, por HTTP

**Por qué importa:** Cada servicio cambia su esquema sin coordinarse con el otro; solo el número del evento es compartido.

**Lo que se lleva el staff:** Un modelo pequeño, con reglas que también cuida la base: CHECK, llaves e índices.

**Qué decir**

> Veamos qué hay adentro. En la base de solicitudes, la tabla solicitud guarda el trámite: su identificador como llave primaria, el tipo y el estado. Y el estado tiene un CHECK que solo admite los cuatro valores válidos. Aunque alguien escriba directo en la tabla, la base no acepta un estado inventado.
>
> **▶ clic** Al lado está la tabla evento, que funciona como bandeja de salida: cada fila es un aviso que hay que entregar. Tiene una llave foránea a la solicitud, un número único de evento, que es un UUID, y una columna procesado: mientras está en falso, el aviso sigue pendiente.
>
> **▶ clic** En la base de notificaciones hay una sola tabla importante: evento_procesado, la lista de eventos que ya se recibieron. Su llave primaria es justamente ese número de evento.
>
> **▶ clic** Y fíjense en la flecha: lo único que pasa de una base a la otra es el evento_id, y no viaja por la base, viaja por HTTP. Esa es la frontera entre los dos servicios.

**Si hay tiempo, se puede agregar**

> La tabla evento tiene un índice parcial: solo indexa las filas pendientes. Como el relevador busca pendientes cada cinco segundos, el índice se mantiene pequeño aunque la tabla acumule años de eventos ya entregados.
>
> Las tablas se crean con un archivo schema.sql que corre en cada arranque y se puede ejecutar mil veces sin romper nada. También actualiza bases viejas, agregando lo que les falte.

**Si preguntan:** ¿Dónde se guarda el texto de cada aviso?

**Respuesta corta:** En este proyecto, en la memoria del servicio de notificaciones; en la base solo queda qué eventos se procesaron. En producción sería una tabla más.

**Si preguntan:** ¿Por qué un UUID y no un número secuencial?

**Respuesta corta:** Porque lo genera la aplicación sin consultar a la base y no se repite entre servicios. Así el mismo número sirve para reintentar sin duplicar.

**Para pasar:** “Ahora, la gran diferencia con muchas aplicaciones que manejamos hoy: dónde vive la regla del negocio.”

**Para leer más:** `docs/arquitectura/datos-y-consistencia.md`

### 13. Del procedimiento almacenado al ORM

**En pantalla · Dos caminos, lado a lado:**

- Hoy: procedimientos almacenados: Pantalla: La persona pulsa Enviar. → [clic] Aplicación: Solo pasa los parámetros. → [EXEC sp_enviar @id] Base de datos: El procedimiento decide y guarda. (aquí vive la regla)
- ARKA-Lite: un ORM: Pantalla: La persona pulsa Enviar. → [POST /enviar] Servicio Java: Decide, con su prueba. (aquí vive la regla) → [save(…)] Hibernate: Escribe el SQL. → [UPDATE + INSERT] PostgreSQL: Guarda y cuida llaves e índices.

**Ideas clave:**

- Con SP, la regla vive en la base
- Con ORM, la regla vive en el código
- Hibernate escribe el SQL de todos los días
- La base sigue cuidando datos, llaves e índices

**Por qué importa:** No es todo o nada: las reglas van al código y los reportes o consultas pesadas pueden seguir en SQL.

**Lo que se lleva el staff:** Reglas que se prueban en segundos y una base que sigue cuidando los datos.

**Qué decir**

> Esta es la gran diferencia con muchas de las aplicaciones que gestionamos hoy, y no es la base de datos: es dónde vive la regla del negocio. Arriba, el enfoque que conocemos: la persona pulsa enviar, la aplicación solo pasa parámetros con un EXEC, y el procedimiento almacenado decide y guarda. La regla vive en la base.
>
> **▶ clic** Abajo, ARKA-Lite: la regla vive en el servicio Java, junto con su prueba. Cuando decide que sí, Hibernate, que es el ORM, escribe el UPDATE y el INSERT. La base sigue guardando y cuidando llaves, restricciones e índices. Lo único que se movió es la decisión.

**Si hay tiempo, se puede agregar**

> No estamos diciendo que los procedimientos estén mal: son la herramienta correcta para procesos masivos y reportes. Lo que cambia es dónde ponemos las reglas que más cambian y que más necesitamos probar.
>
> Una ventaja que no se ve a primera vista: con la regla en el código, cada cambio pasa por revisión, pruebas automáticas y pipeline, igual que cualquier otra línea del sistema.

**Si preguntan:** ¿Y el rendimiento? ¿El SQL que genera Hibernate es bueno?

**Respuesta corta:** Para guardar y buscar por llave, sí. Para consultas complejas se puede escribir SQL propio; además, los índices y las restricciones siguen siendo trabajo de la base.

**Si preguntan:** ¿Hay que migrar todos los procedimientos?

**Respuesta corta:** No. Se puede empezar por las reglas que más cambian; los reportes y los procesos masivos pueden seguir en la base.

**Para pasar:** “Mi compañero de desarrollo se los muestra con una regla real, escrita de las dos formas.”

**Para leer más:** `docs/arquitectura/datos-y-consistencia.md`

> **Entregas la palabra** a Desarrollo 3 (lámina 14).

> **Recibes la palabra** de Desarrollo 3, después de la lámina 17.

### 18. Una transacción: todo o nada

**En pantalla · Flujo paso a paso:**

- 1. Pool: HikariCP presta una de sus conexiones.
- 2. BEGIN: Empieza la transacción.
- 3. UPDATE: La solicitud pasa a ENVIADA.
- 4. INSERT: El aviso queda pendiente en evento.
- 5. COMMIT: Las dos cosas quedan guardadas.
- Si si algo falla en el paso 4: ROLLBACK: No queda nada a medias: ni la solicitud ni el aviso.

**Ideas clave:**

- El pool presta una conexión
- BEGIN: empieza la transacción
- Se actualiza la solicitud y se anota el aviso
- COMMIT: todo queda guardado
- Si algo falla: ROLLBACK de todo

**Lo que se lleva el staff:** Lo que cambia junto se guarda junto: nunca quedan datos a medias.

**Qué decir**

> Gracias. Para quienes administran bases de datos, esto es terreno conocido, solo que configurado desde la aplicación. Cuando llega una petición, el pool de conexiones, HikariCP, le presta una de sus conexiones abiertas; por defecto mantiene hasta diez y las reutiliza.
>
> **▶ clic** Cuando un método lleva la anotación Transactional, empieza una transacción: es el BEGIN de siempre. **▶ clic** Al enviar una solicitud, primero se actualiza su estado a enviada, **▶ clic** y en la misma transacción se anota el aviso pendiente en la tabla evento. **▶ clic** Al final, el COMMIT guarda las dos cosas juntas.
>
> **▶ clic** Y si algo falla en el medio, se hace ROLLBACK de todo: no queda una solicitud enviada sin su aviso, ni un aviso sin su solicitud. Esa garantía es la base de lo que les va a explicar mi compañero de interconexión.

**Si hay tiempo, se puede agregar**

> Abrir una conexión nueva a PostgreSQL toma su tiempo; con muchas peticiones, eso se nota. Por eso el pool las mantiene abiertas y las presta: es la diferencia entre responder rápido y saturar la base.
>
> La transacción envuelve todo el método enviar: si el INSERT del evento fallara, por ejemplo por una restricción, el UPDATE de la solicitud también se deshace.

**Si preguntan:** ¿Cuántas conexiones abre cada servicio?

**Respuesta corta:** Las que define el pool; por defecto HikariCP mantiene hasta 10 y las reutiliza entre peticiones.

**Si preguntan:** ¿Esto reemplaza las transacciones dentro de un procedimiento?

**Respuesta corta:** Es el mismo concepto: BEGIN, COMMIT y ROLLBACK. Solo que la transacción la abre la aplicación, alrededor del método que hace el trabajo.

**Para pasar:** “Esto es lo que nos dejó la base de datos.”

### 19. Base de datos: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 3 tablas en dos bases
- Métrica: 0 consultas que crucen de una base a otra
- El ORM no elimina el trabajo de base de datos: Escribe el SQL rutinario; índices, CHECK y transacciones siguen siendo diseño. Valor: Reglas probadas en código y una base que se cuida sola.
- La cadena de conexión no vive en el código: Variables en Compose y un Secret en Kubernetes. Valor: Cambiar de servidor o de clave sin recompilar.
- La transacción local es la más confiable: Lo que cambia junto se guarda en el mismo COMMIT. Valor: Nunca quedan datos a medias.
- El esquema también es código: schema.sql versionado, idempotente y validado al arrancar. Valor: Despliegues repetibles y errores visibles al inicio.

**Ideas clave:**

- El ORM no elimina el trabajo de base de datos
- La cadena de conexión no vive en el código
- La transacción local es la más confiable
- El esquema también es código

**Lo que se lleva el staff:** El conocimiento de base de datos del staff sigue siendo clave, ahora junto al código.

**Qué decir**

> Cuatro aprendizajes de datos, sobre todo para quienes venimos de los procedimientos almacenados. **▶ clic** Primero: el ORM no elimina el trabajo de base de datos. Escribe el SQL rutinario, pero las llaves, las restricciones, los índices y las transacciones siguen siendo diseño de base.
>
> **▶ clic** Segundo: la cadena de conexión no vive en el código; vive en el ambiente. **▶ clic** Tercero: la transacción local sigue siendo la herramienta más confiable que tenemos. **▶ clic** Y cuarto: el esquema también es código: versionado, repetible y validado al arrancar.

**Si hay tiempo, se puede agregar**

> Para quien trabaja en base de datos, el rol no desaparece: pasa de escribir cada consulta a diseñar el modelo, cuidar índices y restricciones, y revisar el SQL que genera el ORM.

**Para pasar:** “Esa transacción local es justo la base de la siguiente parte: cómo se avisan los servicios sin perder ni duplicar nada.”

> **Entregas la palabra** a Desarrollo 4 (lámina 20).

## Infraestructura 1 · DevOps: Docker, Compose y Codespaces, y la observabilidad

Láminas 25–31, 40–41 · unos 8 minutos.

> **Recibes la palabra** de Desarrollo 4, después de la lámina 24.

### 25. ¿Qué es DevOps? Del código a la operación

**En pantalla · Las etapas del pipeline:**

- 1. Código: Ramas y Pull Request.
- 2. Construir: Maven compila.
- 3. Probar: En cada cambio.
- 4. Imagen: Docker la empaqueta.
- 5. Publicar: En GHCR.
- 6. Operar: Kubernetes la despliega.
- 7. Observar: Loki y Grafana.

**Ideas clave:**

- El código entra por ramas y Pull Request
- Se construye y se prueba solo, en cada cambio
- Se empaqueta en una imagen y se publica
- Se despliega y se opera en Kubernetes
- Se observa, y lo aprendido vuelve al código

**Lo que se lleva el staff:** Un camino único y automático del código a producción: menos pasos manuales y menos errores.

**Qué decir**

> Gracias. DevOps no es una herramienta ni un puesto: es una forma de trabajar en la que desarrollo y operación dejan de ser dos mundos separados. Todo cambio recorre el mismo camino, de forma automática y repetible. Empieza en el código, en una rama con su Pull Request.
>
> **▶ clic** Se construye, **▶ clic** y se prueba solo, en cada cambio. **▶ clic** Se empaqueta en una imagen Docker **▶ clic** que se publica en un registro. **▶ clic** Esa imagen se despliega y se opera en Kubernetes, **▶ clic** y lo que pasa adentro se observa con los logs en un solo lugar. Lo que aprendemos al observar vuelve al código, y el ciclo empieza otra vez.
>
> En las próximas láminas recorremos ese camino con ARKA-Lite, pieza por pieza: primero Docker, después el pipeline y al final Kubernetes.

**Si hay tiempo, se puede agregar**

> En ARKA-Lite, cada paso del camino tiene su herramienta: Git y GitHub para el código, Maven para construir, las pruebas automáticas, Docker para empaquetar, GHCR para publicar, Kubernetes para operar y Loki con Grafana para observar.
>
> Lo que más se nota en el día a día es que nadie hace pasos a mano: no se copian archivos a un servidor ni se corren pruebas de memoria. Si un paso falla, el camino se detiene y se sabe dónde.

**Si preguntan:** ¿DevOps es un equipo aparte?

**Respuesta corta:** Es una práctica. Puede haber personas que la impulsen, pero funciona cuando desarrollo e infraestructura comparten el mismo camino y las mismas herramientas.

**Para pasar:** “Empecemos por las dos herramientas que más se nombran: Docker y Kubernetes.”

**Para leer más:** `docs/operaciones/infraestructura-y-entrega.md`

### 26. Docker y Kubernetes: no compiten, se complementan

**En pantalla · Dos maneras, lado a lado:**

- Docker: empaqueta: Mete la app con Java y todo lo que usa; Crea una imagen que no cambia; Corre igual en una laptop o en un servidor; Compose levanta varias cajas juntas
- Kubernetes: administra: Decide dónde corre cada caja; Si una se cae, levanta otra; Le da a cada servicio un nombre fijo; Puede correr más copias si hay carga

**Ideas clave:**

- Docker empaqueta la app con todo lo que necesita
- Kubernetes decide dónde corre y la vigila
- La misma imagen sirve en los dos
- Uno sin el otro queda a medias

**Comparación:** Como el transporte de carga: Docker es el contenedor estándar y Kubernetes, el puerto que los acomoda, los vigila y reemplaza el que se daña.

**Lo que se lleva el staff:** El mismo paquete del laptop al servidor, y un sistema que se cuida solo.

**Qué decir**

> Docker y Kubernetes muchas veces se presentan como si uno reemplazara al otro, y no es así: no compiten, se complementan. Docker resuelve el clásico “en mi máquina funciona”: empaqueta la aplicación con Java y todo lo que necesita en una imagen, un paquete que no cambia y que corre igual en una laptop o en un servidor.
>
> **▶ clic** Kubernetes empieza donde termina Docker. No empaqueta nada: toma esas imágenes y las administra. Decide dónde corre cada contenedor, lo vigila y, si uno se cae, levanta otro.
>
> Piénsenlo como el transporte de carga: Docker es el contenedor estándar y Kubernetes es el puerto que los acomoda y reemplaza el que se daña. En nuestra computadora, Docker Compose levanta los ocho contenedores del sistema con un solo comando; en el clúster, esas mismas imágenes las administra Kubernetes, sin recompilar nada.

**Si hay tiempo, se puede agregar**

> La imagen de cada servicio se construye en dos etapas: una con Maven para compilar y otra solo con Java para correr. Así la imagen final es más liviana y no lleva herramientas de compilación.
>
> Además, el contenedor corre con un usuario sin privilegios: si alguien comprometiera la aplicación, no sería administrador del contenedor.

**Si preguntan:** ¿Docker es una máquina virtual?

**Respuesta corta:** No. Es más liviano: comparte el sistema operativo y solo aísla la aplicación y lo que necesita.

**Si preguntan:** ¿Necesitamos Kubernetes para todo?

**Respuesta corta:** No. Para un sistema pequeño basta Docker Compose en un servidor. Kubernetes vale la pena cuando hay varios servicios, varias copias o hay que recuperarse solo.

**Para pasar:** “Veamos cómo nace un contenedor.”

**Para leer más:** `docs/operaciones/docker-y-compose.md`

### 27. De código a contenedor

**En pantalla · Flujo paso a paso:**

- 1. Dockerfile: La receta: qué instalar y qué copiar.
- 2. Etapa build: Compila el JAR con Maven.
- 3. Imagen: Solo Java y el JAR: más liviana.
- 4. Contenedor: Corre con un usuario sin privilegios.

**Ideas clave:**

- Dockerfile: la receta
- Etapa build: compila con Maven
- Imagen: solo Java y el JAR
- Contenedor: corre sin privilegios

**Lo que se lleva el staff:** La receta queda escrita: cualquiera construye la misma imagen, en cualquier computadora.

**Qué decir**

> Así nace un contenedor. Todo empieza en el Dockerfile, que es la receta: qué se instala y qué se copia. **▶ clic** En una primera etapa, Maven compila el código y produce el archivo JAR, que es la aplicación lista para correr.
>
> **▶ clic** En la segunda etapa se arma la imagen final, solo con Java y ese JAR: más liviana y sin herramientas de compilación. Una imagen es un paquete que no cambia: la misma que probamos es la que se despliega.
>
> **▶ clic** Cuando la imagen corre, se llama contenedor. El nuestro corre con un usuario sin privilegios: si alguien comprometiera la aplicación, no sería administrador del contenedor.

**Si hay tiempo, se puede agregar**

> La primera etapa descarga las dependencias de Maven en una capa aparte. Mientras el pom.xml no cambie, esa capa se reutiliza y las siguientes construcciones tardan mucho menos.
>
> Separar la compilación de la imagen final también es seguridad: la imagen que corre no lleva Maven ni el código fuente, solo lo necesario para ejecutar.

**Para pasar:** “Un contenedor solo no es el sistema. Necesitamos levantarlos todos juntos.”

**Para leer más:** `docs/operaciones/docker-y-compose.md`

### 28. Todo el sistema con un comando

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

**Lo que se lleva el staff:** Una persona nueva levanta el sistema completo en minutos, no en un día.

**Qué decir**

> Con Docker, cada servicio viaja con su receta, y con Docker Compose levantamos el sistema completo con un solo comando: los dos servicios, sus dos bases, la interfaz y las herramientas de logs. Ocho contenedores en total.
>
> La configuración, como la cadena de conexión que vimos en la parte de datos, entra por variables de entorno. Así la misma imagen sirve en nuestra computadora y en el clúster, sin recompilar.
>
> Para alguien que llega nuevo al equipo, esto es la diferencia entre un día configurando su máquina y cinco minutos.

**Si hay tiempo, se puede agregar**

> Compose arranca las piezas en orden: primero las bases, y cada servicio espera a que su base esté sana antes de arrancar.
>
> La base de solicitudes no se publica hacia afuera; solo la ven los contenedores de la misma red. La de notificaciones sí, en el puerto 5433, para poder consultarla con cualquier herramienta.

**Si preguntan:** Dentro de un contenedor, ¿a dónde lleva localhost?

**Respuesta corta:** Al mismo contenedor, no a otro servicio. Por eso usamos el nombre del servicio.

**Para pasar:** “¿Y cómo se encuentran entre ellos?”

### 29. La red de Compose: nombres adentro, puertos afuera

**En pantalla · Tabla de tres columnas:**

- Contenedor: La UI · Su nombre dentro de la red: arka-lite-ui:8080 · Desde nuestra computadora: localhost:8088
- Contenedor: Solicitudes · Su nombre dentro de la red: servicio-solicitudes:8080 · Desde nuestra computadora: localhost:18080
- Contenedor: Notificaciones · Su nombre dentro de la red: servicio-notificaciones:8080 · Desde nuestra computadora: localhost:18081
- Contenedor: Base de solicitudes · Su nombre dentro de la red: db-solicitudes:5432 · Desde nuestra computadora: No se publica
- Contenedor: Base de notificaciones · Su nombre dentro de la red: db-notificaciones:5432 · Desde nuestra computadora: localhost:5433

**Ideas clave:**

- Adentro, los contenedores se llaman por su nombre
- Cada uno escucha en su puerto, sin chocar
- Afuera solo se publican los puertos necesarios
- La base de solicitudes no se publica

**Lo que se lleva el staff:** Saber qué se expone y qué no: menos superficie de ataque y menos confusiones al configurar.

**Qué decir**

> Una duda muy común: si todo está en contenedores, ¿cómo se encuentran? Docker Compose crea una red privada y, adentro, cada contenedor se llama por su nombre. La interfaz, por ejemplo, es arka-lite-ui y escucha en el 8080; desde nuestra computadora la abrimos en el 8088.
>
> **▶ clic** Solicitudes, adentro, es servicio-solicitudes en el 8080; afuera la vemos en el 18080. **▶ clic** Notificaciones, lo mismo, en el 18081. Fíjense que adentro los dos usan el 8080 y no chocan: cada contenedor tiene su propia dirección.
>
> **▶ clic** La base de solicitudes no se publica: solo la alcanzan los contenedores de la red. **▶ clic** La de notificaciones sí, en el 5433, para consultarla con cualquier herramienta. Y una trampa clásica: dentro de un contenedor, localhost es el mismo contenedor; por eso los servicios se buscan por nombre.

**Si hay tiempo, se puede agregar**

> Los puertos de afuera se pueden cambiar con variables, SOLICITUDES_PORT y NOTIFICACIONES_PORT, sin tocar el archivo de Compose.
>
> En Kubernetes pasa algo parecido: cada componente tiene un Service con un nombre fijo, y desde afuera solo se abre la interfaz.

**Si preguntan:** ¿Por qué 18080 y no 8080 afuera?

**Respuesta corta:** Para no chocar con otros programas que ya usan el 8080 en la computadora. Se puede cambiar con una variable, sin tocar el archivo.

**Para pasar:** “¿Y en qué orden arrancan?”

**Para leer más:** `docs/operaciones/docker-y-compose.md`

### 30. El orden de arranque: nadie empieza antes de tiempo

**En pantalla · Flujo paso a paso:**

- 1. Las bases: pg_isready: ya aceptan conexiones.
- 2. Notificaciones: Arranca cuando su base está sana.
- 3. Solicitudes: Espera a su base y a notificaciones.
- 4. La UI: Arranca al final y vigila su salud.

**Ideas clave:**

- Las bases avisan cuando aceptan conexiones
- Notificaciones espera a su base
- Solicitudes espera a su base y a notificaciones
- La UI arranca al final, con su propia prueba de salud

**Lo que se lleva el staff:** Arranques sin errores ni pasos manuales: el orden queda escrito en el archivo.

**Qué decir**

> Levantar ocho contenedores juntos tiene un riesgo: que un servicio arranque antes que su base y falle. Compose lo resuelve con pruebas de salud y dependencias. Primero arrancan las bases, y cada una avisa cuando ya acepta conexiones.
>
> **▶ clic** Notificaciones arranca solo cuando su base está sana. **▶ clic** Solicitudes espera a su base y también a notificaciones, porque le va a mandar eventos. **▶ clic** Y la interfaz arranca al final, con su propia prueba de salud.
>
> Es la misma idea que vamos a ver en Kubernetes con otro nombre: nadie recibe trabajo antes de estar listo.

**Si hay tiempo, se puede agregar**

> La prueba de salud de las bases usa pg_isready, la misma herramienta de PostgreSQL que usaría un DBA para saber si la base responde.
>
> Sin estas dependencias, el primer arranque fallaría a menudo y habría que levantar los servicios a mano, en orden.

**Si preguntan:** ¿Qué pasa si una base no arranca?

**Respuesta corta:** Su servicio no arranca tampoco, y docker compose ps muestra cuál quedó esperando. El error aparece en el lugar correcto, no como una falla rara más adelante.

**Para pasar:** “Y ese mismo comando también corre en la nube: Codespaces.”

**Para leer más:** `docs/operaciones/docker-y-compose.md`

### 31. Sin instalar nada: GitHub Codespaces

**En pantalla · Flujo paso a paso:**

- 1. Una rama: Code › Codespaces › Crear.
- 2. Máquina en la nube: 4 núcleos y Docker adentro.
- 3. levantar.sh: Construye y levanta los 8 contenedores.
- 4. Puertos https: UI, Grafana y Swagger, privados.
- 5. Usarlo: Desde el navegador.

**Ideas clave:**

- Se crea desde una rama del repositorio
- Una máquina en la nube con Docker adentro
- Un script construye y levanta los 8 contenedores
- La UI, Grafana y Swagger se abren por https

**Por qué importa:** Probar o mostrar el sistema no depende de la computadora de nadie ni de la red de la oficina.

**Lo que se lleva el staff:** Cualquiera del equipo prueba o muestra el sistema desde un navegador, sin instalar nada.

**Qué decir**

> Una pieza que resuelve cómo probar o mostrar el sistema sin instalar nada: GitHub Codespaces. Desde una rama del repositorio se crea una máquina en la nube lista para trabajar. **▶ clic** La configuración vive en el mismo repositorio, en la carpeta .devcontainer: pide cuatro núcleos y Docker adentro.
>
> **▶ clic** Al crearla, un script construye las imágenes y levanta los ocho contenedores, igual que en nuestra computadora. **▶ clic** Cada puerto queda publicado por https y privado para la cuenta que lo abrió: la interfaz, Grafana y los dos Swagger. **▶ clic** Y todo se usa desde el navegador.
>
> El valor: cualquiera del equipo puede probar o mostrar el sistema sin instalar nada y sin depender de la red de la oficina. Lo verificamos con la prueba de humo completa: siete de siete.

**Si hay tiempo, se puede agregar**

> La máquina publica cuatro puertos: la interfaz, Grafana y los dos Swagger. Un script escribe la dirección pública de cada puerto para que los enlaces de la interfaz también funcionen en la nube.
>
> Un Codespace sin uso se detiene solo a los treinta minutos, y se borra al terminar. Para el día de la presentación lo arrancamos quince minutos antes.

**Si preguntan:** ¿Cuánto cuesta?

**Respuesta corta:** GitHub lo cobra por horas de núcleo: esta máquina de 4 núcleos consume 4 por cada hora encendida. Se detiene al terminar y deja de consumir.

**Para pasar:** “¿Y quién construye y publica las imágenes en cada cambio? El pipeline. Le paso la palabra a mi compañero.”

**Para leer más:** `docs/operaciones/codespaces.md`

> **Entregas la palabra** a Infraestructura 2 (lámina 32).

> **Recibes la palabra** de Infraestructura 2, después de la lámina 39.

### 40. Todos los logs, en un solo lugar

**En pantalla · Flujo paso a paso:**

- 1. Servicios: Logs JSON con traceId y eventoId.
- 2. Promtail: Los recoge de cada contenedor.
- 3. Loki: Los guarda, etiquetados por servicio.
- 4. Grafana: Una búsqueda para todo el sistema.

**Ideas clave:**

- Cada servicio escribe sus logs en JSON
- Promtail los recoge de todos los contenedores
- Loki los guarda por servicio
- Grafana los busca por traceId o eventoId

**Comparación:** Como la caja negra de un avión: registra lo que pasó, para revisarlo después.

**Lo que se lleva el staff:** Diagnosticar un error entre sistemas en minutos, con una sola búsqueda.

**Qué decir**

> Gracias. La observabilidad la vemos de forma general. Con varios servicios, cada uno tiene sus logs, y si algo falla no queremos entrar contenedor por contenedor. Cada servicio escribe sus logs en JSON, con un formato estándar. **▶ clic** Promtail los recoge de todos los contenedores, **▶ clic** Loki los guarda etiquetados por servicio **▶ clic** y Grafana nos deja buscarlos en un solo lugar.
>
> Como cada llamada lleva su traceId, con una sola búsqueda vemos el viaje completo de un evento: cuándo lo publicó el relevador y cuándo lo consumió notificaciones. Y cada servicio expone su salud, que la interfaz muestra en verde o en rojo.

**Si hay tiempo, se puede agregar**

> Para buscar en Grafana basta una consulta como: los logs del servicio de notificaciones que contengan la palabra evento. En segundos aparecen las líneas con el número del evento.
>
> Los logs salen en un formato estándar, ECS, sin tocar el código del negocio: es una línea de configuración de Spring Boot.

**Para pasar:** “Esto es lo que aprendimos de observar el sistema.”

**Para leer más:** `docs/operaciones/observabilidad.md`

### 41. Observabilidad: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 1 lugar para buscar todos los logs
- Métrica: 8 contenedores observados
- Logs estructurados desde el día uno: JSON con formato estándar, sin cambiar el código de negocio. Valor: Buscar por campo en lugar de leer texto.
- Un identificador que cruce servicios: El traceId viaja en cada llamada y el eventoId en cada log. Valor: Diagnosticar un fallo entre servicios en minutos.
- Salud no es lo mismo que correcto: UP dice que responde; los pendientes dicen si entrega. Valor: Medir el resultado del negocio, no solo el proceso.

**Ideas clave:**

- Logs estructurados desde el día uno
- Un identificador que cruce servicios
- Salud no es lo mismo que correcto

**Lo que se lleva el staff:** Saber qué pasa adentro sin adivinar.

**Qué decir**

> Tres aprendizajes. **▶ clic** Los logs estructurados se configuran desde el día uno; después es mucho más caro. **▶ clic** En un sistema distribuido hace falta un identificador que cruce los servicios. **▶ clic** Y salud no es lo mismo que correcto: un servicio puede estar arriba y tener avisos pendientes; hay que medir el resultado, no solo el proceso.

**Si hay tiempo, se puede agregar**

> Si tuvieran que empezar por una sola cosa, sería un identificador por operación que viaje entre sistemas y aparezca en cada log. Con eso, diagnosticar deja de ser adivinar.

**Para pasar:** “Para cerrar, le devuelvo la palabra a quien abrió, con el valor que deja todo esto.”

> **Entregas la palabra** a Desarrollo 1 · orquesta (lámina 42).

## Infraestructura 2 · DevOps: CI/CD y Kubernetes

Láminas 32–39 · unos 8 minutos.

> **Recibes la palabra** de Infraestructura 1, después de la lámina 31.

### 32. CI/CD: del push a la imagen publicada

**En pantalla · Dos caminos, lado a lado:**

- Pull Request hacia main: Abres el PR: Desde tu rama feat/… → Compila y prueba: mvn verify con PostgreSQL temporal → Arranca: El servicio responde de verdad → Construye la imagen: docker build → Verde o rojo: El resultado queda en el PR (CI · integración continua: pasos 2 a 4)
- Fusión a main: Fusionas a main: Después de la revisión → El mismo CI: Compila, prueba y arranca → Publica en GHCR: La imagen, con el SHA del commit → Despliegue: kubectl apply -f k8s/ · manual (CI: pasos 2 a 2; CD · entrega continua: pasos 3 a 3; Hoy, a mano: pasos 4 a 4)

**Ideas clave:**

- Un push a una rama de trabajo, solo, no dispara nada
- Pull Request: el CI compila, prueba, arranca y construye
- Fusión a main: el mismo CI y luego el CD publica la imagen
- Desplegar en Kubernetes hoy es un paso manual

**Por qué importa:** Un cambio roto se detecta en el Pull Request, en minutos, antes de llegar a main.

**Lo que se lleva el staff:** Un error se detecta antes de llegar a main, y cada imagen se rastrea hasta su commit.

**Qué decir**

> Gracias. Así funciona el pipeline, desde el momento del push. Primero, algo que sorprende: un push a una rama de trabajo, por sí solo, no dispara nada. El pipeline arranca cuando se abre o se actualiza un Pull Request hacia main. Ahí corre la integración continua, el CI: un servidor de GitHub compila cada servicio, corre todas sus pruebas contra un PostgreSQL temporal, arranca el servicio de verdad hasta ver sus datos iniciales y construye la imagen Docker. El resultado queda en el mismo Pull Request: verde o rojo.
>
> **▶ clic** Cuando el Pull Request se aprueba y se fusiona a main, corre otra vez el mismo CI, y después viene el CD, la entrega continua: la imagen se publica en el registro de GitHub, etiquetada con el código del commit, lista para desplegar.
>
> Y una distinción que vale la pena: CD puede ser entrega continua, que es dejar la imagen lista, o despliegue continuo, que es instalarla sola en el ambiente. Nosotros llegamos a la entrega; el despliegue en Kubernetes es un paso aparte, con kubectl apply. Automatizarlo es el siguiente paso natural, con una aprobación de por medio.

**Si hay tiempo, se puede agregar**

> El pipeline prueba los dos servicios en paralelo, cada uno con su propia base temporal, y tiene un trabajo aparte para la interfaz: valida, prueba, construye y comprueba que el archivo de Compose es válido.
>
> La imagen de la interfaz solo se publica cuando el cambio llega a main; la de los servicios hoy también se publica desde el Pull Request. Es un ajuste que ya tenemos identificado.
>
> Cada imagen lleva como etiqueta el código del commit. Si algo falla en un ambiente, sabemos exactamente qué versión está corriendo y podemos volver a la anterior.

**Si preguntan:** ¿Por qué no se despliega solo?

**Respuesta corta:** Porque es un laboratorio con un clúster local. En un ambiente real se agrega un paso de despliegue con aprobación, o una herramienta que aplica en el clúster lo que está en main.

**Si preguntan:** ¿Las pruebas usan la base real?

**Respuesta corta:** No: GitHub crea un PostgreSQL temporal para cada ejecución, con una clave distinta cada vez, y lo descarta al terminar.

**Para pasar:** “Veamos qué hace el pipeline por dentro.”

**Para leer más:** `docs/automatizacion/ci-yaml-paso-a-paso.md`

### 33. Por dentro del pipeline: tres trabajos en paralelo

**En pantalla · Capas del sistema:**

- Solicitudes: Compila y prueba: mvn verify con su PostgreSQL; Arranca: Espera ver CAM-002; Imagen: docker build; Publica: En GHCR, con el SHA
- Notificaciones: Compila y prueba: mvn verify con su PostgreSQL; Imagen: docker build; Publica: En GHCR, con el SHA
- La UI: Valida y prueba: Contenido, tipos y pruebas; Construye: La aplicación y su imagen; Valida Compose: docker compose config; Publica: Solo al llegar a main

**Ideas clave:**

- Cada servicio con su propia base temporal
- Solicitudes además prueba que arranca
- La UI se valida, se prueba y se construye
- Todo corre a la vez: el resultado llega antes

**Lo que se lleva el staff:** Diagnóstico inmediato: el pipeline dice qué pieza falló y en qué paso.

**Qué decir**

> Veamos qué hace el pipeline por dentro. Son tres trabajos que corren al mismo tiempo, cada uno en su propia máquina de GitHub. El de solicitudes levanta su propio PostgreSQL, compila y corre todas las pruebas, arranca el servicio de verdad y espera ver la solicitud de ejemplo CAM-002. Si todo pasa, construye la imagen y la publica.
>
> **▶ clic** El de notificaciones hace lo mismo con su propia base: compila, prueba, construye y publica. **▶ clic** Y el de la interfaz valida su contenido, corre sus pruebas, construye la aplicación y su imagen, y además comprueba que el archivo de Compose sea válido. Su imagen solo se publica cuando el cambio llega a main.
>
> Que corran en paralelo tiene dos ventajas: el resultado llega antes, y si algo falla, el pipeline dice exactamente en cuál de las tres piezas y en qué paso.

**Si hay tiempo, se puede agregar**

> La clave de cada base de pruebas se arma con el número de la ejecución: nunca hay una clave fija en el pipeline.
>
> Para publicar en el registro de GitHub no se guarda ninguna contraseña: el pipeline usa un token temporal que GitHub le entrega a cada ejecución.

**Si preguntan:** ¿Dónde se ven los resultados?

**Respuesta corta:** En la pestaña Actions de GitHub y en el mismo Pull Request: cada trabajo con sus pasos y su registro.

**Para pasar:** “¿Y qué pasa cuando un cambio rompe algo?”

**Para leer más:** `docs/automatizacion/ci-yaml-paso-a-paso.md`

### 34. Cuando un cambio rompe algo

**En pantalla · Qué pasa cuando falla:**

- Falla: Un cambio rompe una regla: Por ejemplo, ahora deja enviar dos veces la misma solicitud.
- 1. [push] Se actualiza el PR: El pipeline arranca solo.
- 2. [minutos] Falla una prueba: La de esa regla: queda en rojo.
- 3. [en el PR] Se ve: Qué trabajo, qué paso y por qué.
- 4. [corrección] Se corrige: Nuevo push: vuelve a correr.
- Resultado: El error nunca llegó a main: Y no se publicó ninguna imagen: publicar va después de las pruebas.

**Ideas clave:**

- El cambio llega por Pull Request
- Una prueba falla y el PR queda en rojo
- Se ve qué trabajo y qué paso fallaron
- Se corrige y el pipeline vuelve a correr

**Lo que se lleva el staff:** Los errores se detienen en el Pull Request, antes de llegar a main o a una imagen.

**Qué decir**

> Veamos el caso que más valor tiene: un cambio que rompe algo. Imaginen que alguien, sin querer, cambia la regla y ahora se puede enviar dos veces la misma solicitud.
>
> **▶ clic** Al actualizar el Pull Request, el pipeline arranca solo. **▶ clic** En pocos minutos, la prueba de esa regla falla y el Pull Request queda en rojo. **▶ clic** GitHub muestra qué trabajo falló, en qué paso y el mensaje de la prueba. **▶ clic** La persona corrige, sube el cambio y el pipeline vuelve a correr.
>
> **▶ clic** El resultado: el error nunca llegó a main, y no se publicó ninguna imagen con él, porque el paso de publicar va después de las pruebas. Esa es la red de seguridad de la integración continua.

**Si hay tiempo, se puede agregar**

> Por eso cada regla del negocio tiene su prueba: la prueba es la que hace sonar la alarma.
>
> Se puede ir más lejos con una regla del repositorio que impida fusionar un Pull Request mientras el pipeline esté en rojo. Es configuración de GitHub, sin tocar el código.

**Si preguntan:** ¿Y si alguien se salta el pipeline?

**Respuesta corta:** Nadie sube directo a main: todo entra por Pull Request. Además, GitHub permite exigir que el pipeline esté en verde antes de fusionar.

**Para pasar:** “Y cuando todo pasa, cada imagen queda marcada con su commit.”

### 35. De la imagen al commit: qué código está corriendo

**En pantalla · Flujo paso a paso:**

- 1. La imagen: servicio-solicitudes:<SHA>
- 2. El commit: El SHA es el código exacto.
- 3. El Pull Request: Quién lo pidió y quién lo revisó.
- 4. Volver atrás: Desplegar la imagen anterior.

**Ideas clave:**

- Cada imagen se etiqueta con el SHA del commit
- El SHA lleva al cambio exacto
- Del commit, al Pull Request y su revisión
- Volver atrás es desplegar la imagen anterior

**Lo que se lleva el staff:** Saber siempre qué código está corriendo y poder volver atrás con certeza.

**Qué decir**

> Cuando todo pasa, queda algo muy valioso: trazabilidad. Cada imagen publicada lleva como etiqueta el SHA del commit, ese código largo que identifica un cambio en Git. **▶ clic** Con ese código llegamos al cambio exacto: qué líneas cambiaron.
>
> **▶ clic** Del commit llegamos al Pull Request: quién lo pidió, quién lo revisó y qué pruebas pasó. **▶ clic** Y si una versión da problemas, volver atrás es desplegar la imagen del commit anterior, que sigue publicada en el registro.
>
> Para operación, esto cambia la conversación: ya no es “¿qué versión tenemos?”, sino “esta imagen es este commit, revisado por estas personas”.

**Si hay tiempo, se puede agregar**

> Etiquetar con el SHA, y no con latest, evita la duda clásica de si la imagen que corre es la nueva o la vieja.
>
> En Kubernetes, el manifiesto dice qué imagen usar; cambiar de versión es cambiar esa línea y volver a aplicar.

**Si preguntan:** ¿Por qué no usar la etiqueta latest?

**Respuesta corta:** Porque latest cambia con cada publicación y no dice qué código es. Con el SHA, la etiqueta nunca miente.

**Para pasar:** “La imagen ya está publicada y rastreada. Ahora, dónde corre: Kubernetes.”

### 36. Cómo trabaja Kubernetes: del archivo al Pod

**En pantalla · Flujo paso a paso:**

- 1. Manifiesto YAML: Qué imagen, cuántas copias y qué variables.
- 2. kubectl apply: Se lo entrega al clúster.
- 3. Deployment: Crea los Pods con la imagen.
- 4. Service: Un nombre fijo para encontrarlos.
- 5. Ciclo de control: Compara lo que hay con lo pedido y corrige.

**Ideas clave:**

- Escribimos el estado deseado en YAML
- kubectl apply se lo entrega al clúster
- El Deployment crea los Pods
- El Service les da un nombre fijo
- Kubernetes compara y corrige sin parar

**Comparación:** Como un termostato: no le decimos cuándo prender el aire, le decimos la temperatura que queremos y él se encarga.

**Lo que se lleva el staff:** El clúster se mantiene solo como lo describimos, sin intervención manual.

**Qué decir**

> Para entender Kubernetes hay que cambiar el chip: no le damos órdenes paso a paso, le decimos cómo queremos que esté el sistema. Eso se escribe en un archivo YAML, un manifiesto: qué imagen usar, cuántas copias de cada servicio y qué variables recibe.
>
> **▶ clic** Con kubectl apply, ese archivo se le entrega al clúster. **▶ clic** El Deployment lee el manifiesto y crea los Pods, que son donde corren los contenedores. **▶ clic** El Service les da un nombre fijo, para que los demás los encuentren aunque un Pod se reemplace.
>
> **▶ clic** Y lo más importante: Kubernetes compara todo el tiempo lo que hay con lo que pedimos. Si falta algo, lo crea; si sobra, lo quita. A eso se le llama ciclo de control, y es lo que hace que el sistema se repare solo.

**Si hay tiempo, se puede agregar**

> Todos los manifiestos de ARKA-Lite están en la carpeta k8s del repositorio: cinco archivos, uno por componente, con su Deployment, su Service y, en las bases, su disco persistente.
>
> Como el estado deseado está en archivos versionados, reconstruir el sistema completo en otro clúster es volver a aplicar esos archivos.

**Si preguntan:** ¿Qué pasa si alguien cambia algo a mano en el clúster?

**Respuesta corta:** El ciclo de control lo devuelve a lo que dice el manifiesto. Por eso los cambios se hacen en el archivo, versionado en el repositorio, y no a mano.

**Para pasar:** “Veamos las piezas que usamos en ARKA-Lite.”

**Para leer más:** `docs/operaciones/kubernetes-local.md`

### 37. Los recursos de Kubernetes

**En pantalla · Capas del sistema:**

- Acceso: Service: Un nombre fijo por componente; port-forward: La UI en localhost:8088
- Cómputo: 5 Deployments: UI, 2 servicios y 2 bases; initContainers: Esperan a la base y al otro servicio; readinessProbe: Sin tráfico hasta estar listo
- Configuración: Secret arka-postgres: La clave de las bases; Variables de entorno: DB_URL, NOTIFICACIONES_URL
- Datos: PersistentVolumeClaim: Un disco por base: sobrevive al Pod

**Ideas clave:**

- Deployment y Pod por componente
- Service: un nombre fijo
- Secret para la clave de la base
- Un disco persistente para cada base

**Lo que se lleva el staff:** El estado del sistema queda escrito y versionado, no en la memoria de alguien.

**Qué decir**

> Estas son las piezas que usamos en ARKA-Lite. Arriba, el acceso: un Service le da a cada componente un nombre fijo, para que los demás lo encuentren aunque el contenedor cambie.
>
> **▶ clic** Luego, el cómputo: un Deployment por componente, cinco en total, que dice cuántas copias queremos. Antes de arrancar, cada servicio espera a que su base responda, y una prueba de salud evita mandarle tráfico antes de tiempo.
>
> **▶ clic** La configuración: la clave de la base en un Secret, como vimos en la parte de datos, y el resto en variables de entorno. **▶ clic** Y los datos: cada base tiene su disco persistente, que sobrevive aunque el Pod se recree. Todo se aplica con un solo comando: kubectl apply sobre la carpeta k8s.

**Si hay tiempo, se puede agregar**

> Antes de arrancar cada servicio, un contenedor previo espera a que su base responda. Sin eso, el servicio arrancaría, no encontraría la base y se reiniciaría una y otra vez.
>
> La prueba de salud le dice a Kubernetes cuándo el servicio está listo para recibir tráfico. Arrancar no es lo mismo que estar listo, y esa diferencia evita errores en los primeros segundos.

**Si preguntan:** ¿Por qué la base corre como un Deployment y no como un servicio administrado?

**Respuesta corta:** Porque es un ambiente de laboratorio. En producción conviene una base administrada o un StatefulSet con respaldos.

**Para pasar:** “¿Y qué pasa cuando algo se cae?”

**Para leer más:** `docs/operaciones/kubernetes-local.md`

### 38. Cuando un Pod se cae

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

**Lo que se lleva el staff:** Un sistema que se recupera solo, sin que nadie se despierte a las tres de la mañana.

**Qué decir**

> Ya vimos que Kubernetes compara todo el tiempo lo que hay con lo que pedimos. Veamos qué pasa cuando se cae el Pod de solicitudes, por un error, porque se reinició el servidor o porque alguien lo borró.
>
> **▶ clic** En el mismo instante, el Deployment detecta que falta una copia. **▶ clic** En un segundo, crea un Pod nuevo con la misma imagen. **▶ clic** El Pod nuevo espera a que su base y notificaciones respondan, **▶ clic** y solo cuando su prueba de salud contesta, vuelve a recibir tráfico.
>
> **▶ clic** Nadie intervino. Y como los avisos pendientes están en la base, no en memoria, nada se pierde mientras tanto. Aquí se juntan las tres partes que vimos a fondo: la base guarda, el Outbox espera y Kubernetes repara.

**Si hay tiempo, se puede agregar**

> Se demuestra en un minuto: se borra el Pod con kubectl delete y, mirando la lista de Pods, aparece uno nuevo que en unos segundos vuelve a estar listo.
>
> Si lo que se cae es la base, pasa lo mismo: su Pod se recrea y los datos siguen en el disco persistente.

**Si preguntan:** ¿Y si se cae la base?

**Respuesta corta:** Su Pod también se recrea y los datos siguen en el disco persistente; los servicios esperan a que vuelva.

**Para pasar:** “Esto es lo que aprendimos de DevOps.”

### 39. DevOps: lo que aprendimos

**En pantalla · Lo que aprendimos:**

- Métrica: 1 comando para levantar todo
- Métrica: 1 imagen por commit, rastreable
- Docker y Kubernetes se complementan: Uno empaqueta; el otro ejecuta y cuida. Valor: Un mismo paquete, de la laptop al clúster.
- La imagen es el entregable: Lo que prueba el pipeline es lo que se despliega. Valor: Sin sorpresas entre ambientes.
- Configurar por variables: La cadena de conexión y las direcciones vienen del ambiente. Valor: Un solo artefacto para todos los ambientes.
- Declarar el estado deseado: Deployments, pruebas de salud y un pipeline que arranca el servicio. Valor: El clúster se repara solo y los errores aparecen antes.

**Ideas clave:**

- Docker y Kubernetes se complementan
- La imagen es el entregable
- Configurar por variables, no por código
- Declarar el estado y probar que arranca

**Lo que se lleva el staff:** Despliegues repetibles y un sistema que se repara solo.

**Qué decir**

> Cuatro aprendizajes de DevOps. **▶ clic** Docker y Kubernetes no compiten: uno empaqueta y el otro ejecuta y cuida. **▶ clic** La imagen es el entregable: lo que prueba el pipeline es exactamente lo que se despliega.
>
> **▶ clic** Configurar por variables y no por código, empezando por la cadena de conexión. **▶ clic** Y declarar el estado que queremos, y probar que el servicio arranca, no solo que compila.

**Si hay tiempo, se puede agregar**

> Lo que más valor nos dio de DevOps fue que todo quedó escrito: la receta de cada imagen, el archivo de Compose, los manifiestos de Kubernetes y el pipeline. Nada depende de la memoria de una persona.

**Para pasar:** “Ya está desplegado. ¿Cómo sabemos qué pasa adentro? Le devuelvo la palabra a mi compañero.”

> **Entregas la palabra** a Infraestructura 1 (lámina 40).

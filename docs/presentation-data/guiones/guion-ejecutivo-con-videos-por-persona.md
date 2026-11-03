# Guion por persona · con videos · 7 personas

> Archivo generado por `npm run guiones` desde `docs/presentation-data/contenido/`. No editar a mano: los cambios se hacen en la fuente.

Cuatro de desarrollo, una de base de datos y dos de infraestructura. Jossett apoya en base de datos y presenta CI/CD, para bajar la carga de infraestructura. Con videos, 50 láminas. Cada persona tiene aquí solo lo suyo, con el número de lámina del PPTX.

| Persona | Área | Qué presenta | Láminas | Habla |
| --- | --- | --- | --- | --- |
| Luis Cardoze | Desarrollo | Apertura y Fundamentos | 1–5 | ~4 min |
| Ricardo Fábrega | Desarrollo | Arquitectura | 6–9 | ~3 min |
| Marlene Bonilla | Base de datos | Base de datos | 10–12 y 17–18 | ~5 min |
| Jossett Franceschi | Desarrollo | Apoyo en base de datos: la misma regla, el ORM y la conexión y DevOps: CI/CD | 13–16 y 29–35 | ~12 min |
| Abdiel Barria | Desarrollo | Interconexión de servicios y Demostración en video y Resultados, valor y cierre | 19–23 y 44–50 | ~10 min |
| Kevin | Infraestructura | DevOps: qué es, Docker y Compose | 24–28 | ~4 min |
| Moises | Infraestructura | DevOps: Kubernetes, y la observabilidad | 36–43 | ~7 min |

## Luis Cardoze · Apertura y Fundamentos

Láminas 1–5 · unos 4 minutos.

> **Recibes la palabra** al empezar la presentación.

### 1. Del endpoint al clúster

**Qué decir**

> Buenos días. Ya vimos los fundamentos y una primera mirada a los temas que ahora vamos a desarrollar: cómo se guardan y se protegen los datos, cómo se comunican los servicios y cómo llevamos una aplicación del código a la operación.
>
> Todo lo vamos a ver con ARKA-Lite, nuestro proyecto final del curso.
>
> Veamos cómo organizamos el recorrido.

**Si se te olvida, di esto**

- Retomamos lo que ya vieron para profundizar en los datos, la comunicación entre servicios y la operación de la aplicación.
- Lo vemos con ARKA-Lite, nuestro proyecto final.

**Qué hacer** (no se dice)

- El moderador ya presentó al equipo: saludar y entrar directo al tema, sin volver a presentarse.
- Antes de empezar, abrir este PPTX en la computadora de la sala y probar los videos: van dentro del archivo, no necesitan internet ni el sistema arriba.

**Si hay tiempo**

> ARKA-Lite nació como laboratorio del curso, así que aplicamos cada tema al mismo sistema. Primero hicimos una operación y después agregamos la base, la comunicación, los contenedores, el pipeline y los registros.
>
> Trabajamos como un equipo real. Cada cambio se hizo por separado, otra persona lo revisó y las pruebas automáticas lo validaron antes de incorporarlo.

### 2. Qué vamos a ver

**Qué decir**

> Primero les contamos lo que nos quedó de los fundamentos y la arquitectura, porque esos temas ya los vieron en la presentación anterior. Dedicaremos más tiempo a otros tres temas: la base de datos, cómo se comunican los servicios sin perder información y DevOps, que abarca cómo construimos, publicamos y operamos el sistema.
>
> Después vemos la observabilidad, que es cómo sabemos lo que pasa adentro, y les mostramos en video el sistema funcionando, incluso cuando apagamos una parte a propósito. Cerramos con los resultados.
>
> Empecemos con lo que nos quedó de los fundamentos.

**Si se te olvida, di esto**

- Primero compartimos lo que nos quedó de los fundamentos y la arquitectura.
- Nos detenemos en la base de datos, la comunicación entre servicios y DevOps.

**Si hay tiempo**

> Las partes generales son breves porque dedicaremos más tiempo a los datos, la comunicación entre sistemas y la operación, que son los temas con mayor valor práctico.

### 3. Lo primero: analizar antes de programar

**Qué decir**

> De los fundamentos, lo primero que nos quedó es analizar antes de programar. Antes de escribir código nos hicimos tres preguntas sobre el negocio.
>
> Primero, qué tiene que pasar. Una persona registra una solicitud, como una incidencia o un pedido de cambio, la envía, y otra persona la aprueba o la rechaza. De ahí salieron cuatro estados: borrador, enviada, aprobada y rechazada.
>
> Segundo, quién hace cada paso. Quien solicita envía, el sistema avisa y otra persona decide. Gestionar la solicitud y producir el aviso son trabajos distintos, y por eso los separamos en dos servicios.
>
> Tercero, qué no se puede permitir. Estas son las reglas de ARKA-Lite: una solicitud solo puede enviarse cuando está en borrador y una sola vez. Solo una solicitud enviada puede aprobarse o rechazarse. Cada regla quedó con su prueba automática.
>
> Con el qué ya definido, pasamos al cómo: escribir código que se pueda cambiar con confianza.

**Si se te olvida, di esto**

- Antes de programar, aclaramos el proceso y sus responsables.
- Las respuestas produjeron cuatro estados y dos servicios.
- Cada regla importante quedó cubierta por una prueba.

**Si preguntan:** ¿Por qué los avisos van en otro servicio?

Porque cambian por motivos distintos. Así, el trámite puede seguir funcionando aunque el servicio de avisos esté caído.

**Si hay tiempo**

> La pregunta sobre lo que no podíamos permitir nos permitió definir las reglas antes de escribir código. De otra manera, habríamos descubierto esos casos más tarde y corregirlos habría costado más.
>
> La base de datos también protege los cuatro estados, porque la columna correspondiente solo acepta esos valores.
>
> Cuando arranca, el sistema registra dos solicitudes de ejemplo. El pipeline utiliza una para confirmar que el servicio realmente inició.

### 4. Código mantenible: buenas prácticas

**Qué decir**

> Otra cosa que nos quedó es cómo escribir código fácil de mantener. Son seis prácticas que sirven en cualquier lenguaje, ya sea Java, C# o PL/SQL.
>
> La primera es que cada pieza hace una sola tarea: la que recibe el pedido no decide, y la que decide no guarda. La segunda es conectar las piezas desde afuera, para poder cambiarlas o probarlas por separado. La tercera es dejar las reglas del negocio en un solo lugar, sin repetirlas en la pantalla y en la base.
>
> La cuarta es que todos los errores sigan el mismo formato y expliquen qué pasó. La quinta es usar los nombres del negocio, para que el código se lea como el proceso. Y la sexta es que cada regla tenga su prueba automática.
>
> Es como una cocina ordenada, donde cada persona tiene su puesto y cada cosa su lugar. Así, cuando cambia una regla, tocamos un solo lugar y sabemos enseguida si algo dejó de funcionar.
>
> Esto es lo que nos llevamos a cualquier proyecto.

**Si se te olvida, di esto**

- Estas prácticas sirven en cualquier lenguaje.
- Cada pieza hace una tarea y cada regla vive en un lugar.
- Las pruebas nos avisan cuando un cambio rompe algo.

**Si preguntan:** ¿Esto no hace el código más largo?

Puede producir más piezas, pero cada una es corta y se entiende por separado. Esa inversión se recupera desde el primer cambio.

**Si hay tiempo**

> Por ejemplo, la pieza que recibe los pedidos no toma decisiones, sino que los pasa a las reglas. Si cambia la regla de envío, modificamos un lugar y ejecutamos su prueba.
>
> Las mismas ideas sirven con procedimientos almacenados. Podemos tener un procedimiento por tarea, con nombres del negocio y mensajes de error claros.

### 5. Fundamentos: lo que nos quedó

**Qué decir**

> Nos quedamos con tres ideas. Primero se analiza y después se programa, porque tener claras las reglas desde el inicio evita rehacer trabajo.
>
> Segundo, separamos responsabilidades para que un cambio de regla toque un solo lugar y una prueba nos avise si algo se rompió. Tercero, las reglas del negocio no deben depender de la herramienta. Así siguen siendo las mismas si cambia la base de datos o la tecnología de la aplicación.
>
> Estas tres prácticas se pueden aplicar en los sistemas actuales, sin importar el lenguaje ni cómo esté organizada la aplicación.
>
> Ahora le paso la palabra a Ricardo, que nos muestra la arquitectura del sistema.

**Si se te olvida, di esto**

- Primero analizamos y después programamos.
- Separar responsabilidades facilita los cambios.
- Las reglas deben sobrevivir a un cambio de herramienta.

**Si hay tiempo**

> Si tuviéramos que comenzar con una práctica en un sistema existente, pondríamos las reglas del negocio en un solo lugar y agregaríamos sus pruebas. Es una inversión que devuelve valor con rapidez.

> **Entregas la palabra** a Ricardo Fábrega (lámina 6).

## Ricardo Fábrega · Arquitectura

Láminas 6–9 · unos 3 minutos.

> **Recibes la palabra** de Luis Cardoze, después de la lámina 5.

### 6. El sistema de un vistazo

**Qué decir**

> Gracias, Luis. ARKA-Lite no es una aplicación grande, sino varias piezas pequeñas, cada una con su responsabilidad. Las vemos por capas, de arriba hacia abajo.
>
> Arriba está la pantalla que usa la persona. No guarda información, solo les pasa los pedidos a los servicios.
>
> En el centro están los dos microservicios, es decir, dos aplicaciones pequeñas con una función cada una. Uno maneja las solicitudes y sus estados, y el otro produce los avisos.
>
> Debajo, cada servicio tiene su propia base de datos, y ninguno entra en la base del otro. Al final está la plataforma, donde todo corre, se prueba y se revisa.
>
> Es como un edificio donde cada piso tiene su función, y por eso se puede cambiar uno sin reconstruir los demás.
>
> Con el mapa claro, veamos cómo colaboran esas piezas en la práctica.

**Si se te olvida, di esto**

- El sistema tiene cuatro capas.
- Cada servicio tiene una tarea y una base propia.
- Las capas se pueden cambiar de forma independiente.

**Si preguntan:** ¿Por qué no comparten una sola base de datos?

Porque cada servicio debe controlar sus propios datos. Así puede cambiar sin romper al otro.

**Si hay tiempo**

> La pantalla es delgada a propósito, porque no guarda datos ni toma decisiones. Si la reemplazamos en el futuro, los servicios no tienen que cambiar.
>
> Los dos servicios comparten la misma plataforma, el mismo pipeline y el mismo lugar para revisar los registros. Eso reduce el costo operativo de mantenerlos separados.

### 7. Cómo funciona en la práctica

**Qué decir**

> Sigamos los números. La persona usa la pantalla, y la pantalla le pide al servicio de solicitudes que cree o envíe una solicitud. El servicio la guarda en su propia base.
>
> Cuando la solicitud se envía, el servicio produce un mensaje pequeño para avisarle a notificaciones. A ese mensaje lo llamamos evento. Notificaciones crea el aviso y anota que ya recibió ese evento, y la pantalla consulta los avisos para mostrarlos.
>
> Ninguna flecha une las dos bases. Es como dos departamentos que se intercambian notas, mientras cada uno mantiene el control de sus propios archivos.
>
> Ya vimos cómo se conectan por fuera. Ahora veamos cómo está organizado cada servicio por dentro.

**Si se te olvida, di esto**

- La pantalla pide el trabajo y el servicio guarda los datos.
- Entre los servicios viaja un mensaje pequeño llamado evento.
- Los servicios se comunican sin compartir sus bases.

**Si preguntan:** ¿Qué pasa si notificaciones está caído en el paso cuatro?

Solicitudes sigue funcionando y el evento queda guardado hasta que pueda entregarse. Lo vemos en la parte de interconexión y en la demostración.

**Si hay tiempo**

> El mensaje entre los servicios lleva tres datos, que son el número del evento, el número de la solicitud y su tipo. Al mantenerlo pequeño, resulta más sencillo coordinar ambos lados.
>
> El formato del mensaje existe en los dos servicios. Si cambia, debemos actualizar ambos al mismo tiempo, porque es lo único que comparten.

### 8. Por dentro de cada servicio: hexagonal

**Qué decir**

> Cada servicio usa arquitectura hexagonal. El equipo anterior ya la explicó, así que les contamos solo lo que nos quedó.
>
> Las reglas del negocio van en el centro, y todo lo demás se conecta alrededor, como un enchufe. Por un lado entran los pedidos de la pantalla, y por el otro se conectan la base de datos y el servicio de notificaciones. Así, las reglas no dependen de los detalles de esas conexiones.
>
> Donde más nos sirvió fue en las pruebas. Cambiamos la conexión con la base por una versión en memoria, y con eso probamos todas las reglas en segundos, sin levantar una base.
>
> Y esto solo ordena el código por dentro. Desde afuera, el servicio se instala y se usa como cualquier otro.
>
> Esto es lo que nos quedó de la arquitectura.

**Si se te olvida, di esto**

- Las reglas quedan en el centro.
- Las conexiones externas se pueden reemplazar.
- Así probamos las reglas rápidamente y sin una base.

**Si preguntan:** ¿Esto se parece a llamar un procedimiento almacenado?

Se parece en que quien llama conoce el nombre y los parámetros, pero no los detalles internos. Aquí el negocio define el contrato y la base se adapta a él.

**Si hay tiempo**

> Dejamos versiones alternativas de algunos conectores, como una forma de avisar sin reintentos. Eso demuestra que podemos reemplazarlos sin modificar las reglas.
>
> La idea se parece a varias aplicaciones que llaman un procedimiento por su nombre sin conocer cómo está implementado.

### 9. Arquitectura: lo que nos quedó

**Qué decir**

> Nos quedamos con cuatro ideas. Cada servicio es dueño de sus datos, y entre servicios viajan mensajes, no tablas.
>
> La arquitectura hexagonal ordena el código por dentro y no cambia cómo se instala.
>
> Y separar tiene un costo: más comunicación por red, más bases y más partes que pueden fallar. Por eso conviene usar microservicios cuando el negocio lo justifica. Para un sistema pequeño, una sola aplicación bien organizada puede ser la mejor decisión.
>
> Ahora entraremos en la base de datos. Le paso la palabra a Marlene.

**Si se te olvida, di esto**

- Cada servicio controla sus propios datos.
- Entre los servicios viajan mensajes, no tablas.
- Separar servicios tiene un costo y debe justificarse.

**Si hay tiempo**

> La parte más difícil de los microservicios fue definir las fronteras y decidir a quién pertenecía cada dato. Una vez resuelto eso, el resto del diseño se ordenó con mayor facilidad.

> **Entregas la palabra** a Marlene Bonilla (lámina 10).

## Marlene Bonilla · Base de datos

Láminas 10–12 y 17–18 · unos 5 minutos.

> **Recibes la palabra** de Ricardo Fábrega, después de la lámina 9.

### 10. Dos bases, una por servicio

**Qué decir**

> Gracias, Ricardo. El sistema tiene dos bases de datos, una para cada servicio, y ambas utilizan PostgreSQL, versión diecisiete.
>
> Usamos dos porque cada servicio es dueño de sus datos. Solicitudes guarda los trámites y los eventos pendientes, mientras notificaciones registra los eventos que ya recibió.
>
> Así, si una base cambia su estructura, la otra no se ve afectada. No hacemos consultas que combinen tablas de ambas bases ni definimos llaves foráneas entre ellas, es decir, referencias que obliguen a que un dato exista en la otra base.
>
> Cuando un servicio necesita un dato del otro, lo pide por la red. Además, cada base funciona por separado y tiene su propio disco.
>
> Por eso los datos permanecen cuando un servicio se reinicia y, si una base presenta una falla, la otra puede continuar trabajando.
>
> Ahora veamos qué información guarda cada una.

**Si se te olvida, di esto**

- Tenemos dos bases PostgreSQL, una por servicio.
- No hacemos consultas que crucen las bases.
- Cada base conserva sus datos en su propio disco.

**Si preguntan:** ¿Y si necesito un reporte que junte datos de las dos?

Se prepara fuera de los servicios, por ejemplo con una réplica o un proceso de reportes que lea ambas fuentes. Un servicio no debe entrar en la base del otro.

**Si preguntan:** ¿No es más difícil administrar dos bases?

Son dos bases pequeñas y cada una tiene una responsabilidad. Se respaldan y vigilan como cualquier PostgreSQL, y la caída de una no detiene la otra.

**Si hay tiempo**

> Tener una base por servicio no duplica necesariamente el trabajo de diseño. Cada base es pequeña, tiene pocas tablas y atiende una responsabilidad concreta.
>
> En Kubernetes, cada base utiliza un disco persistente. Si el contenedor se reinicia, los datos permanecen y solo se perderían si se eliminara ese disco.

### 11. La estructura de las bases

**Qué decir**

> Veamos qué hay dentro. En la base de solicitudes, la tabla solicitud guarda el número, el tipo y el estado del trámite.
>
> La propia base solo acepta los cuatro estados válidos, incluso si alguien intenta escribir directamente en la tabla. Al lado está la tabla evento, que funciona como una bandeja de salida.
>
> Cada fila registra un evento, con un número único y una marca que indica si está pendiente o ya fue entregado.
>
> La base de notificaciones tiene una tabla principal con los eventos que ya recibió. Funciona como el libro de registro de la entrada de una oficina.
>
> No existe una conexión directa entre las bases. Lo que las relaciona es el número del evento, que viaja en el mensaje entre los servicios.
>
> Ahora veremos un cambio importante frente a muchas aplicaciones actuales: dónde vive la regla del negocio.

**Si se te olvida, di esto**

- Una tabla guarda la solicitud.
- Otra mantiene los eventos pendientes.
- Notificaciones registra los eventos que ya recibió.

**Si preguntan:** ¿Dónde se guarda el texto de cada aviso?

En este proyecto queda en la memoria del servicio de notificaciones y la base solo registra los eventos procesados. En producción usaríamos una tabla adicional.

**Si preguntan:** ¿Por qué usan un identificador largo, llamado UUID, y no un número consecutivo?

Porque la aplicación puede generarlo sin consultar la base, con una probabilidad de coincidencia extremadamente baja. Conservamos ese mismo identificador en cada reintento para reconocer el evento.

**Si hay tiempo**

> La tabla evento tiene un índice que incluye únicamente las filas pendientes. Como las consultamos cada cinco segundos, el índice sigue siendo pequeño aunque crezca el historial.
>
> Las tablas se crean mediante un archivo que puede ejecutarse en cada arranque sin causar daños. Ese archivo también actualiza bases anteriores con los elementos que les falten.

### 12. Del procedimiento almacenado al ORM

**Qué decir**

> Aquí está uno de los cambios principales frente a muchas aplicaciones conocidas. La diferencia no es la base de datos, sino el lugar donde vive la regla del negocio.
>
> En el esquema habitual, la persona pulsa Enviar, la aplicación llama a un procedimiento almacenado y ese procedimiento decide y guarda. Por lo tanto, la regla vive en la base.
>
> En ARKA-Lite, la regla vive en el servicio junto con su prueba. Cuando la regla permite la operación, una herramienta llamada ORM prepara las instrucciones para guardar los datos. Esas instrucciones se escriben en SQL, el lenguaje con el que consultamos y modificamos la información de la base.
>
> Esto no significa que los procedimientos estén mal ni que la base pierda importancia: sigue cuidando las llaves, las restricciones y los índices. Solo movimos la decisión a otro lugar.
>
> Jossett lo mostrará con un ejemplo y después explicará qué es un ORM.
>
> Jossett, por favor.

**Si se te olvida, di esto**

- La diferencia está en dónde vive la regla.
- En ARKA-Lite vive en el servicio y tiene su prueba.
- La base sigue protegiendo llaves, restricciones e índices.

**Si preguntan:** ¿Y el rendimiento? ¿El SQL que genera es bueno?

Sí, para guardar y buscar por llave. En consultas complejas podemos escribir SQL propio, mientras la base sigue manejando índices y restricciones.

**Si preguntan:** ¿Hay que migrar todos los procedimientos?

No. Podemos comenzar con las reglas que cambian con frecuencia, mientras los reportes y procesos masivos permanecen en la base.

**Si hay tiempo**

> Los procedimientos siguen siendo adecuados para reportes y procesos masivos. Lo que cambia es dónde colocamos las reglas que modificamos y probamos con mayor frecuencia.
>
> Cuando la regla está en el código, cada cambio pasa por revisión, pruebas automáticas y el pipeline, como cualquier otra parte del sistema.

> **Entregas la palabra** a Jossett Franceschi (lámina 13).

> **Recibes la palabra** de Jossett Franceschi, después de la lámina 16.

### 17. Una transacción: todo o nada

**Qué decir**

> Gracias, Jossett. Este concepto es conocido para quienes trabajan con bases de datos, aunque aquí lo controlamos desde la aplicación.
>
> Cuando enviamos una solicitud, abrimos una transacción: un grupo de cambios que se guardan juntos o se deshacen completos. Ese inicio corresponde al BEGIN. Primero cambiamos el estado a enviada y, dentro de la misma transacción, registramos el evento pendiente.
>
> Al final, el COMMIT guarda ambos cambios juntos. Si algo falla en el proceso, hacemos ROLLBACK y deshacemos todo.
>
> Funciona como una transferencia bancaria. El dinero debe salir de una cuenta y entrar en la otra, o no debe ocurrir ningún cambio.
>
> En nuestro caso, el cambio a enviada y el evento pendiente quedan guardados juntos. La transacción evita que se conserve uno sin el otro. Esa garantía sostiene la interconexión que veremos a continuación.
>
> Antes de pasar a esa interconexión, resumamos lo que aprendimos sobre la base de datos.

**Si se te olvida, di esto**

- El cambio de estado y el evento pendiente se guardan juntos.
- Si algo falla, se deshacen ambos cambios.
- La operación nunca queda a medias.

**Si preguntan:** ¿Esto reemplaza las transacciones dentro de un procedimiento?

Es el mismo concepto de BEGIN, COMMIT y ROLLBACK. La diferencia es que la aplicación abre la transacción alrededor de toda la operación.

**Si hay tiempo**

> La transacción cubre toda la operación de envío. Si falla el INSERT del aviso, por ejemplo debido a una restricción, también se deshace el UPDATE de la solicitud.
>
> Preferimos una transacción local dentro de una base, porque resulta más confiable que intentar coordinar dos sistemas al mismo tiempo.

### 18. Base de datos: lo que aprendimos

**Qué decir**

> De la base de datos nos llevamos cuatro ideas. El ORM genera el SQL rutinario, pero no elimina el trabajo de diseñar llaves, restricciones e índices.
>
> También mantenemos los datos de conexión fuera del código y los entregamos desde el ambiente. La transacción continúa siendo una de las herramientas más confiables para proteger una operación.
>
> Además, guardamos y controlamos la estructura de la base junto con el código. Para quienes trabajamos con bases de datos, el mensaje es claro: ese conocimiento sigue siendo fundamental.
>
> Ahora veremos cómo los servicios se comunican sin perder ni duplicar información. Le paso la palabra a Abdiel.

**Si se te olvida, di esto**

- El ORM ayuda, pero no reemplaza el diseño de la base.
- La conexión queda fuera del código.
- Las transacciones siguen protegiendo los datos.

**Si hay tiempo**

> El rol de base de datos no desaparece. Se concentra más en diseñar el modelo, cuidar los índices y restricciones, y revisar el SQL generado por el ORM.

> **Entregas la palabra** a Abdiel Barria (lámina 19).

## Jossett Franceschi · Apoyo en base de datos: la misma regla, el ORM y la conexión y DevOps: CI/CD

Láminas 13–16 y 29–35 · unos 12 minutos.

> **Recibes la palabra** de Marlene Bonilla, después de la lámina 12.

### 13. La misma regla, escrita de las dos formas

**Qué decir**

> Gracias, Marlene. Veamos esa diferencia con una de las reglas que mencionó Luis: una solicitud solo puede enviarse cuando está en borrador.
>
> A la izquierda, el procedimiento consulta el estado, valida la condición y actualiza el dato. No necesitamos leer cada línea para notar que la regla y el dato están juntos en la base.
>
> A la derecha aparece la misma regla en el código de la aplicación. Si el estado no es borrador, se produce un error. Si lo es, la solicitud pasa a enviada.
>
> La regla no cambia; cambia dónde se ejecuta. Y al tenerla en el código, podemos probarla en milésimas de segundo, sin una base.
>
> Veamos ahora qué es exactamente un ORM.

**Si se te olvida, di esto**

- Estamos comparando responsabilidades, no tecnologías.
- La misma regla puede vivir en la base o en la aplicación.
- En el código podemos probarla rápidamente y sin una base.

**Si preguntan:** ¿Y si la regla necesita consultar muchos datos?

El servicio pide por llave únicamente los datos necesarios para decidir. Si el cálculo abarca millones de filas, puede seguir en una consulta o un procedimiento bien delimitado.

**Si hay tiempo**

> Para probar esta regla creamos una solicitud ya enviada, intentamos enviarla otra vez y verificamos el rechazo. La prueba tarda milésimas de segundo y no necesita una base.
>
> Con un procedimiento habría que preparar los datos, ejecutarlo y revisar el resultado en una base. También funciona, pero resulta más lento de repetir con cada cambio.
>
> El objetivo del proyecto es conocer otro enfoque y evaluar cuándo conviene usarlo en desarrollos futuros, sin reemplazar lo que ya funciona.

### 14. ¿Qué es un ORM?

**Qué decir**

> ORM significa mapeo objeto-relacional. En palabras sencillas, es una herramienta que hace de intérprete entre la aplicación y la base de datos.
>
> La aplicación trabaja con objetos, como una solicitud que tiene número, tipo y estado. La base, en cambio, trabaja con tablas, filas y columnas.
>
> El ORM traduce de un lado a otro. Cuando la aplicación le pide guardar una solicitud, identifica la tabla y la columna de cada dato, genera el SQL y lo envía.
>
> Cuando la base responde, hace el recorrido contrario y convierte la fila en un objeto. Es como un intérprete en una reunión, donde cada parte puede hablar su propio idioma.
>
> En nuestro proyecto usamos Hibernate, aunque la idea existe en otras tecnologías. Por ejemplo, .NET tiene Entity Framework.
>
> El ORM no diseña la base por nosotros: las llaves, las relaciones y los índices los seguimos definiendo. Y si una consulta es compleja, podemos escribirla a mano.
>
> Veamos ahora cómo una clase de la aplicación se relaciona con una tabla.

**Si se te olvida, di esto**

- El ORM traduce entre objetos y tablas.
- Hibernate genera el SQL de las operaciones comunes.
- Nosotros seguimos diseñando la base y podemos escribir SQL a mano.

**Si preguntan:** ¿El ORM reemplaza a quien administra la base de datos?

No. Esa persona sigue diseñando el modelo, cuidando los índices y revisando el SQL generado, aunque la herramienta resuelva muchas consultas rutinarias.

**Si hay tiempo**

> En Java, JPA define el estándar y Hibernate es una herramienta que lo implementa. Podemos verlo como una norma y un producto que cumple esa norma.
>
> Cuando la herramienta escribe el SQL rutinario, reducimos el código repetitivo y usamos los parámetros de forma consistente.
>
> Un ORM también puede generar consultas ineficientes si nadie las revisa. Por eso seguimos necesitando personas que entiendan el funcionamiento de las bases de datos.

### 15. El ORM por dentro: una clase es una tabla

**Qué decir**

> Aquí vemos la traducción lado a lado. A la izquierda está una clase de Java y, a la derecha, la tabla solicitud.
>
> Una marca le indica al ORM que esa clase representa la tabla. Después, cada campo corresponde a una columna y la marca Id identifica la llave primaria.
>
> Con ese mapeo, el ORM genera las operaciones básicas. Para guardar una solicitud nueva, el ORM genera un INSERT, que agrega una fila. Para buscarla por número, genera un SELECT, que consulta los datos.
>
> Cuando enviamos una solicitud existente, genera un UPDATE, que actualiza su estado. Los valores viajan como parámetros, representados por los signos de interrogación, y nunca se pegan al texto del SQL.
>
> Es el mismo principio utilizado con los parámetros de un procedimiento: los valores se tratan como datos y no como instrucciones. Así evitamos que un texto ingresado por una persona altere la consulta, lo que se conoce como inyección de SQL.
>
> Así cada pieza hace una sola cosa: las reglas deciden, el ORM traduce y la base guarda. Si algo falla, sabemos en qué punto buscar.
>
> Para llegar a la base, el ORM necesita su dirección, usuario y clave. Veamos dónde guardamos esos datos.

**Si se te olvida, di esto**

- Cada campo de la clase corresponde a una columna de la tabla.
- El ORM genera las instrucciones para agregar, consultar y actualizar los datos.
- Los valores viajan como parámetros seguros.

**Si preguntan:** ¿Se puede ver el SQL que genera?

Sí. Una línea de configuración permite mostrarlo en los registros, lo que ayuda a revisar su funcionamiento y rendimiento.

**Si hay tiempo**

> El repositorio del proyecto no contiene consultas escritas para las operaciones básicas. Al heredar de una interfaz, obtiene las funciones de guardar, buscar, listar y borrar.
>
> Al guardar, el ORM utiliza la llave para determinar si corresponde un INSERT o un UPDATE. Por eso es importante definir correctamente las llaves.

### 16. ¿Dónde guardamos los datos de conexión?

**Qué decir**

> Toda aplicación necesita conocer la ubicación de la base, el usuario y la clave para entrar. A este conjunto de datos lo llamamos cadena de conexión.
>
> En nuestros sistemas actuales la guardamos en un archivo web.config dentro del servidor. Esa ya es una buena práctica, porque la información no está escrita en el código.
>
> ARKA-Lite aplica la misma idea con otra herramienta. En lugar de usar un archivo junto a la aplicación, recibe variables de entorno cuando arranca.
>
> Así, el ambiente donde se ejecuta le entrega la dirección, el usuario y la clave. La misma aplicación puede funcionar en desarrollo, pruebas y producción sin cambiar su código.
>
> Cada ambiente proporciona sus propios valores. Por eso, si cambia el servidor o renovamos una clave, solo actualizamos la configuración del ambiente.
>
> Ahora Marlene explicará cómo una transacción garantiza que los datos queden completos. Marlene, adelante.

**Si se te olvida, di esto**

- La conexión se configura fuera del código.
- Aquí usamos variables que entrega el ambiente.
- La misma aplicación sirve en distintos ambientes.

**Si preguntan:** ¿Dónde queda la clave en Kubernetes?

Se guarda en un objeto para datos sensibles llamado Secret, que el contenedor recibe al arrancar. Los permisos controlan quién puede leerlo.

**Si preguntan:** ¿Hay que dejar de usar web.config?

No. Sigue siendo válido para las aplicaciones que funcionan de esa manera. Lo importante es mantener la clave fuera del código y del repositorio.

**Si hay tiempo**

> En Kubernetes, el Secret guarda la clave y las demás variables contienen el resto de la configuración.
>
> El proyecto tiene valores predeterminados para trabajar en una computadora. En un ambiente real no los usamos, porque la configuración siempre llega desde el entorno.
>
> En producción también podemos guardar las claves en una bóveda especializada. La idea se mantiene igual, porque permanecen fuera del código.

> **Entregas la palabra** a Marlene Bonilla (lámina 17).

> **Recibes la palabra** de Kevin, después de la lámina 28.

### 29. Git: el historial y las ramas

**Qué decir**

> Gracias, Kevin. Antes de hablar de CI/CD necesitamos dos ideas de Git, la herramienta con la que guardamos el código.
>
> La primera es el historial. Git guarda cada avance como un punto en una línea de tiempo. Así sabemos qué cambió, quién lo hizo y cuándo. También podemos volver a un punto anterior.
>
> La línea del centro se llama main. Es la versión oficial, la que se instala, y nadie trabaja directamente sobre ella.
>
> La segunda idea es la rama. Para cada tarea, la rama nace de un punto de main. Es una copia de main tal como está en ese momento. Ahí guardamos los avances sin tocar la versión oficial.
>
> Arriba está la rama de una tarea y abajo la de otra. Las dos avanzan al mismo tiempo, cada una por su lado, sin pisarse.
>
> Cuando una tarea está lista, su rama vuelve a main con su cambio. A eso le llamamos merge, y es la flecha verde.
>
> Es como el control de cambios de un documento compartido: cada quien trabaja en su copia y, al final, se integra al original.
>
> Con esas dos ideas, veamos paso por paso cómo un cambio viaja de una rama hasta main.

**Si se te olvida, di esto**

- Git guarda el historial de cada avance.
- main es la versión oficial.
- La rama nace como copia de main.
- Cada tarea se trabaja en su rama y vuelve a main con un merge.

**Si preguntan:** ¿Qué pasa si dos personas cambian lo mismo?

Git detecta el conflicto y avisa. El equipo decide cómo combinar los cambios antes de incorporarlos a main.

**Si hay tiempo**

> Cada avance guardado se llama commit y tiene un código único. Con ese código se puede volver exactamente a ese punto.
>
> GitHub es el lugar donde el equipo guarda y comparte el código, y donde se hacen las revisiones.

### 30. Cómo entra un cambio, paso por paso

**Qué decir**

> Ahora veamos el camino de un cambio en cinco pasos. Primero, abrimos una rama para la tarea. Segundo, ahí escribimos el cambio y su prueba.
>
> Tercero, hacemos push: subimos la rama a GitHub, donde el equipo comparte el código. Cuarto, abrimos un Pull Request para que otra persona revise el cambio. En ese momento, las pruebas corren solas.
>
> Quinto, si otra persona aprueba el cambio y las pruebas pasan, hacemos merge, que es unir la rama a main. Solo entonces el cambio forma parte de la versión oficial.
>
> Esas pruebas no las corre una persona. Las corre el pipeline. Veamos qué es.

**Si se te olvida, di esto**

- Rama, cambio, push, Pull Request y merge, en ese orden.
- Nada entra a main sin revisión y sin pruebas.

**Si preguntan:** ¿Quién revisa el Pull Request?

Otra persona del equipo. Quien hizo el cambio no puede aprobar su propio cambio.

**Si hay tiempo**

> Describimos cada cambio con un formato común, por ejemplo, fix seguido de impedir el envío de una solicitud aprobada. Así el historial funciona como una bitácora.
>
> La documentación de los servicios se genera desde el código mediante Swagger, lo que reduce el riesgo de que quede desactualizada.
>
> Nadie incorpora cambios directamente en la versión principal, incluida la persona que lidera el equipo.

### 31. CI/CD: el control de calidad automático

**Qué decir**

> CI/CD reúne dos prácticas que automatizan este camino: integración continua y entrega continua. Sus tareas forman un pipeline, es decir, una lista de pasos que se ejecuta sola. Es como el control de calidad de una fábrica: cada producto pasa por las mismas revisiones.
>
> El pipeline se activa cuando ocurre un evento, es decir, una acción que lo pone en marcha. En ARKA-Lite responde a dos eventos. Cada uno sigue un camino distinto.
>
> Arriba, el primer evento ocurre cuando alguien abre o actualiza un Pull Request. Ahí se ejecuta la integración continua, o CI. GitHub compila la aplicación y ejecuta las pruebas con una base de datos temporal. El resultado queda en verde o en rojo.
>
> Abajo, el segundo evento ocurre cuando hacemos merge a main. El pipeline compila y prueba otra vez. Si todo pasa, ejecuta la entrega continua, o CD: publica una imagen, un paquete listo para instalar con el código del cambio.
>
> Nadie tiene que recordar esos pasos. En nuestro proyecto, la instalación final aún se hace con un comando. El siguiente paso sería automatizarla con una aprobación previa.
>
> Ahora veamos dónde se escriben esos eventos y pasos: en el archivo ci.yml.

**Si se te olvida, di esto**

- El pipeline reacciona a eventos.
- En el Pull Request: compila y prueba.
- En el merge a main: además publica la imagen.
- La instalación final todavía usa un comando.

**Si preguntan:** ¿Se puede condicionar a otros eventos?

Sí. Por ejemplo, a un push en cualquier rama, a una hora programada o a una etiqueta de versión.

**Si preguntan:** ¿Así funciona hoy ARKA-Lite?

La pantalla, sí: su imagen se publica solo al llegar a main. Los servicios todavía publican también durante el Pull Request; es un ajuste que tenemos pendiente.

**Si preguntan:** ¿Por qué no se instala solo?

Porque Kubernetes funciona en nuestro ambiente local de laboratorio. En un ambiente real agregaríamos al pipeline un paso de instalación con aprobación.

**Si preguntan:** ¿Las pruebas usan la base real?

No. GitHub crea una base de datos PostgreSQL temporal para cada ejecución y la elimina al terminar.

**Si hay tiempo**

> El pipeline ejecuta al mismo tiempo un trabajo para solicitudes, otro para notificaciones y otro para la pantalla. Así termina antes y muestra con precisión qué pieza falló.
>
> Además de pasar las pruebas, el servicio de solicitudes arranca realmente y debe mostrar una solicitud de ejemplo. Compilar no garantiza que una aplicación pueda iniciar.
>
> Entrega continua significa dejar la imagen lista, mientras despliegue continuo significa instalarla automáticamente. Nuestro proyecto llega hasta la entrega.
>
> Las condiciones se escriben en el mismo archivo del pipeline: en qué eventos corre y qué pasos se hacen solo en algunos de ellos, como publicar la imagen solo al llegar a main.
>
> Actualmente las imágenes de los servicios se publican durante la revisión y la de la pantalla al llegar a main. Ya identificamos esa diferencia como un ajuste pendiente.

### 32. El pipeline se escribe en un archivo: ci.yml

**Qué decir**

> Todo lo que acabamos de ver está escrito en un archivo de texto llamado ci.yml. Está en la carpeta .github/workflows, dentro del repositorio. GitHub lo lee automáticamente.
>
> A la izquierda vemos cuándo se ejecuta. La palabra on enumera los eventos: abrir o actualizar un Pull Request, y hacer push a main, como ocurre al hacer merge.
>
> A la derecha vemos qué hace. Primero indica que se ejecuta en un servidor de GitHub. Luego, steps enumera los pasos en orden: compilar y probar, y publicar la imagen.
>
> La línea if agrega una condición: el paso de publicar la imagen solo se ejecuta cuando hay un push a main. Así se forman los dos caminos de la lámina anterior.
>
> Como es un archivo más del proyecto, también pasa por un Pull Request y se revisa. Si alguien cambia el pipeline, queda registrado quién lo cambió y por qué.
>
> Ya tenemos todas las piezas. Veamos ahora el recorrido completo en una simulación: desde el push hasta el despliegue.

**Si se te olvida, di esto**

- El pipeline se escribe en ci.yml.
- on dice cuándo corre.
- steps enumera los pasos. if indica una condición.
- El archivo se revisa como el código.

**Qué hacer** (no se dice)

- Es una versión simplificada del archivo real: no hace falta leer cada línea, basta señalar on, steps e if.

**Si preguntan:** ¿Hay que saber programar para leerlo?

Ayuda, pero no es indispensable. YAML es un formato de texto con nombres y valores, y cada paso indica en palabras qué hace.

**Si hay tiempo**

> GitHub ofrece plantillas para casi cualquier tecnología: se parte de una y se adapta al proyecto.
>
> El nombre del archivo puede ser otro; lo que importa es que esté en la carpeta .github/workflows.

### 33. Ejemplo: del push al despliegue

**Qué decir**

> Este video es una simulación del recorrido completo. Primero, quien desarrolla termina su cambio y hace push a su rama.
>
> Al abrir el Pull Request, otra persona revisa el cambio y debe aprobarlo. El pipeline también arranca por su cuenta: compila y ejecuta todas las pruebas.
>
> Con el merge, el cambio entra a main y se publica la imagen, marcada con el código del cambio.
>
> Al final se instala esa imagen. Fíjense en la pantalla de la derecha, que es lo que ven los usuarios: pasa de la versión 1.4 a la 1.5.
>
> Nuestro pipeline real llega hasta publicar la imagen. La instalación del video muestra cómo seguiría en producción.
>
> En el video todas las pruebas pasaron. Veamos qué ocurre cuando una falla.

**Si se te olvida, di esto**

- Push, Pull Request, pruebas, merge e imagen.
- Al instalar la imagen, los usuarios ven la versión nueva.
- Nuestro pipeline llega hasta la imagen.

**Qué hacer** (no se dice)

- El video arranca solo al llegar a la lámina; Alt+P lo pausa.
- En el paso 5, señalar la pantalla de la derecha: es lo que ven los usuarios.

**Si preguntan:** ¿Por qué ustedes no despliegan así?

Porque nuestro ambiente de Kubernetes es local y GitHub no puede acceder a él. Para hacerlo así, el pipeline necesitaría acceso y un paso de aprobación.

**Si hay tiempo**

> Existen herramientas para automatizar ese último paso. Todas siguen la misma idea, donde el pipeline entrega la imagen a Kubernetes y una persona aprueba antes de llegar a producción.

### 34. Cuando un cambio rompe algo

**Qué decir**

> Veamos qué pasa cuando un cambio rompe una regla. Supongamos que alguien permite por error enviar dos veces la misma solicitud.
>
> Si todo se revisara a mano, quizá lo descubriríamos semanas después, cuando ya hubiera afectado a una persona usuaria.
>
> Aquí el pipeline arranca solo. En pocos minutos, falla la prueba que protege esa regla. GitHub muestra qué falló y dónde buscar el problema.
>
> La persona corrige el problema y el pipeline vuelve a correr. Si main exige las pruebas en verde, el error no entra.
>
> La integración continua funciona como una red de seguridad: permite hacer cambios con mayor confianza.
>
> Por eso cada regla necesita una prueba. Esa prueba es la alarma que se activa cuando alguien modifica el comportamiento esperado.
>
> Cuando el cambio se aprueba y las pruebas pasan, el pipeline publica la imagen con una etiqueta.

**Si se te olvida, di esto**

- Una prueba detecta la regla rota en minutos.
- GitHub muestra dónde ocurrió el problema.
- El error no llega a la versión principal.

**Si preguntan:** ¿Y si alguien se salta el pipeline?

Todo cambio entra mediante Pull Request. Además, GitHub puede impedir el merge mientras el pipeline esté en rojo.

**Si hay tiempo**

> Podemos configurar GitHub para bloquear un Pull Request cuando alguna prueba falla. Es una regla de la plataforma y no requiere modificar el código.
>
> El pipeline publica imágenes mediante un permiso temporal que GitHub entrega a cada ejecución, sin almacenar una contraseña.

### 35. Cada imagen, con su etiqueta

**Qué decir**

> Cuando las pruebas pasan, obtenemos trazabilidad: podemos relacionar cada imagen publicada con el cambio que la generó.
>
> La imagen lleva el código de ese cambio, como el número de lote de un medicamento. Si aparece un problema, sabemos exactamente de dónde vino.
>
> Con ese código podemos buscar en GitHub qué cambió, quién lo propuso, quién lo revisó y cuáles pruebas pasaron.
>
> Si una versión presenta problemas, podemos volver a la imagen anterior, que continúa almacenada.
>
> Si el equipo de operaciones pregunta qué versión está instalada, damos la etiqueta exacta y consultamos su historial. En el laboratorio todavía construimos las imágenes en una computadora. En un ambiente real usaríamos la imagen publicada por el pipeline.
>
> La imagen ya está publicada y rastreada. Ahora veamos dónde se ejecuta. Le paso la palabra a Moises, que nos explicará Kubernetes.

**Si se te olvida, di esto**

- Cada imagen se conecta con un cambio específico.
- Podemos saber quién lo revisó y qué pruebas pasó.
- Si falla, volvemos a la imagen anterior.

**Si preguntan:** ¿Por qué no usar la etiqueta latest?

Porque latest cambia con cada publicación y no identifica el código. La etiqueta basada en el cambio siempre señala una versión concreta.

**Si hay tiempo**

> Ese código se llama SHA y Git genera uno para cada cambio. Usarlo evita la duda sobre si la imagen que se ejecuta es la nueva o la anterior.
>
> El archivo de Kubernetes indica qué imagen debe utilizar. Para cambiar de versión, modificamos esa referencia y volvemos a aplicar el archivo.

> **Entregas la palabra** a Moises (lámina 36).

## Abdiel Barria · Interconexión de servicios y Demostración en video y Resultados, valor y cierre

Láminas 19–23 y 44–50 · unos 10 minutos.

> **Recibes la palabra** de Marlene Bonilla, después de la lámina 18.

### 19. Síncrono o asíncrono

**Qué decir**

> Gracias, Marlene. Como los servicios no comparten una base, necesitamos definir cómo se comunican, y hay dos formas de hacerlo. La síncrona se parece a una llamada telefónica, porque hacemos el pedido y esperamos la respuesta.
>
> La usamos para crear, aprobar o rechazar una solicitud, ya que la persona necesita conocer el resultado de inmediato. Si el otro lado está caído, verá el error.
>
> La comunicación asíncrona se parece a un correo. Enviamos el mensaje y seguimos trabajando sin esperar, aunque la respuesta pueda tardar unos segundos.
>
> En nuestro sistema, si el otro servicio está caído, el mensaje queda guardado hasta que podamos entregarlo. En un pago con tarjeta, por ejemplo, la aprobación es síncrona porque necesitamos saber si fue aceptado.
>
> En cambio, el comprobante por correo es asíncrono porque puede llegar después. La regla es sencilla. Usamos comunicación síncrona cuando necesitamos conocer el resultado para continuar, y asíncrona cuando el trabajo puede completarse después.
>
> Ahora veamos cómo hacemos que ese mensaje espere sin perderse mediante el patrón Outbox.

**Si se te olvida, di esto**

- Síncrono significa pedir y esperar.
- Asíncrono significa enviar y continuar.
- Elegimos según cuándo se necesita la respuesta.

**Si preguntan:** ¿Por qué no hacerlo todo asíncrono?

Porque quien crea o aprueba una solicitud necesita saber en ese momento si la operación funcionó. Reservamos lo asíncrono para lo que puede esperar.

**Si hay tiempo**

> En cada caso preguntamos si la persona debe enterarse cuando el otro sistema está caído. Si la respuesta es no, podemos manejarlo de forma asíncrona.
>
> Esto también ocurre en los sistemas actuales. Un procedimiento que llama a otro sistema y espera su respuesta falla cuando ese sistema no está disponible.

### 20. Patrón Outbox: guardar primero, avisar después

**Qué decir**

> Si al enviar una solicitud llamáramos directamente a notificaciones y el servicio estuviera caído, la solicitud podría quedar enviada sin que nadie recibiera el aviso.
>
> Para resolverlo usamos el patrón Outbox, que significa bandeja de salida. Dentro de una sola transacción guardamos la solicitud y un evento pendiente, que es el registro de lo que falta comunicar.
>
> La persona recibe la respuesta de inmediato, mientras el evento queda esperando como una carta que todavía no ha salido.
>
> Después, un proceso llamado relevador revisa la bandeja cada cinco segundos y entrega los eventos pendientes. Podemos verlo como el mensajero del sistema.
>
> Si la entrega funciona, marca el evento como entregado. Si falla, lo deja pendiente y vuelve a intentarlo en la siguiente revisión.
>
> Así, aunque notificaciones se detenga, ningún evento se pierde y todos se entregan cuando regresa.
>
> La misma idea puede aplicarse con procedimientos almacenados: guardamos el evento en una tabla de pendientes y una tarea programada se encarga de entregarlo.
>
> Como el sistema reintenta las entregas, ahora debemos evitar que el mismo evento produzca dos avisos.

**Si se te olvida, di esto**

- Primero guardamos y después avisamos.
- El relevador revisa la bandeja cada cinco segundos.
- Si la entrega falla, el evento permanece guardado.
- La misma idea funciona con una tabla de pendientes y una tarea programada.

**Si preguntan:** ¿Que el envío responda bien significa que el aviso ya existe?

No. Significa que la solicitud y el evento quedaron guardados. El aviso se crea después.

**Si preguntan:** ¿Qué pasa si se cae solicitudes con eventos pendientes?

Los eventos permanecen en la base. Cuando el servicio regresa, el relevador los encuentra y los entrega.

**Si hay tiempo**

> El relevador intenta entregar cada evento hasta tres veces por vuelta y espera un poco más entre intentos. Si todos fallan, la fila permanece pendiente y vuelve a probar cinco segundos después.
>
> El número del evento se genera una sola vez al guardar. Por eso cada reintento lleva el mismo número y el receptor puede reconocerlo.
>
> Con procedimientos, la receta incluye una tabla de pendientes, una columna procesado, un INSERT dentro de la transacción y un job que recorre las filas.

### 21. Idempotencia: el mismo evento, un solo aviso

**Qué decir**

> Un evento puede llegar dos veces. Por ejemplo, notificaciones lo recibe correctamente, pero la confirmación se pierde en la red. Como solicitudes no sabe que llegó, vuelve a enviarlo.
>
> Para manejarlo usamos la idempotencia, una palabra técnica para una idea sencilla. Significa que repetir la misma operación no cambia el resultado.
>
> Cada evento trae un número fijo, que llamamos el número del evento. Cuando llega, notificaciones lo busca en la lista. Si es nuevo, crea el aviso y registra el número. Si ya estaba registrado, lo ignora.
>
> Es como un portero con una lista de invitados, porque quien ya entró no puede entrar una segunda vez.
>
> Las dos soluciones se complementan. La bandeja de salida evita perder eventos y la idempotencia impide duplicar avisos.
>
> Este principio sirve para cualquier proceso que tenga reintentos, como un pago, un correo o una importación de archivos.
>
> Con ambas garantías claras, veamos en una sola imagen quién habla con quién, y cómo.

**Si se te olvida, di esto**

- Idempotencia significa repetir sin cambiar el resultado.
- El número del evento permite reconocer duplicados.
- La bandeja de salida conserva el evento y la idempotencia evita que una entrega repetida cree otro aviso.

**Si preguntan:** ¿Qué resuelve el Outbox y qué resuelve la idempotencia?

Outbox evita perder el evento. La idempotencia evita que ese evento produzca el mismo efecto dos veces.

**Si preguntan:** ¿Y si llegan dos entregas al mismo tiempo?

La llave primaria permite registrar el número una sola vez. La otra entrega falla y, al reintentarse, encuentra el evento ya procesado.

**Si hay tiempo**

> Lo probamos desde la pantalla al volver a entregar un evento ya recibido. Aunque repetimos la entrega, el contador de avisos duplicados permanece en cero.
>
> La receta sirve en cualquier sistema. Necesitamos un número único por operación y una tabla que recuerde cuáles ya fueron procesadas.

### 22. Resumen: quién habla con quién, y cómo

**Qué decir**

> Con las piezas claras, veamos el recorrido completo en una sola imagen. Es el resumen de esta parte.
>
> Arriba está lo que ocurre mientras la persona espera. El navegador solo conoce la pantalla, y la pantalla pasa cada pedido por un intermediario que lo lleva al servicio de solicitudes. Es como la recepción de una empresa: pedimos un departamento y nos conectan con él.
>
> Solicitudes aplica la regla, guarda la solicitud y su evento en la misma transacción y responde de inmediato. Esa es la parte síncrona.
>
> Abajo está lo que pasa después, sin que nadie espere. El relevador toma el evento de la bandeja de salida y se lo entrega a notificaciones, que revisa el número, crea un solo aviso y anota que ya lo recibió. Esa es la parte asíncrona.
>
> Dos detalles unen todo. Las piezas se encuentran por su nombre y no por una dirección fija, y cada llamada lleva un número de seguimiento, distinto del número del evento, que nos permite reconstruir el recorrido en los registros. Moises lo retomará en la observabilidad.
>
> Con el recorrido completo a la vista, resumamos lo aprendido sobre la interconexión.

**Si se te olvida, di esto**

- Arriba, lo que pasa mientras la persona espera.
- Abajo, lo que pasa después, por su cuenta.
- Se encuentran por nombre y un número sigue cada llamada.

**Qué hacer** (no se dice)

- Recorrer la lámina de izquierda a derecha: primero el camino de arriba y después el de abajo.

**Si preguntan:** ¿Por qué no una cola de mensajes como RabbitMQ o Kafka?

Para este proyecto, basta con guardar el evento pendiente y entregarlo después mediante una llamada web al otro servicio. No necesitamos agregar una herramienta de mensajería. Si aumenta el volumen, podemos llevar el mismo diseño a una cola sin cambiar las reglas.

**Si hay tiempo**

> La llamada entre servicios utiliza un cliente preparado para conservar el número de seguimiento. Con un cliente común se perdería esa continuidad, por eso lo definimos como una regla del equipo.
>
> Los servicios se comunican por HTTP y envían mensajes en JSON, un formato de texto que pueden leer tanto las personas como los sistemas.

### 23. Interconexión: lo que aprendimos

**Qué decir**

> De la interconexión nos llevamos cuatro ideas. Esperamos la respuesta cuando la necesitamos para continuar y dejamos para después el trabajo que puede esperar.
>
> También aprendimos que guardar primero y avisar después es más confiable que coordinar dos sistemas al mismo tiempo.
>
> Cuando una operación se reintenta, el receptor debe reconocer lo repetido. Además, los servicios solo comparten el formato del mensaje, así que cualquier cambio debe coordinarse en ambos lados.
>
> Estas decisiones no dependen de Java y pueden aplicarse a los sistemas que ya tenemos.
>
> Ahora veremos cómo llevamos el código y los datos hasta un servidor. Le paso la palabra a Kevin, de infraestructura.

**Si se te olvida, di esto**

- Elegimos entre esperar o avisar después.
- Guardamos primero para no perder información.
- Reconocemos repetidos para evitar duplicados.

**Si hay tiempo**

> Juntas, la bandeja de salida y la idempotencia permiten que un mensaje llegue varias veces, pero produzca su efecto una sola vez. Esta es una base común en sistemas de pagos y notificaciones.

> **Entregas la palabra** a Kevin (lámina 24).

> **Recibes la palabra** de Moises, después de la lámina 43.

### 44. En video: cómo interactúan los componentes

**Qué decir**

> Gracias, Moises. Veamos cómo interactúan los componentes en una grabación del sistema real. La franja superior indica qué componente está trabajando en cada momento.
>
> Primero, la pantalla le pide al servicio de solicitudes que cree una nueva solicitud y esta queda en borrador.
>
> Después la enviamos. El servicio cambia el estado a enviada, guarda el evento en la bandeja de salida y responde sin esperar a que notificaciones lo reciba.
>
> Pocos segundos después, sin intervención de una persona, el relevador toma el evento de la bandeja y lo entrega a notificaciones. Finalmente, notificaciones crea un solo aviso.
>
> Ahora repetiremos el recorrido, pero esta vez apagaremos un servicio a propósito.

**Si se te olvida, di esto**

- La grabación muestra el sistema real.
- Solicitudes guarda y deja el evento pendiente.
- Notificaciones recibe el evento y crea un aviso.

**Qué hacer** (no se dice)

- El video arranca solo al llegar a la lámina. Alt+P lo pausa y lo reanuda si quieren detenerse a explicar.
- Narrar al ritmo de los rótulos numerados del video; la lista de la lámina tiene los mismos pasos.

**Si hay tiempo**

> La franja superior no forma parte del sistema. La agregamos al video para indicar qué componente trabaja en cada momento.

### 45. En video: si notificaciones se cae

**Qué decir**

> Esta grabación también utiliza el sistema real. Primero detenemos a propósito el servicio de notificaciones y la franja superior cambia a rojo.
>
> Después enviamos una solicitud y la persona no recibe un error, porque el envío no depende de la respuesta inmediata del otro servicio.
>
> Ese comportamiento es comunicación asíncrona. El evento permanece en la bandeja de salida y el relevador intenta entregarlo cada cinco segundos.
>
> Luego levantamos de nuevo notificaciones. Esa parte del video está acelerada porque el servicio necesita unos segundos para arrancar.
>
> En el siguiente intento, el evento se entrega con el mismo número y aparece un solo aviso.
>
> Para terminar, entregamos intencionalmente el mismo evento otra vez. Notificaciones reconoce el número y evita crear un segundo aviso.
>
> El resultado es que no perdemos eventos y tampoco generamos avisos duplicados.
>
> La prueba reúne varias decisiones técnicas. Ahora resumamos qué aprendimos al verla funcionar.

**Si se te olvida, di esto**

- Apagamos notificaciones y el trámite continúa.
- El evento espera y se entrega cuando el servicio regresa.
- Una entrega repetida no crea otro aviso.

**Qué hacer** (no se dice)

- El video arranca solo al llegar a la lámina; Alt+P lo pausa. Dura poco más de un minuto y sus rótulos numerados coinciden con la lista de la lámina.

**Si preguntan:** ¿Cuánto tiempo puede esperar un evento pendiente?

Puede esperar indefinidamente porque permanece en la base. Se entrega en la primera revisión después de que notificaciones regresa.

**Si hay tiempo**

> El video es una grabación real y los comandos se ejecutaron en ese momento contra el sistema levantado con Docker.
>
> Si una operación que cambia datos tarda demasiado, la pantalla no la repite automáticamente. El cambio pudo haberse guardado aunque la respuesta no llegara.
>
> Después de la presentación, cualquier persona puede levantar el sistema mediante un solo comando.

### 46. Demostración: lo que aprendimos

**Qué decir**

> La demostración nos deja tres aprendizajes. Primero, debemos diseñar para las fallas y no únicamente para el recorrido exitoso.
>
> También debemos hacer visible lo que ocurre de forma asíncrona. Sin una vista de los eventos, uno pendiente quedaría oculto.
>
> Finalmente, ver el sistema funcionando facilita la explicación y convierte la misma pantalla en una herramienta para capacitar a quienes se incorporen.
>
> Para cerrar, veamos qué significa todo esto para el negocio.

**Si se te olvida, di esto**

- Debemos diseñar para las fallas.
- Lo asíncrono debe hacerse visible.
- La demostración también sirve para capacitar.

**Si hay tiempo**

> La demostración también funcionó como prueba. Antes de presentarla, provocamos cada falla varias veces para verificar que el sistema respondiera de la manera esperada.

### 47. Resultados para el negocio

**Qué decir**

> Lo que acabamos de ver se traduce en estos resultados para el negocio.
>
> Primero, los eventos pendientes permanecen guardados si se interrumpe la entrega, y reenviar el mismo evento no crea otro aviso.
>
> Segundo, el trámite no se detiene. Aunque el servicio de avisos esté caído, la persona puede enviar su solicitud y el aviso llega cuando el servicio regresa.
>
> Tercero, las reglas del negocio se cumplen y cada una tiene una prueba que la vigila.
>
> Cuarto, Kubernetes puede reemplazar una copia que falla, mientras los eventos pendientes permanecen guardados en la base.
>
> Por último, los cambios llegan con menos riesgo, porque detectamos los errores en minutos y antes de que afecten a los usuarios.
>
> Estos resultados no dependen de la suerte, sino de varias decisiones que trabajan juntas.

**Si se te olvida, di esto**

- No se pierden eventos ni se duplican avisos.
- El trámite continúa aunque notificaciones esté fuera de servicio.
- Las pruebas y la recuperación reducen el riesgo.

**Si hay tiempo**

> Comprobamos estos resultados en nuestro laboratorio y no en producción. Lo importante es que cada resultado se puede repetir y verificar.

### 48. Lo que sostiene los resultados

**Qué decir**

> Detrás de cada resultado hay una práctica que aprendimos y aplicamos. La transacción, la bandeja de salida y el control de duplicados mantienen consistentes los datos.
>
> La configuración está separada del código, así que podemos cambiar las claves sin modificar la aplicación.
>
> También ejecutamos el mismo sistema en distintos ambientes mediante un solo comando. Las pruebas automáticas revisan cada cambio antes de incorporarlo.
>
> Además, reunimos los registros en un solo lugar y relacionamos cada versión con el cambio que la produjo.
>
> La mayoría de estas prácticas puede aplicarse sin reemplazar la tecnología que ya utilizamos.
>
> Si tuviéramos que resumir todo el recorrido en tres ideas, serían las siguientes.

**Si se te olvida, di esto**

- Cada resultado se apoya en una práctica concreta.
- Datos, configuración, pruebas y registros trabajan juntos.
- Podemos aplicar estas ideas sin cambiar de tecnología.

**Si hay tiempo**

> Un orden razonable sería comenzar con una tabla de pendientes en el proceso que más falla, agregar idempotencia donde existen reintentos y después incorporar un número de seguimiento.
>
> Ninguna de estas prácticas exige Java, microservicios ni Kubernetes. Son decisiones de diseño aplicables a los sistemas actuales.

### 49. Lo que nos llevamos

**Qué decir**

> De toda la capacitación nos llevamos tres ideas. La primera es diseñar pensando en la falla, porque algún componente fallará y debemos definir cómo responderá el sistema.
>
> La segunda es automatizar las revisiones y dejar la infraestructura descrita en archivos. Así podemos hacer cambios con mayor confianza y menor riesgo.
>
> La tercera es hacer visible el sistema. No podemos diagnosticar ni explicar con claridad lo que no vemos.
>
> Ese es el aprendizaje que conecta todo el recorrido: prepararnos para las fallas, revisar los cambios y poder entender qué ocurre en el sistema.

**Si se te olvida, di esto**

- Diseñamos pensando en las fallas.
- La automatización nos permite cambiar con confianza.
- Lo visible se puede diagnosticar y explicar.

**Si hay tiempo**

> Si conservamos una sola idea, debe ser esta. Diseñemos qué hará el sistema cuando algo falle y no solamente cómo funcionará cuando todo salga bien.

### 50. Gracias

**Qué decir**

> Comenzamos con una sola operación en Java y terminamos con un sistema completo de dos servicios, cada uno con su propia base de datos.
>
> El sistema quedó empaquetado, instalado, vigilado y documentado. Además, puede conservar la información y recuperarse cuando una de sus partes falla.
>
> Muchas gracias. Con gusto respondemos sus preguntas.

**Si se te olvida, di esto**

- Pasamos de una operación a un sistema completo.
- El sistema sabe conservar los datos y recuperarse.
- Muchas gracias. Escuchamos sus preguntas.

**Qué hacer** (no se dice)

- Abdiel recibe las preguntas y se las pasa a quien presentó esa parte.

## Kevin · DevOps: qué es, Docker y Compose

Láminas 24–28 · unos 4 minutos.

> **Recibes la palabra** de Abdiel Barria, después de la lámina 23.

### 24. ¿Qué es DevOps? Del código a la operación

**Qué decir**

> Gracias, Abdiel. DevOps no es una herramienta ni un puesto específico. Es una forma de trabajar en la que desarrollo y operación colaboran y cada cambio sigue un camino repetible.
>
> Podemos imaginarlo como una línea de producción. Cada producto pasa por las mismas estaciones, en el mismo orden, y ninguna revisión se omite.
>
> Primero escribimos y revisamos el cambio. Después lo probamos, lo empaquetamos, lo publicamos, lo instalamos y lo operamos en el servidor.
>
> También vigilamos el sistema mediante sus registros. Lo que aprendemos durante la operación vuelve al código y el ciclo comienza otra vez.
>
> En esta parte, yo explicaré Docker, Jossett mostrará el camino automático de los cambios y Moises explicará Kubernetes.
>
> Comencemos por entender cómo se complementan Docker y Kubernetes.

**Si se te olvida, di esto**

- DevOps es una forma de trabajar.
- Cada cambio sigue un camino repetible.
- El ciclo une desarrollo, entrega y operación.

**Si preguntan:** ¿DevOps es un equipo aparte?

Es una práctica. Puede haber personas que la impulsen, pero funciona cuando desarrollo e infraestructura comparten el proceso y las herramientas.

**Si hay tiempo**

> En ARKA-Lite utilizamos Git y GitHub para el código, pruebas automáticas para validarlo, Docker para empaquetarlo, Kubernetes para operarlo y Grafana para observarlo.
>
> La mayoría de los pasos ya no depende de la memoria de una persona. Si uno falla, el proceso se detiene y muestra con claridad dónde ocurrió el problema.

### 25. Docker y Kubernetes: no compiten, se complementan

**Qué decir**

> Docker y Kubernetes se escuchan juntos con frecuencia, y a veces se presentan como alternativas. En realidad cumplen funciones distintas y se complementan.
>
> Docker empaqueta la aplicación con todo lo necesario para ejecutarla, dentro de una imagen que funciona igual en una computadora o en un servidor. Así evitamos que algo funcione en una máquina y falle en otra.
>
> Kubernetes comienza donde termina Docker: decide dónde corren esas aplicaciones, las vigila y reemplaza las que fallan.
>
> Pensemos en el transporte de carga que conocemos en Panamá. Docker es el contenedor estándar, que se mueve igual sin importar lo que lleva, y Kubernetes es el puerto que los acomoda, los vigila y reemplaza el que se daña.
>
> Ahora veamos cómo una receta termina convertida en un contenedor.

**Si se te olvida, di esto**

- Docker empaqueta y Kubernetes administra.
- La imagen funciona igual en distintos ambientes.
- Docker es el contenedor y Kubernetes es el puerto.

**Si preguntan:** ¿Un contenedor de Docker es una máquina virtual?

No. Es más liviano porque comparte el núcleo del sistema operativo y aísla la aplicación y sus dependencias.

**Si preguntan:** ¿Necesitamos Kubernetes para todo?

No. Para un sistema pequeño puede bastar Docker Compose, una herramienta que permite levantar varios contenedores juntos. La veremos en unas láminas. Kubernetes cobra valor cuando hay varios servicios, múltiples copias o recuperación automática.

**Si hay tiempo**

> La comparación funciona porque el contenedor de carga también estandarizó la forma de mover distintos productos. La misma caja puede viajar en barco, tren o camión sin importar su contenido.
>
> Podemos usar Docker sin Kubernetes en un servidor pequeño. También Kubernetes puede ejecutar imágenes creadas con otras herramientas, aunque juntos cubren todo el recorrido.

### 26. De código a contenedor

**Qué decir**

> Un contenedor nace a partir de tres conceptos. Todo comienza con una receta llamada Dockerfile, donde indicamos qué se instala y qué archivos se copian.
>
> Con esa receta construimos una imagen, que funciona como un molde. Contiene la aplicación y únicamente lo necesario para ejecutarla.
>
> La imagen no cambia, así que instalamos exactamente la misma que probamos. Cuando ponemos esa imagen a funcionar, obtenemos un contenedor.
>
> Del mismo molde pueden salir varios contenedores iguales. Además, el nuestro se ejecuta con un usuario sin privilegios, por seguridad: si alguien abusara de la aplicación, tendría muy poco margen para hacer daño.
>
> Por eso podemos reemplazar un contenedor y crear otro a partir de la misma imagen, sin reconstruir la aplicación.
>
> Con la receta, el molde y el contenedor claros, veamos qué ventajas nos ofrece Docker.

**Si se te olvida, di esto**

- El Dockerfile es la receta.
- La imagen es el molde.
- El contenedor es la imagen en ejecución, sin privilegios.

**Si preguntan:** ¿Dónde se guardan las imágenes?

Se guardan en un registro, que funciona como una biblioteca de imágenes. Nosotros usamos el registro de GitHub.

**Si hay tiempo**

> Nuestra receta tiene dos etapas. Una compila con las herramientas de desarrollo y la otra conserva únicamente lo necesario para ejecutar, sin incluir el código fuente ni las herramientas de compilación.
>
> Las imágenes se organizan por capas. Cuando solo cambia el código, reutilizamos las capas anteriores y reducimos el tiempo de construcción y descarga.

### 27. Ventajas de Docker

**Qué decir**

> Docker nos ofrece varias ventajas. Primero, la misma imagen funciona en la computadora, en pruebas y en producción.
>
> También es liviano, porque un contenedor arranca en segundos y no necesita cargar un sistema operativo completo como una máquina virtual.
>
> Además, cada aplicación mantiene aisladas sus dependencias. Una puede usar Java 26 y otra Node en el mismo servidor sin interferir entre sí.
>
> Podemos limitar la memoria y la capacidad de procesamiento, o CPU, que utiliza cada contenedor. Así, una aplicación que se descontrola no consume todos los recursos ni afecta a las demás.
>
> Las imágenes también tienen versiones, de modo que podemos volver atrás utilizando una anterior. Finalmente, levantamos el sistema con un comando en lugar de seguir una lista manual.
>
> Ese comando no levanta una sola pieza, sino el sistema completo.

**Si se te olvida, di esto**

- La misma imagen funciona en todos los ambientes.
- Cada aplicación mantiene aisladas sus dependencias.
- Podemos limitar recursos y volver a una versión anterior.

**Si preguntan:** ¿En ARKA-Lite tienen tope de memoria y CPU en Docker?

No lo configuramos en Compose porque se usa para trabajar en una computadora. En Kubernetes sí lo aplicamos a la pantalla.

**Si hay tiempo**

> Una máquina virtual carga un sistema operativo completo, mientras un contenedor comparte el del servidor y lleva solo sus elementos. Por eso caben más contenedores en el mismo servidor.
>
> Los límites se definen al arrancar e indican cuánta memoria y CPU puede utilizar la aplicación. Sin ellos, un contenedor podría consumir todos los recursos disponibles.
>
> El aislamiento no reemplaza las demás medidas de seguridad. Por eso nuestro contenedor también funciona con un usuario sin privilegios.

### 28. Todo el sistema con un comando

**Qué decir**

> Un solo contenedor no representa todo el sistema. Con Docker Compose levantamos mediante un comando los dos servicios, las dos bases, la pantalla y las herramientas de registros.
>
> En total se ejecutan ocho contenedores. Compose los conecta dentro de una red privada, donde cada uno encuentra a los demás por su nombre, como mencionó Abdiel.
>
> También los inicia en orden. Primero levanta las bases y después cada servicio espera hasta que su base esté disponible.
>
> Además, entrega la configuración desde afuera, incluidos los datos de conexión que explicó Jossett.
>
> El beneficio es directo. Una persona nueva puede levantar el sistema con un comando, sin configurar cada componente por separado.
>
> Con el sistema reproducible, veamos cómo un cambio llega hasta una imagen publicada. Le paso la palabra a Jossett.

**Si se te olvida, di esto**

- Un comando levanta ocho contenedores.
- Compose los conecta y los inicia en orden.
- También les entrega la configuración.

**Si preguntan:** Dentro de un contenedor, ¿a dónde lleva localhost?

Lleva al mismo contenedor, no a otro servicio. Por eso utilizamos el nombre del servicio.

**Si preguntan:** ¿Compose sirve para producción?

Puede servir para algo pequeño en un solo servidor. Cuando necesitamos varios servidores o recuperación automática, conviene Kubernetes.

**Si hay tiempo**

> Si una base no arranca, el servicio correspondiente queda esperando y Compose muestra la causa. Así el error aparece en el lugar correcto.
>
> Desde la computadora solo abrimos lo necesario. La base de solicitudes no tiene una entrada externa y únicamente los servicios internos pueden alcanzarla.
>
> Antes de continuar, las bases informan cuándo están listas para aceptar conexiones mediante una herramienta de PostgreSQL.

> **Entregas la palabra** a Jossett Franceschi (lámina 29).

## Moises · DevOps: Kubernetes, y la observabilidad

Láminas 36–43 · unos 7 minutos.

> **Recibes la palabra** de Jossett Franceschi, después de la lámina 35.

### 36. Cómo trabaja Kubernetes

**Qué decir**

> Gracias, Jossett. Kubernetes requiere una forma distinta de pensar. No le damos instrucciones paso a paso, sino que describimos el estado que queremos mantener.
>
> Funciona como un termostato. No le indicamos cuándo debe encender y apagar el aire, sino la temperatura que queremos, y el equipo hace los ajustes.
>
> En Kubernetes escribimos en un archivo qué imagen debe usar, cuántas copias necesitamos y qué configuración corresponde.
>
> Luego entregamos ese archivo mediante un comando y Kubernetes crea los elementos solicitados.
>
> A partir de ahí, compara continuamente lo que existe con lo que pedimos. Si falta algo, lo crea y, si sobra, lo elimina.
>
> Por eso el sistema puede repararse solo. Como el archivo se guarda con el código, la configuración tampoco depende de la memoria de una persona.
>
> Ahora veamos dos conceptos nuevos. Un Pod es el espacio que Kubernetes le da a cada contenedor, y un Service es el nombre fijo para encontrarlo.

**Si se te olvida, di esto**

- Describimos el estado que queremos.
- Kubernetes funciona como un termostato.
- Compara el estado y corrige las diferencias.

**Si preguntan:** ¿Qué pasa si alguien cambia algo a mano?

Depende de qué cambie. Si alguien elimina un Pod, Kubernetes crea otro para mantener la cantidad de copias. Si modifica la configuración, debemos reflejar ese cambio en el archivo, para que lo guardado coincida con lo que está funcionando.

**Si hay tiempo**

> Los archivos de ARKA-Lite están en la carpeta k8s del repositorio, separados por componente. Para reconstruir el sistema en otro clúster, volvemos a aplicar esos archivos.
>
> Estos archivos se llaman manifiestos y utilizan un formato de texto llamado YAML. Un clúster es un grupo de servidores que trabajan juntos.

### 37. Contenedores y Pods: cómo se complementan

**Qué decir**

> Sigamos el diagrama de izquierda a derecha. La imagen es el molde que hizo Docker, y el Deployment es el pedido que le hacemos a Kubernetes: en este ejemplo, dos copias de esa imagen.
>
> A la derecha está un servidor del clúster, que es el grupo de servidores donde corren las aplicaciones. Cada contenedor vive dentro de un Pod, que le da su dirección, su memoria y su CPU. Siguiendo con el puerto, el contenedor es la carga y el Pod, su espacio en el patio.
>
> Arriba está el Service. Como los Pods se reemplazan y cambian de dirección, el Service mantiene un nombre fijo y reparte el trabajo entre las copias.
>
> En ARKA-Lite usamos una copia de cada pieza. Para tener dos, basta con cambiar un número en su archivo.
>
> Ya conocemos las piezas principales. Ahora veamos qué capacidades nos ofrece Kubernetes con ellas.

**Si se te olvida, di esto**

- La imagen es el molde y el contenedor la ejecución.
- El Pod aporta red, memoria y CPU.
- El Deployment mantiene la cantidad de copias.
- El Service ofrece un nombre fijo.

**Si preguntan:** ¿Un Pod puede tener más de un contenedor?

Sí, cuando dos procesos deben vivir juntos, aunque lo normal es uno. Los nuestros tienen uno principal y otro temporal que espera la base.

**Si preguntan:** ¿Dónde corren los Pods?

Corren en los servidores del clúster, llamados nodos. Kubernetes elige el nodo según los recursos disponibles.

**Si hay tiempo**

> El Pod permite que Kubernetes trabaje con distintas tecnologías de contenedores y también agrupe procesos que necesitan compartir la misma dirección.
>
> En ARKA-Lite, un contenedor temporal espera a que la base responda antes de iniciar el principal. Así evitamos que el servicio falle y se reinicie repetidamente.
>
> Los Pods se reemplazan en lugar de repararse. Por eso los datos importantes permanecen en la base y en su disco, no dentro del Pod.

### 38. Las bondades de Kubernetes

**Qué decir**

> Kubernetes aporta capacidades que Docker por sí solo no ofrece. Si un Pod se cae, levanta otro. Si aumenta la carga, pedimos más copias cambiando un número, y el Service reparte el trabajo entre ellas.
>
> También actualiza poco a poco, sin apagar todo, y permite volver a la versión anterior si algo falla.
>
> Controla la memoria y la CPU de cada Pod con una reserva y un tope. Es como un presupuesto: la reserva es lo que apartamos al planificar y el tope es el máximo permitido. En ARKA-Lite lo aplicamos a la pantalla.
>
> Por último, guarda las claves aparte, en un objeto llamado Secret, y los datos en un disco que sobrevive al reinicio del Pod. Todo queda escrito en archivos, sin depender de la memoria de una persona.
>
> Veamos qué ocurre cuando una de esas copias se cae.

**Si se te olvida, di esto**

- Kubernetes reemplaza los Pods que fallan.
- Puede aumentar copias y repartir el trabajo.
- La reserva es lo que apartamos y el tope, el máximo.
- Las claves y los datos van aparte.

**Si preguntan:** ¿Por qué la base no corre en un servicio administrado?

Porque este es un laboratorio. En producción evaluaríamos una base administrada o una configuración de Kubernetes preparada para conservar la identidad y el almacenamiento de la base, junto con sus respaldos.

**Si preguntan:** ¿Qué número se pone de reserva y de tope?

Comenzamos con una estimación, medimos el sistema y ajustamos. Un tope de memoria muy bajo provoca reinicios, y uno demasiado alto deja que un contenedor consuma más de lo conveniente.

**Si hay tiempo**

> Las revisiones de salud indican cuándo un servicio está listo para trabajar. Un proceso puede haber arrancado sin estar todavía preparado para recibir pedidos.
>
> Podemos aumentar las copias porque los servicios no guardan el estado importante en memoria, sino en la base.
>
> En el laboratorio abrimos un túnel mediante un comando para llegar a la pantalla. En un ambiente real se expondría de forma permanente.
>
> La pantalla reserva veinticinco milésimas de CPU y treinta y dos megas de memoria, con topes de doscientas cincuenta milésimas y ciento veintiocho megas. Llegar al tope de CPU la hace más lenta; pasarse de memoria provoca un reinicio.
>
> Definir la reserva y el tope también permite calcular cuántos servidores necesitamos, en lugar de estimarlo sin mediciones.

### 39. Cuando un Pod se cae

**Qué decir**

> Supongamos que el servicio de solicitudes se cae por un error o por el reinicio del servidor. Kubernetes detecta que falta una copia y crea otra con la misma imagen.
>
> La nueva copia espera hasta que su base esté lista. Después pasa la revisión de salud y comienza a recibir trabajo otra vez, sin que una persona tenga que intervenir.
>
> Como en el laboratorio mantenemos una sola copia, tenemos unos segundos sin servicio. Con dos copias, la interrupción casi no se notaría.
>
> Mientras tanto, los eventos pendientes permanecen guardados en la base y no se pierde información.
>
> Aquí se conectan tres partes de la presentación. La base guarda, la bandeja de salida espera y Kubernetes repara.
>
> Con este ejemplo cerramos la explicación de Kubernetes y resumimos lo aprendido de DevOps.

**Si se te olvida, di esto**

- Kubernetes reemplaza una copia que se cae.
- La nueva copia espera a que la base esté lista y pasa su revisión.
- Los eventos pendientes permanecen guardados.

**Si preguntan:** ¿Y si se cae la base?

Su Pod también se recrea y los datos permanecen en el disco. Los servicios esperan hasta que la base regrese.

**Si hay tiempo**

> Podemos demostrarlo eliminando el Pod mediante un comando. En la lista aparece uno nuevo y, después de unos segundos, vuelve a estar listo.
>
> Si se cae la base, ocurre algo similar. Kubernetes recrea el Pod y los datos continúan en su disco.

### 40. DevOps: lo que aprendimos

**Qué decir**

> De DevOps nos llevamos varias ideas. Docker y Kubernetes se complementan: uno empaqueta la aplicación y el otro la ejecuta y la cuida.
>
> La imagen es el entregable que construimos una vez y reutilizamos entre ambientes. Además, la configuración pertenece al ambiente y no al código.
>
> También aprendimos a describir el estado que queremos y a comprobar que los servicios realmente arrancan, en lugar de verificar solamente que compilan.
>
> El mayor valor es que todo quedó escrito. Tenemos la receta de cada imagen, el pipeline y los archivos de Kubernetes, sin depender de la memoria de una persona.
>
> El sistema ya está instalado. Ahora veamos cómo sabemos qué ocurre dentro.

**Si se te olvida, di esto**

- Docker empaqueta y Kubernetes opera.
- La misma imagen sirve en varios ambientes.
- La instalación queda escrita y puede repetirse.

**Si hay tiempo**

> Docker y Kubernetes requieren aprendizaje y no todos los sistemas los necesitan. Sin embargo, siempre conviene documentar la instalación de una forma escrita y repetible.

### 41. Observabilidad: tres preguntas

**Qué decir**

> Observabilidad es el nombre que damos a la capacidad de entender qué ocurre dentro del sistema sin tener que adivinar.
>
> La resumimos mediante tres preguntas. La primera es si el sistema está vivo. Cada servicio informa si funciona y si puede comunicarse con su base.
>
> La segunda pregunta es qué pasó. Para responderla utilizamos los registros, también llamados logs, que funcionan como la bitácora de cada servicio.
>
> La tercera es por dónde pasó un pedido. Cada llamada lleva un número de seguimiento, como el número de guía de un paquete. No es el número del evento que vimos con Abdiel: aquel evita avisos duplicados y este nos permite seguir el recorrido.
>
> Ese número permite saber por dónde pasó, a qué hora y en qué punto se detuvo. Sin él tendríamos que revisar cada servidor por separado.
>
> Con observabilidad, buscamos un solo número y reconstruimos todo el recorrido.
>
> Veamos cómo aplicamos estas ideas a un caso concreto, cuando un aviso no llega.

**Si se te olvida, di esto**

- Observabilidad es entender el sistema sin adivinar.
- Revisamos salud, registros y recorrido.
- Un número de seguimiento conecta toda la operación.

**Si preguntan:** ¿Esto es lo mismo que monitoreo?

Son conceptos relacionados. El monitoreo avisa que algo anda mal y la observabilidad ayuda a entender la causa.

**Si hay tiempo**

> Los registros del proyecto utilizan un formato estándar configurado fuera del código del negocio. Para activarlo solo necesitamos una línea de configuración.
>
> Cada servicio tiene una dirección especial que informa su salud. Kubernetes y la pantalla la consultan para mostrar si está disponible.

### 42. Un aviso no llegó: ¿cómo lo encontramos?

**Qué decir**

> Supongamos que alguien envió su solicitud, pero no recibió el aviso. No queremos revisar los registros de cada servicio uno por uno.
>
> Por eso los reunimos en un solo lugar con tres herramientas. Promtail es el recolector: toma los registros de cada contenedor. Loki es la base de datos donde se guardan. Y Grafana es la pantalla donde los consultamos.
>
> Escribimos el código de la solicitud y aparecen juntos los registros de ambos servicios, en orden: cuándo se envió, cuándo se entregó el evento y si notificaciones creó el aviso. Si el evento siguiera en la bandeja de salida, veríamos dónde se detuvo.
>
> Un servicio encendido no siempre funciona bien. Por eso también revisamos resultados, como la cantidad de eventos pendientes.
>
> Con este caso resuelto, resumamos lo que aprendimos sobre observabilidad.

**Si se te olvida, di esto**

- Promtail recolecta los registros.
- Loki es su base de datos y Grafana, la pantalla para consultarlos.
- Buscamos el código de la solicitud y aparecen los registros de los dos servicios.

**Qué hacer** (no se dice)

- El video arranca solo al llegar a la lámina; Alt+P lo pausa.
- No hace falta explicar cómo se escribe la consulta en Grafana: basta la idea de buscar el código de la solicitud.

**Si preguntan:** ¿Grafana muestra métricas?

Puede mostrarlas si le conectamos una fuente de métricas, como el consumo de memoria. En ARKA-Lite solo lo conectamos a Loki, así que lo usamos para consultar registros.

**Si hay tiempo**

> El número de seguimiento se llama traceId y viaja en cada llamada entre los servicios. Además, cada evento tiene su propio identificador.
>
> Si todo aparece encendido y falta un aviso, revisamos la bandeja de salida y los registros del relevador y de notificaciones.
>
> Podemos buscar los registros de notificaciones que contengan la palabra evento. En segundos obtenemos las líneas relacionadas con sus números.

### 43. Observabilidad: lo que aprendimos

**Qué decir**

> De observabilidad nos llevamos tres ideas. Los registros deben organizarse desde el primer día, porque hacerlo más adelante cuesta mucho más.
>
> En un sistema con varios servicios necesitamos un número que acompañe cada pedido de principio a fin. También debemos distinguir entre estar encendido y funcionar correctamente.
>
> Por eso no revisamos únicamente la salud del proceso, sino también sus resultados. Si tuviéramos que comenzar por una sola práctica, usaríamos un número por operación en todos los registros.
>
> Ya explicamos cómo funciona el sistema. Ahora veremos ese comportamiento en video. Abdiel, adelante.

**Si se te olvida, di esto**

- Organizamos los registros desde el inicio.
- Cada operación lleva un número de seguimiento.
- Estar encendido no siempre significa funcionar.

**Si hay tiempo**

> Esta práctica también funciona con procedimientos. Podemos guardar el mismo número en los registros de la aplicación, del procedimiento y de cualquier otro sistema involucrado.

> **Entregas la palabra** a Abdiel Barria (lámina 44).

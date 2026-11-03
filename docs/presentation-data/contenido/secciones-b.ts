import type { Seccion } from "./tipos.ts";

// Partes 3 y 4, las que el equipo presenta en detalle junto con DevOps: la
// base de datos (dos bases, su estructura, qué es un ORM, los datos de conexión
// y las transacciones) y la interconexión de los servicios (síncrono y
// asíncrono, Outbox e idempotencia). Cada lámina dice cómo se aplica también en
// los sistemas de hoy, con procedimientos almacenados.

export const datos: Seccion = {
  id: "s03",
  numero: 3,
  titulo: "Base de datos",
  corto: "Base de datos",
  subtitulo: "Dos bases PostgreSQL, el ORM, los datos de conexión y las transacciones.",
  temas: ["Modelo de datos", "Qué es un ORM", "Datos de conexión", "Transacciones"],
  icono: "database",
  enfoque: "fondo",
  rol: "bd",
  diapositivas: [
    {
      id: "s03-bases",
      titulo: "Dos bases, una por servicio",
      idea: "Cada microservicio tiene su propia base, y las dos corren en PostgreSQL.",
      visible: ["Dos bases de datos, una por servicio", "El mismo motor: PostgreSQL 17", "Ninguna consulta cruza de una base a otra", "Cada base guarda sus datos en su propio disco"],
      valor: "Cada base cambia a su ritmo, sin coordinar instalaciones con otros equipos.",
      visual: {
        tipo: "cifras",
        cifras: [
          { valor: "2", icono: "database", titulo: "bases de datos", texto: "db-solicitudes y db-notificaciones: una por servicio.", tono: "marino" },
          { valor: "17", icono: "server", titulo: "PostgreSQL", texto: "El mismo motor y la misma versión en las dos.", tono: "cian" },
          { valor: "0", icono: "ban", titulo: "JOIN entre bases", texto: "Ni consultas ni llaves foráneas que crucen de una a otra.", tono: "error" },
          { valor: "1", icono: "hard-drive", titulo: "disco por base", texto: "Los datos no se pierden aunque el servicio se reinicie.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "Gracias, Ricardo. El sistema tiene dos bases de datos, una para cada servicio, y ambas utilizan PostgreSQL, versión diecisiete.",
          "Usamos dos porque cada servicio es dueño de sus datos. Solicitudes guarda los trámites y los eventos pendientes, mientras notificaciones registra los eventos que ya recibió.",
          "Así, si una base cambia su estructura, la otra no se ve afectada. No hacemos consultas que combinen tablas de ambas bases ni definimos llaves foráneas entre ellas, es decir, referencias que obliguen a que un dato exista en la otra base.",
          "Cuando un servicio necesita un dato del otro, lo pide por la red. Además, cada base funciona por separado y tiene su propio disco.",
          "Por eso los datos permanecen cuando un servicio se reinicia y, si una base presenta una falla, la otra puede continuar trabajando.",
        ],
        conTusPalabras: [
          "Tenemos dos bases PostgreSQL, una por servicio.",
          "No hacemos consultas que crucen las bases.",
          "Cada base conserva sus datos en su propio disco.",
        ],
        preguntas: [
          { texto: "¿Y si necesito un reporte que junte datos de las dos?", respuesta: "Se prepara fuera de los servicios, por ejemplo con una réplica o un proceso de reportes que lea ambas fuentes. Un servicio no debe entrar en la base del otro." },
          { texto: "¿No es más difícil administrar dos bases?", respuesta: "Son dos bases pequeñas y cada una tiene una responsabilidad. Se respaldan y vigilan como cualquier PostgreSQL, y la caída de una no detiene la otra." },
        ],
        transicion: "Ahora veamos qué información guarda cada una.",
        respaldo: "docs/inicio/bases-de-datos-locales.md",
      },
    },
    {
      id: "s03-modelo",
      titulo: "La estructura de las bases",
      idea: "Tres tablas en dos bases, y una sola cosa cruza la frontera: el número del evento.",
      visible: ["solicitud: el trámite y su estado", "evento: los eventos por entregar", "evento_procesado: los eventos ya recibidos", "Lo único que cruza es el número del evento"],
      porque: "Cada servicio cambia su estructura sin coordinarse con el otro; solo el número del evento es compartido.",
      valor: "Un modelo pequeño, con reglas que también cuida la base: restricciones, llaves e índices.",
      visual: {
        tipo: "tablas",
        bases: [
          {
            titulo: "db-solicitudes",
            subtitulo: "PostgreSQL 17",
            tono: "marino",
            tablas: [
              { nombre: "solicitud", columnas: ["id · llave primaria", "tipo", "estado · solo 4 valores"] },
              { nombre: "evento", columnas: ["id · llave primaria", "solicitud_id · llave foránea", "evento_id · número único", "procesado · ¿ya se entregó?"] },
            ],
          },
          {
            titulo: "db-notificaciones",
            subtitulo: "PostgreSQL 17",
            tono: "cian",
            tablas: [{ nombre: "evento_procesado", columnas: ["evento_id · llave primaria", "uno por evento recibido"] }],
          },
        ],
        enlace: "evento_id, por la red",
      },
      guion: {
        decir: [
          "Veamos qué hay dentro. En la base de solicitudes, la tabla solicitud guarda el número, el tipo y el estado del trámite.",
          "La propia base solo acepta los cuatro estados válidos, incluso si alguien intenta escribir directamente en la tabla. Al lado está la tabla evento, que funciona como una bandeja de salida.",
          "Cada fila registra un evento, con un número único y una marca que indica si está pendiente o ya fue entregado.",
          "La base de notificaciones tiene una tabla principal con los eventos que ya recibió. Funciona como el libro de registro de la entrada de una oficina.",
          "No existe una conexión directa entre las bases. Lo que las relaciona es el número del evento, que viaja en el mensaje entre los servicios.",
        ],
        conTusPalabras: [
          "Una tabla guarda la solicitud.",
          "Otra mantiene los eventos pendientes.",
          "Notificaciones registra los eventos que ya recibió.",
        ],
        preguntas: [
          { texto: "¿Dónde se guarda el texto de cada aviso?", respuesta: "En este proyecto queda en la memoria del servicio de notificaciones y la base solo registra los eventos procesados. En producción usaríamos una tabla adicional." },
          { texto: "¿Por qué usan un identificador largo, llamado UUID, y no un número consecutivo?", respuesta: "Porque la aplicación puede generarlo sin consultar la base, con una probabilidad de coincidencia extremadamente baja. Conservamos ese mismo identificador en cada reintento para reconocer el evento." },
        ],
        transicion: "Ahora veremos un cambio importante frente a muchas aplicaciones actuales: dónde vive la regla del negocio.",
        respaldo: "docs/arquitectura/datos-y-consistencia.md",
      },
    },
    {
      id: "s03-sp-orm",
      titulo: "Del procedimiento almacenado al ORM",
      idea: "La diferencia no es la base de datos: es dónde vive la regla del negocio.",
      visible: ["Con procedimiento, la regla vive en la base", "Con ORM, la regla vive en el código", "El ORM escribe el SQL de todos los días", "La base sigue cuidando datos, llaves e índices"],
      porque: "No es todo o nada: las reglas van al código y los reportes o consultas pesadas pueden seguir en SQL.",
      valor: "Reglas que se prueban en segundos y una base que sigue cuidando los datos.",
      visual: {
        tipo: "caminos",
        caminos: [
          {
            titulo: "Hoy: procedimientos almacenados",
            tono: "neutro",
            pasos: [
              { icono: "monitor", titulo: "Pantalla", texto: "La persona pulsa Enviar." },
              { icono: "server", titulo: "Aplicación", texto: "Solo pasa los parámetros." },
              { icono: "database", titulo: "Base de datos", texto: "El procedimiento decide y guarda." },
            ],
            flechas: ["pedido", "EXEC sp_enviar @id"],
            regla: 2,
          },
          {
            titulo: "ARKA-Lite: un ORM",
            tono: "cian",
            pasos: [
              { icono: "monitor", titulo: "Pantalla", texto: "La persona pulsa Enviar." },
              { icono: "code", titulo: "Servicio Java", texto: "Decide, con su prueba." },
              { icono: "table", titulo: "ORM", texto: "Escribe el SQL." },
              { icono: "database", titulo: "PostgreSQL", texto: "Guarda y cuida llaves e índices." },
            ],
            flechas: ["pedido", "guardar", "UPDATE"],
            regla: 1,
          },
        ],
      },
      guion: {
        decir: [
          "Aquí está uno de los cambios principales frente a muchas aplicaciones conocidas. La diferencia no es la base de datos, sino el lugar donde vive la regla del negocio.",
          "En el esquema habitual, la persona pulsa Enviar, la aplicación llama a un procedimiento almacenado y ese procedimiento decide y guarda. Por lo tanto, la regla vive en la base.",
          "En ARKA-Lite, la regla vive en el servicio junto con su prueba. Cuando la regla permite la operación, una herramienta llamada ORM prepara las instrucciones para guardar los datos. Esas instrucciones se escriben en SQL, el lenguaje con el que consultamos y modificamos la información de la base.",
          "Esto no significa que los procedimientos estén mal ni que la base pierda importancia: sigue cuidando las llaves, las restricciones y los índices. Solo movimos la decisión a otro lugar.",
          "Jossett lo mostrará con un ejemplo y después explicará qué es un ORM.",
        ],
        conTusPalabras: [
          "La diferencia está en dónde vive la regla.",
          "En ARKA-Lite vive en el servicio y tiene su prueba.",
          "La base sigue protegiendo llaves, restricciones e índices.",
        ],
        preguntas: [
          { texto: "¿Y el rendimiento? ¿El SQL que genera es bueno?", respuesta: "Sí, para guardar y buscar por llave. En consultas complejas podemos escribir SQL propio, mientras la base sigue manejando índices y restricciones." },
          { texto: "¿Hay que migrar todos los procedimientos?", respuesta: "No. Podemos comenzar con las reglas que cambian con frecuencia, mientras los reportes y procesos masivos permanecen en la base." },
        ],
        transicion: "Jossett, por favor.",
        respaldo: "docs/arquitectura/datos-y-consistencia.md",
      },
    },
    {
      id: "s03-misma-regla",
      titulo: "La misma regla, escrita de las dos formas",
      idea: "Regla del negocio: solo se puede enviar una solicitud que está en borrador.",
      visible: ["Hoy: la regla dentro de un procedimiento almacenado", "ARKA-Lite: la misma regla en un método Java", "La regla no cambia; cambia dónde se ejecuta", "La base sigue cuidando llaves, restricciones e índices"],
      valor: "La misma regla, más fácil de probar y de cambiar, sin que la base pierda su papel.",
      rol: "orm",
      visual: {
        tipo: "codigos",
        lados: [
          {
            titulo: "Hoy: en un procedimiento",
            icono: "database",
            tono: "neutro",
            lenguaje: "sql",
            codigo: "CREATE PROCEDURE sp_enviar @id VARCHAR(20) AS\nBEGIN\n  IF (SELECT estado FROM solicitud\n      WHERE id = @id) <> 'BORRADOR'\n    THROW 50001, 'Solo se envía en BORRADOR', 1;\n  UPDATE solicitud SET estado = 'ENVIADA'\n   WHERE id = @id;\nEND",
            puntos: ["La regla y el dato viven juntos en la base", "Probarla exige una base con datos", "Cambiarla es instalar en la base"],
          },
          {
            titulo: "ARKA-Lite: en el código",
            icono: "code",
            tono: "cian",
            lenguaje: "java",
            codigo: "public Solicitud enviar() {\n    if (estado != Estado.BORRADOR)\n        throw new TransicionNoPermitida(\n            \"solo se puede enviar en BORRADOR\");\n    return new Solicitud(id, tipo, Estado.ENVIADA);\n}\n// El ORM escribe el SQL:\n// UPDATE solicitud SET estado = ? WHERE id = ?",
            puntos: ["La regla vive en el código, con su prueba", "Se prueba en milisegundos, sin base", "La base sigue cuidando llaves e índices"],
          },
        ],
      },
      guion: {
        decir: [
          "Gracias, Marlene. Veamos esa diferencia con una de las reglas que mencionó Luis: una solicitud solo puede enviarse cuando está en borrador.",
          "A la izquierda, el procedimiento consulta el estado, valida la condición y actualiza el dato. No necesitamos leer cada línea para notar que la regla y el dato están juntos en la base.",
          "A la derecha aparece la misma regla en el código de la aplicación. Si el estado no es borrador, se produce un error. Si lo es, la solicitud pasa a enviada.",
          "La regla no cambia; cambia dónde se ejecuta. Y al tenerla en el código, podemos probarla en milésimas de segundo, sin una base.",
        ],
        conTusPalabras: [
          "Estamos comparando responsabilidades, no tecnologías.",
          "La misma regla puede vivir en la base o en la aplicación.",
          "En el código podemos probarla rápidamente y sin una base.",
        ],
        preguntas: [{ texto: "¿Y si la regla necesita consultar muchos datos?", respuesta: "El servicio pide por llave únicamente los datos necesarios para decidir. Si el cálculo abarca millones de filas, puede seguir en una consulta o un procedimiento bien delimitado." }],
        transicion: "Veamos ahora qué es exactamente un ORM.",
      },
    },
    {
      id: "s03-que-es-orm",
      titulo: "¿Qué es un ORM?",
      idea: "Un traductor: la aplicación habla en objetos, la base habla en tablas, y el ORM traduce entre los dos.",
      visible: ["ORM significa mapeo objeto-relacional", "La aplicación trabaja con objetos", "La base trabaja con tablas y filas", "El ORM traduce y escribe el SQL de rutina"],
      comparacion: "Como un intérprete en una reunión: cada quien habla su idioma y el intérprete traduce. Ninguno de los dos tiene que aprender el idioma del otro.",
      iconoComparacion: "message-square",
      porque: "Menos SQL repetitivo y siempre con parámetros; lo que importa de la base lo seguimos diseñando nosotros.",
      valor: "Entender qué hace y qué no hace un ORM: traduce y escribe la rutina, pero no reemplaza el diseño de la base.",
      rol: "orm",
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "code", titulo: "La aplicación", texto: "Dice: guarda esta solicitud.", tono: "marino" },
          { icono: "table", titulo: "El ORM", texto: "Traduce y escribe el SQL. Aquí: Hibernate.", tono: "cian" },
          { icono: "database", titulo: "La base", texto: "Recibe el SQL y guarda la fila.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "ORM significa mapeo objeto-relacional. En palabras sencillas, es una herramienta que hace de intérprete entre la aplicación y la base de datos.",
          "La aplicación trabaja con objetos, como una solicitud que tiene número, tipo y estado. La base, en cambio, trabaja con tablas, filas y columnas.",
          "El ORM traduce de un lado a otro. Cuando la aplicación le pide guardar una solicitud, identifica la tabla y la columna de cada dato, genera el SQL y lo envía.",
          "Cuando la base responde, hace el recorrido contrario y convierte la fila en un objeto. Es como un intérprete en una reunión, donde cada parte puede hablar su propio idioma.",
          "En nuestro proyecto usamos Hibernate, aunque la idea existe en otras tecnologías. Por ejemplo, .NET tiene Entity Framework.",
          "El ORM no diseña la base por nosotros: las llaves, las relaciones y los índices los seguimos definiendo. Y si una consulta es compleja, podemos escribirla a mano.",
        ],
        conTusPalabras: [
          "El ORM traduce entre objetos y tablas.",
          "Hibernate genera el SQL de las operaciones comunes.",
          "Nosotros seguimos diseñando la base y podemos escribir SQL a mano.",
        ],
        preguntas: [{ texto: "¿El ORM reemplaza a quien administra la base de datos?", respuesta: "No. Esa persona sigue diseñando el modelo, cuidando los índices y revisando el SQL generado, aunque la herramienta resuelva muchas consultas rutinarias." }],
        transicion: "Veamos ahora cómo una clase de la aplicación se relaciona con una tabla.",
      },
    },
    {
      id: "s03-orm",
      titulo: "El ORM por dentro: una clase es una tabla",
      idea: "El ORM lee la clase, sabe a qué columna va cada campo y escribe el SQL.",
      visible: ["Una marca dice que la clase representa una tabla", "Cada campo es una columna", "Otra marca señala la llave primaria", "Guardar y buscar se vuelven SQL con parámetros"],
      valor: "El SQL de todos los días sale solo y siempre con parámetros: menos código y menos riesgo de inyección.",
      rol: "orm",
      visual: {
        tipo: "mapeo",
        clase: { titulo: "SolicitudEntity", subtitulo: "Clase Java · representa la tabla", campos: [{ nombre: "@Id String id" }, { nombre: "String tipo" }, { nombre: "String estado" }] },
        tabla: { titulo: "solicitud", subtitulo: "Tabla en PostgreSQL", columnas: [{ nombre: "id", detalle: "llave primaria" }, { nombre: "tipo", detalle: "texto" }, { nombre: "estado", detalle: "solo 4 valores" }] },
        operaciones: [
          { codigo: "guardar una nueva", sql: "INSERT INTO solicitud (id, tipo, estado) VALUES (?, ?, ?)" },
          { codigo: "buscar por número", sql: "SELECT id, tipo, estado FROM solicitud WHERE id = ?" },
          { codigo: "guardar una que existe", sql: "UPDATE solicitud SET tipo = ?, estado = ? WHERE id = ?" },
        ],
      },
      guion: {
        decir: [
          "Aquí vemos la traducción lado a lado. A la izquierda está una clase de Java y, a la derecha, la tabla solicitud.",
          "Una marca le indica al ORM que esa clase representa la tabla. Después, cada campo corresponde a una columna y la marca Id identifica la llave primaria.",
          "Con ese mapeo, el ORM genera las operaciones básicas. Para guardar una solicitud nueva, el ORM genera un INSERT, que agrega una fila. Para buscarla por número, genera un SELECT, que consulta los datos.",
          "Cuando enviamos una solicitud existente, genera un UPDATE, que actualiza su estado. Los valores viajan como parámetros, representados por los signos de interrogación, y nunca se pegan al texto del SQL.",
          "Es el mismo principio utilizado con los parámetros de un procedimiento: los valores se tratan como datos y no como instrucciones. Así evitamos que un texto ingresado por una persona altere la consulta, lo que se conoce como inyección de SQL.",
          "Así cada pieza hace una sola cosa: las reglas deciden, el ORM traduce y la base guarda. Si algo falla, sabemos en qué punto buscar.",
        ],
        conTusPalabras: [
          "Cada campo de la clase corresponde a una columna de la tabla.",
          "El ORM genera las instrucciones para agregar, consultar y actualizar los datos.",
          "Los valores viajan como parámetros seguros.",
        ],
        preguntas: [
          { texto: "¿Se puede ver el SQL que genera?", respuesta: "Sí. Una línea de configuración permite mostrarlo en los registros, lo que ayuda a revisar su funcionamiento y rendimiento." },
        ],
        transicion: "Para llegar a la base, el ORM necesita su dirección, usuario y clave. Veamos dónde guardamos esos datos.",
      },
    },
    {
      id: "s03-credenciales",
      titulo: "¿Dónde guardamos los datos de conexión?",
      idea: "La misma idea que ya conocemos: la dirección y la clave no van escritas en el código.",
      visible: ["Hoy: un archivo web.config en el servidor", "ARKA-Lite: variables que entrega el ambiente", "En los dos casos, fuera del código", "Si cambia el servidor o la clave, el código no se toca"],
      porque: "Cambiar de servidor o de clave no obliga a tocar el código ni a volver a construir la aplicación.",
      valor: "Reconocer que es la misma buena práctica que ya aplicamos, con otra herramienta.",
      rol: "orm",
      visual: {
        tipo: "contraste",
        lados: [
          { titulo: "Hoy: web.config", icono: "file-text", tono: "neutro", puntos: ["Un archivo en el servidor", "Guarda servidor, base, usuario y clave", "Cada servidor tiene su propia copia"] },
          { titulo: "ARKA-Lite: variables de entorno", icono: "settings", tono: "cian", puntos: ["El ambiente se las entrega a la aplicación al arrancar", "Guardan los mismos datos", "La misma aplicación sirve en todos los ambientes"] },
        ],
      },
      guion: {
        decir: [
          "Toda aplicación necesita conocer la ubicación de la base, el usuario y la clave para entrar. A este conjunto de datos lo llamamos cadena de conexión.",
          "En nuestros sistemas actuales la guardamos en un archivo web.config dentro del servidor. Esa ya es una buena práctica, porque la información no está escrita en el código.",
          "ARKA-Lite aplica la misma idea con otra herramienta. En lugar de usar un archivo junto a la aplicación, recibe variables de entorno cuando arranca.",
          "Así, el ambiente donde se ejecuta le entrega la dirección, el usuario y la clave. La misma aplicación puede funcionar en desarrollo, pruebas y producción sin cambiar su código.",
          "Cada ambiente proporciona sus propios valores. Por eso, si cambia el servidor o renovamos una clave, solo actualizamos la configuración del ambiente.",
        ],
        conTusPalabras: [
          "La conexión se configura fuera del código.",
          "Aquí usamos variables que entrega el ambiente.",
          "La misma aplicación sirve en distintos ambientes.",
        ],
        preguntas: [
          { texto: "¿Dónde queda la clave en Kubernetes?", respuesta: "Se guarda en un objeto para datos sensibles llamado Secret, que el contenedor recibe al arrancar. Los permisos controlan quién puede leerlo." },
          { texto: "¿Hay que dejar de usar web.config?", respuesta: "No. Sigue siendo válido para las aplicaciones que funcionan de esa manera. Lo importante es mantener la clave fuera del código y del repositorio." },
        ],
        transicion: "Ahora Marlene explicará cómo una transacción garantiza que los datos queden completos. Marlene, adelante.",
        respaldo: "docs/inicio/bases-de-datos-locales.md",
      },
    },
    {
      id: "s03-transacciones",
      titulo: "Una transacción: todo o nada",
      idea: "El BEGIN y COMMIT de siempre: la solicitud y su evento se guardan juntos o no se guarda nada.",
      visible: ["BEGIN: empieza la transacción", "Se actualiza la solicitud", "Se anota el evento pendiente", "COMMIT: todo queda guardado", "Si algo falla: ROLLBACK de todo"],
      comparacion: "Como una transferencia bancaria: o sale de una cuenta y entra en la otra, o no pasa nada. Nunca a medias.",
      iconoComparacion: "repeat",
      valor: "Lo que cambia junto se guarda junto: nunca quedan datos a medias.",
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "play", titulo: "BEGIN", texto: "Empieza la transacción.", tono: "marino" },
          { icono: "clipboard-list", titulo: "UPDATE", texto: "La solicitud pasa a enviada.", tono: "marino" },
          { icono: "inbox", titulo: "INSERT", texto: "El evento queda pendiente.", tono: "marino" },
          { icono: "circle-check", titulo: "COMMIT", texto: "Las dos cosas quedan guardadas.", tono: "correcto" },
        ],
        desvio: { desde: 2, etiqueta: "si algo falla", elemento: { icono: "rotate-ccw", titulo: "ROLLBACK", texto: "No queda nada a medias: ni la solicitud ni el evento.", tono: "error" } },
      },
      guion: {
        decir: [
          "Gracias, Jossett. Este concepto es conocido para quienes trabajan con bases de datos, aunque aquí lo controlamos desde la aplicación.",
          "Cuando enviamos una solicitud, abrimos una transacción: un grupo de cambios que se guardan juntos o se deshacen completos. Ese inicio corresponde al BEGIN. Primero cambiamos el estado a enviada y, dentro de la misma transacción, registramos el evento pendiente.",
          "Al final, el COMMIT guarda ambos cambios juntos. Si algo falla en el proceso, hacemos ROLLBACK y deshacemos todo.",
          "Funciona como una transferencia bancaria. El dinero debe salir de una cuenta y entrar en la otra, o no debe ocurrir ningún cambio.",
          "En nuestro caso, el cambio a enviada y el evento pendiente quedan guardados juntos. La transacción evita que se conserve uno sin el otro. Esa garantía sostiene la interconexión que veremos a continuación.",
        ],
        conTusPalabras: [
          "El cambio de estado y el evento pendiente se guardan juntos.",
          "Si algo falla, se deshacen ambos cambios.",
          "La operación nunca queda a medias.",
        ],
        preguntas: [{ texto: "¿Esto reemplaza las transacciones dentro de un procedimiento?", respuesta: "Es el mismo concepto de BEGIN, COMMIT y ROLLBACK. La diferencia es que la aplicación abre la transacción alrededor de toda la operación." }],
        transicion: "Antes de pasar a esa interconexión, resumamos lo que aprendimos sobre la base de datos.",
      },
    },
    {
      id: "s03-aprendizajes",
      titulo: "Base de datos: lo que aprendimos",
      visible: ["El ORM no elimina el trabajo de base de datos", "Los datos de conexión no viven en el código", "La transacción sigue siendo la más confiable", "La estructura de la base también se controla"],
      valor: "El conocimiento de base de datos del staff sigue siendo clave, ahora junto al código.",
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "3", titulo: "tablas en dos bases" }, { valor: "0", titulo: "consultas que crucen de una base a otra" }],
        items: [
          { icono: "table", titulo: "El ORM no elimina el trabajo de base de datos", texto: "Escribe el SQL de rutina; índices, llaves y transacciones siguen siendo diseño.", valor: "Reglas probadas en código y una base que se cuida." },
          { icono: "key-round", titulo: "La conexión no vive en el código", texto: "La entrega el ambiente donde corre la aplicación.", valor: "Cambiar de servidor o de clave sin tocar el código." },
          { icono: "repeat", titulo: "La transacción sigue siendo la más confiable", texto: "Lo que cambia junto se guarda en el mismo COMMIT.", valor: "Nunca quedan datos a medias." },
          { icono: "file-code", titulo: "La estructura también se controla", texto: "Se guarda y se revisa junto con el código.", valor: "Instalaciones repetibles y errores visibles al inicio." },
        ],
      },
      guion: {
        decir: [
          "De la base de datos nos llevamos cuatro ideas. El ORM genera el SQL rutinario, pero no elimina el trabajo de diseñar llaves, restricciones e índices.",
          "También mantenemos los datos de conexión fuera del código y los entregamos desde el ambiente. La transacción continúa siendo una de las herramientas más confiables para proteger una operación.",
          "Además, guardamos y controlamos la estructura de la base junto con el código. Para quienes trabajamos con bases de datos, el mensaje es claro: ese conocimiento sigue siendo fundamental.",
        ],
        conTusPalabras: [
          "El ORM ayuda, pero no reemplaza el diseño de la base.",
          "La conexión queda fuera del código.",
          "Las transacciones siguen protegiendo los datos.",
        ],
        transicion: "Ahora veremos cómo los servicios se comunican sin perder ni duplicar información. Le paso la palabra a Abdiel.",
      },
    },
  ],
};

export const interconexion: Seccion = {
  id: "s04",
  numero: 4,
  titulo: "Interconexión de servicios",
  corto: "Interconexión",
  subtitulo: "Cómo se hablan los servicios: síncrono, asíncrono, Outbox e idempotencia.",
  temas: ["Síncrono y asíncrono", "Patrón Outbox", "Idempotencia"],
  icono: "waypoints",
  enfoque: "fondo",
  rol: "interconexion",
  diapositivas: [
    {
      id: "s04-sincrono",
      titulo: "Síncrono o asíncrono",
      idea: "Si necesitamos el resultado para continuar, esperamos; si no, el trabajo se completa después.",
      visible: ["Síncrono: llama y espera", "Asíncrono: envía y sigue trabajando", "Síncrono responde ya; asíncrono puede demorar", "Si el otro se cae, el mensaje espera"],
      comparacion: "Síncrono es una llamada: me quedo en la línea hasta que me responden. Asíncrono es un correo: lo envío y sigo con lo mío.",
      iconoComparacion: "message-square",
      valor: "La caída de un sistema secundario no detiene a quien está atendiendo al usuario.",
      visual: {
        tipo: "contraste",
        lados: [
          { titulo: "Síncrono", icono: "arrow-right", tono: "marino", puntos: ["La pantalla llama y espera el resultado", "Respuesta inmediata", "Si el servicio se cae, la persona ve el error"] },
          { titulo: "Asíncrono", icono: "mail", tono: "cian", puntos: ["Solicitudes envía el evento y sigue con su trabajo", "La respuesta puede demorar unos segundos", "Si notificaciones se cae, el evento espera"] },
        ],
      },
      guion: {
        decir: [
          "Gracias, Marlene. Como los servicios no comparten una base, necesitamos definir cómo se comunican, y hay dos formas de hacerlo. La síncrona se parece a una llamada telefónica, porque hacemos el pedido y esperamos la respuesta.",
          "La usamos para crear, aprobar o rechazar una solicitud, ya que la persona necesita conocer el resultado de inmediato. Si el otro lado está caído, verá el error.",
          "La comunicación asíncrona se parece a un correo. Enviamos el mensaje y seguimos trabajando sin esperar, aunque la respuesta pueda tardar unos segundos.",
          "En nuestro sistema, si el otro servicio está caído, el mensaje queda guardado hasta que podamos entregarlo. En un pago con tarjeta, por ejemplo, la aprobación es síncrona porque necesitamos saber si fue aceptado.",
          "En cambio, el comprobante por correo es asíncrono porque puede llegar después. La regla es sencilla. Usamos comunicación síncrona cuando necesitamos conocer el resultado para continuar, y asíncrona cuando el trabajo puede completarse después.",
        ],
        conTusPalabras: [
          "Síncrono significa pedir y esperar.",
          "Asíncrono significa enviar y continuar.",
          "Elegimos según cuándo se necesita la respuesta.",
        ],
        preguntas: [{ texto: "¿Por qué no hacerlo todo asíncrono?", respuesta: "Porque quien crea o aprueba una solicitud necesita saber en ese momento si la operación funcionó. Reservamos lo asíncrono para lo que puede esperar." }],
        transicion: "Ahora veamos cómo hacemos que ese mensaje espere sin perderse mediante el patrón Outbox.",
      },
    },
    {
      id: "s04-outbox",
      titulo: "Patrón Outbox: guardar primero, avisar después",
      idea: "La solicitud y su evento se guardan en la misma transacción; un proceso lo entrega después.",
      visible: ["Solicitud enviada y evento pendiente, juntos", "Si algo falla, no se guarda nada", "Un proceso entrega cada 5 segundos", "Si falla, sigue pendiente y se reintenta"],
      comparacion: "Como dejar una carta en la bandeja de salida: aunque el mensajero no pase hoy, la carta no se pierde.",
      iconoComparacion: "mail",
      valor: "Ningún evento se pierde, aunque el otro sistema esté caído. Y se puede aplicar también con procedimientos y una tarea programada.",
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "send", titulo: "Enviar", texto: "Solicitud y evento, en una transacción.", tono: "marino" },
          { icono: "inbox", titulo: "Bandeja de salida", texto: "El evento espera en su tabla.", tono: "marino" },
          { icono: "timer", titulo: "Relevador", texto: "Cada 5 segundos entrega los pendientes.", tono: "cian" },
          { icono: "bell", titulo: "Notificaciones", texto: "Lo recibe y crea el aviso.", tono: "correcto" },
        ],
        desvio: { desde: 2, etiqueta: "si falla", elemento: { icono: "refresh-cw", titulo: "Sigue pendiente", texto: "Con el mismo número; se reintenta en la siguiente vuelta.", tono: "advertencia" } },
      },
      guion: {
        decir: [
          "Si al enviar una solicitud llamáramos directamente a notificaciones y el servicio estuviera caído, la solicitud podría quedar enviada sin que nadie recibiera el aviso.",
          "Para resolverlo usamos el patrón Outbox, que significa bandeja de salida. Dentro de una sola transacción guardamos la solicitud y un evento pendiente, que es el registro de lo que falta comunicar.",
          "La persona recibe la respuesta de inmediato, mientras el evento queda esperando como una carta que todavía no ha salido.",
          "Después, un proceso llamado relevador revisa la bandeja cada cinco segundos y entrega los eventos pendientes. Podemos verlo como el mensajero del sistema.",
          "Si la entrega funciona, marca el evento como entregado. Si falla, lo deja pendiente y vuelve a intentarlo en la siguiente revisión.",
          "Así, aunque notificaciones se detenga, ningún evento se pierde y todos se entregan cuando regresa.",
          "La misma idea puede aplicarse con procedimientos almacenados: guardamos el evento en una tabla de pendientes y una tarea programada se encarga de entregarlo.",
        ],
        conTusPalabras: [
          "Primero guardamos y después avisamos.",
          "El relevador revisa la bandeja cada cinco segundos.",
          "Si la entrega falla, el evento permanece guardado.",
          "La misma idea funciona con una tabla de pendientes y una tarea programada.",
        ],
        preguntas: [
          { texto: "¿Que el envío responda bien significa que el aviso ya existe?", respuesta: "No. Significa que la solicitud y el evento quedaron guardados. El aviso se crea después." },
          { texto: "¿Qué pasa si se cae solicitudes con eventos pendientes?", respuesta: "Los eventos permanecen en la base. Cuando el servicio regresa, el relevador los encuentra y los entrega." },
        ],
        transicion: "Como el sistema reintenta las entregas, ahora debemos evitar que el mismo evento produzca dos avisos.",
        respaldo: "docs/arquitectura/flujo-y-referencias.md",
      },
    },
    {
      id: "s04-idempotencia",
      titulo: "Idempotencia: el mismo evento, un solo aviso",
      idea: "Repetir la entrega no multiplica el efecto.",
      visible: ["Cada evento trae un número que no cambia", "Notificaciones anota los números recibidos", "Si llega uno repetido, lo ignora"],
      comparacion: "Como un portero con lista de invitados: si alguien ya entró, no lo vuelve a anotar.",
      iconoComparacion: "user-check",
      valor: "Se puede reintentar sin miedo: un pago, un correo o un aviso nunca se duplica.",
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "mail", titulo: "Llega el evento", texto: "Trae su número.", tono: "marino" },
          { icono: "fingerprint", titulo: "¿Ya lo recibimos?", texto: "Se busca en la lista.", tono: "cian" },
          { icono: "bell", titulo: "Crear el aviso", texto: "Solo si el número es nuevo.", tono: "correcto" },
          { icono: "clipboard-check", titulo: "Anotar el número", texto: "En la misma transacción.", tono: "correcto" },
        ],
        desvio: { desde: 1, etiqueta: "ya estaba", elemento: { icono: "ban", titulo: "Ignorarlo", texto: "No se crea otro aviso. Duplicados: cero.", tono: "neutro" } },
      },
      guion: {
        decir: [
          "Un evento puede llegar dos veces. Por ejemplo, notificaciones lo recibe correctamente, pero la confirmación se pierde en la red. Como solicitudes no sabe que llegó, vuelve a enviarlo.",
          "Para manejarlo usamos la idempotencia, una palabra técnica para una idea sencilla. Significa que repetir la misma operación no cambia el resultado.",
          "Cada evento trae un número fijo, que llamamos el número del evento. Cuando llega, notificaciones lo busca en la lista. Si es nuevo, crea el aviso y registra el número. Si ya estaba registrado, lo ignora.",
          "Es como un portero con una lista de invitados, porque quien ya entró no puede entrar una segunda vez.",
          "Las dos soluciones se complementan. La bandeja de salida evita perder eventos y la idempotencia impide duplicar avisos.",
          "Este principio sirve para cualquier proceso que tenga reintentos, como un pago, un correo o una importación de archivos.",
        ],
        conTusPalabras: [
          "Idempotencia significa repetir sin cambiar el resultado.",
          "El número del evento permite reconocer duplicados.",
          "La bandeja de salida conserva el evento y la idempotencia evita que una entrega repetida cree otro aviso.",
        ],
        preguntas: [
          { texto: "¿Qué resuelve el Outbox y qué resuelve la idempotencia?", respuesta: "Outbox evita perder el evento. La idempotencia evita que ese evento produzca el mismo efecto dos veces." },
          { texto: "¿Y si llegan dos entregas al mismo tiempo?", respuesta: "La llave primaria permite registrar el número una sola vez. La otra entrega falla y, al reintentarse, encuentra el evento ya procesado." },
        ],
        transicion: "Con ambas garantías claras, veamos en una sola imagen quién habla con quién, y cómo.",
      },
    },
    {
      id: "s04-comunicacion",
      titulo: "Resumen: quién habla con quién, y cómo",
      idea: "El recorrido completo de una solicitud: una parte mientras la persona espera y otra después, por su cuenta.",
      visible: ["Mientras la persona espera: la pantalla, solicitudes y su base", "La solicitud y su evento se guardan juntos", "Después, el relevador entrega el evento a notificaciones", "Notificaciones revisa el número y crea un solo aviso", "Todos se encuentran por nombre, y un número sigue cada llamada"],
      porque: "Las piezas se encuentran por su nombre y un número de seguimiento viaja en cada llamada: una sola búsqueda sigue todo el recorrido.",
      valor: "Ver en una sola imagen cómo encajan lo síncrono, la bandeja de salida y la idempotencia.",
      visual: {
        tipo: "caminos",
        caminos: [
          {
            titulo: "Mientras la persona espera: síncrono",
            tono: "marino",
            pasos: [
              { icono: "user", titulo: "Navegador", texto: "Solo conoce la pantalla." },
              { icono: "monitor", titulo: "La pantalla", texto: "Reenvía cada pedido." },
              { icono: "clipboard-list", titulo: "Solicitudes", texto: "Aplica la regla y responde ya." },
              { icono: "database", titulo: "Su base", texto: "Solicitud y evento, juntos." },
            ],
            flechas: ["pide", "reenvía", "guarda"],
          },
          {
            titulo: "Después, por su cuenta: asíncrono",
            tono: "cian",
            pasos: [
              { icono: "inbox", titulo: "La bandeja", texto: "El evento espera su turno." },
              { icono: "timer", titulo: "Relevador", texto: "Cada 5 segundos lo entrega." },
              { icono: "bell", titulo: "Notificaciones", texto: "Crea el aviso si es nuevo." },
              { icono: "clipboard-check", titulo: "Su base", texto: "Anota el número recibido." },
            ],
            flechas: ["lo toma", "por nombre", "anota"],
          },
        ],
      },
      guion: {
        decir: [
          "Con las piezas claras, veamos el recorrido completo en una sola imagen. Es el resumen de esta parte.",
          "Arriba está lo que ocurre mientras la persona espera. El navegador solo conoce la pantalla, y la pantalla pasa cada pedido por un intermediario que lo lleva al servicio de solicitudes. Es como la recepción de una empresa: pedimos un departamento y nos conectan con él.",
          "Solicitudes aplica la regla, guarda la solicitud y su evento en la misma transacción y responde de inmediato. Esa es la parte síncrona.",
          "Abajo está lo que pasa después, sin que nadie espere. El relevador toma el evento de la bandeja de salida y se lo entrega a notificaciones, que revisa el número, crea un solo aviso y anota que ya lo recibió. Esa es la parte asíncrona.",
          "Dos detalles unen todo. Las piezas se encuentran por su nombre y no por una dirección fija, y cada llamada lleva un número de seguimiento, distinto del número del evento, que nos permite reconstruir el recorrido en los registros. Moises lo retomará en la observabilidad.",
        ],
        conTusPalabras: [
          "Arriba, lo que pasa mientras la persona espera.",
          "Abajo, lo que pasa después, por su cuenta.",
          "Se encuentran por nombre y un número sigue cada llamada.",
        ],
        instrucciones: ["Recorrer la lámina de izquierda a derecha: primero el camino de arriba y después el de abajo."],
        preguntas: [{ texto: "¿Por qué no una cola de mensajes como RabbitMQ o Kafka?", respuesta: "Para este proyecto, basta con guardar el evento pendiente y entregarlo después mediante una llamada web al otro servicio. No necesitamos agregar una herramienta de mensajería. Si aumenta el volumen, podemos llevar el mismo diseño a una cola sin cambiar las reglas." }],
        transicion: "Con el recorrido completo a la vista, resumamos lo aprendido sobre la interconexión.",
        respaldo: "docs/arquitectura/flujo-y-referencias.md",
      },
    },
    {
      id: "s04-aprendizajes",
      titulo: "Interconexión: lo que aprendimos",
      visible: ["Esperar solo cuando hace falta", "Guardar primero, avisar después", "Todo reintento necesita idempotencia", "El formato del mensaje es lo único compartido"],
      valor: "Eventos guardados y sin avisos duplicados, con patrones que sirven en cualquier tecnología.",
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "0", titulo: "eventos perdidos" }, { valor: "0", titulo: "avisos duplicados al reentregar" }],
        items: [
          { icono: "send", titulo: "Esperar solo cuando hace falta", texto: "La pantalla espera la respuesta; el evento se entrega después.", valor: "Una caída parcial no detiene a quien usa el sistema." },
          { icono: "inbox", titulo: "Guardar primero, avisar después", texto: "Solicitud y evento en la misma transacción.", valor: "Un servicio caído no hace perder información." },
          { icono: "fingerprint", titulo: "Todo reintento necesita idempotencia", texto: "Un número fijo y la lista de los ya recibidos.", valor: "Reintentar sin miedo a duplicar." },
          { icono: "file-json", titulo: "El formato es lo único compartido", texto: "El mensaje tiene los mismos campos en los dos lados.", valor: "Equipos independientes con un acuerdo claro." },
        ],
      },
      guion: {
        decir: [
          "De la interconexión nos llevamos cuatro ideas. Esperamos la respuesta cuando la necesitamos para continuar y dejamos para después el trabajo que puede esperar.",
          "También aprendimos que guardar primero y avisar después es más confiable que coordinar dos sistemas al mismo tiempo.",
          "Cuando una operación se reintenta, el receptor debe reconocer lo repetido. Además, los servicios solo comparten el formato del mensaje, así que cualquier cambio debe coordinarse en ambos lados.",
          "Estas decisiones no dependen de Java y pueden aplicarse a los sistemas que ya tenemos.",
        ],
        conTusPalabras: [
          "Elegimos entre esperar o avisar después.",
          "Guardamos primero para no perder información.",
          "Reconocemos repetidos para evitar duplicados.",
        ],
        transicion: "Ahora veremos cómo llevamos el código y los datos hasta un servidor. Le paso la palabra a Kevin, de infraestructura.",
      },
    },
  ],
};

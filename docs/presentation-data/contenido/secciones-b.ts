import type { Seccion } from "./tipos.ts";

// Partes 3 y 4, las que el equipo presenta a fondo junto con DevOps: la base
// de datos (dos bases, su estructura, el ORM, la cadena de conexión y las
// transacciones) y la interconexión de los servicios (síncrono y asíncrono,
// Outbox e idempotencia). Cada lámina dice cómo se aplica también en los
// sistemas de hoy, con procedimientos almacenados.

export const datos: Seccion = {
  id: "s03",
  numero: 3,
  titulo: "Base de datos",
  corto: "Base de datos",
  subtitulo: "Dos bases PostgreSQL, el ORM, la cadena de conexión y las transacciones.",
  temas: ["Modelo de datos", "ORM con JPA", "Cadena de conexión", "Transacciones"],
  icono: "database",
  enfoque: "fondo",
  rol: "bd",
  diapositivas: [
    {
      id: "s03-bases",
      titulo: "Dos bases, una por servicio",
      idea: "Cada microservicio tiene su propia base, y las dos corren en PostgreSQL.",
      visible: ["Dos bases de datos, una por servicio", "El mismo motor: PostgreSQL 17", "Ninguna consulta cruza de una base a otra", "En Kubernetes, cada base tiene su disco"],
      valor: "Cada base cambia a su ritmo, sin coordinar despliegues con otros equipos.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "cifras",
        cifras: [
          { valor: "2", icono: "database", titulo: "bases de datos", texto: "db-solicitudes y db-notificaciones: una por servicio.", tono: "marino" },
          { valor: "17", icono: "server", titulo: "PostgreSQL", texto: "El mismo motor y la misma versión en las dos.", tono: "cian" },
          { valor: "0", icono: "ban", titulo: "JOIN entre bases", texto: "Ni consultas ni llaves foráneas que crucen de una a otra.", tono: "error" },
          { valor: "1", icono: "hard-drive", titulo: "disco por base", texto: "En Kubernetes, los datos sobreviven aunque el contenedor se reinicie.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "Gracias. Como les contó mi compañero de arquitectura, el sistema tiene dos bases de datos, una para cada microservicio: db-solicitudes y db-notificaciones. [clic] Las dos están montadas en PostgreSQL, versión diecisiete.",
          "¿Por qué dos y no una? Porque cada servicio es dueño de sus datos. Solicitudes guarda las solicitudes y los avisos que tiene pendientes; notificaciones guarda qué avisos ya recibió. Si mañana una cambia su estructura, la otra ni se entera.",
          "[clic] Eso tiene una consecuencia que para quienes trabajamos con bases de datos pesa mucho: no hay ningún JOIN entre las dos bases, ni llaves foráneas que crucen. Si un servicio necesita algo del otro, se lo pregunta por HTTP.",
          "[clic] Y cada base corre en su propio contenedor. En Kubernetes, además, tiene su disco persistente: los datos sobreviven aunque el contenedor se reinicie.",
        ],
        preguntas: [
          { texto: "¿Y si necesito un reporte que junte datos de las dos?", respuesta: "Se arma fuera de los servicios, por ejemplo con una réplica o un proceso de reportes que lea de ambas. Lo que no se hace es que un servicio lea la base del otro." },
          { texto: "¿No es más difícil administrar dos bases?", respuesta: "Son dos bases pequeñas con una sola responsabilidad cada una. Se respaldan y se monitorean como cualquier PostgreSQL, y la caída de una no tumba a la otra." },
        ],
        transicion: "Veamos qué hay dentro de cada una.",
        respaldo: "docs/inicio/bases-de-datos-locales.md",
      },
    },
    {
      id: "s03-modelo",
      titulo: "La estructura de las bases",
      idea: "Tres tablas en dos bases, y una sola cosa cruza la frontera: el número del evento.",
      visible: ["solicitud: el trámite y su estado", "evento: los avisos pendientes de entregar", "evento_procesado: los avisos ya recibidos", "Lo único que cruza es el evento_id, por HTTP"],
      porque: "Cada servicio cambia su esquema sin coordinarse con el otro; solo el número del evento es compartido.",
      valor: "Un modelo pequeño, con reglas que también cuida la base: CHECK, llaves e índices.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "tablas",
        bases: [
          {
            titulo: "db-solicitudes",
            subtitulo: "PostgreSQL 17 · schema.sql",
            tono: "marino",
            tablas: [
              { nombre: "solicitud", columnas: ["id · PK · VARCHAR(20)", "tipo · VARCHAR(20)", "estado · CHECK: 4 estados"] },
              { nombre: "evento", columnas: ["id · PK · BIGSERIAL", "solicitud_id · FK a solicitud", "tipo · SolicitudEnviada", "evento_id · UUID", "procesado · false = pendiente"] },
            ],
          },
          {
            titulo: "db-notificaciones",
            subtitulo: "PostgreSQL 17 · Hibernate",
            tono: "cian",
            tablas: [{ nombre: "evento_procesado", columnas: ["evento_id · PK", "uno por evento recibido"] }],
          },
        ],
        enlace: "evento_id por HTTP",
      },
      guion: {
        decir: [
          "Veamos qué hay adentro. En la base de solicitudes, la tabla solicitud guarda el trámite: su identificador como llave primaria, el tipo y el estado. Y el estado tiene un CHECK que solo admite los cuatro valores válidos. Aunque alguien escriba directo en la tabla, la base no acepta un estado inventado.",
          "[clic] Al lado está la tabla evento, que funciona como bandeja de salida: cada fila es un aviso que hay que entregar. Tiene una llave foránea a la solicitud, un número único de evento, que es un UUID, y una columna procesado: mientras está en falso, el aviso sigue pendiente.",
          "[clic] En la base de notificaciones hay una sola tabla importante: evento_procesado, la lista de eventos que ya se recibieron. Su llave primaria es justamente ese número de evento.",
          "[clic] Y fíjense en la flecha: lo único que pasa de una base a la otra es el evento_id, y no viaja por la base, viaja por HTTP. Esa es la frontera entre los dos servicios.",
        ],
        preguntas: [
          { texto: "¿Dónde se guarda el texto de cada aviso?", respuesta: "En este proyecto, en la memoria del servicio de notificaciones; en la base solo queda qué eventos se procesaron. En producción sería una tabla más." },
          { texto: "¿Por qué un UUID y no un número secuencial?", respuesta: "Porque lo genera la aplicación sin consultar a la base y no se repite entre servicios. Así el mismo número sirve para reintentar sin duplicar." },
        ],
        transicion: "Ahora, la gran diferencia con muchas aplicaciones que manejamos hoy: dónde vive la regla del negocio.",
        respaldo: "docs/arquitectura/datos-y-consistencia.md",
      },
    },
    {
      id: "s03-esquema",
      titulo: "Un esquema que se cuida solo",
      idea: "Sin herramientas de migración, pero sin sorpresas al arrancar.",
      visible: ["schema.sql corre en cada arranque", "Todo es idempotente: IF NOT EXISTS", "Hibernate valida las entidades", "Un índice parcial para los pendientes"],
      recorridos: ["tecnico"],
      visual: {
        tipo: "tarjetas",
        tarjetas: [
          { icono: "repeat", titulo: "schema.sql idempotente", texto: "CREATE y ALTER … IF NOT EXISTS: se puede correr mil veces y también actualiza bases viejas.", tono: "marino" },
          { icono: "list-checks", titulo: "Hibernate valida", texto: "ddl-auto=validate: si una entidad no coincide con la tabla, el servicio no arranca.", tono: "cian" },
          { icono: "shield-check", titulo: "La base también cuida reglas", texto: "Un CHECK solo admite BORRADOR, ENVIADA, APROBADA o RECHAZADA.", tono: "correcto" },
          { icono: "gauge", titulo: "Índice parcial", texto: "idx_evento_pendiente solo indexa las filas con procesado = false.", tono: "advertencia" },
        ],
      },
      codigo: {
        lenguaje: "sql",
        archivo: "servicio-solicitudes/src/main/resources/schema.sql",
        texto: "ALTER TABLE evento ADD COLUMN IF NOT EXISTS\n    evento_id UUID NOT NULL DEFAULT gen_random_uuid();\nALTER TABLE evento ADD COLUMN IF NOT EXISTS\n    procesado BOOLEAN NOT NULL DEFAULT TRUE;\nALTER TABLE evento ALTER COLUMN procesado SET DEFAULT FALSE;\n\nCREATE INDEX IF NOT EXISTS idx_evento_pendiente\n    ON evento (procesado) WHERE procesado = FALSE;",
      },
      guion: {
        decir: [
          "No usamos Flyway ni Liquibase, así que nos pusimos una regla: el archivo schema.sql corre en cada arranque y todo lo que tiene es idempotente. [clic] Además, Hibernate valida que las entidades coincidan con las tablas; si no coinciden, el servicio no arranca.",
          "[clic] La base también cuida reglas con un CHECK, [clic] y un índice parcial indexa solo los eventos pendientes, que son los que el relevador busca cada cinco segundos.",
        ],
        preguntas: [{ texto: "¿Cuándo conviene pasar a Flyway o Liquibase?", respuesta: "Cuando haya muchos ambientes o cambios que no se puedan escribir de forma idempotente." }],
        transicion: "Ahora, dónde vive la regla del negocio.",
      },
    },
    {
      id: "s03-sp-orm",
      titulo: "Del procedimiento almacenado al ORM",
      idea: "La diferencia no es la base de datos: es dónde vive la regla del negocio.",
      visible: ["Con SP, la regla vive en la base", "Con ORM, la regla vive en el código", "Hibernate escribe el SQL de todos los días", "La base sigue cuidando datos, llaves e índices"],
      porque: "No es todo o nada: las reglas van al código y los reportes o consultas pesadas pueden seguir en SQL.",
      valor: "Reglas que se prueban en segundos y una base que sigue cuidando los datos.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
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
            flechas: ["clic", "EXEC sp_enviar @id"],
            regla: 2,
          },
          {
            titulo: "ARKA-Lite: un ORM",
            tono: "cian",
            pasos: [
              { icono: "monitor", titulo: "Pantalla", texto: "La persona pulsa Enviar." },
              { icono: "code", titulo: "Servicio Java", texto: "Decide, con su prueba." },
              { icono: "table", titulo: "Hibernate", texto: "Escribe el SQL." },
              { icono: "database", titulo: "PostgreSQL", texto: "Guarda y cuida llaves e índices." },
            ],
            flechas: ["POST /enviar", "save(…)", "UPDATE + INSERT"],
            regla: 1,
          },
        ],
      },
      guion: {
        decir: [
          "Esta es la gran diferencia con muchas de las aplicaciones que gestionamos hoy, y no es la base de datos: es dónde vive la regla del negocio. Arriba, el enfoque que conocemos: la persona pulsa enviar, la aplicación solo pasa parámetros con un EXEC, y el procedimiento almacenado decide y guarda. La regla vive en la base.",
          "[clic] Abajo, ARKA-Lite: la regla vive en el servicio Java, junto con su prueba. Cuando decide que sí, Hibernate, que es el ORM, escribe el UPDATE y el INSERT. La base sigue guardando y cuidando llaves, restricciones e índices. Lo único que se movió es la decisión.",
        ],
        preguntas: [
          { texto: "¿Y el rendimiento? ¿El SQL que genera Hibernate es bueno?", respuesta: "Para guardar y buscar por llave, sí. Para consultas complejas se puede escribir SQL propio; además, los índices y las restricciones siguen siendo trabajo de la base." },
          { texto: "¿Hay que migrar todos los procedimientos?", respuesta: "No. Se puede empezar por las reglas que más cambian; los reportes y los procesos masivos pueden seguir en la base." },
        ],
        transicion: "Mi compañero de desarrollo se los muestra con una regla real, escrita de las dos formas.",
        respaldo: "docs/arquitectura/datos-y-consistencia.md",
      },
    },
    {
      id: "s03-misma-regla",
      titulo: "La misma regla, escrita de las dos formas",
      idea: "Regla del negocio: solo se puede enviar una solicitud que está en borrador.",
      visible: ["Hoy: la regla dentro de un procedimiento almacenado", "ARKA-Lite: la misma regla en un método Java", "El SQL rutinario lo escribe Hibernate", "La base sigue cuidando llaves, CHECK e índices"],
      valor: "La misma regla, más fácil de probar y de cambiar, sin que la base pierda su papel.",
      rol: "orm",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "codigos",
        lados: [
          {
            titulo: "Hoy: en un procedimiento",
            icono: "database",
            tono: "neutro",
            lenguaje: "sql",
            codigo: "CREATE PROCEDURE sp_enviar @id VARCHAR(20) AS\nBEGIN\n  IF (SELECT estado FROM solicitud\n      WHERE id = @id) <> 'BORRADOR'\n    THROW 50001, 'Solo se envía en BORRADOR', 1;\n  UPDATE solicitud SET estado = 'ENVIADA'\n   WHERE id = @id;\nEND",
            puntos: ["La regla y el dato viven juntos en la base", "Probarla exige una base con datos", "Cambiarla es desplegar en la base"],
          },
          {
            titulo: "ARKA-Lite: en el código",
            icono: "code",
            tono: "cian",
            lenguaje: "java",
            codigo: "public Solicitud enviar() {\n    if (estado != Estado.BORRADOR)\n        throw new TransicionNoPermitida(\n            \"solo se puede enviar en BORRADOR\");\n    return new Solicitud(id, tipo, Estado.ENVIADA);\n}\n// Hibernate escribe el SQL:\n// UPDATE solicitud SET estado = ? WHERE id = ?",
            puntos: ["La regla vive en el código, con su prueba", "Se prueba en milisegundos, sin base", "La base sigue cuidando llaves, CHECK e índices"],
          },
        ],
      },
      guion: {
        decir: [
          "Gracias. Tomemos una regla real del negocio: solo se puede enviar una solicitud que está en borrador. A la izquierda, cómo la escribiríamos hoy: un procedimiento que consulta el estado, lanza un error si no está en borrador y hace el UPDATE. La regla y el dato viven juntos en la base, y para probarla hace falta una base con datos.",
          "[clic] A la derecha, la misma regla en ARKA-Lite: el método enviar de la clase Solicitud. Si el estado no es borrador, lanza un error; si lo es, devuelve la solicitud enviada. No hay SQL: el UPDATE lo escribe Hibernate cuando el servicio guarda, siempre con parámetros.",
          "¿Qué ganamos? Esa regla se prueba en milisegundos, sin base de datos, y si cambia, se cambia en un solo lugar junto con su prueba. ¿Qué no perdemos? La base sigue cuidando lo suyo: la llave primaria, el CHECK de los estados y los índices.",
        ],
        preguntas: [{ texto: "¿Y si la regla necesita consultar muchos datos?", respuesta: "Para decidir, el servicio pide solo lo que necesita por llave. Si es un cálculo sobre millones de filas, ese trabajo puede seguir en la base, como una consulta o un procedimiento bien delimitado." }],
        transicion: "Ahora veamos cómo hace Hibernate esa traducción.",
      },
    },
    {
      id: "s03-orm",
      titulo: "El ORM por dentro: una clase es una tabla",
      idea: "Hibernate lee la clase, sabe a qué columna va cada campo y escribe el SQL.",
      visible: ["@Entity dice que la clase es una tabla", "Cada campo es una columna", "@Id marca la llave primaria", "save y findById se vuelven SQL con parámetros"],
      valor: "El SQL de todos los días sale solo y siempre con parámetros: menos código y menos riesgo de inyección.",
      rol: "orm",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "mapeo",
        clase: { titulo: "SolicitudEntity", subtitulo: "Clase Java · @Entity · @Table(\"solicitud\")", campos: [{ nombre: "@Id String id" }, { nombre: "String tipo" }, { nombre: "String estado" }] },
        tabla: { titulo: "solicitud", subtitulo: "Tabla en PostgreSQL", columnas: [{ nombre: "id", detalle: "VARCHAR(20) · PK" }, { nombre: "tipo", detalle: "VARCHAR(20)" }, { nombre: "estado", detalle: "VARCHAR(20) · CHECK" }] },
        operaciones: [
          { codigo: "jpa.save(nueva)", sql: "INSERT INTO solicitud (id, tipo, estado) VALUES (?, ?, ?)" },
          { codigo: "jpa.findById(\"CAM-002\")", sql: "SELECT id, tipo, estado FROM solicitud WHERE id = ?" },
          { codigo: "jpa.save(enviada)", sql: "UPDATE solicitud SET tipo = ?, estado = ? WHERE id = ?" },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/adaptadores/persistencia/SolicitudEntity.java",
        texto: "@Entity\n@Table(name = \"solicitud\")          // esta clase = la tabla solicitud\npublic class SolicitudEntity {\n    @Id\n    private String id;               // columna id (PK)\n    private String tipo;             // columna tipo\n    private String estado;           // columna estado\n}\n\n// Sin SQL escrito: Spring Data genera SELECT, INSERT y UPDATE\npublic interface SolicitudJpaRepository\n        extends JpaRepository<SolicitudEntity, String> {}",
      },
      guion: {
        decir: [
          "Esta es la traducción, lado a lado. A la izquierda, una clase Java: SolicitudEntity. Con la anotación arroba Entity le decimos a Hibernate que esta clase representa una tabla, y con arroba Table, cuál: la tabla solicitud. [clic] Cada campo de la clase corresponde a una columna, y arroba Id marca la llave primaria.",
          "Con eso, Hibernate ya sabe todo. Abajo ven qué pasa cuando el código llama a un método. [clic] Guardar una solicitud nueva se convierte en un INSERT. [clic] Buscar por identificador, en un SELECT con su WHERE. [clic] Y guardar una que ya existe, por ejemplo cuando se envía, en un UPDATE.",
          "Fíjense en los signos de interrogación: los valores viajan siempre como parámetros, nunca pegados al texto del SQL. Es lo mismo que hacemos con los parámetros de un procedimiento, y es lo que nos protege de la inyección SQL.",
          "Nosotros no escribimos ninguna de esas consultas. Lo que sí cuidamos fue el diseño de las tablas, porque el ORM confía en que la base esté bien hecha.",
        ],
        preguntas: [
          { texto: "¿Se puede ver el SQL que genera?", respuesta: "Sí: con spring.jpa.show-sql=true se imprime en el log. Es lo primero que conviene activar para revisar el rendimiento." },
          { texto: "¿Y las consultas complejas?", respuesta: "Se pueden escribir a mano, en JPQL o en SQL nativo, con la anotación @Query. El ORM no lo impide." },
        ],
        transicion: "Ahora sigamos un dato completo, desde la pantalla hasta la fila.",
      },
    },
    {
      id: "s03-viaje",
      titulo: "El viaje de un dato: de la pantalla a la fila",
      idea: "El mismo dato cambia de forma en el camino: JSON, objeto, SQL y fila.",
      visible: ["La pantalla manda JSON", "El controlador lo convierte en un objeto", "Las reglas validan, sin SQL", "Hibernate arma el INSERT", "PostgreSQL guarda la fila y confirma"],
      comparacion: "Como un traductor: el código habla Java, la base habla SQL, y el ORM traduce en los dos sentidos.",
      iconoComparacion: "message-square",
      valor: "Cada pieza hace una sola traducción; si algo falla, se sabe en qué punto.",
      rol: "orm",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "monitor", titulo: "Pantalla", texto: "Manda JSON: SOL-100, tipo Consulta.", tono: "violeta" },
          { icono: "code", titulo: "Controlador", texto: "Convierte el JSON en un objeto.", tono: "marino" },
          { icono: "puzzle", titulo: "Reglas", texto: "Revisa que el id no exista. Sin SQL.", tono: "marino" },
          { icono: "table", titulo: "Hibernate", texto: "Objeto → INSERT con parámetros.", tono: "cian" },
          { icono: "database", titulo: "PostgreSQL", texto: "Guarda la fila y hace COMMIT.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "Ahora sigamos un dato de punta a punta. La persona llena el formulario y la pantalla manda un JSON: identificador SOL-100, tipo Consulta. [clic] El controlador recibe ese JSON y lo convierte en un objeto de Java.",
          "[clic] Ese objeto pasa por las reglas del negocio, que revisan, por ejemplo, que el identificador no exista. Hasta aquí no hay ni una línea de SQL. [clic] Cuando las reglas dicen que sí, Hibernate lo traduce a un INSERT con sus parámetros. [clic] El driver toma una conexión del pool, y PostgreSQL guarda la fila y confirma con un COMMIT.",
          "Y de regreso, el mismo camino al revés: la fila se vuelve objeto, el objeto se vuelve JSON y la pantalla muestra la solicitud creada, con un 201.",
        ],
        transicion: "Para hablar con la base, la aplicación necesita su dirección, su usuario y su clave. ¿Dónde están?",
      },
    },
    {
      id: "s03-credenciales",
      titulo: "¿Dónde está la cadena de conexión?",
      idea: "Ni en el código ni en la imagen: la pone el ambiente donde corre la aplicación.",
      visible: ["El código solo tiene marcadores: ${DB_URL}", "Compose los llena con variables de entorno", "Kubernetes: la dirección en el Deployment y la clave en un Secret", "La imagen no lleva ni dirección ni clave"],
      porque: "Cambiar de servidor o rotar una clave no obliga a recompilar ni a tocar el código.",
      valor: "Las claves fuera del código: rotarlas o cambiar de servidor no requiere recompilar.",
      rol: "orm",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "origenes",
        centro: { icono: "file-code", titulo: "El servicio al arrancar", texto: "application.properties solo tiene marcadores.", valor: "url=${DB_URL}\nusername=${DB_USER}\npassword=${DB_PASSWORD}", tono: "marino" },
        fuentes: [
          { icono: "container", titulo: "Docker Compose", texto: "compose.yaml, en cada servicio", valor: "DB_URL → db-solicitudes:5432", tono: "cian" },
          { icono: "ship-wheel", titulo: "Kubernetes · Deployment", texto: "La dirección y el usuario", valor: "DB_URL · DB_USER", tono: "correcto" },
          { icono: "key-round", titulo: "Kubernetes · Secret", texto: "La clave, guardada aparte", valor: "DB_PASSWORD ← Secret arka-postgres", tono: "advertencia" },
        ],
        enlace: "pool de conexiones",
        destino: { icono: "database", titulo: "db-solicitudes", texto: "PostgreSQL 17", tono: "marino" },
        nota: { icono: "ban", titulo: "La imagen Docker", texto: "no lleva ni dirección ni clave. La misma imagen sirve en cualquier ambiente.", tono: "error" },
      },
      codigo: {
        lenguaje: "properties",
        archivo: "servicio-solicitudes/src/main/resources/application.properties",
        texto: "# Conexión: el ambiente da los valores; después de : va el valor local\nspring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/db-solicitudes}\nspring.datasource.username=${DB_USER:arka}\nspring.datasource.password=${DB_PASSWORD:arka}\n\n# Esquema: schema.sql en cada arranque y Hibernate solo valida\nspring.sql.init.mode=always\nspring.jpa.hibernate.ddl-auto=validate",
      },
      guion: {
        decir: [
          "Esta es la pregunta que siempre nos hacen: ¿dónde está la cadena de conexión? Empecemos por el centro: el servicio, al arrancar, lee su archivo de configuración, y ese archivo no tiene la dirección ni la clave. Solo tiene marcadores: DB_URL, DB_USER y DB_PASSWORD.",
          "¿Quién llena esos marcadores? El ambiente donde corre. [clic] En Docker Compose, las variables se definen para cada servicio en el archivo compose.yaml. [clic] En Kubernetes, la dirección y el usuario van en el Deployment, [clic] y la clave se guarda aparte, en un Secret: un objeto del clúster hecho para datos sensibles, que el contenedor recibe como variable al arrancar.",
          "[clic] Con esos valores, el servicio abre su pool de conexiones contra la base.",
          "[clic] ¿Y la imagen Docker? No lleva ni dirección ni clave. Es la misma imagen en desarrollo, en pruebas y en producción. Cambiar de servidor de base de datos o rotar una clave no obliga a recompilar ni a tocar el código.",
        ],
        preguntas: [
          { texto: "¿El Secret no está en el repositorio?", respuesta: "En este laboratorio sí, con una clave de ejemplo, para que cualquiera lo levante. En un ambiente real el Secret se crea aparte, o lo alimenta un gestor de secretos, y nunca se versiona." },
          { texto: "¿Y si no usamos Kubernetes?", respuesta: "La misma idea funciona con variables de entorno del servidor o con un gestor de secretos. Lo importante es que la clave no viva en el código ni en el paquete que se despliega." },
          { texto: "¿Quién puede ver la clave en Kubernetes?", respuesta: "Quien tenga permiso de leer Secrets en ese espacio del clúster; ese acceso se controla con roles." },
        ],
        transicion: "Con la conexión resuelta, mi compañero de base de datos les cuenta qué pasa cuando se guarda: la transacción.",
        respaldo: "docs/inicio/bases-de-datos-locales.md",
      },
    },
    {
      id: "s03-transacciones",
      titulo: "Una transacción: todo o nada",
      idea: "@Transactional es el BEGIN … COMMIT de siempre: la solicitud y su aviso se guardan juntos o no se guarda nada.",
      visible: ["El pool presta una conexión", "BEGIN: empieza la transacción", "Se actualiza la solicitud y se anota el aviso", "COMMIT: todo queda guardado", "Si algo falla: ROLLBACK de todo"],
      valor: "Lo que cambia junto se guarda junto: nunca quedan datos a medias.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "cable", titulo: "Pool", texto: "HikariCP presta una de sus conexiones.", tono: "cian" },
          { icono: "play", titulo: "BEGIN", texto: "Empieza la transacción.", tono: "marino" },
          { icono: "clipboard-list", titulo: "UPDATE", texto: "La solicitud pasa a ENVIADA.", tono: "marino" },
          { icono: "inbox", titulo: "INSERT", texto: "El aviso queda pendiente en evento.", tono: "marino" },
          { icono: "circle-check", titulo: "COMMIT", texto: "Las dos cosas quedan guardadas.", tono: "correcto" },
        ],
        desvio: { desde: 3, etiqueta: "si algo falla", elemento: { icono: "rotate-ccw", titulo: "ROLLBACK", texto: "No queda nada a medias: ni la solicitud ni el aviso.", tono: "error" } },
      },
      guion: {
        decir: [
          "Gracias. Para quienes administran bases de datos, esto es terreno conocido, solo que configurado desde la aplicación. Cuando llega una petición, el pool de conexiones, HikariCP, le presta una de sus conexiones abiertas; por defecto mantiene hasta diez y las reutiliza.",
          "[clic] Cuando un método lleva la anotación Transactional, empieza una transacción: es el BEGIN de siempre. [clic] Al enviar una solicitud, primero se actualiza su estado a enviada, [clic] y en la misma transacción se anota el aviso pendiente en la tabla evento. [clic] Al final, el COMMIT guarda las dos cosas juntas.",
          "[clic] Y si algo falla en el medio, se hace ROLLBACK de todo: no queda una solicitud enviada sin su aviso, ni un aviso sin su solicitud. Esa garantía es la base de lo que les va a explicar mi compañero de interconexión.",
        ],
        preguntas: [
          { texto: "¿Cuántas conexiones abre cada servicio?", respuesta: "Las que define el pool; por defecto HikariCP mantiene hasta 10 y las reutiliza entre peticiones." },
          { texto: "¿Esto reemplaza las transacciones dentro de un procedimiento?", respuesta: "Es el mismo concepto: BEGIN, COMMIT y ROLLBACK. Solo que la transacción la abre la aplicación, alrededor del método que hace el trabajo." },
        ],
        transicion: "Esto es lo que nos dejó la base de datos.",
      },
    },
    {
      id: "s03-aprendizajes",
      titulo: "Base de datos: lo que aprendimos",
      visible: ["El ORM no elimina el trabajo de base de datos", "La cadena de conexión no vive en el código", "La transacción local es la más confiable", "El esquema también es código"],
      valor: "El conocimiento de base de datos del staff sigue siendo clave, ahora junto al código.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "3", titulo: "tablas en dos bases" }, { valor: "0", titulo: "consultas que crucen de una base a otra" }],
        items: [
          { icono: "table", titulo: "El ORM no elimina el trabajo de base de datos", texto: "Escribe el SQL rutinario; índices, CHECK y transacciones siguen siendo diseño.", valor: "Reglas probadas en código y una base que se cuida sola." },
          { icono: "key-round", titulo: "La cadena de conexión no vive en el código", texto: "Variables en Compose y un Secret en Kubernetes.", valor: "Cambiar de servidor o de clave sin recompilar." },
          { icono: "repeat", titulo: "La transacción local es la más confiable", texto: "Lo que cambia junto se guarda en el mismo COMMIT.", valor: "Nunca quedan datos a medias." },
          { icono: "file-code", titulo: "El esquema también es código", texto: "schema.sql versionado, idempotente y validado al arrancar.", valor: "Despliegues repetibles y errores visibles al inicio." },
        ],
      },
      guion: {
        decir: [
          "Cuatro aprendizajes de datos, sobre todo para quienes venimos de los procedimientos almacenados. [clic] Primero: el ORM no elimina el trabajo de base de datos. Escribe el SQL rutinario, pero las llaves, las restricciones, los índices y las transacciones siguen siendo diseño de base.",
          "[clic] Segundo: la cadena de conexión no vive en el código; vive en el ambiente. [clic] Tercero: la transacción local sigue siendo la herramienta más confiable que tenemos. [clic] Y cuarto: el esquema también es código: versionado, repetible y validado al arrancar.",
        ],
        transicion: "Esa transacción local es justo la base de la siguiente parte: cómo se avisan los servicios sin perder ni duplicar nada.",
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
      id: "s04-comunicacion",
      titulo: "Quién habla con quién, y cómo",
      idea: "Todo viaja por HTTP con JSON, y cada pieza encuentra a la otra por su nombre.",
      visible: ["El navegador solo conoce la UI", "nginx reenvía /api al servicio", "El evento viaja después, desde el relevador", "Se encuentran por nombre, no por IP", "El traceId acompaña cada llamada"],
      valor: "Cada conexión tiene un porqué: cambiar una dirección o seguir un error no obliga a tocar todo.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "matriz",
        encabezados: ["Conexión", "Cómo se habla", "Por qué así"],
        filas: [
          { icono: "monitor", tono: "violeta", celdas: ["Navegador → UI", "HTTP a localhost:8088; nginx sirve la página", "El navegador nunca conoce las direcciones internas"] },
          { icono: "route", tono: "violeta", celdas: ["UI → servicios", "nginx reenvía /api/solicitudes y /api/notificaciones", "Cambiar una dirección no obliga a tocar la UI"] },
          { icono: "send", tono: "cian", celdas: ["solicitudes → notificaciones", "POST del evento SolicitudEnviada en JSON, desde el relevador", "Si notificaciones cae, solicitudes sigue funcionando"] },
          { icono: "network", tono: "correcto", celdas: ["Cómo se encuentran", "Por nombre: la red de Compose o un Service de Kubernetes", "Sin IPs fijas: funciona igual en cualquier ambiente"] },
          { icono: "waypoints", tono: "advertencia", celdas: ["Seguimiento", "El traceId viaja en la cabecera de cada llamada HTTP", "Una sola búsqueda en Grafana sigue todo el recorrido"] },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/adaptadores/salida/PublicadorConReintento.java",
        texto: "public PublicadorConReintento(\n        @Value(\"${notificaciones.url}\") String url,   // NOTIFICACIONES_URL\n        RestClient restClientTrazada) {                // propaga el traceId\n    this.url = url;\n    this.rest = restClientTrazada;\n}\n\n// en publicar(evento): hasta 3 intentos\nrest.post()\n    .uri(url)          // http://servicio-notificaciones:8080/eventos/solicitud-enviada\n    .body(evento)      // {\"eventoId\": \"…\", \"id\": \"…\", \"tipo\": \"…\"}\n    .retrieve()\n    .toBodilessEntity();",
      },
      guion: {
        decir: [
          "Gracias. Ya vimos que los servicios no comparten base. Entonces, ¿cómo se hablan? Esta tabla lo resume, fila por fila. Primero, el navegador solo conoce la interfaz, nunca las direcciones internas.",
          "[clic] La interfaz tampoco llama directo a los servicios: nginx, su servidor web, recibe todo lo que empieza con /api y lo reenvía al servicio que corresponde. Si un servicio cambia de dirección, la pantalla ni se entera.",
          "[clic] Entre servicios, solicitudes le manda el evento a notificaciones con un POST en JSON. Pero no en el momento en que la persona envía, sino después, desde un proceso que llamamos el relevador. En un momento vemos por qué.",
          "[clic] Nadie usa direcciones IP: cada pieza encuentra a la otra por su nombre. [clic] Y en cada llamada viaja un traceId, un número que nos deja seguir el recorrido completo en los logs.",
        ],
        preguntas: [
          { texto: "¿Por qué no se llaman directamente por localhost?", respuesta: "Porque dentro de un contenedor localhost es el mismo contenedor; por eso cada servicio se busca por su nombre." },
          { texto: "¿Por qué HTTP y no una cola de mensajes como RabbitMQ o Kafka?", respuesta: "Para el laboratorio, HTTP con Outbox da la garantía que necesitamos sin otra pieza que operar. Si el volumen crece, el mismo diseño se puede pasar a una cola sin tocar las reglas." },
        ],
        transicion: "Hay dos formas de hablarse, y usamos las dos.",
      },
    },
    {
      id: "s04-sincrono",
      titulo: "Síncrono o asíncrono",
      idea: "Lo que la persona necesita ver se responde ya; lo que puede esperar se avisa después.",
      visible: ["Síncrono: la UI llama y espera", "Asíncrono: solicitudes envía el evento y sigue", "Síncrono responde ya; asíncrono puede demorar", "Si notificaciones se cae, el evento espera"],
      comparacion: "Síncrono es una llamada: me quedo en la línea hasta que me responden. Asíncrono es un correo: lo envío y sigo con lo mío.",
      iconoComparacion: "message-square",
      valor: "La caída de un sistema secundario no detiene a quien está atendiendo al usuario.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "contraste",
        lados: [
          { titulo: "Síncrono", icono: "arrow-right", tono: "marino", puntos: ["La UI llama y espera que se complete el proceso.", "Respuesta inmediata", "Si el servicio se cae, la persona ve error"] },
          { titulo: "Asíncrono", icono: "mail", tono: "cian", puntos: ["Servicio solicitudes envía evento a servicio notificaciones y continúa con su proceso", "Respuesta puede demorar", "Si notificaciones se cae, el evento espera"] },
        ],
      },
      guion: {
        decir: [
          "Hay dos formas de comunicarse. La síncrona es como una llamada telefónica: la interfaz llama y espera a que el proceso se complete. La respuesta es inmediata, y por eso la usamos para crear, aprobar o rechazar: la persona necesita saber el resultado en ese momento. El costo es que, si el servicio se cae, la persona ve el error.",
          "[clic] La asíncrona es como un correo: el servicio de solicitudes envía el evento a notificaciones y continúa con su proceso, sin esperar. La respuesta puede demorar unos segundos, pero si notificaciones se cae, el evento no se pierde: espera hasta que el servicio vuelva.",
          "La regla que aprendimos: lo que la persona necesita ver, síncrono; lo que puede esperar, asíncrono. Y esto pasa también en sus sistemas de hoy: un procedimiento que llama a otro sistema y espera su respuesta falla si el otro está caído.",
        ],
        preguntas: [{ texto: "¿Por qué no hacerlo todo asíncrono?", respuesta: "Porque quien crea o aprueba una solicitud necesita saber en ese momento si se pudo. Lo asíncrono es para lo que puede esperar." }],
        transicion: "¿Y cómo logramos que el evento espere sin perderse? Con el patrón Outbox.",
      },
    },
    {
      id: "s04-outbox",
      titulo: "Patrón Outbox: guardar primero, avisar después",
      idea: "La solicitud y su evento se guardan en la misma transacción; el relevador avisa después.",
      visible: ["Solicitud ENVIADA y evento pendiente, juntos", "Si una falla, no se guarda ninguna", "El relevador entrega cada 5 s, con 3 intentos", "Si falla, sigue pendiente con el mismo eventoId"],
      comparacion: "Como dejar una carta en la bandeja de salida: aunque el mensajero no pase hoy, la carta no se pierde.",
      iconoComparacion: "mail",
      porque: "Si notificaciones está caído, ningún aviso se pierde: queda pendiente hasta que vuelve.",
      valor: "Ningún aviso se pierde, aunque el otro sistema esté caído. Y se puede aplicar también con procedimientos y un job.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "send", titulo: "Enviar", texto: "Solicitud ENVIADA + evento pendiente, en una transacción.", tono: "marino" },
          { icono: "inbox", titulo: "Bandeja de salida", texto: "El evento espera en la tabla evento.", tono: "marino" },
          { icono: "timer", titulo: "Relevador", texto: "Cada 5 s entrega los pendientes, hasta 3 intentos.", tono: "cian" },
          { icono: "bell", titulo: "Notificaciones", texto: "Lo recibe y el evento queda procesado.", tono: "correcto" },
        ],
        desvio: { desde: 2, etiqueta: "si falla", elemento: { icono: "refresh-cw", titulo: "Sigue pendiente", texto: "Mismo eventoId; se reintenta en el siguiente ciclo.", tono: "advertencia" } },
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/dominio/ServicioDeSolicitudes.java",
        texto: "@Transactional\npublic Solicitud enviar(String id) {\n    Solicitud enviada = buscar(id).enviar();\n    repositorio.guardar(enviada);\n    registrador.registrar(UUID.randomUUID().toString(),\n            enviada.id(), \"SolicitudEnviada\");\n    return enviada;\n}",
      },
      guion: {
        decir: [
          "Pensemos en el problema. Si al enviar una solicitud llamáramos directamente a notificaciones y justo estuviera caído, la solicitud quedaría enviada y nadie se enteraría. Por eso usamos el patrón Outbox, o bandeja de salida, que se apoya en la transacción que vimos en la parte de datos.",
          "Al enviar, en una sola transacción se guardan la solicitud como enviada y su aviso pendiente. O se guardan las dos cosas, o ninguna, y la persona recibe su respuesta enseguida. [clic] El aviso queda esperando en la tabla evento, como una carta en la bandeja de salida.",
          "[clic] Después, un proceso que llamamos el relevador revisa la bandeja cada cinco segundos y entrega los pendientes, con hasta tres intentos. [clic] Si notificaciones lo recibe, la fila se marca como procesada. [clic] Si falla, la fila sigue pendiente, con el mismo número de evento, y se reintenta en el siguiente ciclo.",
          "Esto se puede aplicar hoy mismo en un sistema con procedimientos almacenados: en lugar de llamar a otro sistema dentro del procedimiento, se anota el aviso en una tabla de pendientes y un job lo entrega.",
        ],
        preguntas: [
          { texto: "¿Que el envío responda bien significa que el aviso ya existe?", respuesta: "No. Significa que la solicitud y el evento quedaron guardados; el aviso llega después." },
          { texto: "¿Qué pasa si se cae solicitudes con avisos pendientes?", respuesta: "Nada se pierde: están en la base. Cuando el servicio vuelve, el relevador los encuentra y los entrega." },
        ],
        transicion: "Pero si se reintenta, ¿no puede llegar el aviso dos veces?",
        respaldo: "docs/arquitectura/flujo-y-referencias.md",
      },
    },
    {
      id: "s04-idempotencia",
      titulo: "Idempotencia: el mismo evento, un solo aviso",
      idea: "Repetir la entrega no multiplica el efecto.",
      visible: ["Cada evento trae un número que no cambia", "Notificaciones anota los números recibidos", "Si llega uno repetido, lo ignora", "Se comprueba con el botón Reentregar"],
      comparacion: "Como un portero con lista de invitados: si alguien ya entró, no lo vuelve a anotar.",
      iconoComparacion: "user-check",
      valor: "Se puede reintentar sin miedo: un pago, un correo o un aviso nunca se duplica.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "mail", titulo: "Llega el evento", texto: "Trae su eventoId.", tono: "marino" },
          { icono: "fingerprint", titulo: "¿Ya lo recibimos?", texto: "Se busca en evento_procesado.", tono: "cian" },
          { icono: "bell", titulo: "Crear el aviso", texto: "Solo si el número es nuevo.", tono: "correcto" },
          { icono: "clipboard-check", titulo: "Anotar el número", texto: "En la misma transacción.", tono: "correcto" },
        ],
        desvio: { desde: 1, etiqueta: "ya estaba", elemento: { icono: "ban", titulo: "Ignorarlo", texto: "No se crea otro aviso. Duplicados: cero.", tono: "neutro" } },
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-notificaciones/…/adaptadores/entrada/ConsumoIdempotente.java",
        texto: "@Transactional\npublic void alRecibir(SolicitudEnviada e) {\n    if (procesados.existsById(e.eventoId())) {\n        return; // ya procesado: idempotente\n    }\n    servicio.alRecibirSolicitudEnviada(e);\n    procesados.save(new EventoProcesadoEntity(e.eventoId()));\n}",
      },
      guion: {
        decir: [
          "Sí, puede llegar dos veces. Imaginen que notificaciones recibió el evento y creó el aviso, pero la respuesta se perdió en la red. El relevador cree que falló y lo vuelve a mandar. Para eso está la idempotencia: repetir la misma operación no multiplica su efecto.",
          "Así funciona: llega el evento con su número. [clic] Notificaciones busca ese número en la tabla evento_procesado. [clic] Si es nuevo, crea el aviso [clic] y anota el número, en la misma transacción. [clic] Si ya estaba, lo ignora: no se crea otro aviso. Como un portero con lista de invitados.",
          "Los dos patrones se complementan: el Outbox evita perder y la idempotencia evita duplicar. Y sirve en cualquier sistema: todo proceso que se reintenta, un pago, un correo, un registro, debería tener una tabla de procesados con una llave única.",
        ],
        demo: { accion: "En la UI, pestaña Enviadas: Reentregar un evento ya consumido.", evidencia: "El diálogo “El aviso no se duplicó” y Avisos duplicados en 0." },
        preguntas: [
          { texto: "¿Qué resuelve el Outbox y qué resuelve la idempotencia?", respuesta: "El Outbox evita perder el evento; la idempotencia evita duplicar su efecto." },
          { texto: "¿Y si llegan dos entregas al mismo tiempo?", respuesta: "La llave primaria de evento_procesado lo impide: solo una de las dos transacciones puede anotar el número; la otra falla y su reintento lo encuentra ya procesado." },
        ],
        transicion: "Esto es lo que aprendimos de la interconexión.",
      },
    },
    {
      id: "s04-aprendizajes",
      titulo: "Interconexión: lo que aprendimos",
      visible: ["Síncrono para ver, asíncrono para avisar", "Guardar primero, avisar después", "Todo reintento necesita idempotencia", "El contrato es lo único compartido"],
      valor: "Cero avisos perdidos y cero duplicados, con patrones que sirven en cualquier tecnología.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "0", titulo: "avisos perdidos" }, { valor: "0", titulo: "avisos duplicados" }],
        items: [
          { icono: "send", titulo: "Síncrono para ver, asíncrono para avisar", texto: "La UI espera la respuesta; el evento se entrega después.", valor: "Una caída parcial no detiene a quien usa el sistema." },
          { icono: "inbox", titulo: "Guardar primero, avisar después", texto: "Solicitud y evento en la misma transacción; el relevador entrega.", valor: "Un servicio caído no hace perder información." },
          { icono: "fingerprint", titulo: "Todo reintento necesita idempotencia", texto: "Un número de evento fijo y la lista de los ya recibidos.", valor: "Reintentar sin miedo a duplicar." },
          { icono: "file-json", titulo: "El contrato es lo único compartido", texto: "SolicitudEnviada: eventoId, id y tipo, igual en los dos lados.", valor: "Equipos independientes con un acuerdo claro." },
        ],
      },
      guion: {
        decir: [
          "Cuatro aprendizajes. [clic] Síncrono para lo que la persona necesita ver, asíncrono para lo que puede esperar. [clic] Guardar primero y avisar después: una transacción local y una bandeja de salida son más confiables que coordinar dos sistemas al mismo tiempo.",
          "[clic] Todo reintento necesita idempotencia del otro lado. [clic] Y entre dos servicios, lo único compartido es el contrato del mensaje; si cambia, cambia en los dos lados.",
        ],
        transicion: "Hasta aquí, el código y los datos. Ahora, ¿cómo llevamos todo esto a cualquier ambiente? Le paso la palabra a infraestructura.",
      },
    },
  ],
};

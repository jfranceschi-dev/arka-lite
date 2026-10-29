import type { Seccion } from "./tipos.ts";

// Parte 3: la base de datos. Cómo se modela, cómo se cuida el esquema sin
// herramientas de migración y cómo un aviso nunca se pierde ni se duplica.

export const datos: Seccion = {
  id: "s03",
  numero: 3,
  titulo: "Base de datos",
  corto: "Base de datos",
  subtitulo: "Una base por servicio, un esquema que se cuida solo y datos consistentes.",
  temas: ["Modelado y consultas", "Adaptador con base real", "El problema de la consistencia"],
  icono: "database",
  diapositivas: [
    {
      id: "s03-sp-orm",
      titulo: "Del procedimiento almacenado al ORM",
      idea: "ORM: cada clase Java se mapea a una tabla y el SQL de todos los días se genera solo.",
      visible: ["Con SP, la regla vive en la base", "Con ORM, la regla vive en el código", "Hibernate escribe el INSERT, UPDATE y SELECT", "No es todo o nada: el SQL pesado puede seguir en la base"],
      porque: "No es todo o nada: las reglas van al código y los reportes o consultas pesadas pueden seguir en SQL.",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "contraste",
        lados: [
          { titulo: "Con procedimientos almacenados", icono: "database", tono: "neutro", puntos: ["La regla vive en la base: EXEC sp_enviar", "Cambiar una regla es cambiar la base", "Para probar hace falta la base con datos", "Atado a un motor: T-SQL o PL/SQL"] },
          { titulo: "Con un ORM: JPA + Hibernate", icono: "code", tono: "cian", puntos: ["La regla vive en Java, en el dominio", "Hibernate genera el SQL de guardar y buscar", "Las reglas se prueban sin base, en milisegundos", "Cambiar de motor no toca las reglas"] },
        ],
      },
      codigo: {
        lenguaje: "java",
        archivo: "servicio-solicitudes/…/adaptadores/persistencia/SolicitudEntity.java",
        texto: "@Entity\n@Table(name = \"solicitud\")          // esta clase = la tabla solicitud\npublic class SolicitudEntity {\n    @Id\n    private String id;               // columna id (PK)\n    private String tipo;             // columna tipo\n    private String estado;           // columna estado\n}\n\n// Sin SQL escrito: Spring Data genera SELECT, INSERT y UPDATE\npublic interface SolicitudJpaRepository\n        extends JpaRepository<SolicitudEntity, String> {}",
      },
      guion: {
        decir: [
          "Muchos de ustedes trabajan con procedimientos almacenados: la regla del negocio vive en la base, y la aplicación solo hace EXEC con parámetros. Funciona, pero cambiar una regla es cambiar la base, y probarla exige una base con datos.",
          "En ARKA-Lite usamos un ORM, que significa mapeo objeto-relacional. En Java el estándar se llama JPA y la herramienta que lo hace es Hibernate. Una clase Java se marca como entidad y queda asociada a una tabla: cada campo es una columna. Cuando guardamos o buscamos, Hibernate escribe el INSERT, el UPDATE o el SELECT por nosotros.",
          "Ojo: no es todo o nada. Las reglas del negocio pasan al código, donde se prueban en milisegundos, y lo que de verdad es trabajo de base de datos, como reportes pesados, puede seguir en SQL.",
        ],
        pregunta: { texto: "¿Y el rendimiento? ¿El SQL que genera Hibernate es bueno?", respuesta: "Para guardar y buscar por llave, sí. Para consultas complejas se puede escribir SQL propio; además, los índices y constraints siguen siendo trabajo de la base." },
        transicion: "¿Y cómo llega, paso a paso, una línea de Java hasta PostgreSQL?",
        respaldo: "docs/arquitectura/datos-y-consistencia.md",
      },
    },
    {
      id: "s03-conexion",
      titulo: "Cómo el código llega a la base",
      idea: "Cinco piezas entre una línea de Java y una fila en PostgreSQL.",
      visible: ["El dominio pide guardar, sin SQL", "Spring Data ofrece save y findById", "Hibernate convierte el objeto en SQL", "JDBC y un pool de conexiones hablan con PostgreSQL"],
      comparacion: "Como un traductor: el código habla Java, la base habla SQL, y el ORM traduce en los dos sentidos.",
      iconoComparacion: "message-square",
      recorridos: ["resumen", "ejecutivo", "tecnico"],
      visual: {
        tipo: "flujo",
        pasos: [
          { icono: "puzzle", titulo: "Dominio", texto: "Pide guardar la solicitud, sin SQL.", tono: "marino" },
          { icono: "plug", titulo: "Spring Data", texto: "save() y findById(), sin escribir SQL.", tono: "marino" },
          { icono: "table", titulo: "Hibernate", texto: "Objeto → INSERT o UPDATE.", tono: "cian" },
          { icono: "cable", titulo: "JDBC + pool", texto: "Reutiliza conexiones con usuario y clave.", tono: "cian" },
          { icono: "database", titulo: "PostgreSQL", texto: "Ejecuta y confirma la transacción.", tono: "correcto" },
        ],
      },
      guion: {
        decir: [
          "Sigamos una línea de código. El dominio dice: guardar esta solicitud. No sabe nada de SQL. Spring Data nos da métodos listos, como save o findById, sin escribir una sola consulta.",
          "Por debajo, Hibernate convierte el objeto en un INSERT o un UPDATE. Y el driver JDBC, con un pool de conexiones que las reutiliza, como el que ya conocen de cualquier aplicación, se lo manda a PostgreSQL, que ejecuta y confirma la transacción.",
          "La dirección de la base, el usuario y la clave no están en el código: llegan por variables de entorno.",
        ],
        transicion: "¿Y dónde se configura todo eso?",
      },
    },
    {
      id: "s03-config",
      titulo: "Dónde se configura la conexión",
      idea: "La aplicación no trae ni la dirección ni la clave: se las da el ambiente.",
      visible: ["URL, usuario y clave por variables", "Secretos fuera de la imagen", "Un pool que reutiliza conexiones", "Transacciones todo o nada", "Tablas listas y validadas al arrancar", "La base se busca por nombre"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "tarjetas",
        columnas: 3,
        tarjetas: [
          { icono: "settings", titulo: "URL, usuario y clave", texto: "spring.datasource lee DB_URL, DB_USER y DB_PASSWORD; nada fijo en el código.", tono: "marino" },
          { icono: "key-round", titulo: "Secretos fuera de la imagen", texto: "En Compose, variables de entorno; en Kubernetes, el Secret arka-postgres.", tono: "advertencia" },
          { icono: "cable", titulo: "Pool de conexiones", texto: "HikariCP viene con Spring Boot: abre unas pocas conexiones y las reutiliza.", tono: "cian" },
          { icono: "repeat", titulo: "Transacciones", texto: "@Transactional es el BEGIN … COMMIT: si algo falla, ROLLBACK de todo.", tono: "correcto" },
          { icono: "list-checks", titulo: "Arranque seguro", texto: "schema.sql crea lo que falta y Hibernate valida que las tablas coincidan.", tono: "violeta" },
          { icono: "network", titulo: "Por nombre", texto: "jdbc:postgresql://db-solicitudes:5432 dentro de la red; nunca localhost.", tono: "neutro" },
        ],
      },
      codigo: {
        lenguaje: "properties",
        archivo: "servicio-solicitudes/src/main/resources/application.properties",
        texto: "# Conexión: el ambiente da los valores; después de : va el valor local\nspring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/db-solicitudes}\nspring.datasource.username=${DB_USER:arka}\nspring.datasource.password=${DB_PASSWORD:arka}\n\n# Esquema: schema.sql en cada arranque y Hibernate solo valida\nspring.sql.init.mode=always\nspring.jpa.hibernate.ddl-auto=validate",
      },
      guion: {
        decir: [
          "Para quienes administran bases de datos, esta es la parte conocida. La aplicación no trae la dirección de la base ni la clave: las lee de variables de entorno. En Docker Compose las pone el archivo compose; en Kubernetes, la clave sale de un Secret.",
          "Spring Boot incluye un pool de conexiones, HikariCP, que abre unas pocas conexiones y las reutiliza, igual que cualquier aplicación bien configurada. Y la anotación @Transactional es el BEGIN y COMMIT de siempre: si algo falla en el medio, se hace ROLLBACK de todo.",
          "Al arrancar, el servicio crea las tablas que falten con schema.sql y Hibernate valida que coincidan con el código. Y dentro de la red, la base se busca por su nombre, db-solicitudes, nunca por localhost.",
        ],
        pregunta: { texto: "¿Cuántas conexiones abre cada servicio?", respuesta: "Las que define el pool; por defecto HikariCP mantiene hasta 10 y las reutiliza entre peticiones." },
        transicion: "Ahora veamos qué tablas tiene cada servicio.",
      },
    },
    {
      id: "s03-modelo",
      titulo: "Una base por servicio",
      idea: "Cada servicio es dueño de sus tablas; solo el evento cruza la frontera.",
      visible: ["PostgreSQL 17 en cada servicio", "solicitud y evento viven juntas", "evento_procesado recuerda lo recibido", "Ninguna llave foránea cruza bases"],
      porque: "Cada servicio cambia su esquema sin coordinarse con el otro; solo el contrato del evento es compartido.",
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "tablas",
        bases: [
          {
            titulo: "db-solicitudes",
            subtitulo: "PostgreSQL 17 · schema.sql",
            tono: "marino",
            tablas: [
              { nombre: "solicitud", columnas: ["id · PK", "tipo", "estado · CHECK (4 estados)"] },
              { nombre: "evento", columnas: ["solicitud_id · FK", "evento_id · UUID", "procesado · false = pendiente"] },
            ],
          },
          {
            titulo: "db-notificaciones",
            subtitulo: "PostgreSQL 17 · Hibernate",
            tono: "cian",
            tablas: [{ nombre: "evento_procesado", columnas: ["evento_id · PK", "un registro por evento recibido"] }],
          },
        ],
        enlace: "evento_id por HTTP",
      },
      guion: {
        decir: [
          "Cada servicio tiene su propia base PostgreSQL. En la de solicitudes hay dos tablas: la solicitud, con un CHECK que solo admite los cuatro estados válidos, y la tabla evento, que funciona como bandeja de salida: cada fila es un aviso pendiente de entregar.",
          "En la de notificaciones hay una sola tabla importante: evento_procesado, la lista de eventos que ya recibió.",
          "Fíjense en la flecha: no hay llaves foráneas entre bases. Lo único que viaja de un lado al otro es el evento_id. Esa es la frontera entre los dos servicios.",
        ],
        pregunta: { texto: "¿Por qué no un JOIN entre las dos bases?", respuesta: "Porque cada servicio es dueño de sus datos; un JOIN entre bases los volvería a acoplar." },
        transicion: "Ahora, el problema más interesante: ¿qué pasa si guardo y el otro servicio está caído?",
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
          "No usamos Flyway ni Liquibase, así que nos pusimos una regla: el archivo schema.sql corre en cada arranque y todo lo que tiene es idempotente. Crea lo que falta y actualiza bases viejas sin romperlas.",
          "Además, Hibernate valida que las entidades coincidan con las tablas. Si no coinciden, el servicio no arranca, y eso es bueno: preferimos un error al inicio que datos mal guardados.",
          "Y dos detalles de base de datos: un CHECK que impide estados inválidos aunque alguien escriba directo en la tabla, y un índice parcial que solo indexa los eventos pendientes, que son los que el relevador busca cada cinco segundos.",
        ],
        pregunta: { texto: "¿Cuándo conviene pasar a Flyway o Liquibase?", respuesta: "Cuando haya muchos ambientes o cambios que no se puedan escribir de forma idempotente." },
        transicion: "Con el esquema claro, vamos al problema de la consistencia.",
      },
    },
    {
      id: "s03-outbox",
      titulo: "Guardar primero, avisar después",
      idea: "La solicitud y su evento se guardan en la misma transacción.",
      visible: ["Solicitud ENVIADA y evento pendiente, juntos", "Si una falla, no se guarda ninguna", "El relevador entrega cada 5 s, con 3 intentos", "Si falla, sigue pendiente con el mismo eventoId"],
      comparacion: "Como dejar una carta en la bandeja de salida: aunque el mensajero no pase hoy, la carta no se pierde.",
      iconoComparacion: "mail",
      porque: "Si notificaciones está caído, ningún aviso se pierde: queda pendiente hasta que vuelve.",
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
          "Este es el problema de la consistencia. Si al enviar una solicitud llamáramos directamente a notificaciones y justo estuviera caído, la solicitud quedaría enviada y nadie se enteraría.",
          "La solución se llama patrón outbox, o bandeja de salida. Al enviar, guardamos la solicitud y un evento pendiente en la misma transacción: o se guardan las dos cosas, o ninguna. La respuesta le llega a la persona enseguida.",
          "Después, un relevador revisa la bandeja cada cinco segundos y entrega los pendientes, con hasta tres intentos. Si aun así falla, el evento sigue pendiente, con el mismo número, para el siguiente ciclo.",
        ],
        pregunta: { texto: "¿Que el envío responda bien significa que el aviso ya existe?", respuesta: "No. Significa que la solicitud y el evento quedaron guardados; el aviso llega después." },
        transicion: "Si se reintenta, ¿no puede llegar el aviso dos veces?",
        respaldo: "docs/arquitectura/flujo-y-referencias.md",
      },
    },
    {
      id: "s03-idempotencia",
      titulo: "El mismo evento, un solo aviso",
      idea: "Repetir la entrega no multiplica el efecto.",
      visible: ["Cada evento trae un número que no cambia", "Notificaciones anota los números recibidos", "Si llega uno repetido, lo ignora", "Se comprueba con el botón Reentregar"],
      comparacion: "Como un portero con lista de invitados: si alguien ya entró, no lo vuelve a anotar.",
      iconoComparacion: "user-check",
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
          "Sí, puede llegar dos veces. Si notificaciones recibió el evento pero su respuesta se perdió, el relevador cree que falló y lo vuelve a mandar.",
          "Para eso está la idempotencia: repetir la misma operación no multiplica su efecto. Notificaciones funciona como un portero con lista: anota el número de cada evento, y si llega uno que ya está en la lista, lo ignora.",
          "El outbox evita perder avisos; la idempotencia evita duplicarlos. Juntos dan lo que en la industria se llama entrega al menos una vez con efecto exactamente una vez.",
        ],
        demo: { accion: "En la UI, pestaña Enviadas: Reentregar un evento ya consumido.", evidencia: "El diálogo “El aviso no se duplicó” y Avisos duplicados en 0." },
        pregunta: { texto: "¿Qué resuelve el outbox y qué resuelve la idempotencia?", respuesta: "El outbox evita perder el evento; la idempotencia evita duplicar su efecto." },
        transicion: "Esto es lo que aprendimos de la base de datos.",
      },
    },
    {
      id: "s03-aprendizajes",
      titulo: "Base de datos: lo que aprendimos",
      visible: ["La transacción local es la herramienta más confiable", "Reintentar exige idempotencia", "El esquema también es código"],
      recorridos: ["ejecutivo", "tecnico"],
      visual: {
        tipo: "aprendizajes",
        metricas: [{ valor: "0", titulo: "avisos perdidos" }, { valor: "0", titulo: "avisos duplicados" }],
        items: [
          { icono: "table", titulo: "El ORM no elimina el trabajo de base de datos", texto: "Hibernate escribe el SQL rutinario; índices, CHECK y transacciones siguen siendo diseño de BD.", valor: "Reglas que se prueban en código y una base que se cuida sola." },
          { icono: "inbox", titulo: "Guardar primero, avisar después", texto: "Solicitud y evento en una transacción local; el relevador entrega después.", valor: "Un servicio caído no hace perder información." },
          { icono: "fingerprint", titulo: "Todo reintento necesita idempotencia", texto: "Un eventoId fijo y una tabla de eventos ya procesados.", valor: "Se puede reintentar sin miedo a duplicar efectos." },
          { icono: "file-code", titulo: "El esquema también es código", texto: "schema.sql idempotente, CHECK, índice parcial y validación al arrancar.", valor: "Despliegues repetibles y errores visibles al inicio." },
        ],
      },
      guion: {
        decir: [
          "Cuatro aprendizajes de datos. El primero, para quienes vienen de los procedimientos almacenados: el ORM no elimina el trabajo de base de datos. Escribe el SQL rutinario, pero los índices, los CHECK y las transacciones siguen siendo diseño de base.",
          "Segundo: la transacción local es la herramienta más confiable que tenemos. En lugar de coordinar dos servicios al mismo tiempo, guardamos todo en nuestra base y avisamos después.",
          "Tercero: cualquier reintento necesita idempotencia del otro lado. Si no, los reintentos que nos protegen de perder datos nos terminan duplicando datos.",
          "Y cuarto: el esquema también es código. Versionado, idempotente y validado al arrancar.",
        ],
        transicion: "Los datos están cuidados. Ahora, ¿cómo llevamos todo esto a cualquier ambiente?",
      },
    },
  ],
};

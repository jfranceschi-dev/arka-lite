// Más para decir, lámina por lámina: ejemplos, datos reales del proyecto y
// cómo se aplica en los sistemas de hoy. No cuenta en los minutos: quien
// presenta lo usa si sobra tiempo o si el público pregunta. Cada dato sale
// del código o la configuración del repositorio.
export const AMPLIAR: Record<string, string[]> = {
  "s00-portada": [
    "ARKA-Lite nació como el laboratorio del curso: cada tema que veíamos lo aplicábamos al mismo sistema. Por eso creció por capas: primero un endpoint, después la base de datos, la comunicación entre servicios, los contenedores, el pipeline y la observabilidad.",
    "Todo lo que van a ver está en un solo repositorio, con su documentación, y se levanta con un solo comando. Si a alguien le interesa revisarlo después, con gusto se lo compartimos.",
  ],
  "s00-equipo": [
    "Trabajamos como trabajaría un equipo real: cada cambio en una rama, revisado por otra persona y probado por el pipeline antes de entrar.",
    "Mezclar áreas nos obligó a ponernos de acuerdo en contratos claros: qué expone cada servicio, qué guarda cada base y cómo se despliega cada pieza.",
  ],
  "s00-agenda": [
    "Las partes generales son cortas a propósito: el equipo anterior ya las explicó. El tiempo lo dedicamos a lo que más valor les deja: los datos, la comunicación entre sistemas y la operación.",
    "Al final juntamos lo que pueden aplicar desde mañana, aunque sus sistemas usen procedimientos almacenados.",
  ],
  "s01-negocio": [
    "Antes de escribir una línea de código nos hicimos tres preguntas: qué tiene que pasar, quién hace cada paso y qué no se puede permitir. Las respuestas se volvieron las reglas del sistema.",
    "Por dentro, esos pasos son cuatro estados: borrador, enviada, aprobada y rechazada. La base de datos también los cuida: la columna estado solo acepta esos cuatro valores.",
    "Al arrancar, el sistema siempre registra dos solicitudes de ejemplo: INC-001, una incidencia en borrador, y CAM-002, un cambio que se envía. El pipeline usa CAM-002 para comprobar que el servicio arrancó de verdad.",
  ],
  "s01-practicas": [
    "Un ejemplo concreto: el controlador de solicitudes no decide nada; solo convierte el JSON y llama al servicio. Si mañana cambia la regla de envío, se toca la clase Solicitud y su prueba, nada más.",
    "Lo de las piezas que se conectan desde afuera tiene un nombre: inyección de dependencias. En ARKA-Lite todo llega por el constructor, y por eso en las pruebas cambiamos la base real por una en memoria sin tocar el negocio.",
  ],
  "s01-trabajo": [
    "Usamos un formato común para los mensajes de commit: el tipo, dos puntos y qué hace el cambio, por ejemplo: fix: impedir el envío de una solicitud aprobada. Con eso, el historial se lee como una bitácora.",
    "Nadie sube directo a main, ni siquiera quien orquesta. Eso nos protegió más de una vez de romper algo que otro compañero estaba usando.",
  ],
  "s01-aprendizajes": [
    "Si tuviéramos que elegir una sola práctica para empezar en un sistema existente, sería poner las reglas del negocio en un solo lugar con su prueba. Es la que más rápido devuelve la inversión.",
  ],
  "s02-mapa": [
    "La interfaz es delgada a propósito: no guarda nada ni toma decisiones. Si mañana se cambia por otra, los servicios no se enteran.",
    "La plataforma es la misma para los dos servicios: el mismo Compose, el mismo pipeline y el mismo lugar para los logs. Eso baja mucho el costo de tener dos servicios en lugar de uno.",
  ],
  "s02-practica": [
    "El mensaje que viaja entre servicios lleva solo tres datos: el número del evento, el identificador de la solicitud y su tipo. Mientras más pequeño el mensaje, más fácil es que los dos lados se pongan de acuerdo.",
    "Ese contrato está copiado en los dos servicios. Si un día cambia, se cambia en los dos al mismo tiempo: es lo único que comparten.",
  ],
  "s02-hexagonal": [
    "En solicitudes hay tres contratos hacia afuera: guardar solicitudes, anotar eventos y publicarlos. Cada uno puede tener más de una implementación, y Spring usa la que está marcada como principal.",
    "Dejamos a propósito implementaciones alternativas, por ejemplo un publicador simple sin reintentos, para mostrar que se puede cambiar una por otra sin tocar las reglas.",
  ],
  "s02-aprendizajes": [
    "Lo más difícil de los microservicios no fue el código, fueron las fronteras: decidir qué dato es de quién. Una vez claro eso, lo demás se ordenó solo.",
  ],
  "s03-bases": [
    "En nuestra computadora, la base de notificaciones se publica en el puerto 5433 para consultarla con cualquier herramienta; la de solicitudes solo se ve dentro de la red de Docker. Lo que no se publica, no se alcanza desde afuera.",
    "En Kubernetes, cada base tiene su disco persistente: si el contenedor se reinicia, los datos siguen ahí. Solo se perderían si se borra el disco.",
  ],
  "s03-modelo": [
    "La tabla evento tiene un índice parcial: solo indexa las filas pendientes. Como el relevador busca pendientes cada cinco segundos, el índice se mantiene pequeño aunque la tabla acumule años de eventos ya entregados.",
    "Las tablas se crean con un archivo schema.sql que corre en cada arranque y se puede ejecutar mil veces sin romper nada. También actualiza bases viejas, agregando lo que les falte.",
  ],
  "s03-sp-orm": [
    "No estamos diciendo que los procedimientos estén mal: son la herramienta correcta para procesos masivos y reportes. Lo que cambia es dónde ponemos las reglas que más cambian y que más necesitamos probar.",
    "Una ventaja que no se ve a primera vista: con la regla en el código, cada cambio pasa por revisión, pruebas automáticas y pipeline, igual que cualquier otra línea del sistema.",
  ],
  "s03-misma-regla": [
    "La prueba de esa regla es así de simple: se crea una solicitud ya enviada, se intenta enviarla otra vez y se verifica que el sistema lo rechaza. Corre en milisegundos y no necesita ninguna base.",
    "Para probar lo mismo en el procedimiento habría que preparar datos en una base, ejecutarlo y revisar el resultado. Funciona, pero es más lento y más difícil de repetir en cada cambio.",
  ],
  "s03-orm": [
    "El repositorio de Spring Data no tiene ni una consulta escrita: hereda de JpaRepository, y con eso ya trae guardar, buscar por llave, listar y borrar.",
    "Cuando el código guarda una solicitud que ya existe, Hibernate primero la busca por su llave y después decide si hace un INSERT o un UPDATE. Por eso las llaves bien definidas importan: el ORM las usa todo el tiempo.",
  ],
  "s03-viaje": [
    "Entre el controlador y la base hay dos objetos distintos a propósito: la Solicitud del negocio, que no sabe nada de tablas, y la SolicitudEntity, que es el reflejo de la tabla. Un adaptador traduce entre los dos.",
    "Si el identificador ya existe, el viaje se corta en las reglas: no se toca la base y la persona recibe un 409 con el motivo.",
  ],
  "s03-credenciales": [
    "Un detalle honesto: el archivo de configuración trae un valor por defecto para trabajar en la computadora de cada uno. En un ambiente real nunca se usa, porque ahí siempre llegan las variables.",
    "En el pipeline, la clave de la base de pruebas cambia en cada ejecución: se arma con el número de la corrida. Ni siquiera la base temporal tiene una clave fija.",
  ],
  "s03-transacciones": [
    "Abrir una conexión nueva a PostgreSQL toma su tiempo; con muchas peticiones, eso se nota. Por eso el pool las mantiene abiertas y las presta: es la diferencia entre responder rápido y saturar la base.",
    "La transacción envuelve todo el método enviar: si el INSERT del evento fallara, por ejemplo por una restricción, el UPDATE de la solicitud también se deshace.",
  ],
  "s03-aprendizajes": [
    "Para quien trabaja en base de datos, el rol no desaparece: pasa de escribir cada consulta a diseñar el modelo, cuidar índices y restricciones, y revisar el SQL que genera el ORM.",
  ],
  "s04-comunicacion": [
    "nginx espera menos que la interfaz, nueve segundos contra diez, para que el proxy responda con un error claro antes de que el navegador corte la petición.",
    "La llamada entre servicios usa un cliente HTTP preparado para pasar el traceId. Con un cliente cualquiera, el seguimiento entre servicios se rompería; por eso es una regla del equipo.",
  ],
  "s04-sincrono": [
    "Un ejemplo de la vida diaria: cuando pagamos con tarjeta, la aprobación es síncrona, porque necesitamos saber si pasó; el correo con el comprobante es asíncrono, porque puede llegar un minuto después.",
    "La pregunta que nos hacemos en cada caso es: si el otro sistema está caído, ¿la persona tiene que enterarse? Si la respuesta es no, va asíncrono.",
  ],
  "s04-outbox": [
    "El relevador hace hasta tres intentos por ciclo, esperando un poco más entre cada uno. Si los tres fallan, no pasa nada grave: la fila sigue pendiente y el siguiente ciclo, cinco segundos después, vuelve a intentar.",
    "El número del evento se genera una sola vez, al guardar. Por eso cada reintento manda exactamente el mismo número, y del otro lado se puede reconocer como repetido.",
    "En un sistema con procedimientos se traduce así: una tabla de pendientes con una columna procesado, un INSERT dentro de la misma transacción del procedimiento y un job que recorre los pendientes.",
  ],
  "s04-idempotencia": [
    "Lo probamos a propósito: la interfaz tiene un botón para reentregar un evento ya consumido, y el contador de avisos duplicados se mantiene en cero.",
    "La idempotencia no es solo para mensajes: un pago, un registro de asistencia o una importación de archivos deberían poder reintentarse sin duplicar. La receta es la misma: un número único por operación y una tabla que lo recuerde.",
  ],
  "s04-aprendizajes": [
    "Juntos, Outbox e idempotencia logran lo que en la industria se llama entrega al menos una vez con efecto exactamente una vez. Es la base de muchos sistemas de pagos y de notificaciones.",
  ],
  "s05-complemento": [
    "La imagen de cada servicio se construye en dos etapas: una con Maven para compilar y otra solo con Java para correr. Así la imagen final es más liviana y no lleva herramientas de compilación.",
    "Además, el contenedor corre con un usuario sin privilegios: si alguien comprometiera la aplicación, no sería administrador del contenedor.",
  ],
  "s05-pipeline": [
    "El pipeline prueba los dos servicios en paralelo, cada uno con su propia base temporal, y tiene un trabajo aparte para la interfaz: valida, prueba, construye y comprueba que el archivo de Compose es válido.",
    "La imagen de la interfaz solo se publica cuando el cambio llega a main; la de los servicios hoy también se publica desde el Pull Request. Es un ajuste que ya tenemos identificado.",
    "Cada imagen lleva como etiqueta el código del commit. Si algo falla en un ambiente, sabemos exactamente qué versión está corriendo y podemos volver a la anterior.",
  ],
  "s05-codespaces": [
    "La máquina publica cuatro puertos: la interfaz, Grafana y los dos Swagger. Un script escribe la dirección pública de cada puerto para que los enlaces de la interfaz también funcionen en la nube.",
    "Un Codespace sin uso se detiene solo a los treinta minutos, y se borra al terminar. Para el día de la presentación lo arrancamos quince minutos antes.",
  ],
  "s05-kubernetes": [
    "Antes de arrancar cada servicio, un contenedor previo espera a que su base responda. Sin eso, el servicio arrancaría, no encontraría la base y se reiniciaría una y otra vez.",
    "La prueba de salud le dice a Kubernetes cuándo el servicio está listo para recibir tráfico. Arrancar no es lo mismo que estar listo, y esa diferencia evita errores en los primeros segundos.",
  ],
  "s05-autocuracion": [
    "Se demuestra en un minuto: se borra el Pod con kubectl delete y, mirando la lista de Pods, aparece uno nuevo que en unos segundos vuelve a estar listo.",
    "Si lo que se cae es la base, pasa lo mismo: su Pod se recrea y los datos siguen en el disco persistente.",
  ],
  "s05-aprendizajes": [
    "Lo que más valor nos dio de DevOps fue que todo quedó escrito: la receta de cada imagen, el archivo de Compose, los manifiestos de Kubernetes y el pipeline. Nada depende de la memoria de una persona.",
  ],
  "s06-logs": [
    "Para buscar en Grafana basta una consulta como: los logs del servicio de notificaciones que contengan la palabra evento. En segundos aparecen las líneas con el número del evento.",
    "Los logs salen en un formato estándar, ECS, sin tocar el código del negocio: es una línea de configuración de Spring Boot.",
  ],
  "s06-aprendizajes": [
    "Si tuvieran que empezar por una sola cosa, sería un identificador por operación que viaje entre sistemas y aparezca en cada log. Con eso, diagnosticar deja de ser adivinar.",
  ],
  "s07-ui": [
    "La interfaz es una aplicación React servida por nginx, que a la vez hace de proxy hacia los servicios. Tiene sus propias pruebas automáticas y corre en el mismo Compose que todo lo demás.",
    "La pestaña Ayuda tiene diagramas paso a paso de cada flujo; la usamos para explicar el sistema a quien no lo conoce.",
  ],
  "s07-caida": [
    "Si la red de la sala falla, la demostración se puede contar con esta misma lámina: cada clic muestra lo que se vería en la pantalla.",
    "Si una operación que cambia datos tarda demasiado, la interfaz no la repite sola, porque el cambio pudo haberse guardado aunque la respuesta no llegara.",
  ],
  "s07-aprendizajes": [
    "La demostración también nos sirvió como prueba: cada falla que mostramos la provocamos antes, a propósito, varias veces.",
  ],
  "s08-valor": [
    "Si alguien pregunta por números: cero avisos perdidos o duplicados en las pruebas de caída, un comando para levantar los ocho contenedores y una imagen rastreable por cada commit.",
  ],
  "s08-manana": [
    "El orden que recomendamos: primero la cadena de conexión, porque es un cambio pequeño que baja un riesgo real; después la tabla de pendientes en el proceso que más falla hoy; y luego la idempotencia en lo que se reintenta.",
    "Ninguna de estas prácticas exige Java, microservicios ni Kubernetes. Son decisiones de diseño que se pueden tomar en el sistema que ya tienen.",
  ],
  "s08-aprendizajes": [
    "Si se llevan una sola frase: diseñen pensando en qué pasa cuando algo falla, no solo cuando todo sale bien. Y antes de pensar en el cómo, tengan claro el qué.",
  ],
};

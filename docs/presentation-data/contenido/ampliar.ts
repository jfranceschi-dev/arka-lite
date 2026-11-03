// Más para decir, lámina por lámina: ejemplos, datos reales del proyecto y
// cómo se aplica en los sistemas de hoy. No cuenta en los minutos: quien
// presenta lo usa si sobra tiempo o si el público pregunta. Cada dato sale
// del código o la configuración del repositorio.
export const AMPLIAR: Record<string, string[]> = {
  "s00-portada": [
    "ARKA-Lite nació como laboratorio del curso, así que aplicamos cada tema al mismo sistema. Primero hicimos una operación y después agregamos la base, la comunicación, los contenedores, el pipeline y los registros.",
    "Trabajamos como un equipo real. Cada cambio se hizo por separado, otra persona lo revisó y las pruebas automáticas lo validaron antes de incorporarlo.",
  ],
  "s00-agenda": [
    "Las partes generales son breves porque dedicaremos más tiempo a los datos, la comunicación entre sistemas y la operación, que son los temas con mayor valor práctico.",
  ],
  "s01-analisis": [
    "La pregunta sobre lo que no podíamos permitir nos permitió definir las reglas antes de escribir código. De otra manera, habríamos descubierto esos casos más tarde y corregirlos habría costado más.",
    "La base de datos también protege los cuatro estados, porque la columna correspondiente solo acepta esos valores.",
    "Cuando arranca, el sistema registra dos solicitudes de ejemplo. El pipeline utiliza una para confirmar que el servicio realmente inició.",
  ],
  "s01-practicas": [
    "Por ejemplo, la pieza que recibe los pedidos no toma decisiones, sino que los pasa a las reglas. Si cambia la regla de envío, modificamos un lugar y ejecutamos su prueba.",
    "Las mismas ideas sirven con procedimientos almacenados. Podemos tener un procedimiento por tarea, con nombres del negocio y mensajes de error claros.",
  ],
  "s01-aprendizajes": [
    "Si tuviéramos que comenzar con una práctica en un sistema existente, pondríamos las reglas del negocio en un solo lugar y agregaríamos sus pruebas. Es una inversión que devuelve valor con rapidez.",
  ],
  "s02-mapa": [
    "La pantalla es delgada a propósito, porque no guarda datos ni toma decisiones. Si la reemplazamos en el futuro, los servicios no tienen que cambiar.",
    "Los dos servicios comparten la misma plataforma, el mismo pipeline y el mismo lugar para revisar los registros. Eso reduce el costo operativo de mantenerlos separados.",
  ],
  "s02-practica": [
    "El mensaje entre los servicios lleva tres datos, que son el número del evento, el número de la solicitud y su tipo. Al mantenerlo pequeño, resulta más sencillo coordinar ambos lados.",
    "El formato del mensaje existe en los dos servicios. Si cambia, debemos actualizar ambos al mismo tiempo, porque es lo único que comparten.",
  ],
  "s02-hexagonal": [
    "Dejamos versiones alternativas de algunos conectores, como una forma de avisar sin reintentos. Eso demuestra que podemos reemplazarlos sin modificar las reglas.",
    "La idea se parece a varias aplicaciones que llaman un procedimiento por su nombre sin conocer cómo está implementado.",
  ],
  "s02-aprendizajes": [
    "La parte más difícil de los microservicios fue definir las fronteras y decidir a quién pertenecía cada dato. Una vez resuelto eso, el resto del diseño se ordenó con mayor facilidad.",
  ],
  "s03-bases": [
    "Tener una base por servicio no duplica necesariamente el trabajo de diseño. Cada base es pequeña, tiene pocas tablas y atiende una responsabilidad concreta.",
    "En Kubernetes, cada base utiliza un disco persistente. Si el contenedor se reinicia, los datos permanecen y solo se perderían si se eliminara ese disco.",
  ],
  "s03-modelo": [
    "La tabla evento tiene un índice que incluye únicamente las filas pendientes. Como las consultamos cada cinco segundos, el índice sigue siendo pequeño aunque crezca el historial.",
    "Las tablas se crean mediante un archivo que puede ejecutarse en cada arranque sin causar daños. Ese archivo también actualiza bases anteriores con los elementos que les falten.",
  ],
  "s03-sp-orm": [
    "Los procedimientos siguen siendo adecuados para reportes y procesos masivos. Lo que cambia es dónde colocamos las reglas que modificamos y probamos con mayor frecuencia.",
    "Cuando la regla está en el código, cada cambio pasa por revisión, pruebas automáticas y el pipeline, como cualquier otra parte del sistema.",
  ],
  "s03-misma-regla": [
    "Para probar esta regla creamos una solicitud ya enviada, intentamos enviarla otra vez y verificamos el rechazo. La prueba tarda milésimas de segundo y no necesita una base.",
    "Con un procedimiento habría que preparar los datos, ejecutarlo y revisar el resultado en una base. También funciona, pero resulta más lento de repetir con cada cambio.",
    "El objetivo del proyecto es conocer otro enfoque y evaluar cuándo conviene usarlo en desarrollos futuros, sin reemplazar lo que ya funciona.",
  ],
  "s03-que-es-orm": [
    "En Java, JPA define el estándar y Hibernate es una herramienta que lo implementa. Podemos verlo como una norma y un producto que cumple esa norma.",
    "Cuando la herramienta escribe el SQL rutinario, reducimos el código repetitivo y usamos los parámetros de forma consistente.",
    "Un ORM también puede generar consultas ineficientes si nadie las revisa. Por eso seguimos necesitando personas que entiendan el funcionamiento de las bases de datos.",
  ],
  "s03-orm": [
    "El repositorio del proyecto no contiene consultas escritas para las operaciones básicas. Al heredar de una interfaz, obtiene las funciones de guardar, buscar, listar y borrar.",
    "Al guardar, el ORM utiliza la llave para determinar si corresponde un INSERT o un UPDATE. Por eso es importante definir correctamente las llaves.",
  ],
  "s03-credenciales": [
    "En Kubernetes, el Secret guarda la clave y las demás variables contienen el resto de la configuración.",
    "El proyecto tiene valores predeterminados para trabajar en una computadora. En un ambiente real no los usamos, porque la configuración siempre llega desde el entorno.",
    "En producción también podemos guardar las claves en una bóveda especializada. La idea se mantiene igual, porque permanecen fuera del código.",
  ],
  "s03-transacciones": [
    "La transacción cubre toda la operación de envío. Si falla el INSERT del aviso, por ejemplo debido a una restricción, también se deshace el UPDATE de la solicitud.",
    "Preferimos una transacción local dentro de una base, porque resulta más confiable que intentar coordinar dos sistemas al mismo tiempo.",
  ],
  "s03-aprendizajes": [
    "El rol de base de datos no desaparece. Se concentra más en diseñar el modelo, cuidar los índices y restricciones, y revisar el SQL generado por el ORM.",
  ],
  "s04-comunicacion": [
    "La llamada entre servicios utiliza un cliente preparado para conservar el número de seguimiento. Con un cliente común se perdería esa continuidad, por eso lo definimos como una regla del equipo.",
    "Los servicios se comunican por HTTP y envían mensajes en JSON, un formato de texto que pueden leer tanto las personas como los sistemas.",
  ],
  "s04-sincrono": [
    "En cada caso preguntamos si la persona debe enterarse cuando el otro sistema está caído. Si la respuesta es no, podemos manejarlo de forma asíncrona.",
    "Esto también ocurre en los sistemas actuales. Un procedimiento que llama a otro sistema y espera su respuesta falla cuando ese sistema no está disponible.",
  ],
  "s04-outbox": [
    "El relevador intenta entregar cada evento hasta tres veces por vuelta y espera un poco más entre intentos. Si todos fallan, la fila permanece pendiente y vuelve a probar cinco segundos después.",
    "El número del evento se genera una sola vez al guardar. Por eso cada reintento lleva el mismo número y el receptor puede reconocerlo.",
    "Con procedimientos, la receta incluye una tabla de pendientes, una columna procesado, un INSERT dentro de la transacción y un job que recorre las filas.",
  ],
  "s04-idempotencia": [
    "Lo probamos desde la pantalla al volver a entregar un evento ya recibido. Aunque repetimos la entrega, el contador de avisos duplicados permanece en cero.",
    "La receta sirve en cualquier sistema. Necesitamos un número único por operación y una tabla que recuerde cuáles ya fueron procesadas.",
  ],
  "s04-aprendizajes": [
    "Juntas, la bandeja de salida y la idempotencia permiten que un mensaje llegue varias veces, pero produzca su efecto una sola vez. Esta es una base común en sistemas de pagos y notificaciones.",
  ],
  "s05-devops": [
    "En ARKA-Lite utilizamos Git y GitHub para el código, pruebas automáticas para validarlo, Docker para empaquetarlo, Kubernetes para operarlo y Grafana para observarlo.",
    "La mayoría de los pasos ya no depende de la memoria de una persona. Si uno falla, el proceso se detiene y muestra con claridad dónde ocurrió el problema.",
  ],
  "s05-complemento": [
    "La comparación funciona porque el contenedor de carga también estandarizó la forma de mover distintos productos. La misma caja puede viajar en barco, tren o camión sin importar su contenido.",
    "Podemos usar Docker sin Kubernetes en un servidor pequeño. También Kubernetes puede ejecutar imágenes creadas con otras herramientas, aunque juntos cubren todo el recorrido.",
  ],
  "s05-docker": [
    "Nuestra receta tiene dos etapas. Una compila con las herramientas de desarrollo y la otra conserva únicamente lo necesario para ejecutar, sin incluir el código fuente ni las herramientas de compilación.",
    "Las imágenes se organizan por capas. Cuando solo cambia el código, reutilizamos las capas anteriores y reducimos el tiempo de construcción y descarga.",
  ],
  "s05-bondades-docker": [
    "Una máquina virtual carga un sistema operativo completo, mientras un contenedor comparte el del servidor y lleva solo sus elementos. Por eso caben más contenedores en el mismo servidor.",
    "Los límites se definen al arrancar e indican cuánta memoria y CPU puede utilizar la aplicación. Sin ellos, un contenedor podría consumir todos los recursos disponibles.",
    "El aislamiento no reemplaza las demás medidas de seguridad. Por eso nuestro contenedor también funciona con un usuario sin privilegios.",
  ],
  "s05-compose": [
    "Si una base no arranca, el servicio correspondiente queda esperando y Compose muestra la causa. Así el error aparece en el lugar correcto.",
    "Desde la computadora solo abrimos lo necesario. La base de solicitudes no tiene una entrada externa y únicamente los servicios internos pueden alcanzarla.",
    "Antes de continuar, las bases informan cuándo están listas para aceptar conexiones mediante una herramienta de PostgreSQL.",
  ],
  "s05-ramas": [
    "Cada avance guardado se llama commit y tiene un código único. Con ese código se puede volver exactamente a ese punto.",
    "GitHub es el lugar donde el equipo guarda y comparte el código, y donde se hacen las revisiones.",
  ],
  "s05-cambio": [
    "Describimos cada cambio con un formato común, por ejemplo, fix seguido de impedir el envío de una solicitud aprobada. Así el historial funciona como una bitácora.",
    "La documentación de los servicios se genera desde el código mediante Swagger, lo que reduce el riesgo de que quede desactualizada.",
    "Nadie incorpora cambios directamente en la versión principal, incluida la persona que lidera el equipo.",
  ],
  "s05-pipeline": [
    "El pipeline ejecuta al mismo tiempo un trabajo para solicitudes, otro para notificaciones y otro para la pantalla. Así termina antes y muestra con precisión qué pieza falló.",
    "Además de pasar las pruebas, el servicio de solicitudes arranca realmente y debe mostrar una solicitud de ejemplo. Compilar no garantiza que una aplicación pueda iniciar.",
    "Entrega continua significa dejar la imagen lista, mientras despliegue continuo significa instalarla automáticamente. Nuestro proyecto llega hasta la entrega.",
    "Las condiciones se escriben en el mismo archivo del pipeline: en qué eventos corre y qué pasos se hacen solo en algunos de ellos, como publicar la imagen solo al llegar a main.",
    "Actualmente las imágenes de los servicios se publican durante la revisión y la de la pantalla al llegar a main. Ya identificamos esa diferencia como un ajuste pendiente.",
  ],
  "s05-falla-ci": [
    "Podemos configurar GitHub para bloquear un Pull Request cuando alguna prueba falla. Es una regla de la plataforma y no requiere modificar el código.",
    "El pipeline publica imágenes mediante un permiso temporal que GitHub entrega a cada ejecución, sin almacenar una contraseña.",
  ],
  "s05-trazabilidad": [
    "Ese código se llama SHA y Git genera uno para cada cambio. Usarlo evita la duda sobre si la imagen que se ejecuta es la nueva o la anterior.",
    "El archivo de Kubernetes indica qué imagen debe utilizar. Para cambiar de versión, modificamos esa referencia y volvemos a aplicar el archivo.",
  ],
  "s05-ciyaml": [
    "GitHub ofrece plantillas para casi cualquier tecnología: se parte de una y se adapta al proyecto.",
    "El nombre del archivo puede ser otro; lo que importa es que esté en la carpeta .github/workflows.",
  ],
  "s05-flujo": [
    "Existen herramientas para automatizar ese último paso. Todas siguen la misma idea, donde el pipeline entrega la imagen a Kubernetes y una persona aprueba antes de llegar a producción.",
  ],
  "s05-k8s-como": [
    "Los archivos de ARKA-Lite están en la carpeta k8s del repositorio, separados por componente. Para reconstruir el sistema en otro clúster, volvemos a aplicar esos archivos.",
    "Estos archivos se llaman manifiestos y utilizan un formato de texto llamado YAML. Un clúster es un grupo de servidores que trabajan juntos.",
  ],
  "s05-pods": [
    "El Pod permite que Kubernetes trabaje con distintas tecnologías de contenedores y también agrupe procesos que necesitan compartir la misma dirección.",
    "En ARKA-Lite, un contenedor temporal espera a que la base responda antes de iniciar el principal. Así evitamos que el servicio falle y se reinicie repetidamente.",
    "Los Pods se reemplazan en lugar de repararse. Por eso los datos importantes permanecen en la base y en su disco, no dentro del Pod.",
  ],
  "s05-bondades-k8s": [
    "Las revisiones de salud indican cuándo un servicio está listo para trabajar. Un proceso puede haber arrancado sin estar todavía preparado para recibir pedidos.",
    "Podemos aumentar las copias porque los servicios no guardan el estado importante en memoria, sino en la base.",
    "En el laboratorio abrimos un túnel mediante un comando para llegar a la pantalla. En un ambiente real se expondría de forma permanente.",
    "La pantalla reserva veinticinco milésimas de CPU y treinta y dos megas de memoria, con topes de doscientas cincuenta milésimas y ciento veintiocho megas. Llegar al tope de CPU la hace más lenta; pasarse de memoria provoca un reinicio.",
    "Definir la reserva y el tope también permite calcular cuántos servidores necesitamos, en lugar de estimarlo sin mediciones.",
  ],
  "s05-autocuracion": [
    "Podemos demostrarlo eliminando el Pod mediante un comando. En la lista aparece uno nuevo y, después de unos segundos, vuelve a estar listo.",
    "Si se cae la base, ocurre algo similar. Kubernetes recrea el Pod y los datos continúan en su disco.",
  ],
  "s05-aprendizajes": [
    "Docker y Kubernetes requieren aprendizaje y no todos los sistemas los necesitan. Sin embargo, siempre conviene documentar la instalación de una forma escrita y repetible.",
  ],
  "s06-preguntas": [
    "Los registros del proyecto utilizan un formato estándar configurado fuera del código del negocio. Para activarlo solo necesitamos una línea de configuración.",
    "Cada servicio tiene una dirección especial que informa su salud. Kubernetes y la pantalla la consultan para mostrar si está disponible.",
  ],
  "s06-logs": [
    "El número de seguimiento se llama traceId y viaja en cada llamada entre los servicios. Además, cada evento tiene su propio identificador.",
    "Si todo aparece encendido y falta un aviso, revisamos la bandeja de salida y los registros del relevador y de notificaciones.",
    "Podemos buscar los registros de notificaciones que contengan la palabra evento. En segundos obtenemos las líneas relacionadas con sus números.",
  ],
  "s06-aprendizajes": [
    "Esta práctica también funciona con procedimientos. Podemos guardar el mismo número en los registros de la aplicación, del procedimiento y de cualquier otro sistema involucrado.",
  ],
  "s07-ui": [
    "La franja superior no forma parte del sistema. La agregamos al video para indicar qué componente trabaja en cada momento.",
  ],
  "s07-caida": [
    "El video es una grabación real y los comandos se ejecutaron en ese momento contra el sistema levantado con Docker.",
    "Si una operación que cambia datos tarda demasiado, la pantalla no la repite automáticamente. El cambio pudo haberse guardado aunque la respuesta no llegara.",
    "Después de la presentación, cualquier persona puede levantar el sistema mediante un solo comando.",
  ],
  "s07-aprendizajes": [
    "La demostración también funcionó como prueba. Antes de presentarla, provocamos cada falla varias veces para verificar que el sistema respondiera de la manera esperada.",
  ],
  "s08-resultados": [
    "Comprobamos estos resultados en nuestro laboratorio y no en producción. Lo importante es que cada resultado se puede repetir y verificar.",
  ],
  "s08-sostiene": [
    "Un orden razonable sería comenzar con una tabla de pendientes en el proceso que más falla, agregar idempotencia donde existen reintentos y después incorporar un número de seguimiento.",
    "Ninguna de estas prácticas exige Java, microservicios ni Kubernetes. Son decisiones de diseño aplicables a los sistemas actuales.",
  ],
  "s08-aprendizajes": [
    "Si conservamos una sola idea, debe ser esta. Diseñemos qué hará el sistema cuando algo falle y no solamente cómo funcionará cuando todo salga bien.",
  ],
};

# Reparto de la presentación y recomendaciones

> Archivo generado por `npm run guiones` desde `docs/presentation-data/contenido/`. No editar a mano: los cambios se hacen en la fuente.

Cuatro de desarrollo, una de base de datos y dos de infraestructura. Jossett apoya en base de datos y presenta CI/CD, para bajar la carga de infraestructura.

## Las dos versiones

| Versión | Láminas | Minutos | Cuándo usarla | Qué tiene de distinto | Archivos |
| --- | --- | --- | --- | --- | --- |
| Con videos | 51 | ~46 | Hay tiempo para la parte 7: no necesita internet ni el sistema arriba. | Tres videos dentro del PPTX, que arrancan solos: un ejemplo ilustrativo de CI/CD en la parte 5 y dos del sistema real en la parte 7. | `pptx/ARKA-Lite-ejecutivo-con-videos.pptx` y `guiones/guion-ejecutivo-con-videos-por-persona.md` |
| Sin demostración | 47 | ~42 | Falta tiempo, o el público ya vio la pantalla. | No hay parte 7: la observabilidad pasa directo al cierre, y nada anuncia una demostración. | `pptx/ARKA-Lite-ejecutivo-sin-demo.pptx` y `guiones/guion-ejecutivo-sin-demo-por-persona.md` |

Cada PPTX trae además, al final, la lámina «Reparto de la presentación», que no cuenta aquí y se quita antes de presentar.

## Quién presenta qué

Los números de lámina son los de la versión con videos; en la versión sin demostración cambian solo a partir del cierre.

| Persona | Área | Láminas | Qué presenta | Minutos | Por qué esta persona |
| --- | --- | --- | --- | --- | --- |
| Luis Cardoze | Desarrollo | 1–5 | Apertura · Fundamentos | ~4 | Conecta con la presentación anterior y da el recorrido. Fundamentos solo cuenta lo que nos quedó: el equipo anterior ya la trabajó a fondo. |
| Ricardo Fábrega | Desarrollo | 6–9 | Arquitectura | ~3 | Arquitectura solo cuenta lo que nos quedó: hexagonal ya lo explicó el equipo anterior. |
| Marlene Bonilla | Base de datos | 10–12 y 17–18 | Base de datos | ~5 | La base de datos es el terreno que el staff mejor conoce, y nadie habla mejor su idioma. |
| Jossett Franceschi | Desarrollo | 13–16 y 29–36 | Apoyo en base de datos: la misma regla, el ORM y la conexión · DevOps: CI/CD | ~11 | Apoya a base de datos con la parte de código: la misma regla, el ORM y los datos de conexión. Cómo entra un cambio y el camino automático: baja la carga del equipo de infraestructura. |
| Abdiel Barria | Desarrollo | 19–23 y 45–51 | Interconexión de servicios · Demostración en video · Resultados, valor y cierre | ~10 | Es el corazón técnico: cómo no se pierde ni se duplica nada. Acompaña los videos de la pantalla con su narración. Cierra con los resultados en el idioma del negocio y recibe las preguntas. |
| Kevin | Infraestructura | 24–28 | DevOps: qué es, Docker y Compose | ~4 | Abre DevOps con el camino completo y explica cómo se empaqueta: Docker y Compose. |
| Moises | Infraestructura | 37–44 | DevOps: Kubernetes, y la observabilidad | ~7 | Operar y observar: Kubernetes, Pods, memoria y CPU, y la observabilidad. |

## Línea de tiempo · con videos

| Parte | Láminas | Desde | Hasta | Presenta |
| --- | --- | --- | --- | --- |
| Apertura | 1–2 | 0:00 | 1:03 | Luis Cardoze |
| 1 · Fundamentos | 3–5 | 1:03 | 4:03 | Luis Cardoze |
| 2 · Arquitectura | 6–9 | 4:03 | 7:16 | Ricardo Fábrega |
| 3 · Base de datos | 10–18 | 7:16 | 16:21 | Marlene Bonilla, Jossett Franceschi |
| 4 · Interconexión de servicios | 19–23 | 16:21 | 21:54 | Abdiel Barria |
| 5 · DevOps: Docker y Kubernetes | 24–41 | 21:54 | 38:05 | Kevin, Jossett Franceschi, Moises |
| 6 · Observabilidad | 42–44 | 38:05 | 40:44 | Moises |
| 7 · Demostración | 45–47 | 40:44 | 43:04 | Abdiel Barria |
| Valor y cierre | 48–51 | 43:04 | 45:37 | Abdiel Barria |

## Línea de tiempo · sin demostración

| Parte | Láminas | Desde | Hasta | Presenta |
| --- | --- | --- | --- | --- |
| Apertura | 1–2 | 0:00 | 0:57 | Luis Cardoze |
| 1 · Fundamentos | 3–5 | 0:57 | 3:56 | Luis Cardoze |
| 2 · Arquitectura | 6–9 | 3:56 | 7:10 | Ricardo Fábrega |
| 3 · Base de datos | 10–18 | 7:10 | 16:14 | Marlene Bonilla, Jossett Franceschi |
| 4 · Interconexión de servicios | 19–23 | 16:14 | 21:48 | Abdiel Barria |
| 5 · DevOps: Docker y Kubernetes | 24–40 | 21:48 | 37:03 | Kevin, Jossett Franceschi, Moises |
| 6 · Observabilidad | 41–43 | 37:03 | 39:42 | Moises |
| Valor y cierre | 44–47 | 39:42 | 42:15 | Abdiel Barria |

## Relevos

Cada vez que cambia quien presenta. La frase de relevo es el final del texto de la lámina anterior.

| Al llegar a la lámina | Entrega | Recibe |
| --- | --- | --- |
| 6. El sistema de un vistazo | Luis Cardoze | Ricardo Fábrega |
| 10. Dos bases, una por servicio | Ricardo Fábrega | Marlene Bonilla |
| 13. La misma regla, escrita de las dos formas | Marlene Bonilla | Jossett Franceschi |
| 17. Una transacción: todo o nada | Jossett Franceschi | Marlene Bonilla |
| 19. Síncrono o asíncrono | Marlene Bonilla | Abdiel Barria |
| 24. ¿Qué es DevOps? Del código a la operación | Abdiel Barria | Kevin |
| 29. Git: el historial y main | Kevin | Jossett Franceschi |
| 37. Cómo trabaja Kubernetes | Jossett Franceschi | Moises |
| 45. En video: cómo interactúan los componentes | Moises | Abdiel Barria |

## Consejos por persona

### Luis Cardoze

- No volver a presentar al equipo, porque ya lo hizo el moderador: abrir conectando con la presentación anterior, en menos de un minuto.
- Avisar desde el inicio que todo se explica con ejemplos: el público no técnico se relaja.
- Ser breve: la idea fuerza es «analizar antes de programar».
- No enseñar Java ni Spring Boot: eso lo cubre el equipo anterior. Contar lo que nos quedó.

### Ricardo Fábrega

- Hexagonal en una frase: ordena el código por dentro y no cambia cómo se instala.
- En «Cómo funciona en la práctica», remarcar que ninguna flecha une las dos bases.

### Marlene Bonilla

- Apoyarse en lo que el staff ya sabe: procedimientos, BEGIN y COMMIT, llaves e índices.
- En «Del procedimiento almacenado al ORM», dejar claro que la base no pierde importancia: lo que cambia es dónde vive la regla.
- Las preguntas de código (el ORM, Java, la configuración) pasárselas a Jossett.

### Jossett Franceschi

- Abrir «La misma regla» aclarando que los procedimientos no están mal: baja la defensiva de la sala.
- En «¿Qué es un ORM?», quedarse en la idea del intérprete; el detalle va en la lámina siguiente.
- En los datos de conexión, conectar con lo que ya hacen hoy: el web.config.
- Antes de decir CI/CD, explicar rama, push, Pull Request y merge: sin eso, lo demás no se entiende.
- En el video, señalar la pantalla de los usuarios al final: ahí se ve que el cambio llegó.
- Usar la comparación del control de calidad y evitar el detalle del archivo del pipeline.
- «Cuando un cambio rompe algo» es la lámina de más valor: detenerse ahí.

### Abdiel Barria

- Llevar la bandeja de salida y la idempotencia al mundo del staff: una tabla de pendientes con una tarea programada, y una tabla de procesados con llave única.
- Cerrar con «Quién habla con quién»: es el resumen de la parte. Recorrer primero el camino de arriba (lo que la persona espera) y luego el de abajo (lo que pasa después).
- Abrir el PPTX antes en la computadora de la sala y probar que los videos arrancan solos y se oyen las indicaciones.
- Practicar la narración con el video: Alt+P lo pausa si hace falta explicar algo.
- Hablar en el idioma del negocio: qué gana una persona que usa el sistema.
- Recibir las preguntas al final y pasárselas a quien presentó esa parte, según la tabla de preguntas.
- Llevar el tiempo con la línea de tiempo de este documento y avisar con una seña acordada si alguien se pasa.

### Kevin

- Abrir DevOps con el camino completo antes de entrar a Docker: así cada lámina tiene su lugar.
- Molde y contenedor: si la sala se queda con eso, Docker ya está entendido.
- En «De código a contenedor», remarcar que el contenedor corre con un usuario sin privilegios, por seguridad.

### Moises

- «Contenedores y Pods» es la lámina más difícil de DevOps: seguir el diagrama de izquierda a derecha, sin apuro.
- Decir con honestidad qué es teórico y qué está en el proyecto: una copia por pieza y topes solo en la pantalla.
- Si preguntan por producción, recordar que esto es un laboratorio.
- En observabilidad, decir qué hace cada herramienta (Promtail recolecta, Loki guarda, Grafana muestra) y contar el caso del aviso que no llegó; no explicar cómo se escribe la consulta.

## Consejos para todo el equipo

- No hace falta aprenderse el texto. Lean la sección «Qué decir» un par de veces y, en la presentación, apóyense en «Con tus palabras»: esas frases, dichas a su manera, ya cubren la lámina.
- Ensayen juntos al menos una vez con el PowerPoint en modo presentación: los relevos son lo que más se nota. Las láminas ya aparecen completas: no hay que hacer clics para armarlas.
- Cada persona ensaya con su guion de `guion-<versión>-por-persona.md`: ahí está solo lo suyo, con de quién recibe la palabra y a quién se la entrega.
- El bloque «Si hay tiempo» no cuenta en los minutos: úsenlo solo si van adelantados o si el público pregunta.
- Cada lámina trae «Lo que se lleva el staff». Si en una lámina solo alcanzan a decir una frase, que sea esa.
- Hay público técnico y no técnico: si una palabra técnica no se entiende, usen la frase del glosario y la comparación de la lámina.

## A quién pasarle cada pregunta

Abdiel recibe las preguntas al final y se las pasa a quien corresponde.

| Si preguntan por | Responde |
| --- | --- |
| El negocio y el alcance del proyecto | Luis Cardoze |
| Microservicios y por qué dos bases | Ricardo Fábrega |
| Procedimientos almacenados, modelo, transacciones e índices | Marlene Bonilla |
| El ORM, el SQL que genera y los datos de conexión | Jossett Franceschi |
| Eventos, reintentos y duplicados | Abdiel Barria |
| Docker y Compose | Kevin |
| Git, Pull Request y el pipeline | Jossett Franceschi |
| Kubernetes, Pods, memoria y CPU | Moises |
| Los registros, Grafana y el número de seguimiento | Moises |

## Si falta tiempo

Estas láminas se pueden saltar (en PowerPoint: Ocultar diapositiva) sin tocar lo principal. Juntas ahorran unos 4 minutos. Antes de ocultar una, revisen la frase con la que termina la lámina anterior.

| Lámina | Por qué se puede saltar |
| --- | --- |
| 6. El sistema de un vistazo | «Cómo funciona en la práctica» muestra lo mismo con más detalle. |
| 15. El ORM por dentro: el mapa entre la clase y la tabla | «¿Qué es un ORM?» ya deja la idea; esta lámina agrega el detalle. |
| 28. Todo el sistema con un comando | Se puede decir en una frase al final de las bondades de Docker. |
| 49. Lo que sostiene los resultados | «Resultados para el negocio» lleva el mensaje más útil. |

Los videos se graban con `npm run videos` y el sistema arriba: el script maneja la pantalla en Edge sin ventana, detiene y vuelve a iniciar notificaciones, graba la simulación de CI/CD y deja los MP4 en `capturas/videos/`.

## El día de la presentación

- [ ] Descargar la última versión del PPTX y abrirla en modo presentación.
- [ ] Ocultar o borrar la última lámina, «Reparto de la presentación»: es solo para el equipo.
- [ ] En la versión con videos, comprobar que arrancan solos en la computadora de la sala.
- [ ] Cada persona con su guion a mano: el PDF de guion o su guion por persona en el teléfono.
- [ ] Acordar con Abdiel la seña de tiempo.

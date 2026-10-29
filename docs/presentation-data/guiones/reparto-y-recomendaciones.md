# Reparto de la presentación y recomendaciones

> Archivo generado por `npm run guiones` desde `docs/presentation-data/contenido/`. No editar a mano: los cambios se hacen en la fuente.

Recorrido ejecutivo: 48 láminas, unos 47 minutos con la demostración en vivo. Cuatro de desarrollo (una de ellas orquesta), una de base de datos y dos de infraestructura. En base de datos, una persona de desarrollo apoya con la parte de código.

## Quién presenta qué

| Persona | Área | Láminas | Qué presenta | Minutos | Por qué esta persona |
| --- | --- | --- | --- | --- | --- |
| Desarrollo 1 · orquesta | Desarrollo | 1–6, 45–48 | Apertura, el negocio y el cierre · Fundamentos | ~8 | Conoce el negocio de punta a punta: abre con el qué, conecta las partes y cierra con lo que el staff puede aplicar. Fundamentos va en vista general: el equipo anterior ya la trabajó a fondo. |
| Desarrollo 2 | Desarrollo | 7–10, 42–44 | Arquitectura · Demostración con la UI | ~8 | Arquitectura va en vista general: lo de hexagonal ya lo explicó el equipo anterior. Tiene práctica con la UI: hace la demostración en vivo. |
| Desarrollo 3 | Desarrollo | 14–17 | Apoyo en base de datos: la misma regla, el ORM y la conexión | ~5 | Apoya a base de datos con la parte de código: Java, el ORM y la configuración. |
| Desarrollo 4 | Desarrollo | 20–24 | Interconexión de servicios | ~5 | Es el corazón técnico: cómo no se pierde ni se duplica nada. |
| Base de datos | Base de datos | 11–13, 18–19 | Base de datos | ~5 | La base de datos es el terreno que el staff mejor conoce, y nadie habla mejor su idioma. |
| Infraestructura 1 | Infraestructura | 25–31, 40–41 | DevOps: Docker, Compose y Codespaces, y la observabilidad | ~8 | Construir y empaquetar con Docker y Compose, y la observabilidad. |
| Infraestructura 2 | Infraestructura | 32–39 | DevOps: CI/CD y Kubernetes | ~8 | Entregar y operar: del pipeline al clúster. |

## Línea de tiempo

Minuto en que empieza y termina cada parte, contando la demostración en vivo. Sirve para que quien orquesta sepa si van a tiempo.

| Parte | Láminas | Desde | Hasta | Presenta |
| --- | --- | --- | --- | --- |
| Apertura | 1–2 | 0:00 | 2:18 | Desarrollo 1 · orquesta |
| 1 · Fundamentos | 3–6 | 2:18 | 5:49 | Desarrollo 1 · orquesta |
| 2 · Arquitectura | 7–10 | 5:49 | 8:51 | Desarrollo 2 |
| 3 · Base de datos | 11–19 | 8:51 | 18:24 | Base de datos, Desarrollo 3 |
| 4 · Interconexión de servicios | 20–24 | 18:24 | 23:39 | Desarrollo 4 |
| 5 · DevOps: Docker y Kubernetes | 25–39 | 23:39 | 37:42 | Infraestructura 1, Infraestructura 2 |
| 6 · Observabilidad | 40–41 | 37:42 | 39:00 | Infraestructura 1 |
| 7 · Demostración con la UI | 42–44 | 39:00 | 44:12 | Desarrollo 2 |
| Valor y cierre | 45–48 | 44:12 | 46:36 | Desarrollo 1 · orquesta |

## Relevos

Cada vez que cambia quien presenta. La frase de relevo está en el **Para pasar** de la lámina anterior.

| Al llegar a la lámina | Entrega | Recibe |
| --- | --- | --- |
| 7. El sistema de un vistazo | Desarrollo 1 · orquesta | Desarrollo 2 |
| 11. Dos bases, una por servicio | Desarrollo 2 | Base de datos |
| 14. La misma regla, escrita de las dos formas | Base de datos | Desarrollo 3 |
| 18. Una transacción: todo o nada | Desarrollo 3 | Base de datos |
| 20. Quién habla con quién, y cómo | Base de datos | Desarrollo 4 |
| 25. ¿Qué es DevOps? Del código a la operación | Desarrollo 4 | Infraestructura 1 |
| 32. CI/CD: del push a la imagen publicada | Infraestructura 1 | Infraestructura 2 |
| 40. Todos los logs, en un solo lugar | Infraestructura 2 | Infraestructura 1 |
| 42. La UI: lo que contamos, en vivo | Infraestructura 1 | Desarrollo 2 |
| 45. El valor agregado | Desarrollo 2 | Desarrollo 1 · orquesta |

## Consejos por persona

### Desarrollo 1 · orquesta

- Abrir con el nombre del equipo y el enfoque: vamos a fondo en datos, interconexión y DevOps.
- Llevar el tiempo con la línea de tiempo de este documento y avisar con una seña acordada si alguien se pasa.
- En el cierre, detenerse en «Lo que pueden aplicar desde mañana»: es la lámina más importante para el staff.
- Recibir las preguntas y pasárselas a quien presentó esa parte, según la tabla de preguntas.
- Ser breve: la idea fuerza es «primero el qué, después el cómo».
- Contar las buenas prácticas con ejemplos que el staff reconozca, no con detalles de Java.

### Desarrollo 2

- Hexagonal en una frase: ordena el código por dentro y no cambia cómo se despliega.
- En «Cómo funciona en la práctica», remarcar que el evento es un dato que viaja, no una pieza del sistema.
- Abrir el Codespace, o el Compose local, 15 minutos antes y comprobar que Salud muestra los dos servicios en verde.
- Practicar la secuencia: detener notificaciones, enviar una solicitud, mirar Enviadas, levantar notificaciones y Reentregar.
- Plan B: si el sistema o la red fallan, presentar con ARKA-Lite-ejecutivo-con-videos.pptx: las mismas láminas, con la demostración grabada. Si falla en plena presentación, contarla con los clics de la lámina.

### Desarrollo 3

- Entrar con «Gracias» y salir devolviendo la palabra al administrador de base de datos para la transacción: el guion ya trae las frases.
- Tener a mano cómo ver el SQL que genera Hibernate (spring.jpa.show-sql) por si preguntan por rendimiento.
- En la cadena de conexión, recalcar que la clave no está en el código ni en la imagen: es lo que más le interesa al staff.

### Desarrollo 4

- Llevar el Outbox y la idempotencia al mundo del staff: una tabla de pendientes con un job, y una tabla de procesados con llave única.
- Anticipar la demostración: «en un momento lo van a ver en vivo».

### Base de datos

- Apoyarse en lo que el staff ya sabe: procedimientos, BEGIN y COMMIT, llaves, CHECK e índices.
- En «Del procedimiento almacenado al ORM», dejar claro que la base no pierde importancia: lo que cambia es dónde vive la regla.
- Las preguntas de código (Hibernate, Java, configuración) pasárselas a Desarrollo 3.

### Infraestructura 1

- Abrir DevOps con el ciclo completo antes de entrar a Docker: así cada lámina tiene su lugar.
- Ser dueño del Codespace el día de la presentación y apoyar la demostración desde la terminal.
- En observabilidad, mostrar Grafana en vivo solo si sobra tiempo; la lámina basta.

### Infraestructura 2

- Contar el CI/CD desde el push y la diferencia entre entrega continua y despliegue continuo.
- «Cuando un cambio rompe algo» es la lámina de más valor del CI: detenerse ahí.
- Si hay un clúster local disponible, se puede borrar un Pod en vivo; si no, contarlo con los clics de la lámina.

## Consejos para todo el equipo

- Ensayen juntos al menos una vez con el PowerPoint en modo presentación: los clics y los relevos son lo que más se nota.
- Cada persona ensaya con su guion de `guion-ejecutivo-7-personas.md`: ahí está solo lo suyo, con de quién recibe la palabra y a quién se la entrega.
- El bloque «Si hay tiempo» no cuenta en los minutos: úsenlo solo si van adelantados o si el público pregunta.
- Cada lámina trae «Lo que se lleva el staff». Si en una lámina solo alcanzan a decir una frase, que sea esa.
- Si una palabra técnica no se entiende, usen la frase del glosario del guion: así todo el equipo explica igual.

## A quién pasarle cada pregunta

Quien orquesta recibe las preguntas al final y se las pasa a quien corresponde.

| Si preguntan por | Responde |
| --- | --- |
| El negocio y el alcance del proyecto | Desarrollo 1 · orquesta |
| Microservicios y por qué dos bases | Desarrollo 2 |
| Procedimientos almacenados, modelo, transacciones e índices | Base de datos |
| Hibernate, el SQL que genera y la cadena de conexión | Desarrollo 3 |
| Eventos, reintentos y duplicados | Desarrollo 4 |
| Docker, Compose, Codespaces y los logs | Infraestructura 1 |
| El pipeline, las imágenes y Kubernetes | Infraestructura 2 |
| La interfaz y la demostración | Desarrollo 2 |

## Si falta tiempo

Estas láminas se pueden saltar en vivo (en PowerPoint: Ocultar diapositiva) sin tocar las partes que van a fondo. Juntas ahorran unos 2 minutos.

| Lámina | Por qué se puede saltar |
| --- | --- |
| 7. El sistema de un vistazo | «Cómo funciona en la práctica» muestra lo mismo con más detalle. |
| 45. El valor agregado | «Lo que pueden aplicar desde mañana» lleva el mensaje más útil para el staff. |
| 41. Observabilidad: lo que aprendimos | Su mensaje cabe en una frase al final de la lámina de logs. |

## Si no se puede hacer la demostración en vivo

El ejecutivo tiene tres versiones, con las mismas láminas salvo la demostración. Cada una tiene su PPTX, sus PDF y su guion por persona.

| Versión | Láminas | Minutos | Cuándo usarla | Qué cambia | Archivos |
| --- | --- | --- | --- | --- | --- |
| Ejecutivo | 48 | ~47 | Hay sistema arriba (Compose local o Codespace) y red confiable en la sala. | Es la versión de referencia: la parte 7 se hace en la UI real. | `pptx/ARKA-Lite-ejecutivo.pptx` y `guiones/guion-ejecutivo-7-personas.md` |
| Ejecutivo con videos | 48 | ~44 | No se puede operar el sistema en vivo: sin red, sin Codespace o con poco tiempo para prepararlo. | La parte 7 muestra dos videos grabados con la UI real, dentro del PPTX; un clic los reproduce. La portada y la agenda dicen «en video» y no se propone ninguna demostración en las otras láminas. | `pptx/ARKA-Lite-ejecutivo-con-videos.pptx` y `guiones/guion-ejecutivo-con-videos-7-personas.md` |
| Ejecutivo sin demostración | 45 | ~41 | Falta tiempo, o el público ya vio la UI. | No hay parte 7: la observabilidad pasa directo al cierre. La portada, la agenda, Codespaces y los logs ya no anuncian una demostración. | `pptx/ARKA-Lite-ejecutivo-sin-demo.pptx` y `guiones/guion-ejecutivo-sin-demo-7-personas.md` |

Los videos se graban con `npm run videos` y el sistema arriba: el script maneja la UI en Edge sin ventana, detiene y vuelve a iniciar notificaciones, y deja los MP4 en `capturas/videos/`.

## El día de la presentación

- [ ] Descargar la última versión del PPTX ejecutivo de la rama y abrirla en modo presentación.
- [ ] Codespace arrancado 15 minutos antes, con Salud en verde y Grafana abierto en otra pestaña. Si no se puede, llevar la versión con videos.
- [ ] Cada persona con su guion a mano: el PDF de guion o `guion-ejecutivo-7-personas.md` en el teléfono.
- [ ] Probar el clicker o el teclado con un diagrama que se arme por clics.
- [ ] Acordar con quien orquesta la seña de tiempo.

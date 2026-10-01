# Estándares de desarrollo

Estas reglas son el punto de partida para ARKA-Lite. Una excepción es válida cuando mejora claramente el diseño y queda explicada en el Pull Request.

## Principios

- Priorizar claridad, simplicidad y cambios pequeños.
- Mantener el dominio independiente de frameworks e infraestructura.
- Evitar duplicación real sin crear abstracciones prematuras.
- Hacer estados inválidos difíciles de representar.
- No mezclar refactorizaciones amplias con una funcionalidad o corrección urgente.
- Actualizar pruebas y documentación en el mismo cambio.

## Java

- Usar la versión declarada en `pom.xml`; no emplear APIs de otra versión.
- Código y nombres de dominio en español, consistentes con el proyecto. Términos técnicos universales pueden conservarse en inglés.
- Clases y records en `PascalCase`; métodos, variables y paquetes en `camelCase`/minúsculas; constantes en `MAYUSCULAS_CON_GUIONES_BAJOS`.
- Un tipo público principal por archivo y nombre de archivo igual al tipo.
- Preferir objetos inmutables, `record` para datos y variables `final` cuando aporta claridad.
- Usar inyección por constructor. No usar inyección en campos.
- No devolver `null` para colecciones; devolver colecciones vacías. Usar `Optional` principalmente en retornos, no como campo o parámetro.
- Evitar métodos largos, efectos secundarios ocultos y capturas genéricas de `Exception`.
- Excepciones del dominio deben describir la condición en lenguaje de negocio.
- Los comentarios explican el porqué o una restricción; no repiten el código. Los `TODO` deben incluir ticket o responsable.
- Aplicar formato consistente del IDE. Si se incorpora un formateador automático, su configuración debe versionarse y ejecutarse en CI.

## Paquetes y dependencias

La dirección preferida de dependencias es:

```text
adaptador de entrada -> servicio/dominio <- adaptador de salida
                              ^
                         configuración
```

- El dominio no importa controladores, persistencia ni detalles HTTP.
- Los controladores validan y traducen; no contienen reglas de negocio ni almacenamiento.
- Los puertos son interfaces nombradas desde la necesidad del dominio.
- Los adaptadores implementan los puertos y aíslan detalles externos.
- La comunicación entre módulos usa contratos explícitos. No acceder directamente al repositorio interno de otro módulo.
- Las dependencias Maven nuevas requieren justificar necesidad, mantenimiento, licencia y riesgo de seguridad.

## Spring Boot

- Usar configuración externa para diferencias de entorno.
- Preferir `@Configuration` y métodos `@Bean` en la raíz de composición cuando mantienen el dominio libre de Spring.
- Evitar estado mutable global en componentes singleton.
- No ejecutar trabajo pesado o llamadas remotas en constructores.
- Definir timeouts para toda llamada de red.
- Añadir health checks y observabilidad antes de producción.
- No registrar tokens, contraseñas, cabeceras de autorización ni datos personales.

## API HTTP

- Preferir recursos y verbos HTTP estándar. Para capacidades nuevas, usar rutas consistentes como `POST /solicitudes` en vez de verbos en la URL cuando sea posible.
- Usar `GET` para lectura, `POST` para creación/acciones no idempotentes, `PUT` para reemplazo, `PATCH` para modificación parcial y `DELETE` para eliminación.
- Responder códigos correctos: `200`, `201` con `Location`, `204`, `400`, `404`, `409` y `500` según el caso.
- No exponer trazas ni detalles internos en respuestas de error.
- Usar DTOs de entrada y salida cuando el contrato HTTP no deba quedar acoplado al modelo de dominio.
- Validar entrada en el límite de la aplicación y devolver errores con estructura consistente.
- Documentar ejemplos, restricciones y errores en OpenAPI.
- Tratar los cambios incompatibles como una nueva versión o seguir una estrategia de compatibilidad acordada.

## Pruebas

- Toda regla nueva incluye al menos una prueba positiva y casos relevantes de error o borde.
- Las pruebas del dominio deben ejecutarse sin levantar Spring.
- Usar pruebas de integración para wiring, serialización, controladores y adaptadores.
- Las pruebas deben ser deterministas, independientes y legibles; no dependen del orden ni de servicios reales no controlados.
- Nombrar pruebas por comportamiento esperado, siguiendo el idioma del código.
- No reducir cobertura o deshabilitar pruebas para lograr un pipeline verde sin una explicación aprobada.
- Corregir defectos con una prueba que falle antes de la solución y pase después.

Comandos mínimos:

```powershell
Push-Location servicio-solicitudes
.\mvnw.cmd clean verify
Pop-Location

Push-Location servicio-notificaciones
.\mvnw.cmd clean verify
Pop-Location
```

## Registros y errores

- Registrar contexto útil con niveles apropiados: `ERROR`, `WARN`, `INFO`, `DEBUG` o `TRACE`.
- No usar `System.out` en código de aplicación.
- Incluir un identificador de correlación cuando haya múltiples servicios.
- No ocultar excepciones. Traducirlas en los límites manteniendo su causa cuando corresponda.
- Los mensajes de usuario no revelan implementación; los logs de servidor conservan contexto diagnóstico sin datos sensibles.

## Seguridad

- Nunca confirmar secretos, llaves privadas, tokens ni credenciales, incluso en ejemplos.
- Validar y limitar toda entrada externa.
- Mantener dependencias e imagen base actualizadas mediante MRs revisados.
- Ejecutar contenedores sin privilegios; los Dockerfile actuales ya usan usuarios de aplicación sin privilegios.
- Aplicar mínimo privilegio a cuentas, red y acceso a datos.
- Revisar autenticación, autorización, CORS y protección de endpoints antes de exponer la aplicación.
- Los hallazgos de seguridad no se incluyen completos en tickets o canales públicos si contienen detalles explotables.

## Base de datos y eventos futuros

Cuando se incorpore persistencia:

- Versionar el esquema mediante migraciones inmutables.
- No editar migraciones ya aplicadas; crear una nueva.
- Hacer compatibles los despliegues durante la transición del esquema.
- Definir transacciones en casos de uso, no en controladores.
- Evitar consultas N+1 y medir antes de optimizar.

Si la llamada HTTP actual se reemplaza por mensajería:

- Versionar contratos de eventos.
- Diseñar consumidores idempotentes.
- Definir reintentos con límite, backoff y cola de mensajes fallidos.
- Añadir identificadores de evento, fecha, versión y correlación.
- Considerar consistencia entre persistencia y publicación mediante outbox transaccional.

## Git y revisión

- Seguir [el flujo de trabajo](01-flujo-de-trabajo.md): rama corta, PR, al menos una aprobación y pruebas aprobadas.
- Usar commits atómicos con mensajes Conventional Commits.
- No mezclar formato masivo o archivos generados con cambios funcionales.
- Revisar `git diff --staged` antes de cada commit.
- No confirmar `target/`, configuración del IDE, logs ni artefactos locales.
- No hacer `push` directo a `main`.

## Documentación

- Toda documentación humana se mantiene en `docs/` y se enlaza desde `docs/README.md`.
- Documentar el motivo, uso, restricciones y ejemplos; no copiar literalmente el código.
- Actualizar rutas, puertos, variables, comandos y contratos al cambiarlos.
- Las decisiones arquitectónicas duraderas deberían registrarse como ADRs numerados en una futura carpeta `docs/adr/`.

## Criterios de revisión automática

El repositorio ya incorpora GitHub Actions. Al evolucionar sus verificaciones se debería:

1. Compilar con la versión de Java establecida.
2. Ejecutar `mvn verify` para `servicio-solicitudes` y `servicio-notificaciones`.
3. Revisar formato/análisis estático cuando se configure.
4. Analizar dependencias y secretos.
5. Construir la imagen Docker para cambios que la afecten.
6. Impedir el merge si una verificación requerida falla.

El [pipeline actual](../08-automatizacion/01-pipeline-actual.md) ejecuta pruebas y publica imágenes; [Integración continua, ramas y ambientes](../08-automatizacion/03-ci-cd-y-ambientes.md) plantea ampliaciones.

## Lista antes de solicitar revisión

- El cambio tiene alcance claro y no contiene archivos accidentales.
- Compila y todas las pruebas pasan localmente.
- La lógica está en la capa correcta.
- Los casos de error y seguridad fueron considerados.
- No hay secretos ni datos sensibles.
- API, configuración y documentación están actualizadas.
- El PR explica cómo probar y revertir el cambio.

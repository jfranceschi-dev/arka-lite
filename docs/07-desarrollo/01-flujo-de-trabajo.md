# Flujo de trabajo del equipo

Este estándar está diseñado para un equipo de cinco personas que trabaja con Git y GitHub. El objetivo es mantener `main` estable, revisada y lista para ejecutar.

## Regla principal

Los cambios nunca se suben directamente a `main`. Cada tarea se desarrolla en una rama aparte y se integra mediante un Pull Request (PR) en GitHub.

Antes de integrar un PR se requiere:

1. Al menos una aprobación de una persona distinta de quien hizo el cambio.
2. Que los comentarios pendientes hayan sido atendidos.
3. Que el proyecto compile y las pruebas pasen.
4. Que no existan conflictos con `main`.
5. Que la documentación se haya actualizado cuando corresponda.

El autor del cambio no cuenta como revisor de su propio PR. En GitHub se debe proteger `main`, impedir el `push` directo y configurar como mínimo una aprobación obligatoria.

## Nombres de ramas

El equipo utiliza estas ramas y prefijos:

| Nombre | Uso | Ejemplo |
| --- | --- | --- |
| `main` | Rama principal y estable. No se trabaja directamente sobre ella. | `main` |
| `feat/` | Desarrollo de una nueva funcionalidad o mejora. | `feat/crear-solicitud` |
| `fix/` | Corrección de un error. | `fix/error-al-enviar` |
| `docs/` | Cambio exclusivo de documentación. | `docs/organizar-documentacion` |

Después de `/`, escribir una descripción corta en minúsculas, sin espacios, tildes ni caracteres especiales. Separar las palabras con guiones.

Ejemplos correctos:

| Tarea | Nombre de la rama |
| --- | --- |
| Agregar un endpoint para crear solicitudes. | `feat/crear-solicitud` |
| Agregar el módulo de notificaciones. | `feat/agregar-notificaciones` |
| Incorporar o reorganizar documentación sin cambiar código. | `docs/documentacion-proyecto` |
| Corregir el error al enviar dos veces. | `fix/envio-duplicado` |
| Corregir la respuesta cuando no existe una solicitud. | `fix/solicitud-no-encontrada` |
| Corregir el puerto usado por Docker. | `fix/puerto-docker` |

Ejemplos que no se deben usar:

```text
mi-rama
Feature/NuevaFuncion
feat/nueva funcion
juan-cambios
```

## Flujo completo para una tarea nueva

### 1. Ir a `main`

```powershell
git switch main
```

También puede hacerse con el comando tradicional:

```powershell
git checkout main
```

### 2. Descargar la versión más reciente de `main`

```powershell
git pull origin main
```

Este paso descarga los cambios de GitHub y actualiza la rama `main` local. Se debe ejecutar antes de crear una rama de trabajo para no comenzar desde una versión antigua.

### 3. Crear la rama y cambiarse a ella

Para una funcionalidad:

```powershell
git switch -c feat/nombre-de-la-funcionalidad
```

Para una corrección:

```powershell
git switch -c fix/nombre-del-error
```

Para un cambio exclusivo de documentación:

```powershell
git switch -c docs/nombre-del-cambio
```

La alternativa tradicional es:

```powershell
git checkout -b feat/nombre-de-la-funcionalidad
```

Comprobar la rama activa:

```powershell
git branch --show-current
```

### 4. Realizar y revisar los cambios

```powershell
git status
git diff

Push-Location servicio-solicitudes
.\mvnw.cmd clean verify
Pop-Location

Push-Location servicio-notificaciones
.\mvnw.cmd clean verify
Pop-Location
```

`git status` muestra qué archivos cambiaron. `git diff` permite revisar el contenido antes de prepararlo. Las pruebas deben ejecutarse antes de subir la rama.

### 5. Preparar los archivos

Es preferible agregar solo los archivos relacionados con la tarea:

```powershell
git add ruta/al/archivo
git add docs/ .dockerignore
```

Si se comprobó que todos los cambios pertenecen a la tarea:

```powershell
git add .
```

Revisar lo que formará parte del commit:

```powershell
git diff --staged
```

### 6. Crear el commit

```powershell
git commit -m "feat: agregar creación de solicitudes"
```

La nomenclatura es:

```text
tipo: descripción corta en presente
```

| Tipo | Cuándo se usa | Ejemplo |
| --- | --- | --- |
| `feat:` | Nueva funcionalidad o mejora. | `feat: agregar consulta de solicitudes` |
| `fix:` | Corrección de un error. | `fix: impedir el envío duplicado` |
| `docs:` | Cambio únicamente de documentación. | `docs: explicar el uso de Docker` |
| `test:` | Creación o actualización de pruebas. | `test: cubrir el envío duplicado` |

Más ejemplos válidos:

```text
feat: agregar endpoint para crear solicitudes
feat: publicar evento al enviar una solicitud
feat: listar notificaciones recibidas
fix: devolver error cuando la solicitud no existe
fix: impedir el envío de una solicitud aprobada
fix: usar el puerto configurado por el entorno
docs: agregar guía de comandos Git
docs: explicar las instrucciones del Dockerfile
```

Ejemplos que se deben corregir:

| Incorrecto | Correcto | Motivo |
| --- | --- | --- |
| `agregué solicitudes` | `feat: agregar solicitudes` | Falta el tipo y se usa tiempo pasado. |
| `FIX ERROR` | `fix: corregir error al enviar` | Debe estar en minúsculas y explicar el error. |
| `cambios varios` | Separarlo en commits específicos. | No indica qué cambió y mezcla trabajos. |
| `feat: agregar cosas.` | `feat: agregar notificaciones` | Debe ser concreto y no terminar con punto. |

### Relación entre la rama y los commits

La rama describe la tarea completa. Dentro de ella puede haber uno o varios commits relacionados con esa misma tarea.

Ejemplo de una funcionalidad:

```text
Rama:   feat/agregar-notificaciones
Commit: feat: crear servicio de notificaciones
Commit: feat: registrar notificación al recibir un evento
Commit: test: probar creación de notificaciones
```

Ejemplo de una corrección:

```text
Rama:   fix/envio-duplicado
Commit: fix: impedir que una solicitud se envíe dos veces
Commit: test: cubrir el intento de envío duplicado
```

Ejemplo de documentación:

```text
Rama:   feat/documentacion-proyecto
Commit: docs: agregar flujo de trabajo con Git
Commit: docs: explicar la ejecución con Docker
```

Reglas del mensaje:

- Escribirlo en minúsculas.
- Usar una descripción corta y concreta.
- No terminar con punto.
- Explicar qué aporta el commit, no quién lo hizo.
- No mezclar tareas diferentes en el mismo commit.

### 7. Subir la rama a GitHub

La primera vez que se publica una rama:

```powershell
git push -u origin feat/nombre-de-la-funcionalidad
```

Para una corrección:

```powershell
git push -u origin fix/nombre-del-error
```

La opción `-u` conecta la rama local con la rama remota. Después del primer `push`, los siguientes cambios se publican simplemente con:

```powershell
git push
```

### 8. Crear el Pull Request

En GitHub:

1. Abrir el repositorio.
2. Seleccionar la rama publicada.
3. Elegir **Compare & pull request**.
4. Confirmar que la rama base sea `main` y que la rama de comparación sea `feat/...` o `fix/...`.
5. Escribir qué cambió y cómo probarlo.
6. Asignar al menos una persona revisora.
7. Esperar la aprobación y atender los comentarios.
8. Integrar el PR solo cuando cumpla todas las reglas.

### 9. Actualizar el equipo después de integrar el PR

Después de que GitHub integre el cambio:

```powershell
git switch main
git pull origin main
git branch -d feat/nombre-de-la-funcionalidad
```

El último comando elimina la rama local que ya fue integrada. GitHub puede eliminar la rama remota al completar el PR.

## Descargar una rama creada por otra persona

Primero se descargan las referencias nuevas del repositorio remoto:

```powershell
git fetch origin
```

Ver todas las ramas disponibles:

```powershell
git branch --all
```

Crear una rama local conectada a la rama remota:

```powershell
git switch --track origin/feat/nombre-de-la-funcionalidad
```

Alternativa tradicional:

```powershell
git checkout -b feat/nombre-de-la-funcionalidad origin/feat/nombre-de-la-funcionalidad
```

Si la rama ya existe localmente, solo hay que cambiarse a ella y actualizarla:

```powershell
git switch feat/nombre-de-la-funcionalidad
git pull
```

## Actualizar una rama de trabajo con los cambios de `main`

Si otra persona integró cambios mientras se trabajaba en una rama:

```powershell
git switch main
git pull origin main
git switch feat/nombre-de-la-funcionalidad
git merge main
```

Si aparecen conflictos, se corrigen los archivos señalados, se revisan y luego se ejecuta:

```powershell
git add ruta/al/archivo-corregido
git commit
git push
```

Después de resolver conflictos se deben volver a ejecutar las pruebas.

## Contenido mínimo del Pull Request

- Una explicación breve del objetivo.
- Una lista de los cambios realizados.
- Los pasos para probar el cambio.
- Evidencia de que las pruebas pasan.
- Capturas o ejemplos si cambia la API o una interfaz.
- Documentación actualizada.

El PR debe contener una sola tarea o propósito. Esto facilita entenderlo, revisarlo y corregirlo.

## Responsabilidades del equipo

- Una persona desarrolla el cambio.
- Otra persona realiza la revisión obligatoria.
- Las revisiones deben rotar entre las cinco personas para compartir conocimiento.
- El revisor comprueba funcionamiento, claridad, pruebas, seguridad y documentación.
- Los cambios solicitados por el revisor se agregan a la misma rama, se confirman con un nuevo commit y se publican con `git push`.

## Resumen rápido

```powershell
git switch main
git pull origin main
git switch -c feat/nombre-del-cambio

# Realizar los cambios
git status
git diff

Push-Location servicio-solicitudes
.\mvnw.cmd clean verify
Pop-Location

Push-Location servicio-notificaciones
.\mvnw.cmd clean verify
Pop-Location
git add ruta/al/archivo
git diff --staged
git commit -m "feat: describir el cambio"
git push -u origin feat/nombre-del-cambio

# Crear el Pull Request en GitHub y solicitar una revisión
```

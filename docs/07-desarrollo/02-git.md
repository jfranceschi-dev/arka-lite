# Guía práctica de Git

Esta guía cubre los comandos necesarios para el trabajo normal del proyecto y las operaciones de diagnóstico, recuperación y versionado más frecuentes. Git tiene comandos internos adicionales; para el catálogo de la versión instalada se usa `git help -a`.

## Ayuda y diagnóstico

```powershell
git --version                 # Versión instalada
git help -a                   # Todos los comandos disponibles
git help -g                   # Guías conceptuales
git help <comando>            # Manual, por ejemplo: git help rebase
git <comando> -h              # Ayuda resumida
git status                    # Estado del árbol de trabajo y staging
git status --short --branch   # Estado compacto y rama
```

## Configuración inicial

```powershell
git config --global user.name "Nombre Apellido"
git config --global user.email "correo@ejemplo.com"
git config --global init.defaultBranch main
git config --global pull.ff only
git config --global core.autocrlf true   # Recomendado en Windows
git config --list --show-origin
git config --get user.email
```

Omitir `--global` para cambiar solo el repositorio actual. No guardar tokens o contraseñas en la configuración del repositorio.

## Crear u obtener un repositorio

```powershell
git init                              # Inicializar la carpeta actual
git clone <url>                       # Clonar y entrar después a la carpeta
git clone <url> arka-lite             # Elegir nombre de carpeta
git clone --branch <rama> <url>       # Clonar una rama específica
git clone --depth 1 <url>              # Clonado superficial
```

## Ramas

```powershell
git branch                             # Ramas locales
git branch --all                       # Locales y remotas
git branch --show-current              # Rama activa
git branch <nombre>                    # Crear sin cambiar
git switch -c feat/nueva-funcion       # Crear y cambiar
git switch main                        # Cambiar de rama
git switch -                            # Volver a la rama anterior
git switch -c fix/error origin/main    # Crear desde origin/main
git branch -m <nuevo-nombre>            # Renombrar la rama actual
git branch -m <anterior> <nuevo>        # Renombrar otra rama local
git branch -d <rama>                    # Borrar rama local ya integrada
git branch -D <rama>                    # Forzar borrado; usar con cautela
git push origin --delete <rama>         # Borrar rama remota
git branch --merged main                # Ramas integradas en main
git branch --no-merged main             # Ramas aún no integradas
```

Si ya se publicó una rama renombrada:

```powershell
git push -u origin <nuevo-nombre>
git push origin --delete <nombre-anterior>
```

## Inspeccionar cambios e historial

```powershell
git diff                               # Cambios no preparados
git diff --staged                      # Cambios en staging
git diff main...HEAD                   # Cambio completo de la rama
git diff <commit-1> <commit-2> -- ruta # Comparar versiones de un archivo
git log
git log --oneline --graph --decorate --all
git log --follow -- ruta/al/archivo     # Historial incluso tras renombrar
git show <commit>                       # Contenido y metadatos
git show <commit>:ruta/al/archivo       # Archivo en una versión
git blame ruta/al/archivo               # Autoría por línea
git shortlog -sn                        # Resumen por autor
```

## Preparar y confirmar cambios

```powershell
git add ruta/al/archivo                 # Agregar un archivo al staging
git add docs/ .dockerignore             # Agregar rutas concretas
git add -p                              # Elegir fragmentos interactivos
git add -A                              # Agregar altas, cambios y borrados
git restore --staged ruta/al/archivo    # Sacar de staging sin perder edición
git commit -m "docs: agregar guía de Git"
git commit                              # Abrir editor para mensaje largo
git commit --amend                      # Corregir el último commit local
git commit --amend --no-edit            # Añadir cambios sin cambiar mensaje
```

Antes de confirmar: ejecutar `git status`, revisar `git diff --staged` y correr las pruebas. No usar `git commit -am` para archivos nuevos porque no los incluye.

El proyecto usa Conventional Commits:

```text
<tipo>(<ámbito opcional>): <descripción imperativa>

feat: permitir aprobar solicitudes
fix(solicitudes): impedir un segundo envío
docs: documentar ejecución con Docker
test: cubrir transición a rechazada
refactor(eventos): separar el publicador
chore: actualizar dependencias
```

Para un cambio incompatible se añade `!` y una explicación `BREAKING CHANGE` en el cuerpo.

## Remotos y origen

```powershell
git remote -v                          # Ver remotos y URL
git remote show origin                 # Estado detallado del origen
git remote add origin <url>            # Añadir origen
git remote set-url origin <nueva-url>  # Modificar URL del origen
git remote rename origin upstream      # Renombrar remoto
git remote remove <nombre>             # Quitar referencia local al remoto
git remote get-url origin
git remote set-url --add --push origin <url> # URL de push adicional
```

Cambiar el origen no mueve commits ni modifica el servidor; solo cambia a qué URL apunta el repositorio local.

### Corregir un `origin` equivocado

Primero se consulta la dirección configurada:

```powershell
git remote -v
```

Si `origin` apunta al repositorio incorrecto, se reemplaza su URL con:

```powershell
git remote set-url origin https://github.com/usuario/repositorio-correcto.git
```

También puede configurarse una dirección SSH:

```powershell
git remote set-url origin git@github.com:usuario/repositorio-correcto.git
```

Después se confirma el cambio y se comprueba que Git puede comunicarse con el nuevo repositorio:

```powershell
git remote -v
git fetch origin
```

Si Git responde que `origin` no existe, se debe agregar en vez de modificarlo:

```powershell
git remote add origin https://github.com/usuario/repositorio-correcto.git
```

Cambiar `origin` no sube automáticamente las ramas al repositorio nuevo. La rama actual se publica por primera vez con:

```powershell
git push -u origin nombre-de-la-rama
```

## Descargar, actualizar y publicar

```powershell
git fetch origin                       # Descargar referencias sin integrar
git fetch --all --prune                # Todos los remotos y limpiar ramas borradas
git pull --ff-only origin main         # Actualizar sin crear merge accidental
git pull --rebase origin main          # Descargar y reubicar commits locales
git push                               # Publicar con upstream configurado
git push -u origin <rama>              # Primera publicación y configurar upstream
git push --force-with-lease            # Tras rebase, solo en rama propia
git push --follow-tags                  # Publicar commits y tags asociados
```

Nunca usar `git push --force` en `main`. Preferir `--force-with-lease`, que falla si el remoto contiene trabajo que no se ha visto.

## Integrar cambios

La integración a `main` se realiza en GitHub mediante Pull Request. Para integrar localmente durante el desarrollo:

```powershell
git merge <rama>                        # Fusionar preservando historia
git merge --no-ff <rama>                # Crear commit de merge
git merge --abort                       # Cancelar merge con conflictos
git rebase origin/main                  # Reubicar rama sobre main actual
git rebase --continue                   # Continuar después de resolver
git rebase --abort                      # Cancelar rebase
git rebase -i HEAD~3                    # Reordenar/unir últimos 3 commits locales
git cherry-pick <commit>                # Aplicar un commit puntual
git cherry-pick --abort                 # Cancelar cherry-pick
```

Para resolver un conflicto: editar los archivos, retirar los marcadores `<<<<<<<`, `=======`, `>>>>>>>`, ejecutar `git add <archivo>` y continuar la operación. Después se ejecutan las pruebas.

## Guardar trabajo temporalmente

```powershell
git stash push -m "trabajo parcial"     # Guardar archivos rastreados
git stash push -u -m "trabajo parcial"  # Incluir archivos nuevos
git stash list
git stash show -p stash@{0}
git stash apply stash@{0}                # Aplicar y conservar
git stash pop                            # Aplicar el último y eliminarlo
git stash branch <rama> stash@{0}        # Crear rama desde el stash
git stash drop stash@{0}                 # Eliminar uno
git stash clear                          # Eliminar todos; irreversible
```

En PowerShell se recomienda entrecomillar `"stash@{0}"` si la expresión causa interpretación inesperada.

## Deshacer y recuperar

Elegir la herramienta según el caso:

```powershell
git restore ruta/al/archivo              # Descartar edición no preparada
git restore --source <commit> -- ruta     # Recuperar archivo de otra versión
git revert <commit>                       # Crear commit inverso; seguro en ramas públicas
git revert <inicio>^..<fin>               # Revertir un rango
git reset --soft HEAD~1                   # Quitar commit, conservar staging
git reset --mixed HEAD~1                  # Quitar commit, conservar archivos sin staging
git reset --hard <commit>                 # Descartar cambios; destructivo
git reflog                                # Historial local de movimientos de HEAD
git switch -c recovery/<nombre> <hash>    # Recuperar un estado encontrado
git clean -n                              # Vista previa de archivos no rastreados
git clean -fd                             # Borrar no rastreados; destructivo
```

En trabajo publicado se usa `revert`. `reset --hard`, `clean -fd` y la reescritura de historial requieren verificar exactamente qué se perderá.

## Etiquetas y cambio de versión

Hay dos conceptos distintos:

1. Cambiar la versión del artefacto Maven.
2. Moverse a una versión histórica o etiquetar una entrega.

Cada microservicio tiene una versión Maven independiente. Para cambiar la de solicitudes:

```powershell
Push-Location servicio-solicitudes
.\mvnw.cmd versions:set "-DnewVersion=1.2.0-SNAPSHOT"
.\mvnw.cmd versions:commit

# Si se necesita deshacer antes de versions:commit
.\mvnw.cmd versions:revert
Pop-Location
```

El objetivo `versions:set` requiere el plugin Versions y puede descargarlo. Revisar el `pom.xml` modificado y probar antes de confirmar.
Repetir el proceso desde `servicio-notificaciones` cuando ambos artefactos deban compartir la misma versión.

Crear una versión Git anotada:

```powershell
git tag --list
git tag -a v1.2.0 -m "Versión 1.2.0"
git show v1.2.0
git push origin v1.2.0
git push origin --tags
```

Las etiquetas publicadas no se mueven. Para corregir una etiqueta local todavía no publicada: `git tag -d v1.2.0` y crearla otra vez. Borrar una etiqueta remota requiere coordinación: `git push origin --delete v1.2.0`.

Cambiar temporalmente a una versión histórica:

```powershell
git switch --detach v1.2.0              # Inspección sin rama
git switch -c fix-desde-v1.2.0 v1.2.0   # Crear rama desde esa versión
git switch main                          # Regresar a main
```

## Búsqueda y utilidades avanzadas

```powershell
git grep "texto"                        # Buscar en archivos rastreados
git log -S "texto" --oneline            # Commit que añadió o quitó texto
git log -G "expresión" --oneline        # Buscar cambios por regex
git bisect start                         # Iniciar búsqueda binaria de regresión
git bisect bad                           # Versión actual falla
git bisect good <commit>                 # Versión antigua funciona
git bisect reset                         # Terminar y volver al estado inicial
git worktree list                        # Árboles de trabajo adicionales
git worktree add ..\arka-fix fix/error   # Trabajar otra rama en otra carpeta
git archive --format=zip -o entrega.zip HEAD # Exportar archivos rastreados
git gc                                   # Mantenimiento del repositorio
git fsck                                 # Verificar integridad de objetos
```

## Submódulos, si se incorporan

El proyecto actualmente no usa submódulos. Si se añaden:

```powershell
git submodule add <url> ruta
git clone --recurse-submodules <url>
git submodule update --init --recursive
git submodule update --remote
```

## Secuencia segura antes de un Pull Request

```powershell
git status --short --branch
git diff
Push-Location servicio-solicitudes
.\mvnw.cmd clean verify
Pop-Location
Push-Location servicio-notificaciones
.\mvnw.cmd clean verify
Pop-Location
git add <rutas-intencionales>
git diff --staged
git commit -m "tipo: descripción"
git fetch origin
git rebase origin/main
Push-Location servicio-solicitudes
.\mvnw.cmd clean verify
Pop-Location
Push-Location servicio-notificaciones
.\mvnw.cmd clean verify
Pop-Location
docker compose config
git push -u origin <rama>
```

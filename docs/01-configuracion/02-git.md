# Git en la computadora

## Instalar y configurar Git

Instale [Git para Windows](https://git-scm.com/install/windows). Abra PowerShell de nuevo y configure su identidad para los commits:

```powershell
git --version
git config --global user.name "Nombre Apellido"
git config --global user.email "su-correo@example.com"
git config --global --get user.name
git config --global --get user.email
```

Use el correo asociado a su cuenta de GitHub si quiere atribuir allí sus commits. Estos comandos configuran la computadora, no crean una cuenta ni conceden acceso al repositorio.


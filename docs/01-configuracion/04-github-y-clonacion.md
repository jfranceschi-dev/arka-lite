# GitHub y acceso al repositorio

1. [Cree una cuenta GitHub](https://github.com/signup) y verifique su correo.
2. Abra el [repositorio ARKA-Lite](https://github.com/jfranceschi-dev/arka-lite). Si no puede verlo o no puede contribuir, envíe su nombre de usuario GitHub a la persona responsable del repositorio y solicite una invitación. Acepte la invitación antes de trabajar; el acceso lo concede quien administra el repositorio.
3. Desde la carpeta donde guarda sus proyectos, clone por HTTPS:

```powershell
git clone https://github.com/jfranceschi-dev/arka-lite.git
cd arka-lite
git remote -v
git status
```

Si GitHub solicita autenticación, siga el inicio de sesión del administrador de credenciales de Git. Si la clonación devuelve 404 o acceso denegado, compruebe la URL, la sesión y la invitación. Consulte [la guía Git del equipo](../07-desarrollo/02-git.md) antes de crear ramas o publicar cambios.

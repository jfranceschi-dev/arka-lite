# WSL 2, Docker Desktop y Kubernetes

## 1. Preparar WSL 2

Siga la [instalación oficial de WSL](https://learn.microsoft.com/es-es/windows/wsl/install). En PowerShell **como administrador**, si WSL no está instalado:

```powershell
wsl --install
```

Reinicie Windows cuando se solicite, termine la configuración inicial de Ubuntu y verifique en PowerShell:

```powershell
wsl --version
wsl --status
wsl --list --verbose
```

La distribución utilizada con Docker debe usar WSL 2. Si WSL ya existía, actualícelo con `wsl --update`; siga la guía de Microsoft si la virtualización está deshabilitada. Los comandos de ARKA-Lite se ejecutan en PowerShell de Windows salvo indicación expresa.

## 2. Cuenta e instalación de Docker Desktop

[Cree una cuenta Docker](https://docs.docker.com/accounts/individual/create-account/) si el equipo la utilizará para iniciar sesión. Descargue [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/) y elija el motor **WSL 2** para contenedores Linux. Abra Docker Desktop, complete su configuración inicial y espere a que el motor indique que está listo. Los requisitos, opciones de instalación y condiciones de uso vigentes están en esa página oficial.

```powershell
docker version
docker compose version
docker run --rm hello-world
```

Si `docker version` muestra el cliente pero no el servidor, abra Docker Desktop y espere al inicio del motor. La [guía del backend WSL 2](https://docs.docker.com/desktop/features/wsl/) explica la integración con distribuciones Linux; no es obligatorio ejecutar este proyecto dentro de Ubuntu.

## Kubernetes integrado con `kind`

En Docker Desktop abra **Kubernetes → Create cluster**, elija **kind** y cree el clúster. Esta opción integrada es diferente de crear otro clúster con `kind create cluster`. Docker Desktop instala `kubectl`; abra PowerShell nuevamente si todavía no aparece en el `Path`. Compruebe:

```powershell
kubectl version --client
kubectl config get-contexts
kubectl config use-context docker-desktop
kubectl get nodes
```

Espere a que el nodo indique `Ready`. [Docker explica la creación y los dos provisionadores](https://docs.docker.com/desktop/use-desktop/kubernetes/). El modo `kind` requiere el almacén de imágenes **containerd** de Docker Desktop; revíselo en la configuración si la creación falla.

Para cargar las imágenes locales en los nodos instale también la **CLI de kind**, que es distinta del provisionador integrado. La [guía oficial de kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) ofrece un ejecutable para Windows y la opción `winget install Kubernetes.kind`. Compruebe `kind version` y `kind get clusters`; no ejecute `kind create cluster` para esta ruta. Después siga la [guía de Kubernetes del proyecto](../06-uso/04-kubernetes-local.md).

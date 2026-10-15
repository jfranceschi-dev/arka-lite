# Documentación de ARKA-Lite

La documentación está organizada por propósito para que una persona nueva pueda aprender el proyecto en orden, sin conocer previamente Java, Spring Boot, Docker o GitHub Actions.

## Ruta recomendada de aprendizaje

1. Leer [Descripción del proyecto](inicio/proyecto.md) para conocer el objetivo, los microservicios, puertos y API.
2. Seguir [Instalación y depuración](inicio/instalacion-y-debug.md) para preparar el equipo y levantar la solución.
3. Estudiar [Componentes Java y ejecución](arquitectura/componentes-java.md) para entender clases, capas, Spring y el flujo entre servicios.
4. Consultar [Docker y Docker Compose](operaciones/docker-y-compose.md) para comprender imágenes, contenedores y la red interna.
5. Seguir [Kubernetes local](operaciones/kubernetes-local.md) y [PostgreSQL en Kubernetes](operaciones/postgresql-kubernetes.md) para entender los dos manifiestos de bases de datos y comprobarlos con comandos.
6. Leer [Flujo de trabajo del equipo](desarrollo/flujo-de-trabajo.md) y [Guía de Git](desarrollo/git.md) antes de crear una rama o Pull Request.
7. Revisar [GitHub Actions y archivos YAML](automatizacion/github-actions-yaml.md) para entender qué archivos reconoce GitHub.
8. Continuar con [CI/CD, ramas y ambientes](automatizacion/ci-cd-y-ambientes.md) para diseñar la automatización futura.

## Organización

```text
docs/
├── README.md
├── inicio/
│   ├── README.md
│   ├── proyecto.md
│   └── instalacion-y-debug.md
├── arquitectura/
│   ├── README.md
│   ├── componentes-java.md
│   └── especificacion-eventos-outbox.md
├── desarrollo/
│   ├── README.md
│   ├── flujo-de-trabajo.md
│   ├── git.md
│   └── estandares-de-desarrollo.md
├── operaciones/
│   ├── README.md
│   ├── docker-y-compose.md
│   ├── kubernetes-local.md
│   ├── postgresql-kubernetes.md
│   └── kubernetes-limpieza.md
└── automatizacion/
    ├── README.md
    ├── github-actions-yaml.md
    └── ci-cd-y-ambientes.md
```

### Inicio

Material para instalar, ejecutar y conocer el sistema por primera vez.

- [Descripción del proyecto](inicio/proyecto.md)
- [Instalación y depuración](inicio/instalacion-y-debug.md)

### Arquitectura

Diseño del código, componentes Java y comunicación entre microservicios.

- [Componentes Java y ejecución](arquitectura/componentes-java.md)
- [Evolución de eventos, reintentos e idempotencia](arquitectura/especificacion-eventos-outbox.md)

### Desarrollo

Reglas para cambiar el código y colaborar con el equipo.

- [Flujo de trabajo del equipo](desarrollo/flujo-de-trabajo.md)
- [Guía de Git](desarrollo/git.md)
- [Estándares de desarrollo](desarrollo/estandares-de-desarrollo.md)

### Operaciones

Construcción, ejecución y diagnóstico de la aplicación.

- [Docker y Docker Compose](operaciones/docker-y-compose.md)
- [Kubernetes local con Docker Desktop](operaciones/kubernetes-local.md)
- [PostgreSQL en Kubernetes](operaciones/postgresql-kubernetes.md)
- [Limpieza de Kubernetes local](operaciones/kubernetes-limpieza.md)

### Automatización

GitHub Actions, CI/CD, ramas, ambientes y otros archivos de GitHub.

- [GitHub Actions y archivos YAML](automatizacion/github-actions-yaml.md)
- [CI/CD, ramas y ambientes](automatizacion/ci-cd-y-ambientes.md)

## Regla de mantenimiento

Cada documento se guarda en la carpeta que corresponde a su uso. Cuando un cambio modifique comportamiento, arquitectura, ejecución, despliegue o proceso de trabajo, se actualiza la documentación relacionada en el mismo Pull Request.

Los archivos técnicos requeridos por herramientas permanecen donde estas los esperan. Por ejemplo, `compose.yaml` vive en la raíz y los workflows futuros vivirán en `.github/workflows/`; no deben moverse a `docs/`.

Los ejemplos usan PowerShell en Windows. En Linux o macOS se usa `./mvnw` donde se indique `.\mvnw.cmd`.

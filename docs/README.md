# Documentación de ARKA-Lite

La documentación está organizada por propósito para que una persona nueva pueda aprender el proyecto en orden, sin conocer previamente Java, Spring Boot, Docker o GitHub Actions.

## Ruta recomendada de aprendizaje

1. Leer [Descripción del proyecto](inicio/proyecto.md) para conocer el objetivo, los microservicios, puertos y API.
2. Seguir [Instalación y depuración](inicio/instalacion-y-debug.md) para preparar el equipo y levantar la solución.
3. Estudiar [Componentes Java y ejecución](arquitectura/componentes-java.md) para entender clases, capas, Spring y el flujo entre servicios.
4. Consultar [Docker y Docker Compose](operaciones/docker-y-compose.md) para comprender imágenes, contenedores y la red interna.
5. Leer [Flujo de trabajo del equipo](desarrollo/flujo-de-trabajo.md) y [Guía de Git](desarrollo/git.md) antes de crear una rama o Pull Request.
6. Revisar [GitHub Actions y archivos YAML](automatizacion/github-actions-yaml.md) para entender qué archivos reconoce GitHub.
7. Continuar con [CI/CD, ramas y ambientes](automatizacion/ci-cd-y-ambientes.md) para conocer el CI actual y las propuestas de evolución.

## Organización

Los [guiones y presentaciones de ARKA-Lite](presentation-data/README.md) incluyen las versiones para equipo y staff, diagramas de arquitectura y el generador editable de PowerPoint. La etapa de [datos y consistencia](presentation-data/datos-y-consistencia.md) desarrolla transacciones, outbox, idempotencia, concurrencia y recuperación. La preparación actual prioriza los guiones Markdown; el ajuste de PowerPoint queda para una etapa posterior. El [guion maestro de exposición](presentation-data/guion-maestro.md) contiene la narración de las nueve secciones y enlaza el [guion detallado de observabilidad](presentation-data/guion-observabilidad.md).

```text
docs/
├── README.md
├── inicio/
│   ├── README.md
│   ├── proyecto.md
│   ├── instalacion-y-debug.md
│   └── bases-de-datos-locales.md
├── arquitectura/
│   ├── README.md
│   └── componentes-java.md
├── desarrollo/
│   ├── README.md
│   ├── flujo-de-trabajo.md
│   ├── git.md
│   └── estandares-de-desarrollo.md
├── operaciones/
│   ├── README.md
│   ├── docker-y-compose.md
│   ├── kubernetes-local.md
│   ├── kubernetes-limpieza.md
│   └── correccion-arranque.md
└── automatizacion/
    ├── README.md
    ├── github-actions-yaml.md
    └── ci-cd-y-ambientes.md
```

### Inicio

Material para instalar, ejecutar y conocer el sistema por primera vez.

- [Descripción del proyecto](inicio/proyecto.md)
- [Instalación y depuración](inicio/instalacion-y-debug.md)
- [Bases de datos para ejecución local](inicio/bases-de-datos-locales.md)

### Arquitectura

Diseño del código, componentes Java y comunicación entre microservicios.

- [Componentes Java y ejecución](arquitectura/componentes-java.md)

### Desarrollo

Reglas para cambiar el código y colaborar con el equipo.

- [Flujo de trabajo del equipo](desarrollo/flujo-de-trabajo.md)
- [Guía de Git](desarrollo/git.md)
- [Estándares de desarrollo](desarrollo/estandares-de-desarrollo.md)

### Operaciones

Construcción, ejecución y diagnóstico de la aplicación.

- [Docker y Docker Compose](operaciones/docker-y-compose.md)
- [Kubernetes local con Docker Desktop](operaciones/kubernetes-local.md)
- [Limpieza de Kubernetes local](operaciones/kubernetes-limpieza.md)
- [Diagnóstico del esquema y arranque](operaciones/correccion-arranque.md)

### Automatización

GitHub Actions, CI/CD, ramas, ambientes y otros archivos de GitHub.

- [GitHub Actions y archivos YAML](automatizacion/github-actions-yaml.md)
- [CI/CD, ramas y ambientes](automatizacion/ci-cd-y-ambientes.md)

## Regla de mantenimiento

Cada documento se guarda en la carpeta que corresponde a su uso. Cuando un cambio modifique comportamiento, arquitectura, ejecución, despliegue o proceso de trabajo, se actualiza la documentación relacionada en el mismo Pull Request.

Los archivos técnicos requeridos por herramientas permanecen donde estas los esperan. Por ejemplo, `compose.yaml` vive en la raíz y el workflow de CI vive en `.github/workflows/`; no deben moverse a `docs/`.

Los ejemplos usan PowerShell en Windows. En Linux o macOS se usa `./mvnw` donde se indique `.\mvnw.cmd`.

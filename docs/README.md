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

La [presentación del proyecto final](presentation-data/README.md) del curso Upskilling Backend Java tiene su propio contenido, sus generadores y sus entregables: PPTX, PDF y guiones en tres variantes para el staff de tecnología (resumen, ejecutivo y técnico), con el reparto del equipo arka-litos. Cuenta ARKA-Lite de punta a punta: fundamentos y arquitectura en vista general; base de datos, interconexión de servicios y DevOps a fondo; y una demostración en vivo con la UI. Las versiones anteriores quedaron en `presentation-data/BackUp-pptx/`.

La [UI arka-lite-ui](../arka-lite-ui/README.md) es una aplicación minimalista con cuatro pestañas: **Solicitudes** (crear, ver y decidir), **Enviadas** (el recorrido de cada evento y la prueba de idempotencia), **Salud** (validar los servicios y abrir Swagger y Grafana) y **Ayuda** (diagramas paso a paso de cómo funciona). Se levanta con el resto del sistema en `docker compose up` (`http://localhost:8088`) o con `k8s/arka-lite-ui.yaml`.

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
│   ├── componentes-java.md
│   ├── especificacion-eventos-outbox.md
│   ├── flujo-y-referencias.md
│   └── datos-y-consistencia.md
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
│   ├── correccion-arranque.md
│   ├── codespaces.md
│   ├── observabilidad.md
│   └── infraestructura-y-entrega.md
├── automatizacion/
│   ├── README.md
│   ├── github-actions-yaml.md
│   ├── ci-cd-y-ambientes.md
│   └── ci-yaml-paso-a-paso.md
└── presentation-data/   (proyecto de la presentación)
    ├── README.md
    ├── contenido/ diagramas/ generador-*/
    ├── pptx/
    ├── pdf/
    ├── guiones/
    └── BackUp-pptx/     (versiones anteriores)
```

### Inicio

Material para instalar, ejecutar y conocer el sistema por primera vez.

- [Descripción del proyecto](inicio/proyecto.md)
- [Instalación y depuración](inicio/instalacion-y-debug.md)
- [Bases de datos para ejecución local](inicio/bases-de-datos-locales.md)

### Arquitectura

Diseño del código, componentes Java y comunicación entre microservicios.

- [Componentes Java y ejecución](arquitectura/componentes-java.md)
- [Flujo de una solicitud y referencias al código](arquitectura/flujo-y-referencias.md)
- [Datos y consistencia: transacciones, outbox e idempotencia](arquitectura/datos-y-consistencia.md)

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
- [Demostración en vivo con GitHub Codespaces](operaciones/codespaces.md)
- [Observabilidad: logs, métricas y trazas](operaciones/observabilidad.md)
- [Infraestructura y entrega](operaciones/infraestructura-y-entrega.md)

### Automatización

GitHub Actions, CI/CD, ramas, ambientes y otros archivos de GitHub.

- [GitHub Actions y archivos YAML](automatizacion/github-actions-yaml.md)
- [CI/CD, ramas y ambientes](automatizacion/ci-cd-y-ambientes.md)
- [Creación de ci.yml paso a paso](automatizacion/ci-yaml-paso-a-paso.md)

## Regla de mantenimiento

Cada documento se guarda en la carpeta que corresponde a su uso. Cuando un cambio modifique comportamiento, arquitectura, ejecución, despliegue o proceso de trabajo, se actualiza la documentación relacionada en el mismo Pull Request.

Los archivos técnicos requeridos por herramientas permanecen donde estas los esperan. Por ejemplo, `compose.yaml` vive en la raíz y el workflow de CI vive en `.github/workflows/`; no deben moverse a `docs/`.

Los ejemplos usan PowerShell en Windows. En Linux o macOS se usa `./mvnw` donde se indique `.\mvnw.cmd`.

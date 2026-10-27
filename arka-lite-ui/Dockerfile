# UI de ARKA-Lite: compila React con Node y la sirve con nginx sin privilegios,
# que además hace de proxy de las API en el mismo origen.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# La fuente se valida antes de construir: una referencia rota no llega a la imagen.
RUN npm run validar && npm run build

FROM nginxinc/nginx-unprivileged:1.28-alpine
# Destinos internos por defecto: nombres de servicio en Compose y Kubernetes.
# Nunca se entregan al navegador; los usa solo nginx.
ENV ARKA_SOLICITUDES_ORIGEN=http://servicio-solicitudes:8080 \
    ARKA_NOTIFICACIONES_ORIGEN=http://servicio-notificaciones:8080
# Enlaces que abre el navegador: contratos Swagger y Grafana (/enlaces.json).
ENV ARKA_ENLACE_SWAGGER_SOLICITUDES=http://localhost:8080/swagger-ui/index.html \
    ARKA_ENLACE_SWAGGER_NOTIFICACIONES=http://localhost:8081/swagger-ui/index.html \
    ARKA_ENLACE_GRAFANA=http://localhost:3000
COPY despliegue/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 8080
USER 101

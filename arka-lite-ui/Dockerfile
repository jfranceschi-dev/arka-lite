# UI de ARKA-Lite: compila React con Node y la sirve con nginx sin privilegios,
# que además hace de proxy de las API en el mismo origen.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Si el registro principal falla (por ejemplo, una red que inspecciona HTTPS
# solo en registry.npmjs.org), se reintenta con el espejo oficial de Yarn.
# El sha512 de package-lock.json sigue validando cada paquete.
ARG NPM_REGISTRY=https://registry.npmjs.org/
ARG NPM_REGISTRY_RESPALDO=https://registry.yarnpkg.com/
# CA corporativa opcional, disponible solo durante la instalación.
RUN --mount=type=secret,id=npm_ca \
    if [ -s /run/secrets/npm_ca ]; then \
      export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; \
    fi; \
    npm ci --no-audit --no-fund --fetch-retries=1 --registry="$NPM_REGISTRY" \
    || { echo "npm ci falló con $NPM_REGISTRY; reintento con $NPM_REGISTRY_RESPALDO"; \
         npm ci --no-audit --no-fund --registry="$NPM_REGISTRY_RESPALDO"; }
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

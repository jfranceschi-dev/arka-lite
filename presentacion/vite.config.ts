import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// En desarrollo, Vite hace de proxy igual que nginx en el contenedor: el
// navegador solo conoce /api y el proxy traduce a cada servicio. Los destinos
// se cambian con variables de entorno, sin tocar el código de la UI.
const solicitudes = process.env.ARKA_SOLICITUDES_ORIGEN ?? "http://localhost:8080";
const notificaciones = process.env.ARKA_NOTIFICACIONES_ORIGEN ?? "http://localhost:8081";

export default defineConfig({
  root: "web",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api/solicitudes": { target: solicitudes, rewrite: (p) => p.replace(/^\/api/, "") },
      "/api/notificaciones": { target: notificaciones, rewrite: (p) => p.replace(/^\/api/, "") },
      "/api/eventos/procesados": { target: notificaciones, rewrite: (p) => p.replace(/^\/api/, "") },
      "/api/salud/solicitudes": { target: solicitudes, rewrite: () => "/actuator/health" },
      "/api/salud/notificaciones": { target: notificaciones, rewrite: () => "/actuator/health" },
      "/api/openapi/solicitudes": { target: solicitudes, rewrite: () => "/v3/api-docs" },
      "/api/openapi/notificaciones": { target: notificaciones, rewrite: () => "/v3/api-docs" },
    },
  },
});

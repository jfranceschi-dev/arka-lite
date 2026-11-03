import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    root: ".",
    include: ["pruebas/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["pruebas/preparar.ts"],
    restoreMocks: true,
  },
});

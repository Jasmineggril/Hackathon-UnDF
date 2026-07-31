import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    env: {
      VITE_DEMO_MODE: "true",
      VITE_DEMO_USER_EMAIL: "aluno_teste@undf.edu.br",
      VITE_DEMO_USER_PASSWORD: "123456",
      VITE_DEMO_ADMIN_EMAIL: "gestor_demo@undf.edu.br",
      VITE_DEMO_ADMIN_PASSWORD: "123456",
      VITE_DEMO_ADMIN_ENABLED: "true",
      VITE_DEMO_USER_ENABLED: "true",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src", "assets"),
    },
  },
});

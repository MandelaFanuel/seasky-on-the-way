import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    port: 5173,
    host: true,

    /**
     * ✅ Proxy DEV (LOCAL)
     * Le frontend appelle /api/v1/...
     * Vite redirige vers Django en local
     */
    proxy: {
      "/api/v1": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },

      // optionnel mais recommandé si Django sert media/static
      "/media": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/static": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});

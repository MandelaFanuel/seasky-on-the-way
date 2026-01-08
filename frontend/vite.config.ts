// ========================= vite.config.ts =========================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(() => {
  /**
   * ✅ Proxy target configurable:
   * - Local machine: http://localhost:8000
   * - Docker compose: http://backend:8000
   *
   * NOTE: Vite tourne DANS le container => "localhost" = container lui-même.
   */
  const proxyTarget = process.env.VITE_DEV_PROXY_TARGET?.trim() || "http://localhost:8000";

  // ✅ petit log (tu le verras dans docker logs seasky-frontend)
  console.log(`[vite] dev proxy target = ${proxyTarget}`);

  return {
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
       * ✅ DEV Proxy (LOCAL + DOCKER)
       * Le navigateur appelle:
       *   /api/v1/...
       * Et Vite proxy redirige vers Django (proxyTarget)
       */
      proxy: {
        // ✅ CHANGÉ: plus précis que "/api"
        "/api/v1": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },

        // ✅ optionnel mais utile si Django sert media/static
        "/media": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/static": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});

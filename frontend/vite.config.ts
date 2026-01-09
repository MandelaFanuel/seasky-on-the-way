// ========================= vite.config.ts =========================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(() => {
  const proxyTarget = process.env.VITE_DEV_PROXY_TARGET?.trim() || "http://localhost:8000";

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

      proxy: {
        "/api/v1": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },

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
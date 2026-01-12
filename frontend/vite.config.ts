// ========================= vite.config.ts =========================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  const proxyTarget = process.env.VITE_DEV_PROXY_TARGET?.trim() || "http://localhost:8000";

  console.log(`[vite] dev proxy target = ${proxyTarget}`);

  return {
    plugins: [
      react(),

      // ✅ PWA (installable + updates) sans casser l'existant
      VitePWA({
        registerType: "prompt",
        includeAssets: [
          "icons/icon-192.png",
          "icons/icon-512.png",
          "icons/maskable-192.png",
          "icons/maskable-512.png",
        ],
        manifest: {
          name: "SeaSky On The Way",
          short_name: "SeaSky",
          description: "SeaSky On The Way",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#E4F5FB",
          theme_color: "#0B568C",
          icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          navigateFallback: "/index.html",
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],

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

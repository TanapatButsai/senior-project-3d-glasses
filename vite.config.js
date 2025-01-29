import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Automatically update the service worker
      manifest: {
        name: "3D Glasses Try-On App",
        short_name: "3D Glasses",
        description: "A web app for trying on 3D glasses.",
        theme_color: "#1DB954",
        background_color: "#326a72",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // Options for Workbox
        globPatterns: ["**/*.{js,css,html,png,jpg,glb}"], // Cache important files
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|glb)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
});

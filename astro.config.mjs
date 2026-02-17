import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";
import AstroPWA from "@vite-pwa/astro";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

var __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: "static",
  site: "https://hackernew.dev",
  server: {
    port: 3000,
    host: true,
  },
  integrations: [
    vue(),
    sitemap(),
    AstroPWA({
      registerType: "autoUpdate",
      manifest: false, // Using public/manifest.json
      workbox: {
        navigateFallback: "/offline",
        navigateFallbackDenylist: [/^\/rss\.xml$/, /^\/sitemap/, /^\/item\//, /^\/user\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(js|css|woff2?)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/hacker-news\.firebaseio\.com\/v0\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "hn-api",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
              },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/hn\.algolia\.com\/api\/.*/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "algolia-search",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    ssr: {
      noExternal: ["ky"],
    },
    server: {
      allowedHosts: ["nixos", "localhost"],
    },
  },
});

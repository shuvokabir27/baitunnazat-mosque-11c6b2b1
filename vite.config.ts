// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
plugins: [
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ["**/*.{js,css,woff2,png,svg,ico}"],
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//, /^\/_serverFn\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // HTML নেভিগেশন — সবসময় আগে সার্ভার, ব্যর্থ হলে ক্যাশ
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" &&
              !url.pathname.startsWith("/~oauth") &&
              !url.pathname.startsWith("/api/") &&
              !url.pathname.startsWith("/_serverFn/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "html-pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // বিল্ড-করা হ্যাশযুক্ত অ্যাসেট — লোকাল থেকেই লোড
            urlPattern: ({ url, sameOrigin }) =>
              !!sameOrigin && /\/_build\/|\.(?:js|css|woff2|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // গুগল ফন্ট
            urlPattern: ({ url }) =>
              url.origin === "https://fonts.googleapis.com" ||
              url.origin === "https://fonts.gstatic.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts" },
          },
        ],
      },
    }),
  ],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

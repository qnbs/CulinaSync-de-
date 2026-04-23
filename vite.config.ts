import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath, URL } from 'url';
import pkg from './package.json';

const chunkGroups: Array<[string, string[]]> = [
  ['vendor-react', ['react', 'react-dom']],
  ['vendor-redux', ['@reduxjs/toolkit', 'react-redux', 'redux-persist']],
  ['vendor-dexie', ['dexie', 'dexie-react-hooks']],
  ['vendor-windowing', ['react-window']],
  ['vendor-i18n', ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend']],
  ['vendor-icons', ['lucide-react']],
  ['vendor-ai', ['@google/genai']],
  ['vendor-forms', ['react-hook-form', '@hookform/resolvers', 'zod', 'dompurify']],
  // Heavy/optional libs — excluded from SW precache via globIgnores, runtime-cached instead
  ['vendor-scanner', ['@ericblade/quagga2', 'tesseract.js']],
  ['vendor-tour', ['react-joyride']],
  ['vendor-faker', ['@faker-js/faker']],
  ['vendor-workbox', ['workbox-window', 'workbox-core', 'workbox-routing', 'workbox-strategies', 'workbox-precaching', 'workbox-expiration', 'workbox-cacheable-response']],
];

// GitHub Pages subpath: set automatically in CI via GITHUB_ACTIONS env
const REPO_NAME = 'CulinaSync-de-';
const base = process.env.GITHUB_ACTIONS ? `/${REPO_NAME}/` : '/';

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo-192x192.png', 'logo-512x512.png'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globIgnores: [
          '**/jspdf.es.min-*.js',
          '**/html2canvas.esm-*.js',
          '**/papaparse.min-*.js',
          '**/index.es-*.js',
          // Large vendor chunks excluded from precache — runtime-cached on first use
          '**/vendor-scanner-*.js',
          '**/vendor-tour-*.js',
          '**/vendor-faker-*.js',
          '**/vendor-workbox-*.js',
          '**/vendor-misc-*.js',
        ],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(jspdf\.es\.min-|html2canvas\.esm-|papaparse\.min-|index\.es-).+\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'export-libs-cache',
              expiration: {
                maxEntries: 12,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
          urlPattern: /\/assets\/(vendor-scanner-|vendor-tour-|vendor-faker-|vendor-workbox-|vendor-misc-).*\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'heavy-vendor-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'CulinaSync',
        short_name: 'CulinaSync',
        description: 'Dein kollaborativer kulinarischer Hub für den Haushalt. Offline. Privat. Nahtlos.',
        theme_color: '#18181b',
        background_color: '#18181b',
        start_url: base,
        display: 'standalone',
        scope: base,
        icons: [
          {
            src: 'logo-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Vorratskammer',
            short_name: 'Vorrat',
            description: 'Öffnet die Vorratskammer',
            url: `${base}?page=pantry`,
            icons: [{ src: 'logo-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Einkaufsliste',
            short_name: 'Liste',
            description: 'Öffnet die Einkaufsliste',
            url: `${base}?page=shopping-list`,
            icons: [{ src: 'logo-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'KI-Chef',
            short_name: 'KI-Chef',
            description: 'Generiert ein neues Rezept',
            url: `${base}?page=chef`,
            icons: [{ src: 'logo-192x192.png', sizes: '192x192' }]
          }
        ]
      },
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    ...(process.env.ANALYZE === 'true'
      ? [visualizer({
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
          open: false,
        })]
      : []),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    reportCompressedSize: true,
    modulePreload: {
      // Prevent heavy optional chunks from being preloaded on every page load.
      // They are loaded on demand via dynamic import() and cached by the SW.
      resolveDependencies: (_filename, deps) => {
        const deferredChunks = ['vendor-faker', 'vendor-scanner', 'vendor-tour', 'vendor-workbox', 'vendor-misc'];
        return deps.filter(dep => !deferredChunks.some(chunk => dep.includes(`/${chunk}-`)));
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          for (const [chunkName, packages] of chunkGroups) {
            if (packages.some((pkg) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`))) {
              return chunkName;
            }
          }

          return 'vendor-misc';
        },
      },
    },
    sourcemap: false,
    target: 'es2020',
  },
});
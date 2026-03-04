import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import reactCompiler from 'react/compiler';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'url';

// GitHub Pages subpath: set automatically in CI via GITHUB_ACTIONS env
const REPO_NAME = 'CulinaSync-de-';
const base = process.env.GITHUB_ACTIONS ? `/${REPO_NAME}/` : '/';

export default defineConfig({
  base,
  plugins: [
    react({
      compiler: reactCompiler,
    }),
    VitePWA({
      injectRegister: false,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo-192x192.png', 'logo-512x512.png'],
      workbox: {
        globIgnores: [
          '**/jspdf.es.min-*.js',
          '**/html2canvas.esm-*.js',
          '**/papaparse.min-*.js',
          '**/index.es-*.js',
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
  ],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'vendor-dexie': ['dexie', 'dexie-react-hooks'],
        },
      },
    },
    sourcemap: false,
    target: 'es2020',
  },
});
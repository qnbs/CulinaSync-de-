import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath, URL } from 'url';
import pkg from './package.json';
import { buildPwaManifest } from './src/config/buildPwaManifest';

const chunkGroups: Array<[string, string[]]> = [
  ['vendor-react', ['react', 'react-dom']],
  ['vendor-redux', ['@reduxjs/toolkit', 'react-redux', 'redux-persist']],
  ['vendor-zustand', ['zustand']],
  ['vendor-dexie', ['dexie', 'dexie-react-hooks']],
  ['vendor-windowing', ['react-window']],
  ['vendor-i18n', ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend']],
  ['vendor-icons', ['lucide-react']],
  ['vendor-ai', ['@google/genai', '@domain/ai-core']],
  ['vendor-webllm', ['@mlc-ai/web-llm']],
  ['vendor-forms', ['react-hook-form', '@hookform/resolvers', 'zod', 'dompurify']],
  // Heavy/optional libs — excluded from SW precache via globIgnores, runtime-cached instead
  ['vendor-scanner', ['@ericblade/quagga2', 'tesseract.js']],
  ['vendor-tour', ['react-joyride']],
  ['vendor-faker', ['@faker-js/faker']],
  ['vendor-workbox', ['workbox-window', 'workbox-core', 'workbox-routing', 'workbox-strategies', 'workbox-precaching', 'workbox-expiration', 'workbox-cacheable-response']],
  // QNBS-v3: Export-/PDF-Pfad aus vendor-misc lösen (M9.3) — Lazy-Importe bleiben on-demand
  ['vendor-export', ['jspdf', 'html2canvas', 'papaparse']],
];

// GitHub Pages subpath: set automatically in CI via GITHUB_ACTIONS env
const REPO_NAME = 'CulinaSync-de-';
const base = process.env.GITHUB_ACTIONS ? `/${REPO_NAME}/` : '/';
const pwaIndexPath = `${base}index.html`.replace(/\/{2,}/g, '/');

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __PWA_INDEX_PATH__: JSON.stringify(pwaIndexPath),
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false,
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        globIgnores: [
          '**/jspdf.es.min-*.js',
          '**/html2canvas.esm-*.js',
          '**/papaparse.min-*.js',
          '**/index.es-*.js',
          '**/vendor-scanner-*.js',
          '**/vendor-tour-*.js',
          '**/vendor-faker-*.js',
          '**/vendor-workbox-*.js',
          '**/vendor-export-*.js',
          '**/vendor-misc-*.js',
          '**/vendor-webllm-*.js',
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo-192x192.png', 'logo-512x512.png'],
      manifest: buildPwaManifest({ base }),
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
        const deferredChunks = [
          'vendor-faker',
          'vendor-scanner',
          'vendor-tour',
          'vendor-workbox',
          'vendor-export',
          'vendor-zustand',
          'vendor-misc',
          'vendor-webllm',
        ];
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
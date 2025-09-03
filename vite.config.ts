

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
// FIX: __dirname is not available in ES modules. Use import.meta.url instead.
import { fileURLToPath } from 'url';

export default defineConfig({
  define: {
    // FIX: Define process.env.API_KEY to make it available in client-side code, as required by Gemini service.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'CulinaSync',
        short_name: 'CulinaSync',
        description: 'Dein kollaborativer kulinarischer Hub für den Haushalt. Offline. Privat. Nahtlos.',
        // FIX: Corrected invalid hex color value.
        theme_color: '#18181b',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
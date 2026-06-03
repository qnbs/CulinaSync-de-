#!/usr/bin/env node
/**
 * Prüft das Vite-dist-Artefakt vor GitHub Pages Upload.
 * Aufruf: node scripts/verify-pages-artifact.mjs [distDir]
 */
import { access } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = process.argv[2] ?? join(process.cwd(), 'apps/web/dist');

const required = ['index.html', '404.html', 'logo-192x192.png', 'manifest.webmanifest'];
const recommended = ['sw.js', 'manifest.webmanifest'];

const exists = async (file) => {
  try {
    await access(join(distDir, file));
    return true;
  } catch {
    return false;
  }
};

let failed = false;
for (const file of required) {
  if (!(await exists(file))) {
    console.error(`[pages-artifact] FEHLT (Pflicht): ${file}`);
    failed = true;
  } else {
    console.log(`[pages-artifact] OK: ${file}`);
  }
}

for (const file of recommended) {
  if (await exists(file)) {
    console.log(`[pages-artifact] OK: ${file}`);
  } else {
    console.warn(`[pages-artifact] Hinweis: ${file} fehlt (PWA evtl. eingeschränkt)`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`[pages-artifact] dist gültig: ${distDir}`);

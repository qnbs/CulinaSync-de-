#!/usr/bin/env node
/**
 * Generates src-tauri/icons from apps/web/public/logo-512x512.png (sharp).
 * Run: node scripts/generate-tauri-icons.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'apps/web/public/logo-512x512.png');
const outDir = path.join(root, 'src-tauri/icons');

const sizes = [
  ['32x32.png', 32],
  ['128x128.png', 128],
  ['128x128@2x.png', 256],
  ['icon.png', 512],
];

await fs.mkdir(outDir, { recursive: true });
for (const [name, size] of sizes) {
  await sharp(src).resize(size, size).png().toFile(path.join(outDir, name));
}
// Placeholder: Tauri bundle step can derive platform icons from icon.png on release builds
await fs.copyFile(path.join(outDir, 'icon.png'), path.join(outDir, 'icon.ico'));
await fs.copyFile(path.join(outDir, 'icon.png'), path.join(outDir, 'icon.icns'));

console.log(`[tauri-icons] Wrote ${sizes.length + 2} files to ${outDir}`);

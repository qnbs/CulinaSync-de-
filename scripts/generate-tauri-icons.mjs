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

/** Builds a multi-size ICO with embedded PNG payloads (Vista+ / RC.EXE compatible). */
const encodeIcoFromPngs = (images) => {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  const payloads = [];
  let offset = 6 + count * 16;

  for (const { size, png } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    payloads.push(png);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...payloads]);
};

await fs.mkdir(outDir, { recursive: true });
for (const [name, size] of sizes) {
  await sharp(src).resize(size, size).png().toFile(path.join(outDir, name));
}

// QNBS-v3: Windows RC.EXE needs real ICO container — PNG rename fails with RC2175
const icoSizes = [16, 24, 32, 48, 64, 128, 256];
const icoImages = await Promise.all(
  icoSizes.map(async (size) => ({
    size,
    png: await sharp(src).resize(size, size).png().toBuffer(),
  })),
);
await fs.writeFile(path.join(outDir, 'icon.ico'), encodeIcoFromPngs(icoImages));

// macOS bundles accept PNG-derived placeholder; release CI uses icon.png as primary source
await fs.copyFile(path.join(outDir, 'icon.png'), path.join(outDir, 'icon.icns'));

console.log(`[tauri-icons] Wrote ${sizes.length + 2} files to ${outDir}`);

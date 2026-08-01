#!/usr/bin/env node
/**
 * CI drift check: package.json, web, Tauri Cargo + tauri.conf.json must agree.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const sources = [];
const rootPkg = readJson(join(root, 'package.json'));
sources.push({ label: 'root package.json', version: rootPkg.version });

const webPkgPath = join(root, 'apps/web/package.json');
if (existsSync(webPkgPath)) {
  const webPkg = readJson(webPkgPath);
  sources.push({ label: 'apps/web/package.json', version: webPkg.version });
}

const cargoPath = join(root, 'src-tauri/Cargo.toml');
if (existsSync(cargoPath)) {
  const cargo = readFileSync(cargoPath, 'utf8');
  const match = cargo.match(/^version\s*=\s*"([^"]+)"/m);
  if (match) {
    sources.push({ label: 'src-tauri/Cargo.toml', version: match[1] });
  }
}

const tauriConfPath = join(root, 'src-tauri/tauri.conf.json');
if (existsSync(tauriConfPath)) {
  const tauriConf = readJson(tauriConfPath);
  if (tauriConf.version) {
    sources.push({ label: 'src-tauri/tauri.conf.json', version: tauriConf.version });
  }
}

const versions = new Set(sources.map((s) => s.version));
if (versions.size > 1) {
  console.error('Version drift detected:\n');
  for (const s of sources) {
    console.error(`  ${s.label}: ${s.version}`);
  }
  process.exit(1);
}

console.log(`Version consistent: ${sources[0]?.version} (${sources.map((s) => s.label).join(', ')})`);

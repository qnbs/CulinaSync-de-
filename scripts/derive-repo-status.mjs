#!/usr/bin/env node
/**
 * Derive canonical repo facts from source (version, coverage thresholds, test file count).
 * Usage: node scripts/derive-repo-status.mjs [--write]
 */
import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function walkTestFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue;
      walkTestFiles(path, acc);
    } else if (/\.test\.(ts|tsx)$/.test(name)) {
      acc.push(path);
    }
  }
  return acc;
}

function parseVitestThresholds() {
  const src = readFileSync(join(root, 'apps/web/vitest.config.ts'), 'utf8');
  const block = src.match(/thresholds:\s*\{([^}]+)\}/s);
  if (!block) return {};
  const thresholds = {};
  for (const m of block[1].matchAll(/(\w+):\s*(\d+)/g)) {
    thresholds[m[1]] = Number(m[2]);
  }
  return thresholds;
}

const version = readJson(join(root, 'package.json')).version;
const testFiles = walkTestFiles(join(root, 'apps/web/src'));
const coverageThresholds = parseVitestThresholds();

const status = {
  version,
  generatedAtUtc: new Date().toISOString(),
  sourceSha: process.env.GITHUB_SHA || null,
  vitest: {
    testFileCount: testFiles.length,
    coverageThresholds,
  },
  validationCommands: [
    'pnpm run verify:release',
    'pnpm run check:version-drift',
    'pnpm run check:all',
  ],
};

const json = `${JSON.stringify(status, null, 2)}\n`;

if (write) {
  const outPath = process.env.REPO_STATUS_OUTPUT || join(root, 'docs/generated/repo-status.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, json);
  console.log(`Written ${outPath}`);
} else {
  process.stdout.write(json);
}

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { scanContent, shouldScanFile } from './lib/i18n-scan-shared.mjs';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'apps', 'web', 'src');
const BASELINE_FILE = join(ROOT, 'scripts', 'i18n-hardcoded-baseline.json');

const walk = (dir, collector) => {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    if (statSync(filePath).isDirectory()) {
      walk(filePath, collector);
      continue;
    }
    collector.push(filePath);
  }
};

/** @type {string[]} */
const files = [];
walk(SRC_DIR, files);

let count = 0;
for (const file of files) {
  const relative = file.replace(`${ROOT}/`, '').replaceAll('\\', '/');
  if (!shouldScanFile(relative, { includeTests: false })) continue;
  count += scanContent(readFileSync(file, 'utf8'), relative).length;
}

const baseline = {
  version: 1,
  productionMax: count,
  description:
    'Max hardcoded German UI candidates in apps/web/src (excluding __tests__ and locales). Lower after i18n cleanups via pnpm run i18n:baseline:update.',
};

writeFileSync(BASELINE_FILE, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
console.log(`[i18n-baseline] Updated productionMax to ${count} in scripts/i18n-hardcoded-baseline.json`);

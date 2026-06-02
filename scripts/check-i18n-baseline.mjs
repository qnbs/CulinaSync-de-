import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  scanContent,
  shouldScanFile,
} from './lib/i18n-scan-shared.mjs';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'apps', 'web', 'src');
const BASELINE_FILE = join(ROOT, 'scripts', 'i18n-hardcoded-baseline.json');

const walk = (dir, collector) => {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, collector);
      continue;
    }
    collector.push(filePath);
  }
};

/** @type {string[]} */
const files = [];
walk(SRC_DIR, files);

/** @type {import('./lib/i18n-scan-shared.mjs').I18nFinding[]} */
const findings = [];

for (const file of files) {
  const relative = file.replace(`${ROOT}/`, '').replaceAll('\\', '/');
  if (!shouldScanFile(relative, { includeTests: false })) continue;

  const content = readFileSync(file, 'utf8');
  findings.push(...scanContent(content, relative));
}

const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
const maxAllowed = baseline.productionMax;

if (findings.length <= maxAllowed) {
  console.log(
    `[i18n-baseline] OK: ${findings.length} production finding(s) (max ${maxAllowed}).`,
  );
  process.exit(0);
}

console.error(
  `[i18n-baseline] Regression: ${findings.length} production finding(s), baseline allows ${maxAllowed}.`,
);
console.error('[i18n-baseline] Fix hardcoded strings or run pnpm run i18n:baseline:update after intentional cleanup.');
for (const finding of findings.slice(0, 25)) {
  console.error(`- ${finding.file}:${finding.line} -> "${finding.text}"`);
}
if (findings.length > 25) {
  console.error(`- ... and ${findings.length - 25} more (pnpm run i18n:scan for full report)`);
}
process.exit(1);

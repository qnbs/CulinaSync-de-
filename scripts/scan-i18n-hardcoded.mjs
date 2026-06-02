import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { formatFinding, scanContent, shouldScanFile } from './lib/i18n-scan-shared.mjs';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'apps', 'web', 'src');
const REPORT_DIR = join(ROOT, 'reports');
const REPORT_FILE = join(REPORT_DIR, 'i18n-hardcoded-report.md');

const includeTests = process.argv.includes('--include-tests');

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

/** @type {import('./lib/i18n-scan-shared.mjs').I18nFinding[]} */
const findings = [];

for (const file of files) {
  const relative = file.replace(`${ROOT}/`, '').replaceAll('\\', '/');
  if (!shouldScanFile(relative, { includeTests })) continue;

  findings.push(...scanContent(readFileSync(file, 'utf8'), relative));
}

mkdirSync(REPORT_DIR, { recursive: true });

const reportLines = [
  '# i18n Hardcoded String Scan',
  '',
  `- Scanned scope: apps/web/src${includeTests ? ' (incl. __tests__)' : ' (production only)'}`,
  `- Scanned files: ${files.filter((f) => shouldScanFile(f.replace(`${ROOT}/`, '').replaceAll('\\', '/'), { includeTests })).length}`,
  `- Potential hardcoded strings: ${findings.length}`,
  '',
  '## Findings',
  '',
];

if (findings.length === 0) {
  reportLines.push('No potential hardcoded German UI strings found.');
} else {
  for (const finding of findings) {
    reportLines.push(`- \`${finding.file}:${finding.line}\` -> \`${finding.text}\``);
  }
}

writeFileSync(REPORT_FILE, `${reportLines.join('\n')}\n`, 'utf8');

console.log(`[i18n-scan] Report written to ${REPORT_FILE}`);
console.log(`[i18n-scan] Potential findings: ${findings.length}`);

import { execSync } from 'node:child_process';
import { formatFinding, scanLine, shouldScanFile } from './lib/i18n-scan-shared.mjs';

const baseRef = process.argv[2] || 'HEAD~1';
const diffRange = `${baseRef}...HEAD`;

/** @param {string} rawDiff} */
const parseDiff = (rawDiff) => {
  /** @type {import('./lib/i18n-scan-shared.mjs').I18nFinding[]} */
  const findings = [];
  let currentFile = '';
  let currentLine = 0;

  const lines = rawDiff.split('\n');
  for (const line of lines) {
    if (line.startsWith('+++ b/')) {
      currentFile = line.replace('+++ b/', '').trim();
      continue;
    }

    if (line.startsWith('@@')) {
      const match = line.match(/\+([0-9]+)/);
      if (match) {
        currentLine = Number(match[1]) - 1;
      }
      continue;
    }

    if (!currentFile || currentFile === '/dev/null') continue;
    if (!shouldScanFile(currentFile, { includeTests: false })) continue;

    if (line.startsWith('+') && !line.startsWith('+++')) {
      currentLine += 1;
      const codeLine = line.slice(1);
      findings.push(...scanLine(codeLine, currentLine, currentFile));
      continue;
    }

    if (!line.startsWith('-')) {
      currentLine += 1;
    }
  }

  return findings;
};

let rawDiff = '';
try {
  rawDiff = execSync(
    `git diff --unified=0 --diff-filter=AM -- ${diffRange} -- '*.ts' '*.tsx'`,
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
} catch (error) {
  const stderr = error?.stderr?.toString?.() || '';
  console.error(`[i18n-check] Failed to compute git diff for range ${diffRange}.`);
  if (stderr) console.error(stderr.trim());
  process.exit(2);
}

const findings = parseDiff(rawDiff);

if (findings.length === 0) {
  console.log('[i18n-check] OK: no new potential hardcoded German strings in added TS/TSX lines.');
  process.exit(0);
}

console.error(`[i18n-check] Found ${findings.length} potential hardcoded German string(s) in added lines:`);
for (const finding of findings) {
  console.error(formatFinding(finding));
}

console.error('[i18n-check] Please move new UI strings to i18n translation keys (de + en).');
process.exit(1);

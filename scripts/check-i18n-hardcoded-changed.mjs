import { execSync } from 'node:child_process';

const baseRef = process.argv[2] || 'HEAD~1';
const diffRange = `${baseRef}...HEAD`;

const germanHints = [
  'Bitte', 'Einstellungen', 'Speichern', 'Abbrechen', 'Fehler', 'Erfolgreich',
  'Hinzufuegen', 'Loeschen', 'Vorrat', 'Einkauf', 'Rezept', 'Schluessel', 'Sprache',
];

const stringLiteralRegex = /(["'`])((?:\\.|(?!\1)[^\\]){3,})\1/g;

const hasGermanHint = (value) => {
  if (/[aeiou]?[aeiou]?[aeiou]?\b/.test(value) === false) return false;
  if (/[äöüÄÖÜß]/.test(value)) return true;
  return germanHints.some((hint) => value.includes(hint));
};

const ignoreLiteral = (value) => {
  if (value.startsWith('http')) return true;
  if (value.includes('className')) return true;
  if (value.includes('--')) return true;
  if (value.length < 5) return true;
  return false;
};

const parseDiff = (rawDiff) => {
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

    if (line.startsWith('+') && !line.startsWith('+++')) {
      currentLine += 1;
      const codeLine = line.slice(1);

      if (codeLine.includes('t(') || codeLine.includes('useTranslation(')) continue;

      for (const match of codeLine.matchAll(stringLiteralRegex)) {
        const literal = match[2].trim();
        if (ignoreLiteral(literal)) continue;
        if (!hasGermanHint(literal)) continue;

        findings.push({
          file: currentFile,
          line: currentLine,
          text: literal.slice(0, 120),
        });
      }
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
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
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
  console.error(`- ${finding.file}:${finding.line} -> "${finding.text}"`);
}

console.error('[i18n-check] Please move new UI strings to i18n translation keys.');
process.exit(1);

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');
const REPORT_DIR = join(ROOT, 'reports');
const REPORT_FILE = join(REPORT_DIR, 'i18n-hardcoded-report.md');

const FILE_EXTENSIONS = new Set(['.ts', '.tsx']);
const EXCLUDE_PATH_PARTS = new Set(['/locales/', '/data/recipes/']);

const germanHints = [
  'Bitte', 'Einstellungen', 'Speichern', 'Abbrechen', 'Fehler', 'Erfolgreich',
  'Hinzufuegen', 'Loeschen', 'Vorrat', 'Einkauf', 'Rezept', 'Schluessel', 'Sprache',
];

const stringLiteralRegex = /(["'`])((?:\\.|(?!\1)[^\\]){3,})\1/g;

const files = [];
const findings = [];

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
      continue;
    }

    const ext = filePath.slice(filePath.lastIndexOf('.'));
    if (!FILE_EXTENSIONS.has(ext)) continue;

    const normalized = filePath.replaceAll('\\\\', '/');
    if ([...EXCLUDE_PATH_PARTS].some((part) => normalized.includes(part))) continue;

    files.push(filePath);
  }
};

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

walk(SRC_DIR);

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.includes('t(') || line.includes('useTranslation(')) return;

    for (const match of line.matchAll(stringLiteralRegex)) {
      const literal = match[2].trim();
      if (ignoreLiteral(literal)) continue;
      if (!hasGermanHint(literal)) continue;

      findings.push({
        file: file.replace(`${ROOT}/`, ''),
        line: index + 1,
        text: literal.slice(0, 120),
      });
    }
  });
}

mkdirSync(REPORT_DIR, { recursive: true });

const reportLines = [
  '# i18n Hardcoded String Scan',
  '',
  `- Scanned files: ${files.length}`,
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

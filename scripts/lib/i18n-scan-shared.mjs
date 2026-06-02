/** @typedef {{ file: string, line: number, text: string }} I18nFinding */

export const GERMAN_HINTS = [
  'Bitte',
  'Einstellungen',
  'Speichern',
  'Abbrechen',
  'Fehler',
  'Erfolgreich',
  'Hinzufuegen',
  'Loeschen',
  'Vorrat',
  'Einkauf',
  'Rezept',
  'Schluessel',
  'Sprache',
  'Frühstück',
  'Mittagessen',
  'Abendessen',
];

export const EXCLUDE_PATH_PARTS = ['/locales/', '/data/recipes/'];

/** Stored meal-slot IDs (German) — not UI copy */
export const MEAL_TYPE_IDS = new Set(['Frühstück', 'Mittagessen', 'Abendessen']);

const NON_UI_SOURCE_SUFFIXES = ['/voiceCommands.ts', '/dbMigrations.ts', '/usdaLocal.ts'];

const STRING_LITERAL_REGEX = /(["'`])((?:\\.|(?!\1)[^\\]){3,})\1/g;

const I18N_CALL_MARKERS = ['t(', 'useTranslation(', 'i18next.t('];

const ATTR_PATTERNS = [
  /\baria-label\s*=\s*(["'`])/,
  /\btitle\s*=\s*(["'`])/,
  /\bplaceholder\s*=\s*(["'`])/,
];

/**
 * @param {string} value
 */
export const hasGermanHint = (value) => {
  if (/[äöüÄÖÜß]/.test(value)) return true;
  return GERMAN_HINTS.some((hint) => value.includes(hint));
};

/**
 * @param {string} value
 */
export const ignoreLiteral = (value) => {
  if (MEAL_TYPE_IDS.has(value)) return true;
  if (value.startsWith('http')) return true;
  if (value.includes('className')) return true;
  if (value.includes('--')) return true;
  if (value.length < 5) return true;
  if (/^[a-z0-9_-]+$/i.test(value) && !/[äöüÄÖÜß]/.test(value)) return true;
  return false;
};

/**
 * @param {string} line
 */
export const lineUsesI18n = (line) => I18N_CALL_MARKERS.some((marker) => line.includes(marker));

/**
 * @param {string} filePath
 * @param {{ includeTests?: boolean }} [options]
 */
export const shouldScanFile = (filePath, options = {}) => {
  const normalized = filePath.replaceAll('\\', '/');
  if (!normalized.endsWith('.ts') && !normalized.endsWith('.tsx')) return false;
  if (EXCLUDE_PATH_PARTS.some((part) => normalized.includes(part))) return false;
  if (NON_UI_SOURCE_SUFFIXES.some((suffix) => normalized.endsWith(suffix))) return false;
  if (!options.includeTests && normalized.includes('/__tests__/')) return false;
  return true;
};

/** @param {string} line */
export const lineIsCodeOnly = (line) =>
  /\.replace\s*\(/.test(line) || /\/.*\/[gimsuy]*/.test(line);

/**
 * @param {string} line
 * @param {number} lineNumber
 * @param {string} file
 * @returns {I18nFinding[]}
 */
export const scanLine = (line, lineNumber, file) => {
  if (lineIsCodeOnly(line)) return [];
  if (lineUsesI18n(line)) return [];

  /** @type {I18nFinding[]} */
  const findings = [];

  for (const match of line.matchAll(STRING_LITERAL_REGEX)) {
    const literal = match[2].trim();
    if (ignoreLiteral(literal)) continue;
    if (!hasGermanHint(literal)) continue;

    findings.push({
      file,
      line: lineNumber,
      text: literal.slice(0, 120),
    });
  }

  const hasGermanAttr = ATTR_PATTERNS.some((pattern) => pattern.test(line));
  if (hasGermanAttr && !lineUsesI18n(line)) {
    for (const match of line.matchAll(STRING_LITERAL_REGEX)) {
      const literal = match[2].trim();
      if (ignoreLiteral(literal)) continue;
      if (!hasGermanHint(literal)) continue;
      const already = findings.some((f) => f.line === lineNumber && f.text === literal.slice(0, 120));
      if (!already) {
        findings.push({
          file,
          line: lineNumber,
          text: literal.slice(0, 120),
        });
      }
    }
  }

  return findings;
};

/**
 * @param {string} content
 * @param {string} file
 * @returns {I18nFinding[]}
 */
export const scanContent = (content, file) => {
  const lines = content.split('\n');
  /** @type {I18nFinding[]} */
  const findings = [];

  lines.forEach((line, index) => {
    findings.push(...scanLine(line, index + 1, file));
  });

  return findings;
};

/**
 * @param {I18nFinding[]} findings
 */
export const formatFinding = (finding) =>
  `- ${finding.file}:${finding.line} -> "${finding.text}"`;

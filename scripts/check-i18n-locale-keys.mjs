import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const LOCALES_DIR = join(ROOT, 'apps', 'web', 'src', 'locales');
const LOCALE_FILES = ['core.json', 'settings.json', 'features.json'];

/**
 * @param {unknown} value
 * @param {string} prefix
 * @returns {string[]}
 */
const flattenKeys = (value, prefix = '') => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  /** @type {string[]} */
  const keys = [];
  for (const [key, nested] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    keys.push(...flattenKeys(nested, path));
  }
  return keys;
};

/**
 * @param {string} lang
 * @param {string} fileName
 */
const loadLocaleKeys = (lang, fileName) => {
  const filePath = join(LOCALES_DIR, lang, fileName);
  const raw = readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  return flattenKeys(json).sort();
};

/** @type {string[]} */
const errors = [];

for (const fileName of LOCALE_FILES) {
  const deKeys = loadLocaleKeys('de', fileName);
  const enKeys = loadLocaleKeys('en', fileName);

  const deSet = new Set(deKeys);
  const enSet = new Set(enKeys);

  const onlyDe = deKeys.filter((key) => !enSet.has(key));
  const onlyEn = enKeys.filter((key) => !deSet.has(key));

  if (onlyDe.length > 0 || onlyEn.length > 0) {
    errors.push(`\n[${fileName}]`);
    for (const key of onlyDe) {
      errors.push(`  missing in en: ${key}`);
    }
    for (const key of onlyEn) {
      errors.push(`  missing in de: ${key}`);
    }
  }
}

if (errors.length === 0) {
  console.log('[i18n-keys] OK: de/en key parity for core, settings, features.');
  process.exit(0);
}

console.error('[i18n-keys] Locale key mismatch between de and en:');
console.error(errors.join('\n'));
console.error('[i18n-keys] Add missing keys to both apps/web/src/locales/de/ and en/.');
process.exit(1);

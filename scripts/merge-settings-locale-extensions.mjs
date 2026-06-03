import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extensions = JSON.parse(
  readFileSync(path.join(root, 'scripts/settings-locale-extensions.json'), 'utf8'),
);

const deepMerge = (target, source) => {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] = deepMerge(target[key] && typeof target[key] === 'object' ? { ...target[key] } : {}, value);
    } else {
      target[key] = value;
    }
  }
  return target;
};

for (const lang of ['de', 'en']) {
  const filePath = path.join(root, 'apps/web/src/locales', lang, 'settings.json');
  const doc = JSON.parse(readFileSync(filePath, 'utf8'));
  doc.settings = deepMerge(doc.settings, extensions[lang]);
  writeFileSync(filePath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
  console.log(`[merge-settings-locale] updated ${lang}/settings.json`);
}

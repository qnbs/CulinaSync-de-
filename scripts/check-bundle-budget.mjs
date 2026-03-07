import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const budgetPath = path.join(rootDir, 'budget.json');
const repoDirName = path.basename(rootDir);

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif']);

const toKilobytes = (bytes) => bytes / 1024;

const normalizeAssetReference = (rawReference) => {
  if (!rawReference || rawReference.startsWith('data:') || rawReference.startsWith('http://') || rawReference.startsWith('https://') || rawReference.startsWith('#')) {
    return null;
  }

  const [withoutHash] = rawReference.split('#');
  const [cleanReference] = withoutHash.split('?');
  const trimmed = cleanReference.replace(/^\.\//, '').replace(/^\//, '');

  if (trimmed.startsWith(`${repoDirName}/`)) {
    return trimmed.slice(repoDirName.length + 1);
  }

  return trimmed;
};

const collectInitialAssets = async () => {
  const indexHtmlPath = path.join(distDir, 'index.html');
  const html = await fs.readFile(indexHtmlPath, 'utf8');
  const assetPaths = new Set([indexHtmlPath]);
  const matches = html.matchAll(/(?:src|href)="([^"]+)"/g);

  for (const match of matches) {
    const normalizedReference = normalizeAssetReference(match[1]);
    if (!normalizedReference) {
      continue;
    }

    assetPaths.add(path.join(distDir, normalizedReference));
  }

  return Array.from(assetPaths);
};

const resolveTransferAsset = async (filePath) => {
  const preferredFiles = [
    `${filePath}.br`,
    `${filePath}.gz`,
    filePath,
  ];

  for (const candidate of preferredFiles) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return filePath;
};

const sumByType = async (files) => {
  const totals = {
    total: 0,
    script: 0,
    style: 0,
    image: 0,
  };

  for (const filePath of files) {
    const transferFile = await resolveTransferAsset(filePath);
    let stats;
    try {
      stats = await fs.stat(transferFile);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        continue;
      }

      throw error;
    }
    const ext = path.extname(filePath).toLowerCase();
    const size = toKilobytes(stats.size);

    totals.total += size;
    if (ext === '.js') totals.script += size;
    if (ext === '.css') totals.style += size;
    if (imageExtensions.has(ext)) totals.image += size;
  }

  return totals;
};

const main = async () => {
  const budgetConfig = JSON.parse(await fs.readFile(budgetPath, 'utf8'));
  const files = await collectInitialAssets();
  const totals = await sumByType(files);
  const failures = [];

  for (const budget of budgetConfig.resourceSizes ?? []) {
    const actual = totals[budget.resourceType] ?? 0;
    if (actual > budget.budget) {
      failures.push(`${budget.resourceType}: ${actual.toFixed(2)} KB > ${budget.budget} KB`);
    }
  }

  if (failures.length > 0) {
    console.error('Bundle-Budget ueberschritten:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log('Bundle-Budget eingehalten.');
  Object.entries(totals).forEach(([key, value]) => {
    console.log(`${key}: ${value.toFixed(2)} KB`);
  });
};

main().catch((error) => {
  console.error('Bundle-Budget-Pruefung fehlgeschlagen:', error);
  process.exit(1);
});
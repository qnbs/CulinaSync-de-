import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const supportedExtensions = new Set(['.png', '.jpg', '.jpeg']);

const walk = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const nextPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return walk(nextPath);
    }

    return [nextPath];
  }));

  return files.flat();
};

const main = async () => {
  const sourceFiles = (await walk(publicDir)).filter((filePath) => supportedExtensions.has(path.extname(filePath).toLowerCase()));
  if (sourceFiles.length === 0) {
    console.log('Keine PNG/JPG-Assets fuer WebP-Konvertierung gefunden.');
    return;
  }

  await Promise.all(sourceFiles.map(async (sourcePath) => {
    const targetPath = sourcePath.replace(/\.(png|jpe?g)$/i, '.webp');
    await sharp(sourcePath).webp({ quality: 82, effort: 6 }).toFile(targetPath);
    console.log(`WebP erstellt: ${path.relative(rootDir, targetPath)}`);
  }));
};

main().catch((error) => {
  console.error('WebP-Generierung fehlgeschlagen:', error);
  process.exit(1);
});
#!/usr/bin/env node
/**
 * Generate release-evidence/<version>/evidence.json + README.md from repo state.
 * Usage: node scripts/generate-release-evidence.mjs [--version X.Y.Z] [--sha COMMIT]
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function gitSha() {
  const envSha = process.env.GITHUB_SHA || process.env.RELEASE_EVIDENCE_SHA;
  if (envSha) return envSha;
  try {
    return execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function sha256File(path) {
  if (!existsSync(path)) return null;
  const data = readFileSync(path);
  return createHash('sha256').update(data).digest('hex');
}

function parseVitestThresholds() {
  const path = join(root, 'apps/web/vitest.config.ts');
  if (!existsSync(path)) return null;
  const src = readFileSync(path, 'utf8');
  const block = src.match(/thresholds:\s*\{([^}]+)\}/s);
  if (!block) return null;
  const thresholds = {};
  for (const m of block[1].matchAll(/(\w+):\s*(\d+)/g)) {
    thresholds[m[1]] = Number(m[2]);
  }
  return thresholds;
}

const args = process.argv.slice(2);
let version = readJson(join(root, 'package.json')).version;
let sha = gitSha();

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--version' && args[i + 1]) version = args[++i];
  if (args[i] === '--sha' && args[i + 1]) sha = args[++i];
}

const evidence = {
  version,
  sourceSha: sha,
  generatedAtUtc: new Date().toISOString(),
  nodeEngine: readJson(join(root, 'package.json')).engines?.node,
  packageManager: readJson(join(root, 'package.json')).packageManager,
  coverageThresholds: parseVitestThresholds(),
  artifactHashes: {
    sbomCycloneDxSha256: sha256File(join(root, 'sbom.cdx.json')),
    lcovSha256: sha256File(join(root, 'apps/web/coverage/lcov.info')),
  },
  validationCommands: [
    'pnpm run verify:release',
    'pnpm run check:version-drift',
    'pnpm run check:all',
  ],
  knownLimitations: [
    'Workers excluded from aggregate coverage gate',
    'cargo audit optional in verify:release when tooling missing',
    'E2E smoke Chromium-only in default CI',
  ],
};

const outDir = join(root, 'release-evidence', version);
mkdirSync(outDir, { recursive: true });

const jsonPath = join(outDir, 'evidence.json');
writeFileSync(jsonPath, `${JSON.stringify(evidence, null, 2)}\n`);

const readme = `# Release evidence — ${version}

- **Source SHA:** \`${sha}\`
- **Generated:** ${evidence.generatedAtUtc}
- **Canonical validation:** \`pnpm run verify:release\`

See \`evidence.json\` for thresholds and command list.
`;

writeFileSync(join(outDir, 'README.md'), readme);
console.log(`Written ${jsonPath}`);

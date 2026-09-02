#!/usr/bin/env node
/**
 * Generate CycloneDX SBOMs (pnpm + optional Rust/Tauri).
 * Pins match .github/workflows/validate.yml (@cyclonedx/cdxgen@11.4.4).
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CDXGEN = '@cyclonedx/cdxgen@11.4.4';

function run(label, args) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync('pnpm', ['dlx', '-y', CDXGEN, ...args], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) {
    console.error(`\n✗ SBOM generation failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

run('SBOM (pnpm)', ['-o', 'sbom.cdx.json', '-t', 'pnpm', '--spec-version', '1.6']);

const cargoLock = join(root, 'src-tauri/Cargo.lock');
if (existsSync(cargoLock)) {
  run('SBOM (rust)', ['-o', 'sbom-rust.cdx.json', '-t', 'rust', '--spec-version', '1.6']);
} else {
  console.log('\n○ Skipping Rust SBOM (no src-tauri/Cargo.lock)');
}

console.log('\n✓ SBOM generation completed');

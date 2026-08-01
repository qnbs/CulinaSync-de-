#!/usr/bin/env node
/**
 * Canonical release verification — coverage gates, npm audit, optional Rust advisory scan.
 * Usage: node scripts/verify-release.mjs [--skip-cargo]
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skipCargo = process.argv.includes('--skip-cargo');

const steps = [
  ['lint', 'pnpm run lint'],
  ['type-check', 'pnpm run type-check'],
  ['test:coverage', 'pnpm run test:coverage'],
  ['test:scripts', 'pnpm run test:scripts'],
  ['i18n:check', 'pnpm run i18n:check'],
  ['build', 'pnpm run build'],
  ['check:bundle-budget', 'pnpm run check:bundle-budget'],
  ['pnpm audit', 'pnpm audit --audit-level=high'],
];

function run(label, command) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`\n✗ verify:release failed at step: ${label}`);
    process.exit(result.status ?? 1);
  }
}

for (const [label, cmd] of steps) {
  run(label, cmd);
}

const cargoToml = join(root, 'src-tauri/Cargo.toml');
if (!skipCargo && existsSync(cargoToml)) {
  const cargoAvailable = spawnSync('cargo --version', { cwd: root, shell: true, encoding: 'utf8' });
  if (cargoAvailable.status !== 0) {
    console.warn('\n⚠ cargo not installed — skipping Rust check and advisory scan');
  } else {
    const cargoAudit = spawnSync('cargo audit --version', { cwd: root, shell: true, encoding: 'utf8' });
    if (cargoAudit.status === 0) {
      run('cargo audit', 'cargo audit --file src-tauri/Cargo.lock');
    } else {
      console.warn('\n⚠ cargo-audit not installed — skipping Rust advisory scan (install: cargo install cargo-audit)');
    }
    run('cargo check (tauri)', 'cargo check --manifest-path src-tauri/Cargo.toml');
  }
}

console.log('\n✓ verify:release completed successfully');

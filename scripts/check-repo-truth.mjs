#!/usr/bin/env node
/**
 * Fail when README test/coverage stats drift from derived repo truth.
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(join(root, 'README.md'), 'utf8');

const derived = spawnSync(process.execPath, [join(root, 'scripts/derive-repo-status.mjs')], {
  cwd: root,
  encoding: 'utf8',
});
if (derived.status !== 0) {
  console.error(derived.stderr || derived.stdout);
  process.exit(derived.status ?? 1);
}

const status = JSON.parse(derived.stdout);
const thresholds = status.vitest.coverageThresholds;
const testFiles = status.vitest.testFileCount;

const testsLine = readme.match(
  /\*\*Tests\*\*\s*\|\s*Vitest\s+\((\d+)\s+files\)/i,
);
if (!testsLine) {
  console.error('README.md: could not parse Tests table row (expected Vitest (N files))');
  process.exit(1);
}

const coverageLine = readme.match(
  /coverage thresholds\s+\*\*(\d+)\/(\d+)\/(\d+)\/(\d+)\*\*/i,
);
if (!coverageLine) {
  console.error('README.md: could not parse coverage thresholds in Tests row');
  process.exit(1);
}

const errors = [];
const readmeFiles = Number(testsLine[1]);
if (readmeFiles !== testFiles) {
  errors.push(`test files: README ${readmeFiles}, derived ${testFiles}`);
}

const [lines, statements, functions, branches] = coverageLine.slice(1).map(Number);
if (lines !== thresholds.lines) errors.push(`lines: README ${lines}, derived ${thresholds.lines}`);
if (statements !== thresholds.statements) {
  errors.push(`statements: README ${statements}, derived ${thresholds.statements}`);
}
if (functions !== thresholds.functions) {
  errors.push(`functions: README ${functions}, derived ${thresholds.functions}`);
}
if (branches !== thresholds.branches) {
  errors.push(`branches: README ${branches}, derived ${thresholds.branches}`);
}

if (errors.length > 0) {
  console.error('README repo-truth drift:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  console.error('Run: node scripts/derive-repo-status.mjs --write && update README Tests row');
  process.exit(1);
}

console.log(`README repo-truth OK (${testFiles} test files, thresholds ${lines}/${statements}/${functions}/${branches})`);

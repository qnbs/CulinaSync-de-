import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const repoRoot = join(import.meta.dirname, '..', '..');
const scriptPath = join(repoRoot, 'scripts', 'check-readme-version.mjs');

function runCheck(readmeContent) {
  const dir = mkdtempSync(join(tmpdir(), 'readme-version-'));
  const readmePath = join(dir, 'README.md');
  writeFileSync(readmePath, readmeContent, 'utf8');
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, README_VERSION_CHECK_PATH: readmePath },
  });
  return result;
}

test('check-readme-version passes when version matches package.json', () => {
  const result = runCheck('| **Version** | `0.3.0` |\n');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /README version matches package\.json/);
});

test('check-readme-version fails on version mismatch', () => {
  const result = runCheck('| **Version** | `0.2.4` |\n');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /README version mismatch/);
});

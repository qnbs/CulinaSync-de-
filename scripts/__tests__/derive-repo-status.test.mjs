import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const repoRoot = join(import.meta.dirname, '..', '..');
const scriptPath = join(repoRoot, 'scripts', 'derive-repo-status.mjs');

test('derive-repo-status writes valid JSON with expected keys', () => {
  const dir = mkdtempSync(join(tmpdir(), 'repo-status-'));
  const result = spawnSync(process.execPath, [scriptPath, '--write'], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, REPO_STATUS_OUTPUT: join(dir, 'repo-status.json') },
  });
  assert.equal(result.status, 0);
  const payload = JSON.parse(readFileSync(join(dir, 'repo-status.json'), 'utf8'));
  assert.equal(typeof payload.version, 'string');
  assert.equal(typeof payload.vitest.testFileCount, 'number');
  assert.equal(typeof payload.vitest.coverageThresholds.lines, 'number');
  assert.ok(payload.generatedAtUtc);
});

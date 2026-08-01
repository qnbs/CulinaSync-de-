import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import test from 'node:test';

const root = join(import.meta.dirname, '..', '..');

test('check-repo-truth passes when README matches derived status', () => {
  const result = spawnSync('pnpm', ['run', 'check:repo-truth'], {
    cwd: root,
    encoding: 'utf8',
    shell: true,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /README repo-truth OK/);
});

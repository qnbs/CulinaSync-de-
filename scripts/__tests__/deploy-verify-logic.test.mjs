import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateDeployResponse,
  shouldSkipProtectedVercel,
} from '../lib/deploy-verify-logic.mjs';

describe('shouldSkipProtectedVercel', () => {
  it('skips Vercel 401/403', () => {
    assert.equal(shouldSkipProtectedVercel(401, 'Vercel Production'), true);
    assert.equal(shouldSkipProtectedVercel(403, 'Vercel Preview'), true);
  });

  it('does not skip Pages or Vercel 200', () => {
    assert.equal(shouldSkipProtectedVercel(404, 'GitHub Pages'), false);
    assert.equal(shouldSkipProtectedVercel(500, 'Vercel Production'), false);
    assert.equal(shouldSkipProtectedVercel(200, 'Vercel Production'), false);
  });
});

describe('evaluateDeployResponse', () => {
  it('accepts 200 with required snippets', () => {
    const result = evaluateDeployResponse(200, '<div id="root">CulinaSync</div>', [
      'CulinaSync',
      'id="root"',
    ]);
    assert.deepEqual(result, { ok: true });
  });

  it('rejects non-2xx', () => {
    assert.equal(evaluateDeployResponse(404, '', []).ok, false);
  });

  it('rejects missing snippets', () => {
    const result = evaluateDeployResponse(200, '<html></html>', ['CulinaSync']);
    assert.equal(result.ok, false);
  });
});

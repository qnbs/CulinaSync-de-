import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateDeployResponse,
  isVercelProtectionPage,
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

describe('isVercelProtectionPage', () => {
  it('detects a followed redirect onto the vercel.com login wall', () => {
    assert.equal(
      isVercelProtectionPage({
        targetName: 'Vercel Production',
        body: '<html>...vercel login...</html>',
        finalUrl: 'https://vercel.com/login?next=%2Fsso-api%3Furl%3D...%26nonce%3Dabc',
        redirected: true,
      }),
      true,
    );
  });

  it('detects the SSO nonce marker in the body', () => {
    assert.equal(
      isVercelProtectionPage({ targetName: 'Vercel Production', body: 'x _vercel_sso_nonce y' }),
      true,
    );
  });

  it('ignores non-Vercel targets', () => {
    assert.equal(
      isVercelProtectionPage({ targetName: 'GitHub Pages', body: '_vercel_sso_nonce' }),
      false,
    );
  });

  it('does not flag the real app response', () => {
    assert.equal(
      isVercelProtectionPage({
        targetName: 'Vercel Production',
        body: '<div id="root">CulinaSync</div>',
        finalUrl: 'https://culina-sync-de-web-qnbs-projects.vercel.app/',
        redirected: false,
      }),
      false,
    );
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

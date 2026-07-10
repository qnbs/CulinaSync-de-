import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { WEB_CSP, TAURI_CSP } from '../csp';

// Vitest runs with cwd = apps/web; the Tauri config lives at the repo root.
const tauriConf = JSON.parse(
  readFileSync(resolve(process.cwd(), '../../src-tauri/tauri.conf.json'), 'utf8'),
) as { app: { security: { csp: string } } };

describe('Content-Security-Policy single source', () => {
  it('adds wasm-unsafe-eval for on-device AI WASM', () => {
    expect(WEB_CSP).toContain("script-src 'self' 'wasm-unsafe-eval'");
    expect(TAURI_CSP).toContain("script-src 'self' 'wasm-unsafe-eval'");
  });

  it('keeps connect-src at self+https (user-configured WebDAV/IPFS/model hosts preclude an allowlist)', () => {
    expect(WEB_CSP).toMatch(/connect-src 'self' https:(;|$)/);
    // but no insecure schemes are permitted
    expect(WEB_CSP).not.toMatch(/connect-src[^;]*(\shttp:|\sws:|\s\*)/);
  });

  it('keeps upgrade-insecure-requests for web but not for the Tauri webview', () => {
    expect(WEB_CSP.endsWith('upgrade-insecure-requests')).toBe(true);
    expect(TAURI_CSP).not.toContain('upgrade-insecure-requests');
  });

  it('stays in sync with src-tauri/tauri.conf.json (drift guard)', () => {
    expect(tauriConf.app.security.csp).toBe(TAURI_CSP);
  });
});

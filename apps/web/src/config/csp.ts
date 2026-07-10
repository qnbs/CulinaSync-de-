/**
 * Single source of truth for the app's Content-Security-Policy.
 *
 * - `WEB_CSP` is injected into index.html at build/dev time by a Vite plugin
 *   (see vite.config.ts) — index.html no longer hardcodes the policy.
 * - `TAURI_CSP` is mirrored into `src-tauri/tauri.conf.json`; a unit test
 *   (`__tests__/csp.test.ts`) fails if the two drift apart.
 *
 * connect-src is intentionally `'self' https:` (all HTTPS, no http/ws/other
 * schemes). An explicit host allowlist is NOT feasible here because several core
 * features connect to USER-CONFIGURED endpoints that cannot be enumerated:
 *   - WebDAV / Nextcloud sync → arbitrary user server (deviceSync)
 *   - IPFS gateway            → user-configurable gateway (communityShareService)
 * and on top of that the on-device AI stack pulls model weights/WASM from
 * multiple CDNs (HuggingFace, jsDelivr, GitHub-raw) plus Gemini and the jina
 * reader. `upgrade-insecure-requests` forces https, so plain http is excluded.
 */

const CONNECT_SRC = "'self' https:";

// Ordered so the serialized policy is deterministic (drift test compares strings).
const DIRECTIVES: ReadonlyArray<readonly [string, string]> = [
  ['default-src', "'self'"],
  ['base-uri', "'self'"],
  ['object-src', "'none'"],
  ['frame-ancestors', "'none'"],
  ['form-action', "'self'"],
  // 'wasm-unsafe-eval' is required to instantiate WebAssembly for on-device AI
  // (onnxruntime-web / transformers.js / WebLLM). It does NOT permit JS eval().
  ['script-src', "'self' 'wasm-unsafe-eval'"],
  ['style-src', "'self' 'unsafe-inline'"],
  ['img-src', "'self' data: blob: https:"],
  ['font-src', "'self' data:"],
  ['connect-src', CONNECT_SRC],
  ['worker-src', "'self' blob:"],
  ['manifest-src', "'self'"],
  ['media-src', "'self' blob: data:"],
  ['frame-src', "'none'"],
];

const serialize = (trailing: readonly string[]): string =>
  [...DIRECTIVES.map(([name, value]) => `${name} ${value}`), ...trailing].join('; ');

/** Browser build — `upgrade-insecure-requests` upgrades any stray http subresource. */
export const WEB_CSP = serialize(['upgrade-insecure-requests']);

/** Tauri webview — `upgrade-insecure-requests` is a no-op there, so it is omitted. */
export const TAURI_CSP = serialize([]);

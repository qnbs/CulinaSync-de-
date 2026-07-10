/**
 * Single source of truth for the app's Content-Security-Policy.
 *
 * - `WEB_CSP` is injected into index.html at build/dev time by a Vite plugin
 *   (see vite.config.ts) — index.html no longer hardcodes the policy.
 * - `TAURI_CSP` is mirrored into `src-tauri/tauri.conf.json`; a unit test
 *   (`__tests__/csp.test.ts`) fails if the two drift apart.
 *
 * connect-src allowlist — every host maps to a concrete, in-use feature. Bare
 * `https:` (which allowed exfiltration to any host) has been replaced by this
 * explicit list. Add a host here (with a comment) when a feature needs it.
 *   generativelanguage.googleapis.com → Google Gemini (cloud AI, BYOK)
 *   huggingface.co / *.huggingface.co → on-device model weights (transformers.js, WebLLM, Whisper)
 *   cdn.jsdelivr.net                  → @xenova/transformers ONNX-runtime WASM
 *   raw.githubusercontent.com         → WebLLM model-lib WASM binaries
 *   r.jina.ai                         → recipe web-import reader proxy (recipeImportService)
 *   ipfs.infura.io:5001               → community recipe share upload (communityShareService)
 */

const CONNECT_SRC = [
  "'self'",
  'https://generativelanguage.googleapis.com',
  'https://huggingface.co',
  'https://*.huggingface.co',
  'https://cdn.jsdelivr.net',
  'https://raw.githubusercontent.com',
  'https://r.jina.ai',
  'https://ipfs.infura.io:5001',
].join(' ');

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

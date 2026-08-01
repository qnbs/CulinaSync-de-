# CSP & Network Endpoint Threat Model

**Status:** 2026-08-01 · CulinaSync v0.3.0+  
**Related issues:** #133

## Assets

| Asset | Location | Risk if exfiltrated |
|-------|----------|---------------------|
| Recipes, pantry, meal plan | Dexie (local) | Household privacy |
| Gemini API key | Encrypted IndexedDB | Cloud spend / data abuse |
| Sync credentials | Session / optional vault | Backup channel compromise |
| On-device model cache | Browser cache / IndexedDB | Supply-chain tampering |

## Threats

1. **XSS → arbitrary fetch** — stolen local data or API keys via `fetch` to attacker origin.
2. **Malicious sync endpoint** — user-configured URL could be attacker-controlled (accepted: BYO sync).
3. **Model CDN tampering** — swapped weights via non-canonical host.
4. **Remote Ollama** — user points Ollama URL to untrusted server (mitigated: loopback-only policy).
5. **Ollama HTTP vs CSP upgrade** — browser `upgrade-insecure-requests` may block loopback HTTP; Tauri omits upgrade.

## Controls

| Layer | Mechanism |
|-------|-----------|
| CSP meta (web) | `default-src 'self'`; `script-src` + `wasm-unsafe-eval`; explicit `connect-src` hosts + `https:` fallback |
| CSP (Tauri) | Same core policy without `upgrade-insecure-requests` |
| Runtime policy | `networkEndpointPolicy.ts` — Ollama loopback, Gemini host, AI CDN allowlist |
| Settings gate | `localAi.ollamaBaseUrl` validated on save |
| AI JSON | Zod via `parseAiJsonWithSchema` — no silent fabrication |
| API key | Never in build; `apiKeyService` only |

## Residual risk

- **`connect-src https:`** remains for Gemini, user sync, and unknown CDNs — runtime CDN allowlist narrows model paths.
- **Local-first plaintext** in IndexedDB — see `docs/ENCRYPTION-AT-REST-REVIEW.md`.
- **Workers excluded** from aggregate coverage gate — dedicated worker matrix tests (#130).

## Validation

- `apps/web/src/config/__tests__/csp.test.ts` — WEB vs TAURI drift
- `apps/web/src/config/__tests__/networkEndpointPolicy.test.ts`
- `pnpm run check:repo-truth` — README thresholds vs `vitest.config.ts`

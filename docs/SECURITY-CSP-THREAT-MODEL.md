# CSP & Network Endpoint Threat Model

**Status:** 2026-09-02 · CulinaSync v0.3.0+  
**Related issues:** #133 (runtime hardening shipped; full `https:` removal deferred)

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
| CSP meta (web) | `apps/web/src/config/csp.ts` → Vite inject + **Vercel `Content-Security-Policy` header** (`pnpm run sync:vercel-csp`) |
| CSP (Tauri) | `TAURI_CSP` mirrored in `src-tauri/tauri.conf.json` (drift test) |
| Runtime policy | `networkEndpointPolicy.ts` — purposes: `ollama_loopback`, `gemini_api`, `ai_model_cdn`, `user_sync`, `community_share`, `recipe_import_proxy`, `general_https` |
| Service gates | `syncTransport`, `nextcloudSyncAdapter`, `communityShareService`, `recipeImportService` call `assertAllowedEndpoint` before `fetch` |
| Settings gate | `localAi.ollamaBaseUrl` validated on save |
| AI JSON | Zod via `parseAiJsonWithSchema` — no silent fabrication |
| API key | Never in build; `apiKeyService` only |

## Explicit `connect-src` hosts (beyond `https:` fallback)

- Gemini API, AI model CDNs (Hugging Face, jsDelivr)
- Community share: `ipfs.infura.io`, `ipfs.io`
- Recipe import proxy: `r.jina.ai`
- Loopback HTTP for Ollama: `127.0.0.1`, `localhost`, `[::1]`

## Residual risk

- **`connect-src https:`** remains for BYO sync (arbitrary user WebDAV/Nextcloud hosts). Runtime `user_sync` allows HTTP(S) but rejects other schemes.
- **Local-first plaintext** in IndexedDB — see `docs/ENCRYPTION-AT-REST-REVIEW.md`.
- **Workers excluded** from aggregate coverage gate — dedicated worker matrix tests (#130).

## Validation

- `apps/web/src/config/__tests__/csp.test.ts` — WEB vs TAURI drift, Vercel export hook
- `apps/web/src/config/__tests__/networkEndpointPolicy.test.ts`
- `apps/web/src/services/__tests__/syncTransport.test.ts`
- `pnpm run sync:vercel-csp` after CSP changes
- `pnpm run check:repo-truth` — README thresholds vs `vitest.config.ts`

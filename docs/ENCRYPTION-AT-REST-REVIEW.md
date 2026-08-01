# Encryption at rest review (Dexie / IndexedDB)

**Status:** 2026-08-01 · Issue #137  
**Decision:** Local-first plaintext domain data is **accepted** for CulinaSync v0.3.x.

## Scope

| Data | Storage | Encryption |
|------|---------|------------|
| Recipes, pantry, meal plan, shopping | Dexie tables | Plaintext (device-bound) |
| Gemini API key | `apiKeyService` | WebCrypto envelope |
| App password / sync vault | Settings + session | Encrypted or sessionStorage |
| AI inference cache | `aiInferenceCache` | Plaintext JSON (TTL + quota) |
| Redux UI state | redux-persist (settings only) | Browser storage |

## Threat model

- **Device theft** — OS disk encryption is the primary control; app does not add second-layer DB encryption for recipes.
- **Malicious extension / XSS** — CSP + runtime endpoint policy; Dexie readable if script executes.
- **Sync exfiltration** — User-chosen endpoints; optional app password for export/sync flows.

## Optional hardening (backlog)

- Envelope encryption for sync credential blob only (not full recipe mirror).
- SQLCipher-style Dexie plugin — high effort, conflicts with PWA simplicity.

## Validation

- API key never in build (`VITE_*` forbidden).
- `apiKeyService` tests and CodeQL Dexie boundary rules.

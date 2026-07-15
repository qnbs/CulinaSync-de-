# ADR: Dexie at-rest encryption (Evaluation)

**Status:** Accepted — **defer implementation (P2)**  
**Date:** 2026-07-15  
**Context:** Master Perfection / `docs/TODO-MASTER-PERFECTION.md`

## Decision

Domain tables in IndexedDB (`pantry`, `recipes`, `mealPlan`, `shoppingList`, `aiEmbeddings`, `aiInferenceCache`) remain **plaintext on device**. Secrets that leave the device or are high-value credentials stay encrypted:

| Secret | Mechanism |
|--------|-----------|
| Gemini API key | `apiKeyService` AES-GCM + PBKDF2 600k |
| Nextcloud app password | `syncCredentialService` AES-GCM (v3 = 600k) |
| Backup / vault blobs | `syncService` CSB3 AES-GCM + PBKDF2 600k |

## Options considered

1. **`dexie-encrypted` / field-level encryption** — high migration cost, passphrase UX on every cold start, complicates `useLiveQuery` and backups.
2. **SQLCipher-WASM / opaque DB** — large WASM, poor fit for current Dexie schema & reactive hooks.
3. **Keep plaintext + OS disk encryption + XSS hardening** — matches current threat model (`docs/SECURITY-AUDIT-2026.md`): primary risk is same-origin XSS / stolen device profile, not remote DB theft.

## Consequences

- Document threat model honestly in privacy policy (already linked).
- Revisit if: multi-user shared device, enterprise MDM, or regulatory requirement emerges.
- Do **not** block v1.0 on full-table encryption.

## Follow-up

- Optional: encrypt only high-sensitivity free-text fields behind an opt-in passphrase (spike issue).
- Keep PBKDF2 iterations aligned via `cryptoConstants.ts`.

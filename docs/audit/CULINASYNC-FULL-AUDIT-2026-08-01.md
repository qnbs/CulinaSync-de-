# CulinaSync Full Audit — 2026-08-01

**Verified commit SHA:** `cursor/sprint-coverage-intro-tauri-0ad6` (PR #118 remediation; base `main` @ `5ce12b53`)  
**Verification date:** 2026-08-01  
**Verification commands:** `pnpm run lint`, `pnpm run type-check`, `pnpm run test:coverage`, `pnpm run i18n:check`, architecture grep (see evidence)  
**Known limitations:** Desktop signing/notarization not exercised; E2E re-run pending post-push CI; CodeQL full export pending.

Severity scale: P0 Critical · P1 High · P2 Medium · P3 Low

---

## Summary

| Severity | Open | Accepted risk |
|----------|------|---------------|
| P0 | 0 | 0 |
| P1 | 4 | 1 |
| P2 | 8 | 2 |
| P3 | 6 | — |

---

## Findings

### AUDIT-001 — Version identity drift (governance)

| Field | Value |
|-------|-------|
| **Severity** | P1 High |
| **Confidence** | High |
| **Evidence** | Root/web/Tauri report `0.2.4`; latest **published** release is `v0.2.2`; draft `v0.2.4` from 2026-06-04; substantial local-AI/sync features merged after tag work |
| **Affected paths** | `package.json`, `apps/web/package.json`, `src-tauri/Cargo.toml`, `CHANGELOG.md` |
| **User impact** | Users cannot correlate running build with release notes; rollback tags misleading |
| **Failure scenario** | Support/debug references wrong changelog; desktop updater shows stale identity |
| **Recommended fix** | Bump to `0.3.0` (feature scope) or `0.2.5` (fixes only); sync all version files; publish with evidence |
| **Verification** | `pnpm run check:version-drift`; CI gate on drift |
| **Owner** | unassigned |
| **Dependency** | Release decision |
| **Status** | Open — `check:version-drift` script added 2026-08-01 |

### AUDIT-002 — Direct Dexie reads in UI components

| Field | Value |
|-------|-------|
| **Severity** | P2 Medium |
| **Confidence** | High |
| **Evidence** | `App.tsx`, `CommandPalette.tsx`, `RecipeBook.tsx`, `AiChef.tsx`, `useRecipeDetail.ts`, `DataPanel.tsx`, `CommunityPanel.tsx`, `HealthConnectPanel.tsx` use `db.<store>` via `useLiveQuery` |
| **Affected paths** | `apps/web/src/components/**`, `apps/web/src/App.tsx` |
| **User impact** | Schema/migration changes can break UI silently; harder to enforce transactional writes |
| **Failure scenario** | New index requirement not reflected in component queries |
| **Recommended fix** | Migrate reads to repository hooks (`useShoppingList`, etc.) incrementally; optional ESLint custom rule |
| **Verification** | Architecture script / grep gate in CI |
| **Owner** | unassigned |
| **Status** | Open (documented pattern debt) |

### AUDIT-003 — `check:all` omitted coverage (fixed)

| Field | Value |
|-------|-------|
| **Severity** | P2 Medium |
| **Confidence** | High |
| **Evidence** | `package.json` `check:all` ran `test` not `test:coverage` until 2026-08-01 |
| **User impact** | Maintainers could pass local “full check” while branch gate fails |
| **Recommended fix** | `check:all` includes `test:coverage`; `verify:release` for release canon |
| **Verification** | `pnpm run check:all` fails if coverage below thresholds |
| **Status** | **Fixed** 2026-08-01 |

### AUDIT-004 — GitHub Actions not SHA-pinned

| Field | Value |
|-------|-------|
| **Severity** | P2 Medium |
| **Confidence** | High |
| **Evidence** | `validate.yml`: `actions/checkout@v7`, `pnpm/action-setup@v6`, etc.; `tauri-release.yml` uses mutable `dtolnay/rust-toolchain@stable`, `tauri-apps/tauri-action@v1` |
| **Affected paths** | `.github/workflows/**` |
| **User impact** | Supply-chain tag mutation could alter CI behavior |
| **Recommended fix** | Pin to full SHA with version comment (Codecov action already pinned) |
| **Verification** | Workflow lint / policy script |
| **Owner** | unassigned |
| **Status** | Open |

### AUDIT-005 — No `cargo audit` in default validation

| Field | Value |
|-------|-------|
| **Severity** | P2 Medium |
| **Confidence** | High |
| **Evidence** | `pnpm audit` in CI; `glib` advisory accepted for Linux Tauri; no automated Cargo scan in validate workflow |
| **Affected paths** | `src-tauri/Cargo.lock`, `verify-release.mjs` |
| **Recommended fix** | `verify:release` runs `cargo audit` when installed; add to CI with documented exceptions |
| **Status** | **Partial fix** — local `verify:release` 2026-08-01 |

### AUDIT-006 — Broad CSP `connect-src`

| Field | Value |
|-------|-------|
| **Severity** | P1 High |
| **Confidence** | Medium |
| **Evidence** | PWA/Tauri CSP allows broad HTTPS + loopback; `upgrade-insecure-requests` vs plain HTTP Ollama |
| **User impact** | XSS could exfiltrate to arbitrary HTTPS endpoints |
| **Recommended fix** | Allowlist user-configured origins; separate browser vs Tauri policies |
| **Status** | Open — threat model required |

### AUDIT-007 — Workers excluded from coverage gate

| Field | Value |
|-------|-------|
| **Severity** | P2 Medium |
| **Confidence** | High |
| **Evidence** | `vitest.config.ts` excludes `src/workers/**` from coverage thresholds |
| **User impact** | Worker regressions (embeddings, inference) may ship untested |
| **Recommended fix** | Dedicated worker test matrix + milestone to include in gate |
| **Status** | Open |

### AUDIT-008 — Branch coverage floor raised to 74% (PR #118)

| Field | Value |
|-------|-------|
| **Severity** | P3 Low |
| **Confidence** | High |
| **Evidence** | `vitest.config.ts` branches: 64 → 74; CI green at PR head |
| **User impact** | Positive — fewer untested branches in services |
| **Status** | **In PR #118** — verify margin after remediation push |

### AUDIT-009 — Intro gates re-enabled (product)

| Field | Value |
|-------|-------|
| **Severity** | P2 Medium |
| **Confidence** | Medium |
| **Evidence** | `featureFlags.ts`, `Onboarding.tsx`, `App.tsx` — dismissible onboarding + What's New |
| **User impact** | First-run UX change; must not block local-first core flows |
| **Recommended fix** | Manual + E2E verification matrix (onboarding paths, mobile, a11y) |
| **Status** | In PR #118 — pending human product sign-off |

### AUDIT-010 — API keys not in build (verified)

| Field | Value |
|-------|-------|
| **Severity** | — |
| **Confidence** | High |
| **Evidence** | No `VITE_*` / `process.env` API key patterns in `apps/web`; `geminiService` uses `apiKeyService` |
| **Status** | **No violation**

### AUDIT-011 — Plaintext IndexedDB domain data (accepted local-first)

| Field | Value |
|-------|-------|
| **Severity** | P2 Medium (accepted) |
| **Confidence** | High |
| **Evidence** | Recipes/pantry in Dexie without app-level encryption; sync credentials encrypted separately |
| **User impact** | Device compromise exposes household data |
| **Status** | Accepted for local-first model — track sensitive-field encryption review

### AUDIT-012 — Stale quality scores in docs

| Field | Value |
|-------|-------|
| **Severity** | P3 Low |
| **Confidence** | High |
| **Evidence** | Historical docs reference aspirational scores / outdated test counts |
| **Recommended fix** | Generated truth scripts + archive historical snapshots |
| **Status** | Open

---

## Residual accepted risks

| Risk | Owner | Review date |
|------|-------|-------------|
| `glib` 0.18.5 Linux/Tauri advisory | unassigned | 2026-09-01 |
| Plaintext Dexie domain stores | product/security | 2026-09-01 |
| Broad CSP until endpoint redesign | security | 2026-09-01 |

---

## Evidence cross-links

- Baseline snapshot: `docs/audit/evidence/2026-08-01-baseline.md`
- Release verification: `scripts/verify-release.mjs`
- Version drift: `scripts/check-version-drift.mjs`

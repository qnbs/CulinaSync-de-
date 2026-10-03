# CulinaSync — Full Audit 2026-10-02

**Measured `main` at audit start:** `7488c34963d90c11aadea739a2a339bed8e6477d`  
**Agent:** Cursor Cloud / Composer 2.5 (Master Prompt 2026-10-02)  
**Method:** live HTTP + GitHub API + repo scripts + policy docs (live truth > historical STATUS)

---

## 1. Executive summary

| Area | Disposition |
|------|-------------|
| **Production** | GitHub Pages healthy; Vercel URL 404 — not a second live channel |
| **Deploy Health workflow** | Failed daily since 2026-09-07 due to Vercel 404 — **fix in PR wave 1** (optional Vercel) |
| **Release truth** | v0.3.0 **published** 2026-08-01; September docs wrongly listed publish as TODO — **docs updated** |
| **Security product** | #134 merged; ML CDN fetch guard active |
| **E2E** | Chromium/Firefox green; WebKit boot fix **#188** — weekly `matrix-webkit` zur Bestätigung |
| **Open issues** | #139 signing (Owner); #137 Dexie encrypt (ADR deferred); #131 glib ✅ CI + exceptions |
| **Dependabot** | 15+ open PRs — program, not bulk merge |

---

## 2. Live deployment truth

| Target | URL | HTTP (2026-10-02) | Role |
|--------|-----|-------------------|------|
| GitHub Pages | https://qnbs.github.io/CulinaSync-de-/ | 200 | **Canonical production** |
| Vercel | https://culina-sync-de-web.vercel.app/ | 404 | Retired / not provisioned |

**Product intent inferred:** Pages is primary (deploy.yml, `GITHUB_ACTIONS` base path). Vercel config retained for optional re-link; monitoring must not fail on permanent 404.

---

## 3. GitHub / release control plane

- **Published release:** `v0.3.0` (2026-08-01), tag points to `5d9c536…` (unsigned).
- **Duplicate draft** `CulinaSync v0.3.0` (release id 363635532): **deleted** 2026-10-02.
- **Package version:** 0.3.0 on `main` with post-release commits — intentional “0.3.0 + main” until next tag.
- **Release evidence:** `release-evidence/0.3.0/` tied to merge `4b063f7` (September refresh); not identical to Aug tag SHA — documented in evidence README.

---

## 4. CI / governance

- **Ruleset `mainrules`:** validate, i18n, GitGuardian, Socket, CodeQL — observed; **`e2e-gate`** implemented in `ci.yml` (optional ruleset add — admin UI).
- **E2E Smoke / Matrix:** path-filtered on `main`; PRs use reusable smoke + **`e2e-gate`** (pass on skip).
- **Deploy Health:** schedule `0 6 * * *` — will go green after Vercel optional skip.

---

## 5. E2E / WebKit

- **Chromium / Firefox:** pass on current `main`.
- **WebKit:** Root cause — E2E `WEB_CSP` + `upgrade-insecure-requests` on `http://127.0.0.1` preview blocked module load (not visibility-only). **Fix (W2):** `VITE_E2E=true` → inject `TAURI_CSP` in `vite.config.ts`; `gotoApp` waits `load`.
- **Disposition:** Verify `e2e-matrix` WebKit job green; matrix remains `continue-on-error` until stable weekly signal.

---

## 6. Local AI audit seeds (not closed)

| ID | Finding | Severity |
|----|---------|----------|
| LA-1 | `localAiOllamaService.ts` hardcodes `model: 'llama3.2'` — no settings field | ✅ PR #185 `localAi.ollamaModel` |
| LA-2 | Transformers removed from generative chain — embeddings/RAG only (**W4**) | ✅ |
| LA-3 | WebLLM MLC CDN guard shipped (#164) — re-verify with upstream integrity metadata | P2 |
| LA-4 | Gemini `gemini-2.5-flash` — capability/cost/BYOK analysis before model churn | P2 |

---

## 7. Historical finding disposition (sample)

| Historical | Current disposition |
|------------|---------------------|
| #134 WebLLM CDN | ✅ Merged PR #164 |
| v0.3.0 unpublished (STATUS-09-02) | ❌ Stale — release exists |
| Vercel production live | ❌ Stale — 404 |
| Deploy Health green | 🟨 Fixed in remediation PR |
| M5 branch 82 % | ✅ Floor met ~82 % |

---

## 8. Proposed PR waves

| Wave | Scope | Status |
|------|-------|--------|
| **W1** | Deploy verify + release/status docs + audit artifact | ✅ #183 |
| **W2** | WebKit policy or boot fix | ✅ #188 (webkit job: manual/weekly verify) |
| **W3** | Ollama model from settings + probe `/api/tags` | ✅ #185 |
| **W4** | Transformers generative null root cause | ✅ (chain = Ollama → WebLLM → Heuristik) |
| **W5** | Dependabot batches (CI actions, turbo, safe minors) | ✅ #192 |
| **W6** | Tauri 2.11.6 + lint/eslint minors (#178/#169/#171 batch) | ✅ #194 |
| **W7** | Testing bundle: Vitest 5, MSW 3, jsdom 30 (#186) | ✅ #197 |
| **W6b** | #139 Tauri signing (Owner secrets) | Blocked external |

---

## 9. Baseline commands (2026-10-02)

| Command | Result |
|---------|--------|
| `node scripts/verify-live-deployments.mjs` | Pages OK; Vercel SKIP optional (after W1) |
| `pnpm run test:scripts` | 21/21 pass |
| `pnpm run check:repo-truth` | OK (157 files) |
| `pnpm run verify:release` | VM cargo edition2024 limitation — CI authoritative |

---

## 10. Known unknowns

- Vercel project deletion intentional vs accidental — no team API confirmation in agent session.
- Whether product wants Vercel restored vs Pages-only long term — default: Pages canonical.
- WebKit weekly green rate after W2 merge (Playwright noble + subpath base).

---

*Next update: W5 merge; WebKit weekly; optional `e2e-gate` in ruleset.*

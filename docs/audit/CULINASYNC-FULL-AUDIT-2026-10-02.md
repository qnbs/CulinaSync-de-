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
| **E2E** | Chromium/Firefox green; WebKit 16/16 fail at boot — **open P1** |
| **Open issues** | #139 signing, #137 encryption review, #131 glib — revalidate before close |
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

- **Ruleset `mainrules`:** validate, i18n, GitGuardian, Socket, CodeQL — observed; E2E **not** in required contexts (hypothesis: policy vs protection drift).
- **E2E Smoke / Matrix:** run on `apps/web/**` changes; agent/human policy treats as blocking for web — audit whether aggregate gate needed.
- **Deploy Health:** schedule `0 6 * * *` — will go green after Vercel optional skip.

---

## 5. E2E / WebKit

- **Chromium / Firefox:** pass on current `main`.
- **WebKit:** documented limitation (preview + Pages base); matrix still red 16/16 — `#main-content` timeout.
- **Disposition:** P1 — fix harness/base/runtime **or** explicit supported-browser policy with non-red advisory signal.

---

## 6. Local AI audit seeds (not closed)

| ID | Finding | Severity |
|----|---------|----------|
| LA-1 | `localAiOllamaService.ts` hardcodes `model: 'llama3.2'` — no settings field | P1 |
| LA-2 | Transformers generative path in provider chain may return null — verify routing | P1 |
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
| **W1** | Deploy verify + release/status docs + audit artifact | In progress |
| **W2** | WebKit policy or boot fix | Planned |
| **W3** | Ollama model from settings + probe `/api/tags` | Planned |
| **W4** | Transformers generative null root cause | Planned |
| **W5** | Dependabot batches (CI actions, turbo, safe minors) | Planned |
| **W6** | #139 Tauri signing (Owner secrets) | Blocked external |

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
- WebKit fix feasibility in Playwright noble + `vite preview` + subpath base.

---

*Next update: after W1 merge on `main`.*

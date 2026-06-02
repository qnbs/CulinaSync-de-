# CulinaSync-de- — Audit-Report Juni 2026

> **Datum:** 2026-06-02  
> **Scope:** Re-Baseline nach STATUS-2026-05-16, Vergleich mit AUDIT.md (April/Mai 2026) und Master-Prompt-Checkliste  
> **Ausführender Kontext:** Cloud-Agent Phase 0 (Discovery) + begonnene P0-Maßnahmen

---

## Executive Summary

CulinaSync-de- bleibt ein **produktionsreifes, privacy-first Local-First PWA** mit vorbildlicher Architektur, Dokumentation und CI. Es gibt **keine kritischen Sicherheits- oder Betriebsblocker**. Der größte strukturelle Hebel ist weiterhin **Test-Coverage (M5)**: aktuell ~**61 %** Statements / ~**47 %** Branches gegenüber ROADMAP-Ziel **≥70 % / ≥60 %**.

**Neu gegenüber Mai-2026-Annahmen:**

| Thema | Mai-Status (User/AUDIT) | Ist-Stand 2026-06-02 |
|--------|-------------------------|---------------------|
| CI-Duplikation | „validate doppelt“ — nur teilweise gelöst | Reusable `validate.yml` ✅; **paralleler Doppel-Lauf auf `main`** (ci + deploy) noch offen → P0-Fix vorgesehen |
| Coverage | ~59 % stmts | **60,76 %** stmts, **62,34 %** lines (leichter Anstieg) |
| `pnpm audit --audit-level=high` | 0 (Mai) | **5** Findings (1 critical: **vitest** &lt;4.1.0, Override pin 4.0.18) → P0 |
| TS 7 GA | ausstehend | weiter **TS 6.0.3 + tsgo beta**; M7 unverändert offen |
| Tests | ~218 | **221** in **59** Dateien |

**Gesamteinschätzung:** Qualität **hoch**; Fokus auf M5, Supply-Chain (Vitest), CI-Minuten und Dokumentations-Sync — kein Architektur-Bruch nötig.

---

## Baseline-Validierung (lokal, Node 24)

| Check | Ergebnis | Anmerkung |
|-------|----------|-----------|
| `pnpm run lint` | ✅ grün | `max-warnings 0` |
| `pnpm run type-check` | ✅ grün | tsgo + Workspace-`^build` |
| `pnpm run test` / `test:coverage` | ✅ 221 Tests | Thresholds 58/60/51/45 — bestanden |
| `pnpm run build` | ✅ grün | |
| `pnpm run check:bundle-budget` | ✅ **201,87 KB** total | Ziel eingehalten |
| `pnpm audit --audit-level=high` | ⚠️ **5** (1 critical) | vitest GHSA-5xrq-8626-4rwp |

### Coverage (v8, `apps/web`)

| Metrik | Aktuell | CI-Threshold | ROADMAP M5 |
|--------|---------|--------------|------------|
| Statements | **60,76 %** | 58 % | ≥70 % |
| Lines | **62,34 %** | 60 % | ≥70 % |
| Branches | **47,44 %** | 45 % | ≥60 % |
| Functions | **54,34 %** | 51 % | ≥70 % |

**Größte Lücken (Stichprobe):**

- `src/services/repositories/` gesamt ~**25 %** — `shoppingListRepository`, `recipeRepository` stark untertestet
- Einzel-Services: `pantryMatcherService`, `speechInputService`, `energyService` &lt;20 %
- `geminiService.ts` teilweise abgedeckt; Edge-Cases Parsing/Fehler weiter ausbaufähig

---

## Priorisierte Findings

### P0 — Sofort (höchste Dringlichkeit)

| ID | Finding | Impact | Maßnahme | Aufwand |
|----|---------|--------|----------|---------|
| P0-1 | **M5 Coverage &lt;70 %** | Hoch — Local-First-Regressionen | Repository-/Service-/Integration-Tests; Thresholds schrittweise anheben | Hoch (~15–25 h verbleibend) |
| P0-2 | **Vitest CVE** (critical, &lt;4.1.0) | Mittel — CI audit gate | Override + devDeps auf **≥4.1.0** | Niedrig |
| P0-3 | **Doppel-Validate auf `main`** | Mittel — CI-Minuten, Flakiness-Risiko | `ci.yml`: validate nur bei **pull_request**; Deploy behält validate | Niedrig |
| P0-4 | **TS 7.0 GA** | Mittel — Zukunft/Performance | M7 blockiert bis Stable; tsconfig-Flags vorbereiten | Niedrig (nach Release) |

### P1 — Kurzfristig

| ID | Finding | Maßnahme |
|----|---------|----------|
| P1-1 | i18n-Regression in CI | `i18n:check:changed` bereits auf PR; Hardcoded-Scan-Baseline reduzieren |
| P1-2 | PWA Offline-UX | Workbox-Strategien, Offline-Indikatoren, längerer Offline-Test |
| P1-3 | `react-hooks/exhaustive-deps: warn` | Systematisch Hooks bereinigen → `error` |
| P1-4 | Post-Monorepo-Doku | STATUS/AUDIT/ROADMAP/CHANGELOG synchron (dieser Lauf) |

### P2 — Mittel-/langfristig

- M8 Tauri Release-Matrix  
- M10 Multi-Device-Sync / CRDT-Vorbereitung in `packages/`  
- Optionale Privacy-Telemetrie (nur Opt-in)  
- Vendor-Chunk-Optimierung (`vendor-export`, `vendor-faker` lazy)

---

## Kategorie-Audit (Kurz)

### Architektur & Maintainability — ✅ Stark

Monorepo (`apps/web`, `@domain/ai-core`, `@domain/ui`), klare Schichten UI → Hooks/Redux → Services/Repositories → Dexie. Context-Pattern für Pantry, ShoppingList, MealPlanner. Empfehlung unverändert: Domain-Typen für M10 in `packages/` ausbauen.

### Security & Privacy — ✅ Stark (1 Supply-Chain-Punkt)

Gemini nur `geminiService.ts`, Key via `apiKeyService` + WebCrypto, Zod-Validation, CSP/Tauri-Doku. **Neu:** Vitest-Advisory — kein App-Runtime-Risiko, aber CI-Audit.

### Performance & PWA — ✅ Gut

Bundle im Budget; Lazy Routes; Workbox vorhanden. Offline-UX und Indikatoren verbesserbar (P1).

### Testing — 🟨 Größtes Delta

Solide CI-Gates und 59 Test-Dateien; kritische Dexie-Pfade in Repositories noch dünn.

### i18n / A11y / DX — ✅ Weit fortgeschritten

Agent-Regeln (`.cursorrules`, `copilot-instructions`, `CLAUDE.md`) exzellent. i18n-Scan-Report historisch groß — kein Blocker.

### CI/CD — 🟨 Fast optimal

Reusable validate ✅; Rest-Duplikat auf main; Playwright-Smoke integriert.

---

## Vergleich April/Mai-Audit → Juni 2026

| April-Audit-Punkt | Status Juni 2026 |
|-------------------|------------------|
| Faker in Production | ✅ behoben |
| Schwache API-Key-Crypto | ✅ WebCrypto + Migration |
| CI ohne audit | ✅ audit in validate |
| `no-explicit-any` off | ✅ `error` |
| exhaustive-deps off | 🟨 `warn` |
| CI validate dupliziert | 🟨 reusable, aber 2× auf main |
| Coverage ≥70 % | 🔲 ~61 % |
| TS 7 GA | 🔲 Beta/tsgo |

---

## Phasen-Roadmap (Agent-Sprint)

| Phase | Inhalt | Status |
|-------|--------|--------|
| **0** | Baseline + dieser Report + STATUS-2026-06-02 | ✅ |
| **1** | P0: Coverage, CI-Dedup, Vitest, ESLint/TS7-Prep | 🟨 begonnen |
| **2** | i18n/A11y, PWA, Error-Resilience | 🔲 |
| **3** | Sync-Vorbereitung, Tauri | 🔲 |
| **4** | Docs/DX/ROADMAP final | 🟨 teilweise |

---

## Erfolgskriterien (Master-Prompt)

| Kriterium | Erfüllt? |
|-----------|----------|
| `pnpm check:all` grün | 🟨 audit high aktuell rot (Vitest) |
| Coverage ≥70 % | 🔲 |
| Keine ESLint-Errors | ✅ |
| TS strict + TS7-ready | 🟨 TS6 + beta tsgo |
| PWA offline robust | 🟨 Basis ja, UX P1 |
| Docs konsistent | 🟨 dieser Lauf |
| Keine Privacy-Regression | ✅ |

---

## Referenzen

- [`AUDIT.md`](../AUDIT.md) — Historie  
- [`docs/STATUS-2026-05-16.md`](STATUS-2026-05-16.md) — letzter Snapshot  
- [`docs/STATUS-2026-06-02.md`](STATUS-2026-06-02.md) — aktueller Snapshot  
- [`ROADMAP.md`](../ROADMAP.md) — M5, M7, M8, M10  
- [`SECURITY-AUDIT-2026.md`](../SECURITY-AUDIT-2026.md) — Security-Baseline  

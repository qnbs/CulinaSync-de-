# Testing

## Test-Stack (2026-10, #197)

| Paket | Version | Hinweise |
|-------|---------|----------|
| Vitest | **5.0.3** | Pin + `pnpm-workspace.yaml` override `vitest` / `@vitest/utils` |
| `@vitest/coverage-v8` | **5.0.3** | Muss dieselbe Major wie Vitest sein |
| MSW | **3.x** | `server.listen({ onUnhandledFrame: 'error' })` in `setupTests.ts` |
| jsdom | **30.x** | Scanner-Tests: `URL.createObjectURL` / `revokeObjectURL` stubben |
| Testing Library | jest-dom **7**, react **16**, user-event **14** | `@testing-library/jest-dom/vitest` Import |

Coverage-Floors in `apps/web/vitest.config.ts`: **82 %** lines/branches (siehe `docs/generated/repo-status.json`).

## Relevante Testorte

- `apps/web/src/components/**/__tests__/` — u. a. `cook-mode/__tests__/cookModeReducer.test.ts`, `meal-planner/__tests__/mealPlannerConstants.test.ts`, `meal-planner/__tests__/dayColumnPantryStatus.test.ts`, `meal-planner/__tests__/DayColumn.test.tsx`, **`MealPlanner.smoke.test.tsx`**, **`CookModeView.smoke.test.tsx`**, **`PantryManager.smoke.test.tsx`**, **`ShoppingList.smoke.test.tsx`**, **`recipe-detail/__tests__/RecipeDetailTabs.smoke.test.tsx`**, **`App.smoke.test.tsx`**, Root **`RecipeCard.test.tsx`**, **`GlobalErrorBoundary.test.tsx`**, **`shopping-list/__tests__/BulkAddModal.test.tsx`**, **`shopping-list/__tests__/AiModal.test.tsx`**, **`pantry/__tests__/PantryList.test.tsx`**, gemeinsame Stubs **`smokeHookStubs.ts`**
- `apps/web/src/contexts/__tests__/` — **`MealPlannerContext.test.tsx`**, **`PantryManagerContext.test.tsx`**, **`ShoppingListContext.test.tsx`**
- `apps/web/src/hooks/__tests__/` — **`useMealPlannerScreen.test.tsx`**, **`useCookModeController.test.tsx`**, **`useMealPlan.test.tsx`**, **`useShoppingList.test.tsx`**, **`usePantryManager.test.tsx`**
- `apps/web/src/services/__tests__/` — u. a. `voiceCommands.test.ts`, `dataRepository.test.ts`, `mealPlanRepository.test.ts`, `pantryRepository.test.ts`, `utilsCategories.test.ts`, `settingsService.test.ts`, `geminiService.test.ts`, **`geminiMsw.test.ts`** (HTTP-Mock + **Zod**)
- `apps/web/src/store/__tests__/`
- `apps/web/src/test/` — `setupTests.ts`, MSW (`msw/server.ts`, `msw/handlers.ts`), **`createTestStore.ts`** (Redux-Teststore ohne Persist)

## Befehle

```bash
pnpm run test
pnpm run test:coverage
pnpm run test:scripts   # Deploy-Verify (node --test, auch in CI validate)
pnpm run i18n:check
pnpm run check:all
pnpm run test:e2e        # alle Browser (Chromium, Firefox, WebKit)
pnpm run test:e2e:smoke  # Chromium-only (wie CI E2E Smoke)
```

**E2E-Specs (`apps/web/e2e/`):**

| Datei | Abdeckung |
|-------|-----------|
| `smoke.spec.ts` | Startseite lädt |
| `first-run.spec.ts` | Erstbesuch: Welcome ohne PWA-Toasts → Skip → Vorrats-Artikel + Reload |
| `local-ai-settings.spec.ts` | Lokale-KI-Panel, Ollama loopback-only |
| `settings-data-pwa.spec.ts` | Daten-Panel: PWA Install/Offline-Hinweise |
| `pantry-smart-add.spec.ts` | Smart Add → geparster Vorrats-Artikel |
| `navigation-offline.spec.ts` | Navigation Desktop/Mobile, Offline-Banner |
| `sync-settings.spec.ts` | Daten-Panel, QR-Modal, Nextcloud-Probe (mock WebDAV) |
| `chef-local.spec.ts` | Local-AI Strict-Toggle, KI-Chef erreichbar |
| `pantry-cook.spec.ts` | Vorratskammer: Artikel anlegen |
| `helpers/appStorage.ts`, `helpers/navigation.ts`, `helpers/gotoApp.ts` | Onboarding aus, Navigation, App-Boot |
| `cook-mode.spec.ts`, `chef-offline.spec.ts` | Kochmodus, KI-Chef offline |

E2E CI builds set `VITE_E2E=true` (skips PersistGate + SW in `index.tsx`); Playwright `serviceWorkers: 'block'`.

**WebKit:** Playwright WebKit läuft weekly/`workflow_dispatch` (`matrix-webkit`, `continue-on-error`). E2E-Builds setzen `VITE_E2E=true` (ohne `PersistGate`/SW) und nutzen **TAURI_CSP** ohne `upgrade-insecure-requests`, damit `http://127.0.0.1` Preview in WebKit Module laden kann. Chromium/Firefox bleiben auf PR/`main` blockierend.

**E2E lokal (wie CI / GitHub Pages):**

```bash
CI=true GITHUB_ACTIONS=true pnpm run build
cd apps/web && CI=true pnpm exec playwright test
```

**E2E in GitHub Actions:**

| Workflow | Browser | Trigger |
|----------|---------|---------|
| [e2e-smoke.yml](../.github/workflows/e2e-smoke.yml) | Chromium (blocking) | PR/push `apps/web/**`, weekly |
| [e2e-matrix.yml](../.github/workflows/e2e-matrix.yml) | Chromium + Firefox (blocking); WebKit weekly/manual | PR/push `apps/web/**`, weekly, `workflow_dispatch` |

Container: **`mcr.microsoft.com/playwright:v1.61.1-noble`** (digest-pinned; muss zu `@playwright/test` in `package.json` passen).

Ohne globales pnpm (z. B. Windows): `npm run test`, `npm run check:all` oder `npx pnpm@11 run test`.

**`check:all`:** `lint` → `type-check` (`tsgo`) → `test` → `test:scripts` → `i18n:check` → `build` → `check:bundle-budget` → `npm audit --audit-level=high`.

## Erwartete Mindestvalidierung

Fuer normale Codeaenderungen:

```bash
pnpm run lint
pnpm run test
pnpm run build
```

Empfohlen vor einem groesseren Push oder Merge:

```bash
pnpm run check:all
```

Zusaetzlich fuer deploy- oder bundle-relevante Aenderungen (auch in `check:all` enthalten):

```bash
pnpm run check:bundle-budget
```

## Empfohlener Ablauf fuer kleinere Slices

- Erst Diagnostics fuer die geaenderten Dateien pruefen.
- Dann einen moeglichst kleinen, slice-spezifischen Lint-, Test- oder TypeScript-Check ausfuehren.
- Erst danach den groesseren Integrationslauf verwenden.
- Fuer reine Doku-Aenderungen ist ein Diff-Review ausreichend, solange keine generierten Artefakte oder Skripte betroffen sind.

## Was Tests abdecken sollten

- Fachlogik in Services und Repositories
- Kritische UI-Flows bei neuen Oberflaechen
- Fehlermapping und Guard-Logik
- Persistenznahe Verhaltensweisen, wenn sich deren Contract aendert

## Besonders sensible Bereiche

- KI-Fehlerfaelle und Fallbacks
- Exportpfade und Dateierzeugung
- Settings-Mutationen
- Voice- und Navigationstrigger
- Datenbanknahe Cross-Feature-Operationen

## Aktueller Validierungsstand 2026-10-03 (`main` nach #197)

- **Vitest:** **861** Tests in **157** Dateien (`pnpm run test`); u. a. Local AI (`aiProviderService`, embeddings, WebLLM), `data-panel/`, Device-Sync (Zod).
- **Scripts:** **`pnpm run test:scripts`** — 21 Node-Tests (deploy-verify, prune-deployments, repo-truth helpers).
- **Coverage (v8):** ca. **91 %** Statements / **92 %** Lines / **~82 %** Branches / **87 %** Functions — Floors **82 / 80 / 75 / 82** in `apps/web/vitest.config.ts`; Langfrist-Ziel **88 %** siehe `ROADMAP.md` M5.9.
- **E2E:** **16** Playwright-Tests in **11** Specs; PR-Gate **`e2e-gate`** (smoke bei Web-Änderungen).
- **Lighthouse CI (R-009):** PR-Workflow **`lighthouse-ci.yml`** — baut mit `GITHUB_ACTIONS=true`, audit per `vite preview` auf `/CulinaSync-de-/` (wie Pages). Lokal: nach Build `pnpm exec playwright install chromium`, dann `CHROME_PATH=$(find ~/.cache/ms-playwright -name chrome -type f | head -1) GITHUB_ACTIONS=true pnpm run lighthouse:ci`. Mobile optional: `pnpm run lighthouse:ci:mobile` oder `workflow_dispatch` mit `include_mobile`.
- **CI:** `validate.yml` — lint → type-check → test:coverage → **test:scripts** → build → bundle-budget → audit. Playwright **v1.60.0** in **`e2e-smoke.yml`**. PRs: **`i18n:check`** in `ci.yml`. Artefakt **coverage-lcov** (14 Tage).
- **i18n lokal:** `pnpm run i18n:check` vor PR; Vollscan `pnpm run i18n:scan` (Report unter `reports/`, gitignored); nach bereinigten Hardcoded-Strings `pnpm run i18n:baseline:update`.
- **Gemini:** Integrationstests + Zod (`geminiMsw.test.ts`, `geminiService.test.ts`); Schema-Änderungen in `geminiService.ts` mit Tests mitziehen.
- **Wartung:** `db.ts` nicht isoliert testbar (Import-Side-Effects) — Cross-Feature- und Repository-Tests bevorzugen.
- Aktueller Snapshot: [STATUS-2026-10-02.md](./STATUS-2026-10-02.md).
- `pnpm run lint` mit **`--max-warnings 0`**; `react-hooks/exhaustive-deps`, `no-explicit-any`, **`no-floating-promises`** (projectService) sind **`error`**; `no-console` erlaubt nur warn/error/debug (siehe `301-strict-quality-gates.mdc`).
- Vor Release empfohlen: **`pnpm run check:all`** oder mindestens lint, test, build und bei Bundle-Aenderungen `pnpm run check:bundle-budget`.

### Vitest unter Windows / mit Coverage

- Die Suite kann unter jsdom **mehrere Minuten** dauern; `--pool=forks --maxWorkers=2` kann stabilisieren.
- **`vitest run --coverage`** ist langsamer als der reine Testlauf; einzelne RTL/User-Event-Tests haben erhoehtes Timeout (z. B. Tab-Smoke **20 s**), damit Coverage-Instrumentierung nicht in Standard-Timeouts faellt.

### Hinweis 2026-04-22 (historisch)

- Accessibility- und i18n-Slices wurden mit gezielten Diagnostics und ESLint geprueft; Typcheck damals ueber `tsgo` / `tsc`.
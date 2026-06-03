# Testing

## Test-Stack

- Vitest
- Testing Library
- MSW
- jsdom

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
pnpm run test:e2e   # Playwright (lokal: vorher `pnpm exec playwright install chromium`)
```

**E2E-Specs (`apps/web/e2e/`):**

| Datei | Abdeckung |
|-------|-----------|
| `smoke.spec.ts` | Startseite lädt |
| `navigation-offline.spec.ts` | Navigation Desktop/Mobile, Offline-Banner |
| `sync-settings.spec.ts` | Daten-Panel, QR-Modal, Nextcloud-Probe (mock WebDAV) |
| `chef-local.spec.ts` | Local-AI Strict-Toggle, KI-Chef erreichbar |
| `pantry-cook.spec.ts` | Vorratskammer: Artikel anlegen |
| `helpers/appStorage.ts`, `helpers/navigation.ts` | Onboarding aus, Navigation |

**E2E lokal (wie CI / GitHub Pages):**

```bash
CI=true GITHUB_ACTIONS=true pnpm run build
cd apps/web && CI=true pnpm exec playwright test
```

**E2E in GitHub Actions:** Workflow [`.github/workflows/e2e-smoke.yml`](../.github/workflows/e2e-smoke.yml) — Container **`mcr.microsoft.com/playwright:v1.60.0-noble`** (muss zur `@playwright/test`-Version in `package.json` passen); bei Push/PR auf `apps/web/**` und wöchentlich; manuell unter **Actions → E2E Smoke → Run workflow**.

Ohne globales pnpm (z. B. Windows): `npm run test`, `npm run check:all` oder `npx pnpm@10 run test`.

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

## Aktueller Validierungsstand 2026-06-03 (M5+ / Perfection Stufe 1)

- **Vitest:** **448** Tests in **106** Dateien (`pnpm run test`); u. a. `localAiWebLlmService`, `aiProviderService`, `localAiRagService`, `@domain/ai-core` provider chain.
- **Scripts:** **`pnpm run test:scripts`** — 5 Node-Tests für `scripts/lib/deploy-verify-logic.mjs` (auch in CI validate).
- **Coverage (v8):** ca. **79,1 %** Statements / **80,6 %** Lines / **63,7 %** Branches / **74,5 %** Functions — Thresholds **80 / 78 / 73 / 63** in `apps/web/vitest.config.ts`; Langfrist-Ziel **88 %** siehe `ROADMAP.md` M5.9.
- **E2E:** **9** Playwright-Tests (`CI=true pnpm run test:e2e` nach `pnpm run build`).
- **CI:** `validate.yml` — lint → type-check → test:coverage → **test:scripts** → build → bundle-budget → audit. Playwright **v1.60.0** in **`e2e-smoke.yml`**. PRs: **`i18n:check`** in `ci.yml`. Artefakt **coverage-lcov** (14 Tage).
- **i18n lokal:** `pnpm run i18n:check` vor PR; Vollscan `pnpm run i18n:scan` (Report unter `reports/`, gitignored); nach bereinigten Hardcoded-Strings `pnpm run i18n:baseline:update`.
- **Gemini:** Integrationstests + Zod (`geminiMsw.test.ts`, `geminiService.test.ts`); Schema-Änderungen in `geminiService.ts` mit Tests mitziehen.
- **Wartung:** `db.ts` nicht isoliert testbar (Import-Side-Effects) — Cross-Feature- und Repository-Tests bevorzugen.
- Aktueller Snapshot: [STATUS-2026-06-03.md](./STATUS-2026-06-03.md); Vorgänger: [STATUS-2026-06-02.md](./STATUS-2026-06-02.md).
- `pnpm run lint` mit **`--max-warnings 0`**; `react-hooks/exhaustive-deps` und `no-explicit-any` sind **`error`**; `no-console` erlaubt nur warn/error/debug (siehe `301-strict-quality-gates.mdc`).
- Vor Release empfohlen: **`pnpm run check:all`** oder mindestens lint, test, build und bei Bundle-Aenderungen `pnpm run check:bundle-budget`.

### Vitest unter Windows / mit Coverage

- Die Suite kann unter jsdom **mehrere Minuten** dauern; `--pool=forks --maxWorkers=2` kann stabilisieren.
- **`vitest run --coverage`** ist langsamer als der reine Testlauf; einzelne RTL/User-Event-Tests haben erhoehtes Timeout (z. B. Tab-Smoke **20 s**), damit Coverage-Instrumentierung nicht in Standard-Timeouts faellt.

### Hinweis 2026-04-22 (historisch)

- Accessibility- und i18n-Slices wurden mit gezielten Diagnostics und ESLint geprueft; Typcheck damals ueber `tsgo` / `tsc`.
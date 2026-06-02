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
pnpm run check:all
```

Ohne globales pnpm (z. B. Windows): `npm run test`, `npm run check:all` oder `npx pnpm@10 run test`.

**`check:all`:** `lint` → `type-check` (`tsgo`) → `test` → `build` → `check:bundle-budget` → `npm audit --audit-level=high`.

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

## Aktueller Validierungsstand 2026-06-02 (M5 abgeschlossen)

- **Vitest:** **362** Tests in **85** Dateien (`pnpm run test`); M5-Suites u. a. Repositories, `geminiService`, UI-Smoke (Header, MealPlanner, RecipeDetail), `MealPlanModal`, `serviceRegistry`, erweiterte `useShoppingList`/`useRecipeDetail`.
- **Coverage (v8):** ca. **78 %** Statements / **79 %** Lines / **63 %** Branches / **72,5 %** Functions — PRD-Ziel (≥70/≥70/≥70/≥60) **erreicht**; **`apps/web/vitest.config.ts`** Thresholds **77 / 79 / 72 / 62**.
- **CI:** `.github/workflows/validate.yml` — lint → type-check → test:coverage → build → bundle-budget → **`pnpm audit --audit-level=high`**. Playwright-Smoke in **`e2e-smoke.yml`** (nicht auf jedem PR-Validate). Artefakt **coverage-lcov** (14 Tage). PRs: **i18n-check** (`ci.yml`).
- **Gemini:** Integrationstests + Zod (`geminiMsw.test.ts`, `geminiService.test.ts`); Schema-Änderungen in `geminiService.ts` mit Tests mitziehen.
- **Wartung:** `db.ts` nicht isoliert testbar (Import-Side-Effects) — Cross-Feature- und Repository-Tests bevorzugen.
- Aktueller Snapshot: [STATUS-2026-05-04.md](./STATUS-2026-05-04.md); Vorgaenger: [STATUS-2026-05-02.md](./STATUS-2026-05-02.md).
- `pnpm run lint` mit `--max-warnings 0`; generiertes **`coverage/**`** ist ESLint-ignoriert; `react-hooks/exhaustive-deps` ist auf **`warn`** — Warnungen im geaenderten Code abbauen, bevor auf `error` verschärft wird.
- Vor Release empfohlen: **`pnpm run check:all`** oder mindestens lint, test, build und bei Bundle-Aenderungen `pnpm run check:bundle-budget`.

### Vitest unter Windows / mit Coverage

- Die Suite kann unter jsdom **mehrere Minuten** dauern; `--pool=forks --maxWorkers=2` kann stabilisieren.
- **`vitest run --coverage`** ist langsamer als der reine Testlauf; einzelne RTL/User-Event-Tests haben erhoehtes Timeout (z. B. Tab-Smoke **20 s**), damit Coverage-Instrumentierung nicht in Standard-Timeouts faellt.

### Hinweis 2026-04-22 (historisch)

- Accessibility- und i18n-Slices wurden mit gezielten Diagnostics und ESLint geprueft; Typcheck damals ueber `tsgo` / `tsc`.
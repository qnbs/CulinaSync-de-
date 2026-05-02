# Testing

## Test-Stack

- Vitest
- Testing Library
- MSW
- jsdom

## Relevante Testorte

- `src/components/**/__tests__/` — u. a. `cook-mode/__tests__/cookModeReducer.test.ts`, `meal-planner/__tests__/mealPlannerConstants.test.ts`, **`components/__tests__/MealPlanner.smoke.test.tsx`**, **`CookModeView.smoke.test.tsx`**, **`recipe-detail/__tests__/RecipeDetailTabs.smoke.test.tsx`**
- `src/contexts/__tests__/` — **`MealPlannerContext.test.tsx`**, **`PantryManagerContext.test.tsx`**
- `src/hooks/__tests__/` — **`useMealPlannerScreen.test.tsx`**, **`useCookModeController.test.tsx`**, **`useMealPlan.test.tsx`**, **`useShoppingList.test.tsx`**
- `src/services/__tests__/` — u. a. `voiceCommands.test.ts`, `dataRepository.test.ts`, `utilsCategories.test.ts`, `settingsService.test.ts`, `geminiService.test.ts`, **`geminiMsw.test.ts`** (HTTP-Mock + **Zod**)
- `src/store/__tests__/`
- `src/test/` — `setupTests.ts`, MSW (`msw/server.ts`, `msw/handlers.ts`), **`createTestStore.ts`** (Redux-Teststore ohne Persist)

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

## Aktueller Validierungsstand 2026-05-02

- **Vitest:** **93** Tests; neue Suites fuer MealPlanner-Context/Hooks, Kochmodus-Controller, drei Smoke-Oberflaechen; **`geminiMsw.test.ts`** validiert MSW-Responses mit Zod.
- **Coverage (v8, Stand Mai 2026):** ca. **37 %** Statements / **39 %** Lines — Ziel ≥70 % laut [ROADMAP.md](../ROADMAP.md) M5 weiterhin offen.
- **CI:** `.github/workflows/validate.yml` fuehrt **`pnpm run test:coverage`** aus und laedt das Verzeichnis **`coverage`** als Artefakt **coverage-lcov** (14 Tage); **Bundle-Budget** laeuft bei jedem Validate (PR + Deploy-Pfad).
- Service- und Reducer-Tests wie oben; **Gemini-Integration** prueft u. a. gueltige JSON-Struktur (Zod); bei Typveraenderungen der KI-Antworten Tests und Schemas in `geminiService.ts` anpassen.
- Aktueller Snapshot: [STATUS-2026-05-02.md](./STATUS-2026-05-02.md); Vorgaenger: [STATUS-2026-05-01.md](./STATUS-2026-05-01.md).
- `pnpm run lint` mit `--max-warnings 0`; generiertes **`coverage/**`** ist ESLint-ignoriert; `react-hooks/exhaustive-deps` ist bewusst **off** — bei lokaler Aktivierung auf `warn` alle Warnungen abbauen, bevor CI verschärft wird.
- Vor Release empfohlen: **`pnpm run check:all`** oder mindestens lint, test, build und bei Bundle-Aenderungen `pnpm run check:bundle-budget`.

### Vitest unter Windows / mit Coverage

- Die Suite kann unter jsdom **mehrere Minuten** dauern; `--pool=forks --maxWorkers=2` kann stabilisieren.
- **`vitest run --coverage`** ist langsamer als der reine Testlauf; einzelne RTL/User-Event-Tests haben erhoehtes Timeout (z. B. Tab-Smoke **20 s**), damit Coverage-Instrumentierung nicht in Standard-Timeouts faellt.

### Hinweis 2026-04-22 (historisch)

- Accessibility- und i18n-Slices wurden mit gezielten Diagnostics und ESLint geprueft; Typcheck damals ueber `tsgo` / `tsc`.
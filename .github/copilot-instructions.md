# Copilot Instructions for CulinaSync

## Projekt-Orientierung
- CulinaSync ist eine React 19 + Vite 8 PWA mit **Local-First** Datenhaltung in IndexedDB via Dexie.
- **Monorepo:** Turborepo + pnpm; Web-App in `apps/web/`, Shared-Packages in `packages/ai-core`, `packages/ui`.
- Die App ist feature-orientiert aufgebaut (`apps/web/src/components/*`, `apps/web/src/hooks/*`, `apps/web/src/services/*`, `apps/web/src/store/*`).
- `apps/web/src/App.tsx` ist der Shell-Orchestrator: Navigation, lazy-loaded Seiten, Command Palette, Voice-Trigger, Toasts.
- **App-Entry:** `apps/web/index.tsx` (nicht Repo-Root). Build/Test-Konfiguration: `apps/web/vite.config.ts`, `apps/web/vitest.config.ts`, `apps/web/tsconfig.json`.

## State- & Datenarchitektur (wichtig)
- Nutze Redux primär für **UI-/Session-Zustand** (z. B. `uiSlice`, `shoppingListSlice`, `aiChefSlice`).
- Nutze Dexie als **Source of Truth** für Domänendaten (`pantry`, `recipes`, `mealPlan`, `shoppingList`).
- Lies persistente Listen reaktiv über `useLiveQuery` (siehe `apps/web/src/hooks/useShoppingList.ts`, `apps/web/src/hooks/useMealPlan.ts`).
- Schreibe Domänendaten über Repository-Funktionen aus `apps/web/src/services/db.ts` (re-export), nicht direkt in Komponenten.

## Service-Grenzen & Datenfluss
- `apps/web/src/services/db.ts` enthält Initialisierungs-Side-Effects (populate, hooks, seed-sync) und muss als API-Einstiegspunkt genutzt werden.
- Pantry-Änderungen triggern Match-Recalculation über Dexie-Hooks + Debounce (`apps/web/src/services/pantryMatcherService.ts`).
- Cross-Feature-Operationen laufen transaktional in Repositories (z. B. `deleteRecipe` aktualisiert `recipes`, `mealPlan`, `shoppingList`).
- Fehler-Toasting für async Redux-Aktionen ist zentral im Listener-Middleware verdrahtet (`apps/web/src/store/listenerMiddleware.ts`).

## Komponenten-Architektur
- Top-Level-Seiten liegen in `apps/web/src/components/` (z. B. `PantryManager.tsx`, `RecipeBook.tsx`, `MealPlanner.tsx`).
- Feature-Subkomponenten liegen in Feature-Ordnern (z. B. `apps/web/src/components/pantry/`, `apps/web/src/components/shopping-list/`).
- `PantryManager`, `ShoppingList` und **`MealPlanner`** nutzen das **Context-Provider-Pattern** (`apps/web/src/contexts/`): `PantryManagerContext`, `ShoppingListContext`, `MealPlannerContext` mit Hooks `usePantryManagerContext`, `useShoppingListContext`, `useMealPlannerContext`. Datenaggregation fuer den Plan: `useMealPlannerScreen.ts`.
- Modals sollten in eigene Dateien extrahiert werden (nicht inline definieren).
- Alle Modals müssen `useModalA11y` Hook verwenden (Fokus-Trap, Escape-Close, Body-Scroll-Lock).

## UI-Interaktionsmuster
- Navigation mit optionalem Fokus erfolgt über `setCurrentPage({ page, focusTarget })` und `focusAction` (`apps/web/src/store/slices/uiSlice.ts`).
- Sprachkommandos werden in `processCommand` geparst und via `executeVoiceAction` ausgeführt (`apps/web/src/services/voiceCommands.ts`).
- Für kontextsensitive Folgeaktionen wird `voiceAction` im UI-State gesetzt und in Hooks verarbeitet (z. B. `useShoppingList`).

## KI-Integration (Gemini)
- Gemini-Aufrufe liegen ausschließlich in `apps/web/src/services/geminiService.ts`.
- **API-Key wird NICHT im Build eingebettet.** Nutzer geben ihren Key über UI ein (Einstellungen → API-Schlüssel).
- Key-Speicherung erfolgt lokal verschlüsselt in IndexedDB via `apps/web/src/services/apiKeyService.ts` – niemals localStorage oder env-Variablen.
- Der `GoogleGenAI`-Client wird dynamisch per `getAIClient()` aus dem gespeicherten Key erstellt und gecacht.
- Antworten werden über JSON-Schema (`responseSchema`) von der API erzwungen; **zusätzlich** nach `JSON.parse` mit **Zod** validiert (`parseAiJsonWithSchema` in `geminiService.ts`).
- Fehler werden auf nutzerfreundliche deutsche Meldungen gemappt (`handleGeminiError`).
- Beim Erweitern von KI-Features: bestehende Struktur `generate*` + typed Rückgaben + rejectWithValue in Slices befolgen.
- Offline-Fallback nutzt `@faker-js/faker` für Demo-Daten bereits nur noch per dynamischem `import()`.

## Path-Alias
- `@/*` mappt auf `apps/web/src/*` (konfiguriert in `apps/web/tsconfig.json` und `apps/web/vite.config.ts`).
- Verwende `@/services/db` statt relativer Pfade wie `../../services/db`.

## i18n, Settings, Persistenz
- i18n wird einmalig in `apps/web/index.tsx` über `import './src/i18n'` initialisiert.
- Locale-Dateien sind pro Sprache in `apps/web/src/locales/{de,en}/core.json`, `settings.json` und `features.json` aufgeteilt und werden über `index.ts` aggregiert.
- Sprach-/App-Defaults kommen aus `loadSettings()` (`apps/web/src/services/settingsService.ts`) und sind tief gemerged.
- Redux Persist speichert nur den `settings`-Slice (`apps/web/src/store/index.ts`), nicht die Dexie-Tabellen.
- Legacy-`culinaSyncSettings` wird per `migrateLegacySettings()` in `persist:settings` migriert (Bootstrap `store/migrateLegacySettingsBeforePersist.ts`). `loadSettings()` liest nur Persist oder Defaults — **kein** direktes Lesen des Legacy-Keys. Hilfen: `settingsKeys.ts`, `settingsMerge.ts`.

## Testing
- **Framework:** Vitest + MSW (Mock Service Worker) fuer Service- und UI-nahe Tests.
- **Testverzeichnisse:** `apps/web/src/test/` (inkl. `createTestStore.ts`, MSW), `apps/web/src/components/**/__tests__/`, `apps/web/src/contexts/__tests__/`, `apps/web/src/hooks/__tests__/`, `apps/web/src/services/__tests__/`, `apps/web/src/store/__tests__/`.
- **Benennung:** `*.test.ts` / `*.test.tsx` für Testdateien.
- **Konfiguration:** `apps/web/vitest.config.ts`; ESLint ignoriert `coverage/**`.
- **Coverage (M5 ✅, Juni 2026):** ca. **78,6 %** stmts / **80,2 %** lines / **74,5 %** funcs / **62,9 %** branches (v8); Thresholds **77/79/72/62** in `apps/web/vitest.config.ts`. **404** Vitest-Tests / **99** Dateien + **`pnpm run test:scripts`** (Deploy-Verify). **CI:** `validate.yml` (lint → type-check → test:coverage → **test:scripts** → build → audit); Playwright **v1.60.0** in `e2e-smoke.yml`; Artefakt **coverage-lcov**. Status: `docs/STATUS-2026-06-03.md`.
- **Ausfuehrung:** `pnpm run test`, `pnpm run test:coverage`, `pnpm run test:scripts`, `pnpm run i18n:check`; lokal vollstaendig `pnpm run check:all` (inkl. test:scripts, i18n, audit high).
- Vor `pnpm run build` immer zuerst Diagnostics fuer die geaenderten Dateien pruefen (`get_errors` bzw. Problems-Panel).
- Typecheck im Alltag: `pnpm run type-check` (**tsgo**). `tsc` wird von ESLint/Vitest als API genutzt — nicht den Full-Build mit purem `tsc` verwechseln (`pnpm run build` = `tsgo && vite build`).
- Der Full-Build ist der Integrations-Check am Ende und soll nicht der erste Schritt sein, in dem neue Typefehler entdeckt werden.
- Vor Commit oder Push immer mindestens fuer den geaenderten Slice ausfuehren: Diagnostics (`get_errors`), relevante Tests, Typecheck bei TS-Aenderungen und `pnpm run lint`.
- Falls spaeter ein dedizierter Formatter wie Prettier konfiguriert wird, soll er vor Commit/Push ebenfalls fuer den geaenderten Slice laufen. Aktuell ist kein Prettier-Setup im Repo vorhanden, daher nichts erzwingen, was nicht existiert.

## Error-Handling
- Zentrale Fehler-Logging-Funktion: `logAppError()` aus `apps/web/src/services/errorLoggingService.ts`.
- Async-Thunk-Fehler werden via `listenerMiddleware` automatisch als Toast angezeigt.
- `GlobalErrorBoundary` fängt ungefangene React-Fehler ab.
- Feature-spezifische Error Boundaries sind empfohlen für isolierte Fehlerbehandlung.

## Performance-Patterns
- Alle Seiten-Komponenten werden via `React.lazy()` geladen (`apps/web/src/App.tsx`).
- `manualChunks` in `apps/web/vite.config.ts` splittet Vendor-Chunks (u. a. react, redux, dexie, export).
- Schwere Dependencies (`tesseract.js`, `@ericblade/quagga2`, Export-Libs) sollten immer via dynamischem `import()` geladen werden.
- `vite-plugin-compression` generiert Brotli fuer statische Assets.

## Barrierefreiheit (A11y)
- Alle Modals: `useModalA11y` Hook verwenden (inkl. `role="dialog"`, `aria-modal`, Fokus-Trap).
- Navigations-Elemente nutzen `aria-current="page"`.
- Interaktive Elemente: `<button>` für Aktionen, `<a>` nur für echte Links. Kein `<a onClick>` ohne `href`.
- `aria-label` für Icon-only Buttons.
- `aria-expanded` für Accordions und Dropdowns.
- Icon-only-Buttons: `aria-label` (und wo passend `aria-pressed`); Recipe-Detail-Tabs: `role="tablist"` / `tab` / `tabpanel`; globale Banner mit `role="dialog"` wenn modal wirken; Voice-Feedback-Bubbles: `role="status"` / `aria-live`.

## Workflows
- Dev: `pnpm run dev`
- Build: `pnpm run build` (**tsgo** + vite build)
- Lint: `pnpm run lint`
- Test: `pnpm run test`
- Preview: `pnpm run preview`
- Reihenfolge fuer Agent-Aenderungen: lokales Lesen/Suchen, kleine Edits, fokussierte Tests/Diagnostics, Typecheck/Lint fuer den geaenderten Slice, erst danach Full-Build.
- Vor Commit/Push dieselbe Reihenfolge einhalten; Committen oder Pushen ohne vorherige lokale Validierung ist nur im echten Notfall zulaessig und muss dann im Verlauf explizit benannt werden.
- Deploy: Automatisch via GitHub Actions bei Push auf `main` (`.github/workflows/deploy.yml`)
- CI: Lint + Tests + Build über `validate.yml`; PR-i18n-Job und Validate nutzen **Node.js 24** (`setup-node`); Env `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` gesetzt
- **i18n-Gate (PR):** `pnpm run i18n:check` (de/en-Key-Parität + Production-Baseline); `pnpm run i18n:check:changed -- origin/main` für neue Hardcoded-Strings; `pnpm run i18n:scan` → `reports/` (gitignored); Baseline senken: `pnpm run i18n:baseline:update`
- Security: CodeQL-Analyse bei PRs und Push auf `main` (`.github/workflows/codeql.yml`)
- `base` in `apps/web/vite.config.ts` wird dynamisch gesetzt: `/CulinaSync-de-/` in CI, `/` lokal.
- GitHub-verwaltete Pages-Actions koennen trotz Node-24-Opt-in aktuell noch Node-20-Depracation-Warnungen emittieren. Das ist derzeit ein Upstream-Thema.
- Nach JEDEM Push muss der zugehörige CI-/Deploy-Lauf aktiv beobachtet werden, bis CI, CodeQL und Deploy erfolgreich abgeschlossen bzw. nachvollziehbar grün sind.
- Wenn nach einem Push ein relevanter Workflow fehlschlägt, ist der Vorgang nicht abgeschlossen: Fehlerursachen muessen vollständig analysiert, lokal behoben, erneut validiert, committed, gepusht und wieder beobachtet werden.
- Dieser Fix-/Commit-/Push-/Beobachtungszyklus wird so lange wiederholt, bis der Repo-Zustand grün ist und der Deploy-Lauf erfolgreich abgeschlossen wurde.
- Ein Push ohne anschließende Beobachtung der Workflows gilt in diesem Repo nicht als Abschluss.

## PR-Review (CodeAnt, Copilot, Bugbot — dauerhaft)

- **Vor Merge:** Alle Inline-PR-Kommentare proaktiv abarbeiten — Fix, Test, oder kurze begründete Ablehnung.
- **Priorität:** Security/Daten > Architektur-Regeln (Dexie, `geminiService`, kein `VITE_*`) > Tests > Style-Nits.
- **Keine offenen Review-Threads** ohne Antwort; kleine Bot-Nits mitfixen, wenn &lt; 5 Minuten.
- **Nach Fixes:** lint + type-check + betroffene Vitest-Suites; bei UI-Strings `pnpm run i18n:check`.
- **Audit-Backlog:** `docs/AUDIT-REMEDIATION-BACKLOG.md`; vollständiger Report `docs/AUDIT-vNEXT-2026-06-03.md`.
- Cursor-Regel: `.cursor/rules/300-pr-review-automation.mdc` (alwaysApply).

## Terminal-Nutzung
- Terminal-Befehle dürfen ausgeführt werden, wenn sie zur Aufgabe beitragen (z. B. `pnpm install`, `pnpm run build`, `tsc --noEmit`, `pnpm run test`).
- Verwende immer nur **ein einziges** Terminal.
- Öffne niemals ein neues Terminal, solange ein bestehendes aktiv ist.
- Führe mehrere Befehle nach Möglichkeit nacheinander im selben Terminal aus, z. B. mit `&&` oder `;`.
- Kombiniere Befehle, wenn es sinnvoll ist, statt sie in neuen oder separaten Terminals zu starten.
- Warte geduldig auf die Ausgabe eines Befehls, bevor du den nächsten startest. Gehe nicht vorschnell von einem Hänger aus, nur weil ein Schritt 5 bis 15 Sekunden dauert.
- Wenn ein Befehl länger läuft, frage zuerst nach, bevor du parallel etwas Neues startest.
- Long-Running-Prozesse wie `pnpm run dev` oder andere Dev-Server dürfen nur dann im Hintergrund gestartet werden, wenn dies ausdrücklich erlaubt wurde.
- Beispiel für die gewünschte Nutzung eines einzelnen Terminals: `cd frontend && pnpm run dev`.

## Projekt-spezifische Konventionen
- Bevorzuge deutsche UX-Texte; Änderungen in Übersetzungen in `apps/web/src/locales/de/` und `apps/web/src/locales/en/` synchron halten und in die passende Domain-Datei (`core`, `settings`, `features`) einsortieren.
- Behalte bestehende Namensmuster bei: Async-Thunks mit Suffix `Async`, UI-Hooks kapseln Handler/Toasts, Services enthalten Geschäftslogik.
- Verwende bestehende Utility-Pfade (`apps/web/src/services/utils.ts`, Export-Services) statt duplizierter Parsing-/Export-Logik.
- **Niemals** API-Keys über `process.env` oder `VITE_`-Variablen einbetten – immer `apiKeyService.ts` nutzen.
- Alle Dokumentationsänderungen in `CHANGELOG.md` nach [keepachangelog](https://keepachangelog.com/de/1.1.0/) Format eintragen.

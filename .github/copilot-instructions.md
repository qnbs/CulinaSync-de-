# Copilot Instructions for CulinaSync

## Projekt-Orientierung
- CulinaSync ist eine React 19 + Vite 5 PWA mit **Local-First** Datenhaltung in IndexedDB via Dexie.
- Die App ist feature-orientiert aufgebaut (`src/components/*`, `src/hooks/*`, `src/services/*`, `src/store/*`).
- `src/App.tsx` ist der Shell-Orchestrator: Navigation, lazy-loaded Seiten, Command Palette, Voice-Trigger, Toasts.
- **Root-Level-Dateien:** `index.tsx` (App-Entry) liegt im Root, nicht in `src/`. Es wird in `tsconfig.json` via `include` eingebunden.

## State- & Datenarchitektur (wichtig)
- Nutze Redux primär für **UI-/Session-Zustand** (z. B. `uiSlice`, `shoppingListSlice`, `aiChefSlice`).
- Nutze Dexie als **Source of Truth** für Domänendaten (`pantry`, `recipes`, `mealPlan`, `shoppingList`).
- Lies persistente Listen reaktiv über `useLiveQuery` (siehe `src/hooks/useShoppingList.ts`, `src/hooks/useMealPlan.ts`).
- Schreibe Domänendaten über Repository-Funktionen aus `src/services/db.ts` (re-export), nicht direkt in Komponenten.

## Service-Grenzen & Datenfluss
- `src/services/db.ts` enthält Initialisierungs-Side-Effects (populate, hooks, seed-sync) und muss als API-Einstiegspunkt genutzt werden.
- Pantry-Änderungen triggern Match-Recalculation über Dexie-Hooks + Debounce (`src/services/pantryMatcherService.ts`).
- Cross-Feature-Operationen laufen transaktional in Repositories (z. B. `deleteRecipe` aktualisiert `recipes`, `mealPlan`, `shoppingList`).
- Fehler-Toasting für async Redux-Aktionen ist zentral im Listener-Middleware verdrahtet (`src/store/listenerMiddleware.ts`).

## Komponenten-Architektur
- Top-Level-Seiten liegen in `src/components/` (z. B. `PantryManager.tsx`, `RecipeBook.tsx`, `MealPlanner.tsx`).
- Feature-Subkomponenten liegen in Feature-Ordnern (z. B. `src/components/pantry/`, `src/components/shopping-list/`).
- `PantryManager` und `ShoppingList` nutzen das **Context-Provider-Pattern** (`src/contexts/`). Neue Features mit komplexem State sollten diesem Muster folgen.
- Modals sollten in eigene Dateien extrahiert werden (nicht inline definieren).
- Alle Modals müssen `useModalA11y` Hook verwenden (Fokus-Trap, Escape-Close, Body-Scroll-Lock).

## UI-Interaktionsmuster
- Navigation mit optionalem Fokus erfolgt über `setCurrentPage({ page, focusTarget })` und `focusAction` (`src/store/slices/uiSlice.ts`).
- Sprachkommandos werden in `processCommand` geparst und via `executeVoiceAction` ausgeführt (`src/services/voiceCommands.ts`).
- Für kontextsensitive Folgeaktionen wird `voiceAction` im UI-State gesetzt und in Hooks verarbeitet (z. B. `useShoppingList`).

## KI-Integration (Gemini)
- Gemini-Aufrufe liegen ausschließlich in `src/services/geminiService.ts`.
- **API-Key wird NICHT im Build eingebettet.** Nutzer geben ihren Key über UI ein (Einstellungen → API-Schlüssel).
- Key-Speicherung erfolgt obfuskiert in IndexedDB via `src/services/apiKeyService.ts` – niemals localStorage oder env-Variablen.
- Der `GoogleGenAI`-Client wird dynamisch per `getAIClient()` aus dem gespeicherten Key erstellt und gecacht.
- Antworten werden über JSON-Schema (`responseSchema`) erzwungen; beibehalten statt freiem Textparsing.
- Fehler werden auf nutzerfreundliche deutsche Meldungen gemappt (`handleGeminiError`).
- Beim Erweitern von KI-Features: bestehende Struktur `generate*` + typed Rückgaben + rejectWithValue in Slices befolgen.
- Offline-Fallback nutzt `@faker-js/faker` für Demo-Daten. Dieser Import sollte langfristig auf dynamischen `import()` umgestellt werden.

## Path-Alias
- `@/*` mappt auf `src/*` (konfiguriert in `tsconfig.json` und `vite.config.ts`).
- Verwende `@/services/db` statt relativer Pfade wie `../../services/db`.

## i18n, Settings, Persistenz
- i18n wird einmalig in `index.tsx` über `import './src/i18n'` initialisiert.
- Sprach-/App-Defaults kommen aus `loadSettings()` (`src/services/settingsService.ts`) und sind tief gemerged.
- Redux Persist speichert nur den `settings`-Slice (`src/store/index.ts`), nicht die Dexie-Tabellen.
- **Bekanntes Issue:** Settings werden aktuell doppelt persistiert (Redux Persist + `settingsService` localStorage). Bei Änderungen an der Persistierung darauf achten.

## Testing
- **Framework:** Vitest + MSW (Mock Service Worker) für Service-Tests.
- **Testverzeichnis:** `src/test/` (z. B. `src/test/geminiService.test.ts`, `src/test/msw/`).
- **Benennung:** `*.test.ts` / `*.test.tsx` für Testdateien.
- **Konfiguration:** `vitest.config.ts` im Root.
- **Coverage:** Aktuell ~35 % (nur `geminiService` getestet). Neue Features sollten Tests mitbringen.
- **Ausführung:** `npm test` oder `npm run test:coverage`.

## Error-Handling
- Zentrale Fehler-Logging-Funktion: `logAppError()` aus `src/services/errorLoggingService.ts`.
- Async-Thunk-Fehler werden via `listenerMiddleware` automatisch als Toast angezeigt.
- `GlobalErrorBoundary` fängt ungefangene React-Fehler ab.
- Feature-spezifische Error Boundaries sind empfohlen für isolierte Fehlerbehandlung.

## Performance-Patterns
- Alle Seiten-Komponenten werden via `React.lazy()` geladen (`src/App.tsx`).
- `manualChunks` in `vite.config.ts` splittet: `react-vendor`, `redux-vendor`, `dexie-vendor`, `react-window`.
- Schwere Dependencies (`tesseract.js`, `@ericblade/quagga2`, Export-Libs) sollten immer via dynamischem `import()` geladen werden.
- `vite-plugin-compression` generiert Brotli + Gzip für statische Assets.

## Barrierefreiheit (A11y)
- Alle Modals: `useModalA11y` Hook verwenden (inkl. `role="dialog"`, `aria-modal`, Fokus-Trap).
- Navigations-Elemente nutzen `aria-current="page"`.
- Interaktive Elemente: `<button>` für Aktionen, `<a>` nur für echte Links. Kein `<a onClick>` ohne `href`.
- `aria-label` für Icon-only Buttons.
- `aria-expanded` für Accordions und Dropdowns.

## Workflows
- Dev: `npm run dev`
- Build: `npm run build` (tsc + vite build)
- Lint: `npm run lint`
- Test: `npm test`
- Preview: `npm run preview`
- Deploy: Automatisch via GitHub Actions bei Push auf `main` (`.github/workflows/deploy.yml`)
- CI: Lint + TypeScript-Check + Tests + Bundle-Budget bei PRs und Push auf `main` (`.github/workflows/ci.yml`)
- Security: CodeQL-Analyse bei PRs und Push auf `main` (`.github/workflows/codeql.yml`)
- `base` in `vite.config.ts` wird dynamisch gesetzt: `/CulinaSync-de-/` in CI, `/` lokal.

## Projekt-spezifische Konventionen
- Bevorzuge deutsche UX-Texte; Änderungen in Übersetzungen in `src/locales/de/translation.json` und `src/locales/en/translation.json` synchron halten.
- Behalte bestehende Namensmuster bei: Async-Thunks mit Suffix `Async`, UI-Hooks kapseln Handler/Toasts, Services enthalten Geschäftslogik.
- Verwende bestehende Utility-Pfade (`src/services/utils.ts`, Export-Services) statt duplizierter Parsing-/Export-Logik.
- **Niemals** API-Keys über `process.env` oder `VITE_`-Variablen einbetten – immer `apiKeyService.ts` nutzen.
- Alle Dokumentationsänderungen in `CHANGELOG.md` nach [keepachangelog](https://keepachangelog.com/de/1.1.0/) Format eintragen.

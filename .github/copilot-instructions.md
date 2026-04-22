# Copilot Instructions for CulinaSync

## Projekt-Orientierung
- CulinaSync ist eine React 19 + Vite 8 PWA mit **Local-First** Datenhaltung in IndexedDB via Dexie.
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
- **Framework:** Vitest + MSW (Mock Service Worker) fuer Service- und UI-nahe Tests.
- **Testverzeichnisse:** `src/test/`, `src/components/**/__tests__/`, `src/services/__tests__/`.
- **Benennung:** `*.test.ts` / `*.test.tsx` für Testdateien.
- **Konfiguration:** `vitest.config.ts` im Root.
- **Coverage:** Aktuell ~35 % (nur `geminiService` getestet). Neue Features sollten Tests mitbringen.
- **Ausfuehrung:** `pnpm run test` oder `pnpm run test:coverage`.
- Vor `pnpm run build` immer zuerst Diagnostics fuer die geaenderten Dateien pruefen (`get_errors` bzw. Problems-Panel).
- Wenn TypeScript-relevante Dateien betroffen sind, vor dem Full-Build mindestens einen Typecheck fuer den geaenderten Slice oder `pnpm exec tsc --noEmit` ausfuehren.
- Der Full-Build ist der Integrations-Check am Ende und soll nicht der erste Schritt sein, in dem neue Typefehler entdeckt werden.
- Vor Commit oder Push immer mindestens fuer den geaenderten Slice ausfuehren: Diagnostics (`get_errors`), relevante Tests, Typecheck bei TS-Aenderungen und `pnpm run lint`.
- Falls spaeter ein dedizierter Formatter wie Prettier konfiguriert wird, soll er vor Commit/Push ebenfalls fuer den geaenderten Slice laufen. Aktuell ist kein Prettier-Setup im Repo vorhanden, daher nichts erzwingen, was nicht existiert.

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
- Dev: `pnpm run dev`
- Build: `pnpm run build` (tsc + vite build)
- Lint: `pnpm run lint`
- Test: `pnpm run test`
- Preview: `pnpm run preview`
- Reihenfolge fuer Agent-Aenderungen: lokales Lesen/Suchen, kleine Edits, fokussierte Tests/Diagnostics, Typecheck/Lint fuer den geaenderten Slice, erst danach Full-Build.
- Vor Commit/Push dieselbe Reihenfolge einhalten; Committen oder Pushen ohne vorherige lokale Validierung ist nur im echten Notfall zulaessig und muss dann im Verlauf explizit benannt werden.
- Deploy: Automatisch via GitHub Actions bei Push auf `main` (`.github/workflows/deploy.yml`)
- CI: Lint + TypeScript-Check + Tests + Bundle-Budget bei PRs und Push auf `main` (`.github/workflows/ci.yml`)
- Security: CodeQL-Analyse bei PRs und Push auf `main` (`.github/workflows/codeql.yml`)
- `base` in `vite.config.ts` wird dynamisch gesetzt: `/CulinaSync-de-/` in CI, `/` lokal.
- GitHub-verwaltete Pages-Actions koennen trotz Node-24-Opt-in aktuell noch Node-20-Depracation-Warnungen emittieren. Das ist derzeit ein Upstream-Thema.

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
- Bevorzuge deutsche UX-Texte; Änderungen in Übersetzungen in `src/locales/de/translation.json` und `src/locales/en/translation.json` synchron halten.
- Behalte bestehende Namensmuster bei: Async-Thunks mit Suffix `Async`, UI-Hooks kapseln Handler/Toasts, Services enthalten Geschäftslogik.
- Verwende bestehende Utility-Pfade (`src/services/utils.ts`, Export-Services) statt duplizierter Parsing-/Export-Logik.
- **Niemals** API-Keys über `process.env` oder `VITE_`-Variablen einbetten – immer `apiKeyService.ts` nutzen.
- Alle Dokumentationsänderungen in `CHANGELOG.md` nach [keepachangelog](https://keepachangelog.com/de/1.1.0/) Format eintragen.

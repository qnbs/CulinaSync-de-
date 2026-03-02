# Copilot Instructions for CulinaSync

## Projekt-Orientierung
- CulinaSync ist eine React+Vite PWA mit **Local-First** Datenhaltung in IndexedDB via Dexie.
- Die App ist feature-orientiert aufgebaut (`src/components/*`, `src/hooks/*`, `src/services/*`, `src/store/*`).
- `src/App.tsx` ist der Shell-Orchestrator: Navigation, lazy-loaded Seiten, Command Palette, Voice-Trigger, Toasts.

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

## UI-Interaktionsmuster
- Navigation mit optionalem Fokus erfolgt über `setCurrentPage({ page, focusTarget })` und `focusAction` (`src/store/slices/uiSlice.ts`).
- Sprachkommandos werden in `processCommand` geparst und via `executeVoiceAction` ausgeführt (`src/services/voiceCommands.ts`).
- Für kontextsensitive Folgeaktionen wird `voiceAction` im UI-State gesetzt und in Hooks verarbeitet (z. B. `useShoppingList`).

## KI-Integration (Gemini)
- Gemini-Aufrufe liegen ausschließlich in `src/services/geminiService.ts`.
- **API-Key wird NICHT im Build eingebettet.** Nutzer geben ihren Key über UI ein (Einstellungen → API-Schlüssel).
- Key-Speicherung erfolgt verschlüsselt in IndexedDB via `src/services/apiKeyService.ts` – niemals localStorage oder env-Variablen.
- Der `GoogleGenAI`-Client wird dynamisch per `getAIClient()` aus dem gespeicherten Key erstellt und gecacht.
- Antworten werden über JSON-Schema (`responseSchema`) erzwungen; beibehalten statt freiem Textparsing.
- Fehler werden auf nutzerfreundliche deutsche Meldungen gemappt (`handleGeminiError`).
- Beim Erweitern von KI-Features: bestehende Struktur `generate*` + typed Rückgaben + rejectWithValue in Slices befolgen.

## i18n, Settings, Persistenz
- i18n wird einmalig in `index.tsx` über `import './src/i18n'` initialisiert.
- Sprach-/App-Defaults kommen aus `loadSettings()` (`src/services/settingsService.ts`) und sind tief gemerged.
- Redux Persist speichert nur den `settings`-Slice (`src/store/index.ts`), nicht die Dexie-Tabellen.

## Workflows
- Dev: `npm run dev`
- Build: `npm run build` (tsc + vite build)
- Lint: `npm run lint`
- Preview: `npm run preview`
- Deploy: Automatisch via GitHub Actions bei Push auf `main` (`.github/workflows/deploy.yml`)
- `base` in `vite.config.ts` wird dynamisch gesetzt: `/CulinaSync-de-/` in CI, `/` lokal.

## Projekt-spezifische Konventionen
- Bevorzuge deutsche UX-Texte; Änderungen in Übersetzungen in `src/locales/de/translation.json` und `src/locales/en/translation.json` synchron halten.
- Behalte bestehende Namensmuster bei: Async-Thunks mit Suffix `Async`, UI-Hooks kapseln Handler/Toasts, Services enthalten Geschäftslogik.
- Verwende bestehende Utility-Pfade (`src/services/utils.ts`, Export-Services) statt duplizierter Parsing-/Export-Logik.
- **Niemals** API-Keys über `process.env` oder `VITE_`-Variablen einbetten – immer `apiKeyService.ts` nutzen.

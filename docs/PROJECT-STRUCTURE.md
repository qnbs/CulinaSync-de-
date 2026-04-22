# Projektstruktur

## Root

- `index.tsx`: App-Entry mit i18n-, Redux- und Persist-Initialisierung
- `package.json`: Scripts, Abhaengigkeiten, pnpm-Regeln und Overrides
- `vite.config.ts`: Build-, Chunking- und Pages-Basis-Konfiguration
- `vitest.config.ts`: Testkonfiguration
- `budget.json`: Bundle-Budget fuer den Deploy-Gate
- `CHANGELOG.md`: nennenswerte Aenderungen nach Keep a Changelog

## Wichtige Quellordner

### `src/components/`

- Top-Level-Seiten wie `PantryManager.tsx`, `RecipeBook.tsx`, `MealPlanner.tsx`, `ShoppingList.tsx`, `Settings.tsx`
- Feature-Unterordner fuer fachlich gebuendelte Teilkomponenten
- `__tests__/` fuer komponentennahe Tests

### `src/hooks/`

- UI- und Feature-Hooks
- Enthalten unter anderem `useMealPlan`, `useShoppingList`, `useModalA11y`, Sprach- und Fenster-Hooks

### `src/services/`

- Business- und Integrationslogik
- Datenbank, KI, Export, Fehlerlogging, Voice-Processing, Scanner, Sync und Utilities

### `src/store/`

- Redux-Konfiguration, Listener-Middleware und Slices
- Persistenzadapter fuer Redux

### `src/contexts/`

- Context-Provider fuer komplexere Features wie Vorratsverwaltung und Einkaufsliste
- Diese Provider tragen inzwischen auch zustandsgetriebene Confirm-/Modal-Flows fuer destructive Aktionen.

### `src/locales/`

- Deutsche und englische Uebersetzungen
- Je Sprache Aufteilung in `core.json`, `settings.json` und `features.json`
- Aggregation ueber `src/locales/de/index.ts` und `src/locales/en/index.ts`
- Neue Sprachschluessel sollen in den vorhandenen Domains erweitert werden, nicht in neue Monolith-Dateien

### `src/test/`

- testbezogene Utilities, MSW-Setup und weitere Testunterstuetzung

## Infrastrukturordner

- `.github/workflows/`: CI, Deploy und CodeQL
- `public/`: statische Assets fuer Pages/PWA
- `scripts/`: Bundle-Budget, i18n-Checks und Asset-Utilities
- `src-tauri/`: nativer Wrapper fuer Tauri

## Orientierung fuer neue Aenderungen

- UI-only Zustand: `src/store/`
- Persistente Domaindaten: `src/services/db.ts` plus Repositories
- Neue Seite: `src/components/`
- Neue Modalkomponente: eigener Komponentenfile plus `useModalA11y`
- Neue Confirm-Logik fuer irreversible Aktionen: pending state im Hook/Container, nicht direkt `window.confirm()` in Komponenten
- Neue Uebersetzungen: `src/locales/{de,en}/` in der passenden Domain-Datei erweitern
- Neue Doku: Root-Datei fuer Maintainer-/Community-Themen, `docs/` fuer Fach- und Betriebsdokumentation
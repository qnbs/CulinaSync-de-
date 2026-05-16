# Projektstruktur

> **Stand:** 2026-05-16 — pnpm/Turborepo-Monorepo (`apps/web`, `packages/*`)

## Root (Monorepo)

- `package.json`: Workspace-Root, Turbo-Scripts, pnpm-Overrides, `check:all`
- `pnpm-workspace.yaml`: `apps/*`, `packages/*`
- `turbo.json`: Task-Orchestrierung (build, lint, test, …)
- `eslint.config.js`: ESLint für `apps/web` und `packages/ai-core`
- `scripts/`: Bundle-Budget (`check-bundle-budget.mjs`), i18n-Scans
- `CHANGELOG.md`, `ROADMAP.md`, `AUDIT.md`
- `.node-version`: Node **24** (CI/DevContainer)

## `apps/web/` — React PWA

- `index.tsx`: App-Entry (Store-Bootstrap, i18n, Provider, Persist Gate)
- `index.html`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `budget.json`
- `package.json`: App-Abhängigkeiten und Scripts (`dev`, `build`, `test`, …)
- `public/`: statische Assets (PWA, Logos, `404.html`)
- `.storybook/`: Storybook-Konfiguration
- `e2e/`: Playwright-Smoke gegen `vite preview`

### `apps/web/src/components/`

- Top-Level-Seiten: `PantryManager.tsx`, `RecipeBook.tsx`, `MealPlanner.tsx`, `ShoppingList.tsx`, `Settings.tsx`
- Feature-Unterordner: `recipe-detail/`, `cook-mode/`, `shopping-list/`, `meal-planner/`, …
- `__tests__/`: Smoke- und Komponententests

### `apps/web/src/hooks/`

- Domain-Hooks: `useMealPlan`, `useMealPlannerScreen`, `useShoppingList`, `usePantryManager`, `useCookModeController`, …

### `apps/web/src/services/`

- DB-Einstieg: `db.ts`, Repositories unter `repositories/`
- KI: `geminiService.ts` (einzige Gemini-Fassade)
- Keys: `apiKeyService.ts`
- Export, Voice, Scanner, Sync, Settings-Hilfen

### `apps/web/src/store/`

- Redux: `index.ts`, Slices, `listenerMiddleware.ts`
- Persist: `persistStorage.ts`, `indexedPersistStorage.ts`, `migrateLegacySettingsBeforePersist.ts`
- Dexie-State-Hilfen: `stateDexie.ts` (nur wo dokumentiert)

### `apps/web/src/contexts/`

- `MealPlannerContext`, `PantryManagerContext`, `ShoppingListContext`

### `apps/web/src/locales/`

- `de/` und `en/`: `core.json`, `settings.json`, `features.json` + `index.ts`

### `apps/web/src/test/`

- `setupTests.ts`, MSW (`msw/`), `createTestStore.ts`

## `packages/`

### `packages/ai-core/` (`@domain/ai-core`)

- Shared AI-Hilfen: `sanitizeForPrompt`, `workerBus`, optionale ML-Imports
- Wird von `apps/web` per `workspace:*` eingebunden

### `packages/ui/` (`@domain/ui`)

- Design-Tokens: `tokens.css`, `tailwind-preset.cjs`
- Build erzeugt leeres `dist/` für Turbo-Cache-Kompatibilität

## Weitere Root-Ordner

- `src-tauri/`: Tauri-Desktop-Wrapper (`tauri.conf.json` → `apps/web/dist`)
- `.github/workflows/`: `validate.yml` (lint → type-check → test:coverage → build → budget → **audit** → Playwright), `ci.yml`, `deploy.yml`, CodeQL
- `docs/`: Fach- und Betriebsdokumentation
- `lighthouserc.json`: Lighthouse CI gegen `apps/web/dist` (manuell / optional)

## Orientierung für neue Änderungen

| Was | Wo |
|-----|-----|
| UI-only Zustand | `apps/web/src/store/` |
| Persistente Domaindaten | `apps/web/src/services/db.ts` + Repositories |
| Neue Seite | `apps/web/src/components/` |
| Gemini / API-Key | `geminiService.ts` / `apiKeyService.ts` nur in `apps/web` |
| Übersetzungen | `apps/web/src/locales/{de,en}/` |
| Workspace-Befehle | Root: `pnpm run dev` → Turbo filter `web` |

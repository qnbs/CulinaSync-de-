# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## graphify

This project has a graphify knowledge graph at `graphify-out/`.

Team policy (Omni-Archive):
- Commit **final outputs** under `graphify-out/` (e.g. `GRAPH_REPORT.md`, `graph.json`, `graph.html`) so everyone shares the same graph.
- Do **not** commit `graphify-out/cache/` (ignored in `.gitignore`); regenerate locally with `graphify update .`.

Rules:
- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure.
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep.
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Commands

Use `pnpm` (preferred) or `npm`. Both lockfiles are present.

| Task | Command |
|------|---------|
| Dev server | `pnpm run dev` |
| Type check | `pnpm run type-check` (**tsgo**, not tsc) |
| Build | `pnpm run build` (= `tsgo && vite build`) |
| Lint | `pnpm run lint` |
| Tests (once) | `pnpm run test` |
| Tests (watch) | `pnpm run test:watch` |
| Coverage | `pnpm run test:coverage` |
| Full validation | `pnpm run check:all` |

**Single test file:** `pnpm exec vitest run src/path/to/file.test.ts`

**Recommended agent workflow:** Diagnostics / ESLint for changed area → targeted tests → `type-check` → `check:all` only before commit/push. Never start with a full build to discover type errors.

## Architecture

### Stack
React 19 + Vite 8 PWA. **TypeScript 7 (native Go compiler `tsgo`)** — `tsc` is only used internally by ESLint/Vitest, not for builds. Path alias `@/*` → `src/*`.

`index.tsx` (app entry) is in the **repo root**, not `src/`. It is included via `tsconfig.json`.

### Data Architecture

**Two-layer state:**
- **Dexie / IndexedDB** = source of truth for domain data (`recipes`, `pantry`, `mealPlan`, `shoppingList`).
- **Redux** = UI/session state only (`uiSlice`, `shoppingListSlice`, `aiChefSlice`). Only the `settings` slice is persisted via redux-persist.

**DB access rule:** All reads and writes go through `src/services/db.ts` (re-export) and repository functions under `src/services/repositories/`. No direct `db.table(...)` calls from components or hooks.

**Reactive reads:** Use `useLiveQuery` or the existing domain hooks (`useShoppingList`, `useMealPlan`, `usePantryManager`).

**Cross-feature writes** are transactional in repositories (e.g. `deleteRecipe` updates `recipes`, `mealPlan`, and `shoppingList`).

**Pantry matching** is triggered automatically via Dexie hooks + debounce in `pantryMatcherService.ts` — no manual triggering needed.

### Service Boundaries

| Module | Responsibility |
|--------|---------------|
| `src/services/db.ts` | DB init, populate hooks, seed-sync, schema — always the entry point |
| `src/services/geminiService.ts` | All Gemini model calls; structured output validated with Zod |
| `src/services/apiKeyService.ts` | API key storage/retrieval (encrypted IndexedDB) |
| `src/services/settingsService.ts` | App settings with deep merge; reads redux-persist or defaults |
| `src/services/errorLoggingService.ts` | `logAppError()` — use for all caught errors |
| `src/store/listenerMiddleware.ts` | Central async-thunk error → toast wiring |

### Component Structure

- **Top-level pages** in `src/components/` (e.g. `PantryManager.tsx`, `RecipeBook.tsx`, `MealPlanner.tsx`), lazy-loaded via `React.lazy()` in `src/App.tsx`.
- **Feature sub-components** in feature folders: `src/components/pantry/`, `src/components/shopping-list/`, `src/components/recipe-detail/`, `src/components/meal-planner/`, `src/components/cook-mode/`.
- **Context pattern** for complex feature state: `PantryManager`, `ShoppingList`, and `MealPlanner` use Context providers in `src/contexts/` with `use*Context()` hooks. Data aggregation for MealPlanner is in `useMealPlannerScreen.ts`.
- **Modals** must be in separate files and always use `useModalA11y` (focus trap, Escape-close, scroll-lock) with `role="dialog"` and `aria-modal`.

### AI / Gemini Integration

- All model calls are in `src/services/geminiService.ts`. Features in `src/features/ai-chef/` may orchestrate use cases but must call the facade, not the raw `GoogleGenAI` client.
- **API key is never embedded in the build** (no `VITE_*` or `process.env`). Users enter their key via Settings; it is stored encrypted in IndexedDB via `apiKeyService.ts`.
- AI responses are requested with `responseSchema` and then validated with Zod (`parseAiJsonWithSchema`). No silent fallback with fabricated data on parse error.

### Performance Patterns

- All page components are `React.lazy()` in `App.tsx`.
- Heavy dependencies (`tesseract.js`, `@ericblade/quagga2`, export libs, faker) must be loaded via dynamic `import()`, never statically.
- `vite.config.ts` splits manual chunks: `react-vendor`, `redux-vendor`, `dexie-vendor`, `react-window`.
- Vite `base` is dynamic: `/CulinaSync-de-/` in CI, `/` locally.

## Hard Constraints

1. **Dexie:** Writes only via `src/services/db.ts` + repositories. No direct `db.table.put()` in components.
2. **Gemini:** Only `geminiService.ts`. Always Zod-validate AI JSON output.
3. **API key:** Never `VITE_*`, `process.env`, or build-time embed. Only `apiKeyService.ts`.
4. **Redux:** UI/session only; do not mirror Dexie domain data into Redux.
5. **Errors:** Use `logAppError()`. Async thunk errors → `listenerMiddleware` toast. React render errors → `GlobalErrorBoundary`.
6. **Modals:** Always `useModalA11y`.

## i18n & Settings

- All visible strings and `aria-label` values go through `t()` with keys in `src/locales/{de,en}/`.
- Locale files are split into `core.json`, `settings.json`, `features.json` per language — keep both in sync.
- Legacy `culinaSyncSettings` key is migrated on boot via `migrateLegacySettingsBeforePersist.ts`. `loadSettings()` only reads from persist or defaults — never the legacy key directly.
- Helpers: `settingsKeys.ts`, `settingsMerge.ts`.

## Testing

- Framework: **Vitest** + **Testing Library** + **MSW** (mock service worker for external APIs).
- Test files live next to source in `__tests__/` subdirectories; named `*.test.ts` / `*.test.tsx`.
- Setup: `src/test/setupTests.ts`; Redux helper: `src/test/createTestStore.ts`; shared smoke stubs: `src/components/__tests__/smokeHookStubs.ts`.
- Coverage thresholds (v8): 60% lines, 58% statements, 51% functions, 45% branches. ROADMAP target: ≥70%.
- **Never skip or delete failing tests** to make CI green — fix the root cause.
- Use `vi.mock` or MSW for external APIs; never real network calls in tests.

## CI & Workflow

- CI runs on **Node 24** (`validate.yml`); env `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` is set.
- After every push, **observe the CI/Deploy/CodeQL runs until green**. A push without workflow observation is not considered complete.
- If any workflow fails after push: analyze cause → fix locally → validate → commit → push → observe again.
- Deployments auto-trigger on push to `main` (GitHub Pages).
- Commits must follow **Conventional Commits** (enforced by commitlint + husky).
- Document all changes in `CHANGELOG.md` using [keepachangelog](https://keepachangelog.com/de/1.1.0/) format.

## Code Comments

For non-trivial changes (new logic, restructured hooks/services, new UX paths), add exactly **one** compact comment directly above the affected block:
```
// QNBS-v3: [Reason | Impact | optional creative value]
```
For minor edits (typos, formatting, mechanical type fixes): no code comment — brief explanation in the chat response instead.

## Document Hierarchy

For architectural decisions, consult in priority order:
1. `PRD.md` — feature scope, acceptance criteria, NFRs
2. `instructions.md` — gates and checklists
3. `.github/copilot-instructions.md` — detailed code paths, Redux/Dexie/Gemini patterns, terminal conventions
4. `docs/ARCHITECTURE.md` — layer diagram, data flow
5. `docs/PROJECT-STRUCTURE.md` — where new files belong

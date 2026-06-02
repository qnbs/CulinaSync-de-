# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Geaendert

- **CI/Deploy:** Service Worker — nur ein `self.__WB_MANIFEST`-Vorkommen (Workbox-Build); Index-Pfad via `__PWA_INDEX_PATH__`.
- **E2E:** Playwright `baseURL` mit GitHub-Pages-Pfad `/CulinaSync-de-/` in CI.
- **Deeplinks:** `culinasync://`-Events werden in der App verarbeitet (`useDeepLinkNavigation`).
- **E2E-CI:** `e2e-smoke.yml` läuft bei Push/PR auf `apps/web/**` (Playwright-Container); Doku in `TESTING.md`.
- **PWA-Härtung (#37):** precached `index.html` für Navigation; Manifest-Shortcuts `?page=…`; `useOnlineStatus` nach Tab-Fokus/bfcache.
- **A11y (#37):** Install-/Update-Dialoge mit `useModalA11y`; Offline-Banner ARIA; Toasts `assertive` nur bei Fehlern.
- **Offline-KI (#37):** `aiOfflineFallback.ts`; `geminiService` ohne Faker; `logAppError` für Install/Reset/Export.

## [0.2.2] — 2026-06-02

### Hinzugefuegt

- **PWA Offline-UX (P1):** `useOnlineStatus`, `OfflineStatusBar` unter dem Header, Reconnect-Toast; Workbox-Runtime-Cache fuer Route-Chunks, Bilder und Fonts (`sw.ts`).
- **i18n-Gate (P1):** Gemeinsames Scan-Modul (`scripts/lib/i18n-scan-shared.mjs`); CI prüft `de`/`en`-Key-Parität, Production-Baseline (**0** Kandidaten) und geänderte Zeilen ohne `__tests__`.
- **i18n-Cleanup:** Production-Hardcoded-Strings vollständig migriert — `foodDatabase` + `foodDatabase.items.*`, Gemini in `locales/*/gemini.json`, Offline-Fallbacks in `aiOffline.*`, `resolvePantryCategoryLabel`, `constants/mealTypes.ts`; Vitest-`i18next` in `setupTests.ts` + `i18nTestUtils`.
- **M5 Testing (abgeschlossen):** **364** Tests / **86** Dateien; Coverage v8 ca. **78/79/72,5/63 %**; Thresholds **77/79/72/62** (PRD erreicht). Suites u. a. Repositories, `geminiService`, UI-Smoke, `MealPlanModal`, `criticalDomainFlow.integration`.
- **Audit Juni 2026:** `docs/AUDIT-REPORT-2026-06.md`, `docs/STATUS-2026-06-02.md`.
- **CI:** E2E-Smoke in `.github/workflows/e2e-smoke.yml` (Playwright-Container, wöchentlich + `workflow_dispatch`).

### Geaendert

- **Dependencies:** eslint **10.4.1**, typescript-eslint **8.60.1** (#30); vitest/jsdom/msw **4.1.8** / **29** / **2.14** (#20); Storybook **10** (#22); `@hookform/resolvers` 5.2.2, `react-i18next` 17.0.8.
- **Tooling:** `pnpm.overrides` `vitest` / `@vitest/utils` **4.1.8** (Doku ↔ Lockfile, #34).
- **CI:** PR-Validate ohne doppelten `main`-Lauf; Deploy: validate + GitHub Pages; PRs `pnpm run i18n:check`.
- **Supply-Chain:** Vitest **>=4.1.0** (Override) — kritisches Audit-Finding behoben.

### Dokumentation

- **Post-Merge Doku-Sync:** `STATUS`, `README`, `TESTING` — **364** Tests, PR #31–#34 im Merge-Stand, P1 (PWA/i18n) als erledigt markiert.
- **Post-M5 Doku-Sync:** `docs/README.md`, `ROADMAP.md` (M5 ✅), `AUDIT.md`, `docs/AUDIT-REPORT-2026-06.md`, `.github/copilot-instructions.md`.

## [0.2.1] — 2026-05-16

### Geaendert

- **Dependencies:** zod 4.4.3, lucide-react 1.x, i18next 26.x, react-joyride 3.x (Onboarding-Migration), Build-Tools (Vite 8.0.13, Tailwind CSS 4.3, vite-plugin-pwa 1.3, rollup-plugin-visualizer 7).
- **CI:** `actions/upload-artifact` v7 in `validate.yml`.

## [0.2.0] — 2026-05-16

### Hinzugefuegt

- **Monorepo:** Turborepo + pnpm-Workspace — App unter `apps/web/`, Shared Packages `@domain/ai-core` und `@domain/ui`.
- **CI:** `pnpm audit --audit-level=high` in `validate.yml`; Coverage-Artefakt; Playwright-Smoke; type-check (tsgo) im Validate-Pfad.
- **Doku:** `docs/PROJECT-STRUCTURE.md`, `docs/STATUS-2026-05-16.md`; Pfade und Agenten-Regeln auf Monorepo synchronisiert.

### Geaendert

- Root-Scripts delegieren via Turbo (`pnpm run dev`, `check:all`); `lighthouserc.json` → `apps/web/dist`.
- `pnpm.overrides` fuer Supply-Chain (protobufjs, babel-systemjs, fast-uri) — Audit High/Critical **0**.

### Behoben

- **CI type-check:** `turbo.json` — `type-check` haengt von `^build` ab (`@domain/ai-core`/`@domain/ui` vor `web#type-check`; behebt TS2307 in frischen CI-Laeufen).

### Archiv — Entwicklung seit v0.1.0 (Auszug)

Die folgenden Eintraege dokumentieren die Arbeit zwischen **v0.1.0** und **v0.2.0** (noch unter dem frueheren `[Unreleased]`-Block gefuehrt).

### Geaendert

- **Monorepo (Follow-up):** Post-Migration Housekeeping — `pnpm.overrides` fuer Audit-Highs (protobufjs, babel-systemjs, fast-uri); CI **`pnpm audit --audit-level=high`** in `validate.yml`; `lighthouserc.json` → `apps/web/dist`; Turbo-`dist/` fuer `@domain/ui`.
- **Doku/Agenten:** Pfade auf `apps/web/src/` in README, copilot-instructions, Cursor-Rules, `docs/PROJECT-STRUCTURE.md` (neu), DEVELOPMENT, TESTING, DEPLOYMENT, `instructions.md`; Snapshot `docs/STATUS-2026-05-16.md`; AUDIT-Status-Block 2026-05-16.

### Geaendert (vorherige Unreleased-Eintraege)
- **CI:** `.github/workflows/validate.yml` — nach **Lint** zusätzlich **`pnpm run type-check`** (**tsgo**), entspricht dem Kernpfad von `check:all` (ohne `npm audit`). **`tauri-release.yml`**: pnpm 10, frozen lockfile, **checkout/setup-node/pnpm v6**, Node **24**, **`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`**.
- **Doku/Kanon:** `.github/copilot-instructions.md`, `README`, `CONTRIBUTING`, `docs/DEPLOYMENT`, `docs/DEVELOPMENT`, `docs/TESTING`, `instructions.md`, `AUDIT`; **Cursor** `.cursor/index.mdc`, `800-testing-standards.mdc`, `105-gemini-genai.mdc` (Globs Ai-Chef).

### Hinzugefuegt
- **Tests / M5 (Fortsetzung 2026-05-04):** `shopping-list/__tests__/BulkAddModal.test.tsx`, `shopping-list/__tests__/AiModal.test.tsx`, `pantry/__tests__/PantryList.test.tsx`; erweiterter **`App.smoke.test.tsx`** (Meal-Planner-Route, Toast, Footer-Version, **`vi.mock('./services/db')`**). Zusaetzlich u. a. `fake-indexeddb`, App-/RecipeCard-/GlobalErrorBoundary-Smoke, `useRecipeDetail`, `mealPlannerSmartService`, `retryUtils`, `utils`, Hook-Tests Debounce/WindowSize/SpeechSynthesis/WakeLock/ModalA11y, erweiterte `voiceCommands` (`executeVoiceAction`). Vitest-**Coverage-Thresholds** an v8-Snapshot (Lines 60, Statements 58, Branches 45, Functions 51); `__APP_VERSION__` in Tests; Worker-Pool `maxWorkers: 1`.
- **Bundle M9.3:** Vite-Chunk `vendor-export` (jspdf, html2canvas, papaparse); PWA-`globIgnores` / Runtime-Cache / Preload-Deferral aktualisiert.
- **ESLint:** `react-hooks/exhaustive-deps` auf `warn`; Abhaengigkeiten in `usePantryManager` ergaenzt.
- **Tauri M8 (Prep):** `identifier` in `tauri.conf.json`; Workflow `tauri-release.yml` (Web-Build + Config-Check); Doku `docs/LIVE-DEMO-QA.md`, `docs/STATUS-2026-05-04.md`.
- **Essensplan:** `meal-planner/dayColumnPantryStatus.ts` mit `getMealPlanSlotPantryStatus` (reiner Vorratsabgleich fuer Slots); zugehoerige Unit-Tests `meal-planner/__tests__/dayColumnPantryStatus.test.ts`; `DayColumn.tsx` verduennt, `DayColumn.test.tsx` ergänzt.
- **Tests (M5 Fortsetzung):** `mealPlanRepository.test.ts`, `pantryRepository.test.ts`; `usePantryManager.test.tsx`; `ShoppingListContext.test.tsx`; Smoke `PantryManager.smoke.test.tsx`, `ShoppingList.smoke.test.tsx` mit `components/__tests__/smokeHookStubs.ts` (stabile Context-Stubs).
- **Tests (M5):** `MealPlannerContext.test.tsx`; `useMealPlannerScreen.test.tsx`; `useCookModeController.test.tsx`; Smoke-Tests `MealPlanner.smoke.test.tsx`, `CookModeView.smoke.test.tsx`, `RecipeDetailTabs.smoke.test.tsx`; Hilfsfunktion `src/test/createTestStore.ts` (Redux-Teststore ohne Persist).
- **MSW:** `geminiMsw.test.ts` validiert die gemockte Gemini-Models-Antwort zusaetzlich mit **Zod**.
- **Tooling:** Script `check:all` in `package.json` (lint, `type-check`, test, build, bundle-budget, `npm audit --audit-level=high`); ESLint ignoriert generiertes `coverage/**`.
- **CI:** `validate.yml` — `pnpm run test:coverage` statt reiner Testlauf; Upload-Artefakt **coverage-lcov** (14 Tage); **Bundle-Budget** auf jedem Validate-Lauf (nicht nur Deploy).
- **Tests (M5 Fortsetzung):** `useMealPlan.test.tsx`, `useShoppingList.test.tsx` (inkl. Voice `CHECK_SHOPPING_ITEM`), `PantryManagerContext.test.tsx`.
- **Architektur:** `MealPlannerProvider` / `useMealPlannerContext` (`src/contexts/MealPlannerContext.tsx`) und Hook `useMealPlannerScreen` — Essensplan analog zu Pantry/Einkaufsliste; Konstanten `MEAL_TYPES` in `meal-planner/mealPlannerConstants.ts`.
- **Kochmodus:** `useCookModeController` (`src/hooks/useCookModeController.ts`) kapselt Timer-, Sprach- und Wake-Lock-Logik; `CookModeView` bleibt schlank.
- **Settings-Migration:** synchrones Bootstrap `src/store/migrateLegacySettingsBeforePersist.ts` (Import als erste Zeile in `store/index.ts`), damit Legacy-`culinaSyncSettings` vor Redux-Persist-Rehydration nach `persist:settings` migriert wird.
- **Services:** `settingsKeys.ts`, `settingsMerge.ts` — Zyklusfreie Aufteilung fuer `settingsMigration` / `settingsService`.
- **Sicherheit / KI:** Zod-Schemas in `geminiService.ts` (`parseAiJsonWithSchema`) fuer Rezeptideen, volles Rezept, Einkaufsliste und Naehrwert-Verifikation (ersetzt die frueheren manuellen Type-Guards).
- **Barrierefreiheit:** u. a. Header (aria-labels, Sprach-Toggle `aria-pressed`), `RecipeDetailTabs` als Tablist/Tabpanels, CookMode (Icon-Buttons, Zutaten `aria-pressed`, dekorative Schrittzahl `aria-hidden`), VoiceControl-Overlays als `role="status"` / `aria-live`, Install- und PWA-Update-Banner als Dialoge mit Beschriftung, MealPlanner-Placement-Dismiss, neue i18n-Keys in `core.json` / `features.json`.
- **CI:** `node-version: 24` in `.github/workflows/ci.yml` und `validate.yml` (i18n-Job und reusable Validate).
- **DevContainer:** Basis-Image auf `mcr.microsoft.com/devcontainers/typescript-node:24-bookworm` angehoben (Align mit CI).
- **Tests:** `settingsMerge.test.ts`, `mealPlannerConstants.test.ts` fuer Merge-Logik und Essensplan-Konstanten.
- **Dokumentation:** `docs/STATUS-2026-05-01.md`, `docs/STATUS-2026-05-02.md`; erweiterte `ARCHITECTURE.md`, `PROJECT-STRUCTURE.md`, `DEPLOYMENT.md`, `TESTING.md`, `DEVELOPMENT.md`, `docs/README.md`, `AUDIT.md`, `ROADMAP.md` v1.3; `.github/copilot-instructions.md` (Gemini/Zod, Settings, MealPlanner-Context).
- **Aus Sprint 2026-05-01 (bereits im Repo):** Tauri-CSP in `tauri.conf.json`; Tests `voiceCommands`, `dataRepository`, `cookModeReducer`, `utilsCategories`; JSDoc-Modulköpfe `db.ts` / `geminiService.ts`; Mermaid-Diagramm und Tauri-Abschnitt in der Fachdoku; Roadmap v1.2-Vorbereitung.

### Geaendert
- **Settings:** `loadSettings()` laedt nur noch Redux-Persist (`persist:settings`) oder Defaults; kein direktes Auslesen des Legacy-Keys mehr — Migration erfolgt ueber `migrateLegacySettings()` (Store-Bootstrap + Aufruf aus `loadSettings`).
- **`index.tsx`:** redundanter direkter Aufruf von `migrateLegacySettings` entfernt (Bootstrap im Store).
- **Einkaufsliste (KI):** Nach Zod-Parse werden `category` (Fallback `''`) und `sortOrder` gesetzt, damit der Typ zu `Omit<ShoppingListItem, 'id' | 'isChecked'>[]` passt.

### Behoben
- **Typecheck (tsgo):** `setAppServices` nutzt **`AppServicesOverrides`** mit **`Partial<AiGateway>`** u. a., damit Test-Mocks nicht das komplette Gateway spiegeln muessen. Shopping-List-Tests: keine doppelten Objektschluessel (`ShoppingListItemComponent`, `ShoppingListQuickAdd`); **`RecipeDetail.smoke.test.tsx`**: `t`-Stub fuer `i18next`-Ueberladungen.
- **Build (tsgo):** `utilsCategories.test.ts` — Mock von `i18next.t` per Assertion auf `typeof i18next.t` typisiert; der Produktions-Build schlug mit TS2345 fehl (Mehrfachueberladungen von `TFunction`).
- **Supply Chain:** `npm audit` meldete u. a. verwundbare transitive Versionen von `serialize-javascript` (Workbox/vite-plugin-pwa) und `uuid` (Storybook). Root-`overrides` plus ergänzte `pnpm.overrides` heben auf **serialize-javascript ^7.0.5** und **uuid ^14.0.0**; `pnpm-lock.yaml` wurde per `pnpm import` aus dem aktualisierten `package-lock.json` synchronisiert.
- **Husky:** `.husky/pre-commit` nutzt `npm exec lint-staged`; `commit-msg` nutzt `npm exec -- commitlint --edit` (zwingt korrekte Argumentweitergabe), damit lokale Commits ohne globales **pnpm** funktionieren (z. B. Windows).

### Geaendert (Fortsetzung Mai 2026)
- **Dokumentation 2026-05-04:** README (222 Tests / 59 Dateien, Coverage-Snapshot), `docs/STATUS-2026-05-04`, `docs/TESTING`, `docs/README` (INDEX → STATUS-2026-05-04), ROADMAP M5-Metriktabelle, AUDIT Status-Block, `instructions.md` Stand, `vitest.config.ts` Thresholds.
- **Dokumentation (2026-05-02 Session):** erneuter Sync nach M5-Erweiterung — `AUDIT`, `ROADMAP` M5.3–5.5, `docs/STATUS-2026-05-02.md`, `TESTING`, `PROJECT-STRUCTURE`, `ARCHITECTURE`, `docs/README`, `SECURITY-AUDIT-2026.md` (Folgebewertung), `.github/copilot-instructions.md`; zuvor: `DEPLOYMENT`, `DEVELOPMENT`, `TROUBLESHOOTING`; **CONTRIBUTING** um `check:all` und Testorte ergaenzt.
- **i18n:** Shopping-List-Toasts und Kategorie-Heuristik (`getCategoryForItem`) uebersetzungsfaehig; neue Keys `shoppingList.categories.*`, erweiterte Toasts; `RecipeBook` Bulk-Plan-Toast; Whisper-Fehler ueber `voice.*` in `core.json`.

#### Archiv unter [Unreleased] — April 2026 (CodeQL, i18n Wave 2+3)

- CodeQL Alert #7 behoben: `sanitizeWebContentForPrompt` in `geminiService.ts` nutzt jetzt DOMPurify statt fehleranfaelliger HTML-Regex (schlechter Regex liess `</script foo>` als validen End-Tag passieren)
- Vollstaendige i18n-Completion Wave 2+3: alle verbleibenden ~65 hartcodierten deutschen Strings auf Locale-Keys migriert
  - `ShoppingListHeader.tsx`, `RecipeBookHeader.tsx`, `VoiceControlWhisperUI.tsx`, `ShoppingListQuickAdd.tsx`: `useTranslation` nachgezogen, alle Texte auf i18n-Keys
  - `Onboarding.tsx`: Tour-Step-Texte in `getTourSteps(t)` verschoben
  - `AiChefPanel.tsx`: `DIETARY_SUGGESTIONS` und `CUISINE_SUGGESTIONS` in Locale-Dateien ausgelagert
  - `RecipeDetail.tsx` Meal-Typ-Auswahl: Options mit expliziten `value`-Attributen (DB-Key bleibt DE, Display uebersetzt)
  - `DayColumn.tsx`: Mahlzeitentyp-Labels per `getMealTypeLabel()`-Helper lokalisiert
  - `MealPlanner.tsx`/`exportService.ts`: Locale-Locale-Lookup fuer Mahlzeitstypen
  - `voiceCommands.ts`: Toast-Messages und Nav-Toasts per `i18next.t()`, EN-Sprachbefehle ergaenzt
  - `geminiService.ts`: Error-Messages lokalisiert, AI-Prompts language-aware (EN-User erhaelt englische KI-Ausgaben)
  - `foodDatabase.ts`: Kategorie-Display-Lookup in Locale-Datei
  - `de/settings.json`: Fehlkodierte Umlauts korrigiert (sidebar-Objekt)
- Neue i18n-Keys: `shoppingList.header.*`, `recipeBook.header.*`, `voiceControl.whisper.*`, `onboarding.tour.*`, `features.pantry.categories.*`, `voiceCommands.*`, diverse weitere

### Hinzugefuegt (vorherige Eintraege)
- `@typescript/native-preview@beta` (TypeScript 7.0 Beta, Go-basierter Compiler): `tsgo`-Binary fuer bis zu 10x schnellere Typechecks
- `type-check`-Script `tsgo` in `package.json` hinzugefuegt (ersetzt `pnpm exec tsc --noEmit` im Alltag)
- `ROADMAP.md` neu erstellt: vollstaendige Milestones 0–10 auf Basis aller Audit-Findings, inkl. DevInfra, i18n, Architektur, Security, Testing, Dokumentation, TS7-GA, Tauri, Bundle-Optimierungen und Multi-Device-Sync
- `docs/STATUS-2026-04-23.md` Status-Snapshot nach TS7-Upgrade und erstem Audit-Zyklus
- `.devcontainer/devcontainer.json`: reproduzierbare Entwicklungsumgebung (Node 22, pnpm 10, Rust/Cargo fuer Tauri M8)
- `.github/dependabot.yml`: woeichentliche automatische Dependency-Updates fuer npm und github-actions
- `.github/workflows/validate.yml`: gemeinsamer Reusable-CI-Workflow (checkout → install → lint → test → build), genutzt von `ci.yml` und `deploy.yml`
- `.husky/pre-commit` + `.husky/commit-msg`: pre-commit-Gate (lint-staged) und commit-msg-Validierung (commitlint)
- `lint-staged.config.mjs`: ESLint auf staged TypeScript/TSX-Dateien
- `commitlint.config.mjs`: Conventional-Commits-Enforcement via `@commitlint/config-conventional`
- `.vscode/extensions.json`: VS Code Extension-Empfehlungen (ESLint, Tailwind, i18n-ally, rust-analyzer, Tauri, GitHub Actions)
- `.github/ISSUE_TEMPLATE/bug_report.yml` + `feature_request.yml`: strukturierte GitHub-Issue-Formulare
- `.github/PULL_REQUEST_TEMPLATE.md`: PR-Checklist (Tests, i18n, A11y, Changelog)
- `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional` als devDependencies hinzugefuegt
- i18n-Keys `app.pwaUpdate` (title, description, reload, later) in `de/core.json` und `en/core.json` fuer den PWA-Update-Banner ergaenzt
- Neue Root-Dokumentation fuer Beitragende und Nutzer: `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`
- Neuer `docs/`-Bereich mit Architektur-, Struktur-, Entwicklungs-, Testing-, Deployment- und Troubleshooting-Dokumentation
- Security-Audit-Bericht `docs/SECURITY-AUDIT-2026.md` mit Befunden zu Storage, API-Key-Handling, DOM-Rendering und Exporten

### Geaendert
- `typescript` von `^5.2.2` auf `^6.0.3` angehoben (stabiler Tooling-Layer fuer ESLint, Vitest, Storybook)
- Build-Script von `tsc && vite build` auf `tsgo && vite build` umgestellt (Go-Compiler)
- `tsconfig.json`: `baseUrl` entfernt (in TS7 abgeschafft), `@/*`-Pfad-Alias auf `./src/*` korrigiert (relative Pfade erforderlich)
- ESLint-Konfiguration bereinigt: redundanten zweiten Config-Block entfernt, der `react-hooks/exhaustive-deps` faelschlicherweise auf `error` ueberschrieb
- `package.json`: `prepare`-Script (`husky`) hinzugefuegt; DevInfra-Pakete ergaenzt
- `ci.yml` + `deploy.yml`: CI-Duplizierung aufgeloest — beide Workflows nutzen jetzt den gemeinsamen Reusable Workflow `validate.yml`
- `ROADMAP.md` auf v1.1 aktualisiert: M0.1 geschlossen, M1 vollstaendig umgesetzt, M8–M10 ergaenzt
- `docs/DEVELOPMENT.md` um `tsgo`-Workflow, Unterschied `tsgo`/`tsc`, Husky/commitlint-Gates und aktualisierte Validierungsreihenfolge ergaenzt
- PWA-Update-Banner in `App.tsx` von hardcodierten DE-Strings auf `t('app.pwaUpdate.*')` umgestellt
- Footer-Jahr in `App.tsx` von statisch `2026` auf dynamisch `new Date().getFullYear()` umgestellt
- Indent-Bug im zweiten `runtimeCaching`-Eintrag in `vite.config.ts` korrigiert (fehlende 2 Leerzeichen)
- `healthConnectService.ts`: Fehlende `link.rel = 'noopener noreferrer'` im JSON-Export nachgeholt (Sicherheits-Haertung analog zum CSV-Export)
- `README.md` vollstaendig auf den tatsaechlichen Projektstand mit pnpm, Vite 8, GitHub Pages und aktueller Architektur aktualisiert
- `.github/copilot-instructions.md` an den aktuellen Tooling- und Workflow-Stand mit pnpm und Vite 8 angepasst
- `AUDIT.md` um aktuellen Status-Block fuer die behobenen Laufzeit-, Security- und Pipeline-Themen sowie den TS7-Upgrade-Abschluss ergaenzt
- i18n-Ressourcen von monolithischen `translation.json`-Dateien auf aggregierte Sprachdomaenen (`core`, `settings`, `features`) pro Sprache umgestellt
- Root- und Fachdokumentation auf den aktuellen Accessibility-, i18n- und Validierungsstand synchronisiert und um `docs/STATUS-2026-04-22.md` und `docs/STATUS-2026-04-23.md` ergaenzt

### Behoben
- `saveSettings()` aus `settingsService.ts` entfernt (dead code ohne Callers; Settings-Persistenz laeuft vollstaendig ueber Redux Persist)
- Live-Demo-Black-Screen durch expliziten Redux-Persist-Storage-Adapter behoben
- Prototype-Pollution-Risiko in den Settings durch allowlist-basierte Mutatoren entfernt
- Download-Sink in `exportService.ts` mit Dateinamen- und MIME-Haertung abgesichert
- CI-, Deploy- und CodeQL-Workflows auf aktuelle Actions-Majors und pnpm-basierte Ausfuehrung modernisiert
- CodeQL-Matrix auf eine einzige JavaScript/TypeScript-Analyse reduziert, um doppelte Alerts fuer denselben Code zu vermeiden
- CSV-/Spreadsheet-Formula-Injection in `exportService.ts` neutralisiert
- API-Key-Speicherung von XOR-Obfuskation auf WebCrypto-basierte Verschluesselung mit Legacy-Migration gehaertet
- Health-CSV-Export in `healthConnectService.ts` gegen Formula-Injection und kaputte CSV-Struktur gehaertet
- Backup-/Sync-Verschluesselung in `syncService.ts` auf zufaelliges Salt pro Export mit Legacy-Decrypt umgestellt
- `geminiService.ts` gegen Prompt-Injection aus Web-Import-Inhalten und gegen unvalidierte KI-JSON-Antworten gehaertet
- Settings-Persistenz auf einen konsolidierten Redux-Persist-Source-of-Truth umgestellt und Legacy-Load-Fallback beibehalten
- `index.html` um eine konservative Content-Security-Policy fuer die Web/PWA-Variante erweitert
- Migrations-Backups in `dbMigrations.ts` auf eine kleine Anzahl aktueller Snapshots begrenzt
- `@faker-js/faker` aus dem Production-Pfad entfernt und nur noch fuer Offline-Fallbacks dynamisch geladen
- App-Version auf Build-Time-Define umgestellt und Paketmetadaten in `package.json` bereinigt
- GitHub-Pages-SPA-Redirect in `public/404.html` auf einen same-origin URL-Aufbau gehaertet
- Build-Kompression auf Brotli-only vereinfacht und redundante Gzip-Artefakte entfernt
- `useWindowSize` auf debouncte Resize-Updates umgestellt, um Re-Render-Spitzen zu reduzieren
- `WhatsNewModal` mit Dialog-Semantik, Escape-Close und Fokus-Management an das bestehende Modal-A11y-Muster angeglichen
- das DayColumn-Aktionsmenue im Meal Planner per `focus-within` auch fuer Tastatur-Navigation zugaenglich gemacht
- die globale Error Boundary fuer Screenreader mit `role="alert"` und assertiver Live-Region versehen
- das Export-Menue in `RecipeDetail` von klickbaren Links auf echte Buttons mit Menu-Attributen umgestellt
- das Help-Suchfeld und das FAQ-Accordion um fehlende A11y-Attribute wie `aria-label`, `aria-expanded` und `aria-controls` ergaenzt
- `VoiceControlUI` auf einen i18n-basierten Listening-Fallback umgestellt und erste hartcodierte `aria-label`-Werte in PantryList/CookModeView lokalisiert
- die Rezeptaktions-Buttons in `ChefResults` um explizite Screenreader-Labels ergaenzt
- weitere feste `aria-label`-Werte im `RecipeToolbar` ueber i18n lokalisiert
- feste Toolbar-Labels in `PantryToolbar` und `ShoppingListToolbar` ebenfalls ueber i18n gezogen
- weitere A11y-/i18n-Slices in `ShoppingListItemComponent`, `PantryQuickAdd`, `TagInput` und den Selection-Mode-Buttons in `RecipeBook` lokalisiert
- weitere A11y-/i18n-Slices in `ApiKeyPanel`, `Help`, `WhatsNewModal` und `BulkAddToPlanModal` lokalisiert
- alle bisherigen `window.confirm()`-Flows in `ApiKeyPanel`, `DayColumn`, `MealPlanner`, `RecipeDetail`, `ShoppingList` und `PantryManager` durch zugaengliche Modals ersetzt
- weitere i18n-Slices in `CookModeView`, `RecipeToolbar`, `RecipeCard`, `Help`, `AppearancePanel` und `GlobalErrorBoundary` lokalisiert
- das veraltete statische `public/manifest.json` entfernt, sodass das von `vite-plugin-pwa` generierte Manifest der einzige Pfad bleibt
- das redundante Typ-Paket `@types/react-redux` entfernt, da `react-redux` 9.x eigene Typdefinitionen mitbringt

### Behoben
- **tsconfig.json:** `ignoreDeprecations: "6.0"` hinzugefügt für TS 7 Kompatibilität, Root-Dateien in `include` aufgenommen
- **sitemap.xml:** Ungültiges XML mit orphaned `</url>`-Tags korrigiert
- **robots.txt:** Doppelten Sitemap-Eintrag entfernt
- **geminiService.ts:** Veraltetes `gemini-pro-vision` Modell auf `gemini-2.5-flash` aktualisiert
- **useWhisperRecognition.ts:** Memory Leak behoben — MediaStream-Tracks werden bei Stop freigegeben

### Entfernt
- **types.ts (Root):** Redundante, divergierende Typ-Datei gelöscht (Quelle der Wahrheit ist `src/types.ts`)

### Geaendert
- **.gitignore:** `coverage/`, `reports/`, `*.gz`, `*.br`, `stats.html` hinzugefügt
- **.gitattributes:** Erstellt mit `* text=auto` für LF-Normalisierung
- **copilot-instructions.md:** Umfassend überarbeitet mit Testing, Architektur, Performance, A11y und Error-Handling Konventionen

### Hinzugefügt
- **CHANGELOG.md:** Erstellt nach keepachangelog Standard
- **AUDIT.md:** Umfassende Handoff-Dokumentation des Full-App-Audits

## [0.1.0] — 2026-03-04

### Hinzugefügt
- React 19 + Vite PWA mit Local-First Architektur (Dexie/IndexedDB)
- Vorratskammer-Manager mit Kategorien, Ablaufdatum-Tracking, Barcode-Scanner
- Rezeptbuch mit KI-gestützter Generierung via Gemini 2.5 Flash
- Essensplaner mit Drag & Drop, Wochen-/Monatsansicht, Nährwertübersicht
- Einkaufsliste mit automatischer Kategorisierung und Pantry-Abgleich
- KI-Koch-Assistent (AI Chef) mit Rezeptvorschlägen basierend auf Vorratslage
- Kochmodus mit Schritt-für-Schritt-Anleitung, Timer und Sprachsteuerung
- Command Palette für schnelle Navigation (Ctrl+K)
- Sprachsteuerung (Web Speech API + Whisper.cpp)
- Multi-Format-Export (PDF, CSV, JSON, Markdown, ICS)
- Gemini Vision für Zutaten-Erkennung aus Fotos
- Responsive Design mit Dark/Light/System Theme
- Onboarding-Tour für neue Nutzer
- i18n-Support (Deutsch/Englisch)
- Verschlüsselte API-Key-Speicherung in IndexedDB
- Offline-AI-Fallback mit Faker.js für Demo-Daten
- GitHub Pages Deployment via GitHub Actions
- CI-Pipeline mit Lint, TypeScript-Check, Tests und Bundle-Budget
- CodeQL Security Analysis

[Unreleased]: https://github.com/qnbs/CulinaSync-de-/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/qnbs/CulinaSync-de-/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/qnbs/CulinaSync-de-/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/qnbs/CulinaSync-de-/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/qnbs/CulinaSync-de-/releases/tag/v0.1.0

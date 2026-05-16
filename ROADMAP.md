# CulinaSync — Roadmap

> **Stand:** 16. Mai 2026 (Monorepo-Migration + Re-Audit/Housekeeping) · Basis: vollständiges Code-, Architektur- und Security-Audit (14.–22. April 2026) + Follow-up-Sessions Mai 2026  
> **Format:** Milestones geordnet nach Priorität. Jedes Item mit Herkunft (AUDIT-Referenz), Aufwandsschätzung und Status.

---

## Milestone 0 — TypeScript 7.0 Beta · ✅ Abgeschlossen (23. April 2026)

**Ziel:** Schnellstmöglicher Type-Check-Zyklus durch den Go-basierten TypeScript-Compiler.

| # | Maßnahme | Datei(en) | Aufwand | Status |
|---|---|---|---|---|
| 0.1 | `typescript` auf ^6.0.3 upgraden (stabil, für Tooling-Layer: ESLint, Vitest, Storybook) | `package.json` | Niedrig | ✅ |
| 0.2 | `@typescript/native-preview@beta` hinzufügen (`tsgo`-Binary) | `package.json` | Niedrig | ✅ |
| 0.3 | Build-Script auf `tsgo && vite build` umstellen | `package.json` | Niedrig | ✅ |
| 0.4 | `type-check`-Script `tsgo` hinzufügen | `package.json` | Niedrig | ✅ |
| 0.5 | ESLint-Konfigurations-Konflikt beheben (redundanter Block 2) | `eslint.config.js` | Niedrig | ✅ |
| 0.6 | ROADMAP.md erstellen | `ROADMAP.md` | Niedrig | ✅ |
| 0.7 | Status-Snapshot 2026-04-23 | `docs/STATUS-2026-04-23.md` | Niedrig | ✅ |

**Gewinn:** bis zu 10× schnellerer Type-Check-Zyklus lokal und in CI. Keine semantischen Änderungen, volle Kompatibilität zu TS 6.

**Notiz:** tsconfig-Strictness-Flags (`noUncheckedSideEffectImports`, `stableTypeOrdering`) werden erst bei TS 7.0 GA aktiviert (→ Milestone 7).

---

## Milestone 0.1 — Kritische Audit-Reste

**Ziel:** Die im Audit markierten kurzfristigen Kritikalitäten K1 und K2 schließen.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 0.1.1 | `@faker-js/faker` aus Production-Dependencies entfernen (nur noch devDep + dynamischer Import) | K1 | `package.json` | Niedrig | ✅ |
| 0.1.2 | `saveSettings()` aus `settingsService.ts` entfernen (dead code, 0 Callers) | K2 | `src/services/settingsService.ts` | Niedrig | ✅ |
| 0.1.3 | Bundle-Budget erneut prüfen nach K1/K2 | K1 | `budget.json`, `scripts/check-bundle-budget.mjs` | Niedrig | ✅ |

---

## Milestone 1 — DevInfra & CI-Hygiene

**Ziel:** Reproduzierbare Entwicklungsumgebung, automatisierte Dependency-Updates, saubere CI-Pipelines und Commit-Gates.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 1.1 | DevContainer einrichten (Node **24**, pnpm 10, Rust/Cargo, VS Code Extensions) | CI1 | `.devcontainer/devcontainer.json` | Niedrig (30 min) | ✅ Image `typescript-node:24-bookworm` |
| 1.2 | Dependabot konfigurieren (npm + github-actions, weekly) | CI2 | `.github/dependabot.yml` | Niedrig (10 min) | ✅ |
| 1.3 | CI-Duplizierung auflösen: gemeinsamen Reusable Workflow `validate.yml` extrahieren | CI5 | `.github/workflows/validate.yml`, `ci.yml`, `deploy.yml` | Mittel (1 h) | ✅ |
| 1.4 | GitHub Issue- und PR-Templates anlegen | CI6 | `.github/ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md` | Niedrig (1 h) | ✅ |
| 1.5 | Husky + lint-staged + commitlint einrichten (pre-commit Gates) | CI3 | `.husky/`, `lint-staged.config.mjs`, `commitlint.config.mjs` | Niedrig (45 min) | ✅ |
| 1.6 | `.vscode/extensions.json` mit Empfehlungen anlegen | CI4 | `.vscode/extensions.json` | Niedrig (10 min) | ✅ |

---

## Milestone 2 — i18n-Completion (Wellen 2 + 3)

**Ziel:** Alle verbleibenden ~90 hartcodierten deutschen Strings auf i18n-Keys migrieren.

> Welle 1 (~60 Strings in `CookModeView`, `Onboarding`, `WhatsNewModal`, `GlobalErrorBoundary`) wurde bereits in Sprint 2 (April 2026) abgeschlossen.

| # | Maßnahme | Herkunft | Komponente / Service | Strings | Aufwand | Status |
|---|---|---|---|---|---|---|
| 2.1 | Feature-Subkomponenten: `ShoppingListHeader`, `RecipeBookHeader`, `VoiceControlWhisperUI`, `ShoppingListQuickAdd`, `Onboarding` Tour-Steps, `AiChefPanel` Suggestions-Arrays | I1 Welle 2 | diverse `src/components/*/` | ~25 | Mittel (2–3 h) | ✅ |
| 2.2 | Services und Prompts: `geminiService` (Language-Aware Prompts + Error-Messages), `voiceCommands` (Toast i18n + EN-Keywords), `exportService` (MealType-Label), `DayColumn`/`MealPlanner` (MealType Display), `foodDatabase` (Kategorie-Lookup) | I1 Welle 3 | `src/services/`, `src/components/` | ~40 | Hoch (4–6 h) | ✅ |
| 2.3 | Verbleibende hartcodierte Strings lokalisieren: `aria-label`-Werte + `RecipeDetail` "Planen"/"Einkaufen"-Buttons | A7 | `src/components/` | — | Niedrig (1 h) | ✅ inkl. breitem A11y-Sweep (Header, Tabs, CookMode, Voice-Overlays, App-Dialoge, MealPlanner); neue Keys `header.*`, `recipeDetail.tabsListAria`, `voiceControl.*`, `cookMode.ingredient*Aria`, `mealPlanner.overlay.dismissPlacement` |

**Hinweis:** Gemini-Prompts können ggf. auf Deutsch bleiben, wenn der KI-Kontext deutsch sein soll — Einzelfallentscheidung bei 2.2.

---

## Milestone 3 — Architektur-Cleanup

**Ziel:** Große Komponenten aufteilen, State-Muster vereinheitlichen.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 3.1 | `RecipeDetail.tsx` aufteilen: Header/Metadata/ActionBar/Nutrition/Tabs/Modals | M1 | `src/components/recipe-detail/` | Mittel (2–3 h) | ✅ inkl. `RecipePlanExportBar`, `RecipeDetailTabs`, `RecipeExpertTipsSection` |
| 3.2 | `CookModeView.tsx` aufteilen: Timer-/Zutaten-/Footer-Module | M2 | `src/components/cook-mode/`, `CookModeView.tsx`, `src/hooks/useCookModeController.ts` | Mittel (2 h) | ✅ UI-Module + Reducer; Logik im Hook `useCookModeController` |
| 3.3 | `MealPlanner` auf Context-Pattern migrieren (analog zu `PantryManager`/`ShoppingList`) | M4 | `MealPlanner.tsx`, `contexts/MealPlannerContext.tsx`, `hooks/useMealPlannerScreen.ts`, `meal-planner/mealPlannerConstants.ts` | Hoch (6–8 h) | ✅ |

---

## Milestone 4 — Security-Hardening

**Ziel:** Lücken schließen, die im Security-Audit als "offen" eingestuft wurden.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 4.1 | Alle Gemini-Responses mit Zod oder manuellen Type-Guards validieren (post-`JSON.parse`) | S5 | `src/services/geminiService.ts` | Mittel (2–3 h) | ✅ Zod (`parseAiJsonWithSchema`): Rezeptideen, Rezept, Einkaufsliste, Nährwert-Verifikation; API-`responseSchema` unverändert |
| 4.2 | API-Key-Kommentare korrigieren: "obfuskiert" statt "verschlüsselt" | S1 | `src/services/apiKeyService.ts` | Niedrig (15 min) | ✅ JSDoc korrekt: "encrypted via WebCrypto / falls back to legacy obfuscation" |
| 4.3 | CSP für Tauri-Webview (und Doku-Align mit `index.html`) | S4 | `src-tauri/tauri.conf.json`, `docs/DEPLOYMENT.md` | Mittel (1–2 h) | ✅ CSP-String gesetzt; Header-CSP am Hosting weiterhin optional |
| 4.4 | CodeQL Alert #7 beheben: schlechten HTML-Regex in `sanitizeWebContentForPrompt` durch DOMPurify ersetzen | CodeQL #7 | `src/services/geminiService.ts` | Niedrig (30 min) | ✅ |

---

## Milestone 5 — Testing

**Ziel:** Test-Coverage von ~35 % auf ≥70 % erhöhen.

**Aktueller Stand (Mai 2026, Vitest v8-Coverage, Snapshot 2026-05-04):**
| Metrik | Aktuell | Ziel |
|---|---|---|
| Statements | ~59 % | ≥70 % |
| Branches | ~46 % | ≥60 % |
| Functions | ~52 % | ≥70 % |
| Lines | ~61 % | ≥70 % |

| # | Maßnahme | Herkunft | Bereich | Aufwand | Status |
|---|---|---|---|---|---|
| 5.1 | Repository-Layer testen: `db.ts`, `dbMigrations.ts` | T1 | `src/services/__tests__/` | Hoch (6–8 h) | ✅ `dbMigrations.test.ts`; ✅ `dataRepository.test.ts` (importData); `db.ts` nicht isoliert getestet (Import-Zyklen / Side-Effects) |
| 5.2 | Store-Slices testen: `settingsSlice`, `uiSlice`, `shoppingListSlice` | T1 | `src/store/__tests__/` | Mittel (3–4 h) | ✅ |
| 5.3 | Hooks testen: `useShoppingList`, `usePantryManager`, `useMealPlan` | T1 | `src/hooks/__tests__/` | Hoch (4–6 h) | 🟨 **`useMealPlannerScreen`**, **`useCookModeController`**, **`useMealPlan`**, **`useShoppingList`**, **`usePantryManager`** (Stub/Mock); weiter: Edge-Cases und Integration |
| 5.4 | Services testen: `apiKeyService`, `voiceCommands`, `exportService` | T1 | `src/services/__tests__/` | Mittel (3–4 h) | ✅ apiKeyService, exportService, **`voiceCommands.test.ts`** (`processCommand`); 🟨 **`mealPlanRepository.test.ts`**, **`pantryRepository.test.ts`** (Dexie gemockt) |
| 5.5 | Component-Smoke-Tests für kritische Seiten (React Testing Library) | T1 | `src/components/**/__tests__/` | Hoch (4–6 h) | 🟨 Smoke: **`App.smoke.test.tsx`**, MealPlanner, CookModeView, RecipeDetailTabs, **`PantryManager.smoke.test.tsx`**, **`ShoppingList.smoke.test.tsx`** (`smokeHookStubs.ts`); Modale **`BulkAddModal`**, **`AiModal`**; **`PantryList.test.tsx`**; Context: **`MealPlannerContext`**, **`PantryManagerContext`**, **`ShoppingListContext.test.tsx`**; **`DayColumn.test.tsx`** + **`dayColumnPantryStatus.test.ts`** |

**Gesamtaufwand Milestone 5:** ~20–28 h

---

## Milestone 6 — Dokumentation

**Ziel:** Architektur-Diagramm, Service-API-Doku, README-Realismus-Check.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 6.1 | Mermaid-Architekturdiagramm (Datenfluss: UI → Redux → Dexie → Services) | Doku-Lücke | `docs/ARCHITECTURE.md` | Mittel (2 h) | ✅ |
| 6.2 | JSDoc in `db.ts`, `geminiService.ts`, `apiKeyService.ts` | Doku-Lücke | `src/services/` | Mittel (2–3 h) | ✅ Modul-Köpfe `db.ts`, `geminiService.ts`; `apiKeyService` bereits ausführlich |
| 6.3 | README-Status und Links gegen aktuellen Stand | Doku-Lücke | `README.md` | Niedrig (1 h) | ✅ Status 2026-05-01, Link `STATUS-2026-05-01.md`, KI-Key-Beschreibung |
| 6.4 | Doku-Sync: ARCHITECTURE, PROJECT-STRUCTURE, DEPLOYMENT, TESTING, DEVELOPMENT, copilot-instructions, AUDIT, STATUS-2026-05-02 | Follow-up | `docs/*`, Root | Niedrig–Mittel | ✅ 2026-05-02 (Nachziehen M5-Essensplan/Smoke/Repos) |
| 6.5 | Monorepo-Pfad-Sync nach `apps/web/` + STATUS-2026-05-16 + CI-Audit-Gate | Housekeeping 2026-05-16 | `docs/*`, `.github/`, `.cursor/` | Niedrig | ✅ |

---

## Milestone 7 — TypeScript 7.0 GA

**Ziel:** Vollständiger Wechsel auf stabiles TS 7.0, neue Compiler-Flags aktivieren.

_Vorbedingung: TS 7.0 Stable Release (voraussichtlich Q3 2026)_

| # | Maßnahme | Datei(en) | Aufwand | Status |
|---|---|---|---|---|
| 7.1 | `@typescript/native-preview` entfernen, `typescript` auf ^7.0.0 upgraden | `package.json` | Niedrig | 🔲 |
| 7.2 | `noUncheckedSideEffectImports: true` aktivieren | `tsconfig.json` | Niedrig | 🔲 |
| 7.3 | `stableTypeOrdering: true` aktivieren | `tsconfig.json` | Niedrig | 🔲 |
| 7.4 | Alle deprecated tsconfig-Flags prüfen und entfernen | `tsconfig.json` | Niedrig | 🔲 |
| 7.5 | TypeScript Native Preview VS Code Extension auf stabile Version wechseln | VS Code Settings | Niedrig | 🔲 |

---

## Bekannte Offene Punkte (kein Milestone-Slot nötig)

| Punkt | Herkunft | Entscheidung |
|---|---|---|
| `api-key` Kommentar "Secure API Key Management" ist irreführend (XOR-Obfuskation, kein echter Crypto) | S1 | Bei Milestone 4.2 beheben |
| `react-hooks/exhaustive-deps: 'off'` — stale-closure-Risiko in diversen Hooks | H1/H2 | Nach Milestone 3 schrittweise auf `warn` heben und Hooks bereinigen |
| ~~Settings Legacy-Fallback~~ | K2 | **Erledigt:** Migration nach `persist:settings` via `migrateLegacySettings`; direktes Auslesen von `culinaSyncSettings` in `loadSettings()` entfernt (`settingsKeys` / `settingsMerge`) |

---

## Milestone 8 — Tauri Desktop-Release

**Ziel:** Erste plattformübergreifende Desktop-Builds (.exe, .dmg, .AppImage) via Tauri 2.

_Vorbedingung: M1 (DevContainer mit Rust), Tauri 2 stabil_

| # | Maßnahme | Datei(en) | Aufwand | Status |
|---|---|---|---|---|
| 8.1 | `tauri.conf.json` für Release konfigurieren (Bundle-Identifier, Icons, Fenster-Einstellungen) | `src-tauri/tauri.conf.json` | Niedrig | 🔲 |
| 8.2 | GitHub Actions Release-Workflow für Tauri-Builds (matrix: windows, macos, linux) | `.github/workflows/tauri-release.yml` | Mittel (3–4 h) | 🔲 |
| 8.3 | Plattformspezifische CSP und native Dialoge in `src-tauri/main.rs` | `src-tauri/main.rs` | Mittel (2 h) | 🔲 |
| 8.4 | README.md um Desktop-Download-Sektion und Installationsanleitung ergänzen | `README.md` | Niedrig (1 h) | 🔲 |

**Gesamtaufwand Milestone 8:** ~8–12 h

---

## Milestone 9 — Bundle-Optimierungen

**Ziel:** Initiale Ladezeit senken durch gezieltes Lazy-Loading schwerer Bibliotheken.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 9.1 | `jsPDF` auf dynamischen Import umstellen (nur bei PDF-Export laden) | P1 | `src/services/exportService.ts` | Niedrig (1 h) | ✅ |
| 9.2 | `tesseract.js` auf dynamischen Import umstellen (OCR-Modul) | P1 | `src/services/` | Niedrig (1 h) | ✅ |
| 9.3 | `vendor-misc`-Chunk analysieren (886 KB) und ggf. weiter splitten | P2 | `vite.config.ts` `manualChunks` | Mittel (2–3 h) | 🟨 `vendor-export` (jspdf/html2canvas/papaparse) ausgelagert; Rest beobachten |
| 9.4 | `vendor-faker`-Chunk (2.6 MB) prüfen — nur noch Dev-Fallback, niemals im initialen Bundle | P1 | Lazy-Import verifizieren | Niedrig (30 min) | ✅ |

**Gesamtaufwand Milestone 9:** ~5–7 h

---

## Milestone 10 — Optionaler Multi-Device-Sync

**Ziel:** Geräteübergreifende Datensynchronisation ohne zentralen Server.

| # | Maßnahme | Datei(en) | Aufwand | Status |
|---|---|---|---|---|
| 10.1 | QR-Code-Export/Import für Pantry + Rezepte (lokaler Sync über LAN) | `src/services/` | Hoch (6–8 h) | 🔲 |
| 10.2 | WebDAV-Sync-Adapter (Nextcloud, ownCloud) als optionaler Provider | `src/services/syncService.ts` | Hoch (8–12 h) | 🔲 |
| 10.3 | Sync-Status-UI im Settings-Panel | `src/components/Settings.tsx` | Mittel (3–4 h) | 🔲 |
| 10.4 | Konflikt-Resolution-Strategie (Last-Write-Wins mit Timestamp) | `src/services/` | Mittel (3–4 h) | 🔲 |

**Gesamtaufwand Milestone 10:** ~20–28 h

---

## Changelog dieser Roadmap

| Version | Datum | Änderung |
|---|---|---|
| 1.3 | 2026-05-02 | M3.3 MealPlanner-Context; M4.1 Zod in `geminiService`; Legacy-Settings-Migration ohne Runtime-Fallback in `loadSettings`; A11y-Sweep; CI Node 24 in validate/ci; M6.4 Doku-Sync; `docs/STATUS-2026-05-02.md` |
| 1.2 | 2026-05-01 | M3.1/M3.2 erledigt; M4.3 CSP Tauri; M5/6 Fortschritt (Tests, Mermaid, JSDoc, README); Verweis `docs/STATUS-2026-05-01.md` |
| 1.1 | 2026-04-23 | M0.1 (K1+K2 geschlossen) hinzugefügt; M1 um 1.3–1.6 erweitert (Husky, Reusable CI, Templates, VS Code); M8–M10 (Tauri, Bundle, Sync) angehängt |
| 1.0 | 2026-04-23 | Initiale Roadmap auf Basis des vollständigen Audits; M0 abgeschlossen |

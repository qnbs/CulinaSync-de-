# CulinaSync — Roadmap

> **Stand:** 23. April 2026 · Basis: vollständiges Code-, Architektur- und Security-Audit vom 14.–22. April 2026  
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

## Milestone 1 — DevInfra & CI-Hygiene

**Ziel:** Reproduzierbare Entwicklungsumgebung, automatisierte Dependency-Updates, saubere CI-Pipelines.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 1.1 | DevContainer einrichten (Node 22, pnpm 10, VS Code Extensions) | CI1 | `.devcontainer/devcontainer.json` | Niedrig (30 min) | 🔲 |
| 1.2 | Dependabot konfigurieren (npm + github-actions, weekly) | CI2 | `.github/dependabot.yml` | Niedrig (10 min) | 🔲 |
| 1.3 | CI-Duplizierung auflösen: Lint+Test in `deploy.yml` entfernen, `needs: ci` | CI5 | `.github/workflows/deploy.yml` | Mittel (1 h) | 🔲 |
| 1.4 | GitHub Issue- und PR-Templates anlegen | CI6 | `.github/ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md` | Niedrig (1 h) | 🔲 |

---

## Milestone 2 — i18n-Completion (Wellen 2 + 3)

**Ziel:** Alle verbleibenden ~90 hartcodierten deutschen Strings auf i18n-Keys migrieren.

> Welle 1 (~60 Strings in `CookModeView`, `Onboarding`, `WhatsNewModal`, `GlobalErrorBoundary`) wurde bereits in Sprint 2 (April 2026) abgeschlossen.

| # | Maßnahme | Herkunft | Komponente / Service | Strings | Aufwand | Status |
|---|---|---|---|---|---|---|
| 2.1 | Feature-Subkomponenten: Pantry, Shopping, Meal, Recipe, Settings | I1 Welle 2 | diverse `src/components/*/` | ~55 | Hoch (4–6 h) | 🔲 |
| 2.2 | Services und Prompts: `geminiService`, `voiceCommands`, `exportService` | I1 Welle 3 | `src/services/` | ~43 | Mittel (2–3 h) | 🔲 |
| 2.3 | Verbleibende hartcodierte `aria-label`-Werte lokalisieren | A7 | `src/components/` | — | Niedrig (1 h) | 🔲 |

**Hinweis:** Gemini-Prompts können ggf. auf Deutsch bleiben, wenn der KI-Kontext deutsch sein soll — Einzelfallentscheidung bei 2.2.

---

## Milestone 3 — Architektur-Cleanup

**Ziel:** Große Komponenten aufteilen, State-Muster vereinheitlichen.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 3.1 | `RecipeDetail.tsx` (~550 Zeilen) aufteilen: `RecipeNutritionPanel`, `RecipeActionBar`, `ExportDropdown`, `MealPlanModal` | M1 | `src/components/RecipeDetail.tsx` | Mittel (2–3 h) | 🔲 |
| 3.2 | `CookModeView.tsx` (~380 Zeilen) aufteilen: `CookModeTimer`, `CookModeIngredients`, `CookModeFooter` | M2 | `src/components/CookModeView.tsx` | Mittel (2 h) | 🔲 |
| 3.3 | `MealPlanner` auf Context-Pattern migrieren (analog zu `PantryManager`/`ShoppingList`) | M4 | `src/components/MealPlanner.tsx`, neuer Context | Hoch (6–8 h) | 🔲 |

---

## Milestone 4 — Security-Hardening

**Ziel:** Lücken schließen, die im Security-Audit als "offen" eingestuft wurden.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 4.1 | Alle Gemini-Responses mit Zod oder manuellen Type-Guards validieren (post-`JSON.parse`) | S5 | `src/services/geminiService.ts` | Mittel (2–3 h) | 🔲 |
| 4.2 | API-Key-Kommentare korrigieren: "obfuskiert" statt "verschlüsselt" | S1 | `src/services/apiKeyService.ts` | Niedrig (15 min) | 🔲 |
| 4.3 | CSP auf Header-Ebene für Tauri / künftiges Hosting vorbereiten | S4 | `src-tauri/tauri.conf.json`, Deployment-Doku | Mittel (1–2 h) | 🔲 |

---

## Milestone 5 — Testing

**Ziel:** Test-Coverage von ~35 % auf ≥70 % erhöhen.

**Aktueller Stand (April 2026):**
| Metrik | Aktuell | Ziel |
|---|---|---|
| Statements | 34.7 % | ≥70 % |
| Branches | 26.8 % | ≥60 % |
| Functions | 31.6 % | ≥70 % |
| Lines | 35.6 % | ≥70 % |

| # | Maßnahme | Herkunft | Bereich | Aufwand | Status |
|---|---|---|---|---|---|
| 5.1 | Repository-Layer testen: `db.ts`, `dbMigrations.ts` | T1 | `src/services/__tests__/` | Hoch (6–8 h) | 🔲 |
| 5.2 | Store-Slices testen: `settingsSlice`, `uiSlice`, `shoppingListSlice` | T1 | `src/store/__tests__/` | Mittel (3–4 h) | 🔲 |
| 5.3 | Hooks testen: `useShoppingList`, `usePantryManager`, `useMealPlan` | T1 | `src/hooks/__tests__/` | Hoch (4–6 h) | 🔲 |
| 5.4 | Services testen: `apiKeyService`, `voiceCommands`, `exportService` | T1 | `src/services/__tests__/` | Mittel (3–4 h) | 🔲 |
| 5.5 | Component-Smoke-Tests für kritische Seiten (React Testing Library) | T1 | `src/components/__tests__/` | Hoch (4–6 h) | 🔲 |

**Gesamtaufwand Milestone 5:** ~20–28 h

---

## Milestone 6 — Dokumentation

**Ziel:** Architektur-Diagramm, Service-API-Doku, README-Realismus-Check.

| # | Maßnahme | Herkunft | Datei(en) | Aufwand | Status |
|---|---|---|---|---|---|
| 6.1 | Mermaid-Architekturdiagramm (Datenfluss: UI → Redux → Dexie → Services) | Doku-Lücke | `docs/ARCHITECTURE.md` oder `README.md` | Mittel (2 h) | 🔲 |
| 6.2 | JSDoc in `db.ts`, `geminiService.ts`, `apiKeyService.ts` | Doku-Lücke | `src/services/` | Mittel (2–3 h) | 🔲 |
| 6.3 | README.md `[x]`-Einträge gegen tatsächlichen Stand abgleichen | Doku-Lücke | `README.md` | Niedrig (1 h) | 🔲 |

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
| Settings Legacy-Fallback (`culinaSyncSettings` in localStorage) | K2 | Kann nach ~3 Monaten Laufzeit entfernt werden |

---

## Changelog dieser Roadmap

| Version | Datum | Änderung |
|---|---|---|
| 1.0 | 2026-04-23 | Initiale Roadmap auf Basis des vollständigen Audits; M0 abgeschlossen |

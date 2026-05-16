# CulinaSync

Local-first Koch-, Vorrats-, Rezept- und Einkaufslisten-App auf Basis von React, Vite, Dexie und GitHub Pages.

[Live-Demo](https://qnbs.github.io/CulinaSync-de-/) | [Architektur](./docs/ARCHITECTURE.md) | [Entwicklung](./docs/DEVELOPMENT.md) | [Deployment](./docs/DEPLOYMENT.md) | [Testing](./docs/TESTING.md) | [Troubleshooting](./docs/TROUBLESHOOTING.md) | [Beitragen](./CONTRIBUTING.md) | [Security](./SECURITY.md)

## Status 2026-05-04

Der aktuelle Arbeitsstand ist in **[docs/STATUS-2026-05-04.md](./docs/STATUS-2026-05-04.md)** dokumentiert (M5-Testausbau, Coverage-Zwischenstand, Vitest-Infra, Bundle-Chunk `vendor-export`, Tauri-Prep, Live-Demo-QA-Checkliste).  
Vorgaenger: [STATUS-2026-05-02.md](./docs/STATUS-2026-05-02.md), [STATUS-2026-05-01.md](./docs/STATUS-2026-05-01.md); aeltere Snapshots: [STATUS-2026-04-23.md](./docs/STATUS-2026-04-23.md), [STATUS-2026-04-22.md](./docs/STATUS-2026-04-22.md).

Kurz:

- **M3:** `recipe-detail/*`, `cook-mode/*`, `useCookModeController`; **MealPlanner** mit `MealPlannerProvider` / `useMealPlannerScreen` (M3.3 erledigt); **DayColumn** nutzt `getMealPlanSlotPantryStatus` aus `meal-planner/dayColumnPantryStatus.ts`.
- **M4:** Zod-Validierung in `geminiService.ts`; M4.3 Tauri-CSP siehe [DEPLOYMENT.md](./docs/DEPLOYMENT.md).
- **Settings:** Migration von `culinaSyncSettings` nach `persist:settings` vor Store-Rehydration; `loadSettings()` nur Persist oder Defaults.
- **M5 (fortgeschritten):** Vitest **222** Tests in **59** Dateien; u. a. App-/Hook-/Service-Suites, Einkaufsliste (**`BulkAddModal`**, **`AiModal`**), **`PantryList`**, `useRecipeDetail`, `voiceCommands` inkl. `executeVoiceAction`, `fake-indexeddb` fuer Dexie in jsdom. Coverage v8 ca. **59 %** Statements / **61 %** Lines — Ziel ≥70 % weiterhin offen; **Coverage-Thresholds** in `vitest.config.ts` (Regressionsschutz, Snapshot 2026-05-04). CI laeuft `test:coverage`, laedt **coverage-lcov** als Artefakt und prueft Bundle-Budget auf jedem Validate-Lauf. Manuelle Demo: [docs/LIVE-DEMO-QA.md](./docs/LIVE-DEMO-QA.md).

## Ueberblick

CulinaSync ist eine installierbare Progressive Web App fuer Haushaltsorganisation rund um Vorrat, Rezepte, Essensplanung und Einkauf. Die App ist local-first aufgebaut: persistente Domaindaten liegen in IndexedDB via Dexie, waehrend Redux Toolkit hauptsaechlich UI- und Session-Zustand verwaltet.

Die Anwendung laeuft lokal, auf GitHub Pages und optional in nativen Wrappern. KI-Funktionen sind optional und verwenden einen vom Nutzer hinterlegten Gemini-API-Key, der nicht in den Build eingebettet wird.

## Kernfunktionen

- Vorratsverwaltung mit Ablaufdaten, Filterung, Suche und Smart-Input.
- Rezeptbuch mit Detailansichten, Zutatenabgleich und Exportfunktionen.
- Essensplanung mit planerischer Uebersicht und Querverknuepfung zu Rezepten.
- Einkaufsliste mit Kategorisierung und Sprach-/Smart-Input.
- KI-Chef fuer Rezept- und Listenunterstuetzung auf Basis von Gemini.
- PWA-Unterstuetzung mit Offline-Grundfaehigkeit, Installierbarkeit und GitHub-Pages-Deployment.
- Deutsche und englische UI-Texte ueber i18next.

## Tech-Stack

- React 19
- TypeScript 6 / 7 Beta (tsgo)
- Vite 8
- Redux Toolkit
- Dexie / IndexedDB
- Vitest + MSW
- GitHub Actions + GitHub Pages
- pnpm 10 (alternativ npm fuer Scripts; siehe [docs/TESTING.md](./docs/TESTING.md))
- Zod (Runtime-Validierung von Gemini-JSON)

## Architektur in Kurzform

- `index.tsx` laedt zuerst den Redux-Store (damit synchron Settings-Legacy-Migration laeuft), dann i18n, Provider und Persist Gate.
- `src/App.tsx` orchestriert Navigation, Lazy Loading, Command Palette, Voice-Trigger und globale Modals.
- `src/store/` enthaelt Redux-Slices fuer UI-/Session-Zustand und Persist-Konfiguration.
- `src/services/db.ts` ist der Einstiegspunkt fuer Datenbank- und Repository-Zugriffe.
- `src/hooks/useMealPlan.ts` und `src/hooks/useShoppingList.ts` lesen reaktive Daten aus Dexie via `useLiveQuery`; der Essensplan nutzt `useMealPlannerScreen.ts` im `MealPlannerProvider` (Plan + Pantry).
- `src/components/` enthaelt Seiten sowie Feature-Unterordner fuer spezifische Teiloberflaechen.

Mehr Details stehen in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) und [docs/PROJECT-STRUCTURE.md](./docs/PROJECT-STRUCTURE.md).

## Schnellstart

### Voraussetzungen

- Node.js 22 oder neuer (lokal); CI verwendet Node **24** fuer Setup-Schritte
- pnpm 10 oder neuer (alternativ: `npm run …` / `npx pnpm@10` wie in [docs/TESTING.md](./docs/TESTING.md))

### Installation

```bash
pnpm install
```

### Entwicklung starten

```bash
pnpm run dev
```

### Wichtige Befehle

```bash
pnpm run lint
pnpm run test
pnpm run build
pnpm run test:coverage
pnpm run check:bundle-budget
pnpm run preview
pnpm run check:all   # lint + type-check + test + build + bundle-budget + npm audit (high)
```

## KI und API-Key

- Gemini-Aufrufe leben ausschliesslich in `src/services/geminiService.ts`; strukturierte JSON-Nutzlasten werden nach dem Parsen mit **Zod** validiert.
- Der API-Key wird durch den Nutzer ueber die Einstellungen hinterlegt.
- Der Key wird nicht ueber `process.env`, `VITE_*`, `localStorage` oder den Build verteilt.
- Die Speicherung erfolgt **verschlüsselt (WebCrypto)** in IndexedDB ueber `src/services/apiKeyService.ts`, mit Legacy-Fallback nur ohne `crypto.subtle`.

## Deployment

Das Repo deployt automatisch auf GitHub Pages, wenn `main` aktualisiert wird.

- CI: `.github/workflows/ci.yml` (ruft den wiederverwendbaren Workflow **`.github/workflows/validate.yml`** auf: lint → **type-check** → test:coverage → build → bundle-budget)
- Deploy: `.github/workflows/deploy.yml`
- CodeQL: `.github/workflows/codeql.yml`

Die aktuelle Pages-URL ist auf den Repo-Namen ausgerichtet. `vite.config.ts` setzt `base` in GitHub Actions automatisch auf `/CulinaSync-de-/`.

## Qualitaet und Sicherheit

- ESLint fuer statische Qualitaetschecks.
- Vitest und MSW fuer Tests.
- CodeQL fuer Security-Scanning.
- Bundle-Budget-Check ueber `scripts/check-bundle-budget.mjs`.
- Persistenter Browser-Storage fuer Redux ueber einen expliziten Adapter statt fragiler Default-Interop.
- Settings-Aenderungen werden ueber eine erlaubte Mutator-Map statt ueber freie Objektpfade geschrieben.
- Downloads werden mit erlaubten MIME-Typen und bereinigten Dateinamen erzeugt.

## Dokumentation

- [instructions.md](./instructions.md): zentraler Einstieg fuer Menschen und Agenten (Gates, Checks)
- [PRD.md](./PRD.md): Product Requirements (Scope, FR/NFR, Erfolgsmetriken)
- [.notes/meeting_notes.md](./.notes/meeting_notes.md): Consciousness Stream — Kurzprotokoll und Kontext
- [docs/README.md](./docs/README.md): Dokumentationsindex
- [docs/STATUS-2026-05-04.md](./docs/STATUS-2026-05-04.md): aktueller Repo-Stand (Mai 2026)
- [docs/LIVE-DEMO-QA.md](./docs/LIVE-DEMO-QA.md): GitHub-Pages Smoke-Checkliste
- [docs/STATUS-2026-05-02.md](./docs/STATUS-2026-05-02.md): vorheriger Mai-Snapshot
- [docs/STATUS-2026-05-01.md](./docs/STATUS-2026-05-01.md): vorheriger Mai-Snapshot (Audit-Follow-up)
- [docs/STATUS-2026-04-22.md](./docs/STATUS-2026-04-22.md): Session- und Arbeitsstand 2026-04-22
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md): System- und Datenarchitektur
- [docs/PROJECT-STRUCTURE.md](./docs/PROJECT-STRUCTURE.md): Repo- und Ordnerstruktur
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md): Setup, lokale Entwicklung und Konventionen
- [docs/TESTING.md](./docs/TESTING.md): Teststrategie und Testbefehle
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md): CI/CD, Pages und Betriebsdetails
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md): haeufige Fehlerbilder und Gegenmassnahmen
- [CONTRIBUTING.md](./CONTRIBUTING.md): Beitragsregeln
- [SECURITY.md](./SECURITY.md): Security-Prozess und Hinweise
- [SUPPORT.md](./SUPPORT.md): Support- und Meldewege

## Desktop (Tauri, Vorbereitung)

- **Konfiguration:** `src-tauri/tauri.conf.json` — Fenster, CSP, **`identifier`** `io.github.qnbs.culinasync`.
- **CI:** Workflow [`.github/workflows/tauri-release.yml`](./.github/workflows/tauri-release.yml) (`workflow_dispatch`) prueft Web-Build und vorhandene Tauri-Dateien. Vollstaendige **native** Artefakte folgen mit Cargo-Workspace (siehe [ROADMAP.md](./ROADMAP.md) M8).
- **Deployment-Hinweise:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) (CSP / Hosting).

## Bekannte technische Punkte

- Die GitHub-Actions-Laufe sind gruen, aber GitHub-eigene Actions wie `actions/configure-pages`, `actions/upload-pages-artifact` und `actions/deploy-pages` melden derzeit weiterhin Node-20-Depracation-Warnungen, obwohl sie ueber `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` bereits auf Node 24 erzwungen werden. Das ist aktuell ein Upstream-Thema der GitHub-verwalteten Actions.
- Alte lokale Daten unter `culinaSyncSettings` werden beim Start in das Redux-Persist-Format migriert (`migrateLegacySettings`); `loadSettings()` liest **nur** `persist:settings` oder Defaults — kein paralleles Lesen des Legacy-Keys mehr.

## Lizenz

Das Projekt steht unter der in [LICENSE](./LICENSE) enthaltenen Lizenz.

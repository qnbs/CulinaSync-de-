# CulinaSync

Local-first Koch-, Vorrats-, Rezept- und Einkaufslisten-App auf Basis von React, Vite, Dexie und GitHub Pages.

[Live-Demo](https://qnbs.github.io/CulinaSync-de-/) | [Architektur](./docs/ARCHITECTURE.md) | [Entwicklung](./docs/DEVELOPMENT.md) | [Deployment](./docs/DEPLOYMENT.md) | [Testing](./docs/TESTING.md) | [Troubleshooting](./docs/TROUBLESHOOTING.md) | [Beitragen](./CONTRIBUTING.md) | [Security](./SECURITY.md)

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
- TypeScript 5
- Vite 8
- Redux Toolkit
- Dexie / IndexedDB
- Vitest + MSW
- GitHub Actions + GitHub Pages
- pnpm 10

## Architektur in Kurzform

- `index.tsx` initialisiert i18n, Redux Provider und Persist Gate.
- `src/App.tsx` orchestriert Navigation, Lazy Loading, Command Palette, Voice-Trigger und globale Modals.
- `src/store/` enthaelt Redux-Slices fuer UI-/Session-Zustand und Persist-Konfiguration.
- `src/services/db.ts` ist der Einstiegspunkt fuer Datenbank- und Repository-Zugriffe.
- `src/hooks/useMealPlan.ts` und `src/hooks/useShoppingList.ts` lesen reaktive Daten aus Dexie via `useLiveQuery`.
- `src/components/` enthaelt Seiten sowie Feature-Unterordner fuer spezifische Teiloberflaechen.

Mehr Details stehen in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) und [docs/PROJECT-STRUCTURE.md](./docs/PROJECT-STRUCTURE.md).

## Schnellstart

### Voraussetzungen

- Node.js 22 oder neuer
- pnpm 10 oder neuer

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
```

## KI und API-Key

- Gemini-Aufrufe leben ausschliesslich in `src/services/geminiService.ts`.
- Der API-Key wird durch den Nutzer ueber die Einstellungen hinterlegt.
- Der Key wird nicht ueber `process.env`, `VITE_*`, `localStorage` oder den Build verteilt.
- Die Speicherung erfolgt obfuskiert in IndexedDB ueber `src/services/apiKeyService.ts`.

## Deployment

Das Repo deployt automatisch auf GitHub Pages, wenn `main` aktualisiert wird.

- CI: `.github/workflows/ci.yml`
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

- [docs/README.md](./docs/README.md): Dokumentationsindex
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md): System- und Datenarchitektur
- [docs/PROJECT-STRUCTURE.md](./docs/PROJECT-STRUCTURE.md): Repo- und Ordnerstruktur
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md): Setup, lokale Entwicklung und Konventionen
- [docs/TESTING.md](./docs/TESTING.md): Teststrategie und Testbefehle
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md): CI/CD, Pages und Betriebsdetails
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md): haeufige Fehlerbilder und Gegenmassnahmen
- [CONTRIBUTING.md](./CONTRIBUTING.md): Beitragsregeln
- [SECURITY.md](./SECURITY.md): Security-Prozess und Hinweise
- [SUPPORT.md](./SUPPORT.md): Support- und Meldewege

## Bekannte technische Punkte

- Die GitHub-Actions-Laufe sind gruen, aber GitHub-eigene Actions wie `actions/configure-pages`, `actions/upload-pages-artifact` und `actions/deploy-pages` melden derzeit weiterhin Node-20-Depracation-Warnungen, obwohl sie ueber `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` bereits auf Node 24 erzwungen werden. Das ist aktuell ein Upstream-Thema der GitHub-verwalteten Actions.
- `settingsService.ts` und Redux Persist speichern Settings weiterhin ueber zwei Wege. Das ist im Repo bekannt und sollte bei kuenftigen Persistenz-Aenderungen bewusst konsolidiert werden.

## Lizenz

Das Projekt steht unter der in [LICENSE](./LICENSE) enthaltenen Lizenz.

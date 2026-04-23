# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefuegt
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

[Unreleased]: https://github.com/qnbs/CulinaSync-de-/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/qnbs/CulinaSync-de-/releases/tag/v0.1.0

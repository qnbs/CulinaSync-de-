# CulinaSync — Full App & Repo Audit

> **Audit-Datum:** 2026-04-14
> **Scope:** Code-Qualität, Architektur, Sicherheit, A11y, i18n, Performance, Testing, CI/CD, DevContainer, Dependencies, Dokumentation

---

## Status-Update 2026-04-22

Seit dem urspruenglichen Audit wurden mehrere kritische Betriebs- und Sicherheitsprobleme bereits behoben:

- GitHub-Actions-Workflows wurden auf pnpm, aktuelle Action-Majors und Node-24-Opt-in umgestellt.
- Das GitHub-Pages-Deployment ist wieder gruen und die Live-Demo rendert nach einem vorherigen Persistenz-Crash wieder normal.
- Der `redux-persist`-Browser-Storage laeuft jetzt ueber einen expliziten Adapter in `src/store/persistStorage.ts`.
- Die Settings-Seite schreibt keine freien verschachtelten Pfade mehr, sondern verwendet erlaubte, validierte Mutatoren.
- Download-Exporte nutzen erlaubte MIME-Typen und bereinigte Dateinamen.

Noch offen ist vor allem strukturelle Nacharbeit, nicht der unmittelbare Produktionsbetrieb. Das betrifft insbesondere doppelte Settings-Persistenz, die statische `@faker-js/faker`-Einbindung im Produktionskontext und weitere im Audit genannte mittel- bis langfristige Architekturthemen.

---

## Zusammenfassung

| Kategorie | Kritisch | Hoch | Mittel | Niedrig |
|---|:---:|:---:|:---:|:---:|
| Code-Qualität & Architektur | 2 | 3 | 4 | 2 |
| Sicherheit | 0 | 3 | 2 | 1 |
| Barrierefreiheit (A11y) | 1 | 3 | 4 | 2 |
| i18n | 0 | 1 | 0 | 0 |
| Performance & Bundle | 1 | 1 | 2 | 1 |
| Testing | 0 | 1 | 0 | 0 |
| CI/CD & Infrastruktur | 0 | 2 | 3 | 1 |
| Dependencies | 1 | 2 | 1 | 1 |
| **Gesamt** | **5** | **16** | **16** | **8** |

### Bereits behoben (in diesem Audit)

| Fix | Datei |
|---|---|
| tsconfig.json: `ignoreDeprecations`, Root-Dateien in `include` | `tsconfig.json` |
| Kaputte sitemap.xml (orphaned XML-Tags) | `public/sitemap.xml` |
| Doppelter Sitemap-Eintrag in robots.txt | `public/robots.txt` |
| Veraltetes `gemini-pro-vision` → `gemini-2.5-flash` | `src/services/geminiService.ts` |
| Memory Leak: MediaStream-Tracks in useWhisperRecognition | `src/hooks/useWhisperRecognition.ts` |
| Redundante Root `types.ts` gelöscht | `types.ts` (gelöscht) |
| coverage/ und reports/ aus Git-Tracking entfernt | `.gitignore` |
| `.gitattributes` für LF-Normalisierung | `.gitattributes` (neu) |
| CHANGELOG.md nach keepachangelog erstellt | `CHANGELOG.md` (neu) |
| copilot-instructions.md umfassend erweitert | `.github/copilot-instructions.md` |

---

## 1. Code-Qualität & Architektur

### 🔴 K1 — `@faker-js/faker` in Production-Bundle

**Datei:** `package.json` (dependencies), `src/services/geminiService.ts:35`

**Problem:** `@faker-js/faker` (~800 KB unkomprimiert) steht in `dependencies` statt `devDependencies` und wird via statischem `import { fakerDE as faker }` eingebunden. Das gesamte Modul landet im Production-Bundle und sprengt das 130 KB Script-Budget.

**Empfehlung:**
1. `@faker-js/faker` nach `devDependencies` verschieben
2. Den statischen Import durch dynamischen `import()` ersetzen:
   ```ts
   const { fakerDE: faker } = await import('@faker-js/faker');
   ```
3. Alternativ: Einen kleinen lokalen Fake-Daten-Generator als Offline-Fallback schreiben (~2 KB statt 800 KB)

**Aufwand:** Mittel (2-3h) — Alle Offline-Fallback-Funktionen in `geminiService.ts` müssen auf async umgestellt werden.

---

### 🔴 K2 — Settings doppelt persistiert

**Dateien:** `src/store/index.ts`, `src/store/slices/settingsSlice.ts`, `src/services/settingsService.ts`

**Problem:** Settings werden gleichzeitig über zwei Mechanismen gespeichert:
- Redux Persist → `localStorage['persist:settings']`
- `settingsService.ts` → `localStorage['culinaSyncSettings']`

`loadSettings()` liest aus `culinaSyncSettings`, aber Redux Persist rehydriert aus `persist:settings`. Bei Divergenz gewinnt der zuletzt geschriebene Wert — Race Condition.

**Empfehlung:** Eine der beiden Persistierungen entfernen. Da Redux Persist bereits konfiguriert ist, `settingsService` auf reinen Read-Only-Zugriff für initiale Defaults umstellen und die manuelle `localStorage.setItem`-Logik entfernen.

**Aufwand:** Mittel (2-3h) — Erfordert sorgfältiges Testing der Settings-Rehydrierung.

---

### 🟠 H1 — ESLint `react-hooks/exhaustive-deps: 'off'`

**Datei:** `.eslintrc.cjs:26`

**Problem:** Die Regel ist komplett deaktiviert. Das führt zu potentiellen Stale-Closure-Bugs in `useEffect`, `useMemo`, `useCallback`. Besonders kritisch in `App.tsx` (Voice-Processing-Effect) und allen Hooks.

**Empfehlung:** Regel auf `'warn'` setzen und schrittweise die Warnings auflösen. Nicht auf `'error'` setzen, da viele bestehende Stellen betroffen sind.

**Aufwand:** Hoch (4-6h) — Viele betroffene Stellen, jede muss einzeln geprüft werden.

---

### 🟠 H2 — ESLint `@typescript-eslint/no-explicit-any: 'off'`

**Datei:** `.eslintrc.cjs:27`

**Problem:** `any` wird an vielen Stellen genutzt (z. B. `listenerMiddleware.ts`, diverse Catch-Blöcke). Keine Warnung bei neuem `any`.

**Empfehlung:** Auf `'warn'` setzen. Neue `any`-Nutzung wird sichtbar, bestehende kann schrittweise typisiert werden.

**Aufwand:** Niedrig (1h für Konfiguration, dann langfristige Cleanup-Arbeit)

---

### 🟠 H3 — `package.json` Version `0.0.0`

**Datei:** `package.json`

**Problem:** Keine Versionierung. `fetch('./package.json')` in `App.tsx` liest die Version zur Laufzeit, aber `package.json` liegt nach einem Vite-Build nicht im Output. Gleichzeitig ist die Version im Footer hartcodiert als `v2026.03.04`.

**Empfehlung:** Version auf `0.1.0` setzen (oder passendes CalVer `2026.3.4`). `fetch('./package.json')` entfernen und Version aus einem Build-Time-Replacement via `define` in `vite.config.ts` beziehen:
```ts
define: { __APP_VERSION__: JSON.stringify(pkg.version) }
```

**Aufwand:** Niedrig (30min)

---

### 🟡 M1 — `RecipeDetail.tsx` zu groß (~550 Zeilen)

**Datei:** `src/components/RecipeDetail.tsx`

**Problem:** Vereint Rezeptanzeige, Portionsskalierung, Nährwertanalyse, Bildgenerierung, Kochmodus-Start, Essensplan-Modal, Export-Dropdown, Favoriten und Zutatenstatus.

**Empfehlung:** Extrahieren: `RecipeNutritionPanel`, `RecipeActionBar`, `ExportDropdown`, `MealPlanModal` (letzteres ist bereits inline definiert).

**Aufwand:** Mittel (2-3h)

---

### 🟡 M2 — `CookModeView.tsx` zu groß (~380 Zeilen)

**Datei:** `src/components/CookModeView.tsx`

**Problem:** Timer, Zutaten-Checklist, Voice-Commands, Schritt-Navigation und Speech-Synthesis in einer Datei.

**Empfehlung:** Extrahieren: `CookModeTimer`, `CookModeIngredients`, `CookModeFooter`.

**Aufwand:** Mittel (2h)

---

### 🟡 M3 — `CommandPalette.tsx` — Memoisierung gebrochen

**Datei:** `src/components/CommandPalette.tsx:56`

**Problem:** `handleGlobalSearch` ist eine reguläre Funktion in der Dependency-Liste von `useMemo`. Da sie bei jedem Render neu erstellt wird, ist die Memo-Optimierung wirkungslos.

**Empfehlung:** `handleGlobalSearch` in `useCallback` wrappen.

**Aufwand:** Niedrig (15min)

---

### 🟡 M4 — Inkonsistente State-Pattern

**Problem:** `PantryManager` und `ShoppingList` nutzen Context-Provider. `MealPlanner` und `RecipeBook` nutzen Prop-Drilling. `AiChef` nutzt direkten Redux-Zugriff.

**Empfehlung:** `MealPlanner` langfristig auf Context-Pattern migrieren (analog zu `PantryManager`/`ShoppingList`).

**Aufwand:** Hoch (6-8h)

---

### 🔵 N1 — `window.confirm()` statt modale Dialoge

**Dateien:** `src/hooks/usePantryManager.ts`, `src/hooks/useShoppingList.ts`, `src/components/meal-planner/DayColumn.tsx`, `src/components/RecipeDetail.tsx`

**Problem:** Native Browser-Dialoge brechen den visuellen Stil und sind nicht testbar.

**Empfehlung:** Durch eine zentrale `ConfirmDialog`-Komponente ersetzen.

**Aufwand:** Mittel (3-4h)

---

### 🔵 N2 — `useWindowSize` ohne Debounce

**Datei:** `src/hooks/useWindowSize.ts`

**Problem:** Kein Debounce auf `resize`-Event → viele Re-Renders bei schnellem Resize.

**Empfehlung:** `useDebounce` Hook (bereits vorhanden) einbinden.

**Aufwand:** Niedrig (15min)

---

## 2. Sicherheit

### 🟠 S1 — API-Key-Obfuskation ist kein echtes Encryption

**Datei:** `src/services/apiKeyService.ts:14-31`

**Problem:** XOR mit deterministischem Browser-Fingerprint (`userAgent + language + screenSize`). Trivial reversibel für jeden mit Zugriff auf IndexedDB.

**Bewertung:** Akzeptabel für eine Client-Side-App wo der Key dem Nutzer gehört. Der Code-Kommentar sollte aber nicht "Secure API Key Management" suggerieren. In `copilot-instructions.md` korrekt als "obfuskiert" dokumentiert.

**Empfehlung:** Kommentare anpassen. Ggf. SubtleCrypto mit User-Passwort für echte Verschlüsselung.

**Aufwand:** Niedrig (Kommentare) / Hoch (echte Verschlüsselung)

---

### 🟠 S2 — Statisches PBKDF2-Salt in syncService.ts

**Datei:** `src/services/syncService.ts:18`

**Problem:** `salt: enc.encode('culinasync-salt')` — festes Salt schwächt PBKDF2 (Rainbow-Table-anfällig).

**Empfehlung:** Zufälliges Salt generieren (`crypto.getRandomValues`) und mit dem Ciphertext speichern.

**Aufwand:** Mittel (1-2h)

---

### 🟠 S3 — Prompt-Injection-Risiko bei Web-Content-Extraktion

**Datei:** `src/services/geminiService.ts` — `extractRecipeFromWebContent`

**Problem:** Unvalidierter Web-Content wird per `webContent.slice(0, 24000)` direkt an Gemini gesendet. Bösartiger Content könnte Prompt-Injection versuchen.

**Empfehlung:** Web-Content vor Senden sanitizen (HTML-Tags strippen, nur Text extrahieren). Zusätzlich System-Prompt mit klarer Anweisung an das Modell, eingebettete Befehle zu ignorieren.

**Aufwand:** Niedrig-Mittel (1h)

---

### 🟡 S4 — Keine CSP-Header

**Datei:** `index.html`

**Problem:** Kein `Content-Security-Policy` Meta-Tag. Für eine PWA empfohlen.

**Empfehlung:** Mindest-CSP hinzufügen:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

**Aufwand:** Niedrig (30min) — aber erfordert Testing aller externen Ressourcen

---

### 🟡 S5 — JSON.parse ohne Post-Validierung

**Datei:** `src/services/geminiService.ts:280-285`

**Problem:** Gemini-Responses werden mit `JSON.parse` verarbeitet, ohne Schema-Validierung danach. Die `responseSchema`-Option erzwingt das auf API-Seite, aber ein manipulierter Proxy könnte beliebiges JSON injizieren.

**Empfehlung:** Runtime-Validierung mit Zod oder manueller Typ-Guard nach `JSON.parse`.

**Aufwand:** Mittel (2-3h für alle Gemini-Response-Handler)

---

### 🔵 S6 — DOMPurify vorhanden — gut

**Datei:** `package.json`

**Bewertung:** `dompurify` ist in den Dependencies und wird für XSS-Schutz bei nutzergenerierten Inhalten genutzt. ✅ Korrekt.

---

## 3. Barrierefreiheit (A11y)

### 🔴 A1 — `WhatsNewModal` komplett ohne A11y

**Datei:** `src/components/WhatsNewModal.tsx`

**Problem:** Kein `role="dialog"`, kein `aria-modal`, kein Fokus-Trap, kein `aria-label`. Schließen-Button nutzt `×` ohne `aria-label`. Wird allen Nutzern nach Updates angezeigt.

**Empfehlung:** `useModalA11y` Hook einbinden (wie in allen anderen Modals). `aria-label="Schließen"` für den ×-Button.

**Aufwand:** Niedrig (30min)

---

### 🟠 A2 — `DayColumn` Dropdown nur via Hover

**Datei:** `src/components/meal-planner/DayColumn.tsx:69`

**Problem:** Tag-Aktionen-Dropdown nur per CSS `:hover` sichtbar — nicht keyboard-zugänglich.

**Empfehlung:** `:focus-within` hinzufügen oder Button-gesteuerten Toggle implementieren.

**Aufwand:** Niedrig (30min)

---

### 🟠 A3 — `RecipeDetail` Export-Links

**Datei:** `src/components/RecipeDetail.tsx`

**Problem:** Export-Menü nutzt `<a onClick>` statt `<button>` — nicht per Tastatur aktivierbar.

**Empfehlung:** Auf `<button>` umstellen.

**Aufwand:** Niedrig (15min)

---

### 🟠 A4 — `GlobalErrorBoundary` ohne `role="alert"`

**Datei:** `src/components/GlobalErrorBoundary.tsx`

**Problem:** Fehlermeldung hat kein `role="alert"` für Screenreader.

**Empfehlung:** `role="alert"` auf Container-Element setzen.

**Aufwand:** Niedrig (5min)

---

### 🟡 A5 — `Help.tsx` Suchinput ohne Label

**Datei:** `src/components/Help.tsx:56`

**Problem:** Input ohne `aria-label` oder `<label>`.

**Empfehlung:** `aria-label="Suche in der Wissensdatenbank"` hinzufügen.

**Aufwand:** Niedrig (5min)

---

### 🟡 A6 — `HelpComponents.tsx` FAQ ohne `aria-expanded`

**Datei:** `src/components/help/HelpComponents.tsx`

**Problem:** FAQ-Accordion-Buttons haben kein `aria-expanded`-Attribut.

**Empfehlung:** `aria-expanded={isOpen}` hinzufügen.

**Aufwand:** Niedrig (10min)

---

### 🟡 A7 — Hartcodierte `aria-label` auf Deutsch

**Dateien:** `src/components/pantry/PantryList.tsx:55`, `src/components/CookModeView.tsx`, diverse

**Problem:** `aria-label="Vorratsliste"` etc. nicht über i18n, bricht bei Sprachwechsel.

**Empfehlung:** Alle `aria-label`-Werte über `t()` lokalisieren.

**Aufwand:** Mittel (1-2h, zusammen mit i18n-Migration)

---

### 🟡 A8 — `VoiceControlUI` hartcodierter Text

**Datei:** `src/components/VoiceControlUI.tsx:18`

**Problem:** "Höre zu..." nicht über i18n.

**Empfehlung:** i18n-Key verwenden.

**Aufwand:** Niedrig (5min)

---

### 🔵 A9 — `ChefResults` Keyboard-Navigation

**Datei:** `src/components/ai-chef/ChefResults.tsx`

**Problem:** Rezeptkarten ohne `aria-label` oder erweiterte Keyboard-Navigation.

**Empfehlung:** `aria-label` mit Rezeptname auf Karten-Button setzen.

**Aufwand:** Niedrig (15min)

---

### 🔵 A10 — Positive Befunde

- ✅ Alle Hauptmodals nutzen `useModalA11y` (Fokus-Trap, Escape-Close, Body-Scroll-Lock)
- ✅ Header und BottomNav nutzen `aria-current="page"` korrekt
- ✅ `useModalA11y` Hook ist vorbildlich implementiert (Previous-Focus-Restore)

---

## 4. Internationalisierung (i18n)

### 🟠 I1 — 151 hartcodierte deutsche Strings

**Bericht:** `reports/i18n-hardcoded-report.md` (nun aus Git entfernt, lokal unter `reports/` verfügbar)

**Vollständig ohne i18n (gesamte Komponente):**
| Priorität | Komponente | Ungefähre String-Anzahl |
|---|---|:---:|
| Hoch | `CookModeView.tsx` | ~25 |
| Hoch | `Onboarding.tsx` | ~20 |
| Hoch | `Help.tsx` / `helpData.ts` | ~40 |
| Mittel | `WhatsNewModal.tsx` | ~10 |
| Mittel | `GlobalErrorBoundary.tsx` | ~5 |
| Mittel | `VoiceControlUI.tsx` | ~3 |
| Mittel | AI-Chef Subkomponenten (`ChefLoading`, `ChefInput`, `ChefResults`) | ~20 |

**Teilweise ohne i18n:**
| Priorität | Komponente/Hook | Ungefähre String-Anzahl |
|---|---|:---:|
| Mittel | Pantry-Subkomponenten (Header, Modal, List, QuickAdd, BulkActions) | ~15 |
| Mittel | Shopping-List-Subkomponenten | ~10 |
| Mittel | MealPlanner-Subkomponenten (Header, DayColumn, BulkAddModal) | ~10 |
| Mittel | RecipeBook-Subkomponenten (Header, Toolbar) | ~8 |
| Mittel | Settings-Panels | ~10 |
| Niedrig | `geminiService.ts` (Prompt-Templates, Error-Messages) | ~33 |
| Niedrig | `voiceCommands.ts`, `exportService.ts`, `utils.ts` | ~10 |

**DE ↔ EN Schlüssel-Vergleich:** Identisch — keine fehlenden Keys in den bestehenden translation.json-Dateien.

**Empfehlung:** Priorisierte Migration in 3 Wellen:
1. **Welle 1:** Nutzer-sichtbare UI (`CookModeView`, `Onboarding`, `WhatsNewModal`, `GlobalErrorBoundary`) — ca. 60 Strings
2. **Welle 2:** Feature-Subkomponenten (Pantry, Shopping, Meal, Recipe, Settings) — ca. 55 Strings
3. **Welle 3:** Services und Prompts — ca. 43 Strings (Prompts können ggf. auf Deutsch bleiben, wenn Gemini-Kontext deutsch sein soll)

**Aufwand:** Hoch (8-12h gesamt)

---

## 5. Performance & Bundle

### 🔴 P1 — `@faker-js/faker` im Bundle

Siehe K1 oben. ~800 KB im Production-Bundle.

---

### 🟠 P2 — `package.json`-Fetch zur Laufzeit

**Datei:** `src/App.tsx:62-65`

**Problem:** `fetch('./package.json')` zur Laufzeit. `package.json` liegt nach Vite-Build nicht im Output-Verzeichnis.

**Empfehlung:** Build-Time-Replacement via `vite.config.ts`:
```ts
define: { __APP_VERSION__: JSON.stringify(require('./package.json').version) }
```

**Aufwand:** Niedrig (30min)

---

### 🟡 P3 — Tesseract.js und Quagga2 nicht in manualChunks

**Datei:** `vite.config.ts`

**Problem:** Schwere Scan-Dependencies ohne explizites Chunk-Splitting. Ob sie dynamisch importiert werden, muss geprüft werden.

**Empfehlung:** Prüfen ob `import()` genutzt wird. Falls nicht, `manualChunks`-Eintrag hinzufügen oder auf dynamischen Import umstellen.

**Aufwand:** Niedrig (30min)

---

### 🟡 P4 — Brotli + Gzip doppelt generiert

**Datei:** `vite.config.ts:93-103`

**Problem:** Build-Zeit verdoppelt sich durch zwei Kompressionsformate.

**Empfehlung:** Nur Brotli generieren (besser für GitHub Pages/CDN). Gzip nur wenn spezifischer Server es erfordert.

**Aufwand:** Niedrig (5min)

---

### 🔵 P5 — Gute Patterns vorhanden

- ✅ Alle Seiten via `React.lazy()` geladen
- ✅ `manualChunks` für React, Redux, Dexie, react-window
- ✅ Export-Libs (PDF, CSV) via dynamischem `import()` geladen

---

## 6. Testing

### 🟠 T1 — Sehr niedrige Test-Coverage

| Metrik | Aktuell |
|---|---|
| Statements | 34.7% |
| Branches | 26.8% |
| Functions | 31.6% |
| Lines | 35.6% |

**Getestet:** Nur `geminiService.ts` (2 Testdateien)

**Nicht getestet:**
- Store (Slices, Middleware, Selectors)
- Hooks (usePantryManager, useShoppingList, useMealPlan)
- Repositories (db.ts, dbMigrations.ts)
- Components (kein React Testing Library Setup erkennbar)
- Services (apiKeyService, syncService, exportService, voiceCommands)

**Empfehlung — Priorisierte Test-Roadmap:**
1. **Repository-Layer:** `db.ts`, `dbMigrations.ts` — Daten-Integrität sichern
2. **Store:** `settingsSlice`, `uiSlice` — Reducer-Logik testen
3. **Hooks:** `useShoppingList`, `usePantryManager` — Geschäftslogik
4. **Services:** `apiKeyService`, `voiceCommands` — Sicherheits-/Edge-Cases
5. **Components:** Smoke-Tests für kritische Seiten

**Aufwand:** Hoch (20-30h für 70% Coverage)

---

## 7. CI/CD & Infrastruktur

### 🟠 CI1 — Kein DevContainer

**Problem:** Kein `.devcontainer/devcontainer.json`. Entwickler-Onboarding nicht reproduzierbar.

**Empfehlung:**
```jsonc
{
  "name": "CulinaSync Dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:22",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "github.copilot"
      ]
    }
  },
  "forwardPorts": [5173],
  "postCreateCommand": "npm ci"
}
```

**Aufwand:** Niedrig (30min)

---

### 🟠 CI2 — Kein Dependabot

**Problem:** Keine automatisierten Dependency-Updates.

**Empfehlung:** `.github/dependabot.yml` erstellen:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

**Aufwand:** Niedrig (10min)

---

### 🟡 CI3 — CodeQL Matrix redundant

**Datei:** `.github/workflows/codeql.yml`

**Problem:** `matrix: ['javascript', 'typescript']` — CodeQLs JavaScript-Analyzer deckt TypeScript ab. Verdoppelt CI-Laufzeit.

**Empfehlung:** Nur `['javascript']` in der Matrix belassen.

**Aufwand:** Niedrig (5min)

---

### 🟡 CI4 — Action-Versions-Inkonsistenz

**Dateien:** `.github/workflows/codeql.yml` vs `deploy.yml`, `ci.yml`

**Problem:** `actions/checkout@v4` in CodeQL, `@v5` in den anderen.

**Empfehlung:** Alle auf `@v5` vereinheitlichen.

**Aufwand:** Niedrig (5min)

---

### 🟡 CI5 — Deploy dupliziert CI-Steps

**Datei:** `.github/workflows/deploy.yml`

**Problem:** Lint + Test laufen in `deploy.yml` erneut, obwohl `ci.yml` bei Push auf `main` auch triggert.

**Empfehlung:** Deploy-Workflow als `needs: ci`-Abhängigkeit gestalten oder CI-Steps aus Deploy entfernen.

**Aufwand:** Mittel (1h)

---

### 🔵 CI6 — Fehlende GitHub Templates

**Problem:** Keine Issue/PR-Templates, kein `CONTRIBUTING.md`, kein `CODE_OF_CONDUCT.md`.

**Empfehlung:** Für Open-Source-Projekte empfohlen, aber nicht kritisch für Single-Developer-Projekte.

**Aufwand:** Niedrig (1h)

---

## 8. Dependencies

### 🔴 D1 — `@faker-js/faker` in `dependencies`

Siehe K1. Muss nach `devDependencies` + dynamischer Import.

---

### ✅ D2 — Vite-Upgrade umgesetzt

**Datei:** `package.json`

**Status:** Das Repo laeuft inzwischen auf Vite 8 und dieser Punkt ist nicht mehr offen.

**Hinweis:** Weitere Vite-Arbeit betrifft eher Plugin- und Deprecation-Cleanup als ein Grundupgrade.

**Aufwand:** Erledigt

---

### ✅ D3 — ESLint-/TypeScript-ESLint-Upgrade umgesetzt

**Datei:** `package.json`

**Status:** Das Repo nutzt inzwischen `eslint` 10 und `typescript-eslint` 8. Der reine Versionsupgrade ist damit erledigt.

**Hinweis:** Offene Arbeit liegt eher in Regelqualitaet und schrittweisem Schaerfen bestehender Lint-Regeln als in der Tool-Version selbst.

**Aufwand:** Erledigt

---

### 🟡 D4 — `@types/react-redux` überflüssig

**Datei:** `package.json` (devDependencies)

**Problem:** `react-redux` 9.x hat eingebaute TypeScript-Types. `@types/react-redux` ist überflüssig und kann zu Konflikten führen.

**Empfehlung:** Entfernen: `npm uninstall @types/react-redux`

**Aufwand:** Niedrig (5min)

---

### 🔵 D5 — Storybook-Dependencies ohne Stories

**Datei:** `package.json` (devDependencies: Chromatic, Storybook)

**Problem:** 4 Storybook-Dependencies und 2 Scripts, aber keine `.stories.*`-Dateien.

**Empfehlung:** Entweder Stories erstellen oder Dependencies entfernen.

**Aufwand:** Niedrig (Entfernen: 5min)

---

## 9. Dokumentation

### Lücken

| Dokument | Status | Empfehlung |
|---|---|---|
| README.md | ✅ Umfangreich | Roadmap-Einträge verifizieren (viele `[x]` → realistisch?) |
| CHANGELOG.md | ✅ Erstellt | Fortlaufend pflegen |
| AUDIT.md | ✅ Erstellt | Bei Follow-up-Fixes aktualisieren |
| CONTRIBUTING.md | ❌ Fehlt | Erstellen für Community-Beiträge |
| CODE_OF_CONDUCT.md | ❌ Fehlt | Erstellen für Open-Source-Standard |
| Architektur-Diagramme | ❌ Fehlt | Mermaid-Diagramm in README oder eigene Datei |
| API-/Service-Doku | ❌ Fehlt | JSDoc in Service-Dateien als Minimum |

---

## Priorisierte Maßnahmen-Roadmap

### Sprint 1 (Quick Wins, 1-2 Tage)
- [ ] A1: WhatsNewModal A11y (`useModalA11y`)
- [ ] A2: DayColumn `:focus-within`
- [ ] A3: RecipeDetail Export-Buttons
- [ ] A4: GlobalErrorBoundary `role="alert"`
- [ ] M3: CommandPalette `useCallback`
- [ ] N2: useWindowSize Debounce
- [ ] H3: package.json Version + Build-Time define
- [ ] D4: `@types/react-redux` entfernen
- [ ] CI3: CodeQL Matrix korrigieren
- [ ] CI4: Action-Versions vereinheitlichen

### Sprint 2 (Architektur, 3-5 Tage)
- [ ] K1: faker.js aus Production-Bundle
- [ ] K2: Settings-Doppelpersistierung auflösen
- [ ] S2: Statisches Salt in syncService
- [ ] S3: Web-Content-Sanitization
- [ ] I1 Welle 1: i18n für CookMode, Onboarding, WhatsNewModal, ErrorBoundary (~60 Strings)
- [ ] CI1: DevContainer einrichten
- [ ] CI2: Dependabot konfigurieren

### Sprint 3 (Qualität, 5-10 Tage)
- [ ] H1/H2: ESLint-Regeln auf `warn` + schrittweiser Cleanup
- [ ] I1 Welle 2+3: Verbleibende i18n-Strings (~90 Strings)
- [ ] M1/M2: RecipeDetail + CookModeView aufteilen
- [ ] T1: Test-Coverage auf 60% erhöhen
- [ ] D2/D3: Vite 6 + ESLint 9 Migration

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
- Native `window.confirm()`-Dialoge wurden in den aktiven Kern-Features durch modalbasierte, a11y-konforme Dialogfluesse ersetzt.
- Die Lokalisierung wurde in modulare Sprachdomänen fuer `core`, `settings` und `features` aufgeteilt und ueber weitere Kernoberflaechen hinweg fortgesetzt.

Noch offen ist vor allem strukturelle Nacharbeit, nicht der unmittelbare Produktionsbetrieb. Das betrifft insbesondere den verbleibenden Legacy-Fallback fuer alte Settings-Daten, weitere i18n-Restsweeps und andere im Audit genannte mittel- bis langfristige Architekturthemen.

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

### ✅ K1 — `@faker-js/faker` in Production-Bundle — behoben am 2026-04-22

**Datei:** `package.json`, `src/services/geminiService.ts`

**Problem:** `@faker-js/faker` (~800 KB unkomprimiert) stand in `dependencies` statt `devDependencies` und wurde via statischem `import { fakerDE as faker }` eingebunden. Das gesamte Modul landete im Production-Bundle und sprengte das 130 KB Script-Budget.

**Fix:** `@faker-js/faker` wurde nach `devDependencies` verschoben und wird in `geminiService.ts` nur noch dynamisch im echten Offline-Fallback geladen.

**Verifikation:** `src/services/__tests__/geminiService.test.ts`, `pnpm exec tsc --noEmit`, `pnpm run lint`

**Aufwand:** Erledigt

---

### ✅ K2 — Settings doppelt persistiert — behoben am 2026-04-22

**Dateien:** `src/store/index.ts`, `src/store/slices/settingsSlice.ts`, `src/services/settingsService.ts`

**Problem:** Settings wurden gleichzeitig über zwei Mechanismen gespeichert:
- Redux Persist → `localStorage['persist:settings']`
- `settingsService.ts` → `localStorage['culinaSyncSettings']`

`loadSettings()` las aus `culinaSyncSettings`, aber Redux Persist rehydrierte aus `persist:settings`. Bei Divergenz gewann der zuletzt geschriebene Wert — Race Condition.

**Fix:** Redux Persist ist jetzt der alleinige Schreibpfad fuer Settings. `settingsService.ts` liest bevorzugt `persist:settings` als Source of Truth und faellt nur noch lesend auf das Legacy-Format zurueck. Die konkurrierenden Direkt-Schreibzugriffe aus `settingsSlice.ts` wurden entfernt.

**Verifikation:** `src/services/__tests__/settingsService.test.ts`

**Aufwand:** Erledigt

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

### ✅ H3 — `package.json` Version `0.0.0` — behoben am 2026-04-22

**Datei:** `package.json`

**Problem:** Keine belastbare Versionierung. `fetch('./package.json')` in `App.tsx` las die Version zur Laufzeit, aber `package.json` liegt nach einem Vite-Build nicht im Output. Gleichzeitig war die Version im Footer hartcodiert als `v2026.03.04`.

**Fix:** `package.json` nutzt jetzt `0.1.1` als Versionsnummer, Vite injiziert diese ueber `define` als `__APP_VERSION__`, und `App.tsx` sowie `WhatsNewModal.tsx` verwenden denselben Build-Time-Wert statt eines Laufzeit-Fetches oder harter UI-Konstanten.

**Verifikation:** `pnpm exec tsc --noEmit`, `pnpm run lint`

**Aufwand:** Erledigt

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

### ✅ M3 — `CommandPalette.tsx` — Memoisierung gebrochen — verifiziert am 2026-04-22

**Datei:** `src/components/CommandPalette.tsx:56`

**Problem:** Der Audit-Stand ging davon aus, dass `handleGlobalSearch` als reguläre Funktion in einer `useMemo`-Dependency-Liste die Memo-Optimierung unwirksam macht.

**Ergebnis:** Kein weiterer Fix noetig. `handleGlobalSearch` ist bereits in `useCallback` gekapselt und wird stabil in den abhängigen Memo-/Effect-Pfaden verwendet.

**Aufwand:** Erledigt

---

### 🟡 M4 — Inkonsistente State-Pattern

**Problem:** `PantryManager` und `ShoppingList` nutzen Context-Provider. `MealPlanner` und `RecipeBook` nutzen Prop-Drilling. `AiChef` nutzt direkten Redux-Zugriff.

**Empfehlung:** `MealPlanner` langfristig auf Context-Pattern migrieren (analog zu `PantryManager`/`ShoppingList`).

**Aufwand:** Hoch (6-8h)

---

### ✅ N1 — `window.confirm()` statt modale Dialoge — behoben am 2026-04-22

**Dateien:** `src/hooks/usePantryManager.ts`, `src/hooks/useShoppingList.ts`, `src/components/ShoppingList.tsx`, `src/components/meal-planner/DayColumn.tsx`, `src/components/RecipeDetail.tsx`, `src/components/MealPlanner.tsx`, `src/components/settings/panels/ApiKeyPanel.tsx`

**Problem:** Native Browser-Dialoge brechen den visuellen Stil und sind nicht testbar.

**Fix:** `ApiKeyPanel`, `DayColumn`, `MealPlanner`, `RecipeDetail`, `ShoppingList`/`useShoppingList` und `PantryManager`/`usePantryManager` nutzen jetzt modalbasierte Bestatigungen mit `useModalA11y` statt `window.confirm()`.

**Verifikation:** `grep` auf `window.confirm`/`confirm(` unter `src/` ohne Treffer, gezielte `pnpm exec eslint`-Laeufe fuer `useShoppingList`, `ShoppingList`, `usePantryManager`, `PantryManager`, `get_errors` auf den geaenderten Dateien

**Aufwand:** Mittel (3-4h)

---

### ✅ N2 — `useWindowSize` ohne Debounce — behoben am 2026-04-22

**Datei:** `src/hooks/useWindowSize.ts`

**Problem:** Kein Debounce auf `resize`-Event → viele Re-Renders bei schnellem Resize.

**Fix:** `useWindowSize()` gibt jetzt einen mit `useDebounce` verzoegerten Fensterzustand zurueck und reduziert damit Resize-getriebene Re-Render-Spitzen, ohne die Hook-API fuer Aufrufer zu aendern.

**Verifikation:** `pnpm exec tsc --noEmit`, `pnpm run lint`

**Aufwand:** Erledigt

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

### ✅ S2 — Statisches PBKDF2-Salt in syncService.ts — behoben am 2026-04-22

**Datei:** `src/services/syncService.ts`

**Problem:** `salt: enc.encode('culinasync-salt')` — festes Salt schwächt PBKDF2 (Rainbow-Table-anfaellig).

**Fix:** Neue Backups speichern jetzt einen Header, ein zufaelliges Salt pro Export und die IV vor dem Ciphertext. `decryptBackup()` bleibt rueckwaertskompatibel und liest weiterhin das Legacy-Format mit festem Salt.

**Verifikation:** `src/services/__tests__/syncService.test.ts`

**Aufwand:** Erledigt

---

### ✅ S3 — Prompt-Injection-Risiko bei Web-Content-Extraktion — behoben am 2026-04-22

**Datei:** `src/services/geminiService.ts` — `extractRecipeFromWebContent`

**Problem:** Unvalidierter Web-Content wurde per `webContent.slice(0, 24000)` direkt an Gemini gesendet. Bösartiger Content konnte Prompt-Injection versuchen.

**Fix:** Web-Content wird jetzt vor dem Prompt auf Text reduziert, instruktionaehnliche Zeilen werden gefiltert und der Prompt markiert den Inhalt explizit als untrusted data. Zusaetzlich validiert `geminiService.ts` KI-JSON-Antworten jetzt mit Runtime-Guards statt nur per `JSON.parse` plus Minimalcheck.

**Verifikation:** `src/services/__tests__/geminiService.test.ts`

**Aufwand:** Erledigt

---

### ✅ S4 — Keine CSP-Header — teilweise behoben am 2026-04-22

**Datei:** `index.html`

**Problem:** Kein `Content-Security-Policy` Meta-Tag. Fuer eine PWA empfohlen.

**Fix:** `index.html` setzt jetzt eine konservative Meta-CSP mit `default-src 'self'`, restriktiveren Script-/Object-/Frame-Regeln sowie freigegebenen HTTPS-Connect-Zielen, Data-/Blob-Bildern und Worker-Sources.

**Rest-Risiko:** Fuer GitHub Pages bleibt dies eine Meta-Policy statt eines HTTP-Headers; fuer Tauri oder spaetere Hostings ist eine headerbasierte Variante weiterhin vorzuziehen.

**Verifikation:** Diagnostics fuer `index.html`

**Aufwand:** Erledigt

**Referenz:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

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

### ✅ A1 — `WhatsNewModal` komplett ohne A11y — behoben am 2026-04-22

**Datei:** `src/components/WhatsNewModal.tsx`

**Problem:** Kein `role="dialog"`, kein `aria-modal`, kein Fokus-Trap, kein `aria-label`. Schließen-Button nutzte `×` ohne `aria-label`. Wird allen Nutzern nach Updates angezeigt.

**Fix:** `WhatsNewModal` nutzt jetzt `useModalA11y`, setzt Dialog-Semantik via `role="dialog"` und `aria-modal`, schliesst per Overlay und Escape und setzt den initialen Fokus auf den beschrifteten Schliessen-Button.

**Verifikation:** `pnpm exec eslint src/components/WhatsNewModal.tsx`, `pnpm exec tsc --noEmit`

**Aufwand:** Erledigt

---

### ✅ A2 — `DayColumn` Dropdown nur via Hover — behoben am 2026-04-22

**Datei:** `src/components/meal-planner/DayColumn.tsx:69`

**Problem:** Tag-Aktionen-Dropdown nur per CSS `:hover` sichtbar — nicht keyboard-zugänglich.

**Fix:** Das bestehende Dropdown reagiert jetzt zusaetzlich auf `:focus-within`, sodass der Aktionen-Button das Menue auch per Tastatur sichtbar und bedienbar macht, ohne neues State-Management einzufuehren.

**Verifikation:** `pnpm exec eslint src/components/meal-planner/DayColumn.tsx`, `pnpm exec tsc --noEmit`

**Aufwand:** Erledigt

---

### ✅ A3 — `RecipeDetail` Export-Links — behoben am 2026-04-22

**Datei:** `src/components/RecipeDetail.tsx`

**Problem:** Export-Menü nutzt `<a onClick>` statt `<button>` — nicht per Tastatur aktivierbar.

**Fix:** Die Export-Eintraege sind jetzt echte Buttons mit Menu-Semantik, und der Export-Trigger setzt `aria-haspopup`, `aria-expanded` und `aria-controls`.

**Verifikation:** `pnpm exec eslint src/components/RecipeDetail.tsx`, `pnpm exec tsc --noEmit`

**Aufwand:** Erledigt

---

### ✅ A4 — `GlobalErrorBoundary` ohne `role="alert"` — behoben am 2026-04-22

**Datei:** `src/components/GlobalErrorBoundary.tsx`

**Problem:** Fehlermeldung hat kein `role="alert"` für Screenreader.

**Fix:** Der Fallback-Container der globalen Fehlergrenze setzt jetzt `role="alert"` und `aria-live="assertive"`, damit kritische App-Fehler unmittelbar angesagt werden.

**Verifikation:** `pnpm exec eslint src/components/GlobalErrorBoundary.tsx`, `pnpm exec tsc --noEmit`

**Aufwand:** Erledigt

---

### ✅ A5 — `Help.tsx` Suchinput ohne Label — behoben am 2026-04-22

**Datei:** `src/components/Help.tsx:56`

**Problem:** Input ohne `aria-label` oder `<label>`.

**Fix:** Das Suchfeld setzt jetzt ein explizites `aria-label`, und der Reset-Button ist ebenfalls als Aktion beschriftet.

**Verifikation:** `pnpm exec eslint src/components/Help.tsx src/components/help/HelpComponents.tsx`, `pnpm exec tsc --noEmit`

**Aufwand:** Erledigt

---

### ✅ A6 — `HelpComponents.tsx` FAQ ohne `aria-expanded` — behoben am 2026-04-22

**Datei:** `src/components/help/HelpComponents.tsx`

**Problem:** FAQ-Accordion-Buttons haben kein `aria-expanded`-Attribut.

**Fix:** FAQ-Buttons setzen jetzt `aria-expanded`, `aria-controls` und referenzieren den zugehoerigen Antwortbereich per ID.

**Verifikation:** `pnpm exec eslint src/components/Help.tsx src/components/help/HelpComponents.tsx`, `pnpm exec tsc --noEmit`

**Aufwand:** Erledigt

---

### 🟡 A7 — Hartcodierte `aria-label` auf Deutsch — teilweise reduziert am 2026-04-22

**Dateien:** `src/components/pantry/PantryList.tsx:55`, `src/components/CookModeView.tsx`, diverse

**Problem:** `aria-label="Vorratsliste"` etc. nicht über i18n, bricht bei Sprachwechsel.

**Empfehlung:** Alle `aria-label`-Werte über `t()` lokalisieren.

**Zwischenstand:** `src/components/pantry/PantryList.tsx`, `src/components/pantry/PantryToolbar.tsx`, `src/components/pantry/PantryQuickAdd.tsx`, `src/components/CookModeView.tsx`, `src/components/Help.tsx`, `src/components/RecipeBook.tsx`, `src/components/WhatsNewModal.tsx`, `src/components/settings/panels/ApiKeyPanel.tsx`, `src/components/recipe-book/BulkAddToPlanModal.tsx`, `src/components/recipe-book/RecipeToolbar.tsx`, `src/components/TagInput.tsx`, `src/components/shopping-list/ShoppingListToolbar.tsx` und `src/components/shopping-list/ShoppingListItemComponent.tsx` nutzen ihre `aria-label`-Werte jetzt ueber i18n-Keys. Weitere hartcodierte Labels in anderen Komponenten bleiben als eigener Rest-Slice offen.

**Verifikation:** `pnpm exec eslint src/components/pantry/PantryList.tsx src/components/CookModeView.tsx`, `pnpm exec tsc --noEmit`

**Aufwand:** In Arbeit

---

### ✅ A8 — `VoiceControlUI` hartcodierter Text — behoben am 2026-04-22

**Datei:** `src/components/VoiceControlUI.tsx:18`

**Problem:** "Höre zu..." nicht über i18n.

**Fix:** Der Listening-Fallback kommt jetzt aus `translation.json` statt aus einem hartcodierten deutschen String.

**Verifikation:** `pnpm exec eslint src/components/VoiceControlUI.tsx`, `pnpm exec tsc --noEmit`

**Aufwand:** Erledigt

---

### ✅ A9 — `ChefResults` Keyboard-Navigation — behoben am 2026-04-22

**Datei:** `src/components/ai-chef/ChefResults.tsx`

**Problem:** Rezeptkarten ohne `aria-label` oder erweiterte Keyboard-Navigation.

**Fix:** Die Aktionsbuttons in `ChefResults` setzen jetzt einen expliziten, rezeptbezogenen `aria-label` und nutzen saubere `type="button"`-Semantik.

**Verifikation:** `pnpm exec eslint src/components/ai-chef/ChefResults.tsx`, `pnpm exec tsc --noEmit`

**Aufwand:** Erledigt

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

### ✅ P1 — `@faker-js/faker` im Bundle — behoben am 2026-04-22

Siehe K1 oben. Offline-Fallback laedt Faker jetzt nur noch dynamisch.

---

### ✅ P2 — `package.json`-Fetch zur Laufzeit — behoben am 2026-04-22

**Datei:** `src/App.tsx`, `vite.config.ts`, `src/components/WhatsNewModal.tsx`

**Fix:** Die App-Version kommt jetzt zur Build-Zeit aus `package.json` und wird konsistent an Help-, Footer- und WhatsNew-Pfade weitergereicht.

**Problem:** `fetch('./package.json')` zur Laufzeit. `package.json` liegt nach Vite-Build nicht im Output-Verzeichnis.

**Empfehlung:** Build-Time-Replacement via `vite.config.ts`:
```ts
define: { __APP_VERSION__: JSON.stringify(require('./package.json').version) }
```

**Aufwand:** Niedrig (30min)

---

### ✅ P3 — Tesseract.js und Quagga2 nicht in manualChunks — verifiziert am 2026-04-22

**Datei:** `vite.config.ts`

**Problem:** Schwere Scan-Dependencies ohne explizites Chunk-Splitting. Ob sie dynamisch importiert werden, musste geprueft werden.

**Ergebnis:** Kein weiterer Fix noetig. `src/services/scannerService.ts` laedt `@ericblade/quagga2` und `tesseract.js` bereits dynamisch via `import()` und haelt sie damit aus dem initialen Bundle.

**Aufwand:** Erledigt

---

### ✅ P4 — Brotli + Gzip doppelt generiert — behoben am 2026-04-22

**Datei:** `vite.config.ts:93-103`

**Problem:** Build-Zeit verdoppelte sich durch zwei Kompressionsformate.

**Fix:** `vite.config.ts` generiert jetzt nur noch Brotli-Artefakte. Der Bundle-Budget-Check bevorzugt weiterhin `.br`, faellt aber notfalls auf ungepackte Dateien zurueck.

**Verifikation:** `pnpm exec tsc --noEmit`, `pnpm run lint`

**Aufwand:** Erledigt

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

### ✅ D1 — `@faker-js/faker` in `dependencies` — behoben am 2026-04-22

Siehe K1. Nach `devDependencies` verschoben und im Runtime-Pfad dynamisiert.

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

### ✅ D4 — `@types/react-redux` ueberfluessig — behoben am 2026-04-22

**Datei:** `package.json` (devDependencies)

**Problem:** `react-redux` 9.x hat eingebaute TypeScript-Types. `@types/react-redux` war ueberfluessig und konnte zu Konflikten fuehren.

**Fix:** Das separate Typ-Paket wurde aus `devDependencies` und dem Lockfile entfernt. Damit bleibt nur noch die von `react-redux` selbst gepflegte Typquelle aktiv.

**Verifikation:** `pnpm exec tsc --noEmit`

**Aufwand:** Erledigt

---

### ✅ D5 — Storybook-Dependencies ohne Stories — verifiziert am 2026-04-22

**Datei:** `package.json` (devDependencies: Chromatic, Storybook)

**Problem:** Der Audit-Stand nahm an, dass 4 Storybook-Dependencies und 2 Scripts ohne echte Nutzung im Repo liegen.

**Ergebnis:** Kein Fix noetig. Das Repo enthaelt mit `src/components/ai-chef/ChefLoading.stories.tsx` mindestens eine reale Story sowie eine aktive `.storybook/`-Konfiguration.

**Aufwand:** Erledigt

---

## 9. Dokumentation

### Lücken

| Dokument | Status | Empfehlung |
|---|---|---|
| README.md | ✅ Umfangreich | Roadmap-Einträge verifizieren (viele `[x]` → realistisch?) |
| CHANGELOG.md | ✅ Erstellt | Fortlaufend pflegen |
| AUDIT.md | ✅ Erstellt | Bei Follow-up-Fixes aktualisieren |
| CONTRIBUTING.md | ✅ Vorhanden | Fortlaufend mit Workflow-Stand synchron halten |
| CODE_OF_CONDUCT.md | ✅ Vorhanden | Bei Community-Prozess-Aenderungen pflegen |
| Architektur-Diagramme | ❌ Fehlt | Mermaid-Diagramm in README oder eigene Datei |
| API-/Service-Doku | ❌ Fehlt | JSDoc in Service-Dateien als Minimum |

---

## Priorisierte Maßnahmen-Roadmap

### Sprint 1 (Quick Wins, 1-2 Tage)
- [x] A1: WhatsNewModal A11y (`useModalA11y`)
- [x] A2: DayColumn `:focus-within`
- [x] A3: RecipeDetail Export-Buttons
- [x] A4: GlobalErrorBoundary `role="alert"`
- [x] M3: CommandPalette `useCallback`
- [x] N2: useWindowSize Debounce
- [x] H3: package.json Version + Build-Time define
- [x] D4: `@types/react-redux` entfernen
- [x] CI3: CodeQL Matrix korrigieren
- [x] CI4: Action-Versions vereinheitlichen

### Sprint 2 (Architektur, 3-5 Tage)
- [x] K1: faker.js aus Production-Bundle
- [x] K2: Settings-Doppelpersistierung auflösen
- [x] S2: Statisches Salt in syncService
- [x] S3: Web-Content-Sanitization
- [x] I1 Welle 1: i18n für CookMode, Onboarding, WhatsNewModal, ErrorBoundary (~60 Strings)
- [ ] CI1: DevContainer einrichten
- [ ] CI2: Dependabot konfigurieren

### Sprint 3 (Qualität, 5-10 Tage)
- [ ] H1/H2: ESLint-Regeln auf `warn` + schrittweiser Cleanup
- [ ] I1 Welle 2+3: Verbleibende i18n-Strings (~90 Strings)
- [ ] M1/M2: RecipeDetail + CookModeView aufteilen
- [ ] T1: Test-Coverage auf 60% erhöhen
- [ ] D2/D3: Vite 6 + ESLint 9 Migration

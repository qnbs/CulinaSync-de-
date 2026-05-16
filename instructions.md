# CulinaSync — Entwicklungs- und Agenten-Anweisungen

**Version:** 1.1 · **Stand:** 2026-05-16  
**Zweck:** Diese Datei ist der **primäre Einstieg** für Menschen und KI-Agenten. Sie verbindet Produktvorgaben (`PRD.md`), Architektur (`docs/`) und tägliche Arbeitsregeln — ohne `.github/copilot-instructions.md` zu ersetzen (diese bleiben die detaillierte technische Referenz).

---

## 1. Dokument-Hierarchie (was wann lesen)

| Priorität | Dokument | Wann konsultieren |
|-----------|----------|-------------------|
| P0 | **`PRD.md`** | Neue Features, Produktgrenzen, Priorisierung, Akzeptanzkriterien |
| P0 | **`instructions.md`** (diese Datei) | Einstieg, Gates, Checklisten |
| P1 | **`.github/copilot-instructions.md`** | Konkrete Codepfade, Redux/Dexie/Gemini, Testing, Terminal-Konventionen |
| P1 | **`docs/ARCHITECTURE.md`** | Schichten, Datenfluss, Mermaid |
| P2 | **`docs/PROJECT-STRUCTURE.md`** | Ordnerzugehörigkeit neuer Dateien |
| P2 | **`ROADMAP.md`** | Meilensteine, Audit-Referenzen, grobe Aufwände |
| P2 | **`SECURITY.md`** | Meldewege, Schlüssel-/Export-Konventionen |
| P3 | **`docs/STATUS-*.md`** | Zeitlich begrenzte Snapshots (aktuell: `STATUS-2026-05-16.md`) |

**Regel für Agenten:** Vor **architektonisch wirksamen** Änderungen (neue Domänen-Schicht, neue Persistenz, Breaking UX) mindestens **`PRD.md`** (Scope + NFR) und **`docs/ARCHITECTURE.md`** lesen. Bei reinen Bugfixes oder lokaler UI-Anpassung genügen technische Regeln + betroffene Dateien.

---

## 2. Produkt in einem Satz

Local-first, installierbare **PWA** für Vorrat, Rezepte, Essensplan und Einkauf; optionale **Gemini**-Funktionen nur mit nutzerseitigem API-Key; **Daten bleiben primär im Gerät** (IndexedDB/Dexie).

---

## 3. Nicht verhandelbare technische Grenzen

1. **Monorepo:** App unter **`apps/web/`**; Shared Code in **`packages/*`**; Root-Befehle via Turbo (`pnpm run dev`, `check:all`).
2. **Dexie/IndexedDB:** Schreiben nur über **`apps/web/src/services/db.ts`** und Repositories — keine direkten Tabellenzugriffe aus Komponenten.
3. **Gemini:** Nur **`apps/web/src/services/geminiService.ts`**; strukturierte Antworten nach **`JSON.parse`** mit **Zod** absichern (`parseAiJsonWithSchema`-Muster).
4. **API-Key:** Niemals `VITE_*`, `process.env` oder Build-Embed für Nutzerschlüssel — nur **`apiKeyService.ts`** und Einstellungen.
5. **Redux:** Primär UI/Session; nur **`settings`** persistiert; Domaindaten nicht duplizieren.
6. **i18n:** Nutzersichtbare Strings in **`apps/web/src/locales/de/`** und **`apps/web/src/locales/en/`** synchron (`core`, `settings`, `features`).
7. **A11y:** Modals mit **`useModalA11y`**; siehe Copilot-Instructions für Tabs/Banner/Icons.
8. **Fehler:** **`logAppError`**, Listener-Middleware für Thunks, **`GlobalErrorBoundary`** für Renderfehler.

---

## 4. Workflows (kurz)

```text
Implementierung → Diagnostics / ESLint für geänderten Bereich → gezielte Tests → type-check (tsgo) → bei Bedarf check:all
```

| Aufgabe | Befehl (pnpm bevorzugt) |
|---------|-------------------------|
| Dev-Server | `pnpm run dev` |
| Lint | `pnpm run lint` |
| Typen | `pnpm run type-check` |
| Tests | `pnpm run test` |
| Coverage | `pnpm run test:coverage` |
| Integration | `pnpm run build` |
| Vollpaket | `pnpm run check:all` |

CI-Orientierung: **Node 24** in Workflows; **validate.yml** führt u. a. **type-check** und **test:coverage** aus (siehe `.github/copilot-instructions.md`). Nach Push Workflows beobachten bis grün.

---

## 5. Tests und Qualität

- Framework: **Vitest**, **MSW**, **Testing Library**; Muster unter `apps/web/src/**/*.test.ts(x)`.
- **Verboten:** Fehlgeschlagene Tests dauerhaft auskommentieren oder löschen, um CI zu „grün zu tricksen“.
- Coverage-Ziel laut Roadmap: **≥70 %** Statements/Lines (Snapshot Mai 2026 ca. **59 %/61 %**; Thresholds in `apps/web/vitest.config.ts` — siehe `ROADMAP.md` M5).

---

## 6. Änderungen am Produkt oder an der Architektur

1. **PRD aktualisieren**, wenn sich Scope, Personas oder Akzeptanzkriterien ändern (Versionszeile in `PRD.md` anheben).
2. **`CHANGELOG.md`** bei nennenswerten Änderungen pflegen ([Keep a Changelog](https://keepachangelog.com/de/1.1.0/)).
3. **`ROADMAP.md`** bei Meilenstein-Fortschritt oder neuen Epics anpassen.
4. **Entscheidungen und Kontext** kurz in **`.notes/meeting_notes.md`** festhalten (siehe dortige Struktur).

---

## 7. Kommunikation mit dem „Consciousness Stream“

- Workshop-Ergebnisse, explizite Produktentscheidungen und **„beim nächsten Mal beachten“** gehören nach **`.notes/meeting_notes.md`** (kurz, datiert, verlinkbar).
- Keine Secrets, keine persönlichen Daten von Nutzern.

---

## 8. Security & sensible Themen

- Schwachstellen: **`SECURITY.md`** befolgen (private Meldewege bevorzugen).
- Keine reproduzierbaren Exploits oder Keys in Issues/Commits.

---

## 9. Cursor / KI-spezifisch

- Modulare Regeln: **`.cursor/rules/*.mdc`** und **`.cursor/index.mdc`**.
- Regelpflege bei neuen dauerhaften Lehren: **`000-cursor-rules.mdc`** befolgen (Nomenklatur, ATO-Descriptions, Zeilenlimit).

---

## 10. Glossar (minimal)

| Begriff | Bedeutung hier |
|---------|----------------|
| Local-first | Domaindaten primär lokal; Netzwerk optional |
| Source of Truth (Daten) | Dexie-Tabellen über definierte Repositories |
| KI optional | App voll nutzbar ohne Gemini-Key |

---

*Ende der instructions.md — bei Widerspruch zwischen Dateien gewinnen neuere, explizit datierte STATUS-Snapshots nur bei reiner Ist-Beschreibung; für *Soll* gilt **`PRD.md`**.*

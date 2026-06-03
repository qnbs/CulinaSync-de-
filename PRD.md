# Product Requirements Document (PRD) — CulinaSync

**Produkt:** CulinaSync  
**Version:** 1.0  
**Stand:** 2026-06-03  
**Maintainer:** siehe Repository (`CONTRIBUTING.md`, `README.md`)  
**Verbunden mit:** `instructions.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md`

---

## 1. Executive Summary

CulinaSync ist eine **local-first** Haushalts- und Küchenanwendung als **installierbare PWA** (optional **Tauri**-Desktop). Sie unterstützt Haushalte bei **Vorrat**, **Rezepten**, **Essensplanung** und **Einkauf**. **KI (Google Gemini)** ist eine **optionale** Erweiterung; Kernfunktionen müssen **offlinefähig und ohne Cloud-Pflicht** nutzbar sein.

---

## 2. Vision & Mission

| | |
|--|--|
| **Vision** | Verlässliche, klare digitale Haushaltsassistentin — Vertrauen, Alltagstauglichkeit, wenig Friktion. |
| **Mission** | Daten dem Nutzer zulassen (Gerät-first), komplexe Planung vereinfachen, optional KI sinnvoll einbinden — ohne Vendor-Lock-in für Basisdaten. |

---

## 3. Zielgruppen & Personas (abstrakt)

| Persona | Bedarf | Was CulinaSync liefern muss |
|---------|--------|-----------------------------|
| **P1 — Planer:in** | Wochenübersicht, wiederkehrende Mahlzeiten | Essensplan, Rezeptverknüpfung, schnelle Anpassung |
| **P2 — Einkauf** | Liste nach Gang/Kategorie | Einkaufsliste, Abgleich mit Vorrat wo sinnvoll |
| **P3 — Vorrat** | Überblick, Mindesthaltbarkeit | Pantry mit Filtern, Smart-Input wo vorhanden |
| **P4 — Kochmodus** | Schritt-für-Schritt, Timer | Cook Mode, klare UI, A11y |
| **P5 — KI-neugierig** | Ideen, Umformulierung von Rezepten | KI-Chef nur mit eigenem Key, transparente Fehler |

---

## 4. Scope

### 4.1 Im Scope (Muss)

- Vorratsverwaltung mit durchsuch-/filterbarer Datenhaltung lokal.
- Rezeptbuch inkl. Detailansicht, Zutatenbezug, Export über definierte Pfade.
- Essensplanung mit Mahlzeiten-Slots und Rezeptbezug.
- Einkaufsliste mit Kategorisierung und Eingabehilfen.
- Mehrsprachige Oberfläche (**Deutsch**, **Englisch**) — synchrone Pflege der Keys.
- PWA: Offline-Grundlage, Installierbarkeit (gemäß aktuellem Stand).
- Barrierefreiheit: etablierte Muster (Modals, Tabs, Fokus) — keine bewusste Verschlechterung bestehender A11y.

### 4.2 Optional / Erweiterungen

- **Gemini:** Rezept-/Listen-/Nährwert-Hilfen über **`geminiService`**; Nutzer-API-Key.
- **Tauri:** Desktop-Wrapper — Release-Ziele siehe `ROADMAP.md` M8.
- **Sync über Geräte:** Explizit **Roadmap M10**, nicht Kernscope der aktuellen Produktversion.

### 4.3 Ausdrücklich außerhalb des aktuellen Produktscopes

- Zentraler obligatorischer Cloud-Backend-Betrieb für Kern-Domaindaten.
- Gemeinsame Haushaltskonten mit Echtzeit-Kollaboration (ohne eigenständiges Konzept/Datenschutz-Folgenabschätzung).
- Ersetzen von IndexedDB durch Remote-Datenbank als Pflichtpfad.

---

## 5. Funktionale Anforderungen

IDs dienen Traceability in Issues und PRs.

### 5.1 Daten & Persistenz

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| FR-D01 | Domaindaten (Pantry, Rezepte, MealPlan, ShoppingList) werden persistent in **IndexedDB** über **Dexie** gehalten. | Must |
| FR-D02 | Alle Schreiboperationen auf Domaindaten laufen über den dokumentierten DB-Einstieg und **Repositories**. | Must |
| FR-D03 | UI liest reaktiv (z. B. **`useLiveQuery`** / Domain-Hooks), ohne direkte Tabellen-Manipulation in Komponenten. | Must |
| FR-D04 | Settings werden gemäß Architektur über **Redux Persist** geführt; Legacy-Migration darf nicht zu Datenlecks führen. | Must |

### 5.2 Features — Vorrat

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| FR-P01 | Nutzer können Vorratseinträge anlegen, bearbeiten und entfernen. | Must |
| FR-P02 | Filter/Suche unterstützen die Alltagsnutzung (konkrete UX gemäß Implementierung). | Should |

### 5.3 Features — Rezepte & Kochmodus

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| FR-R01 | Rezepte sind durchsuchbar; Detailansicht zeigt strukturierte Informationen. | Must |
| FR-R02 | Kochmodus unterstützt schrittweises Kochen inkl. relevanter Steuerung (Timer etc.) gemäß UI. | Must |
| FR-R03 | Exportpfade (z. B. PDF) respektieren MIME- und Dateinamen-Sicherheitsregeln. | Must |

### 5.4 Features — Essensplan & Einkauf

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| FR-M01 | Essensplan unterstützt Planung nach Mahlzeiten-Typen / Slots gemäß Produktkonstanten. | Must |
| FR-M02 | Geplante Mahlzeiten sind mit Rezepten verknüpfbar. | Must |
| FR-S01 | Einkaufsliste kann aus Plan/Vorrat/Rezeptflüssen befüllt werden (gemäß implementierten Flows). | Must |

### 5.5 KI (Gemini)

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| FR-A01 | Ohne konfigurierten API-Key sind Kernflows der App nutzbar (KI nicht Pflicht). | Must |
| FR-A02 | Alle Modellaufrufe laufen über **`geminiService.ts`**; Responses sind schema-/validierungsgesichert (**Zod** nach Parse). | Must |
| FR-A03 | Fehler werden nutzerverständlich gemappt; keine Roh-Stacktraces als alleinige Meldung. | Should |
| FR-A04 | API-Key wird nicht im Build eingebettet; Speicherung über **`apiKeyService`** (WebCrypto mit dokumentiertem Legacy-Fallback). | Must |

### 5.6 Internationalisierung

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| FR-I01 | Neue nutzersichtbare Strings erscheinen in **DE** und **EN** in den vorgegebenen Locale-Dateien. | Must |
| FR-I02 | Hartcodierte UI-Strings im Produktcode sind unerwünscht (Ausnahmen nur nach bewusstem Tech-Debt mit Ticket). | Should |

---

## 6. Nicht-funktionale Anforderungen (NFR)

| ID | Bereich | Anforderung |
|----|---------|-------------|
| NFR-01 | Privatsphäre | Keine Übertragung von Domaindaten an KI ohne expliziten Nutzer-Flow; Keys nur lokal verwaltet. |
| NFR-02 | Sicherheit | Keine Secrets im Repo; Einhaltung `SECURITY.md`; verdächtige HTML/Injection-Pfade über etablierte Sanitizer. |
| NFR-03 | Performance | Seiten lazy laden; schwere Bibliotheken dynamisch nachladen wo vorgesehen; Bundle-Budget-CI einhalten. |
| NFR-04 | Zuverlässigkeit | Fehler logging-fähig; globale und Feature-Grenzen für Abstürze dokumentiert. |
| NFR-05 | Wartbarkeit | Schichten trennen (UI / State / Services / DB); große Dateien aufteilen (siehe `.cursor/rules/200-architecture-limits.mdc`). |
| NFR-06 | Qualität | CI: Lint, Tests, Build, E2E-Smoke+; Coverage **M5 ≥70 % erreicht** (Juni 2026 ~**80 %** Lines); Stufenplan Perfection **80 → 88 %** Lines/Branches (siehe `ROADMAP.md` M5.9). |
| NFR-07 | A11y | WCAG-orientierte Patterns für neue Oberflächen; Regressionen vermeiden. |

---

## 7. Annahmen & Abhängigkeiten

- Browser mit IndexedDB und ausreichendem Speicher; moderne Evergreen-Browser als Ziel.
- Gemini-Nutzung erfordert gültigen Nutzer-Key und Netzwerk.
- GitHub Pages / statisches Hosting für Web-Deploy gemäß `docs/DEPLOYMENT.md`.
- TypeScript-Toolchain (`tsgo` im Build) und Node-Versionen gemäß README/CI.

---

## 8. Erfolgsmetriken (pragmatisch)

| Metrik | Zielrichtung | Messung |
|--------|--------------|---------|
| CI-Stabilität | Grün auf `main` | GitHub Actions |
| Test-Coverage | **≥70 %** (M5) · Stufe 1 **~80 %** Lines · Ziel **≥88 %** Lines+Branches | `pnpm run test:coverage` |
| E2E (kritische Journeys) | Sync, Pantry, KI-Chef-Basis grün in CI | `pnpm run test:e2e` |
| Bundle-Größe | Innerhalb `budget.json` | CI Bundle-Budget-Script |
| i18n | Keine neuen Hardcoded-Strings ohne Ticket | Scanner-Skripte / Review |
| Security | Keine offenen kritischen Dependabot/CodeQL ohne Plan | GitHub Security |

---

## 9. Roadmap-Alignment (Kurz)

Detaillierte Tasks: **`ROADMAP.md`**. PRD-Überblick:

| Epoche | Thema |
|--------|--------|
| Erledigt / fortgeschritten | TS/tsgo, CI-Hygiene, i18n, Architektur-Cleanup, Zod+Gemini, M5 Coverage, M9 Bundle, **M10 Sync**, DataPanel-Split, E2E-Basis (PR #66) |
| Aktiv | M11 Local AI (4-Layer), M5.8 Branch-Coverage 64 %, Typed ESLint (R-005) |
| Geplant | TS 7 GA (M7), Tauri Release (M8), Lighthouse CI, optional Dexie-Verschlüsselung |

---

## 10. Entscheidungsprotokoll (PRD-Änderungen)

| Datum | Version | Änderung |
|-------|---------|----------|
| 2026-06-03 | 1.1 | NFR-06/Erfolgsmetriken: M5 erreicht, Perfection-Stufenplan 88 %, E2E-Journeys; Roadmap M11 Local AI |
| 2026-05-02 | 1.0 | Initiale PRD aus README, ARCHITECTURE, ROADMAP, Copilot-Instructions konsolidiert |

---

## 11. Glossar

| Begriff | Definition |
|---------|------------|
| Domaindaten | Pantry, Rezepte, MealPlan, ShoppingList in Dexie |
| Local-first | Lokale Speicherung als autoritative Quelle für Domaindaten |
| KI optional | Kernflows ohne Gemini |

---

*Bei Konflikt zwischen Marketing/README und diesem PRD gilt für Engineering-Priorität diese Datei; README bleibt für Community-Kurzüberblick maßgeblich.*

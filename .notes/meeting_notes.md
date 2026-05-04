# Consciousness Stream — CulinaSync

**Zweck:** Kurzlebige **Projektgedächtnis-Spur** für Menschen und Agenten: Entscheidungen, Kontext, die nirgends sonst sauber hingehören, und **„beim nächsten Mal“**-Hinweise.  
**Nicht gedacht für:** Secrets, Tokens, personenbezogene Nutzerdaten, lange Spezifikationen (dafür `PRD.md` / `docs/`).

**Pflege:**

- Neue Einträge **oben** unter „Chronik“ (neuestes zuerst).
- Pro Eintrag: **Datum (ISO)**, **Teilnehmer optional**, **Thema**, **Entscheidung / Fakten / Follow-up**.
- Verweise auf Commits, Issues, PRs und Dateipfade mit **vollständigen relativen Pfaden** vom Repo-Root.
- Wenn ein Punkt in `PRD.md` oder `ROADMAP.md` eingezogen wurde, im Eintrag **„→ dokumentiert in …“** vermerken und Duplikate hier nicht weiter ausbauen.

---

## Schnellindex (optional pflegen)

| Datum | Stichwort | Link/Ziel |
|-------|-----------|-----------|
| 2026-05-02 | Initialstruktur Bewusstseins-Stream | diese Datei |

---

## Vorlage für neue Einträge (kopieren)

```markdown
### YYYY-MM-DD — Kurztitel

- **Kontext:** …
- **Entscheidung / Feststellung:** …
- **Aktionen:** …
- **Links:** `pfad/zur/datei`, PR #…, Issue #…
- **Follow-up:** …
```

---

## Chronik

### 2026-05-02 — Anlage `.notes/` und Root-Dokumentation

- **Kontext:** Es fehlten zentrale Referenzdateien `instructions.md` und `PRD.md` im Repo-Root; Agenten-Regel `850-mcp-and-prd.mdc` verwies auf Bewusstseins-Stream unter `.notes/meeting_notes.md`.
- **Entscheidung / Feststellung:** Dieser Stream wird als **leichtgewichtiges** Protokoll geführt; verbindliche Produkt-Soll-Vorgaben liegen in **`PRD.md`**, Arbeitsabläufe in **`instructions.md`** und **`/.github/copilot-instructions.md`**.
- **Aktionen:** Ordner `.notes/` angelegt; erste Indexzeile gesetzt.
- **Links:** `PRD.md`, `instructions.md`, `.cursor/rules/850-mcp-and-prd.mdc`
- **Follow-up:** Bei größeren Workshops oder Architektur-Gates neuen Eintrag oben ergänzen.

---

## Parkplatz (offene Fragen — nicht bindend)

>Nicht-bindende Sammlung; Klärung in Chronik oder PRD nachziehen.

| # | Frage | Status |
|---|-------|--------|
| — | *(noch leer)* | — |

---

## Anti-Patterns (bitte vermeiden)

- Hier **keine** API-Keys, Passwörter oder Session-Tokens ablegen.
- Keine **Romane:** lieber Ticket/PR + ein Absatz Kontext.
- Keine **dauerhafte** Spezifikation: nach Reife nach `PRD.md`, `ROADMAP.md` oder `docs/` verschieben.

---

*Letzte Pflege Meta: 2026-05-02*

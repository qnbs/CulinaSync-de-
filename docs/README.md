# Dokumentationsindex

Dieser Ordner sammelt die projektbezogene Fach- und Betriebsdokumentation für CulinaSync.

## Aktueller Stand

**[STATUS-2026-06-02.md](./STATUS-2026-06-02.md)** — M5 abgeschlossen, Coverage ~78 %, Merge-Stand PR #20–#30, nächste Schritte.

## Inhalte

| Dokument | Inhalt |
|----------|--------|
| [STATUS-2026-06-02.md](./STATUS-2026-06-02.md) | **aktuell** — M5 done, Validierung, offene Milestones |
| [AUDIT-REPORT-2026-06.md](./AUDIT-REPORT-2026-06.md) | Phase-0 Re-Audit (Juni); M5-Nachzug im Status |
| [STATUS-2026-05-16.md](./STATUS-2026-05-16.md) | Monorepo, Supply-Chain, Doku-Sync |
| [STATUS-2026-05-04.md](./STATUS-2026-05-04.md) | M5-Zwischenstand, Tauri-Prep |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Schichten, Datenfluss, Monorepo |
| [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) | Repo-Layout (`apps/web/src/`) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Setup, Befehle, Konventionen |
| [TESTING.md](./TESTING.md) | Vitest, Coverage, CI |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | CI/CD, Pages, Lighthouse |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Fehlerbilder |
| [SECURITY-AUDIT-2026.md](./SECURITY-AUDIT-2026.md) | Security-Review |
| [LIVE-DEMO-QA.md](./LIVE-DEMO-QA.md) | Manuelle Demo-Checkliste |

## Einstieg je nach Aufgabe

- **Handoff / Stand:** [STATUS-2026-06-02.md](./STATUS-2026-06-02.md)
- **Was kommt nach M5?:** Abschnitt „Was nach M5 noch offen“ im Status-Dokument; [ROADMAP.md](../ROADMAP.md) M7–M10
- **Neues Feature:** [DEVELOPMENT.md](./DEVELOPMENT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [PRD.md](../PRD.md)
- **Produktion / Deploy:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Tests:** [TESTING.md](./TESTING.md)
- **Agenten-Kanon:** [`.github/copilot-instructions.md`](../.github/copilot-instructions.md), [`instructions.md`](../instructions.md)

## Pfad-Konvention (Monorepo)

Anwendungscode: **`apps/web/src/`**. Shared Packages: **`packages/ai-core`**, **`packages/ui`**. App-Einstieg: **`apps/web/index.tsx`** (nicht Repo-Root).

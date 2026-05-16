# Dokumentationsindex

Dieser Ordner sammelt die projektbezogene Fach- und Betriebsdokumentation für CulinaSync.

## Aktueller Stand

**[STATUS-2026-05-16.md](./STATUS-2026-05-16.md)** — Monorepo-Migration, Supply-Chain-Audit, Doku-Sync, CI-Audit-Gate.

## Inhalte

| Dokument | Inhalt |
|----------|--------|
| [STATUS-2026-05-16.md](./STATUS-2026-05-16.md) | **aktuell** — Monorepo, Audit, CI |
| [STATUS-2026-05-04.md](./STATUS-2026-05-04.md) | M5-Tests, Coverage, Tauri-Prep |
| [STATUS-2026-05-02.md](./STATUS-2026-05-02.md) | MealPlanner-Context, Repositories |
| [STATUS-2026-05-01.md](./STATUS-2026-05-01.md) | Roadmap-Follow-up, CSP |
| [STATUS-2026-04-23.md](./STATUS-2026-04-23.md) | TS7 / DevInfra |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Schichten, Datenfluss, Monorepo |
| [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) | Repo-Layout |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Setup, Befehle, Konventionen |
| [TESTING.md](./TESTING.md) | Vitest, CI, `check:all` |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | CI/CD, Pages, Lighthouse |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Fehlerbilder |
| [SECURITY-AUDIT-2026.md](./SECURITY-AUDIT-2026.md) | Security-Review |
| [LIVE-DEMO-QA.md](./LIVE-DEMO-QA.md) | Manuelle Demo-Checkliste |

## Einstieg je nach Aufgabe

- **Handoff / Stand:** [STATUS-2026-05-16.md](./STATUS-2026-05-16.md)
- **Neues Feature:** [DEVELOPMENT.md](./DEVELOPMENT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), Root-[`PRD.md`](../PRD.md)
- **Produktion / Deploy:** [DEPLOYMENT.md](./DEPLOYMENT.md), [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Tests:** [TESTING.md](./TESTING.md)
- **Agenten-Kanon (technisch):** [`.github/copilot-instructions.md`](../.github/copilot-instructions.md), [`instructions.md`](../instructions.md)

## Pfad-Konvention (seit Monorepo)

Anwendungscode liegt unter **`apps/web/src/`** (nicht mehr Repo-Root-`src/`). Shared Packages: **`packages/ai-core`**, **`packages/ui`**.

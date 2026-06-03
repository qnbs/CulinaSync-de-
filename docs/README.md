# Dokumentationsindex

Dieser Ordner sammelt die projektbezogene Fach- und Betriebsdokumentation für CulinaSync.

## Aktueller Stand

**[STATUS-2026-06-03.md](./STATUS-2026-06-03.md)** — M10 Nextcloud, Tauri-2-Workspace, PWA-Erweiterung, Vercel/Deploy-Fixes, i18n Gates.

Vorgänger: [STATUS-2026-06-02.md](./STATUS-2026-06-02.md) (M5 Coverage abgeschlossen).

## Inhalte

| Dokument | Inhalt |
|----------|--------|
| [STATUS-2026-06-03.md](./STATUS-2026-06-03.md) | **aktuell** — Sync, PWA, Deploy, Validierung |
| [STATUS-2026-06-02.md](./STATUS-2026-06-02.md) | M5 done, Coverage, offene Milestones |
| [PWA.md](./PWA.md) | Manifest, Service Worker, Install, Share Target |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | UI-Kit, Tokens, Komponenten-Migrationen |
| [LOCAL-AI-AUDIT-2026-06.md](./LOCAL-AI-AUDIT-2026-06.md) | Local-AI Phase 0 Audit |
| [LOCAL-AI-ARCHITECTURE.md](./LOCAL-AI-ARCHITECTURE.md) | Zielarchitektur Local AI |
| [AUDIT-REPORT-2026-06.md](./AUDIT-REPORT-2026-06.md) | Phase-0 Re-Audit |
| [M7-TYPESCRIPT-7-GA-PREP.md](./M7-TYPESCRIPT-7-GA-PREP.md) | TS 7.0 GA Vorbereitung |
| [M8-TAURI-DESKTOP.md](./M8-TAURI-DESKTOP.md) | Desktop / Tauri 2 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Schichten, Datenfluss, Monorepo |
| [DB-MIGRATIONS.md](./DB-MIGRATIONS.md) | Dexie-Schema, `DB_MIGRATION_HISTORY`, Backup-Gate |
| [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) | Repo-Layout (`apps/web/src/`) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Setup, Befehle, Konventionen |
| [TESTING.md](./TESTING.md) | Vitest, Coverage, Playwright E2E |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | CI/CD, Pages, Vercel, Lighthouse |
| [DEPLOY-PAGES-VERCEL.md](./DEPLOY-PAGES-VERCEL.md) | Pages + Vercel Handbuch, Verify-Skripte |
| [AUDIT-vNEXT-2026-06-03.md](./AUDIT-vNEXT-2026-06-03.md) | Full-Scale Audit vNext |
| [AUDIT-REMEDIATION-BACKLOG.md](./AUDIT-REMEDIATION-BACKLOG.md) | Priorisierter Remediation-Backlog |
| [AUDIT-REMEDIATION-PLAN.md](./AUDIT-REMEDIATION-PLAN.md) | Umsetzungsplan Audit-Findings |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Fehlerbilder |
| [SECURITY-AUDIT-2026.md](./SECURITY-AUDIT-2026.md) | Security-Review |
| [LIVE-DEMO-QA.md](./LIVE-DEMO-QA.md) | Manuelle Demo-Checkliste |

## Einstieg je nach Aufgabe

- **Handoff / Stand:** [STATUS-2026-06-03.md](./STATUS-2026-06-03.md)
- **Was kommt als Nächstes?:** [ROADMAP.md](../ROADMAP.md) M7–M10
- **Neues Feature:** [DEVELOPMENT.md](./DEVELOPMENT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [PRD.md](../PRD.md)
- **PWA / Offline:** [PWA.md](./PWA.md)
- **UI-Komponenten:** [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)
- **Produktion / Deploy:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Tests:** [TESTING.md](./TESTING.md)
- **Agenten-Kanon:** [`.github/copilot-instructions.md`](../.github/copilot-instructions.md), [`instructions.md`](../instructions.md)

## Pfad-Konvention (Monorepo)

Anwendungscode: **`apps/web/src/`**. Shared Packages: **`packages/ai-core`**, **`packages/ui`**. App-Einstieg: **`apps/web/index.tsx`** (nicht Repo-Root).

## Docs-Housekeeping (Team)

Bei größeren Releases oder Merges auf `main`:

1. **STATUS** — neuen Snapshot anlegen oder `STATUS-2026-06-03.md` ergänzen; diesen Index verlinken.
2. **README.md** (Root) — Kurzstatus-Tabelle und Links aktualisieren.
3. **CHANGELOG.md** — [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).
4. **TESTING.md / DEPLOYMENT.md** — CI-Versionen (Node, Playwright-Image) abgleichen.
5. **i18n** — `pnpm run i18n:check` vor Merge.

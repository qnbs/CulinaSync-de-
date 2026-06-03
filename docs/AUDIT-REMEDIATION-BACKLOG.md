# CulinaSync — Priorisierter Remediation-Backlog

> Erzeugt aus [AUDIT-vNEXT-2026-06-03.md](./AUDIT-vNEXT-2026-06-03.md).  
> Für GitHub Issues: Titel + Labels aus Spalte **Issue-Titel** übernehmen.

| ID | Severity | Issue-Titel | Impact | Effort | Why now? | Abhängigkeiten | Status |
|----|----------|-------------|--------|--------|----------|----------------|--------|
| R-001 | High | `feat(sync): Zod-validate device sync QR payload` | Security / Datenintegrität | S | QR-Sync ist live ohne Schema-Gate | — | ✅ PR #66 / main |
| R-002 | High | `refactor(settings): split DataPanel sync/vault sections` | Wartbarkeit, Bundle | M | Größte Settings-Datei; Sync wächst | — | ✅ PR #66 |
| R-003 | High | `test(e2e): critical journeys sync, chef, cook-mode` | Regressionsschutz | L | Smoke reicht nicht für M10 | R-001 optional | 🟨 Basis PR #66 (Cook-Mode-E2E offen) |
| R-004 | Medium | `refactor(db): services import dbInstance only` | Testbarkeit | S | Letzte `./db`-Imports in Services bereinieren | — | ✅ `exportService` |
| R-005 | Medium | `chore(eslint): typed rules + floating promises` | Hook-Bugs | M | `exhaustive-deps` **error** (2026-06-03); typed lint folgt | R-004 hilft |
| R-006 | Medium | `test: raise branch coverage sync + recipeRepository` | CI-Stabilität | M | Ist ~63,7 %; Threshold 63 | — | 🟨 PR #66 Teilerfolg |
| R-007 | Medium | `docs: document Dexie migration + backup gate` ✅ | User Trust | S | Erledigt: `docs/DB-MIGRATIONS.md` | — |
| R-008 | Medium | `feat(sync): optional encrypted credential storage` | Security | M | localStorage Metadaten | apiKeyService pattern |
| R-009 | Medium | `ci: Lighthouse CI on PR previews` | PWA/A11y Scores | M | Mobile UX | Vercel/Pages preview |
| R-010 | Low | `chore(deps): resolve moderate audit findings` | Supply chain | S | 3 moderate offen | Dependabot |
| R-011 | Low | `feat(demo): seed or try-without-data for Pages` | Onboarding | M | Erstbesucher GitHub Pages | — |
| R-012 | Medium | `release(tauri): M8 first tagged desktop build` | Desktop | L | ROADMAP M8 | CI GTK image |
| R-013 | Low | `docs(legal): privacy policy DE` | Launch DE | M | Öffentliche Veröffentlichung | — |
| R-014 | Info | `chore(graphify): update after code sessions` | Agent DX | S | Team policy | — |

## Sprint-Vorschlag (sofort–2 Wochen)

**Sprint A (Woche 1):** R-001, R-004, R-007, R-010  
**Sprint B (Woche 2):** R-003 (1. Spec Sync), R-005, R-006 (syncService branches)

## Definition of Done (Backlog-Item)

- [ ] Code + Tests grün (`pnpm run lint`, `type-check`, `test:coverage`)
- [ ] i18n: neue UI-Strings in de/en
- [ ] CHANGELOG [Unreleased] + STATUS-Snapshot bei user-visible Änderung
- [ ] PR: alle Bot-/Review-Kommentare (CodeAnt, Copilot) **adressiert oder begründet abgelehnt**

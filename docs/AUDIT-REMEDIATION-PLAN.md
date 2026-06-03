# CulinaSync — Strategischer Remediation-Plan

> Begleitdokument zu [AUDIT-vNEXT-2026-06-03.md](./AUDIT-vNEXT-2026-06-03.md) und [AUDIT-REMEDIATION-BACKLOG.md](./AUDIT-REMEDIATION-BACKLOG.md).

---

## Kurzfristig (0–14 Tage) — „Trust & Gates“

| Ziel | Maßnahmen | Erfolgskriterium |
|------|-----------|------------------|
| Sync vertrauenswürdig | R-001 Zod; R-003 erster E2E; Review `backupMergeService` | E2E grün; keine unvalidierten JSON-Merges |
| DB-Schicht testbar | R-004 nur `dbInstance` in Services; `index.tsx` lädt `db.ts` | Kein Service-Import von `./db` |
| ESLint verschärfen | R-005 Warnungen → 0 → `error` | `max-warnings 0` bleibt grün |
| Doku-Wahrheit | R-007 Help + AUDIT: Migrationen dokumentiert | Keine „fehlende Migration“-Claims |

---

## Mittelfristig (2–8 Wochen) — „Scale & Surface“

| Ziel | Maßnahmen |
|------|-----------|
| Settings wartbar | R-002 DataPanel-Split; Settings-Bundle < 90 KB brotli |
| Coverage resilient | R-006 branches ≥ 65 %; `recipeRepository` / `syncService` |
| PWA messbar | R-009 Lighthouse CI; Offline-Indikatoren (ROADMAP P1 PWA) |
| Desktop | R-012 Tauri Tag-Release; Smoke auf Windows/macOS/Linux Artefakte |

---

## Langfristig (2–6 Monate) — „Platform“

| Thema | Richtung |
|-------|----------|
| **M10 Sync** | LWW beibehalten + Audit-Trail; optional CRDT-PoC in `packages/` |
| **M7 TS 7 GA** | `check:ts-ga` wenn npm stable ≥ 7.0.0 |
| **Local AI L1–L3** | Feature-Flags; WebGPU-Detection; Bundle-Gate pro Layer |
| **Legal / Launch** | R-013 Privacy DE; Impressum wenn öffentlich |
| **Community** | IPFS/Nostr nur mit explizitem Opt-in (bestehend) |

---

## Modernisierung ohne Breaking Changes

| Bereich | Vorschlag | Risiko |
|---------|-----------|--------|
| TypeScript | `noUncheckedSideEffectImports` nach TS7 GA | Niedrig |
| Testing | MSW für WebDAV in E2E | Niedrig |
| Redux | Keine Domain-Spiegelung in Redux | — |
| Dexie | Neue Stores nur mit `DB_MIGRATION_HISTORY` Eintrag + Test | Mittel |

---

## PR- & Review-Prozess (dauerhaft)

Siehe `.cursor/rules/300-pr-review-automation.mdc` und `.github/copilot-instructions.md` § PR-Review.

**Modus operandi:** Jeder PR — insbesondere Cloud-Agent-PRs — durchläuft proaktive Abarbeitung aller Inline-Kommentare (CodeAnt, Copilot, Menschen) vor Merge; keine offenen „nit“-Threads ohne Antwort.

---

## Risiko-Matrix

| Risiko | Wahrscheinlichkeit | Schaden | Mitigation |
|--------|-------------------|---------|------------|
| Korrupte Sync-Payload | Mittel | Mittel | R-001, R-003 |
| Stale Hook nach deps warn | Niedrig | Mittel | R-005 |
| Schema-Upgrade ohne Backup | Niedrig | Hoch | `ensureMigrationBackup` + Doku |
| Tauri Release verzögert | Mittel | Niedrig | Web-PWA bleibt Primary |

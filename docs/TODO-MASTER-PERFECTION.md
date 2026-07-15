# Master Perfection — Follow-up To-Do (Post Phase 0)

> **Erstellt:** 2026-07-15  
> **Kontext:** Executive Audit + Master Perfection Prompt v1.0  
> **Phase 0 Status:** ✅ **Complete** (auf `main`)  
> **Nächste Ausführung:** diese Datei als Auftrag für einen späteren Agent/Sprint verwenden.

---

## Phase 0 — Erledigt (nicht erneut tun)

| Item | Ergebnis | Referenzen |
|------|----------|------------|
| Dependabot #106 | ✅ Merged — `tauri` 2.11.5 (+ `tauri-build` 2.6.3 im Lock) | PR #106 |
| Dependabot #107 | ✅ Closed/superseded (bereits in #106) | — |
| Dependabot #108–#111 | ✅ Contents in #113; PRs closed | PR #113 |
| Cloud-PR #112 (AGENTS counts) | ✅ Contents in #113; PR closed | PR #113 |
| **pnpm 11.13 Audit-Gate (P0)** | ✅ `packageManager` → `pnpm@11.13.0`; Settings → `pnpm-workspace.yaml`; `allowBuilds` | PR #113 |
| Branch Protection / R-BRANCHPROT | ✅ Ruleset `mainrules` (18769260) active + Runbook sync | `docs/runbooks/BRANCH-PROTECTION.md`, Backlog ✅ |
| Docs/CHANGELOG/AUDIT Phase-0 | ✅ | `AUDIT.md`, `CHANGELOG.md` [Unreleased] |
| Lokal validiert vor Merge | ✅ lint · type-check · **517** tests · i18n · build · script **182.2 KB** · audit high clean | — |

**Baseline nach Phase 0:** Node 24 · pnpm **11.13** · script-Budget 185 KB · Coverage-Thresholds wie in `apps/web/vitest.config.ts` · Ruleset enforced.

---

## Phase 1 — Re-Audit & Gap Analysis (als Nächstes)

Ziel: Nach Phase-0-Stand frische Lücken priorisieren und Backlog aktualisieren.

1. [ ] Aktuellen `main` pullen; `pnpm install` mit **pnpm ≥11**.
2. [ ] Re-lesen: `package.json`, `pnpm-workspace.yaml`, `validate.yml`, `vitest.config.ts`, `budget.json`, Tauri (`src-tauri/`), Key-Services (`aiService`, `geminiService`, `apiKeyService`, Whisper, `sanitizeForPrompt` / `@domain/ai-core`), `App.tsx`, `AUDIT.md` / `ROADMAP.md` / `SECURITY.md` / `CHANGELOG.md`.
3. [ ] Gap-Liste P0 / P1 / P2 / Strategic erzeugen (nur **neue** Gaps post-July + Phase 0).
4. [ ] `docs/AUDIT-REMEDIATION-BACKLOG.md` aktualisieren; kurzen Status-Block in `AUDIT.md` (Datum + Score-Delta).
5. [ ] Kurzbericht: Top-5 Hebel für Phase 2.

**Hinweise aus Phase-0-Kontext (bereits bekannt, nicht neu auditieren müssen):**
- `R-GLIB` (#23) bleibt tracked — kein In-Range-Fix.
- Classic Branch-Protection-API 404 ist **erwartet**; Enforcement = Ruleset.
- `pnpm audit` braucht zwingend pnpm ≥11 (npm Legacy-Endpoints retired 2026-07-15).

---

## Phase 2 — Strategic Perfection Tracks

Für jede Änderung: Plan → minimaler Diff → lint/type/test → Conventional Commit → Docs (CHANGELOG/ROADMAP/AUDIT) → verify. Patterns erhalten (`useModalA11y`, `aiService`-Fassade, typed states, Dexie nur über Repos).

### P1 — Testing & Qualität

- [ ] Coverage auf **≥82 %** aller Metriken heben (stmts/lines/funcs/branches); Thresholds in `vitest.config.ts` nachziehen, nicht senken.
- [ ] Gezielte Tests: Whisper-Fehlerpfade, API-Key-Passphrase (lock/error), Local-AI-Routing/Fallbacks, Sync-Edge-Cases.
- [ ] E2E: Offline-Chef / kritische Journeys erweitern (nicht nur Smoke).
- [ ] Nach Test-Änderungen: `pnpm run test:coverage` + betroffene Vitest-Dateien.

### P1 — Local AI (M11+)

- [ ] ONNX-Vision abschließen (ROADMAP M11.4 / Folge).
- [ ] RAG/Embedding-Qualität & Caching verbessern.
- [ ] Model-Download-UX (Fortschritt, Offline, Fehler).
- [ ] Leichte Benchmarks / Routing-Dokumentation; ethische Fine-Tuning-Hooks nur planen (kein Scope-Creep).

### P1 — Security / Supply Chain

- [ ] Injection-Defense weiter härten wo Gaps in Phase 1 gefunden.
- [ ] Optional: Dexie-Verschlüsselung evaluieren (Trade-off vs. Local-First-DX).
- [ ] SBOM in CI prüfen/einplanen; Dependabot-Gruppen ggf. nachpnpm-11 justieren.
- [ ] `R-GLIB` bei gtk-rs/wry-Updates re-evaluieren.

### P2 — Perf / Bundle

- [ ] Script-Initial-Budget **<190 KB** halten (aktuell ~182); weitere Lazy-Imports nur wo First-Paint echt profitiert.
- [ ] Bundle-Analyse (`analyze:bundle`) nach größeren AI-Änderungen.

### P2 — DevOps / Release

- [ ] Release-Prozess für **v1.0** (Changesets oder dokumentierter Tag-Flow).
- [ ] Scheduled Review der Ruleset-Required-Checks (Apps umbenannt? → pending-forever vermeiden).
- [ ] Nach großen Dep-Wellen: `pnpm approve-builds` / `allowBuilds` pflegen.

### P2 — Tauri (M8) / R-012

- [ ] Draft **v0.2.4** Desktop-Release nach grünem `tauri-release`-Workflow veröffentlichen.
- [ ] Icons, Native-Politur, Multi-Platform; README-Desktop-Abschnitt aktuell halten.

### P2 — TypeScript 7 (M7)

- [ ] Prep für TS7 GA: Preview-Flags, `noUncheckedSideEffectImports` / `stableTypeOrdering` wenn stabil.
- [ ] Tooling-Peers (eslint/typescript-eslint) vor Major abstimmen.

### P2 — DX / Docs / Agent Rules

- [ ] Docs 100 % sync halten (STATUS-Snapshot bei Meilenstein).
- [ ] `.cursor/rules` bei Bedarf ergänzen: `local-ai`, `tauri-security`, Whisper-Patterns (nur echte Gaps).
- [ ] `graphify update .` nach Code-Sessions (Policy).

### Strategic (v1.0+)

- [ ] Intro-Gates (`INTRO_GATES_ENABLED`) feinschleifen und für v1.0 re-aktivieren.
- [ ] Onboarding-/Flag-Cleanup.
- [ ] Optional: federated Sync (Nostr) — nur Design-Spike, kein Muss.
- [ ] Privacy-preserving local monitoring — Konzept.
- [ ] Scalable AI-Facade / zukünftiger Native-Mobile-Pfad — nur Roadmap-Notiz.

### Backlog-Items (bestehend)

| ID | Aktion |
|----|--------|
| R-012 | Tauri Draft Release v0.2.4 publizieren |
| R-013 | Privacy Policy DE |
| R-GLIB | Re-Eval bei gtk-rs 0.20 |

---

## Phase 3 — Verification & Continuous Improvement

Nach jedem Meilenstein-Block:

1. [ ] `pnpm run check:all` (pnpm ≥11).
2. [ ] Coverage-Report + Bundle-Budget + ggf. Lighthouse (Ziel hohe 90er).
3. [ ] E2E Smoke / erweiterte Specs grün.
4. [ ] `AUDIT.md` Score/Datum, `ROADMAP.md`, `CHANGELOG.md` [Unreleased] aktualisieren.
5. [ ] Session-Report: Metriken, Entscheidungen, Next Sprint.
6. [ ] CI-Korrekturschleife bis grün (`.cursor/rules/302-ci-correction-loop.mdc`).
7. [ ] Alle Bot-Inline-Kommentare (CodeAnt/Copilot/Bugbot) sofort abarbeiten.

**Success Metrics (Zielzustand):** Coverage ≥82 % · Bundle gehalten · 0 high vulns · E2E grün · Lighthouse stark · i18n/a11y 100 % · Docs sync · klare v1.0-Planung.

---

## Empfohlener Startbefehl für den nächsten Agenten

```text
Lies docs/TODO-MASTER-PERFECTION.md und führe Phase 1 aus.
Phase 0 ist done (PR #113 / #106). Nicht erneut Dependabot #108–#111 oder pnpm-10-Audit anfassen.
Branch: cursor/<kurzname>-0ad6 ab main. Nach Push CI bis grün beobachten.
```

---

## Referenzen

- Prompt-Quelle: Master Perfection Prompt 2026-07-15 (User-Query)
- `AUDIT.md` · `ROADMAP.md` · `docs/AUDIT-REMEDIATION-BACKLOG.md` · `SECURITY.md`
- `docs/runbooks/BRANCH-PROTECTION.md`
- CI: `.github/workflows/validate.yml`
- Agent: `AGENTS.md`, `.cursor/rules/300|301|302-*.mdc`, `culinasync-core.mdc`

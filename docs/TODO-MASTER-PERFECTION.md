# TODO — Master Perfection (Follow-up)

Stand nach **Full-Scale Audit 2026-10-02** und Abschluss **W7 Testing** (#197). Siehe `docs/STATUS-2026-10-02.md`.

## Erledigt

- [x] Branch-Coverage **≥82 %** (Floor 82; Ist ~82 %; #129)
- [x] Intro-Gates re-aktiviert (`INTRO_GATES_ENABLED=true`)
- [x] PWA first-run: Offline/Update-Toasts deferiert bis Intro dismiss (`pwaIntroDeferral`, PR #162)
- [x] **PR #162–#164:** SBOM, CSP, E2E Matrix, First-run, WebLLM Fetch-Guard
- [x] Release-Evidence 0.3.0 refresh; Issues #133–#138, #132, #134 geschlossen
- [x] Dependabot-Sprint + **W5–W7** (#192–#197): Actions, Vite 8.3, Tauri 2.11.6, **Vitest 5 / MSW 3 / jsdom 30**
- [x] Audit-Wellen W1–W7 (`docs/audit/CULINASYNC-FULL-AUDIT-2026-10-02.md`)
- [x] Deploy Health: Pages required, Vercel optional (#183)
- [x] Local AI: Ollama → WebLLM → Heuristik (#190); `e2e-gate` in `ci.yml` (#190)
- [x] WebKit E2E CSP/Preview (#188)
- [x] **#131** glib: `cargo audit` in CI + `docs/security/CARGO-AUDIT-EXCEPTIONS.md` (geschlossen 2026-10-03)

## Offen (Owner / strategisch)

### Release / Desktop

- [x] GitHub Release **v0.3.0** — veröffentlicht 2026-08-01
- [ ] Draft `CulinaSync v0.2.4` publishen (Owner) wenn Desktop-QA ok
- [ ] **#139** Tauri Signing — Secrets + `docs/M8-DESKTOP-SIGNING.md`
- [ ] `graphify update .` (CLI ggf. nicht installiert)

### Security / Quality

- [ ] **#137** Dexie at-rest — **deferred** (`docs/ADR-DEXIE-AT-REST-ENCRYPTION.md`); Revisit bei Enterprise/MDM
- [ ] Ruleset: optional **`e2e-gate`** in `mainrules` (GitHub UI — `docs/runbooks/BRANCH-PROTECTION.md`)
- [ ] WebKit Matrix: `workflow_dispatch` (Agent-Token 403); weekly Schedule beobachten

### Strategic (v1.0+)

- [ ] Nostr / federated Sync — Spike
- [ ] Native Mobile Path — Roadmap
- [ ] M5.9 Coverage → 88 % (`docs/M5.9-COVERAGE-PROGRAM.md`, S1 UI-Tests ✅)

---

## Empfohlener Startbefehl (nächster Agent)

```text
Lies docs/STATUS-2026-10-02.md und docs/TODO-MASTER-PERFECTION.md.
Priorität: #139 Signing (Owner), e2e-gate ruleset (Owner), M5.9 Coverage, #137 nur bei Produktentscheid.
Branch: cursor/<kurzname>-a100 ab main. CI bis grün.
```

---

## Referenzen

- `AUDIT.md` · `ROADMAP.md` · `docs/AUDIT-REMEDIATION-BACKLOG.md`
- `docs/legal/DATENSCHUTZ.md` · `docs/RELEASE-PROCESS.md`
- `docs/ADR-DEXIE-AT-REST-ENCRYPTION.md` · `docs/TESTING.md`
- `.cursor/rules/local-ai-patterns.mdc`

# TODO — Master Perfection (Follow-up)

Stand nach Merge **PR #159** auf `main` (2026-09-02).

## Erledigt

- [x] Branch-Coverage **≥82 %** (Floor 82; Ist ~82 %; #129)
- [x] Intro-Gates re-aktiviert (`INTRO_GATES_ENABLED=true`)
- [x] Dependabot-Sprint (npm + GitHub Actions) in PR #159
- [x] PWA first-run sequencing (`usePwaUpdate` / `usePwaInstall` `deferForIntro`)
- [x] `localAiModelIntegrity.ts` + Tests
- [x] `assertAllowedEndpoint` in `geminiService`
- [x] Release-Evidence 0.3.0 regeneriert (`9031561`, lcov SHA in `evidence.json`)
- [x] Stale `cursor/*` Remote-Branches gelöscht (#140)
- [x] Superseded Dependabot-PRs geschlossen (#122–#124, #160)

## Offen

### Release / Desktop

- [ ] GitHub Release **v0.3.0** publishen (Owner) — Evidence unter `release-evidence/0.3.0/`
- [ ] `sbom.cdx.json` generieren und in Evidence einbinden (#135)
- [ ] Draft `CulinaSync v0.2.4` publishen (Owner) wenn Desktop-QA ok
- [ ] `graphify update .` (CLI ggf. nicht installiert)

### Security / Quality

- [ ] #133 CSP `connect-src` Redesign (Runtime-Policy interim)
- [ ] #134 WebLLM MLC-interne Download-Pfade
- [ ] #139 Tauri Signing (Owner-Secrets)
- [ ] #138 Cross-browser E2E Matrix

### Strategic (v1.0+)

- [ ] Nostr / federated Sync — Spike
- [ ] Native Mobile Path — Roadmap
- [ ] M5.9 Coverage → 88 %

---

## Empfohlener Startbefehl (nächster Agent)

```text
Lies docs/STATUS-2026-09-02.md und docs/TODO-MASTER-PERFECTION.md.
Priorität: v0.3.0 Release publishen (Owner), SBOM (#135), oder #133 CSP.
Branch: cursor/<kurzname>-a100 ab main. CI bis grün.
```

---

## Referenzen

- `AUDIT.md` · `ROADMAP.md` · `docs/AUDIT-REMEDIATION-BACKLOG.md`
- `docs/legal/DATENSCHUTZ.md` · `docs/RELEASE-PROCESS.md`
- `docs/ADR-DEXIE-AT-REST-ENCRYPTION.md`
- `.cursor/rules/local-ai-patterns.mdc`

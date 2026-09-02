# TODO — Master Perfection (Follow-up)

Stand nach Merge **PR #162** auf `main` (2026-09-02).

## Erledigt

- [x] Branch-Coverage **≥82 %** (Floor 82; Ist ~82 %; #129)
- [x] Intro-Gates re-aktiviert (`INTRO_GATES_ENABLED=true`)
- [x] PWA first-run: Offline/Update-Toasts deferiert bis Intro dismiss (`pwaIntroDeferral`, PR #162)
- [x] **PR #162:** SBOM, CSP runtime gates, E2E Matrix (Chromium/Firefox blockierend)
- [x] Release-Evidence 0.3.0 mit SBOM + lcov (`92bd4a0` / `3404407`)
- [x] Issues #133, #135, #138, #127, #136, #132 geschlossen (Owner 2026-09-02)
- [x] Dependabot-Sprint (npm + GitHub Actions) in PR #159
- [x] `localAiModelIntegrity.ts` + Tests
- [x] `assertAllowedEndpoint` in sync/import/community/Gemini
- [x] Stale `cursor/*` Remote-Branches gelöscht (#140)

## Offen

### Release / Desktop

- [ ] GitHub Release **v0.3.0** publishen (Owner, später) — Evidence unter `release-evidence/0.3.0/`
- [ ] Draft `CulinaSync v0.2.4` publishen (Owner) wenn Desktop-QA ok
- [ ] `graphify update .` (CLI ggf. nicht installiert)

### Security / Quality

- [x] #134 WebLLM/MLC Fetch-Guard (`installMlCdnFetchGuard`, `raw.githubusercontent.com/mlc-ai/*`)
- [ ] #139 Tauri Signing (Owner-Secrets)
- [ ] #137 Dexie at-rest Encryption (ADR — deferred)

### Strategic (v1.0+)

- [ ] Nostr / federated Sync — Spike
- [ ] Native Mobile Path — Roadmap
- [ ] M5.9 Coverage → 88 %

---

## Empfohlener Startbefehl (nächster Agent)

```text
Lies docs/STATUS-2026-09-02.md und docs/TODO-MASTER-PERFECTION.md.
Priorität: E2E Journeys, #134 WebLLM-Pfade, oder Owner Release v0.3.0.
Branch: cursor/<kurzname>-a100 ab main. CI bis grün.
```

---

## Referenzen

- `AUDIT.md` · `ROADMAP.md` · `docs/AUDIT-REMEDIATION-BACKLOG.md`
- `docs/legal/DATENSCHUTZ.md` · `docs/RELEASE-PROCESS.md`
- `docs/ADR-DEXIE-AT-REST-ENCRYPTION.md`
- `.cursor/rules/local-ai-patterns.mdc`

# TODO — Master Perfection (Follow-up)

Stand nach Merge **PR #164** auf `main` (2026-09-02).

## Erledigt

- [x] Branch-Coverage **≥82 %** (Floor 82; Ist ~82 %; #129)
- [x] Intro-Gates re-aktiviert (`INTRO_GATES_ENABLED=true`)
- [x] PWA first-run: Offline/Update-Toasts deferiert bis Intro dismiss (`pwaIntroDeferral`, PR #162)
- [x] **PR #162:** SBOM, CSP runtime gates, E2E Matrix (Chromium/Firefox blockierend)
- [x] **PR #163:** First-run Welcome re-render + `first-run.spec.ts`, `local-ai-settings.spec.ts`
- [x] **PR #164:** #134 WebLLM/MLC Fetch-Guard + E2E (`settings-data-pwa`, `pantry-smart-add`)
- [x] Release-Evidence 0.3.0 refresh (`sourceSha` **`4b063f7`**, SBOM + lcov)
- [x] Issues #133, #135, #138, #127, #136, #132, **#134** geschlossen
- [x] Dependabot-Sprint (npm + GitHub Actions) in PR #159
- [x] `localAiModelIntegrity.ts` + Tests
- [x] `assertAllowedEndpoint` in sync/import/community/Gemini
- [x] Stale `cursor/*` Remote-Branches bereinigt (#140, Housekeeping 2026-09-02)

## Offen

### Release / Desktop

- [ ] GitHub Release **v0.3.0** publishen (Owner) — Evidence unter `release-evidence/0.3.0/` (`4b063f7`)
- [ ] Draft `CulinaSync v0.2.4` publishen (Owner) wenn Desktop-QA ok
- [ ] `graphify update .` (CLI ggf. nicht installiert)

### Security / Quality

- [ ] #139 Tauri Signing (Owner-Secrets)
- [ ] #137 Dexie at-rest Encryption (ADR — deferred)
- [ ] #131 glib 0.18.5 Advisory — Tauri/Rust-Upgrade wenn verfügbar

### Strategic (v1.0+)

- [ ] Nostr / federated Sync — Spike
- [ ] Native Mobile Path — Roadmap
- [ ] M5.9 Coverage → 88 %

---

## Empfohlener Startbefehl (nächster Agent)

```text
Lies docs/STATUS-2026-09-02.md und docs/TODO-MASTER-PERFECTION.md.
Priorität: Owner Release v0.3.0, #139 Tauri Signing, oder M5.9 Coverage.
Branch: cursor/<kurzname>-a100 ab main. CI bis grün.
```

---

## Referenzen

- `AUDIT.md` · `ROADMAP.md` · `docs/AUDIT-REMEDIATION-BACKLOG.md`
- `docs/legal/DATENSCHUTZ.md` · `docs/RELEASE-PROCESS.md`
- `docs/ADR-DEXIE-AT-REST-ENCRYPTION.md`
- `.cursor/rules/local-ai-patterns.mdc`

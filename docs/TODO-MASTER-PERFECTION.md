# Master Perfection — Follow-up To-Do (Post Phase 0)

> **Erstellt:** 2026-07-15 · **Aktualisiert:** 2026-07-15 (Phase 3 Session)  
> **Phase 0 Status:** ✅ Complete  
> **Phase 1–2 Status:** ✅ Complete (`main`)  
> **Phase 3 Status:** ✅ **Substantial progress this session** — see below.

---

## Phase 0 — Erledigt (nicht erneut tun)

| Item | Ergebnis |
|------|----------|
| Dependabot #106–#111 / #112 | ✅ via #106 + #113 |
| pnpm 11.13 Audit-Gate | ✅ |
| R-BRANCHPROT | ✅ |

---

## Phase 1–2 — Erledigt

Siehe vorherige Session / CHANGELOG. Kurz: RAG, Sanitizer, Whisper, Backup-Zod, Dead-Controls-Ehrlichkeit, Privacy, SBOM, Coverage-Lines ≥82.

---

## Phase 3 — Erledigt in dieser Session

### Local AI

- [x] **M11.4 ONNX Vision** — `localAiOnnxEngine` + `vision.worker` + `localAiVisionService`; Routing in `aiProviderService`; EXIF-Strip; Settings-Toggles live
- [x] Inference-Cache Service verdrahten (`aiInferenceCache` Dexie v14)
- [x] Model-Download-UX (WebLLM Progress / `downloadedModels` / Prepare-Button)
- [x] Ollama-Connector (+ Health-Probe, CSP Loopback)

### Testing & Qualität

- [x] E2E Offline-Chef (`e2e/chef-offline.spec.ts`)
- [x] Branch-Coverage-Threshold **68** (gestaffelt; Ziel 82 weiter offen)
- [x] Gezielte Tests: Cache, Vision-Format, Ollama-Probe, Mutators, Offline-Fallback, htmlSanitizer, ONNX-Engine

### Security / Supply Chain

- [x] PBKDF2-Angleichung (CSB3 + Sync-Credentials v3 = 600k; Legacy lesbar) — `cryptoConstants.ts`
- [x] Dexie at-rest encryption — **Eval ADR** `docs/ADR-DEXIE-AT-REST-ENCRYPTION.md` (defer P2)

### DevOps / Docs / DX

- [x] Tauri `Cargo.toml` → **0.2.4** (Version-Drift behoben; Draft-Tag R-012 noch manuell)
- [x] `local-ai-patterns.mdc` aktualisiert
- [x] CHANGELOG / Backlog / dieses TODO
- [ ] `graphify update .` (CLI ggf. nicht installiert)
- [ ] R-012: Tag `v0.2.4` + Tauri Draft Release nach Workflow

### Strategic (v1.0+) — bewusst offen

- [ ] Intro-Gates re-aktivieren (`INTRO_GATES_ENABLED`)
- [ ] Branch-Coverage ≥82 % (weiterer Sprint)
- [ ] Nostr / federated Sync — nur Spike
- [ ] Native Mobile Path — Roadmap-Notiz

---

## Phase 3 — Verification

- [ ] lint · type-check · i18n · Vitest (+coverage gate) · test:scripts · build · audit
- [ ] CI auf PR bis grün
- [ ] Bot-Kommentare am PR abarbeiten

---

## Empfohlener Startbefehl (nächster Agent)

```text
Lies docs/TODO-MASTER-PERFECTION.md — Phase 3 Local-AI weitgehend verdrahtet.
Priorität: Branch-Coverage→82 %, R-012 Tag v0.2.4, Intro-Gates (v1.0).
Branch: cursor/<kurzname>-0ad6 ab main. CI bis grün.
```

---

## Referenzen

- `AUDIT.md` · `ROADMAP.md` · `docs/AUDIT-REMEDIATION-BACKLOG.md`
- `docs/legal/DATENSCHUTZ.md` · `docs/RELEASE-PROCESS.md`
- `docs/ADR-DEXIE-AT-REST-ENCRYPTION.md`
- `.cursor/rules/local-ai-patterns.mdc`

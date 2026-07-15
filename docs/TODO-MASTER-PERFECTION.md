# Master Perfection — Follow-up To-Do (Post Phase 0)

> **Erstellt:** 2026-07-15 · **Aktualisiert:** 2026-07-15 (Phase 1–2 Session)  
> **Phase 0 Status:** ✅ Complete  
> **Phase 1–2 Status:** ✅ **Substantial progress on `main` (this session)** — see below.

---

## Phase 0 — Erledigt (nicht erneut tun)

| Item | Ergebnis |
|------|----------|
| Dependabot #106–#111 / #112 | ✅ via #106 + #113 |
| pnpm 11.13 Audit-Gate | ✅ |
| R-BRANCHPROT | ✅ |

---

## Phase 1 — Re-Audit — ✅ Done (diese Session)

Gap-Liste (P0/P1) erarbeitet und priorisiert umgesetzt. Kurzbericht Top-5 Hebel:

1. RAG-`promptBlock` → echter Prompt-Kontext (**P0-1**)  
2. Prompt-Sanitizer Cloud/On-Device + DE (**P0 Security**)  
3. Whisper ModelSize + Mic-i18n + Tests (**P0-3/4**)  
4. Backup Zod nach Decrypt (**P0 Sync**)  
5. Dead Controls ehrlich (**P0 Trust**)

---

## Phase 2 — Erledigt in dieser Session

### Testing & Qualität

- [x] Coverage **Lines ≥82 %** (Thresholds **82 / 80 / 75 / 64**) — Branches noch ~65 %, Ziel 82 % gestaffelt
- [x] Tests: Whisper Hook, Backup-Schemas, Sync-Credentials, Device-Sync Edges, Vault Download/Merge, apiKey Race, RAG/PromptBuilder
- [ ] E2E Offline-Chef erweitern (Smoke bleibt; Follow-up)
- [ ] Branch-Coverage ≥82 % (groß; M5.9-Pfad)

### Local AI

- [x] RAG-Prompt-Fix (`ragContext`)
- [x] Whisper ModelSize verdrahtet (`resolveWhisperModelId`)
- [x] Embedding-Worker `error`-Handler
- [x] Dead Controls: Vision/Cache/Ollama/EXIF disabled + „geplant“-Copy
- [ ] **M11.4 ONNX Vision** (größerer Sprint)
- [ ] Model-Download-UX (WebLLM Progress / downloadedModels)
- [ ] Inference-Cache Service verdrahten
- [ ] Ollama-Connector

### Security / Supply Chain

- [x] Sanitizer vereinheitlicht + DE-Injection
- [x] Gemini Shopping/Image/Nutrition/Ideas sanitized
- [x] Backup Zod + DataPanel Import
- [x] SBOM CycloneDX in `validate.yml`
- [x] R-013 Privacy Policy DE + Settings-Link
- [ ] Dexie at-rest encryption (nur evaluieren — P2)
- [ ] PBKDF2-Iterations angleichen (dokumentiert als Drift)

### DevOps / Docs / DX

- [x] `docs/RELEASE-PROCESS.md`
- [x] `.cursor/rules/local-ai-patterns.mdc`
- [x] AUDIT / CHANGELOG / Backlog sync
- [ ] `graphify update .` nach Merge (Agent-Policy)
- [ ] Tauri Draft Release R-012

### Strategic (v1.0+)

- [ ] Intro-Gates re-aktivieren
- [ ] Nostr / federated Sync — nur Spike
- [ ] Native Mobile Path — Roadmap-Notiz

---

## Phase 3 — Verification (diese Session)

- [x] lint · type-check · i18n · **532** Vitest · test:scripts · build · bundle (~182 KB) · audit high
- [ ] CI auf PR bis grün (nach Push)
- [ ] Bot-Kommentare am PR abarbeiten

---

## Empfohlener Startbefehl (nächster Agent)

```text
Lies docs/TODO-MASTER-PERFECTION.md — Phase 0–2 Teil erledigt.
Priorität: M11.4 ONNX Vision ODER Branch-Coverage≥82 % ODER R-012 Tauri Release.
Branch: cursor/<kurzname>-0ad6 ab main. CI bis grün.
```

---

## Referenzen

- `AUDIT.md` · `ROADMAP.md` · `docs/AUDIT-REMEDIATION-BACKLOG.md`
- `docs/legal/DATENSCHUTZ.md` · `docs/RELEASE-PROCESS.md`
- `.cursor/rules/local-ai-patterns.mdc`

# TODO — Master Perfection (Follow-up)

Stand nach Sprint Coverage / Intro / Tauri (2026-07-16).

## Erledigt in diesem Sprint

- [x] Intro-Gates re-aktiviert (`INTRO_GATES_ENABLED=true`) — dismissible Onboarding (Escape/Backdrop/X/Skip), What's-New erst nach First-Run, i18n DE/EN, Tests
- [x] Branch-Coverage Floor **64 → 73** (Ist ~73,2 %); Ziel **82 %** bleibt Folge-Sprint (kein UI-Exclude-Cheat)
- [x] Dependabot #117 `serde_with` 3.21.0 (Security) gemerged
- [x] R-012: Tag `v0.2.4` + Draft-Release mit Desktop-Assets **bereits vorhanden** (Workflow grün 2026-06-05) — Publish der Draft-Release ist manueller Owner-Schritt
- [x] Voice-Timer-Regex Fix (`starten|starte|start`)
- [x] CHANGELOG / Backlog / dieses TODO

## Offen (nächster Sprint)

### Coverage

- [ ] Branch-Coverage ≥**82 %** (Hotspots: `useShoppingList`, `exportService`, `dbMigrations`, Hooks/UI)
- [ ] Danach Threshold in `vitest.config.ts` auf gemessenen Ist-Wert anheben

### Release / Desktop

- [ ] Draft `CulinaSync v0.2.4` auf GitHub **publishen** (Owner) wenn Desktop-QA ok
- [ ] `graphify update .` (CLI ggf. nicht installiert)

### Strategic (v1.0+)

- [ ] Nostr / federated Sync — nur Spike
- [ ] Native Mobile Path — Roadmap-Notiz
- [ ] M5.9 Coverage → 88 %

---

## Empfohlener Startbefehl (nächster Agent)

```text
Lies docs/TODO-MASTER-PERFECTION.md.
Priorität: Branch-Coverage 73→82 % (Service/Hook-Hotspots), optional Draft v0.2.4 publishen.
Branch: cursor/<kurzname>-0ad6 ab main. CI bis grün.
```

---

## Referenzen

- `AUDIT.md` · `ROADMAP.md` · `docs/AUDIT-REMEDIATION-BACKLOG.md`
- `docs/legal/DATENSCHUTZ.md` · `docs/RELEASE-PROCESS.md`
- `docs/ADR-DEXIE-AT-REST-ENCRYPTION.md`
- `.cursor/rules/local-ai-patterns.mdc`

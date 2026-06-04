# M8 — Tauri Desktop (Build-Anleitung)

> **Stand:** Juni 2026 · Config unter `src-tauri/`, Web-Build: `apps/web/dist`

## Aktueller Stand

| Item | Status |
|------|--------|
| `tauri.conf.json` (Fenster, CSP, Identifier) | ✅ |
| `identifier` | `io.github.qnbs.culinasync` |
| CI `tauri-release.yml` | ✅ Web-Build + Config-Check |
| Vollständiges **Cargo-Workspace** + Matrix-Builds | ✅ `Cargo.toml`, `src/`, `tauri-release.yml` |

## Voraussetzungen

- Rust toolchain (`rustup`, stable)
- System-Abhängigkeiten laut [Tauri 2 Prerequisites](https://v2.tauri.app/start/prerequisites/)
- Node **24**, pnpm **10**
- Web-App gebaut: `pnpm run build` → `apps/web/dist`

## Build (Cargo-Workspace)

```bash
pnpm install
pnpm run tauri:icons   # einmalig / bei Icon-Änderung
CULINASYNC_DESKTOP_BUILD=1 pnpm run build   # base "/" (nicht GitHub-Pages-Subpath)
cd src-tauri
cargo tauri build    # CLI: cargo install tauri-cli --locked
```

**CI:** `tauri-release.yml` setzt `CULINASYNC_DESKTOP_BUILD=1` — sonst würde `GITHUB_ACTIONS` den Pages-Pfad `/CulinaSync-de-/` in `vite.config.ts` aktivieren.

## GitHub Release (R-012)

1. Version in `apps/web/package.json` und `src-tauri/tauri.conf.json` angleichen.
2. Tag pushen: `git tag v0.2.2 && git push origin v0.2.2` (oder `workflow_dispatch` in Actions).
3. Workflow erzeugt einen **Draft Release** mit Windows/macOS/Linux-Artefakten — manuell veröffentlichen.

**Rust:** stable **≥ 1.85** empfohlen (Tauri-2-Abhängigkeiten). CI nutzt `dtolnay/rust-toolchain@stable`.

Artefakte je Plattform unter `src-tauri/target/release/bundle/`.

## Deep Links (Desktop)

Protokoll `culinasync://` — Handler in `apps/web/src/deepLinking.ts`, App-Listener `useDeepLinkNavigation`. Native Registrierung folgt mit Tauri 2 `deep-link` Plugin in `src-tauri/src/lib.rs`.

## Version

`version` in `tauri.conf.json` soll mit `apps/web/package.json` (**0.2.2**) synchron gehalten werden.

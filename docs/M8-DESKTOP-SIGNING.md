# Desktop signing and release matrix (M8)

**Issue:** #139 · **Workflow:** `.github/workflows/tauri-release.yml`

## Current state (v0.3.0)

- Four-platform matrix: Linux, Windows, macOS (aarch64 + x86_64)
- `tauri-action` creates **draft** GitHub Releases on tag push
- Signing secrets **not** configured in CI (public release blocked until configured)

## Required secrets (owner action)

| Platform | Secret / credential |
|----------|-------------------|
| Windows | `TAURI_SIGNING_PRIVATE_KEY` + password |
| macOS | Apple Developer ID + notarization credentials |
| Linux | Optional GPG for `.deb` / AppImage |

Document secrets in GitHub → Settings → Secrets → Actions. Never commit keys.

## Release process

1. Tag `vX.Y.Z` on `main` with green CI
2. `tauri-release` workflow builds matrix artifacts
3. Verify draft release artifacts + checksums (`release-evidence/`)
4. Owner publishes draft after manual smoke on each platform

## References

- [Tauri signer docs](https://tauri.app/distribute/sign/windows/)
- `docs/M8-TAURI-DESKTOP.md`

# Cargo audit exceptions

**Issue:** #131 · **Review date:** 2026-09-01

## CI

- `validate.yml` runs `cargo audit --file src-tauri/Cargo.lock` when `cargo-audit` is installed
- `pnpm run verify:release` runs audit locally when tooling is present

## Accepted findings

Document each accepted `RUSTSEC` here with rationale and review date.

| Advisory | Crate | Severity | Rationale | Review |
|----------|-------|----------|-----------|--------|
| RUSTSEC-2026-0194 | quick-xml 0.39.4 (via tauri/plist) | High | Transitive; no plist fix on current Tauri lock | 2026-09-01 |
| RUSTSEC-2026-0195 | quick-xml 0.39.4 (via tauri/plist) | High | Same chain; tracked in root `audit.toml` ignore | 2026-09-01 |
| _(gtk/glib unmaintained)_ | atk, glib-sys, etc. | Warning | Tauri Linux GTK3 stack; accepted per #131 | 2026-09-01 |

When an advisory is accepted, add a row and link the GitHub issue. Remove when upgraded.

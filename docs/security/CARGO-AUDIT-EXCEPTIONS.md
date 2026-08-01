# Cargo audit exceptions

**Issue:** #131 · **Review date:** 2026-09-01

## CI

- `validate.yml` runs `cargo audit --file src-tauri/Cargo.lock` when `cargo-audit` is installed
- `pnpm run verify:release` runs audit locally when tooling is present

## Accepted findings

Document each accepted `RUSTSEC` here with rationale and review date.

| Advisory | Crate | Severity | Rationale | Review |
|----------|-------|----------|-----------|--------|
| _(none filed)_ | | | Transitive glib — track via Dependabot / Tauri upgrades | 2026-09-01 |

When an advisory is accepted, add a row and link the GitHub issue. Remove when upgraded.

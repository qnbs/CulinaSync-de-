# Release Process (v0.2.x → v1.0)

## Principles

- Conventional Commits + `CHANGELOG.md` [Unreleased] → version section on tag.
- `main` is protected by ruleset `mainrules` (see `docs/runbooks/BRANCH-PROTECTION.md`).
- Never ship with red CI or open High/Critical CodeQL findings.

## Checklist before a release tag

1. `pnpm run verify:release` (includes `generate:sbom`, coverage gates, audit).
2. `pnpm run prepare:release-evidence` (SBOM + `release-evidence/<version>/` with hashes).
3. E2E Smoke + E2E Matrix green on `main` (when `apps/web/**` changes).
4. Bundle budget: `script` < 185 KB (sustain <190).
5. CHANGELOG: move `[Unreleased]` bullets into `## [x.y.z] — YYYY-MM-DD`.
6. Bump `version` in root + `apps/web/package.json` (+ Tauri if desktop).
7. `pnpm run sync:vercel-csp` if `csp.ts` changed.
8. Tag `vX.Y.Z` and push; observe Deploy, CodeQL, **Tauri release** (draft + SBOM assets).

## v1.0 readiness (tracked)

- `INTRO_GATES_ENABLED` re-enabled (dismissible onboarding; What's New after first-run).
- Coverage path toward M5.9 (≥88 % long-term); interim branch floor **74** (Ziel 82) in `vitest.config.ts`.
- Privacy policy linked from Help/Settings (`docs/legal/DATENSCHUTZ.md`).
- Desktop R-012: Tag/Draft `v0.2.4` existiert — Draft bei Bedarf publishen.
- Optional Changesets tooling can be added later; until then this runbook is canonical.

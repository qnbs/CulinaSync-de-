# Release Process (v0.2.x → v1.0)

## Principles

- Conventional Commits + `CHANGELOG.md` [Unreleased] → version section on tag.
- `main` is protected by ruleset `mainrules` (see `docs/runbooks/BRANCH-PROTECTION.md`).
- Never ship with red CI or open High/Critical CodeQL findings.

## Checklist before a release tag

1. `pnpm run check:all` (requires **pnpm ≥11** for audit).
2. E2E Smoke green on `main` (path-filtered when `apps/web/**` changes).
3. Bundle budget: `script` < 185 KB (sustain <190).
4. CHANGELOG: move `[Unreleased]` bullets into `## [x.y.z] — YYYY-MM-DD`.
5. Bump `version` in root + `apps/web/package.json` (+ Tauri if desktop).
6. Tag `vX.Y.Z` and push; observe Deploy + CodeQL.
7. Desktop (R-012): after green `tauri-release` workflow, publish GitHub Release assets from the draft.

## v1.0 readiness (tracked)

- Re-enable `INTRO_GATES_ENABLED` after onboarding polish.
- Coverage path toward M5.9 (≥88 % long-term); interim thresholds in `vitest.config.ts`.
- Privacy policy linked from Help/Settings (`docs/legal/DATENSCHUTZ.md`).
- Optional Changesets tooling can be added later; until then this runbook is canonical.

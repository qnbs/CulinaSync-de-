# Runbook — Codecov

Coverage analytics and PR coverage annotations for CulinaSync.

## What it does

- Ingests the Vitest (v8) `lcov` report and tracks line/branch coverage over time.
- Posts a coverage comment on every PR and exposes `project` / `patch` status checks.
- Dashboard: https://app.codecov.io/gh/qnbs/CulinaSync-de-

## How it's wired

| Piece | Location |
|-------|----------|
| Coverage generation | `apps/web/vitest.config.ts` → `coverage.reporter: ['text','html','lcov']`, `reportsDirectory: ./coverage` |
| Report path | `apps/web/coverage/lcov.info` |
| Upload step | `.github/workflows/validate.yml` → `codecov/codecov-action@v5` |
| Secret pass-through | `ci.yml` and `deploy.yml` call `validate.yml` with `secrets: inherit` |
| Config | `codecov.yml` (repo root) |
| Token | Repo Actions secret `CODECOV_TOKEN` (already set) |

`validate.yml` is a **reusable workflow**. Reusable workflows do **not** receive
the caller's secrets automatically — hence `secrets: inherit` on both callers.
Coverage uploads on PRs (via `ci.yml`) and on `main` (via `deploy.yml`), so
Codecov always has a fresh base to diff against.

## Status checks

Defined in `codecov.yml`. Both `project` and `patch` start as
`informational: true` — they **report but never block** while coverage ramps
toward the ROADMAP ≥70% target.

**To make a check blocking:** set `informational: false` on that check in
`codecov.yml` and merge. The project's own Vitest thresholds
(`coverage.thresholds` — 60% lines / 58% statements / 51% functions / 45%
branches) already fail the CI job independently if coverage regresses below the
floor, so Codecov's gate is a secondary, trend-based signal.

## Troubleshooting

- **"Token required" / rate-limited upload:** confirm `CODECOV_TOKEN` is set and
  `secrets: inherit` is present on the `validate.yml` caller. The step uses
  `fail_ci_if_error: false`, so a Codecov outage will **not** fail CI.
- **No PR comment:** the comment posts after `after_n_builds: 1`. If the single
  upload didn't run (e.g. tests failed earlier), no report exists yet — fix the
  upstream test failure first.
- **Coverage looks too low:** check `ignore:` in `codecov.yml` — tests, configs,
  `.d.ts`, `scripts/`, and `packages/ui` are excluded from the math.
- **Wrong file uploaded:** the step pins `files: apps/web/coverage/lcov.info`.
  If the report path changes in `vitest.config.ts`, update the step to match.

## Verifying locally

```bash
pnpm --filter web run test:coverage
ls apps/web/coverage/lcov.info   # the artifact Codecov consumes
```

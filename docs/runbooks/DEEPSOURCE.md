# Runbook — DeepSource

> **⚠️ Status: INACTIVE (2026-07-10).** DeepSource is currently **disabled** in
> the dashboard — it surfaced no findings here, overlaps CodeRabbit / CodeAnt /
> Codecov / GitGuardian / Socket, and its default Test-Coverage metric failed CI
> without data (coverage is reported to Codecov). `.deepsource.toml` is kept but
> neutralized. To re-enable, follow the steps in `.deepsource.toml` and re-enable
> the repo (and soften the Test-Coverage metric) in the DeepSource dashboard.
> The guide below is retained for that future re-activation.

Static analysis and secret detection for the TS/React (Vite) monorepo.

## What it does

- Runs the JavaScript/TypeScript analyzer (with the React plugin) plus secret
  detection against every PR and the default branch.
- Surfaces issues as PR checks and in the DeepSource dashboard; tracks trends.

## How it's wired

| Piece | Location |
|-------|----------|
| Config | `.deepsource.toml` (repo root) |
| Analyzers | `javascript` (plugins: `react`; env: `nodejs`, `browser`), `secrets` |
| Install | DeepSource app on `qnbs/CulinaSync-de-`, activate the repo on deepsource.io |
| Excludes | `dist/`, `coverage/`, `*.min.*`, `graphify-out/`, `packages/ui`, `*.d.ts` |
| Test globs | `**/__tests__/**`, `*.test.ts(x)` |

## Test coverage (opt-in)

Coverage is reported to **Codecov** (see [CODECOV.md](./CODECOV.md)); DeepSource's
`test-coverage` analyzer is intentionally **not** enabled to avoid a second,
perpetually-pending coverage check. To enable it later:

1. Add the `test-coverage` analyzer to `.deepsource.toml`:

   ```toml
   [[analyzers]]
   name = "test-coverage"
   ```

2. Add the repo's `DEEPSOURCE_DSN` as a CI secret.
3. After the coverage step in `validate.yml`, upload the report with the official
   action (a pinned SHA — avoid `curl … | sh`, which runs unpinned remote code).
   GitHub Actions does not allow `secrets` in `if:`, so surface the DSN as an env
   var first and guard the step on it:

   ```yaml
   - name: Report coverage to DeepSource
     env:
       DEEPSOURCE_DSN: ${{ secrets.DEEPSOURCE_DSN }}
     if: ${{ env.DEEPSOURCE_DSN != '' }}
     uses: deepsourcelabs/test-coverage-action@4284bb73a04adb39faaa6bfcc2d0e3dd137ffed7 # v1.1.3
     with:
       key: javascript
       coverage-file: apps/web/coverage/lcov.info
       dsn: ${{ env.DEEPSOURCE_DSN }}
   ```

## Autofix / transformers

The project formats with **biome**, not prettier — so **no prettier transformer**
is configured (it would fight biome). Apply DeepSource Autofix selectively from
the dashboard and re-run local `pnpm run lint` before committing.

## Correction loop

DeepSource issues surface as PR checks rather than inline threads. For each
raised issue: fix at the root or add a scoped, justified skip via a
`// skipcq: <CHECK-ID>` comment **only** when it's a genuine false positive
(documented in the PR). Push and let the analyzer re-run.

## Making it a required check

deepsource.io → repo → Settings → require the DeepSource check, then add it to
`main` branch protection. Set the failing-issue threshold on the dashboard.

## Troubleshooting

- **Analyzer errors on TOML:** `version = 1` must be the first key; every
  `[[analyzers]]` needs a valid `name`. Validate before pushing.
- **Too many low-value issues:** narrow scope via `exclude_patterns` or disable
  specific checks in the dashboard rather than blanket suppressions.
- **Secrets analyzer false positive:** confirm no real key leaked, then add a
  scoped `// skipcq` with a comment explaining why the match is safe.

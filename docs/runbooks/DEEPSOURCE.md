# Runbook — DeepSource

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
3. After the coverage step in `validate.yml`, upload the report:

   ```bash
   curl https://deepsource.io/cli.sh | sh
   ./bin/deepsource report --analyzer test-coverage \
     --key javascript --value-file apps/web/coverage/lcov.info
   ```

   GitHub Actions does not allow `secrets` in `if:`, so surface the DSN as an
   env var first, then guard the step on that env var:

   ```yaml
   env:
     DEEPSOURCE_DSN: ${{ secrets.DEEPSOURCE_DSN }}
   # on the upload step:
   #   if: ${{ env.DEEPSOURCE_DSN != '' }}
   ```

## Autofix / transformers

The project formats with **biome**, not prettier — so **no prettier transformer**
is configured (it would fight biome). Apply DeepSource Autofix selectively from
the dashboard and re-run local `pnpm run lint` before committing.

## Correction loop

DeepSource issues surface as PR checks rather than inline threads. For each
raised issue: fix at the root or add a scoped, justified skip via a
`# skipcq: <CHECK-ID>` comment **only** when it's a genuine false positive
(documented in the PR). Push and let the analyzer re-run.

## Making it a required check

deepsource.io → repo → Settings → require the DeepSource check, then add it to
`main` branch protection. Set the failing-issue threshold on the dashboard.

## Troubleshooting

- **Analyzer errors on TOML:** `version = 1` must be the first key; every
  `[[analyzers]]` needs a valid `name`. Validate before pushing.
- **Too many low-value issues:** narrow scope via `exclude_patterns` or disable
  specific checks in the dashboard rather than blanket `skipcq`.
- **Secrets analyzer false positive:** confirm no real key leaked, then add a
  scoped `# skipcq` with a comment explaining why the match is safe.

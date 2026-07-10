# Runbook — CodeAnt AI

AI code review plus security/quality gates on PRs.

## What it does

- Reviews PRs with inline comments (bugs, security, anti-patterns) and a summary.
- Runs SAST / secret / IaC checks and can act as a required PR quality gate.

## How it's wired

CodeAnt is **dashboard-first** — there is no committed repo-level config file in
the repo. Configuration lives in the CodeAnt app:

| Piece | Location |
|-------|----------|
| Install | CodeAnt GitHub App on `qnbs/CulinaSync-de-` |
| Settings | https://app.codeant.ai → repository → settings |
| CLI config (local only) | `~/.codeant/config.json` (not committed) |

Set in the dashboard:
- **Auto-review** on PRs targeting `main`.
- **Ignore paths:** `dist/**`, `coverage/**`, `pnpm-lock.yaml`, `graphify-out/**`,
  generated locale bundles — mirror `.coderabbit.yaml`'s `path_filters`.
- **Quality gate:** enable the checks the team wants to hard-block on and add the
  CodeAnt status to `main` branch protection.

## Manual commands (PR comments)

| Command | Effect |
|---------|--------|
| `@codeant-ai review` | Trigger / re-trigger a review |
| `@codeant-ai resolve` | Resolve CodeAnt-authored threads |

(Confirm exact command syntax in the CodeAnt dashboard — the review re-trigger is
the key one for the correction loop.)

## Correction loop

Identical to the shared loop (see [README](./README.md)): fetch unresolved
threads → root-cause fix or justify → reply + resolve → push →
`@codeant-ai review` → repeat until **0 new comments** AND **0 unresolved**.
If CodeAnt enforces a **suppression ratchet** (a cap on `biome-ignore`/
eslint-disable count that gates CI), **never** add a new suppression to silence a
finding — refactor so the rule passes honestly, or the gate fails.

## Troubleshooting

- **No review:** PR likely exceeds the ~100-changed-file cap — split into stacked
  PRs (group by locale module-file to minimize i18n fan-out). Confirm the app has
  access to the repo.
- **Duplicate findings vs CodeRabbit:** expected — treat each bot's threads
  independently; a fix usually resolves both. Resolve each bot's threads with its
  own resolve command.
- **Gate blocking a legitimate change:** address the finding at the root; if
  truly a false positive, justify in-thread and (if the dashboard allows)
  add a scoped ignore rule there — not an inline code suppression.

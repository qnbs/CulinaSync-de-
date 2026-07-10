# Runbook — CodeRabbit AI

Line-by-line AI code review, PR summaries, and a chat interface on PRs.

## What it does

- Reviews every PR against `main`, posting inline comments + a high-level summary.
- Runs bundled linters/scanners (biome, actionlint, yamllint, markdownlint,
  gitleaks) and folds their output into the review.
- Answers follow-up questions and applies committable suggestions on request.

## How it's wired

| Piece | Location |
|-------|----------|
| Config | `.coderabbit.yaml` (repo root) |
| Trigger | Auto on PR open/update (`reviews.auto_review.enabled: true`, base `main`) |
| Install | CodeRabbit GitHub App on `qnbs/CulinaSync-de-` |

The config encodes the project's **hard constraints** as `path_instructions`
(Dexie-via-repositories, Gemini-via-facade, no build-time API key, Redux =
UI-only, i18n `t()` parity, `useModalA11y` for modals, no `any`/new
suppressions). This makes reviews enforce the real architecture instead of
generic advice. Keep these in sync with `CLAUDE.md` when constraints change.

## Manual commands (PR comments)

| Command | Effect |
|---------|--------|
| `@coderabbitai review` | Re-review incremental changes |
| `@coderabbitai full review` | Re-review the entire PR from scratch |
| `@coderabbitai summary` | Regenerate the PR summary |
| `@coderabbitai resolve` | Resolve all CodeRabbit-authored threads |
| `@coderabbitai pause` / `resume` | Stop/resume auto-reviews on the PR |
| `@coderabbitai configuration` | Print the effective config for the PR |

## Correction loop

1. Fetch unresolved threads (GraphQL `reviewThreads`, `isResolved: false`).
2. For each: validate against **current** code, then fix at the root (code +
   tests + i18n + docs) or reply with evidence it's a false positive.
3. Reply to the thread citing the resolving commit; resolve it.
4. Commit + push; then `@coderabbitai review` to trigger the next wave.
5. Repeat until a fresh review yields **0 new comments** AND **0 unresolved**.

Never silence a finding with a new `biome-ignore`/eslint-disable — refactor so
the rule passes honestly (the suppression-ratchet gate fails CI otherwise).

## Making it a required check

GitHub → Settings → Branches → `main` protection → require the CodeRabbit
status. Leave `request_changes_workflow: false` (advisory) unless the team wants
CodeRabbit to hard-block merges via "changes requested".

## Troubleshooting

- **No review appeared:** PR may exceed the bot's file cap (~100 changed files)
  — split into stacked PRs. Confirm the app is installed and the base is `main`.
- **Reviews too noisy/quiet:** tune `reviews.profile` (`chill` ↔ `assertive`).
- **Vendored files reviewed:** extend `reviews.path_filters` (`!` prefix to
  exclude) — lockfiles, `dist/`, `coverage/`, `graphify-out/` are already out.
- **Schema errors:** the `# yaml-language-server` header points at the live
  schema; validate edits in an editor with YAML LSP before pushing.

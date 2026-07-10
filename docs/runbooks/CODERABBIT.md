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

1. Fetch **all** findings — inline threads **and** out-of-diff findings (see the
   mandatory sweep below). Inline threads alone are not the full set.
2. For each: validate against **current** code, then fix at the root (code +
   tests + i18n + docs) or reply with evidence it's a false positive.
3. Reply to the thread citing the resolving commit; resolve it.
4. Commit + push; then `@coderabbitai review` to trigger the next wave.
5. Repeat until a fresh review yields **0 new comments** AND **0 unresolved**.

Never silence a finding with a new `biome-ignore`/eslint-disable — refactor so
the rule passes honestly (the suppression-ratchet gate fails CI otherwise).

### Mandatory: sweep out-of-diff findings, not just inline threads

CodeRabbit does **not** post every finding as a resolvable inline thread. Its
**review summary body** carries collapsed sections that the GraphQL
`reviewThreads` query never returns:

- **⚠️ Outside diff range comments** — issues on lines your diff didn't touch.
- **🧹 Nitpick comments** / **Additional comments not posted (N)** — findings
  CodeRabbit chose not to post inline.
- The **`Actionable comments posted: N`** header — the authoritative count to
  reconcile against the number of inline threads you actually addressed.

Always run BOTH queries every wave. If `Actionable comments posted: N` exceeds
the inline-thread count, the difference is in these body sections — read and
address them too.

```bash
PR=87; OWNER=qnbs; REPO=CulinaSync-de-

# (a) Inline threads (resolvable):
gh api graphql -f query='{repository(owner:"'"$OWNER"'",name:"'"$REPO"'"){pullRequest(number:'"$PR"'){reviewThreads(first:100){nodes{id isResolved path line comments(first:1){nodes{author{login} body}}}}}}}' \
  | python3 -c 'import json,sys; t=json.load(sys.stdin)["data"]["repository"]["pullRequest"]["reviewThreads"]["nodes"]; [print(x["id"],x["path"],x["line"]) for x in t if not x["isResolved"] and x["comments"]["nodes"][0]["author"]["login"]=="coderabbitai"]'

# (b) Review-body sections (outside-diff / nitpick / not-posted) — grep the bodies:
gh api graphql -f query='{repository(owner:"'"$OWNER"'",name:"'"$REPO"'"){pullRequest(number:'"$PR"'){reviews(first:50){nodes{author{login} body}}}}}' \
  | python3 -c 'import json,sys,re;
revs=json.load(sys.stdin)["data"]["repository"]["pullRequest"]["reviews"]["nodes"];
[print("--", re.search(r"actionable comments posted:\s*\d+", (r["body"] or ""), re.I).group(0) if re.search(r"actionable comments posted", (r["body"] or ""), re.I) else "review", "| sections:", [m for m in ["outside diff range","nitpick","not posted","duplicate comments"] if m in (r["body"] or "").lower()]) for r in revs if r["author"]["login"]=="coderabbitai"]'
```

Any section reported by (b) must be opened in the PR UI (or via the review
`body`) and each finding fixed or justified, exactly like an inline thread — even
though there is no thread to "resolve". Note it in the reply on the summary or a
related thread so the resolution is traceable.

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

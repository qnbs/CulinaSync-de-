# DevOps Runbooks — Code Quality & Review Automation

Operating guides for the automated quality/review tooling wired into
CulinaSync's PR and deployment workflows. Each runbook covers: what the tool
does, where its config lives, how it runs in CI/PRs, the correction loop, how to
make its gate blocking, and troubleshooting.

| Tool | Purpose | Config | Runbook |
|------|---------|--------|---------|
| **Codecov** | Coverage analytics + PR coverage annotations | `codecov.yml`, `validate.yml` | [CODECOV.md](./CODECOV.md) |
| **CodeRabbit AI** | Line-by-line AI code review + summaries | `.coderabbit.yaml` | [CODERABBIT.md](./CODERABBIT.md) |
| **CodeAnt AI** | AI review + security/quality gates | Dashboard (GitHub App) | [CODEANT.md](./CODEANT.md) |
| **DeepSource** | Static analysis + secret detection | `.deepsource.toml` | [DEEPSOURCE.md](./DEEPSOURCE.md) |
| **Branch protection** | `main` merge gate (`mainrules` ruleset) | GitHub ruleset | [BRANCH-PROTECTION.md](./BRANCH-PROTECTION.md) |

## The PR review correction loop (all bots)

Standing policy (see `CLAUDE.md`): on every open PR, address **all** inline
review comments proactively. For each finding, validate against the *current*
code (anchors may be stale), then either implement the real root-cause fix
(code + tests + i18n + docs) or reply with evidence why it's a false positive.
Reply to each thread citing the resolving commit, resolve it, leave **0
unresolved**, then commit + push.

**Iron rule — loop until quiescent:** after each push, re-trigger the bot
(e.g. `@coderabbitai review`, `@codeant-ai review`) — a fresh review routinely
raises *new* findings caused by the fixes themselves (a "wave"). Repeat until a
fresh review yields **0 new comments** AND **0 unresolved threads**. Every wave,
also sweep **out-of-diff findings** in the review *body* (Outside-diff-range /
Nitpick / "Additional comments not posted") — these are not inline threads and
are missed if you only query `reviewThreads`. See
[CODERABBIT.md → Mandatory sweep](./CODERABBIT.md#mandatory-sweep-out-of-diff-findings-not-just-inline-threads). Never add a
new suppression to silence a finding — refactor so the rule passes honestly.

**Keep PRs under ~100 changed files** — most bots skip inline comments on larger
PRs. Check `git diff --name-only <base>...HEAD | wc -l` before pushing; split
into stacked PRs if needed.

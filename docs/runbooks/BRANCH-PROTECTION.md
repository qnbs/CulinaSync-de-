# Runbook — Branch Protection (`mainrules` ruleset)

Governs the `main` branch via a GitHub **repository ruleset** named `mainrules`
(target: default branch). This is the merge gate for everything that reaches
production (GitHub Pages deploy triggers on push to `main`).

## Design goals

1. Nothing reaches `main` except through a reviewed, green PR.
2. "Reviewed" = CodeRabbit review present **and** all threads resolved.
3. "Green" = the real CI gate passed, not just the review bot.
4. History stays linear and signed; the branch can't be force-pushed or deleted.
5. The repo admin retains an escape hatch (bypass) for emergencies.

## Rules (canonical)

| Rule | Setting | Why |
|------|---------|-----|
| `deletion` | block | `main` can't be deleted |
| `non_fast_forward` | block | no force-push / history rewrite |
| `required_linear_history` | on | squash/rebase only — clean history |
| `required_signatures` | on | every commit on `main` must be signed |
| `code_quality` | severity: warnings | GitHub code-quality gate |
| `code_scanning` | CodeQL, high_or_higher / errors_and_warnings | block on new high+ alerts |
| `pull_request` | PR required; approvals **0**; dismiss-stale on push; **thread resolution required**; merge methods: squash, rebase | forces the reviewed-PR flow and ties the CodeRabbit correction loop to merge |
| `required_status_checks` | strict (up-to-date) + contexts below | the real green-CI gate |
| bypass | Repository admin (role) — always | emergency escape hatch |

### Required status-check contexts

| Context | Source | Always runs on PRs? |
|---------|--------|---------------------|
| `CodeRabbit / Review` | CodeRabbit app | yes |
| `validate / validate` | CI workflow (lint, tsgo, tests, coverage, build, audit, bundle-budget) | yes |
| `i18n-check` | CI workflow (locale key/baseline/changed parity) | yes |
| `GitGuardian Security Checks` | GitGuardian app | yes |
| `Socket Security: Pull Request Alerts` | Socket app | yes |

CodeQL is enforced by the `code_scanning` rule (a stronger mechanism than a
status check), so `Analyze (javascript)` is intentionally **not** duplicated as a
required status check.

### Deliberately NOT required (would block unrelated PRs)

- **`smoke` (E2E Playwright)** — the `E2E Smoke` workflow is **path-filtered**
  (`apps/web/**`, `package.json`, `pnpm-lock.yaml`, `e2e-smoke.yml`). A required
  check that doesn't run stays *pending forever* and blocks the merge, so a
  docs-only PR would be stuck. It still runs (and must pass) on any code PR.
  **To require it safely** add an always-running gate job (shim) that reports one
  stable check name regardless of paths — see *Requiring a path-filtered check*
  below.
- **`DeepSource: JavaScript`** — only reports when JS changes; same pending-forever
  risk. Tracked in the DeepSource dashboard instead.

## Operating notes

### Merging with `required_signatures` on

**Policy:** every commit that lands on `main` must carry a verified signature.
Each contributor configures signing once and registers their own key as a
**Signing Key** on GitHub (Settings → SSH and GPG keys → **New signing key**):

```bash
git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/<your_signing_key>.pub
```

With this in place every commit is signed and GitHub marks it **Verified**
(`verification.reason=valid`), so the rule is satisfied by the allowed merge
methods — **squash or rebase** (`required_linear_history` disallows merge commits).

Verify **every commit the branch introduces** before merging:

```bash
git log --format='%h %G?' origin/main..HEAD   # expect G (good) on every row
for s in $(git rev-list origin/main..HEAD); do \
  gh api repos/qnbs/CulinaSync-de-/commits/$s --jq '.sha[0:7]+" "+.commit.verification.reason'; done
```

If any commit is unsigned (`%G?` = `N`, or GitHub shows *Unverified*): register
the signing key as above, re-sign the range (`git rebase --exec 'git commit
--amend --no-edit -S' origin/main`), or as a fallback **Squash and merge** in the
UI (GitHub signs the squash commit with
its own web-flow key), or use the admin bypass.

### Solo-dev approvals

`required_approving_review_count` is **0** on purpose: GitHub forbids approving
your own PR, so any value ≥1 would force a bypass on every merge. CodeRabbit
provides the automated review; the resolution gate does the enforcing.

### Requiring a path-filtered check (e.g. `smoke`)

Add a job that always runs on PRs and aggregates the real result, then require
that job's context instead of `smoke`:

```yaml
# in ci.yml — always runs on PRs; `smoke` must be a job in THIS workflow
# (e.g. reuse e2e-smoke.yml via `uses:`) so `needs` can read its result.
e2e-gate:
  needs: [smoke]
  if: ${{ always() && github.event_name == 'pull_request' }}
  runs-on: ubuntu-latest
  steps:
    - run: |
        # pass when smoke succeeded OR was skipped (not applicable to this PR);
        # fail only on a real failure
        [ "${{ needs.smoke.result }}" = "failure" ] && exit 1 || exit 0
```

Then require `e2e-gate` in the ruleset in place of `smoke`.

## Applying / updating the ruleset

Ruleset **writes require repository-administration permission**. The default
`gh` OAuth token (scopes `repo, workflow, …`) can **read** rulesets but a write
returns `404`. Use one of:

- **GitHub UI:** Settings → Rules → Rulesets → `mainrules` → edit.
- **Admin token via API** (fine-grained PAT with *Administration: Read and write*,
  or a classic PAT with `repo` created outside the restricted OAuth app):

  ```bash
  # body = the desired ruleset (see canonical rules above)
  gh api -X PATCH repos/qnbs/CulinaSync-de-/rulesets/18769260 --input ruleset.json
  ```

The canonical `rules` array is version-controlled implicitly by this runbook;
keep it in sync when the ruleset changes.

## Emergency procedures

- **Unblock a stuck merge:** the admin bypass (role, `always`) lets the owner
  merge/push directly. Prefer fixing the failing gate over bypassing.
- **Disable temporarily:** Settings → Rules → `mainrules` → set enforcement to
  `Disabled` (or `Evaluate` to log-without-enforcing). Re-enable afterwards.
- **A required check disappears (app uninstalled/renamed):** every PR will block
  on the missing context. Remove or rename the context in the ruleset, or
  reinstall the app.

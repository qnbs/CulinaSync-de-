# Branch cleanup policy

Stale agent and Dependabot branches accumulate over time. This doc defines safe cleanup.

## Safe to delete (after merge)

- `cursor/*` branches whose PR is **merged** and CI is green on `main`
- Dependabot branches superseded by a merged PR or closed without merge after 30 days

## Keep

- Open PR branches
- Release tags (`v*`)
- `main`

## Manual cleanup

```bash
# List remote cursor branches
git branch -r | grep 'origin/cursor/'

# Delete merged remote branch (example)
git push origin --delete cursor/old-feature-11b4
```

## Automation

GitHub **auto-delete head branches** should be enabled in repository settings for merged PRs.

Issue **#140** tracks periodic review of remaining stale branches.

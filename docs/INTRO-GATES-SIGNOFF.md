# Intro Gates v1.0 — product sign-off checklist

**Issue:** #127 · **Gate:** `INTRO_GATES_ENABLED=true` since 2026-07-16

## Product criteria

- [ ] Onboarding dismissible: Escape, backdrop, X, Skip
- [ ] Demo path: „Weiter mit Demo“ / `?demo=1` works on GitHub Pages
- [ ] What's New shown only after first-run completion
- [ ] DE/EN strings for all intro surfaces
- [ ] Vitest: onboarding + intro-gates suites green

## QA smoke (manual)

1. Fresh profile → onboarding appears → Skip → main nav usable
2. `?demo=1` → demo banner, sample data loads
3. Settings → reset onboarding → gates reappear once

## Sign-off

| Role | Name | Date | OK |
|------|------|------|-----|
| Product owner | | | |
| Engineering | | | |

When all boxes are checked, close **#127** and note sign-off date in `CHANGELOG.md`.

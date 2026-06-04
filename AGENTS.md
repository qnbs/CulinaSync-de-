# AGENTS.md

Guidance for AI agents working in this repository. See also `CLAUDE.md`, `.github/copilot-instructions.md`, and `docs/DEVELOPMENT.md`.

## Cursor Cloud specific instructions

### Node.js and pnpm

- **Required:** Node **24** (`.node-version`, `package.json` engines). The Cloud VM may ship Node 22 on `/exec-daemon/node`, which overrides `nvm` unless you fix `PATH`.
- Before any `pnpm` command in a new shell:

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 24
export PATH="$NVM_DIR/versions/node/v24.16.0/bin:$PATH"   # adjust minor version if nvm installs a newer 24.x
corepack enable
```

- Install dependencies from repo root: `pnpm install` (see update script on VM startup).

### Runnable product

| What | Command | URL / notes |
|------|---------|-------------|
| Dev server (default) | `pnpm run dev` (Turbo → `apps/web` Vite) | **http://localhost:5173/** — works in Desktop/browser |
| Dev server (Playwright / `127.0.0.1`) | `pnpm --filter web exec vite --host 127.0.0.1 --port 5173` | Needed because default Vite bind may not answer on `127.0.0.1` in this environment |
| Production-like preview | `pnpm run build` then `pnpm run preview` | CI Playwright uses **4173** with `--host 127.0.0.1` |
| Unit/integration tests | `pnpm run test` | Vitest + jsdom; no server required |
| Browser E2E | `CI=true pnpm run test:e2e` | Requires `pnpm exec playwright install chromium` once; browser CDN download can fail on restricted networks |

There is **no backend**, **no Docker Compose**, and **no database daemon** — IndexedDB (Dexie) runs inside the browser.

### Long-running dev server

Use a **tmux** session (e.g. `culinasync-dev`) so the Vite process survives agent turns:

```bash
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s culinasync-dev -c /workspace -- bash -l
# send-keys: nvm/path setup + pnpm run dev
```

### Validation shortcuts

Standard commands (full list in `CLAUDE.md` / README):

- `pnpm run lint`
- `pnpm run type-check` (tsgo; Turbo builds `@domain/ai-core` first)
- `pnpm run test` (**404** Vitest tests in **99** files)
- `pnpm run test:scripts` (5 node --test cases for deploy-verify)
- `pnpm run i18n:check` (de/en parity + baseline 0)
- `pnpm run build`
- `pnpm run check:all` — lint + type-check + test + test:scripts + i18n + build + bundle budget + audit (heavy; use before push)

### Quality, CI loop & PR review (mandatory)

- **CI correction loop:** After every push, run `gh run list` and fix until green — never end a task with red CI. See `.cursor/rules/302-ci-correction-loop.mdc`.
- **Lint:** `--max-warnings 0`; `@typescript-eslint/no-explicit-any` and `react-hooks/exhaustive-deps` are **errors**.
- **PRs:** Address **all** inline comments from CodeAnt, Copilot, Bugbot, and humans **immediately** before merge — `300-pr-review-automation.mdc`, `301-strict-quality-gates.mdc`.
- **CodeQL:** Open alerts on `main` or in the PR **must be fixed in the same session** (High/Critical first). After push, confirm the CodeQL workflow is green (`gh run list`, Security tab).
- **No regressions:** Never merge with failing lint, type-check, tests, i18n baseline, or open CodeQL High/Critical.

### Manual “hello world” (core domain)

1. Open the dev URL, dismiss onboarding with **Überspringen** if shown.
2. **Vorratskammer** → **Artikel hinzufügen** → name an item → **Speichern** → confirm it appears in the list (local-first Dexie write).

Optional: Gemini flows need a user API key in Settings (`apiKeyService`); not required for pantry/recipes/meal plan/shopping list.

### Gotchas discovered in Cloud Agent VMs

- **`127.0.0.1` vs `localhost`:** Default `pnpm run dev` may only respond on `localhost`; Playwright `baseURL` uses `127.0.0.1` — use `vite --host 127.0.0.1` or test via Desktop on `localhost`.
- **Playwright browsers:** First E2E run needs `pnpm exec playwright install chromium`; downloads can fail with `ECONNRESET` — rely on Vitest + manual Desktop verification in that case.
- **`@domain/ai-core`:** Turbo builds `packages/ai-core` before web type-check/test; a clean clone needs `pnpm install` then at least one `pnpm run build` or any turbo task that triggers `^build`.
- **Husky:** `pnpm install` runs `prepare` → husky; pre-commit runs `lint-staged` (see `.husky/pre-commit`).

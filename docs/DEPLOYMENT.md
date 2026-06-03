# Deployment und Betrieb

## Uebersicht

Das Repository verwendet GitHub Actions fuer CI, Deploy und CodeQL.

- CI: `.github/workflows/ci.yml`
- Deploy: `.github/workflows/deploy.yml`
- Deploy Health: `.github/workflows/deploy-health.yml` (Live-URL-Smoke, optional Lighthouse)
- CodeQL: `.github/workflows/codeql.yml`
- **Vollständiges Pages/Vercel-Handbuch:** [DEPLOY-PAGES-VERCEL.md](./DEPLOY-PAGES-VERCEL.md)
- **Vercel (Preview/Production):** Projekt `culina-sync-de-web`; Repo-Config `apps/web/vercel.json` (Dashboard-Root `apps/web`, Output `dist`)

## Build- und Deploy-Fluss

### CI

- Checkout
- pnpm 10 einrichten
- **Node.js 24** einrichten (`actions/setup-node`, siehe `validate.yml` / `ci.yml`)
- `pnpm install --frozen-lockfile`
- Lint
- **`pnpm run type-check`** (**tsgo**, wie lokal in `check:all`)
- **`pnpm run test:coverage`** (Vitest inkl. v8-Coverage)
- Upload Artefakt **`coverage-lcov`** (`actions/upload-artifact@v4`, Ordner `apps/web/coverage/`, Retention 14 Tage)
- Build (`turbo run build` → `apps/web/dist`)
- **`pnpm run check:bundle-budget`** (jedes Validate, nicht nur Deploy)
- **`pnpm audit --audit-level=high`** (Supply-Chain-Gate)
- Playwright-Smoke gegen `vite preview` (`pnpm run test:e2e`)
- PR-bezogen zusaetzlich i18n-Changed-Lines-Check (`ci.yml` Job `i18n-check`)

### Deploy

- identischer pnpm-/Node-Setup wie Validate (wiederverwendbarer Workflow `validate.yml` mit `upload-pages-artifact: true`)
- Lint, **Typecheck**, Tests **mit Coverage**, Build, Bundle-Budget
- Upload des **`apps/web/dist`**-Artifacts fuer Pages
- **`node scripts/verify-pages-artifact.mjs`** vor Upload (index.html, 404.html aus `public/`)
- Optional lokal: **Lighthouse CI** mit `lighthouserc.json` (`staticDistDir: ./apps/web/dist`) nach `pnpm run build`
- Deployment nach GitHub Pages
- Post-Deploy: **`node scripts/verify-live-deployments.mjs`** (Pages + Vercel HTTP 200)

### CodeQL

- Analyse fuer JavaScript und TypeScript
- Init, Autobuild und Analyse ueber aktuelle `github/codeql-action@v4`

## Pages-spezifische Fakten

- `apps/web/vite.config.ts` setzt `base` in Actions auf `/CulinaSync-de-/`.
- Das Web-App-Manifest wird zur Build-Zeit durch `vite-plugin-pwa` aus der App-Vite-Konfiguration erzeugt; der Service Worker nutzt **`injectManifest`** mit `apps/web/src/sw.ts` (Navigation **Network-first**, schwere Assets zur Laufzeit **Cache-first** wie zuvor über Runtime-Routes).
- Es gibt bewusst kein zweites statisches `public/manifest.json` mehr.
- Die Locale-Ressourcen werden zur Build-Zeit aus `src/locales/{de,en}/index.ts` aggregiert; es gibt keine separaten Runtime-Fetches fuer Sprachdateien.
- Die Live-Demo liegt unter `https://qnbs.github.io/CulinaSync-de-/`.
- SPA-Verhalten benoetigt weiterhin passende 404-Weiterleitung und korrekte Asset-Pfade.

## Tauri Desktop und Content-Security-Policy

- Die **Web/PWA-Variante** setzt eine konservative CSP im Meta-Tag in `index.html` (GitHub Pages, lokaler `vite preview`).
- Für **Tauri** (`src-tauri/tauri.conf.json`) ist unter `tauri.security.csp` eine CSP-Zeichenkette hinterlegt, die der Web-Politik entspricht (`default-src 'self'`, `connect-src` für HTTPS APIs wie Gemini, `img-src` für `data:`/`blob:`/`https:`, `style-src` mit `'unsafe-inline'` für Tailwind).
- Bei Bedarf kann die Policy für striktere Builds verschärft werden (z. B. nach Audit der erlaubten Connect-Ziele).
- Milestone 4.3 (Roadmap): Vorbereitung für natives Hosting; vollständige Header-CSP auf dem jeweiligen Host bleibt deploymentspezifisch.

## Bekannte GitHub-Actions-Warnungen

Trotz erfolgreicher Pipeline und gesetztem `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` melden einige GitHub-verwaltete Actions derzeit weiterhin Node-20-Depracation-Warnungen. Das betrifft zuletzt:

- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v4`
- `actions/deploy-pages@v4`

Diese Warnungen stammen aktuell von Upstream-Runtimes der GitHub-verwalteten Actions und sind nicht durch Projektcode allein entfernbar.

## Aktueller Arbeitsstand (Doku)

- Ausführlicher Snapshot: [STATUS-2026-05-02.md](./STATUS-2026-05-02.md); davor [STATUS-2026-05-01.md](./STATUS-2026-05-01.md); ältere: [STATUS-2026-04-23.md](./STATUS-2026-04-23.md), [STATUS-2026-04-22.md](./STATUS-2026-04-22.md).
- Vor einem release-nahen Push auf `main` empfohlen: **`pnpm run check:all`** oder mindestens `pnpm run lint`, `pnpm run test`, `pnpm run build`; Bundle-Budget ist in CI ohnehin Teil von Validate.

## Vercel

Siehe **[DEPLOY-PAGES-VERCEL.md](./DEPLOY-PAGES-VERCEL.md)** für Dashboard-Matrix, Rewrites und Troubleshooting.

- **Root:** `apps/web` im Dashboard; **`apps/web/vercel.json`** im Repo
- **Install:** `cd ../.. && pnpm install --frozen-lockfile`
- **Build:** `pnpm run build` → `apps/web/dist`
- **Output:** `dist` (relativ zu `apps/web`); Vite `base` **`/`** (nicht `/CulinaSync-de-/`)
- **Node:** 24.x
- **Verify:** `pnpm run verify:deploy`

## Operative Checks nach einem produktionsrelevanten Fix

1. GitHub-Run fuer CI pruefen.
2. GitHub-Run fuer Deploy pruefen.
3. GitHub-Run fuer CodeQL pruefen.
4. **Vercel:** Production-Deployment auf `main` (Inspector → Build-Logs).
5. Live-Demo frisch laden, idealerweise mit Cache-Busting-Query.
6. Browserfehler und PWA-/Asset-Verhalten pruefen.
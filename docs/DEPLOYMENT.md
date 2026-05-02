# Deployment und Betrieb

## Uebersicht

Das Repository verwendet GitHub Actions fuer CI, Deploy und CodeQL.

- CI: `.github/workflows/ci.yml`
- Deploy: `.github/workflows/deploy.yml`
- CodeQL: `.github/workflows/codeql.yml`

## Build- und Deploy-Fluss

### CI

- Checkout
- pnpm 10 einrichten
- **Node.js 24** einrichten (`actions/setup-node`, siehe `validate.yml` / `ci.yml`)
- `pnpm install --frozen-lockfile`
- Lint, Tests, Build
- PR-bezogen zusaetzlich i18n-Changed-Lines-Check

### Deploy

- identischer pnpm-/Node-Setup
- Lint, Tests, Build
- Bundle-Budget-Check
- Upload des `dist/`-Artifacts
- Deployment nach GitHub Pages

### CodeQL

- Analyse fuer JavaScript und TypeScript
- Init, Autobuild und Analyse ueber aktuelle `github/codeql-action@v4`

## Pages-spezifische Fakten

- `vite.config.ts` setzt `base` in Actions auf `/CulinaSync-de-/`.
- Das Web-App-Manifest wird zur Build-Zeit durch `vite-plugin-pwa` aus `vite.config.ts` erzeugt; es gibt bewusst kein zweites statisches `public/manifest.json` mehr.
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
- Vor einem release-nahen Push auf `main` bleiben die Gates `pnpm run lint`, `pnpm run test`, `pnpm run build` und bei Bedarf `pnpm run check:bundle-budget` massgeblich.

## Operative Checks nach einem produktionsrelevanten Fix

1. GitHub-Run fuer CI pruefen.
2. GitHub-Run fuer Deploy pruefen.
3. GitHub-Run fuer CodeQL pruefen.
4. Live-Demo frisch laden, idealerweise mit Cache-Busting-Query.
5. Browserfehler und PWA-/Asset-Verhalten pruefen.
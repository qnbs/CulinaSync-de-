# GitHub Pages & Vercel — Deployment-Handbuch

> **Stand:** 2026-06-03 · Monorepo `apps/web` · Version siehe `apps/web/package.json`

---

## Übersicht

| Kanal | URL | `base` (Vite) | Trigger |
|-------|-----|---------------|---------|
| **GitHub Pages** | https://qnbs.github.io/CulinaSync-de-/ | `/CulinaSync-de-/` wenn `GITHUB_ACTIONS=true` | Push `main` → `deploy.yml` |
| **Vercel Production** | https://culina-sync-de-web-qnbs-projects.vercel.app | `/` | Git-Integration `main` |
| **Vercel Preview** | pro PR-Branch | `/` | PR gegen `main` |

Beide Hosts liefern dieselbe PWA aus `apps/web/dist`, unterscheiden sich nur im **Asset-Basis-Pfad**.

---

## GitHub Pages

### Voraussetzungen (einmalig)

1. Repository **Settings → Pages → Build and deployment → Source:** **GitHub Actions**
2. Branch `main` mit grünem Workflow **Deploy to GitHub Pages**

### Pipeline

```mermaid
flowchart LR
  push[Push main] --> validate[validate.yml upload-pages-artifact]
  validate --> artifact[apps/web/dist]
  artifact --> deploy[deploy-pages@v5]
  deploy --> pages[github-pages environment]
  pages --> checkout[checkout@v6]
  checkout --> smoke[verify-live-deployments.mjs]
```

- **Build:** `pnpm run build` mit `GITHUB_ACTIONS=true` → `vite.config.ts` setzt `base: '/CulinaSync-de-/'`
- **Artefakt-Check:** `node scripts/verify-pages-artifact.mjs` (index.html, 404.html, …)
- **SPA 404:** `apps/web/public/404.html` wird von Vite nach `dist/404.html` kopiert (Deep-Link-Redirect) — **nicht** durch `index.html` überschreiben
- **E2E:** separater Workflow `e2e-smoke.yml` (Playwright-Container, gleicher `base`-Pfad)

### Demo-Links (R-011)

| URL | Verhalten |
|-----|-----------|
| `…/CulinaSync-de-/?demo=1` | Demo-Vorratsdaten laden, Onboarding übersprungen |
| `…/CulinaSync-de-/?try=1` | Leer starten (lokal), Onboarding übersprungen |

Auf `qnbs.github.io` erscheint zusätzlich ein einmaliger **Demo-Hinweis** (Banner).

### Lokaler Pages-Test

```bash
cd /workspace
GITHUB_ACTIONS=true pnpm run build
node scripts/verify-pages-artifact.mjs apps/web/dist
pnpm --filter web exec vite preview --host 127.0.0.1 --port 4173
# Browser: http://127.0.0.1:4173/CulinaSync-de-/
```

### Typische Fehler

| Symptom | Ursache | Fix |
|---------|---------|-----|
| Deploy-Smoke: Vercel 401 | Deployment Protection aktiv | Erwartet: Warnung `SKIP (geschützt)`; Pages-Check bleibt hart |
| Weiße Seite, 404 auf Assets | Falscher `base` / Preview ohne Subpath | `GITHUB_ACTIONS=true` beim Build; Preview-URL mit `/CulinaSync-de-/` |
| Deep-Link 404 | `dist/404.html` fehlt | `public/404.html` prüfen; `verify-pages-artifact` |
| Alter Cache | CDN/Browser | Hard-Reload; `?v=` Query |

---

## Vercel

### Dashboard (Referenz)

| Einstellung | Wert |
|-------------|------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Vite (oder Other + `vercel.json`) |
| **Build Command** | `cd ../.. && pnpm run build --filter=web` (siehe `apps/web/vercel.json`) |
| **Output Directory** | `dist` |
| **Install Command** | `cd ../.. && pnpm install --frozen-lockfile` |
| **Node.js** | 24.x |

Repo-Datei **`apps/web/vercel.json`** dokumentiert Install/Build/Output und Security-Header — auch wenn das Dashboard bereits konfiguriert ist. SPA-Fallback über Vite/`index.html` (keine zusätzlichen Vercel-Rewrites nötig bei statischem Export).

### Unterschied zu Pages

- **`base`:** lokal `/` — Assets unter `/assets/…`, kein Repo-Subpath
- **Kein** `culinaSync-de-` Präfix in URLs
- Production-Deploy bei jedem Push auf `main` (parallel zu Pages)

### Typische Fehler

| Symptom | Ursache | Fix |
|---------|---------|-----|
| Build: `ERR_PNPM_LOCKFILE_*` | Lockfile | `pnpm install --frozen-lockfile` lokal, commit `pnpm-lock.yaml` |
| 404 auf allen Routen | Falsches Output | Output `dist` unter `apps/web`, nicht Repo-Root |
| Leere Seite | TS/Import-Fehler | Vercel Build-Logs; lokal `pnpm run build` |

---

## Gemeinsame Qualitäts-Gates (vor Release)

```bash
pnpm run lint
pnpm run type-check
pnpm run test:coverage
GITHUB_ACTIONS=true pnpm run build
pnpm run check:bundle-budget
node scripts/verify-pages-artifact.mjs apps/web/dist
pnpm run verify:deploy          # Live-URLs (Netzwerk)
pnpm run test:e2e               # nach Build mit GITHUB_ACTIONS=true
```

Optional: `npx @lhci/cli autorun` mit `lighthouserc.json` gegen lokales `dist` oder Live-URL.

---

## Workflows (Referenz)

| Workflow | Zweck |
|----------|--------|
| `validate.yml` | Lint, tsgo, Coverage, Build, Audit, optional E2E |
| `deploy.yml` | Pages-Build + Deploy + Live-Smoke |
| `e2e-smoke.yml` | Playwright auf `main`/PR (`apps/web/**`) |
| `lighthouse-ci.yml` | PR: Lighthouse gegen gebautes `dist` (Pages-Basis `/CulinaSync-de-/`) |
| `deploy-health.yml` | Täglich/manuell: Live-URL-Checks |
| `ci.yml` | PR: validate ohne E2E; i18n-check |

---

## Nach jedem Production-Push

1. **Actions:** `Deploy to GitHub Pages` grün
2. **Actions:** `E2E Smoke` grün (bei `apps/web`-Änderungen)
3. **Vercel:** Production-Deployment **Ready**
4. **Manuell:** `pnpm run verify:deploy`
5. **Browser:** Pages + Vercel — Onboarding, PWA, Offline-Banner

---

## Siehe auch

- [DEPLOYMENT.md](./DEPLOYMENT.md) — CI/CodeQL/Tauri
- [PWA.md](./PWA.md) — Service Worker, Manifest
- [TESTING.md](./TESTING.md) — Playwright v1.60.0
- [AUDIT-vNEXT-2026-06-03.md](./AUDIT-vNEXT-2026-06-03.md) — R-009 Lighthouse CI

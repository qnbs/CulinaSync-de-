# Entwicklung

## Voraussetzungen

- Node.js 22+
- pnpm 10+

## Installation

```bash
pnpm install
```

Repo-spezifisch sind pnpm-Warnungen fuer bestimmte Peer- und Deprecated-Transitiven bewusst ueber `package.json -> pnpm` geregelt. Ein sauberer Install-Lauf sollte unter den verifizierten Versionen ohne Warnungen durchlaufen.

## Lokaler Entwicklungsfluss

```bash
pnpm run dev
```

Weitere zentrale Befehle:

```bash
pnpm run type-check      # Schneller Typecheck via tsgo (TypeScript 7.0 Beta, Go-Compiler)
pnpm run lint
pnpm run test
pnpm run build           # tsgo && vite build
pnpm run test:coverage
pnpm run analyze:bundle
pnpm run check:bundle-budget
pnpm run preview
```

## TypeScript-Binaries

Das Repo nutzt zwei TypeScript-Binaries nebeneinander:

| Binary | Paket | Zweck |
|---|---|---|
| `tsgo` | `@typescript/native-preview` | Schneller Build/Typecheck (Go-Compiler, bis zu 10x schneller) |
| `tsc` | `typescript` | Tooling-Layer (ESLint, Vitest, Storybook konsumieren die TS-API) |

Fuer den taeglichen Workflow gilt:
- `pnpm run type-check` oder `pnpm exec tsgo` fuer schnelle Typechecks.
- `pnpm run build` ruft `tsgo && vite build` auf.
- `tsc` wird automatisch von ESLint und Vitest ueber die stabile `typescript`-Version genutzt — keine manuelle Anpassung noetig.

## Wichtige Konventionen

- Redux fuer UI-/Session-State, Dexie fuer Domaindaten.
- Keine direkten Tabellenwrites aus Komponenten.
- API-Keys nie im Build oder in `localStorage`.
- Deutsche und englische Lokalisierung synchron halten.
- Schwere Bibliotheken wenn moeglich dynamisch importieren.

## i18n- und Modal-Konventionen

- Sprachtexte liegen nicht mehr in einzelnen grossen `translation.json`-Dateien, sondern je Sprache in `core.json`, `settings.json` und `features.json`.
- Neue Keys immer parallel in `src/locales/de/` und `src/locales/en/` pflegen.
- Irreversible Aktionen nicht mit `window.confirm()` absichern.
- Stattdessen eigene Modal-Komponenten mit `useModalA11y` verwenden und die Aktion ueber expliziten Pending-State im Hook oder Container steuern.

## Arbeiten an Settings, Export und Persistenz

- Freie Objektpfad-Updates vermeiden; stattdessen erlaubte Felder explizit behandeln.
- Downloads nur ueber sichere Browser-Sinks mit bereinigten Dateinamen und kontrollierten MIME-Typen.
- Redux Persist nicht wieder auf implizite Storage-Interop zurueckstellen.

## Arbeiten an GitHub Pages

- `vite.config.ts` setzt `base` in GitHub Actions automatisch auf den Repo-Unterpfad.
- Pages-spezifische Fehler sind oft Base-Path-, Cache- oder Service-Worker-Probleme.
- Vor dem Merge fuer Deploy-relevante Aenderungen nach Moeglichkeit `pnpm run build` und `pnpm run check:bundle-budget` ausfuehren.

## Empfohlene Validierungsreihenfolge

1. Diagnostics fuer die geaenderten Dateien pruefen.
2. Bei TS-Slices `pnpm run type-check` (`tsgo`) oder `pnpm exec tsgo` ausfuehren.
3. Bei Codeaenderungen einen fokussierten ESLint- oder Testlauf fuer den betroffenen Slice ausfuehren.
4. Erst danach den groesseren Integrationslauf mit `pnpm run lint`, `pnpm run test` oder `pnpm run build` starten.

Stand 2026-04-22: Die Accessibility-/i18n-Nacharbeiten wurden bis zu gezielten Diagnostics, fokussierten ESLint-Laeufen und einem erfolgreichen `pnpm exec tsc --noEmit` validiert. Ein kompletter Lint-/Test-/Build-Gesamtlauf fuer den gesamten unstaged Arbeitsstand steht weiterhin als Abschluss-Check aus.

## Commit-Konventionen (Conventional Commits)

Dieses Repo erzwingt [Conventional Commits](https://www.conventionalcommits.org/) via `commitlint`.
Jede Commit-Message muss dem Format folgen:

```
<type>(<scope>): <Beschreibung>
```

Erlaubte Typen: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Beispiele:
```bash
feat(pantry): add expiry warning filter
fix(gemini): handle empty API key response
docs: update DEVELOPMENT.md with commit conventions
chore(deps): upgrade typescript to 6.0.3
ci: extract reusable validate workflow
```

## Pre-Commit-Gates (Husky + lint-staged)

Beim Commit laufen automatisch:
1. **lint-staged:** ESLint auf alle staged `*.ts`- und `*.tsx`-Dateien (schnell, nur staged)
2. **commitlint:** Validiert die Commit-Message gegen Conventional Commits

Falls ein Gate fehlschlägt, wird der Commit blockiert. Fehler beheben und erneut committen.

> **Hinweis:** `pnpm run type-check` (`tsgo`) laeuft **nicht** im pre-commit-Hook, weil `tsgo` immer den gesamten Projektgraph prüft und fuer staged-only-Checks zu langsam wäre. `tsgo` laeuft weiter in CI und beim expliziten `pnpm run build`.

## Doku-Pflege

- Nennenswerte technische Aenderungen in `CHANGELOG.md` eintragen.
- Root-Dokumente fuer Maintainer-/Community-Themen, `docs/` fuer Fach- und Betriebswissen nutzen.
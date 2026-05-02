# Testing

## Test-Stack

- Vitest
- Testing Library
- MSW
- jsdom

## Relevante Testorte

- `src/components/**/__tests__/` (u. a. `cook-mode/__tests__/cookModeReducer.test.ts`, `meal-planner/__tests__/mealPlannerConstants.test.ts`)
- `src/services/__tests__/` (u. a. `voiceCommands.test.ts`, `dataRepository.test.ts`, `utilsCategories.test.ts`, `settingsService.test.ts` inkl. Legacy-Migrations-Erwartung, `geminiService.test.ts` — Zod-/Struktur-Faelle, `exportService`, `dbMigrations`)
- `src/store/__tests__/`
- `src/test/`

## Befehle

```bash
pnpm run test
pnpm run test:coverage
```

Ohne globales pnpm (z. B. Windows): `npm run test` / `npx pnpm@10 run test`.

## Erwartete Mindestvalidierung

Fuer normale Codeaenderungen:

```bash
pnpm run lint
pnpm run test
pnpm run build
```

Zusaetzlich fuer deploy- oder bundle-relevante Aenderungen:

```bash
pnpm run check:bundle-budget
```

## Empfohlener Ablauf fuer kleinere Slices

- Erst Diagnostics fuer die geaenderten Dateien pruefen.
- Dann einen moeglichst kleinen, slice-spezifischen Lint-, Test- oder TypeScript-Check ausfuehren.
- Erst danach den groesseren Integrationslauf verwenden.
- Fuer reine Doku-Aenderungen ist ein Diff-Review ausreichend, solange keine generierten Artefakte oder Skripte betroffen sind.

## Was Tests abdecken sollten

- Fachlogik in Services und Repositories
- Kritische UI-Flows bei neuen Oberflaechen
- Fehlermapping und Guard-Logik
- Persistenznahe Verhaltensweisen, wenn sich deren Contract aendert

## Besonders sensible Bereiche

- KI-Fehlerfaelle und Fallbacks
- Exportpfade und Dateierzeugung
- Settings-Mutationen
- Voice- und Navigationstrigger
- Datenbanknahe Cross-Feature-Operationen

## Aktueller Validierungsstand 2026-05-02

- Service- und Reducer-Tests wie oben; **Gemini-Integration** prueft u. a. gueltige JSON-Struktur (Zod); bei Typveraenderungen der KI-Antworten Tests und Schemas in `geminiService.ts` anpassen.
- Coverage-Ziel ≥70 % laut [ROADMAP.md](../ROADMAP.md) Milestone 5 weiterhin offen.
- Aktueller Snapshot: [STATUS-2026-05-02.md](./STATUS-2026-05-02.md); Vorgaenger: [STATUS-2026-05-01.md](./STATUS-2026-05-01.md).
- `pnpm run lint` mit `--max-warnings 0`; `react-hooks/exhaustive-deps` ist bewusst **off** — bei lokaler Aktivierung auf `warn` alle Warnungen abbauen, bevor CI verschärft wird.
- Vor Release weiterhin vollstaendig: `pnpm run lint`, `pnpm run test`, `pnpm run build`, bei Bundle-Aenderungen `pnpm run check:bundle-budget`.

### Hinweis 2026-04-22 (historisch)

- Accessibility- und i18n-Slices wurden mit gezielten Diagnostics und ESLint geprueft; Typcheck damals ueber `tsgo` / `tsc`.
# Testing

## Test-Stack

- Vitest
- Testing Library
- MSW
- jsdom

## Relevante Testorte

- `src/components/**/__tests__/`
- `src/services/__tests__/`
- `src/test/`

## Befehle

```bash
pnpm run test
pnpm run test:coverage
```

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

## Aktueller Validierungsstand 2026-04-22

- Die juengsten Accessibility- und i18n-Slices wurden mit gezielten Diagnostics und fokussierten ESLint-Laeufen geprueft.
- Fuer den aktuellen Gesamtstand wurde `pnpm exec tsc --noEmit` erfolgreich ausgefuehrt.
- Ein kompletter erneuter Durchlauf von `pnpm run lint`, `pnpm run test` und `pnpm run build` ist vor einem Release oder groesseren Merge weiterhin empfohlen.
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
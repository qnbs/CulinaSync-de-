# M7 — TypeScript 7.0 GA (Vorbereitung)

> **Stand:** Juni 2026 · Aktuell: **TypeScript 6.0.3** + **`tsgo`** (`@typescript/native-preview` beta)

## Status

TS **7.0 stable** ist auf npm noch nicht als GA verfügbar (nur `7.0.0-dev.*`). CulinaSync bleibt deshalb auf dem bewährten **M0-Stack**, bis 7.0 offiziell released ist.

## Checkliste bei GA-Release

1. `package.json`: `typescript` → `^7.0.0`, `@typescript/native-preview` entfernen oder durch stabiles Native-Paket ersetzen
2. `tsconfig.json` (apps/web):
   - `"noUncheckedSideEffectImports": true`
   - `"stableTypeOrdering": true`
3. `pnpm run type-check` + `pnpm run test` + `pnpm run build`
4. Deprecated Compiler-Flags aus Release Notes entfernen
5. VS Code: TypeScript Native Extension auf stabile Version
6. `ROADMAP.md` M7 als ✅ markieren, `CHANGELOG.md` ergänzen

## Lokale Vorab-Prüfung (optional)

```bash
pnpm run check:ts-ga          # Exit 0 = noch kein GA; Exit 1 = Upgrade anstoßen
pnpm run check:ts-ga -- --json
npm view typescript versions --json | tail -5
pnpm run type-check
```

Kein produktives Upgrade auf `7.0.0-dev` ohne Team-Abstimmung.

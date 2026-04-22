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
pnpm run lint
pnpm run test
pnpm run build
pnpm run test:coverage
pnpm run analyze:bundle
pnpm run check:bundle-budget
pnpm run preview
```

## Wichtige Konventionen

- Redux fuer UI-/Session-State, Dexie fuer Domaindaten.
- Keine direkten Tabellenwrites aus Komponenten.
- API-Keys nie im Build oder in `localStorage`.
- Deutsche und englische Lokalisierung synchron halten.
- Schwere Bibliotheken wenn moeglich dynamisch importieren.

## Arbeiten an Settings, Export und Persistenz

- Freie Objektpfad-Updates vermeiden; stattdessen erlaubte Felder explizit behandeln.
- Downloads nur ueber sichere Browser-Sinks mit bereinigten Dateinamen und kontrollierten MIME-Typen.
- Redux Persist nicht wieder auf implizite Storage-Interop zurueckstellen.

## Arbeiten an GitHub Pages

- `vite.config.ts` setzt `base` in GitHub Actions automatisch auf den Repo-Unterpfad.
- Pages-spezifische Fehler sind oft Base-Path-, Cache- oder Service-Worker-Probleme.
- Vor dem Merge fuer Deploy-relevante Aenderungen nach Moeglichkeit `pnpm run build` und `pnpm run check:bundle-budget` ausfuehren.

## Doku-Pflege

- Nennenswerte technische Aenderungen in `CHANGELOG.md` eintragen.
- Root-Dokumente fuer Maintainer-/Community-Themen, `docs/` fuer Fach- und Betriebswissen nutzen.
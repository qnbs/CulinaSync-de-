# Contributing to CulinaSync

Danke fuer Beitraege zu CulinaSync. Dieses Dokument beschreibt den erwarteten Arbeitsstil fuer Code, Dokumentation, Tests und Reviews.

## Grundsaetze

- Kleine, klar umrissene Aenderungen bevorzugen.
- Root-Cause-Fixes vor Symptombehandlung.
- Keine Secrets, API-Keys oder persoenlichen Daten ins Repo einchecken.
- Dokumentation und Changelog zusammen mit relevanten Codeaenderungen pflegen.
- Deutsche UX-Texte und englische Gegenstuecke in den Lokalisierungen konsistent halten.

## Voraussetzungen

- Node.js 22+
- pnpm 10+

## Lokales Setup

```bash
pnpm install
pnpm run dev
```

## Vor einem Beitrag

1. Lies [README.md](./README.md) und die Dateien im [docs/](./docs/README.md)-Bereich.
2. Pruefe bestehende Issues, offene PRs oder bekannte Einschraenkungen.
3. Richte Aenderungen an den vorhandenen Architekturgrenzen aus.

## Erwartete Checks vor Merge

```bash
pnpm run lint
pnpm run test
pnpm run build
```

Wenn die Aenderung Deploy-, Bundle- oder i18n-relevant ist, pruefe zusaetzlich:

```bash
pnpm run check:bundle-budget
pnpm run i18n:scan
```

## Architekturregeln

- Redux fuer UI-/Session-State, Dexie fuer persistente Domaindaten.
- Persistente Daten ueber `src/services/db.ts` und Repositories schreiben, nicht direkt aus Komponenten.
- Neue Modals in eigene Dateien auslagern und mit `useModalA11y` absichern.
- Keine neuen freien Objektpfad-Schreibweisen fuer Settings oder aehnliche Datenstrukturen einfuehren.
- Keine API-Keys oder Build-Secrets ueber `process.env` oder `VITE_*` in die App einbetten.

## Tests und Dokumentation

- Neue Features sollten passende Tests mitbringen.
- Aendere bei relevanten Verhaltensaenderungen auch die Dokumentation.
- Trage nennenswerte Aenderungen in [CHANGELOG.md](./CHANGELOG.md) nach Keep a Changelog ein.

## Pull Requests

- Beschreibe Problem, Loesung und Risiken knapp und konkret.
- Nenne betroffene Nutzerflaechen, Datenmigrationen oder Breaking Changes explizit.
- Verlinke relevante Issues oder Screenshots, wenn sie den Review erleichtern.

## Nicht Teil eines normalen Beitrags

- Keine destruktiven Git-Befehle ohne ausdrueckliche Abstimmung.
- Keine breit angelegten Refactors ohne klaren funktionalen Mehrwert.
- Keine stillen Aenderungen an Persistenz-, Export- oder Security-Pfaden ohne Dokumentationsupdate.
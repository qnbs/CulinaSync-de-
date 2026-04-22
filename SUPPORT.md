# Support

## Wofuer dieses Dokument ist

Diese Datei beschreibt den sinnvollsten Kanal fuer Fragen, Fehlerberichte und sicherheitsrelevante Hinweise.

## Hilfe bei Nutzung oder Entwicklung

Nutze ein normales GitHub Issue, wenn du:

- einen reproduzierbaren Funktionsfehler gefunden hast
- Hilfe beim lokalen Setup brauchst
- Verhalten der App oder Dokumentation unklar ist
- einen Verbesserungsvorschlag fuer UX, Performance oder Entwicklerfluss hast

## Gute Bug Reports

Ein hilfreicher Report enthaelt moeglichst:

- Browser, Betriebssystem und Geraetetyp
- betroffene Seite oder Funktion
- klare Reproduktionsschritte
- erwartetes und tatsaechliches Verhalten
- relevante Logs, Fehlermeldungen oder Screenshots

## Sicherheitsrelevante Themen

Fuer sensible Sicherheitsmeldungen lies bitte zuerst [SECURITY.md](./SECURITY.md) und vermeide oeffentliche Exploit-Details.

## Selbsthilfe vor einem Issue

1. `pnpm install` erneut mit aktuellem Lockfile ausfuehren.
2. `pnpm run lint && pnpm run test && pnpm run build` pruefen.
3. Bei Pages-/PWA-Problemen Hard Reload und Cache-/Service-Worker-Reset testen.
4. Die Hinweise in [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) durchgehen.
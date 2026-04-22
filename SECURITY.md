# Security Policy

## Supported Scope

Sicherheitsrelevante Meldungen sind besonders willkommen fuer:

- Datenpersistenz und IndexedDB-/Dexie-Zugriffe
- API-Key-Handhabung und KI-Integrationen
- Export-, Import- und Dateidownload-Pfade
- GitHub Actions, Deployment und Build-Pipeline
- XSS-, Injection-, Prototype-Pollution- und Deserialisierungsrisiken

## Bitte nicht oeffentlich posten

Melde sensible Schwachstellen nicht in oeffentlichen Issues mit reproduzierbaren Exploits, Schluesseln, Tokens oder personenbezogenen Daten.

## Meldeweg

Wenn GitHub fuer dieses Repository private Vulnerability Reports oder Security Advisories anbietet, nutze bevorzugt diesen Weg. Falls kein privater Meldeweg verfuegbar ist, kontaktiere den Repository-Eigentuemer direkt ueber GitHub und teile nur die minimal noetigen Informationen.

Fuer nicht-sensitive Sicherheitsverbesserungen oder harte Konfigurationsthemen ohne Exploit-Details ist ein normales Issue akzeptabel.

## Erwartete Angaben in einer Meldung

- Kurze Problembeschreibung
- Betroffene Datei, Funktion oder URL
- Voraussetzungen und Reproduktionsschritte
- Erwartetes vs. tatsaechliches Verhalten
- Moegliche Auswirkung
- Optional ein Patch- oder Mitigationsvorschlag

## Reaktionsprinzipien

- Eingehende Reports werden zeitnah gesichtet.
- Reproduzierbare Probleme werden priorisiert behoben.
- Oeffentliche Offenlegung sollte erst nach einer vernuenftigen Behebungsphase erfolgen.

## Sicherheitsrelevante Projektkonventionen

- API-Keys duerfen nicht in den Build.
- Nutzerinhalte duerfen nicht unkontrolliert als HTML oder Dateiname an Browser-Sinks gelangen.
- Persistente Strukturupdates sollten auf erlaubte Felder begrenzt sein.
- Workflows sollen auf aktuelle Actions-Versionen und reproduzierbare Installationen ausgerichtet bleiben.
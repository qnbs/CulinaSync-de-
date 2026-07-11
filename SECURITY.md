# Security Policy

## Supported Scope

Sicherheitsrelevante Meldungen sind besonders willkommen fuer:

- Datenpersistenz und IndexedDB-/Dexie-Zugriffe
- API-Key-Handhabung und KI-Integrationen
- Export-, Import- und Dateidownload-Pfade
- GitHub Actions, Deployment und Build-Pipeline (CI: `validate.yml` mit lint, type-check, test:coverage, build, bundle-budget, `pnpm audit --audit-level=high`; lokal: `pnpm run check:all`)
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

## Bekannte, akzeptierte Risiken (transitiv, kein kompatibler In-Range-Fix)

- **RUSTSEC — `glib` `VariantStrIter`/`DoubleEndedIterator` Unsoundness (moderat; GitHub-Alert #23).**
  Der Tauri-2-Desktop-Build (`src-tauri/`) zieht `glib 0.18.5` **transitiv** ueber
  `tauri → tauri-runtime-wry → wry → webkit2gtk → gtk` (gtk-rs-0.18-Generation). `glib` ist **keine**
  direkte Dependency. Der Fix liegt erst in `glib 0.20.10` — **semver-inkompatibel** und durch den
  Linux-webkit2gtk-Backend gepinnt, den Tauri 2.x verlangt; `cargo update -p glib` bestaetigt
  "Locking 0 packages to latest compatible versions" (kein kompatibler In-Range-Fix erreichbar —
  ein Upstream-Fix existiert nur in der semver-inkompatiblen 0.20.x-Linie).
  **Bewertung:** betrifft ausschliesslich die Linux-Desktop-GTK-Bindings; die Web-PWA ist nicht
  betroffen. Ein erzwungener Major-Bump des gtk-rs-Stacks wird bewusst **nicht** vorgenommen
  (Regressionsrisiko fuer den Desktop-Build unverhaeltnismaessig zur moderaten transitiven Unsoundness).
  **Mitigation/Tracking:** `cargo`-Oekosystem in `.github/dependabot.yml` aufgenommen — dies ergaenzt
  woechentliche Version-Update-PRs fuer `/src-tauri` (die Dependabot-Security-Alerts selbst sind ein
  separates Repo-Setting); Re-Evaluation, sobald wry/webkit2gtk auf gtk-rs 0.20 ziehen. Backlog-Referenz:
  `R-GLIB` in [docs/AUDIT-REMEDIATION-BACKLOG.md](docs/AUDIT-REMEDIATION-BACKLOG.md). Das
  `pnpm audit --audit-level=high`-CI-Gate deckt nur das npm-Oekosystem ab; dieser Rust-Advisory
  blockiert CI daher nicht.

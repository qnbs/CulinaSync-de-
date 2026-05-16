# Troubleshooting

## Schwarzer Bildschirm oder App rendert nicht

Pruefen:

- Browser-Konsole auf Laufzeitfehler
- GitHub-Pages-Deployment und geladenen Asset-Hash
- `vite.config.ts`-`base` fuer den Repo-Unterpfad
- Service Worker und Browser-Cache zuruecksetzen

Bekanntes frueheres Problem: `redux-persist` konnte auf Pages mit `getItem is not a function` oder `setItem is not a function` abstuerzen. Der produktive Pfad verwendet jetzt `src/store/persistStorage.ts`.

## Assets laden auf Pages nicht

Typische Ursachen:

- falscher Base-Pfad
- veralteter Service Worker
- Seitenreload auf alte Asset-Namen gecacht

Massnahmen:

1. Hard Reload ausfuehren.
2. Service Worker deregistrieren.
3. Seite mit Cache-Busting-Query erneut laden.
4. Den aktuellen Deploy-Run und die generierten Asset-Namen kontrollieren.

## Settings verhalten sich unerwartet

Der Schreibpfad laeuft ueber Redux Persist (`persist:settings`). **Alter** Schluessel `culinaSyncSettings` sollte beim App-Start automatisch migriert und entfernt werden (`migrateLegacySettings`, Side-Effect beim Laden von `store/index.ts`). `loadSettings()` fuer i18n liest **nur** Persist oder Defaults — nicht mehr parallel den Legacy-Key.

Bei inkonsistentem Verhalten:

- Browser-Storage pruefen (`persist:settings`, verwaistes `culinaSyncSettings`)
- SessionStorage-Flag `culina_migration_v1_done` nur fuer Debugging; bei Bedarf Session neu starten
- Settings-Rehydrierung und Slice-Werte vergleichen
- nach Persistenz-Aenderungen Migration und Erstlauf erneut testen

## Uebersetzungen fehlen oder rohe i18n-Keys erscheinen

Pruefen:

- ob der Key in beiden Sprachen vorhanden ist
- ob der Key in der passenden Domain-Datei liegt: `core.json`, `settings.json` oder `features.json`
- ob `src/locales/de/index.ts` und `src/locales/en/index.ts` die Domain-Dateien korrekt aggregieren
- ob der aufrufende Component-Hook wirklich `useTranslation()` nutzt oder in Klassenkomponenten direkt das zentrale `i18n` verwendet

Typisches Fehlerbild:

- Nach dem Split der grossen Locale-Dateien landet ein neuer Key nur in einer Sprache oder in der falschen Domain-Datei. Dann rendert die UI den Roh-Key oder faellt auf eine unerwartete Sprache zurueck.

## Confirm-Dialoge verhalten sich inkonsistent

Pruefen:

- ob der Dialog ueber `useModalA11y` angeschlossen ist
- ob `onClose`, Initialfokus und Overlay-Klick denselben Cancel-Pfad verwenden
- ob ein Hook oder Container den Pending-State korrekt zuruecksetzt
- ob die destructive Aktion erst nach explizitem Confirm ausgefuehrt wird

## Export funktioniert nicht wie erwartet

Pruefen:

- MIME-Typ und erzeugten Dateinamen
- Browser-Download-Blocker
- exportierte Datenstruktur und Guards im `exportService`

## CI oder Deploy schlaegt fehl

Pruefen:

- `pnpm install --frozen-lockfile`
- `pnpm run lint`
- `pnpm run type-check` (wie in **`validate.yml`** nach dem Lint-Step)
- `pnpm run test` bzw. `pnpm run test:coverage` (wie in CI)
- `pnpm run build`
- `pnpm run check:bundle-budget`
- lokal alles in einem Rutsch: **`pnpm run check:all`**

Wenn nur Node-20-Depracation-Warnungen auf GitHub erscheinen, aber der Lauf gruen ist, handelt es sich wahrscheinlich um die bekannten Upstream-Warnungen der GitHub-verwalteten Pages-Actions.

## Vitest haengt, ist sehr langsam oder bricht mit Timeout ab

- Unter **Windows** kann jsdom + viele Worker laenger brauchen; optional: `npx vitest run --pool=forks --maxWorkers=2`.
- **`vitest run --coverage`** ist deutlich langsamer als ohne Coverage; bei Timeout-Fehlern in RTL-Tests Timeout pro Test erhoehen (siehe [TESTING.md](./TESTING.md)).
- Nach Coverage-Laefen **`coverage/`** erzeugt — nicht committen (`.gitignore`); ESLint ignoriert den Ordner automatisch.

### Artefakt „coverage-lcov“ in GitHub Actions

- CI laedt den Ordner **`coverage`** hoch — bei Upload-Fehlern pruefen, ob `pnpm run test:coverage` lokal gruen ist und ob genug Speicher auf dem Runner vorhanden ist.

## KI-Funktionen arbeiten nicht

Pruefen:

- API-Key in den Einstellungen gesetzt
- Netzwerkverbindung
- Fehlermeldung aus `geminiService.ts`
- Fallback-Verhalten fuer Offline-/Fehlerfaelle
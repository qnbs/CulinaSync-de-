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

Es existiert aktuell noch doppelte Settings-Persistenz zwischen `settingsService.ts` und Redux Persist. Bei inkonsistentem Verhalten:

- Browser-Storage pruefen
- Settings-Rehydrierung und Slice-Werte vergleichen
- nach Persistenz-Aenderungen beide Pfade bewusst validieren

## Export funktioniert nicht wie erwartet

Pruefen:

- MIME-Typ und erzeugten Dateinamen
- Browser-Download-Blocker
- exportierte Datenstruktur und Guards im `exportService`

## CI oder Deploy schlaegt fehl

Pruefen:

- `pnpm install --frozen-lockfile`
- `pnpm run lint`
- `pnpm run test`
- `pnpm run build`
- `pnpm run check:bundle-budget`

Wenn nur Node-20-Depracation-Warnungen auf GitHub erscheinen, aber der Lauf gruen ist, handelt es sich wahrscheinlich um die bekannten Upstream-Warnungen der GitHub-verwalteten Pages-Actions.

## KI-Funktionen arbeiten nicht

Pruefen:

- API-Key in den Einstellungen gesetzt
- Netzwerkverbindung
- Fehlermeldung aus `geminiService.ts`
- Fallback-Verhalten fuer Offline-/Fehlerfaelle
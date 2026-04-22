# Architektur

## Zielbild

CulinaSync ist eine local-first PWA. Persistente Domaindaten werden im Browser gespeichert und reaktiv gelesen. Netzwerk- oder KI-Funktionen sind Zusatzfaehigkeiten, nicht die Grundlage der Kernbedienung.

## Schichten

### UI-Schicht

- `index.tsx` initialisiert i18n, Redux Provider und Persist Gate.
- `src/App.tsx` verwaltet Seitenwechsel, globale Bedienelemente, Lazy Loading und Shell-Zustand.
- `src/components/` enthaelt Seitenkomponenten sowie Feature-Unterordner.

### UI-/Session-State

- Redux Toolkit liegt unter `src/store/`.
- Redux dient primaer fuer UI- und Session-Zustand wie Navigation, Fokusziele, Voice-Aktionen oder Slice-spezifische Async-Aktionen.
- Persistiert wird nur der `settings`-Slice.

### Persistente Domaindaten

- Dexie und IndexedDB bilden die Source of Truth fuer `pantry`, `recipes`, `mealPlan` und `shoppingList`.
- Reaktive Lesepfade nutzen `useLiveQuery`, vor allem in den domainnahen Hooks.
- Schreibpfade laufen ueber Repositories und Services, nicht direkt aus Komponenten.

### Services und Integrationen

- `src/services/db.ts` ist der API-Einstieg fuer Datenbank- und Repository-Zugriffe.
- `src/services/geminiService.ts` kapselt die KI-Integration.
- `src/services/exportService.ts` kapselt alle Export-Sinks.
- `src/services/voiceCommands.ts` uebersetzt Sprachkommandos in App-Aktionen.

## Datenfluss

1. UI triggert einen Handler in Komponente, Hook oder Slice.
2. Persistente Operationen gehen ueber Repository-/Service-Funktionen.
3. Dexie speichert die Daten in IndexedDB.
4. Hooks lesen ueber `useLiveQuery` und aktualisieren die UI reaktiv.
5. Redux bleibt fuer Shell-, Fokus-, Modal- und Prozesszustand reserviert.

## Persistenz und Sicherheit

- Redux Persist verwendet einen expliziten Browser-Storage-Adapter in `src/store/persistStorage.ts`.
- Dadurch wird eine fragile Default-Interop aus `redux-persist/lib/storage` vermieden.
- Settings-Aenderungen sind auf eine erlaubte Mutator-Map in `src/components/Settings.tsx` begrenzt.
- Exporte verwenden erlaubte MIME-Typen und bereinigte Dateinamen.

## Hauptgrenzen im Code

- Komponenten sollten keine Dexie-Tabellen direkt mutieren.
- KI-Aufrufe gehoeren nicht in Komponenten.
- Modals gehoeren in eigene Dateien.
- Schwere Bibliotheken sollen bevorzugt dynamisch geladen werden.

## Wichtige aktuelle technische Punkte

- `settingsService.ts` und Redux Persist speichern Settings derzeit noch doppelt. Das ist ein bekannter Konsolidierungspunkt.
- `@faker-js/faker` wird fuer Offline-Fallbacks genutzt und sollte langfristig ueber dynamischen Import oder einen kleineren lokalen Fallback ersetzt werden.
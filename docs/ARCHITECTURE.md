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

### Lokalisierung

- `src/i18n.ts` initialisiert die Sprachressourcen ueber aggregierte Sprachmodule.
- Die Sprachdateien sind je Sprache in `core.json`, `settings.json` und `features.json` getrennt.
- `src/locales/de/index.ts` und `src/locales/en/index.ts` aggregieren diese Domain-Dateien fuer i18next.
- Neue Texte sollen in beiden Sprachen synchron in der passenden Domain gepflegt werden, statt wieder grosse Sammeldateien aufzubauen.

## Datenfluss

1. UI triggert einen Handler in Komponente, Hook oder Slice.
2. Persistente Operationen gehen ueber Repository-/Service-Funktionen.
3. Dexie speichert die Daten in IndexedDB.
4. Hooks lesen ueber `useLiveQuery` und aktualisieren die UI reaktiv.
5. Redux bleibt fuer Shell-, Fokus-, Modal- und Prozesszustand reserviert.

## Interaktionsmuster

- Irreversible oder destructive Aktionen laufen nicht mehr ueber native Browser-Dialoge.
- Bestaetigungen werden ueber eigene Modal-Komponenten mit `useModalA11y` umgesetzt.
- Domain-Hooks oder Feature-Container halten dazu einen `pendingAction`-aehnlichen Zustand und exponieren bestaetigte sowie abgebrochene Pfade explizit.
- Dieses Muster ist insbesondere in Pantry, Shopping List, Meal Planner, Recipe Detail und API-Key-Verwaltung bereits etabliert.

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

- `settingsService.ts` laedt bevorzugt den Redux-Persist-Bestand und faellt nur fuer Legacy-Daten noch auf den alten Schluessel zurueck.
- `@faker-js/faker` wird fuer Offline-Fallbacks genutzt und sollte langfristig ueber dynamischen Import oder einen kleineren lokalen Fallback ersetzt werden.
- Der i18n-Bestand ist seit 2026-04-22 modularisiert; weitere Rest-Hartcodierungen sollten als nachgelagerter Sweep auf den neuen Locale-Domains aufsetzen.
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/qnbs/CulinaSync-de-)
<div align="left">
  <h1 style="border-bottom: none;">CulinaSync: Das intelligente Küchen-Betriebssystem</h1>
  <p>
    <strong>Eine Local-First, KI-gestützte Progressive Web App für den modernen Haushalt</strong>
    <br />
    <em>Mobil-First. Offline-Fähig. Datenschutz-Zentriert. Nahtlos integriert.</em>
  </p>
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/lizenz-MIT-green.svg" alt="Lizenz">
    <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React">
    <img src="https://img.shields.io/badge/Powered%20by-Gemini%20API-purple.svg" alt="Gemini API">
  </p>
  <p>
    <em>Dieses Projekt wurde in einem iterativen Dialog mit <a href="https://ai.studio/apps/drive/1bQgaay6IODal47GVGZcn-65xgfu_PIDC">Google's AI Studio</a> entwickelt.</em>
  </p>
</div>

---

## 🚀 Vision: Ihr proaktiver kulinarischer Partner

CulinaSync ist mehr als nur eine traditionelle Rezept-App. Es wurde als **proaktives, intelligentes Küchen-Betriebssystem** konzipiert – ein zentraler Hub, der den gesamten kulinarischen Lebenszyklus für Ihren Haushalt optimiert. Unsere Vision ist es, die tägliche Frage "Was soll ich kochen?" in ein selbstbewusstes "Das koche ich heute" zu verwandeln, gestützt durch intelligente, datenbasierte Assistenz.

Von der Inspiration und Essensplanung über den intelligenten Einkauf bis hin zum interaktiven Kochen ist CulinaSync als nahtloser, intuitiver Partner in Ihrer Küche konzipiert.

## 🏛️ Architektonische Kernphilosophie

Unsere Entwicklung orientiert sich an drei unumstößlichen Prinzipien, die das Nutzererlebnis definieren:

1.  **🔒 Local-First & Datenschutz by Design:** Ihre Daten gehören Ihnen. Punkt. Alle Ihre Rezepte, Vorratsartikel und Essenspläne befinden sich ausschließlich auf Ihrem Gerät, unterstützt durch IndexedDB. Dies garantiert maximale Leistung, echte Offline-Funktionalität und kompromisslose Privatsphäre. Es gibt kein Cloud-Backend, kein User-Tracking und keine Datenmonetarisierung.

2.  **📱 Mobil-First, universell zugänglich:** CulinaSync wurde für das Gerät entwickelt, das Sie immer bei sich haben – Ihr Smartphone. Jede Funktion ist für die Touch-basierte Interaktion unterwegs optimiert. Durch "Progressive Enhancement" skaliert die Benutzeroberfläche elegant und bietet ein ebenso leistungsstarkes Erlebnis auf Tablets und Desktops, sodass die Funktionalität niemals dem Formfaktor geopfert wird.

3.  **🧠 Intelligente & kontextsensitive Assistenz:** Wir nutzen die Leistung der Google Gemini API nicht als Gimmick, sondern als integrierte Intelligenzschicht. Die KI ist kontextbewusst und berücksichtigt Ihren Vorratsbestand, Ihre Ernährungspräferenzen und Ihre expliziten Wünsche, um wirklich nützliche, personalisierte kulinarische Anleitungen zu liefern.

---

## ✨ Feature-Übersicht

CulinaSync bietet eine integrierte Suite von Werkzeugen, die den gesamten kulinarischen Arbeitsablauf abdecken.

### Kernmodule
- 🥫 **Intelligente Vorratsverwaltung:** Ein Echtzeit-Inventar Ihrer Vorräte. Fügen Sie Artikel hinzu, verfolgen Sie Mengen und legen Sie Mindesthaltbarkeitsdaten fest. Die Vorratskammer ist die grundlegende Datenquelle für alle intelligenten Funktionen.
- 📚 **Persönliches Kochbuch:** Ihre digitale kulinarische Bibliothek. Speichern Sie KI-generierte Rezepte, fügen Sie manuell Ihre eigenen hinzu und bauen Sie eine personalisierte, durchsuchbare Sammlung auf.
- 📅 **Dynamischer Essensplaner:** Planen Sie Ihre Mahlzeiten mit einer flüssigen Drag-and-Drop-Oberfläche. Optimiert für die mobile Wochenansicht und die umfassende Planung am Desktop.
- 🛒 **Automatisierte Einkaufsliste:** Die intelligenteste Einkaufsliste, die Sie je verwendet haben. Sie füllt sich automatisch basierend auf Ihrem Essensplan, gleicht sich mit Ihrer Vorratskammer ab und eliminiert überflüssige Einkäufe.

### KI & Intelligenz
- 🤖 **KI-Chef (Gemini-betrieben):** Verwandeln Sie abstrakte Gelüste in konkrete, köstliche Rezepte. Der KI-Chef berücksichtigt Ihren Vorrat, Ihre Vorlieben und gewünschte Modifikatoren (z. B. "schnell", "gesund"), um einzigartige Rezeptideen und vollständige, detaillierte Kochanleitungen zu generieren.
- 🔍 **Vorrats-Abgleich:** Jedes Rezept in Ihrem Kochbuch wird automatisch mit Ihrem aktuellen Vorratsbestand abgeglichen. So sehen Sie auf einen Blick, was Sie *jetzt sofort* kochen können. Dieser Abgleich wird effizient und mit Verzögerung (debounced) bei Datenänderungen berechnet.
- 🗣️ **Fortschrittliche Sprachsteuerung:** Ein umfassendes Sprachbefehlssystem ermöglicht eine freihändige Bedienung. Navigieren Sie durch die App, fügen Sie Artikel zu Ihrer Vorratskammer oder Einkaufsliste hinzu und steuern Sie den Kochmodus, ohne den Bildschirm zu berühren.

### Nutzererlebnis & Arbeitsablauf
- 🍳 **Interaktiver Kochmodus:** Eine ablenkungsfreie Vollbild-Kochoberfläche, die Sie Schritt für Schritt anleitet.
    - **Bildschirm-Sperre (Wake Lock):** Ihr Bildschirm bleibt an, sodass Sie Ihr Gerät nicht mit schmutzigen Händen entsperren müssen.
    - **Text-to-Speech:** Lassen Sie sich Anweisungen vorlesen, mit Steuerelementen zum Wiederholen oder Pausieren.
    - **Vollständige Sprachnavigation:** Wechseln Sie zwischen den Schritten ("nächster Schritt", "vorheriger Schritt") oder beenden Sie den Modus ("Kochmodus beenden") komplett freihändig.
- ⌨️ **Befehlspalette (`⌘K` / `Strg+K`):** Eine Power-User-Funktion für sofortige Navigation und Aktionsausführung. Suchen Sie von überall in der App nach Rezepten, Vorratsartikeln oder Befehlen.
- 🔄 **Datenportabilität:** Vollständige Import-/Export-Funktionalität für all Ihre Daten im Standard-JSON-Format. Sie haben die vollständige Hoheit und Kontrolle.
- 📱 **Volle PWA-Fähigkeiten:** Installierbar auf Ihrem Startbildschirm für ein natives App-Gefühl, mit vollständigem Offline-Zugriff auf alle Kernfunktionen.

---

## 🛠️ Technische Details & Architektur

CulinaSync basiert auf einem modernen, robusten und performanten Technologie-Stack, der unsere Kernphilosophie unterstützt.

-   **Framework & Sprache:** [**React 19**](https://react.dev/) mit [**TypeScript**](https://www.typescriptlang.org/). Wir nutzen funktionale Komponenten und eine umfangreiche Suite von benutzerdefinierten Hooks für eine deklarative, typsichere und hochgradig wartbare Codebasis.

-   **Styling:** [**Tailwind CSS**](https://tailwindcss.com/). Ein Utility-First-CSS-Framework ermöglicht eine schnelle, konsistente und responsive UI-Entwicklung direkt in unseren Komponenten und folgt unserem Mobile-First-Designprinzip.

-   **Zustandsverwaltung (State Management):**
    -   **Globaler Zustand:** [**Redux Toolkit**](https://redux-toolkit.js.org/) bietet einen zentralen, vorhersagbaren Zustandscontainer für anwendungsweite Daten wie UI-Zustand und Einstellungen.
    -   **Persistenz:** `redux-persist` wird verwendet, um nicht-sensiblen globalen Zustand (wie Benutzereinstellungen) im Local Storage zu speichern und so ein konsistentes Erlebnis über Sitzungen hinweg zu gewährleisten.
    -   **Lokaler Zustand:** Reacts eingebaute `useState`- und `useReducer`-Hooks werden für komponenten-lokalen, ephemeren Zustand verwendet.
    -   **Feature-Level-Zustand (Hybrid-Muster):** Für komplexe Bereiche wie die Vorratskammer und die Einkaufsliste verwenden wir ein "Context-as-DI"-Muster. Ein dedizierter benutzerdefinierter Hook (z. B. `usePantryManager`) kapselt die gesamte Feature-Logik und die Interaktion mit einem bestimmten Redux-Slice. Ein React Context Provider injiziert diesen Hook dann in den Komponentenbaum des Features. Dieser Ansatz bietet eine starke Kapselung und bündelt die gesamte zugehörige Logik, was die Wartbarkeit verbessert.

-   **Datenschicht (Local-First):**
    -   **Datenbank:** Wir verwenden die browser-interne [**IndexedDB**](https://developer.mozilla.org/de/docs/Web/API/IndexedDB_API) als leistungsstarke, persistente On-Device-Datenbank.
    -   **ORM/Wrapper:** [**Dexie.js**](https://dexie.org/) bietet eine elegante, Promise-basierte API über IndexedDB, die die Verwaltung des Datenbankschemas, Transaktionen und komplexe Abfragen vereinfacht.
    -   **Reaktivität:** `dexie-react-hooks` (`useLiveQuery`) verbindet Dexie mit React und schafft eine reaktive Datenschicht, bei der UI-Komponenten automatisch neu gerendert werden, wenn sich die zugrunde liegenden Daten in der IndexedDB ändern.

-   **KI-Integration:**
    -   **API:** Das offizielle [`@google/genai`](https://www.npmjs.com/package/@google/genai) SDK wird verwendet, um mit der **Google Gemini API** zu kommunizieren.
    -   **Strukturierte Ausgabe:** Wir nutzen den JSON-Modus von Gemini und stellen ein detailliertes `responseSchema` für die Rezeptgenerierung bereit. Dies stellt sicher, dass die Ausgabe der KI zuverlässig, parsebar und direkt in den Datenstrukturen der Anwendung verwendbar ist, was Fehler und Nachbearbeitung minimiert.

-   **PWA & Offline-Funktionalität:**
    -   **Service Worker:** [**VitePWA**](https://vite-pwa-org.netlify.app/) orchestriert die Erstellung und Verwaltung eines Service Workers.
    -   **Strategie:** Wir verwenden eine `autoUpdate`-Registrierung und eine Cache-First-Strategie für Assets, um sicherzustellen, dass die App sofort lädt und offline nahtlos funktioniert.

-   **Build & Entwicklung:**
    -   **Bundler:** [**Vite**](https://vitejs.dev/) bietet ein blitzschnelles Entwicklungserlebnis mit Hot Module Replacement (HMR) und einem optimierten Produktions-Build-Prozess.
    -   **Icons:** [**Lucide React**](https://lucide.dev/) für ein sauberes, konsistentes und "tree-shakable" Icon-Set.

---

## 🏁 Erste Schritte

Um CulinaSync lokal für die Entwicklung auszuführen, folgen Sie diesen Schritten:

1.  **Repository klonen**
    ```sh
    git clone https://github.com/qnbs/CulinaSync-de.git
    cd CulinaSync-de
    ```

2.  **Abhängigkeiten installieren**
    ```sh
    npm install
    ```

3.  **Umgebungsvariablen konfigurieren**
    Die KI-Funktionen erfordern einen Google Gemini API-Schlüssel. Erstellen Sie eine `.env.local`-Datei im Projektstammverzeichnis:
    ```env
    # Erhalten Sie Ihren Schlüssel von Google AI Studio und ersetzen Sie YOUR_API_KEY
    VITE_API_KEY=YOUR_API_KEY
    ```
    *Hinweis: Das `VITE_`-Präfix ist erforderlich, damit Vite die Variable dem clientseitigen Code zur Verfügung stellt.*

4.  **Entwicklungsserver starten**
    ```sh
    npm run dev
    ```
    Die Anwendung ist unter `http://localhost:5173` (oder dem nächsten verfügbaren Port) erreichbar.

### Verfügbare Skripte

-   `npm run dev`: Startet den Entwicklungsserver mit HMR.
-   `npm run build`: Kompiliert und bündelt die Anwendung für die Produktion.
-   `npm run lint`: Überprüft die Codebasis mit ESLint.
-   `npm run preview`: Stellt den Produktions-Build lokal zum Testen bereit.

---

## 🚀 Deployment

Das Repository enthält die Konfiguration für ein nahtloses Deployment auf **Google Cloud Run** über **Cloud Build**.

-   **`Dockerfile`:** Ein mehrstufiges Dockerfile, das zuerst die statischen React-Assets erstellt und sie dann mit einem schlanken Nginx-Container ausliefert.
-   **`cloudbuild.yaml`:** Eine CI/CD-Pipeline-Definition für Cloud Build. Sie automatisiert das Erstellen des Docker-Images, das Pushen in die Google Container Registry und das Deployment als neue Revision des Cloud Run-Dienstes.

Um das Deployment durchzuführen, führen Sie den folgenden `gcloud`-Befehl aus dem Projektstammverzeichnis aus:
```sh
gcloud builds submit --config cloudbuild.yaml --substitutions=_VITE_API_KEY="YOUR_API_KEY"
```

---

## 📂 Projektstruktur

Das Projekt folgt einer feature-orientierten und modularen Struktur, um Skalierbarkeit und Wartbarkeit zu gewährleisten.

```
/
├── public/                # Statische Assets (Icons, manifest.json)
├── src/
│   ├── components/        # Wiederverwendbare React-Komponenten (UI-Elemente, Seiten)
│   ├── contexts/          # React Context Provider für lokalen Zustand
│   ├── data/              # Statische Daten, inkl. Seed-Rezepte
│   ├── hooks/             # Eigene React Hooks für geteilte Logik (z.B. useDebounce)
│   ├── services/          # Kern-Geschäftslogik, API-Clients (Gemini), DB-Interaktionen (Dexie)
│   ├── store/             # Redux Toolkit Setup (Store, Slices, Middleware)
│   ├── types.ts           # Globale TypeScript-Typdefinitionen
│   ├── App.tsx            # Wurzel-Komponente, Routing und globales Layout
│   └── index.tsx          # Einstiegspunkt der Anwendung
├── .env.local             # Lokale Umgebungsvariablen (untracked)
├── Dockerfile             # Container-Definition für das Deployment
├── cloudbuild.yaml        # CI/CD-Konfiguration für Google Cloud Build
└── vite.config.ts         # Vite Build- und PWA-Konfiguration
```

---

## 🗺️ Zukünftige Roadmap

CulinaSync ist ein sich aktiv entwickelndes Projekt. Kernbereiche für die zukünftige Entwicklung umfassen:
- [ ] **Multi-Geräte-Synchronisation:** Optionale, Ende-zu-Ende-verschlüsselte Synchronisation von Daten über die Geräte der Nutzer hinweg.
- [ ] **Barcode-Scanning:** Schnelles Hinzufügen von Vorratsartikeln durch Scannen ihrer Barcodes.
- [ ] **Rezept-Import:** Importieren von Rezepten direkt von Ihren Lieblings-Kochwebseiten.
- [ ] **Erweitertes Teilen:** Teilen von Essensplänen oder Einkaufslisten mit anderen Haushaltsmitgliedern.
- [ ] **Nährwertanalyse:** Tiefere Integration von Nährwertdaten und -tracking.

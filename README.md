<div align="center">
  <h1>CulinaSync: Dein intelligenter Küchenassistent</h1>
  <p>
    <strong>Mobile-First. Offline. Privat. Nahtlos.</strong>
    <br />
    Eine Progressive Web App (PWA), die den gesamten kulinarischen Alltag im Haushalt revolutioniert – optimiert für jedes Gerät.
  </p>
  <p>
    <em>Dieses Projekt wurde im Dialog mit <a href="https://ai.studio/apps/drive/1bQgaay6IODal47GVGZcn-65xgfu_PIDC">Google's AI Studio</a> entwickelt und verfeinert.</em>
  </p>
</div>

---

## 🎯 Vision: Vom Rezeptarchiv zum proaktiven Küchenpartner

CulinaSync ist mehr als nur eine weitere Rezept-App. Es ist ein proaktiver, intelligenter Küchenassistent, der als zentraler Hub für Ihren Haushalt dient. Die App wurde entwickelt, um den gesamten kulinarischen Prozess zu unterstützen – von der Inspiration und Essensplanung über den intelligenten Einkauf bis hin zur Zubereitung und Vorratshaltung.

Im Gegensatz zu traditionellen, Cloud-abhängigen Anwendungen basiert CulinaSync auf einer **Local-First- und Mobile-First-Architektur**. Ihre Daten residieren primär auf Ihrem Gerät, und die Benutzeroberfläche ist für eine nahtlose Bedienung auf dem Smartphone konzipiert, skaliert aber elegant auf Tablets und Desktops. Das Resultat ist eine blitzschnelle, permanent verfügbare und absolut private Nutzererfahrung.

## ✨ Kernfunktionen

Die Anwendung deckt den gesamten kulinarischen Workflow intelligent und nahtlos ab.

| Feature                | Beschreibung                                                                                                                                                            | Status      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 📱 **Mobile-First Design** | Eine vollständig responsive Benutzeroberfläche, die auf Smartphones mit einer intuitiven unteren Navigationsleiste glänzt und sich an größere Bildschirme anpasst.      | ✅ Verfügbar |
| 🥫 **Intelligente Vorratskammer** | Verwalten Sie Ihre Lebensmittelvorräte. Artikel, Mengen und Ablaufdaten werden für intelligente Rezeptvorschläge und Einkaufslisten genutzt.                  | ✅ Verfügbar |
| 🤖 **KI-Chef (Gemini API)**     | Erhalten Sie personalisierte Rezeptvorschläge basierend auf Vorräten, Vorlieben und Ernährungszielen. Verwandeln Sie "Was koche ich heute?" in "Das koche ich heute!". | ✅ Verfügbar |
| 📚 **Persönliches Rezeptbuch**  | Sammeln, organisieren und filtern Sie Ihre Lieblingsrezepte. Jedes gespeicherte Rezept wird Teil Ihrer persönlichen, durchsuchbaren Kochbibliothek.         | ✅ Verfügbar |
| 📅 **Dynamischer Essensplaner**  | Planen Sie Mahlzeiten per Drag-and-Drop. Die Ansicht ist für mobile Geräte optimiert und bietet auf Desktops den vollen Wochenüberblick.                        | ✅ Verfügbar |
| 🛒 **Automatisierte Einkaufsliste** | Generieren Sie eine Einkaufsliste, die Ihren Essensplan automatisch mit Ihrer Vorratskammer abgleicht. Fügen Sie Artikel auch manuell oder per KI hinzu.     | ✅ Verfügbar |
| 🗣️ **Sprachsteuerung**         | Steuern Sie die App freihändig – fügen Sie Artikel hinzu, navigieren Sie oder haken Sie Zutaten von der Einkaufsliste ab.                                         | ✅ Verfügbar |
| ⚙️ **Daten-Management**          | Exportieren und importieren Sie all Ihre Daten als JSON-Backup. Sie behalten die volle Kontrolle.                                                               | ✅ Verfügbar |


## 🏛️ Unsere Architektur-Philosophie

CulinaSync basiert auf zwei fundamentalen Prinzipien, um die bestmögliche Nutzererfahrung zu gewährleisten:

1.  **🚀 Local-First:** Ihre Daten gehören Ihnen und bleiben auf Ihrem Gerät. Das sorgt für maximale Performance, echte Offline-Funktionalität und kompromisslosen Datenschutz.
2.  **📱 Mobile-First:** Die App ist primär für die Nutzung unterwegs konzipiert. Jede Funktion ist auf kleinen Bildschirmen intuitiv bedienbar, ohne auf größeren Geräten an Funktionalität einzubüßen.

## 🛠️ Technologischer Stack & Architektur

CulinaSync nutzt einen modernen, performanten und robusten Tech-Stack.

-   **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/) für eine typsichere, komponentengestützte UI.
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) für ein schnelles, konsistentes und Mobile-First-fähiges Design-System.
-   **Lokale Datenbank:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) als leistungsstarker Browser-Speicher.
-   **DB-Wrapper:** [Dexie.js](https://dexie.org/) als eleganter Wrapper für IndexedDB.
-   **KI & Generative Rezepte:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`).
-   **PWA-Funktionalität:** [VitePWA](https://vite-pwa-org.netlify.app/) für die installierbare, offline-fähige Anwendung.
-   **Build-Tool:** [Vite](https://vitejs.dev/) für eine blitzschnelle Entwicklungsumgebung.
-   **Icons:** [Lucide React](https://lucide.dev/) für ein schönes und konsistentes Icon-Set.

## 🏁 Erste Schritte

Folgen Sie diesen Schritten, um das Projekt lokal auszuführen:

1.  **Repository klonen**
    ```sh
    git clone https://github.com/qnbs/CulinaSync-de-.git
    cd CulinaSync-de-
    ```

2.  **Abhängigkeiten installieren**
    ```sh
    npm install
    ```

3.  **Umgebungsvariablen konfigurieren**
    Für die KI-Funktionen wird ein Google Gemini API-Schlüssel benötigt. Erstellen Sie eine `.env`-Datei im Projektstammverzeichnis und fügen Sie Ihren API-Schlüssel hinzu:
    ```env
    # Ersetzen Sie YOUR_API_KEY durch Ihren tatsächlichen Google Gemini API-Schlüssel
    API_KEY=YOUR_API_KEY
    ```

4.  **Entwicklungsserver starten**
    ```sh
    npm run dev
    ```
    Die Anwendung ist dann unter `http://localhost:5173` (oder dem nächsten verfügbaren Port) erreichbar.

## 📂 Projektstruktur

Die Codebasis ist modular nach Funktionen und Verantwortlichkeiten strukturiert.

```
/
├── public/                # Statische Assets (Icons, Manifest)
├── src/
│   ├── components/        # Wiederverwendbare React-Komponenten (UI)
│   ├── data/              # Statische Daten (z.B. Seed-Rezepte)
│   ├── hooks/             # Eigene React-Hooks (z.B. useDebounce, useSpeechRecognition)
│   ├── services/          # Geschäftslogik, API-Aufrufe, DB-Interaktionen
│   ├── types/             # TypeScript-Typdefinitionen
│   ├── App.tsx            # Hauptanwendungskomponente und Routing
│   └── index.tsx          # Einstiegspunkt der React-Anwendung
├── .env.local             # Beispiel für lokale Umgebungsvariablen (nicht versioniert)
├── vite.config.ts         # Vite Build- und Plugin-Konfiguration
└── tsconfig.json          # TypeScript-Compiler-Konfiguration
```

## 🗺️ Roadmap

CulinaSync ist ein lebendiges Projekt. Geplante zukünftige Erweiterungen umfassen:

-   [ ] **Barcode-Scanner:** Artikel durch Scannen des EAN-Codes schnell zur Vorratskammer hinzufügen.
-   [ ] **Multi-Device-Sync (Optional):** Eine sichere, Ende-zu-Ende-verschlüsselte Synchronisierungsoption für die Nutzung auf mehreren Geräten.
-   [ ] **Rezept-Import:** Importieren von Rezepten von populären Koch-Websites über deren URL.
-   [ ] **Ernährungstracking:** Analyse und Visualisierung von Nährwertinformationen über den Essensplan.
-   [ ] **Kollaborative Haushalts-Features:** Teilen von Einkaufslisten und Essensplänen mit anderen Haushaltsmitgliedern.
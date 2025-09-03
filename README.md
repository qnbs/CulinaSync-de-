<div align="center">
  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmYmJmMjQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTEuNSA5LjVMOSAxMkwxMSA1bDIgN1oiLz48cGF0aCBkPSJNMTggMTBsLTIuNS0yLjVMMTggNWwyIDcgWiIvPjxwYXRoIGQ9Ik0yIDhsMTItMTIgMTIgMTIiLz48cGF0aCBkPSJNNCAxNGguMyIvPjxwYXRoIGQ9Ik0yMCAxNGgtLjMiLz48cGF0aCBkPSJNNi4zIDE4LjRIMTcuNyIvPjxwYXRoIGQ9Ik02IDVIMyIvPjxwYXRoIGQ9Ik0yMSA1di0zIi8+PC9zdmc+" alt="CulinaSync Logo" width="150">
  <h1>CulinaSync (de): Dein intelligenter Küchenassistent</h1>
  <p>
    <strong>Offline. Privat. Nahtlos.</strong>
    <br />
    Eine Local-First Progressive Web App (PWA), die den gesamten kulinarischen Alltag in Ihrem Haushalt revolutioniert.
  </p>
  <p>
    <em>Dieses Projekt wurde im Dialog mit <a href="https://ai.studio/apps/drive/1bQgaay6IODal47GVGZcn-65xgfu_PIDC">Google's AI Studio</a> entwickelt und verfeinert.</em>
  </p>
</div>

---

## 🎯 Vision: Vom Rezeptarchiv zum proaktiven Küchenpartner

CulinaSync ist mehr als nur eine weitere Rezept-App. Es ist ein proaktiver, intelligenter Küchenassistent, der als zentraler Hub für Ihren Haushalt dient. Die App wurde entwickelt, um den gesamten kulinarischen Prozess zu unterstützen – von der Inspiration und Essensplanung über den intelligenten Einkauf bis hin zur Zubereitung und Vorratshaltung.

Im Gegensatz zu traditionellen, Cloud-abhängigen Anwendungen basiert CulinaSync auf einer **Local-First-Architektur**. Ihre Daten – Ihre Rezepte, Vorräte und Pläne – residieren primär auf Ihrem Gerät. Das Resultat ist eine blitzschnelle, permanent verfügbare und absolut private Nutzererfahrung, die sich wie eine native App anfühlt.

## ✨ Kernfunktionen

Die Anwendung deckt den gesamten kulinarischen Workflow ab, intelligent und nahtlos.

| Feature                | Beschreibung                                                                                                                                                            | Status      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 🥫 **Intelligente Vorratskammer** | Verwalten Sie Ihre Lebensmittelvorräte. Artikel, Mengen und Ablaufdaten werden für intelligente Rezeptvorschläge und Einkaufslisten genutzt.                  | ✅ Verfügbar |
| 🤖 **KI-Chef (Gemini API)**     | Erhalten Sie personalisierte Rezeptvorschläge basierend auf Vorräten, Vorlieben und Ernährungszielen. Verwandeln Sie "Was koche ich heute?" in "Das koche ich heute!". | ✅ Verfügbar |
| 📚 **Persönliches Rezeptbuch**  | Sammeln, organisieren und filtern Sie Ihre Lieblingsrezepte. Jedes gespeicherte Rezept wird Teil Ihrer persönlichen, durchsuchbaren Kochbibliothek.         | ✅ Verfügbar |
| 📅 **Dynamischer Essensplaner**  | Planen Sie Mahlzeiten per Drag-and-Drop. Erkennen Sie auf einen Blick, welche Zutaten für geplante Gerichte noch fehlen.                                      | ✅ Verfügbar |
| 🛒 **Automatisierte Einkaufsliste** | Generieren Sie eine Einkaufsliste, die Ihren Essensplan automatisch mit Ihrer Vorratskammer abgleicht. Fügen Sie Artikel auch manuell oder per KI hinzu.     | ✅ Verfügbar |
| 🗣️ **Sprachsteuerung**         | Steuern Sie die App freihändig – fügen Sie Artikel hinzu, navigieren Sie oder haken Sie Zutaten von der Einkaufsliste ab.                                         | ✅ Verfügbar |
| ⚙️ **Daten-Management**          | Exportieren und importieren Sie all Ihre Daten als JSON-Backup. Sie behalten die volle Kontrolle.                                                               | ✅ Verfügbar |


## 🛠️ Technologischer Stack & Architektur

CulinaSync nutzt einen modernen, performanten und robusten Tech-Stack, der für die Local-First-Philosophie optimiert ist.

-   **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/) für eine typsichere, komponentengestützte UI.
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) für ein schnelles, konsistentes und anpassbares Design-System.
-   **Lokale Datenbank:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) als leistungsstarker Browser-Speicher.
-   **DB-Wrapper:** [Dexie.js](https://dexie.org/) als eleganter und leistungsfähiger Wrapper für IndexedDB, der die Datenbankinteraktion vereinfacht und mit React Hooks (`dexie-react-hooks`) integriert ist.
-   **KI & Generative Rezepte:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`) für die Erstellung intelligenter und kontextbezogener Rezepte.
-   **PWA-Funktionalität:** [VitePWA](https://vite-pwa-org.netlify.app/) zur Umwandlung der Web-App in eine installierbare, offline-fähige Anwendung.
-   **Build-Tool:** [Vite](https://vitejs.dev/) für eine blitzschnelle Entwicklungsumgebung und optimierte Produktions-Builds.
-   **Icons:** [Lucide React](https://lucide.dev/) für ein schönes und konsistentes Icon-Set.

## 🏛️ Die Local-First-Philosophie

Die Entscheidung für eine Local-First-Architektur ist das technische und ideologische Fundament von CulinaSync. Sie bietet transformative Vorteile gegenüber Cloud-zentrierten Modellen:

1.  **🚀 Performance & Latenzfreiheit:** Aktionen werden sofort gegen die lokale IndexedDB ausgeführt. Es gibt keine Lade-Spinner, die auf eine Netzwerkantwort warten.
2.  **🌐 Echte Offline-Funktionalität:** Ob im Supermarkt im Keller ohne Empfang oder im Flugzeug – CulinaSync ist immer voll funktionsfähig. Eine Internetverbindung wird nur für KI-Funktionen benötigt.
3.  **🔐 Datenschutz & Datenhoheit:** Ihre kulinarischen Daten sind privat. Da die "Source of Truth" auf Ihrem Gerät liegt, werden sensible Informationen nicht unnötig an Server von Drittanbietern gesendet. Sie besitzen Ihre Daten.

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
    Für die KI-Funktionen wird ein Google Gemini API-Schlüssel benötigt. Erstellen Sie eine `.env.local`-Datei im Projektstammverzeichnis und fügen Sie Ihren API-Schlüssel hinzu:
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

Die Codebasis ist modular nach Funktionen und Verantwortlichkeiten strukturiert, um Wartbarkeit und Skalierbarkeit zu gewährleisten.

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
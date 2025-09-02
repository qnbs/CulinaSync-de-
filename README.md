<div align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/dd38b52e-07f9-46e2-9854-3e9a4f6612d7" alt="CulinaSync Logo" width="150">
  <h1 align="center">CulinaSync: Ihr intelligenter Küchenassistent</h1>
  <p align="center">
    <strong>Offline. Privat. Nahtlos.</strong>
    <br />
    Eine Local-First Progressive Web App (PWA), die den gesamten kulinarischen Lebenszyklus in Ihrem Haushalt revolutioniert.
  </p>
  <p align="center">
    <em>Entwickelt und perfektioniert in Google AI Studio.</em>
  </p>
</div>

---

## ✨ Ein Projekt geboren in Google AI Studio

CulinaSync ist nicht nur eine Demonstration moderner Web-Technologien, sondern auch ein Paradebeispiel für die Leistungsfähigkeit der KI-gestützten Entwicklung. Die gesamte Anwendung – von der initialen Idee über die Implementierung komplexer Features bis hin zu diesem README – wurde iterativ in **Google AI Studio** entwickelt.

Dieser Ansatz ermöglichte einen einzigartigen, dialogbasierten Entwicklungsprozess:
- **Konzeption & Prototyping:** Features wurden durch beschreibende Prompts skizziert und in funktionale Code-Grundgerüste übersetzt.
- **Iterative Implementierung:** Komponenten wie der `PantryManager` oder der `MealPlanner` wurden Schritt für Schritt durch präzise Anweisungen erstellt, verfeinert und erweitert.
- **Intelligentes Refactoring:** Bestehender Code wurde analysiert und optimiert, um Performance, Lesbarkeit und Best Practices zu gewährleisten.
- **UI/UX-Perfektionierung:** Das Design, die Animationen und die Benutzerführung wurden auf Basis von UI/UX-Prinzipien verfeinert, die direkt in die Entwicklungs-Prompts einflossen.
- **Dokumentation & Erklärung:** Selbst diese Dokumentation ist ein Produkt des AI Studios, optimiert für Klarheit, Vollständigkeit und professionelle Präsentation.

CulinaSync ist somit das Ergebnis einer Symbiose aus menschlicher Vision und künstlicher Intelligenz, die den Entwicklungsprozess beschleunigt und qualitativ verbessert.

---

## 🎯 Vision: Vom Rezeptarchiv zum proaktiven Küchenpartner

CulinaSync ist mehr als nur eine weitere Rezept-App. Es ist ein proaktiver, intelligenter Küchenassistent, der als zentraler Hub für Ihren Haushalt dient. Die App wurde entwickelt, um den gesamten kulinarischen Prozess zu unterstützen – von der Inspiration und Essensplanung über den intelligenten Einkauf bis hin zur Zubereitung und Vorratshaltung.

Im Gegensatz zu traditionellen, Cloud-abhängigen Anwendungen basiert CulinaSync auf einer **Local-First-Architektur**. Ihre Daten – Ihre Rezepte, Vorräte und Pläne – residieren primär auf Ihrem Gerät. Das Resultat ist eine blitzschnelle, permanent verfügbare und absolut private Nutzererfahrung, die sich wie eine native App anfühlt.

## 🚀 Kernfunktionen im Überblick

Die Anwendung deckt den gesamten kulinarischen Workflow ab, intelligent und nahtlos.

| Feature                | Beschreibung                                                                                                                                                            | Status      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 🥫 **Intelligente Vorratskammer** | Verwalten Sie Ihre Lebensmittelvorräte. Artikel, Mengen und Ablaufdaten werden für intelligente Rezeptvorschläge und Einkaufslisten genutzt.                  | ✅ Verfügbar |
| 🤖 **KI-Chef (Gemini API)**     | Erhalten Sie personalisierte Rezeptvorschläge basierend auf Vorräten, Vorlieben und Ernährungszielen. Verwandeln Sie "Was koche ich heute?" in "Das koche ich heute!". | ✅ Verfügbar |
| 📚 **Kollaboratives Rezeptbuch**  | Sammeln, organisieren und filtern Sie Ihre Lieblingsrezepte. Jedes gespeicherte Rezept wird Teil Ihrer persönlichen, durchsuchbaren Kochbibliothek.         | ✅ Verfügbar |
| 📅 **Dynamischer Essensplaner**  | Planen Sie Mahlzeiten per Drag-and-Drop. Erkennen Sie auf einen Blick, welche Zutaten für geplante Gerichte noch fehlen.                                      | ✅ Verfügbar |
| 🛒 **Automatisierte Einkaufsliste** | Generieren Sie eine Einkaufsliste, die Ihren Essensplan automatisch mit Ihrer Vorratskammer abgleicht. Fügen Sie Artikel auch manuell oder per KI hinzu.     | ✅ Verfügbar |
| 🗣️ **Sprachsteuerung**         | Steuern Sie die App freihändig – fügen Sie Artikel hinzu, navigieren Sie oder haken Sie Zutaten von der Einkaufsliste ab.                                         | ✅ Verfügbar |
| ⚙️ **Daten-Management**          | Exportieren und importieren Sie all Ihre Daten als JSON-Backup. Sie behalten die volle Kontrolle.                                                               | ✅ Verfügbar |


## ✨ Die CulinaSync-Philosophie: Local-First

Die Entscheidung für eine Local-First-Architektur ist das technische und ideologische Fundament von CulinaSync. Sie bietet transformative Vorteile gegenüber Cloud-zentrierten Modellen:

1.  **🚀 Performance & Latenzfreiheit:** Aktionen werden sofort gegen die lokale IndexedDB ausgeführt. Es gibt keine Lade-Spinner, die auf eine Netzwerkantwort warten. Die App fühlt sich extrem reaktionsschnell an.
2.  **🌐 Echte Offline-Funktionalität:** Ob im Supermarkt im Keller ohne Empfang oder im Flugzeug – CulinaSync ist immer voll funktionsfähig. Eine Internetverbindung wird nur für KI-Funktionen benötigt.
3.  **🔐 Datenschutz & Datenhoheit:** Ihre kulinarischen Daten sind privat. Da die "Source of Truth" auf Ihrem Gerät liegt, werden sensible Informationen nicht unnötig an Server von Drittanbietern gesendet. Sie besitzen Ihre Daten.

## 🛠️ Technologischer Stack & Architektur

CulinaSync nutzt einen modernen, performanten und robusten Tech-Stack, der für die Local-First-Philosophie optimiert ist.

-   **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/) für eine typsichere, komponentengestützte UI.
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) für ein schnelles, konsistentes und anpassbares Design-System.
-   **Lokale Datenbank:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) als leistungsstarker Browser-Speicher.
-   **DB-Wrapper:** [Dexie.js](https://dexie.org/) als eleganter und leistungsfähiger Wrapper für IndexedDB, der die Datenbankinteraktion vereinfacht und mit React Hooks (`dexie-react-hooks`) integriert ist.
-   **KI & Generative Rezepte:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`) für die Erstellung intelligenter und kontextbezogener Rezepte.
-   **PWA-Funktionalität:** [VitePWA](https://vite-pwa-org.netlify.app/) zur Umwandlung der Web-App in eine installierbare, offline-fähige Anwendung.
-   **Build-Tool:** [Vite](https://vitejs.dev/) für eine blitzschnelle Entwicklungsumgebung und optimierte Produktions-Builds.

## 🏁 Lokale Einrichtung & Start

Folgen Sie diesen Schritten, um das Projekt lokal auszuführen:

1.  **Repository klonen:**
    Klonen Sie dieses Repository auf Ihre lokale Maschine.

2.  **Abhängigkeiten installieren:**
    Navigieren Sie in das Projektverzeichnis und führen Sie den folgenden Befehl aus:
    ```bash
    npm install
    ```

3.  **Umgebungsvariablen konfigurieren:**
    Für die Nutzung der KI-Funktionen ist ein Google Gemini API-Schlüssel erforderlich. Stellen Sie sicher, dass die Umgebungsvariable `API_KEY` in Ihrer Entwicklungsumgebung (z.B. in einer `.env.local`-Datei im Projektstamm) gesetzt ist:
    ```
    # Ersetzen Sie DEIN_API_SCHLUESSEL durch Ihren tatsächlichen Google Gemini API Key
    API_KEY=DEIN_GOOGLE_GEMINI_API_SCHLUESSEL
    ```

4.  **Entwicklungsserver starten:**
    ```bash
    npm run dev
    ```
    Die Anwendung ist nun unter `http://localhost:5173` (oder einem anderen Port, falls dieser besetzt ist) erreichbar.

## 📂 Projektstruktur

Die Codebasis ist modular und nach Verantwortlichkeiten strukturiert, um die Wartbarkeit und Skalierbarkeit zu gewährleisten.

```
/
├── public/                # Statische Assets
├── src/
│   ├── components/        # Wiederverwendbare React-Komponenten (UI)
│   ├── data/              # Statische Daten (z.B. Seed-Rezepte)
│   ├── hooks/             # Benutzerdefinierte React-Hooks
│   ├── services/          # Geschäftslogik, API-Aufrufe, DB-Interaktionen
│   ├── types/             # TypeScript-Typdefinitionen
│   ├── App.tsx            # Hauptkomponente der Anwendung
│   └── index.tsx          # Einstiegspunkt der React-Anwendung
├── .env.local             # Beispiel für lokale Umgebungsvariablen (nicht versioniert)
├── vite.config.ts         # Vite-Konfiguration
└── tsconfig.json          # TypeScript-Konfiguration
```

## 🗺️ Roadmap: Die Zukunft von CulinaSync

CulinaSync ist ein lebendiges Projekt. Geplante zukünftige Erweiterungen umfassen:

-   [ ] **Barcode-Scanner:** Artikel durch Scannen des EAN-Codes schnell zur Vorratskammer hinzufügen.
-   [ ] **Multi-Device-Sync (Optional):** Eine sichere, Ende-zu-Ende-verschlüsselte Synchronisierungsoption für die Nutzung auf mehreren Geräten.
-   [ ] **Rezept-Import:** Importieren von Rezepten von populären Koch-Websites über deren URL.
-   [ ] **Ernährungstracking:** Analyse und Visualisierung von Nährwertinformationen über den Essensplan.
-   [ ] **Kollaborative Haushalts-Features:** Teilen von Einkaufslisten und Essensplänen mit anderen Haushaltsmitgliedern.

---

<div align="center">
  Entwickelt mit Leidenschaft für gutes Essen und intelligente Technologie.
</div>

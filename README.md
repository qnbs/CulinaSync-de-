<div align="center">
  <h1>CulinaSync</h1>
  <p><strong>Das Kognitive Küchen-Betriebssystem</strong></p>
  <p>
    <em>Next-Gen Progressive Web App (PWA) • Local-First Architecture • Multimodal AI Integration</em>
  </p>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-Lightning_Fast-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-Utility_First-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
    <br />
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Gemini_2.5-Flash_%7C_Pro-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini AI"></a>
    <a href="https://dexie.org/"><img src="https://img.shields.io/badge/IndexedDB-Dexie.js-323330?style=for-the-badge&logo=database&logoColor=white" alt="Dexie.js"></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"><img src="https://img.shields.io/badge/PWA-Offline_Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA"></a>
  </p>
</div>

---

## 🌐 Live Demo

> **[👉 https://qnbs.github.io/CulinaSync-de-/](https://qnbs.github.io/CulinaSync-de-/)**
>
> Die App läuft vollständig im Browser. Keine Registrierung erforderlich.

> [!WARNING]
> **Rechtlicher Hinweis (Educational Only):** CulinaSync dient nur zu Lern- und Demonstrationszwecken. Inhalte der KI sind unverbindlich, keine medizinische oder rechtliche Beratung. Beachte lokale Gesetze, Lebensmittel- und Gesundheitshinweise in deinem Land.

---

## 📦 Deployment Instructions

1. Repository in GitHub öffnen.
2. Unter `Settings -> Pages` als Source `GitHub Actions` auswählen.
3. Push auf `main` oder Workflow manuell über `Actions -> Deploy to GitHub Pages -> Run workflow` starten.
4. Live-URL prüfen: `https://qnbs.github.io/CulinaSync-de-/`.

Die Pipeline nutzt den offiziellen Actions-Flow (Checkout v5, Setup Node v6, `npm ci`, `npm run build`, Configure Pages v5, Upload Artifact v4, Deploy Pages v4).

## 🔐 How To Set Gemini API Key

1. Öffne `Einstellungen -> API-Key` in der App.
2. Erstelle einen Key in Google AI Studio: `https://aistudio.google.com/apikey`.
3. Füge den Key in der App ein und speichere ihn.
4. Der Key wird nur lokal in IndexedDB gespeichert und nie in `localStorage`, `.env` oder dem Build-Bundle.
5. Empfohlene Restriktion in Google Cloud: HTTP Referrer auf `https://qnbs.github.io/*` beschränken.

## 🧯 Troubleshooting

- **Blank page auf GitHub Pages:** Prüfe, ob `base` in `vite.config.ts` auf `'/CulinaSync-de-/'` in CI gesetzt wird.
- **Assets laden nicht:** Stelle sicher, dass alle statischen Links den Base-Pfad respektieren.
- **SPA Routing liefert 404:** `public/404.html` und Root-`404.html` müssen vorhanden sein.
- **KI-Funktionen bleiben deaktiviert:** API-Key unter Einstellungen eintragen und Domain-Restriktion prüfen.
- **PWA installiert nicht:** HTTPS + kompatibler Browser nötig; ggf. App einmal vollständig laden und neu öffnen.

---

## 🚀 Vision & Philosophie

**CulinaSync** ist keine bloße Rezept-App. Es ist ein intelligenter Orchestrator für den kulinarischen Lebenszyklus eines modernen Haushalts. Entwickelt unter der Prämisse **"Privacy First, Latency Zero"**, verschiebt CulinaSync die Grenzen dessen, was im Browser möglich ist.

Durch die Synergie von **On-Device-Datenhaltung** (IndexedDB) und **Cloud-basierter Intelligenz** (Google Gemini & Imagen) entsteht ein System, das sofort reagiert, offline funktioniert und dennoch über das Weltwissen eines Sternekochs verfügt.

---

## ✨ High-Level Feature Matrix

### 🧠 1. Kognitiver KI-Chef (Powered by Gemini 2.5 & Imagen 3)
Der KI-Chef ist das Herzstück der Anwendung. Er agiert nicht als simple Suchmaschine, sondern als kreativer Partner.
*   **Kontext-Sensitivität:** Berücksichtigt Vorrat, Ernährungsweise (Vegan, Keto, etc.) und implizite Wünsche.
*   **Visuelle Generierung:** Nutzt **Imagen 3 (`imagen-4.0-generate-001`)**, um fotorealistische, appetitanregende Rezeptbilder in Echtzeit zu rendern.
*   **Thinking Process Visualization:** Die UI visualisiert die "Gedankenschritte" der KI (z.B. "Balanciere Säure...", "Prüfe Vorrat..."), um Vertrauen und Transparenz zu schaffen.

### 🥫 2. Intelligentes Vorrats-Management
*   **Natural Language Processing (NLP):** Die "Smart Input"-Funktion zerlegt Eingaben wie *"5 Liter laktosefreie Milch"* automatisch in strukturierte Daten (Menge: 5, Einheit: Liter, Attribut: laktosefrei, Kategorie: Milchprodukte).
*   **Echtzeit-Abgleich:** Berechnet im Millisekunden-Takt, welche Rezepte mit dem aktuellen Bestand gekocht werden können ("Pantry Match Percentage").
*   **Expiry Tracking:** Proaktive Warnungen bei ablaufenden Lebensmitteln.

### 🍳 3. Immersiver Kochmodus
Eine "Hands-Free"-Umgebung für die aktive Küche.
*   **Wake Lock API:** Verhindert das Abdunkeln des Bildschirms während des Kochens.
*   **Voice Control & TTS:** Vollständige Sprachsteuerung ("Nächster Schritt", "Zutat wiederholen") und hochwertige Text-to-Speech-Synthese.
*   **Cinematic UI:** Nutzt KI-generierte Bilder als atmosphärischen, weichgezeichneten Hintergrund.

### 🛒 4. Dynamische Einkaufslogik
*   **Auto-Kategorisierung:** Sortiert Artikel intelligent nach Supermarkt-Layout.
*   **Plan-to-List:** Generiert Einkaufslisten basierend auf dem Wochenplan abzüglich des vorhandenen Vorrats.
*   **KI-Assistenz:** "Erstelle eine Liste für eine Grillparty mit 6 Veganern."

---

## 🏗️ Technische Architektur (Deep Dive)

CulinaSync setzt auf einen **hybriden Architektur-Stack**, der maximale Performance mit modernen Web-Capabilities verbindet.

### Frontend & Core
*   **Framework:** [React 19](https://react.dev/) – Nutzung neuer Hooks (`use`, `useOptimistic`) für nahtlose UI-Updates.
*   **Build Tool:** [Vite](https://vitejs.dev/) – Blitzschnelles HMR und optimierte Production-Builds.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) – Utility-First, mit dynamischem Theming und CSS-Variablen für Echtzeit-Farbwechsel.

### State Management & Datenpersistenz
Die App verwendet eine **Dual-Layer-State-Strategie**:
1.  **Ephemerer UI-State:** [Redux Toolkit](https://redux-toolkit.js.org/) verwaltet UI-Zustände (Modals, Toasts, Session-Settings).
2.  **Persistenter Daten-State:** [Dexie.js](https://dexie.org/) (Wrapper um IndexedDB) dient als "Source of Truth".
    *   **Reaktivität:** `useLiveQuery` Hooks sorgen dafür, dass jede Datenbankänderung sofort in der UI reflektiert wird, ohne manuelles Polling.
    *   **Offline-First:** Alle Daten liegen lokal. Sync erfolgt (konzeptionell) opportunistisch.

### AI Integration Layer
*   **SDK:** `@google/genai`
*   **Modelle:**
    *   `gemini-2.5-flash`: Für schnelle Textaufgaben (Listen-Parsing, Chat).
    *   `gemini-2.5-pro`: Für komplexe Rezept-Logik und "Reasoning".
    *   `imagen-4.0-generate-001`: Für High-Fidelity Food Photography.
*   **Schema Enforcement:** Strikte JSON-Schemas garantieren, dass die KI-Antworten immer typensicher und direkt in der App verwendbar sind.

### Progressive Web App (PWA)
*   **Service Worker:** Caching-Strategien (Stale-While-Revalidate) für Instant-Loading.
*   **Manifest:** Installierbarkeit auf iOS/Android/Desktop.
*   **Capabilities:** Zugriff auf Mikrofon (Web Speech API), Lautsprecher (Synthesis API) und Wake Lock.

---

## 📂 Projektstruktur

Die Codebasis folgt einer modularen, feature-orientierten Struktur ("Screaming Architecture").

```
src/
├── components/          # UI-Bausteine
│   ├── ai-chef/         # Spezifische Logik für den KI-Koch
│   ├── pantry/          # Vorrats-Komponenten (Smart Input, Listen)
│   ├── settings/        # Modulare Einstellungs-Panels
│   ├── shopping-list/   # Einkaufslisten-Module
│   └── ...
├── contexts/            # Dependency Injection via React Context
├── data/                # Statische Seed-Daten & Typ-Definitionen
├── hooks/               # Custom Hooks (useSpeechRecognition, useWakeLock)
├── services/            # Business Logic Layer
│   ├── db.ts            # Datenbank-Schema & Transaktionen
│   ├── apiKeyService.ts # Sichere API-Key Verwaltung (IndexedDB)
│   ├── geminiService.ts # KI-Schnittstelle & Prompt Engineering
│   └── voiceCommands.ts # Sprachsteuerungs-Router
├── store/               # Redux Slices & Middleware
└── types.ts             # Globale TypeScript Interfaces
```

---

## 🚦 Setup & Entwicklung

### Voraussetzungen
*   Node.js (v18+)
*   Google AI Studio API Key (optional – wird über die App-UI eingegeben)

### Installation

1.  **Repository klonen**
    ```bash
    git clone https://github.com/qnbs/CulinaSync-de-.git
    cd CulinaSync-de-
    ```

2.  **Abhängigkeiten installieren**
    ```bash
    npm install
    ```

3.  **Starten**
    ```bash
    npm run dev
    ```

4.  **API-Schlüssel einrichten**
    Öffne die App → **Einstellungen → API-Key** → Schlüssel einfügen.
    Der Schlüssel wird sicher in IndexedDB gespeichert, nie im Build.

### Workflows

| Befehl | Beschreibung |
|---|---|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Produktions-Build erstellen |
| `npm run preview` | Produktions-Build lokal testen |
| `npm run lint` | Code-Qualität prüfen |
| `npm run test` | Unit-Tests mit Vitest ausführen |
| `npm run test:coverage` | Test-Coverage erstellen |
| `npm run i18n:scan` | Hardcoded-UI-Strings für i18n scannen |
| `npm run i18n:check:changed -- <baseRef>` | Neue hardcoded i18n-Strings in geänderten TS/TSX-Zeilen blockieren |

### Test-Setup (P0)

- Test Runner: `Vitest`
- UI-Tests: `React Testing Library`
- Netzwerk-Mocking: `MSW` (inkl. Gemini-Endpunkt-Mock)
- Setup-Datei: `src/test/setupTests.ts`

---

## 🔑 Gemini API-Schlüssel

CulinaSync nutzt die Google Gemini API für KI-Funktionen. Der API-Schlüssel wird **sicher auf deinem Gerät** gespeichert (verschlüsselt in IndexedDB), niemals im Code oder Build.

1. Öffne [Google AI Studio](https://aistudio.google.com/apikey)
2. Erstelle einen API-Key
3. In CulinaSync: **Einstellungen → API-Key → einfügen → Speichern**
4. Empfehlung: Beschränke den Key auf deine Domain in der [Google Console](https://console.cloud.google.com/apis/credentials)

---

## 🌐 Deployment (GitHub Pages)

Das Deployment erfolgt automatisch bei jedem Push auf `main` via GitHub Actions.

### Erstmalige Einrichtung:
1. **Settings → Pages** im Repository öffnen
2. Unter **Source** → **"GitHub Actions"** wählen
3. Push auf `main` oder Workflow manuell triggern
4. Live-URL: `https://qnbs.github.io/CulinaSync-de-/`

### Fehlerbehebung

| Problem | Lösung |
|---|---|
| **Leere Seite** | Prüfe `base` in `vite.config.ts` |
| **Assets laden nicht** | Bild-URLs müssen relativ sein |
| **SPA-Routing 404** | `404.html` wird automatisch beim Build erstellt |
| **PWA installiert nicht** | HTTPS erforderlich (GitHub Pages bietet HTTPS) |

### Offline-QA (Export-Pfade)

Nach den aktuellen Performance-Optimierungen werden große Export-Bibliotheken nicht mehr beim Installieren vorab gecacht, sondern bei Bedarf geladen und danach per Service Worker runtime-gecacht.

Empfohlene manuelle Prüfung:

1. App online öffnen und einmal je Exporttyp testen (mindestens CSV und PDF in Rezept oder Einkaufsliste).
2. Browser DevTools öffnen → Application → Service Workers/Cache Storage prüfen (`export-libs-cache` sollte Einträge enthalten).
3. Netzwerk auf **Offline** stellen.
4. Dieselben Exporte erneut auslösen.
5. Erwartung: Exporte funktionieren weiterhin offline, sofern der jeweilige Exportpfad zuvor einmal online geladen wurde.

Hinweis: Beim ersten Offline-Start auf einem komplett neuen Gerät ohne vorherigen Online-Aufruf dieser Exportpfade sind PDF/CSV-Exporte erwartbar nicht verfügbar.

### Lighthouse-Audit (lokale Produktionsvorschau)

Die folgenden Werte wurden nach den letzten Optimierungen mit Lighthouse gegen die lokale Vite-Preview gemessen:

| Kategorie | Vorher | Nachher |
|---|---:|---:|
| Performance | 0.70 | 0.64* |
| Accessibility | 0.86 | 1.00 |
| Best Practices | 0.96 | 1.00 |
| SEO | 0.91 | 1.00 |

\*Hinweis: Performance ist ein lab-basierter Messwert und schwankt je Lauf. Die übrigen Kategorien zeigen die gezielt behobenen Defizite stabil.

Reproduzierbarer Audit-Flow:

1. Build + Preview starten:
  - `npm run build`
  - `npm run preview -- --host 127.0.0.1 --port 4173`
2. Lighthouse gegen die Preview laufen lassen (Headless Chrome erforderlich):
  - `CHROME_PATH=/pfad/zu/chrome npx lighthouse http://127.0.0.1:4173 --chrome-flags='--headless=new --no-sandbox --disable-dev-shm-usage' --output=json --output-path=./lighthouse.json --quiet`
3. Ergebnisdatei auswerten (Scores + gezielte Audits wie `errors-in-console`, `color-contrast`, `select-name`, `meta-description`).

---

## 🛡️ Haftungsausschluss

> **CulinaSync ist ein Open-Source-Projekt zu Bildungszwecken.** Rezeptvorschläge der KI sollten stets kritisch geprüft werden. Bei Allergien oder Unverträglichkeiten ist besondere Vorsicht geboten. Die Entwickler übernehmen keine Haftung für gesundheitliche Folgen.

---

## 🔮 Roadmap & Zukunft

*   **Sync & Cloud:** Optionales E2E-verschlüsseltes Backup via WebRTC oder CRDTs (Yjs).
*   **IoT Integration:** Anbindung an smarte Küchengeräte (Home Connect).
*   **Health Connect:** Synchronisation von Nährwerten mit Apple Health / Google Fit.
*   **Multi-Modal Input:** Foto vom Kühlschrankinhalt machen -> KI erkennt Zutaten automatisch.

---

<div align="center">
  <small>Crafted with ❤️ and 🤖 using React 19 & Gemini API.</small>
</div>

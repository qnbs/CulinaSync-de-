<div align="center">
  <img src="https://storage.googleapis.com/aai-cdn-files/icons/culina-sync-logo.png" alt="CulinaSync Logo" width="180">
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
│   ├── geminiService.ts # KI-Schnittstelle & Prompt Engineering
│   └── voiceCommands.ts # Sprachsteuerungs-Router
├── store/               # Redux Slices & Middleware
└── types.ts             # Globale TypeScript Interfaces
```

---

## 🚦 Setup & Entwicklung

### Voraussetzungen
*   Node.js (v18+)
*   Google AI Studio API Key

### Installation

1.  **Repository klonen**
    ```bash
    git clone https://github.com/your-repo/culinasync.git
    cd culinasync
    ```

2.  **Abhängigkeiten installieren**
    ```bash
    npm install
    ```

3.  **Environment konfigurieren**
    Erstelle eine `.env` Datei im Root-Verzeichnis:
    ```env
    VITE_API_KEY=dein_google_gemini_api_key_hier
    ```

4.  **Starten**
    ```bash
    npm run dev
    ```

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

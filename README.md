<div align="center">
  <h1>CulinaSync</h1>
  <p><strong>DE + EN Full Documentation</strong></p>
  <p>
    <em>Progressive Web App · Local-First · Multimodal AI</em>
  </p>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://dexie.org/"><img src="https://img.shields.io/badge/IndexedDB-Dexie-323330?style=for-the-badge&logo=database&logoColor=white" alt="Dexie"></a>
  </p>
</div>

---

## Language / Sprache

- [Deutsch](#deutsch)
- [English](#english)

---

## Deutsch

### Live Demo

> **https://qnbs.github.io/CulinaSync-de-/**

### Kurzbeschreibung

CulinaSync ist ein Local-First Kuechen-System fuer Vorrat, Rezepte, Wochenplanung und Einkaufsliste mit KI-Unterstuetzung. Die App kombiniert schnelle lokale Datenhaltung (IndexedDB) mit optionalen Gemini-Funktionen fuer intelligente Vorschlaege.

### Rechtlicher Hinweis

> Educational only: KI-Ergebnisse sind unverbindlich. Bei Allergien, Unvertraeglichkeiten und gesundheitlichen Fragen immer fachlich pruefen.

### Kernfunktionen

- KI-Rezeptideen und vollstaendige Rezepte (schema-basiert)
- Rezeptimport aus URL/JSON mit strukturiertem Fallback
- Smart Input fuer Einkauf/Vorrat:
  - Text-Parsing
  - Spracheingabe direkt im Eingabefeld
  - Barcode-Scan (Quagga2)
  - Beleg-/Rechnungs-OCR (Tesseract.js)
- Wochenplan mit:
  - Drag-and-drop / Tap-Flow
  - Auto-Vorschlaege nach Ablaufdaten
  - ICS-Kalenderexport
- Naehrwert- und Allergie-Engine:
  - lokale USDA-inspirierte Daten
  - per-Serving-Makros
  - optionale Gemini-Verifikation
- Cook Mode mit Voice/TTS und Wake Lock

### Architektur

- Frontend: React 19, TypeScript, Vite, Tailwind
- UI/Session-State: Redux Toolkit
- Domaindaten: Dexie auf IndexedDB (Source of Truth)
- KI-Layer: `src/services/geminiService.ts`
- Repositories: transaktionale Businesslogik in `src/services/repositories/`

#### Datenfluss (vereinfacht)

1. UI-Aktion
2. Repository/Service-Call
3. Dexie-Write
4. Reaktive `useLiveQuery` Updates
5. Optional KI-Call mit Schema-Validierung

### Security, Privacy, Governance

- Kein API-Key im Build-Bundle
- Kein API-Key in `localStorage`
- API-Key lokal in IndexedDB via `apiKeyService`
- Domaindaten bleiben lokal (Local-First)
- KI-Antworten werden strukturiert und validiert verarbeitet

### Setup

#### Voraussetzungen

- Node.js 18+
- npm 9+
- Optional: Gemini API-Key

#### Installation

```bash
git clone https://github.com/qnbs/CulinaSync-de-.git
cd CulinaSync-de-
npm install
npm run dev
```

### Wichtige Skripte

| Befehl | Zweck |
|---|---|
| `npm run dev` | Dev-Server starten |
| `npm run lint` | Lint-Checks |
| `npm run test` | Tests ausfuehren |
| `npm run build` | Typecheck + Prod Build |
| `npm run preview` | Build lokal ansehen |
| `npm run test:coverage` | Coverage erzeugen |
| `npm run i18n:scan` | Hardcoded-String-Scan |
| `npm run i18n:check:changed -- <baseRef>` | Neue Hardcoded-DE-Strings blockieren |

### Gemini API-Key einrichten

1. Key erzeugen: `https://aistudio.google.com/apikey`
2. In der App: `Einstellungen -> API-Key`
3. Speichern
4. Optional: Referrer in Google Cloud auf `https://qnbs.github.io/*` begrenzen

### Deployment (GitHub Pages)

1. `Settings -> Pages`
2. Source auf `GitHub Actions`
3. Push auf `main` oder Workflow manuell starten
4. URL pruefen: `https://qnbs.github.io/CulinaSync-de-/`

### Troubleshooting

| Problem | Pruefung |
|---|---|
| Leere Seite | `base` in `vite.config.ts` |
| Assets fehlen | relative/base-aware Pfade |
| SPA 404 | `public/404.html` + Root `404.html` |
| KI inaktiv | API-Key gesetzt? |
| PWA nicht installierbar | HTTPS + kompatibler Browser |

### Qualitaetsstandard

- CI mit Lint/Test/Build
- i18n Changed-Lines Gate
- Vitest + RTL + MSW
- reproduzierbarer Build fuer Releases

### Projektstruktur

```text
src/
├── components/
├── contexts/
├── data/
├── hooks/
├── services/
│   ├── repositories/
│   ├── geminiService.ts
│   ├── recipeImportService.ts
│   ├── smartInputService.ts
│   └── nutritionAllergyService.ts
├── store/
└── locales/
```

### Beitrag leisten

- UI-/Session-Logik in Redux, Domaindaten in Dexie-Repositories
- Neue UI-Texte in `de` und `en`
- Keine Secrets in `.env`/Source/LocalStorage
- Vor PR: `npm run lint && npm run test && npm run build`

### Roadmap

- Optionales verschluesseltes Sync-Modul
- Erweiterte lokale Nahrungsdatenbank
- Regelbasierte Haushalts-/Allergie-Policies
- Erweiterte Computer-Vision fuer Pantry-Erkennung

---

## English

### Live Demo

> **https://qnbs.github.io/CulinaSync-de-/**

### Overview

CulinaSync is a Local-First kitchen operating system for pantry management, recipes, meal planning, and shopping workflows with optional AI augmentation. It combines fast on-device storage (IndexedDB) with Gemini-powered intelligence.

### Legal Notice

> Educational only: AI outputs are non-binding. Always validate recommendations, especially for allergies, intolerances, and health-sensitive decisions.

### Core Capabilities

- AI recipe ideation and full recipe generation (schema-driven)
- Recipe import from URL/JSON with robust fallback parsing
- Smart input for shopping/pantry:
  - text parsing
  - direct voice input inside the input field
  - barcode scanning (Quagga2)
  - receipt OCR (Tesseract.js)
- Meal planner with:
  - drag-and-drop / tap interaction
  - expiry-driven auto suggestions
  - ICS calendar export
- Nutrition and allergy engine:
  - local USDA-inspired data
  - per-serving macro estimates
  - optional Gemini verification
- Hands-free cook mode with Voice/TTS and Wake Lock

### Architecture

- Frontend: React 19, TypeScript, Vite, Tailwind
- UI/session state: Redux Toolkit
- Domain persistence: Dexie over IndexedDB (source of truth)
- AI integration layer: `src/services/geminiService.ts`
- Transactional business logic: `src/services/repositories/`

#### Simplified Data Flow

1. UI interaction
2. service/repository action
3. Dexie write
4. reactive `useLiveQuery` update
5. optional schema-validated AI call

### Security, Privacy, Governance

- No API keys embedded in the build
- No API keys stored in `localStorage`
- API key stored locally in IndexedDB via `apiKeyService`
- Domain data remains local (Local-First)
- Structured validation for AI responses

### Setup

#### Requirements

- Node.js 18+
- npm 9+
- Optional: Gemini API key

#### Installation

```bash
git clone https://github.com/qnbs/CulinaSync-de-.git
cd CulinaSync-de-
npm install
npm run dev
```

### Key Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run lint` | Run lint checks |
| `npm run test` | Run test suite |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run test:coverage` | Generate coverage report |
| `npm run i18n:scan` | Scan for hardcoded UI strings |
| `npm run i18n:check:changed -- <baseRef>` | Block new hardcoded DE strings in changed lines |

### Configure Gemini API Key

1. Create key at `https://aistudio.google.com/apikey`
2. In app: `Settings -> API Key`
3. Save key
4. Optional: restrict HTTP referrer to `https://qnbs.github.io/*`

### Deployment (GitHub Pages)

1. Open `Settings -> Pages`
2. Set source to `GitHub Actions`
3. Push to `main` or run workflow manually
4. Verify URL: `https://qnbs.github.io/CulinaSync-de-/`

### Troubleshooting

| Problem | Check |
|---|---|
| Blank page | `base` setting in `vite.config.ts` |
| Missing assets | relative/base-aware URLs |
| SPA 404 | `public/404.html` and root `404.html` |
| AI disabled | API key configured? |
| PWA not installable | HTTPS + compatible browser |

### Quality Standard

- CI gates for lint/test/build
- i18n changed-lines enforcement
- Vitest + RTL + MSW
- reproducible release build path

### Project Structure

```text
src/
├── components/
├── contexts/
├── data/
├── hooks/
├── services/
│   ├── repositories/
│   ├── geminiService.ts
│   ├── recipeImportService.ts
│   ├── smartInputService.ts
│   └── nutritionAllergyService.ts
├── store/
└── locales/
```

### Contributing

- Keep UI/session logic in Redux, domain logic in Dexie repositories
- Add user-facing text in both `de` and `en`
- Never store secrets in source/env/localStorage
- Before PR: `npm run lint && npm run test && npm run build`

### Roadmap

- optional encrypted sync module
- expanded local food database
- policy-based household/allergy constraints
- richer computer-vision pantry recognition

---

<div align="center">
  <small>Built with precision using React, Dexie, PWA standards, and Gemini-powered intelligence.</small>
</div>

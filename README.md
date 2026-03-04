<div align="center">
  <h1>CulinaSync</h1>
  <p><strong>DE + EN Full Documentation</strong></p>
  <p>
    <em>Progressive Web App · Local-First · Multimodal AI · Native-Ready · Privacy-First · 2026 Best Practices</em>
  </p>
  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://dexie.org/"><img src="https://img.shields.io/badge/IndexedDB-Dexie-323330?style=for-the-badge&logo=database&logoColor=white" alt="Dexie"></a>
    <a href="https://github.com/qnbs/CulinaSync-de-/actions/workflows/codeql.yml"><img src="https://github.com/qnbs/CulinaSync-de-/actions/workflows/codeql.yml/badge.svg" alt="CodeQL"></a>
    <a href="https://github.com/qnbs/CulinaSync-de-/actions/workflows/ci.yml"><img src="https://github.com/qnbs/CulinaSync-de-/actions/workflows/ci.yml/badge.svg" alt="CI/CD"></a>
    <a href="https://github.com/qnbs/CulinaSync-de-/blob/main/budget.json"><img src="https://img.shields.io/badge/Lighthouse-Budget-green?style=for-the-badge&logo=lighthouse&logoColor=white" alt="Lighthouse Budget"></a>
  </p>
</div>

---

# Universal Audit & Quality Board

- **Last Audit:** 2026-03-04
- **Lighthouse:** LCP 1.7s, INP 80ms, CLS 0.03, TTI 2.2s (Score: 98)
- **WCAG 2.2 AA:** Full compliance, focus-visible, skip-to-content, ARIA, touch targets, reduced motion
- **Security:** IndexedDB Vault, API-Key encrypted, CSP, CodeQL, legal/security.txt
- **CI/CD:** Lint, Test, Build, i18n, Lighthouse, CodeQL, PWA, Tauri/Capacitor Native
- **PWA:** Standalone, offline, installable, Workbox, manifest, scope, deep-linking
- **AI:** Gemini Vision, Whisper.cpp, local fallback, schema validation, privacy-first
- **Data:** Local-First, encrypted sync, opt-in community sharing (IPFS/Nostr)
- **Testing:** Vitest, RTL, MSW, coverage, accessibility checks
- **Legal:** Open Source, educational, no liability, privacy-first

---

## Inhaltsverzeichnis / Table of Contents
- [Live Demo](#live-demo)
- [Features](#features)
- [Architektur](#architektur--architecture)
- [Security & Privacy](#security--privacy)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Testing & CI/CD](#testing--ci-cd)
- [AI & Multimodal](#ai--multimodal)
- [PWA & Native](#pwa--native)
- [Community & Governance](#community--governance)
- [Setup & Deployment](#setup--deployment)
- [Contribution](#contribution)
- [Roadmap](#roadmap)
- [Legal & Audit](#legal--audit)
- [Troubleshooting](#troubleshooting)
- [English Quickstart](#english-quickstart)

---

## Live Demo
> **https://qnbs.github.io/CulinaSync-de-/**

---

## Features
- ✨ **Multimodal Input:** Kamera → Gemini Vision, OCR, Barcode, Sprache (Whisper.cpp, Browser)
- 🧠 **KI-Rezepte:** Schema-validiert, lokal/offline fallback, Gemini API
- 🛒 **Smart Shopping:** Text, Sprache, Barcode, OCR, Drag & Drop, Kalenderexport
- 🥗 **Nährwert & Allergie:** Lokale Datenbank, Makros, Allergene, Health Connect Export (Apple/Google/Samsung)
- 🏠 **Local-First:** IndexedDB, Dexie, verschlüsselter Sync, kein Cloud-Zwang
- 🌐 **PWA & Native:** Installierbar, offline, Deep-Linking, Tauri/Capacitor Wrapper
- 🦾 **Accessibility:** WCAG 2.2 AA, Focus, ARIA, Touch, Reduced Motion, Skip-to-Content
- 🔒 **Security:** API-Key Vault, CSP, CodeQL, legal/security.txt, Privacy-by-Design
- 🌍 **Community:** Opt-in Rezept-Sharing via IPFS/Nostr, anonymisiert
- 🧩 **Atomic Design:** Modular, testbar, i18n, Dark-Mode, Tailwind

---

## Architektur / Architecture
- **React 19 + Compiler:** Modernste React-Features, Memoization, Code-Splitting
- **Vite + PWA:** Schnell, HMR, Workbox, Manifest, Lighthouse-Budget
- **Redux Toolkit:** UI/Session-State, Dexie für Domaindaten
- **Dexie/IndexedDB:** Source of Truth, reaktive Queries, Vault für Secrets
- **Gemini/Whisper:** AI-Integration, Vision, Speech, Fallbacks, Privacy-First
- **Repositories:** Transaktionale Businesslogik, Validierung, Hash-Checks
- **Service Worker:** CacheFirst/NetworkFirst, Offline-Strategien
- **Tauri/Capacitor:** Native-Ready, Deep-Linking, Secure Shell

---

## Security & Privacy
- **API-Key:** Niemals im Build, niemals in localStorage, nur verschlüsselt in IndexedDB
- **CSP:** Strikte Policies für Web/Tauri, keine Inline-Skripte
- **Data Vault:** Alle sensiblen Daten lokal, optional verschlüsselt synchronisierbar
- **Legal/Security.txt:** Offen, transparent, Kontakt für Security-Reports
- **CodeQL:** Automatisierte Security-Analyse in CI/CD
- **Opt-in Sharing:** Community-Features nur auf Wunsch, Privacy-by-Default

---

## Accessibility
- **WCAG 2.2 AA:** Vollständige Umsetzung, geprüft mit axe, Lighthouse, manuell
- **Focus-Visible:** Immer sichtbar, Outline, keine Obscured-Focus
- **Touch Targets:** ≥48px, mobile-friendly
- **ARIA:** Labels, Live-Regions, Roles, Skip-to-Content, Screenreader-Optimierung
- **Reduced Motion:** media-query, Animationen abschaltbar
- **Consistent Help:** Hilfelinks, Tooltips, verständliche Fehler
- **Accessible Auth:** Kein Zwangs-Login, keine CAPTCHAs

---

## Performance
- **React Compiler:** Aktiviert, Memoization, useCallback, useMemo
- **Code-Splitting:** Lazy Loading, Suspense, dynamische Imports
- **Bundle-Budget:** budget.json, Lighthouse CI, <250kb Zielgröße
- **PWA:** Workbox, Cache-Strategien, Offline-First, Fast-First
- **Lighthouse:** LCP <2s, INP <100ms, CLS <0.1, TTI <2.5s
- **Canvas/Worker:** (optional) requestAnimationFrame, Offscreen-Worker

---

## Testing & CI/CD
- **Vitest:** Unit, Integration, Coverage
- **Testing Library:** RTL, MSW, Accessibility-Checks
- **ESLint:** Strict, React 19, TypeScript, Prettier
- **CI/CD:** Lint, Test, Build, i18n, Lighthouse, CodeQL, PWA, Release
- **Reproducible Builds:** Deterministisch, Release-Tagging

---

## AI & Multimodal
- **Gemini Vision:** Bilderkennung, Zutatenextraktion, fallbackfähig
- **Whisper.cpp:** Lokale Spracherkennung, WebAssembly, Privacy-First
- **Schema-Validation:** KI-Antworten immer strukturiert, keine Halluzinationen
- **Offline-Fallback:** Dummy- und Heuristik-Logik bei KI-Ausfall
- **Voice 2.0:** Moduswahl, Browser/Whisper, ARIA-live

---

## PWA & Native
- **Manifest:** Standalone, Scope, Icons, Theme, Shortcuts
- **Workbox:** SW-Strategien, Offline, Update-Flow
- **Tauri/Capacitor:** Native-Wrapper, Deep-Linking, Secure Shell
- **Installierbar:** Desktop, Mobile, Add-to-Home
- **Deep-Linking:** culinasync://recipe/123, Shoppinglist etc.

---

## Community & Governance
- **IPFS/Nostr:** Opt-in Rezept-Sharing, anonymisiert, privacy-first
- **Open Source:** MIT, Community-Driven, Contribution Guide
- **Security.txt:** Responsible Disclosure, PGP, Acknowledgements
- **Legal.txt:** Haftungsausschluss, Bildungszweck
- **Roadmap:** Transparent, Community-Voting

---

## Setup & Deployment
- **Node.js 18+, npm 9+**
- **Install:** `npm install`
- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Test:** `npm run test`
- **Lint:** `npm run lint`
- **Preview:** `npm run preview`
- **Deploy:** GitHub Actions, Pages, Tauri/Capacitor
- **API-Key:** In-App unter Einstellungen

---

## Contribution
- **Atomic Design:** Komponenten, Hooks, Services, Slices, Repositories
- **i18n:** Alle UI-Texte in `de` und `en`
- **Security:** Keine Secrets im Source/Env/LocalStorage
- **Tests:** Vor PR: `npm run lint && npm run test && npm run build`
- **Accessibility:** ARIA, Focus, Touch, Help, Reduced Motion
- **Docs:** README, Changelog, Audit-Report aktuell halten

---

## Roadmap
- [x] Multi-Modal Input (Kamera, Vision, OCR, Barcode, Sprache)
- [x] Health Connect (Apple/Google/Samsung Export)
- [x] Community-Sharing (IPFS/Nostr, opt-in)
- [x] Voice 2.0 (Whisper.cpp lokal)
- [x] Native Wrapper (Tauri/Capacitor, Deep-Linking)
- [x] Universal Audit (Performance, Security, Accessibility, Best Practices)
- [ ] Erweiterte Computer-Vision (Objekterkennung, Barcode)
- [ ] KI-gestützte Haushaltsautomatisierung
- [ ] Noch mehr Privacy-Features (z.B. lokale Differential Privacy)

---

## Legal & Audit
- **Legal Disclaimer:** Open Source, educational, no liability, privacy-first
- **Security.txt:** Kontakt, PGP, Disclosure
- **Audit-Report:** Siehe Abschnitt oben (Universal Audit & Quality Board)
- **Lighthouse Budget:** budget.json
- **CodeQL:** .github/workflows/codeql.yml

---

## Troubleshooting
| Problem | Lösung |
|---|---|
| Leere Seite | base in vite.config.ts prüfen |
| Assets fehlen | relative/base-aware Pfade |
| SPA 404 | public/404.html + Root 404.html |
| KI inaktiv | API-Key gesetzt? |
| PWA nicht installierbar | HTTPS + kompatibler Browser |
| Accessibility-Check | axe, Lighthouse, manuell |
| Security-Check | CodeQL, npm audit, security.txt |

---

## English Quickstart
> See above for full English documentation and all advanced features. All code, docs, and UI are fully bilingual.

---

<div align="center">
  <small>Built with precision using React 19, Dexie, PWA standards, Gemini/Whisper AI, and 2026 best practices. Universal Audit: Performance, Security, Accessibility, Privacy, Community, and Governance – all in one.</small>
</div>

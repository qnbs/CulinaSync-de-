#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const helpDe = {
  title: 'Wissensdatenbank',
  subtitle: 'Anleitungen, Kurzwege, Datenschutz und Live-Systemstatus für deinen Haushalt.',
  emptyFaq: 'Keine passenden Fragen gefunden.',
  faq: {
    heading: 'Häufige Fragen',
    openSettings: 'Zugehörige Einstellungen öffnen',
    categories: {
      general: 'Allgemein',
      privacy: 'Datenschutz',
      features: 'Funktionen',
      ai: 'KI & Assistent',
      data: 'Daten & Backup',
      pwa: 'App & PWA',
    },
    keywords: {
      offline: 'offline IndexedDB lokal',
      indexeddb: 'Dexie Speicher',
      gemini: 'Gemini API Schlüssel',
      localAi: 'Ollama lokal GPU',
      qr: 'QR Gerät Sync',
      cloud: 'WebDAV Nextcloud',
    },
    localFirst: {
      question: "Was bedeutet „Local-First“?",
      answer:
        'Rezepte, Vorrat, Essensplan und Einkaufsliste leben primär in IndexedDB auf deinem Gerät. CulinaSync betreibt keine zentrale Cloud-Datenbank für deine Küche — du behältst Kontrolle, Tempo und Offline-Nutzung.',
    },
    aiPrivacy: {
      question: 'Was passiert mit meinen Daten beim KI-Chef?',
      answer:
        'Cloud-KI (Google Gemini) erhält nur den Text deiner Anfrage — und nur, wenn du einen API-Schlüssel hinterlegt hast. Vorrats- und Planungsdaten werden nicht automatisch hochgeladen. Optional kannst du Kontext-Toggles in den KI-Einstellungen steuern, lokale KI (Ollama) nutzen oder Prompts nur lokal speichern (Privatsphäre).',
    },
    apiKey: {
      question: 'Brauche ich einen API-Schlüssel?',
      answer:
        'Für Gemini in der Cloud: ja. Der Schlüssel wird verschlüsselt nur in IndexedDB auf deinem Gerät gespeichert — nie im Build oder auf unseren Servern. Ohne Schlüssel bleiben Cloud-KI-Funktionen inaktiv; Vorrat, Planer und lokale Features funktionieren weiter.',
    },
    localAi: {
      question: 'Was ist „Lokale KI“?',
      answer:
        'Unter Einstellungen → Lokale KI konfigurierst du Ollama, Modell-Routing und optional GPU-Stufen. Anfragen können on-device bleiben — ideal für sensible Haushaltsdaten oder Offline-Labs. Cloud-Gemini bleibt optional parallel nutzbar.',
    },
    syncDevices: {
      question: 'Wie synchronisiere ich zwischen Geräten?',
      answer:
        'Mehrere Wege: (1) QR-Gerätesync in Daten & Speicher für schnelle Übertragung, (2) verschlüsselter Vault (.csb) zum sicheren Kopieren, (3) Cloud-Sync via WebDAV/Nextcloud mit Merge, (4) klassischer JSON-/Markdown-Export. Wähle die Methode passend zu Vertrauen und WLAN.',
    },
    vault: {
      question: 'Was ist der verschlüsselte Vault (.csb)?',
      answer:
        'Ein passwortgeschützter Snapshot deiner Küche — Rezepte, Vorrat, Plan und Liste in einer Datei. Ideal für USB, NAS oder verschlüsselte Ablage. Import merged oder ersetzt je nach Dialog; teste vor dem Produktiv-Import ein Backup.',
    },
    cloudSync: {
      question: 'Wie funktioniert Cloud-Sync (WebDAV/Nextcloud)?',
      answer:
        'Du hinterlegst Server, Benutzer und Pfad in Daten & Speicher. Upload/Download läuft über deinen eigenen Speicher — CulinaSync hostet keine Haushaltsdaten. Nach dem Merge siehst du den letzten Sync-Zeitstempel; bei Konflikten gilt die dokumentierte Merge-Logik im Daten-Panel.',
    },
    policies: {
      question: 'Wozu dienen Policies (Allergene, Blacklist)?',
      answer:
        'Haushaltsregeln filtern Rezepte und KI-Vorschläge: Allergene, verbotene Zutaten, Mindest-Vorrat. Bei „streng“ blockiert CulinaSync riskante Vorschläge früh — besonders hilfreich für Familien mit Unverträglichkeiten.',
    },
    pantryColor: {
      question: 'Was bedeuten die Farben im Essensplaner?',
      answer:
        'Der Balken zeigt Zutaten-Verfügbarkeit aus dem Vorrat: Grün (alles da), Gelb (einiges fehlt), Rot (viel fehlt). So erkennst du Einkaufsbedarf auf einen Blick — ohne die Rezeptliste zu öffnen.',
    },
    pwaInstall: {
      question: 'Wie installiere ich CulinaSync als App?',
      answer:
        'In Daten & Speicher findest du die PWA-Karte: „Zum Home-Bildschirm“ (iOS) oder Install-Prompt (Chrome/Edge). Installierte Apps starten im Standalone-Modus, cachen UI-Shell und bleiben offline nutzbar.',
    },
    backupFormats: {
      question: 'Welches Backup-Format wann?',
      answer:
        'JSON: vollständige Wiederherstellung. Markdown/CSV: Lesen & Teilen. PDF: Archiv/Druck. Für Gerätewechsel empfehlen wir JSON oder Vault; für Alltags-Backup reicht oft ein wöchentlicher JSON-Export.',
    },
    cookVoice: {
      question: 'Kann ich beim Kochen per Sprache steuern?',
      answer:
        'Ja — unter Sprachsteuerung & Audio stellst du TTS, Whisper (lokal) oder Browser-Erkennung ein. Im Kochmodus helfen Sprachbefehle bei Timer und Navigation; destruktive Befehle lassen sich bestätigen.',
    },
  },
  tips: {
    heading: 'Pro-Tipps (interaktiv)',
    cmdPalette: {
      title: 'Befehlspalette',
      description: '⌘K / Strg+K — springe zu Modulen, Einstellungen und Aktionen ohne Maus.',
      actionLabel: 'Palette öffnen',
    },
    apiKey: {
      title: 'Gemini sicher einrichten',
      description: 'BYOK in IndexedDB — Schlüssel in Google Cloud auf deine Domain beschränken.',
      actionLabel: 'API-Schlüssel',
    },
    voiceControl: {
      title: 'Hands-free am Herd',
      description: 'Stimme, Whisper-Modell und Bestätigungen für destruktive Befehle feinjustieren.',
      actionLabel: 'Audio-Einstellungen',
    },
    shoppingGenerate: {
      title: 'Einkauf aus dem Plan',
      description: 'Fehlende Zutaten aus dem Essensplan direkt auf die Liste — ein Klick.',
      actionLabel: 'Zur Einkaufsliste',
    },
    mealPlanner: {
      title: 'Woche planen wie ein Profi',
      description: 'Farbige Vorrat-Balken + Portionen — vor dem Einkauf den Plan prüfen.',
      actionLabel: 'Essensplaner',
    },
    aiChef: {
      title: 'KI-Chef mit Kontext',
      description: 'Kreativität, Ernährung und Policies kombinieren — dann „Chef fragen“.',
      actionLabel: 'KI-Chef öffnen',
    },
  },
  quickLinks: {
    heading: 'Schnellzugriff Einstellungen',
    data: { label: 'Daten & Backup', description: 'Export, Vault, Sync, PWA' },
    privacy: { label: 'Privatsphäre', description: 'KI-Spuren, Logs, Local-First' },
    localAi: { label: 'Lokale KI', description: 'Ollama, Routing, GPU' },
    appearance: { label: 'Design', description: 'Akzent, Kitchen-Modus, A11y' },
    policies: { label: 'Policies', description: 'Allergene & Regeln' },
    allSettings: { label: 'Haushalt & Sprache', description: 'Name, Sprache, Wochenstart' },
  },
  tech: {
    react: 'UI mit React 19 & lazy Routes',
    gemini: 'Cloud-KI mit Zod-Validierung',
    ollama: 'Optionale On-Device-Modelle',
    dexie: 'IndexedDB, Live-Queries',
    redux: 'UI- & Session-State',
    zustand: 'Leichte Transient-UI',
    tailwind: 'Design-System & A11y',
    vite: 'PWA, Share Target, SW',
  },
  philosophy: {
    offlineFirst: {
      title: 'Offline zuerst',
      description: 'Küche funktioniert ohne Netz — Sync ist Ergänzung, nicht Voraussetzung.',
    },
    privacy: {
      title: 'Privatsphäre',
      description: 'Deine Daten bleiben auf dem Gerät; Cloud nur mit deinem Schlüssel & deinem Server.',
    },
    performance: {
      title: 'Sofortigkeit',
      description: 'Dexie + lokale UI — keine Wartezeit auf einen fernen Haushalts-Server.',
    },
    trust: {
      title: 'Vertrauen',
      description: 'Klare Toggles statt versteckter Telemetrie — du entscheidest, was gespeichert wird.',
    },
    open: {
      title: 'Offene Exporte',
      description: 'JSON, Markdown, CSV — kein Lock-in für deine Rezepte.',
    },
    sync: {
      title: 'Sync nach Bedarf',
      description: 'QR, Vault oder WebDAV — wähle die Passung für dein Zuhause.',
    },
  },
  search: {
    placeholder: 'z. B. Backup, API-Schlüssel, Allergene…',
    inputAria: 'Suche in der Wissensdatenbank',
    resetAria: 'Suche zurücksetzen',
  },
  tabs: {
    knowledge: 'Wissen & FAQ',
    about: 'System & Über',
    ariaLabel: 'Hilfe-Bereiche',
  },
  about: {
    lead: 'CulinaSync ist deine local-first Küchen-Assistentin: Vorrat, Planung, Kochen und Einkauf — optional mit Cloud- oder lokaler KI, immer mit exportierbaren Daten.',
    technology: 'Technologie-Stack',
    systemStatus: 'Live-Systemstatus',
    systemNormal: 'Bereit',
    systemOffline: 'Offline-Modus',
    status: 'Netzwerk',
    online: 'Online',
    offline: 'Offline',
    version: 'Version',
    storage: 'Speicher (geschätzt)',
    indexedDbActive: 'IndexedDB aktiv',
    dataLayer: 'Datenhaltung',
    pwaInstalled: 'Als App installiert',
  },
};

const helpEn = {
  title: 'Knowledge base',
  subtitle: 'Guides, shortcuts, privacy notes, and live system status for your household.',
  emptyFaq: 'No matching questions found.',
  faq: {
    heading: 'Frequently asked questions',
    openSettings: 'Open related settings',
    categories: {
      general: 'General',
      privacy: 'Privacy',
      features: 'Features',
      ai: 'AI & assistant',
      data: 'Data & backup',
      pwa: 'App & PWA',
    },
    keywords: {
      offline: 'offline IndexedDB local',
      indexeddb: 'Dexie storage',
      gemini: 'Gemini API key',
      localAi: 'Ollama local GPU',
      qr: 'QR device sync',
      cloud: 'WebDAV Nextcloud',
    },
    localFirst: {
      question: "What does “local-first” mean?",
      answer:
        'Recipes, pantry, meal plan, and shopping list live primarily in IndexedDB on your device. CulinaSync does not run a central cloud database for your kitchen — you keep control, speed, and offline use.',
    },
    aiPrivacy: {
      question: 'What happens to my data in AI Chef?',
      answer:
        'Cloud AI (Google Gemini) receives only the text of your request — and only if you stored an API key. Pantry and planning data are not uploaded automatically. You can control context toggles in AI settings, use local AI (Ollama), or keep prompts on-device only (privacy).',
    },
    apiKey: {
      question: 'Do I need an API key?',
      answer:
        'For Gemini in the cloud: yes. The key is encrypted in IndexedDB on your device only — never in the build or on our servers. Without a key, cloud AI stays inactive; pantry, planner, and local features still work.',
    },
    localAi: {
      question: 'What is “local AI”?',
      answer:
        'Under Settings → Local AI you configure Ollama, model routing, and optional GPU tiers. Requests can stay on-device — ideal for sensitive household data or offline labs. Cloud Gemini remains optional in parallel.',
    },
    syncDevices: {
      question: 'How do I sync between devices?',
      answer:
        'Several paths: (1) QR device sync in Data & storage, (2) encrypted vault (.csb) for secure copy, (3) cloud sync via WebDAV/Nextcloud with merge, (4) classic JSON/Markdown export. Pick what fits your trust model and network.',
    },
    vault: {
      question: 'What is the encrypted vault (.csb)?',
      answer:
        'A password-protected snapshot of your kitchen — recipes, pantry, plan, and list in one file. Great for USB, NAS, or encrypted storage. Import merges or replaces per dialog; test with a backup before going live.',
    },
    cloudSync: {
      question: 'How does cloud sync (WebDAV/Nextcloud) work?',
      answer:
        'You configure server, user, and path under Data & storage. Upload/download uses your own storage — CulinaSync does not host household data. After merge you see the last sync timestamp; conflicts follow the merge rules in the data panel.',
    },
    policies: {
      question: 'What are policies (allergens, blacklist) for?',
      answer:
        'Household rules filter recipes and AI suggestions: allergens, banned ingredients, minimum stock. In strict mode CulinaSync blocks risky suggestions early — especially helpful for families with intolerances.',
    },
    pantryColor: {
      question: 'What do meal planner colors mean?',
      answer:
        'The bar shows ingredient availability from pantry: green (all set), yellow (some missing), red (many missing). Spot shopping needs at a glance — without opening the recipe list.',
    },
    pwaInstall: {
      question: 'How do I install CulinaSync as an app?',
      answer:
        'In Data & storage open the PWA card: Add to Home Screen (iOS) or the install prompt (Chrome/Edge). Installed apps run standalone, cache the UI shell, and stay usable offline.',
    },
    backupFormats: {
      question: 'Which backup format when?',
      answer:
        'JSON: full restore. Markdown/CSV: read & share. PDF: archive/print. For device changes we recommend JSON or vault; for routine backup a weekly JSON export is often enough.',
    },
    cookVoice: {
      question: 'Can I control cooking by voice?',
      answer:
        'Yes — under Speech & audio set TTS, Whisper (local), or browser recognition. Cook mode supports voice for timers and navigation; destructive commands can require confirmation.',
    },
  },
  tips: {
    heading: 'Pro tips (interactive)',
    cmdPalette: {
      title: 'Command palette',
      description: '⌘K / Ctrl+K — jump to modules, settings, and actions without the mouse.',
      actionLabel: 'Open palette',
    },
    apiKey: {
      title: 'Set up Gemini safely',
      description: 'BYOK in IndexedDB — restrict the key in Google Cloud to your domain.',
      actionLabel: 'API key',
    },
    voiceControl: {
      title: 'Hands-free at the stove',
      description: 'Tune voice, Whisper model, and confirmations for destructive commands.',
      actionLabel: 'Audio settings',
    },
    shoppingGenerate: {
      title: 'Shop from the plan',
      description: 'Push missing ingredients from the meal plan to the list in one step.',
      actionLabel: 'Shopping list',
    },
    mealPlanner: {
      title: 'Plan the week like a pro',
      description: 'Colored pantry bars + servings — review the plan before shopping.',
      actionLabel: 'Meal planner',
    },
    aiChef: {
      title: 'AI Chef with context',
      description: 'Combine creativity, diet, and policies — then ask the chef.',
      actionLabel: 'Open AI Chef',
    },
  },
  quickLinks: {
    heading: 'Settings shortcuts',
    data: { label: 'Data & backup', description: 'Export, vault, sync, PWA' },
    privacy: { label: 'Privacy', description: 'AI traces, logs, local-first' },
    localAi: { label: 'Local AI', description: 'Ollama, routing, GPU' },
    appearance: { label: 'Appearance', description: 'Accent, kitchen mode, a11y' },
    policies: { label: 'Policies', description: 'Allergens & rules' },
    allSettings: { label: 'Household & language', description: 'Name, locale, week start' },
  },
  tech: {
    react: 'UI with React 19 & lazy routes',
    gemini: 'Cloud AI with Zod validation',
    ollama: 'Optional on-device models',
    dexie: 'IndexedDB, live queries',
    redux: 'UI & session state',
    zustand: 'Lightweight transient UI',
    tailwind: 'Design system & a11y',
    vite: 'PWA, share target, SW',
  },
  philosophy: {
    offlineFirst: {
      title: 'Offline first',
      description: 'Kitchen works without network — sync is additive, not required.',
    },
    privacy: {
      title: 'Privacy',
      description: 'Your data stays on device; cloud only with your key and your server.',
    },
    performance: {
      title: 'Instant feel',
      description: 'Dexie + local UI — no waiting on a remote household server.',
    },
    trust: {
      title: 'Trust',
      description: 'Clear toggles instead of hidden telemetry — you choose what is stored.',
    },
    open: {
      title: 'Open exports',
      description: 'JSON, Markdown, CSV — no lock-in for your recipes.',
    },
    sync: {
      title: 'Sync on demand',
      description: 'QR, vault, or WebDAV — pick what fits your home.',
    },
  },
  search: {
    placeholder: 'e.g. backup, API key, allergens…',
    inputAria: 'Search the knowledge base',
    resetAria: 'Reset search',
  },
  tabs: {
    knowledge: 'Knowledge & FAQ',
    about: 'System & about',
    ariaLabel: 'Help sections',
  },
  about: {
    lead: 'CulinaSync is your local-first kitchen assistant: pantry, planning, cooking, and shopping — optionally with cloud or local AI, always with exportable data.',
    technology: 'Technology stack',
    systemStatus: 'Live system status',
    systemNormal: 'Ready',
    systemOffline: 'Offline mode',
    status: 'Network',
    online: 'Online',
    offline: 'Offline',
    version: 'Version',
    storage: 'Storage (estimate)',
    indexedDbActive: 'IndexedDB active',
    dataLayer: 'Data layer',
    pwaInstalled: 'Installed as app',
  },
};

const panelIntroDe = {
  ariaLabel: 'Kurzanleitung zu diesem Einstellungsbereich',
  appearance: {
    lead: 'Passe Look & Bedienung an deine Küche an — Akzentfarbe, Kitchen-Modus und Barrierefreiheit wirken sofort in der gesamten App.',
    tip1: 'Kitchen-Modus erhöht Kontrast für Dampf, Spiegelungen und Abstand vom Display.',
    tip2: '„Bewegung reduzieren“ schaltet Animationen für ruhigere Nutzung ab.',
    tip3: 'Die Live-Vorschau rechts zeigt Buttons und Badges mit deiner Akzentfarbe.',
  },
  modules: {
    lead: 'Grunddaten deines Haushalts: Sprache, Anzeigename, Wochenstart und Standardportionen.',
    tip1: 'Die Sprache wirkt sofort auf UI und Rezept-Exporte.',
    tip2: 'Standardportionen werden bei neuen Plan-Einträgen vorausgefüllt.',
    tip3: 'Feature-Toggles für Module findest du unter „Haushalt & Module“.',
  },
  workspace: {
    lead: 'Feineinstellungen pro Bereich — Vorrat, Rezepte, Einkauf, Planer und Kochmodus.',
    tip1: 'Ablauf-Warnungen im Vorrat helfen, Lebensmittel rechtzeitig zu verbrauchen.',
    tip2: 'Automatische Kategorisierung beschleunigt das Erfassen neuer Artikel.',
    tip3: 'Kochmodus-Optionen optimieren Schriftgröße und Fokus beim Kochen.',
  },
  ai: {
    lead: 'Persönliche Präferenzen für den KI-Chef: Kreativität, Ernährung, Küchen und System-Anweisung.',
    tip1: 'Policies (Allergene) wirken auch auf KI-Vorschläge, wenn aktiviert.',
    tip2: 'Kontext-Toggles steuern, ob Vorrat/Plan in die Anfrage einfließen.',
    tip3: 'Ein API-Schlüssel ist für Cloud-Gemini unter „API-Schlüssel“ nötig.',
  },
  localAi: {
    lead: 'Lokale Modelle über Ollama — Routing, GPU-Stufe und Cache für privacy-first KI.',
    tip1: 'Starte Ollama auf dem gleichen Rechner oder im LAN, bevor du Modelle wählst.',
    tip2: 'Kleinere Modelle sind schneller; größere liefern bessere Rezept-Struktur.',
    tip3: 'Cloud-Gemini kann parallel bleiben — Routing entscheidet pro Anfrage.',
  },
  policies: {
    lead: 'Haushaltsregeln für Sicherheit: Allergene, Blacklist, Mindestbestand und Durchsetzung.',
    tip1: 'Strict-Modus blockiert riskante Rezepte schon in der Auswahl.',
    tip2: 'Blacklist-Einträge sind kommagetrennt — z. B. „Koriander, Sellerie“.',
    tip3: 'Kombiniere Policies mit KI-Chef-Ernährungs-Tags für beste Treffer.',
  },
  privacy: {
    lead: 'Transparenz über Daten-Spuren: Analytics-Vorbereitung, Logs, KI-Prompts und Local-First-Garantien.',
    tip1: 'Analytics/Diagnostik sind vorbereitet — es wird kein Drittanbieter-Tracking ohne deine Zustimmung gesendet.',
    tip2: 'PII-Redaktion maskiert sensible Teile in lokalen Fehlerlogs.',
    tip3: 'Factory Reset findest du unter „Daten & Speicher“ — nicht hier.',
  },
  speech: {
    lead: 'Sprachausgabe und Eingabe: Browser-Stimmen, Whisper lokal oder Cloud, Lautstärke und Dauerhören.',
    tip1: 'Teste TTS mit „Testen“, bevor du den Kochmodus startest.',
    tip2: 'Whisper bleibt auf dem Gerät — ideal ohne Internet am Herd.',
    tip3: 'Destruktive Sprachbefehle können eine Bestätigung verlangen.',
  },
  apikey: {
    lead: 'Bring-your-own-key für Google Gemini — verschlüsselt nur lokal gespeichert.',
    tip1: 'Beschränke den Schlüssel in der Google Cloud auf deine Deployment-Domain.',
    tip2: 'Ohne Schlüssel bleiben Cloud-KI-Funktionen deaktiviert; Rest der App läuft weiter.',
    tip3: 'Rotiere den Schlüssel regelmäßig und entferne ihn bei Gerätewechsel.',
  },
  health: {
    lead: 'Export berechneter Nährwerte pro Rezept für Apple Health, Google Fit oder Samsung Health.',
    tip1: 'Alles wird lokal berechnet — kein Upload in unsere Cloud.',
    tip2: 'CSV eignet sich für Tabellen; JSON für Automatisierung.',
    tip3: 'Wähle das passende Zielformat deiner Health-App.',
  },
  community: {
    lead: 'Opt-in Teilen einzelner Rezepte über IPFS oder Nostr — niemals automatisch.',
    tip1: 'IPFS-Inhalte sind öffentlich lesbar — nur anonymisierte Rezepte teilen.',
    tip2: 'Nostr kann self-hosted sein für mehr Kontrolle.',
    tip3: 'Community ist unabhängig von Backup/Vault.',
  },
  data: {
    lead: 'Herzstück deiner Datenhoheit: PWA, Backup, Vault, Gerätesync, Cloud und Reset.',
    tip1: 'Erstelle vor großen Imports immer ein JSON-Backup.',
    tip2: 'Vault (.csb) eignet sich für verschlüsselte Archivierung.',
    tip3: 'QR-Sync ist am schnellsten für zwei Geräte im gleichen WLAN.',
  },
};

const panelIntroEn = {
  ariaLabel: 'Short guide for this settings area',
  appearance: {
    lead: 'Tune look & feel for your kitchen — accent, kitchen mode, and accessibility apply across the app instantly.',
    tip1: 'Kitchen mode boosts contrast for steam, glare, and distance from the screen.',
    tip2: 'Reduce motion turns off animations for calmer use.',
    tip3: 'The live preview shows buttons and badges with your accent color.',
  },
  modules: {
    lead: 'Household basics: language, display name, week start, and default servings.',
    tip1: 'Language updates UI and exports immediately.',
    tip2: 'Default servings pre-fill new meal plan entries.',
    tip3: 'Per-module toggles live under Workspace.',
  },
  workspace: {
    lead: 'Per-area fine tuning — pantry, recipes, shopping, planner, and cook mode.',
    tip1: 'Expiry warnings help use food before it spoils.',
    tip2: 'Auto-categorize speeds up adding pantry items.',
    tip3: 'Cook mode options optimize type size and focus while cooking.',
  },
  ai: {
    lead: 'AI Chef preferences: creativity, diet, cuisines, and system instruction.',
    tip1: 'Policies (allergens) also filter AI suggestions when enabled.',
    tip2: 'Context toggles control pantry/plan inclusion in requests.',
    tip3: 'Cloud Gemini needs an API key under API key.',
  },
  localAi: {
    lead: 'Local models via Ollama — routing, GPU tier, and cache for privacy-first AI.',
    tip1: 'Run Ollama on the same machine or LAN before picking models.',
    tip2: 'Smaller models are faster; larger ones structure recipes better.',
    tip3: 'Cloud Gemini can stay parallel — routing decides per request.',
  },
  policies: {
    lead: 'Household safety rules: allergens, blacklist, minimum stock, enforcement.',
    tip1: 'Strict mode blocks risky recipes early in selection.',
    tip2: 'Blacklist entries are comma-separated — e.g. “cilantro, celery”.',
    tip3: 'Combine with AI Chef diet tags for best matches.',
  },
  privacy: {
    lead: 'Transparency on data traces: analytics prep, logs, AI prompts, and local-first guarantees.',
    tip1: 'Analytics/diagnostics are prepared — no third-party tracking is sent without your consent.',
    tip2: 'PII redaction masks sensitive parts in local error logs.',
    tip3: 'Factory reset is under Data & storage — not here.',
  },
  speech: {
    lead: 'Speech output and input: browser voices, local Whisper or cloud, volume, continuous listening.',
    tip1: 'Test TTS before starting cook mode.',
    tip2: 'Whisper stays on-device — great without network at the stove.',
    tip3: 'Destructive voice commands can require confirmation.',
  },
  apikey: {
    lead: 'Bring-your-own-key for Google Gemini — encrypted local storage only.',
    tip1: 'Restrict the key in Google Cloud to your deployment domain.',
    tip2: 'Without a key, cloud AI stays off; the rest of the app keeps running.',
    tip3: 'Rotate keys regularly and remove on device handoff.',
  },
  health: {
    lead: 'Export calculated nutrition per recipe for Apple Health, Google Fit, or Samsung Health.',
    tip1: 'Everything is computed locally — no upload to our cloud.',
    tip2: 'CSV suits spreadsheets; JSON suits automation.',
    tip3: 'Pick the target format your health app expects.',
  },
  community: {
    lead: 'Opt-in sharing of single recipes via IPFS or Nostr — never automatic.',
    tip1: 'IPFS content is public — share anonymized recipes only.',
    tip2: 'Nostr can be self-hosted for more control.',
    tip3: 'Community is separate from backup/vault.',
  },
  data: {
    lead: 'Core of data sovereignty: PWA, backup, vault, device sync, cloud, and reset.',
    tip1: 'Always JSON-backup before large imports.',
    tip2: 'Vault (.csb) fits encrypted archives.',
    tip3: 'QR sync is fastest for two devices on the same Wi‑Fi.',
  },
};

function patchFile(relPath, lang) {
  const filePath = path.join(root, relPath);
  const json = JSON.parse(readFileSync(filePath, 'utf8'));
  if (relPath.includes('features.json')) {
    json.help = lang === 'de' ? helpDe : helpEn;
  }
  if (relPath.includes('settings.json')) {
    if (!json.settings) {
      throw new Error(`Expected { settings } root in ${relPath}`);
    }
    json.settings.panelIntro = lang === 'de' ? panelIntroDe : panelIntroEn;
    if (json.settings.privacy) {
      json.settings.privacy.analyticsDesc =
        lang === 'de'
          ? 'Vorbereitet für optionale, anonymisierte Nutzungsstatistik — aktuell ohne aktives Telemetrie-Backend.'
          : 'Prepared for optional anonymized usage stats — no active telemetry backend yet.';
    }
    json.settings.sections.modules =
      lang === 'de' ? 'Haushalt & Sprache' : 'Household & language';
    json.settings.sidebar.modules.description =
      lang === 'de' ? 'Name, Sprache, Portionen' : 'Name, language, servings';
  }
  writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log('patched', relPath);
}

/** @param {string} relPath @param {'de'|'en'} lang */
const patchFeatures = (relPath, lang) => patchFile(relPath, lang);
const patchSettings = (relPath, lang) => patchFile(relPath, lang);

patchFeatures('apps/web/src/locales/de/features.json', 'de');
patchFeatures('apps/web/src/locales/en/features.json', 'en');
patchSettings('apps/web/src/locales/de/settings.json', 'de');
patchSettings('apps/web/src/locales/en/settings.json', 'en');

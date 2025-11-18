
import { Bot, Milk, BookOpen, CalendarDays, ShoppingCart, TerminalSquare, Mic, Database, ShieldCheck, WifiOff, Zap } from 'lucide-react';

export const FAQS = [
    {
        id: 'local-first',
        category: 'Allgemein',
        question: "Was bedeutet 'Local-First'?",
        answer: "'Local-First' bedeutet, dass alle deine Daten (Rezepte, Vorräte, Pläne) primär auf deinem Gerät gespeichert werden. Es gibt keine Cloud-Datenbank, die wir kontrollieren. Das garantiert maximale Geschwindigkeit, Privatsphäre und Offline-Verfügbarkeit."
    },
    {
        id: 'ai-privacy',
        category: 'Datenschutz',
        question: "Was passiert mit meinen Daten beim KI-Chef?",
        answer: "Nur der Text deiner Anfrage (Zutaten, Wünsche) wird an die Google Gemini API gesendet. Deine persönlichen Vorratsdaten oder Essenspläne verlassen dein Gerät nicht, es sei denn, sie sind Teil der spezifischen Anfrage."
    },
    {
        id: 'pantry-color',
        category: 'Funktionen',
        question: "Was bedeuten die Farben im Essensplaner?",
        answer: "Der Balken unter einem Gericht zeigt die Zutaten-Verfügbarkeit: Grün (Alles da), Gelb (Einiges fehlt), Rot (Vieles fehlt). So siehst du sofort, ob du einkaufen musst."
    },
    {
        id: 'sync-devices',
        category: 'Allgemein',
        question: "Kann ich Daten zwischen Geräten synchronisieren?",
        answer: "Aktuell ist CulinaSync als Offline-First App konzipiert. Eine Synchronisation ist für eine spätere Version geplant. Nutze bis dahin die Export/Import-Funktion in den Einstellungen."
    }
];

export const PRO_TIPS = [
    {
        id: 'cmd-palette',
        title: "Power-User Navigation",
        description: "Nutze die Befehlspalette für blitzschnellen Zugriff auf alles.",
        icon: TerminalSquare,
        actionLabel: "Öffnen (⌘K)",
        actionId: 'OPEN_CMD'
    },
    {
        id: 'voice-control',
        title: "Hands-Free Kochen",
        description: "Steuere den Kochmodus komplett mit deiner Stimme.",
        icon: Mic,
        actionLabel: "Mikrofon testen",
        actionId: 'TOGGLE_VOICE'
    },
    {
        id: 'shopping-generate',
        title: "Intelligenter Einkauf",
        description: "Lass die App deine Einkaufsliste basierend auf dem Plan füllen.",
        icon: ShoppingCart,
        actionLabel: "Zur Einkaufsliste",
        actionId: 'NAV_SHOPPING'
    }
];

export const TECH_STACK = [
    { name: "React 19", icon: "⚛️", desc: "Modernste UI-Library" },
    { name: "Google Gemini", icon: "🧠", desc: "Advanced AI Models" },
    { name: "Dexie.js", icon: "🗄️", desc: "IndexedDB Wrapper" },
    { name: "Redux Toolkit", icon: "🔄", desc: "State Management" },
    { name: "Tailwind CSS", icon: "🎨", desc: "Utility-First Styling" },
    { name: "Vite PWA", icon: "📱", desc: "Progressive Web App" }
];

export const PHILOSOPHY = [
    { title: "Offline First", icon: WifiOff, desc: "Funktioniert immer und überall, auch im tiefsten Supermarkt-Keller." },
    { title: "Privatsphäre", icon: ShieldCheck, desc: "Deine Daten gehören dir. Kein Tracking, keine Werbung." },
    { title: "Performance", icon: Zap, desc: "Keine Ladezeiten. Sofortige Reaktion auf jede Eingabe." }
];
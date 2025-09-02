import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface AboutPageProps {
  onBack: () => void;
}

const aboutContent = `
CulinaSync ist mehr als nur eine weitere Rezept-App. Es ist ein proaktiver, intelligenter Küchenassistent, der als zentraler Hub für Ihren Haushalt dient. Die App wurde entwickelt, um den gesamten kulinarischen Prozess zu unterstützen – von der Inspiration und Essensplanung über den intelligenten Einkauf bis hin zur Zubereitung und Vorratshaltung.

Im Gegensatz zu traditionellen, Cloud-abhängigen Anwendungen basiert CulinaSync auf einer **Local-First-Architektur**. Ihre Daten – Ihre Rezepte, Vorräte und Pläne – residieren primär auf Ihrem Gerät. Das Resultat ist eine blitzschnelle, permanent verfügbare und absolut private Nutzererfahrung, die sich wie eine native App anfühlt.

## 🚀 Kernfunktionen im Überblick

Die Anwendung deckt den gesamten kulinarischen Workflow ab, intelligent und nahtlos.

**🥫 Intelligente Vorratskammer**
Verwalten Sie Ihre Lebensmittelvorräte. Artikel, Mengen und Ablaufdaten werden für intelligente Rezeptvorschläge und Einkaufslisten genutzt.

**🤖 KI-Chef (Gemini API)**
Erhalten Sie personalisierte Rezeptvorschläge basierend auf Vorräten, Vorlieben und Ernährungszielen. Verwandeln Sie "Was koche ich heute?" in "Das koche ich heute!".

**📚 Kollaboratives Rezeptbuch**
Sammeln, organisieren und filtern Sie Ihre Lieblingsrezepte. Jedes gespeicherte Rezept wird Teil Ihrer persönlichen, durchsuchbaren Kochbibliothek.

**📅 Dynamischer Essensplaner**
Planen Sie Mahlzeiten per Drag-and-Drop. Erkennen Sie auf einen Blick, welche Zutaten für geplante Gerichte noch fehlen.

**🛒 Automatisierte Einkaufsliste**
Generieren Sie eine Einkaufsliste, die Ihren Essensplan automatisch mit Ihrer Vorratskammer abgleicht. Fügen Sie Artikel auch manuell oder per KI hinzu.

**🗣️ Sprachsteuerung**
Steuern Sie die App freihändig – fügen Sie Artikel hinzu, navigieren Sie oder haken Sie Zutaten von der Einkaufsliste ab.

**⚙️ Daten-Management**
Exportieren und importieren Sie all Ihre Daten als JSON-Backup. Sie behalten die volle Kontrolle.

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
-   **DB-Wrapper:** [Dexie.js](https://dexie.org/) als eleganter und leistungsfähiger Wrapper für IndexedDB, der die Datenbankinteraktion vereinfacht und mit React Hooks (\`dexie-react-hooks\`) integriert ist.
-   **KI & Generative Rezepte:** [Google Gemini API](https://ai.google.dev/) (\`@google/genai\`) für die Erstellung intelligenter und kontextbezogener Rezepte.
-   **PWA-Funktionalität:** [VitePWA](https://vite-pwa-org.netlify.app/) zur Umwandlung der Web-App in eine installierbare, offline-fähige Anwendung.
-   **Build-Tool:** [Vite](https://vitejs.dev/) für eine blitzschnelle Entwicklungsumgebung und optimierte Produktions-Builds.
`;

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center text-amber-400 hover:text-amber-300 mb-6 font-semibold">
        <ArrowLeft size={20} className="mr-2" />
        Zurück zur Hilfe
      </button>

      <article className="bg-zinc-950/50 border border-zinc-800 rounded-lg shadow-xl p-6 md:p-8">
        <div className="prose-styles">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {aboutContent}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default AboutPage;
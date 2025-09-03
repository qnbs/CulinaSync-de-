import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center text-amber-400 hover:text-amber-300 mb-6 font-semibold">
        <ArrowLeft size={20} className="mr-2" />
        Zurück zur Hilfe
      </button>

      <article className="bg-zinc-950/50 border border-zinc-800 rounded-lg shadow-xl p-6 md:p-8">
        <div className="prose-styles">
          <div style={{ textAlign: 'center' }}>
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmYmJmMjQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTEuNSA5LjVMOSAxMkwxMSA1bDIgN1oiLz48cGF0aCBkPSJNMTggMTBsLTIuNS0yLjVMMTggNWwyIDcgWiIvPjxwYXRoIGQ9Ik0yIDhsMTItMTIgMTIgMTIiLz48cGF0aCBkPSJNNCAxNGguMyIvPjxwYXRoIGQ9Ik0yMCAxNGgtLjMiLz48cGF0aCBkPSJNNi4zIDE4LjRIMTcuNyIvPjxwYXRoIGQ9Ik02IDVIMyIvPjxwYXRoIGQ9Ik0yMSA1di0zIi8+PC9zdmc+" 
              alt="CulinaSync Logo" 
              width="150"
            />
          </div>

          <h1>Willkommen bei CulinaSync</h1>
          <p>
            <strong>Offline. Privat. Nahtlos.</strong>
            <br />
            Ihr persönlicher, intelligenter Küchenassistent, der den kulinarischen Alltag in Ihrem Haushalt revolutioniert.
          </p>
          <hr />
          
          <h2>🎯 Vision: Vom Rezeptarchiv zum proaktiven Küchenpartner</h2>
          <p>
            CulinaSync ist mehr als nur eine weitere Rezept-App. Es ist ein proaktiver, intelligenter Küchenassistent, der als zentraler Hub für Ihren Haushalt dient. Die App wurde entwickelt, um den gesamten kulinarischen Prozess zu unterstützen – von der Inspiration und Essensplanung über den intelligenten Einkauf bis hin zur Zubereitung und Vorratshaltung.
          </p>
          <p>
            Im Gegensatz zu traditionellen, Cloud-abhängigen Anwendungen basiert CulinaSync auf einer <strong>Local-First-Architektur</strong>. Ihre Daten – Ihre Rezepte, Vorräte und Pläne – residieren primär auf Ihrem Gerät. Das Resultat ist eine blitzschnelle, permanent verfügbare und absolut private Nutzererfahrung, die sich wie eine native App anfühlt.
          </p>

          <h2>✨ Kernfunktionen</h2>
          <p>Die Anwendung deckt den gesamten kulinarischen Workflow ab, intelligent und nahtlos.</p>
          <ul>
            <li><strong>🥫 Intelligente Vorratskammer:</strong> Verwalten Sie Ihre Lebensmittelvorräte. Artikel, Mengen und Ablaufdaten werden für intelligente Rezeptvorschläge und Einkaufslisten genutzt.</li>
            <li><strong>🤖 KI-Chef (Gemini API):</strong> Erhalten Sie personalisierte Rezeptvorschläge basierend auf Vorräten, Vorlieben und Ernährungszielen. Verwandeln Sie "Was koche ich heute?" in "Das koche ich heute!".</li>
            <li><strong>📚 Kollaboratives Rezeptbuch:</strong> Sammeln, organisieren und filtern Sie Ihre Lieblingsrezepte. Jedes gespeicherte Rezept wird Teil Ihrer persönlichen, durchsuchbaren Kochbibliothek.</li>
            <li><strong>📅 Dynamischer Essensplaner:</strong> Planen Sie Mahlzeiten per Drag-and-Drop. Erkennen Sie auf einen Blick, welche Zutaten für geplante Gerichte noch fehlen.</li>
            <li><strong>🛒 Automatisierte Einkaufsliste:</strong> Generieren Sie eine Einkaufsliste, die Ihren Essensplan automatisch mit Ihrer Vorratskammer abgleicht. Fügen Sie Artikel auch manuell oder per KI hinzu.</li>
            <li><strong>🗣️ Sprachsteuerung:</strong> Steuern Sie die App freihändig – fügen Sie Artikel hinzu, navigieren Sie oder haken Sie Zutaten von der Einkaufsliste ab.</li>
            <li><strong>⚙️ Daten-Management:</strong> Exportieren und importieren Sie all Ihre Daten als JSON-Backup. Sie behalten die volle Kontrolle.</li>
          </ul>

          <h2>✨ Unsere Philosophie: Ihre Daten gehören Ihnen (Local-First)</h2>
          <p>
            Die Entscheidung für eine Local-First-Architektur ist das Fundament von CulinaSync. Sie bietet Ihnen entscheidende Vorteile:
          </p>
          <ul>
            <li><strong>🚀 Extrem Schnell:</strong> Aktionen werden sofort ausgeführt. Es gibt keine Ladezeiten, die auf eine Netzwerkantwort warten. Die App fühlt sich extrem reaktionsschnell an.</li>
            <li><strong>🌐 Echte Offline-Funktionalität:</strong> Ob im Supermarkt im Keller ohne Empfang oder im Flugzeug – CulinaSync ist immer voll funktionsfähig. Eine Internetverbindung wird nur für die KI-Funktionen benötigt.</li>
            <li><strong>🔐 Maximaler Datenschutz:</strong> Ihre kulinarischen Daten sind privat. Da alles auf Ihrem Gerät gespeichert wird, werden sensible Informationen nicht an externe Server gesendet. Sie besitzen Ihre Daten.</li>
          </ul>

          <h2>🛠️ Technologischer Stack &amp; Architektur</h2>
          <p>CulinaSync nutzt einen modernen, performanten und robusten Tech-Stack, der für die Local-First-Philosophie optimiert ist.</p>
          <ul>
            <li><strong>Frontend:</strong> <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a> &amp; <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">TypeScript</a> für eine typsichere, komponentengestützte UI.</li>
            <li><strong>Styling:</strong> <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer">Tailwind CSS</a> für ein schnelles, konsistentes und anpassbares Design-System.</li>
            <li><strong>Lokale Datenbank:</strong> <a href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API" target="_blank" rel="noopener noreferrer">IndexedDB</a> als leistungsstarker Browser-Speicher.</li>
            <li><strong>DB-Wrapper:</strong> <a href="https://dexie.org/" target="_blank" rel="noopener noreferrer">Dexie.js</a> als eleganter und leistungsfähiger Wrapper für IndexedDB, der die Datenbankinteraktion vereinfacht und mit React Hooks (<code>dexie-react-hooks</code>) integriert ist.</li>
            <li><strong>KI &amp; Generative Rezepte:</strong> <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">Google Gemini API</a> (<code>@google/genai</code>) für die Erstellung intelligenter und kontextbezogener Rezepte.</li>
            <li><strong>PWA-Funktionalität:</strong> <a href="https://vite-pwa-org.netlify.app/" target="_blank" rel="noopener noreferrer">VitePWA</a> zur Umwandlung der Web-App in eine installierbare, offline-fähige Anwendung.</li>
            <li><strong>Build-Tool:</strong> <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">Vite</a> für eine blitzschnelle Entwicklungsumgebung und optimierte Produktions-Builds.</li>
            <li><strong>Icons:</strong> <a href="https://lucide.dev/" target="_blank" rel="noopener noreferrer">Lucide React</a> für ein schönes und konsistentes Icon-Set.</li>
          </ul>
          
          <h2>Entwicklung mit Google AI Studio</h2>
          <p>Dieses Projekt wurde im interaktiven Dialog mit <a href="https://ai.studio/" target="_blank" rel="noopener noreferrer">Google's AI Studio</a> entwickelt und verfeinert. Das Studio diente als kollaborativer Partner, um Code zu generieren, zu debuggen und die Architektur zu optimieren. Es ist ein Beispiel dafür, wie moderne KI-Werkzeuge den Entwicklungsprozess beschleunigen und verbessern können.</p>
          <p>Sie können den Entstehungsprozess und die Konversationen mit der KI, die zu diesem Projekt geführt haben, direkt im AI Studio einsehen:</p>
          <p style={{ textAlign: 'center', margin: '1.5rem 0' }}>
            <a 
              href="https://ai.studio/apps/drive/1bQgaay6IODal47GVGZcn-65xgfu_PIDC" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                backgroundColor: '#f59e0b', 
                color: '#18181b', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.5rem', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                display: 'inline-block' 
              }}
            >
              Projekt im AI Studio ansehen
            </a>
          </p>

          <h2>🗺️ Roadmap: Die Zukunft von CulinaSync</h2>
          <p>
            CulinaSync ist ein lebendiges Projekt. Geplante zukünftige Erweiterungen umfassen:
          </p>
          <ul>
            <li>[ ] <strong>Barcode-Scanner:</strong> Artikel durch Scannen des EAN-Codes schnell zur Vorratskammer hinzufügen.</li>
            <li>[ ] <strong>Multi-Device-Sync (Optional):</strong> Eine sichere, Ende-zu-Ende-verschlüsselte Synchronisierungsoption für die Nutzung auf mehreren Geräten.</li>
            <li>[ ] <strong>Rezept-Import:</strong> Importieren von Rezepten von populären Koch-Websites über deren URL.</li>
            <li>[ ] <strong>Ernährungstracking:</strong> Analyse und Visualisierung von Nährwertinformationen über den Essensplan.</li>
            <li>[ ] <strong>Kollaborative Haushalts-Features:</strong> Teilen von Einkaufslisten und Essensplänen mit anderen Haushaltsmitgliedern.</li>
          </ul>
          <hr />
          <p>
            Entwickelt mit Leidenschaft für gutes Essen und intelligente Technologie.
          </p>
        </div>
      </article>
    </div>
  );
};

export default AboutPage;
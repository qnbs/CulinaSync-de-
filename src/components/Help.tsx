import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  ChevronsRight,
  Info,
  Milk,
  Bot,
  Book,
  CalendarDays,
  ShoppingCart,
  Settings,
  TerminalSquare,
  Mic,
  Lightbulb,
  LucideProps,
  Download,
} from 'lucide-react';

// FIX: Made children optional to avoid type errors when component is used without children.
const FaqItem = ({ question, children }: { question: string, children?: React.ReactNode }) => (
  <details className="bg-zinc-800/50 p-4 rounded-lg cursor-pointer group transition-all duration-300 hover:bg-zinc-800">
    <summary className="font-semibold text-zinc-200 flex justify-between items-center list-none">
      <span>{question}</span>
      <ChevronsRight className="group-open:rotate-90 transition-transform text-amber-400" size={20} />
    </summary>
    <div className="mt-4 pt-3 border-t border-zinc-700 text-zinc-400 text-sm space-y-3">
      {children}
    </div>
  </details>
);

// FIX: Made children optional to avoid type errors when component is used without children.
const HelpCard = ({ icon: Icon, title, children }: { icon: React.FC<LucideProps>, title: string, children?: React.ReactNode }) => (
    <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-500/10 p-2 rounded-full">
                <Icon className="h-6 w-6 text-amber-400" />
            </div>
            <h4 className="text-lg font-bold text-zinc-100">{title}</h4>
        </div>
        <div className="text-zinc-400 text-sm space-y-2">
            {children}
        </div>
    </div>
);

const FaqView: React.FC<{appVersion: string, onShowAbout: () => void}> = ({ appVersion, onShowAbout }) => (
  <>
    <section>
      <h3 className="text-xl font-semibold text-amber-400 border-b border-zinc-700 pb-2 mb-6 flex items-center gap-3"><BookOpen /> Die Kernfunktionen im Detail</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HelpCard icon={Milk} title="Die Vorratskammer"><p>Das Herzstück deiner Küche. Hier verwaltest du, was du hast. Die Einträge beeinflussen direkt die Rezeptvorschläge des KI-Chefs und deine Einkaufsliste.</p><ul className="list-disc list-outside pl-5 space-y-1 mt-2"><li><b>Artikel hinzufügen:</b> Über den großen Button oben rechts.</li><li><b>Menge anpassen:</b> Mit den +/- Knöpfen direkt in der Liste für schnelle Korrekturen.</li><li><b>Mehrere Artikel auswählen:</b> Nutze den "Auswählen"-Modus, um mehrere Artikel gleichzeitig zur Einkaufsliste hinzuzufügen oder zu löschen.</li></ul></HelpCard>
        <HelpCard icon={Bot} title="Der KI-Chef"><p>Dein kreativer Partner. Sag ihm, worauf du Lust hast, und er erstellt ein passendes Rezept. Er berücksichtigt dabei automatisch, was du im Vorrat hast und welche Vorlieben du in den Einstellungen hinterlegt hast.</p><ul className="list-disc list-outside pl-5 space-y-1 mt-2"><li><b>Gute Anfragen:</b> Sei spezifisch! "Ein schnelles vegetarisches Pastagericht mit Tomaten" liefert bessere Ergebnisse als nur "Pasta".</li><li><b>Überrasch mich!:</b> Nutze diesen Button, um kreative Vorschläge basierend auf deinem aktuellen Vorrat zu erhalten.</li></ul></HelpCard>
        <HelpCard icon={Book} title="Das Kochbuch"><p>Deine persönliche Rezeptsammlung. Jedes vom KI-Chef generierte Rezept kann hier gespeichert werden. Einmal gespeichert, kannst du es jederzeit wieder aufrufen.</p><ul className="list-disc list-outside pl-5 space-y-1 mt-2"><li><b>Suchen & Filtern:</b> Nutze die mächtigen Filter, um schnell das perfekte Rezept für den Moment zu finden.</li><li><b>Favoriten:</b> Markiere deine Lieblingsrezepte mit einem Stern, um sie noch schneller zu finden.</li></ul></HelpCard>
        <HelpCard icon={CalendarDays} title="Der Essensplaner"><p>Plane deine Woche visuell. Ziehe einfach Rezepte aus deinem Kochbuch (rechts) auf den gewünschten Tag und die Mahlzeit.</p><ul className="list-disc list-outside pl-5 space-y-1 mt-2"><li><b>Zutaten-Check:</b> Der farbige Balken unter jedem Gericht zeigt dir an, wie viele Zutaten du bereits im Vorrat hast (Grün: alle da, Gelb/Rot: es fehlen welche). So siehst du auf einen Blick, wofür du noch einkaufen musst.</li><li><b>Als gekocht markieren:</b> Nutze das Menü (•••), um ein Gericht als gekocht zu markieren. Die Zutaten werden dann automatisch von deinem Vorrat abgezogen.</li></ul></HelpCard>
        <HelpCard icon={ShoppingCart} title="Die Einkaufsliste"><p>Generiert sich intelligent aus deinem Essensplan und deinem Vorrat. Du kannst aber auch jederzeit manuell Dinge hinzufügen.</p><ul className="list-disc list-outside pl-5 space-y-1 mt-2"><li><b>Wochenliste generieren:</b> Klicke im Essensplaner auf "Einkaufsliste für Woche generieren", um fehlende Zutaten für alle geplanten Mahlzeiten hinzuzufügen.</li><li><b>Gekauftes einräumen:</b> Nutze den großen Button am unteren Bildschirmrand, um alle abgehakten Artikel mit einem Klick in deine Vorratskammer zu verschieben.</li></ul></HelpCard>
        <HelpCard icon={Settings} title="Die Einstellungen"><p>Passe die App an deine Bedürfnisse an. Hier kannst du deine KI-Präferenzen festlegen, den Wochenstart ändern oder deine Daten exportieren.</p><ul className="list-disc list-outside pl-5 space-y-1 mt-2"><li><b>Daten-Backup:</b> Exportiere regelmäßig deine Daten als JSON-Datei, um sie zu sichern.</li><li><b>Wichtig:</b> Änderungen werden erst nach dem Klick auf "Änderungen speichern" wirksam.</li></ul></HelpCard>
      </div>
    </section>
    <section>
      <h3 className="text-xl font-semibold text-amber-400 border-b border-zinc-700 pb-2 mb-6 flex items-center gap-3"><Lightbulb /> Pro-Tipps & Kurzbefehle</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HelpCard icon={TerminalSquare} title="Befehlspalette"><p>Drücke <kbd className="bg-zinc-700 text-zinc-200 font-sans rounded-md px-2 py-1 text-xs">⌘K</kbd> (Mac) oder <kbd className="bg-zinc-700 text-zinc-200 font-sans rounded-md px-2 py-1 text-xs">Strg+K</kbd> (Windows), um die Befehlspalette zu öffnen. Von hier aus kannst du blitzschnell zu jeder Seite navigieren oder Aktionen ausführen.</p></HelpCard>
        <HelpCard icon={Mic} title="Sprachsteuerung"><p>Aktiviere das Mikrofon in der Kopfzeile und steuere die App mit deiner Stimme. Probier mal:</p><ul className="list-disc list-outside pl-5 space-y-1 mt-2"><li>"Gehe zur Einkaufsliste"</li><li>"Füge 2 Liter Milch auf die Liste"</li><li>"Suche nach Hähnchen" (in der Vorratskammer)</li></ul></HelpCard>
        <HelpCard icon={Download} title="App-Installation (PWA)"><p>Du kannst CulinaSync wie eine native App auf deinem Smartphone, Tablet oder Computer installieren. Suche dafür einfach in den <strong>Einstellungen</strong> unter <strong>Datenverwaltung</strong> nach dem "Installieren"-Button.</p></HelpCard>
      </div>
    </section>
    <section>
      <h3 className="text-xl font-semibold text-amber-400 border-b border-zinc-700 pb-2 mb-6 flex items-center gap-3"><HelpCircle /> Häufig gestellte Fragen (FAQ)</h3>
      <div className="space-y-4">
        <FaqItem question="Was bedeutet 'Local-First' und was sind meine Vorteile?"><p>'Local-First' bedeutet, dass alle deine Daten (Rezepte, Vorräte etc.) primär auf deinem eigenen Gerät gespeichert werden, nicht in der Cloud eines Anbieters. Das hat drei große Vorteile:</p><ul className="mt-2 list-disc list-inside space-y-1"><li><b>Extrem Schnell:</b> Die App fühlt sich an wie eine native Anwendung, da sie nicht auf eine Internetverbindung warten muss.</li><li><b>100% Offline-Fähig:</b> Du kannst die App überall nutzen, auch im Supermarkt im Keller ohne Empfang.</li><li><b>Maximaler Datenschutz:</b> Deine persönlichen Daten verlassen dein Gerät nicht. Du hast die volle Kontrolle.</li></ul></FaqItem>
        <FaqItem question="Wie mache ich die Rezepte vom KI-Chef noch besser?"><p>Gehe zu <b>Einstellungen → KI-Chef Präferenzen</b>. Dort kannst du Ernährungsweisen (z.B. vegetarisch), bevorzugte Küchen (z.B. Italienisch, Asiatisch) und eine generelle Anweisung (z.B. "alle Gerichte sollen scharf sein") hinterlegen. Diese Vorgaben werden bei jeder Anfrage berücksichtigt.</p></FaqItem>
        <FaqItem question="Was bedeutet der farbige Balken unter geplanten Mahlzeiten?"><p>Er gibt dir einen schnellen Überblick über die Verfügbarkeit der Zutaten für ein geplantes Gericht basierend auf deiner Vorratskammer:</p><ul className="mt-2 list-none space-y-1"><li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> <b>Grün:</b> Alle Zutaten sind im Vorrat vorhanden.</li><li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> <b>Gelb:</b> Ein paar Zutaten fehlen.</li><li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> <b>Rot:</b> Viele oder die meisten Zutaten fehlen.</li></ul></FaqItem>
        <FaqItem question="Kann ich die App auf mehreren Geräten nutzen?"><p>Momentan werden die Daten nur auf dem Gerät gespeichert, auf dem sie eingegeben wurden. Eine Synchronisierung zwischen Geräten ist für eine zukünftige Version geplant. Du kannst aber die <b>Export/Import-Funktion</b> in den Einstellungen nutzen, um deine Daten manuell zu übertragen.</p></FaqItem>
      </div>
    </section>
    <section>
        <div className="bg-zinc-800/50 p-6 rounded-lg text-zinc-400 text-sm">
            <div className="space-y-3">
                <p className="font-semibold text-zinc-200">Version: {appVersion}</p>
                <button onClick={onShowAbout} className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold">
                    <Info size={16} /> Über die App & Technische Details
                </button>
            </div>
        </div>
    </section>
  </>
);

const AboutView: React.FC = () => (
    <article className="bg-zinc-950/50 border border-zinc-800 rounded-lg shadow-xl p-6 md:p-8">
        <div className="prose-styles">
          <h1>Willkommen bei CulinaSync</h1>
          <p><strong>Offline. Privat. Nahtlos.</strong><br/>Ihr persönlicher, intelligenter Küchenassistent, der den kulinarischen Alltag in Ihrem Haushalt revolutioniert.</p>
          <hr />
          <h2>🎯 Vision: Ihr proaktiver Küchenpartner</h2>
          <p>CulinaSync ist mehr als nur eine Rezept-App. Es ist ein proaktiver Assistent, der den gesamten kulinarischen Prozess unterstützt – von der Inspiration und Essensplanung über den intelligenten Einkauf bis hin zur Zubereitung und Vorratshaltung.</p>
          
          <h2>✨ Unsere Philosophie: Ihre Daten gehören Ihnen</h2>
          <p>Im Gegensatz zu vielen anderen Apps basiert CulinaSync auf einer <strong>Local-First-Architektur</strong>. Das bedeutet, all Ihre Daten (Rezepte, Vorräte, Pläne) werden primär auf Ihrem eigenen Gerät gespeichert. Für Sie bedeutet das:</p>
          <ul>
            <li><strong>🚀 Extrem Schnell:</strong> Die App reagiert sofort, ohne auf eine Internetverbindung warten zu müssen.</li>
            <li><strong>🌐 Echte Offline-Fähigkeit:</strong> Planen Sie Ihre Mahlzeiten oder prüfen Sie Ihre Einkaufsliste, auch ohne Netzempfang.</li>
            <li><strong>🔐 Maximaler Datenschutz:</strong> Ihre persönlichen Daten verlassen Ihr Gerät nicht. Sie behalten die volle Kontrolle.</li>
          </ul>

          <h2>💡 Entwicklung & Technologie</h2>
          <p>CulinaSync ist eine moderne Progressive Web App (PWA), die mit React und TypeScript entwickelt wurde. Die KI-gestützten Funktionen, wie der Rezept-Chef, werden von der <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">Google Gemini API</a> angetrieben.</p>
          <p>Der gesamte Entwicklungsprozess wurde interaktiv mit <a href="https://ai.studio/" target="_blank" rel="noopener noreferrer">Google's AI Studio</a> gestaltet. Sie können die Entstehung der App hier nachverfolgen:</p>
          <p style={{ textAlign: 'center', margin: '1.5rem 0' }}><a href="https://ai.studio/apps/drive/1bQgaay6IODal47GVGZcn-65xgfu_PIDC" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#f59e0b', color: '#18181b', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>Projekt im AI Studio ansehen</a></p>

          <h2>🌐 Quelloffen & Community</h2>
          <p>CulinaSync ist ein Open-Source-Projekt. Wir glauben an Transparenz und die Kraft der Community. Der gesamte Quellcode ist öffentlich zugänglich und wir freuen uns über Beiträge, Feedback und Verbesserungsvorschläge. Besuchen Sie uns auf GitHub:</p>
           <p style={{ textAlign: 'center', margin: '1.5rem 0' }}><a href="https://github.com/qnbs/CulinaSync-de-" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#4a4a52', color: '#fafafa', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>Zum GitHub-Repository</a></p>

          <h2>🗺️ Die Zukunft von CulinaSync</h2>
          <p>Die App wird kontinuierlich weiterentwickelt. Geplante zukünftige Erweiterungen umfassen einen Barcode-Scanner für Vorräte, den Import von Rezepten von Webseiten und optionale Synchronisierungsfunktionen zwischen mehreren Geräten.</p>
        </div>
    </article>
);


interface HelpProps {
  appVersion: string;
}

const Help: React.FC<HelpProps> = ({ appVersion }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'about'>('faq');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Hilfe & Informationen</h2>
        <p className="text-zinc-400 mt-1">Alles, was du über CulinaSync wissen musst, um das Beste aus deiner Küche herauszuholen.</p>
      </div>

      <div className="border-b border-zinc-700 flex">
        <button onClick={() => setActiveTab('faq')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'faq' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-400 hover:text-white'}`}>FAQ & Funktionen</button>
        <button onClick={() => setActiveTab('about')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'about' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-400 hover:text-white'}`}>Über die App</button>

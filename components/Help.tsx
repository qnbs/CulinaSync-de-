import React from 'react';
import { Page } from '@/types';
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
  Info as InfoIcon,
} from 'lucide-react';

const FaqItem = ({ question, children }: { question: string, children: React.ReactNode }) => (
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

const HelpCard = ({ icon: Icon, title, children }: { icon: React.FC<any>, title: string, children: React.ReactNode }) => (
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

interface HelpProps {
  setCurrentPage: (page: Page) => void;
}

const Help: React.FC<HelpProps> = ({ setCurrentPage }) => {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Hilfe & Informationen</h2>
        <p className="text-zinc-400 mt-1">Alles, was du über CulinaSync wissen musst, um das Beste aus deiner Küche herauszuholen.</p>
      </div>

      <section>
        <h3 className="text-xl font-semibold text-amber-400 border-b border-zinc-700 pb-2 mb-6 flex items-center gap-3"><BookOpen /> Die Kernfunktionen im Detail</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HelpCard icon={Milk} title="Die Vorratskammer">
                <p>Das Herzstück deiner Küche. Hier verwaltest du, was du hast. Die Einträge hier beeinflussen direkt die Rezeptvorschläge des KI-Chefs und deine Einkaufsliste.</p>
                <ul className="list-disc list-outside pl-5 space-y-1 mt-2">
                    <li><b>Artikel hinzufügen:</b> Über das Formular oben.</li>
                    <li><b>Menge anpassen:</b> Mit den +/- Knöpfen direkt in der Liste.</li>
                    <li><b>Artikel bearbeiten:</b> Klicke auf einen Artikel, um Name, Ablaufdatum etc. zu ändern.</li>
                </ul>
            </HelpCard>
             <HelpCard icon={Bot} title="Der KI-Chef">
                <p>Dein kreativer Partner. Sag ihm, worauf du Lust hast, und er erstellt ein passendes Rezept. Er berücksichtigt dabei automatisch, was du im Vorrat hast.</p>
                 <ul className="list-disc list-outside pl-5 space-y-1 mt-2">
                    <li><b>Gute Anfragen:</b> Sei spezifisch! "Ein schnelles vegetarisches Pastagericht mit Tomaten" liefert bessere Ergebnisse als "Pasta".</li>
                    <li><b>Präferenzen:</b> In den Einstellungen kannst du Diäten (z.B. Vegan) und bevorzugte Küchen hinterlegen.</li>
                </ul>
            </HelpCard>
             <HelpCard icon={Book} title="Das Kochbuch">
                <p>Deine persönliche Rezeptsammlung. Jedes vom KI-Chef generierte Rezept kann hier gespeichert werden. Einmal gespeichert, kannst du es jederzeit wieder aufrufen.</p>
                 <ul className="list-disc list-outside pl-5 space-y-1 mt-2">
                    <li><b>Suchen & Filtern:</b> Nutze die mächtigen Filter, um schnell das perfekte Rezept für den Moment zu finden.</li>
                    <li><b>Favoriten:</b> Markiere deine Lieblingsrezepte mit einem Stern, um sie noch schneller zu finden.</li>
                </ul>
            </HelpCard>
            <HelpCard icon={CalendarDays} title="Der Essensplaner">
                <p>Plane deine Woche visuell. Ziehe einfach Rezepte aus deinem Kochbuch (rechts) auf den gewünschten Tag und die Mahlzeit.</p>
                 <ul className="list-disc list-outside pl-5 space-y-1 mt-2">
                    <li><b>Status-Punkte:</b> Grün = alle Zutaten da. Gelb = Wenige Zutaten fehlen. Rot = Viele Zutaten fehlen.</li>
                    <li><b>Als gekocht markieren:</b> Klicke auf die 3 Punkte bei einer Mahlzeit, um sie als gekocht zu markieren. Die Zutaten werden dann von deinem Vorrat abgezogen.</li>
                </ul>
            </HelpCard>
             <HelpCard icon={ShoppingCart} title="Die Einkaufsliste">
                <p>Generiert sich intelligent aus deinem Essensplan und deinem Vorrat. Du kannst aber auch jederzeit manuell Dinge hinzufügen.</p>
                 <ul className="list-disc list-outside pl-5 space-y-1 mt-2">
                    <li><b>Generieren:</b> Klicke auf "Aus Plan generieren" und wähle die Mahlzeiten aus, für die du einkaufen möchtest.</li>
                    <li><b>Automatische Sortierung:</b> Die Liste versucht, Artikel nach Supermarkt-Abteilungen zu gruppieren.</li>
                </ul>
            </HelpCard>
             <HelpCard icon={Settings} title="Die Einstellungen">
                <p>Passe die App an deine Bedürfnisse an. Hier kannst du deine KI-Präferenzen festlegen, den Wochenstart ändern oder deine Daten exportieren.</p>
                 <ul className="list-disc list-outside pl-5 space-y-1 mt-2">
                    <li><b>Daten-Backup:</b> Exportiere regelmäßig deine Daten als JSON-Datei, um sie zu sichern.</li>
                    <li><b>Wichtig:</b> Änderungen werden erst nach dem Klick auf "Änderungen speichern" wirksam.</li>
                </ul>
            </HelpCard>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-amber-400 border-b border-zinc-700 pb-2 mb-6 flex items-center gap-3"><Lightbulb /> Pro-Tipps & Kurzbefehle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HelpCard icon={TerminalSquare} title="Befehlspalette">
                <p>Drücke <kbd className="bg-zinc-700 text-zinc-200 font-sans rounded-md px-2 py-1 text-xs">⌘K</kbd> (Mac) oder <kbd className="bg-zinc-700 text-zinc-200 font-sans rounded-md px-2 py-1 text-xs">Strg+K</kbd> (Windows), um die Befehlspalette zu öffnen. Von hier aus kannst du blitzschnell zu jeder Seite navigieren oder Aktionen ausführen.</p>
            </HelpCard>
            <HelpCard icon={Mic} title="Sprachsteuerung">
                <p>Aktiviere das Mikrofon in der Kopfzeile und steuere die App mit deiner Stimme. Probier mal:</p>
                <ul className="list-disc list-outside pl-5 space-y-1 mt-2">
                    <li>"Gehe zur Einkaufsliste"</li>
                    <li>"Füge 2 Liter Milch auf die Liste"</li>
                    <li>"Suche nach Hähnchen" (in der Vorratskammer)</li>
                </ul>
            </HelpCard>
        </div>
      </section>


      <section>
        <h3 className="text-xl font-semibold text-amber-400 border-b border-zinc-700 pb-2 mb-6 flex items-center gap-3"><HelpCircle /> Häufig gestellte Fragen (FAQ)</h3>
        <div className="space-y-4">
          <FaqItem question="Was bedeutet 'Local-First' und was sind meine Vorteile?">
            <p>'Local-First' bedeutet, dass alle deine Daten (Rezepte, Vorräte etc.) primär auf deinem eigenen Gerät gespeichert werden, nicht in der Cloud eines Anbieters. Das hat drei große Vorteile:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><b>Extrem Schnell:</b> Die App fühlt sich an wie eine native Anwendung, da sie nicht auf eine Internetverbindung warten muss.</li>
              <li><b>100% Offline-Fähig:</b> Du kannst die App überall nutzen, auch im Supermarkt im Keller ohne Empfang.</li>
              <li><b>Maximaler Datenschutz:</b> Deine persönlichen Daten verlassen dein Gerät nicht. Du hast die volle Kontrolle.</li>
            </ul>
          </FaqItem>
          <FaqItem question="Wie mache ich die Rezepte vom KI-Chef noch besser?">
            <p>Gehe zu <b>Einstellungen → KI-Chef Präferenzen</b>. Dort kannst du Ernährungsweisen (z.B. vegetarisch), bevorzugte Küchen (z.B. Italienisch, Asiatisch) und eine generelle Anweisung (z.B. "alle Gerichte sollen scharf sein") hinterlegen. Diese Vorgaben werden bei jeder Anfrage berücksichtigt.</p>
          </FaqItem>
          <FaqItem question="Was bedeuten die farbigen Punkte im Essensplaner?">
            <p>Sie geben dir einen schnellen Überblick über die Verfügbarkeit der Zutaten für ein geplantes Gericht basierend auf deiner Vorratskammer:</p>
             <ul className="mt-2 list-none space-y-1">
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> <b>Grün:</b> Alle Zutaten sind im Vorrat vorhanden.</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> <b>Gelb:</b> Ein paar Zutaten fehlen.</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> <b>Rot:</b> Viele oder die meisten Zutaten fehlen.</li>
            </ul>
          </FaqItem>
           <FaqItem question="Kann ich die App auf mehreren Geräten nutzen?">
            <p>Momentan werden die Daten nur auf dem Gerät gespeichert, auf dem sie eingegeben wurden. Eine Synchronisierung zwischen Geräten ist für eine zukünftige Version geplant. Du kannst aber die <b>Export/Import-Funktion</b> in den Einstellungen nutzen, um deine Daten manuell zu übertragen.</p>
          </FaqItem>
        </div>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold text-amber-400 border-b border-zinc-700 pb-2 mb-4 flex items-center gap-3"><Info /> Über CulinaSync</h3>
        <div className="bg-zinc-800/50 p-6 rounded-lg text-zinc-400 text-sm">
            <div className="space-y-3">
                <p className="font-semibold text-zinc-200">Version: 1.0.0 (Audit-Build)</p>
                <p>CulinaSync ist eine Vision für die Zukunft des digitalen Kochens. Eine intelligente, datenschutzfreundliche und nahtlose Erfahrung, die dir hilft, kreativer, organisierter und nachhaltiger in deiner eigenen Küche zu sein. </p>
                <p>Diese App wurde als Demonstrationsprojekt entwickelt und nutzt modernste Web-Technologien, um zu zeigen, was heute möglich ist. Sie ist dein kollaborativer kulinarischer Hub.</p>
                <button onClick={() => setCurrentPage('about')} className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold pt-2">
                    <InfoIcon size={16} /> Über die App & Technische Details
                </button>
            </div>
        </div>
      </section>

    </div>
  );
};

export default Help;
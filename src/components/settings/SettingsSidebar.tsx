import React from 'react';
import { Palette, Settings as SettingsIcon, Bot, Mic, Database, LucideProps } from 'lucide-react';

export interface SectionDef {
    id: string;
    label: string;
    icon: React.FC<LucideProps>;
    description: string;
}

export const SETTINGS_SECTIONS: SectionDef[] = [
    { id: 'appearance', label: 'Design', icon: Palette, description: 'Farben & Darstellung' },
    { id: 'modules', label: 'Module', icon: SettingsIcon, description: 'Feature-Konfiguration' },
    { id: 'ai', label: 'KI-Chef', icon: Bot, description: 'Personalisierung & Intelligenz' },
    { id: 'speech', label: 'Audio', icon: Mic, description: 'Sprachausgabe & Steuerung' },
    { id: 'data', label: 'Daten', icon: Database, description: 'Backup & Speicher' },
];

interface SettingsSidebarProps {
    activeSection: string;
    setActiveSection: (id: string) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <nav className="flex flex-row overflow-x-auto md:flex-col gap-2 md:w-64 lg:w-72 flex-shrink-0 md:pr-4 no-scrollbar pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-white/5">
            {SETTINGS_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`relative group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-500)] ${
                            isActive 
                                ? 'bg-zinc-800/80 text-[var(--color-accent-400)] shadow-lg' 
                                : 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-100'
                        }`}
                    >
                        {/* Active Indicator */}
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-[var(--color-accent-500)] md:block hidden shadow-[0_0_10px_var(--color-accent-glow)]" />
                        )}
                        
                        <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-[var(--color-accent-500)]/10' : 'bg-zinc-900 group-hover:bg-zinc-800'}`}>
                            <section.icon size={20} className={isActive ? 'text-[var(--color-accent-400)]' : 'text-zinc-500 group-hover:text-zinc-300'} />
                        </div>
                        
                        <div className="flex-col hidden md:flex">
                            <span className={`font-bold text-sm ${isActive ? 'text-zinc-100' : ''}`}>{section.label}</span>
                            <span className="text-[10px] text-zinc-500 font-medium">{section.description}</span>
                        </div>
                        <span className="md:hidden font-bold text-sm whitespace-nowrap">{section.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};
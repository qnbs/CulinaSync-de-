import React from 'react';
import { AppSettings } from '../../../types';
import { Check, Moon, Sun } from 'lucide-react';

const ACCENT_COLORS: Record<AppSettings['appearance']['accentColor'], { label: string; hex: string; gradient: string }> = {
  amber: { label: 'Bernstein', hex: '#f59e0b', gradient: 'from-amber-400 to-amber-600' },
  rose: { label: 'Rosenrot', hex: '#f43f5e', gradient: 'from-rose-400 to-rose-600' },
  sky: { label: 'Himmelblau', hex: '#0ea5e9', gradient: 'from-sky-400 to-sky-600' },
  emerald: { label: 'Smaragd', hex: '#10b981', gradient: 'from-emerald-400 to-emerald-600' },
};

interface AppearancePanelProps {
    settings: AppSettings;
    onChange: (path: string, value: any) => void;
}

export const AppearancePanel: React.FC<AppearancePanelProps> = ({ settings, onChange }) => {
    const currentAccent = settings.appearance.accentColor;

    return (
        <div className="space-y-8 page-fade-in">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                     <div>
                        <h3 className="text-lg font-bold text-zinc-100 mb-4">Akzentfarbe</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(ACCENT_COLORS).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => onChange('appearance.accentColor', key)}
                                    className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group ${
                                        currentAccent === key 
                                            ? 'bg-zinc-800 border-[var(--color-accent-500)] shadow-[0_0_15px_rgba(0,0,0,0.5)]' 
                                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} shadow-lg flex items-center justify-center`}>
                                        {currentAccent === key && <Check size={16} className="text-white font-bold" />}
                                    </div>
                                    <span className={`font-medium ${currentAccent === key ? 'text-zinc-100' : 'text-zinc-400'}`}>{config.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-zinc-200">Hoher Kontrast</h4>
                                <p className="text-xs text-zinc-500 mt-1">Erhöht die Lesbarkeit von Texten und Rändern.</p>
                            </div>
                            <button 
                                onClick={() => onChange('appearance.highContrast', !settings.appearance.highContrast)}
                                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${settings.appearance.highContrast ? 'bg-[var(--color-accent-500)]' : 'bg-zinc-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md flex items-center justify-center ${settings.appearance.highContrast ? 'translate-x-6' : ''}`}>
                                    {settings.appearance.highContrast ? <Sun size={12} className="text-zinc-900"/> : <Moon size={12} className="text-zinc-500"/>}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Preview Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-accent-400)] to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Live Vorschau</span>
                        </div>
                        
                        <div className="space-y-6 mt-2">
                            {/* Mock Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-500)]/10 flex items-center justify-center border border-[var(--color-accent-500)]/20">
                                    <Sun className="text-[var(--color-accent-400)]" size={24} />
                                </div>
                                <div>
                                    <div className="h-2 w-24 bg-zinc-800 rounded-full mb-2"></div>
                                    <div className="h-2 w-16 bg-zinc-800 rounded-full"></div>
                                </div>
                            </div>

                            {/* Mock Buttons */}
                            <div className="flex gap-3">
                                <button className="flex-1 py-2 rounded-lg bg-[var(--color-accent-500)] text-zinc-900 text-sm font-bold shadow-[0_0_15px_var(--color-accent-glow)]">
                                    Aktion
                                </button>
                                <button className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-700">
                                    Abbrechen
                                </button>
                            </div>
                            
                            {/* Mock Badge */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                <span className="text-sm text-zinc-400">Status</span>
                                <span className="px-2 py-0.5 rounded bg-[var(--color-accent-500)]/20 text-[var(--color-accent-300)] text-xs font-bold border border-[var(--color-accent-500)]/20">
                                    Aktiv
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
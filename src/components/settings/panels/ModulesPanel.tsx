import React from 'react';
import { AppSettings } from '../../../types';

interface ModulesPanelProps {
    settings: AppSettings;
    onChange: (path: string, value: any) => void;
}

const Toggle = ({ label, desc, checked, onToggle }: { label: string, desc: string, checked: boolean, onToggle: () => void }) => (
    <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:bg-zinc-900/50 transition-colors cursor-pointer" onClick={onToggle}>
        <div>
            <h4 className="font-bold text-zinc-200">{label}</h4>
            <p className="text-xs text-zinc-500 mt-1">{desc}</p>
        </div>
        <div className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 ${checked ? 'bg-[var(--color-accent-500)]' : 'bg-zinc-700'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-6' : ''}`} />
        </div>
    </div>
);

export const ModulesPanel: React.FC<ModulesPanelProps> = ({ settings, onChange }) => {
    return (
        <div className="space-y-8 page-fade-in">
             <section className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Allgemein</h3>
                <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2">Haushalts-Name</label>
                    <input 
                        type="text" 
                        value={settings.displayName} 
                        onChange={e => onChange('displayName', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none"
                    />
                </div>
            </section>

            <section className="space-y-4">
                 <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Funktionen</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-zinc-300 mb-2">Wochenstart</label>
                        <select 
                            value={settings.weekStart} 
                            onChange={e => onChange('weekStart', e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 outline-none"
                        >
                            <option value="Monday">Montag</option>
                            <option value="Sunday">Sonntag</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-zinc-300 mb-2">Standard-Portionen</label>
                        <input 
                            type="number" 
                            min="1" 
                            value={settings.defaultServings} 
                            onChange={e => onChange('defaultServings', parseInt(e.target.value))}
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 outline-none"
                        />
                     </div>
                 </div>

                 <Toggle 
                    label="Automatische Kategorisierung" 
                    desc="Einkaufsartikel automatisch sortieren"
                    checked={settings.shoppingList.autoCategorize} 
                    onToggle={() => onChange('shoppingList.autoCategorize', !settings.shoppingList.autoCategorize)} 
                 />
                 
                 <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                     <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-zinc-200">Ablaufwarnung</span>
                        <span className="font-mono text-[var(--color-accent-400)]">{settings.pantry.expiryWarningDays} Tage</span>
                     </div>
                     <input 
                        type="range" min="1" max="14" 
                        value={settings.pantry.expiryWarningDays} 
                        onChange={e => onChange('pantry.expiryWarningDays', parseInt(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]"
                     />
                 </div>
            </section>
        </div>
    );
};
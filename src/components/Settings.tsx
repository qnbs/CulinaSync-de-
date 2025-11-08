import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, importData } from '../services/db';
import { AppSettings } from '../types';
import { Save, Trash2, Download, Upload, AlertTriangle, User, Settings as SettingsIcon, Bot, Info, CheckCircle, RotateCcw, Database, BookOpen, Milk, CalendarDays, ShoppingCart, LucideProps, Palette, Mic, TestTube2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateSettings } from '../store/slices/settingsSlice';
import TagInput from './TagInput';
import { useLiveQuery } from 'dexie-react-hooks';
import { exportFullDataAsJson } from '../services/exportService';
import { addToast as addToastAction, setFocusAction } from '../store/slices/uiSlice';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const ACCENT_COLORS: Record<AppSettings['appearance']['accentColor'], Record<string, string>> = {
  amber: { '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', glow: 'rgba(251, 191, 36, 0.3)', 'glow-soft': 'rgba(251, 191, 36, 0.2)', '400-semi': 'rgba(251, 191, 36, 0.8)' },
  rose: { '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)', 'glow-soft': 'rgba(244, 63, 94, 0.2)', '400-semi': 'rgba(251, 113, 133, 0.8)' },
  sky: { '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9', glow: 'rgba(14, 165, 233, 0.3)', 'glow-soft': 'rgba(14, 165, 233, 0.2)', '400-semi': 'rgba(56, 189, 248, 0.8)' },
  emerald: { '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', glow: 'rgba(16, 185, 129, 0.3)', 'glow-soft': 'rgba(16, 185, 129, 0.2)', '400-semi': 'rgba(52, 211, 153, 0.8)' },
};


const ResetConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const CONFIRMATION_KEYWORD = 'LÖSCHEN';

    useEffect(() => {
        if (isOpen) setConfirmationText('');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={onClose}>
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-red-500 flex items-center gap-2"><AlertTriangle/> Daten wirklich löschen?</h3>
                <p className="text-zinc-400 text-sm my-4">
                    Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden. Alle deine Rezepte, Vorratsartikel, Pläne und Einstellungen werden dauerhaft entfernt.
                </p>
                <p className="text-zinc-300 text-sm mb-2">
                    Um fortzufahren, tippe "<strong className="text-red-400">{CONFIRMATION_KEYWORD}</strong>" in das Feld unten.
                </p>
                <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="w-full bg-zinc-900 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    aria-label="Bestätigungstext eingeben"
                />
                <div className="flex justify-end gap-3 pt-4 mt-2">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                    <button
                        onClick={onConfirm}
                        disabled={confirmationText !== CONFIRMATION_KEYWORD}
                        className="py-2 px-4 rounded-md bg-red-600 text-white font-bold hover:bg-red-500 disabled:bg-zinc-600 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Trash2 size={16}/> Endgültig löschen
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: number | undefined; icon: React.FC<LucideProps> }> = ({ label, value, icon: Icon }) => (
    <div className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4">
        <Icon className="text-[var(--color-accent-400)]" size={24} />
        <div>
            <div className="text-2xl font-bold text-zinc-100">{value ?? '...'}</div>
            <div className="text-sm text-zinc-400">{label}</div>
        </div>
    </div>
);

const SectionCard: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-[var(--color-accent-400)] mb-6">{title}</h3>
        {children}
    </section>
);

const SETTINGS_SECTIONS = [
    { id: 'appearance', label: 'Erscheinungsbild', icon: Palette },
    { id: 'modules', label: 'Moduleinstellungen', icon: SettingsIcon },
    { id: 'ai', label: 'KI-Chef', icon: Bot },
    { id: 'speech', label: 'Sprache & Audio', icon: Mic },
    { id: 'data', label: 'Datenverwaltung', icon: Database },
];

const DIETARY_SUGGESTIONS = ['Vegetarisch', 'Vegan', 'Glutenfrei', 'Laktosefrei', 'Nussfrei', 'Wenig Kohlenhydrate'];

interface SettingsProps {
    installPromptEvent: any;
    onInstallPWA: () => void;
    isStandalone: boolean;
}

const Settings: React.FC<SettingsProps> = ({ installPromptEvent, onInstallPWA, isStandalone }) => {
    const globalSettings = useAppSelector(state => state.settings);
    const { focusAction } = useAppSelector(state => state.ui);
    const dispatch = useAppDispatch();
    
    const [settings, setSettings] = useState<AppSettings>(globalSettings);
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('appearance');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { voices, speak } = useSpeechSynthesis();
    
    const pantryCount = useLiveQuery(() => db.pantry.count());
    const recipeCount = useLiveQuery(() => db.recipes.count());
    const mealPlanCount = useLiveQuery(() => db.mealPlan.count());
    const shoppingListCount = useLiveQuery(() => db.shoppingList.count());

    const canInstall = installPromptEvent && !isStandalone;

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        dispatch(addToastAction({ message, type }));
    };

    useEffect(() => {
      setSettings(globalSettings);
    }, [globalSettings]);

    // Effect to apply theme colors
    useEffect(() => {
      const colors = ACCENT_COLORS[settings.appearance.accentColor];
      const root = document.documentElement;
      Object.entries(colors).forEach(([shade, value]) => {
        root.style.setProperty(`--color-accent-${shade}`, value);
      });
    }, [settings.appearance.accentColor]);

    const isDirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(globalSettings), [settings, globalSettings]);

    const handleSave = () => {
        dispatch(updateSettings(settings));
        addToast('Einstellungen erfolgreich gespeichert!', 'success');
    };

    const handleDiscard = () => {
        setSettings(globalSettings);
    };

    const handleSettingsChange = (path: string, value: any) => {
        const keys = path.split('.');
        setSettings(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    const handleResetData = () => {
        setResetModalOpen(false);
        (db as any).delete().then(() => {
            localStorage.clear();
            addToast('Alle Daten zurückgesetzt. App wird neu geladen...', 'info');
            setTimeout(() => window.location.reload(), 2000);
        }).catch((err: any) => {
            addToast('Fehler beim Zurücksetzen der Daten.', 'error');
            console.error(err);
        });
    };
    
    const handleExport = async () => {
        if (window.confirm('Möchtest du ein vollständiges Backup deiner Daten als JSON-Datei erstellen?')) {
            const success = await exportFullDataAsJson();
            if(success) addToast('Daten erfolgreich exportiert.');
            else addToast('Daten-Export fehlgeschlagen.', 'error');
        }
    };


    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (window.confirm('Möchtest du wirklich die Daten importieren? Alle aktuellen Daten werden überschrieben.')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text !== 'string') throw new Error("File could not be read");
                    const data = JSON.parse(text);

                    await importData(data);
                    if (data.settings) {
                        dispatch(updateSettings(data.settings));
                    }
                    addToast('Daten erfolgreich importiert. App wird neu geladen.', 'info');
                    setTimeout(() => window.location.reload(), 2000);
                    // FIX: Explicitly type the caught error as `any` to avoid a TypeScript error
                    // when `useUnknownInCatchVariables` is enabled, making it consistent
                    // with other error handlers in the file.
                } catch (error: any) {
                    addToast('Import fehlgeschlagen. Bitte stelle sicher, dass es eine gültige CulinaSync-Backup-Datei ist.', 'error');
                    console.error(error);
                } finally {
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }
            };
            reader.readAsText(file);
        } else {
             if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };
    
    useEffect(() => {
        if (focusAction) {
            if (focusAction === 'import') { setActiveSection('data'); triggerFileSelect(); }
            else if (focusAction === 'export') { setActiveSection('data'); handleExport(); }
            dispatch(setFocusAction(null));
        }
    }, [focusAction, dispatch]);


    return (
        <div className="space-y-8 pb-24">
            <ResetConfirmationModal isOpen={isResetModalOpen} onClose={() => setResetModalOpen(false)} onConfirm={handleResetData} />
            
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Einstellungen</h2>
                <p className="text-zinc-400 mt-1">Passe CulinaSync an deine Bedürfnisse an.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                <nav className="flex flex-row overflow-x-auto md:flex-col gap-1 md:w-1/4 lg:w-1/5 border-b-2 md:border-b-0 md:border-r-2 border-zinc-800 pb-2 md:pb-0 md:pr-8">
                    {SETTINGS_SECTIONS.map(section => (
                         <button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex items-center gap-3 text-left w-full p-3 rounded-md font-semibold transition-colors ${activeSection === section.id ? 'bg-[var(--color-accent-500)]/10 text-[var(--color-accent-400)]' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}>
                             <section.icon size={20} />
                             <span className="whitespace-nowrap">{section.label}</span>
                         </button>
                    ))}
                </nav>
                <div className="flex-1 min-w-0">
                    {activeSection === 'appearance' && (
                        <div className="space-y-8 page-fade-in">
                           <SectionCard title="Allgemeine Einstellungen">
                               <div className="max-w-md space-y-6">
                                   <div>
                                       <label htmlFor="displayName" className="block text-sm font-medium text-zinc-300 mb-1">Haushalts-Name</label>
                                       <p className="text-xs text-zinc-500 mb-2">Dieser Name wird in zukünftigen Features wie dem Teilen von Listen verwendet.</p>
                                       <input id="displayName" type="text" value={settings.displayName} onChange={(e) => handleSettingsChange('displayName', e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none" />
                                   </div>
                               </div>
                           </SectionCard>
                           <SectionCard title="Akzentfarbe">
                               <p className="text-sm text-zinc-400 mb-4">Wähle eine Farbe, um die Benutzeroberfläche zu personalisieren.</p>
                               <div className="flex flex-wrap gap-4">
                                   {Object.keys(ACCENT_COLORS).map(color => (
                                       <button key={color} onClick={() => handleSettingsChange('appearance.accentColor', color)} className={`w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-200 ring-2 ${settings.appearance.accentColor === color ? 'ring-offset-zinc-900 ring-offset-2 ring-white' : 'ring-transparent hover:scale-105'}`}>
                                            <div className={`w-full h-full rounded-md capitalize font-bold text-white flex items-center justify-center bg-gradient-to-br from-${color}-400 to-${color}-600`} style={{background: `linear-gradient(to bottom right, ${ACCENT_COLORS[color as keyof typeof ACCENT_COLORS]['400']}, ${ACCENT_COLORS[color as keyof typeof ACCENT_COLORS]['500']})`}}>
                                                {color}
                                            </div>
                                       </button>
                                   ))}
                               </div>
                           </SectionCard>
                        </div>
                    )}
                    {activeSection === 'modules' && (
                       <div className="space-y-8 page-fade-in">
                           <SectionCard title="Essensplaner">
                               <div className="max-w-md space-y-6">
                                   <div>
                                       <label htmlFor="weekStart" className="block text-sm font-medium text-zinc-300 mb-1">Wochenstart</label>
                                       <select id="weekStart" value={settings.weekStart} onChange={e => handleSettingsChange('weekStart', e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none">
                                           <option value="Monday">Montag</option>
                                           <option value="Sunday">Sonntag</option>
                                       </select>
                                   </div>
                               </div>
                           </SectionCard>
                           <SectionCard title="Vorratskammer">
                               <div className="max-w-md space-y-6">
                                   <div>
                                       <label htmlFor="expiryWarningDays" className="block text-sm font-medium text-zinc-300 mb-1">Ablaufwarnung (in Tagen)</label>
                                       <p className="text-xs text-zinc-500 mb-2">Zeige eine Warnung für Artikel, die in X Tagen oder weniger ablaufen.</p>
                                       <input id="expiryWarningDays" type="number" min="1" max="30" value={settings.pantry.expiryWarningDays} onChange={(e) => handleSettingsChange('pantry.expiryWarningDays', parseInt(e.target.value, 10))} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none" />
                                   </div>
                               </div>
                           </SectionCard>
                           <SectionCard title="Einkaufsliste">
                               <div className="max-w-md space-y-6">
                                  <div className="flex items-center justify-between">
                                       <label htmlFor="autoCategorize" className="text-sm font-medium text-zinc-300">Neue Artikel automatisch kategorisieren</label>
                                       <button onClick={() => handleSettingsChange('shoppingList.autoCategorize', !settings.shoppingList.autoCategorize)} className={`w-12 h-6 rounded-full flex items-center transition-colors ${settings.shoppingList.autoCategorize ? 'bg-[var(--color-accent-500)] justify-end' : 'bg-zinc-700 justify-start'}`}><span className="w-5 h-5 bg-white rounded-full block mx-0.5 transform transition-transform" /></button>
                                   </div>
                               </div>
                           </SectionCard>
                       </div>
                    )}
                     {activeSection === 'ai' && (
                        <SectionCard title="KI-Chef Präferenzen">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="block text-sm font-medium text-zinc-300 mb-2">Ernährungsbeschränkungen</h4>
                                    <TagInput tags={settings.aiPreferences.dietaryRestrictions} setTags={(tags) => handleSettingsChange('aiPreferences.dietaryRestrictions', tags)} placeholder="Eigene Einschränkung hinzufügen..." suggestions={DIETARY_SUGGESTIONS} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Bevorzugte Küchen</label>
                                     <TagInput tags={settings.aiPreferences.preferredCuisines} setTags={(tags) => handleSettingsChange('aiPreferences.preferredCuisines', tags)} placeholder="Küche hinzufügen (z.B. Italienisch)..." />
                                </div>
                                <div>
                                    <label htmlFor="customInstruction" className="block text-sm font-medium text-zinc-300 mb-1">Eigene Anweisung an die KI</label>
                                    <p className="text-xs text-zinc-500 mb-2">Diese Anweisung wird jeder Rezeptanfrage hinzugefügt (z.B. "Alle Gerichte sollen kinderfreundlich sein").</p>
                                    <textarea id="customInstruction" value={settings.aiPreferences.customInstruction} onChange={e => handleSettingsChange('aiPreferences.customInstruction', e.target.value)} rows={3} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none" />
                                </div>
                            </div>
                        </SectionCard>
                     )}
                     {activeSection === 'speech' && (
                        <SectionCard title="Sprachausgabe (Kochmodus)">
                             <div className="max-w-md space-y-6">
                                   <div>
                                       <label htmlFor="speechVoice" className="block text-sm font-medium text-zinc-300 mb-1">Stimme</label>
                                       <select id="speechVoice" value={settings.speechSynthesis.voice || ''} onChange={e => handleSettingsChange('speechSynthesis.voice', e.target.value || null)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none" disabled={voices.length === 0}>
                                           <option value="">Standard</option>
                                           {voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
                                       </select>
                                   </div>
                                    <div>
                                       <label htmlFor="speechRate" className="block text-sm font-medium text-zinc-300 mb-1">Geschwindigkeit: {settings.speechSynthesis.rate.toFixed(1)}</label>
                                       <input id="speechRate" type="range" min="0.5" max="2" step="0.1" value={settings.speechSynthesis.rate} onChange={e => handleSettingsChange('speechSynthesis.rate', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]" />
                                   </div>
                                    <div>
                                       <label htmlFor="speechPitch" className="block text-sm font-medium text-zinc-300 mb-1">Tonhöhe: {settings.speechSynthesis.pitch.toFixed(1)}</label>
                                       <input id="speechPitch" type="range" min="0" max="2" step="0.1" value={settings.speechSynthesis.pitch} onChange={e => handleSettingsChange('speechSynthesis.pitch', parseFloat(e.target.value))} className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]" />
                                   </div>
                                   <button onClick={() => speak('Dies ist ein Test der Sprachausgabe.')} className="flex items-center gap-2 text-sm text-[var(--color-accent-400)] font-semibold py-2 px-4 rounded-md hover:bg-[var(--color-accent-500)]/10">
                                      <TestTube2 size={16}/> Testen
                                   </button>
                             </div>
                        </SectionCard>
                     )}
                     {activeSection === 'data' && (
                        <div className="space-y-8 page-fade-in">
                            <SectionCard title="Daten-Dashboard">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <StatCard label="Gespeicherte Rezepte" value={recipeCount} icon={BookOpen} />
                                    <StatCard label="Artikel im Vorrat" value={pantryCount} icon={Milk} />
                                    <StatCard label="Geplante Mahlzeiten" value={mealPlanCount} icon={CalendarDays} />
                                    <StatCard label="Artikel auf Einkaufsliste" value={shoppingListCount} icon={ShoppingCart} />
                                </div>
                            </SectionCard>
                            <SectionCard title="Datenverwaltung">
                               <div className="space-y-6">
                                {canInstall && (
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        <div className="flex-grow">
                                            <h4 className="font-semibold text-zinc-200">App installieren</h4>
                                            <p className="text-sm text-zinc-400">Installiere CulinaSync als App auf deinem Gerät für schnelleren Zugriff und ein natives Erlebnis.</p>
                                        </div>
                                        <button onClick={onInstallPWA} className="w-full md:w-auto flex items-center justify-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-[var(--color-accent-400)] transition-colors flex-shrink-0">
                                            <Download size={18}/> Installieren
                                        </button>
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="flex-grow">
                                        <h4 className="font-semibold text-zinc-200">Daten importieren & exportieren</h4>
                                        <p className="text-sm text-zinc-400">Sichere deine Daten als JSON-Datei oder stelle sie aus einem Backup wieder her.</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
                                        <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept="application/json" />
                                        <button onClick={triggerFileSelect} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors"><Upload size={18}/> Import</button>
                                        <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors"><Download size={18}/> Export</button>
                                    </div>
                                </div>
                                <div className="border-t border-zinc-700"></div>
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <div className="flex-grow">
                                        <h4 className="font-semibold text-red-300">Alle Daten zurücksetzen</h4>
                                        <p className="text-sm text-red-400/80">Lösche alle lokalen Daten endgültig. Diese Aktion kann nicht rückgängig gemacht werden.</p>
                                    </div>
                                    <button onClick={() => setResetModalOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition-colors flex-shrink-0">
                                        <AlertTriangle size={18}/> Daten löschen
                                    </button>
                                </div>
                               </div>
                            </SectionCard>
                        </div>
                     )}
                </div>
            </div>

            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-700 p-4 z-20 page-fade-in">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="font-semibold text-[var(--color-accent-300)]">Du hast ungespeicherte Änderungen.</p>
                        <div className="flex gap-4">
                            <button onClick={handleDiscard} className="flex items-center gap-2 text-zinc-300 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors"><RotateCcw size={18}/> Verwerfen</button>
                            <button onClick={handleSave} className="flex items-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-[var(--color-accent-400)] transition-colors"><Save size={18}/> Änderungen speichern</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, importData } from '@/services/db';
import { AppSettings } from '@/types';
import { Save, Trash2, Download, Upload, AlertTriangle, Settings as SettingsIcon, Bot, Database, BookOpen, Milk, CalendarDays, ShoppingCart, ChevronDown, LucideProps, Speaker } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import TagInput from '@/components/TagInput';
import { useLiveQuery } from 'dexie-react-hooks';
import { exportFullDataAsJson, exportFullDataAsTxt, exportFullDataAsCsv, exportFullDataAsMarkdown, exportFullDataAsPdf } from '@/services/exportService';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';


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
        <Icon className="text-amber-400" size={24} />
        <div>
            <div className="text-2xl font-bold text-zinc-100">{value ?? '...'}</div>
            <div className="text-sm text-zinc-400">{label}</div>
        </div>
    </div>
);

const SETTINGS_SECTIONS = [
    { id: 'preferences', label: 'Allgemein', icon: SettingsIcon },
    { id: 'ai', label: 'KI-Chef', icon: Bot },
    { id: 'speech', label: 'Sprachausgabe', icon: Speaker },
    { id: 'data', label: 'Daten', icon: Database },
];

const DIETARY_SUGGESTIONS = ['Vegetarisch', 'Vegan', 'Glutenfrei', 'Laktosefrei', 'Nussfrei', 'Wenig Kohlenhydrate'];

interface SettingsProps {
    focusAction?: string | null;
    onActionHandled?: () => void;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Settings: React.FC<SettingsProps> = ({ focusAction, onActionHandled, addToast }) => {
    const { settings: globalSettings, saveSettings: setGlobalSettings } = useSettings();
    const [settings, setSettings] = useState<AppSettings>(globalSettings);
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('preferences');
    const [isExportMenuOpen, setExportMenuOpen] = useState(false);
    const { voices, speak } = useSpeechSynthesis();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const pantryCount = useLiveQuery(() => db.pantry.count());
    const recipeCount = useLiveQuery(() => db.recipes.count());
    const mealPlanCount = useLiveQuery(() => db.mealPlan.count());
    const shoppingListCount = useLiveQuery(() => db.shoppingList.count());

    useEffect(() => {
        setSettings(globalSettings);
    }, [globalSettings]);

    const isDirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(globalSettings), [settings, globalSettings]);

    const handleSave = () => {
        setGlobalSettings(settings);
        addToast('Einstellungen erfolgreich gespeichert!', 'success');
    };

    const handleDiscard = () => {
        setSettings(globalSettings);
    };

    const handleSettingsChange = (field: keyof AppSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleAiPrefChange = (field: keyof AppSettings['aiPreferences'], value: any) => {
        setSettings(prev => ({
            ...prev,
            aiPreferences: { ...prev.aiPreferences, [field]: value }
        }));
    };
    
    const handleSpeechPrefChange = (field: keyof AppSettings['speechSynthesis'], value: any) => {
        setSettings(prev => ({
            ...prev,
            speechSynthesis: { ...prev.speechSynthesis, [field]: value }
        }));
    };

    const handleResetData = async () => {
        setResetModalOpen(false);
        try {
            await (db as any).delete();
            localStorage.clear();
            addToast('Alle Daten zurückgesetzt. App wird neu geladen...', 'info');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err: any) {
            addToast('Fehler beim Zurücksetzen der Daten.', 'error');
            console.error(err);
        }
    };
    
    const handleExport = async (format: 'json' | 'txt' | 'csv' | 'md' | 'pdf') => {
        setExportMenuOpen(false);
        if (window.confirm(`Möchtest du wirklich ein vollständiges Backup deiner Daten als ${format.toUpperCase()}-Datei erstellen?`)) {
            try {
                let success = false;
                switch (format) {
                    case 'json': success = await exportFullDataAsJson(); break;
                    case 'txt': success = await exportFullDataAsTxt(); break;
                    case 'csv': success = await exportFullDataAsCsv(); break;
                    case 'md': success = await exportFullDataAsMarkdown(); break;
                    case 'pdf': success = await exportFullDataAsPdf(); break;
                }
                if (success) {
                    addToast('Daten erfolgreich exportiert.', 'success');
                } else {
                    throw new Error("Export function returned false.");
                }
            } catch (error) {
                console.error("Data export failed:", error);
                addToast('Daten-Export fehlgeschlagen.', 'error');
            }
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
                        setGlobalSettings(data.settings);
                    }
                    addToast('Daten erfolgreich importiert. App wird neu geladen.', 'info');
                    setTimeout(() => window.location.reload(), 2000);
                } catch (error) {
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
            else if (focusAction === 'export') { setActiveSection('data'); setExportMenuOpen(true); }
            onActionHandled?.();
        }
    }, [focusAction, onActionHandled]);


    return (
        <div className="space-y-8 pb-24 md:pb-8">
            <ResetConfirmationModal isOpen={isResetModalOpen} onClose={() => setResetModalOpen(false)} onConfirm={handleResetData} />
            
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Einstellungen</h2>
                <p className="text-zinc-400 mt-1">Passe CulinaSync an deine Bedürfnisse an.</p>
            </div>
            
            <nav className="border-b border-zinc-700 flex">
                {SETTINGS_SECTIONS.map(section => (
                    <button 
                        key={section.id} 
                        onClick={() => setActiveSection(section.id)} 
                        className={`py-3 px-4 text-sm font-semibold flex items-center gap-2 transition-colors ${activeSection === section.id ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <section.icon size={16} />
                        <span className='hidden sm:inline'>{section.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-8">
                {activeSection === 'preferences' && (
                    <div className="space-y-8 page-fade-in">
                        <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-amber-400 mb-6">Allgemeine Einstellungen</h3>
                            <div className="max-w-md space-y-6">
                                <div>
                                    <label htmlFor="displayName" className="block text-sm font-medium text-zinc-400 mb-1">Haushalts-Name</label>
                                    <input id="displayName" type="text" value={settings.displayName} onChange={(e) => handleSettingsChange('displayName', e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="defaultServings" className="block text-sm font-medium text-zinc-400 mb-1">Standard-Portionen</label>
                                    <input id="defaultServings" type="number" min="1" value={settings.defaultServings} onChange={(e) => handleSettingsChange('defaultServings', parseInt(e.target.value, 10))} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="weekStart" className="block text-sm font-medium text-zinc-400 mb-1">Wochenstart im Planer</label>
                                    <select id="weekStart" value={settings.weekStart} onChange={e => handleSettingsChange('weekStart', e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none">
                                        <option value="Monday">Montag</option>
                                        <option value="Sunday">Sonntag</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
                    {activeSection === 'ai' && (
                    <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6 page-fade-in">
                        <h3 className="text-xl font-semibold text-amber-400 mb-6">KI-Chef Präferenzen</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="block text-sm font-medium text-zinc-300 mb-2">Ernährungsbeschränkungen</h4>
                                <TagInput tags={settings.aiPreferences.dietaryRestrictions} setTags={(tags) => handleAiPrefChange('dietaryRestrictions', tags)} placeholder="Eigene Einschränkung hinzufügen..." suggestions={DIETARY_SUGGESTIONS} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Bevorzugte Küchen</label>
                                    <TagInput tags={settings.aiPreferences.preferredCuisines} setTags={(tags) => handleAiPrefChange('preferredCuisines', tags)} placeholder="Küche hinzufügen (z.B. Italienisch)..." />
                            </div>
                            <div>
                                <label htmlFor="customInstruction" className="block text-sm font-medium text-zinc-300 mb-1">Eigene Anweisung an die KI</label>
                                <p className="text-xs text-zinc-500 mb-2">Diese Anweisung wird jeder Rezeptanfrage hinzugefügt (z.B. "Alle Gerichte sollen kinderfreundlich sein").</p>
                                <textarea id="customInstruction" value={settings.aiPreferences.customInstruction} onChange={e => handleAiPrefChange('customInstruction', e.target.value)} rows={3} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                            </div>
                        </div>
                    </section>
                    )}
                     {activeSection === 'speech' && (
                        <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6 page-fade-in">
                            <h3 className="text-xl font-semibold text-amber-400 mb-6">Sprachausgabe</h3>
                            <div className="max-w-md space-y-6">
                                <div>
                                    <label htmlFor="tts-voice" className="block text-sm font-medium text-zinc-400 mb-1">Stimme</label>
                                    <select id="tts-voice" value={settings.speechSynthesis.voice || ''} onChange={e => handleSpeechPrefChange('voice', e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" disabled={voices.length === 0}>
                                        <option value="">Automatisch / Standard</option>
                                        {voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
                                    </select>
                                    {voices.length === 0 && <p className="text-xs text-zinc-500 mt-1">Keine deutschen Stimmen vom Browser gefunden.</p>}
                                </div>
                                 <div>
                                    <label htmlFor="tts-rate" className="block text-sm font-medium text-zinc-400 mb-1">Geschwindigkeit: {settings.speechSynthesis.rate.toFixed(1)}</label>
                                    <input id="tts-rate" type="range" min="0.5" max="2" step="0.1" value={settings.speechSynthesis.rate} onChange={e => handleSpeechPrefChange('rate', parseFloat(e.target.value))} className="w-full" />
                                </div>
                                <div>
                                    <label htmlFor="tts-pitch" className="block text-sm font-medium text-zinc-400 mb-1">Tonhöhe: {settings.speechSynthesis.pitch.toFixed(1)}</label>
                                    <input id="tts-pitch" type="range" min="0" max="2" step="0.1" value={settings.speechSynthesis.pitch} onChange={e => handleSpeechPrefChange('pitch', parseFloat(e.target.value))} className="w-full" />
                                </div>
                                <button onClick={() => speak('Hallo! So klinge ich mit den aktuellen Einstellungen.')} className="text-sm text-amber-400 font-semibold hover:text-amber-300">Test-Satz vorlesen</button>
                            </div>
                        </section>
                     )}
                    {activeSection === 'data' && (
                    <div className="space-y-8 page-fade-in">
                        <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-amber-400 mb-4">Daten-Dashboard</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <StatCard label="Gespeicherte Rezepte" value={recipeCount} icon={BookOpen} />
                                <StatCard label="Artikel im Vorrat" value={pantryCount} icon={Milk} />
                                <StatCard label="Geplante Mahlzeiten" value={mealPlanCount} icon={CalendarDays} />
                                <StatCard label="Artikel auf Einkaufsliste" value={shoppingListCount} icon={ShoppingCart} />
                            </div>
                        </section>
                        <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-zinc-200">Daten importieren & exportieren</h4>
                                    <p className="text-sm text-zinc-400">Sichere deine Daten oder stelle sie aus einem Backup wieder her.</p>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
                                    <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept="application/json" />
                                    <button onClick={triggerFileSelect} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors"><Upload size={18}/> Import</button>
                                        <div className="relative inline-block">
                                        <button onClick={() => setExportMenuOpen(!isExportMenuOpen)} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors">
                                            <Download size={18}/> Export <ChevronDown size={16} />
                                        </button>
                                        {isExportMenuOpen && (
                                            <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                                                <a onClick={() => handleExport('json')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">JSON-Backup (.json)</a>
                                                <a onClick={() => handleExport('txt')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Text-Backup (.txt)</a>
                                                <a onClick={() => handleExport('csv')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">CSV-Backup (.csv)</a>
                                                <a onClick={() => handleExport('md')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Markdown-Backup (.md)</a>
                                                <a onClick={() => handleExport('pdf')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">PDF-Backup (.pdf)</a>
                                            </div>
                                        )}
                                            </div>
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
                        </section>
                    </div>
                    )}
            </div>

            {isDirty && (
                <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-20">
                    <div className="bg-zinc-800/80 backdrop-blur-md border border-zinc-700 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xl page-fade-in">
                        <p className="font-semibold text-amber-300 text-sm">Du hast ungespeicherte Änderungen.</p>
                        <div className="flex gap-3">
                            <button onClick={handleDiscard} className="flex items-center gap-2 text-zinc-300 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors text-sm">Abbrechen</button>
                            <button onClick={handleSave} className="flex items-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors text-sm"><Save size={16}/> Speichern</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

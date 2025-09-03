import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, importData } from '@/services/db';
import { AppSettings } from '@/types';
import { Save, Trash2, Download, Upload, AlertTriangle, User, Settings as SettingsIcon, Bot, Info, CheckCircle, RotateCcw, Database, BookOpen, Milk, CalendarDays, ShoppingCart } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import TagInput from '@/components/TagInput';
import { useLiveQuery } from 'dexie-react-hooks';


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

const StatCard: React.FC<{ label: string; value: number | undefined; icon: React.FC<any> }> = ({ label, value, icon: Icon }) => (
    <div className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4">
        <Icon className="text-amber-400" size={24} />
        <div>
            <div className="text-2xl font-bold text-zinc-100">{value ?? '...'}</div>
            <div className="text-sm text-zinc-400">{label}</div>
        </div>
    </div>
);

const SETTINGS_SECTIONS = [
    { id: 'preferences', label: 'Allgemein & Planer', icon: SettingsIcon },
    { id: 'ai', label: 'KI-Chef', icon: Bot },
    { id: 'data', label: 'Datenverwaltung', icon: Database },
];

const DIETARY_SUGGESTIONS = ['Vegetarisch', 'Vegan', 'Glutenfrei', 'Laktosefrei', 'Nussfrei', 'Wenig Kohlenhydrate'];

interface SettingsProps {
    focusAction?: string | null;
    onActionHandled?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ focusAction, onActionHandled }) => {
    const { settings: globalSettings, saveSettings: setGlobalSettings } = useSettings();
    const [settings, setSettings] = useState<AppSettings>(globalSettings);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('preferences');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const pantryCount = useLiveQuery(() => db.pantry.count());
    const recipeCount = useLiveQuery(() => db.recipes.count());
    const mealPlanCount = useLiveQuery(() => db.mealPlan.count());
    const shoppingListCount = useLiveQuery(() => db.shoppingList.count());

    useEffect(() => {
        setSettings(globalSettings);
    }, [globalSettings]);

    const isDirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(globalSettings), [settings, globalSettings]);

    const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 4000);
    };
    
    const handleSave = () => {
        setGlobalSettings(settings);
        showFeedback('Einstellungen erfolgreich gespeichert!', 'success');
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

    const handleResetData = () => {
        setResetModalOpen(false);
        db.delete().then(() => {
            localStorage.clear();
            showFeedback('Alle Daten zurückgesetzt. App wird neu geladen...', 'info');
            setTimeout(() => window.location.reload(), 2000);
        }).catch(err => {
            showFeedback('Fehler beim Zurücksetzen der Daten.', 'error');
            console.error(err);
        });
    };
    
    const handleExportData = async () => {
        try {
            const allData = {
                pantry: await db.pantry.toArray(),
                recipes: await db.recipes.toArray(),
                mealPlan: await db.mealPlan.toArray(),
                shoppingList: await db.shoppingList.toArray(),
                settings: globalSettings,
            };
            const dataStr = JSON.stringify(allData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `culinasync_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showFeedback('Daten erfolgreich exportiert.', 'success');
        } catch (error) {
            showFeedback('Daten-Export fehlgeschlagen.', 'error');
            console.error(error);
        }
    }

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read");
                const data = JSON.parse(text);

                if (window.confirm('Möchtest du wirklich die Daten importieren? Alle aktuellen Daten werden überschrieben.')) {
                    await importData(data);
                    if (data.settings) {
                        setGlobalSettings(data.settings);
                    }
                    showFeedback('Daten erfolgreich importiert. App wird neu geladen.', 'info');
                    setTimeout(() => window.location.reload(), 2000);
                }
            } catch (error) {
                showFeedback('Import fehlgeschlagen. Bitte stelle sicher, dass es eine gültige CulinaSync-Backup-Datei ist.', 'error');
                console.error(error);
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    
    useEffect(() => {
        if (focusAction) {
            if (focusAction === 'import') { setActiveSection('data'); triggerFileSelect(); }
            else if (focusAction === 'export') { setActiveSection('data'); handleExportData(); }
            onActionHandled?.();
        }
    }, [focusAction, onActionHandled]);


    return (
        <div className="space-y-8 pb-24">
            <ResetConfirmationModal isOpen={isResetModalOpen} onClose={() => setResetModalOpen(false)} onConfirm={handleResetData} />
            
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Einstellungen</h2>
                <p className="text-zinc-400 mt-1">Passe CulinaSync an deine Bedürfnisse an.</p>
            </div>
            
            {feedback && (
                <div role="status" aria-live="polite" className={`p-3 rounded-md text-sm font-medium flex items-center gap-3 page-fade-in ${
                    feedback.type === 'success' ? 'bg-green-900/50 text-green-300' : 
                    feedback.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
                }`}>
                    {feedback.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
                    {feedback.message}
                </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                <nav className="flex flex-row overflow-x-auto md:flex-col gap-1 md:w-1/4 lg:w-1/5 border-b-2 md:border-b-0 md:border-r-2 border-zinc-800 pb-2 md:pb-0 md:pr-8">
                    {SETTINGS_SECTIONS.map(section => (
                         <button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex items-center gap-3 text-left w-full p-3 rounded-md font-semibold transition-colors ${activeSection === section.id ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}>
                             <section.icon size={20} />
                             <span className="whitespace-nowrap">{section.label}</span>
                         </button>
                    ))}
                </nav>
                <div className="flex-1 min-w-0">
                    {activeSection === 'preferences' && (
                        <div className="space-y-8 page-fade-in">
                            <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-amber-400 mb-6">Allgemeine Einstellungen</h3>
                                <div className="max-w-md space-y-6">
                                    <div>
                                        <label htmlFor="displayName" className="block text-sm font-medium text-zinc-400 mb-1">Haushalts-Name</label>
                                        <input id="displayName" type="text" value={settings.displayName} onChange={(e) => handleSettingsChange('displayName', e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                                    </div>
                                </div>
                            </section>
                            <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-amber-400 mb-6">Essensplaner</h3>
                                <div className="max-w-md space-y-6">
                                    <div>
                                        <label htmlFor="defaultServings" className="block text-sm font-medium text-zinc-400 mb-1">Standard-Portionen</label>
                                        <input id="defaultServings" type="number" min="1" value={settings.defaultServings} onChange={(e) => handleSettingsChange('defaultServings', parseInt(e.target.value, 10))} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label htmlFor="weekStart" className="block text-sm font-medium text-zinc-400 mb-1">Wochenstart</label>
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
                                        <button onClick={handleExportData} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors"><Download size={18}/> Export</button>
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
            </div>

            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-700 p-4 z-20 page-fade-in">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="font-semibold text-amber-300">Du hast ungespeicherte Änderungen.</p>
                        <div className="flex gap-4">
                            <button onClick={handleDiscard} className="flex items-center gap-2 text-zinc-300 font-bold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors"><RotateCcw size={18}/> Verwerfen</button>
                            <button onClick={handleSave} className="flex items-center gap-2 bg-amber-500 text-zinc-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400 transition-colors"><Save size={18}/> Änderungen speichern</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

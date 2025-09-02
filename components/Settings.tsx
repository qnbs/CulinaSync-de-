import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, importData } from '@/services/db';
import { loadSettings, saveSettings } from '@/services/settingsService';
import { AppSettings } from '@/types';
import { Save, Trash2, Download, Upload, AlertTriangle, User, Settings as SettingsIcon, Bot, Info, CheckCircle, RotateCcw } from 'lucide-react';

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


interface SettingsProps {
    focusAction?: string | null;
    onActionHandled?: () => void;
}

const DIETARY_OPTIONS = ['Vegetarisch', 'Vegan', 'Glutenfrei', 'Laktosefrei'];

const Settings: React.FC<SettingsProps> = ({ focusAction, onActionHandled }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [initialSettings, setInitialSettings] = useState<AppSettings>(loadSettings);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isResetModalOpen, setResetModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(initialSettings), [settings, initialSettings]);

  const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };
  
  const handleSave = () => {
    saveSettings(settings);
    setInitialSettings(settings);
    showFeedback('Einstellungen erfolgreich gespeichert!', 'success');
    // Reload to ensure all components use the new settings, especially the meal planner's week start day.
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleDiscard = () => {
    setSettings(initialSettings);
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
  
  const handleDietaryChange = (restriction: string) => {
    const current = settings.aiPreferences.dietaryRestrictions;
    const newRestrictions = current.includes(restriction)
        ? current.filter(r => r !== restriction)
        : [...current, restriction];
    handleAiPrefChange('dietaryRestrictions', newRestrictions);
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
            settings: loadSettings(),
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
                    saveSettings(data.settings);
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
          if (focusAction === 'import') triggerFileSelect();
          else if (focusAction === 'export') handleExportData();
          onActionHandled?.();
      }
  }, [focusAction, onActionHandled]);


  return (
    <div className="space-y-12 pb-24">
      <ResetConfirmationModal isOpen={isResetModalOpen} onClose={() => setResetModalOpen(false)} onConfirm={handleResetData} />
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Einstellungen</h2>
        <p className="text-zinc-400 mt-1">Passe CulinaSync an deine Bedürfnisse an.</p>
      </div>
      
      {feedback && (
        <div role="status" aria-live="polite" className={`p-3 rounded-md text-sm font-medium flex items-center gap-3 ${
            feedback.type === 'success' ? 'bg-green-900/50 text-green-300' : 
            feedback.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
        }`}>
            {feedback.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
            {feedback.message}
        </div>
      )}

      <div className="space-y-8">
        <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-3"><User/> Allgemein</h3>
          <div className="max-w-md space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-zinc-400 mb-1">Haushalts-Name</label>
              <input id="displayName" type="text" value={settings.displayName} onChange={(e) => handleSettingsChange('displayName', e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
          </div>
        </section>

        <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-3"><SettingsIcon/> Essensplaner</h3>
          <div className="max-w-md space-y-4">
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
        
        <section className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-3"><Bot/> KI-Chef Präferenzen</h3>
            <div className="space-y-6">
                 <div>
                    <h4 className="block text-sm font-medium text-zinc-300 mb-2">Ernährungsbeschränkungen</h4>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {DIETARY_OPTIONS.map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={settings.aiPreferences.dietaryRestrictions.includes(opt)} onChange={() => handleDietaryChange(opt)} className="h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-amber-500 focus:ring-amber-500"/>
                                <span className="text-zinc-300">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="preferredCuisines" className="block text-sm font-medium text-zinc-300 mb-1">Bevorzugte Küchen</label>
                    <p className="text-xs text-zinc-500 mb-2">Trenne mehrere Küchen mit Kommas (z.B. Italienisch, Asiatisch).</p>
                    <input id="preferredCuisines" type="text" value={settings.aiPreferences.preferredCuisines.join(', ')} onChange={(e) => handleAiPrefChange('preferredCuisines', e.target.value.split(',').map(c => c.trim()).filter(Boolean))} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
                 <div>
                    <label htmlFor="customInstruction" className="block text-sm font-medium text-zinc-300 mb-1">Eigene Anweisung</label>
                    <p className="text-xs text-zinc-500 mb-2">Diese Anweisung wird jeder Rezeptanfrage hinzugefügt (z.B. "Alle Gerichte sollen kinderfreundlich sein").</p>
                    <textarea id="customInstruction" value={settings.aiPreferences.customInstruction} onChange={e => handleAiPrefChange('customInstruction', e.target.value)} rows={2} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
            </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-red-500 mb-4">Datenverwaltung</h3>
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-grow">
                    <h4 className="font-semibold text-zinc-200">Daten importieren/exportieren</h4>
                    <p className="text-sm text-zinc-400">Sichere deine Daten oder stelle sie aus einem Backup wieder her.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept="application/json" />
                    <button onClick={triggerFileSelect} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors"><Upload size={18}/> Import</button>
                    <button onClick={handleExportData} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors"><Download size={18}/> Export</button>
                </div>
            </div>
            <div className="border-t border-zinc-800"></div>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-grow">
                    <h4 className="font-semibold text-zinc-200">Alle Daten zurücksetzen</h4>
                    <p className="text-sm text-zinc-400">Lösche alle lokalen Daten endgültig. Diese Aktion kann nicht rückgängig gemacht werden.</p>
                </div>
                <button onClick={() => setResetModalOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-800/80 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                    <AlertTriangle size={18}/> Zurücksetzen
                </button>
            </div>
          </div>
        </section>
      </div>

      {isDirty && (
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-700 p-4 z-20 page-fade-in">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
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
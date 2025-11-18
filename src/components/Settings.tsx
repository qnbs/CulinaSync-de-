import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppSettings, BeforeInstallPromptEvent } from '../types';
import { Save, RotateCcw, CheckCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateSettings } from '../store/slices/settingsSlice';
import { addToast as addToastAction } from '../store/slices/uiSlice';

// New Modular Components
import { SettingsSidebar } from './settings/SettingsSidebar';
import { AppearancePanel } from './settings/panels/AppearancePanel';
import { AiChefPanel } from './settings/panels/AiChefPanel';
import { DataPanel } from './settings/panels/DataPanel';
import { VoicePanel } from './settings/panels/VoicePanel';
import { ModulesPanel } from './settings/panels/ModulesPanel';

const ACCENT_COLORS: Record<AppSettings['appearance']['accentColor'], Record<string, string>> = {
  amber: { '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', glow: 'rgba(251, 191, 36, 0.3)', 'glow-soft': 'rgba(251, 191, 36, 0.2)', '400-semi': 'rgba(251, 191, 36, 0.8)' },
  rose: { '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)', 'glow-soft': 'rgba(244, 63, 94, 0.2)', '400-semi': 'rgba(251, 113, 133, 0.8)' },
  sky: { '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9', glow: 'rgba(14, 165, 233, 0.3)', 'glow-soft': 'rgba(14, 165, 233, 0.2)', '400-semi': 'rgba(56, 189, 248, 0.8)' },
  emerald: { '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', glow: 'rgba(16, 185, 129, 0.3)', 'glow-soft': 'rgba(16, 185, 129, 0.2)', '400-semi': 'rgba(52, 211, 153, 0.8)' },
};

interface SettingsProps {
    installPromptEvent: BeforeInstallPromptEvent | null;
    onInstallPWA: () => void;
    isStandalone: boolean;
}

const Settings: React.FC<SettingsProps> = ({ installPromptEvent, onInstallPWA, isStandalone }) => {
    const dispatch = useAppDispatch();
    const globalSettings = useAppSelector(state => state.settings);
    const { focusAction } = useAppSelector(state => state.ui);
    
    const [localSettings, setLocalSettings] = useState<AppSettings>(globalSettings);
    const [activeSection, setActiveSection] = useState('appearance');
    
    // Sync logic
    useEffect(() => {
        setLocalSettings(globalSettings);
    }, [globalSettings]);

    // Deep linking support via focusAction
    useEffect(() => {
        if (focusAction) {
             if (['import', 'export'].includes(focusAction)) setActiveSection('data');
             else if (['speech', 'voice'].includes(focusAction)) setActiveSection('speech');
        }
    }, [focusAction]);

    // Live Theme Application
    useEffect(() => {
      const colors = ACCENT_COLORS[localSettings.appearance.accentColor];
      const root = document.documentElement;
      Object.entries(colors).forEach(([shade, value]) => {
        root.style.setProperty(`--color-accent-${shade}`, value as string);
      });
    }, [localSettings.appearance.accentColor]);

    const isDirty = useMemo(() => JSON.stringify(localSettings) !== JSON.stringify(globalSettings), [localSettings, globalSettings]);

    const handleSave = () => {
        dispatch(updateSettings(localSettings));
        dispatch(addToastAction({ message: 'Einstellungen gespeichert', type: 'success' }));
    };

    const handleDiscard = () => {
        setLocalSettings(globalSettings);
        dispatch(addToastAction({ message: 'Änderungen verworfen', type: 'info' }));
    };

    const handleChange = useCallback((path: string, value: any) => {
        setLocalSettings(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    }, []);
    
    const addToastWrapper = (msg: string, type: 'success' | 'error' | 'info') => dispatch(addToastAction({ message: msg, type }));

    const renderPanel = () => {
        switch (activeSection) {
            case 'appearance': return <AppearancePanel settings={localSettings} onChange={handleChange} />;
            case 'ai': return <AiChefPanel settings={localSettings} onChange={handleChange} />;
            case 'data': return <DataPanel addToast={addToastWrapper} installPromptEvent={installPromptEvent} onInstallPWA={onInstallPWA} isStandalone={isStandalone} />;
            case 'speech': return <VoicePanel settings={localSettings} onChange={handleChange} />;
            case 'modules': return <ModulesPanel settings={localSettings} onChange={handleChange} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 pb-24 min-h-[60vh]">
             <SettingsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
             
             <div className="flex-grow min-w-0">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-zinc-100">
                         {activeSection === 'appearance' && 'Design & Farben'}
                         {activeSection === 'modules' && 'Modul Konfiguration'}
                         {activeSection === 'ai' && 'KI-Chef Präferenzen'}
                         {activeSection === 'speech' && 'Sprachsteuerung & Audio'}
                         {activeSection === 'data' && 'Daten & Speicher'}
                     </h2>
                     
                     {/* Floating Action Bar for Mobile/Desktop Consistency */}
                     {isDirty && (
                         <div className="flex gap-2 animate-fade-in">
                             <button onClick={handleDiscard} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors" title="Verwerfen">
                                 <RotateCcw size={20} />
                             </button>
                             <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] transition-all shadow-lg shadow-[var(--color-accent-glow)]">
                                 <Save size={18} /> Speichern
                             </button>
                         </div>
                     )}
                 </div>

                 {renderPanel()}
             </div>
        </div>
    );
};

export default Settings;
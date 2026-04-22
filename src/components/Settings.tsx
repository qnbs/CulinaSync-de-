import React, { lazy, Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings, BeforeInstallPromptEvent } from '../types';
import { Save, RotateCcw } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateSettings } from '../store/slices/settingsSlice';
import { addToast as addToastAction } from '../store/slices/uiSlice';

// New Modular Components
import { SettingsSidebar } from './settings/SettingsSidebar';
import { AppearancePanel } from './settings/panels/AppearancePanel';
import { AiChefPanel } from './settings/panels/AiChefPanel';
import { DataPanel } from './settings/panels/DataPanel';
import { ModulesPanel } from './settings/panels/ModulesPanel';
import { ApiKeyPanel } from './settings/panels/ApiKeyPanel';
import { PolicyPanel } from './settings/panels/PolicyPanel';
import { HealthConnectPanel } from './settings/panels/HealthConnectPanel';
import { CommunityPanel } from './settings/panels/CommunityPanel';

const VoicePanel = lazy(() => import('./settings/panels/VoicePanel').then((module) => ({ default: module.VoicePanel })));

const ACCENT_COLORS: Record<AppSettings['appearance']['accentColor'], Record<string, string>> = {
  amber: { '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', glow: 'rgba(251, 191, 36, 0.3)', 'glow-soft': 'rgba(251, 191, 36, 0.2)', '400-semi': 'rgba(251, 191, 36, 0.8)' },
  rose: { '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)', 'glow-soft': 'rgba(244, 63, 94, 0.2)', '400-semi': 'rgba(251, 113, 133, 0.8)' },
  sky: { '300': '#7dd3fc', '400': '#38bdf8', '500': '#0ea5e9', glow: 'rgba(14, 165, 233, 0.3)', 'glow-soft': 'rgba(14, 165, 233, 0.2)', '400-semi': 'rgba(56, 189, 248, 0.8)' },
  emerald: { '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', glow: 'rgba(16, 185, 129, 0.3)', 'glow-soft': 'rgba(16, 185, 129, 0.2)', '400-semi': 'rgba(52, 211, 153, 0.8)' },
};

type SettingsPath =
    | 'language'
    | 'displayName'
    | 'defaultServings'
    | 'weekStart'
    | 'shoppingList.autoCategorize'
    | 'pantry.expiryWarningDays'
    | 'appearance.accentColor'
    | 'appearance.highContrast'
    | 'appearance.kitchenMode'
    | 'appearance.largeText'
    | 'aiPreferences.creativityLevel'
    | 'aiPreferences.dietaryRestrictions'
    | 'aiPreferences.preferredCuisines'
    | 'aiPreferences.customInstruction'
    | 'policies.avoidAllergens'
    | 'policies.ingredientBlacklist'
    | 'policies.minPantryStock'
    | 'speechSynthesis.voice'
    | 'speechSynthesis.rate'
    | 'speechSynthesis.pitch';

const isAccentColor = (value: unknown): value is AppSettings['appearance']['accentColor'] =>
    typeof value === 'string' && ['amber', 'rose', 'sky', 'emerald'].includes(value);

const isLanguage = (value: unknown): value is AppSettings['language'] => value === 'de' || value === 'en';
const isWeekStart = (value: unknown): value is AppSettings['weekStart'] => value === 'Monday' || value === 'Sunday';
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((entry) => typeof entry === 'string');
const isMinPantryStock = (value: unknown): value is NonNullable<AppSettings['policies']>['minPantryStock'] =>
    Array.isArray(value) && value.every((entry) => {
        if (!entry || typeof entry !== 'object') {
            return false;
        }

        const candidate = entry as { name?: unknown; min?: unknown };
        return typeof candidate.name === 'string' && typeof candidate.min === 'number' && Number.isFinite(candidate.min) && candidate.min >= 0;
    });

const settingsMutators: Record<SettingsPath, (draft: AppSettings, value: unknown) => void> = {
    language: (draft, value) => {
        if (isLanguage(value)) draft.language = value;
    },
    displayName: (draft, value) => {
        if (typeof value === 'string') draft.displayName = value;
    },
    defaultServings: (draft, value) => {
        if (typeof value === 'number' && Number.isFinite(value) && value >= 1) draft.defaultServings = value;
    },
    weekStart: (draft, value) => {
        if (isWeekStart(value)) draft.weekStart = value;
    },
    'shoppingList.autoCategorize': (draft, value) => {
        if (typeof value === 'boolean') draft.shoppingList.autoCategorize = value;
    },
    'pantry.expiryWarningDays': (draft, value) => {
        if (typeof value === 'number' && Number.isFinite(value) && value >= 1) draft.pantry.expiryWarningDays = value;
    },
    'appearance.accentColor': (draft, value) => {
        if (isAccentColor(value)) draft.appearance.accentColor = value;
    },
    'appearance.highContrast': (draft, value) => {
        if (typeof value === 'boolean') draft.appearance.highContrast = value;
    },
    'appearance.kitchenMode': (draft, value) => {
        if (typeof value === 'boolean') draft.appearance.kitchenMode = value;
    },
    'appearance.largeText': (draft, value) => {
        if (typeof value === 'boolean') draft.appearance.largeText = value;
    },
    'aiPreferences.creativityLevel': (draft, value) => {
        if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1) draft.aiPreferences.creativityLevel = value;
    },
    'aiPreferences.dietaryRestrictions': (draft, value) => {
        if (isStringArray(value)) draft.aiPreferences.dietaryRestrictions = value;
    },
    'aiPreferences.preferredCuisines': (draft, value) => {
        if (isStringArray(value)) draft.aiPreferences.preferredCuisines = value;
    },
    'aiPreferences.customInstruction': (draft, value) => {
        if (typeof value === 'string') draft.aiPreferences.customInstruction = value;
    },
    'policies.avoidAllergens': (draft, value) => {
        if (isStringArray(value)) draft.policies = { ...(draft.policies ?? {}), avoidAllergens: value };
    },
    'policies.ingredientBlacklist': (draft, value) => {
        if (isStringArray(value)) draft.policies = { ...(draft.policies ?? {}), ingredientBlacklist: value };
    },
    'policies.minPantryStock': (draft, value) => {
        if (isMinPantryStock(value)) draft.policies = { ...(draft.policies ?? {}), minPantryStock: value };
    },
    'speechSynthesis.voice': (draft, value) => {
        if (value === null || typeof value === 'string') draft.speechSynthesis.voice = value;
    },
    'speechSynthesis.rate': (draft, value) => {
        if (typeof value === 'number' && Number.isFinite(value) && value >= 0.5 && value <= 2) draft.speechSynthesis.rate = value;
    },
    'speechSynthesis.pitch': (draft, value) => {
        if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 2) draft.speechSynthesis.pitch = value;
    },
};

interface SettingsProps {
    installPromptEvent: BeforeInstallPromptEvent | null;
    onInstallPWA: () => void;
    isStandalone: boolean;
}

const Settings: React.FC<SettingsProps> = ({ installPromptEvent, onInstallPWA, isStandalone }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const globalSettings = useAppSelector(state => state.settings);
    const { focusAction } = useAppSelector(state => state.ui);
    
    const [draftSettings, setDraftSettings] = useState<AppSettings | null>(null);
    const [selectedSection, setSelectedSection] = useState('appearance');
    const localSettings = draftSettings ?? globalSettings;
    const activeSection = useMemo(() => {
        if (focusAction) {
            if (['import', 'export'].includes(focusAction)) return 'data';
            if (['speech', 'voice'].includes(focusAction)) return 'speech';
            if (['apikey', 'api-key', 'api'].includes(focusAction)) return 'apikey';
        }
        return selectedSection;
    }, [focusAction, selectedSection]);

    // Live Theme Application
    useEffect(() => {
      const colors = ACCENT_COLORS[localSettings.appearance.accentColor];
      const root = document.documentElement;
      Object.entries(colors).forEach(([shade, value]) => {
        root.style.setProperty(`--color-accent-${shade}`, value as string);
      });
    }, [localSettings.appearance.accentColor]);

    const isDirty = useMemo(() => draftSettings !== null && JSON.stringify(draftSettings) !== JSON.stringify(globalSettings), [draftSettings, globalSettings]);

    const handleSave = () => {
        dispatch(updateSettings(localSettings));
        setDraftSettings(null);
        dispatch(addToastAction({ message: t('settings.toast.saved'), type: 'success' }));
    };

    const handleDiscard = () => {
        setDraftSettings(null);
        dispatch(addToastAction({ message: t('settings.toast.discarded'), type: 'info' }));
    };

    const handleChange = useCallback((path: string, value: unknown) => {
        const mutator = settingsMutators[path as SettingsPath];
        if (!mutator) {
            return;
        }

        setDraftSettings(prev => {
            const sourceState = prev ?? globalSettings;
            const newState = structuredClone(sourceState);
            mutator(newState, value);
            return newState;
        });
    }, [globalSettings]);
    
    const addToastWrapper = (msg: string, type: 'success' | 'error' | 'info') => dispatch(addToastAction({ message: msg, type }));

    const renderPanel = () => {
        switch (activeSection) {
            case 'appearance': return <AppearancePanel settings={localSettings} onChange={handleChange} />;
            case 'ai': return <AiChefPanel settings={localSettings} onChange={handleChange} />;
            case 'policies': return <PolicyPanel settings={localSettings} onChange={handleChange} />;
            case 'health': return <HealthConnectPanel />;
            case 'community': return <CommunityPanel />;
            case 'apikey': return <ApiKeyPanel addToast={addToastWrapper} />;
            case 'data': return <DataPanel addToast={addToastWrapper} installPromptEvent={installPromptEvent} onInstallPWA={onInstallPWA} isStandalone={isStandalone} />;
            case 'speech': return (
                <Suspense fallback={<div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-zinc-400">Audio-Modul wird geladen...</div>}>
                    <VoicePanel settings={localSettings} onChange={handleChange} />
                </Suspense>
            );
            case 'modules': return <ModulesPanel settings={localSettings} onChange={handleChange} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 pb-24 min-h-[60vh]">
             <SettingsSidebar activeSection={activeSection} setActiveSection={setSelectedSection} />
             
             <div className="flex-grow min-w-0">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-zinc-100">
                         {activeSection === 'appearance' && t('settings.sections.appearance')}
                         {activeSection === 'modules' && t('settings.sections.modules')}
                         {activeSection === 'ai' && t('settings.sections.ai')}
                         {activeSection === 'policies' && 'Policies'}
                         {activeSection === 'apikey' && t('settings.sections.apiKey')}
                         {activeSection === 'speech' && t('settings.sections.speech')}
                         {activeSection === 'data' && t('settings.sections.data')}
                     </h2>
                     
                     {/* Floating Action Bar for Mobile/Desktop Consistency */}
                     {isDirty && (
                         <div className="flex gap-2 animate-fade-in">
                            <button onClick={handleDiscard} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors" title={t('settings.actions.discard')}>
                                 <RotateCcw size={20} />
                             </button>
                             <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] transition-all shadow-lg shadow-[var(--color-accent-glow)]">
                                 <Save size={18} /> {t('common.save')}
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
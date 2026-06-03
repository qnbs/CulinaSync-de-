import React, { lazy, Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings, BeforeInstallPromptEvent } from '../types';
import { Save, RotateCcw } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateSettings } from '../store/slices/settingsSlice';
import { addToast as addToastAction } from '../store/slices/uiSlice';
import { applySettingsChange } from '../services/settingsMutators';
import { applyAccentTheme } from '../lib/accentTheme';
import { Button } from './ui';

import { SettingsSidebar } from './settings/SettingsSidebar';
import { SettingsPanelIntro } from './settings/SettingsPanelIntro';
import { AppearancePanel } from './settings/panels/AppearancePanel';
import { AiChefPanel } from './settings/panels/AiChefPanel';
import { DataPanel } from './settings/panels/DataPanel';
import { ModulesPanel } from './settings/panels/ModulesPanel';
import { ApiKeyPanel } from './settings/panels/ApiKeyPanel';
import { PolicyPanel } from './settings/panels/PolicyPanel';
import { HealthConnectPanel } from './settings/panels/HealthConnectPanel';
import { CommunityPanel } from './settings/panels/CommunityPanel';
import { LocalAiPanel } from './settings/panels/LocalAiPanel';
import { PrivacyPanel } from './settings/panels/PrivacyPanel';
import { WorkspacePanel } from './settings/panels/WorkspacePanel';

const VoicePanel = lazy(() => import('./settings/panels/VoicePanel').then((module) => ({ default: module.VoicePanel })));

const SETTINGS_SECTION_IDS = new Set([
    'appearance', 'modules', 'workspace', 'ai', 'localAi',
    'policies', 'privacy', 'speech', 'apikey', 'health', 'community', 'data',
]);

const SECTION_TITLE_KEYS: Record<string, string> = {
  appearance: 'settings.sections.appearance',
  modules: 'settings.sections.modules',
  workspace: 'settings.sections.workspace',
  ai: 'settings.sections.ai',
  localAi: 'settings.sections.localAi',
  policies: 'settings.sections.policies',
  privacy: 'settings.sections.privacy',
  health: 'settings.sections.health',
  community: 'settings.sections.community',
  apikey: 'settings.sections.apiKey',
  speech: 'settings.sections.speech',
  data: 'settings.sections.data',
};

interface SettingsProps {
    installPromptEvent: BeforeInstallPromptEvent | null;
    onInstallPWA: () => void;
    isStandalone: boolean;
    isIos?: boolean;
    onCheckForUpdate?: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  installPromptEvent,
  onInstallPWA,
  isStandalone,
  isIos = false,
  onCheckForUpdate,
}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const globalSettings = useAppSelector(state => state.settings);
    const { focusAction } = useAppSelector(state => state.ui);
    
    const [draftSettings, setDraftSettings] = useState<AppSettings | null>(null);
    const [selectedSection, setSelectedSection] = useState('appearance');
    const localSettings = draftSettings ?? globalSettings;
    const activeSection = useMemo(() => {
        if (focusAction) {
            if (SETTINGS_SECTION_IDS.has(focusAction)) return focusAction;
            if (['import', 'export'].includes(focusAction)) return 'data';
            if (['speech', 'voice'].includes(focusAction)) return 'speech';
            if (['apikey', 'api-key', 'api'].includes(focusAction)) return 'apikey';
            if (['local-ai', 'localai'].includes(focusAction)) return 'localAi';
            if (['privacy'].includes(focusAction)) return 'privacy';
        }
        return selectedSection;
    }, [focusAction, selectedSection]);

    useEffect(() => {
      applyAccentTheme(localSettings.appearance.accentColor);
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
        setDraftSettings(prev => {
            const sourceState = prev ?? globalSettings;
            const newState = structuredClone(sourceState);
            if (!applySettingsChange(newState, path, value)) {
              return prev;
            }
            return newState;
        });
    }, [globalSettings]);
    
    const addToastWrapper = (msg: string, type: 'success' | 'error' | 'info') => dispatch(addToastAction({ message: msg, type }));

    const renderPanel = () => {
        switch (activeSection) {
            case 'appearance': return <AppearancePanel settings={localSettings} onChange={handleChange} />;
            case 'modules': return <ModulesPanel settings={localSettings} onChange={handleChange} />;
            case 'workspace': return <WorkspacePanel settings={localSettings} onChange={handleChange} />;
            case 'ai': return <AiChefPanel settings={localSettings} onChange={handleChange} />;
            case 'localAi': return <LocalAiPanel settings={localSettings} onChange={handleChange} />;
            case 'policies': return <PolicyPanel settings={localSettings} onChange={handleChange} />;
            case 'privacy': return <PrivacyPanel settings={localSettings} onChange={handleChange} />;
            case 'health': return <HealthConnectPanel />;
            case 'community': return <CommunityPanel />;
            case 'apikey': return <ApiKeyPanel addToast={addToastWrapper} />;
            case 'data':
              return (
                <DataPanel
                  addToast={addToastWrapper}
                  installPromptEvent={installPromptEvent}
                  onInstallPWA={onInstallPWA}
                  isStandalone={isStandalone}
                  isIos={isIos}
                  onCheckForUpdate={onCheckForUpdate}
                />
              );
            case 'speech': return (
                <Suspense fallback={<div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-zinc-400">{t('settings.voicePanel.loading')}</div>}>
                    <VoicePanel settings={localSettings} onChange={handleChange} />
                </Suspense>
            );
            default: return null;
        }
    };

    const sectionTitleKey = SECTION_TITLE_KEYS[activeSection];

    return (
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 pb-24 min-h-[60vh]">
             <SettingsSidebar activeSection={activeSection} setActiveSection={setSelectedSection} />
             
             <div className="flex-grow min-w-0">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-zinc-100">
                         {sectionTitleKey ? t(sectionTitleKey) : t('settings.title')}
                     </h2>
                     
                     {isDirty && (
                         <div className="flex gap-2 animate-fade-in">
                            <Button type="button" variant="ghost" size="sm" onClick={handleDiscard} title={t('settings.actions.discard')} aria-label={t('settings.actions.discard')}>
                                 <RotateCcw size={18} />
                             </Button>
                             <Button type="button" size="sm" onClick={handleSave}>
                                 <Save size={18} /> {t('common.save')}
                             </Button>
                         </div>
                     )}
                 </div>

                 <SettingsPanelIntro sectionId={activeSection} />
                 {renderPanel()}
             </div>
        </div>
    );
};

export default Settings;

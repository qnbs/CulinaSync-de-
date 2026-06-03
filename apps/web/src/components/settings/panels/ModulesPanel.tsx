import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings } from '../../../types';

interface ModulesPanelProps {
    settings: AppSettings;
    onChange: (path: string, value: unknown) => void;
}

export const ModulesPanel: React.FC<ModulesPanelProps> = ({ settings, onChange }) => {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lang: string) => {
        onChange('language', lang);
        i18n.changeLanguage(lang);
    };

    return (
        <div className="space-y-8 page-fade-in">
             <section className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">{t('settings.general')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.displayName')}</label>
                        <input 
                            type="text" 
                            value={settings.displayName} 
                            onChange={e => onChange('displayName', e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.language')}</label>
                        <select 
                            value={settings.language} 
                            onChange={e => handleLanguageChange(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 outline-none"
                        >
                            <option value="de">{t('settings.german')}</option>
                            <option value="en">{t('settings.english')}</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                 <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">{t('settings.modules.householdTitle')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.weekStart')}</label>
                        <select 
                            value={settings.weekStart} 
                            onChange={e => onChange('weekStart', e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 outline-none"
                        >
                            <option value="Monday">{t('settings.monday')}</option>
                            <option value="Sunday">{t('settings.sunday')}</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.defaultServings')}</label>
                        <input 
                            type="number" 
                            min="1" 
                            value={settings.defaultServings} 
                            onChange={e => onChange('defaultServings', parseInt(e.target.value, 10))}
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 outline-none"
                        />
                     </div>
                 </div>
                 <p className="text-xs text-zinc-500">{t('settings.modules.workspaceHint')}</p>
            </section>
        </div>
    );
};
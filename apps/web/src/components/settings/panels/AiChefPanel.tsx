import React from 'react';
import { AppSettings } from '../../../types';
import TagInput from '../../TagInput';
import { BrainCircuit, Sparkles, Thermometer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DIETARY_SUGGESTIONS_FALLBACK = ['Vegetarisch', 'Vegan', 'Glutenfrei', 'Laktosefrei', 'Nussfrei', 'Wenig Kohlenhydrate', 'Paleo', 'Keto'];
const CUISINE_SUGGESTIONS_FALLBACK = ['Italienisch', 'Asiatisch', 'Indisch', 'Mexikanisch', 'Deutsch', 'Franz\u00f6sisch', 'Mediterran', 'Levantinisch'];

interface AiChefPanelProps {
    settings: AppSettings;
    onChange: (path: string, value: unknown) => void;
}

export const AiChefPanel: React.FC<AiChefPanelProps> = ({ settings, onChange }) => {
    const { t } = useTranslation();
    const creativity = settings.aiPreferences.creativityLevel ?? 0.7;
    const dietarySuggestions = t('settings.aiChef.dietarySuggestions', { returnObjects: true, defaultValue: DIETARY_SUGGESTIONS_FALLBACK }) as string[];
    const cuisineSuggestions = t('settings.aiChef.cuisineSuggestions', { returnObjects: true, defaultValue: CUISINE_SUGGESTIONS_FALLBACK }) as string[];

    const getCreativityLabel = (val: number) => {
        if (val < 0.3) return { label: t('settings.aiChef.creativity.conservative.label'), desc: t('settings.aiChef.creativity.conservative.desc') };
        if (val < 0.6) return { label: t('settings.aiChef.creativity.balanced.label'), desc: t('settings.aiChef.creativity.balanced.desc') };
        if (val < 0.9) return { label: t('settings.aiChef.creativity.creative.label'), desc: t('settings.aiChef.creativity.creative.desc') };
        return { label: t('settings.aiChef.creativity.experimental.label'), desc: t('settings.aiChef.creativity.experimental.desc') };
    };

    const creativityInfo = getCreativityLabel(creativity);

    return (
        <div className="space-y-8 page-fade-in">
            {/* Personality Engine */}
            <section className="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BrainCircuit size={100} />
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
                    <Thermometer className="text-[var(--color-accent-400)]"/> {t('settings.aiChef.title')}
                </h3>
                
                <div className="mb-8 px-2">
                    <div className="flex justify-between mb-2 items-end">
                        <span className="text-2xl font-bold text-[var(--color-accent-400)]">{creativityInfo.label}</span>
                        <span className="text-sm text-zinc-500">{Math.round(creativity * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={creativity} 
                        onChange={(e) => onChange('aiPreferences.creativityLevel', parseFloat(e.target.value))}
                        className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)] hover:accent-[var(--color-accent-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-500)]/50"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                        <span>{t('settings.aiChef.precise')}</span>
                        <span>{t('settings.aiChef.wild')}</span>
                    </div>
                    <p className="mt-4 text-zinc-400 text-sm glass-card p-3 rounded-lg flex items-start gap-2">
                        <Sparkles size={14} className="mt-0.5 text-[var(--color-accent-400)] flex-shrink-0"/>
                        {creativityInfo.desc}
                    </p>
                </div>
            </section>

            <section className="glass-card rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-zinc-100">{t('settings.aiChef.routingTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.aiChef.routingModeLabel')}</label>
                        <select
                            value={settings.aiPreferences.routingMode}
                            onChange={(e) => onChange('aiPreferences.routingMode', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none"
                        >
                            <option value="local-first">{t('settings.localAi.routing.localFirst')}</option>
                            <option value="local-only">{t('settings.localAi.routing.localOnly')}</option>
                            <option value="cloud-first">{t('settings.localAi.routing.cloudFirst')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.aiChef.responseStyleLabel')}</label>
                        <select
                            value={settings.aiPreferences.responseStyle}
                            onChange={(e) => onChange('aiPreferences.responseStyle', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none"
                        >
                            <option value="concise">{t('settings.aiChef.responseStyle.concise')}</option>
                            <option value="balanced">{t('settings.aiChef.responseStyle.balanced')}</option>
                            <option value="detailed">{t('settings.aiChef.responseStyle.detailed')}</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.aiPreferences.usePantryContext}
                            onChange={(e) => onChange('aiPreferences.usePantryContext', e.target.checked)}
                            className="rounded accent-[var(--color-accent-500)]"
                        />
                        <span className="text-sm text-zinc-300">{t('settings.aiChef.contextPantry')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.aiPreferences.useMealPlanContext}
                            onChange={(e) => onChange('aiPreferences.useMealPlanContext', e.target.checked)}
                            className="rounded accent-[var(--color-accent-500)]"
                        />
                        <span className="text-sm text-zinc-300">{t('settings.aiChef.contextMealPlan')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.aiPreferences.useRecipeHistoryContext}
                            onChange={(e) => onChange('aiPreferences.useRecipeHistoryContext', e.target.checked)}
                            className="rounded accent-[var(--color-accent-500)]"
                        />
                        <span className="text-sm text-zinc-300">{t('settings.aiChef.contextRecipes')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.aiPreferences.structuredOutputStrict}
                            onChange={(e) => onChange('aiPreferences.structuredOutputStrict', e.target.checked)}
                            className="rounded accent-[var(--color-accent-500)]"
                        />
                        <span className="text-sm text-zinc-300">{t('settings.aiChef.strictJson')}</span>
                    </label>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-zinc-300">{t('settings.aiChef.ragChunksLabel')}</span>
                        <span className="font-mono text-[var(--color-accent-400)]">{settings.aiPreferences.maxRagChunks}</span>
                    </div>
                    <input
                        type="range"
                        min={4}
                        max={32}
                        value={settings.aiPreferences.maxRagChunks}
                        onChange={(e) => onChange('aiPreferences.maxRagChunks', parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-500)]"
                    />
                </div>
            </section>

            <section className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">{t('settings.aiChef.dietaryLabel')}</label>
                    <TagInput 
                        tags={settings.aiPreferences.dietaryRestrictions} 
                        setTags={(tags) => onChange('aiPreferences.dietaryRestrictions', tags)} 
                        placeholder={t('settings.aiChef.dietaryPlaceholder')} 
                        suggestions={dietarySuggestions} 
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">{t('settings.aiChef.cuisinesLabel')}</label>
                    <TagInput 
                        tags={settings.aiPreferences.preferredCuisines} 
                        setTags={(tags) => onChange('aiPreferences.preferredCuisines', tags)} 
                        placeholder={t('settings.aiChef.cuisinesPlaceholder')} 
                        suggestions={cuisineSuggestions}
                    />
                </div>

                <div>
                    <label htmlFor="customInstruction" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                        {t('settings.aiChef.customInstructionLabel')}
                    </label>
                    <textarea 
                        id="customInstruction" 
                        value={settings.aiPreferences.customInstruction} 
                        onChange={e => onChange('aiPreferences.customInstruction', e.target.value)} 
                        rows={3} 
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent focus:bg-zinc-900 outline-none transition-all text-sm text-zinc-200 placeholder-zinc-600"
                        placeholder={t('settings.aiChef.customInstructionPlaceholder')}
                    />
                </div>
            </section>
        </div>
    );
};
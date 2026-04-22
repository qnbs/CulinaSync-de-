import React from 'react';
import { AppSettings } from '../../../types';
import TagInput from '../../TagInput';
import { useTranslation } from 'react-i18next';

const ALLERGEN_SUGGESTIONS = ['Milch', 'Ei', 'Erdnuss', 'Schalenfrüchte', 'Soja', 'Gluten', 'Fisch', 'Krebstiere', 'Sellerie', 'Senf', 'Sesam', 'Lupine', 'Weichtiere'];

interface PolicyPanelProps {
  settings: AppSettings;
  onChange: (path: string, value: unknown) => void;
}

export const PolicyPanel: React.FC<PolicyPanelProps> = ({ settings, onChange }) => {
  const { t } = useTranslation();
  const policies = settings.policies || {};

  return (
    <div className="space-y-8 page-fade-in">
      <section className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-zinc-100 mb-6">{t('settings.policy.title')}</h3>
        <div className="mb-6">
          <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.policy.avoidAllergensLabel')}</label>
          <TagInput
            tags={policies.avoidAllergens || []}
            setTags={tags => onChange('policies.avoidAllergens', tags)}
            placeholder={t('settings.policy.avoidAllergensPlaceholder')}
            suggestions={ALLERGEN_SUGGESTIONS}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.policy.blacklistLabel')}</label>
          <TagInput
            tags={policies.ingredientBlacklist || []}
            setTags={tags => onChange('policies.ingredientBlacklist', tags)}
            placeholder={t('settings.policy.blacklistPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-2">{t('settings.policy.minStockLabel')}</label>
          <div className="space-y-2">
            {(policies.minPantryStock || []).map((entry, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={entry.name}
                  onChange={e => {
                    const updated = [...(policies.minPantryStock || [])];
                    updated[idx] = { ...entry, name: e.target.value };
                    onChange('policies.minPantryStock', updated);
                  }}
                  placeholder={t('settings.policy.itemPlaceholder')}
                  className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-2 text-sm"
                />
                <input
                  type="number"
                  value={entry.min}
                  min={0}
                  step={1}
                  onChange={e => {
                    const updated = [...(policies.minPantryStock || [])];
                    updated[idx] = { ...entry, min: parseInt(e.target.value) || 0 };
                    onChange('policies.minPantryStock', updated);
                  }}
                  placeholder={t('settings.policy.amountPlaceholder')}
                  className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-2 text-sm w-24"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...(policies.minPantryStock || [])];
                    updated.splice(idx, 1);
                    onChange('policies.minPantryStock', updated);
                  }}
                  className="text-red-400 hover:text-red-300 text-xs px-2"
                >{t('settings.policy.remove')}</button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange('policies.minPantryStock', [...(policies.minPantryStock || []), { name: '', min: 1 }])}
              className="mt-2 px-3 py-1 rounded bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] text-xs"
            >{t('settings.policy.addMinStock')}</button>
          </div>
        </div>
      </section>
    </div>
  );
};

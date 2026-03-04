import React from 'react';
import { AppSettings } from '../../../types';
import TagInput from '../../TagInput';

const ALLERGEN_SUGGESTIONS = ['Milch', 'Ei', 'Erdnuss', 'Schalenfrüchte', 'Soja', 'Gluten', 'Fisch', 'Krebstiere', 'Sellerie', 'Senf', 'Sesam', 'Lupine', 'Weichtiere'];

interface PolicyPanelProps {
  settings: AppSettings;
  onChange: (path: string, value: any) => void;
}

export const PolicyPanel: React.FC<PolicyPanelProps> = ({ settings, onChange }) => {
  const policies = settings.policies || {};

  return (
    <div className="space-y-8 page-fade-in">
      <section className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-zinc-100 mb-6">Haushalts- & Allergie-Policies</h3>
        <div className="mb-6">
          <label className="block text-sm font-bold text-zinc-300 mb-2">Zu meidende Allergene</label>
          <TagInput
            tags={policies.avoidAllergens || []}
            setTags={tags => onChange('policies.avoidAllergens', tags)}
            placeholder="z.B. Milch, Erdnuss..."
            suggestions={ALLERGEN_SUGGESTIONS}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-zinc-300 mb-2">Zutaten-Blacklist</label>
          <TagInput
            tags={policies.ingredientBlacklist || []}
            setTags={tags => onChange('policies.ingredientBlacklist', tags)}
            placeholder="z.B. Koriander, Sellerie..."
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-2">Mindestvorräte</label>
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
                  placeholder="Lebensmittel"
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
                  placeholder="Mindestmenge"
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
                >Entfernen</button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange('policies.minPantryStock', [...(policies.minPantryStock || []), { name: '', min: 1 }])}
              className="mt-2 px-3 py-1 rounded bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] text-xs"
            >+ Mindestvorrat hinzufügen</button>
          </div>
        </div>
      </section>
    </div>
  );
};

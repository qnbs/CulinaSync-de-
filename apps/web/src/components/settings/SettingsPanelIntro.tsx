import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SettingsPanelIntroProps {
  sectionId: string;
}

const MAX_TIPS = 3;

export const SettingsPanelIntro: React.FC<SettingsPanelIntroProps> = ({ sectionId }) => {
  const { t } = useTranslation();
  const leadKey = `settings.panelIntro.${sectionId}.lead`;
  const lead = t(leadKey);

  if (lead === leadKey) {
    return null;
  }

  const tips: string[] = [];
  for (let i = 1; i <= MAX_TIPS; i += 1) {
    const tipKey = `settings.panelIntro.${sectionId}.tip${i}`;
    const tip = t(tipKey);
    if (tip !== tipKey) {
      tips.push(tip);
    }
  }

  return (
    <aside
      className="mb-6 rounded-2xl border border-[var(--color-accent-500)]/25 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-5 shadow-inner"
      aria-label={t('settings.panelIntro.ariaLabel')}
    >
      <div className="flex gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-500)]/10 text-[var(--color-accent-400)]">
          <Lightbulb size={18} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-zinc-300">{lead}</p>
          {tips.length > 0 && (
            <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
              {tips.map((tip) => (
                <li key={tip} className="flex gap-2 text-xs text-zinc-500">
                  <span className="text-[var(--color-accent-400)]" aria-hidden>
                    •
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
};

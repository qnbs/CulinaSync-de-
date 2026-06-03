
import { useState } from 'react';
import { ChevronDown, ArrowRight, Activity, Smartphone, Globe, Database, Settings2 } from 'lucide-react';
import { FAQS, PRO_TIPS, TECH_STACK, PHILOSOPHY, QUICK_LINKS, type HelpSettingsFocus } from './helpData';
import { useTranslation } from 'react-i18next';
import { useHelpSystemStatus } from '../../hooks/useHelpSystemStatus';
import { Badge } from '../ui';

type HelpNavigationProps = {
  onOpenSettings: (focus: HelpSettingsFocus) => void;
};

// --- FAQ Accordion ---
export const FaqSection = ({
  searchTerm,
  onOpenSettings,
}: {
  searchTerm: string;
  onOpenSettings: (focus: HelpSettingsFocus) => void;
}) => {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  const localizedFaqs = FAQS.map((faq) => {
    const keywords = (faq.keywordKeys ?? []).map((k) => t(k)).join(' ');
    return {
      ...faq,
      category: t(faq.categoryKey),
      question: t(faq.questionKey),
      answer: t(faq.answerKey),
      keywords,
    };
  });

  const term = searchTerm.toLowerCase();
  const filteredFaqs = localizedFaqs.filter(
    (f) =>
      !term ||
      f.question.toLowerCase().includes(term) ||
      f.answer.toLowerCase().includes(term) ||
      f.category.toLowerCase().includes(term) ||
      f.keywords.toLowerCase().includes(term),
  );

  if (filteredFaqs.length === 0) {
    return <div className="text-center p-8 text-zinc-500 italic">{t('help.emptyFaq')}</div>;
  }

  return (
    <div className="space-y-3">
      {filteredFaqs.map((faq) => {
        const isOpen = openId === faq.id;
        const answerId = `faq-answer-${faq.id}`;
        return (
          <div
            key={faq.id}
            className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-zinc-800/60 border-[var(--color-accent-500)]/30 shadow-lg' : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/40'}`}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              aria-controls={answerId}
              className="w-full flex items-start justify-between gap-3 p-4 text-left"
            >
              <div className="space-y-1 min-w-0">
                <Badge tone="neutral" className="text-[10px] uppercase tracking-wide">
                  {faq.category}
                </Badge>
                <span className={`block font-medium ${isOpen ? 'text-[var(--color-accent-400)]' : 'text-zinc-200'}`}>
                  {faq.question}
                </span>
              </div>
              <ChevronDown
                className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-accent-400)]' : 'text-zinc-500'}`}
                size={20}
              />
            </button>
            <div
              id={answerId}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-4 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-white/5 space-y-3">
                <p>{faq.answer}</p>
                {faq.settingsFocus && (
                  <button
                    type="button"
                    onClick={() => onOpenSettings(faq.settingsFocus!)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)]"
                  >
                    <Settings2 size={14} aria-hidden />
                    {t('help.faq.openSettings')}
                    <ArrowRight size={12} aria-hidden />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Pro Tips ---
export const TipsSection = ({
  onAction,
  searchTerm,
}: {
  onAction: (id: string) => void;
  searchTerm: string;
}) => {
  const { t } = useTranslation();
  const localizedTips = PRO_TIPS.map((tip) => ({
    ...tip,
    title: t(tip.titleKey),
    description: t(tip.descriptionKey),
    actionLabel: t(tip.actionLabelKey),
  }));

  const term = searchTerm.toLowerCase();
  const filteredTips = localizedTips.filter(
    (tip) =>
      !term ||
      tip.title.toLowerCase().includes(term) ||
      tip.description.toLowerCase().includes(term),
  );

  if (filteredTips.length === 0 && searchTerm) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTips.map((tip) => (
        <div
          key={tip.id}
          className="group relative p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl hover:border-[var(--color-accent-500)]/50 transition-all duration-300 hover:-translate-y-1 shadow-lg"
        >
          <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 group-hover:text-[var(--color-accent-400)] transition-all duration-500">
            <tip.icon size={48} aria-hidden />
          </div>
          <div className="relative z-10">
            <div className="p-2 bg-[var(--color-accent-500)]/10 w-fit rounded-lg mb-3 text-[var(--color-accent-400)]">
              <tip.icon size={20} aria-hidden />
            </div>
            <h4 className="font-bold text-zinc-100 mb-1">{tip.title}</h4>
            <p className="text-xs text-zinc-500 mb-4 min-h-[2.5rem]">{tip.description}</p>
            <button
              type="button"
              onClick={() => onAction(tip.actionId)}
              className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)] transition-colors"
            >
              {tip.actionLabel} <ArrowRight size={14} aria-hidden />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const QuickLinksSection = ({ onOpenSettings }: HelpNavigationProps) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider pl-1">
        {t('help.quickLinks.heading')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUICK_LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onOpenSettings(link.settingsFocus)}
            className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-left hover:border-[var(--color-accent-500)]/40 hover:bg-zinc-800/50 transition-all"
          >
            <div className="p-2 rounded-lg bg-[var(--color-accent-500)]/10 text-[var(--color-accent-400)]">
              <link.icon size={18} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-200">{t(link.labelKey)}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{t(link.descriptionKey)}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

// --- About & Tech Stack ---
export const AboutSection = ({ appVersion }: { appVersion: string }) => {
  const { t } = useTranslation();
  const { online, isStandalone, storageSummary } = useHelpSystemStatus();

  const statusTone = online ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10';
  const statusLabel = online ? t('help.about.online') : t('help.about.offline');

  return (
    <div className="space-y-12 page-fade-in">
      <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">{t('help.about.lead')}</p>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PHILOSOPHY.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:bg-zinc-800/50 transition-colors"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 shadow-inner">
              <item.icon className="text-[var(--color-accent-400)]" size={22} aria-hidden />
            </div>
            <h4 className="font-bold text-zinc-100 mb-2">{t(item.titleKey)}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{t(item.descKey)}</p>
          </div>
        ))}
      </section>

      <section>
        <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
          <Activity className="text-[var(--color-accent-400)]" size={20} aria-hidden />
          {t('help.about.technology')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.id}
              className="flex flex-col items-center p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:border-[var(--color-accent-500)]/30 hover:bg-zinc-900 transition-all"
            >
              <span className="text-2xl mb-2 block" aria-hidden>
                {tech.icon}
              </span>
              <span className="text-xs font-bold text-zinc-300 text-center">{tech.name}</span>
              <span className="text-[10px] text-zinc-600 mt-1 text-center leading-tight">{t(tech.descKey)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            {t('help.about.systemStatus')}
          </h3>
          <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${statusTone}`}>
            <Activity size={12} aria-hidden />
            <span>{online ? t('help.about.systemNormal') : t('help.about.systemOffline')}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="p-2 bg-blue-500/10 rounded-md text-blue-500">
              <Globe size={18} aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('help.about.status')}</p>
              <p className="text-sm font-bold text-zinc-200">{statusLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="p-2 bg-purple-500/10 rounded-md text-purple-500">
              <Smartphone size={18} aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('help.about.version')}</p>
              <p className="text-sm font-bold text-zinc-200">v{appVersion}</p>
              {isStandalone && (
                <p className="text-[10px] text-emerald-500/90 mt-0.5">{t('help.about.pwaInstalled')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="p-2 bg-amber-500/10 rounded-md text-amber-500">
              <Database size={18} aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('help.about.storage')}</p>
              <p className="text-sm font-bold text-zinc-200">
                {storageSummary ?? t('help.about.indexedDbActive')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="p-2 bg-emerald-500/10 rounded-md text-emerald-500">
              <Activity size={18} aria-hidden />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('help.about.dataLayer')}</p>
              <p className="text-sm font-bold text-zinc-200">{t('help.about.indexedDbActive')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

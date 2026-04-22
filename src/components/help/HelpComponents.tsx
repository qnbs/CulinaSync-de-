
import { useState } from 'react';
import { ChevronDown, ArrowRight, Activity, Smartphone, Globe, Database } from 'lucide-react';
import { FAQS, PRO_TIPS, TECH_STACK, PHILOSOPHY } from './helpData';
import { useTranslation } from 'react-i18next';

// --- FAQ Accordion Component ---
export const FaqSection = ({ searchTerm }: { searchTerm: string }) => {
    const { t } = useTranslation();
    const [openId, setOpenId] = useState<string | null>(null);

    const localizedFaqs = FAQS.map((faq) => ({
        ...faq,
        category: t(faq.categoryKey),
        question: t(faq.questionKey),
        answer: t(faq.answerKey),
    }));

    const filteredFaqs = localizedFaqs.filter(f => 
        f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredFaqs.length === 0) return <div className="text-center p-8 text-zinc-500 italic">{t('help.emptyFaq')}</div>;

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
                            className="w-full flex items-center justify-between p-4 text-left"
                        >
                            <span className={`font-medium ${isOpen ? 'text-[var(--color-accent-400)]' : 'text-zinc-200'}`}>{faq.question}</span>
                            <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-accent-400)]' : 'text-zinc-500'}`} size={20} />
                        </button>
                        <div 
                            id={answerId}
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="p-4 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-white/5 mt-2">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- Pro Tips Grid ---
export const TipsSection = ({ onAction, searchTerm }: { onAction: (id: string) => void, searchTerm: string }) => {
    const { t } = useTranslation();
    const localizedTips = PRO_TIPS.map((tip) => ({
        ...tip,
        title: t(tip.titleKey),
        description: t(tip.descriptionKey),
        actionLabel: t(tip.actionLabelKey),
    }));

    const filteredTips = localizedTips.filter(tip => 
        tip.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tip.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredTips.length === 0 && searchTerm) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTips.map((tip) => (
                <div key={tip.id} className="group relative p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl hover:border-[var(--color-accent-500)]/50 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 group-hover:text-[var(--color-accent-400)] transition-all duration-500">
                        <tip.icon size={48} />
                    </div>
                    <div className="relative z-10">
                        <div className="p-2 bg-[var(--color-accent-500)]/10 w-fit rounded-lg mb-3 text-[var(--color-accent-400)]">
                            <tip.icon size={20} />
                        </div>
                        <h4 className="font-bold text-zinc-100 mb-1">{tip.title}</h4>
                        <p className="text-xs text-zinc-500 mb-4 h-8">{tip.description}</p>
                        <button 
                            onClick={() => onAction(tip.actionId)}
                            className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)] transition-colors"
                        >
                            {tip.actionLabel} <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- About & Tech Stack ---
export const AboutSection = ({ appVersion }: { appVersion: string }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-12 page-fade-in">
            {/* Philosophy Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PHILOSOPHY.map((item) => (
                    <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl text-center hover:bg-zinc-800/50 transition-colors">
                        <div className="mx-auto bg-zinc-950 w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-zinc-800 shadow-inner">
                            <item.icon className="text-[var(--color-accent-400)]" size={24} />
                        </div>
                        <h4 className="font-bold text-zinc-100 mb-2">{t(item.titleKey)}</h4>
                        <p className="text-xs text-zinc-400">{t(item.descKey)}</p>
                    </div>
                ))}
            </section>

            {/* Tech Stack Grid */}
            <section>
                <h3 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
                    <Activity className="text-[var(--color-accent-400)]" size={20} />
                    {t('help.about.technology')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {TECH_STACK.map((tech) => (
                        <div key={tech.id} className="flex flex-col items-center p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:border-[var(--color-accent-500)]/30 hover:bg-zinc-900 transition-all cursor-default group">
                            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform block">{tech.icon}</span>
                            <span className="text-sm font-bold text-zinc-300">{tech.name}</span>
                            <span className="text-[10px] text-zinc-600 mt-1 text-center">{t(tech.descKey)}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* System Health */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{t('help.about.systemStatus')}</h3>
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
                        <Activity size={12} />
                        <span>{t('help.about.systemNormal')}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                        <div className="p-2 bg-blue-500/10 rounded-md text-blue-500"><Globe size={18}/></div>
                        <div>
                            <p className="text-xs text-zinc-500">{t('help.about.status')}</p>
                            <p className="text-sm font-bold text-zinc-200">{t('help.about.online')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                         <div className="p-2 bg-purple-500/10 rounded-md text-purple-500"><Smartphone size={18}/></div>
                        <div>
                            <p className="text-xs text-zinc-500">{t('help.about.version')}</p>
                            <p className="text-sm font-bold text-zinc-200">v{appVersion}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                         <div className="p-2 bg-amber-500/10 rounded-md text-amber-500"><Database size={18}/></div>
                        <div>
                            <p className="text-xs text-zinc-500">{t('help.about.storage')}</p>
                            <p className="text-sm font-bold text-zinc-200">{t('help.about.indexedDbActive')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
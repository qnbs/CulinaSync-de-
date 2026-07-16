import React, { useMemo, useState } from 'react';
import { Joyride, STATUS, type EventData, type Step } from 'react-joyride';
import { ChefHat, FlaskConical, Sparkles, PlayCircle, Check, Bot, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useModalA11y } from '../hooks/useModalA11y';
import { loadDemoPantrySeed } from '../services/demoSeedService';

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { t } = useTranslation();

    const tourSteps: Step[] = useMemo(
        () => [
            {
                target: '[data-tour="header"]',
                content: t('onboarding.tour.step1'),
                placement: 'bottom',
            },
            {
                target: '#main-content',
                content: t('onboarding.tour.step2'),
                placement: 'top',
            },
            {
                target: '[data-tour="bottom-nav"]',
                content: t('onboarding.tour.step3'),
                placement: 'top',
            },
        ],
        [t],
    );

    const joyrideLocale = useMemo(
        () => ({
            back: t('onboarding.joyride.back'),
            close: t('onboarding.joyride.close'),
            last: t('onboarding.joyride.last'),
            next: t('onboarding.joyride.next'),
            skip: t('onboarding.joyride.skip'),
        }),
        [t],
    );

    const [runTour, setRunTour] = useState(false);
    const [seedLoading, setSeedLoading] = useState(false);
    const [seedDone, setSeedDone] = useState(false);
    const modalRef = React.useRef<HTMLDivElement>(null);
    const startButtonRef = React.useRef<HTMLButtonElement>(null);

    // QNBS-v3: Intro v1.0 — Escape/Backdrop schließen; kein Scroll-Lock während Joyride
    useModalA11y({
        isOpen: !runTour,
        onClose: onComplete,
        containerRef: modalRef,
        initialFocusRef: startButtonRef,
    });

    const handleTourEvent = (data: EventData) => {
        const finished = data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED;
        if (finished) {
            onComplete();
        }
    };

    const handleSeedData = async () => {
        setSeedLoading(true);
        try {
            await loadDemoPantrySeed();
            setSeedDone(true);
        } finally {
            setSeedLoading(false);
        }
    };

    return (
        <>
            <Joyride
                run={runTour}
                steps={tourSteps}
                onEvent={handleTourEvent}
                continuous
                options={{
                    skipBeacon: true,
                    showProgress: true,
                    skipScroll: true,
                    zIndex: 120,
                    backgroundColor: '#101014',
                    textColor: '#e4e4e7',
                    primaryColor: '#f59e0b',
                    buttons: ['back', 'skip', 'primary'],
                }}
                locale={joyrideLocale}
            />
            {!runTour && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 page-fade-in glass-overlay"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            onComplete();
                        }
                    }}
                >
                    <div
                        ref={modalRef}
                        className="relative w-full max-w-lg text-center rounded-2xl p-8 space-y-6 modal-fade-in glass-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="onboarding-title"
                        aria-describedby="onboarding-description"
                        tabIndex={-1}
                    >
                    <button
                        type="button"
                        onClick={onComplete}
                        className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80"
                        aria-label={t('onboarding.dismissAria')}
                    >
                        <X size={18} aria-hidden />
                    </button>
                    <div className="flex justify-center items-center gap-4 text-[var(--color-accent-400)]">
                       <ChefHat size={32} aria-hidden />
                              <h2 id="onboarding-title" className="text-2xl font-bold text-zinc-100">{t('onboarding.title')}</h2>
                    </div>

                          <p id="onboarding-description" className="text-zinc-400">{t('onboarding.description')}</p>

                    <div className="grid grid-cols-1 gap-3 text-left">
                        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                            <PlayCircle className="text-[var(--color-accent-400)] mt-0.5" size={20} aria-hidden />
                            <div>
                                <h3 className="font-semibold text-zinc-100">{t('onboarding.tour.title')}</h3>
                                <p className="text-sm text-zinc-400">{t('onboarding.tour.description')}</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                            <FlaskConical className="text-emerald-400 mt-0.5" size={20} aria-hidden />
                            <div>
                                <h3 className="font-semibold text-zinc-100">{t('onboarding.demo.title')}</h3>
                                <p className="text-sm text-zinc-400">{t('onboarding.demo.description')}</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                            <Bot className="text-sky-400 mt-0.5" size={20} aria-hidden />
                            <div>
                                <h3 className="font-semibold text-zinc-100">{t('onboarding.localAi.title')}</h3>
                                <p className="text-sm text-zinc-400">{t('onboarding.localAi.description')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            ref={startButtonRef}
                            type="button"
                            onClick={() => setRunTour(true)}
                            className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-3 px-4 rounded-md hover:bg-[var(--color-accent-400)] transition-colors"
                        >
                            <Sparkles size={18} aria-hidden /> {t('onboarding.startTour')}
                        </button>
                        {seedDone ? (
                            <button
                                type="button"
                                onClick={onComplete}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/90 text-zinc-100 font-bold py-3 px-4 rounded-md hover:bg-emerald-500"
                            >
                                <Check size={18} aria-hidden />
                                {t('onboarding.demo.continue')}
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={seedLoading}
                                onClick={() => void handleSeedData()}
                                className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-zinc-100 font-bold py-3 px-4 rounded-md border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50"
                            >
                                <FlaskConical size={18} aria-hidden />
                                {seedLoading ? t('onboarding.demo.loading') : t('onboarding.demo.load')}
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onComplete}
                        className="w-full py-2.5 rounded-md border border-zinc-700/80 text-sm font-semibold text-zinc-200 hover:bg-zinc-800/80"
                    >
                        {t('onboarding.skip')}
                    </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Onboarding;

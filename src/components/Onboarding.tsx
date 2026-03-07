import React, { useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { ChefHat, FlaskConical, Sparkles, PlayCircle, Check } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';
import { db } from '../services/dbInstance';

const tourSteps: Step[] = [
    {
        target: '[data-tour="header"]',
        content: 'Oben findest du Navigation, Sprachsteuerung und Schnellzugriff auf Einstellungen.',
        placement: 'bottom',
        disableBeacon: true,
    },
    {
        target: '#main-content',
        content: 'Hier arbeitest du im aktuellen Bereich: Vorrat, Rezepte, Planung oder Einkaufsliste.',
        placement: 'top',
    },
    {
        target: '[data-tour="bottom-nav"]',
        content: 'Unten kannst du im Kochalltag schnell zwischen den Modulen wechseln.',
        placement: 'top',
    },
];

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [runTour, setRunTour] = useState(false);
    const [seedLoading, setSeedLoading] = useState(false);
    const [seedDone, setSeedDone] = useState(false);
    const modalRef = React.useRef<HTMLDivElement>(null);
    const startButtonRef = React.useRef<HTMLButtonElement>(null);

    useModalA11y({
        isOpen: true,
        onClose: () => {},
        containerRef: modalRef,
        initialFocusRef: startButtonRef,
    });

    const handleTourCallback = (data: CallBackProps) => {
        const finished = data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED;
        if (finished) {
            onComplete();
        }
    };

    const handleSeedData = async () => {
        setSeedLoading(true);
        try {
            const now = Date.now();
            await db.transaction('rw', db.pantry, async () => {
                await db.pantry.bulkAdd([
                    { name: 'Tomaten', quantity: 6, unit: 'Stk', category: 'Gemuese', createdAt: now, updatedAt: now },
                    { name: 'Spaghetti', quantity: 1, unit: 'Packung', category: 'Trockenware', createdAt: now, updatedAt: now },
                    { name: 'Olivenoel', quantity: 1, unit: 'Flasche', category: 'Grundlagen', createdAt: now, updatedAt: now },
                    { name: 'Knoblauch', quantity: 3, unit: 'Zehen', category: 'Gemuese', createdAt: now, updatedAt: now },
                ]);
            });
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
                callback={handleTourCallback}
                continuous
                showProgress
                showSkipButton
                disableScrolling
                styles={{
                    options: {
                        zIndex: 120,
                        backgroundColor: '#101014',
                        textColor: '#e4e4e7',
                        primaryColor: '#f59e0b',
                    },
                }}
                locale={{
                    back: 'Zurueck',
                    close: 'Schliessen',
                    last: 'Fertig',
                    next: 'Weiter',
                    skip: 'Ueberspringen',
                }}
            />
            {!runTour && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 page-fade-in glass-overlay">
                    <div ref={modalRef} className="w-full max-w-lg text-center rounded-2xl p-8 space-y-6 modal-fade-in glass-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description" tabIndex={-1}>
                    <div className="flex justify-center items-center gap-4 text-[var(--color-accent-400)]">
                       <ChefHat size={32} />
                       <h2 id="onboarding-title" className="text-2xl font-bold text-zinc-100">Willkommen bei CulinaSync!</h2>
                    </div>

                    <p id="onboarding-description" className="text-zinc-400">Starte mit einer gefuehrten Tour oder lade Demo-Daten fuer ein interaktives Tutorial.</p>

                    <div className="grid grid-cols-1 gap-3 text-left">
                        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                            <PlayCircle className="text-[var(--color-accent-400)] mt-0.5" size={20} />
                            <div>
                                <h3 className="font-semibold text-zinc-100">Gefuehrte Tour</h3>
                                <p className="text-sm text-zinc-400">In 3 Schritten Navigation und Kernbereiche kennenlernen.</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                            <FlaskConical className="text-emerald-400 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-semibold text-zinc-100">Interaktives Tutorial</h3>
                                <p className="text-sm text-zinc-400">Fuellt deinen Vorrat mit Beispielartikeln, damit du direkt testen kannst.</p>
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
                            <Sparkles size={18} /> Tour starten
                        </button>
                        <button
                            type="button"
                            disabled={seedLoading || seedDone}
                            onClick={handleSeedData}
                            className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-zinc-100 font-bold py-3 px-4 rounded-md border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50"
                        >
                            {seedDone ? <Check size={18} /> : <FlaskConical size={18} />}
                            {seedDone ? 'Demo geladen' : (seedLoading ? 'Lade Demo...' : 'Demo laden')}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onComplete}
                        className="text-sm text-zinc-500 hover:text-zinc-300"
                    >
                        Ueberspringen
                    </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Onboarding;
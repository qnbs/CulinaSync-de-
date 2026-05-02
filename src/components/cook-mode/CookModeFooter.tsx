import React from 'react';
import type { TFunction } from 'i18next';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

type Props = {
  currentStep: number;
  totalSteps: number;
  isInterfaceVisible: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  t: TFunction;
};

export const CookModeFooter: React.FC<Props> = ({
  currentStep,
  totalSteps,
  isInterfaceVisible,
  onPrev,
  onNext,
  onFinish,
  t,
}) => (
  <footer
    className={`fixed bottom-0 left-0 right-0 z-30 p-6 pb-safe flex justify-between items-end gap-4 transition-all duration-700 ${isInterfaceVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}
  >
    <button
      type="button"
      onClick={onPrev}
      disabled={currentStep === 0}
      className="flex-1 glass-button flex flex-col items-center justify-center h-24 rounded-3xl text-zinc-300 active:text-white disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 border-white/10 touch-manipulation"
      aria-label={t('cookMode.actions.previousStepAria')}
    >
      <ChevronLeft size={40} />
      <span className="text-xs uppercase font-bold tracking-widest mt-1">{t('cookMode.previous')}</span>
    </button>

    {currentStep < totalSteps - 1 ? (
      <button
        type="button"
        onClick={onNext}
        className="flex-[2] flex flex-col items-center justify-center h-28 rounded-3xl bg-[var(--color-accent-500)] text-zinc-900 active:bg-[var(--color-accent-400)] active:scale-95 transition-all shadow-[0_0_40px_rgba(var(--color-accent-glow),0.4)] border-4 border-white/5 hover:border-[var(--color-accent-300)] touch-manipulation"
        aria-label={t('cookMode.actions.nextStepAria')}
      >
        <ChevronRight size={56} />
        <span className="text-sm uppercase font-black tracking-widest">{t('cookMode.next')}</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={onFinish}
        className="flex-[2] flex flex-col items-center justify-center h-28 rounded-3xl bg-emerald-500 text-zinc-900 active:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)] border-4 border-white/5 hover:border-emerald-300 touch-manipulation"
        aria-label={t('cookMode.actions.finishAria')}
      >
        <CheckCircle2 size={56} />
        <span className="text-sm uppercase font-black tracking-widest">{t('cookMode.finish')}</span>
      </button>
    )}
  </footer>
);

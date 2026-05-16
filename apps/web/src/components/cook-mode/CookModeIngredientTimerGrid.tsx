import React from 'react';
import type { TFunction } from 'i18next';
import { CircleCheck } from 'lucide-react';

type Props = {
  ingredientList: string[];
  checkedIngredients: string[];
  ingredientProgress: number;
  timerSeconds: number;
  timerRunning: boolean;
  onToggleIngredient: (ingredient: string) => void;
  onTimerToggle: () => void;
  onAddThirty: () => void;
  onResetTimer: () => void;
  formatTimer: (seconds: number) => string;
  isUiVisible: boolean;
  currentStep: number;
  instructionText: string;
  stepProgressLabel: string;
  t: TFunction;
};

export const CookModeIngredientTimerGrid: React.FC<Props> = ({
  ingredientList,
  checkedIngredients,
  ingredientProgress,
  timerSeconds,
  timerRunning,
  onToggleIngredient,
  onTimerToggle,
  onAddThirty,
  onResetTimer,
  formatTimer,
  isUiVisible,
  currentStep,
  instructionText,
  stepProgressLabel,
  t,
}) => (
  <div className="relative z-10 flex-grow flex flex-col justify-center items-center px-4 md:px-16 lg:px-24 pb-20">
    <div
      aria-hidden="true"
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[35rem] font-bold text-white/[0.03] select-none pointer-events-none transition-opacity duration-1000 ${isUiVisible ? 'opacity-100' : 'opacity-40'}`}
    >
      {currentStep + 1}
    </div>

    <div className="max-w-5xl w-full space-y-8 text-center relative">
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-white/5 text-zinc-300 text-sm font-bold tracking-wide transition-opacity duration-700 ${isUiVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <span>{stepProgressLabel}</span>
      </div>

      <div className="min-h-[20vh] flex items-center justify-center overflow-y-auto max-h-[50vh]">
        <p
          key={currentStep}
          className="text-2xl md:text-5xl lg:text-6xl font-medium leading-snug text-white drop-shadow-2xl modal-fade-in selection:bg-[var(--color-accent-500)] selection:text-black"
        >
          {instructionText}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-left">
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest font-bold text-zinc-400">{t('cookMode.ingredientsCheck')}</p>
            <p className="text-xs text-zinc-500">
              {checkedIngredients.length}/{ingredientList.length}
            </p>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${ingredientProgress}%` }} />
          </div>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {ingredientList.map((item) => {
              const checked = checkedIngredients.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onToggleIngredient(item)}
                  aria-pressed={checked}
                  aria-label={checked ? t('cookMode.ingredientCheckedAria', { name: item }) : t('cookMode.ingredientUncheckedAria', { name: item })}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 border text-sm transition-colors ${checked ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200' : 'bg-zinc-900/60 border-white/5 text-zinc-300'}`}
                >
                  <span>{item}</span>
                  {checked && <CircleCheck size={16} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest font-bold text-zinc-400">{t('cookMode.stepTimer')}</p>
            <p className={`text-xs font-semibold ${timerRunning ? 'text-[var(--color-accent-300)]' : 'text-zinc-500'}`}>
              {timerRunning ? t('cookMode.timerRunning') : t('cookMode.timerPaused')}
            </p>
          </div>
          <p className="font-mono text-4xl md:text-5xl text-center tracking-widest text-zinc-100">{formatTimer(timerSeconds)}</p>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={onTimerToggle} className="rounded-xl py-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold">
              {timerRunning ? t('cookMode.pause') : t('cookMode.start')}
            </button>
            <button type="button" onClick={onAddThirty} className="rounded-xl py-2 bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">
              {t('cookMode.addThirtySeconds')}
            </button>
            <button type="button" onClick={onResetTimer} className="rounded-xl py-2 bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">
              {t('cookMode.reset')}
            </button>
          </div>
          <p className="text-xs text-zinc-500">{t('cookMode.voiceHint')}</p>
        </div>
      </div>
    </div>
  </div>
);

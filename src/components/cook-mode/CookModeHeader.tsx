import React from 'react';
import type { TFunction } from 'i18next';
import { X as XIcon, RefreshCw, Volume2, VolumeX, TimerReset, Play, Pause } from 'lucide-react';

type Props = {
  recipeTitle: string;
  label: string;
  timerRunning: boolean;
  timerSeconds: number;
  isSpeechEnabled: boolean;
  isSpeaking: boolean;
  isUiVisible: boolean;
  onTimerToggle: () => void;
  onResetTimer: () => void;
  onRepeatStep: () => void;
  onToggleSpeech: () => void;
  onExit: () => void;
  formatTimer: (seconds: number) => string;
  t: TFunction;
};

export const CookModeHeader: React.FC<Props> = ({
  recipeTitle,
  label,
  timerRunning,
  timerSeconds,
  isSpeechEnabled,
  isSpeaking,
  isUiVisible,
  onTimerToggle,
  onResetTimer,
  onRepeatStep,
  onToggleSpeech,
  onExit,
  formatTimer,
  t,
}) => (
  <header
    className={`relative z-20 flex justify-between items-center p-4 md:p-6 transition-all duration-700 ${isUiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}
  >
    <div className="flex flex-col">
      <span className="text-xs font-bold text-[var(--color-accent-400)] uppercase tracking-widest mb-1 text-shadow-sm">{label}</span>
      <h3 className="text-xl md:text-2xl font-bold text-white truncate max-w-[50vw] text-shadow-lg leading-tight">{recipeTitle}</h3>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full glass-button border border-white/10">
        <button
          type="button"
          onClick={onTimerToggle}
          className="text-zinc-200"
          title={timerRunning ? t('cookMode.actions.pauseTimerTitle') : t('cookMode.actions.startTimerTitle')}
          aria-label={timerRunning ? t('cookMode.actions.pauseTimerTitle') : t('cookMode.actions.startTimerTitle')}
        >
          {timerRunning ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
        </button>
        <span className="font-mono text-lg tracking-wider min-w-16 text-center" aria-live="polite">{formatTimer(timerSeconds)}</span>
        <button
          type="button"
          onClick={onResetTimer}
          className="text-zinc-400 hover:text-zinc-100"
          title={t('cookMode.actions.resetTimerTitle')}
          aria-label={t('cookMode.actions.resetTimerTitle')}
        >
          <TimerReset size={18} aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        onClick={onRepeatStep}
        title={t('cookMode.actions.repeatStepTitle')}
        aria-label={t('cookMode.actions.repeatStepTitle')}
        className="glass-button p-3 rounded-full text-zinc-300 active:text-white disabled:opacity-30 touch-manipulation"
        disabled={!isSpeechEnabled || isSpeaking}
      >
        <RefreshCw size={24} className={isSpeaking ? 'animate-spin' : ''} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onToggleSpeech}
        title={isSpeechEnabled ? t('cookMode.actions.disableSpeechTitle') : t('cookMode.actions.enableSpeechTitle')}
        aria-label={isSpeechEnabled ? t('cookMode.actions.disableSpeechTitle') : t('cookMode.actions.enableSpeechTitle')}
        aria-pressed={isSpeechEnabled}
        className={`p-3 rounded-full backdrop-blur-md transition-all border border-white/10 touch-manipulation ${isSpeechEnabled ? 'bg-[var(--color-accent-500)] text-zinc-900 shadow-[0_0_20px_rgba(var(--color-accent-glow),0.4)]' : 'glass-button text-zinc-300 active:text-white'}`}
      >
        {isSpeechEnabled ? <Volume2 size={24} aria-hidden="true" /> : <VolumeX size={24} aria-hidden="true" />}
      </button>
      <button
        type="button"
        onClick={onExit}
        className="glass-button p-3 rounded-full text-red-400 active:bg-red-500/20 active:text-red-300 border-red-500/20 touch-manipulation"
        title={t('cookMode.actions.exitTitle')}
        aria-label={t('cookMode.actions.exitTitle')}
      >
        <XIcon size={24} aria-hidden="true" />
      </button>
    </div>
  </header>
);

import type { AppSettings } from '../types';

export type AccentColorId = AppSettings['appearance']['accentColor'];

export type AccentPalette = Record<string, string>;

export const ACCENT_PALETTES: Record<AccentColorId, AccentPalette> = {
  amber: {
    '300': '#fcd34d',
    '400': '#fbbf24',
    '500': '#f59e0b',
    glow: 'rgba(251, 191, 36, 0.3)',
    'glow-soft': 'rgba(251, 191, 36, 0.2)',
    '400-semi': 'rgba(251, 191, 36, 0.8)',
    '100': '#fef3c7',
  },
  rose: {
    '300': '#fda4af',
    '400': '#fb7185',
    '500': '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.3)',
    'glow-soft': 'rgba(244, 63, 94, 0.2)',
    '400-semi': 'rgba(251, 113, 133, 0.8)',
    '100': '#ffe4e6',
  },
  sky: {
    '300': '#7dd3fc',
    '400': '#38bdf8',
    '500': '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.3)',
    'glow-soft': 'rgba(14, 165, 233, 0.2)',
    '400-semi': 'rgba(56, 189, 248, 0.8)',
    '100': '#e0f2fe',
  },
  emerald: {
    '300': '#6ee7b7',
    '400': '#34d399',
    '500': '#10b981',
    glow: 'rgba(16, 185, 129, 0.3)',
    'glow-soft': 'rgba(16, 185, 129, 0.2)',
    '400-semi': 'rgba(52, 211, 153, 0.8)',
    '100': '#d1fae5',
  },
};

export const applyAccentTheme = (accentColor: AccentColorId): void => {
  if (typeof document === 'undefined') return;
  const palette = ACCENT_PALETTES[accentColor] ?? ACCENT_PALETTES.amber;
  const root = document.documentElement;
  Object.entries(palette).forEach(([shade, value]) => {
    root.style.setProperty(`--color-accent-${shade}`, value);
  });
};

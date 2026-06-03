import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { applyAccentTheme } from '../lib/accentTheme';

/** Applies persisted accent palette to CSS variables app-wide (not only on Settings). */
export const useAccentTheme = (): void => {
  const accentColor = useAppSelector((state) => state.settings.appearance.accentColor);

  useEffect(() => {
    applyAccentTheme(accentColor);
  }, [accentColor]);
};

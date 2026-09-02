import { describe, expect, it } from 'vitest';
import { ACCENT_PALETTES, applyAccentTheme } from '../accentTheme';

describe('accentTheme', () => {
  it('wendet Palette auf documentElement an', () => {
    applyAccentTheme('rose');
    expect(document.documentElement.style.getPropertyValue('--color-accent-500')).toBe(
      ACCENT_PALETTES.rose['500'],
    );
  });

  it('faellt auf amber zurueck bei unbekannter Farbe', () => {
    applyAccentTheme('unknown' as never);
    expect(document.documentElement.style.getPropertyValue('--color-accent-500')).toBe(
      ACCENT_PALETTES.amber['500'],
    );
  });
});

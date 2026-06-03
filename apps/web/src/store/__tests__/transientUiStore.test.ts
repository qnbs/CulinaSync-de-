import { beforeEach, describe, expect, it } from 'vitest';
import { useTransientUiStore } from '../transientUiStore';

describe('transientUiStore', () => {
  beforeEach(() => {
    useTransientUiStore.setState({
      commandPaletteOpen: false,
      pendingShareText: null,
      pendingLaunchFile: null,
    });
  });

  it('steuert Command-Palette', () => {
    expect(useTransientUiStore.getState().commandPaletteOpen).toBe(false);
    useTransientUiStore.getState().setCommandPaletteOpen(true);
    expect(useTransientUiStore.getState().commandPaletteOpen).toBe(true);
    useTransientUiStore.getState().toggleCommandPalette();
    expect(useTransientUiStore.getState().commandPaletteOpen).toBe(false);
  });

  it('speichert pending Share-Text und Launch-Datei', () => {
    useTransientUiStore.getState().setPendingShareText('Tomaten');
    expect(useTransientUiStore.getState().pendingShareText).toBe('Tomaten');
    useTransientUiStore.getState().setPendingShareText(null);
    expect(useTransientUiStore.getState().pendingShareText).toBeNull();

    const file = new File(['x'], 'recipe.txt', { type: 'text/plain' });
    useTransientUiStore.getState().setPendingLaunchFile(file);
    expect(useTransientUiStore.getState().pendingLaunchFile).toBe(file);
    useTransientUiStore.getState().setPendingLaunchFile(null);
    expect(useTransientUiStore.getState().pendingLaunchFile).toBeNull();
  });
});

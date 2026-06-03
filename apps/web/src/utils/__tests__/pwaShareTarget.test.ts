import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  parseShareTargetFromSearch,
  stripShareTargetFromUrl,
  summarizeSharePayload,
} from '../pwaShareTarget';

describe('pwaShareTarget', () => {
  it('parses share target query params', () => {
    const payload = parseShareTargetFromSearch('?pwa-share=1&title=Rezept&url=https://example.com/recipe');
    expect(payload).toEqual({
      title: 'Rezept',
      url: 'https://example.com/recipe',
    });
  });

  it('returns null when no share data', () => {
    expect(parseShareTargetFromSearch('?page=pantry')).toBeNull();
  });

  it('returns null when share params are only whitespace', () => {
    expect(parseShareTargetFromSearch('?pwa-share=1&title=++&text=++')).toBeNull();
  });

  it('summarizes payload for chef prompt', () => {
    const summary = summarizeSharePayload({ title: 'Pasta', text: 'mit Tomaten', url: 'https://x.test' });
    expect(summary).toContain('Pasta');
    expect(summary).toContain('https://x.test');
  });

  it('stripShareTargetFromUrl entfernt Share-Query-Parameter', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    window.history.pushState({}, '', '/CulinaSync-de-/?pwa-share=1&title=Salat&text=frisch');

    stripShareTargetFromUrl();

    expect(replaceState).toHaveBeenCalledWith({}, '', '/CulinaSync-de-/');
    replaceState.mockRestore();
  });
});

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

import { describe, expect, it } from 'vitest';
import { parseShareTargetFromSearch, summarizeSharePayload } from '../pwaShareTarget';

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

  it('summarizes payload for chef prompt', () => {
    const summary = summarizeSharePayload({ title: 'Pasta', text: 'mit Tomaten', url: 'https://x.test' });
    expect(summary).toContain('Pasta');
    expect(summary).toContain('https://x.test');
  });
});

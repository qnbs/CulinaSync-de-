import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from 'i18next';
import { formatVisionHitsAsPantryText, resetVisionWorkerForTests } from '../localAiVisionService';

describe('localAiVisionService', () => {
  beforeEach(() => {
    resetVisionWorkerForTests();
    vi.clearAllMocks();
  });

  it('formatiert Labels mit i18n', () => {
    void i18n.changeLanguage('de');
    const text = formatVisionHitsAsPantryText([
      { label: 'tomato', score: 0.9 },
      { label: 'milk', score: 0.8 },
    ]);
    expect(text).toContain('Tomate');
    expect(text).toContain('Milch');
  });

  it('fällt auf Roh-Label zurück wenn Key fehlt', () => {
    const text = formatVisionHitsAsPantryText([{ label: 'dragonfruit', score: 0.5 }]);
    expect(text).toBe('dragonfruit');
  });
});

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { retry } from '../retryUtils';

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('gibt Ergebnis der Funktion bei erstem Erfolg zurück', async () => {
    const fn = vi.fn().mockResolvedValueOnce('ok');
    const p = retry(fn, 3, 10);
    await expect(p).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

});

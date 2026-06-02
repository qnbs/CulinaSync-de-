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

  it('wiederholt nach Fehler und liefert beim zweiten Versuch', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok');
    const p = retry(fn, 3, 10);
    await vi.runAllTimersAsync();
    await expect(p).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('wirft letzten Fehler nach allen Versuchen', async () => {
    const err = new Error('persistent');
    const fn = vi.fn().mockRejectedValue(err);
    const p = retry(fn, 2, 10);
    const assertPromise = expect(p).rejects.toThrow('persistent');
    await vi.runAllTimersAsync();
    await assertPromise;
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

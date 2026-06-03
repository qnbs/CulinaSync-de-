import { describe, expect, it } from 'vitest';
import { detectPwaCapabilities } from '../pwaCapabilities';

describe('pwaCapabilities', () => {
  it('returns capability matrix entries', () => {
    const caps = detectPwaCapabilities();
    expect(caps.length).toBeGreaterThanOrEqual(8);
    expect(caps.map((c) => c.id)).toContain('serviceWorker');
    expect(caps.map((c) => c.id)).toContain('shareTarget');
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { loadDemoPantrySeed } = vi.hoisted(() => ({
  loadDemoPantrySeed: vi.fn().mockResolvedValue(4),
}));

vi.mock('../../services/demoSeedService', () => ({
  loadDemoPantrySeed,
  DEMO_MODE_SESSION_KEY: 'culinaSyncDemoMode',
  TRY_MODE_SESSION_KEY: 'culinaSyncTryMode',
}));

import { useDemoEntryQuery } from '../useDemoEntryQuery';

describe('useDemoEntryQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('?demo=1 loads demo and marks onboarded', async () => {
    const onResolved = vi.fn();
    window.history.replaceState({}, '', '/?demo=1');

    renderHook(() => useDemoEntryQuery(onResolved));

    await waitFor(() => expect(loadDemoPantrySeed).toHaveBeenCalled());
    expect(localStorage.getItem('culinaSyncOnboarded')).toBe('true');
    expect(sessionStorage.getItem('culinaSyncDemoMode')).toBe('1');
    expect(onResolved).toHaveBeenCalledWith('demo');
    expect(window.location.search).not.toContain('demo=1');
  });

  it('?try=1 skips demo load', async () => {
    const onResolved = vi.fn();
    window.history.replaceState({}, '', '/?try=1');

    renderHook(() => useDemoEntryQuery(onResolved));

    await waitFor(() => expect(onResolved).toHaveBeenCalledWith('try'));
    expect(loadDemoPantrySeed).not.toHaveBeenCalled();
    expect(localStorage.getItem('culinaSyncOnboarded')).toBe('true');
  });

  it('is a no-op when disabled (intro gates off): ?demo=1 loads nothing', async () => {
    const onResolved = vi.fn();
    window.history.replaceState({}, '', '/?demo=1');

    renderHook(() => useDemoEntryQuery(onResolved, false));

    // Give the effect a tick; nothing should fire.
    await Promise.resolve();
    expect(loadDemoPantrySeed).not.toHaveBeenCalled();
    expect(onResolved).not.toHaveBeenCalled();
    expect(localStorage.getItem('culinaSyncOnboarded')).toBeNull();
    expect(window.location.search).toContain('demo=1'); // query left untouched
  });
});

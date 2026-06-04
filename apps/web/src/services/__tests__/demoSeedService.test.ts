import { beforeEach, describe, expect, it, vi } from 'vitest';

const bulkAdd = vi.fn().mockResolvedValue(undefined);
const transaction = vi.fn(async (_mode: string, _table: unknown, fn: () => Promise<void>) => {
  await fn();
});

vi.mock('../dbInstance', () => ({
  db: {
    pantry: { bulkAdd },
    transaction,
  },
}));

vi.mock('../errorLoggingService', () => ({
  logAppError: vi.fn(),
}));

describe('demoSeedService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loadDemoPantrySeed adds four pantry items', async () => {
    const { loadDemoPantrySeed } = await import('../demoSeedService');
    const count = await loadDemoPantrySeed();
    expect(count).toBe(4);
    expect(transaction).toHaveBeenCalled();
    expect(bulkAdd).toHaveBeenCalledOnce();
    expect(bulkAdd.mock.calls[0][0]).toHaveLength(4);
  });

  it('isGitHubPagesHost detects Pages host', async () => {
    vi.stubGlobal('window', { location: { hostname: 'qnbs.github.io' } });
    const { isGitHubPagesHost } = await import('../demoSeedService');
    expect(isGitHubPagesHost()).toBe(true);
    vi.unstubAllGlobals();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const appLogsAdd = vi.fn().mockResolvedValue(1);
const appLogsCount = vi.fn().mockResolvedValue(0);
const appLogsBulkDelete = vi.fn().mockResolvedValue(undefined);
const appLogsUpdate = vi.fn().mockResolvedValue(undefined);
const appLogsToArray = vi.fn().mockResolvedValue([]);

vi.mock('../dbInstance', () => ({
  db: {
    transaction: vi.fn((_mode: string, _table: unknown, fn: () => Promise<unknown>) => fn()),
    appLogs: {
      add: appLogsAdd,
      count: appLogsCount,
      bulkDelete: appLogsBulkDelete,
      update: appLogsUpdate,
      orderBy: vi.fn(() => ({
        limit: vi.fn(() => ({
          primaryKeys: vi.fn().mockResolvedValue([1, 2]),
        })),
      })),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: appLogsToArray,
        })),
      })),
    },
  },
}));

describe('errorLoggingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appLogsCount.mockResolvedValue(0);
  });

  it('logAppError persistiert normalisierte Fehler', async () => {
    const { logAppError } = await import('../errorLoggingService');
    await logAppError(new Error('Testfehler'), 'unit.test', { foo: 'bar' });
    expect(appLogsAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'unit.test',
        message: 'Testfehler',
        level: 'error',
      }),
    );
  });

  it('logAppError trimmt alte Eintraege bei Overflow', async () => {
    appLogsCount.mockResolvedValueOnce(300);
    const { logAppError } = await import('../errorLoggingService');
    await logAppError('String-Fehler', 'overflow');
    expect(appLogsBulkDelete).toHaveBeenCalledWith([1, 2]);
  });

  it('listPendingErrorLogs liest unsynced Logs', async () => {
    appLogsToArray.mockResolvedValueOnce([{ id: 5, message: 'pending' }]);
    const { listPendingErrorLogs } = await import('../errorLoggingService');
    const logs = await listPendingErrorLogs();
    expect(logs).toHaveLength(1);
  });

  it('markErrorLogsSynced aktualisiert IDs', async () => {
    const { markErrorLogsSynced } = await import('../errorLoggingService');
    await markErrorLogsSynced([3, 4]);
    expect(appLogsUpdate).toHaveBeenCalledTimes(2);
  });

  it('markErrorLogsSynced ignoriert leeres Array', async () => {
    const { markErrorLogsSynced } = await import('../errorLoggingService');
    await markErrorLogsSynced([]);
    expect(appLogsUpdate).not.toHaveBeenCalled();
  });

  it('installGlobalErrorLogging registriert Handler einmalig', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const { installGlobalErrorLogging } = await import('../errorLoggingService');
    installGlobalErrorLogging();
    installGlobalErrorLogging();
    expect(addSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    addSpy.mockRestore();
  });
});

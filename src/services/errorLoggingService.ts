import { db } from './dbInstance';
import type { AppLogEntry } from '../types';

const MAX_LOG_ENTRIES = 250;

const toSerializableMetadata = (metadata: unknown): string | undefined => {
  if (metadata === undefined) {
    return undefined;
  }

  try {
    return JSON.stringify(metadata);
  } catch {
    return JSON.stringify({ note: 'metadata_not_serializable' });
  }
};

const normalizeError = (error: unknown): { message: string; stack?: string } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return { message: 'Unbekannter Fehler' };
};

const trimLogStore = async () => {
  const total = await db.appLogs.count();
  const overflow = total - MAX_LOG_ENTRIES;
  if (overflow <= 0) {
    return;
  }

  const keys = await db.appLogs.orderBy('createdAt').limit(overflow).primaryKeys();
  await db.appLogs.bulkDelete(keys as number[]);
};

export const logAppError = async (
  error: unknown,
  source: string,
  metadata?: unknown,
  level: AppLogEntry['level'] = 'error',
): Promise<void> => {
  if (typeof indexedDB === 'undefined') {
    return;
  }

  const normalized = normalizeError(error);

  try {
    await db.transaction('rw', db.appLogs, async () => {
      await db.appLogs.add({
        level,
        source,
        message: normalized.message,
        stack: normalized.stack,
        metadata: toSerializableMetadata(metadata),
        createdAt: Date.now(),
        synced: false,
      });
      await trimLogStore();
    });
  } catch (loggingError) {
    if (import.meta.env.DEV) {
      console.error('Fehler beim Persistieren des App-Logs:', loggingError);
    }
  }
};

export const listPendingErrorLogs = () => db.appLogs.where('synced').equals(0).toArray();

export const markErrorLogsSynced = async (ids: number[]): Promise<void> => {
  if (ids.length === 0) {
    return;
  }

  await db.transaction('rw', db.appLogs, async () => {
    await Promise.all(ids.map((id) => db.appLogs.update(id, { synced: true })));
  });
};

let globalLoggingInstalled = false;

export const installGlobalErrorLogging = () => {
  if (globalLoggingInstalled || typeof window === 'undefined') {
    return;
  }

  const errorHandler = (event: ErrorEvent) => {
    void logAppError(event.error ?? event.message, 'window.error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  const rejectionHandler = (event: PromiseRejectionEvent) => {
    void logAppError(event.reason, 'window.unhandledrejection');
  };

  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', rejectionHandler);
  globalLoggingInstalled = true;
};
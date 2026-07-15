import { beforeEach, describe, expect, it, vi } from 'vitest';

type StoredRecord = { id: string; value: string; updatedAt: number };

const createRequest = <T>(executor: (request: IDBRequest<T>) => void): IDBRequest<T> => {
  const request = {} as IDBRequest<T>;
  queueMicrotask(() => executor(request));
  return request;
};

const createIndexedDbMock = () => {
  const databases = new Map<string, { version: number; stores: Map<string, Map<string, StoredRecord>> }>();

  const open = (name: string, version = 1): IDBOpenDBRequest => {
    const request = {} as IDBOpenDBRequest;

    queueMicrotask(() => {
      let databaseState = databases.get(name);
      const needsUpgrade = !databaseState;

      if (!databaseState) {
        databaseState = { version, stores: new Map() };
        databases.set(name, databaseState);
      }

      const db = {
        get objectStoreNames() {
          return {
            contains: (storeName: string) => databaseState!.stores.has(storeName),
          } as DOMStringList;
        },
        createObjectStore: (storeName: string) => {
          if (!databaseState!.stores.has(storeName)) {
            databaseState!.stores.set(storeName, new Map());
          }
          return {} as IDBObjectStore;
        },
        transaction: (storeName: string) => {
          const tx = { error: null } as IDBTransaction;
          const store = databaseState!.stores.get(storeName) ?? new Map<string, StoredRecord>();
          databaseState!.stores.set(storeName, store);

          tx.objectStore = () =>
            ({
              put: (record: StoredRecord) => {
                store.set(record.id, record);
                queueMicrotask(() => tx.oncomplete?.(new Event('complete')));
                return {} as IDBRequest<IDBValidKey>;
              },
              get: (key: string) =>
                createRequest<StoredRecord | undefined>((req) => {
                  Object.defineProperty(req, 'result', { value: store.get(key), configurable: true });
                  req.onsuccess?.(new Event('success'));
                }),
              delete: (key: string) => {
                store.delete(key);
                queueMicrotask(() => tx.oncomplete?.(new Event('complete')));
                return {} as IDBRequest<undefined>;
              },
            }) as IDBObjectStore;

          return tx;
        },
        close: () => undefined,
        version,
      } as unknown as IDBDatabase;

      Object.defineProperty(request, 'result', { value: db, configurable: true });
      if (needsUpgrade) {
        request.onupgradeneeded?.(new Event('upgradeneeded') as IDBVersionChangeEvent);
      }
      request.onsuccess?.(new Event('success'));
    });

    return request;
  };

  return {
    indexedDB: { open } as IDBFactory,
    clear: () => databases.clear(),
  };
};

describe('syncCredentialService', () => {
  const idbMock = createIndexedDbMock();

  beforeEach(() => {
    vi.resetModules();
    idbMock.clear();
    vi.stubGlobal('indexedDB', idbMock.indexedDB);
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'vitest', language: 'de-DE' },
      configurable: true,
    });
    Object.defineProperty(globalThis, 'screen', {
      value: { width: 1280, height: 720 },
      configurable: true,
    });
  });

  it('speichert und lädt das Nextcloud-App-Passwort (Roundtrip)', async () => {
    const { saveNextcloudAppPassword, loadNextcloudAppPassword } = await import('../syncCredentialService');
    await saveNextcloudAppPassword('nc-app-secret');
    await expect(loadNextcloudAppPassword()).resolves.toBe('nc-app-secret');
  });

  it('löscht bei leerem Passwort', async () => {
    const { saveNextcloudAppPassword, loadNextcloudAppPassword, deleteNextcloudAppPassword } =
      await import('../syncCredentialService');
    await saveNextcloudAppPassword('keep');
    await saveNextcloudAppPassword('   ');
    await expect(loadNextcloudAppPassword()).resolves.toBeNull();
    await deleteNextcloudAppPassword();
    await expect(loadNextcloudAppPassword()).resolves.toBeNull();
  });
});

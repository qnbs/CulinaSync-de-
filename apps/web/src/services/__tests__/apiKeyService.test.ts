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

          tx.objectStore = () => ({
            put: (record: StoredRecord) => {
              store.set(record.id, record);
              queueMicrotask(() => tx.oncomplete?.(new Event('complete')));
              return {} as IDBRequest<IDBValidKey>;
            },
            get: (key: string) => createRequest<StoredRecord | undefined>((req) => {
              Object.defineProperty(req, 'result', { value: store.get(key), configurable: true });
              req.onsuccess?.(new Event('success'));
            }),
            delete: (key: string) => {
              store.delete(key);
              queueMicrotask(() => tx.oncomplete?.(new Event('complete')));
              return {} as IDBRequest<undefined>;
            },
          } as IDBObjectStore);

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
    readRecord: (dbName: string, storeName: string, key: string) => databases.get(dbName)?.stores.get(storeName)?.get(key),
  };
};

describe('apiKeyService', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('encrypts and restores API keys from IndexedDB', async () => {
    const indexedDbMock = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDbMock.indexedDB);

    const service = await import('../apiKeyService');
    await service.saveApiKey('AIza-roundtrip-test');

    const stored = indexedDbMock.readRecord('culinasync_secure', 'keys', 'gemini_api_key');
    expect(stored?.value).toBeDefined();
    expect(stored?.value).not.toContain('AIza-roundtrip-test');

    await expect(service.loadApiKey()).resolves.toBe('AIza-roundtrip-test');
  });

  it('reads legacy-obfuscated keys and migrates them on load', async () => {
    const indexedDbMock = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDbMock.indexedDB);

    const service = await import('../apiKeyService');
    const legacyFingerprint = btoa(`${navigator.userAgent}${navigator.language}${screen.width}${screen.height}`).slice(0, 32);
    const legacyValue = btoa(Array.from('AIza-legacy-test').map((char, index) => (
      String.fromCharCode(char.charCodeAt(0) ^ legacyFingerprint.charCodeAt(index % legacyFingerprint.length))
    )).join(''));

    const db = await new Promise<IDBDatabase>((innerResolve, innerReject) => {
      const request = indexedDB.open('culinasync_secure', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('keys', { keyPath: 'id' });
      };
      request.onsuccess = () => innerResolve(request.result);
      request.onerror = () => innerReject(request.error);
    });

    await new Promise<void>((resolve) => {
      const tx = db.transaction('keys', 'readwrite');
      tx.objectStore('keys').put({ id: 'gemini_api_key', value: legacyValue, updatedAt: Date.now() });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    });

    await expect(service.loadApiKey()).resolves.toBe('AIza-legacy-test');

    await expect.poll(
      () => indexedDbMock.readRecord('culinasync_secure', 'keys', 'gemini_api_key')?.value.startsWith('{"version":2'),
      { timeout: 15_000 },
    ).toBe(true);
  });
});
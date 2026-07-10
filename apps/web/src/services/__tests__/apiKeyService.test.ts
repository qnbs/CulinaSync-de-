import { beforeEach, describe, expect, it, vi } from 'vitest';

// Keep the secure-key service decoupled from Dexie in tests.
vi.mock('../errorLoggingService', () => ({ logAppError: vi.fn() }));

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
      () => indexedDbMock.readRecord('culinasync_secure', 'keys', 'gemini_api_key')?.value.startsWith('{"version":3'),
      { timeout: 15_000 },
    ).toBe(true);
  });

  it('encrypts with a passphrase and stays locked until unlocked in a new session', async () => {
    const indexedDbMock = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDbMock.indexedDB);

    const service = await import('../apiKeyService');
    await service.saveApiKey('AIza-passphrase-test', 'correct horse battery');

    // Stored payload records passphrase mode and does not contain the plaintext.
    const stored = indexedDbMock.readRecord('culinasync_secure', 'keys', 'gemini_api_key');
    expect(stored?.value).toContain('"mode":"passphrase"');
    expect(stored?.value).not.toContain('AIza-passphrase-test');

    // Same session: the passphrase is cached, so the key is usable.
    await expect(service.loadApiKey()).resolves.toBe('AIza-passphrase-test');

    // Fresh session (module re-import) → locked until the correct passphrase.
    vi.resetModules();
    const fresh = await import('../apiKeyService');
    await expect(fresh.getApiKeyStatus()).resolves.toBe('locked');
    await expect(fresh.loadApiKey()).resolves.toBeNull();
    await expect(fresh.unlockApiKey('wrong passphrase')).resolves.toBe(false);
    await expect(fresh.getApiKeyStatus()).resolves.toBe('locked');
    await expect(fresh.unlockApiKey('correct horse battery')).resolves.toBe(true);
    await expect(fresh.loadApiKey()).resolves.toBe('AIza-passphrase-test');
  });

  it('surfaces a decryption failure instead of returning garbage', async () => {
    const indexedDbMock = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDbMock.indexedDB);

    const service = await import('../apiKeyService');
    const corrupt = JSON.stringify({
      version: 3,
      mode: 'device',
      salt: btoa('saltsaltsaltsalt'),
      iv: btoa('iviviviviviv'),
      ciphertext: btoa('not-a-valid-ciphertext'),
    });

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
      tx.objectStore('keys').put({ id: 'gemini_api_key', value: corrupt, updatedAt: Date.now() });
      tx.oncomplete = () => { db.close(); resolve(); };
    });

    await expect(service.getApiKeyStatus()).resolves.toBe('error');
    await expect(service.loadApiKey()).resolves.toBeNull();
  });

  it('returns a typed error (not an atob crash) for an encrypted payload without WebCrypto (CodeAnt #3562208793)', async () => {
    const indexedDbMock = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDbMock.indexedDB);

    const service = await import('../apiKeyService');
    await service.saveApiKey('AIza-encrypted-key'); // encrypted v3 device (WebCrypto available)

    // Re-open in an environment without WebCrypto: the encrypted JSON must NOT be fed to
    // legacyDeobfuscate (atob would throw) — it must surface a controlled 'error'.
    const realCrypto = globalThis.crypto;
    vi.resetModules();
    vi.stubGlobal('crypto', { getRandomValues: (arr: Uint8Array) => arr });
    try {
      const fresh = await import('../apiKeyService');
      await expect(fresh.getApiKeyStatus()).resolves.toBe('error');
      await expect(fresh.loadApiKey()).resolves.toBeNull();
    } finally {
      vi.stubGlobal('crypto', realCrypto);
    }
  });

  it('returns a typed error for a corrupt JSON value that is not our payload', async () => {
    const indexedDbMock = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDbMock.indexedDB);

    const service = await import('../apiKeyService');
    const db = await new Promise<IDBDatabase>((innerResolve, innerReject) => {
      const request = indexedDB.open('culinasync_secure', 1);
      request.onupgradeneeded = () => { request.result.createObjectStore('keys', { keyPath: 'id' }); };
      request.onsuccess = () => innerResolve(request.result);
      request.onerror = () => innerReject(request.error);
    });
    await new Promise<void>((resolve) => {
      const tx = db.transaction('keys', 'readwrite');
      tx.objectStore('keys').put({ id: 'gemini_api_key', value: '{"foo":"bar"}', updatedAt: Date.now() });
      tx.oncomplete = () => { db.close(); resolve(); };
    });

    await expect(service.getApiKeyStatus()).resolves.toBe('error');
  });

  it('reports and clears key presence via hasApiKey / deleteApiKey', async () => {
    const indexedDbMock = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDbMock.indexedDB);

    const service = await import('../apiKeyService');
    await expect(service.hasApiKey()).resolves.toBe(false);
    await expect(service.getApiKeyStatus()).resolves.toBe('missing');

    await service.saveApiKey('AIza-presence-test');
    await expect(service.hasApiKey()).resolves.toBe(true);

    await service.deleteApiKey();
    await expect(service.hasApiKey()).resolves.toBe(false);
    expect(indexedDbMock.readRecord('culinasync_secure', 'keys', 'gemini_api_key')).toBeUndefined();
  });

  it('decrypts a legacy v2 payload and upgrades it to v3 on load', async () => {
    const indexedDbMock = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDbMock.indexedDB);

    const service = await import('../apiKeyService');
    // Produce a current (v3 device) payload, then downgrade the stored version marker to 2
    // (no `mode`) to emulate a legacy encrypted blob — same fingerprint password decrypts it.
    await service.saveApiKey('AIza-v2-upgrade');
    const current = indexedDbMock.readRecord('culinasync_secure', 'keys', 'gemini_api_key');
    const asV2 = JSON.parse(current!.value) as Record<string, unknown>;
    asV2.version = 2;
    delete asV2.mode;

    const db = await new Promise<IDBDatabase>((innerResolve, innerReject) => {
      const request = indexedDB.open('culinasync_secure', 1);
      request.onupgradeneeded = () => { request.result.createObjectStore('keys', { keyPath: 'id' }); };
      request.onsuccess = () => innerResolve(request.result);
      request.onerror = () => innerReject(request.error);
    });
    await new Promise<void>((resolve) => {
      const tx = db.transaction('keys', 'readwrite');
      tx.objectStore('keys').put({ id: 'gemini_api_key', value: JSON.stringify(asV2), updatedAt: Date.now() });
      tx.oncomplete = () => { db.close(); resolve(); };
    });

    await expect(service.loadApiKey()).resolves.toBe('AIza-v2-upgrade');
    await expect.poll(
      () => indexedDbMock.readRecord('culinasync_secure', 'keys', 'gemini_api_key')?.value.startsWith('{"version":3'),
      { timeout: 15_000 },
    ).toBe(true);
  });
});
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MigrationBackupRecord = {
  id: string;
  sourceDbName: string;
  fromVersion: number;
  toVersion: number;
  createdAt: number;
  stores: string[];
  counts: Record<string, number>;
  payload: Record<string, unknown[]>;
};

const createRequest = <T>(executor: (request: IDBRequest<T>) => void): IDBRequest<T> => {
  const request = {} as IDBRequest<T>;
  queueMicrotask(() => executor(request));
  return request;
};

const createIndexedDbMock = () => {
  const databases = new Map<string, { version: number; stores: Map<string, Map<IDBValidKey, unknown>> }>();

  const ensureDatabase = (name: string, version: number) => {
    let databaseState = databases.get(name);
    const needsUpgrade = !databaseState;

    if (!databaseState) {
      databaseState = { version, stores: new Map() };
      databases.set(name, databaseState);
    } else if (version > databaseState.version) {
      databaseState.version = version;
    }

    return { databaseState, needsUpgrade };
  };

  const open = (name: string, version = 1): IDBOpenDBRequest => {
    const request = {} as IDBOpenDBRequest;

    queueMicrotask(() => {
      const { databaseState, needsUpgrade } = ensureDatabase(name, version);

      const db = {
        get objectStoreNames() {
          return {
            contains: (storeName: string) => databaseState.stores.has(storeName),
          } as DOMStringList;
        },
        createObjectStore: (storeName: string, options?: { keyPath?: string }) => {
          if (!databaseState.stores.has(storeName)) {
            databaseState.stores.set(storeName, new Map());
          }

          return { keyPath: options?.keyPath } as IDBObjectStore;
        },
        transaction: (storeName: string) => {
          const tx = { error: null } as IDBTransaction;
          const store = databaseState.stores.get(storeName) ?? new Map<IDBValidKey, unknown>();
          databaseState.stores.set(storeName, store);

          const objectStore = {
            getAll: () => createRequest<unknown[]>((req) => {
              Object.defineProperty(req, 'result', { value: Array.from(store.values()), configurable: true });
              req.onsuccess?.(new Event('success'));
              queueMicrotask(() => tx.oncomplete?.(new Event('complete')));
            }),
            put: (value: unknown) => {
              const key = (value as { id?: IDBValidKey }).id;
              if (key !== undefined) {
                store.set(key, value);
              }
              queueMicrotask(() => tx.oncomplete?.(new Event('complete')));
              return {} as IDBRequest<IDBValidKey>;
            },
            delete: (key: IDBValidKey) => {
              store.delete(key);
              queueMicrotask(() => tx.oncomplete?.(new Event('complete')));
              return {} as IDBRequest<undefined>;
            },
          } as IDBObjectStore;

          tx.objectStore = () => objectStore;
          return tx;
        },
        close: () => undefined,
        version: databaseState.version,
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
    seedStore: (dbName: string, version: number, storeName: string, values: Array<{ id: IDBValidKey } & Record<string, unknown>>) => {
      const { databaseState } = ensureDatabase(dbName, version);
      const store = databaseState.stores.get(storeName) ?? new Map<IDBValidKey, unknown>();
      values.forEach((value) => store.set(value.id, value));
      databaseState.stores.set(storeName, store);
    },
    readStore: <T>(dbName: string, storeName: string): T[] => Array.from((databases.get(dbName)?.stores.get(storeName)?.values() ?? []) as Iterable<T>),
  };
};

const dexieExistsMock = vi.hoisted(() => vi.fn(async (dbName: string) => dbName === 'CulinaSyncDB' || dbName === 'CulinaSyncMigrationBackups'));

vi.mock('dexie', async () => {
  const actual = await vi.importActual<typeof import('dexie')>('dexie');

  return {
    ...actual,
    default: {
      ...actual.default,
      exists: dexieExistsMock,
    },
  };
});

import { ensureMigrationBackup } from '../dbMigrations';

describe('dbMigrations backup retention', () => {
  beforeEach(() => {
    vi.resetModules();
    dexieExistsMock.mockClear();
  });

  it('keeps only the newest migration backup snapshots', async () => {
    const indexedDbMock = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDbMock.indexedDB);

    indexedDbMock.seedStore('CulinaSyncDB', 1, 'pantry', [{ id: 1, name: 'Tomaten' }]);
    indexedDbMock.seedStore('CulinaSyncMigrationBackups', 1, 'backups', [
      { id: 'old-1', sourceDbName: 'db-1', fromVersion: 1, toVersion: 2, createdAt: 1, stores: ['pantry'], counts: { pantry: 1 }, payload: { pantry: [] } },
      { id: 'old-2', sourceDbName: 'db-2', fromVersion: 1, toVersion: 2, createdAt: 2, stores: ['pantry'], counts: { pantry: 1 }, payload: { pantry: [] } },
      { id: 'old-3', sourceDbName: 'db-3', fromVersion: 1, toVersion: 2, createdAt: 3, stores: ['pantry'], counts: { pantry: 1 }, payload: { pantry: [] } },
      { id: 'old-4', sourceDbName: 'db-4', fromVersion: 1, toVersion: 2, createdAt: 4, stores: ['pantry'], counts: { pantry: 1 }, payload: { pantry: [] } },
      { id: 'old-5', sourceDbName: 'db-5', fromVersion: 1, toVersion: 2, createdAt: 5, stores: ['pantry'], counts: { pantry: 1 }, payload: { pantry: [] } },
    ]);

    await ensureMigrationBackup('CulinaSyncDB', 2, ['pantry']);

    const backups = indexedDbMock.readStore<MigrationBackupRecord>('CulinaSyncMigrationBackups', 'backups');
      
    expect(backups).toHaveLength(5);
    expect(backups.some((backup) => backup.id === 'old-1')).toBe(false);
    expect(backups.some((backup) => backup.sourceDbName === 'CulinaSyncDB' && backup.fromVersion === 1 && backup.toVersion === 2)).toBe(true);
  });
});
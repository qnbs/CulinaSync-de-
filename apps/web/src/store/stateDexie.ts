import Dexie, { type Table } from 'dexie';

type KvRow = { key: string; value: string };

/**
 * Redux-Persist / Meta — getrennt von Domain-DataDB (`CulinaSyncDataDB`).
 */
class CulinaSyncStateDexie extends Dexie {
  kv!: Table<KvRow, string>;

  constructor() {
    super('CulinaSyncStateDB');
    this.version(1).stores({ kv: 'key' });
  }
}

export const stateDexie = new CulinaSyncStateDexie();

export const openStateDexie = async (): Promise<void> => {
  if (!stateDexie.isOpen()) {
    await stateDexie.open();
  }
};

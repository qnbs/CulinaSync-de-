import { beforeEach, describe, expect, it } from 'vitest';
import { getLocalAiWorkerBus, resetLocalAiWorkerBusForTests } from '../localAiWorkerBus';

describe('localAiWorkerBus', () => {
  beforeEach(() => {
    resetLocalAiWorkerBusForTests();
  });

  it('liefert Singleton-WorkerBus', () => {
    const first = getLocalAiWorkerBus();
    const second = getLocalAiWorkerBus();
    expect(first).toBe(second);
  });

  it('enqueue fuehrt Jobs aus', async () => {
    const bus = getLocalAiWorkerBus();
    let completed = 0;

    await new Promise<void>((resolve) => {
      const tick = () => {
        completed += 1;
        if (completed === 2) {
          resolve();
        }
      };
      bus.enqueue(async () => {
        tick();
      }, 0);
      bus.enqueue(async () => {
        tick();
      }, 3);
    });

    expect(completed).toBe(2);
  });
});

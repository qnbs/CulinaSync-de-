import { WorkerBus } from '@domain/ai-core';

let bus: WorkerBus | null = null;

export const getLocalAiWorkerBus = (): WorkerBus => {
  if (!bus) {
    bus = new WorkerBus({ maxConcurrent: 2 });
  }
  return bus;
};

export const resetLocalAiWorkerBusForTests = (): void => {
  bus = null;
};

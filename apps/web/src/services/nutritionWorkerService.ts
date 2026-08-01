import type { Recipe } from '../types';
import { analyzeRecipeNutritionAndAllergens, type NutritionAllergyReport } from './nutritionAllergyService';

type PendingRequest = {
  resolve: (report: NutritionAllergyReport) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let requestId = 0;
const pendingRequests = new Map<number, PendingRequest>();

const getWorker = () => {
  if (typeof Worker === 'undefined') {
    return null;
  }

  if (!worker) {
    worker = new Worker(new URL('../workers/nutritionWorker.ts', import.meta.url), { type: 'module' });
    worker.addEventListener('message', (event: MessageEvent<{ id: number; result?: NutritionAllergyReport; error?: string }>) => {
      const pending = pendingRequests.get(event.data.id);
      if (!pending) {
        return;
      }

      pendingRequests.delete(event.data.id);
      if (event.data.error) {
        pending.reject(new Error(event.data.error));
        return;
      }

      pending.resolve(event.data.result as NutritionAllergyReport);
    });
    // QNBS-v3: Worker crash must reject pending nutrition jobs | parity with embedding/whisper audit matrix
    worker.addEventListener('error', (event: ErrorEvent) => {
      const message = event.message || 'nutrition-worker-error';
      for (const [id, pending] of pendingRequests) {
        pending.reject(new Error(message));
        pendingRequests.delete(id);
      }
    });
  }

  return worker;
};

export const analyzeRecipeNutritionInWorker = async (recipe: Recipe): Promise<NutritionAllergyReport> => {
  const activeWorker = getWorker();
  if (!activeWorker) {
    return analyzeRecipeNutritionAndAllergens(recipe);
  }

  return new Promise((resolve, reject) => {
    const id = requestId++;
    pendingRequests.set(id, { resolve, reject });
    activeWorker.postMessage({ id, recipe });
  });
};

export const resetNutritionWorkerForTests = (): void => {
  worker?.terminate();
  worker = null;
  pendingRequests.clear();
  requestId = 0;
};
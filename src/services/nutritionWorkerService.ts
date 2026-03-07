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
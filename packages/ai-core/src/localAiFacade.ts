import { sanitizeForPrompt } from './sanitizeForPrompt.js';
import { WorkerBus, type WorkerJobPriority } from './workerBus.js';

export type LocalAiLayer = 'webgpu' | 'transformers' | 'heuristic';

export type LocalAiFacade = {
  readonly sanitizeForPrompt: typeof sanitizeForPrompt;
  readonly preferredLayer: LocalAiLayer;
  readonly runBackground: (task: () => Promise<void>, priority?: WorkerJobPriority) => string;
};

/**
 * Dreischichtige Local-AI-Fassade: WebGPU-Pfad (WebLLM), Standard-Embeddings (Transformers.js),
 * sowie deterministischer Fallback — schwere Module werden nur dynamisch geladen.
 */
export async function createLocalAiFacade(): Promise<LocalAiFacade> {
  const bus = new WorkerBus();
  let preferred: LocalAiLayer = 'heuristic';

  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    try {
      const adapter = await navigator.gpu?.requestAdapter();
      if (adapter) {
        preferred = 'webgpu';
      }
    } catch {
      preferred = 'heuristic';
    }
  }

  return {
    sanitizeForPrompt,
    preferredLayer: preferred,
    runBackground: (task, priority) => bus.enqueue(task, priority ?? 1),
  };
}

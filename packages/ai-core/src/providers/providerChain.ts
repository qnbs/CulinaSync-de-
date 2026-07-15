import type { LocalAiLayerId, ProviderAttempt, ProviderChainResult } from './types.js';
import { ProviderChainExhaustedError } from './types.js';

/**
 * Führt Layer nacheinander aus; erster nicht-null Ergebnis gewinnt.
 */
export async function runProviderChain<T>(
  attempts: ProviderAttempt<T>[],
): Promise<ProviderChainResult<T>> {
  const errors: string[] = [];

  for (const attempt of attempts) {
    if (!attempt.enabled) {
      continue;
    }

    try {
      const data = await attempt.run();
      if (data !== null) {
        return { data, layer: attempt.layer };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${attempt.layer}: ${message}`);
    }
  }

  throw new ProviderChainExhaustedError(
    errors.length > 0 ? errors.join('; ') : 'No enabled local AI layer produced a result',
  );
}

export const layerOrderForGenerative = (): LocalAiLayerId[] => [
  'ollama',
  'webllm',
  'transformers',
  'heuristic',
];

import type { AiGenerativeTask } from '../providers/types.js';

export type HeuristicEngineHandlers = {
  recipeIdeas: () => unknown;
  recipe: () => unknown;
  shoppingList: () => unknown;
};

/**
 * Layer 4 — deterministische/heuristische Antworten (App injiziert i18n-Templates).
 */
export const runHeuristicEngine = <T>(
  task: AiGenerativeTask,
  handlers: HeuristicEngineHandlers,
): T => {
  switch (task) {
    case 'recipe-ideas':
      return handlers.recipeIdeas() as T;
    case 'recipe':
      return handlers.recipe() as T;
    case 'shopping-list':
      return handlers.shoppingList() as T;
    default: {
      const exhaustive: never = task;
      throw new Error(`Unknown heuristic task: ${String(exhaustive)}`);
    }
  }
};

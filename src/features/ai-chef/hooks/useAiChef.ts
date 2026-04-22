import { useActionState, useMemo, useOptimistic, useState } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { logAppError } from '../../../services/errorLoggingService';
import type { Recipe, RecipeIdea, StructuredPrompt } from '../../../types';
import { generateChefIdeas } from '../commands/generateChefIdeas';
import { generateChefRecipe } from '../commands/generateChefRecipe';

type IdeaActionState = {
  promptKey: string | null;
  ideas: RecipeIdea[];
  error: string | null;
};

type RecipeActionState = {
  recipeKey: string | null;
  recipe: Recipe | null;
  error: string | null;
};

const initialIdeasState: IdeaActionState = {
  promptKey: null,
  ideas: [],
  error: null,
};

const initialRecipeState: RecipeActionState = {
  recipeKey: null,
  recipe: null,
  error: null,
};

const getPromptKey = (prompt: StructuredPrompt) => JSON.stringify(prompt);

const toErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unbekannter Fehler';

export const useAiChef = (prompt: StructuredPrompt) => {
  const aiPreferences = useAppSelector((state) => state.settings.aiPreferences);
  const [selectedIdea, setSelectedIdea] = useState<RecipeIdea | null>(null);
  const [isReset, setIsReset] = useState(false);
  const [optimisticSelectedIdea, setOptimisticSelectedIdea] = useOptimistic<RecipeIdea | null, RecipeIdea | null>(selectedIdea, (_current: RecipeIdea | null, nextIdea: RecipeIdea | null) => nextIdea);

  const [ideasState, requestIdeas, isIdeasPending] = useActionState<IdeaActionState, StructuredPrompt>(
    async (_previousState: IdeaActionState, nextPrompt: StructuredPrompt): Promise<IdeaActionState> => {
      try {
        const nextIdeas = await generateChefIdeas(nextPrompt, aiPreferences);
        return {
          promptKey: getPromptKey(nextPrompt),
          ideas: nextIdeas,
          error: null,
        };
      } catch (requestError) {
        void logAppError(requestError, 'features.ai-chef.generate-ideas');
        return {
          promptKey: getPromptKey(nextPrompt),
          ideas: [],
          error: toErrorMessage(requestError),
        };
      }
    },
    initialIdeasState,
  );

  const [recipeState, requestRecipe, isRecipePending] = useActionState<RecipeActionState, RecipeIdea>(
    async (_previousState: RecipeActionState, chosenIdea: RecipeIdea): Promise<RecipeActionState> => {
      try {
        const nextRecipe = await generateChefRecipe(prompt, aiPreferences, chosenIdea);
        return {
          recipeKey: chosenIdea.recipeTitle,
          recipe: nextRecipe,
          error: null,
        };
      } catch (requestError) {
        void logAppError(requestError, 'features.ai-chef.generate-recipe');
        return {
          recipeKey: chosenIdea.recipeTitle,
          recipe: null,
          error: toErrorMessage(requestError),
        };
      }
    },
    initialRecipeState,
  );

  const ideas = useMemo(() => {
    if (isReset || !ideasState.promptKey) {
      return [];
    }
    return ideasState.ideas;
  }, [ideasState.ideas, ideasState.promptKey, isReset]);

  const recipe = useMemo(() => {
    if (isReset || !selectedIdea || recipeState.recipeKey !== selectedIdea.recipeTitle) {
      return null;
    }
    return recipeState.recipe;
  }, [isReset, recipeState.recipe, recipeState.recipeKey, selectedIdea]);

  const error = useMemo(() => {
    if (isReset) {
      return null;
    }
    if (selectedIdea && recipeState.recipeKey === selectedIdea.recipeTitle) {
      return recipeState.error;
    }
    return ideasState.error;
  }, [ideasState.error, isReset, recipeState.error, recipeState.recipeKey, selectedIdea]);

  const generateIdeas = (nextPrompt: StructuredPrompt) => {
    setIsReset(false);
    setSelectedIdea(null);
    setOptimisticSelectedIdea(null);
    requestIdeas(nextPrompt);
  };

  const generateRecipe = (chosenIdea: RecipeIdea) => {
    setIsReset(false);
    setSelectedIdea(chosenIdea);
    setOptimisticSelectedIdea(chosenIdea);
    requestRecipe(chosenIdea);
  };

  const reset = () => {
    setIsReset(true);
    setSelectedIdea(null);
    setOptimisticSelectedIdea(null);
  };

  const backToIdeas = () => {
    setSelectedIdea(null);
    setOptimisticSelectedIdea(null);
  };

  return {
    ideas,
    recipe,
    error,
    selectedIdea: recipeState.error ? null : optimisticSelectedIdea,
    isLoadingIdeas: isIdeasPending,
    isLoadingRecipe: isRecipePending,
    isLoading: isIdeasPending || isRecipePending,
    phase: recipe ? 'recipe' : isRecipePending ? 'loadingRecipe' : ideas.length > 0 ? 'ideas' : isIdeasPending ? 'loadingIdeas' : 'idle',
    generateIdeas,
    generateRecipe,
    reset,
    backToIdeas,
  };
};
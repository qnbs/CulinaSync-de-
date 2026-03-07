import { useActionState, useEffect, useOptimistic, useState } from 'react';
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
  const [ideas, setIdeas] = useState<RecipeIdea[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<RecipeIdea | null>(null);
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

  useEffect(() => {
    if (!ideasState.promptKey) {
      return;
    }

    setIdeas(ideasState.ideas);
    setRecipe(null);
    setSelectedIdea(null);
    setError(ideasState.error);
  }, [ideasState]);

  useEffect(() => {
    if (!recipeState.recipeKey) {
      return;
    }

    setRecipe(recipeState.recipe);
    setError(recipeState.error);
    if (recipeState.error) {
      setSelectedIdea(null);
    }
  }, [recipeState]);

  const generateIdeas = (nextPrompt: StructuredPrompt) => {
    requestIdeas(nextPrompt);
  };

  const generateRecipe = (chosenIdea: RecipeIdea) => {
    setSelectedIdea(chosenIdea);
    setOptimisticSelectedIdea(chosenIdea);
    requestRecipe(chosenIdea);
  };

  const reset = () => {
    setIdeas([]);
    setRecipe(null);
    setError(null);
    setSelectedIdea(null);
  };

  const backToIdeas = () => {
    setRecipe(null);
    setError(null);
  };

  return {
    ideas,
    recipe,
    error,
    selectedIdea: optimisticSelectedIdea,
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
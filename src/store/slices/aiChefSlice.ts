import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Recipe, RecipeIdea, StructuredPrompt } from '../../types';
import { generateRecipeIdeas, generateRecipe } from '../../services/geminiService';
import { RootState } from '..';
import { db } from '../../services/db';

type AiChefState = 'idle' | 'loadingIdeas' | 'ideasReady' | 'loadingRecipe' | 'error';

interface AiChefSliceState {
  status: AiChefState;
  ideas: RecipeIdea[];
  recipe: Recipe | null;
  error: string | null;
}

const initialState: AiChefSliceState = {
  status: 'idle',
  ideas: [],
  recipe: null,
  error: null,
};

export const generateRecipeIdeasAsync = createAsyncThunk<
  RecipeIdea[],
  StructuredPrompt,
  { state: RootState, rejectValue: string }
>('aiChef/generateIdeas', async (prompt, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const pantryItems = await db.pantry.toArray();
        const ideas = await generateRecipeIdeas(prompt, pantryItems, state.settings.aiPreferences);
        return ideas;
    } catch (e: any) {
        return rejectWithValue(e.message);
    }
});

export const generateFullRecipeAsync = createAsyncThunk<
  Recipe,
  { prompt: StructuredPrompt, chosenIdea: RecipeIdea },
  { state: RootState, rejectValue: string }
>('aiChef/generateRecipe', async ({ prompt, chosenIdea }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const pantryItems = await db.pantry.toArray();
        const recipe = await generateRecipe(prompt, pantryItems, state.settings.aiPreferences, chosenIdea);
        return recipe;
    } catch (e: any) {
         return rejectWithValue(e.message);
    }
});

const aiChefSlice = createSlice({
  name: 'aiChef',
  initialState,
  reducers: {
    resetAiChef: () => initialState,
    backToIdeas: (state) => {
        state.status = 'ideasReady';
        state.recipe = null;
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateRecipeIdeasAsync.pending, (state) => {
        state.status = 'loadingIdeas';
        state.error = null;
        state.recipe = null;
      })
      .addCase(generateRecipeIdeasAsync.fulfilled, (state, action) => {
        state.status = 'ideasReady';
        state.ideas = action.payload;
      })
      .addCase(generateRecipeIdeasAsync.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Failed to generate ideas';
      })
      .addCase(generateFullRecipeAsync.pending, (state) => {
        state.status = 'loadingRecipe';
        state.error = null;
      })
      .addCase(generateFullRecipeAsync.fulfilled, (state, action) => {
        state.status = 'idle'; // Let component handle display
        state.recipe = action.payload;
      })
      .addCase(generateFullRecipeAsync.rejected, (state, action) => {
        state.status = 'ideasReady'; // Go back to ideas screen on error
        state.error = action.payload ?? 'Failed to generate recipe';
      });
  },
});

export const { resetAiChef, backToIdeas } = aiChefSlice.actions;

export default aiChefSlice.reducer;
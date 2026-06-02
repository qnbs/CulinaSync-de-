import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import type { Recipe } from '@/types';
import i18n from '@/i18n';
import { createTestStore } from '@/test/createTestStore';

const exportRecipeToCsv = vi.fn().mockResolvedValue(undefined);
const exportRecipeToPdf = vi.fn().mockResolvedValue(undefined);

const exportRecipeToJson = vi.fn().mockResolvedValue(undefined);
const exportRecipeToMarkdown = vi.fn().mockResolvedValue(undefined);
const exportRecipeToTxt = vi.fn().mockResolvedValue(undefined);
const verifyNutritionAndAllergensWithGemini = vi.fn().mockResolvedValue({ summary: 'OK', warnings: ['Check salt'] });
const generateChefImage = vi.fn().mockResolvedValue('data:image/png;base64,img');

vi.mock('@/services/exportService', () => ({
  exportRecipeToPdf,
  exportRecipeToCsv,
  exportRecipeToJson,
  exportRecipeToMarkdown,
  exportRecipeToTxt,
}));

vi.mock('@/services/geminiService', () => ({
  verifyNutritionAndAllergensWithGemini: (...args: unknown[]) => verifyNutritionAndAllergensWithGemini(...args),
}));

vi.mock('@/services/dbInstance', () => ({
  db: {
    pantry: { toArray: () => Promise.resolve([]) },
  },
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => [],
}));

vi.mock('@/services/nutritionWorkerService', () => ({
  analyzeRecipeNutritionInWorker: vi.fn().mockResolvedValue({
    calories: 100,
    protein: 10,
    fat: 5,
    carbs: 15,
    allergens: [],
    matchedIngredients: 1,
    totalIngredients: 2,
  }),
}));

const addRecipe = vi.fn().mockResolvedValue(99);
const deleteRecipe = vi.fn().mockResolvedValue(undefined);
const addMissingIngredientsToShoppingList = vi.fn().mockResolvedValue(2);
const updateRecipeImage = vi.fn().mockResolvedValue(undefined);
const setRecipeFavorite = vi.fn().mockResolvedValue(undefined);

vi.mock('@/services/repositories/recipeRepository', () => ({
  addRecipe: (...args: unknown[]) => addRecipe(...args),
  deleteRecipe: (...args: unknown[]) => deleteRecipe(...args),
  addMissingIngredientsToShoppingList: (...args: unknown[]) => addMissingIngredientsToShoppingList(...args),
  updateRecipeImage: (...args: unknown[]) => updateRecipeImage(...args),
  setRecipeFavorite: (...args: unknown[]) => setRecipeFavorite(...args),
}));

vi.mock('@/services/repositories/shoppingListRepository', () => ({
  addShoppingListItem: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/features/ai-chef/commands/generateChefImage', () => ({
  generateChefImage: (...args: unknown[]) => generateChefImage(...args),
}));

import { useRecipeDetail } from '../useRecipeDetail';

const minimalRecipe = (): Recipe => ({
  recipeTitle: 'Test Suppe',
  shortDescription: '',
  prepTime: '5',
  cookTime: '10',
  totalTime: '15',
  servings: '4',
  difficulty: 'einfach',
  ingredients: [{ sectionTitle: '', items: [{ quantity: '200', unit: 'g', name: 'Karotten' }] }],
  instructions: ['Kochen'],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
});

describe('useRecipeDetail', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={createTestStore()}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </Provider>
  );

  it('initialisiert Servings, Nutrition und Kochmodus', async () => {
    const recipe = minimalRecipe();
    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    act(() => {
      result.current.handleServingsChange(8);
    });
    expect(result.current.currentServings).toBe(8);

    act(() => {
      result.current.handleStartCookMode();
    });
    expect(result.current.isCookModeActive).toBe(true);

    act(() => {
      result.current.handleExitCookMode();
    });
    expect(result.current.isCookMode).toBe(false);
  });

  it('handleExport unterstuetzt alle Formate', async () => {
    const recipe = { ...minimalRecipe(), id: 1 };
    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    for (const format of ['pdf', 'json', 'md', 'txt'] as const) {
      await act(async () => {
        await result.current.handleExport(format);
      });
    }

    expect(exportRecipeToPdf).toHaveBeenCalled();
    expect(exportRecipeToJson).toHaveBeenCalled();
    expect(exportRecipeToMarkdown).toHaveBeenCalled();
    expect(exportRecipeToTxt).toHaveBeenCalled();
  });

  it('handleExport csv nutzt exportService', async () => {
    const recipe = { ...minimalRecipe(), id: 1 };
    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    await act(async () => {
      await result.current.handleExport('csv');
    });

    expect(exportRecipeToCsv).toHaveBeenCalled();
  });

  it('speichert neues Rezept und toggelt Favorit', async () => {
    const recipe = minimalRecipe();
    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    await act(async () => {
      await result.current.handleSave();
    });
    expect(addRecipe).toHaveBeenCalled();
    expect(result.current.isSaved).toBe(true);

    await act(async () => {
      await result.current.handleToggleFavorite();
    });
    expect(setRecipeFavorite).toHaveBeenCalledWith(99, true);
  });

  it('handleGeminiNutritionCheck setzt Verifikation', async () => {
    const recipe = { ...minimalRecipe(), id: 1 };
    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    await act(async () => {
      await result.current.handleGeminiNutritionCheck();
    });

    expect(verifyNutritionAndAllergensWithGemini).toHaveBeenCalled();
    expect(result.current.geminiVerification?.summary).toBe('OK');
  });

  it('handleConfirmPendingAction fuehrt Loeschen aus', async () => {
    const recipe = { ...minimalRecipe(), id: 5 };
    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    act(() => {
      result.current.setPendingAction({ type: 'delete' });
    });

    await act(async () => {
      await result.current.handleConfirmPendingAction();
    });

    expect(deleteRecipe).toHaveBeenCalledWith(5);
    expect(onBack).toHaveBeenCalled();
  });

  it('handleAddMissingToShoppingList und Einzelzutat', async () => {
    const recipe = {
      ...minimalRecipe(),
      id: 1,
      ingredients: [{ sectionTitle: '', items: [{ quantity: '200', unit: 'g', name: 'Karotten' }] }],
    };
    const store = createTestStore();
    const localWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </Provider>
    );

    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper: localWrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    await act(async () => {
      await result.current.handleAddMissingToShoppingList();
    });
    expect(addMissingIngredientsToShoppingList).toHaveBeenCalledWith(1);

    await act(async () => {
      await result.current.handleAddSingleToShoppingList({ quantity: '1', unit: 'kg', name: 'Karotten' });
    });
    expect(store.getState().ui.toasts.length).toBeGreaterThan(0);
  });

  it('ignoriert ungueltige Portionsaenderung', async () => {
    const recipe = minimalRecipe();
    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    act(() => {
      result.current.handleServingsChange(0);
      result.current.handleServingsChange(200);
    });

    expect(result.current.currentServings).toBe(4);
  });

  it('handleGenerateImage startet Bildgenerierung', async () => {
    const recipe = { ...minimalRecipe(), id: 1 };
    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    await act(async () => {
      await result.current.handleGenerateImage();
    });

    expect(generateChefImage).toHaveBeenCalledWith('Test Suppe');
  });

  it('voiceAction aktiviert Kochmodus', async () => {
    const recipe = { ...minimalRecipe(), id: 1 };
    const store = createTestStore({
      ui: {
        currentPage: 'recipes',
        toasts: [],
        voiceAction: { type: 'START_COOK_MODE', payload: '' },
      },
    });
    const localWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </Provider>
    );

    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper: localWrapper });

    await waitFor(() => expect(result.current.isCookModeActive).toBe(true));

    act(() => {
      result.current.handleExitCookMode();
    });
    expect(result.current.isCookMode).toBe(false);
  });
});

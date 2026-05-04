import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import type { Recipe } from '@/types';
import i18n from '@/i18n';
import { createTestStore } from '@/test/createTestStore';

const exportRecipeToCsv = vi.fn().mockResolvedValue(undefined);
const exportRecipeToPdf = vi.fn().mockResolvedValue(undefined);

vi.mock('@/services/exportService', () => ({
  exportRecipeToPdf,
  exportRecipeToCsv,
  exportRecipeToJson: vi.fn().mockResolvedValue(undefined),
  exportRecipeToMarkdown: vi.fn().mockResolvedValue(undefined),
  exportRecipeToTxt: vi.fn().mockResolvedValue(undefined),
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

vi.mock('@/services/repositories/recipeRepository', () => ({
  addRecipe: vi.fn().mockResolvedValue(99),
  deleteRecipe: vi.fn().mockResolvedValue(undefined),
  addMissingIngredientsToShoppingList: vi.fn().mockResolvedValue(0),
  updateRecipeImage: vi.fn().mockResolvedValue(undefined),
  setRecipeFavorite: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/repositories/shoppingListRepository', () => ({
  addShoppingListItem: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/features/ai-chef/commands/generateChefImage', () => ({
  generateChefImage: vi.fn().mockResolvedValue('data:image/png;base64,xx'),
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

  it('handleExport csv nutzt exportService', async () => {
    const recipe = { ...minimalRecipe(), id: 1 };
    const { result } = renderHook(() => useRecipeDetail(recipe, onBack), { wrapper });

    await waitFor(() => expect(result.current.nutritionResult.key).toBeTruthy());

    await act(async () => {
      await result.current.handleExport('csv');
    });

    expect(exportRecipeToCsv).toHaveBeenCalled();
  });
});

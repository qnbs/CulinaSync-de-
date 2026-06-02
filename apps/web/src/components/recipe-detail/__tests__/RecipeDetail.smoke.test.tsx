import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import RecipeDetail from '../RecipeDetail';
import i18n from '@/i18n';
import type { Recipe } from '@/types';
const mockUseRecipeDetail = vi.fn();

vi.mock('../useRecipeDetail', () => ({
  useRecipeDetail: (...a: unknown[]) => mockUseRecipeDetail(...a),
}));

const baseRecipe: Recipe = {
  id: 1,
  recipeTitle: 'Smoke-Cake',
  shortDescription: 'Kurz und buendig',
  prepTime: '5',
  cookTime: '10',
  totalTime: '15',
  servings: '2',
  difficulty: 'Einfach',
  ingredients: [],
  instructions: [],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: ['Schnell'], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
  isFavorite: false,
  updatedAt: Date.now(),
};

function buildHookReturn(recipe: Recipe) {
  return {
    currentRecipe: recipe,
    isSaved: true,
    isModalOpen: false,
    isExportOpen: false,
    pendingAction: null,
    isGeminiCheckLoading: false,
    geminiVerification: null,
    isGeneratingImage: false,
    displayImage: null,
    pantryMap: new Map<string, number>(),
    currentServings: 2,
    scaleFactor: 1,
    isNutritionLoading: false,
    nutritionReport: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      allergens: [] as string[],
      matchedIngredients: 0,
      totalIngredients: 0,
    },
    allTags: ['Schnell'],
    setIsModalOpen: vi.fn(),
    setExportOpen: vi.fn(),
    setPendingAction: vi.fn(),
    handleServingsChange: vi.fn(),
    handleGeminiNutritionCheck: vi.fn(),
    handleSave: vi.fn(),
    handleGenerateImage: vi.fn(),
    handleExport: vi.fn(),
    handleConfirmPendingAction: vi.fn(),
    handleToggleFavorite: vi.fn(),
    handleStartCookMode: vi.fn(),
    handleExitCookMode: vi.fn(),
    isCookModeActive: false,
    handleAddMissingToShoppingList: vi.fn(),
    handleAddSingleToShoppingList: vi.fn(),
    t: ((k: string, opts?: unknown) =>
      (i18n.t as (key: string, options?: unknown) => ReturnType<(typeof i18n)['t']>)(k, opts)) as (typeof i18n)['t'],
    dispatch: vi.fn(),
  };
}

describe('RecipeDetail (Smoke)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
  });

  it('rendert Titel und Kurzbeschreibung', () => {
    mockUseRecipeDetail.mockImplementation(() => buildHookReturn(baseRecipe));
    const onBack = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <RecipeDetail recipe={baseRecipe} onBack={onBack} />
      </I18nextProvider>,
    );

    expect(screen.getByRole('heading', { name: /Smoke-Cake/i })).toBeInTheDocument();
    expect(screen.getByText(/Kurz und buendig/i)).toBeInTheDocument();
    expect(screen.getByText('Schnell')).toBeInTheDocument();
  });

  it('Zurueck ruft onBack', async () => {
    const user = userEvent.setup();
    mockUseRecipeDetail.mockImplementation(() => buildHookReturn(baseRecipe));
    const onBack = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <RecipeDetail recipe={baseRecipe} onBack={onBack} />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Zurück zur Übersicht/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('zeigt Bestaetigungsdialog bei pendingAction', () => {
    mockUseRecipeDetail.mockImplementation(() => ({
      ...buildHookReturn(baseRecipe),
      pendingAction: { type: 'delete' as const },
    }));
    const onBack = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <RecipeDetail recipe={baseRecipe} onBack={onBack} />
      </I18nextProvider>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Rezept loeschen/i)).toBeInTheDocument();
  });

  it('useRecipeDetail erhaelt Rezept und Callback', () => {
    mockUseRecipeDetail.mockImplementation(() => buildHookReturn(baseRecipe));
    const onBack = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <RecipeDetail recipe={baseRecipe} onBack={onBack} />
      </I18nextProvider>,
    );

    expect(mockUseRecipeDetail).toHaveBeenCalledWith(baseRecipe, onBack);
  });
});

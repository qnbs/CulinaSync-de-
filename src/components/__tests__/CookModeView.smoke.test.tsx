import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CookModeView from '@/components/CookModeView';
import type { Recipe } from '@/types';

vi.mock('@/hooks/useCookModeController', () => ({
  useCookModeController: () => ({
    t: (k: string) => k,
    currentStep: 0,
    checkedIngredients: [] as string[],
    timerSeconds: 180,
    timerRunning: false,
    isSpeechEnabled: false,
    setIsSpeechEnabled: vi.fn(),
    isUiVisible: true,
    isSpeaking: false,
    ingredientList: ['Tomate'],
    progressPercentage: 50,
    ingredientProgress: 0,
    isInterfaceVisible: true,
    formatTimer: (s: number) => `03:${String(s % 60).padStart(2, '0')}`,
    handleNext: vi.fn(),
    handlePrev: vi.fn(),
    handleRepeat: vi.fn(),
    toggleIngredient: vi.fn(),
    onTimerToggle: vi.fn(),
    onResetTimerShort: vi.fn(),
    onAddThirty: vi.fn(),
  }),
}));

const recipe: Recipe = {
  recipeTitle: 'Smoke-Rezept',
  shortDescription: '',
  prepTime: '1',
  cookTime: '1',
  totalTime: '2',
  servings: '1',
  difficulty: 'einfach',
  ingredients: [],
  instructions: ['A'],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
};

describe('CookModeView (Smoke)', () => {
  it('rendert Titel und Kochmodus-Label', () => {
    render(<CookModeView recipe={recipe} onExit={vi.fn()} />);

    expect(screen.getByText('Smoke-Rezept')).toBeInTheDocument();
    expect(screen.getByText('cookMode.label')).toBeInTheDocument();
  });
});

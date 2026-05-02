import { Provider } from 'react-redux';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useCookModeController } from '../useCookModeController';
import { createTestStore } from '@/test/createTestStore';
import { setVoiceAction } from '@/store/slices/uiSlice';
import type { Recipe } from '@/types';

vi.mock('../useWakeLock', () => ({
  useWakeLock: () => [false, vi.fn().mockResolvedValue(undefined), vi.fn().mockResolvedValue(undefined)],
}));

vi.mock('../useSpeechSynthesis', () => ({
  useSpeechSynthesis: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
    supported: true,
    voices: [],
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const recipe: Recipe = {
  recipeTitle: 'Testrezept',
  shortDescription: '',
  prepTime: '0',
  cookTime: '0',
  totalTime: '0',
  servings: '2',
  difficulty: 'einfach',
  ingredients: [{ sectionTitle: 'A', items: [{ quantity: '1', unit: 'Stk', name: 'Tomate' }] }],
  instructions: ['Schritt eins', 'Schritt zwei'],
  nutritionPerServing: { calories: '0', protein: '0', fat: '0', carbs: '0' },
  tags: { course: [], cuisine: [], occasion: [], mainIngredient: [], prepMethod: [], diet: [] },
  expertTips: [],
};

describe('useCookModeController', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;

  it('startet bei Schritt 0 und geht mit handleNext weiter', () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useCookModeController(recipe, onExit), { wrapper });

    expect(result.current.currentStep).toBe(0);
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentStep).toBe(1);
    act(() => {
      result.current.handlePrev();
    });
    expect(result.current.currentStep).toBe(0);
  });

  it('formatiert den Timer als MM:SS', () => {
    const { result } = renderHook(() => useCookModeController(recipe, vi.fn()), { wrapper });
    expect(result.current.formatTimer(65)).toBe('01:05');
  });

  it('reagiert auf NEXT_STEP per voiceAction', async () => {
    const { result } = renderHook(() => useCookModeController(recipe, vi.fn()), { wrapper });

    act(() => {
      store.dispatch(setVoiceAction({ type: 'NEXT_STEP', payload: '' }));
    });

    await waitFor(() => {
      expect(result.current.currentStep).toBe(1);
    });
    expect(store.getState().ui.voiceAction).toBeNull();
  });

  it('ruft onExit bei EXIT_COOK_MODE auf', async () => {
    const onExit = vi.fn();
    renderHook(() => useCookModeController(recipe, onExit), { wrapper });

    act(() => {
      store.dispatch(setVoiceAction({ type: 'EXIT_COOK_MODE', payload: '' }));
    });

    await waitFor(() => {
      expect(onExit).toHaveBeenCalledTimes(1);
    });
  });

  it('CHECK_COOK_INGREDIENT setzt die Zutat als erledigt', async () => {
    const { result } = renderHook(() => useCookModeController(recipe, vi.fn()), { wrapper });

    act(() => {
      store.dispatch(setVoiceAction({ type: 'CHECK_COOK_INGREDIENT', payload: 'tom#' }));
    });

    await waitFor(() => {
      expect(result.current.checkedIngredients).toContain('Tomate');
    });
  });
});

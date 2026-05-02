import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import MealPlanner from '@/components/MealPlanner';
import i18n from '@/i18n';
import { createTestStore } from '@/test/createTestStore';

vi.mock('@/hooks/useMealPlannerScreen', () => ({
  useMealPlannerScreen: () => ({
    currentDate: new Date('2026-05-05T12:00:00Z'),
    setCurrentDate: vi.fn(),
    pantryItems: [],
    recipes: [],
    mealPlanItems: [],
    recipesById: new Map(),
    week: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 4, 4 + i, 12, 0, 0));
      return d;
    }),
    mealsByDate: {},
  }),
}));

describe('MealPlanner (Smoke)', () => {
  it('rendert den Essensplaner-Header', () => {
    render(
      <Provider store={createTestStore()}>
        <I18nextProvider i18n={i18n}>
          <MealPlanner />
        </I18nextProvider>
      </Provider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: /Essensplaner|Meal Planner/i })).toBeInTheDocument();
  });
});

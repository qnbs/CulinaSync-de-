import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MealPlannerProvider, useMealPlannerContext } from '../MealPlannerContext';

const stubScreen = {
  currentDate: new Date('2026-05-02T12:00:00Z'),
  setCurrentDate: vi.fn(),
  pantryItems: [] as { id?: number; name: string }[],
  recipes: [],
  mealPlanItems: [],
  recipesById: new Map(),
  week: [new Date('2026-05-02T12:00:00Z')],
  mealsByDate: {},
};

vi.mock('@/hooks/useMealPlannerScreen', () => ({
  useMealPlannerScreen: () => stubScreen,
}));

function Consumer() {
  const ctx = useMealPlannerContext();
  return <span data-testid="week-len">{ctx.week.length}</span>;
}

describe('MealPlannerContext', () => {
  it('wirft außerhalb des Providers', () => {
    expect(() => render(<Consumer />)).toThrow(/MealPlannerProvider/);
  });

  it('stellt den Wert von useMealPlannerScreen bereit', () => {
    render(
      <MealPlannerProvider>
        <Consumer />
      </MealPlannerProvider>,
    );
    expect(screen.getByTestId('week-len')).toHaveTextContent('1');
  });
});

import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMealPlannerScreen } from '../useMealPlannerScreen';
import { createTestStore } from '@/test/createTestStore';
import { getDefaultSettings } from '@/services/settingsService';
import { useMealPlan } from '../useMealPlan';
import { useLiveQuery } from 'dexie-react-hooks';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => []),
}));

vi.mock('../useMealPlan', () => ({
  useMealPlan: vi.fn(),
}));

describe('useMealPlannerScreen', () => {
  const mealPlanStub = {
    recipes: [] as import('@/types').Recipe[],
    mealPlanItems: [] as import('@/types').MealPlanItem[],
    recipesById: new Map<number, import('@/types').Recipe>(),
    week: [new Date('2026-05-04T12:00:00Z')],
    mealsByDate: {} as Record<string, import('@/types').MealPlanItem>,
  };

  beforeEach(() => {
    vi.mocked(useMealPlan).mockReturnValue(mealPlanStub);
    vi.mocked(useLiveQuery).mockReturnValue([]);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={createTestStore()}>{children}</Provider>
  );

  it('liefert leeren Vorrat, wenn useLiveQuery undefined zurückgibt', () => {
    vi.mocked(useLiveQuery).mockReturnValue(undefined);
    const { result } = renderHook(() => useMealPlannerScreen(), { wrapper });
    expect(result.current.pantryItems).toEqual([]);
  });

  it('reicht week und mealsByDate von useMealPlan durch', () => {
    const { result } = renderHook(() => useMealPlannerScreen(), { wrapper });
    expect(result.current.week).toEqual(mealPlanStub.week);
    expect(result.current.mealsByDate).toEqual(mealPlanStub.mealsByDate);
  });

  it('übergibt weekStartsOnMonday true, wenn die Woche montags beginnt', () => {
    const mondayStore = createTestStore({
      settings: { ...getDefaultSettings(), weekStart: 'Monday' },
    });
    renderHook(() => useMealPlannerScreen(), {
      wrapper: ({ children }) => <Provider store={mondayStore}>{children}</Provider>,
    });
    expect(useMealPlan).toHaveBeenCalledWith(expect.any(Date), true);
  });

  it('übergibt weekStartsOnMonday false, wenn die Woche sonntags beginnt', () => {
    const sundayStore = createTestStore({
      settings: { ...getDefaultSettings(), weekStart: 'Sunday' },
    });
    renderHook(() => useMealPlannerScreen(), {
      wrapper: ({ children }) => <Provider store={sundayStore}>{children}</Provider>,
    });
    expect(useMealPlan).toHaveBeenCalledWith(expect.any(Date), false);
  });
});

import { describe, expect, it } from 'vitest';

import { MEAL_TYPES } from '../mealPlannerConstants';

describe('mealPlannerConstants', () => {
  it('exports three meal slots', () => {
    expect(MEAL_TYPES).toHaveLength(3);
    expect(MEAL_TYPES).toContain('Frühstück');
    expect(MEAL_TYPES).toContain('Mittagessen');
    expect(MEAL_TYPES).toContain('Abendessen');
  });
});

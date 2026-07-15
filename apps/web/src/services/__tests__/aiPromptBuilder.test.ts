import { describe, expect, it } from 'vitest';
import { getDefaultSettings } from '../settingsMerge';
import { constructBasePrompt } from '../aiPromptBuilder';

describe('constructBasePrompt', () => {
  it('rendert ragContext als eigenen Block (nicht als mustInclude)', () => {
    const prompt = constructBasePrompt(
      {
        craving: 'Pasta',
        includeIngredients: ['Basilikum'],
        excludeIngredients: [],
        modifiers: [],
        ragContext: '- Tomaten 2 Stk\n- MealPlan Curry',
      },
      [],
      getDefaultSettings().aiPreferences,
    );

    expect(prompt).toMatch(/Tomaten 2 Stk/);
    expect(prompt).toMatch(/MealPlan Curry/);
    expect(prompt).toMatch(/Basilikum/);
  });
});

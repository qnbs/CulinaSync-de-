import { describe, expect, it } from 'vitest';
import { getDefaultSettings, mergeWithDefaults } from '../settingsMerge';

describe('settingsMerge', () => {
  it('merges legacy partial settings with full defaults', () => {
    const merged = mergeWithDefaults({
      language: 'en',
      aiPreferences: { creativityLevel: 0.2 },
      policies: { avoidAllergens: ['Gluten'] },
    });

    expect(merged.language).toBe('en');
    expect(merged.aiPreferences.creativityLevel).toBe(0.2);
    expect(merged.aiPreferences.routingMode).toBe('local-first');
    expect(merged.localAi.enabled).toBe(true);
    expect(merged.policies.avoidAllergens).toEqual(['Gluten']);
    expect(merged.speechRecognition.mode).toBe('browser');
    expect(merged.cookMode.aiAssistantEnabled).toBe(true);
  });

  it('getDefaultSettings includes all required sections', () => {
    const defaults = getDefaultSettings();
    expect(defaults.privacy.analyticsEnabled).toBe(false);
    expect(defaults.mealPlanner.avoidRepeatWithinDays).toBe(7);
    expect(defaults.appearance.reducedMotion).toBe(false);
  });
});

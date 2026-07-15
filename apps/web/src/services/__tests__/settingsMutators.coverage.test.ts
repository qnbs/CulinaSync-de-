import { describe, expect, it } from 'vitest';
import { applySettingsChange, type SettingsPath } from '../settingsMutators';
import { getDefaultSettings } from '../settingsMerge';

describe('settingsMutators coverage sweep', () => {
  it('wendet die meisten SettingsPath-Werte an', () => {
    const draft = structuredClone(getDefaultSettings());
    const cases: Array<[SettingsPath, unknown]> = [
      ['language', 'en'],
      ['displayName', 'Tester'],
      ['defaultServings', 6],
      ['weekStart', 'Sunday'],
      ['aiPreferences.creativityLevel', 0.4],
      ['aiPreferences.dietaryRestrictions', ['vegan']],
      ['aiPreferences.preferredCuisines', ['italienisch']],
      ['aiPreferences.customInstruction', 'kurz'],
      ['aiPreferences.routingMode', 'cloud-first'],
      ['aiPreferences.responseStyle', 'detailed'],
      ['aiPreferences.usePantryContext', false],
      ['aiPreferences.useMealPlanContext', false],
      ['aiPreferences.useRecipeHistoryContext', false],
      ['aiPreferences.maxRagChunks', 16],
      ['aiPreferences.structuredOutputStrict', false],
      ['localAi.enabled', true],
      ['localAi.localOnlyMode', true],
      ['localAi.allowCloudFallback', false],
      ['localAi.enableWebLlmInference', true],
      ['localAi.preferWebGpu', false],
      ['localAi.gpuTierPreference', 'high'],
      ['localAi.preferredGenerativeModel', 'webllm-phi-3.5'],
      ['localAi.enableVision', true],
      ['localAi.enableEmbeddings', false],
      ['localAi.enableInferenceCache', true],
      ['localAi.cacheTtlHours', 48],
      ['localAi.maxConcurrentJobs', 3],
      ['localAi.maxModelStorageMb', 2048],
      ['localAi.downloadedModels', ['m1']],
      ['localAi.stripExifOnVision', false],
      ['localAi.ollamaEnabled', true],
      ['localAi.ollamaBaseUrl', 'http://localhost:11434'],
      ['localAi.setupWizardCompleted', true],
      ['privacy.analyticsEnabled', true],
      ['privacy.shareDiagnostics', true],
      ['privacy.persistAiPromptsLocally', true],
      ['privacy.autoClearInferenceCache', true],
      ['privacy.redactPiiInLogs', false],
      ['pantry.defaultSort', 'expiryDate'],
      ['pantry.isGrouped', false],
      ['pantry.expiryWarningDays', 5],
      ['pantry.showExpiryBadges', false],
      ['pantry.unitSystem', 'imperial'],
      ['pantry.highlightLowStock', true],
      ['recipeBook.defaultSort', 'a-z'],
      ['recipeBook.showNutritionPreview', false],
      ['recipeBook.defaultView', 'list'],
      ['shoppingList.groupCheckedAtBottom', false],
      ['shoppingList.defaultSort', 'alpha'],
      ['shoppingList.autoCategorize', false],
      ['shoppingList.smartMergeDuplicates', false],
      ['shoppingList.suggestQuantitiesFromRecipes', false],
      ['mealPlanner.preferVariety', false],
      ['mealPlanner.respectExpiryDates', false],
      ['mealPlanner.suggestFromPantry', false],
      ['mealPlanner.avoidRepeatWithinDays', 5],
      ['cookMode.aiAssistantEnabled', false],
      ['cookMode.autoAdvanceSteps', true],
      ['cookMode.timerSoundEnabled', false],
      ['cookMode.keepScreenAwake', false],
      ['cookMode.showIngredientChecklist', false],
      ['speechSynthesis.voice', 'de-DE'],
      ['speechSynthesis.rate', 1.2],
      ['speechSynthesis.pitch', 1.1],
      ['speechSynthesis.volume', 0.8],
      ['speechRecognition.mode', 'whisper'],
      ['speechRecognition.whisperModelSize', 'small'],
      ['speechRecognition.continuousListening', true],
      ['speechRecognition.confirmDestructiveCommands', false],
      ['appearance.accentColor', 'sky'],
      ['appearance.highContrast', true],
      ['appearance.kitchenMode', true],
      ['appearance.largeText', true],
      ['appearance.reducedMotion', true],
      ['appearance.compactDensity', true],
      ['appearance.showNutritionBadges', false],
      ['policies.avoidAllergens', ['nüsse']],
      ['policies.ingredientBlacklist', ['sellerie']],
      ['policies.minPantryStock', [{ name: 'Milch', min: 1 }]],
      ['policies.strictAllergenEnforcement', true],
    ];

    for (const [path, value] of cases) {
      expect(applySettingsChange(draft, path, value), path).toBe(true);
    }

    expect(draft.language).toBe('en');
    expect(draft.localAi.enableVision).toBe(true);
    expect(draft.localAi.ollamaBaseUrl).toBe('http://localhost:11434');
    expect(draft.appearance.accentColor).toBe('sky');
    expect(draft.policies.minPantryStock[0]?.name).toBe('Milch');
  });
});

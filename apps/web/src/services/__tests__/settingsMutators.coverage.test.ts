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

  it('weist ungültige Werte ab (Reject-Zweige)', () => {
    const draft = structuredClone(getDefaultSettings());
    const language = draft.language;
    const creativity = draft.aiPreferences.creativityLevel;
    const servings = draft.defaultServings;
    const gpu = draft.localAi.gpuTierPreference;
    const model = draft.localAi.preferredGenerativeModel;
    const stock = draft.policies.minPantryStock;

    const rejects: Array<[SettingsPath, unknown]> = [
      ['language', 'fr'],
      ['displayName', 12],
      ['defaultServings', Number.NaN],
      ['defaultServings', '3'],
      ['weekStart', 'Friday'],
      ['aiPreferences.creativityLevel', Number.NaN],
      ['aiPreferences.dietaryRestrictions', [1, 2]],
      ['aiPreferences.preferredCuisines', 'italienisch'],
      ['aiPreferences.customInstruction', false],
      ['aiPreferences.routingMode', 'hybrid'],
      ['aiPreferences.responseStyle', 'verbose'],
      ['aiPreferences.usePantryContext', 'yes'],
      ['aiPreferences.maxRagChunks', Number.POSITIVE_INFINITY],
      ['localAi.enabled', 1],
      ['localAi.gpuTierPreference', 'ultra'],
      ['localAi.preferredGenerativeModel', 'gpt-4'],
      ['localAi.cacheTtlHours', '48'],
      ['localAi.maxConcurrentJobs', 0],
      ['localAi.maxModelStorageMb', Number.NaN],
      ['localAi.downloadedModels', ['ok', 2]],
      ['localAi.ollamaBaseUrl', 123],
      ['localAi.ollamaBaseUrl', 'x'.repeat(300)],
      ['privacy.analyticsEnabled', 'no'],
      ['pantry.defaultSort', 'price'],
      ['pantry.unitSystem', 'us'],
      ['pantry.expiryWarningDays', -1],
      ['recipeBook.defaultSort', 'rating'],
      ['recipeBook.defaultView', 'cards'],
      ['shoppingList.defaultSort', 'recent'],
      ['shoppingList.autoCategorize', 'true'],
      ['mealPlanner.avoidRepeatWithinDays', '5'],
      ['speechSynthesis.rate', 'fast'],
      ['speechRecognition.mode', 'azure'],
      ['speechRecognition.whisperModelSize', 'large'],
      ['appearance.accentColor', 'purple'],
      ['policies.avoidAllergens', 'nüsse'],
      ['policies.minPantryStock', [{ name: 'Milch', min: -1 }]],
      ['policies.minPantryStock', [{ name: 1, min: 1 }]],
      ['policies.minPantryStock', [null]],
      ['policies.strictAllergenEnforcement', 'yes'],
    ];

    for (const [path, value] of rejects) {
      expect(applySettingsChange(draft, path, value), path).toBe(true);
    }

    expect(draft.language).toBe(language);
    expect(draft.aiPreferences.creativityLevel).toBe(creativity);
    expect(draft.defaultServings).toBe(servings);
    expect(draft.localAi.gpuTierPreference).toBe(gpu);
    expect(draft.localAi.preferredGenerativeModel).toBe(model);
    expect(draft.policies.minPantryStock).toEqual(stock);
  });

  it('clampInt/clampFloat begrenzt Grenzwerte', () => {
    const draft = structuredClone(getDefaultSettings());
    expect(applySettingsChange(draft, 'defaultServings', 100)).toBe(true);
    expect(draft.defaultServings).toBe(24);
    expect(applySettingsChange(draft, 'aiPreferences.creativityLevel', -0.5)).toBe(true);
    expect(draft.aiPreferences.creativityLevel).toBe(0);
    expect(applySettingsChange(draft, 'aiPreferences.creativityLevel', 1.5)).toBe(true);
    expect(draft.aiPreferences.creativityLevel).toBe(1);
    expect(applySettingsChange(draft, 'localAi.maxConcurrentJobs', 9)).toBe(true);
    expect(draft.localAi.maxConcurrentJobs).toBe(4);
  });

  it('weist alle boolean-Pfade bei Nicht-Boolean ab', () => {
    const draft = structuredClone(getDefaultSettings());
    const snapshot = structuredClone(draft);
    const booleanPaths: SettingsPath[] = [
      'aiPreferences.usePantryContext',
      'aiPreferences.useMealPlanContext',
      'aiPreferences.useRecipeHistoryContext',
      'aiPreferences.structuredOutputStrict',
      'localAi.enabled',
      'localAi.localOnlyMode',
      'localAi.allowCloudFallback',
      'localAi.enableWebLlmInference',
      'localAi.preferWebGpu',
      'localAi.enableVision',
      'localAi.enableEmbeddings',
      'localAi.enableInferenceCache',
      'localAi.stripExifOnVision',
      'localAi.ollamaEnabled',
      'localAi.setupWizardCompleted',
      'privacy.analyticsEnabled',
      'privacy.shareDiagnostics',
      'privacy.persistAiPromptsLocally',
      'privacy.autoClearInferenceCache',
      'privacy.redactPiiInLogs',
      'pantry.isGrouped',
      'pantry.showExpiryBadges',
      'pantry.highlightLowStock',
      'recipeBook.showNutritionPreview',
      'shoppingList.groupCheckedAtBottom',
      'shoppingList.autoCategorize',
      'shoppingList.smartMergeDuplicates',
      'shoppingList.suggestQuantitiesFromRecipes',
      'mealPlanner.preferVariety',
      'mealPlanner.respectExpiryDates',
      'mealPlanner.suggestFromPantry',
      'cookMode.aiAssistantEnabled',
      'cookMode.autoAdvanceSteps',
      'cookMode.timerSoundEnabled',
      'cookMode.keepScreenAwake',
      'cookMode.showIngredientChecklist',
      'speechRecognition.continuousListening',
      'speechRecognition.confirmDestructiveCommands',
      'appearance.highContrast',
      'appearance.kitchenMode',
      'appearance.largeText',
      'appearance.reducedMotion',
      'appearance.compactDensity',
      'appearance.showNutritionBadges',
      'policies.strictAllergenEnforcement',
    ];
    for (const path of booleanPaths) {
      expect(applySettingsChange(draft, path, 'yes'), path).toBe(true);
      expect(applySettingsChange(draft, path, 1), path).toBe(true);
      expect(applySettingsChange(draft, path, null), path).toBe(true);
    }
    expect(draft).toEqual(snapshot);
  });

  it('deckt alle Enum-OR-Arme und unknown path ab', () => {
    const draft = structuredClone(getDefaultSettings());
    expect(applySettingsChange(draft, 'not.a.path', true)).toBe(false);

    for (const lang of ['de', 'en'] as const) {
      expect(applySettingsChange(draft, 'language', lang)).toBe(true);
      expect(draft.language).toBe(lang);
    }
    for (const week of ['Monday', 'Sunday'] as const) {
      expect(applySettingsChange(draft, 'weekStart', week)).toBe(true);
    }
    for (const mode of ['local-only', 'local-first', 'cloud-first'] as const) {
      expect(applySettingsChange(draft, 'aiPreferences.routingMode', mode)).toBe(true);
    }
    for (const style of ['concise', 'balanced', 'detailed'] as const) {
      expect(applySettingsChange(draft, 'aiPreferences.responseStyle', style)).toBe(true);
    }
    for (const tier of ['auto', 'high', 'balanced', 'efficient'] as const) {
      expect(applySettingsChange(draft, 'localAi.gpuTierPreference', tier)).toBe(true);
    }
    for (const model of [
      'auto',
      'webllm-qwen-2.5-1.5b',
      'webllm-phi-3.5',
      'webllm-llama-3.2-1b',
      'heuristic-only',
    ] as const) {
      expect(applySettingsChange(draft, 'localAi.preferredGenerativeModel', model)).toBe(true);
    }
    for (const mode of ['browser', 'whisper'] as const) {
      expect(applySettingsChange(draft, 'speechRecognition.mode', mode)).toBe(true);
    }
    for (const size of ['tiny', 'base', 'small'] as const) {
      expect(applySettingsChange(draft, 'speechRecognition.whisperModelSize', size)).toBe(true);
    }
    for (const sort of ['name', 'expiryDate', 'updatedAt', 'createdAt'] as const) {
      expect(applySettingsChange(draft, 'pantry.defaultSort', sort)).toBe(true);
    }
    for (const sort of ['newest', 'favorites', 'a-z', 'z-a'] as const) {
      expect(applySettingsChange(draft, 'recipeBook.defaultSort', sort)).toBe(true);
    }
    for (const sort of ['category', 'alpha'] as const) {
      expect(applySettingsChange(draft, 'shoppingList.defaultSort', sort)).toBe(true);
    }
    for (const unit of ['metric', 'imperial'] as const) {
      expect(applySettingsChange(draft, 'pantry.unitSystem', unit)).toBe(true);
    }
    for (const view of ['grid', 'list'] as const) {
      expect(applySettingsChange(draft, 'recipeBook.defaultView', view)).toBe(true);
    }
    for (const accent of ['amber', 'rose', 'sky', 'emerald'] as const) {
      expect(applySettingsChange(draft, 'appearance.accentColor', accent)).toBe(true);
    }
  });
});

import type { AppSettings } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const mergeSection = <T extends object>(defaults: T, source: unknown): T => ({
  ...defaults,
  ...(isRecord(source) ? (source as Partial<T>) : {}),
});

export const getDefaultSettings = (): AppSettings => ({
  language: 'de',
  displayName: 'Mein Haushalt',
  defaultServings: 2,
  weekStart: 'Monday',
  aiPreferences: {
    dietaryRestrictions: [],
    preferredCuisines: [],
    customInstruction: '',
    creativityLevel: 0.7,
    routingMode: 'local-first',
    responseStyle: 'balanced',
    usePantryContext: true,
    useMealPlanContext: true,
    useRecipeHistoryContext: true,
    maxRagChunks: 12,
    structuredOutputStrict: true,
  },
  localAi: {
    enabled: true,
    localOnlyMode: false,
    allowCloudFallback: true,
    enableWebLlmInference: false,
    preferWebGpu: true,
    gpuTierPreference: 'auto',
    preferredGenerativeModel: 'auto',
    enableVision: true,
    enableEmbeddings: true,
    enableInferenceCache: true,
    cacheTtlHours: 72,
    maxConcurrentJobs: 2,
    maxModelStorageMb: 2048,
    downloadedModels: [],
    stripExifOnVision: true,
    ollamaEnabled: false,
    ollamaBaseUrl: 'http://127.0.0.1:11434',
  },
  privacy: {
    analyticsEnabled: false,
    shareDiagnostics: false,
    persistAiPromptsLocally: true,
    autoClearInferenceCache: false,
    redactPiiInLogs: true,
  },
  pantry: {
    defaultSort: 'name',
    isGrouped: true,
    expiryWarningDays: 3,
    showExpiryBadges: true,
    unitSystem: 'metric',
    highlightLowStock: true,
  },
  recipeBook: {
    defaultSort: 'newest',
    showNutritionPreview: true,
    defaultView: 'grid',
  },
  shoppingList: {
    groupCheckedAtBottom: true,
    defaultSort: 'category',
    autoCategorize: true,
    smartMergeDuplicates: true,
    suggestQuantitiesFromRecipes: true,
  },
  mealPlanner: {
    preferVariety: true,
    respectExpiryDates: true,
    suggestFromPantry: true,
    avoidRepeatWithinDays: 7,
  },
  cookMode: {
    aiAssistantEnabled: true,
    autoAdvanceSteps: false,
    timerSoundEnabled: true,
    keepScreenAwake: true,
    showIngredientChecklist: true,
  },
  speechSynthesis: {
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
  },
  speechRecognition: {
    mode: 'browser',
    whisperModelSize: 'base',
    continuousListening: false,
    confirmDestructiveCommands: true,
  },
  appearance: {
    accentColor: 'amber',
    highContrast: false,
    kitchenMode: false,
    largeText: false,
    reducedMotion: false,
    compactDensity: false,
    showNutritionBadges: true,
  },
  policies: {
    avoidAllergens: [],
    ingredientBlacklist: [],
    minPantryStock: [],
    strictAllergenEnforcement: false,
  },
});

export const mergeWithDefaults = (parsed: unknown): AppSettings => {
  const defaults = getDefaultSettings();
  const source = isRecord(parsed) ? parsed : {};
  const legacyPolicies = isRecord(source.policies) ? source.policies : {};

  return {
    ...defaults,
    ...source,
    aiPreferences: mergeSection(defaults.aiPreferences, source.aiPreferences),
    localAi: mergeSection(defaults.localAi, source.localAi),
    privacy: mergeSection(defaults.privacy, source.privacy),
    pantry: mergeSection(defaults.pantry, source.pantry),
    recipeBook: mergeSection(defaults.recipeBook, source.recipeBook),
    shoppingList: mergeSection(defaults.shoppingList, source.shoppingList),
    mealPlanner: mergeSection(defaults.mealPlanner, source.mealPlanner),
    cookMode: mergeSection(defaults.cookMode, source.cookMode),
    speechSynthesis: mergeSection(defaults.speechSynthesis, source.speechSynthesis),
    speechRecognition: mergeSection(defaults.speechRecognition, source.speechRecognition),
    appearance: mergeSection(defaults.appearance, source.appearance),
    policies: {
      ...defaults.policies,
      avoidAllergens: Array.isArray(legacyPolicies.avoidAllergens)
        ? (legacyPolicies.avoidAllergens as string[])
        : defaults.policies.avoidAllergens,
      ingredientBlacklist: Array.isArray(legacyPolicies.ingredientBlacklist)
        ? (legacyPolicies.ingredientBlacklist as string[])
        : defaults.policies.ingredientBlacklist,
      minPantryStock: Array.isArray(legacyPolicies.minPantryStock)
        ? (legacyPolicies.minPantryStock as AppSettings['policies']['minPantryStock'])
        : defaults.policies.minPantryStock,
      strictAllergenEnforcement:
        typeof legacyPolicies.strictAllergenEnforcement === 'boolean'
          ? legacyPolicies.strictAllergenEnforcement
          : defaults.policies.strictAllergenEnforcement,
    },
  };
};

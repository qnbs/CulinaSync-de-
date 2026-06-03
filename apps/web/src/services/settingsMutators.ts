import type {
  AiRoutingMode,
  AiResponseStyle,
  AppSettings,
  GpuTierPreference,
  LocalAiGenerativeModel,
  PantryUnitSystem,
  SpeechRecognitionMode,
  WhisperModelSize,
} from '../types';

export type SettingsPath =
  | 'language'
  | 'displayName'
  | 'defaultServings'
  | 'weekStart'
  | 'aiPreferences.creativityLevel'
  | 'aiPreferences.dietaryRestrictions'
  | 'aiPreferences.preferredCuisines'
  | 'aiPreferences.customInstruction'
  | 'aiPreferences.routingMode'
  | 'aiPreferences.responseStyle'
  | 'aiPreferences.usePantryContext'
  | 'aiPreferences.useMealPlanContext'
  | 'aiPreferences.useRecipeHistoryContext'
  | 'aiPreferences.maxRagChunks'
  | 'aiPreferences.structuredOutputStrict'
  | 'localAi.enabled'
  | 'localAi.localOnlyMode'
  | 'localAi.allowCloudFallback'
  | 'localAi.preferWebGpu'
  | 'localAi.gpuTierPreference'
  | 'localAi.preferredGenerativeModel'
  | 'localAi.enableVision'
  | 'localAi.enableEmbeddings'
  | 'localAi.enableInferenceCache'
  | 'localAi.cacheTtlHours'
  | 'localAi.maxConcurrentJobs'
  | 'localAi.maxModelStorageMb'
  | 'localAi.downloadedModels'
  | 'localAi.stripExifOnVision'
  | 'localAi.ollamaEnabled'
  | 'localAi.ollamaBaseUrl'
  | 'privacy.analyticsEnabled'
  | 'privacy.shareDiagnostics'
  | 'privacy.persistAiPromptsLocally'
  | 'privacy.autoClearInferenceCache'
  | 'privacy.redactPiiInLogs'
  | 'pantry.defaultSort'
  | 'pantry.isGrouped'
  | 'pantry.expiryWarningDays'
  | 'pantry.showExpiryBadges'
  | 'pantry.unitSystem'
  | 'pantry.highlightLowStock'
  | 'recipeBook.defaultSort'
  | 'recipeBook.showNutritionPreview'
  | 'recipeBook.defaultView'
  | 'shoppingList.groupCheckedAtBottom'
  | 'shoppingList.defaultSort'
  | 'shoppingList.autoCategorize'
  | 'shoppingList.smartMergeDuplicates'
  | 'shoppingList.suggestQuantitiesFromRecipes'
  | 'mealPlanner.preferVariety'
  | 'mealPlanner.respectExpiryDates'
  | 'mealPlanner.suggestFromPantry'
  | 'mealPlanner.avoidRepeatWithinDays'
  | 'cookMode.aiAssistantEnabled'
  | 'cookMode.autoAdvanceSteps'
  | 'cookMode.timerSoundEnabled'
  | 'cookMode.keepScreenAwake'
  | 'cookMode.showIngredientChecklist'
  | 'speechSynthesis.voice'
  | 'speechSynthesis.rate'
  | 'speechSynthesis.pitch'
  | 'speechSynthesis.volume'
  | 'speechRecognition.mode'
  | 'speechRecognition.whisperModelSize'
  | 'speechRecognition.continuousListening'
  | 'speechRecognition.confirmDestructiveCommands'
  | 'appearance.accentColor'
  | 'appearance.highContrast'
  | 'appearance.kitchenMode'
  | 'appearance.largeText'
  | 'appearance.reducedMotion'
  | 'appearance.compactDensity'
  | 'appearance.showNutritionBadges'
  | 'policies.avoidAllergens'
  | 'policies.ingredientBlacklist'
  | 'policies.minPantryStock'
  | 'policies.strictAllergenEnforcement';

const isLanguage = (value: unknown): value is AppSettings['language'] => value === 'de' || value === 'en';
const isWeekStart = (value: unknown): value is AppSettings['weekStart'] => value === 'Monday' || value === 'Sunday';
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');
const isRoutingMode = (value: unknown): value is AiRoutingMode =>
  value === 'local-only' || value === 'local-first' || value === 'cloud-first';
const isResponseStyle = (value: unknown): value is AiResponseStyle =>
  value === 'concise' || value === 'balanced' || value === 'detailed';
const isGpuTier = (value: unknown): value is GpuTierPreference =>
  value === 'auto' || value === 'high' || value === 'balanced' || value === 'efficient';
const isGenerativeModel = (value: unknown): value is LocalAiGenerativeModel =>
  value === 'auto' ||
  value === 'webllm-qwen-2.5-1.5b' ||
  value === 'webllm-phi-3.5' ||
  value === 'webllm-llama-3.2-1b' ||
  value === 'heuristic-only';
const isSpeechMode = (value: unknown): value is SpeechRecognitionMode => value === 'browser' || value === 'whisper';
const isWhisperSize = (value: unknown): value is WhisperModelSize =>
  value === 'tiny' || value === 'base' || value === 'small';
const isPantrySort = (value: unknown): value is AppSettings['pantry']['defaultSort'] =>
  value === 'name' || value === 'expiryDate' || value === 'updatedAt' || value === 'createdAt';
const isRecipeSort = (value: unknown): value is AppSettings['recipeBook']['defaultSort'] =>
  value === 'newest' || value === 'favorites' || value === 'a-z' || value === 'z-a';
const isShoppingSort = (value: unknown): value is AppSettings['shoppingList']['defaultSort'] =>
  value === 'category' || value === 'alpha';
const isUnitSystem = (value: unknown): value is PantryUnitSystem => value === 'metric' || value === 'imperial';
const isRecipeView = (value: unknown): value is AppSettings['recipeBook']['defaultView'] =>
  value === 'grid' || value === 'list';
const isAccentColor = (value: unknown): value is AppSettings['appearance']['accentColor'] =>
  typeof value === 'string' && ['amber', 'rose', 'sky', 'emerald'].includes(value);
const isMinPantryStock = (value: unknown): value is AppSettings['policies']['minPantryStock'] =>
  Array.isArray(value) &&
  value.every((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const candidate = entry as { name?: unknown; min?: unknown };
    return typeof candidate.name === 'string' && typeof candidate.min === 'number' && Number.isFinite(candidate.min) && candidate.min >= 0;
  });

const clampInt = (value: unknown, min: number, max: number): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, Math.round(value)));
};

const clampFloat = (value: unknown, min: number, max: number): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, value));
};

export const settingsMutators: Record<SettingsPath, (draft: AppSettings, value: unknown) => void> = {
  language: (draft, value) => {
    if (isLanguage(value)) draft.language = value;
  },
  displayName: (draft, value) => {
    if (typeof value === 'string') draft.displayName = value;
  },
  defaultServings: (draft, value) => {
    const n = clampInt(value, 1, 24);
    if (n !== null) draft.defaultServings = n;
  },
  weekStart: (draft, value) => {
    if (isWeekStart(value)) draft.weekStart = value;
  },
  'aiPreferences.creativityLevel': (draft, value) => {
    const n = clampFloat(value, 0, 1);
    if (n !== null) draft.aiPreferences.creativityLevel = n;
  },
  'aiPreferences.dietaryRestrictions': (draft, value) => {
    if (isStringArray(value)) draft.aiPreferences.dietaryRestrictions = value;
  },
  'aiPreferences.preferredCuisines': (draft, value) => {
    if (isStringArray(value)) draft.aiPreferences.preferredCuisines = value;
  },
  'aiPreferences.customInstruction': (draft, value) => {
    if (typeof value === 'string') draft.aiPreferences.customInstruction = value;
  },
  'aiPreferences.routingMode': (draft, value) => {
    if (isRoutingMode(value)) draft.aiPreferences.routingMode = value;
  },
  'aiPreferences.responseStyle': (draft, value) => {
    if (isResponseStyle(value)) draft.aiPreferences.responseStyle = value;
  },
  'aiPreferences.usePantryContext': (draft, value) => {
    if (typeof value === 'boolean') draft.aiPreferences.usePantryContext = value;
  },
  'aiPreferences.useMealPlanContext': (draft, value) => {
    if (typeof value === 'boolean') draft.aiPreferences.useMealPlanContext = value;
  },
  'aiPreferences.useRecipeHistoryContext': (draft, value) => {
    if (typeof value === 'boolean') draft.aiPreferences.useRecipeHistoryContext = value;
  },
  'aiPreferences.maxRagChunks': (draft, value) => {
    const n = clampInt(value, 4, 32);
    if (n !== null) draft.aiPreferences.maxRagChunks = n;
  },
  'aiPreferences.structuredOutputStrict': (draft, value) => {
    if (typeof value === 'boolean') draft.aiPreferences.structuredOutputStrict = value;
  },
  'localAi.enabled': (draft, value) => {
    if (typeof value === 'boolean') draft.localAi.enabled = value;
  },
  'localAi.localOnlyMode': (draft, value) => {
    if (typeof value === 'boolean') draft.localAi.localOnlyMode = value;
  },
  'localAi.allowCloudFallback': (draft, value) => {
    if (typeof value === 'boolean') draft.localAi.allowCloudFallback = value;
  },
  'localAi.preferWebGpu': (draft, value) => {
    if (typeof value === 'boolean') draft.localAi.preferWebGpu = value;
  },
  'localAi.gpuTierPreference': (draft, value) => {
    if (isGpuTier(value)) draft.localAi.gpuTierPreference = value;
  },
  'localAi.preferredGenerativeModel': (draft, value) => {
    if (isGenerativeModel(value)) draft.localAi.preferredGenerativeModel = value;
  },
  'localAi.enableVision': (draft, value) => {
    if (typeof value === 'boolean') draft.localAi.enableVision = value;
  },
  'localAi.enableEmbeddings': (draft, value) => {
    if (typeof value === 'boolean') draft.localAi.enableEmbeddings = value;
  },
  'localAi.enableInferenceCache': (draft, value) => {
    if (typeof value === 'boolean') draft.localAi.enableInferenceCache = value;
  },
  'localAi.cacheTtlHours': (draft, value) => {
    const n = clampInt(value, 1, 168);
    if (n !== null) draft.localAi.cacheTtlHours = n;
  },
  'localAi.maxConcurrentJobs': (draft, value) => {
    const n = clampInt(value, 1, 4);
    if (n !== null) draft.localAi.maxConcurrentJobs = n;
  },
  'localAi.maxModelStorageMb': (draft, value) => {
    const n = clampInt(value, 256, 8192);
    if (n !== null) draft.localAi.maxModelStorageMb = n;
  },
  'localAi.downloadedModels': (draft, value) => {
    if (isStringArray(value)) draft.localAi.downloadedModels = value;
  },
  'localAi.stripExifOnVision': (draft, value) => {
    if (typeof value === 'boolean') draft.localAi.stripExifOnVision = value;
  },
  'localAi.ollamaEnabled': (draft, value) => {
    if (typeof value === 'boolean') draft.localAi.ollamaEnabled = value;
  },
  'localAi.ollamaBaseUrl': (draft, value) => {
    if (typeof value === 'string' && value.length <= 256) draft.localAi.ollamaBaseUrl = value;
  },
  'privacy.analyticsEnabled': (draft, value) => {
    if (typeof value === 'boolean') draft.privacy.analyticsEnabled = value;
  },
  'privacy.shareDiagnostics': (draft, value) => {
    if (typeof value === 'boolean') draft.privacy.shareDiagnostics = value;
  },
  'privacy.persistAiPromptsLocally': (draft, value) => {
    if (typeof value === 'boolean') draft.privacy.persistAiPromptsLocally = value;
  },
  'privacy.autoClearInferenceCache': (draft, value) => {
    if (typeof value === 'boolean') draft.privacy.autoClearInferenceCache = value;
  },
  'privacy.redactPiiInLogs': (draft, value) => {
    if (typeof value === 'boolean') draft.privacy.redactPiiInLogs = value;
  },
  'pantry.defaultSort': (draft, value) => {
    if (isPantrySort(value)) draft.pantry.defaultSort = value;
  },
  'pantry.isGrouped': (draft, value) => {
    if (typeof value === 'boolean') draft.pantry.isGrouped = value;
  },
  'pantry.expiryWarningDays': (draft, value) => {
    const n = clampInt(value, 1, 30);
    if (n !== null) draft.pantry.expiryWarningDays = n;
  },
  'pantry.showExpiryBadges': (draft, value) => {
    if (typeof value === 'boolean') draft.pantry.showExpiryBadges = value;
  },
  'pantry.unitSystem': (draft, value) => {
    if (isUnitSystem(value)) draft.pantry.unitSystem = value;
  },
  'pantry.highlightLowStock': (draft, value) => {
    if (typeof value === 'boolean') draft.pantry.highlightLowStock = value;
  },
  'recipeBook.defaultSort': (draft, value) => {
    if (isRecipeSort(value)) draft.recipeBook.defaultSort = value;
  },
  'recipeBook.showNutritionPreview': (draft, value) => {
    if (typeof value === 'boolean') draft.recipeBook.showNutritionPreview = value;
  },
  'recipeBook.defaultView': (draft, value) => {
    if (isRecipeView(value)) draft.recipeBook.defaultView = value;
  },
  'shoppingList.groupCheckedAtBottom': (draft, value) => {
    if (typeof value === 'boolean') draft.shoppingList.groupCheckedAtBottom = value;
  },
  'shoppingList.defaultSort': (draft, value) => {
    if (isShoppingSort(value)) draft.shoppingList.defaultSort = value;
  },
  'shoppingList.autoCategorize': (draft, value) => {
    if (typeof value === 'boolean') draft.shoppingList.autoCategorize = value;
  },
  'shoppingList.smartMergeDuplicates': (draft, value) => {
    if (typeof value === 'boolean') draft.shoppingList.smartMergeDuplicates = value;
  },
  'shoppingList.suggestQuantitiesFromRecipes': (draft, value) => {
    if (typeof value === 'boolean') draft.shoppingList.suggestQuantitiesFromRecipes = value;
  },
  'mealPlanner.preferVariety': (draft, value) => {
    if (typeof value === 'boolean') draft.mealPlanner.preferVariety = value;
  },
  'mealPlanner.respectExpiryDates': (draft, value) => {
    if (typeof value === 'boolean') draft.mealPlanner.respectExpiryDates = value;
  },
  'mealPlanner.suggestFromPantry': (draft, value) => {
    if (typeof value === 'boolean') draft.mealPlanner.suggestFromPantry = value;
  },
  'mealPlanner.avoidRepeatWithinDays': (draft, value) => {
    const n = clampInt(value, 0, 30);
    if (n !== null) draft.mealPlanner.avoidRepeatWithinDays = n;
  },
  'cookMode.aiAssistantEnabled': (draft, value) => {
    if (typeof value === 'boolean') draft.cookMode.aiAssistantEnabled = value;
  },
  'cookMode.autoAdvanceSteps': (draft, value) => {
    if (typeof value === 'boolean') draft.cookMode.autoAdvanceSteps = value;
  },
  'cookMode.timerSoundEnabled': (draft, value) => {
    if (typeof value === 'boolean') draft.cookMode.timerSoundEnabled = value;
  },
  'cookMode.keepScreenAwake': (draft, value) => {
    if (typeof value === 'boolean') draft.cookMode.keepScreenAwake = value;
  },
  'cookMode.showIngredientChecklist': (draft, value) => {
    if (typeof value === 'boolean') draft.cookMode.showIngredientChecklist = value;
  },
  'speechSynthesis.voice': (draft, value) => {
    if (value === null || typeof value === 'string') draft.speechSynthesis.voice = value;
  },
  'speechSynthesis.rate': (draft, value) => {
    const n = clampFloat(value, 0.5, 2);
    if (n !== null) draft.speechSynthesis.rate = n;
  },
  'speechSynthesis.pitch': (draft, value) => {
    const n = clampFloat(value, 0, 2);
    if (n !== null) draft.speechSynthesis.pitch = n;
  },
  'speechSynthesis.volume': (draft, value) => {
    const n = clampFloat(value, 0, 1);
    if (n !== null) draft.speechSynthesis.volume = n;
  },
  'speechRecognition.mode': (draft, value) => {
    if (isSpeechMode(value)) draft.speechRecognition.mode = value;
  },
  'speechRecognition.whisperModelSize': (draft, value) => {
    if (isWhisperSize(value)) draft.speechRecognition.whisperModelSize = value;
  },
  'speechRecognition.continuousListening': (draft, value) => {
    if (typeof value === 'boolean') draft.speechRecognition.continuousListening = value;
  },
  'speechRecognition.confirmDestructiveCommands': (draft, value) => {
    if (typeof value === 'boolean') draft.speechRecognition.confirmDestructiveCommands = value;
  },
  'appearance.accentColor': (draft, value) => {
    if (isAccentColor(value)) draft.appearance.accentColor = value;
  },
  'appearance.highContrast': (draft, value) => {
    if (typeof value === 'boolean') draft.appearance.highContrast = value;
  },
  'appearance.kitchenMode': (draft, value) => {
    if (typeof value === 'boolean') draft.appearance.kitchenMode = value;
  },
  'appearance.largeText': (draft, value) => {
    if (typeof value === 'boolean') draft.appearance.largeText = value;
  },
  'appearance.reducedMotion': (draft, value) => {
    if (typeof value === 'boolean') draft.appearance.reducedMotion = value;
  },
  'appearance.compactDensity': (draft, value) => {
    if (typeof value === 'boolean') draft.appearance.compactDensity = value;
  },
  'appearance.showNutritionBadges': (draft, value) => {
    if (typeof value === 'boolean') draft.appearance.showNutritionBadges = value;
  },
  'policies.avoidAllergens': (draft, value) => {
    if (isStringArray(value)) draft.policies.avoidAllergens = value;
  },
  'policies.ingredientBlacklist': (draft, value) => {
    if (isStringArray(value)) draft.policies.ingredientBlacklist = value;
  },
  'policies.minPantryStock': (draft, value) => {
    if (isMinPantryStock(value)) draft.policies.minPantryStock = value;
  },
  'policies.strictAllergenEnforcement': (draft, value) => {
    if (typeof value === 'boolean') draft.policies.strictAllergenEnforcement = value;
  },
};

export const applySettingsChange = (draft: AppSettings, path: string, value: unknown): boolean => {
  const mutator = settingsMutators[path as SettingsPath];
  if (!mutator) return false;
  mutator(draft, value);
  return true;
};

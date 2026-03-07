import type { AppSettings, PantryItem, Recipe, RecipeIdea, ShoppingListItem, StructuredPrompt } from '../types';
import type { WhisperOptions, WhisperResult } from './whisperService';

export interface AiGateway {
  generateRecipeIdeas: (
    prompt: StructuredPrompt,
    pantryItems: PantryItem[],
    aiPreferences: AppSettings['aiPreferences'],
  ) => Promise<RecipeIdea[]>;
  generateRecipe: (
    prompt: StructuredPrompt,
    pantryItems: PantryItem[],
    aiPreferences: AppSettings['aiPreferences'],
    chosenIdea: RecipeIdea,
  ) => Promise<Recipe>;
  generateShoppingList: (
    prompt: string,
    pantryItems: PantryItem[],
    currentListItems: ShoppingListItem[],
  ) => Promise<Omit<ShoppingListItem, 'id' | 'isChecked'>[]>;
  generateRecipeImage: (recipeTitle: string) => Promise<string>;
  extractPantryItemsFromImage: (imageFile: File) => Promise<string>;
}

export interface ScannerGateway {
  scanBarcodeFromImage: (file: File) => Promise<string | null>;
  recognizeTextFromImage: (file: File, languages?: string) => Promise<string>;
}

export interface WhisperGateway {
  transcribeWithWhisper: (audioBlob: Blob, opts?: WhisperOptions) => Promise<WhisperResult>;
  initWhisper: (modelPath?: string) => Promise<void>;
}

export interface AppServices {
  ai: AiGateway;
  scanner: ScannerGateway;
  whisper: WhisperGateway;
}

const defaultServices: AppServices = {
  ai: {
    generateRecipeIdeas: async (prompt, pantryItems, aiPreferences) => {
      const aiService = await import('./aiService');
      return aiService.generateRecipeIdeas(prompt, pantryItems, aiPreferences);
    },
    generateRecipe: async (prompt, pantryItems, aiPreferences, chosenIdea) => {
      const aiService = await import('./aiService');
      return aiService.generateRecipe(prompt, pantryItems, aiPreferences, chosenIdea);
    },
    generateShoppingList: async (prompt, pantryItems, currentListItems) => {
      const aiService = await import('./aiService');
      return aiService.generateShoppingList(prompt, pantryItems, currentListItems);
    },
    generateRecipeImage: async (recipeTitle) => {
      const geminiService = await import('./geminiService');
      return geminiService.generateRecipeImage(recipeTitle);
    },
    extractPantryItemsFromImage: async (imageFile) => {
      const geminiService = await import('./geminiService');
      return geminiService.extractPantryItemsFromImage(imageFile);
    },
  },
  scanner: {
    scanBarcodeFromImage: async (file) => {
      const scannerService = await import('./scannerService');
      return scannerService.scanBarcodeFromImage(file);
    },
    recognizeTextFromImage: async (file, languages) => {
      const scannerService = await import('./scannerService');
      return scannerService.recognizeTextFromImage(file, languages);
    },
  },
  whisper: {
    transcribeWithWhisper: async (audioBlob, opts) => {
      const whisperService = await import('./whisperService');
      return whisperService.transcribeWithWhisper(audioBlob, opts);
    },
    initWhisper: async (modelPath) => {
      const whisperService = await import('./whisperService');
      return whisperService.initWhisper(modelPath);
    },
  },
};

let activeServices: AppServices = defaultServices;

export const getAppServices = (): AppServices => activeServices;

export const setAppServices = (overrides: Partial<AppServices>) => {
  activeServices = {
    ...activeServices,
    ...overrides,
    ai: { ...activeServices.ai, ...overrides.ai },
    scanner: { ...activeServices.scanner, ...overrides.scanner },
    whisper: { ...activeServices.whisper, ...overrides.whisper },
  };
};

export const resetAppServices = () => {
  activeServices = defaultServices;
};
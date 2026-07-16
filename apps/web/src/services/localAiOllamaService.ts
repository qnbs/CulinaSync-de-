import { extractJsonPayload, sanitizeForPrompt } from '@domain/ai-core';
import type { AppSettings, PantryItem, Recipe, RecipeIdea, StructuredPrompt } from '../types';
import { parseAiJsonWithSchema, recipeAiSchema, recipeIdeasResponseSchema } from './aiJsonParse';
import { constructBasePrompt, geminiSystem } from './aiPromptBuilder';
import { logAppError } from './errorLoggingService';

const DEFAULT_TIMEOUT_MS = 45_000;

type OllamaChatResponse = {
  message?: { content?: string };
  response?: string;
};

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, '');

export const probeOllamaHealth = async (
  baseUrl: string,
  timeoutMs = 5_000,
): Promise<boolean> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

const chatWithOllama = async (
  baseUrl: string,
  system: string,
  user: string,
): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama3.2',
        stream: false,
        format: 'json',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`ollama-http-${response.status}`);
    }
    const payload = (await response.json()) as OllamaChatResponse;
    const raw = payload.message?.content?.trim() || payload.response?.trim();
    if (!raw) {
      throw new Error('ollama-empty-response');
    }
    return extractJsonPayload(raw);
  } finally {
    clearTimeout(timer);
  }
};

// QNBS-v3: Ollama L0 Desktop — loopback HTTP; CSP erlaubt 127.0.0.1/localhost
export const generateRecipeIdeasWithOllama = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
  settings: AppSettings,
): Promise<RecipeIdea[] | null> => {
  if (!settings.localAi.ollamaEnabled || !settings.localAi.ollamaBaseUrl) {
    return null;
  }

  try {
    const healthy = await probeOllamaHealth(settings.localAi.ollamaBaseUrl);
    if (!healthy) {
      return null;
    }
    const userContent = constructBasePrompt(prompt, pantryItems, aiPreferences);
    const jsonText = await chatWithOllama(
      settings.localAi.ollamaBaseUrl,
      geminiSystem('ideas'),
      userContent,
    );
    const parsed = parseAiJsonWithSchema(jsonText, recipeIdeasResponseSchema);
    return parsed.ideas;
  } catch (error) {
    void logAppError(error, 'localAiOllama.recipe-ideas');
    return null;
  }
};

export const generateRecipeWithOllama = async (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
  chosenIdea: RecipeIdea,
  settings: AppSettings,
): Promise<Recipe | null> => {
  if (!settings.localAi.ollamaEnabled || !settings.localAi.ollamaBaseUrl) {
    return null;
  }

  try {
    const healthy = await probeOllamaHealth(settings.localAi.ollamaBaseUrl);
    if (!healthy) {
      return null;
    }
    let userContent = constructBasePrompt(prompt, pantryItems, aiPreferences);
    userContent += `\n\nTitle: "${sanitizeForPrompt(chosenIdea.recipeTitle)}"`;
    userContent += `\nDescription: "${sanitizeForPrompt(chosenIdea.shortDescription)}"`;
    const jsonText = await chatWithOllama(
      settings.localAi.ollamaBaseUrl,
      geminiSystem('recipe'),
      userContent,
    );
    const recipe = parseAiJsonWithSchema(jsonText, recipeAiSchema);
    if (recipe.ingredients.length > 0 && recipe.instructions.length > 0) {
      return recipe;
    }
    return null;
  } catch (error) {
    void logAppError(error, 'localAiOllama.recipe');
    return null;
  }
};

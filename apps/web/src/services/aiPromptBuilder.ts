import { sanitizeForPrompt } from '@domain/ai-core';
import i18next from 'i18next';
import type { AppSettings, PantryItem, StructuredPrompt } from '../types';

const geminiPrompt = (key: string) => i18next.t(`gemini.prompt.${key}`);
export const geminiSystem = (key: string) => i18next.t(`gemini.system.${key}`);

export const constructBasePrompt = (
  prompt: StructuredPrompt,
  pantryItems: PantryItem[],
  aiPreferences: AppSettings['aiPreferences'],
): string => {
  const pantryList = sanitizeForPrompt(
    pantryItems.map((item) => `${item.quantity} ${item.unit} ${item.name}`).join(', ')
      || geminiPrompt('pantryEmpty'),
  );
  const userPromptParts: string[] = [];
  userPromptParts.push(geminiPrompt('userIntro'));
  userPromptParts.push(`- ${geminiPrompt('mainRequest')}: "${sanitizeForPrompt(prompt.craving)}"`);

  if (prompt.includeIngredients.length > 0) {
    userPromptParts.push(
      `- ${geminiPrompt('mustInclude')}: ${sanitizeForPrompt(prompt.includeIngredients.join(', '))}`,
    );
  }
  if (prompt.excludeIngredients.length > 0) {
    userPromptParts.push(
      `- ${geminiPrompt('mustExclude')}: ${sanitizeForPrompt(prompt.excludeIngredients.join(', '))}`,
    );
  }
  if (prompt.modifiers.length > 0) {
    userPromptParts.push(`- ${geminiPrompt('modifiers')}: ${sanitizeForPrompt(prompt.modifiers.join(', '))}`);
  }

  // QNBS-v3: RAG-Kontext als eigener Prompt-Block | verhindert Token-Noise in mustInclude (audit P0-1)
  if (prompt.ragContext?.trim()) {
    userPromptParts.push(`\n**${geminiPrompt('ragContextHeader')}:**`);
    userPromptParts.push(sanitizeForPrompt(prompt.ragContext));
  }

  userPromptParts.push(`\n**${geminiPrompt('globalSettings')}:**`);
  if (aiPreferences.dietaryRestrictions.length > 0) {
    userPromptParts.push(
      `- ${geminiPrompt('dietaryRestrictions')}: ${sanitizeForPrompt(aiPreferences.dietaryRestrictions.join(', '))}.`,
    );
  }
  if (aiPreferences.preferredCuisines.length > 0) {
    userPromptParts.push(
      `- ${geminiPrompt('preferredCuisines')}: ${sanitizeForPrompt(aiPreferences.preferredCuisines.join(', '))}.`,
    );
  }
  if (aiPreferences.customInstruction) {
    userPromptParts.push(
      `- ${geminiPrompt('customInstruction')}: "${sanitizeForPrompt(aiPreferences.customInstruction)}".`,
    );
  }

  userPromptParts.push(`\n**${geminiPrompt('pantryHeader')}:**`);
  userPromptParts.push(pantryList);
  userPromptParts.push(`\n${geminiPrompt('closing')}`);

  return userPromptParts.join('\n');
};

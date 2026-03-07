import { saveApiKey } from '../../../../services/apiKeyService';
import { invalidateAIClient } from '../../../../services/geminiService';

export const storeUserApiKey = async (apiKey: string) => {
  await saveApiKey(apiKey.trim());
  invalidateAIClient();
};
import { deleteApiKey } from '../../../../services/apiKeyService';
import { invalidateAIClient } from '../../../../services/geminiService';

export const removeUserApiKey = async () => {
  await deleteApiKey();
  invalidateAIClient();
};
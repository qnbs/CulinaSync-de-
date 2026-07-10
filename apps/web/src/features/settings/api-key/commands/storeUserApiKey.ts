import { saveApiKey } from '../../../../services/apiKeyService';
import { invalidateAIClient } from '../../../../services/geminiService';

export const storeUserApiKey = async (apiKey: string, passphrase?: string) => {
  const trimmedPassphrase = passphrase?.trim();
  await saveApiKey(apiKey.trim(), trimmedPassphrase ? trimmedPassphrase : undefined);
  invalidateAIClient();
};
import { z } from 'zod';
import i18next from 'i18next';

export const createApiKeyFormSchema = () => z.object({
  apiKey: z.string()
    .trim()
    .min(1, i18next.t('settings.apiKey.validation.required'))
    .regex(/^AIza[\w-]{20,}$/, i18next.t('settings.apiKey.validation.invalid')),
});

export type ApiKeyFormValues = { apiKey: string };

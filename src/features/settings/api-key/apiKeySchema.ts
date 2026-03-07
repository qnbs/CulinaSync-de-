import { z } from 'zod';

export const apiKeyFormSchema = z.object({
  apiKey: z.string()
    .trim()
    .min(1, 'Bitte gib einen API-Schlüssel ein.')
    .regex(/^AIza[\w-]{20,}$/, 'Das sieht nicht nach einem gültigen Google API-Schlüssel aus.'),
});

export type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;
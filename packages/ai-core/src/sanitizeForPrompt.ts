const EMAIL_PATTERN = /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gu;
const PHONE_PATTERN = /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,6}\b/gu;
const IBAN_PATTERN = /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/gu;
const CREDIT_CARD_PATTERN = /\b(?:\d[ -]*?){13,19}\b/gu;

/**
 * Entfernt typische PII und harmonisiert Whitespace für sichere Prompt-Nutzung (RAG / LLM).
 */
export function sanitizeForPrompt(input: string): string {
  return input
    .replaceAll(EMAIL_PATTERN, '[EMAIL_REDACTED]')
    .replaceAll(PHONE_PATTERN, '[PHONE_REDACTED]')
    .replaceAll(IBAN_PATTERN, '[IBAN_REDACTED]')
    .replaceAll(CREDIT_CARD_PATTERN, '[CARD_REDACTED]')
    .replace(/\s+/gu, ' ')
    .trim();
}

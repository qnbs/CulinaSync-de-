const EMAIL_PATTERN = /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gu;
const IBAN_PATTERN = /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/gu;
const CREDIT_CARD_PATTERN = /\b(?:\d[ -]*?){13,19}\b/gu;

// QNBS-v3: PHONE via replacer statt Broad-Regex | verhindert Über-Redaction von ISO-Daten/Mengen (2026-07-15, 200-300) | E.164-Ziffernfenster + Datums-Guard
// A phone candidate is a digit run (optionally +-prefixed) with typical phone
// separators. The final redact decision is made in the replacer so we can keep
// ISO dates and short quantities that a broad regex would otherwise eat.
const PHONE_CANDIDATE = /(?<!\w)\+?\d[\d\s().-]{5,}\d(?!\w)/gu;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const DMY_DATE = /^\d{1,2}[./]\d{1,2}[./]\d{2,4}$/u;

const redactPhones = (input: string): string =>
  input.replace(PHONE_CANDIDATE, (match) => {
    const digits = match.replace(/\D/gu, '');
    // E.164: 7–15 significant digits. Outside that window it is not a phone.
    if (digits.length < 7 || digits.length > 15) return match;
    const trimmed = match.trim();
    if (ISO_DATE.test(trimmed) || DMY_DATE.test(trimmed)) return match;
    return '[PHONE_REDACTED]';
  });

// QNBS-v3: Prompt-Injection-Defense auch für On-Device-Pfad | spiegelt geminiService PROMPT_INJECTION_PATTERN (bisher nur Cloud) | neutralisiert Instruktions-Overrides vor jedem Modell
// Mirrors the cloud-side guard in apps/web/src/services/geminiService.ts so the
// local/on-device AI path is defended against instruction-injection too.
const PROMPT_INJECTION_PATTERN =
  /(?:(?:ignore|disregard|forget|override)\s+(?:all|any|the|these)?\s*(?:previous|prior|above|earlier)?\s*(?:instructions|prompts?|rules?)|system\s+prompt|developer\s+message|(?:^|\s)(?:assistant|system|user|role|tool\s+call|function\s+call)\s*:|follow\s+these\s+instructions|you\s+are\s+now\b)/giu;

export const neutralizePromptInjection = (input: string): string =>
  input.replaceAll(PROMPT_INJECTION_PATTERN, '[filtered]');

/**
 * Entfernt typische PII, neutralisiert Prompt-Injection-Versuche und harmonisiert
 * Whitespace für sichere Prompt-Nutzung (RAG / LLM) — cloud UND on-device.
 */
export function sanitizeForPrompt(input: string): string {
  const withoutPii = redactPhones(
    input
      .replaceAll(EMAIL_PATTERN, '[EMAIL_REDACTED]')
      .replaceAll(IBAN_PATTERN, '[IBAN_REDACTED]')
      .replaceAll(CREDIT_CARD_PATTERN, '[CARD_REDACTED]'),
  );
  return neutralizePromptInjection(withoutPii)
    .replace(/\s+/gu, ' ')
    .trim();
}

import DOMPurify from 'dompurify';

/**
 * Single wrapper around DOMPurify so the two divergent call configs can't drift
 * or pollute each other at runtime (§2.2.1).
 *
 * - 'text' — strip ALL markup. Used for untrusted web content that becomes LLM
 *   prompt input (geminiService), where no HTML should survive.
 * - 'html' — keep a safe HTML subset. Used for recipe-import page content before
 *   structured extraction, where layout tags aid parsing.
 */
export type SanitizeMode = 'text' | 'html';

export const sanitizeHtml = (input: string, mode: SanitizeMode): string =>
  mode === 'text'
    ? DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        FORBID_CONTENTS: ['script', 'style', 'noscript'],
      })
    : DOMPurify.sanitize(input, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['script', 'style', 'noscript', 'iframe', 'object', 'embed'],
      });

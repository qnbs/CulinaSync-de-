/**
 * Extrahiert JSON aus LLM-Antworten (Markdown-Fences oder Rohtext).
 */
const CODE_FENCE = '```';

// QNBS-v3: Kein Regex auf LLM-Rohtext — CodeQL js/polynomial-regexp (Alert #8, ReDoS).
const extractMarkdownFencePayload = (text: string): string | null => {
  const fenceStart = text.indexOf(CODE_FENCE);
  if (fenceStart < 0) {
    return null;
  }

  let cursor = fenceStart + CODE_FENCE.length;
  const headerLineEnd = text.indexOf('\n', cursor);
  if (headerLineEnd >= 0) {
    cursor = headerLineEnd + 1;
  }

  const fenceEnd = text.indexOf(CODE_FENCE, cursor);
  if (fenceEnd < 0) {
    return null;
  }

  return text.slice(cursor, fenceEnd).trim();
};

export const extractJsonPayload = (text: string): string => {
  const trimmed = text.trim();
  const fenced = extractMarkdownFencePayload(trimmed);
  if (fenced) {
    return fenced;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
};

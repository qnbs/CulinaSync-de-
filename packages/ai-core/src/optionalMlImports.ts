/**
 * Optionale ML-Bundles — nur dynamisch laden; Fehler bei fehlender HW/Optional-Dependency sind OK (mobile-first).
 */
export async function tryImportWebLlm(): Promise<unknown> {
  try {
    return await import('@mlc-ai/web-llm');
  } catch {
    return null;
  }
}

export async function tryImportTransformers(): Promise<unknown> {
  try {
    return await import('@xenova/transformers');
  } catch {
    return null;
  }
}

/**
 * Optionale ML-Bundles — nur dynamisch laden; Fehler bei fehlender HW/Optional-Dependency sind OK (mobile-first).
 */
import { installMlCdnFetchGuard } from './security/mlCdnFetchGuard.js';

const ensureMlFetchGuard = (): void => {
  installMlCdnFetchGuard();
};

export async function tryImportWebLlm(): Promise<unknown> {
  ensureMlFetchGuard();
  try {
    return await import('@mlc-ai/web-llm');
  } catch {
    return null;
  }
}

export async function tryImportTransformers(): Promise<unknown> {
  ensureMlFetchGuard();
  try {
    return await import('@xenova/transformers');
  } catch {
    return null;
  }
}

export async function tryImportOnnx(): Promise<unknown> {
  ensureMlFetchGuard();
  try {
    return await import('onnxruntime-web');
  } catch {
    return null;
  }
}

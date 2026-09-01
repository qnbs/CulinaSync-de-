import { assertAllowedEndpoint } from '../config/networkEndpointPolicy';
import { logAppError } from './errorLoggingService';

export type ModelDownloadIntegrityExpectation = {
  minBytes?: number;
  etag?: string;
};

/**
 * Validates CDN model download response headers when the provider exposes them.
 * Fails closed (returns false) — callers should fall back to heuristic AI layer.
 */
export const verifyModelDownloadResponse = (
  response: Response,
  expectation?: ModelDownloadIntegrityExpectation,
): boolean => {
  if (!response.ok) {
    return false;
  }

  const contentLength = response.headers.get('content-length');
  if (expectation?.minBytes != null) {
    if (contentLength == null) {
      return false;
    }
    const length = Number(contentLength);
    if (!Number.isFinite(length) || length < expectation.minBytes) {
      return false;
    }
  }

  if (expectation?.etag) {
    const etag = response.headers.get('etag');
    if (!etag || etag !== expectation.etag) {
      return false;
    }
  }

  return true;
};

/** Fetch model artifact from an allowlisted CDN host with optional integrity checks. */
export const fetchModelArtifact = async (
  url: string,
  expectation?: ModelDownloadIntegrityExpectation,
): Promise<Response | null> => {
  try {
    assertAllowedEndpoint(url, 'ai_model_cdn');
    const response = await fetch(url, { redirect: 'error' });
    if (!verifyModelDownloadResponse(response, expectation)) {
      return null;
    }
    return response;
  } catch (error) {
    void logAppError(error, 'localAiModelIntegrity.fetch');
    return null;
  }
};

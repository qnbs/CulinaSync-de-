import { SYNC_ERROR_CODES } from './syncErrorCodes';
import { assertAllowedEndpoint } from '../config/networkEndpointPolicy';

export type SyncAuth =
  | { type: 'bearer'; token: string }
  | { type: 'basic'; username: string; password: string };

const buildAuthHeader = (auth?: SyncAuth): Record<string, string> => {
  if (!auth) {
    return {};
  }
  if (auth.type === 'bearer') {
    return { Authorization: `Bearer ${auth.token}` };
  }
  const encoded = btoa(`${auth.username}:${auth.password}`);
  return { Authorization: `Basic ${encoded}` };
};

// QNBS-v3: Einheitlicher WebDAV-Transport für Generic-URL und Nextcloud (Basic/App-Passwort)
export async function uploadEncryptedBlob(url: string, data: Uint8Array, auth?: SyncAuth): Promise<void> {
  // QNBS-v3: Runtime gate vor fetch — BYO Sync-URLs (HTTP/S), CSP connect-src https: bleibt Fallback
  assertAllowedEndpoint(url, 'user_sync');
  const uploadBuffer = new Uint8Array(data);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      ...buildAuthHeader(auth),
    },
    body: new Blob([uploadBuffer.buffer], { type: 'application/octet-stream' }),
  });
  if (!res.ok) {
    throw new Error(`${SYNC_ERROR_CODES.uploadFailed}:${res.status}`);
  }
}

export async function downloadEncryptedBlob(url: string, auth?: SyncAuth): Promise<Uint8Array> {
  assertAllowedEndpoint(url, 'user_sync');
  const res = await fetch(url, {
    method: 'GET',
    headers: buildAuthHeader(auth),
  });
  if (!res.ok) {
    throw new Error(`${SYNC_ERROR_CODES.downloadFailed}:${res.status}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

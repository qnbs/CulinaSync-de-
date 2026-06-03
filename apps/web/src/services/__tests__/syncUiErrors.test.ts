import { describe, expect, it } from 'vitest';
import { formatSyncErrorMessage } from '../syncUiErrors';

const t = ((key: string, opts?: { status?: string; defaultValue?: string }) => {
  if (key === 'settings.data.sync.errors.upload_failed') {
    return `Upload HTTP ${opts?.status ?? ''}`;
  }
  if (key === 'settings.data.sync.errors.unknown') {
    return 'Unbekannter Sync-Fehler';
  }
  return opts?.defaultValue ?? '';
}) as Parameters<typeof formatSyncErrorMessage>[1];

describe('syncUiErrors', () => {
  it('mappt bekannte Sync-Codes auf i18n', () => {
    const message = formatSyncErrorMessage(new Error('upload-failed:401'), t);
    expect(message).toContain('401');
  });

  it('gibt unbekannte Fehler unveraendert zurueck', () => {
    expect(formatSyncErrorMessage(new Error('custom'), t)).toBe('custom');
  });
});

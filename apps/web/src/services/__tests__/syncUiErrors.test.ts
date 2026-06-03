import type { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import { formatSyncErrorMessage } from '../syncUiErrors';
import { SYNC_ERROR_CODES } from '../syncErrorCodes';

describe('syncUiErrors', () => {
  it('maps known sync error codes to i18n', () => {
    const t = vi.fn(() => 'Server fehlt') as unknown as TFunction;
    expect(formatSyncErrorMessage(new Error(SYNC_ERROR_CODES.nextcloudMissingServer), t)).toBe(
      'Server fehlt',
    );
  });

  it('uses unknown fallback when translation key is empty', () => {
    const t = vi.fn((key: string, opts?: { defaultValue?: string }) => {
      if (key.endsWith('unknown')) return 'unknown-sync';
      if (opts && 'defaultValue' in opts) return '';
      return `translated:${key}`;
    }) as unknown as TFunction;

    expect(formatSyncErrorMessage(new Error(`${SYNC_ERROR_CODES.uploadFailed}:503`), t)).toBe(
      'unknown-sync',
    );
  });

  it('falls back to message for unknown errors', () => {
    const t = vi.fn() as unknown as TFunction;
    expect(formatSyncErrorMessage(new Error('custom failure'), t)).toBe('custom failure');
  });

  it('stringifies non-Error values', () => {
    const t = vi.fn() as unknown as TFunction;
    expect(formatSyncErrorMessage('oops', t)).toBe('oops');
  });
});

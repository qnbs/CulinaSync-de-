import { describe, expect, it } from 'vitest';
import { markModelDownloaded } from '../localAiModelDownloadService';

describe('localAiModelDownloadService', () => {
  it('markModelDownloaded dedupliziert', () => {
    expect(markModelDownloaded(['a'], 'a')).toEqual(['a']);
    expect(markModelDownloaded(['a'], 'b')).toEqual(['a', 'b']);
  });
});

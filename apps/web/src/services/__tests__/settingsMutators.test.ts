import { describe, expect, it } from 'vitest';
import { applySettingsChange } from '../settingsMutators';
import { getDefaultSettings } from '../settingsMerge';

describe('settingsMutators', () => {
  it('setzt lokale KI- und Privacy-Pfade typisiert', () => {
    const draft = structuredClone(getDefaultSettings());
    expect(applySettingsChange(draft, 'localAi.enableVision', true)).toBe(true);
    expect(draft.localAi.enableVision).toBe(true);

    expect(applySettingsChange(draft, 'localAi.enableInferenceCache', true)).toBe(true);
    expect(draft.localAi.enableInferenceCache).toBe(true);

    expect(applySettingsChange(draft, 'localAi.cacheTtlHours', 12)).toBe(true);
    expect(draft.localAi.cacheTtlHours).toBe(12);

    expect(applySettingsChange(draft, 'localAi.downloadedModels', ['model-a'])).toBe(true);
    expect(draft.localAi.downloadedModels).toEqual(['model-a']);

    expect(applySettingsChange(draft, 'localAi.ollamaEnabled', true)).toBe(true);
    expect(draft.localAi.ollamaEnabled).toBe(true);

    expect(applySettingsChange(draft, 'localAi.ollamaBaseUrl', 'http://127.0.0.1:11434')).toBe(true);
    expect(draft.localAi.ollamaBaseUrl).toBe('http://127.0.0.1:11434');

    expect(applySettingsChange(draft, 'privacy.autoClearInferenceCache', true)).toBe(true);
    expect(draft.privacy.autoClearInferenceCache).toBe(true);
  });

  it('ignoriert ungültige Werte und unbekannte Pfade', () => {
    const draft = structuredClone(getDefaultSettings());
    const ttl = draft.localAi.cacheTtlHours;
    expect(applySettingsChange(draft, 'localAi.cacheTtlHours', 'nope')).toBe(true);
    expect(draft.localAi.cacheTtlHours).toBe(ttl);

    expect(applySettingsChange(draft, 'localAi.downloadedModels', [1, 2] as unknown as string[])).toBe(
      true,
    );
    expect(draft.localAi.downloadedModels).toEqual([]);

    expect(applySettingsChange(draft, 'unknown.path', true)).toBe(false);
  });

  it('mutiert Routing- und Speech-Pfade', () => {
    const draft = structuredClone(getDefaultSettings());
    expect(applySettingsChange(draft, 'aiPreferences.routingMode', 'local-only')).toBe(true);
    expect(draft.aiPreferences.routingMode).toBe('local-only');
    expect(applySettingsChange(draft, 'speechRecognition.mode', 'whisper')).toBe(true);
    expect(draft.speechRecognition.mode).toBe('whisper');
    expect(applySettingsChange(draft, 'speechRecognition.whisperModelSize', 'base')).toBe(true);
    expect(draft.speechRecognition.whisperModelSize).toBe('base');
  });
});

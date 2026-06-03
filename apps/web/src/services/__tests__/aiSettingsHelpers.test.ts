import { describe, expect, it } from 'vitest';
import { getDefaultSettings } from '../settingsMerge';
import { shouldAllowCloudAi, shouldPreferLocalAi } from '../aiSettingsHelpers';

describe('aiSettingsHelpers', () => {
  const base = getDefaultSettings();

  it('shouldPreferLocalAi when localOnlyMode', () => {
    expect(
      shouldPreferLocalAi({
        ...base,
        localAi: { ...base.localAi, enabled: true, localOnlyMode: true },
      }),
    ).toBe(true);
  });

  it('shouldPreferLocalAi when routing is not cloud-first', () => {
    expect(
      shouldPreferLocalAi({
        ...base,
        localAi: { ...base.localAi, enabled: true, localOnlyMode: false },
        aiPreferences: { ...base.aiPreferences, routingMode: 'local-first' },
      }),
    ).toBe(true);
  });

  it('shouldPreferLocalAi is false when local AI disabled', () => {
    expect(
      shouldPreferLocalAi({
        ...base,
        localAi: { ...base.localAi, enabled: false },
      }),
    ).toBe(false);
  });

  it('shouldAllowCloudAi is false in localOnlyMode', () => {
    expect(
      shouldAllowCloudAi({
        ...base,
        localAi: { ...base.localAi, localOnlyMode: true },
      }),
    ).toBe(false);
  });

  it('shouldAllowCloudAi is false without fallback on local-first', () => {
    expect(
      shouldAllowCloudAi({
        ...base,
        localAi: { ...base.localAi, localOnlyMode: false, allowCloudFallback: false },
        aiPreferences: { ...base.aiPreferences, routingMode: 'local-first' },
      }),
    ).toBe(false);
  });

  it('shouldAllowCloudAi with cloud-first routing', () => {
    expect(
      shouldAllowCloudAi({
        ...base,
        localAi: { ...base.localAi, localOnlyMode: false, allowCloudFallback: false },
        aiPreferences: { ...base.aiPreferences, routingMode: 'cloud-first' },
      }),
    ).toBe(true);
  });

  it('shouldAllowCloudAi with allowCloudFallback', () => {
    expect(
      shouldAllowCloudAi({
        ...base,
        localAi: { ...base.localAi, localOnlyMode: false, allowCloudFallback: true },
        aiPreferences: { ...base.aiPreferences, routingMode: 'local-first' },
      }),
    ).toBe(true);
  });
});

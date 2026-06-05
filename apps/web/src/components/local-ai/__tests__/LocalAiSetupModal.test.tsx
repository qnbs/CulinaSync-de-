import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { LocalAiSetupModal } from '../LocalAiSetupModal';
import type { AppSettings } from '@/types';
import { getDefaultSettings } from '@/services/settingsMerge';

const mockDetectGpuTier = vi.fn();

vi.mock('@domain/ai-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@domain/ai-core')>();
  return {
    ...actual,
    detectGpuTier: (...args: unknown[]) => mockDetectGpuTier(...args),
  };
});

describe('LocalAiSetupModal', () => {
  const settings: AppSettings = getDefaultSettings();
  const onComplete = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('de');
    vi.clearAllMocks();
    mockDetectGpuTier.mockResolvedValue({ tier: 'high', webGpuAvailable: true });
  });

  it('zeigt WebGPU-Option wenn Hardware erkannt', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocalAiSetupModal open settings={settings} onComplete={onComplete} onClose={onClose} />
      </I18nextProvider>,
    );

    expect(await screen.findByText(/Lokale KI einrichten/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Embeddings \+ WebLLM/i })).toBeInTheDocument();
  });

  it('blendet WebLLM-Button ohne WebGPU aus', async () => {
    mockDetectGpuTier.mockResolvedValueOnce({ tier: 'efficient', webGpuAvailable: false });

    render(
      <I18nextProvider i18n={i18n}>
        <LocalAiSetupModal open settings={settings} onComplete={onComplete} onClose={onClose} />
      </I18nextProvider>,
    );

    await screen.findByText(/Kein WebGPU/i);
    expect(screen.queryByRole('button', { name: /Embeddings \+ WebLLM/i })).not.toBeInTheDocument();
  });

  it('ruft onComplete bei Embeddings-Aktivierung auf', async () => {
    const user = userEvent.setup();

    render(
      <I18nextProvider i18n={i18n}>
        <LocalAiSetupModal open settings={settings} onComplete={onComplete} onClose={onClose} />
      </I18nextProvider>,
    );

    await user.click(await screen.findByRole('button', { name: /Embeddings aktivieren/i }));
    expect(onComplete).toHaveBeenCalledWith({ enableEmbeddings: true });
    expect(onClose).toHaveBeenCalled();
  });

  it('aktiviert WebLLM bei vollem Setup', async () => {
    const user = userEvent.setup();

    render(
      <I18nextProvider i18n={i18n}>
        <LocalAiSetupModal open settings={settings} onComplete={onComplete} onClose={onClose} />
      </I18nextProvider>,
    );

    await user.click(await screen.findByRole('button', { name: /Embeddings \+ WebLLM/i }));
    expect(onComplete).toHaveBeenCalledWith({
      enableEmbeddings: true,
      enableWebLlmInference: true,
    });
  });
});

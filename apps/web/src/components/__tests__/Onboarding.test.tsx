import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import Onboarding from '../Onboarding';
import i18n from '../../i18n';

const loadDemoPantrySeed = vi.fn();

vi.mock('../../services/demoSeedService', () => ({
  loadDemoPantrySeed: () => loadDemoPantrySeed(),
}));

vi.mock('react-joyride', () => ({
  STATUS: { FINISHED: 'finished', SKIPPED: 'skipped' },
  Joyride: () => null,
}));

describe('Onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadDemoPantrySeed.mockResolvedValue(undefined);
  });

  it('schließt über Überspringen', () => {
    const onComplete = vi.fn();
    render(
      <I18nextProvider i18n={i18n}>
        <Onboarding onComplete={onComplete} />
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /überspringen|skip/i }));
    expect(onComplete).toHaveBeenCalled();
  });

  it('schließt über X-Button', () => {
    const onComplete = vi.fn();
    render(
      <I18nextProvider i18n={i18n}>
        <Onboarding onComplete={onComplete} />
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /einführung schließen|dismiss introduction/i }));
    expect(onComplete).toHaveBeenCalled();
  });

  it('lädt Demo und bietet Weiter an', async () => {
    const onComplete = vi.fn();
    render(
      <I18nextProvider i18n={i18n}>
        <Onboarding onComplete={onComplete} />
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /demo laden|load demo/i }));
    await waitFor(() => expect(loadDemoPantrySeed).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /weiter mit demo|continue with demo/i }));
    expect(onComplete).toHaveBeenCalled();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

vi.mock('@/services/errorLoggingService', () => ({
  logAppError: vi.fn(),
}));

const Boom = () => {
  throw new Error('Testfehler');
};

describe('GlobalErrorBoundary', () => {
  it('zeigt Fehler-UI und ruft logAppError', async () => {
    const { logAppError } = await import('@/services/errorLoggingService');

    render(
      <I18nextProvider i18n={i18n}>
        <GlobalErrorBoundary>
          <Boom />
        </GlobalErrorBoundary>
      </I18nextProvider>,
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(logAppError).toHaveBeenCalled();
  });
});

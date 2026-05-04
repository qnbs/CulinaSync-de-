import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
      <GlobalErrorBoundary>
        <Boom />
      </GlobalErrorBoundary>,
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(logAppError).toHaveBeenCalled();
  });
});

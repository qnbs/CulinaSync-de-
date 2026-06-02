import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfflineStatusBar from '../OfflineStatusBar';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

const renderBar = (isOnline: boolean) =>
  render(
    <I18nextProvider i18n={i18n}>
      <OfflineStatusBar isOnline={isOnline} />
    </I18nextProvider>,
  );

describe('OfflineStatusBar', () => {
  it('rendert nichts im Online-Zustand', () => {
    const { container } = renderBar(true);
    expect(container).toBeEmptyDOMElement();
  });

  it('zeigt Offline-Banner mit zugeordneten A11y-IDs', () => {
    renderBar(false);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-labelledby', 'offline-status-banner');
    expect(status).toHaveAttribute('aria-describedby', 'offline-status-ai-hint');
    expect(document.getElementById('offline-status-banner')).toBeInTheDocument();
    expect(document.getElementById('offline-status-ai-hint')).toBeInTheDocument();
  });
});

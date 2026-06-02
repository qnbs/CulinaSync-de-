import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { RecipePlanExportBar } from '../RecipePlanExportBar';
import i18n from '@/i18n';

describe('RecipePlanExportBar', () => {
  it('oeffnet Export-Menue und plant Mahlzeit', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    const onOpenMealPlan = vi.fn();
    const onToggleExportMenu = vi.fn();
    const onCloseExportMenu = vi.fn();

    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <RecipePlanExportBar
          isSaved
          isExportOpen={false}
          onOpenMealPlan={onOpenMealPlan}
          onToggleExportMenu={onToggleExportMenu}
          onCloseExportMenu={onCloseExportMenu}
          onExport={onExport}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Planen/i }));
    expect(onOpenMealPlan).toHaveBeenCalled();

    rerender(
      <I18nextProvider i18n={i18n}>
        <RecipePlanExportBar
          isSaved
          isExportOpen
          onOpenMealPlan={onOpenMealPlan}
          onToggleExportMenu={onToggleExportMenu}
          onCloseExportMenu={onCloseExportMenu}
          onExport={onExport}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole('menuitem', { name: 'JSON' }));
    expect(onCloseExportMenu).toHaveBeenCalled();
    expect(onExport).toHaveBeenCalledWith('json');
  });
});

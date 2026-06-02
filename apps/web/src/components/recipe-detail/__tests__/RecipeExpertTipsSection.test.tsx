import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { RecipeExpertTipsSection } from '../RecipeExpertTipsSection';
import i18n from '@/i18n';

describe('RecipeExpertTipsSection', () => {
  it('rendert Expertentipps', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <RecipeExpertTipsSection
          expertTips={[{ title: 'Tipp A', content: 'Inhalt A' }]}
          t={i18n.t}
        />
      </I18nextProvider>,
    );

    expect(screen.getByText('Tipp A')).toBeInTheDocument();
    expect(screen.getByText('Inhalt A')).toBeInTheDocument();
  });
});

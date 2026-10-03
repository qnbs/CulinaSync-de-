import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';

describe('PageHeader', () => {
  it('rendert Titel und optionale Beschreibung sowie Actions', () => {
    render(
      <PageHeader
        title="Vorratskammer"
        description="Überblick"
        className="extra"
        actions={<button type="button">Neu</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Vorratskammer' })).toBeInTheDocument();
    expect(screen.getByText('Überblick')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Neu' })).toBeInTheDocument();
  });

  it('ohne Beschreibung und Actions nur Titel', () => {
    render(<PageHeader title="Einkauf" />);
    expect(screen.getByRole('heading', { name: 'Einkauf' })).toBeInTheDocument();
    expect(screen.queryByText('Überblick')).not.toBeInTheDocument();
  });
});

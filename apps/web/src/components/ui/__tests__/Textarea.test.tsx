import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from '../Textarea';

describe('Textarea', () => {
  it('rendert Label, Hint und Textarea', () => {
    render(<Textarea label="Notiz" hint="Optional" defaultValue="Hi" />);
    const area = screen.getByRole('textbox', { name: 'Notiz' });
    expect(area).toHaveAttribute('id', 'textarea-notiz');
    expect(screen.getByText('Optional')).toHaveAttribute('id', 'textarea-notiz-hint');
  });

  it('ohne Label und Hint', () => {
    render(<Textarea aria-label="Freitext" />);
    expect(screen.getByRole('textbox', { name: 'Freitext' })).toBeInTheDocument();
  });
});

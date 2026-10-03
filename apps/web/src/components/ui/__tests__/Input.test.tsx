import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('zeigt Hint wenn kein Fehler', () => {
    render(<Input label="Name" hint="Pflichtfeld" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('aria-describedby', 'input-name-hint');
    expect(screen.getByText('Pflichtfeld')).toBeInTheDocument();
  });

  it('zeigt Fehler statt Hint', () => {
    render(<Input label="Menge" error="Ungültig" />);
    const input = screen.getByRole('textbox', { name: 'Menge' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'input-menge-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Ungültig');
  });
});

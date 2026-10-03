import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from '../Select';

describe('Select', () => {
  it('verknüpft Label mit generierter id', () => {
    render(
      <Select label="Kategorie" defaultValue="a">
        <option value="a">A</option>
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: 'Kategorie' });
    expect(select).toHaveAttribute('id', 'select-kategorie');
  });

  it('nutzt explizite id ohne Label', () => {
    render(
      <Select id="unit-select" aria-label="Einheit">
        <option value="g">g</option>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Einheit' })).toHaveAttribute('id', 'unit-select');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Switch } from '../Switch';

describe('Switch', () => {
  it('toggelt per Klick und Space/Enter', () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Demo" description="Hilfe" checked={false} onCheckedChange={onCheckedChange} />);
    const el = screen.getByRole('switch', { name: 'Demo' });
    fireEvent.click(el);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    fireEvent.keyDown(el, { key: ' ' });
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    fireEvent.keyDown(el, { key: 'Enter' });
    expect(onCheckedChange).toHaveBeenCalledTimes(3);
  });

  it('ignoriert Interaktion wenn disabled', () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Off" checked className="x" onCheckedChange={onCheckedChange} disabled />);
    const el = screen.getByRole('switch', { name: 'Off' });
    fireEvent.click(el);
    fireEvent.keyDown(el, { key: 'Enter' });
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(el).toHaveAttribute('tabindex', '-1');
  });
});

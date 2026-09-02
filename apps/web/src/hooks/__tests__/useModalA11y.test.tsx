import { useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useModalA11y } from '../useModalA11y';

function ModalHarness({
  closeOnEscape = true,
}: {
  closeOnEscape?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  useModalA11y({
    isOpen: open,
    onClose: () => setOpen(false),
    containerRef,
    initialFocusRef: firstRef,
    closeOnEscape,
  });

  if (!open) return <div data-testid="closed" />;

  return (
    <div ref={containerRef} role="dialog" aria-modal="true" tabIndex={-1}>
      <button ref={firstRef} type="button">
        first
      </button>
      <button type="button">second</button>
    </div>
  );
}

describe('useModalA11y', () => {
  it('schliesst bei Escape wenn closeOnEscape true', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.getByTestId('closed')).toBeInTheDocument();
  });

  it('schliesst nicht bei Escape wenn closeOnEscape false', async () => {
    const user = userEvent.setup();
    render(<ModalHarness closeOnEscape={false} />);

    await user.keyboard('{Escape}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('fängt Tab am Ende des Modals ab', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    await user.click(screen.getByRole('button', { name: 'second' }));
    await user.keyboard('{Tab}');

    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('fängt Shift+Tab am Anfang des Modals ab', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    const first = screen.getByRole('button', { name: 'first' });
    first.focus();
    await user.tab({ shift: true });

    expect(screen.getByRole('button', { name: 'second' })).toHaveFocus();
  });

  it('fängt Tab ab wenn keine fokussierbaren Elemente', async () => {
    function EmptyModalHarness() {
      const [open, setOpen] = useState(true);
      const containerRef = useRef<HTMLDivElement>(null);
      useModalA11y({
        isOpen: open,
        onClose: () => setOpen(false),
        containerRef,
        closeOnEscape: false,
      });
      if (!open) return <div data-testid="closed" />;
      return (
        <div ref={containerRef} role="dialog" tabIndex={-1}>
          <p>leer</p>
        </div>
      );
    }

    const user = userEvent.setup();
    render(<EmptyModalHarness />);
    const dialog = screen.getByRole('dialog');
    dialog.focus();
    await user.keyboard('{Tab}');
    expect(dialog).toHaveFocus();
  });
});

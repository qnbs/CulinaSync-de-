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
});

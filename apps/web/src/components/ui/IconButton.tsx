import React from 'react';
import { cn } from '../../lib/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tone?: 'default' | 'danger' | 'accent';
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, active, tone = 'default', label, type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'glass-button inline-flex items-center justify-center p-2 rounded-xl transition-all duration-[var(--motion-base)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-500)]',
        tone === 'default' && 'text-zinc-400 hover:text-zinc-100',
        tone === 'accent' && 'text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/10',
        tone === 'danger' &&
          (active
            ? 'bg-red-500/20 !border-red-500/50 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            : 'text-zinc-400 hover:text-red-300'),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = 'IconButton';

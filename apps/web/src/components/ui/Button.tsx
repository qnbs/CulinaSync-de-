import React from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'accent-soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent-500)] text-zinc-900 font-bold shadow-[0_4px_20px_var(--color-accent-glow-soft)] hover:bg-[var(--color-accent-400)] active:scale-[0.98]',
  secondary: 'border border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600',
  ghost: 'glass-button text-zinc-300 hover:text-zinc-100',
  destructive: 'bg-red-600/90 text-white font-semibold hover:bg-red-500 active:scale-[0.98]',
  'accent-soft':
    'bg-[var(--color-accent-500)]/15 text-[var(--color-accent-400)] border border-[var(--color-accent-500)]/25 hover:bg-[var(--color-accent-500)]/25',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-base rounded-xl gap-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-[var(--motion-base)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';

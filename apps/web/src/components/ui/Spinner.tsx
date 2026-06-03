import React from 'react';
import { cn } from '../../lib/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap = { sm: 'h-8 w-8 border-2', md: 'h-12 w-12 border-[3px]', lg: 'h-16 w-16 border-4' };

export const Spinner: React.FC<SpinnerProps> = ({ size = 'lg', label, className }) => (
  <div
    className={cn('flex flex-col items-center justify-center gap-3', className)}
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    <div
      className={cn(
        'rounded-full border-[var(--color-accent-500)] border-t-transparent animate-spin',
        sizeMap[size],
      )}
      aria-hidden
    />
    {label && <span className="sr-only">{label}</span>}
  </div>
);

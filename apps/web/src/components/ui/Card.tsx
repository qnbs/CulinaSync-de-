import React from 'react';
import { cn } from '../../lib/cn';

export type CardVariant = 'card' | 'panel' | 'flat';

const variantClass: Record<CardVariant, string> = {
  card: 'glass-card rounded-2xl',
  panel: 'glass-panel rounded-2xl',
  flat: 'rounded-2xl border border-white/5 bg-zinc-900/40',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClass = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'card',
  interactive = false,
  padding = 'md',
  children,
  ...props
}) => (
  <div
    className={cn(
      variantClass[variant],
      paddingClass[padding],
      interactive &&
        'transition-all duration-[var(--motion-base)] hover:border-white/15 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)] active:scale-[0.995]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

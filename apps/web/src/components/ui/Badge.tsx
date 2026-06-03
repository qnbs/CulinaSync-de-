import React from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';

const toneClass: Record<BadgeTone, string> = {
  accent: 'bg-[var(--color-accent-500)]/15 text-[var(--color-accent-300)] border-[var(--color-accent-500)]/25',
  neutral: 'bg-zinc-800/80 text-zinc-300 border-zinc-600/40',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-200 border-amber-500/25',
  danger: 'bg-red-500/15 text-red-300 border-red-500/25',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ className, tone = 'neutral', children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border',
      toneClass[tone],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

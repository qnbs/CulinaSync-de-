import React from 'react';
import { cn } from '../../lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rect';
}

const variantClass: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'h-4 w-full rounded-md',
  circular: 'rounded-full aspect-square',
  rect: 'rounded-xl min-h-[4rem] w-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect', ...props }) => (
  <div
    role="presentation"
    aria-hidden
    className={cn(
      'animate-pulse-soft bg-zinc-800/80',
      variantClass[variant],
      className,
    )}
    {...props}
  />
);

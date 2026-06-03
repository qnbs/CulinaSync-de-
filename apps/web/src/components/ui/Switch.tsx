import React from 'react';
import { cn } from '../../lib/cn';

export interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}) => (
  <div
    role="switch"
    aria-checked={checked}
    aria-label={label}
    tabIndex={disabled ? -1 : 0}
    onKeyDown={(event) => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onCheckedChange(!checked);
      }
    }}
    onClick={() => {
      if (!disabled) onCheckedChange(!checked);
    }}
    className={cn(
      'flex items-center justify-between gap-4 p-4 glass-card rounded-2xl transition-colors duration-[var(--motion-base)]',
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-900/50 cursor-pointer hover:border-white/15',
      className,
    )}
  >
    <div className="min-w-0">
      <p className="font-bold text-zinc-200">{label}</p>
      {description && <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>}
    </div>
    <div
      className={cn(
        'relative w-14 h-8 rounded-full p-0.5 flex-shrink-0 transition-colors duration-[var(--motion-base)]',
        checked ? 'bg-[var(--color-accent-500)]' : 'bg-zinc-700',
      )}
    >
      <div
        className={cn(
          'w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-[var(--motion-base)]',
          checked ? 'translate-x-6' : 'translate-x-0',
        )}
      />
    </div>
  </div>
);

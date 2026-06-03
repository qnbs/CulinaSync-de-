import React from 'react';

interface SettingsToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onToggle,
  disabled = false,
}) => (
  <div
    role="switch"
    aria-checked={checked}
    tabIndex={disabled ? -1 : 0}
    onKeyDown={(event) => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onToggle();
      }
    }}
    onClick={() => {
      if (!disabled) onToggle();
    }}
    className={`flex items-center justify-between p-4 glass-card rounded-xl transition-colors ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-900/50 cursor-pointer'
    }`}
  >
    <div>
      <h4 className="font-bold text-zinc-200">{label}</h4>
      <p className="text-xs text-zinc-500 mt-1">{description}</p>
    </div>
    <div
      className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 flex-shrink-0 ${
        checked ? 'bg-[var(--color-accent-500)]' : 'bg-zinc-700'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
          checked ? 'translate-x-6' : ''
        }`}
      />
    </div>
  </div>
);

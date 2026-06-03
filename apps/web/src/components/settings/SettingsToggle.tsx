import React from 'react';
import { Switch } from '../ui/Switch';

export interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

/** Settings row toggle — wraps `Switch` with legacy `onToggle` API. */
export const SettingsToggle: React.FC<SettingsToggleProps> = ({ onToggle, ...props }) => (
  <Switch {...props} onCheckedChange={() => onToggle()} />
);
